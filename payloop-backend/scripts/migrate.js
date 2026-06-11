const { Client } = require("pg");
require("dotenv").config();

const dbUrl = process.env.DATABASE_URL || "postgresql://postgres:postgres@localhost:5432/payloop";

// Extract base connection to postgres default database (to check/create payloop DB)
const urlObj = new URL(dbUrl);
const dbName = urlObj.pathname.substring(1); // extract "payloop"
urlObj.pathname = "/postgres"; // point to default postgres DB
const defaultDbUrl = urlObj.toString();

async function runMigration() {
  console.log("Starting database migration...");
  console.log("Target Database:", dbName);

  // Step 1: Ensure target database exists
  let client = new Client({ connectionString: defaultDbUrl });
  try {
    await client.connect();
    const dbCheck = await client.query("SELECT 1 FROM pg_database WHERE datname = $1", [dbName]);
    if (dbCheck.rowCount === 0) {
      console.log(`Database '${dbName}' does not exist. Creating it...`);
      // CREATE DATABASE cannot run in a transaction block
      await client.query(`CREATE DATABASE ${dbName}`);
      console.log(`Database '${dbName}' created successfully.`);
    } else {
      console.log(`Database '${dbName}' already exists.`);
    }
  } catch (error) {
    console.error("Error checking/creating database:", error.message);
    // Continue anyway as database might already be present or access restricted
  } finally {
    await client.end();
  }

  // Step 2: Connect to the payloop database and create tables
  client = new Client({ connectionString: dbUrl });
  try {
    await client.connect();
    console.log("Connected to target database.");

    // Helper for creating enums if they do not exist
    const createEnum = async (typeName, values) => {
      const res = await client.query("SELECT 1 FROM pg_type WHERE typname = $1", [typeName]);
      if (res.rowCount === 0) {
        const valuesList = values.map(v => `'${v}'`).join(", ");
        await client.query(`CREATE TYPE ${typeName} AS ENUM (${valuesList})`);
        console.log(`Created enum type ${typeName}.`);
      } else {
        console.log(`Enum type ${typeName} already exists.`);
      }
    };

    // Create custom types/enums
    await createEnum("otp_purpose", ["EMAIL_VERIFICATION", "PASSWORD_RESET", "PHONE_VERIFICATION", "LOGIN_VERIFICATION"]);
    await createEnum("verification_level", ["BASIC", "FULLY_VERIFIED"]);
    await createEnum("transaction_type", ["Contribution", "Loan Disbursement", "Loan Repayment"]);
    await createEnum("document_type", ["National_ID", "Passport", "Selfie"]);
    await createEnum("document_status", ["Pending", "Approved", "Rejected"]);

    // Create tables
    console.log("Creating tables if they don't exist...");

    // Users Table
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        phone VARCHAR(50) NOT NULL,
        pin VARCHAR(10) NOT NULL,
        handle VARCHAR(100) UNIQUE NOT NULL,
        wallet_address VARCHAR(100) UNIQUE NOT NULL,
        avatar VARCHAR(50) DEFAULT '👤',
        gender VARCHAR(50) DEFAULT 'Not Specified',
        marital_status VARCHAR(50) DEFAULT 'Not Specified',
        joined_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        profile_completion INT DEFAULT 85,
        status VARCHAR(50) DEFAULT 'Active',
        credit_score INT DEFAULT 500,
        is_email_verified BOOLEAN DEFAULT FALSE,
        is_phone_verified BOOLEAN DEFAULT FALSE,
        verification_level verification_level DEFAULT 'BASIC'
      )
    `);

    // Wallets Table
    await client.query(`
      CREATE TABLE IF NOT EXISTS wallets (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_email VARCHAR(255) UNIQUE NOT NULL REFERENCES users(email) ON DELETE CASCADE,
        balance NUMERIC(15, 2) DEFAULT 1000.00,
        savings NUMERIC(15, 2) DEFAULT 0.00,
        active_loan NUMERIC(15, 2) DEFAULT 0.00,
        loop_points INT DEFAULT 0,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Otps Table
    await client.query(`
      CREATE TABLE IF NOT EXISTS otps (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        email VARCHAR(255) NOT NULL,
        code VARCHAR(10) NOT NULL,
        purpose otp_purpose DEFAULT 'EMAIL_VERIFICATION',
        expires_at TIMESTAMP NOT NULL,
        used BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Groups Table
    await client.query(`
      CREATE TABLE IF NOT EXISTS groups (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(255) NOT NULL,
        vault_address VARCHAR(100) UNIQUE NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Group Members Table
    await client.query(`
      CREATE TABLE IF NOT EXISTS group_members (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        group_id UUID REFERENCES groups(id) ON DELETE CASCADE,
        user_email VARCHAR(255) REFERENCES users(email) ON DELETE CASCADE,
        role VARCHAR(50) DEFAULT 'Member',
        joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(group_id, user_email)
      )
    `);

    // Transactions Table
    await client.query(`
      CREATE TABLE IF NOT EXISTS transactions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_email VARCHAR(255) REFERENCES users(email) ON DELETE CASCADE,
        type transaction_type NOT NULL,
        amount NUMERIC(15, 2) NOT NULL,
        date VARCHAR(100) NOT NULL,
        status VARCHAR(50) DEFAULT 'Completed',
        reference VARCHAR(100) UNIQUE NOT NULL,
        payment_method VARCHAR(50) DEFAULT 'M-Pesa',
        timestamp BIGINT NOT NULL
      )
    `);

    // Savings Goals Table
    await client.query(`
      CREATE TABLE IF NOT EXISTS savings_goals (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_email VARCHAR(255) REFERENCES users(email) ON DELETE CASCADE,
        name VARCHAR(255) NOT NULL,
        target_amount NUMERIC(15, 2) NOT NULL,
        deadline VARCHAR(100) NOT NULL,
        badge VARCHAR(50) DEFAULT '💼',
        saved_amount NUMERIC(15, 2) DEFAULT 0.00,
        completed INT DEFAULT 0,
        timestamp BIGINT NOT NULL
      )
    `);

    // Loans Table
    await client.query(`
      CREATE TABLE IF NOT EXISTS loans (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_email VARCHAR(255) REFERENCES users(email) ON DELETE CASCADE,
        borrower VARCHAR(255) NOT NULL,
        address VARCHAR(100) NOT NULL,
        amount NUMERIC(15, 2) NOT NULL,
        interest_rate NUMERIC(5, 2) NOT NULL,
        duration INT NOT NULL,
        votes_for INT DEFAULT 0,
        votes_against INT DEFAULT 0,
        active BOOLEAN DEFAULT TRUE,
        approved BOOLEAN DEFAULT FALSE,
        repaid BOOLEAN DEFAULT FALSE,
        repayment_deadline INT DEFAULT 0,
        purpose TEXT NOT NULL,
        timestamp BIGINT NOT NULL,
        group_id UUID REFERENCES groups(id) ON DELETE SET NULL
      )
    `);

    // Verification Documents Table
    await client.query(`
      CREATE TABLE IF NOT EXISTS verification_documents (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_email VARCHAR(255) REFERENCES users(email) ON DELETE CASCADE,
        doc_type document_type NOT NULL,
        file_url TEXT NOT NULL,
        status document_status DEFAULT 'Pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Pending Payments Table
    await client.query(`
      CREATE TABLE IF NOT EXISTS pending_payments (
        phone VARCHAR(50) PRIMARY KEY,
        wallet_address VARCHAR(100) NOT NULL,
        vault_address VARCHAR(100) NOT NULL,
        amount NUMERIC(15, 2) NOT NULL,
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Audit Logs Table
    await client.query(`
      CREATE TABLE IF NOT EXISTS audit_logs (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_email VARCHAR(255) REFERENCES users(email) ON DELETE CASCADE,
        action VARCHAR(255) NOT NULL,
        details TEXT NOT NULL,
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    console.log("All tables created successfully.");

    // Seed default chama group if not exists
    const groupCheck = await client.query("SELECT 1 FROM groups WHERE name = $1", ["Umoja Chama Vault"]);
    if (groupCheck.rowCount === 0) {
      await client.query(`
        INSERT INTO groups (name, vault_address) 
        VALUES ('Umoja Chama Vault', '0x1234567890abcdef1234567890abcdef12345678')
      `);
      console.log("Default chama group seeded.");
    }

  } catch (error) {
    console.error("Migration failed:", error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

if (require.main === module) {
  runMigration();
}

module.exports = runMigration;
