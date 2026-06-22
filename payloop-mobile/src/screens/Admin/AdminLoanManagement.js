import React from "react";
import { View, Text, TouchableOpacity, ScrollView, RefreshControl, TextInput } from "react-native";
import { useApp } from "../../context/AppContext";
import { styles } from "../../../styles";

export default function AdminLoanManagement() {
  const {
    adminLoansAnalytics,
    restructureLoanId,
    setRestructureLoanId,
    newLoanDuration,
    setNewLoanDuration,
    newLoanInterest,
    setNewLoanInterest,
    adminLoansList,
    isRefreshing,
    setIsRefreshing,
    fetchWithTimeout,
    BACKEND_URL,
    currentGroup,
    selectedUser,
    showBanner,
    fetchAdminLoans,
    setActiveSubScreen,
    isDark,
    themeBg,
    themeCardBg,
    themeBorderColor,
    themeTextColor,
    themeSubtitleColor,
    themeDividerColor
  } = useApp();

  const analytics = adminLoansAnalytics || {};

  const handleRestructureLoan = async () => {
    try {
      const res = await fetchWithTimeout(`${BACKEND_URL}/api/admin/loans/${restructureLoanId}/restructure`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          newDuration: newLoanDuration,
          newInterestRate: newLoanInterest,
          email: selectedUser.email,
          groupId: currentGroup.id
        })
      });
      if (res.ok) {
        showBanner("Loan terms restructured", "success");
        setRestructureLoanId(null);
        setNewLoanDuration("");
        setNewLoanInterest("");
        fetchAdminLoans(currentGroup.id);
      }
    } catch (e) {
      console.log("Error restructuring loan:", e);
    }
  };

  const handleWaivePenalty = async (loanId) => {
    try {
      const res = await fetchWithTimeout(`${BACKEND_URL}/api/admin/loans/${loanId}/waive-penalty`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: selectedUser.email,
          groupId: currentGroup.id
        })
      });
      if (res.ok) {
        showBanner("Loan penalty waived successfully", "success");
        fetchAdminLoans(currentGroup.id);
      }
    } catch (e) {
      console.log("Error waiving penalty:", e);
    }
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
            if (currentGroup) await fetchAdminLoans(currentGroup.id);
            setIsRefreshing(false);
          }} 
        />
      }
    >

      <View style={{ paddingHorizontal: 16, paddingBottom: 30 }}>
        <Text style={{ fontSize: 12, color: themeSubtitleColor, marginBottom: 16 }}>
          Track risk scores, restructure outstanding terms, or waive penalties
        </Text>

        {/* Portfolio metrics */}
        <View style={{ backgroundColor: themeCardBg, borderWidth: 1, borderColor: themeBorderColor, borderRadius: 16, padding: 14, marginBottom: 16, flexDirection: "row" }}>
          <View style={{ flex: 1, alignItems: "center" }}>
            <Text style={{ fontSize: 10, color: themeSubtitleColor }}>Total Disbursed</Text>
            <Text style={{ fontSize: 14, fontWeight: "800", color: themeTextColor, marginTop: 4 }}>KES {(analytics.totalDisbursed || 0).toLocaleString()}</Text>
          </View>
          <View style={{ width: 1, backgroundColor: themeDividerColor, height: "100%" }} />
          <View style={{ flex: 1, alignItems: "center" }}>
            <Text style={{ fontSize: 10, color: themeSubtitleColor }}>Outstanding Portfolio</Text>
            <Text style={{ fontSize: 14, fontWeight: "800", color: "#F59E0B", marginTop: 4 }}>KES {(analytics.outstandingAmount || 0).toLocaleString()}</Text>
          </View>
          <View style={{ width: 1, backgroundColor: themeDividerColor, height: "100%" }} />
          <View style={{ flex: 1, alignItems: "center" }}>
            <Text style={{ fontSize: 10, color: themeSubtitleColor }}>Overdue Count</Text>
            <Text style={{ fontSize: 14, fontWeight: "800", color: "#EF4444", marginTop: 4 }}>{analytics.overdueCount || 0}</Text>
          </View>
        </View>

        {/* Restructure Sub-Modal Form */}
        {restructureLoanId && (
          <View style={{ backgroundColor: themeCardBg, borderWidth: 2, borderColor: "#3B82F6", borderRadius: 16, padding: 14, marginBottom: 16 }}>
            <Text style={{ fontSize: 13, fontWeight: "bold", color: themeTextColor, marginBottom: 10 }}>Restructure Loan Terms</Text>
            
            <Text style={{ fontSize: 11, color: themeSubtitleColor }}>New Duration (Months)</Text>
            <TextInput
              style={{
                backgroundColor: isDark ? "#0F172A" : "#F3F4F6",
                borderWidth: 1,
                borderColor: themeBorderColor,
                borderRadius: 8,
                padding: 8,
                fontSize: 12,
                color: themeTextColor,
                marginTop: 4,
                marginBottom: 10
              }}
              value={newLoanDuration}
              onChangeText={setNewLoanDuration}
              keyboardType="numeric"
            />

            <Text style={{ fontSize: 11, color: themeSubtitleColor }}>New Interest Rate (%)</Text>
            <TextInput
              style={{
                backgroundColor: isDark ? "#0F172A" : "#F3F4F6",
                borderWidth: 1,
                borderColor: themeBorderColor,
                borderRadius: 8,
                padding: 8,
                fontSize: 12,
                color: themeTextColor,
                marginTop: 4,
                marginBottom: 12
              }}
              value={newLoanInterest}
              onChangeText={setNewLoanInterest}
              keyboardType="numeric"
            />

            <View style={{ flexDirection: "row", gap: 10 }}>
              <TouchableOpacity
                onPress={() => setRestructureLoanId(null)}
                style={{ flex: 1, borderHeight: 1, borderColor: themeSubtitleColor, borderWidth: 1, borderRadius: 8, paddingVertical: 8, alignItems: "center" }}
              >
                <Text style={{ color: themeSubtitleColor, fontSize: 12 }}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleRestructureLoan}
                style={{ flex: 1, backgroundColor: "#3B82F6", borderRadius: 8, paddingVertical: 8, alignItems: "center" }}
              >
                <Text style={{ color: "#ffffff", fontSize: 12, fontWeight: "bold" }}>Apply Changes</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Loans list */}
        {adminLoansList.length > 0 ? (
          adminLoansList.map(loan => {
            const isOverdue = loan.status === "Overdue";
            return (
              <View
                key={loan.id}
                style={{
                  backgroundColor: themeCardBg,
                  borderWidth: 1,
                  borderColor: isOverdue ? "#EF4444" : themeBorderColor,
                  borderRadius: 16,
                  padding: 14,
                  marginBottom: 12
                }}
              >
                <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                  <Text style={{ fontSize: 14, fontWeight: "800", color: themeTextColor }}>{loan.borrower}</Text>
                  <View style={{ backgroundColor: isOverdue ? "rgba(239, 68, 68, 0.15)" : "rgba(16, 185, 129, 0.15)", borderRadius: 6, paddingHorizontal: 6, paddingVertical: 2 }}>
                    <Text style={{ fontSize: 10, fontWeight: "bold", color: isOverdue ? "#EF4444" : "#10B981" }}>{loan.status}</Text>
                  </View>
                </View>

                <Text style={{ fontSize: 12, color: themeSubtitleColor, marginTop: 4 }}>Email: {loan.user_email}</Text>
                
                <View style={{ marginVertical: 10, padding: 10, borderRadius: 8, backgroundColor: isDark ? "#0F172A" : "#F8FAFC" }}>
                  <Text style={{ fontSize: 12, color: themeTextColor }}>Requested: KES {(parseFloat(loan.amount) || 0).toLocaleString()}</Text>
                  <Text style={{ fontSize: 12, color: themeTextColor, marginTop: 2 }}>Terms: {loan.duration} Months @ {loan.interest_rate}% Interest</Text>
                  <Text style={{ fontSize: 11, color: themeSubtitleColor, marginTop: 4 }}>Purpose: {loan.purpose}</Text>
                  <Text style={{ fontSize: 11, color: themeSubtitleColor, marginTop: 2 }}>Repayment Date: {loan.repayment_deadline > 0 ? new Date(loan.repayment_deadline * 1000).toLocaleDateString() : "Consensus Pending"}</Text>
                </View>

                {loan.approved && !loan.repaid && (
                  <View style={{ flexDirection: "row", gap: 10, marginTop: 6 }}>
                    <TouchableOpacity
                      onPress={() => {
                        setRestructureLoanId(loan.id);
                        setNewLoanDuration(loan.duration?.toString() || "");
                        setNewLoanInterest(loan.interest_rate?.toString() || "");
                      }}
                      style={{ flex: 1, borderHeight: 1, borderColor: "#3B82F6", borderWidth: 1, borderRadius: 8, paddingVertical: 6, alignItems: "center" }}
                    >
                      <Text style={{ color: "#3B82F6", fontSize: 11, fontWeight: "bold" }}>Restructure</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => handleWaivePenalty(loan.id)}
                      style={{ flex: 1, borderHeight: 1, borderColor: "#F59E0B", borderWidth: 1, borderRadius: 8, paddingVertical: 6, alignItems: "center" }}
                    >
                      <Text style={{ color: "#F59E0B", fontSize: 11, fontWeight: "bold" }}>Waive</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => showBanner(`Simulated SMS reminder broadcasted to ${loan.borrower}`, "info")}
                      style={{ flex: 1, backgroundColor: themeDividerColor, borderRadius: 8, paddingVertical: 6, alignItems: "center" }}
                    >
                      <Text style={{ color: themeTextColor, fontSize: 11 }}>Nudge SMS</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            );
          })
        ) : (
          <View style={{ backgroundColor: themeCardBg, borderWidth: 1, borderColor: themeBorderColor, borderRadius: 16, padding: 30, alignItems: "center" }}>
            <Text style={{ fontSize: 13, color: themeSubtitleColor }}>No loan records found.</Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
}
