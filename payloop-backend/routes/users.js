const express = require("express");
const bcrypt = require("bcryptjs");
const db = require("../services/db");
const router = express.Router();

/**
 * @route POST /api/users/register
 * @desc Create new user account and associated wallet record in PostgreSQL using a transaction
 */
router.post("/register", async (req, res) => {
  const { email, name, handle, phone, pin, avatar, gender, maritalStatus } = req.body;

  if (!email || !name || !phone || !pin) {
    return res.status(400).json({ error: "Missing required fields (email, name, phone, pin)" });
  }

  const client = await db.pool.connect();
  try {
    await client.query("BEGIN");

    // 1. Check if user already exists
    const checkQuery = "SELECT 1 FROM users WHERE email = $1";
    const checkRes = await client.query(checkQuery, [email]);
    if (checkRes.rowCount > 0) {
      await client.query("ROLLBACK");
      return res.status(400).json({ error: "A user with this email address already exists" });
    }

    // Hash the PIN (acting as password too) for database security
    const salt = await bcrypt.genSalt(10);
    const hashedPin = await bcrypt.hash(pin, salt);

    let userHandle = handle || `@${name.toLowerCase().replace(/\s+/g, "")}`;
    let handleExists = true;
    let attempts = 0;
    while (handleExists && attempts < 10) {
      const checkHandleRes = await client.query("SELECT 1 FROM users WHERE handle = $1", [userHandle]);
      if (checkHandleRes.rowCount > 0) {
        const randomSuffix = Math.floor(1000 + Math.random() * 9000).toString();
        userHandle = `${handle || `@${name.toLowerCase().replace(/\s+/g, "")}`}${randomSuffix}`;
        attempts++;
      } else {
        handleExists = false;
      }
    }

    const walletAddr = "0x" + Math.random().toString(16).substring(2, 42);

    // 2. Insert user
    const insertUserQuery = `
      INSERT INTO users (
        name, email, password, phone, pin, handle, wallet_address, avatar, gender, marital_status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *
    `;
    const userRes = await client.query(insertUserQuery, [
      name,
      email,
      hashedPin, // password column
      phone,
      pin, // pin column (plain representation for simple sandbox verify)
      userHandle,
      walletAddr,
      avatar || "👤",
      gender || "Not Specified",
      maritalStatus || "Not Specified"
    ]);

    // 3. Insert starting wallet
    const insertWalletQuery = `
      INSERT INTO wallets (user_email, balance, savings, active_loan, loop_points) 
      VALUES ($1, 1000.00, 0.00, 0.00, 0)
      RETURNING *
    `;
    const walletRes = await client.query(insertWalletQuery, [email]);

    await client.query("COMMIT");

    const registeredUser = {
      ...userRes.rows[0],
      balance: parseFloat(walletRes.rows[0].balance),
      savings: parseFloat(walletRes.rows[0].savings),
      active_loan: parseFloat(walletRes.rows[0].active_loan),
      loop_points: walletRes.rows[0].loop_points
    };

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      user: registeredUser
    });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Registration failed:", error);
    res.status(500).json({ error: "Failed to register account", details: error.message });
  } finally {
    client.release();
  }
});

/**
 * @route GET /api/users/profile
 * @desc Fetch user profile by email joined with wallet details
 */
router.get("/profile", async (req, res) => {
  const { email } = req.query;

  if (!email) {
    return res.status(400).json({ error: "Missing email parameter" });
  }

  try {
    const query = `
      SELECT u.id, u.name, u.email, u.phone, u.pin, u.handle, u.wallet_address, 
             u.avatar, u.gender, u.marital_status, u.joined_date, u.profile_completion, 
             u.status, u.credit_score, u.is_email_verified, u.is_phone_verified, 
             u.verification_level,
             w.balance, w.savings, w.active_loan, w.loop_points
      FROM users u
      LEFT JOIN wallets w ON u.email = w.user_email
      WHERE u.email = $1
    `;
    const result = await db.query(query, [email]);

    if (result.rowCount === 0) {
      return res.status(404).json({ error: "User profile not found" });
    }

    const userData = result.rows[0];
    // Cast numeric types from PG strings
    res.status(200).json({
      ...userData,
      balance: parseFloat(userData.balance || 0),
      savings: parseFloat(userData.savings || 0),
      active_loan: parseFloat(userData.active_loan || 0),
      loop_points: parseInt(userData.loop_points || 0)
    });
  } catch (error) {
    console.error("Failed to fetch profile:", error);
    res.status(500).json({ error: "Database query failed", details: error.message });
  }
});

/**
 * @route POST /api/users/update-profile
 * @desc Update selective profile parameters (avatar, gender, marital status)
 */
