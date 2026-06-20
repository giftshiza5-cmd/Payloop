import React from "react";
import { View, Text, TouchableOpacity, ScrollView, Alert } from "react-native";
import { useApp } from "../../context/AppContext";
import { styles } from "../../../styles";

export default function WalletDetails() {
  const {
    showBanner,
    selectedUser,
    formatValue,
    setActiveSubScreen,
    isDark,
    themeBg,
    themeCardBg,
    themeBorderColor,
    themeTextColor,
    themeSubtitleColor
  } = useApp();

  const handleCopy = () => {
    showBanner("Wallet Address copied to clipboard!", "success");
  };

  return (
    <ScrollView style={[styles.tabContentLight, { backgroundColor: themeBg }]} showsVerticalScrollIndicator={false}>
      <View style={styles.subScreenHeader}>
        <TouchableOpacity onPress={() => setActiveSubScreen(null)} style={[styles.backButton, { backgroundColor: themeCardBg, borderColor: themeBorderColor }]}>
          <Text style={[styles.backButtonText, { color: themeTextColor }]}>←</Text>
        </TouchableOpacity>
        <Text style={[styles.subScreenTitle, { color: themeTextColor }]}>Wallet Settings</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={[styles.detailCardBox, { backgroundColor: themeCardBg, borderColor: themeBorderColor }]}>
        <View style={styles.walletStatusRow}>
          <Text style={[styles.detailCardHeader, { color: themeTextColor }]}>Web3 Ledger Node</Text>
          <View style={styles.statusPillGreen}>
            <Text style={styles.statusPillGreenText}>Connected</Text>
          </View>
        </View>

        <View style={[styles.detailItemRow, { borderColor: themeBorderColor }]}>
          <Text style={[styles.detailLabel, { color: themeSubtitleColor }]}>Network</Text>
          <Text style={[styles.detailValue, { color: themeTextColor }]}>Polygon Amoy (Testnet)</Text>
        </View>

        <View style={[styles.detailItemRow, { borderColor: themeBorderColor }]}>
          <Text style={[styles.detailLabel, { color: themeSubtitleColor }]}>Wallet Balance</Text>
          <Text style={[styles.detailValue, { color: "#0F9D58", fontWeight: "800" }]}>{formatValue(selectedUser?.balance || 0)}</Text>
        </View>

        <View style={[styles.walletAddressBox, { borderColor: themeBorderColor, backgroundColor: isDark ? "#0F172A" : "#F9FAFB" }]}>
          <Text style={[styles.walletAddressLabel, { color: themeSubtitleColor }]}>On-chain Wallet Address</Text>
          <View style={styles.addressStringCopyRow}>
            <Text style={[styles.walletAddressTextMonospace, { color: themeTextColor }]}>{selectedUser?.address}</Text>
            <TouchableOpacity onPress={handleCopy} style={[styles.addressCopyBtnSmall, { backgroundColor: themeCardBg, borderColor: themeBorderColor }]}>
              <Text style={{ fontSize: 12 }}>📋</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <View style={{ gap: 10, paddingHorizontal: 16, marginBottom: 20 }}>
        <TouchableOpacity onPress={handleCopy} style={[styles.walletActionBtnOutline, { backgroundColor: themeCardBg, borderColor: themeBorderColor, marginHorizontal: 0 }]}>
          <Text style={[styles.walletActionBtnOutlineText, { color: themeTextColor }]}>📋 Copy Public Address</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          onPress={() => Alert.alert("Blockchain Explorer", "Launching simulated explorer session on Polygonscan to scan signatures...")} 
          style={[styles.walletActionBtnOutline, { backgroundColor: themeCardBg, borderColor: themeBorderColor, marginHorizontal: 0 }]}
        >
          <Text style={[styles.walletActionBtnOutlineText, { color: themeTextColor }]}>🔍 View on Polygonscan</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          onPress={() => {
            Alert.alert("Disconnect", "Simulating ledger disconnection. Please sign pin on your wallet device to reconnect.");
          }} 
          style={[styles.walletActionBtnDisconnect, { marginHorizontal: 0 }]}
        >
          <Text style={styles.walletActionBtnDisconnectText}>Disconnect Wallet</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}
