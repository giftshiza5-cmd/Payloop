import React from "react";
import { View, Text, TouchableOpacity, ScrollView, RefreshControl } from "react-native";
import { useApp } from "../../context/AppContext";
import { styles } from "../../../styles";

export default function AdminDashboard() {
  const {
    adminDashboardData,
    isRefreshing,
    setIsRefreshing,
    currentGroup,
    fetchAdminDashboard,
    setActiveSubScreen,
    isDark,
    themeBg,
    themeCardBg,
    themeBorderColor,
    themeTextColor,
    themeSubtitleColor,
    themeDividerColor
  } = useApp();

  const metrics = adminDashboardData?.metrics || {};
  const charts = adminDashboardData?.charts || {};

  const renderSimulatedBarChart = (data) => {
    if (!data || data.length === 0) return null;
    const maxVal = Math.max(...data.map(d => parseFloat(d.amount) || 1));
    return (
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end", height: 100, marginVertical: 10 }}>
        {data.map((item, idx) => (
          <View key={idx} style={{ alignItems: "center", flex: 1 }}>
            <View style={{
              height: Math.max(10, ((parseFloat(item.amount) || 0) / maxVal) * 80),
              width: 16,
              backgroundColor: "#0F9D58",
              borderRadius: 8,
              marginBottom: 4
            }} />
            <Text style={{ fontSize: 9, color: themeSubtitleColor }}>{item.month}</Text>
          </View>
        ))}
      </View>
    );
  };

  return (
    <ScrollView 
      style={[styles.tabContentLight, { backgroundColor: themeBg, paddingTop: 16 }]} 
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl 
          refreshing={isRefreshing} 
          onRefresh={async () => {
            setIsRefreshing(true);
            if (currentGroup) await fetchAdminDashboard(currentGroup.id);
            setIsRefreshing(false);
          }} 
        />
      }
    >

      {/* Dashboard Metrics */}
      <View style={{ paddingHorizontal: 16, paddingBottom: 30 }}>
        <Text style={{ fontSize: 12, color: themeSubtitleColor, marginBottom: 16 }}>
          Real-time cooperative analytics and monitoring controls
        </Text>

        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10 }}>
          {/* Row 1 */}
          <View style={{ flex: 1, minWidth: "45%", backgroundColor: themeCardBg, borderWidth: 1, borderColor: themeBorderColor, borderRadius: 16, padding: 14 }}>
            <Text style={{ fontSize: 11, color: themeSubtitleColor }}>Total Members</Text>
            <Text style={{ fontSize: 20, fontWeight: "800", color: themeTextColor, marginTop: 4 }}>{metrics.totalMembers || 0}</Text>
            <Text style={{ fontSize: 9, color: "#0F9D58", marginTop: 2 }}>{metrics.activeMembers || 0} active now</Text>
          </View>
          <View style={{ flex: 1, minWidth: "45%", backgroundColor: themeCardBg, borderWidth: 1, borderColor: themeBorderColor, borderRadius: 16, padding: 14 }}>
            <Text style={{ fontSize: 11, color: themeSubtitleColor }}>Total Savings</Text>
            <Text style={{ fontSize: 20, fontWeight: "800", color: themeTextColor, marginTop: 4 }}>KES {(metrics.totalSavings || 0).toLocaleString()}</Text>
            <Text style={{ fontSize: 9, color: "#3B82F6", marginTop: 2 }}>From contributions</Text>
          </View>
          {/* Row 2 */}
          <View style={{ flex: 1, minWidth: "45%", backgroundColor: themeCardBg, borderWidth: 1, borderColor: themeBorderColor, borderRadius: 16, padding: 14 }}>
            <Text style={{ fontSize: 11, color: themeSubtitleColor }}>Available Vault Cash</Text>
            <Text style={{ fontSize: 20, fontWeight: "800", color: "#0F9D58", marginTop: 4 }}>KES {(metrics.availableFunds || 0).toLocaleString()}</Text>
            <Text style={{ fontSize: 9, color: themeSubtitleColor, marginTop: 2 }}>Ready for loans</Text>
          </View>
          <View style={{ flex: 1, minWidth: "45%", backgroundColor: themeCardBg, borderWidth: 1, borderColor: themeBorderColor, borderRadius: 16, padding: 14 }}>
            <Text style={{ fontSize: 11, color: themeSubtitleColor }}>Pending Approvals</Text>
            <Text style={{ fontSize: 20, fontWeight: "800", color: (metrics.pendingApprovals || 0) > 0 ? "#F59E0B" : themeTextColor, marginTop: 4 }}>{metrics.pendingApprovals || 0}</Text>
            <Text style={{ fontSize: 9, color: "#EF4444", marginTop: 2 }}>Requires review</Text>
          </View>
          {/* Row 3 */}
          <View style={{ flex: 1, minWidth: "45%", backgroundColor: themeCardBg, borderWidth: 1, borderColor: themeBorderColor, borderRadius: 16, padding: 14 }}>
            <Text style={{ fontSize: 11, color: themeSubtitleColor }}>Active Loans</Text>
            <Text style={{ fontSize: 20, fontWeight: "800", color: themeTextColor, marginTop: 4 }}>{metrics.activeLoans || 0}</Text>
            <Text style={{ fontSize: 9, color: "#EF4444", marginTop: 2 }}>{metrics.overdueLoans || 0} overdue</Text>
          </View>
          <View style={{ flex: 1, minWidth: "45%", backgroundColor: themeCardBg, borderWidth: 1, borderColor: themeBorderColor, borderRadius: 16, padding: 14 }}>
            <Text style={{ fontSize: 11, color: themeSubtitleColor }}>Upcoming Pool</Text>
            <Text style={{ fontSize: 20, fontWeight: "800", color: themeTextColor, marginTop: 4 }}>KES {(metrics.upcomingContributions || 0).toLocaleString()}</Text>
            <Text style={{ fontSize: 9, color: "#6366F1", marginTop: 2 }}>Expected contributions</Text>
          </View>
        </View>

        {/* Quick Action Shortcuts */}
        <Text style={{ fontSize: 13, fontWeight: "700", color: themeTextColor, marginTop: 20, marginBottom: 10 }}>Quick Shortcuts</Text>
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
          {[
            { label: "Approvals", color: "#10B981", screen: "adminApprovals" },
            { label: "Financial Rules", color: "#6366F1", screen: "adminFinancialRules" },
            { label: "Loans Manager", color: "#F59E0B", screen: "adminLoanManagement" },
            { label: "Broadcast Hub", color: "#3B82F6", screen: "adminCommunication" },
            { label: "Governance & Polls", color: "#8B5CF6", screen: "adminGovernance" },
            { label: "Reports Module", color: "#EC4899", screen: "adminReports" }
          ].map((shortcut, idx) => (
            <TouchableOpacity
              key={idx}
              onPress={() => setActiveSubScreen(shortcut.screen)}
              style={{
                flex: 1,
                minWidth: "30%",
                paddingVertical: 12,
                paddingHorizontal: 8,
                backgroundColor: themeCardBg,
                borderRadius: 12,
                alignItems: "center",
                borderWidth: 1.5,
                borderColor: themeBorderColor
              }}
            >
              <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: shortcut.color, marginBottom: 6 }} />
              <Text style={{ fontSize: 10, fontWeight: "700", color: themeTextColor, textAlign: "center" }}>{shortcut.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Analytical Charts */}
        <Text style={{ fontSize: 13, fontWeight: "700", color: themeTextColor, marginTop: 20, marginBottom: 10 }}>Savings Growth Trend (KES)</Text>
        <View style={{ backgroundColor: themeCardBg, borderWidth: 1, borderColor: themeBorderColor, borderRadius: 16, padding: 14 }}>
          {renderSimulatedBarChart(charts.savingsGrowth || [])}
        </View>

        <Text style={{ fontSize: 13, fontWeight: "700", color: themeTextColor, marginTop: 20, marginBottom: 10 }}>Loan Repayments Trend (KES)</Text>
        <View style={{ backgroundColor: themeCardBg, borderWidth: 1, borderColor: themeBorderColor, borderRadius: 16, padding: 14 }}>
          {renderSimulatedBarChart(charts.loanRepaymentTrends || [])}
        </View>

        {/* Recent Audit Activities */}
        <Text style={{ fontSize: 13, fontWeight: "700", color: themeTextColor, marginTop: 20, marginBottom: 10 }}>Recent Group Operations Log</Text>
        <View style={{ backgroundColor: themeCardBg, borderWidth: 1, borderColor: themeBorderColor, borderRadius: 16, padding: 14 }}>
          {metrics.recentActivities && metrics.recentActivities.length > 0 ? (
            metrics.recentActivities.map((act, idx) => (
              <View key={act.id} style={{ paddingVertical: 8, borderBottomWidth: idx < metrics.recentActivities.length - 1 ? 0.5 : 0, borderBottomColor: themeDividerColor }}>
                <Text style={{ fontSize: 12, fontWeight: "bold", color: themeTextColor }}>{act.action}</Text>
                <Text style={{ fontSize: 10, color: themeSubtitleColor, marginTop: 2 }}>Actor: {act.user_email} · IP: {act.ip_address || "Internal"}</Text>
                <Text style={{ fontSize: 9, color: themeSubtitleColor, marginTop: 1 }}>{new Date(act.timestamp).toLocaleString()}</Text>
              </View>
            ))
          ) : (
            <Text style={{ fontSize: 12, color: themeSubtitleColor, textAlign: "center" }}>No logs recorded yet.</Text>
          )}
        </View>

      </View>
    </ScrollView>
  );
}
