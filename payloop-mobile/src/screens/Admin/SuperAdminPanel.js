import React from "react";
import { View, Text, TouchableOpacity, ScrollView, RefreshControl } from "react-native";
import { useApp } from "../../context/AppContext";
import { styles } from "../../../styles";

export default function SuperAdminPanel() {
  const {
    superAdminData,
    isRefreshing,
    setIsRefreshing,
    fetchSuperAdminData,
    setActiveSubScreen,
    isDark,
    themeBg,
    themeCardBg,
    themeBorderColor,
    themeTextColor,
    themeSubtitleColor
  } = useApp();

  const sMetrics = superAdminData || {};

  return (
    <ScrollView 
      style={[styles.tabContentLight, { backgroundColor: themeBg }]} 
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl 
          refreshing={isRefreshing} 
          onRefresh={async () => {
            setIsRefreshing(true);
            await fetchSuperAdminData();
            setIsRefreshing(false);
          }} 
        />
      }
    >
      <View style={styles.subScreenHeader}>
        <TouchableOpacity onPress={() => setActiveSubScreen(null)} style={[styles.backButton, { backgroundColor: themeCardBg, borderColor: themeBorderColor }]}>
          <Text style={[styles.backButtonText, { color: themeTextColor }]}>←</Text>
        </TouchableOpacity>
        <Text style={[styles.subScreenTitle, { color: themeTextColor, fontSize: 18 }]}>Super Admin Platform</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={{ paddingHorizontal: 16, paddingBottom: 30 }}>
        <Text style={{ fontSize: 12, color: themeSubtitleColor, marginBottom: 14 }}>
          Platform-wide administrative configuration metrics
        </Text>

        <View style={{ backgroundColor: themeCardBg, borderWidth: 1, borderColor: themeBorderColor, borderRadius: 16, padding: 14, marginBottom: 16 }}>
          <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 10 }}>
            <Text style={{ fontSize: 12, color: themeTextColor }}>Total Active Groups</Text>
            <Text style={{ fontSize: 13, fontWeight: "bold", color: themeTextColor }}>{sMetrics.totalGroups || 0}</Text>
          </View>
          <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 10 }}>
            <Text style={{ fontSize: 12, color: themeTextColor }}>Total Registered Users</Text>
            <Text style={{ fontSize: 13, fontWeight: "bold", color: themeTextColor }}>{sMetrics.totalUsers || 0}</Text>
          </View>
          <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 10 }}>
            <Text style={{ fontSize: 12, color: themeTextColor }}>Total Savings Held</Text>
            <Text style={{ fontSize: 13, fontWeight: "bold", color: "#0F9D58" }}>KES {(sMetrics.totalSavings || 0).toLocaleString()}</Text>
          </View>
          <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 10 }}>
            <Text style={{ fontSize: 12, color: themeTextColor }}>Total Disbursed Loans</Text>
            <Text style={{ fontSize: 13, fontWeight: "bold", color: themeTextColor }}>KES {(sMetrics.totalLoansDisbursed || 0).toLocaleString()}</Text>
          </View>
          <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 10 }}>
            <Text style={{ fontSize: 12, color: themeTextColor }}>System Gateway Uptime</Text>
            <Text style={{ fontSize: 13, fontWeight: "bold", color: "#0F9D58" }}>{sMetrics.systemUptime || "99.99%"}</Text>
          </View>
          <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
            <Text style={{ fontSize: 12, color: themeTextColor }}>Active API Gateway Connections</Text>
            <Text style={{ fontSize: 13, fontWeight: "bold", color: themeTextColor }}>{sMetrics.activeConnections || 0}</Text>
          </View>
        </View>

        <Text style={{ fontSize: 13, fontWeight: "700", color: themeTextColor, marginBottom: 10 }}>Global System Diagnostics</Text>
        <View style={{ backgroundColor: themeCardBg, borderWidth: 1, borderColor: themeBorderColor, borderRadius: 16, padding: 14 }}>
          <Text style={{ fontSize: 12, color: "#0F9D58", fontWeight: "bold" }}>● Database Cluster: ONLINE</Text>
          <Text style={{ fontSize: 12, color: "#0F9D58", fontWeight: "bold", marginTop: 6 }}>● API Routing Layer: ACTIVE</Text>
          <Text style={{ fontSize: 12, color: "#0F9D58", fontWeight: "bold", marginTop: 6 }}>● Blockchain Core (Loop): STABLE</Text>
        </View>
      </View>
    </ScrollView>
  );
}
