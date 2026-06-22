import React from "react";
import { View, Text, TouchableOpacity, ScrollView, TextInput, ActivityIndicator, Alert, Linking } from "react-native";
import { StatusBar } from "expo-status-bar";
import { useApp } from "../context/AppContext";

export default function Register() {
  const {
    regStep,
    setRegStep,
    regName, setRegName,
    regNationalId, setRegNationalId,
    regPhone, setRegPhone,
    regEmail, setRegEmail,
    profDob, setProfDob,
    profGender, setProfGender,
    regPassword, setRegPassword,
    regConfirmPassword, setRegConfirmPassword,
    createdPin, setCreatedPin,
    groupSetupChoice, setGroupSetupChoice,
    createdGroupName, setCreatedGroupName,
    createdGroupDesc, setCreatedGroupDesc,
    createdGroupContrib, setCreatedGroupContrib,
    inviteCode, setInviteCode,
    regReferral, setRegReferral,
    profAvatarUri,
    connectedWalletAddress,
    setConnectedWalletAddress,
    chamaName,
    isLoading,
    setCurrentScreen,
    handleRegisterNext,
    handleCompleteRegister,
    isDark,
    themeTextColor,
    themeSubtitleColor,
    t
  } = useApp();

  const inputStyle = {
    backgroundColor: isDark ? "#1F2937" : "#F9FAFB",
    borderRadius: 12, borderWidth: 1.5,
    borderColor: isDark ? "#374151" : "#E5E7EB",
    color: isDark ? "#F9FAFB" : "#111827",
    paddingHorizontal: 16, paddingVertical: 14,
    fontSize: 15, marginTop: 6
  };

  const labelStyle = {
    fontSize: 12, fontWeight: "700",
    color: isDark ? "#9CA3AF" : "#374151",
    marginTop: 16, textTransform: "uppercase", letterSpacing: 0.6
  };

  return (
    <View style={{ flex: 1, backgroundColor: isDark ? "#0A0F1E" : "#F0FDF9" }}>
      <StatusBar style={isDark ? "light" : "dark"} />

      {/* Header strip */}
      <View style={{
        paddingTop: 56, paddingBottom: 16, paddingHorizontal: 24,
        backgroundColor: "#0F9D58",
        borderBottomLeftRadius: 24, borderBottomRightRadius: 24
      }}>
        <TouchableOpacity
          onPress={() => {
            if (regStep > 1) {
              setRegStep(regStep - 1);
            } else {
              setCurrentScreen("welcome");
            }
          }}
          style={{ flexDirection: "row", alignItems: "center", marginBottom: 12 }}
        >
          <Text style={{ color: "rgba(255,255,255,0.8)", fontSize: 20, marginRight: 8 }}>←</Text>
          <Text style={{ color: "rgba(255,255,255,0.8)", fontSize: 14, fontWeight: "600" }}>{t("back", "Back")}</Text>
        </TouchableOpacity>
        <Text style={{ fontSize: 26, fontWeight: "950", color: "#FFF", letterSpacing: -0.5 }}>{t("create_account", "Create Account")}</Text>
        <Text style={{ fontSize: 13, color: "rgba(255,255,255,0.75)", marginTop: 2 }}>{t("register_subtitle", "Register to start saving and lending")}</Text>
      </View>

      {/* Stepper Progress Bar */}
      <View style={{ flexDirection: "row", paddingHorizontal: 24, paddingTop: 16, paddingBottom: 8, gap: 8 }}>
        {[1, 2, 3].map(stepNum => (
          <View key={stepNum} style={{ flex: 1 }}>
            <View style={{ height: 6, borderRadius: 3, backgroundColor: stepNum <= regStep ? "#0F9D58" : isDark ? "#1F2937" : "#E5E7EB" }} />
            <Text style={{ color: stepNum === regStep ? "#0F9D58" : isDark ? "#6B7280" : "#9CA3AF", fontSize: 10, alignSelf: "center", marginTop: 4, fontWeight: "bold" }}>
              {stepNum === 1 ? t("personal", "Credentials") : stepNum === 2 ? t("chama", "Chama") : t("security", "Security")}
            </Text>
          </View>
        ))}
      </View>

      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 12, paddingBottom: 50 }}
        showsVerticalScrollIndicator={false}
      >
        {regStep === 1 && (
          <View style={{
            backgroundColor: isDark ? "#111827" : "#FFFFFF",
            borderRadius: 24, padding: 22,
            borderWidth: 1, borderColor: isDark ? "#1F2937" : "#E5E7EB",
            shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 3
          }}>
            <Text style={{ fontSize: 18, fontWeight: "800", color: themeTextColor, marginBottom: 4 }}>{t("personal_details", "Credentials")}</Text>
            <Text style={{ fontSize: 13, color: themeSubtitleColor, marginBottom: 10 }}>{t("personal_details_subtitle", "Fill in your official identification credentials.")}</Text>

            <Text style={labelStyle}>{t("email_address", "Email Address")}</Text>
            <TextInput style={inputStyle} placeholder="john@gmail.com" placeholderTextColor={isDark ? "#4B5563" : "#9CA3AF"} keyboardType="email-address" autoCapitalize="none" value={regEmail} onChangeText={setRegEmail} />

            <Text style={labelStyle}>{t("phone_number", "Phone Number")}</Text>
            <TextInput style={inputStyle} placeholder="+254 712 345 678" placeholderTextColor={isDark ? "#4B5563" : "#9CA3AF"} keyboardType="phone-pad" value={regPhone} onChangeText={setRegPhone} />

            <Text style={labelStyle}>{t("password", "Password")}</Text>
            <TextInput style={inputStyle} placeholder={t("min_6_chars", "Min. 6 characters")} placeholderTextColor={isDark ? "#4B5563" : "#9CA3AF"} secureTextEntry value={regPassword} onChangeText={setRegPassword} />

            <Text style={labelStyle}>{t("confirm_password", "Confirm Password")}</Text>
            <TextInput style={inputStyle} placeholder={t("repeat_password", "Repeat password")} placeholderTextColor={isDark ? "#4B5563" : "#9CA3AF"} secureTextEntry value={regConfirmPassword} onChangeText={setRegConfirmPassword} />
          </View>
        )}

        {regStep === 2 && (
          <View style={{
            backgroundColor: isDark ? "#111827" : "#FFFFFF",
            borderRadius: 24, padding: 22,
            borderWidth: 1, borderColor: isDark ? "#1F2937" : "#E5E7EB",
            shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 3
          }}>
            <Text style={{ fontSize: 18, fontWeight: "800", color: themeTextColor, marginBottom: 4 }}>{t("chama_workspace", "Chama Workspace & Wallet")}</Text>
            <Text style={{ fontSize: 13, color: themeSubtitleColor, marginBottom: 16 }}>{t("chama_subtitle", "Create a group chama or enter an invite code to join.")}</Text>

            <View style={{ flexDirection: "row", gap: 6, marginBottom: 16 }}>
              {[
                { id: "create", label: t("create_chama", "Create Chama"), emoji: "🏢" },
                { id: "join", label: t("join_existing", "Join Existing"), emoji: "🤝" },
                { id: "skip", label: t("personal_only", "Personal only"), emoji: "👤" }
              ].map(choice => (
                <TouchableOpacity
                  key={choice.id}
                  onPress={() => setGroupSetupChoice(choice.id)}
                  style={{
                    flex: 1, paddingVertical: 10, borderRadius: 10, borderWidth: 1.5,
                    borderColor: groupSetupChoice === choice.id ? "#0F9D58" : isDark ? "#374151" : "#E5E7EB",
                    backgroundColor: groupSetupChoice === choice.id ? (isDark ? "rgba(15,157,88,0.15)" : "#E8F5E9") : "transparent",
                    alignItems: "center"
                  }}
                >
                  <Text style={{ fontSize: 16, marginBottom: 2 }}>{choice.emoji}</Text>
                  <Text style={{ color: groupSetupChoice === choice.id ? "#0F9D58" : themeTextColor, fontWeight: "bold", fontSize: 10, textAlign: "center" }}>{choice.label}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {groupSetupChoice === "create" && (
              <View>
                <Text style={labelStyle}>{t("chama_name", "Chama Name")}</Text>
                <TextInput style={inputStyle} placeholder="Green Growers Chama" placeholderTextColor={isDark ? "#4B5563" : "#9CA3AF"} value={createdGroupName} onChangeText={setCreatedGroupName} />

                <Text style={labelStyle}>{t("chama_description", "Chama Description")}</Text>
                <TextInput style={inputStyle} placeholder="Weekly agricultural savings circle" placeholderTextColor={isDark ? "#4B5563" : "#9CA3AF"} value={createdGroupDesc} onChangeText={setCreatedGroupDesc} />

                <Text style={labelStyle}>{t("weekly_contribution", "Weekly Contribution (KES)")}</Text>
                <TextInput style={inputStyle} placeholder="500" keyboardType="numeric" placeholderTextColor={isDark ? "#4B5563" : "#9CA3AF"} value={createdGroupContrib} onChangeText={setCreatedGroupContrib} />
              </View>
            )}

            {groupSetupChoice === "join" && (
              <View>
                <Text style={labelStyle}>{t("enter_chama_invite", "Enter Chama Invitation Code")}</Text>
                <TextInput style={inputStyle} placeholder="e.g. CHAMA-AB12CD" autoCapitalize="characters" placeholderTextColor={isDark ? "#4B5563" : "#9CA3AF"} value={inviteCode} onChangeText={setInviteCode} />
              </View>
            )}

            {groupSetupChoice === "skip" && (
              <View style={{ marginVertical: 12, padding: 14, borderRadius: 12, backgroundColor: isDark ? "#1E293B" : "#F3F4F6", alignItems: "center" }}>
                <Text style={{ fontSize: 13, color: themeTextColor, textAlign: "center", lineHeight: 18 }}>
                  {t("skip_chama_desc", "You will start with a default personal Web3 wallet. You can join or create chamas later from your dashboard.")}
                </Text>
              </View>
            )}

            <Text style={labelStyle}>{t("referral_code", "Referral Code (Optional)")}</Text>
            <TextInput style={inputStyle} placeholder="e.g. PL-REF-88" autoCapitalize="characters" placeholderTextColor={isDark ? "#4B5563" : "#9CA3AF"} value={regReferral} onChangeText={setRegReferral} />

            <View style={{ height: 1, backgroundColor: isDark ? "#1F2937" : "#E5E7EB", marginVertical: 16 }} />

            <Text style={labelStyle}>{t("web3_wallet_connection", "Web3 Wallet Connection")}</Text>
            <TouchableOpacity
              onPress={() => {
                if (connectedWalletAddress) {
                  setConnectedWalletAddress("");
                  Alert.alert(t("metamask_disconnected", "MetaMask Disconnected"), t("metamask_disconnected_desc", "Successfully disconnected your MetaMask wallet."));
                } else {
                  Linking.openURL("https://metamask.app.link/dapp/app.payloop.com").catch(err => {
                    console.log("MetaMask app not installed, simulating redirect...");
                  });
                  setTimeout(() => {
                    const mockAddr = "0x71C27918573b35481a34a38060c5EFE6230fE151";
                    setConnectedWalletAddress(mockAddr);
                    Alert.alert(t("metamask_connected", "MetaMask Connected"), `${t("metamask_connected_desc", "Successfully connected MetaMask wallet:")}\n\n${mockAddr}`);
                  }, 1500);
                }
              }}
              style={{
                marginTop: 8,
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                backgroundColor: connectedWalletAddress ? (isDark ? "rgba(16, 185, 129, 0.15)" : "#E8F5E9") : (isDark ? "rgba(245, 158, 11, 0.15)" : "#FFF3E0"),
                borderWidth: 1.5,
                borderColor: connectedWalletAddress ? "#10B981" : "#F59E0B",
                borderRadius: 12,
                paddingVertical: 14,
              }}
            >
              <Text style={{ fontSize: 18 }}>🦊</Text>
              <Text style={{ fontWeight: "bold", color: connectedWalletAddress ? "#10B981" : "#F59E0B" }}>
                {connectedWalletAddress ? `${t("wallet_connected", "Wallet Connected")} (${connectedWalletAddress.slice(0, 6)}...${connectedWalletAddress.slice(-4)})` : t("connect_metamask", "Connect MetaMask Wallet")}
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {regStep === 3 && (
          <View style={{
            backgroundColor: isDark ? "#111827" : "#FFFFFF",
            borderRadius: 24, padding: 22,
            borderWidth: 1, borderColor: isDark ? "#1F2937" : "#E5E7EB",
            shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 3
          }}>
            <Text style={{ fontSize: 18, fontWeight: "800", color: themeTextColor, marginBottom: 4 }}>{t("setup_6digit_pin", "Setup 6-Digit PIN")}</Text>
            <Text style={{ fontSize: 13, color: themeSubtitleColor, marginBottom: 10 }}>{t("security_pin_desc", "Establish a 6-digit PIN for quick and secure dashboard access.")}</Text>

            <Text style={labelStyle}>{t("enter_security_pin", "Enter Security PIN")}</Text>
            <TextInput
              style={inputStyle}
              placeholder="e.g. 123456"
              placeholderTextColor={isDark ? "#4B5563" : "#9CA3AF"}
              secureTextEntry
              keyboardType="numeric"
              maxLength={6}
              value={createdPin}
              onChangeText={setCreatedPin}
            />
          </View>
        )}

        <TouchableOpacity
          onPress={regStep === 3 ? handleCompleteRegister : handleRegisterNext}
          disabled={isLoading}
          style={{
            backgroundColor: "#0F9D58", borderRadius: 16, paddingVertical: 17,
            alignItems: "center", marginTop: 24, opacity: isLoading ? 0.75 : 1,
            shadowColor: "#0F9D58", shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.3, shadowRadius: 10, elevation: 5
          }}
        >
          {isLoading ? (
            <ActivityIndicator color="#FFF" size="small" />
          ) : (
            <Text style={{ color: "#FFF", fontSize: 16, fontWeight: "800" }}>
              {regStep === 3 ? t("complete_setup", "Complete Setup ✓") : t("continue", "Continue →")}
            </Text>
          )}
        </TouchableOpacity>

        {regStep === 1 && (
          <TouchableOpacity onPress={() => setCurrentScreen("login")} style={{ alignItems: "center", marginTop: 20 }}>
            <Text style={{ color: isDark ? "#9CA3AF" : "#6B7280", fontSize: 14 }}>
              {t("already_have_account", "Already have an account?")} <Text style={{ color: "#0F9D58", fontWeight: "700" }}>{t("sign_in", "Sign In")}</Text>
            </Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </View>
  );
}
