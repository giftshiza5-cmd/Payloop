import React from "react";
import {
  ScrollView,
  RefreshControl,
  View,
  Text,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert
} from "react-native";
import Svg, { Line } from "react-native-svg";
import { useApp } from "../../context/AppContext";
import { styles } from "../../../styles";

export default function SavingsTab() {
  const {
    selectedUser,
    isRefreshing,
    handleDashboardRefresh,
    formatValue,
    setActiveSubScreen,
    showAddGoalModal,
    setShowAddGoalModal,
    savingsGoals,
    transactions,
    currency,
    historyFilterMonth,
    setHistoryFilterMonth,
    historyFilterMethod,
    setHistoryFilterMethod,
    historyFilterStatus,
    setHistoryFilterStatus,
    setReceiptDetails,
    setShowReceiptModal,
    newGoalTitle,
    setNewGoalTitle,
    newGoalTarget,
    setNewGoalTarget,
    newGoalDeadline,
    setNewGoalDeadline,
    newGoalBadge,
    setNewGoalBadge,
    fetchWithTimeout,
    BACKEND_URL,
    fetchUserData,
    setIsLoading,
    KES_PER_USDC
  } = useApp();

  const totalContributedUsdc = transactions
    .filter((t) => t.type === "Contribution" && t.status === "Completed")
    .reduce((acc, t) => acc + Math.abs(t.amount), 0);

  const goalProgressPct = selectedUser?.savings > 0 ? Math.min(1, selectedUser.savings / 2000) : 0;

  // History filter logic
  const filteredTxs = transactions.filter((t) => {
    if (t.type !== "Contribution") return false;
    
    // Status filter
    if (historyFilterStatus !== "All" && t.status !== historyFilterStatus) return false;
    
    // Payment method filter
    if (historyFilterMethod !== "All") {
      const isMpesa = t.date.includes("MPESA") || t.id.toString().includes("mpesa");
      if (historyFilterMethod === "M-Pesa" && !isMpesa) return false;
      if (historyFilterMethod === "MetaMask" && isMpesa) return false;
    }
    
    // Month filter
    if (historyFilterMonth !== "All") {
      if (!t.date.includes(historyFilterMonth)) return false;
    }
    
    return true;
  });

  const handleCreateGoalSubmit = async () => {
    if (!newGoalTitle || !newGoalTarget) {
      Alert.alert("Error", "Please enter goal title and target amount.");
      return;
    }
    const val = parseFloat(newGoalTarget);
    if (isNaN(val) || val <= 0) {
      Alert.alert("Error", "Please enter a valid target amount.");
      return;
    }
    const targetUsdc = currency === "KES" ? val / KES_PER_USDC : val;
    setIsLoading(true);
    try {
      const response = await fetchWithTimeout(`${BACKEND_URL}/api/savings/create-goal`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: selectedUser.email,
          name: newGoalTitle,
          targetAmount: targetUsdc,
          deadline: newGoalDeadline || "31 Dec 2026",
          badge: newGoalBadge || "💰"
        })
      });
      const data = await response.json();
      if (response.ok) {
        await fetchUserData(selectedUser.email);
        setNewGoalTitle("");
        setNewGoalTarget("");
        setNewGoalDeadline("");
        setNewGoalBadge("💰");
        setShowAddGoalModal(false);
        Alert.alert("Goal Created! 🎉", `Target "${newGoalTitle}" has been added to your savings goals.`);
      } else {
        setIsLoading(false);
        Alert.alert("Error", data.error || "Failed to create savings goal.");
      }
    } catch (e) {
      setIsLoading(false);
      Alert.alert("Error", "Failed to connect to savings goal service.");
      console.log(e);
    }
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
      {/* 1. SAVINGS OVERVIEW CARD */}
      <View style={styles.summaryCardForestGreen}>
        <View style={styles.summaryCardHeader}>
          <View>
            <Text style={styles.summaryCardLabel}>Total Balance Saved</Text>
            <Text style={styles.summaryCardValue}>{formatValue(selectedUser.savings)}</Text>
          </View>
          <View style={styles.savingsOnTrackBadge}>
            <Text style={styles.savingsOnTrackBadgeText}>🟢 AHEAD</Text>
          </View>
        </View>
        <View style={styles.summaryCardDivider} />
        <View style={styles.summaryCardDetailsRow}>
          <View style={styles.summaryDetailCol}>
            <Text style={styles.summaryDetailLabel}>Total Contributed</Text>
            <Text style={styles.summaryDetailValue}>{formatValue(totalContributedUsdc)}</Text>
          </View>
          <View style={styles.summaryDetailColAlignEnd}>
            <Text style={styles.summaryDetailLabel}>Total Growth</Text>
            <Text style={[styles.summaryDetailValue, { color: '#34D399' }]}>▲ +14.2%</Text>
          </View>
        </View>
      </View>

      {/* 2. WEEKLY PROGRESS BAR & CONTRIBUTE BUTTON */}
      <View style={styles.savingsTrackerCard}>
        <View style={styles.trackerHeaderRow}>
          <View>
            <Text style={styles.savingsProgressTitle}>Weekly Contribution Cycle</Text>
            <Text style={styles.savingsProgressDeadline}>Due in 5 days (15 June 2026)</Text>
          </View>
          <Text style={styles.savingsTargetLabel}>{formatValue(100)} / week</Text>
        </View>

        <View style={styles.trackerProgressBarBg}>
          <View style={[styles.trackerProgressBarFill, { width: `${goalProgressPct * 100}%` }]} />
        </View>

        <View style={styles.savingsProgressDetailsRow}>
          <Text style={styles.savingsProgressStatusText}>
            {selectedUser.savings > 0 ? "🟢 You are currently up to date" : "⚠️ Payment due immediately"}
          </Text>
          <TouchableOpacity onPress={() => setActiveSubScreen("contribute")} style={styles.savingsQuickContributeBtn}>
            <Text style={styles.savingsQuickContributeBtnText}>Contribute Now</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* 3. SAVINGS GOALS SECTION */}
      <View style={styles.savingsGoalsContainer}>
        <View style={styles.savingsSectionHeader}>
          <Text style={styles.savingsSectionTitle}>Savings Goals & Targets</Text>
          <TouchableOpacity onPress={() => setShowAddGoalModal(true)} style={styles.savingsAddGoalBtn}>
            <Text style={styles.savingsAddGoalBtnText}>+ New Goal</Text>
          </TouchableOpacity>
        </View>

        {savingsGoals.map((goal) => {
          const pct = Math.min(1, goal.current / goal.target);
          return (
            <View key={goal.id} style={styles.savingsGoalItemRow}>
              <View style={styles.savingsGoalIconCol}>
                <Text style={styles.savingsGoalIconEmoji}>{goal.badge}</Text>
              </View>
              <View style={styles.savingsGoalInfoCol}>
                <View style={styles.savingsGoalTitleRow}>
                  <Text style={styles.savingsGoalTitle}>{goal.title}</Text>
                  <Text style={styles.savingsGoalPercentage}>{Math.round(pct * 100)}%</Text>
                </View>
                <View style={styles.savingsGoalProgressWrapper}>
                  <View style={styles.savingsGoalProgressBarBg}>
                    <View style={[styles.savingsGoalProgressBarFill, { width: `${pct * 100}%` }]} />
                  </View>
                </View>
                <View style={styles.savingsGoalStatsRow}>
                  <Text style={styles.savingsGoalAmountLabel}>
                    {formatValue(goal.current)} saved of {formatValue(goal.target)}
                  </Text>
                  <Text style={styles.savingsGoalDeadline}>End: {goal.deadline}</Text>
                </View>
              </View>
            </View>
          );
        })}
      </View>

      {/* 4. VISUAL SAVINGS ANALYTICS */}
      <View style={styles.savingsAnalyticsContainer}>
        <Text style={styles.savingsSectionTitle}>Savings Analytics & Trends</Text>
        <View style={styles.savingsAnalyticsChartCard}>
          <Text style={styles.chartTitleLabel}>Monthly Contribution Volume (USDC/KES)</Text>
          
          <Svg width="100%" height="110" viewBox="0 0 300 110" style={{ marginTop: 10 }}>
            <Line x1="10" y1="95" x2="290" y2="95" stroke="#CBD5E1" strokeWidth="1" />
            <Line x1="40" y1="95" x2="40" y2="40" stroke="#0F9D58" strokeWidth="16" strokeLinecap="round" />
            <Line x1="90" y1="95" x2="90" y2="60" stroke="#10B981" strokeWidth="16" strokeLinecap="round" />
            <Line x1="140" y1="95" x2="140" y2="25" stroke="#047857" strokeWidth="16" strokeLinecap="round" />
            <Line x1="190" y1="95" x2="190" y2="55" stroke="#0F9D58" strokeWidth="16" strokeLinecap="round" />
            <Line x1="240" y1="95" x2="240" y2="35" stroke="#34D399" strokeWidth="16" strokeLinecap="round" />
          </Svg>
          
          <View style={styles.chartMonthsRow}>
            <Text style={styles.chartMonthLabel}>Jan</Text>
            <Text style={styles.chartMonthLabel}>Feb</Text>
            <Text style={styles.chartMonthLabel}>Mar</Text>
            <Text style={styles.chartMonthLabel}>Apr</Text>
            <Text style={styles.chartMonthLabel}>May</Text>
          </View>

          <View style={styles.chartInsightsBox}>
            <Text style={styles.chartInsightsText}>
              📈 Your contributions increased by **35%** in March. Keep up this consistency to boost your CreditLoop score.
            </Text>
          </View>
        </View>
      </View>

      {/* 5. GROUP SAVINGS SUMMARY (RANKINGS & COMMUNAL STATUS) */}
      <View style={styles.communalSavingsContainer}>
        <Text style={styles.savingsSectionTitle}>Communal Leaderboard</Text>
        <View style={styles.communalSavingsCard}>
          <View style={styles.communalRankHeader}>
            <Text style={styles.communalRankSub}>My Rank position</Text>
            <Text style={styles.communalRankVal}>Rank #3 of 6</Text>
          </View>

          <View style={styles.communalDivider} />

          {/* Rankings List */}
          <View style={styles.rankListWrapper}>
            <View style={styles.rankItemRow}>
              <Text style={styles.rankNumText}>1</Text>
              <Text style={styles.rankEmojiText}>👩‍💼</Text>
              <Text style={styles.rankNameText}>Grace Njeri</Text>
              <Text style={styles.rankValText}>{formatValue(920)}</Text>
            </View>
            <View style={styles.rankItemRow}>
              <Text style={styles.rankNumText}>2</Text>
              <Text style={styles.rankEmojiText}>👩‍🌾</Text>
              <Text style={styles.rankNameText}>Mary Wanjiku</Text>
              <Text style={styles.rankValText}>{formatValue(850)}</Text>
            </View>
            <View style={[styles.rankItemRow, styles.rankItemRowActive]}>
              <Text style={[styles.rankNumText, { color: '#0F9D58', fontWeight: 'bold' }]}>3</Text>
              <Text style={styles.rankEmojiText}>👤</Text>
              <Text style={[styles.rankNameText, { fontWeight: 'bold' }]}>{selectedUser.name} (You)</Text>
              <Text style={[styles.rankValText, { fontWeight: 'bold' }]}>{formatValue(selectedUser.savings)}</Text>
            </View>
            <View style={styles.rankItemRow}>
              <Text style={styles.rankNumText}>4</Text>
              <Text style={styles.rankEmojiText}>👨‍🔧</Text>
              <Text style={styles.rankNameText}>Peter Mwangi</Text>
              <Text style={styles.rankValText}>{formatValue(640)}</Text>
            </View>
          </View>
        </View>
      </View>

      {/* 6. REWARDS & MILESTONE BADGES */}
      <View style={styles.rewardsContainer}>
        <Text style={styles.savingsSectionTitle}>Savings Badges Earned</Text>
        <View style={styles.rewardsGrid}>
          <View style={styles.rewardBadgeCard}>
            <Text style={styles.rewardEmoji}>🏆</Text>
            <Text style={styles.rewardTitle}>First Step</Text>
            <Text style={styles.rewardDesc}>Saved first coin</Text>
          </View>
          <View style={styles.rewardBadgeCard}>
            <Text style={styles.rewardEmoji}>🔥</Text>
            <Text style={styles.rewardTitle}>Streak Saver</Text>
            <Text style={styles.rewardDesc}>3 on-time saves</Text>
          </View>
          <View style={styles.rewardBadgeCard}>
            <Text style={styles.rewardEmoji}>🎯</Text>
            <Text style={styles.rewardTitle}>Target Met</Text>
            <Text style={styles.rewardDesc}>School fees done</Text>
          </View>
        </View>
      </View>

      {/* 7. CONTRIBUTION HISTORY & TIMELINE FILTERS */}
      <View style={styles.historyContainer}>
        <Text style={styles.savingsSectionTitle}>Contribution Timeline</Text>
        
        {/* History filter columns */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.historyFilterScrollPills}>
          <View style={styles.filterGroupPillRow}>
            <Text style={styles.filterTitleLabel}>Month:</Text>
            {["All", "May", "Apr", "Mar"].map((m) => (
              <TouchableOpacity
                key={m}
                onPress={() => setHistoryFilterMonth(m)}
                style={[styles.filterPill, historyFilterMonth === m ? styles.filterPillActive : null]}
              >
                <Text style={[styles.filterPillText, historyFilterMonth === m ? styles.filterPillTextActive : null]}>
                  {m}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={[styles.historyFilterScrollPills, { marginTop: 8 }]}>
          <View style={styles.filterGroupPillRow}>
            <Text style={styles.filterTitleLabel}>Pay Method:</Text>
            {["All", "M-Pesa", "MetaMask"].map((met) => (
              <TouchableOpacity
                key={met}
                onPress={() => setHistoryFilterMethod(met)}
                style={[styles.filterPill, historyFilterMethod === met ? styles.filterPillActive : null]}
              >
                <Text style={[styles.filterPillText, historyFilterMethod === met ? styles.filterPillTextActive : null]}>
                  {met}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>

        {/* History timeline list */}
        <View style={styles.historyCardList}>
          {filteredTxs.length === 0 ? (
            <View style={styles.historyEmptyStateBox}>
              <Text style={styles.emptyStateEmoji}>📂</Text>
              <Text style={styles.emptyStateText}>No contributions found matching filters</Text>
            </View>
          ) : (
            filteredTxs.map((item) => {
              const isMpesa = item.date.includes("MPESA") || item.id.toString().includes("mpesa") || item.id % 2 === 0;
              return (
                <View key={item.id} style={styles.contribHistoryItemRow}>
                  <View style={styles.contribHistoryLeft}>
                    <View style={styles.contribHistoryIconWrapper}>
                      <Text style={styles.contribHistoryEmoji}>{isMpesa ? "📱" : "🦊"}</Text>
                    </View>
                    <View>
                      <Text style={styles.contribHistoryDate}>{item.date.split(",")[0]}</Text>
                      <Text style={styles.contribHistoryRef}>Ref: TX-CHAMA-{item.id.toString().substring(0, 5)}</Text>
                    </View>
                  </View>
                  <View style={styles.contribHistoryRight}>
                    <Text style={styles.contribHistoryAmount}>{formatValue(Math.abs(item.amount))}</Text>
                    <TouchableOpacity 
                      onPress={() => {
                        setReceiptDetails({
                          txId: "TX-RECEIPT-" + item.id,
                          title: "Chama Contribution",
                          amount: Math.abs(item.amount),
                          date: item.date,
                          recipient: "Green Future Chama Vault"
                        });
                        setShowReceiptModal(true);
                      }} 
                      style={styles.historyReceiptBtn}
                    >
                      <Text style={styles.historyReceiptBtnText}>Receipt</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })
          )}
        </View>
      </View>

      {/* GOAL ADDITION MODAL SIMULATOR */}
      <Modal visible={showAddGoalModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.goalAddCardWrapper}>
            <View style={styles.goalAddHeaderRow}>
              <Text style={styles.goalAddHeaderTitle}>Create Savings Target Goal</Text>
              <TouchableOpacity onPress={() => setShowAddGoalModal(false)} style={styles.goalAddCloseBtn}>
                <Text style={styles.goalAddCloseBtnText}>✕</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.goalAddFormCardBody}>
              <Text style={styles.goalAddFormLabel}>Goal Name</Text>
              <TextInput
                style={styles.goalAddFormInput}
                placeholder="e.g. Asset Purchase"
                placeholderTextColor="#9CA3AF"
                value={newGoalTitle}
                onChangeText={setNewGoalTitle}
              />

              <Text style={styles.goalAddFormLabel}>Target Amount ({currency})</Text>
              <TextInput
                style={styles.goalAddFormInput}
                placeholder="e.g. 50000"
                placeholderTextColor="#9CA3AF"
                keyboardType="numeric"
                value={newGoalTarget}
                onChangeText={setNewGoalTarget}
              />

              <Text style={styles.goalAddFormLabel}>Deadline Date</Text>
              <TextInput
                style={styles.goalAddFormInput}
                placeholder="e.g. 31 Dec 2026"
                placeholderTextColor="#9CA3AF"
                value={newGoalDeadline}
                onChangeText={setNewGoalDeadline}
              />

              <Text style={styles.goalAddFormLabel}>Select Icon Badge</Text>
              <View style={styles.badgeSelectorRow}>
                {["💰", "💼", "🎓", "🛡️", "🏠", "🚜"].map((emoji) => (
                  <TouchableOpacity
                    key={emoji}
                    onPress={() => setNewGoalBadge(emoji)}
                    style={[
                      styles.badgeSelectorPillOption,
                      newGoalBadge === emoji ? styles.badgeSelectorPillOptionActive : null
                    ]}
                  >
                    <Text style={styles.badgeSelectorEmojiText}>{emoji}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <TouchableOpacity onPress={handleCreateGoalSubmit} style={styles.goalAddSubmitBtn}>
                <Text style={styles.goalAddSubmitBtnText}>Create Goal</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}
