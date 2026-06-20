const express = require("express");
const db = require("../services/db");
const router = express.Router();

/**
 * @route POST /api/loans/request
 * @desc Request a new micro-loan for a specific group
 */
router.post("/request", async (req, res) => {
  const { email, amount, duration, purpose, groupId } = req.body;

  if (!email || !amount || !duration || !groupId) {
    return res.status(400).json({ error: "Missing required parameters (email, amount, duration, groupId)" });
  }

  const loanAmount = parseFloat(amount);
  const loanDuration = parseInt(duration);

  if (isNaN(loanAmount) || loanAmount <= 0) {
    return res.status(400).json({ error: "Invalid loan amount" });
  }
  if (isNaN(loanDuration) || loanDuration <= 0) {
    return res.status(400).json({ error: "Invalid loan duration" });
  }

  try {
    // 1. Fetch borrower profile details
    const userQuery = "SELECT name, credit_score, wallet_address FROM users WHERE email = $1";
    const userRes = await db.query(userQuery, [email]);
    if (userRes.rowCount === 0) {
      return res.status(404).json({ error: "User profile not found" });
    }

    const userData = userRes.rows[0];

    // Check group membership
    const memberCheck = await db.query(
      "SELECT 1 FROM group_members WHERE group_id = $1 AND user_email = $2",
      [groupId, email]
    );
    if (memberCheck.rowCount === 0) {
      return res.status(403).json({ error: "You must be a member of this group to request a loan." });
    }

    // Determine interest rate based on credit score
    const score = userData.credit_score || 500;
    let interestRate = 12.0;
    if (score >= 900) interestRate = 5.0;
    else if (score >= 750) interestRate = 7.5;
    else if (score >= 600) interestRate = 10.0;

    const currentTimestamp = Date.now();

    // 2. Insert loan request
    const insertQuery = `
      INSERT INTO loans (
        group_id, user_email, borrower, address, amount, interest_rate, duration, purpose, timestamp, approved, status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, false, 'Pending')
      RETURNING *
    `;
    const loanRes = await db.query(insertQuery, [
      groupId,
      email,
      userData.name,
      userData.wallet_address,
      loanAmount,
      interestRate,
      loanDuration,
      purpose || "General Business Development",
      currentTimestamp
    ]);

    const loan = loanRes.rows[0];

    res.status(201).json({
      success: true,
      message: "Loan request submitted for consensus voting",
      loan: {
        ...loan,
        amount: parseFloat(loan.amount),
        interest_rate: parseFloat(loan.interest_rate)
      }
    });
  } catch (error) {
    console.error("Loan request failed:", error);
    res.status(500).json({ error: "Failed to submit loan request", details: error.message });
  }
});

/**
 * @route GET /api/loans
 * @desc Fetch all loans in the system, optionally filtered by groupId or user email
 */
router.get("/", async (req, res) => {
  const { groupId, email } = req.query;

  try {
    let query = "SELECT * FROM loans";
    const params = [];

    if (groupId && email) {
      query += " WHERE group_id = $1 AND user_email = $2";
      params.push(groupId, email);
    } else if (groupId) {
      query += " WHERE group_id = $1";
      params.push(groupId);
    } else if (email) {
      query += " WHERE user_email = $1";
      params.push(email);
    }

    query += " ORDER BY timestamp DESC";
    const result = await db.query(query, params);

    const loans = result.rows.map(row => ({
      ...row,
      amount: parseFloat(row.amount),
      interest_rate: parseFloat(row.interest_rate)
    }));

    res.status(200).json(loans);
  } catch (error) {
    console.error("Failed to query loans list:", error);
    res.status(500).json({ error: "Database query failed", details: error.message });
  }
});

/**
 * @route POST /api/loans/vote
 * @desc Vote YES or NO on an active loan request. Auto-disburses when YES votes >= 3
 */
