const express = require("express");
const axios = require("axios");
const { ethers } = require("ethers");
const db = require("../services/db");
const { sendPushNotification } = require("../services/firebase");
const router = express.Router();

// Exchange Rate: 1 KES = 0.01 MATIC (simulated exchange rate for chama micro-contributions)
const KES_TO_MATIC_RATE = 0.01;

// CircleVault Contract ABI (essential functions for backend relay)
const VAULT_ABI = [
  "function contributeOnBehalf(address _member) external payable",
  "function contributionAmount() view returns (uint256)",
  "function isMember(address _member) view returns (bool)"
];

// Helper to get Safaricom OAuth Token (Sandbox)
const getMpesaToken = async () => {
  const consumerKey = process.env.MPESA_CONSUMER_KEY || "mockKey";
  const consumerSecret = process.env.MPESA_CONSUMER_SECRET || "mockSecret";
  
  if (consumerKey === "mockKey") return "MOCK_TOKEN_12345";

  const auth = Buffer.from(`${consumerKey}:${consumerSecret}`).toString("base64");
  try {
    const response = await axios.get(
      "https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials",
      {
        headers: { Authorization: `Basic ${auth}` },
      }
    );
    return response.data.access_token;
  } catch (error) {
    console.error("Error fetching M-Pesa token:", error.response?.data || error.message);
    throw new Error("M-Pesa auth failed");
  }
};

/**
 * @route POST /api/mpesa/stkpush
 * @desc Initiate M-Pesa STK Push to user phone
 */
