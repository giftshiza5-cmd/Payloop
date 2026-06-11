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

module.exports = router;