router.post("/update-profile", async (req, res) => {
  const { email, gender, maritalStatus, avatar } = req.body;

  if (!email) {
    return res.status(400).json({ error: "Missing email parameter" });
  }

  try {
    // Dynamically build the SET clauses to update only provided columns
    const setClauses = [];
    const values = [];
    let idx = 1;

    if (gender !== undefined) {
      setClauses.push(`gender = $${idx++}`);
      values.push(gender);
    }
    if (maritalStatus !== undefined) {
      setClauses.push(`marital_status = $${idx++}`);
      values.push(maritalStatus);
    }
    if (avatar !== undefined) {
      setClauses.push(`avatar = $${idx++}`);
      values.push(avatar);
    }

    if (setClauses.length === 0) {
      return res.status(400).json({ error: "No update parameters provided" });
    }

    values.push(email);
    const updateQuery = `
      UPDATE users 
      SET ${setClauses.join(", ")} 
      WHERE email = $${idx}
      RETURNING email
    `;

    const updateRes = await db.query(updateQuery, values);
    if (updateRes.rowCount === 0) {
      return res.status(404).json({ error: "User profile not found" });
    }

    // Fetch the full updated profile with wallet
    const selectQuery = `
      SELECT u.id, u.name, u.email, u.phone, u.pin, u.handle, u.wallet_address, 
             u.avatar, u.gender, u.marital_status, u.joined_date, u.profile_completion, 
             u.status, u.credit_score, u.is_email_verified, u.is_phone_verified, 
             u.verification_level,
             w.balance, w.savings, w.active_loan, w.loop_points
      FROM users u
      LEFT JOIN wallets w ON u.email = w.user_email
      WHERE u.email = $1
    `;
    const fullProfile = await db.query(selectQuery, [email]);
    const userData = fullProfile.rows[0];

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      user: {
        ...userData,
        balance: parseFloat(userData.balance || 0),
        savings: parseFloat(userData.savings || 0),
        active_loan: parseFloat(userData.active_loan || 0),
        loop_points: parseInt(userData.loop_points || 0)
      }
    });
  } catch (error) {
    console.error("Profile update failed:", error);
    res.status(500).json({ error: "Failed to update profile", details: error.message });
  }
});

/**
 * @route POST /api/users/verify-phone
 * @desc Verify user phone number
 */
router.post("/verify-phone", async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ error: "Missing email parameter" });
  }

  try {
    const query = `
      UPDATE users 
      SET is_phone_verified = TRUE 
      WHERE email = $1 
      RETURNING *
    `;
    const result = await db.query(query, [email]);
    if (result.rowCount === 0) {
      return res.status(404).json({ error: "User profile not found" });
    }

    res.status(200).json({
      success: true,
      message: "Phone number verified successfully",
      user: result.rows[0]
    });
  } catch (error) {
    console.error("Phone verification failed:", error);
    res.status(500).json({ error: "Failed to verify phone number", details: error.message });
  }
});

/**
 * @route POST /api/users/upload-document
 * @desc Upload verification document and trigger automatic level 2 upgrade checks
 */
router.post("/upload-document", async (req, res) => {
  const { email, docType, fileUrl } = req.body;

  if (!email || !docType || !fileUrl) {
    return res.status(400).json({ error: "Missing email, docType, or fileUrl" });
  }

  const client = await db.pool.connect();
  try {
    await client.query("BEGIN");

    // 1. Insert the document upload
    const insertDocQuery = `
      INSERT INTO verification_documents (user_email, doc_type, file_url, status)
      VALUES ($1, $2, $3, 'Approved') -- Auto-approving for hackathon sandbox
      RETURNING *
    `;
    await client.query(insertDocQuery, [email, docType, fileUrl]);

    // 2. Check all uploaded documents for this user
    const checkDocsQuery = `
      SELECT DISTINCT doc_type 
      FROM verification_documents 
      WHERE user_email = $1 AND status = 'Approved'
    `;
    const docsRes = await client.query(checkDocsQuery, [email]);
    const uploadedTypes = docsRes.rows.map(row => row.doc_type);

    const hasID = uploadedTypes.includes("National_ID") || uploadedTypes.includes("Passport");
    const hasSelfie = uploadedTypes.includes("Selfie");

    let levelUpgraded = false;
    if (hasID && hasSelfie) {
      // Upgrade user verification level to FULLY_VERIFIED
      const upgradeQuery = `
        UPDATE users 
        SET verification_level = 'FULLY_VERIFIED' 
        WHERE email = $1
      `;
      await client.query(upgradeQuery, [email]);
      levelUpgraded = true;
    }

    await client.query("COMMIT");

    res.status(200).json({
      success: true,
      message: "Document uploaded and processed successfully",
      levelUpgraded,
      documents: uploadedTypes
    });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Document upload failed:", error);
    res.status(500).json({ error: "Failed to upload document", details: error.message });
  } finally {
    client.release();
  }
});

/**
 * @route GET /api/users/list
 * @desc Retrieve list of all users joined with wallet details
 */
router.get("/list", async (req, res) => {
  try {
    const query = `
      SELECT u.id, u.name, u.email, u.phone, u.pin, u.handle, u.wallet_address, 
             u.avatar, u.gender, u.marital_status, u.joined_date, u.profile_completion, 
             u.status, u.credit_score, u.is_email_verified, u.is_phone_verified, 
             u.verification_level,
             w.balance, w.savings, w.active_loan, w.loop_points
      FROM users u
      LEFT JOIN wallets w ON u.email = w.user_email
      ORDER BY u.joined_date DESC
    `;
    const result = await db.query(query);
    
    const users = result.rows.map(row => ({
      ...row,
      balance: parseFloat(row.balance || 0),
      savings: parseFloat(row.savings || 0),
      active_loan: parseFloat(row.active_loan || 0),
      loop_points: parseInt(row.loop_points || 0)
    }));

    res.status(200).json(users);
  } catch (error) {
    console.error("Failed to list users:", error);
    res.status(500).json({ error: "Database query failed", details: error.message });
  }
});

module.exports = router;
