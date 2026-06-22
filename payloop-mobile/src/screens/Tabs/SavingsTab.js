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
    KES_PER_USDC,
    isDark,
    themeBg,
    themeCardBg,
    themeBorderColor,
    themeTextColor,
    themeSubtitleColor,
    themeDividerColor
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
      style={[styles.tabContentLight, { backgroundColor: themeBg, paddingTop: 16 }]}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: 120 }}
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
      <View style={[styles.summaryCardForestGreen, { backgroundColor: themeCardBg, borderWidth: 1, borderColor: themeBorderColor }]}>
        <View style={styles.summaryCardHeader}>
          <View>
            <Text style={[styles.summaryCardLabel, { color: themeSubtitleColor }]}>Total Balance Saved</Text>
            <Text style={[styles.summaryCardValue, { color: themeTextColor }]}>{formatValue(selectedUser.savings)}</Text>
          </View>
          <View style={styles.savingsOnTrackBadge}>
            <Text style={styles.savingsOnTrackBadgeText}>🟢 AHEAD</Text>
          </View>
        </View>
        <View style={[styles.summaryCardDivider, { backgroundColor: themeDividerColor }]} />
        <View style={styles.summaryCardDetailsRow}>
          <View style={styles.summaryDetailCol}>
            <Text style={[styles.summaryDetailLabel, { color: themeSubtitleColor }]}>Total Contributed</Text>
            <Text style={[styles.summaryDetailValue, { color: themeTextColor }]}>{formatValue(totalContributedUsdc)}</Text>
          </View>
          <View style={styles.summaryDetailColAlignEnd}>
            <Text style={[styles.summaryDetailLabel, { color: themeSubtitleColor }]}>Total Growth</Text>
            <Text style={[styles.summaryDetailValue, { color: '#34D399' }]}>▲ +14.2%</Text>
          </View>
        </View>
      </View>

      {/* 2. WEEKLY PROGRESS BAR & CONTRIBUTE BUTTON */}
      <View style={[styles.savingsTrackerCard, { backgroundColor: themeCardBg, borderWidth: 1, borderColor: themeBorderColor }]}>
        <View style={styles.trackerHeaderRow}>
          <View>
            <Text style={[styles.savingsProgressTitle, { color: themeTextColor }]}>Weekly Contribution Cycle</Text>
            <Text style={[styles.savingsProgressDeadline, { color: themeSubtitleColor }]}>Due in 5 days (15 June 2026)</Text>
          </View>
          <Text style={[styles.savingsTargetLabel, { color: themeTextColor }]}>{formatValue(100)} / week</Text>
        </View>

        <View style={[styles.trackerProgressBarBg, { backgroundColor: isDark ? "#1F2937" : "#F3F4F6" }]}>
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
        <View style={[styles.savingsSectionHeader, { borderLeftWidth: 4, borderLeftColor: "#0F9D58", paddingLeft: 8 }]}>
          <Text style={[styles.savingsSectionTitle, { color: themeTextColor, fontSize: 16, fontWeight: "800" }]}>Savings Goals & Targets</Text>
          <TouchableOpacity onPress={() => setShowAddGoalModal(true)} style={styles.savingsAddGoalBtn}>
            <Text style={styles.savingsAddGoalBtnText}>+ New Goal</Text>
          </TouchableOpacity>
        </View>

        {savingsGoals.map((goal) => {
          const pct = Math.min(1, goal.current / goal.target);
          return (
            <View key={goal.id} style={[styles.savingsGoalItemRow, { backgroundColor: themeCardBg, borderWidth: 1, borderColor: themeBorderColor }]}>
              <View style={[styles.savingsGoalIconCol, { backgroundColor: isDark ? "rgba(15, 157, 88, 0.15)" : "#E8F5E9" }]}>
                <Text style={styles.savingsGoalIconEmoji}>{goal.badge}</Text>
              </View>
              <View style={styles.savingsGoalInfoCol}>
                <View style={styles.savingsGoalTitleRow}>
                  <Text style={[styles.savingsGoalTitle, { color: themeTextColor }]}>{goal.title}</Text>
                  <Text style={[styles.savingsGoalPercentage, { color: themeTextColor }]}>{Math.round(pct * 100)}%</Text>
                </View>
                <View style={styles.savingsGoalProgressWrapper}>
                  <View style={[styles.savingsGoalProgressBarBg, { backgroundColor: isDark ? "#1F2937" : "#F3F4F6" }]}>
                    <View style={[styles.savingsGoalProgressBarFill, { width: `${pct * 100}%` }]} />
                  </View>
                </View>
                <View style={styles.savingsGoalStatsRow}>
                  <Text style={[styles.savingsGoalAmountLabel, { color: themeSubtitleColor }]}>
                    {formatValue(goal.current)} saved of {formatValue(goal.target)}
                  </Text>
                  <Text style={[styles.savingsGoalDeadline, { color: themeSubtitleColor }]}>End: {goal.deadline}</Text>
                </View>
              </View>
            </View>
          );
        })}
      </View>

      {/* 4. VISUAL SAVINGS ANALYTICS */}
      <View style={styles.savingsAnalyticsContainer}>
        <View style={{ borderLeftWidth: 4, borderLeftColor: "#3B82F6", paddingLeft: 8, marginBottom: 12 }}>
          <Text style={[styles.savingsSectionTitle, { color: themeTextColor, fontSize: 16, fontWeight: "800", marginBottom: 0 }]}>Savings Analytics & Trends</Text>
        </View>
        <View style={[styles.savingsAnalyticsChartCard, { backgroundColor: themeCardBg, borderWidth: 1, borderColor: themeBorderColor }]}>
          <Text style={[styles.chartTitleLabel, { color: themeSubtitleColor }]}>Monthly Contribution Volume (USDC/KES)</Text>

          <Svg width="100%" height="110" viewBox="0 0 300 110" style={{ marginTop: 10 }}>
            <Line x1="10" y1="95" x2="290" y2="95" stroke="#CBD5E1" strokeWidth="1" />
            <Line x1="40" y1="95" x2="40" y2="40" stroke="#0F9D58" strokeWidth="16" strokeLinecap="round" />
            <Line x1="90" y1="95" x2="90" y2="60" stroke="#10B981" strokeWidth="16" strokeLinecap="round" />
            <Line x1="140" y1="95" x2="140" y2="25" stroke="#047857" strokeWidth="16" strokeLinecap="round" />
            <Line x1="190" y1="95" x2="190" y2="55" stroke="#0F9D58" strokeWidth="16" strokeLinecap="round" />
            <Line x1="240" y1="95" x2="240" y2="35" stroke="#34D399" strokeWidth="16" strokeLinecap="round" />
          </Svg>

          <View style={styles.chartMonthsRow}>
            {["Jan", "Feb", "Mar", "Apr", "May"].map(m => (
              <Text key={m} style={[styles.chartMonthLabel, { color: themeSubtitleColor }]}>{m}</Text>
            ))}
          </View>

          <View style={[styles.chartInsightsBox, { backgroundColor: isDark ? "rgba(59, 130, 246, 0.15)" : "#EFF6FF", borderColor: "rgba(59, 130, 246, 0.3)" }]}>
            <Text style={[styles.chartInsightsText, { color: isDark ? "#93C5FD" : "#1E40AF" }]}>
              📈 Your contributions increased by **35%** in March. Keep up this consistency to boost your CreditLoop score.
            </Text>
          </View>
        </View>
      </View>

      {/* 5. GROUP SAVINGS SUMMARY (RANKINGS & COMMUNAL STATUS) */}
      <View style={styles.communalSavingsContainer}>
        <View style={{ borderLeftWidth: 4, borderLeftColor: "#F59E0B", paddingLeft: 8, marginBottom: 12 }}>
          <Text style={[styles.savingsSectionTitle, { color: themeTextColor, fontSize: 16, fontWeight: "800", marginBottom: 0 }]}>Communal Leaderboard</Text>
        </View>
        <View style={[styles.communalSavingsCard, { backgroundColor: themeCardBg, borderWidth: 1, borderColor: themeBorderColor }]}>
          <View style={styles.communalRankHeader}>
            <Text style={[styles.communalRankSub, { color: themeSubtitleColor }]}>My Rank position</Text>
            <Text style={[styles.communalRankVal, { color: themeTextColor }]}>Rank #3 of 6</Text>
          </View>

          <View style={[styles.communalDivider, { backgroundColor: themeDividerColor }]} />

          {/* Rankings List */}
          <View style={styles.rankListWrapper}>
            <View style={styles.rankItemRow}>
              <Text style={[styles.rankNumText, { color: themeSubtitleColor }]}>1</Text>
              <Text style={styles.rankEmojiText}>👩‍💼</Text>
              <Text style={[styles.rankNameText, { color: themeTextColor }]}>Grace Njeri</Text>
              <Text style={[styles.rankValText, { color: themeTextColor }]}>{formatValue(920)}</Text>
            </View>
            <View style={styles.rankItemRow}>
              <Text style={[styles.rankNumText, { color: themeSubtitleColor }]}>2</Text>
              <Text style={styles.rankEmojiText}>👩‍🌾</Text>
              <Text style={[styles.rankNameText, { color: themeTextColor }]}>Mary Wanjiku</Text>
              <Text style={[styles.rankValText, { color: themeTextColor }]}>{formatValue(850)}</Text>
            </View>
            <View style={[styles.rankItemRow, styles.rankItemRowActive, { backgroundColor: isDark ? "rgba(15, 157, 88, 0.15)" : "#E8F5E9", borderColor: "rgba(15, 157, 88, 0.3)" }]}>
              <Text style={[styles.rankNumText, { color: '#0F9D58', fontWeight: 'bold' }]}>3</Text>
              <Text style={styles.rankEmojiText}>👤</Text>
              <Text style={[styles.rankNameText, { fontWeight: 'bold', color: themeTextColor }]}>{selectedUser.name} (You)</Text>
              <Text style={[styles.rankValText, { fontWeight: 'bold', color: themeTextColor }]}>{formatValue(selectedUser.savings)}</Text>
            </View>
            <View style={styles.rankItemRow}>
              <Text style={[styles.rankNumText, { color: themeSubtitleColor }]}>4</Text>
              <Text style={styles.rankEmojiText}>👨‍🔧</Text>
              <Text style={[styles.rankNameText, { color: themeTextColor }]}>Peter Mwangi</Text>
              <Text style={[styles.rankValText, { color: themeTextColor }]}>{formatValue(640)}</Text>
            </View>
          </View>
        </View>
      </View>

      {/* 6. REWARDS & MILESTONE BADGES */}
      <View style={styles.rewardsContainer}>
        <View style={{ borderLeftWidth: 4, borderLeftColor: "#8B5CF6", paddingLeft: 8, marginBottom: 12 }}>
          <Text style={[styles.savingsSectionTitle, { color: themeTextColor, fontSize: 16, fontWeight: "800", marginBottom: 0 }]}>Savings Badges Earned</Text>
        </View>
        <View style={styles.rewardsGrid}>
          <View style={[styles.rewardBadgeCard, { backgroundColor: themeCardBg, borderWidth: 1, borderColor: themeBorderColor }]}>
            <Text style={styles.rewardEmoji}>🏆</Text>
            <Text style={[styles.rewardTitle, { color: themeTextColor }]}>First Step</Text>
            <Text style={[styles.rewardDesc, { color: themeSubtitleColor }]}>Saved first coin</Text>
          </View>
          <View style={[styles.rewardBadgeCard, { backgroundColor: themeCardBg, borderWidth: 1, borderColor: themeBorderColor }]}>
            <Text style={styles.rewardEmoji}>🔥</Text>
            <Text style={[styles.rewardTitle, { color: themeTextColor }]}>Streak Saver</Text>
            <Text style={[styles.rewardDesc, { color: themeSubtitleColor }]}>3 on-time saves</Text>
          </View>
          <View style={[styles.rewardBadgeCard, { backgroundColor: themeCardBg, borderWidth: 1, borderColor: themeBorderColor }]}>
            <Text style={styles.rewardEmoji}>🎯</Text>
            <Text style={[styles.rewardTitle, { color: themeTextColor }]}>Target Met</Text>
            <Text style={[styles.rewardDesc, { color: themeSubtitleColor }]}>School fees done</Text>
          </View>
        </View>
      </View>

      {/* 7. CONTRIBUTION HISTORY & TIMELINE FILTERS */}
      <View style={styles.historyContainer}>
        <View style={{ borderLeftWidth: 4, borderLeftColor: "#EC4899", paddingLeft: 8, marginBottom: 12 }}>
          <Text style={[styles.savingsSectionTitle, { color: themeTextColor, fontSize: 16, fontWeight: "800", marginBottom: 0 }]}>Contribution Timeline</Text>
        </View>

        {/* History filter columns */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.historyFilterScrollPills}>
          <View style={styles.filterGroupPillRow}>
            <Text style={[styles.filterTitleLabel, { color: themeTextColor }]}>Month:</Text>
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
            <Text style={[styles.filterTitleLabel, { color: themeTextColor }]}>Pay Method:</Text>
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
            <View style={[styles.historyEmptyStateBox, { backgroundColor: themeCardBg, borderWidth: 1, borderColor: themeBorderColor }]}>
              <Text style={styles.emptyStateEmoji}>📂</Text>
              <Text style={[styles.emptyStateText, { color: themeSubtitleColor }]}>No contributions found matching filters</Text>
            </View>
          ) : (
            filteredTxs.map((item) => {
              const isMpesa = item.date.includes("MPESA") || item.id.toString().includes("mpesa") || item.id % 2 === 0;
              return (
                <View key={item.id} style={[styles.contribHistoryItemRow, { backgroundColor: themeCardBg, borderWidth: 1, borderColor: themeBorderColor }]}>
                  <View style={styles.contribHistoryLeft}>
                    <View style={[styles.contribHistoryIconWrapper, { backgroundColor: isDark ? "rgba(15, 157, 88, 0.1)" : "#E8F5E9" }]}>
                      <Text style={styles.contribHistoryEmoji}>{isMpesa ? "📱" : "🦊"}</Text>
                    </View>
                    <View>
                      <Text style={[styles.contribHistoryDate, { color: themeTextColor }]}>{item.date.split(",")[0]}</Text>
                      <Text style={[styles.contribHistoryRef, { color: themeSubtitleColor }]}>Ref: TX-CHAMA-{item.id.toString().substring(0, 5)}</Text>
                    </View>
                  </View>
                  <View style={styles.contribHistoryRight}>
                    <Text style={[styles.contribHistoryAmount, { color: themeTextColor }]}>{formatValue(Math.abs(item.amount))}</Text>
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

            <View style={[styles.goalAddFormCardBody, { backgroundColor: isDark ? "#111827" : "#FFFFFF" }]}>
              <Text style={[styles.goalAddFormLabel, { color: isDark ? "#D1D5DB" : "#4B5563" }]}>Goal Name</Text>
              <TextInput
                style={[styles.goalAddFormInput, { backgroundColor: isDark ? "#1F2937" : "#F3F4F6", color: isDark ? "#FFFFFF" : "#111827", borderColor: isDark ? "#374151" : "#E5E7EB" }]}
                placeholder="e.g. Asset Purchase"
                placeholderTextColor="#9CA3AF"
                value={newGoalTitle}
                onChangeText={setNewGoalTitle}
              />

              <Text style={[styles.goalAddFormLabel, { color: isDark ? "#D1D5DB" : "#4B5563" }]}>Target Amount ({currency})</Text>
              <TextInput
                style={[styles.goalAddFormInput, { backgroundColor: isDark ? "#1F2937" : "#F3F4F6", color: isDark ? "#FFFFFF" : "#111827", borderColor: isDark ? "#374151" : "#E5E7EB" }]}
                placeholder="e.g. 50000"
                placeholderTextColor="#9CA3AF"
                keyboardType="numeric"
                value={newGoalTarget}
                onChangeText={setNewGoalTarget}
              />

              <Text style={[styles.goalAddFormLabel, { color: isDark ? "#D1D5DB" : "#4B5563" }]}>Deadline Date</Text>
              <TextInput
                style={[styles.goalAddFormInput, { backgroundColor: isDark ? "#1F2937" : "#F3F4F6", color: isDark ? "#FFFFFF" : "#111827", borderColor: isDark ? "#374151" : "#E5E7EB" }]}
                placeholder="e.g. 31 Dec 2026"
                placeholderTextColor="#9CA3AF"
                value={newGoalDeadline}
                onChangeText={setNewGoalDeadline}
              />

              <Text style={[styles.goalAddFormLabel, { color: isDark ? "#D1D5DB" : "#4B5563" }]}>Select Icon Badge</Text>
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
