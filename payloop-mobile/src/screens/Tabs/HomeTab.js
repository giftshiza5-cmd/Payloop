import React from "react";
import {
  ScrollView,
  RefreshControl,
  View,
  Text,
  TouchableOpacity,
  Image,
  Share,
  Alert
} from "react-native";
import Svg, { Circle } from "react-native-svg";
import { useApp } from "../../context/AppContext";
import { styles } from "../../../styles";

export default function HomeTab() {
  const {
    selectedUser,
    isRefreshing,
    handleDashboardRefresh,
    isDashboardLoading,
    setCurrentScreen,
    setPhoneForVerification,
    setIsPhoneVerifiedState,
    setIsVerificationSmsSent,
    setVerificationSmsCode,
    setIdDocUri,
    setSelfieUri,
    setVerificationSuccess,
    setActiveSubScreen,
    currentGroupRole,
    currentGroup,
    formatValue,
    getCreditTier,
    KES_PER_USDC,
    setActiveTab,
    setLoansSubTab,
    handleRepayLoan,
    setShowQrScanner,
    savingsGoal,
    transactions,
    members,
    isDark,
    themeTextColor,
    t
  } = useApp();

  const tier = getCreditTier(selectedUser?.creditScore || 500);

  const renderSavingsCircleGauge = (progress = 0.78, label = "saved") => {
    const radius = 45;
    const circumference = Math.PI * 2 * radius;
    const strokeDashoffset = circumference * (1 - Math.min(1, Math.max(0, progress)));
    return (
      <View style={styles.savingsCircleGaugeBox}>
        <Svg width="110" height="110" viewBox="0 0 110 110">
          <Circle
            cx="55"
            cy="55"
            r={radius}
            stroke={isDark ? "#1F2937" : "#E5E7EB"}
            strokeWidth="8"
            fill="none"
          />
          <Circle
            cx="55"
            cy="55"
            r={radius}
            stroke="#0F9D58"
            strokeWidth="8"
            fill="none"
            strokeDasharray={`${circumference} ${circumference}`}
            strokeDashoffset={strokeDashoffset}
            transform="rotate(-90, 55, 55)"
            strokeLinecap="round"
          />
        </Svg>
        <View style={styles.savingsCircleTextOverlay}>
          <Text style={[styles.savingsCirclePercentage, { color: themeTextColor }]}>
            {Math.round(progress * 100)}%
          </Text>
          <Text style={styles.savingsCircleSub}>{label}</Text>
        </View>
      </View>
    );
  };

  const renderCreditScoreCircleGauge = (score, tierInfo) => {
    const radius = 45;
    const circumference = Math.PI * 2 * radius;
    const progress = Math.max(0, Math.min(1, (score - 300) / 700));
    const strokeDashoffset = circumference * (1 - progress);

    return (
      <View style={styles.savingsCircleGaugeBox}>
        <Svg width="110" height="110" viewBox="0 0 110 110">
          <Circle
            cx="55"
            cy="55"
            r={radius}
            stroke={isDark ? "#1F2937" : "#E5E7EB"}
            strokeWidth="8"
            fill="none"
          />
          <Circle
            cx="55"
            cy="55"
            r={radius}
            stroke={tierInfo.color}
            strokeWidth="8"
            fill="none"
            strokeDasharray={`${circumference} ${circumference}`}
            strokeDashoffset={strokeDashoffset}
            transform="rotate(-90, 55, 55)"
            strokeLinecap="round"
          />
        </Svg>
        <View style={styles.savingsCircleTextOverlay}>
          <Text style={[styles.savingsCirclePercentage, { color: themeTextColor, fontSize: 20, fontWeight: "900" }]}>{score}</Text>
          <Text style={[styles.savingsCircleSub, { color: tierInfo.color, fontWeight: "800", textTransform: "uppercase", fontSize: 8 }]}>{tierInfo.name}</Text>
        </View>
      </View>
    );
  };

  if (!selectedUser) return null;

  return (
    <ScrollView 
      style={styles.tabContentLight}
      contentContainerStyle={{ paddingBottom: 100 }}
      refreshControl={
        <RefreshControl
          refreshing={isRefreshing}
          onRefresh={handleDashboardRefresh}
          colors={["#0F9D58"]}
          tintColor="#0F9D58"
        />
      }
    >
      {/* Verification Warning Banner */}
      {selectedUser.verification_level !== "FULLY_VERIFIED" && (
        <View style={{
          backgroundColor: "#FEF3C7",
          marginHorizontal: 16,
          marginTop: 16,
          padding: 12,
          borderRadius: 12,
          borderWidth: 1,
          borderColor: "#F59E0B",
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between"
        }}>
          <View style={{ flex: 1, flexDirection: "row", alignItems: "center" }}>
            <Text style={{ fontSize: 18, marginRight: 8 }}>⚠️</Text>
            <Text style={{ color: "#78350F", fontSize: 12, fontWeight: "500", flex: 1 }}>
              {!selectedUser.is_email_verified 
                ? "Verify your email to secure your account and join group activities."
                : "Verify your identity (Level 2) to unlock borrowing and Chama loans."}
            </Text>
          </View>
          <TouchableOpacity 
            onPress={() => {
              if (!selectedUser.is_email_verified) {
                setCurrentScreen("emailVerification");
              } else {
                setPhoneForVerification(selectedUser.phone || "");
                setIsPhoneVerifiedState(selectedUser.is_phone_verified || false);
                setIsVerificationSmsSent(false);
                setVerificationSmsCode("");
                setIdDocUri(null);
                setSelfieUri(null);
                setVerificationSuccess(false);
                setActiveSubScreen("verifyIdentity");
              }
            }}
            style={{
              backgroundColor: "#D97706",
              paddingVertical: 6,
              paddingHorizontal: 10,
              borderRadius: 8
            }}
          >
            <Text style={{ color: "#FFFFFF", fontSize: 12, fontWeight: "bold" }}>Verify</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* 1. SAVINGS SUMMARY CARD */}
      <View style={styles.summaryCardForestGreen}>
        <View style={styles.summaryCardHeader}>
          <View>
            <Text style={styles.summaryCardLabel}>Total Savings Balance</Text>
            <Text style={styles.summaryCardValue}>{formatValue(selectedUser.savings)}</Text>
          </View>
          <View style={styles.summaryGrowthBadge}>
            <Text style={styles.summaryGrowthText}>▲ 12.5%</Text>
          </View>
        </View>

        <View style={styles.summaryCardDivider} />

        <View style={styles.summaryCardDetailsRow}>
          <View style={styles.summaryDetailCol}>
            <Text style={styles.summaryDetailLabel}>Wallet Balance</Text>
            <Text style={styles.summaryDetailValue}>{formatValue(selectedUser.balance)}</Text>
          </View>
          <View style={styles.summaryDetailCol}>
            <Text style={styles.summaryDetailLabel}>Cycle Progress</Text>
            <View style={styles.summaryProgressContainer}>
              <View style={styles.summaryProgressBarBg}>
                <View style={[styles.summaryProgressBarFill, { width: '78%' }]} />
              </View>
              <Text style={styles.summaryProgressText}>78%</Text>
            </View>
          </View>
          <View style={styles.summaryDetailColAlignEnd}>
            <Text style={styles.summaryDetailLabel}>Member Status</Text>
            <View style={styles.summaryStatusBadge}>
              <View style={styles.summaryStatusPulse} />
              <Text style={styles.summaryStatusText}>ACTIVE</Text>
            </View>
          </View>
        </View>
      </View>

      {/* ADMIN COMMAND CENTER — Only visible to Chama Admins */}
      {currentGroupRole === "Admin" && (
        <View style={{
          marginHorizontal: 16, marginTop: 16, borderRadius: 20, overflow: "hidden",
          borderWidth: 1.5, borderColor: "#0F9D58",
          shadowColor: "#0F9D58", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.18, shadowRadius: 12, elevation: 6
        }}>
          {/* Header gradient bar */}
          <View style={{ backgroundColor: "#0F9D58", padding: 14, flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
              <Text style={{ fontSize: 22 }}>👑</Text>
              <View>
                <Text style={{ color: "#FFF", fontWeight: "900", fontSize: 15, letterSpacing: -0.3 }}>Admin Command Center</Text>
                <Text style={{ color: "rgba(255,255,255,0.8)", fontSize: 11 }}>You are the Group Administrator — full access</Text>
              </View>
            </View>
            <View style={{ backgroundColor: "rgba(255,255,255,0.2)", borderRadius: 10, paddingHorizontal: 10, paddingVertical: 4 }}>
              <Text style={{ color: "#FFF", fontSize: 10, fontWeight: "800" }}>ADMIN</Text>
            </View>
          </View>

          {/* Admin quick actions */}
          <View style={{ backgroundColor: isDark ? "#0D2818" : "#F0FDF4", padding: 14, gap: 10 }}>
            <View style={{ flexDirection: "row", gap: 8 }}>
              <TouchableOpacity
                onPress={() => {
                  if (currentGroup) {
                    setActiveSubScreen("adminApprovals");
                  } else {
                    Alert.alert("No Group", "Please select a group first.");
                  }
                }}
                style={{ flex: 1, backgroundColor: isDark ? "#1A3D2B" : "#DCFCE7", borderRadius: 12, padding: 12, alignItems: "center", borderWidth: 1, borderColor: "#16A34A" }}
              >
                <Text style={{ fontSize: 20, marginBottom: 4 }}>✅</Text>
                <Text style={{ color: "#15803D", fontWeight: "700", fontSize: 11, textAlign: "center" }}>Approve Center</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => {
                  if (currentGroup) {
                    setActiveSubScreen("adminMemberManagement");
                  } else {
                    Alert.alert("No Group", "Please select a group first.");
                  }
                }}
                style={{ flex: 1, backgroundColor: isDark ? "#1E1B4B" : "#EDE9FE", borderRadius: 12, padding: 12, alignItems: "center", borderWidth: 1, borderColor: "#7C3AED" }}
              >
                <Text style={{ fontSize: 20, marginBottom: 4 }}>👥</Text>
                <Text style={{ color: "#6D28D9", fontWeight: "700", fontSize: 11, textAlign: "center" }}>Manage Members</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => {
                  if (currentGroup) {
                    setActiveSubScreen("adminCommunication");
                  } else {
                    Alert.alert("No Group", "Please select a group first.");
                  }
                }}
                style={{ flex: 1, backgroundColor: isDark ? "#1C1917" : "#FEF9C3", borderRadius: 12, padding: 12, alignItems: "center", borderWidth: 1, borderColor: "#CA8A04" }}
              >
                <Text style={{ fontSize: 20, marginBottom: 4 }}>📢</Text>
                <Text style={{ color: "#92400E", fontWeight: "700", fontSize: 11, textAlign: "center" }}>Announce</Text>
              </TouchableOpacity>
            </View>

            {/* Invite code share row */}
            {currentGroup?.invite_code && (
              <TouchableOpacity
                onPress={() => {
                  Share.share({
                    message: `Join my Chama "${currentGroup.name}" on PayLoop!\n\nUse invite code: ${currentGroup.invite_code}\n\nDownload PayLoop and enter this code during signup.`
                  });
                }}
                style={{
                  flexDirection: "row", alignItems: "center", justifyContent: "space-between",
                  backgroundColor: isDark ? "#0F2027" : "#EFF6FF",
                  borderRadius: 12, padding: 12, borderWidth: 1, borderColor: "#3B82F6"
                }}
              >
                <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                  <Text style={{ fontSize: 18 }}>🔗</Text>
                  <View>
                    <Text style={{ color: isDark ? "#93C5FD" : "#1D4ED8", fontWeight: "700", fontSize: 12 }}>Share Invite Code</Text>
                    <Text style={{ color: isDark ? "#60A5FA" : "#3B82F6", fontSize: 13, fontWeight: "900", letterSpacing: 2, marginTop: 1 }}>
                      {currentGroup.invite_code}
                    </Text>
                  </View>
                </View>
                <Text style={{ color: "#3B82F6", fontSize: 20 }}>↗</Text>
              </TouchableOpacity>
            )}

            {/* Admin privileges summary */}
            <View style={{ marginTop: 4 }}>
              <Text style={{ color: isDark ? "#6EE7B7" : "#065F46", fontWeight: "700", fontSize: 11, marginBottom: 6 }}>YOUR ADMIN PRIVILEGES</Text>
              <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6 }}>
                {[
                  { label: "Approve Loans", icon: "✅" },
                  { label: "Reject Loans", icon: "❌" },
                  { label: "Remove Members", icon: "🚫" },
                  { label: "Promote Members", icon: "⬆️" },
                  { label: "Post Announcements", icon: "📢" },
                  { label: "Edit Group Settings", icon: "⚙️" },
                  { label: "View All Transactions", icon: "📊" },
                  { label: "Disburse Funds", icon: "💰" },
                  { label: "Set Contribution Rules", icon: "📋" },
                  { label: "Invite Members", icon: "🤝" }
                ].map((priv) => (
                  <View key={priv.label} style={{
                    flexDirection: "row", alignItems: "center", gap: 4,
                    backgroundColor: isDark ? "rgba(15,157,88,0.12)" : "#DCFCE7",
                    borderRadius: 20, paddingHorizontal: 8, paddingVertical: 3,
                    borderWidth: 1, borderColor: "rgba(15,157,88,0.3)"
                  }}>
                    <Text style={{ fontSize: 10 }}>{priv.icon}</Text>
                    <Text style={{ color: "#0F9D58", fontSize: 9, fontWeight: "700" }}>{priv.label}</Text>
                  </View>
                ))}
              </View>
            </View>
          </View>
        </View>
      )}

      {/* 2. QUICK ACTIONS GRID (2 Columns) */}
      <View style={styles.quickActionsContainer}>
        <Text style={styles.homeSectionTitle}>Quick Services</Text>
        <View style={styles.quickActionsGrid}>
          
          <TouchableOpacity onPress={() => setActiveSubScreen("contribute")} style={styles.quickActionCard}>
            <View style={[styles.actionIconWrapper, { backgroundColor: 'rgba(15, 157, 88, 0.08)' }]}>
              <Text style={styles.actionIconEmoji}>💸</Text>
            </View>
            <View style={styles.actionTextCol}>
              <Text style={styles.actionTitle}>Contribute</Text>
              <Text style={styles.actionSubtitle}>Save to chama</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => { setActiveTab("loans"); setLoansSubTab("request"); }} style={styles.quickActionCard}>
            <View style={[styles.actionIconWrapper, { backgroundColor: 'rgba(13, 148, 136, 0.08)' }]}>
              <Text style={styles.actionIconEmoji}>🤝</Text>
            </View>
            <View style={styles.actionTextCol}>
              <Text style={styles.actionTitle}>Request Loan</Text>
              <Text style={styles.actionSubtitle}>Borrow funds</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity 
            onPress={() => {
              if (selectedUser.activeLoan > 0) {
                handleRepayLoan(0);
              } else {
                Alert.alert("No Loan", "You don't have any outstanding loans to repay.");
              }
            }} 
            style={styles.quickActionCard}
          >
            <View style={[styles.actionIconWrapper, { backgroundColor: 'rgba(219, 39, 119, 0.08)' }]}>
              <Text style={styles.actionIconEmoji}>💳</Text>
            </View>
            <View style={styles.actionTextCol}>
              <Text style={styles.actionTitle}>Repay Loan</Text>
              <Text style={styles.actionSubtitle}>Pay balance</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity 
            onPress={() => {
              Alert.alert(
                "Wallet Identity", 
                `Address:\n${selectedUser.address}\n\nNetwork: Polygon Amoy\nStatus: Connected ✅`,
                [
                  { text: "Copy Address", onPress: () => Share.share({ message: selectedUser.address }) },
                  { text: "Close", style: "cancel" }
                ]
              );
            }} 
            style={styles.quickActionCard}
          >
            <View style={[styles.actionIconWrapper, { backgroundColor: 'rgba(79, 70, 229, 0.08)' }]}>
              <Text style={styles.actionIconEmoji}>💼</Text>
            </View>
            <View style={styles.actionTextCol}>
              <Text style={styles.actionTitle}>View Wallet</Text>
              <Text style={styles.actionSubtitle}>Manage Web3</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => setActiveSubScreen("transactions")} style={styles.quickActionCard}>
            <View style={[styles.actionIconWrapper, { backgroundColor: 'rgba(217, 119, 6, 0.08)' }]}>
              <Text style={styles.actionIconEmoji}>🧾</Text>
            </View>
            <View style={styles.actionTextCol}>
              <Text style={styles.actionTitle}>Receipts</Text>
              <Text style={styles.actionSubtitle}>Get history</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => setShowQrScanner(true)} style={styles.quickActionCard}>
            <View style={[styles.actionIconWrapper, { backgroundColor: 'rgba(107, 114, 128, 0.08)' }]}>
              <Text style={styles.actionIconEmoji}>📷</Text>
            </View>
            <View style={styles.actionTextCol}>
              <Text style={styles.actionTitle}>Scan QR</Text>
              <Text style={styles.actionSubtitle}>Scan to verify</Text>
            </View>
          </TouchableOpacity>

        </View>
      </View>

      {/* 3. CREDITLOOP SCORE CARD */}
      <View style={styles.creditLoopCard}>
        <Text style={styles.homeSectionTitle}>CreditLoop Reputation</Text>
        <View style={styles.creditScoreContentBox}>
          {renderCreditScoreCircleGauge(selectedUser.creditScore, tier)}

          <View style={styles.creditScoreDetailsCol}>
            <View style={styles.scoreLevelRow}>
              <Text style={styles.scoreRatingLabel}>Rating:</Text>
              <Text style={[styles.scoreRatingValue, { color: tier.color }]}>
                {selectedUser.creditScore >= 800 ? "Excellent" : selectedUser.creditScore >= 650 ? "Good" : selectedUser.creditScore >= 400 ? "Fair" : "Risk"}
              </Text>
            </View>
            <View style={styles.scoreTrendRow}>
              <Text style={styles.scoreTrendText}>▲ +15 pts this cycle</Text>
            </View>
            <Text style={styles.scoreTipMessage}>
              💡 Every timely contribution increases your score and lowers borrowing rates.
            </Text>
          </View>
        </View>
      </View>

      {/* 4. CONTRIBUTION TRACKER WIDGET */}
      <View style={styles.trackerContainer}>
        <Text style={styles.homeSectionTitle}>Contribution Tracker</Text>
        
        {selectedUser.savings === 0 ? (
          <View style={[styles.trackerCard, styles.trackerOverdueCard]}>
            <View style={styles.trackerHeaderRow}>
              <View style={styles.trackerTitleCol}>
                <Text style={[styles.trackerCardLabel, { color: '#DC2626' }]}>WEEKLY CHAMA CONTRIBUTION</Text>
                <Text style={styles.trackerAmount}>{formatValue(100)}</Text>
              </View>
              <View style={styles.warningBadge}>
                <Text style={styles.warningBadgeText}>⚠️ OVERDUE</Text>
              </View>
            </View>
            <Text style={styles.trackerDueDateText}>Was due on: 8 May 2024 (2 days ago)</Text>
            <View style={[styles.trackerProgressBarBg, { backgroundColor: '#FCA5A5' }]}>
              <View style={[styles.trackerProgressBarFill, { width: '0%', backgroundColor: '#EF4444' }]} />
            </View>
            <Text style={[styles.trackerStatusDescText, { color: '#B91C1C' }]}>
              ⚠️ Your account reputation score is currently frozen. Pay now to unfreeze.
            </Text>
          </View>
        ) : (
          <View style={styles.trackerCard}>
            <View style={styles.trackerHeaderRow}>
              <View style={styles.trackerTitleCol}>
                <Text style={styles.trackerCardLabel}>WEEKLY CHAMA CONTRIBUTION</Text>
                <Text style={styles.trackerAmount}>{formatValue(100)}</Text>
              </View>
              <View style={styles.onTimeBadge}>
                <Text style={styles.onTimeBadgeText}>ON TRACK</Text>
              </View>
            </View>
            <Text style={styles.trackerDueDateText}>Due: 15 June 2026 (5 days remaining)</Text>
            <View style={styles.trackerProgressBarBg}>
              <View style={[styles.trackerProgressBarFill, { width: '78%' }]} />
            </View>
            <Text style={styles.trackerStatusDescText}>
              🟢 Chama collected 7,800 USDC of 10,000 USDC target (78% complete)
            </Text>
          </View>
        )}
      </View>

      {/* 5. ACTIVE LOAN OVERVIEW */}
      <View style={styles.activeLoanContainer}>
        <Text style={styles.homeSectionTitle}>Active Loan Status</Text>
        
        {selectedUser.activeLoan > 0 ? (
          <View style={styles.loanStatusCard}>
            <View style={styles.loanHeaderRow}>
              <View>
                <Text style={styles.loanCardLabel}>OUTSTANDING BALANCE</Text>
                <Text style={styles.loanBalanceText}>{formatValue(selectedUser.activeLoan)}</Text>
              </View>
              <View style={styles.loanRepayProgressBadge}>
                <Text style={styles.loanRepayProgressText}>16.6% Repaid</Text>
              </View>
            </View>

            <Text style={styles.loanDueDateText}>Next payment: 28 May 2024 • Interest Rate: {tier.rate}%</Text>
            
            <View style={styles.loanProgressBarOuter}>
              <View style={[styles.loanProgressBarInner, { width: '16.6%' }]} />
            </View>

            <View style={styles.loanActionsRowDashboard}>
              <TouchableOpacity onPress={() => handleRepayLoan(0)} style={styles.loanDashboardRepayBtn}>
                <Text style={styles.loanDashboardRepayBtnText}>Repay Installment</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <View style={styles.noLoanStatusCard}>
            <Text style={styles.noLoanCardHeader}>No Active Loans</Text>
            <Text style={styles.noLoanCardMessage}>
              Based on your {tier.badge} credit tier, you are currently pre-approved for loans up to **{formatValue(25000 / KES_PER_USDC)}** at a premium rate of only **{tier.rate}% p.a.**
            </Text>
            <TouchableOpacity 
              onPress={() => { setActiveTab("loans"); setLoansSubTab("request"); }} 
              style={styles.noLoanCardActionBtn}
            >
              <Text style={styles.noLoanCardActionBtnText}>Apply Now</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* 6. SAVINGS GOAL PROGRESS CARD */}
      <View style={styles.goalContainer}>
        <Text style={styles.homeSectionTitle}>Savings Target Goal</Text>
        {savingsGoal && (
          <View style={styles.goalCard}>
            <View style={styles.goalTopRow}>
              <View style={styles.goalTitleCol}>
                <Text style={styles.goalHeaderTitle}>{savingsGoal.title}</Text>
                <Text style={styles.goalStatsText}>
                  {formatValue(savingsGoal.current)} of {formatValue(savingsGoal.target)}
                </Text>
              </View>
              {renderSavingsCircleGauge(savingsGoal.current / savingsGoal.target, "saved")}
            </View>
            <View style={styles.goalBottomRow}>
              <Text style={styles.goalDeadlineText}>Est. Completion: {savingsGoal.deadline}</Text>
              <Text style={styles.goalMotivationalText}>🎯 Keep going! You are {Math.round((savingsGoal.current / savingsGoal.target) * 100)}% towards your target.</Text>
            </View>
          </View>
        )}
      </View>

      {/* 7. RECENT ACTIVITIES FEED */}
      <View style={styles.activityFeedContainer}>
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.homeSectionTitle}>Recent Activities</Text>
          <TouchableOpacity onPress={() => setActiveSubScreen("transactions")}>
            <Text style={styles.viewAllTextLink}>View All ›</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.activityListCard}>
          {transactions.slice(0, 3).map((item, idx) => (
            <View key={item.id || idx} style={styles.activityItemRow}>
              <View style={styles.activityIconBadge}>
                <Text style={styles.activityEmoji}>{item.type === "Contribution" ? "💸" : item.isIncome ? "📥" : "📤"}</Text>
              </View>
              <View style={styles.activityItemDetails}>
                <Text style={styles.activityTitle}>{item.type}</Text>
                <Text style={styles.activityDate}>{item.date.split(",")[0]}</Text>
              </View>
              <View style={styles.activityAmountCol}>
                <Text style={[styles.activityAmountVal, item.isIncome ? { color: '#0F9D58' } : { color: '#EF4444' }]}>
                  {item.isIncome ? "+" : "-"}{formatValue(Math.abs(item.amount))}
                </Text>
                <Text style={styles.activityStatus}>{item.status}</Text>
              </View>
            </View>
          ))}
        </View>
      </View>

      {/* 8. CHAMA INFO SECTION */}
      <View style={styles.groupInfoContainer}>
        <Text style={styles.homeSectionTitle}>Chama Circle Hub</Text>
        <View style={styles.groupInfoCard}>
          <View style={styles.groupInfoStatRow}>
            <View style={styles.groupStatBox}>
              <Text style={styles.groupStatEmoji}>👥</Text>
              <Text style={styles.groupStatVal}>{members.length} Members</Text>
              <Text style={styles.groupStatSub}>Active Circle</Text>
            </View>
            <View style={styles.groupStatBox}>
              <Text style={styles.groupStatEmoji}>📅</Text>
              <Text style={styles.groupStatVal}>15 May 2024</Text>
              <Text style={styles.groupStatSub}>Next Meeting</Text>
            </View>
            <View style={styles.groupStatBox}>
              <Text style={styles.groupStatEmoji}>🛡️</Text>
              <Text style={styles.groupStatVal}>Consensus</Text>
              <Text style={styles.groupStatSub}>Multi-Sig Active</Text>
            </View>
          </View>

          <View style={styles.groupAnnouncementTicker}>
            <Text style={styles.announcementEmoji}>📢</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.announcementTextTitle} numberOfLines={1}>
                Consensus Meeting reminder: 15 May at Eldoret Hub.
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* 9. DECENTRALIZED WALLET STATUS */}
      <View style={styles.walletWidgetContainer}>
        <Text style={styles.homeSectionTitle}>Decentralized Wallet Status</Text>
        <View style={styles.walletWidgetCard}>
          <View style={styles.walletWidgetHeader}>
            <Text style={styles.walletWidgetProviderText}>🦊 MetaMask Ledger Identity</Text>
            <View style={styles.walletWidgetStatusBadge}>
              <View style={styles.walletWidgetPulseDot} />
              <Text style={styles.walletWidgetStatusLabel}>CONNECTED</Text>
            </View>
          </View>

          <View style={styles.walletWidgetAddressBox}>
            <Text style={styles.walletWidgetAddressText}>{selectedUser.address}</Text>
          </View>

          <View style={styles.walletWidgetDetailsRow}>
            <Text style={styles.walletWidgetLabel}>Network: <Text style={styles.walletWidgetValue}>Polygon Amoy</Text></Text>
            <Text style={styles.walletWidgetLabel}>Status: <Text style={styles.walletWidgetValue}>Healthy</Text></Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}
