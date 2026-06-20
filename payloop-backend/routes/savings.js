const express = require("express");
const db = require("../services/db");
const router = express.Router();

/**
 * @route POST /api/savings/contribute
 * @desc Record a deposit/contribution transaction for a user into a specific group
 */
router.post("/contribute", async (req, res) => {
  const { email, amount, paymentMethod, reference, groupId } = req.body;

  if (!email || !amount || !groupId) {
    return res.status(400).json({ error: "Missing required parameters (email, amount, groupId)" });
  }

  const depositAmount = parseFloat(amount);
  if (isNaN(depositAmount) || depositAmount <= 0) {
    return res.status(400).json({ error: "Invalid contribution amount" });
  }

  const client = await db.pool.connect();
  try {
    await client.query("BEGIN");

    // 1. Check group membership
    const groupCheck = await client.query(
      "SELECT 1 FROM group_members WHERE group_id = $1 AND user_email = $2",
      [groupId, email]
    );
    if (groupCheck.rowCount === 0) {
      await client.query("ROLLBACK");
      return res.status(403).json({ error: "You must be a member of this group to make contributions." });
    }

    // 2. Fetch user profile and primary wallet balance
    const selectQuery = `
      SELECT u.credit_score, u.reputation_score, w.id as wallet_id, w.balance, w.savings, w.loop_points
      FROM users u
      JOIN wallets w ON u.email = w.user_email AND w.wallet_type = 'PayLoop Wallet'
      WHERE u.email = $1
      FOR UPDATE
    `;
    const userRes = await client.query(selectQuery, [email]);
    if (userRes.rowCount === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({ error: "User profile or primary wallet not found" });
    }

    const userData = userRes.rows[0];
    const walletId = userData.wallet_id;
    const currentBalance = parseFloat(userData.balance || 0);
    const currentSavings = parseFloat(userData.savings || 0);
    const currentPoints = parseInt(userData.loop_points || 0);
    const currentScore = parseInt(userData.credit_score || userData.reputation_score || 500);

    // 3. Check sufficient balance in PayLoop Wallet
    if (currentBalance < depositAmount) {
      await client.query("ROLLBACK");
      return res.status(400).json({ error: "Insufficient wallet balance to perform contribution. Please deposit funds first." });
    }

    const txCode = reference || `TX_${Math.random().toString(36).substring(2, 10).toUpperCase()}`;
    const newPoints = currentPoints + 10; // Reward 10 LOOP points
    const newScore = Math.min(1000, currentScore + 5);

    const formattedDate = new Date().toLocaleDateString("en-GB", {
      day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit"
    });
    const currentTimestamp = Date.now();

    // 4. Insert contribution record
    await client.query(`
      INSERT INTO contributions (group_id, user_email, amount)
      VALUES ($1, $2, $3)
    `, [groupId, email, depositAmount]);

    // 5. Insert transaction log
    const insertTxQuery = `
      INSERT INTO transactions (wallet_id, group_id, user_email, type, amount, date, reference, payment_method, timestamp)
      VALUES ($1, $2, $3, 'Contribution', $4, $5, $6, $7, $8)
      RETURNING *
    `;
    // Logs as negative transaction outflow from personal wallet
    const txRes = await client.query(insertTxQuery, [
      walletId,
      groupId,
      email,
      -depositAmount,
      formattedDate,
      txCode,
      paymentMethod || "PayLoop Wallet",
      currentTimestamp
    ]);

    // 6. Update wallet
    const updateWalletQuery = `
      UPDATE wallets 
      SET balance = balance - $1, 
          savings = savings + $1, 
          loop_points = $2 
      WHERE id = $3
    `;
    await client.query(updateWalletQuery, [depositAmount, newPoints, walletId]);

    // 7. Update user credit score
    const updateUserQuery = `
      UPDATE users 
      SET credit_score = $1, reputation_score = $1
      WHERE email = $2
    `;
    await client.query(updateUserQuery, [newScore, email]);

    await client.query("COMMIT");

    res.status(201).json({
      success: true,
      message: "Contribution recorded successfully",
      transaction: {
        ...txRes.rows[0],
        amount: parseFloat(txRes.rows[0].amount)
      },
      newCreditScore: newScore
    });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Contribution failed:", error);
    res.status(500).json({ error: "Failed to submit savings", details: error.message });
  } finally {
    client.release();
  }
});

