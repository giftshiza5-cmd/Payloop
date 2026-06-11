const express = require("express");
const db = require("../services/db");
const router = express.Router();

/**
 * @route POST /api/loans/request
 * @desc Request a new micro-loan
 */
router.post("/request", async (req, res) => {
  const { email, amount, duration, purpose } = req.body;

  if (!email || !amount || !duration) {
    return res.status(400).json({ error: "Missing required parameters (email, amount, duration)" });
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
        user_email, borrower, address, amount, interest_rate, duration, purpose, timestamp
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `;
    const loanRes = await db.query(insertQuery, [
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
 * @desc Fetch all group loans
 */
router.get("/", async (req, res) => {
  try {
    const query = "SELECT * FROM loans ORDER BY timestamp DESC";
    const result = await db.query(query);

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
    if (loanData.approved || !loanData.active) {
      await client.query("ROLLBACK");
      return res.status(400).json({ error: "Voting is closed for this loan request" });
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
    let repaymentDeadline = 0;

    // Check consensus threshold (3 affirmative votes)
    if (votesFor >= 3) {
      approved = true;
      const durationMonths = parseInt(loanData.duration);
      repaymentDeadline = Math.floor(Date.now() / 1000) + (durationMonths * 30 * 86400);

      // Disburse wallet balances (add loan amount to user's wallet)
      const loanAmount = parseFloat(loanData.amount);
      const updateWalletQuery = `
        UPDATE wallets 
        SET balance = balance + $1, 
            active_loan = $1 
        WHERE user_email = $2
      `;
      const walletUpdateRes = await client.query(updateWalletQuery, [loanAmount, loanData.user_email]);

      if (walletUpdateRes.rowCount === 0) {
        // If user doesn't have a wallet, create one
        const insertWalletQuery = `
          INSERT INTO wallets (user_email, balance, active_loan)
          VALUES ($1, $2, $2)
        `;
        await client.query(insertWalletQuery, [loanData.user_email, loanAmount]);
      }

      // Log the disbursement transaction
      const txCode = `DB_${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
      const formattedDate = new Date().toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
      });
      const currentTimestamp = Date.now();

      const insertTxQuery = `
        INSERT INTO transactions (user_email, type, amount, date, reference, timestamp)
        VALUES ($1, 'Loan Disbursement', $2, $3, $4, $5)
      `;
      await client.query(insertTxQuery, [
        loanData.user_email,
        "Loan Disbursement",
        loanAmount, // Positive inflow
        formattedDate,
        txCode,
        currentTimestamp
      ]);
    }

    // 3. Update loan record
    const updateLoanQuery = `
      UPDATE loans 
      SET votes_for = $1, 
          votes_against = $2, 
          approved = $3, 
          repayment_deadline = $4 
      WHERE id = $5
    `;
    await client.query(updateLoanQuery, [votesFor, votesAgainst, approved, repaymentDeadline, loanId]);

    await client.query("COMMIT");

    res.status(200).json({
      success: true,
      message: "Vote recorded successfully",
      votesFor,
      votesAgainst,
      approved
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
    if (loanData.repaid) {
      await client.query("ROLLBACK");
      return res.status(400).json({ error: "This loan is already fully repaid" });
    }

    // 2. Fetch user wallet and check balance
    const selectWalletQuery = "SELECT balance, active_loan FROM wallets WHERE user_email = $1 FOR UPDATE";
    const walletRes = await client.query(selectWalletQuery, [email]);
    if (walletRes.rowCount === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({ error: "Wallet not found for this user" });
    }

    const currentBalance = parseFloat(walletRes.rows[0].balance || 0);
    const currentActiveLoan = parseFloat(walletRes.rows[0].active_loan || 0);

    if (currentBalance < repayVal) {
      await client.query("ROLLBACK");
      return res.status(400).json({ error: "Insufficient wallet balance to perform repayment" });
    }

    // 3. Log the repayment transaction (outflow)
    const txCode = `RP_${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    const formattedDate = new Date().toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
    const currentTimestamp = Date.now();

    const insertTxQuery = `
      INSERT INTO transactions (user_email, type, amount, date, reference, timestamp)
      VALUES ($1, 'Loan Repayment', $2, $3, $4, $5)
    `;
    await client.query(insertTxQuery, [
      email,
      "Loan Repayment",
      -repayVal, // Outflow to repay
      formattedDate,
      txCode,
      currentTimestamp
    ]);

    // 4. Update wallet balance and active loan status
    const newBalance = parseFloat((currentBalance - repayVal).toFixed(2));
    const newActiveLoan = parseFloat(Math.max(0, currentActiveLoan - repayVal).toFixed(2));

    const updateWalletQuery = `
      UPDATE wallets 
      SET balance = $1, 
          active_loan = $2 
      WHERE user_email = $3
    `;
    await client.query(updateWalletQuery, [newBalance, newActiveLoan, email]);

    // 5. Update loan status to repaid if fully paid (sandbox logic marks it fully repaid)
    const updateLoanQuery = `
      UPDATE loans 
      SET repaid = TRUE, 
          active = FALSE 
      WHERE id = $1
    `;
    await client.query(updateLoanQuery, [loanId]);

    // 6. Boost user credit score by +15 points
    const updateScoreQuery = `
      UPDATE users 
      SET credit_score = LEAST(1000, credit_score + 15) 
      WHERE email = $1
    `;
    await client.query(updateScoreQuery, [email]);

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
