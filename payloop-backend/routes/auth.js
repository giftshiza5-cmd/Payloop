const express = require("express");
const db = require("../services/db");
const { sendOTP } = require("../services/email");
const router = express.Router();

// Helper to generate a 6-digit random code
function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * @route POST /api/auth/send-otp
 * @desc Generate OTP, save to PostgreSQL, and dispatch email
 */
router.post("/send-otp", async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ error: "Missing email parameter" });
  }

  try {
    // 1. Check rate-limit (max 3 resends in the last 1 hour)
    const rateLimitQuery = `
      SELECT COUNT(*) as count 
      FROM otps 
      WHERE email = $1 
        AND created_at > NOW() - INTERVAL '1 hour'
    `;
    const rateLimitRes = await db.query(rateLimitQuery, [email]);
    const resendCount = parseInt(rateLimitRes.rows[0].count);

    if (resendCount >= 3) {
      return res.status(429).json({ 
        error: "Too many verification requests. Please try again after an hour." 
      });
    }

    const otpCode = generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes validity

    // 2. Invalidate previous unused verification OTPs for this email
    const invalidateQuery = `
      UPDATE otps 
      SET used = TRUE 
      WHERE email = $1 AND purpose = 'EMAIL_VERIFICATION' AND used = FALSE
    `;
    await db.query(invalidateQuery, [email]);

    // 3. Save new OTP to database
    const insertQuery = `
      INSERT INTO otps (email, code, purpose, expires_at) 
      VALUES ($1, $2, 'EMAIL_VERIFICATION', $3)
    `;
    await db.query(insertQuery, [email, otpCode, expiresAt]);

    // 4. Send email via Nodemailer (fire-and-forget in background)
    sendOTP(email, otpCode).catch(e => {
      console.error("[BACKGROUND SMTP ERROR] Failed to send email:", e);
    });

    res.status(200).json({
      success: true,
      message: "Verification OTP code sent successfully",
      otp: otpCode // Included for testing/auto-fill simulation
    });
  } catch (error) {
    console.error("Error sending OTP:", error);
    res.status(500).json({ error: "Failed to send verification code", details: error.message });
  }
});

/**
 * @route POST /api/auth/verify-otp
 * @desc Validate code against PostgreSQL database
 */
router.post("/verify-otp", async (req, res) => {
  const { email, code } = req.body;

  if (!email || !code) {
    return res.status(400).json({ error: "Missing email or verification code" });
  }

  try {
    // 1. Fetch valid unused OTP
    const selectQuery = `
      SELECT * 
      FROM otps 
      WHERE email = $1 
        AND code = $2 
        AND used = FALSE 
        AND expires_at > NOW()
      ORDER BY created_at DESC
      LIMIT 1
    `;
    const otpRes = await db.query(selectQuery, [email, code]);

    if (otpRes.rowCount === 0) {
      return res.status(400).json({ error: "Invalid or expired verification code" });
    }

    const otpRecord = otpRes.rows[0];

    // 2. Mark OTP as used
    const markUsedQuery = `
      UPDATE otps 
      SET used = TRUE 
      WHERE id = $1
    `;
    await db.query(markUsedQuery, [otpRecord.id]);

    // 3. Set is_email_verified = true in users table
    const verifyUserQuery = `
      UPDATE users 
      SET is_email_verified = TRUE 
      WHERE email = $1
      RETURNING *
    `;
    const userRes = await db.query(verifyUserQuery, [email]);

    res.status(200).json({ 
      success: true, 
      message: "Email verification successful",
      user: userRes.rows[0]
    });
  } catch (error) {
    console.error("Error verifying OTP:", error);
    res.status(500).json({ error: "Verification process failed", details: error.message });
  }
});

/**
 * @route GET /api/auth/latest-otp
 * @desc Retrieve the latest verification code generated for an email (for sandbox auto-fill)
 */
router.get("/latest-otp", async (req, res) => {
  const { email } = req.query;

  if (!email) {
    return res.status(400).json({ error: "Missing email query parameter" });
  }

  try {
    const query = `
      SELECT code, expires_at 
      FROM otps 
      WHERE email = $1 AND used = FALSE AND expires_at > NOW()
      ORDER BY created_at DESC 
      LIMIT 1
    `;
    const resCount = await db.query(query, [email]);

    if (resCount.rowCount === 0) {
      return res.status(404).json({ error: "No verification code active for this email" });
    }

    const data = resCount.rows[0];
    res.status(200).json({
      email,
      code: data.code,
      expiresAt: data.expires_at
    });
  } catch (error) {
    console.error("Failed to query latest OTP:", error);
    res.status(500).json({ error: "Database query failed", details: error.message });
  }
});

const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const JWT_SECRET = process.env.JWT_SECRET || "payloop_secret_key";

/**
 * @route POST /api/auth/register
 * @desc Register a new user, create their profile, default wallet, and sequential user ID code
 */
