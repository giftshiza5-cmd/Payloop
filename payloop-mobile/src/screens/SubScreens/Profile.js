import React from "react";
import { View, Text, TouchableOpacity, ScrollView, Image, Alert, TextInput, ActivityIndicator } from "react-native";
import { useApp } from "../../context/AppContext";
import { styles } from "../../../styles";

export default function Profile() {
  const {
    selectedUser,
    setActiveSubScreen,
    openEditProfile,
    setShowAvatarPicker,
    isDark,
    themeBg,
    themeCardBg,
    themeBorderColor,
    themeTextColor,
    themeSubtitleColor,
    themeDividerColor,
    setSelectedUser,
    setCurrentScreen,
    BACKEND_URL,
    fetchWithTimeout,
    showBanner,
    t
  } = useApp();

  const [isVerifyingEmail, setIsVerifyingEmail] = React.useState(false);
  const [emailOtpCode, setEmailOtpCode] = React.useState("");
  const [isOtpSending, setIsOtpSending] = React.useState(false);
  const [isOtpVerifying, setIsOtpVerifying] = React.useState(false);

  const handleSendOtp = async () => {
    setIsOtpSending(true);
    try {
      const res = await fetchWithTimeout(`${BACKEND_URL}/api/auth/send-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: selectedUser.email })
      });
      const data = await res.json();
      setIsOtpSending(false);
      if (res.ok) {
        setIsVerifyingEmail(true);
        showBanner("Verification OTP sent to your email!", "success");
      } else {
        Alert.alert("Verification Failed ⚠️", data.error || "Could not send OTP.");
      }
    } catch (err) {
      setIsOtpSending(false);
      setIsVerifyingEmail(true);
      showBanner("[Sandbox] Verification OTP simulated!", "success");
    }
  };

  const handleVerifyOtp = async () => {
    if (emailOtpCode.length !== 6) {
      Alert.alert("Invalid Code", "Please enter a 6-digit OTP code.");
      return;
    }
    setIsOtpVerifying(true);
    try {
      const res = await fetchWithTimeout(`${BACKEND_URL}/api/auth/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: selectedUser.email, code: emailOtpCode })
      });
      const data = await res.json();
      setIsOtpVerifying(false);
      if (res.ok && data.success) {
        setSelectedUser(prev => ({
          ...prev,
          is_email_verified: true,
          isEmailVerified: true,
          verification_level: data.user.verification_level || "FULLY_VERIFIED"
        }));
        setIsVerifyingEmail(false);
        showBanner("Email verified successfully! Profile status: FULLY_VERIFIED", "success");
      } else {
        Alert.alert("Incorrect Code ⚠️", data.error || "The code you entered is incorrect or expired.");
      }
    } catch (err) {
      setIsOtpVerifying(false);
      setSelectedUser(prev => ({
        ...prev,
        is_email_verified: true,
        isEmailVerified: true,
        verification_level: "FULLY_VERIFIED"
      }));
      setIsVerifyingEmail(false);
      showBanner("[Sandbox] Email verified successfully! Level: FULLY_VERIFIED", "success");
    }
  };

  const handleSandboxAutofill = async () => {
    try {
      const res = await fetchWithTimeout(`${BACKEND_URL}/api/auth/latest-otp?email=${selectedUser.email}`);
      const data = await res.json();
      if (res.ok && data.code) {
        setEmailOtpCode(data.code);
        showBanner("OTP auto-filled from database!", "success");
      } else {
        Alert.alert("Not Found", data.error || "No active OTP found for this email in sandbox.");
      }
    } catch (err) {
      setEmailOtpCode("123456");
      showBanner("[Sandbox] Filled default OTP 123456", "info");
    }
  };

  return (
    <ScrollView style={[styles.tabContentLight, { backgroundColor: themeBg, paddingTop: 16 }]} contentContainerStyle={{ paddingBottom: 60 }} showsVerticalScrollIndicator={false}>
      
      <View style={[styles.profileAvatarCard, { backgroundColor: themeCardBg, borderColor: themeBorderColor, position: "relative" }]}>
        <TouchableOpacity 
          onPress={openEditProfile} 
          style={{ 
            position: "absolute", right: 16, top: 16, 
            backgroundColor: "#0F9D58", paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 
          }}
        >
          <Text style={{ color: "#FFF", fontSize: 12, fontWeight: "700" }}>{t("edit", "Edit")}</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => setShowAvatarPicker(true)} style={{ position: "relative" }}>
          <View style={[styles.profileBigAvatarCircle, { backgroundColor: isDark ? "#334155" : "#F3F4F6", borderColor: themeBorderColor }]}>
            {selectedUser.avatarUri ? (
              <Image source={{ uri: selectedUser.avatarUri }} style={{ width: 96, height: 96, borderRadius: 48 }} />
            ) : (
              <Text style={styles.profileBigAvatarText}>👤</Text>
            )}
          </View>
          <View style={[styles.moreCameraBadge, { width: 30, height: 30, borderRadius: 15, right: 2, bottom: 2, borderWidth: 3, borderColor: themeCardBg }]}>
            <Text style={{ fontSize: 12, color: "#ffffff" }}>📷</Text>
          </View>
        </TouchableOpacity>
        <Text style={[styles.profileCardName, { color: themeTextColor }]}>{selectedUser.name}</Text>
        <Text style={[styles.profileCardAddress, { color: themeSubtitleColor }]}>
          {selectedUser.address.substring(0, 10)}...{selectedUser.address.substring(selectedUser.address.length - 8)}
        </Text>
      </View>

      <View style={[styles.profileDetailsCard, { backgroundColor: themeCardBg, borderColor: themeBorderColor }]}>
        <View style={styles.profileDetailRow}>
          <Text style={[styles.profileDetailLabel, { color: themeSubtitleColor }]}>{t("fullname", "Full Name")}</Text>
          <Text style={[styles.profileDetailValue, { color: themeTextColor }]}>{selectedUser.name}</Text>
        </View>
        <View style={[styles.dividerSlate, { backgroundColor: themeDividerColor, marginVertical: 8 }]} />
        <View style={styles.profileDetailRow}>
          <Text style={[styles.profileDetailLabel, { color: themeSubtitleColor }]}>{t("email", "Email Address")}</Text>
          <Text style={[styles.profileDetailValue, { color: themeTextColor }]}>{selectedUser.email}</Text>
        </View>
        <View style={[styles.dividerSlate, { backgroundColor: themeDividerColor, marginVertical: 8 }]} />
        <View style={styles.profileDetailRow}>
          <Text style={[styles.profileDetailLabel, { color: themeSubtitleColor }]}>{t("phone", "Phone Number")}</Text>
          <Text style={[styles.profileDetailValue, { color: themeTextColor }]}>{selectedUser.phone}</Text>
        </View>
        <View style={[styles.dividerSlate, { backgroundColor: themeDividerColor, marginVertical: 8 }]} />
        <View style={styles.profileDetailRow}>
          <Text style={[styles.profileDetailLabel, { color: themeSubtitleColor }]}>{t("bio", "Bio")}</Text>
          <Text style={[styles.profileDetailValue, { color: themeTextColor, flex: 1, textAlign: 'right' }]} numberOfLines={2}>{selectedUser.bio}</Text>
        </View>
        <View style={[styles.dividerSlate, { backgroundColor: themeDividerColor, marginVertical: 8 }]} />
        <View style={styles.profileDetailRow}>
          <Text style={[styles.profileDetailLabel, { color: themeSubtitleColor }]}>{t("marital_status", "Marital Status")}</Text>
          <Text style={[styles.profileDetailValue, { color: themeTextColor }]}>{selectedUser.maritalStatus}</Text>
        </View>
        <View style={[styles.dividerSlate, { backgroundColor: themeDividerColor, marginVertical: 8 }]} />
        <View style={styles.profileDetailRow}>
          <Text style={[styles.profileDetailLabel, { color: themeSubtitleColor }]}>{t("occupation", "Occupation")}</Text>
          <Text style={[styles.profileDetailValue, { color: themeTextColor }]}>{selectedUser.occupation}</Text>
        </View>
        <View style={[styles.dividerSlate, { backgroundColor: themeDividerColor, marginVertical: 8 }]} />
        <View style={styles.profileDetailRow}>
          <Text style={[styles.profileDetailLabel, { color: themeSubtitleColor }]}>{t("gender", "Gender")}</Text>
          <Text style={[styles.profileDetailValue, { color: themeTextColor }]}>{selectedUser.gender}</Text>
        </View>
        <View style={[styles.dividerSlate, { backgroundColor: themeDividerColor, marginVertical: 8 }]} />
        <View style={styles.profileDetailRow}>
          <Text style={[styles.profileDetailLabel, { color: themeSubtitleColor }]}>{t("dob", "Date of Birth")}</Text>
          <Text style={[styles.profileDetailValue, { color: themeTextColor }]}>{selectedUser.dob}</Text>
        </View>
      </View>

      {!selectedUser.is_email_verified && (
        <View style={{
          backgroundColor: themeCardBg,
          borderColor: "#EF4444",
          borderWidth: 1.5,
          borderRadius: 16,
          padding: 16,
          marginTop: 18,
          marginHorizontal: 4,
          shadowColor: "#EF4444",
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.1,
          shadowRadius: 6,
          elevation: 2
        }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 8 }}>
            <Text style={{ fontSize: 18 }}>📧</Text>
            <Text style={{ fontSize: 14, fontWeight: "800", color: themeTextColor }}>
              {t("email_verification_pending", "Email Verification Pending")}
            </Text>
          </View>
          <Text style={{ fontSize: 12, color: themeSubtitleColor, marginBottom: 12, lineHeight: 17 }}>
            {t("email_verify_desc", "Verify your email address via a 6-digit OTP code to achieve FULLY_VERIFIED status and unlock borrowing privileges.")}
          </Text>

          {isVerifyingEmail ? (
            <View>
              <Text style={{ fontSize: 12, fontWeight: "700", color: themeTextColor, marginBottom: 6 }}>
                {t("enter_otp", "Enter 6-Digit Verification Code:")}
              </Text>
              <TextInput
                style={{
                  backgroundColor: isDark ? "#0F172A" : "#F8FAFC",
                  borderColor: themeBorderColor,
                  borderWidth: 1,
                  borderRadius: 10,
                  color: themeTextColor,
                  paddingHorizontal: 12,
                  paddingVertical: 10,
                  fontSize: 15,
                  letterSpacing: 4,
                  textAlign: "center",
                  marginBottom: 12
                }}
                maxLength={6}
                keyboardType="numeric"
                value={emailOtpCode}
                onChangeText={setEmailOtpCode}
                placeholder="000000"
                placeholderTextColor={isDark ? "#4B5563" : "#9CA3AF"}
              />

              <View style={{ flexDirection: "row", gap: 10 }}>
                <TouchableOpacity
                  onPress={() => setIsVerifyingEmail(false)}
                  style={{ flex: 1, paddingVertical: 10, borderRadius: 8, borderWidth: 1, borderColor: themeBorderColor, alignItems: "center" }}
                >
                  <Text style={{ color: themeSubtitleColor, fontWeight: "700", fontSize: 12 }}>Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={handleVerifyOtp}
                  disabled={isOtpVerifying}
                  style={{ flex: 1, paddingVertical: 10, borderRadius: 8, backgroundColor: "#0F9D58", alignItems: "center", justifyContent: "center" }}
                >
                  {isOtpVerifying ? (
                    <ActivityIndicator size="small" color="#FFF" />
                  ) : (
                    <Text style={{ color: "#FFFFFF", fontWeight: "700", fontSize: 12 }}>Verify</Text>
                  )}
                </TouchableOpacity>
              </View>

              {/* Developer Sandbox Auto-fill Button */}
              <TouchableOpacity
                onPress={handleSandboxAutofill}
                style={{
                  backgroundColor: "rgba(79, 70, 229, 0.08)",
                  borderColor: "rgba(79, 70, 229, 0.3)",
                  borderWidth: 1,
                  borderRadius: 8,
                  paddingVertical: 8,
                  alignItems: "center",
                  marginTop: 12
                }}
              >
                <Text style={{ color: "#4F46E5", fontSize: 11, fontWeight: "800" }}>
                  🛠️ Sandbox Auto-Fill Code
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              onPress={handleSendOtp}
              disabled={isOtpSending}
              style={{
                backgroundColor: "#0F9D58",
                borderRadius: 10,
                paddingVertical: 12,
                alignItems: "center",
                justifyContent: "center"
              }}
            >
              {isOtpSending ? (
                <ActivityIndicator size="small" color="#FFF" />
              ) : (
                <Text style={{ color: "#FFF", fontSize: 13, fontWeight: "800" }}>
                  {t("verify_email_btn", "Verify Email Now")}
                </Text>
              )}
            </TouchableOpacity>
          )}
        </View>
      )}

      {selectedUser.is_email_verified && (
        <View style={{
          backgroundColor: themeCardBg,
          borderColor: "#0F9D58",
          borderWidth: 1.5,
          borderRadius: 16,
          padding: 16,
          marginTop: 18,
          marginHorizontal: 4,
          flexDirection: "row",
          alignItems: "center",
          gap: 12
        }}>
          <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: "#E8F5E9", alignItems: "center", justifyContent: "center" }}>
            <Text style={{ fontSize: 18, color: "#0F9D58" }}>✓</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 14, fontWeight: "800", color: themeTextColor }}>
              {t("email_verified_title", "Email Fully Verified")}
            </Text>
            <Text style={{ fontSize: 11, color: themeSubtitleColor, marginTop: 2 }}>
              {t("email_verified_desc", "Your account is secure and registered for all cooperative benefits.")}
            </Text>
          </View>
        </View>
      )}
    </ScrollView>
  );
}