router.post("/stkpush", async (req, res) => {
  const { phone, amount, walletAddress, vaultAddress } = req.body;

  if (!phone || !amount || !walletAddress || !vaultAddress) {
    return res.status(400).json({ error: "Missing required parameters (phone, amount, walletAddress, vaultAddress)" });
  }

  const amt = parseFloat(amount);
  if (isNaN(amt) || amt <= 0) {
    return res.status(400).json({ error: "Invalid payment amount" });
  }

  console.log(`Initiating STK Push for ${phone}, amount: KES ${amount}`);

  try {
    // 1. Save the pending transaction details in PostgreSQL
    const upsertQuery = `
      INSERT INTO pending_payments (phone, wallet_address, vault_address, amount, timestamp)
      VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP)
      ON CONFLICT (phone) DO UPDATE 
      SET wallet_address = EXCLUDED.wallet_address,
          vault_address = EXCLUDED.vault_address,
          amount = EXCLUDED.amount,
          timestamp = CURRENT_TIMESTAMP
    `;
    await db.query(upsertQuery, [phone, walletAddress, vaultAddress, amt]);

    const token = await getMpesaToken();
    
    // If running in Mock Mode (no actual M-Pesa credentials configured)
    if (token === "MOCK_TOKEN_12345") {
      return res.status(200).json({
        message: "STK Push Initiated (MOCK MODE)",
        CheckoutRequestID: `ws_CO_${Date.now()}`,
        CustomerMessage: "Success. Please enter PIN on phone (Simulated)",
        mock: true
      });
    }

    // Safaricom Daraja STK Push Parameters
    const shortCode = process.env.MPESA_SHORTCODE || "174379";
    const passkey = process.env.MPESA_PASSKEY || "bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919";
    
    const date = new Date();
    const timestamp = date.getFullYear() +
      ("0" + (date.getMonth() + 1)).slice(-2) +
      ("0" + date.getDate()).slice(-2) +
      ("0" + date.getHours()).slice(-2) +
      ("0" + date.getMinutes()).slice(-2) +
      ("0" + date.getSeconds()).slice(-2);
      
    const password = Buffer.from(`${shortCode}${passkey}${timestamp}`).toString("base64");
    const callbackUrl = process.env.CALLBACK_URL || "https://yourdomain.com/api/mpesa/callback";

    const response = await axios.post(
      "https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest",
      {
        BusinessShortCode: shortCode,
        Password: password,
        Timestamp: timestamp,
        TransactionType: "CustomerPayBillOnline",
        Amount: amt,
        PartyA: phone,
        PartyB: shortCode,
        PhoneNumber: phone,
        CallBackURL: callbackUrl,
        AccountReference: "PayLoop Savings",
        TransactionDesc: "Weekly Chama Contribution",
      },
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    res.status(200).json(response.data);
  } catch (error) {
    console.error("STK Push failed:", error.response?.data || error.message);
    res.status(500).json({ error: "Failed to initiate M-Pesa STK Push", details: error.response?.data || error.message });
  }
});

/**
 * @route POST /api/mpesa/callback
 * @desc Webhook listener for Safaricom Daraja callback
 */
router.post("/callback", async (req, res) => {
  const callbackData = req.body.Body.stkCallback;
  const resultCode = callbackData.ResultCode;
  
  console.log(`Callback received. ResultCode: ${resultCode}`);

  if (resultCode !== 0) {
    console.log(`Payment failed: ${callbackData.ResultDesc}`);
    return res.status(200).send("OK");
  }

  // Parse details
  const phone = callbackData.CallbackMetadata.Item.find(item => item.Name === "PhoneNumber").Value.toString();
  const mpesaAmount = parseFloat(callbackData.CallbackMetadata.Item.find(item => item.Name === "Amount").Value);
  const transactionCode = callbackData.CallbackMetadata.Item.find(item => item.Name === "MpesaReceiptNumber").Value;

  console.log(`M-Pesa Payment Successful! Phone: ${phone}, Amount: KES ${mpesaAmount}, Code: ${transactionCode}`);

  await processOnChainDeposit(phone, mpesaAmount, transactionCode);

  res.status(200).send("OK");
});

/**
 * @route POST /api/mpesa/simulate-callback
 * @desc Sandbox simulator helper to bypass Safaricom sandbox webhook for hackathon demos
 */
router.post("/simulate-callback", async (req, res) => {
  const { phone, amount, transactionCode } = req.body;

  if (!phone || !amount) {
    return res.status(400).json({ error: "Missing phone or amount" });
  }

  const txCode = transactionCode || `MP_${Math.random().toString(36).substring(2, 10).toUpperCase()}`;
  console.log(`[SIMULATOR] Simulating success callback for ${phone}, KES ${amount}, Code: ${txCode}`);

  try {
    await processOnChainDeposit(phone, parseFloat(amount), txCode);
    res.status(200).json({ message: "Simulated M-Pesa deposit processed successfully!", transactionCode: txCode });
  } catch (error) {
    res.status(500).json({ error: "Failed to process simulated callback", details: error.message });
  }
});

// Helper to execute the on-chain write transaction via relayer wallet
async function processOnChainDeposit(phone, amountKes, transactionCode) {
  // 1. Retrieve the pending payment details from PostgreSQL
  const selectQuery = "SELECT * FROM pending_payments WHERE phone = $1";
  const pendingRes = await db.query(selectQuery, [phone]);

  if (pendingRes.rowCount === 0) {
    console.error(`No pending payment metadata found for phone: ${phone}`);
    return;
  }

  const { wallet_address, vault_address } = pendingRes.rows[0];
  console.log(`Retrieved payment metadata. Wallet: ${wallet_address}, Vault: ${vault_address}`);

  // Calculate MATIC to deposit (1 KES = 0.01 MATIC)
  const maticAmount = amountKes * KES_TO_MATIC_RATE;
  const maticWei = ethers.parseEther(maticAmount.toString());

  // Initialize Ethers Provider and Signer (relayer wallet)
  const rpcUrl = process.env.RPC_URL || "http://127.0.0.1:8545";
  
  // Default Hardhat Account #0 private key for local development
  const relayerPrivateKey = process.env.PRIVATE_KEY || "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80";

  try {
    const provider = new ethers.JsonRpcProvider(rpcUrl);
    const relayerWallet = new ethers.Wallet(relayerPrivateKey, provider);
    
    console.log(`Relayer wallet address: ${relayerWallet.address}`);

    const vaultContract = new ethers.Contract(vault_address, VAULT_ABI, relayerWallet);

    console.log(`Sending contributeOnBehalf write transaction...`);
    const tx = await vaultContract.contributeOnBehalf(wallet_address, {
      value: maticWei,
      gasLimit: 300000
    });
    
    console.log(`Tx sent. Hash: ${tx.hash}`);
    const receipt = await tx.wait();
    console.log(`Tx confirmed in block ${receipt.blockNumber}`);

    // Send push notification to user
    await sendPushNotification(
      null, // token
      "Chama Deposit Confirmed! 💰",
      `M-Pesa payment of KES ${amountKes} converted to ${maticAmount} MATIC has been successfully saved in the vault!`
    );

    // 2. Delete pending payment record
    const deleteQuery = "DELETE FROM pending_payments WHERE phone = $1";
    await db.query(deleteQuery, [phone]);

  } catch (error) {
    console.error("Relaying on-chain transaction failed:", error);
    throw error;
  }
}

module.exports = router;