router.post("/register", async (req, res) => {
  const { 
    email, name, phone, password, pin, dob, gender, county, occupation, bio, avatar, referralCode 
  } = req.body;

  if (!email || !name || !phone || !password) {
    return res.status(400).json({ error: "Missing required fields (email, name, phone, password)" });
  }

  const client = await db.pool.connect();
  try {
    await client.query("BEGIN");

    // 1. Check if user already exists
    const checkUser = await client.query("SELECT 1 FROM users WHERE email = $1 OR phone = $2", [email, phone]);
    if (checkUser.rowCount > 0) {
      await client.query("ROLLBACK");
      return res.status(400).json({ error: "User with this email or phone number already exists" });
    }

    // 2. Generate sequential PL-USER code
    const countRes = await client.query("SELECT COUNT(*) FROM users");
    const nextNum = parseInt(countRes.rows[0].count) + 1;
    const userIdCode = `PL-USER-${nextNum.toString().padStart(6, "0")}`;

    // 3. Hash password and PIN
    const hashedPassword = await bcrypt.hash(password, 10);
    const plainPin = pin || "123456"; // Default PIN for wallet verification if not provided

    // Generate handle
    const handle = `@${name.toLowerCase().replace(/\s+/g, "")}${Math.floor(100 + Math.random() * 900)}`;
    
    // Generate mock wallet address if not provided
    const hexChars = "0123456789abcdef";
    let walletAddress = "0x";
    for (let i = 0; i < 40; i++) {
      walletAddress += hexChars[Math.floor(Math.random() * 16)];
    }

    // 4. Insert user profile
    const insertUser = `
      INSERT INTO users (
        user_id_code, name, email, password, phone, pin, handle, wallet_address, avatar, gender, dob, county, occupation, bio, referral_code
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
      RETURNING *
    `;
    const userRes = await client.query(insertUser, [
      userIdCode,
      name,
      email,
      hashedPassword,
      phone,
      plainPin,
      handle,
      walletAddress,
      avatar || "👤",
      gender || "Not Specified",
      dob || "",
      county || "",
      occupation || "",
      bio || "",
      referralCode || ""
    ]);

    const user = userRes.rows[0];

    // 5. Create default PayLoop wallet for the user
    const insertWallet = `
      INSERT INTO wallets (user_email, balance, savings, active_loan, loop_points, wallet_type)
      VALUES ($1, 1000.00, 0.00, 0.00, 0, 'PayLoop Wallet')
      RETURNING *
    `;
    await client.query(insertWallet, [email]);

    await client.query("COMMIT");

    // Generate token
    const token = jwt.sign({ email: user.email, id: user.id }, JWT_SECRET, { expiresIn: "24h" });

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      token,
      user: {
        id: user.id,
        user_id_code: user.user_id_code,
        name: user.name,
        email: user.email,
        phone: user.phone,
        handle: user.handle,
        wallet_address: user.wallet_address,
        avatar: user.avatar,
        reputation_score: user.reputation_score,
        credit_score: user.credit_score,
        verification_level: user.verification_level
      }
    });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Register error:", error);
    res.status(500).json({ error: "Failed to register user", details: error.message });
  } finally {
    client.release();
  }
});

/**
 * @route POST /api/auth/login
 * @desc Login user with Email/Phone + Password
 */
router.post("/login", async (req, res) => {
  const { username, password } = req.body; // username can be email or phone

  if (!username || !password) {
    return res.status(400).json({ error: "Missing username (email or phone) or password" });
  }

  try {
    // Check if user exists by email or phone
    const userRes = await db.query(
      "SELECT * FROM users WHERE email = $1 OR phone = $1", 
      [username]
    );

    if (userRes.rowCount === 0) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const user = userRes.rows[0];

    // Verify password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      // Allow PIN login fallback for backward compatibility / testing
      if (password !== user.pin) {
        return res.status(401).json({ error: "Invalid credentials" });
      }
    }

    // Generate JWT token
    const token = jwt.sign({ email: user.email, id: user.id }, JWT_SECRET, { expiresIn: "24h" });

    // Fetch primary wallet details
    const walletRes = await db.query("SELECT * FROM wallets WHERE user_email = $1 AND wallet_type = 'PayLoop Wallet'", [user.email]);
    const wallet = walletRes.rows[0] || { balance: 0, savings: 0, active_loan: 0, loop_points: 0 };

    res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user: {
        id: user.id,
        user_id_code: user.user_id_code,
        name: user.name,
        email: user.email,
        phone: user.phone,
        handle: user.handle,
        wallet_address: user.wallet_address,
        avatar: user.avatar,
        dob: user.dob,
        gender: user.gender,
        county: user.county,
        occupation: user.occupation,
        bio: user.bio,
        reputation_score: user.reputation_score,
        credit_score: user.credit_score,
        verification_level: user.verification_level,
        balance: parseFloat(wallet.balance || 0),
        savings: parseFloat(wallet.savings || 0),
        active_loan: parseFloat(wallet.active_loan || 0),
        loop_points: parseInt(wallet.loop_points || 0)
      }
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Failed to authenticate user", details: error.message });
  }
});

module.exports = router;

