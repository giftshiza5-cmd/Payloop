const express = require("express");
const db = require("../services/db");
const router = express.Router();

/**
 * @route GET /api/wallets
 * @desc Get list of all wallets for a user
 */
router.get("/", async (req, res) => {
  const { email } = req.query;

  if (!email) {
    return res.status(400).json({ error: "Missing email parameter" });
  }

  try {
    const result = await db.query(
      "SELECT * FROM wallets WHERE user_email = $1 ORDER BY wallet_type ASC",
      [email]
    );

    const list = result.rows.map(row => ({
      ...row,
      balance: parseFloat(row.balance),
      savings: parseFloat(row.savings),
      active_loan: parseFloat(row.active_loan)
    }));

    res.status(200).json(list);
  } catch (error) {
    console.error("Fetch wallets failed:", error);
    res.status(500).json({ error: "Database query failed", details: error.message });
  }
});

/**
 * @route POST /api/wallets/connect
 * @desc Connect a new external wallet (MetaMask, M-Pesa, Bank)
 */
router.post("/connect", async (req, res) => {
  const { email, walletType, walletAddress } = req.body;

  if (!email || !walletType || !walletAddress) {
    return res.status(400).json({ error: "Missing email, walletType, or walletAddress" });
  }

  try {
    // Check if user exists
    const checkUser = await db.query("SELECT 1 FROM users WHERE email = $1", [email]);
    if (checkUser.rowCount === 0) {
      return res.status(404).json({ error: "User profile not found" });
    }

    // Check if wallet already connected
    const checkWallet = await db.query(
      "SELECT 1 FROM wallets WHERE user_email = $1 AND wallet_type = $2 AND wallet_address = $3",
      [email, walletType, walletAddress]
    );
    if (checkWallet.rowCount > 0) {
      return res.status(400).json({ error: "This wallet is already connected to your profile." });
    }

    // Insert wallet
    const insertQuery = `
      INSERT INTO wallets (user_email, balance, savings, active_loan, loop_points, wallet_type, wallet_address, status)
      VALUES ($1, 0.00, 0.00, 0.00, 0, $2, $3, 'Connected')
      RETURNING *
    `;
    const result = await db.query(insertQuery, [email, walletType, walletAddress]);

    res.status(201).json({
      success: true,
      message: `${walletType} wallet connected successfully`,
      wallet: {
        ...result.rows[0],
        balance: parseFloat(result.rows[0].balance)
      }
    });
  } catch (error) {
    console.error("Connect wallet failed:", error);
    res.status(500).json({ error: "Database query failed", details: error.message });
  }
});

/**
 * @route POST /api/wallets/deposit
 * @desc Deposit simulated money to PayLoop wallet
 */
router.post("/deposit", async (req, res) => {
  const { email, amount, paymentMethod } = req.body;

  if (!email || !amount) {
    return res.status(400).json({ error: "Missing email or amount" });
  }

  const depAmount = parseFloat(amount);
  if (isNaN(depAmount) || depAmount <= 0) {
    return res.status(400).json({ error: "Invalid deposit amount" });
  }

  const client = await db.pool.connect();
  try {
    await client.query("BEGIN");

    // Fetch primary wallet
    const walletRes = await client.query(
      "SELECT * FROM wallets WHERE user_email = $1 AND wallet_type = 'PayLoop Wallet' FOR UPDATE",
      [email]
    );

    if (walletRes.rowCount === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({ error: "PayLoop Wallet not found" });
    }

    const wallet = walletRes.rows[0];

    // Update balance
    const updateRes = await client.query(
      "UPDATE wallets SET balance = balance + $1 WHERE id = $2 RETURNING *",
      [depAmount, wallet.id]
    );

    // Record transaction
    const ref = `DEP-${Math.random().toString(36).substring(2, 10).toUpperCase()}`;
    const date = new Date().toLocaleDateString("en-GB", {
      day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit"
    });
    
    await client.query(`
      INSERT INTO transactions (wallet_id, user_email, type, amount, date, reference, payment_method, timestamp)
      VALUES ($1, $2, 'Deposit', $3, $4, $5, $6, $7)
    `, [wallet.id, email, depAmount, date, ref, paymentMethod || "M-Pesa", Date.now()]);

    await client.query("COMMIT");

    res.status(200).json({
      success: true,
      message: "Deposit successful",
      wallet: {
        ...updateRes.rows[0],
        balance: parseFloat(updateRes.rows[0].balance)
      }
    });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Deposit failed:", error);
    res.status(500).json({ error: "Failed to perform deposit", details: error.message });
  } finally {
    client.release();
  }
});

/**
 * @route POST /api/wallets/withdraw
 * @desc Withdraw money from PayLoop wallet
 */
