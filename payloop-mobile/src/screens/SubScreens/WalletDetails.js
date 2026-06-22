import React from "react";
import { View, Text, TouchableOpacity, ScrollView, Alert, Linking } from "react-native";
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
    themeSubtitleColor,
    setSelectedUser
  } = useApp();

  const isConnected = selectedUser?.isMetaMask || selectedUser?.address;

  const handleCopy = () => {
    showBanner("Wallet Address copied to clipboard!", "success");
  };

  return (
    <ScrollView style={[styles.tabContentLight, { backgroundColor: themeBg, paddingTop: 16 }]} showsVerticalScrollIndicator={false}>

      {isConnected ? (
        <>
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
                Alert.alert("Disconnect Wallet", "Are you sure you want to disconnect?", [
                  { text: "Cancel", style: "cancel" },
                  { text: "Disconnect", onPress: () => {
                      setSelectedUser((prev) => ({ ...prev, isMetaMask: false, address: null }));
                      showBanner("Wallet disconnected.", "info");
                    } 
                  }
                ]);
              }} 
              style={[styles.walletActionBtnDisconnect, { marginHorizontal: 0 }]}
            >
              <Text style={styles.walletActionBtnDisconnectText}>Disconnect Wallet</Text>
            </TouchableOpacity>
          </View>
        </>
      ) : (
        <View style={{ padding: 24, alignItems: "center" }}>
          <Text style={{ fontSize: 60, marginBottom: 16 }}>🦊</Text>
          <Text style={{ fontSize: 20, fontWeight: "bold", color: themeTextColor, marginBottom: 8, textAlign: "center" }}>No Wallet Connected</Text>
          <Text style={{ fontSize: 14, color: themeSubtitleColor, textAlign: "center", marginBottom: 32, lineHeight: 22 }}>
            Connect your MetaMask wallet to unlock Web3 features, view balances, and track transactions on the blockchain.
          </Text>

          <TouchableOpacity
            onPress={() => {
              Linking.openURL("https://metamask.app.link/dapp/app.payloop.com").catch(err => {
                console.log("MetaMask app not installed, simulating redirect...");
              });
              
              setTimeout(() => {
                const mockAddr = "0x71C27918573b35481a34a38060c5EFE6230fE151";
                setSelectedUser((prev) => ({ ...prev, isMetaMask: true, address: mockAddr }));
                showBanner("MetaMask Connected Successfully!", "success");
              }, 1500);
            }}
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              backgroundColor: isDark ? "rgba(245, 158, 11, 0.15)" : "#FFF3E0",
              borderWidth: 1.5,
              borderColor: "#F59E0B",
              borderRadius: 14,
              paddingVertical: 14,
              paddingHorizontal: 24,
              width: "100%"
            }}
          >
            <Text style={{ fontWeight: "bold", color: "#F59E0B", fontSize: 16 }}>
              Connect MetaMask Wallet
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );
}
