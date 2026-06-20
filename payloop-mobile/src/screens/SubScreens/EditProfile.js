import React from "react";
import { View, Text, TouchableOpacity, ScrollView, Image, TextInput } from "react-native";
import { useApp } from "../../context/AppContext";
import { styles } from "../../../styles";

export default function EditProfile() {
  const {
    editAvatarUri,
    editName,
    setEditName,
    editEmail,
    setEditEmail,
    editPhone,
    setEditPhone,
    editBio,
    setEditBio,
    editMarital,
    setEditMarital,
    setShowAvatarPicker,
    handleSaveProfile,
    setActiveSubScreen,
    isDark,
    themeBg,
    themeCardBg,
    themeBorderColor,
    themeTextColor,
    themeSubtitleColor,
    t
  } = useApp();

  return (
    <ScrollView style={[styles.tabContentLight, { backgroundColor: themeBg }]} showsVerticalScrollIndicator={false}>
      <View style={styles.subScreenHeader}>
        <TouchableOpacity onPress={() => setActiveSubScreen("profile")} style={[styles.backButton, { backgroundColor: themeCardBg, borderColor: themeBorderColor }]}>
          <Text style={[styles.backButtonText, { color: themeTextColor }]}>←</Text>
        </TouchableOpacity>
        <Text style={[styles.subScreenTitle, { color: themeTextColor }]}>{t("edit_profile")}</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Editable Avatar */}
      <TouchableOpacity onPress={() => setShowAvatarPicker(true)} style={{ alignSelf: "center", marginBottom: 20, position: "relative" }}>
        <View style={[styles.profileBigAvatarCircle, { backgroundColor: isDark ? "#334155" : "#F3F4F6", borderColor: themeBorderColor }]}>
          {editAvatarUri ? (
            <Image source={{ uri: editAvatarUri }} style={{ width: 96, height: 96, borderRadius: 48 }} />
          ) : (
            <Text style={styles.profileBigAvatarText}>👤</Text>
          )}
        </View>
        <View style={[styles.moreCameraBadge, { width: 30, height: 30, borderRadius: 15, right: 2, bottom: 2, borderWidth: 3, borderColor: themeCardBg }]}>
          <Text style={{ fontSize: 12, color: "#ffffff" }}>📷</Text>
        </View>
      </TouchableOpacity>
      <Text style={{ alignSelf: "center", fontSize: 13, fontWeight: "700", color: "#0F9D58", marginBottom: 15 }}>
        {t("change_photo")}
      </Text>

      <View style={[styles.formCardLight, { backgroundColor: themeCardBg, borderColor: themeBorderColor, padding: 20, borderRadius: 24, borderWidth: 1 }]}>
        <Text style={[styles.inputLabelField, { color: themeSubtitleColor }]}>{t("fullname")}</Text>
        <TextInput
          style={[styles.textInputField, { backgroundColor: isDark ? "#0F172A" : "#F8FAFC", borderColor: themeBorderColor, color: themeTextColor }]}
          value={editName}
          onChangeText={setEditName}
        />

        <Text style={[styles.inputLabelField, { color: themeSubtitleColor, marginTop: 14 }]}>{t("email")}</Text>
        <TextInput
          style={[styles.textInputField, { backgroundColor: isDark ? "#0F172A" : "#F8FAFC", borderColor: themeBorderColor, color: themeTextColor }]}
          value={editEmail}
          onChangeText={setEditEmail}
          keyboardType="email-address"
        />

        <Text style={[styles.inputLabelField, { color: themeSubtitleColor, marginTop: 14 }]}>{t("phone")}</Text>
        <TextInput
          style={[styles.textInputField, { backgroundColor: isDark ? "#0F172A" : "#F8FAFC", borderColor: themeBorderColor, color: themeTextColor }]}
          value={editPhone}
          onChangeText={setEditPhone}
          keyboardType="phone-pad"
        />

        <Text style={[styles.inputLabelField, { color: themeSubtitleColor, marginTop: 14 }]}>{t("bio")}</Text>
        <TextInput
          style={[styles.textInputField, { backgroundColor: isDark ? "#0F172A" : "#F8FAFC", borderColor: themeBorderColor, color: themeTextColor, height: 80 }]}
          value={editBio}
          onChangeText={setEditBio}
          multiline
        />

        <Text style={[styles.inputLabelField, { color: themeSubtitleColor, marginTop: 14 }]}>{t("marital_status")}</Text>
        <View style={styles.pickerAlternativeRow}>
          {["Single", "Married", "Other"].map((status) => (
            <TouchableOpacity
              key={status}
              onPress={() => setEditMarital(status)}
              style={[
                styles.pickerOptionButton,
                { backgroundColor: isDark ? "#0F172A" : "#F3F4F6", borderColor: themeBorderColor },
                editMarital === status ? styles.pickerOptionButtonActive : null
              ]}
            >
              <Text style={[styles.pickerOptionText, { color: isDark ? "#94A3B8" : "#4B5563" }, editMarital === status ? styles.pickerOptionTextActive : null]}>
                {status}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Bottom Actions Buttons Row */}
        <View style={{ flexDirection: "row", gap: 12, marginTop: 24 }}>
          <TouchableOpacity onPress={() => setActiveSubScreen("profile")} style={[styles.walletActionBtnOutline, { flex: 1, marginHorizontal: 0, borderColor: themeBorderColor, paddingVertical: 10 }]}>
            <Text style={[styles.walletActionBtnOutlineText, { color: themeSubtitleColor }]}>{t("cancel")}</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleSaveProfile} style={[styles.walletActionBtnOutline, { flex: 1, marginHorizontal: 0, backgroundColor: "#0F9D58", borderColor: "#0F9D58", paddingVertical: 10 }]}>
            <Text style={[styles.walletActionBtnOutlineText, { color: "#ffffff" }]}>{t("save")}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}
