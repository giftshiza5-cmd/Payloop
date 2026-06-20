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
    console.log("Dropping existing tables to refresh schema for multi-group ecosystem...");
    await client.query("DROP TABLE IF EXISTS approval_queue CASCADE");
    await client.query("DROP TABLE IF EXISTS group_meetings CASCADE");
    await client.query("DROP TABLE IF EXISTS group_polls CASCADE");
    await client.query("DROP TABLE IF EXISTS group_financial_rules CASCADE");
    await client.query("DROP TABLE IF EXISTS audit_logs CASCADE");
    await client.query("DROP TABLE IF EXISTS pending_payments CASCADE");
    await client.query("DROP TABLE IF EXISTS verification_documents CASCADE");
    await client.query("DROP TABLE IF EXISTS loans CASCADE");
    await client.query("DROP TABLE IF EXISTS savings_goals CASCADE");
    await client.query("DROP TABLE IF EXISTS transactions CASCADE");
    await client.query("DROP TABLE IF EXISTS contributions CASCADE");
    await client.query("DROP TABLE IF EXISTS group_members CASCADE");
    await client.query("DROP TABLE IF EXISTS groups CASCADE");
    await client.query("DROP TABLE IF EXISTS wallets CASCADE");
    await client.query("DROP TABLE IF EXISTS otps CASCADE");
    await client.query("DROP TABLE IF EXISTS users CASCADE");

    console.log("Creating tables if they don't exist...");

    // Users Table
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id_code VARCHAR(50) UNIQUE NOT NULL,
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
        reputation_score INT DEFAULT 500,
        is_email_verified BOOLEAN DEFAULT FALSE,
        is_phone_verified BOOLEAN DEFAULT FALSE,
        verification_level verification_level DEFAULT 'BASIC',
        push_token VARCHAR(255),
        bio TEXT DEFAULT '',
        occupation VARCHAR(255) DEFAULT '',
        dob VARCHAR(50) DEFAULT '',
        county VARCHAR(100) DEFAULT '',
        referral_code VARCHAR(100) DEFAULT ''
      )
    `);

    // Wallets Table (Can have multiple per user: e.g. internal wallet + connected external)
    await client.query(`
      CREATE TABLE IF NOT EXISTS wallets (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_email VARCHAR(255) NOT NULL REFERENCES users(email) ON DELETE CASCADE,
        balance NUMERIC(15, 2) DEFAULT 0.00,
        savings NUMERIC(15, 2) DEFAULT 0.00,
        active_loan NUMERIC(15, 2) DEFAULT 0.00,
        loop_points INT DEFAULT 0,
        wallet_type VARCHAR(50) DEFAULT 'PayLoop Wallet',
        status VARCHAR(50) DEFAULT 'Active',
        wallet_address VARCHAR(100),
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
        group_id_code VARCHAR(50) UNIQUE NOT NULL,
        name VARCHAR(255) NOT NULL,
        description TEXT DEFAULT '',
        invite_code VARCHAR(50) UNIQUE NOT NULL,
        admin_email VARCHAR(255) REFERENCES users(email) ON DELETE SET NULL,
        category VARCHAR(100) DEFAULT 'Chama',
        max_members INT DEFAULT 100,
        contribution_amount NUMERIC(15, 2) DEFAULT 10.00,
        contribution_frequency VARCHAR(50) DEFAULT 'Weekly',
        loan_interest_rate NUMERIC(5, 2) DEFAULT 10.00,
        voting_threshold INT DEFAULT 50,
        vault_address VARCHAR(100) UNIQUE,
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

    // Group Financial Rules Table
    await client.query(`
      CREATE TABLE IF NOT EXISTS group_financial_rules (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        group_id UUID REFERENCES groups(id) ON DELETE CASCADE UNIQUE,
        contribution_amount DECIMAL(15,2) DEFAULT 500.00,
        late_penalty_rate DECIMAL(5,2) DEFAULT 5.00,
        max_loan_multiplier DECIMAL(5,2) DEFAULT 3.00,
        loan_interest_rate DECIMAL(5,2) DEFAULT 10.00,
        emergency_fund_percent DECIMAL(5,2) DEFAULT 10.00,
        max_withdrawal_percent DECIMAL(5,2) DEFAULT 80.00,
        grace_period_days INT DEFAULT 7,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Group Polls Table
    await client.query(`
      CREATE TABLE IF NOT EXISTS group_polls (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        group_id UUID REFERENCES groups(id) ON DELETE CASCADE,
        created_by VARCHAR(255) REFERENCES users(email) ON DELETE CASCADE,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        poll_type VARCHAR(50) DEFAULT 'vote', -- vote|election|amendment
        options JSONB DEFAULT '[]',
        votes JSONB DEFAULT '{}',
        quorum_percent INT DEFAULT 50,
        status VARCHAR(20) DEFAULT 'active', -- active|closed|passed|rejected
        ends_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Group Meetings Table
    await client.query(`
      CREATE TABLE IF NOT EXISTS group_meetings (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        group_id UUID REFERENCES groups(id) ON DELETE CASCADE,
        created_by VARCHAR(255) REFERENCES users(email) ON DELETE CASCADE,
        title VARCHAR(255) NOT NULL,
        agenda TEXT,
        meeting_date TIMESTAMP,
        location VARCHAR(255),
        meeting_type VARCHAR(50) DEFAULT 'regular',
        attendees JSONB DEFAULT '[]',
        minutes TEXT DEFAULT '',
        status VARCHAR(20) DEFAULT 'scheduled',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Contributions Table
    await client.query(`
      CREATE TABLE IF NOT EXISTS contributions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        group_id UUID REFERENCES groups(id) ON DELETE CASCADE,
        user_email VARCHAR(255) REFERENCES users(email) ON DELETE CASCADE,
        amount NUMERIC(15, 2) NOT NULL,
        date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Transactions Table
    await client.query(`
      CREATE TABLE IF NOT EXISTS transactions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        wallet_id UUID REFERENCES wallets(id) ON DELETE CASCADE,
        group_id UUID REFERENCES groups(id) ON DELETE SET NULL,
        user_email VARCHAR(255) REFERENCES users(email) ON DELETE CASCADE,
        type VARCHAR(50) NOT NULL,
        amount NUMERIC(15, 2) NOT NULL,
        date VARCHAR(100) NOT NULL,
        status VARCHAR(50) DEFAULT 'Completed',
        reference VARCHAR(100) UNIQUE NOT NULL,
        payment_method VARCHAR(50) DEFAULT 'M-Pesa',
        timestamp BIGINT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
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
        group_id UUID REFERENCES groups(id) ON DELETE CASCADE,
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
        status VARCHAR(50) DEFAULT 'Pending',
        timestamp BIGINT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
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
        group_id UUID REFERENCES groups(id) ON DELETE CASCADE,
        user_email VARCHAR(255) REFERENCES users(email) ON DELETE CASCADE,
        action VARCHAR(255) NOT NULL,
        details TEXT NOT NULL,
        ip_address VARCHAR(50) DEFAULT NULL,
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Announcements Table
    await client.query(`
      CREATE TABLE IF NOT EXISTS announcements (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        group_id UUID REFERENCES groups(id) ON DELETE CASCADE,
        title VARCHAR(255) NOT NULL,
        content TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Approval Queue Table
    await client.query(`
      CREATE TABLE IF NOT EXISTS approval_queue (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        group_id UUID REFERENCES groups(id) ON DELETE CASCADE,
        requested_by VARCHAR(255) REFERENCES users(email) ON DELETE CASCADE,
        approval_type VARCHAR(50) NOT NULL, -- Loan, JoinRequest, Withdrawal, KYC, Contribution
        status VARCHAR(20) DEFAULT 'Pending', -- Pending, Approved, Rejected
        data JSONB DEFAULT '{}',
        reviewed_by VARCHAR(255) REFERENCES users(email) ON DELETE SET NULL,
        review_notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        reviewed_at TIMESTAMP
      )
    `);

    console.log("All tables created successfully.");

    // Seed default chama groups
    const seedGroups = [
      {
        id_code: "PL-GRP-000001",
        name: "Eldoret Investors Circle",
        description: "Cooperative investment club for Eldoret agribusiness owners and tech leaders.",
        invite_code: "CHAMA-E7F92D",
        category: "Investment Club",
        contribution_amount: 15.00,
        contribution_frequency: "Monthly",
        loan_interest_rate: 7.50,
        voting_threshold: 60,
        vault_address: "0x1234567890abcdef1234567890abcdef12345678"
      },
      {
        id_code: "PL-GRP-000002",
        name: "Family Welfare Association",
        description: "Savings pool and welfare group supporting families in Uasin Gishu county.",
        invite_code: "CHAMA-F1A2B3",
        category: "Welfare Group",
        contribution_amount: 5.00,
        contribution_frequency: "Weekly",
        loan_interest_rate: 5.00,
        voting_threshold: 50,
        vault_address: "0xabcdef1234567890abcdef1234567890abcdef12"
      },
      {
        id_code: "PL-GRP-000003",
        name: "Farmers SACCO",
        description: "Official digital co-operative and credit society for smallholder maize and wheat farmers.",
        invite_code: "CHAMA-C3D4E5",
        category: "SACCO",
        contribution_amount: 50.00,
        contribution_frequency: "Monthly",
        loan_interest_rate: 10.00,
        voting_threshold: 66,
        vault_address: "0x7890abcdef1234567890abcdef1234567890abcd"
      }
    ];

    const groupMap = {};
    for (const g of seedGroups) {
      const gCheck = await client.query("SELECT id FROM groups WHERE group_id_code = $1", [g.id_code]);
      if (gCheck.rowCount === 0) {
        const insertRes = await client.query(`
          INSERT INTO groups (group_id_code, name, description, invite_code, category, contribution_amount, contribution_frequency, loan_interest_rate, voting_threshold, vault_address) 
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
          RETURNING id
        `, [
          g.id_code, g.name, g.description, g.invite_code, g.category, g.contribution_amount, g.contribution_frequency, g.loan_interest_rate, g.voting_threshold, g.vault_address
        ]);
        groupMap[g.id_code] = insertRes.rows[0].id;
        console.log(`Seeded group: ${g.name}`);
      } else {
        groupMap[g.id_code] = gCheck.rows[0].id;
      }
    }

    // Seed default users if they don't exist
    const seedUsers = [
      {
        user_id_code: "PL-USER-000001",
        email: "treasurer@chama.org",
        name: "Treasurer (Admin)",
        phone: "+254 701 555 444",
        pin: "123456",
        handle: "treasurer",
        wallet_address: "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
        avatar: "👤",
        gender: "Male",
        marital_status: "Single",
        credit_score: 910,
        reputation_score: 910,
        bio: "Group administrator and treasurer.",
        occupation: "Accountant",
        dob: "05 Jan 1992",
        county: "Uasin Gishu",
        wallets: [
          { balance: 98450.00, savings: 210000.00, active_loan: 0.00, loop_points: 1250, wallet_type: "PayLoop Wallet" },
          { balance: 25000.00, savings: 0.00, active_loan: 0.00, loop_points: 0, wallet_type: "M-Pesa", wallet_address: "+254 701 555 444" },
          { balance: 1.54, savings: 0.00, active_loan: 0.00, loop_points: 0, wallet_type: "MetaMask", wallet_address: "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266" }
        ],
        groups: [
          { code: "PL-GRP-000001", role: "Admin" },
          { code: "PL-GRP-000002", role: "Member" }
        ]
      },
      {
        user_id_code: "PL-USER-000002",
        email: "johnkamau@gmail.com",
        name: "John Kamau",
        phone: "+254 712 345 678",
        pin: "123456",
        handle: "johnkamau",
        wallet_address: "0x90F79bf6EB2c4f870365E785982E1f101E93b906",
        avatar: "👨‍🌾",
        gender: "Male",
        marital_status: "Married",
        credit_score: 785,
        reputation_score: 785,
        bio: "Entrepreneur and chama member passionate about financial freedom.",
        occupation: "Business Owner",
        dob: "12 Aug 1990",
        county: "Uasin Gishu",
        wallets: [
          { balance: 25450.75, savings: 125450.75, active_loan: 15000.00, loop_points: 450, wallet_type: "PayLoop Wallet" },
          { balance: 4200.00, savings: 0.00, active_loan: 0.00, loop_points: 0, wallet_type: "M-Pesa", wallet_address: "+254 712 345 678" }
        ],
        groups: [
          { code: "PL-GRP-000001", role: "Member" },
          { code: "PL-GRP-000003", role: "Member" }
        ]
      },
      {
        user_id_code: "PL-USER-000003",
        email: "wanjiku@savers.ke",
        name: "Mary Wanjiku",
        phone: "+254 722 111 222",
        pin: "123456",
        handle: "wanjiku",
        wallet_address: "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC",
        avatar: "👩‍🌾",
        gender: "Female",
        marital_status: "Married",
        credit_score: 820,
        reputation_score: 820,
        bio: "Dedicated market vendor and savings circle leader.",
        occupation: "Retail Trader",
        dob: "14 May 1978",
        county: "Uasin Gishu",
        wallets: [
          { balance: 12450.00, savings: 85200.00, active_loan: 0.00, loop_points: 980, wallet_type: "PayLoop Wallet" },
          { balance: 1500.00, savings: 0.00, active_loan: 0.00, loop_points: 0, wallet_type: "M-Pesa", wallet_address: "+254 722 111 222" }
        ],
        groups: [
          { code: "PL-GRP-000001", role: "Member" },
          { code: "PL-GRP-000002", role: "Admin" }
        ]
      }
    ];

    const bcrypt = require("bcryptjs");
    const hashedPassword = await bcrypt.hash("password123", 10);

    for (const u of seedUsers) {
      const uCheck = await client.query("SELECT 1 FROM users WHERE email = $1", [u.email]);
      if (uCheck.rowCount === 0) {
        console.log(`Seeding user: ${u.name}`);
        await client.query(`
          INSERT INTO users (
            user_id_code, name, email, password, phone, pin, handle, wallet_address, avatar, gender, marital_status, credit_score, reputation_score, is_email_verified, is_phone_verified, verification_level, bio, occupation, dob, county
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, true, true, 'FULLY_VERIFIED', $14, $15, $16, $17)
        `, [
          u.user_id_code, u.name, u.email, hashedPassword, u.phone, u.pin, u.handle, u.wallet_address, u.avatar, u.gender, u.marital_status, u.credit_score, u.reputation_score, u.bio, u.occupation, u.dob, u.county
        ]);

        // Seed wallets
        for (const w of u.wallets) {
          await client.query(`
            INSERT INTO wallets (
              user_email, balance, savings, active_loan, loop_points, wallet_type, wallet_address
            ) VALUES ($1, $2, $3, $4, $5, $6, $7)
          `, [
            u.email, w.balance, w.savings, w.active_loan, w.loop_points, w.wallet_type, w.wallet_address || null
          ]);
        }

        // Seed group memberships
        for (const g of u.groups) {
          const groupId = groupMap[g.code];
          if (groupId) {
            await client.query(`
              INSERT INTO group_members (group_id, user_email, role) 
              VALUES ($1, $2, $3)
            `, [
              groupId, u.email, g.role
            ]);
            
            // Set group admin_email if role is Admin
            if (g.role === "Admin") {
              await client.query(`
                UPDATE groups 
                SET admin_email = $1 
                WHERE id = $2
              `, [u.email, groupId]);
            }
          }
        }
      }
    }

    // Seed default announcements
    const announcementsSeed = [
      { groupCode: "PL-GRP-000001", title: "Monthly AGM Meeting", content: "Our monthly AGM is scheduled for next Saturday at 2:00 PM at the Eldoret Hub. Attendance is compulsory for all members." },
      { groupCode: "PL-GRP-000001", title: "Contribution Deadline Extension", content: "Due to the bank system maintenance, this month's contribution deadline is extended by 3 days. Please make sure your PayLoop Wallet is funded." },
      { groupCode: "PL-GRP-000002", title: "Welfare Distribution", content: "We will be distributing school fees support this Friday. Please submit pending applications to Mary Wanjiku." }
    ];
    for (const a of announcementsSeed) {
      const gId = groupMap[a.groupCode];
      if (gId) {
        await client.query(`
          INSERT INTO announcements (group_id, title, content)
          VALUES ($1, $2, $3)
        `, [gId, a.title, a.content]);
      }
    }

    // Seed group financial rules for all groups
    for (const groupCode in groupMap) {
      const gId = groupMap[groupCode];
      await client.query(`
        INSERT INTO group_financial_rules (group_id, contribution_amount, late_penalty_rate, max_loan_multiplier, loan_interest_rate, emergency_fund_percent, max_withdrawal_percent, grace_period_days)
        VALUES ($1, 500.00, 5.00, 3.00, 10.00, 10.00, 80.00, 7)
        ON CONFLICT (group_id) DO NOTHING
      `, [gId]);
    }

    // Seed mock approvals in the queue
    const eldoretGroupId = groupMap["PL-GRP-000001"];
    if (eldoretGroupId) {
      // 1. Join request
      await client.query(`
        INSERT INTO approval_queue (group_id, requested_by, approval_type, status, data)
        VALUES ($1, 'johnkamau@gmail.com', 'JoinRequest', 'Pending', '{"name": "John Kamau", "email": "johnkamau@gmail.com", "phone": "+254 712 345 678"}')
      `, [eldoretGroupId]);

      // 2. Loan request
      await client.query(`
        INSERT INTO approval_queue (group_id, requested_by, approval_type, status, data)
        VALUES ($1, 'johnkamau@gmail.com', 'Loan', 'Pending', '{"amount": 20000.00, "duration": 3, "purpose": "Purchase fertilizer & seeds", "interest_rate": 10.00}')
      `, [eldoretGroupId]);

      // 3. KYC Document approval
      await client.query(`
        INSERT INTO approval_queue (group_id, requested_by, approval_type, status, data)
        VALUES ($1, 'wanjiku@savers.ke', 'KYC', 'Pending', '{"doc_type": "National_ID", "file_url": "https://payloop.example.com/kyc/wanjiku_id.jpg"}')
      `, [eldoretGroupId]);
      
      // Seed some meetings
      await client.query(`
        INSERT INTO group_meetings (group_id, created_by, title, agenda, meeting_date, location, meeting_type, status)
        VALUES ($1, 'treasurer@chama.org', 'Q2 Financial Review', 'Review Q2 performance, savings growth and check pending loans.', NOW() + INTERVAL '2 days', 'Eldoret Hub & Zoom', 'regular', 'scheduled')
      `, [eldoretGroupId]);

      await client.query(`
        INSERT INTO group_meetings (group_id, created_by, title, agenda, meeting_date, location, meeting_type, status, minutes)
        VALUES ($1, 'treasurer@chama.org', 'Emergency Committee Meeting', 'Discussions on late repayments and penalty waivers.', NOW() - INTERVAL '5 days', 'Zoom', 'emergency', 'completed', 'Decided to waive penalties for members affected by market delays.')
      `, [eldoretGroupId]);

      // Seed some polls
      await client.query(`
        INSERT INTO group_polls (group_id, created_by, title, description, poll_type, options, votes, quorum_percent, status, ends_at)
        VALUES ($1, 'treasurer@chama.org', 'Increase Weekly Contribution?', 'Proposal to raise weekly contributions from 500 to 750 to boost the loan pool.', 'amendment', '["Yes, 750 KES", "No, keep 500 KES", "Neutral"]', '{"Yes, 750 KES": 2, "No, keep 500 KES": 1}', 50, 'active', NOW() + INTERVAL '5 days')
      `, [eldoretGroupId]);

      await client.query(`
        INSERT INTO group_polls (group_id, created_by, title, description, poll_type, options, votes, quorum_percent, status, ends_at)
        VALUES ($1, 'treasurer@chama.org', 'Elect New Vice Chairman', 'Election for vice chairman post.', 'election', '["Mary Wanjiku", "John Kamau"]', '{"Mary Wanjiku": 3, "John Kamau": 1}', 66, 'closed', NOW() - INTERVAL '1 days')
      `, [eldoretGroupId]);
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
