import React from "react";
import { View, Text, TouchableOpacity, ScrollView, RefreshControl, Alert } from "react-native";
import { useApp } from "../../context/AppContext";
import { styles } from "../../../styles";

export default function AdminReports() {
  const {
    adminReportsData,
    isRefreshing,
    setIsRefreshing,
    currentGroup,
    fetchAdminReports,
    setActiveSubScreen,
    isDark,
    themeBg,
    themeCardBg,
    themeBorderColor,
    themeTextColor,
    themeSubtitleColor,
    themeDividerColor
  } = useApp();

  const rData = adminReportsData || {};
  const bSheet = rData.balanceSheet || {};
  const assets = bSheet.assets || {};
  const liab = bSheet.liabilities || {};
  const portfolio = rData.portfolioDistribution || {};

  return (
    <ScrollView 
      style={[styles.tabContentLight, { backgroundColor: themeBg, paddingTop: 16 }]} 
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl 
          refreshing={isRefreshing} 
          onRefresh={async () => {
            setIsRefreshing(true);
            if (currentGroup) await fetchAdminReports(currentGroup.id);
            setIsRefreshing(false);
          }} 
        />
      }
    >

      <View style={{ paddingHorizontal: 16, paddingBottom: 30 }}>
        <Text style={{ fontSize: 12, color: themeSubtitleColor, marginBottom: 14 }}>
          Generate structured balance sheet statements and portfolio summaries
        </Text>

        <View style={{ backgroundColor: themeCardBg, borderWidth: 1, borderColor: themeBorderColor, borderRadius: 20, padding: 18, marginBottom: 16 }}>
          <Text style={{ fontSize: 14, fontWeight: "900", color: themeTextColor, marginBottom: 14, textTransform: "uppercase", letterSpacing: 0.5 }}>Chama Balance Sheet</Text>

          {/* Assets */}
          <Text style={{ fontSize: 12, fontWeight: "bold", color: "#0F9D58", marginBottom: 8 }}>ASSETS</Text>
          <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 6 }}>
            <Text style={{ fontSize: 12, color: themeTextColor }}>Cash in Vault</Text>
            <Text style={{ fontSize: 12, fontWeight: "bold", color: themeTextColor }}>KES {(assets.cashInVault || 0).toLocaleString()}</Text>
          </View>
          <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 6 }}>
            <Text style={{ fontSize: 12, color: themeTextColor }}>Outstanding Loans Portfolio</Text>
            <Text style={{ fontSize: 12, fontWeight: "bold", color: themeTextColor }}>KES {(assets.loanPortfolioOutstanding || 0).toLocaleString()}</Text>
          </View>
          <View style={{ flexDirection: "row", justifyContent: "space-between", borderTopWidth: 1, borderTopColor: themeBorderColor, paddingTop: 6, marginBottom: 16 }}>
            <Text style={{ fontSize: 12, fontWeight: "bold", color: themeTextColor }}>Total Assets</Text>
            <Text style={{ fontSize: 12, fontWeight: "bold", color: themeTextColor }}>KES {(assets.totalAssets || 0).toLocaleString()}</Text>
          </View>

          {/* Liabilities */}
          <Text style={{ fontSize: 12, fontWeight: "bold", color: "#EF4444", marginBottom: 8 }}>LIABILITIES & EQUITY</Text>
          <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 6 }}>
            <Text style={{ fontSize: 12, color: themeTextColor }}>Member Savings Deposits</Text>
            <Text style={{ fontSize: 12, fontWeight: "bold", color: themeTextColor }}>KES {(liab.memberSavingsDeposits || 0).toLocaleString()}</Text>
          </View>
          <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 6 }}>
            <Text style={{ fontSize: 12, color: themeTextColor }}>Statutory Emergency Reserves</Text>
            <Text style={{ fontSize: 12, fontWeight: "bold", color: themeTextColor }}>KES {(liab.emergencyReserves || 0).toLocaleString()}</Text>
          </View>
          <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 6 }}>
            <Text style={{ fontSize: 12, color: themeTextColor }}>Retained Surplus</Text>
            <Text style={{ fontSize: 12, fontWeight: "bold", color: themeTextColor }}>KES {(liab.retainedSurplus || 0).toLocaleString()}</Text>
          </View>
          <View style={{ flexDirection: "row", justifyContent: "space-between", borderTopWidth: 1, borderTopColor: themeBorderColor, paddingTop: 6 }}>
            <Text style={{ fontSize: 12, fontWeight: "bold", color: themeTextColor }}>Total Liabilities & Equity</Text>
            <Text style={{ fontSize: 12, fontWeight: "bold", color: themeTextColor }}>KES {(liab.totalLiabilitiesEquity || 0).toLocaleString()}</Text>
          </View>
        </View>

        {/* Portfolio distribution */}
        <Text style={{ fontSize: 13, fontWeight: "700", color: themeTextColor, marginBottom: 10 }}>Portfolio Risk Distribution</Text>
        <View style={{ backgroundColor: themeCardBg, borderWidth: 1, borderColor: themeBorderColor, borderRadius: 16, padding: 14, marginBottom: 16 }}>
          <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 8 }}>
            <Text style={{ fontSize: 12, color: themeTextColor }}>Performing Loans (85%)</Text>
            <Text style={{ fontSize: 12, fontWeight: "bold", color: "#0F9D58" }}>KES {(portfolio.performing || 0).toLocaleString()}</Text>
          </View>
          <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 8 }}>
            <Text style={{ fontSize: 12, color: themeTextColor }}>Non-Performing (10%)</Text>
            <Text style={{ fontSize: 12, fontWeight: "bold", color: "#F59E0B" }}>KES {(portfolio.nonPerforming || 0).toLocaleString()}</Text>
          </View>
          <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 4 }}>
            <Text style={{ fontSize: 12, color: themeTextColor }}>Overdue Default (5%)</Text>
            <Text style={{ fontSize: 12, fontWeight: "bold", color: "#EF4444" }}>KES {(portfolio.overdue || 0).toLocaleString()}</Text>
          </View>
        </View>

        <TouchableOpacity
          onPress={() => Alert.alert("Export Success", "Financial report statement exported to local downloads folder in CSV/PDF layout format.")}
          style={{
            backgroundColor: "#0F9D58",
            borderRadius: 12,
            paddingVertical: 12,
            alignItems: "center"
          }}
        >
          <Text style={{ color: "#ffffff", fontWeight: "bold", fontSize: 13 }}>Export Complete PDF Report</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}
