const nodemailer = require("nodemailer");

let transporter = null;

const host = process.env.SMTP_HOST;
const port = process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT) : 587;
const user = process.env.SMTP_USER;
const pass = process.env.SMTP_PASS;

if (host && user && pass) {
  transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465, // true for 465, false for other ports
    auth: {
      user,
      pass,
    },
    connectionTimeout: 5000, // 5 seconds
    greetingTimeout: 5000,   // 5 seconds
    socketTimeout: 10000,    // 10 seconds
  });
  console.log("Nodemailer SMTP Transporter initialized successfully.");
} else {
  console.log("SMTP credentials missing. Running email service in Sandbox (log-only) mode.");
}

const sendOTP = async (email, code) => {
  const mailOptions = {
    from: `"PayLoop Chama" <${user || "no-reply@payloop.com"}>`,
    to: email,
    subject: "PayLoop Verification Code 🔑",
    text: `Your PayLoop verification code is: ${code}. It expires in 10 minutes.`,
    html: `
      <div style="font-family: sans-serif; max-width: 500px; margin: auto; padding: 24px; border: 1px solid #e4e4e7; border-radius: 16px; background-color: #fafafa;">
        <h2 style="color: #00875A; text-align: center; margin-bottom: 24px; font-size: 28px;">💸 PayLoop</h2>
        <p style="font-size: 16px; color: #3f3f46; line-height: 24px;">Habari! Thank you for choosing PayLoop as your Web3 group savings and micro-lending provider.</p>
        <p style="font-size: 16px; color: #3f3f46; line-height: 24px;">Your registration and login verification OTP code is:</p>
        <div style="text-align: center; margin: 32px 0;">
          <span style="font-size: 36px; font-weight: bold; letter-spacing: 4px; color: #00875A; padding: 12px 24px; background-color: #e6f3ef; border-radius: 12px; border: 1px dashed #00875A; display: inline-block;">${code}</span>
        </div>
        <p style="font-size: 14px; color: #71717a; text-align: center; margin-top: 32px;">This code is valid for 10 minutes. Please do not share this PIN or OTP with anyone.</p>
      </div>
    `,
  };

  if (transporter) {
    try {
      await transporter.sendMail(mailOptions);
      console.log(`[SMTP] Verification email sent to: ${email}`);
    } catch (e) {
      console.error(`[SMTP ERROR] Failed to send email to ${email}:`, e);
    }
  } else {
    console.log(`====================================================`);
    console.log(`📧 [MOCK EMAIL DISPATCH]`);
    console.log(`👉 To:      ${email}`);
    console.log(`👉 Code:    ${code}`);
    console.log(`👉 Subject: PayLoop Verification Code`);
    console.log(`====================================================`);
  }
};

module.exports = { sendOTP };
