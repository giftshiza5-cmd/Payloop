import React from "react";
import { View, Text, TouchableOpacity, ScrollView, RefreshControl, Platform } from "react-native";
import { useApp } from "../../context/AppContext";
import { styles } from "../../../styles";

export default function AdminSecurity() {
  const {
    adminAuditLogs,
    isRefreshing,
    setIsRefreshing,
    currentGroup,
    fetchAdminAuditLogs,
    showBanner,
    setActiveSubScreen,
    isDark,
    themeBg,
    themeCardBg,
    themeBorderColor,
    themeTextColor,
    themeSubtitleColor
  } = useApp();

  return (
    <ScrollView 
      style={[styles.tabContentLight, { backgroundColor: themeBg }]} 
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl 
          refreshing={isRefreshing} 
          onRefresh={async () => {
            setIsRefreshing(true);
            if (currentGroup) await fetchAdminAuditLogs(currentGroup.id);
            setIsRefreshing(false);
          }} 
        />
      }
    >
      <View style={styles.subScreenHeader}>
        <TouchableOpacity onPress={() => setActiveSubScreen(null)} style={[styles.backButton, { backgroundColor: themeCardBg, borderColor: themeBorderColor }]}>
          <Text style={[styles.backButtonText, { color: themeTextColor }]}>←</Text>
        </TouchableOpacity>
        <Text style={[styles.subScreenTitle, { color: themeTextColor, fontSize: 18 }]}>Security & Operations</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={{ paddingHorizontal: 16, paddingBottom: 30 }}>
        <Text style={{ fontSize: 12, color: themeSubtitleColor, marginBottom: 14 }}>
          Monitor admin changes, session activities and audit ledgers
        </Text>

        {/* MFA Simulated Toggle */}
        <View style={{ backgroundColor: themeCardBg, borderWidth: 1, borderColor: themeBorderColor, borderRadius: 16, padding: 14, marginBottom: 16, flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
          <View style={{ flex: 1, marginRight: 10 }}>
            <Text style={{ fontSize: 13, fontWeight: "bold", color: themeTextColor }}>Enforce Multi-Factor PIN</Text>
            <Text style={{ fontSize: 10, color: themeSubtitleColor, marginTop: 2 }}>Require 2FA pin authorization on withdrawals</Text>
          </View>
          <TouchableOpacity onPress={() => showBanner("2FA enforcement updated for this group", "success")} style={{ backgroundColor: "#0F9D58", paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 }}>
            <Text style={{ color: "#ffffff", fontSize: 11, fontWeight: "bold" }}>Enabled</Text>
          </TouchableOpacity>
        </View>

        {/* Audit Logs list */}
        <Text style={{ fontSize: 13, fontWeight: "700", color: themeTextColor, marginBottom: 10 }}>Complete Activity Audit Log</Text>
        {adminAuditLogs.length > 0 ? (
          adminAuditLogs.map(log => (
            <View
              key={log.id}
              style={{
                backgroundColor: themeCardBg,
                borderWidth: 1,
                borderColor: themeBorderColor,
                borderRadius: 12,
                padding: 12,
                marginBottom: 10
              }}
            >
              <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                <Text style={{ fontSize: 12, fontWeight: "bold", color: themeTextColor }}>{log.action}</Text>
                <Text style={{ fontSize: 9, color: themeSubtitleColor }}>IP: {log.ip_address || "Internal"}</Text>
              </View>
              <Text style={{ fontSize: 11, color: themeSubtitleColor, marginTop: 2 }}>User: {log.user_email}</Text>
              {log.details && (
                <Text style={{ fontSize: 10, color: themeSubtitleColor, fontFamily: Platform.OS === "ios" ? "Courier" : "monospace", marginTop: 4 }}>
                  Details: {log.details}
                </Text>
              )}
              <Text style={{ fontSize: 9, color: themeSubtitleColor, marginTop: 4 }}>
                {new Date(log.timestamp).toLocaleString()}
              </Text>
            </View>
          ))
        ) : (
          <View style={{ backgroundColor: themeCardBg, borderWidth: 1, borderColor: themeBorderColor, borderRadius: 16, padding: 30, alignItems: "center" }}>
            <Text style={{ fontSize: 13, color: themeSubtitleColor }}>No activity logs recorded.</Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
}
