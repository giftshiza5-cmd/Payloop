import React from "react";
import { View, Text, TouchableOpacity, ScrollView, RefreshControl, TextInput, Share } from "react-native";
import { useApp } from "../../context/AppContext";
import { styles } from "../../../styles";

export default function AdminApprovals() {
  const {
    adminApprovalsList,
    appSubTab,
    setAppSubTab,
    selectedApprovalIds,
    setSelectedApprovalIds,
    setIsDashboardLoading,
    fetchWithTimeout,
    BACKEND_URL,
    currentGroup,
    selectedUser,
    fetchAdminApprovals,
    showBanner,
    reviewNotes,
    setReviewNotes,
    isRefreshing,
    setIsRefreshing,
    setActiveSubScreen,
    isDark,
    themeBg,
    themeCardBg,
    themeBorderColor,
    themeTextColor,
    themeSubtitleColor,
    themeDividerColor
  } = useApp();

  const filteredList = adminApprovalsList.filter(app => {
    if (appSubTab === "All") return true;
    if (appSubTab === "Loans") return app.approval_type === "Loan";
    if (appSubTab === "Join Requests") return app.approval_type === "JoinRequest";
    if (appSubTab === "KYC") return app.approval_type === "KYC";
    if (appSubTab === "Withdrawals") return app.approval_type === "Withdrawal";
    return true;
  });

  const toggleSelectApproval = (id) => {
    if (selectedApprovalIds.includes(id)) {
      setSelectedApprovalIds(selectedApprovalIds.filter(x => x !== id));
    } else {
      setSelectedApprovalIds([...selectedApprovalIds, id]);
    }
  };

  const handleBulkApprove = async () => {
    setIsDashboardLoading(true);
    for (const id of selectedApprovalIds) {
      await fetchWithTimeout(`${BACKEND_URL}/api/admin/approvals/${currentGroup.id}/action`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ approvalId: id, action: "Approve", reviewNotes: "Bulk approved by group administrator", email: selectedUser.email })
      });
    }
    setSelectedApprovalIds([]);
    if (currentGroup) fetchAdminApprovals(currentGroup.id);
    showBanner("Selected requests bulk-approved successfully", "success");
    setIsDashboardLoading(false);
  };

  const handleApproveAction = async (approvalId, action) => {
    try {
      const res = await fetchWithTimeout(`${BACKEND_URL}/api/admin/approvals/${currentGroup.id}/action`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          approvalId,
          action,
          reviewNotes,
          email: selectedUser.email
        })
      });
      if (res.ok) {
        showBanner(`Workflow request ${action === "Approve" ? "approved" : "rejected"}`, "success");
        setReviewNotes("");
        if (currentGroup) fetchAdminApprovals(currentGroup.id);
      }
    } catch (e) {
      console.log("Error processing approval:", e);
    }
  };

  return (
    <ScrollView 
      style={[styles.tabContentLight, { backgroundColor: themeBg }]} 
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl 
          refreshing={isRefreshing} 
          onRefresh={async () => {
            setIsRefreshing(true);
            if (currentGroup) await fetchAdminApprovals(currentGroup.id);
            setIsRefreshing(false);
          }} 
        />
      }
    >
      <View style={styles.subScreenHeader}>
        <TouchableOpacity onPress={() => setActiveSubScreen(null)} style={[styles.backButton, { backgroundColor: themeCardBg, borderColor: themeBorderColor }]}>
          <Text style={[styles.backButtonText, { color: themeTextColor }]}>←</Text>
        </TouchableOpacity>
        <Text style={[styles.subScreenTitle, { color: themeTextColor, fontSize: 18 }]}>Approvals Workflow Center</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={{ paddingHorizontal: 16, paddingBottom: 30 }}>
        <Text style={{ fontSize: 12, color: themeSubtitleColor, marginBottom: 14 }}>
          Verify identity documents, register new members, and confirm fund disbursements
        </Text>

        {/* Workflow Tabs */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flexDirection: "row", marginBottom: 14 }}>
          {["All", "Loans", "Join Requests", "KYC", "Withdrawals"].map(tab => (
            <TouchableOpacity
              key={tab}
              onPress={() => setAppSubTab(tab)}
              style={{
                paddingHorizontal: 14,
                paddingVertical: 8,
                borderRadius: 10,
                backgroundColor: appSubTab === tab ? "#0F9D58" : themeCardBg,
                borderWidth: 1,
                borderColor: themeBorderColor,
                marginRight: 8
              }}
            >
              <Text style={{ fontSize: 12, fontWeight: "bold", color: appSubTab === tab ? "#ffffff" : themeTextColor }}>{tab}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Bulk Action Button */}
        {selectedApprovalIds.length > 0 && (
          <TouchableOpacity
            onPress={handleBulkApprove}
            style={{
              backgroundColor: "#0F9D58",
              borderRadius: 12,
              paddingVertical: 12,
              alignItems: "center",
              marginBottom: 14
            }}
          >
            <Text style={{ color: "#ffffff", fontWeight: "bold", fontSize: 13 }}>Bulk Approve ({selectedApprovalIds.length} items)</Text>
          </TouchableOpacity>
        )}

        {/* List items */}
        {filteredList.length > 0 ? (
          filteredList.map(item => {
            const payload = item.data || {};
            const isSelected = selectedApprovalIds.includes(item.id);
            return (
              <View
                key={item.id}
                style={{
                  backgroundColor: themeCardBg,
                  borderWidth: isSelected ? 2 : 1,
                  borderColor: isSelected ? "#0F9D58" : themeBorderColor,
                  borderRadius: 16,
                  padding: 14,
                  marginBottom: 12
                }}
              >
                <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <TouchableOpacity onPress={() => toggleSelectApproval(item.id)} style={{ flexDirection: "row", gap: 10, flex: 1 }}>
                    <View style={{ width: 20, height: 20, borderRadius: 4, borderWidth: 2, borderColor: isSelected ? "#0F9D58" : themeSubtitleColor, alignItems: "center", justifyContent: "center" }}>
                      {isSelected && <View style={{ width: 10, height: 10, borderRadius: 2, backgroundColor: "#0F9D58" }} />}
                    </View>
                    <View style={{ flex: 1 }}>
                      <View style={{ flexDirection: "row", gap: 6, alignItems: "center" }}>
                        <View style={{ backgroundColor: "rgba(16, 185, 129, 0.15)", borderRadius: 6, paddingHorizontal: 6, paddingVertical: 2 }}>
                          <Text style={{ fontSize: 10, fontWeight: "bold", color: "#10B981" }}>{item.approval_type}</Text>
                        </View>
                        <Text style={{ fontSize: 11, color: themeSubtitleColor }}>{item.status}</Text>
                      </View>
                      <Text style={{ fontSize: 13, fontWeight: "800", color: themeTextColor, marginTop: 6 }}>
                        Applicant: {item.requested_by}
                      </Text>
                    </View>
                  </TouchableOpacity>
                </View>

                {/* Dynamic payloads rendering */}
                <View style={{ backgroundColor: isDark ? "#0F172A" : "#F8FAFC", borderRadius: 8, padding: 10, marginTop: 10 }}>
                  {item.approval_type === "Loan" && (
                    <>
                      <Text style={{ fontSize: 12, color: themeTextColor }}>Amount: KES {(parseFloat(payload.amount) || 0).toLocaleString()}</Text>
                      <Text style={{ fontSize: 12, color: themeTextColor, marginTop: 2 }}>Duration: {payload.duration} months · Interest: {payload.interest_rate}%</Text>
                      <Text style={{ fontSize: 11, color: themeSubtitleColor, marginTop: 4 }}>Purpose: {payload.purpose}</Text>
                    </>
                  )}
                  {item.approval_type === "JoinRequest" && (
                    <>
                      <Text style={{ fontSize: 12, color: themeTextColor }}>Name: {payload.name}</Text>
                      <Text style={{ fontSize: 12, color: themeTextColor, marginTop: 2 }}>Email: {payload.email} · Phone: {payload.phone}</Text>
                    </>
                  )}
                  {item.approval_type === "KYC" && (
                    <>
                      <Text style={{ fontSize: 12, color: themeTextColor }}>Document: {payload.doc_type}</Text>
                      <Text style={{ fontSize: 11, color: "#3B82F6", textDecorationLine: "underline", marginTop: 4 }} onPress={() => Share.share({ message: payload.file_url })}>View Identity Document</Text>
                    </>
                  )}
                  {item.approval_type === "Withdrawal" && (
                    <>
                      <Text style={{ fontSize: 12, color: themeTextColor }}>Amount to withdraw: KES {(parseFloat(payload.amount) || 0).toLocaleString()}</Text>
                    </>
                  )}
                </View>

                {item.status === "Pending" && (
                  <View style={{ marginTop: 12 }}>
                    <TextInput
                      style={{
                        backgroundColor: isDark ? "#0F172A" : "#F3F4F6",
                        borderWidth: 1,
                        borderColor: themeBorderColor,
                        borderRadius: 8,
                        padding: 8,
                        fontSize: 12,
                        color: themeTextColor,
                        marginBottom: 10
                      }}
                      placeholder="Add review notes (optional)..."
                      placeholderTextColor={themeSubtitleColor}
                      value={reviewNotes}
                      onChangeText={setReviewNotes}
                    />
                    <View style={{ flexDirection: "row", gap: 10 }}>
                      <TouchableOpacity
                        onPress={() => handleApproveAction(item.id, "Reject")}
                        style={{ flex: 1, borderHeight: 1, borderColor: "#EF4444", borderWidth: 1, borderRadius: 10, paddingVertical: 8, alignItems: "center" }}
                      >
                        <Text style={{ color: "#EF4444", fontSize: 12, fontWeight: "bold" }}>Reject</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => handleApproveAction(item.id, "Approve")}
                        style={{ flex: 1, backgroundColor: "#0F9D58", borderRadius: 10, paddingVertical: 8, alignItems: "center" }}
                      >
                        <Text style={{ color: "#ffffff", fontSize: 12, fontWeight: "bold" }}>Approve</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                )}
              </View>
            );
          })
        ) : (
          <View style={{ backgroundColor: themeCardBg, borderWidth: 1, borderColor: themeBorderColor, borderRadius: 16, padding: 30, alignItems: "center" }}>
            <Text style={{ fontSize: 13, color: themeSubtitleColor }}>No pending approval items for this category.</Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
}
