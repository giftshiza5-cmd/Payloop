import React from "react";
import { View, Text, TouchableOpacity, ScrollView, Alert } from "react-native";
import { useApp } from "../../context/AppContext";
import { styles } from "../../../styles";

export default function SecuritySettings() {
  const {
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
    themeDividerColor
  } = useApp();

  return (
    <ScrollView style={[styles.tabContentLight, { backgroundColor: themeBg }]} showsVerticalScrollIndicator={false}>
      <View style={styles.subScreenHeader}>
        <TouchableOpacity onPress={() => setActiveSubScreen(null)} style={[styles.backButton, { backgroundColor: themeCardBg, borderColor: themeBorderColor }]}>
          <Text style={[styles.backButtonText, { color: themeTextColor }]}>←</Text>
        </TouchableOpacity>
        <Text style={[styles.subScreenTitle, { color: themeTextColor }]}>Security Settings</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={[styles.detailCardBox, { backgroundColor: themeCardBg, borderColor: themeBorderColor }]}>
        <Text style={[styles.detailCardHeader, { color: themeTextColor }]}>Authentication</Text>

        <TouchableOpacity 
          onPress={() => Alert.alert("Change PIN", "Simulating PIN revision. We have dispatched authentication code to your registered email.")} 
          style={[styles.securityChangePinRowItem, { borderColor: themeBorderColor }]}
        >
          <Text style={[styles.securityPinChangeLabel, { color: themeTextColor }]}>Change Account PIN</Text>
          <Text style={[styles.moreMenuChevron, { color: themeSubtitleColor }]}>›</Text>
        </TouchableOpacity>

        <View style={[styles.dividerSlate, { backgroundColor: themeDividerColor }]} />

        <View style={styles.settingToggleRow}>
          <View style={{ flex: 1, paddingRight: 10 }}>
            <Text style={[styles.settingToggleLabel, { color: themeTextColor }]}>Enable Startup PIN</Text>
            <Text style={[styles.settingToggleDesc, { color: themeSubtitleColor }]}>Request 6 digit PIN on mobile startup</Text>
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
            <Text style={[styles.settingToggleLabel, { color: themeTextColor }]}>Biometric Login</Text>
            <Text style={[styles.settingToggleDesc, { color: themeSubtitleColor }]}>Enable Face ID or Touch ID logins</Text>
          </View>
          <TouchableOpacity 
            onPress={() => setSecurityBiometricToggle(!securityBiometricToggle)} 
            style={[styles.switchOuterTrack, securityBiometricToggle ? styles.switchOuterTrackActive : null]}
          >
            <View style={[styles.switchInnerDot, securityBiometricToggle ? styles.switchInnerDotActive : null]} />
          </TouchableOpacity>
        </View>
      </View>

      <View style={[styles.detailCardBox, { backgroundColor: themeCardBg, borderColor: themeBorderColor }]}>
        <Text style={[styles.detailCardHeader, { color: themeTextColor }]}>Active Session</Text>
        <View style={[styles.sessionDetailsBox, { borderColor: themeBorderColor, backgroundColor: isDark ? "#0F172A" : "#F9FAFB" }]}>
          <Text style={[styles.sessionLocationLabel, { color: themeTextColor }]}>Uasin Gishu, Kenya</Text>
          <Text style={[styles.sessionStatusText, { color: themeSubtitleColor }]}>Android Device • Current Active Session</Text>
        </View>
        <TouchableOpacity 
          onPress={() => Alert.alert("Sessions Revoked", "Successfully logged out of all other devices.")} 
          style={[styles.revokeSessionsBtn, { borderColor: themeBorderColor, backgroundColor: themeCardBg }]}
        >
          <Text style={[styles.revokeSessionsBtnText, { color: themeTextColor }]}>Terminate Other Sessions</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}