router.post("/withdraw", async (req, res) => {
  const { email, amount, paymentMethod } = req.body;

  if (!email || !amount) {
    return res.status(400).json({ error: "Missing email or amount" });
  }

  const withdrawAmount = parseFloat(amount);
  if (isNaN(withdrawAmount) || withdrawAmount <= 0) {
    return res.status(400).json({ error: "Invalid withdrawal amount" });
  }

  const client = await db.pool.connect();
  try {
    await client.query("BEGIN");

    // Fetch primary wallet
    const walletRes = await client.query(
      "SELECT * FROM wallets WHERE user_email = $1 AND wallet_type = 'PayLoop Wallet' FOR UPDATE",
      [email]
    );

    if (walletRes.rowCount === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({ error: "PayLoop Wallet not found" });
    }

    const wallet = walletRes.rows[0];
    const currentBalance = parseFloat(wallet.balance || 0);

    if (currentBalance < withdrawAmount) {
      await client.query("ROLLBACK");
      return res.status(400).json({ error: "Insufficient balance for withdrawal" });
    }

    // Update balance
    const updateRes = await client.query(
      "UPDATE wallets SET balance = balance - $1 WHERE id = $2 RETURNING *",
      [withdrawAmount, wallet.id]
    );

    // Record transaction
    const ref = `WTH-${Math.random().toString(36).substring(2, 10).toUpperCase()}`;
    const date = new Date().toLocaleDateString("en-GB", {
      day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit"
    });
    
    await client.query(`
      INSERT INTO transactions (wallet_id, user_email, type, amount, date, reference, payment_method, timestamp)
      VALUES ($1, $2, 'Withdrawal', $3, $4, $5, $6, $7)
    `, [wallet.id, email, -withdrawAmount, date, ref, paymentMethod || "M-Pesa", Date.now()]);

    await client.query("COMMIT");

    res.status(200).json({
      success: true,
      message: "Withdrawal successful",
      wallet: {
        ...updateRes.rows[0],
        balance: parseFloat(updateRes.rows[0].balance)
      }
    });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Withdrawal failed:", error);
    res.status(500).json({ error: "Failed to perform withdrawal", details: error.message });
  } finally {
    client.release();
  }
});

/**
 * @route POST /api/wallets/transfer
 * @desc Transfer funds between wallets
 */
router.post("/transfer", async (req, res) => {
  const { email, fromWalletType, toWalletType, amount } = req.body;

  if (!email || !fromWalletType || !toWalletType || !amount) {
    return res.status(400).json({ error: "Missing required parameters" });
  }

  const transferAmount = parseFloat(amount);
  if (isNaN(transferAmount) || transferAmount <= 0) {
    return res.status(400).json({ error: "Invalid transfer amount" });
  }

  const client = await db.pool.connect();
  try {
    await client.query("BEGIN");

    // Fetch source wallet
    const fromWalletRes = await client.query(
      "SELECT * FROM wallets WHERE user_email = $1 AND wallet_type = $2 FOR UPDATE",
      [email, fromWalletType]
    );
    if (fromWalletRes.rowCount === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({ error: `Source wallet (${fromWalletType}) not found` });
    }
    const fromWallet = fromWalletRes.rows[0];
    const fromBalance = parseFloat(fromWallet.balance || 0);

    if (fromBalance < transferAmount) {
      await client.query("ROLLBACK");
      return res.status(400).json({ error: `Insufficient balance in ${fromWalletType}` });
    }

    // Fetch target wallet
    const toWalletRes = await client.query(
      "SELECT * FROM wallets WHERE user_email = $1 AND wallet_type = $2 FOR UPDATE",
      [email, toWalletType]
    );
    if (toWalletRes.rowCount === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({ error: `Destination wallet (${toWalletType}) not found` });
    }
    const toWallet = toWalletRes.rows[0];

    // Deduct source
    await client.query("UPDATE wallets SET balance = balance - $1 WHERE id = $2", [transferAmount, fromWallet.id]);
    // Credit destination
    await client.query("UPDATE wallets SET balance = balance + $1 WHERE id = $2", [transferAmount, toWallet.id]);

    // Record transactions
    const ref = `TRF-${Math.random().toString(36).substring(2, 10).toUpperCase()}`;
    const date = new Date().toLocaleDateString("en-GB", {
      day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit"
    });
    
    // Outflow
    await client.query(`
      INSERT INTO transactions (wallet_id, user_email, type, amount, date, reference, payment_method, timestamp)
      VALUES ($1, $2, 'Transfer Out', $3, $4, $5, $6, $7)
    `, [fromWallet.id, email, -transferAmount, date, ref + "A", "Internal", Date.now()]);

    // Inflow
    await client.query(`
      INSERT INTO transactions (wallet_id, user_email, type, amount, date, reference, payment_method, timestamp)
      VALUES ($1, $2, 'Transfer In', $3, $4, $5, $6, $7)
    `, [toWallet.id, email, transferAmount, date, ref + "B", "Internal", Date.now()]);

    await client.query("COMMIT");

    res.status(200).json({
      success: true,
      message: "Transfer completed successfully"
    });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Transfer failed:", error);
    res.status(500).json({ error: "Failed to perform transfer", details: error.message });
  } finally {
    client.release();
  }
});

module.exports = router;
