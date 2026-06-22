import React, { useState } from "react";
import { View, Text, TouchableOpacity, ScrollView, Alert, Modal, TextInput, ActivityIndicator } from "react-native";
import { useApp } from "../../context/AppContext";
import { styles } from "../../../styles";

export default function SecuritySettings() {
  const {
    selectedUser,
    setSelectedUser,
    securityPinToggle,
    setSecurityPinToggle,
    securityBiometricToggle,
    setSecurityBiometricToggle,
    setActiveSubScreen,
    isDark,
    themeBg,
    themeCardBg,
    themeBorderColor,
    themeTextColor,
    themeSubtitleColor,
    themeDividerColor,
    t
  } = useApp();

  // Local state for Change PIN Modal
  const [showPinModal, setShowPinModal] = useState(false);
  const [currentPin, setCurrentPin] = useState("");
  const [newPin, setNewPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");

  // Local state for Biometric Scan Modal
  const [showBioModal, setShowBioModal] = useState(false);
  const [bioStep, setBioStep] = useState("idle"); // "idle" | "scanning" | "done"
  const [bioType, setBioType] = useState("fingerprint"); // "fingerprint" | "face"

  const handleOpenPinModal = () => {
    setCurrentPin("");
    setNewPin("");
    setConfirmPin("");
    setShowPinModal(true);
  };

  const handleSavePin = () => {
    if (!currentPin || !newPin || !confirmPin) {
      Alert.alert(t("error"), t("fill_all_pin_fields", "Please fill in all PIN fields."));
      return;
    }
    if (currentPin !== selectedUser?.pin) {
      Alert.alert(t("error"), t("current_pin_incorrect", "Current Security PIN is incorrect."));
      return;
    }
    if (newPin.length !== 6 || confirmPin.length !== 6) {
      Alert.alert(t("error"), t("pin_must_6_digits", "New PIN must be exactly 6 digits."));
      return;
    }
    if (newPin !== confirmPin) {
      Alert.alert(t("error"), t("pins_do_not_match", "New PIN and Confirm PIN do not match."));
      return;
    }
    
    // Save PIN
    setSelectedUser(prev => ({ ...prev, pin: newPin }));
    setShowPinModal(false);
    Alert.alert(t("success"), t("pin_changed_success", "Your Security PIN has been updated successfully."));
  };

  const startBiometricScan = (type) => {
    setBioType(type);
    setBioStep("scanning");
    setTimeout(() => {
      setBioStep("done");
      setSecurityBiometricToggle(true);
    }, 2000);
  };

  const inputStyle = {
    backgroundColor: isDark ? "#0F172A" : "#F8FAFC",
    borderRadius: 12, borderWidth: 1.5,
    borderColor: themeBorderColor,
    color: themeTextColor,
    paddingHorizontal: 16, paddingVertical: 12,
    fontSize: 15, marginTop: 6,
    textAlign: "center"
  };

  const labelStyle = {
    fontSize: 11, fontWeight: "700",
    color: themeSubtitleColor,
    marginTop: 12, textTransform: "uppercase", letterSpacing: 0.6
  };

  return (
    <ScrollView style={[styles.tabContentLight, { backgroundColor: themeBg, paddingTop: 16 }]} showsVerticalScrollIndicator={false}>
      
      <View style={[styles.detailCardBox, { backgroundColor: themeCardBg, borderColor: themeBorderColor }]}>
        <Text style={[styles.detailCardHeader, { color: themeTextColor }]}>{t("authentication", "Authentication")}</Text>

        <TouchableOpacity 
          onPress={handleOpenPinModal} 
          style={[styles.securityChangePinRowItem, { borderColor: themeBorderColor }]}
        >
          <Text style={[styles.securityPinChangeLabel, { color: themeTextColor }]}>{t("change_pin", "Change Account PIN")}</Text>
          <Text style={[styles.moreMenuChevron, { color: themeSubtitleColor }]}>›</Text>
        </TouchableOpacity>

        <View style={[styles.dividerSlate, { backgroundColor: themeDividerColor }]} />

        <View style={styles.settingToggleRow}>
          <View style={{ flex: 1, paddingRight: 10 }}>
            <Text style={[styles.settingToggleLabel, { color: themeTextColor }]}>{t("enable_startup_pin", "Enable Startup PIN")}</Text>
            <Text style={[styles.settingToggleDesc, { color: themeSubtitleColor }]}>{t("enable_startup_pin_desc", "Request 6 digit PIN on mobile startup")}</Text>
          </View>
          <TouchableOpacity 
            onPress={() => setSecurityPinToggle(!securityPinToggle)} 
            style={[styles.switchOuterTrack, securityPinToggle ? styles.switchOuterTrackActive : null]}
          >
            <View style={[styles.switchInnerDot, securityPinToggle ? styles.switchInnerDotActive : null]} />
          </TouchableOpacity>
        </View>

        <View style={[styles.dividerSlate, { backgroundColor: themeDividerColor }]} />

        <View style={styles.settingToggleRow}>
          <View style={{ flex: 1, paddingRight: 10 }}>
            <Text style={[styles.settingToggleLabel, { color: themeTextColor }]}>{t("biometric_login", "Biometric Login")}</Text>
            <Text style={[styles.settingToggleDesc, { color: themeSubtitleColor }]}>{t("biometric_login_desc", "Enable Face ID or Touch ID logins")}</Text>
          </View>
          <TouchableOpacity 
            onPress={() => {
              if (securityBiometricToggle) {
                setSecurityBiometricToggle(false);
              } else {
                setBioStep("idle");
                setShowBioModal(true);
              }
            }} 
            style={[styles.switchOuterTrack, securityBiometricToggle ? styles.switchOuterTrackActive : null]}
          >
            <View style={[styles.switchInnerDot, securityBiometricToggle ? styles.switchInnerDotActive : null]} />
          </TouchableOpacity>
        </View>

        {/* Biometrics Setup Trigger Button */}
        {!securityBiometricToggle && (
          <>
            <View style={[styles.dividerSlate, { backgroundColor: themeDividerColor }]} />
            <TouchableOpacity 
              onPress={() => {
                setBioStep("idle");
                setShowBioModal(true);
              }}
              style={{ paddingVertical: 12, alignItems: "center" }}
            >
              <Text style={{ fontSize: 13, fontWeight: "700", color: "#0F9D58" }}>⚙️ {t("biometric_setup", "Register Biometrics (Fingerprint / Face)")}</Text>
            </TouchableOpacity>
          </>
        )}
      </View>

      <View style={[styles.detailCardBox, { backgroundColor: themeCardBg, borderColor: themeBorderColor }]}>
        <Text style={[styles.detailCardHeader, { color: themeTextColor }]}>{t("active_session", "Active Session")}</Text>
        <View style={[styles.sessionDetailsBox, { borderColor: themeBorderColor, backgroundColor: isDark ? "#0F172A" : "#F9FAFB" }]}>
          <Text style={[styles.sessionLocationLabel, { color: themeTextColor }]}>Uasin Gishu, Kenya</Text>
          <Text style={[styles.sessionStatusText, { color: themeSubtitleColor }]}>Android Device • Current Active Session</Text>
        </View>
        <TouchableOpacity 
          onPress={() => Alert.alert(t("sessions_revoked", "Sessions Revoked"), t("sessions_revoked_desc", "Successfully logged out of all other devices."))} 
          style={[styles.revokeSessionsBtn, { borderColor: themeBorderColor, backgroundColor: themeCardBg }]}
        >
          <Text style={[styles.revokeSessionsBtnText, { color: themeTextColor }]}>{t("terminate_other_sessions", "Terminate Other Sessions")}</Text>
        </TouchableOpacity>
      </View>

      {/* ── INTERACTIVE CHANGE PIN MODAL ── */}
      <Modal visible={showPinModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.stkModalCard, { width: 320, backgroundColor: themeCardBg, borderColor: themeBorderColor, borderWidth: 1, padding: 20 }]}>
            <Text style={{ fontSize: 16, fontWeight: "800", color: themeTextColor, textAlign: "center", marginBottom: 12 }}>
              🔒 {t("change_pin", "Change Account PIN")}
            </Text>

            <Text style={labelStyle}>{t("current_pin", "Current PIN")}</Text>
            <TextInput
              style={inputStyle}
              placeholder="••••••"
              placeholderTextColor={isDark ? "#4B5563" : "#9CA3AF"}
              secureTextEntry
              keyboardType="numeric"
              maxLength={6}
              value={currentPin}
              onChangeText={setCurrentPin}
            />

            <Text style={labelStyle}>{t("new_pin", "New 6-Digit PIN")}</Text>
            <TextInput
              style={inputStyle}
              placeholder="••••••"
              placeholderTextColor={isDark ? "#4B5563" : "#9CA3AF"}
              secureTextEntry
              keyboardType="numeric"
              maxLength={6}
              value={newPin}
              onChangeText={setNewPin}
            />

            <Text style={labelStyle}>{t("confirm_new_pin", "Confirm New PIN")}</Text>
            <TextInput
              style={inputStyle}
              placeholder="••••••"
              placeholderTextColor={isDark ? "#4B5563" : "#9CA3AF"}
              secureTextEntry
              keyboardType="numeric"
              maxLength={6}
              value={confirmPin}
              onChangeText={setConfirmPin}
            />

            <View style={{ flexDirection: "row", gap: 10, marginTop: 24 }}>
              <TouchableOpacity onPress={() => setShowPinModal(false)} style={{ flex: 1, paddingVertical: 12, borderRadius: 10, borderWidth: 1, borderColor: themeBorderColor, alignItems: "center" }}>
                <Text style={{ color: themeSubtitleColor, fontWeight: "700", fontSize: 13 }}>{t("cancel")}</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleSavePin} style={{ flex: 1, paddingVertical: 12, borderRadius: 10, backgroundColor: "#0F9D58", alignItems: "center" }}>
                <Text style={{ color: "#FFFFFF", fontWeight: "700", fontSize: 13 }}>{t("save")}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* ── BIOMETRICS SETUP SCANNER MODAL ── */}
      <Modal visible={showBioModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.stkModalCard, { width: 320, backgroundColor: themeCardBg, borderColor: themeBorderColor, borderWidth: 1, padding: 22, alignItems: "center" }]}>
            
            {bioStep === "idle" && (
              <>
                <Text style={{ fontSize: 16, fontWeight: "800", color: themeTextColor, textAlign: "center", marginBottom: 6 }}>
                  🧬 {t("biometric_setup", "Register Biometrics")}
                </Text>
                <Text style={{ fontSize: 12, color: themeSubtitleColor, textAlign: "center", marginBottom: 20 }}>
                  {t("biometric_setup_choose", "Choose the type of biometric sensor registration to simulate.")}
                </Text>

                <View style={{ flexDirection: "row", gap: 12, width: "100%", marginBottom: 20 }}>
                  <TouchableOpacity 
                    onPress={() => startBiometricScan("fingerprint")} 
                    style={{ flex: 1, paddingVertical: 16, borderRadius: 12, borderWidth: 1.5, borderColor: themeBorderColor, alignItems: "center", backgroundColor: isDark ? "#1E293B" : "#F8FAFC" }}
                  >
                    <Text style={{ fontSize: 32, marginBottom: 6 }}>☝️</Text>
                    <Text style={{ fontSize: 11, fontWeight: "700", color: themeTextColor }}>{t("fingerprint_scan", "Touch ID Scan")}</Text>
                  </TouchableOpacity>

                  <TouchableOpacity 
                    onPress={() => startBiometricScan("face")} 
                    style={{ flex: 1, paddingVertical: 16, borderRadius: 12, borderWidth: 1.5, borderColor: themeBorderColor, alignItems: "center", backgroundColor: isDark ? "#1E293B" : "#F8FAFC" }}
                  >
                    <Text style={{ fontSize: 32, marginBottom: 6 }}>👤</Text>
                    <Text style={{ fontSize: 11, fontWeight: "700", color: themeTextColor }}>{t("face_scan", "Face ID Scan")}</Text>
                  </TouchableOpacity>
                </View>

                <TouchableOpacity onPress={() => setShowBioModal(false)} style={{ width: "100%", paddingVertical: 12, borderRadius: 10, borderWidth: 1, borderColor: themeBorderColor, alignItems: "center" }}>
                  <Text style={{ color: themeSubtitleColor, fontWeight: "700", fontSize: 13 }}>{t("cancel")}</Text>
                </TouchableOpacity>
              </>
            )}

            {bioStep === "scanning" && (
              <>
                <Text style={{ fontSize: 16, fontWeight: "800", color: themeTextColor, textAlign: "center", marginBottom: 24 }}>
                  {bioType === "fingerprint" ? t("scanning_finger", "Scanning Fingerprint...") : t("scanning_face", "Scanning Face...")}
                </Text>
                
                <View style={{ width: 100, height: 100, borderRadius: 50, borderWidth: 3, borderColor: "#0F9D58", alignItems: "center", justifyContent: "center", marginBottom: 24 }}>
                  <ActivityIndicator size="large" color="#0F9D58" />
                </View>

                <Text style={{ fontSize: 12, color: themeSubtitleColor, textAlign: "center", lineHeight: 18 }}>
                  {t("scanning_hold", "Please hold still. Placing credentials on secure biometric enclave...")}
                </Text>
              </>
            )}

            {bioStep === "done" && (
              <>
                <Text style={{ fontSize: 16, fontWeight: "800", color: themeTextColor, textAlign: "center", marginBottom: 12 }}>
                  ✓ {t("registration_complete", "Registration Complete")}
                </Text>
                <Text style={{ fontSize: 32, marginVertical: 16 }}>🎉</Text>
                <Text style={{ fontSize: 13, color: themeSubtitleColor, textAlign: "center", marginBottom: 20 }}>
                  {bioType === "fingerprint" 
                    ? t("finger_setup_success", "Fingerprint successfully registered. You can now use biometric sensors to sign in.") 
                    : t("face_setup_success", "Face scan successfully registered. You can now use Face ID to sign in.")}
                </Text>

                <TouchableOpacity 
                  onPress={() => setShowBioModal(false)} 
                  style={{ width: "100%", paddingVertical: 12, borderRadius: 10, backgroundColor: "#0F9D58", alignItems: "center" }}
                >
                  <Text style={{ color: "#FFFFFF", fontWeight: "700", fontSize: 13 }}>{t("done", "Done")}</Text>
                </TouchableOpacity>
              </>
            )}

          </View>
        </View>
      </Modal>

    </ScrollView>
  );
}
