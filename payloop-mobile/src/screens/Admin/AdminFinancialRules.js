import React from "react";
import { View, Text, TouchableOpacity, ScrollView, TextInput } from "react-native";
import { useApp } from "../../context/AppContext";
import { styles } from "../../../styles";

export default function AdminFinancialRules() {
  const {
    rulesContributionAmount,
    setRulesContributionAmount,
    rulesPenaltyRate,
    setRulesPenaltyRate,
    rulesMultiplier,
    setRulesMultiplier,
    rulesInterestRate,
    setRulesInterestRate,
    rulesEmergency,
    setRulesEmergency,
    rulesWithdrawal,
    setRulesWithdrawal,
    rulesGracePeriod,
    setRulesGracePeriod,
    fetchWithTimeout,
    BACKEND_URL,
    currentGroup,
    selectedUser,
    showBanner,
    fetchAdminFinancialRules,
    setActiveSubScreen,
    isDark,
    themeBg,
    themeCardBg,
    themeBorderColor,
    themeTextColor,
    themeSubtitleColor
  } = useApp();

  const handleSaveFinancialRules = async () => {
    try {
      const res = await fetchWithTimeout(`${BACKEND_URL}/api/admin/financial-rules/${currentGroup.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contribution_amount: rulesContributionAmount,
          late_penalty_rate: rulesPenaltyRate,
          max_loan_multiplier: rulesMultiplier,
          loan_interest_rate: rulesInterestRate,
          emergency_fund_percent: rulesEmergency,
          max_withdrawal_percent: rulesWithdrawal,
          grace_period_days: rulesGracePeriod,
          email: selectedUser.email
        })
      });
      if (res.ok) {
        showBanner("Financial rules updated successfully", "success");
        fetchAdminFinancialRules(currentGroup.id);
      }
    } catch (e) {
      console.log("Error saving financial rules:", e);
    }
  };

  return (
    <ScrollView style={[styles.tabContentLight, { backgroundColor: themeBg, paddingTop: 16 }]} showsVerticalScrollIndicator={false}>

      <View style={{ paddingHorizontal: 16, paddingBottom: 30 }}>
        <Text style={{ fontSize: 12, color: themeSubtitleColor, marginBottom: 16 }}>
          Set standard limits, penalties, and terms for the cooperative ledger
        </Text>

        <View style={{ backgroundColor: themeCardBg, borderWidth: 1, borderColor: themeBorderColor, borderRadius: 20, padding: 18 }}>
          
          <Text style={{ fontSize: 12, fontWeight: "700", color: themeSubtitleColor }}>Contribution Amount (KES)</Text>
          <TextInput
            style={{
              backgroundColor: isDark ? "#0F172A" : "#F8FAFC",
              borderWidth: 1,
              borderColor: themeBorderColor,
              borderRadius: 8,
              padding: 10,
              color: themeTextColor,
              marginTop: 6,
              marginBottom: 14
            }}
            value={rulesContributionAmount}
            onChangeText={setRulesContributionAmount}
            keyboardType="numeric"
          />

          <Text style={{ fontSize: 12, fontWeight: "700", color: themeSubtitleColor }}>Late Penalty Rate (%)</Text>
          <TextInput
            style={{
              backgroundColor: isDark ? "#0F172A" : "#F8FAFC",
              borderWidth: 1,
              borderColor: themeBorderColor,
              borderRadius: 8,
              padding: 10,
              color: themeTextColor,
              marginTop: 6,
              marginBottom: 14
            }}
            value={rulesPenaltyRate}
            onChangeText={setRulesPenaltyRate}
            keyboardType="numeric"
          />

          <Text style={{ fontSize: 12, fontWeight: "700", color: themeSubtitleColor }}>Max Loan Multiplier (x of savings)</Text>
          <TextInput
            style={{
              backgroundColor: isDark ? "#0F172A" : "#F8FAFC",
              borderWidth: 1,
              borderColor: themeBorderColor,
              borderRadius: 8,
              padding: 10,
              color: themeTextColor,
              marginTop: 6,
              marginBottom: 14
            }}
            value={rulesMultiplier}
            onChangeText={setRulesMultiplier}
            keyboardType="numeric"
          />

          <Text style={{ fontSize: 12, fontWeight: "700", color: themeSubtitleColor }}>Loan Interest Rate (%)</Text>
          <TextInput
            style={{
              backgroundColor: isDark ? "#0F172A" : "#F8FAFC",
              borderWidth: 1,
              borderColor: themeBorderColor,
              borderRadius: 8,
              padding: 10,
              color: themeTextColor,
              marginTop: 6,
              marginBottom: 14
            }}
            value={rulesInterestRate}
            onChangeText={setRulesInterestRate}
            keyboardType="numeric"
          />

          <Text style={{ fontSize: 12, fontWeight: "700", color: themeSubtitleColor }}>Emergency Fund Reserve (%)</Text>
          <TextInput
            style={{
              backgroundColor: isDark ? "#0F172A" : "#F8FAFC",
              borderWidth: 1,
              borderColor: themeBorderColor,
              borderRadius: 8,
              padding: 10,
              color: themeTextColor,
              marginTop: 6,
              marginBottom: 14
            }}
            value={rulesEmergency}
            onChangeText={setRulesEmergency}
            keyboardType="numeric"
          />

          <Text style={{ fontSize: 12, fontWeight: "700", color: themeSubtitleColor }}>Max Withdrawal Percentage (%)</Text>
          <TextInput
            style={{
              backgroundColor: isDark ? "#0F172A" : "#F8FAFC",
              borderWidth: 1,
              borderColor: themeBorderColor,
              borderRadius: 8,
              padding: 10,
              color: themeTextColor,
              marginTop: 6,
              marginBottom: 14
            }}
            value={rulesWithdrawal}
            onChangeText={setRulesWithdrawal}
            keyboardType="numeric"
          />

          <Text style={{ fontSize: 12, fontWeight: "700", color: themeSubtitleColor }}>Grace Period Days</Text>
          <TextInput
            style={{
              backgroundColor: isDark ? "#0F172A" : "#F8FAFC",
              borderWidth: 1,
              borderColor: themeBorderColor,
              borderRadius: 8,
              padding: 10,
              color: themeTextColor,
              marginTop: 6,
              marginBottom: 20
            }}
            value={rulesGracePeriod}
            onChangeText={setRulesGracePeriod}
            keyboardType="numeric"
          />

          <TouchableOpacity
            onPress={handleSaveFinancialRules}
            style={{
              backgroundColor: "#0F9D58",
              borderRadius: 12,
              paddingVertical: 12,
              alignItems: "center"
            }}
          >
            <Text style={{ color: "#ffffff", fontWeight: "bold", fontSize: 14 }}>Save Cooperative Rules</Text>
          </TouchableOpacity>

        </View>
      </View>
    </ScrollView>
  );
}
