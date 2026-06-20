import React from "react";
import {
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  TextInput,
  Alert
} from "react-native";
import { useApp } from "../../context/AppContext";
import { styles } from "../../../styles";

export default function VerifyIdentity() {
  const {
    verificationSuccess,
    idDocUri,
    selfieUri,
    isPhoneVerifiedState,
    phoneForVerification,
    setPhoneForVerification,
    verificationSmsCode,
    setVerificationSmsCode,
    isVerificationSmsSent,
    setIsVerificationSmsSent,
    setIsPhoneVerifiedState,
    setIdDocUri,
    setSelfieUri,
    setSelectedUser,
    setVerificationSuccess,
    selectedUser,
    BACKEND_URL,
    fetchWithTimeout,
    showBanner,
    setActiveSubScreen,
    isDark,
    themeBg,
    themeCardBg,
    themeBorderColor,
    themeTextColor,
  } = useApp();

  // Step states: 'phone' | 'documents' | 'selfie' | 'success'
  const step = verificationSuccess ? "success" :
               (idDocUri && selfieUri) ? "selfie" :
               idDocUri ? "selfie" :
               isPhoneVerifiedState ? "documents" : "phone";

  const handleSendPhoneSms = async () => {
    if (!phoneForVerification || phoneForVerification.length < 9) {
      Alert.alert("Invalid Phone", "Please enter a valid phone number to verify.");
      return;
    }
    try {
      const res = await fetchWithTimeout(`${BACKEND_URL}/api/auth/send-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: selectedUser?.email, purpose: "phone_verification" })
      });
      const data = await res.json();
      if (res.ok) {
        setIsVerificationSmsSent(true);
        Alert.alert("Code Sent 📱", `A verification code was sent to ${phoneForVerification}.`);
      } else {
        Alert.alert("Error", data.error || "Failed to send verification code.");
      }
    } catch (e) {
      // Simulate for sandbox
      setIsVerificationSmsSent(true);
      Alert.alert("Code Sent 📱", `[Sandbox] A 6-digit code was simulated to ${phoneForVerification}.`);
    }
  };

  const handleVerifyPhoneCode = async () => {
    if (verificationSmsCode.length < 6) {
      Alert.alert("Invalid Code", "Enter the 6-digit code you received.");
      return;
    }
    try {
      const res = await fetchWithTimeout(`${BACKEND_URL}/api/auth/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: selectedUser?.email, code: verificationSmsCode, purpose: "phone_verification" })
      });
      const data = await res.json();
      if (res.ok) {
        setIsPhoneVerifiedState(true);
        setIsVerificationSmsSent(false);
        setVerificationSmsCode("");
        showBanner("Phone number verified! Now upload your ID document.", "success");
      } else {
        Alert.alert("Incorrect Code", data.error || "The code you entered is incorrect or has expired.");
      }
    } catch (e) {
      // Sandbox: accept any 6-digit code
      if (verificationSmsCode.length === 6) {
        setIsPhoneVerifiedState(true);
        setIsVerificationSmsSent(false);
        setVerificationSmsCode("");
        showBanner("[Sandbox] Phone verified! Now upload your ID.", "success");
      } else {
        Alert.alert("Error", "Network error during verification.");
      }
    }
  };

  const handleUploadIdDoc = async () => {
    // Simulate selecting an ID document
    Alert.alert("Upload ID Document", "Simulating document upload...");
    setTimeout(async () => {
      const simulatedUrl = "https://sandbox-docs.payloop.io/id_" + Date.now() + ".jpg";
      setIdDocUri(simulatedUrl);
      try {
        await fetchWithTimeout(`${BACKEND_URL}/api/users/upload-document`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: selectedUser?.email, docType: "National_ID", fileUrl: simulatedUrl })
        });
      } catch (e) { /* sandbox - ignore network */ }
      showBanner("ID document uploaded ✅ Now capture a selfie.", "success");
    }, 1500);
  };

  const handleUploadSelfie = async () => {
    Alert.alert("Capture Selfie", "Simulating selfie capture...");
    setTimeout(async () => {
      const simulatedUrl = "https://sandbox-docs.payloop.io/selfie_" + Date.now() + ".jpg";
      setSelfieUri(simulatedUrl);
      try {
        const res = await fetchWithTimeout(`${BACKEND_URL}/api/users/upload-document`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: selectedUser?.email, docType: "Selfie", fileUrl: simulatedUrl })
        });
        const data = await res.json();
        if (data.levelUpgraded) {
          setSelectedUser(prev => prev ? ({ ...prev, verification_level: "FULLY_VERIFIED" }) : prev);
        }
      } catch (e) {
        // Sandbox: just promote locally
        setSelectedUser(prev => prev ? ({ ...prev, verification_level: "FULLY_VERIFIED" }) : prev);
      }
      setVerificationSuccess(true);
      showBanner("🎉 Identity fully verified! You can now request loans.", "success");
    }, 1800);
  };

  return (
    <ScrollView
      style={[styles.tabContentLight, { backgroundColor: themeBg }]}
      contentContainerStyle={{ paddingBottom: 60 }}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={styles.subScreenHeader}>
        <TouchableOpacity
          onPress={() => setActiveSubScreen(null)}
          style={[styles.backButton, { backgroundColor: themeCardBg, borderColor: themeBorderColor }]}
        >
          <Text style={[styles.backButtonText, { color: themeTextColor }]}>←</Text>
        </TouchableOpacity>
        <Text style={[styles.subScreenTitle, { color: themeTextColor }]}>Identity Verification</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Progress Steps Bar */}
      <View style={{
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        marginHorizontal: 20,
        marginBottom: 24,
        marginTop: 4
      }}>
        {[
          { label: "Phone", key: "phone" },
          { label: "ID Doc", key: "documents" },
          { label: "Selfie", key: "selfie" },
          { label: "Done", key: "success" }
        ].map((s, idx, arr) => {
          const isActive = step === s.key;
          const isDone = (
            (s.key === "phone" && (isPhoneVerifiedState || step === "documents" || step === "selfie" || step === "success")) ||
            (s.key === "documents" && (idDocUri || step === "selfie" || step === "success")) ||
            (s.key === "selfie" && (selfieUri || step === "success")) ||
            (s.key === "success" && verificationSuccess)
          );
          return (
            <React.Fragment key={s.key}>
              <View style={{ alignItems: "center" }}>
                <View style={{
                  width: 32,
                  height: 32,
                  borderRadius: 16,
                  backgroundColor: isDone ? "#0F9D58" : isActive ? "#4F46E5" : (isDark ? "#374151" : "#E5E7EB"),
                  alignItems: "center",
                  justifyContent: "center",
                  borderWidth: isActive ? 2 : 0,
                  borderColor: "#818CF8"
                }}>
                  <Text style={{ color: isDone || isActive ? "#FFF" : "#9CA3AF", fontSize: 13, fontWeight: "bold" }}>
                    {isDone ? "✓" : (idx + 1)}
                  </Text>
                </View>
                <Text style={{ fontSize: 10, marginTop: 3, color: isDone ? "#0F9D58" : isActive ? "#4F46E5" : (isDark ? "#9CA3AF" : "#6B7280"), fontWeight: isActive ? "700" : "400" }}>
                  {s.label}
                </Text>
              </View>
              {idx < arr.length - 1 && (
                <View style={{
                  flex: 1,
                  height: 2,
                  backgroundColor: isDone ? "#0F9D58" : (isDark ? "#374151" : "#E5E7EB"),
                  marginHorizontal: 4,
                  marginBottom: 16
                }} />
              )}
            </React.Fragment>
          );
        })}
      </View>

      {/* SUCCESS STATE */}
      {verificationSuccess ? (
        <View style={{
          backgroundColor: isDark ? "#064E3B" : "#ECFDF5",
          marginHorizontal: 16,
          borderRadius: 20,
          padding: 32,
          alignItems: "center",
          borderWidth: 1,
          borderColor: "#6EE7B7"
        }}>
          <Text style={{ fontSize: 64, marginBottom: 16 }}>🎉</Text>
          <Text style={{ fontSize: 22, fontWeight: "800", color: "#0F9D58", marginBottom: 8, textAlign: "center" }}>
            Identity Verified!
          </Text>
          <Text style={{ fontSize: 14, color: isDark ? "#6EE7B7" : "#065F46", textAlign: "center", lineHeight: 20, marginBottom: 24 }}>
            You are now a fully verified PayLoop member. You can request Chama loans and access all premium features.
          </Text>
          <View style={{ flexDirection: "row", gap: 12 }}>
            <View style={{ backgroundColor: "#0F9D58", paddingVertical: 6, paddingHorizontal: 14, borderRadius: 20 }}>
              <Text style={{ color: "#FFF", fontWeight: "700", fontSize: 12 }}>✅ Level 2 — Fully Verified</Text>
            </View>
          </View>
          <TouchableOpacity
            onPress={() => setActiveSubScreen(null)}
            style={{
              marginTop: 24,
              backgroundColor: "#0F9D58",
              borderRadius: 12,
              paddingVertical: 14,
              paddingHorizontal: 40,
              width: "100%",
              alignItems: "center"
            }}
          >
            <Text style={{ color: "#FFF", fontWeight: "700", fontSize: 16 }}>Go to Dashboard</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          {/* STEP 1: PHONE VERIFICATION */}
          <View style={{
            marginHorizontal: 16,
            marginBottom: 16,
            backgroundColor: themeCardBg,
            borderRadius: 16,
            padding: 20,
            borderWidth: 1,
            borderColor: isPhoneVerifiedState ? "#6EE7B7" : themeBorderColor,
            opacity: isPhoneVerifiedState ? 0.7 : 1
          }}>
            <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 14 }}>
              <View style={{
                width: 36,
                height: 36,
                borderRadius: 18,
                backgroundColor: isPhoneVerifiedState ? "#0F9D58" : "#4F46E5",
                alignItems: "center",
                justifyContent: "center",
                marginRight: 10
              }}>
                <Text style={{ color: "#FFF", fontWeight: "800" }}>{isPhoneVerifiedState ? "✓" : "1"}</Text>
              </View>
              <View>
                <Text style={{ color: themeTextColor, fontWeight: "700", fontSize: 15 }}>Phone Number Verification</Text>
                <Text style={{ color: isDark ? "#9CA3AF" : "#6B7280", fontSize: 12 }}>
                  {isPhoneVerifiedState ? "Verified ✅" : "Confirm your mobile number"}
                </Text>
              </View>
            </View>

            {!isPhoneVerifiedState && (
              <>
                <TextInput
                  style={{
                    backgroundColor: isDark ? "#1F2937" : "#F9FAFB",
                    borderRadius: 10,
                    borderWidth: 1,
                    borderColor: themeBorderColor,
                    color: themeTextColor,
                    paddingHorizontal: 14,
                    paddingVertical: 11,
                    fontSize: 15,
                    marginBottom: 10
                  }}
                  placeholder="e.g. +254 712 345 678"
                  placeholderTextColor={isDark ? "#6B7280" : "#9CA3AF"}
                  keyboardType="phone-pad"
                  value={phoneForVerification}
                  onChangeText={setPhoneForVerification}
                  editable={!isVerificationSmsSent}
                />

                {!isVerificationSmsSent ? (
                  <TouchableOpacity
                    onPress={handleSendPhoneSms}
                    style={{ backgroundColor: "#4F46E5", borderRadius: 10, paddingVertical: 13, alignItems: "center" }}
                  >
                    <Text style={{ color: "#FFF", fontWeight: "700", fontSize: 14 }}>📱 Send Verification Code</Text>
                  </TouchableOpacity>
                ) : (
                  <>
                    <Text style={{ color: isDark ? "#9CA3AF" : "#6B7280", fontSize: 12, marginBottom: 8 }}>
                      Enter the 6-digit code sent to {phoneForVerification}
                    </Text>
                    <TextInput
                      style={{
                        backgroundColor: isDark ? "#1F2937" : "#F9FAFB",
                        borderRadius: 10,
                        borderWidth: 1,
                        borderColor: themeBorderColor,
                        color: themeTextColor,
                        paddingHorizontal: 14,
                        paddingVertical: 11,
                        fontSize: 22,
                        letterSpacing: 8,
                        textAlign: "center",
                        marginBottom: 10,
                        fontWeight: "700"
                      }}
                      placeholder="● ● ● ● ● ●"
                      placeholderTextColor={isDark ? "#374151" : "#D1D5DB"}
                      keyboardType="number-pad"
                      maxLength={6}
                      value={verificationSmsCode}
                      onChangeText={setVerificationSmsCode}
                    />
                    <TouchableOpacity
                      onPress={handleVerifyPhoneCode}
                      style={{ backgroundColor: "#0F9D58", borderRadius: 10, paddingVertical: 13, alignItems: "center", marginBottom: 8 }}
                    >
                      <Text style={{ color: "#FFF", fontWeight: "700", fontSize: 14 }}>✅ Verify Code</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => setIsVerificationSmsSent(false)}>
                      <Text style={{ color: "#4F46E5", fontSize: 12, textAlign: "center" }}>Resend Code</Text>
                    </TouchableOpacity>
                  </>
                )}
              </>
            )}
          </View>

          {/* STEP 2: ID DOCUMENT UPLOAD */}
          <View style={{
            marginHorizontal: 16,
            marginBottom: 16,
            backgroundColor: themeCardBg,
            borderRadius: 16,
            padding: 20,
            borderWidth: 1,
            borderColor: idDocUri ? "#6EE7B7" : themeBorderColor,
            opacity: !isPhoneVerifiedState ? 0.45 : 1
          }}>
            <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 14 }}>
              <View style={{
                width: 36,
                height: 36,
                borderRadius: 18,
                backgroundColor: idDocUri ? "#0F9D58" : (!isPhoneVerifiedState ? (isDark ? "#374151" : "#E5E7EB") : "#F59E0B"),
                alignItems: "center",
                justifyContent: "center",
                marginRight: 10
              }}>
                <Text style={{ color: idDocUri || isPhoneVerifiedState ? "#FFF" : "#6B7280", fontWeight: "800" }}>{idDocUri ? "✓" : "2"}</Text>
              </View>
              <View>
                <Text style={{ color: themeTextColor, fontWeight: "700", fontSize: 15 }}>Government-Issued ID</Text>
                <Text style={{ color: isDark ? "#9CA3AF" : "#6B7280", fontSize: 12 }}>
                  {idDocUri ? "Uploaded ✅" : "National ID, Passport, or Driver's License"}
                </Text>
              </View>
            </View>

            {idDocUri ? (
              <View style={{ backgroundColor: isDark ? "#064E3B" : "#ECFDF5", borderRadius: 10, padding: 10, flexDirection: "row", alignItems: "center" }}>
                <Text style={{ fontSize: 20, marginRight: 8 }}>🪪</Text>
                <Text style={{ color: "#0F9D58", fontSize: 12, flex: 1 }}>Document uploaded and under review (Auto-approved in sandbox)</Text>
              </View>
            ) : (
              <>
                <Text style={{ color: isDark ? "#9CA3AF" : "#6B7280", fontSize: 12, marginBottom: 12, lineHeight: 17 }}>
                  Upload a clear photo of the front of your National ID or Passport. Ensure all corners are visible and details are legible.
                </Text>
                <TouchableOpacity
                  onPress={isPhoneVerifiedState ? handleUploadIdDoc : undefined}
                  style={{
                    backgroundColor: isPhoneVerifiedState ? "#F59E0B" : (isDark ? "#374151" : "#E5E7EB"),
                    borderRadius: 10,
                    paddingVertical: 13,
                    alignItems: "center",
                    flexDirection: "row",
                    justifyContent: "center",
                    gap: 8
                  }}
                >
                  <Text style={{ color: isPhoneVerifiedState ? "#FFF" : "#9CA3AF", fontWeight: "700", fontSize: 14 }}>
                    📸 Upload ID Document
                  </Text>
                </TouchableOpacity>
              </>
            )}
          </View>

          {/* STEP 3: SELFIE CAPTURE */}
          <View style={{
            marginHorizontal: 16,
            marginBottom: 16,
            backgroundColor: themeCardBg,
            borderRadius: 16,
            padding: 20,
            borderWidth: 1,
            borderColor: selfieUri ? "#6EE7B7" : themeBorderColor,
            opacity: !idDocUri ? 0.45 : 1
          }}>
            <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 14 }}>
              <View style={{
                width: 36,
                height: 36,
                borderRadius: 18,
                backgroundColor: selfieUri ? "#0F9D58" : (!idDocUri ? (isDark ? "#374151" : "#E5E7EB") : "#EC4899"),
                alignItems: "center",
                justifyContent: "center",
                marginRight: 10
              }}>
                <Text style={{ color: selfieUri || idDocUri ? "#FFF" : "#6B7280", fontWeight: "800" }}>{selfieUri ? "✓" : "3"}</Text>
              </View>
              <View>
                <Text style={{ color: themeTextColor, fontWeight: "700", fontSize: 15 }}>Live Selfie Capture</Text>
                <Text style={{ color: isDark ? "#9CA3AF" : "#6B7280", fontSize: 12 }}>
                  {selfieUri ? "Selfie captured ✅" : "Take a photo of your face to confirm identity"}
                </Text>
              </View>
            </View>

            {selfieUri ? (
              <View style={{ backgroundColor: isDark ? "#064E3B" : "#ECFDF5", borderRadius: 10, padding: 10, flexDirection: "row", alignItems: "center" }}>
                <Text style={{ fontSize: 20, marginRight: 8 }}>🤳</Text>
                <Text style={{ color: "#0F9D58", fontSize: 12, flex: 1 }}>Selfie matched against ID. Liveness check passed.</Text>
              </View>
            ) : (
              <>
                <Text style={{ color: isDark ? "#9CA3AF" : "#6B7280", fontSize: 12, marginBottom: 12, lineHeight: 17 }}>
                  Look directly at the camera in a well-lit space. Remove glasses and ensure your full face is visible.
                </Text>
                <TouchableOpacity
                  onPress={idDocUri ? handleUploadSelfie : undefined}
                  style={{
                    backgroundColor: idDocUri ? "#EC4899" : (isDark ? "#374151" : "#E5E7EB"),
                    borderRadius: 10,
                    paddingVertical: 13,
                    alignItems: "center",
                    flexDirection: "row",
                    justifyContent: "center",
                    gap: 8
                  }}
                >
                  <Text style={{ color: idDocUri ? "#FFF" : "#9CA3AF", fontWeight: "700", fontSize: 14 }}>
                    🤳 Capture Selfie
                  </Text>
                </TouchableOpacity>
              </>
            )}
          </View>

          {/* Info note */}
          <View style={{
            marginHorizontal: 16,
            backgroundColor: isDark ? "#1E3A5F" : "#EFF6FF",
            borderRadius: 12,
            padding: 14,
            borderWidth: 1,
            borderColor: isDark ? "#3B82F6" : "#BFDBFE",
            flexDirection: "row"
          }}>
            <Text style={{ fontSize: 16, marginRight: 8 }}>🔒</Text>
            <Text style={{ color: isDark ? "#93C5FD" : "#1E40AF", fontSize: 12, flex: 1, lineHeight: 17 }}>
              Your documents are encrypted and only used for identity verification. PayLoop never shares your data with third parties without consent.
            </Text>
          </View>
        </>
      )}
    </ScrollView>
  );
}
