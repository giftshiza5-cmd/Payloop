import React from "react";
import {
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert
} from "react-native";
import { useApp } from "../../context/AppContext";
import { styles } from "../../../styles";

export default function LoansTab() {
  const {
    selectedUser,
    formatValue,
    getCreditTier,
    loans,
    loanHistoryFilter,
    setLoanHistoryFilter,
    requestAmount,
    setRequestAmount,
    requestDuration,
    setRequestDuration,
    requestPurpose,
    setRequestPurpose,
    requestNote,
    setRequestNote,
    currency,
    isDark,
    setPhoneForVerification,
    setIsPhoneVerifiedState,
    setIsVerificationSmsSent,
    setVerificationSmsCode,
    setIdDocUri,
    setSelfieUri,
    setVerificationSuccess,
    setActiveSubScreen,
    showLoanRequestModal,
    setShowLoanRequestModal,
    setPaymentMethod,
    handleRepayLoan,
    handleVoteOnLoan,
    launchDigitalReceipt,
    handleDisburseLoan,
    handleLoanRequestSubmit,
    KES_PER_USDC,
    themeBg,
    themeCardBg,
    themeBorderColor,
    themeTextColor,
    themeSubtitleColor,
    themeDividerColor
  } = useApp();

  const tier = getCreditTier(selectedUser?.creditScore || 500);
  const maxCapacity = Math.round((selectedUser?.savings || 0) * 3);
  const activeLoanAmount = selectedUser?.activeLoan || 0;
  const availableLimit = Math.max(0, maxCapacity - activeLoanAmount);

  let eligibilityStatus = "Limited";
  let eligibilityColor = "#CD7F32"; // Bronze
  if (selectedUser?.creditScore >= 800) {
    eligibilityStatus = "Excellent";
    eligibilityColor = "#0F9D58"; // Emerald
  } else if (selectedUser?.creditScore >= 650) {
    eligibilityStatus = "Good";
    eligibilityColor = "#D4AF37"; // Gold
  } else if (selectedUser?.creditScore >= 400) {
    eligibilityStatus = "Fair";
    eligibilityColor = "#718096"; // Silver
  }

  // Find if the user has an active loan in the list
  const userActiveLoan = loans.find(l => l.borrower === selectedUser?.name && l.active && l.approved && !l.repaid);
  
  // Loan History Filtering
  const filteredLoans = loans.filter(l => {
    if (loanHistoryFilter === "All") return true;
    if (loanHistoryFilter === "Active") return l.active && l.approved && !l.repaid;
    if (loanHistoryFilter === "Completed") return l.repaid;
    if (loanHistoryFilter === "Voting") return !l.approved && !l.repaid && l.votesFor < 2;
    if (loanHistoryFilter === "Approved") return l.approved && !l.active && !l.repaid;
    return true;
  });

  // Real-time monthly installment calculation for the request form modal
  const parsedRequestAmount = parseFloat(requestAmount) || 0;
  const monthlyInstallment = parsedRequestAmount > 0 
    ? (parsedRequestAmount * (1 + (tier.rate / 100)) / (parseInt(requestDuration) || 6))
    : 0;

  const renderConsensusTimeline = (proposal) => {
    let currentStep = 0;
    if (proposal.active && proposal.approved && !proposal.repaid) {
      currentStep = 4; // Disbursed
    } else if (proposal.approved) {
      currentStep = 3; // Approved
    } else if (proposal.votesFor >= 2) {
      currentStep = 3; // Approved (Mock threshold)
    } else {
      currentStep = 2; // Voting
    }

    const steps = [
      { label: "Submit", emoji: "📝" },
      { label: "Review", emoji: "🔍" },
      { label: "Voting", emoji: "🗳️" },
      { label: "Approved", emoji: "✓" },
      { label: "Paid", emoji: "💸" }
    ];

    return (
      <View style={{ marginVertical: 16, padding: 12, borderRadius: 12, backgroundColor: isDark ? "#1E293B" : "#F3F4F6" }}>
        <Text style={{ fontSize: 11, fontWeight: "800", color: isDark ? "#94A3B8" : "#4B5563", marginBottom: 12, textTransform: "uppercase", letterSpacing: 0.5 }}>Governance Timeline</Text>
        <View style={{ flexDirection: "row", justifyContent: "space-between", position: "relative" }}>
          {/* Connecting line */}
          <View style={{
            position: "absolute", top: 12, left: 16, right: 16, height: 3,
            backgroundColor: isDark ? "#334155" : "#E2E8F0"
          }} />
          <View style={{
            position: "absolute", top: 12, left: 16,
            width: `${(currentStep / 4) * 88}%`,
            height: 3, backgroundColor: "#0F9D58"
          }} />

          {steps.map((st, idx) => {
            const isActive = idx <= currentStep;
            const isCurrent = idx === currentStep;
            return (
              <View key={st.label} style={{ alignItems: "center", zIndex: 2, flex: 1 }}>
                <View style={{
                  width: 26, height: 26, borderRadius: 13,
                  backgroundColor: isCurrent ? "#0F9D58" : isActive ? "rgba(15,157,88,0.2)" : isDark ? "#1F2937" : "#E5E7EB",
                  borderWidth: 2, borderColor: isActive ? "#0F9D58" : isDark ? "#374151" : "#D1D5DB",
                  alignItems: "center", justifyContent: "center"
                }}>
                  <Text style={{ fontSize: 10, color: isActive ? (isCurrent ? "#FFFFFF" : "#0F9D58") : "#9CA3AF" }}>{st.emoji}</Text>
                </View>
                <Text style={{ fontSize: 9, fontWeight: isCurrent ? "bold" : "normal", color: isActive ? "#0F9D58" : isDark ? "#64748B" : "#9CA3AF", marginTop: 4 }}>
                  {st.label}
                </Text>
              </View>
            );
          })}
        </View>
      </View>
    );
  };

  if (!selectedUser) return null;

  return (
    <ScrollView 
      style={[styles.tabContentLight, { backgroundColor: themeBg, paddingTop: 16 }]} 
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: 120 }}
    >
      {/* 1. LOAN OVERVIEW CARD */}
      <View style={[styles.loanOverviewCard, { backgroundColor: themeCardBg, borderWidth: 1, borderColor: themeBorderColor }]}>
        <View style={styles.loanOverviewTopRow}>
          <View>
            <Text style={[styles.loanOverviewLabel, { color: themeSubtitleColor }]}>Eligible Borrowing Capacity</Text>
            <Text style={[styles.loanOverviewValue, { color: themeTextColor }]}>{formatValue(maxCapacity)}</Text>
          </View>
          <View style={[styles.loanIndicatorBadge, { backgroundColor: eligibilityColor + "15" }]}>
            <Text style={[styles.loanIndicatorBadgeText, { color: eligibilityColor }]}>
              {eligibilityStatus}
            </Text>
          </View>
        </View>

        <View style={[styles.loanOverviewSeparator, { backgroundColor: themeDividerColor }]} />

        <View style={styles.loanOverviewStatsGrid}>
          <View style={styles.loanOverviewStatCol}>
            <Text style={[styles.loanOverviewStatLabel, { color: themeSubtitleColor }]}>Active Loan Balance</Text>
            <Text style={[styles.loanOverviewStatValue, { color: themeTextColor }]}>{formatValue(activeLoanAmount)}</Text>
          </View>
          <View style={styles.loanOverviewStatCol}>
            <Text style={[styles.loanOverviewStatLabel, { color: themeSubtitleColor }]}>Available Limit</Text>
            <Text style={[styles.loanOverviewStatValue, { color: "#0F9D58" }]}>
              {formatValue(availableLimit)}
            </Text>
          </View>
          <View style={styles.loanOverviewStatCol}>
            <Text style={[styles.loanOverviewStatLabel, { color: themeSubtitleColor }]}>CreditLoop Score</Text>
            <Text style={[styles.loanOverviewStatValue, { color: "#4F46E5" }]}>
              {selectedUser.creditScore}
            </Text>
          </View>
        </View>
      </View>

      {/* REQUEST LOAN QUICK SHORTCUT BUTTON */}
      {selectedUser.verification_level !== "FULLY_VERIFIED" ? (
        /* ── BLOCKED: user not verified ── */
        <View style={{
          marginHorizontal: 16,
          marginBottom: 16,
          backgroundColor: isDark ? "#1C1917" : "#FEF3C7",
          borderRadius: 14,
          padding: 16,
          borderWidth: 1,
          borderColor: "#F59E0B",
          flexDirection: "row",
          alignItems: "center",
          gap: 12
        }}>
          <Text style={{ fontSize: 28 }}>🔒</Text>
          <View style={{ flex: 1 }}>
            <Text style={{ color: isDark ? "#FCD34D" : "#92400E", fontWeight: "700", fontSize: 14, marginBottom: 3 }}>
              Identity Verification Required
            </Text>
            <Text style={{ color: isDark ? "#D97706" : "#78350F", fontSize: 12, lineHeight: 17 }}>
              Complete Level 2 verification to unlock borrowing and Chama loan requests.
            </Text>
            <TouchableOpacity
              onPress={() => {
                setPhoneForVerification(selectedUser.phone || "");
                setIsPhoneVerifiedState(selectedUser.is_phone_verified || false);
                setIsVerificationSmsSent(false);
                setVerificationSmsCode("");
                setIdDocUri(null);
                setSelfieUri(null);
                setVerificationSuccess(false);
                setActiveSubScreen("verifyIdentity");
              }}
              style={{
                marginTop: 10,
                backgroundColor: "#D97706",
                borderRadius: 8,
                paddingVertical: 9,
                alignItems: "center"
              }}
            >
              <Text style={{ color: "#FFF", fontWeight: "700", fontSize: 13 }}>🪪 Verify My Identity</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <TouchableOpacity
          onPress={() => {
            if (activeLoanAmount > 0) {
              Alert.alert("Active Loan Pending", "You already have an active loan. Please repay your current loan before applying for a new one.");
            } else {
              setShowLoanRequestModal(true);
            }
          }}
          style={styles.loanRequestBtnPrimary}
        >
          <Text style={styles.loanRequestBtnPrimaryText}>🤝 Request New Loan</Text>
        </TouchableOpacity>
      )}

      {/* 2. DYNAMIC LOAN STATUS SECTION */}
      {userActiveLoan ? (
        <View style={[styles.loanActiveStatusCard, { backgroundColor: themeCardBg, borderWidth: 1, borderColor: themeBorderColor }]}>
          <View style={styles.loanActiveHeaderRow}>
            <Text style={[styles.loanActiveTitle, { color: themeTextColor }]}>Active Loan Details</Text>
            <Text style={styles.loanActiveStatusBadge}>Outstanding</Text>
          </View>

          <View style={styles.loanActiveStatsGrid}>
            <View style={styles.loanActiveStatItem}>
              <Text style={[styles.loanActiveStatLabel, { color: themeSubtitleColor }]}>Approved Principal</Text>
              <Text style={[styles.loanActiveStatValue, { color: themeTextColor }]}>{formatValue(userActiveLoan.amount)}</Text>
            </View>
            <View style={styles.loanActiveStatItem}>
              <Text style={[styles.loanActiveStatLabel, { color: themeSubtitleColor }]}>Interest Rate</Text>
              <Text style={[styles.loanActiveStatValue, { color: themeTextColor }]}>{userActiveLoan.interestRate}% ({tier.name})</Text>
            </View>
            <View style={styles.loanActiveStatItem}>
              <Text style={[styles.loanActiveStatLabel, { color: themeSubtitleColor }]}>Term Length</Text>
              <Text style={[styles.loanActiveStatValue, { color: themeTextColor }]}>{userActiveLoan.duration} Months</Text>
            </View>
          </View>

          {/* Repayment Progress Tracker */}
          <View style={[styles.repaymentTrackerBox, { backgroundColor: isDark ? "#1F2937" : "#F3F4F6", borderColor: isDark ? "#374151" : "#E5E7EB" }]}>
            <View style={styles.repaymentTrackerHeader}>
              <Text style={[styles.repaymentTrackerLabel, { color: themeSubtitleColor }]}>Repayment Progress</Text>
              <Text style={[styles.repaymentTrackerPercent, { color: themeTextColor }]}>0% Repaid</Text>
            </View>
            <View style={[styles.repaymentProgressOuterBar, { backgroundColor: isDark ? "#374151" : "#E5E7EB" }]}>
              <View style={[styles.repaymentProgressInnerBar, { width: "0%" }]} />
            </View>
            <Text style={[styles.repaymentTrackerRemaining, { color: themeSubtitleColor }]}>
              Outstanding Balance: <Text style={{fontWeight: "bold", color: themeTextColor }}>{formatValue(userActiveLoan.amount * (1 + (userActiveLoan.interestRate / 100)))}</Text>
            </Text>
          </View>

          {/* Next Repayment Reminder */}
          <View style={[styles.nextRepayReminderBox, { backgroundColor: isDark ? "#1E1B4B" : "#F5F3FF", borderColor: "rgba(139, 92, 246, 0.3)" }]}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.repayReminderLabel, { color: isDark ? "#A78BFA" : "#6D28D9" }]}>Next Repayment Due</Text>
              <Text style={[styles.repayReminderDate, { color: isDark ? "#C4B5FD" : "#4C1D95" }]}>
                {new Date(userActiveLoan.repaymentDeadline * 1000).toLocaleDateString(undefined, {
                  day: 'numeric', month: 'short', year: 'numeric'
                })}
              </Text>
            </View>
            <View style={{ alignItems: "flex-end" }}>
              <Text style={styles.repayReminderAmountLabel}>Amount Due</Text>
              <Text style={styles.repayReminderAmount}>
                {formatValue((userActiveLoan.amount * (1 + (userActiveLoan.interestRate / 100))) / userActiveLoan.duration)}
              </Text>
            </View>
          </View>

          {/* QUICK REPAYMENT MODULE */}
          <View style={styles.quickRepayModuleBox}>
            <Text style={styles.quickRepayTitle}>Quick Repay Module</Text>
            <View style={styles.quickRepayBtnRow}>
              <TouchableOpacity
                onPress={() => {
                  setPaymentMethod("mpesa");
                  handleRepayLoan(userActiveLoan.id);
                }}
                style={styles.quickRepayMpesaBtn}
              >
                <Text style={styles.quickRepayMpesaText}>💸 Repay via M-Pesa</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => {
                  setPaymentMethod("metamask");
                  handleRepayLoan(userActiveLoan.id);
                }}
                style={styles.quickRepayWalletBtn}
              >
                <Text style={styles.quickRepayWalletText}>🦊 Repay via MetaMask</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      ) : (
        <View style={[styles.loanActiveEmptyCard, { backgroundColor: themeCardBg, borderWidth: 1, borderColor: themeBorderColor }]}>
          <Text style={styles.loanEmptyEmoji}>🎉</Text>
          <Text style={[styles.loanEmptyTitle, { color: themeTextColor }]}>No Active Loans</Text>
          <Text style={[styles.loanEmptyDesc, { color: themeSubtitleColor }]}>
            You currently have no active borrowings. You are pre-approved for up to {formatValue(maxCapacity)} at an interest rate of {tier.rate}% based on your {tier.name} credit tier.
          </Text>
        </View>
      )}

      {/* 3. LOAN ELIGIBILITY WIDGET */}
      <View style={[styles.eligibilityFactorsCard, { backgroundColor: themeCardBg, borderWidth: 1, borderColor: themeBorderColor }]}>
        <Text style={[styles.eligibilityFactorsTitle, { color: themeTextColor }]}>How Your Borrowing Limit is Calculated</Text>
        
        <View style={styles.eligibilityFactorItem}>
          <View style={[styles.factorDot, { backgroundColor: themeBorderColor }]} />
          <View style={{ flex: 1 }}>
            <Text style={[styles.factorLabel, { color: themeTextColor }]}>Chama Savings Multiplier</Text>
            <Text style={[styles.factorDesc, { color: themeSubtitleColor }]}>Chama policy allows borrowing up to 3x your total locked savings pool.</Text>
          </View>
          <Text style={styles.factorStatusOk}>3.0x Match</Text>
        </View>

        <View style={styles.eligibilityFactorItem}>
          <View style={[styles.factorDot, { backgroundColor: themeBorderColor }]} />
          <View style={{ flex: 1 }}>
            <Text style={[styles.factorLabel, { color: themeTextColor }]}>Contribution Consistency</Text>
            <Text style={[styles.factorDesc, { color: themeSubtitleColor }]}>Maintaining a 90%+ weekly chama deposit frequency raises limits.</Text>
          </View>
          <Text style={styles.factorStatusOk}>94% Freq</Text>
        </View>

        <View style={styles.eligibilityFactorItem}>
          <View style={[styles.factorDot, { backgroundColor: themeBorderColor }]} />
          <View style={{ flex: 1 }}>
            <Text style={[styles.factorLabel, { color: themeTextColor }]}>CreditLoop Score Status</Text>
            <Text style={[styles.factorDesc, { color: themeSubtitleColor }]}>A higher reputation score lowers interest rates and unlocks larger loans.</Text>
          </View>
          <Text style={[styles.factorStatusOk, { color: eligibilityColor }]}>{selectedUser.creditScore} ({tier.name})</Text>
        </View>
      </View>

      {/* 4. GROUP CONSENSUS VOTING TRACKER */}
      <View style={[styles.consensusVotingSectionCard, { backgroundColor: themeCardBg, borderColor: themeBorderColor, borderWidth: 1 }]}>
        <View style={{ borderLeftWidth: 4, borderLeftColor: "#3B82F6", paddingLeft: 8, marginBottom: 12 }}>
          <Text style={[styles.consensusSectionTitle, { color: themeTextColor, fontSize: 16, fontWeight: "800", marginBottom: 0 }]}>Chama Loan Governance (Consensus)</Text>
        </View>
        
        {loans.filter(l => !l.approved && !l.repaid && l.borrower !== selectedUser?.name).length === 0 ? (
          <Text style={[styles.consensusEmptyText, { color: themeSubtitleColor }]}>No active loan proposals are currently undergoing voting in your Chama circle.</Text>
        ) : (
          loans.filter(l => !l.approved && !l.repaid && l.borrower !== selectedUser?.name).map((proposal) => {
            const totalVotes = proposal.votesFor + proposal.votesAgainst;
            const consensusPct = totalVotes > 0 ? (proposal.votesFor / totalVotes) * 100 : 0;
            return (
              <View key={proposal.id} style={[styles.consensusProposalCard, { backgroundColor: themeCardBg, borderWidth: 1, borderColor: themeBorderColor }]}>
                <View style={styles.proposalHeader}>
                  <View>
                    <Text style={[styles.proposalBorrower, { color: themeTextColor }]}>{proposal.borrower}</Text>
                    <Text style={[styles.proposalMeta, { color: themeSubtitleColor }]}>{proposal.purpose} • {proposal.duration} Months</Text>
                  </View>
                  <Text style={[styles.proposalAmount, { color: themeTextColor }]}>{formatValue(proposal.amount)}</Text>
                </View>

                <View style={styles.consensusProgressBarRow}>
                  <View style={styles.consensusHeaderRow}>
                    <Text style={[styles.consensusLabel, { color: themeSubtitleColor }]}>Consensus Status</Text>
                    <Text style={[styles.consensusVotes, { color: themeTextColor }]}>+{proposal.votesFor} YES / -{proposal.votesAgainst} NO ({consensusPct.toFixed(0)}%)</Text>
                  </View>
                  <View style={[styles.consensusProgressOuterBar, { backgroundColor: isDark ? "#374151" : "#E5E7EB" }]}>
                    <View style={[styles.consensusProgressInnerBar, { width: `${consensusPct}%` }]} />
                  </View>
                  <Text style={[styles.consensusMinRequiredText, { color: themeSubtitleColor }]}>Requires minimum 60% YES votes to approve disbursement</Text>
                </View>

                {renderConsensusTimeline(proposal)}

                <View style={styles.proposalVoteActionsRow}>
                  <TouchableOpacity onPress={() => handleVoteOnLoan(proposal.id, true)} style={styles.voteYesButton}>
                    <Text style={styles.voteYesButtonText}>Vote YES</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => handleVoteOnLoan(proposal.id, false)} style={styles.voteNoButton}>
                    <Text style={styles.voteNoButtonText}>Vote NO</Text>
                  </TouchableOpacity>
                </View>
              </View>
            );
          })
        )}
      </View>

      {/* 5. LOAN HISTORY LIST & FILTERS */}
      <View style={[styles.loanHistoryContainer, { backgroundColor: themeCardBg, borderColor: themeBorderColor, borderWidth: 1 }]}>
        <View style={styles.loanHistoryHeaderRow}>
          <View style={{ borderLeftWidth: 4, borderLeftColor: "#8B5CF6", paddingLeft: 8 }}>
            <Text style={[styles.loanHistoryTitle, { color: themeTextColor, fontSize: 16, fontWeight: "800", marginBottom: 0 }]}>Loan History</Text>
          </View>
        </View>

        {/* History filter pills */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.historyFilterScrollPills}>
          {["All", "Active", "Completed", "Voting", "Approved"].map((status) => (
            <TouchableOpacity
              key={status}
              onPress={() => setLoanHistoryFilter(status)}
              style={[
                styles.historyFilterPill,
                loanHistoryFilter === status ? styles.historyFilterPillActive : null
              ]}
            >
              <Text style={[
                styles.historyFilterPillText,
                loanHistoryFilter === status ? styles.historyFilterPillActiveText : null
              ]}>
                {status}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Loans list */}
        {filteredLoans.length === 0 ? (
          <Text style={[styles.historyEmptyText, { color: themeSubtitleColor }]}>No loans matching the selected filter.</Text>
        ) : (
          filteredLoans.map((loan) => {
            const isOwnLoan = loan.borrower === selectedUser?.name;
            
            // Define status badge styling
            let statusLabel = "Voting";
            let statusBadgeStyle = styles.loanVotingStatusBadge;
            if (loan.repaid) {
              statusLabel = "Repaid";
              statusBadgeStyle = styles.loanRepaidStatusBadge;
            } else if (loan.repaymentDeadline > 0) {
              statusLabel = "Active";
              statusBadgeStyle = styles.loanActiveStatusBadge;
            } else if (loan.approved) {
              statusLabel = "Approved";
              statusBadgeStyle = styles.loanApprovedStatusBadge;
            }

            return (
              <TouchableOpacity
                key={loan.id}
                onPress={() => {
                  if (loan.repaid || loan.repaymentDeadline > 0) {
                    launchDigitalReceipt(
                      loan.repaid ? "Repaid Loan Receipt" : "Active Loan Principal",
                      loan.amount,
                      loan.borrower
                    );
                  }
                }}
                style={[styles.historyLoanRowItem, { backgroundColor: themeCardBg, borderWidth: 1, borderColor: themeBorderColor }]}
              >
                <View style={styles.historyRowTop}>
                  <View>
                    <Text style={[styles.historyLoanPurpose, { color: themeTextColor }]}>{loan.purpose}</Text>
                    <Text style={[styles.historyLoanBorrower, { color: themeSubtitleColor }]}>{isOwnLoan ? "You" : loan.borrower} • ID #{loan.id}</Text>
                  </View>
                  <Text style={statusBadgeStyle}>{statusLabel}</Text>
                </View>

                <View style={styles.historyRowBottom}>
                  <Text style={[styles.historyLoanAmount, { color: themeTextColor }]}>{formatValue(loan.amount)}</Text>
                  <Text style={[styles.historyLoanRate, { color: themeSubtitleColor }]}>{loan.interestRate}% Interest • {loan.duration} months</Text>
                </View>

                {/* Disbursement Action for Admin */}
                {loan.approved && loan.repaymentDeadline === 0 && (
                  <TouchableOpacity
                    onPress={() => handleDisburseLoan(loan.id)}
                    style={styles.historyDisburseActionBtn}
                  >
                    <Text style={styles.historyDisburseActionBtnText}>Disburse Funds</Text>
                  </TouchableOpacity>
                )}
              </TouchableOpacity>
            );
          })
        )}
      </View>

      {/* 6. CREDITLOOP IMPACT CARD */}
      <View style={[styles.creditImpactInfoCard, { backgroundColor: isDark ? "rgba(15, 157, 88, 0.1)" : "#ECFDF5", borderColor: "rgba(15, 157, 88, 0.3)", borderWidth: 1 }]}>
        <View style={{ borderLeftWidth: 4, borderLeftColor: "#10B981", paddingLeft: 8, marginBottom: 8 }}>
          <Text style={[styles.creditImpactTitle, { color: themeTextColor, fontSize: 15, fontWeight: "800", marginBottom: 0 }]}>CreditLoop Reputation Impact</Text>
        </View>
        <Text style={[styles.creditImpactDesc, { color: isDark ? "#A7F3D0" : "#065F46" }]}>
          Your CreditLoop score is the heart of your Chama reputation. Timely loan repayments increase your score by up to <Text style={{fontWeight: "bold", color: "#0F9D58"}}>+25 points</Text>, unlocking a lower interest rate tier. Overdue repayments will cause score penalties and reduced borrowing capacities.
        </Text>
      </View>

      {/* 7. FINANCIAL TIPS & RECOMMENDATIONS */}
      <View style={styles.tipsSectionContainer}>
        <View style={{ borderLeftWidth: 4, borderLeftColor: "#F59E0B", paddingLeft: 8, marginBottom: 12 }}>
          <Text style={[styles.tipsSectionTitle, { color: themeTextColor, fontSize: 16, fontWeight: "800", marginBottom: 0 }]}>Financial Tips & Advice</Text>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tipsScrollContainer}>
          <View style={[styles.tipCardItem, { backgroundColor: themeCardBg, borderWidth: 1, borderColor: themeBorderColor }]}>
            <Text style={styles.tipCardEmoji}>💡</Text>
            <Text style={[styles.tipCardTitle, { color: themeTextColor }]}>Smart Borrowing</Text>
            <Text style={[styles.tipCardBody, { color: themeSubtitleColor }]}>
              Only apply for credit that matches your business cashflows to prevent defaults.
            </Text>
          </View>
          <View style={[styles.tipCardItem, { backgroundColor: themeCardBg, borderWidth: 1, borderColor: themeBorderColor }]}>
            <Text style={styles.tipCardEmoji}>📈</Text>
            <Text style={[styles.tipCardTitle, { color: themeTextColor }]}>Unlock Lower Rates</Text>
            <Text style={[styles.tipCardBody, { color: themeSubtitleColor }]}>
              Consistently save to hit Platinum status and pay only 5% p.a.
            </Text>
          </View>
        </ScrollView>
      </View>

      {/* 8. LOAN APPLICATION MODAL */}
      <Modal visible={showLoanRequestModal} transparent animationType="slide">
        <View style={styles.loanModalOverlay}>
          <View style={styles.loanModalCard}>
            <View style={styles.loanModalHeader}>
              <Text style={styles.loanModalTitle}>Request a Loan</Text>
              <TouchableOpacity onPress={() => setShowLoanRequestModal(false)} style={styles.loanModalCloseBtn}>
                <Text style={styles.loanModalCloseBtnText}>✕</Text>
              </TouchableOpacity>
            </View>

            <View style={[styles.loanModalBody, { backgroundColor: isDark ? "#111827" : "#FFFFFF" }]}>
              <Text style={[styles.loanInputLabelField, { color: isDark ? "#D1D5DB" : "#4B5563" }]}>Loan Amount in {currency}</Text>
              <View style={[styles.loanAmountInputContainer, { backgroundColor: isDark ? "#1F2937" : "#F3F4F6", borderColor: isDark ? "#374151" : "#E5E7EB" }]}>
                <TextInput
                  style={[styles.loanAmountTextInputField, { color: isDark ? "#FFFFFF" : "#111827" }]}
                  keyboardType="numeric"
                  value={requestAmount}
                  onChangeText={setRequestAmount}
                  placeholder="0.00"
                  placeholderTextColor="#9CA3AF"
                />
                <Text style={[styles.loanAmountCurrencyBadge, { color: isDark ? "#9CA3AF" : "#6B7280" }]}>{currency}</Text>
              </View>
              
              {parsedRequestAmount > availableLimit && (
                <Text style={styles.loanLimitErrorLabel}>
                  ⚠️ Amount exceeds your available limit of {formatValue(availableLimit)}
                </Text>
              )}
              <Text style={styles.loanLimitWarningLabel}>
                Available limit: {formatValue(availableLimit)}
              </Text>

              <Text style={[styles.loanInputLabelField, { color: isDark ? "#D1D5DB" : "#4B5563" }]}>Purpose of Loan</Text>
              <View style={styles.dropdownSelectorBox}>
                {["Business", "Education", "Medical", "Agriculture"].map((p) => (
                  <TouchableOpacity
                    key={p}
                    onPress={() => setRequestPurpose(p)}
                    style={[
                      styles.purposePillOption,
                      requestPurpose === p ? styles.purposePillOptionActive : null
                    ]}
                  >
                    <Text style={[styles.purposePillText, requestPurpose === p ? styles.purposePillTextActive : null]}>
                      {p}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={[styles.loanInputLabelField, { color: isDark ? "#D1D5DB" : "#4B5563" }]}>Repayment Period</Text>
              <View style={styles.dropdownSelectorBox}>
                {["3 months", "6 months", "12 months"].map((dur) => (
                  <TouchableOpacity
                    key={dur}
                    onPress={() => setRequestDuration(dur)}
                    style={[
                      styles.purposePillOption,
                      requestDuration === dur ? styles.purposePillOptionActive : null
                    ]}
                  >
                    <Text style={[styles.purposePillText, requestDuration === dur ? styles.purposePillTextActive : null]}>
                      {dur}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={[styles.loanInputLabelField, { color: isDark ? "#D1D5DB" : "#4B5563" }]}>Note (Optional)</Text>
              <TextInput
                style={[styles.textInputField, { height: 50, marginTop: 4, backgroundColor: isDark ? "#1F2937" : "#F3F4F6", color: isDark ? "#FFFFFF" : "#111827", borderColor: isDark ? "#374151" : "#E5E7EB" }]}
                placeholder="Describe your loan purpose..."
                placeholderTextColor="#9CA3AF"
                value={requestNote}
                onChangeText={setRequestNote}
              />

              <View style={[styles.estimatedRepaymentBannerBox, { backgroundColor: isDark ? "rgba(15, 157, 88, 0.1)" : "#E8F5E9", borderColor: isDark ? "rgba(15, 157, 88, 0.3)" : "#A7F3D0" }]}>
                <Text style={[styles.repayEstLabel, { color: isDark ? "#A7F3D0" : "#065F46" }]}>Estimated Installment (Includes {tier.rate}% interest)</Text>
                <Text style={[styles.repayEstVal, { color: isDark ? "#34D399" : "#047857" }]}>
                  {parsedRequestAmount > 0 
                    ? `${formatValue(monthlyInstallment)} / Month`
                    : formatValue(0)}
                </Text>
                <Text style={[styles.repayEstSub, { color: isDark ? "#6EE7B7" : "#059669" }]}>Dynamic interest rate based on your {tier.name} credit tier</Text>
              </View>

              <TouchableOpacity
                onPress={() => {
                  if (parsedRequestAmount <= 0) {
                    Alert.alert("Invalid Amount", "Please enter a valid loan amount.");
                    return;
                  }
                  if (parsedRequestAmount > availableLimit) {
                    Alert.alert("Limit Exceeded", "The requested amount exceeds your eligible borrowing limit.");
                    return;
                  }
                  handleLoanRequestSubmit();
                  setShowLoanRequestModal(false);
                }}
                style={styles.buttonForestGreenSubmitContribution}
              >
                <Text style={styles.buttonTextPrimary}>Submit Request</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}
