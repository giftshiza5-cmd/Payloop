const express = require("express");
const db = require("../services/db");
const router = express.Router();

/**
 * @route POST /api/groups/create
 * @desc Create a new chama/group and assign creator as Admin
 */
router.post("/create", async (req, res) => {
  const { 
    name, description, category, maxMembers, contributionAmount, 
    contributionFrequency, loanInterestRate, votingThreshold, email, vaultAddress 
  } = req.body;

  if (!name || !email) {
    return res.status(400).json({ error: "Missing group name or creator email" });
  }

  const client = await db.pool.connect();
  try {
    await client.query("BEGIN");

    // Check if user exists
    const checkUser = await client.query("SELECT 1 FROM users WHERE email = $1", [email]);
    if (checkUser.rowCount === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({ error: "Creator user profile not found" });
    }

    // Generate unique serial group code
    const countRes = await client.query("SELECT COUNT(*) FROM groups");
    const nextNum = parseInt(countRes.rows[0].count) + 1;
    const groupIdCode = `PL-GRP-${nextNum.toString().padStart(6, "0")}`;

    // Generate unique invite code
    const inviteCode = `CHAMA-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

    // Insert group
    const insertGroup = `
      INSERT INTO groups (
        group_id_code, name, description, invite_code, admin_email, category, 
        max_members, contribution_amount, contribution_frequency, 
        loan_interest_rate, voting_threshold, vault_address
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      RETURNING *
    `;
    
    const groupRes = await client.query(insertGroup, [
      groupIdCode,
      name,
      description || "",
      inviteCode,
      email,
      category || "Chama",
      parseInt(maxMembers) || 100,
      parseFloat(contributionAmount) || 10.00,
      contributionFrequency || "Weekly",
      parseFloat(loanInterestRate) || 10.00,
      parseInt(votingThreshold) || 50,
      vaultAddress || null
    ]);

    const group = groupRes.rows[0];

    // Add creator as Admin in group members with full privileges
    const insertMember = `
      INSERT INTO group_members (group_id, user_email, role)
      VALUES ($1, $2, 'Admin')
    `;
    await client.query(insertMember, [group.id, email]);

    await client.query("COMMIT");

    // Define full admin privileges granted to the group creator
    const adminPrivileges = {
      canApproveLoans: true,
      canRejectLoans: true,
      canRemoveMembers: true,
      canPromoteMembers: true,
      canPostAnnouncements: true,
      canEditGroupSettings: true,
      canViewAllTransactions: true,
      canDisburseFunds: true,
      canSetContributionRules: true,
      canInviteMembers: true
    };

    res.status(201).json({
      success: true,
      message: "Group created successfully",
      group,
      role: "Admin",
      adminPrivileges,
      inviteCode: group.invite_code
    });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Create group failed:", error);
    res.status(500).json({ error: "Failed to create group", details: error.message });
  } finally {
    client.release();
  }
});

/**
 * @route POST /api/groups/join
 * @desc Join a group using invite code
 */
router.post("/join", async (req, res) => {
  const { inviteCode, email } = req.body;

  if (!inviteCode || !email) {
    return res.status(400).json({ error: "Missing invite code or user email" });
  }

  const client = await db.pool.connect();
  try {
    await client.query("BEGIN");

    // 1. Check if group exists
    const groupRes = await client.query(
      "SELECT * FROM groups WHERE invite_code = $1 OR group_id_code = $1", 
      [inviteCode.trim().toUpperCase()]
    );
    if (groupRes.rowCount === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({ error: "Group not found. Please verify the invitation code." });
    }

    const group = groupRes.rows[0];

    // 2. Check user profile
    const userRes = await client.query("SELECT 1 FROM users WHERE email = $1", [email]);
    if (userRes.rowCount === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({ error: "User profile not found" });
    }

    // 3. Check membership limit
    const memberCountRes = await client.query("SELECT COUNT(*) FROM group_members WHERE group_id = $1", [group.id]);
    const currentMembers = parseInt(memberCountRes.rows[0].count);
    if (currentMembers >= group.max_members) {
      await client.query("ROLLBACK");
      return res.status(400).json({ error: "This group has reached its maximum capacity of members." });
    }

    // 4. Check if already a member
    const memberCheck = await client.query(
      "SELECT 1 FROM group_members WHERE group_id = $1 AND user_email = $2", 
      [group.id, email]
    );
    if (memberCheck.rowCount > 0) {
      await client.query("ROLLBACK");
      return res.status(400).json({ error: "You are already a member of this group." });
    }

    // 5. Insert member
    const insertMember = `
      INSERT INTO group_members (group_id, user_email, role)
      VALUES ($1, $2, 'Member')
      RETURNING *
    `;
    await client.query(insertMember, [group.id, email]);

    await client.query("COMMIT");

    res.status(200).json({
      success: true,
      message: "Successfully joined group",
      group
    });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Join group failed:", error);
    res.status(500).json({ error: "Failed to join group", details: error.message });
  } finally {
    client.release();
  }
});

/**
 * @route GET /api/groups/my-groups
 * @desc Get list of groups user belongs to
 */
router.get("/my-groups", async (req, res) => {
  const { email } = req.query;

  if (!email) {
    return res.status(400).json({ error: "Missing email query parameter" });
  }

  try {
    const query = `
      SELECT g.*, gm.role, gm.joined_at,
             (SELECT COUNT(*) FROM group_members WHERE group_id = g.id) as members_count,
             (SELECT COALESCE(SUM(amount), 0) FROM contributions WHERE group_id = g.id) as group_savings
      FROM groups g
      JOIN group_members gm ON g.id = gm.group_id
      WHERE gm.user_email = $1
      ORDER BY gm.joined_at DESC
    `;
    const result = await db.query(query, [email]);
    
    const list = result.rows.map(row => ({
      ...row,
      contribution_amount: parseFloat(row.contribution_amount),
      loan_interest_rate: parseFloat(row.loan_interest_rate),
      group_savings: parseFloat(row.group_savings),
      members_count: parseInt(row.members_count)
    }));

    res.status(200).json(list);
  } catch (error) {
    console.error("My groups error:", error);
    res.status(500).json({ error: "Database query failed", details: error.message });
  }
});

/**
 * @route GET /api/groups/:groupId/dashboard
 * @desc Fetch statistics for a specific group
 */
router.get("/:groupId/dashboard", async (req, res) => {
  const { groupId } = req.params;
  const { email } = req.query; // to fetch user-specific role & contributions

  try {
    // 1. Get Group Core Specs
    const groupRes = await db.query("SELECT * FROM groups WHERE id = $1", [groupId]);
    if (groupRes.rowCount === 0) {
      return res.status(404).json({ error: "Group not found" });
    }
    const group = groupRes.rows[0];

    // 2. Fetch total members
    const memberCountRes = await db.query("SELECT COUNT(*) FROM group_members WHERE group_id = $1", [groupId]);
    const membersCount = parseInt(memberCountRes.rows[0].count);

    // 3. Fetch total group savings pool
    const savingsPoolRes = await db.query("SELECT COALESCE(SUM(amount), 0) as total FROM contributions WHERE group_id = $1", [groupId]);
    const groupSavings = parseFloat(savingsPoolRes.rows[0].total);

    // 4. Fetch active loans metrics
    const activeLoansRes = await db.query(
      "SELECT COUNT(*) as count, COALESCE(SUM(amount), 0) as total FROM loans WHERE group_id = $1 AND active = true",
      [groupId]
    );
    const activeLoansCount = parseInt(activeLoansRes.rows[0].count);
    const activeLoansTotal = parseFloat(activeLoansRes.rows[0].total);

    // 5. Fetch announcements
    const announcementsRes = await db.query(
      "SELECT * FROM announcements WHERE group_id = $1 ORDER BY created_at DESC LIMIT 5",
      [groupId]
    );
    const announcements = announcementsRes.rows;

    // 6. Fetch user's role and personal contribution in this group
    let userRole = "Member";
    let userSavingsInGroup = 0.0;
    if (email) {
      const gmCheck = await db.query(
        "SELECT role FROM group_members WHERE group_id = $1 AND user_email = $2",
        [groupId, email]
      );
      if (gmCheck.rowCount > 0) {
        userRole = gmCheck.rows[0].role;
      }
      
      const userSavingsRes = await db.query(
        "SELECT COALESCE(SUM(amount), 0) as total FROM contributions WHERE group_id = $1 AND user_email = $2",
        [groupId, email]
      );
      userSavingsInGroup = parseFloat(userSavingsRes.rows[0].total);
    }

    // 7. Calculate contribution progress (e.g. contribution relative to targeted pool: members * group.contribution_amount)
    const expectedTarget = membersCount * parseFloat(group.contribution_amount);
    const progressPct = expectedTarget > 0 ? Math.min(100, Math.round((groupSavings / expectedTarget) * 100)) : 0;

    res.status(200).json({
      group: {
        ...group,
        contribution_amount: parseFloat(group.contribution_amount),
        loan_interest_rate: parseFloat(group.loan_interest_rate)
      },
      userRole,
      metrics: {
        membersCount,
        groupSavings,
        activeLoansCount,
        activeLoansTotal,
        userSavingsInGroup,
        progressPct
      },
      announcements
    });
  } catch (error) {
    console.error("Group dashboard error:", error);
    res.status(500).json({ error: "Failed to load group dashboard", details: error.message });
  }
});

/**
 * @route GET /api/groups/:groupId/members
 * @desc Get list of all members in a group
 */
router.get("/:groupId/members", async (req, res) => {
  const { groupId } = req.params;

  try {
    const query = `
      SELECT u.name, u.email, u.phone, u.avatar, u.handle, u.credit_score, u.reputation_score,
             gm.role, gm.joined_at,
             (SELECT COALESCE(SUM(c.amount), 0) FROM contributions c WHERE c.group_id = $1 AND c.user_email = u.email) as member_savings
      FROM users u
      JOIN group_members gm ON u.email = gm.user_email
      WHERE gm.group_id = $1
      ORDER BY gm.role DESC, gm.joined_at ASC
    `;
    const result = await db.query(query, [groupId]);

    const list = result.rows.map(row => ({
      ...row,
      member_savings: parseFloat(row.member_savings),
      credit_score: parseInt(row.credit_score || row.reputation_score || 500)
    }));

    res.status(200).json(list);
  } catch (error) {
    console.error("Get group members failed:", error);
    res.status(500).json({ error: "Database query failed", details: error.message });
  }
});

/**
 * @route POST /api/groups/:groupId/announcements
 * @desc Create a new announcement for a group
 */
router.post("/:groupId/announcements", async (req, res) => {
  const { groupId } = req.params;
  const { title, content } = req.body;

  if (!title || !content) {
    return res.status(400).json({ error: "Title and content are required" });
  }

  try {
    const result = await db.query(
      "INSERT INTO announcements (group_id, title, content) VALUES ($1, $2, $3) RETURNING *",
      [groupId, title, content]
    );

    res.status(201).json({
      success: true,
      announcement: result.rows[0]
    });
  } catch (error) {
    console.error("Create announcement failed:", error);
    res.status(500).json({ error: "Database query failed", details: error.message });
  }
});

/**
 * @route POST /api/groups/:groupId/members/promote
 * @desc Promote a member to Admin role
 */
router.post("/:groupId/members/promote", async (req, res) => {
  const { groupId } = req.params;
  const { userEmail } = req.body;

  if (!userEmail) {
    return res.status(400).json({ error: "Missing member email" });
  }

  try {
    const result = await db.query(
      "UPDATE group_members SET role = 'Admin' WHERE group_id = $1 AND user_email = $2 RETURNING *",
      [groupId, userEmail]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Membership record not found" });
    }

    res.status(200).json({
      success: true,
      message: "Member promoted to Admin successfully"
    });
  } catch (error) {
    console.error("Promote member failed:", error);
    res.status(500).json({ error: "Database query failed", details: error.message });
  }
});

/**
 * @route POST /api/groups/:groupId/members/remove
 * @desc Remove a member from the group
 */
router.post("/:groupId/members/remove", async (req, res) => {
  const { groupId } = req.params;
  const { userEmail } = req.body;

  if (!userEmail) {
    return res.status(400).json({ error: "Missing member email" });
  }

  try {
    const result = await db.query(
      "DELETE FROM group_members WHERE group_id = $1 AND user_email = $2 RETURNING *",
      [groupId, userEmail]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Membership record not found" });
    }

    res.status(200).json({
      success: true,
      message: "Member removed from group successfully"
    });
  } catch (error) {
    console.error("Remove member failed:", error);
    res.status(500).json({ error: "Database query failed", details: error.message });
  }
});

module.exports = router;

/**
 * @route GET /api/groups/:groupId/admin-check
 * @desc Check if a user has Admin role in a group and return their full privileges
 */
router.get("/:groupId/admin-check", async (req, res) => {
  const { groupId } = req.params;
  const { email } = req.query;

  if (!email) {
    return res.status(400).json({ error: "Missing email query parameter" });
  }

  try {
    const roleRes = await db.query(
      "SELECT role FROM group_members WHERE group_id = $1 AND user_email = $2",
      [groupId, email]
    );

    if (roleRes.rowCount === 0) {
      return res.status(404).json({ error: "User is not a member of this group" });
    }

    const role = roleRes.rows[0].role;
    const isAdmin = role === "Admin";

    const adminPrivileges = isAdmin ? {
      canApproveLoans: true,
      canRejectLoans: true,
      canRemoveMembers: true,
      canPromoteMembers: true,
      canPostAnnouncements: true,
      canEditGroupSettings: true,
      canViewAllTransactions: true,
      canDisburseFunds: true,
      canSetContributionRules: true,
      canInviteMembers: true
    } : {
      canApproveLoans: false,
      canRejectLoans: false,
      canRemoveMembers: false,
      canPromoteMembers: false,
      canPostAnnouncements: false,
      canEditGroupSettings: false,
      canViewAllTransactions: false,
      canDisburseFunds: false,
      canSetContributionRules: false,
      canInviteMembers: true   // all members can invite
    };

    res.status(200).json({
      role,
      isAdmin,
      adminPrivileges
    });
  } catch (error) {
    console.error("Admin check error:", error);
    res.status(500).json({ error: "Database query failed", details: error.message });
  }
});

/**
 * @route POST /api/groups/:groupId/update-settings
 * @desc Admin-only: Update group settings (name, contribution amount, interest rate, etc.)
 */
router.post("/:groupId/update-settings", async (req, res) => {
  const { groupId } = req.params;
  const { adminEmail, name, description, contributionAmount, loanInterestRate, votingThreshold, maxMembers } = req.body;

  if (!adminEmail) {
    return res.status(400).json({ error: "Missing adminEmail" });
  }

  try {
    // Verify admin
    const roleRes = await db.query(
      "SELECT role FROM group_members WHERE group_id = $1 AND user_email = $2",
      [groupId, adminEmail]
    );

    if (roleRes.rowCount === 0 || roleRes.rows[0].role !== "Admin") {
      return res.status(403).json({ error: "Forbidden: Only group admins can update settings" });
    }

    const setClauses = [];
    const values = [];
    let idx = 1;

    if (name !== undefined) { setClauses.push(`name = $${idx++}`); values.push(name); }
    if (description !== undefined) { setClauses.push(`description = $${idx++}`); values.push(description); }
    if (contributionAmount !== undefined) { setClauses.push(`contribution_amount = $${idx++}`); values.push(parseFloat(contributionAmount)); }
    if (loanInterestRate !== undefined) { setClauses.push(`loan_interest_rate = $${idx++}`); values.push(parseFloat(loanInterestRate)); }
    if (votingThreshold !== undefined) { setClauses.push(`voting_threshold = $${idx++}`); values.push(parseInt(votingThreshold)); }
    if (maxMembers !== undefined) { setClauses.push(`max_members = $${idx++}`); values.push(parseInt(maxMembers)); }

    if (setClauses.length === 0) {
      return res.status(400).json({ error: "No settings provided to update" });
    }

    values.push(groupId);
    const updateRes = await db.query(
      `UPDATE groups SET ${setClauses.join(", ")} WHERE id = $${idx} RETURNING *`,
      values
    );

    res.status(200).json({
      success: true,
      message: "Group settings updated successfully",
      group: updateRes.rows[0]
    });
  } catch (error) {
    console.error("Update settings error:", error);
    res.status(500).json({ error: "Database query failed", details: error.message });
  }
});