router.post("/vote", async (req, res) => {
  const { loanId, voterEmail, support } = req.body;

  if (!loanId || !voterEmail) {
    return res.status(400).json({ error: "Missing loanId or voterEmail" });
  }

  const client = await db.pool.connect();
  try {
    await client.query("BEGIN");

    // 1. Fetch the loan request
    const selectLoanQuery = "SELECT * FROM loans WHERE id = $1 FOR UPDATE";
    const loanRes = await client.query(selectLoanQuery, [loanId]);
    if (loanRes.rowCount === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({ error: "Loan request not found" });
    }

    const loanData = loanRes.rows[0];
    if (loanData.approved || loanData.status !== "Pending") {
      await client.query("ROLLBACK");
      return res.status(400).json({ error: "Voting is closed or loan is already processed" });
    }

    // 2. Cast vote
    let votesFor = parseInt(loanData.votes_for || 0);
    let votesAgainst = parseInt(loanData.votes_against || 0);

    if (support) {
      votesFor += 1;
    } else {
      votesAgainst += 1;
    }

    let approved = false;
    let newStatus = "Pending";
    let repaymentDeadline = 0;

    // Check consensus threshold (3 affirmative votes)
    if (votesFor >= 3) {
      approved = true;
      newStatus = "Approved";
      const durationMonths = parseInt(loanData.duration);
      repaymentDeadline = Math.floor(Date.now() / 1000) + (durationMonths * 30 * 86400);

      // Disburse wallet balances (add loan amount to user's wallet)
      const loanAmount = parseFloat(loanData.amount);
      
      // Get borrower's primary wallet
      const walletRes = await client.query(
        "SELECT id, balance, active_loan FROM wallets WHERE user_email = $1 AND wallet_type = 'PayLoop Wallet' FOR UPDATE",
        [loanData.user_email]
      );

      let walletId;
      if (walletRes.rowCount > 0) {
        walletId = walletRes.rows[0].id;
        await client.query(
          "UPDATE wallets SET balance = balance + $1, active_loan = active_loan + $1 WHERE id = $2",
          [loanAmount, walletId]
        );
      } else {
        // Create wallet if somehow missing
        const insertWallet = await client.query(
          "INSERT INTO wallets (user_email, balance, active_loan, wallet_type) VALUES ($1, $2, $2, 'PayLoop Wallet') RETURNING id",
          [loanData.user_email, loanAmount]
        );
        walletId = insertWallet.rows[0].id;
      }

      // Log the disbursement transaction
      const txCode = `DB_${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
      const formattedDate = new Date().toLocaleDateString("en-GB", {
        day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit"
      });

      await client.query(`
        INSERT INTO transactions (wallet_id, group_id, user_email, type, amount, date, reference, payment_method, timestamp)
        VALUES ($1, $2, $3, 'Loan Disbursement', $4, $5, $6, 'Internal', $7)
      `, [
        walletId,
        loanData.group_id,
        loanData.user_email,
        loanAmount,
        formattedDate,
        txCode,
        Date.now()
      ]);
    }

    // 3. Update loan record
    const updateLoanQuery = `
      UPDATE loans 
      SET votes_for = $1, 
          votes_against = $2, 
          approved = $3, 
          repayment_deadline = $4,
          status = $5
      WHERE id = $6
    `;
    await client.query(updateLoanQuery, [votesFor, votesAgainst, approved, repaymentDeadline, approved ? "Disbursed" : "Pending", loanId]);

    await client.query("COMMIT");

    res.status(200).json({
      success: true,
      message: "Vote recorded successfully",
      votesFor,
      votesAgainst,
      approved,
      status: approved ? "Disbursed" : "Pending"
    });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Voting failed:", error);
    res.status(500).json({ error: "Failed to submit consensus vote", details: error.message });
  } finally {
    client.release();
  }
});

/**
 * @route POST /api/loans/repay
 * @desc Repay active loan amount
 */
router.post("/repay", async (req, res) => {
  const { email, loanId, amount } = req.body;

  if (!email || !loanId || !amount) {
    return res.status(400).json({ error: "Missing required parameters (email, loanId, amount)" });
  }

  const repayVal = parseFloat(amount);
  if (isNaN(repayVal) || repayVal <= 0) {
    return res.status(400).json({ error: "Invalid repayment amount" });
  }

  const client = await db.pool.connect();
  try {
    await client.query("BEGIN");

    // 1. Fetch loan details
    const selectLoanQuery = "SELECT * FROM loans WHERE id = $1 FOR UPDATE";
    const loanRes = await client.query(selectLoanQuery, [loanId]);
    if (loanRes.rowCount === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({ error: "Loan record not found" });
    }

    const loanData = loanRes.rows[0];
    if (loanData.repaid || loanData.status === "Repaid") {
      await client.query("ROLLBACK");
      return res.status(400).json({ error: "This loan is already fully repaid" });
    }

    // 2. Fetch user wallet and check balance
    const selectWalletQuery = "SELECT id, balance, active_loan FROM wallets WHERE user_email = $1 AND wallet_type = 'PayLoop Wallet' FOR UPDATE";
    const walletRes = await client.query(selectWalletQuery, [email]);
    if (walletRes.rowCount === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({ error: "PayLoop Wallet not found for this user" });
    }

    const wallet = walletRes.rows[0];
    const currentBalance = parseFloat(wallet.balance || 0);
    const currentActiveLoan = parseFloat(wallet.active_loan || 0);

    if (currentBalance < repayVal) {
      await client.query("ROLLBACK");
      return res.status(400).json({ error: "Insufficient wallet balance to perform repayment" });
    }

    // 3. Log the repayment transaction (outflow)
    const txCode = `RP_${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    const formattedDate = new Date().toLocaleDateString("en-GB", {
      day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit"
    });

    await client.query(`
      INSERT INTO transactions (wallet_id, group_id, user_email, type, amount, date, reference, payment_method, timestamp)
      VALUES ($1, $2, $3, 'Loan Repayment', $4, $5, $6, 'Internal', $7)
    `, [
      wallet.id,
      loanData.group_id,
      email,
      -repayVal,
      formattedDate,
      txCode,
      Date.now()
    ]);

    // 4. Update wallet balance and active loan status
    const newBalance = parseFloat((currentBalance - repayVal).toFixed(2));
    const newActiveLoan = parseFloat(Math.max(0, currentActiveLoan - repayVal).toFixed(2));

    await client.query(
      "UPDATE wallets SET balance = $1, active_loan = $2 WHERE id = $3", 
      [newBalance, newActiveLoan, wallet.id]
    );

    // 5. Update loan status to repaid
    await client.query(
      "UPDATE loans SET repaid = TRUE, active = FALSE, status = 'Repaid' WHERE id = $1", 
      [loanId]
    );

    // 6. Boost user credit score by +15 points
    await client.query(
      "UPDATE users SET credit_score = LEAST(1000, credit_score + 15), reputation_score = LEAST(1000, reputation_score + 15) WHERE email = $1", 
      [email]
    );

    await client.query("COMMIT");

    res.status(200).json({
      success: true,
      message: "Loan repayment recorded successfully! Credit score updated."
    });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Repayment failed:", error);
    res.status(500).json({ error: "Failed to record loan repayment", details: error.message });
  } finally {
    client.release();
  }
});

module.exports = router;