/**
 * @route GET /api/savings/transactions
 * @desc Fetch transactions list for a user, optionally filtered by groupId
 */
router.get("/transactions", async (req, res) => {
  const { email, groupId } = req.query;

  if (!email) {
    return res.status(400).json({ error: "Missing email query parameter" });
  }

  try {
    let query = "SELECT * FROM transactions WHERE user_email = $1";
    const params = [email];

    if (groupId) {
      query += " AND group_id = $2";
      params.push(groupId);
    }

    query += " ORDER BY timestamp DESC";
    const result = await db.query(query, params);
    
    const list = result.rows.map(row => ({
      ...row,
      amount: parseFloat(row.amount)
    }));

    res.status(200).json(list);
  } catch (error) {
    console.error("Failed to query transactions:", error);
    res.status(500).json({ error: "Database query failed", details: error.message });
  }
});

/**
 * @route POST /api/savings/create-goal
 * @desc Save a new savings goal target (personal)
 */
router.post("/create-goal", async (req, res) => {
  const { email, name, targetAmount, deadline, badge } = req.body;

  if (!email || !name || !targetAmount) {
    return res.status(400).json({ error: "Missing required fields (email, name, targetAmount)" });
  }

  const target = parseFloat(targetAmount);
  if (isNaN(target) || target <= 0) {
    return res.status(400).json({ error: "Invalid target amount" });
  }

  try {
    // Check if user exists
    const checkQuery = "SELECT 1 FROM users WHERE email = $1";
    const checkRes = await db.query(checkQuery, [email]);
    if (checkRes.rowCount === 0) {
      return res.status(404).json({ error: "User profile not found" });
    }

    const defaultDeadline = deadline || new Date(Date.now() + 30 * 86400 * 1000).toLocaleDateString();
    const currentTimestamp = Date.now();

    const insertQuery = `
      INSERT INTO savings_goals (user_email, name, target_amount, deadline, badge, saved_amount, completed, timestamp)
      VALUES ($1, $2, $3, $4, $5, 0.00, 0, $6)
      RETURNING *
    `;
    const result = await db.query(insertQuery, [
      email,
      name,
      target,
      defaultDeadline,
      badge || "💼",
      currentTimestamp
    ]);

    const goal = result.rows[0];

    res.status(201).json({
      success: true,
      message: "Savings goal created successfully",
      goal: {
        ...goal,
        target_amount: parseFloat(goal.target_amount),
        saved_amount: parseFloat(goal.saved_amount)
      }
    });
  } catch (error) {
    console.error("Failed to create goal:", error);
    res.status(500).json({ error: "Failed to write savings goal", details: error.message });
  }
});

/**
 * @route GET /api/savings/goals
 * @desc Retrieve list of savings goals for a user
 */
router.get("/goals", async (req, res) => {
  const { email } = req.query;

  if (!email) {
    return res.status(400).json({ error: "Missing email query parameter" });
  }

  try {
    const query = `
      SELECT * 
      FROM savings_goals 
      WHERE user_email = $1 
      ORDER BY timestamp DESC
    `;
    const result = await db.query(query, [email]);

    const list = result.rows.map(row => ({
      ...row,
      target_amount: parseFloat(row.target_amount),
      saved_amount: parseFloat(row.saved_amount)
    }));

    res.status(200).json(list);
  } catch (error) {
    console.error("Failed to query savings goals:", error);
    res.status(500).json({ error: "Database query failed", details: error.message });
  }
});

module.exports = router;
