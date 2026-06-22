import React, { useState } from "react";
import { View, Text, TouchableOpacity, ScrollView, TextInput, ActivityIndicator, Alert, Linking } from "react-native";
import { StatusBar } from "expo-status-bar";
import { useApp } from "../context/AppContext";

export default function Login() {
  const {
    currentScreen,
    setCurrentScreen,
    loginMethod,
    setLoginMethod,
    loginEmail,
    setLoginEmail,
    loginPassword,
    setLoginPassword,
    focusedInput,
    setFocusedInput,
    registeredUsers,
    setSelectedUser,
    isDark,
    themeTextColor,
    themeSubtitleColor,
    isLoading,
    setPinCode,
    handleManualLogin
  } = useApp();

  const tabStyle = (active) => ({
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
    borderBottomWidth: 3,
    borderBottomColor: active ? "#0F9D58" : "transparent"
  });

  const tabTextStyle = (active) => ({
    fontSize: 14,
    fontWeight: "800",
    color: active ? "#0F9D58" : (isDark ? "#9CA3AF" : "#6B7280")
  });

  const getFieldStyle = (fieldName) => {
    const isFocused = focusedInput === fieldName;
    return {
      backgroundColor: isDark ? "#111827" : "#FFFFFF",
      borderRadius: 14,
      borderWidth: 1.5,
      borderColor: isFocused ? "#0F9D58" : (isDark ? "#374151" : "#E5E7EB"),
      color: themeTextColor,
      paddingHorizontal: 16,
      paddingVertical: 14,
      fontSize: 15,
      marginTop: 6,
      shadowColor: "#0F9D58",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: isFocused ? 0.2 : 0,
      shadowRadius: 8,
      elevation: isFocused ? 3 : 0
    };
  };

  return (
    <View style={{ flex: 1, backgroundColor: isDark ? "#0A0F1E" : "#F0FDF9" }}>
      <StatusBar style={isDark ? "light" : "dark"} />

      {/* Header */}
      <View style={{
        paddingTop: 56, paddingBottom: 20, paddingHorizontal: 24,
        backgroundColor: "#0F9D58",
        borderBottomLeftRadius: 32, borderBottomRightRadius: 32
      }}>
        <TouchableOpacity onPress={() => setCurrentScreen("welcome")} style={{ flexDirection: "row", alignItems: "center", marginBottom: 12 }}>
          <Text style={{ color: "rgba(255,255,255,0.8)", fontSize: 20, marginRight: 6 }}>←</Text>
          <Text style={{ color: "rgba(255,255,255,0.8)", fontSize: 13, fontWeight: "600" }}>Back</Text>
        </TouchableOpacity>
        <Text style={{ fontSize: 26, fontWeight: "900", color: "#FFF", letterSpacing: -0.3 }}>Welcome Back 👋</Text>
        <Text style={{ fontSize: 13, color: "rgba(255,255,255,0.75)", marginTop: 2 }}>Securely access your PayLoop account</Text>
      </View>

      {/* Tab Switcher */}
      <View style={{ flexDirection: "row", backgroundColor: isDark ? "#111827" : "#FFFFFF", borderBottomWidth: 1, borderBottomColor: isDark ? "#1F2937" : "#E5E7EB" }}>
        <TouchableOpacity onPress={() => setLoginMethod("picker")} style={tabStyle(loginMethod === "picker")}>
          <Text style={tabTextStyle(loginMethod === "picker")}>Saved Profiles</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setLoginMethod("credentials")} style={tabStyle(loginMethod === "credentials")}>
          <Text style={tabTextStyle(loginMethod === "credentials")}>Manual Sign In</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 24, paddingBottom: 50 }} showsVerticalScrollIndicator={false}>
        {loginMethod === "picker" ? (
          registeredUsers.length === 0 ? (
            <View style={{
              backgroundColor: isDark ? "#111827" : "#FFF",
              borderRadius: 24, padding: 36, alignItems: "center",
              borderWidth: 1, borderColor: isDark ? "#1F2937" : "#E5E7EB"
            }}>
              <Text style={{ fontSize: 48, marginBottom: 16 }}>🔍</Text>
              <Text style={{ color: isDark ? "#F9FAFB" : "#111827", fontSize: 18, fontWeight: "800", marginBottom: 8 }}>No Accounts Found</Text>
              <Text style={{ color: isDark ? "#9CA3AF" : "#6B7280", fontSize: 14, textAlign: "center", marginBottom: 24, lineHeight: 20 }}>
                Start by creating your first PayLoop account to join the network.
              </Text>
              <TouchableOpacity
                onPress={() => setCurrentScreen("register")}
                style={{ backgroundColor: "#0F9D58", borderRadius: 14, paddingVertical: 14, paddingHorizontal: 32 }}
              >
                <Text style={{ color: "#FFF", fontWeight: "800", fontSize: 15 }}>Create Account</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <>
              <Text style={{ color: isDark ? "#9CA3AF" : "#6B7280", fontSize: 12, fontWeight: "700", textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 12 }}>
                {registeredUsers.length} Account{registeredUsers.length !== 1 ? "s" : ""} on this device
              </Text>
              {registeredUsers.map((user) => (
                <TouchableOpacity
                  key={user.email}
                  onPress={() => {
                    setSelectedUser(user);
                    setPinCode("");
                    setCurrentScreen("pin");
                  }}
                  style={{
                    backgroundColor: isDark ? "#111827" : "#FFFFFF",
                    borderRadius: 20, padding: 18, marginBottom: 12,
                    flexDirection: "row", alignItems: "center",
                    borderWidth: 1.5, borderColor: isDark ? "#1F2937" : "#D1FAE5",
                    shadowColor: "#0F9D58", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.07, shadowRadius: 8, elevation: 2
                  }}
                >
                  <View style={{
                    width: 52, height: 52, borderRadius: 16,
                    backgroundColor: isDark ? "#1F2937" : "#ECFDF5",
                    alignItems: "center", justifyContent: "center", marginRight: 14,
                    borderWidth: 1, borderColor: isDark ? "#374151" : "#D1FAE5"
                  }}>
                    <Text style={{ fontSize: 26 }}>{user.avatar && user.avatar.length <= 4 ? user.avatar : "👤"}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ color: isDark ? "#F9FAFB" : "#111827", fontSize: 16, fontWeight: "700" }}>{user.name}</Text>
                    <Text style={{ color: isDark ? "#6B7280" : "#9CA3AF", fontSize: 12, marginTop: 2 }}>
                      {user.email}
                    </Text>
                    <View style={{ flexDirection: "row", alignItems: "center", marginTop: 5, gap: 8 }}>
                      <View style={{ backgroundColor: "#D1FAE5", borderRadius: 8, paddingHorizontal: 8, paddingVertical: 2 }}>
                        <Text style={{ color: "#065F46", fontSize: 10, fontWeight: "700" }}>Score: {user.creditScore || user.credit_score || 500}</Text>
                      </View>
                      <View style={{ backgroundColor: user.verification_level === "FULLY_VERIFIED" ? "#D1FAE5" : "#FEF3C7", borderRadius: 8, paddingHorizontal: 8, paddingVertical: 2 }}>
                        <Text style={{ color: user.verification_level === "FULLY_VERIFIED" ? "#065F46" : "#92400E", fontSize: 10, fontWeight: "700" }}>
                          {user.verification_level === "FULLY_VERIFIED" ? "✅ Verified" : "⚠️ Unverified"}
                        </Text>
                      </View>
                    </View>
                  </View>
                  <Text style={{ color: "#0F9D58", fontSize: 22 }}>›</Text>
                </TouchableOpacity>
              ))}

              <TouchableOpacity
                onPress={() => setCurrentScreen("register")}
                style={{
                  borderRadius: 16, paddingVertical: 14, alignItems: "center",
                  borderWidth: 1.5, borderColor: isDark ? "#374151" : "#D1FAE5",
                  borderStyle: "dashed", marginTop: 4
                }}
              >
                <Text style={{ color: isDark ? "#34D399" : "#0F9D58", fontSize: 14, fontWeight: "700" }}>+ Add Another Account</Text>
              </TouchableOpacity>
            </>
          )
        ) : (
          <View style={{
            backgroundColor: isDark ? "#111827" : "#FFFFFF",
            borderRadius: 24, padding: 22,
            borderWidth: 1, borderColor: isDark ? "#1F2937" : "#E5E7EB",
            shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 3
          }}>
            <Text style={{ fontSize: 18, fontWeight: "800", color: themeTextColor, marginBottom: 4 }}>Manual Credentials</Text>
            <Text style={{ fontSize: 13, color: themeSubtitleColor, marginBottom: 16 }}>Enter your email/phone and password or PIN to sign in.</Text>

            <Text style={{ fontSize: 12, fontWeight: "700", color: isDark ? "#9CA3AF" : "#374151", textTransform: "uppercase", letterSpacing: 0.6 }}>Email or Phone Number</Text>
            <TextInput
              style={getFieldStyle("loginEmail")}
              placeholder="john@gmail.com or +254..."
              placeholderTextColor={isDark ? "#4B5563" : "#9CA3AF"}
              value={loginEmail}
              onChangeText={setLoginEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              onFocus={() => setFocusedInput("loginEmail")}
              onBlur={() => setFocusedInput(null)}
            />

            <Text style={{ fontSize: 12, fontWeight: "700", color: isDark ? "#9CA3AF" : "#374151", marginTop: 16, textTransform: "uppercase", letterSpacing: 0.6 }}>Password or 6-digit PIN</Text>
            <TextInput
              style={getFieldStyle("loginPassword")}
              placeholder="••••••"
              placeholderTextColor={isDark ? "#4B5563" : "#9CA3AF"}
              secureTextEntry
              value={loginPassword}
              onChangeText={setLoginPassword}
              onFocus={() => setFocusedInput("loginPassword")}
              onBlur={() => setFocusedInput(null)}
            />

            <TouchableOpacity
              onPress={handleManualLogin}
              style={{
                backgroundColor: "#0F9D58",
                borderRadius: 14,
                paddingVertical: 16,
                alignItems: "center",
                justifyContent: "center",
                marginTop: 28,
                shadowColor: "#0F9D58",
                shadowOffset: { width: 0, height: 6 },
                shadowOpacity: 0.35,
                shadowRadius: 10,
                elevation: 6
              }}
            >
              {isLoading ? (
                <ActivityIndicator color="#FFF" size="small" />
              ) : (
                <Text style={{ color: "#FFF", fontSize: 16, fontWeight: "800", letterSpacing: 0.3 }}>Sign In Securely ✓</Text>
              )}
            </TouchableOpacity>
            
            <TouchableOpacity
              onPress={() => Alert.alert("Password Reset", "Instructions have been sent to your email.")}
              style={{ alignItems: "center", marginTop: 20 }}
            >
              <Text style={{ color: isDark ? "#9CA3AF" : "#6B7280", fontSize: 13 }}>
                Forgot Password? <Text style={{ color: "#0F9D58", fontWeight: "700" }}>Reset Here</Text>
              </Text>
            </TouchableOpacity>

            <View style={{ flexDirection: "row", alignItems: "center", marginVertical: 20 }}>
              <View style={{ flex: 1, height: 1, backgroundColor: isDark ? "#374151" : "#E5E7EB" }} />
              <Text style={{ marginHorizontal: 10, color: isDark ? "#9CA3AF" : "#6B7280", fontSize: 12 }}>OR</Text>
              <View style={{ flex: 1, height: 1, backgroundColor: isDark ? "#374151" : "#E5E7EB" }} />
            </View>

            <TouchableOpacity
              onPress={() => {
                Linking.openURL("https://metamask.app.link/dapp/app.payloop.com").catch(err => {
                  console.log("MetaMask app not installed, simulating redirect...");
                });
                
                setTimeout(() => {
                  const mockMetaMaskUser = {
                    name: "MetaMask User",
                    email: "metamask@payloop.com",
                    address: "0x71C27918573b35481a34a38060c5EFE6230fE151",
                    isMetaMask: true,
                    creditScore: 650,
                    verification_level: "BASIC",
                    avatarUri: "https://upload.wikimedia.org/wikipedia/commons/3/36/MetaMask_Fox.svg"
                  };
                  setSelectedUser(mockMetaMaskUser);
                  setPinCode("");
                  setCurrentScreen("pin");
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
              }}
            >
              <Text style={{ fontSize: 18 }}>🦊</Text>
              <Text style={{ fontWeight: "bold", color: "#F59E0B", fontSize: 16 }}>
                Sign In with MetaMask
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </View>
  );
}
