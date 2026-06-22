import React, { useState } from "react";
import { View, Text, TouchableOpacity, ScrollView, RefreshControl, TextInput } from "react-native";
import { useApp } from "../../context/AppContext";
import { styles } from "../../../styles";

export default function AdminMemberManagement() {
  const {
    adminMembersList,
    currentGroup,
    selectedUser,
    fetchAdminMembers,
    showBanner,
    fetchWithTimeout,
    BACKEND_URL,
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

  const [adminMemberSearch, setAdminMemberSearch] = useState("");

  const filteredMembers = adminMembersList.filter(m => 
    m.name?.toLowerCase().includes(adminMemberSearch.toLowerCase()) ||
    m.email?.toLowerCase().includes(adminMemberSearch.toLowerCase())
  );

  const handleUpdateRole = async (userEmail, role) => {
    try {
      const res = await fetchWithTimeout(`${BACKEND_URL}/api/admin/members/${currentGroup.id}/${userEmail}/role`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role, email: selectedUser.email })
      });
      if (res.ok) {
        showBanner("Member role updated", "success");
        fetchAdminMembers(currentGroup.id);
      }
    } catch (e) {
      console.log("Error updating role:", e);
    }
  };

  const handleSuspendUser = async (userEmail, suspend) => {
    try {
      const res = await fetchWithTimeout(`${BACKEND_URL}/api/admin/members/${currentGroup.id}/${userEmail}/suspend`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ suspend, email: selectedUser.email })
      });
      if (res.ok) {
        showBanner(`User ${suspend ? "suspended" : "reactivated"}`, "success");
        fetchAdminMembers(currentGroup.id);
      }
    } catch (e) {
      console.log("Error suspending user:", e);
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
            if (currentGroup) await fetchAdminMembers(currentGroup.id);
            setIsRefreshing(false);
          }} 
        />
      }
    >

      <View style={{ paddingHorizontal: 16, paddingBottom: 30 }}>
        <Text style={{ fontSize: 12, color: themeSubtitleColor, marginBottom: 14 }}>
          Monitor individual savings growth and administer group role adjustments
        </Text>

        {/* Search bar */}
        <TextInput
          style={{
            backgroundColor: themeCardBg,
            borderWidth: 1,
            borderColor: themeBorderColor,
            borderRadius: 12,
            padding: 10,
            fontSize: 12,
            color: themeTextColor,
            marginBottom: 14
          }}
          placeholder="Search members by name or email..."
          placeholderTextColor={themeSubtitleColor}
          value={adminMemberSearch}
          onChangeText={setAdminMemberSearch}
        />

        {/* Members list */}
        {filteredMembers.length > 0 ? (
          filteredMembers.map(member => (
            <View
              key={member.email}
              style={{
                backgroundColor: themeCardBg,
                borderWidth: 1,
                borderColor: themeBorderColor,
                borderRadius: 16,
                padding: 14,
                marginBottom: 12
              }}
            >
              <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                <View style={{ flexDirection: "row", gap: 10, alignItems: "center" }}>
                  <View style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: isDark ? "#1E293B" : "#F3F4F6", alignItems: "center", justifyContent: "center" }}>
                    <Text style={{ fontSize: 16 }}>{member.avatar || "👤"}</Text>
                  </View>
                  <View>
                    <Text style={{ fontSize: 14, fontWeight: "800", color: themeTextColor }}>{member.name}</Text>
                    <Text style={{ fontSize: 11, color: themeSubtitleColor }}>{member.email}</Text>
                  </View>
                </View>
                <View style={{ backgroundColor: member.role === "Admin" ? "#FBBF24" : themeDividerColor, borderRadius: 6, paddingHorizontal: 6, paddingVertical: 2 }}>
                  <Text style={{ fontSize: 9, fontWeight: "900", color: member.role === "Admin" ? "#78350F" : themeSubtitleColor }}>{member.role.toUpperCase()}</Text>
                </View>
              </View>

              {/* Savings and Loans breakdown */}
              <View style={{ flexDirection: "row", marginTop: 12, padding: 10, borderRadius: 8, backgroundColor: isDark ? "#0F172A" : "#F8FAFC" }}>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 10, color: themeSubtitleColor }}>Savings Balance</Text>
                  <Text style={{ fontSize: 12, fontWeight: "bold", color: "#0F9D58", marginTop: 2 }}>KES {(parseFloat(member.savings) || 0).toLocaleString()}</Text>
                </View>
                <View style={{ width: 1, backgroundColor: themeBorderColor, height: "100%" }} />
                <View style={{ flex: 1, paddingLeft: 10 }}>
                  <Text style={{ fontSize: 10, color: themeSubtitleColor }}>Active Debt</Text>
                  <Text style={{ fontSize: 12, fontWeight: "bold", color: (parseFloat(member.active_loan) || 0) > 0 ? "#EF4444" : themeTextColor, marginTop: 2 }}>KES {(parseFloat(member.active_loan) || 0).toLocaleString()}</Text>
                </View>
                <View style={{ width: 1, backgroundColor: themeBorderColor, height: "100%" }} />
                <View style={{ flex: 1, paddingLeft: 10 }}>
                  <Text style={{ fontSize: 10, color: themeSubtitleColor }}>Credit Score</Text>
                  <Text style={{ fontSize: 12, fontWeight: "bold", color: themeTextColor, marginTop: 2 }}>⭐ {member.credit_score || 500}</Text>
                </View>
              </View>

              <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 10 }}>
                <Text style={{ fontSize: 11, color: themeSubtitleColor }}>Status: {member.status} · KYC: {member.verification_level}</Text>
                <View style={{ flexDirection: "row", gap: 6 }}>
                  <TouchableOpacity
                    onPress={() => handleUpdateRole(member.email, member.role === "Admin" ? "Member" : "Admin")}
                    style={{
                      paddingHorizontal: 8,
                      paddingVertical: 5,
                      borderRadius: 6,
                      backgroundColor: isDark ? "#1E293B" : "#F3F4F6",
                      borderWidth: 0.5,
                      borderColor: themeBorderColor
                    }}
                  >
                    <Text style={{ fontSize: 10, fontWeight: "bold", color: themeTextColor }}>{member.role === "Admin" ? "Demote" : "Promote"}</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => handleSuspendUser(member.email, member.status !== "Suspended")}
                    style={{
                      paddingHorizontal: 8,
                      paddingVertical: 5,
                      borderRadius: 6,
                      backgroundColor: member.status === "Suspended" ? "rgba(16, 185, 129, 0.15)" : "rgba(239, 68, 68, 0.15)",
                      borderWidth: 0.5,
                      borderColor: themeBorderColor
                    }}
                  >
                    <Text style={{ fontSize: 10, fontWeight: "bold", color: member.status === "Suspended" ? "#10B981" : "#EF4444" }}>
                      {member.status === "Suspended" ? "Activate" : "Suspend"}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

            </View>
          ))
        ) : (
          <View style={{ backgroundColor: themeCardBg, borderWidth: 1, borderColor: themeBorderColor, borderRadius: 16, padding: 30, alignItems: "center" }}>
            <Text style={{ fontSize: 13, color: themeSubtitleColor }}>No member profiles matched your query.</Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
}
