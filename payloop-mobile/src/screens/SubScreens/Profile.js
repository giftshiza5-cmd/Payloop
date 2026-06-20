import React from "react";
import { View, Text, TouchableOpacity, ScrollView, Image, Alert } from "react-native";
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
    t
  } = useApp();

  return (
    <ScrollView style={[styles.tabContentLight, { backgroundColor: themeBg }]} showsVerticalScrollIndicator={false}>
      <View style={styles.subScreenHeader}>
        <TouchableOpacity onPress={() => setActiveSubScreen(null)} style={[styles.backButton, { backgroundColor: themeCardBg, borderColor: themeBorderColor }]}>
          <Text style={[styles.backButtonText, { color: themeTextColor }]}>←</Text>
        </TouchableOpacity>
        <Text style={[styles.subScreenTitle, { color: themeTextColor }]}>{t("profile")}</Text>
        <TouchableOpacity onPress={openEditProfile} style={styles.headerActionButton}>
          <Text style={styles.headerActionButtonText}>{t("edit")}</Text>
        </TouchableOpacity>
      </View>

      <View style={[styles.profileAvatarCard, { backgroundColor: themeCardBg, borderColor: themeBorderColor }]}>
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
          <Text style={[styles.profileDetailLabel, { color: themeSubtitleColor }]}>{t("fullname")}</Text>
          <Text style={[styles.profileDetailValue, { color: themeTextColor }]}>{selectedUser.name}</Text>
        </View>
        <View style={[styles.dividerSlate, { backgroundColor: themeDividerColor, marginVertical: 8 }]} />
        <View style={styles.profileDetailRow}>
          <Text style={[styles.profileDetailLabel, { color: themeSubtitleColor }]}>{t("email")}</Text>
          <Text style={[styles.profileDetailValue, { color: themeTextColor }]}>{selectedUser.email}</Text>
        </View>
        <View style={[styles.dividerSlate, { backgroundColor: themeDividerColor, marginVertical: 8 }]} />
        <View style={styles.profileDetailRow}>
          <Text style={[styles.profileDetailLabel, { color: themeSubtitleColor }]}>{t("phone")}</Text>
          <Text style={[styles.profileDetailValue, { color: themeTextColor }]}>{selectedUser.phone}</Text>
        </View>
        <View style={[styles.dividerSlate, { backgroundColor: themeDividerColor, marginVertical: 8 }]} />
        <View style={styles.profileDetailRow}>
          <Text style={[styles.profileDetailLabel, { color: themeSubtitleColor }]}>{t("bio")}</Text>
          <Text style={[styles.profileDetailValue, { color: themeTextColor, flex: 1, textAlign: 'right' }]} numberOfLines={2}>{selectedUser.bio}</Text>
        </View>
        <View style={[styles.dividerSlate, { backgroundColor: themeDividerColor, marginVertical: 8 }]} />
        <View style={styles.profileDetailRow}>
          <Text style={[styles.profileDetailLabel, { color: themeSubtitleColor }]}>{t("marital_status")}</Text>
          <Text style={[styles.profileDetailValue, { color: themeTextColor }]}>{selectedUser.maritalStatus}</Text>
        </View>
        <View style={[styles.dividerSlate, { backgroundColor: themeDividerColor, marginVertical: 8 }]} />
        <View style={styles.profileDetailRow}>
          <Text style={[styles.profileDetailLabel, { color: themeSubtitleColor }]}>Occupation</Text>
          <Text style={[styles.profileDetailValue, { color: themeTextColor }]}>{selectedUser.occupation}</Text>
        </View>
        <View style={[styles.dividerSlate, { backgroundColor: themeDividerColor, marginVertical: 8 }]} />
        <View style={styles.profileDetailRow}>
          <Text style={[styles.profileDetailLabel, { color: themeSubtitleColor }]}>Gender</Text>
          <Text style={[styles.profileDetailValue, { color: themeTextColor }]}>{selectedUser.gender}</Text>
        </View>
        <View style={[styles.dividerSlate, { backgroundColor: themeDividerColor, marginVertical: 8 }]} />
        <View style={styles.profileDetailRow}>
          <Text style={[styles.profileDetailLabel, { color: themeSubtitleColor }]}>Date of Birth</Text>
          <Text style={[styles.profileDetailValue, { color: themeTextColor }]}>{selectedUser.dob}</Text>
        </View>
      </View>

      {/* Log Out Button at the bottom of Profile */}
      <TouchableOpacity
        onPress={() => {
          Alert.alert(
            t("logout"),
            "Are you sure you want to log out of your PayLoop account?",
            [
              { text: t("cancel"), style: "cancel" },
              { text: t("logout"), style: "destructive", onPress: () => {
                  setSelectedUser(null);
                  setCurrentScreen("welcome");
                  setActiveSubScreen(null);
                }
              }
            ]
          );
        }}
        style={[styles.walletActionBtnDisconnect, { marginHorizontal: 0, marginTop: 10, marginBottom: 40 }]}
      >
        <Text style={styles.walletActionBtnDisconnectText}>🚪 {t("logout")}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}
