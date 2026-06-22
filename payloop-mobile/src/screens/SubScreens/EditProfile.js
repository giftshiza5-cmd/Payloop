import React, { useState } from "react";
import { View, Text, TouchableOpacity, ScrollView, Image, TextInput, Modal, Alert } from "react-native";
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
    editOccupation,
    setEditOccupation,
    editDob,
    setEditDob,
    editGender,
    setEditGender,
    editCounty,
    setEditCounty,
    editAddress,
    setEditAddress,
    editNationalId,
    setEditNationalId,
    editIdDocument,
    setEditIdDocument,
    editSelfie,
    setEditSelfie,
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

  // Local state for custom Date Picker
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [tempDay, setTempDay] = useState(15);
  const [tempMonth, setTempMonth] = useState(5); // June
  const [tempYear, setTempYear] = useState(1995);

  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const years = Array.from({ length: 77 }, (_, i) => 1950 + i); // 1950 to 2026

  // Calculate completeness percentage dynamically
  const fields = [
    editName, editEmail, editPhone, editBio, editMarital,
    editOccupation, editDob, editGender, editCounty, editAddress,
    editNationalId, editIdDocument, editSelfie
  ];
  const filledCount = fields.filter(val => val && String(val).trim() !== "" && val !== "Not Specified").length;
  const completeness = Math.round((filledCount / fields.length) * 100);

  const handleOpenDatePicker = () => {
    // Attempt to parse existing DOB (e.g. "15 Jun 1995")
    if (editDob && editDob !== "Not Specified") {
      const parts = editDob.split(" ");
      if (parts.length === 3) {
        const d = parseInt(parts[0], 10);
        const mIdx = months.indexOf(parts[1]);
        const y = parseInt(parts[2], 10);
        if (!isNaN(d)) setTempDay(d);
        if (mIdx !== -1) setTempMonth(mIdx);
        if (!isNaN(y)) setTempYear(y);
      }
    }
    setShowDatePicker(true);
  };

  const handleConfirmDate = () => {
    const formattedDate = `${tempDay} ${months[tempMonth]} ${tempYear}`;
    setEditDob(formattedDate);
    setShowDatePicker(false);
  };

  const simulateIdUpload = () => {
    Alert.alert(
      t("upload_id", "Upload ID Document"),
      t("upload_id_prompt", "Upload a photo or scanned copy of your national identity card."),
      [
        { text: t("cancel"), style: "cancel" },
        {
          text: t("upload", "Upload File"),
          onPress: () => {
            setEditIdDocument("national_id_card.png");
            Alert.alert(t("success"), t("id_uploaded", "National ID document captured successfully."));
          }
        }
      ]
    );
  };

  const simulateSelfieCapture = () => {
    Alert.alert(
      t("capture_selfie", "Selfie (Face Verification)"),
      t("selfie_prompt", "Position your face in the camera frame to capture your verification selfie."),
      [
        { text: t("cancel"), style: "cancel" },
        {
          text: t("capture", "Capture Selfie"),
          onPress: () => {
            setEditSelfie("verification_selfie.png");
            Alert.alert(t("success"), t("selfie_uploaded", "Selfie captured & biometric markers processed."));
          }
        }
      ]
    );
  };

  return (
    <ScrollView style={[styles.tabContentLight, { backgroundColor: themeBg, paddingTop: 16 }]} contentContainerStyle={{ paddingBottom: 50 }} showsVerticalScrollIndicator={false}>
      
      {/* ── ACCOUNT COMPLETENESS METER ── */}
      <View style={[styles.formCardLight, { backgroundColor: themeCardBg, borderColor: themeBorderColor, padding: 18, borderRadius: 20, borderWidth: 1, marginBottom: 20 }]}>
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
          <Text style={{ fontSize: 14, fontWeight: "800", color: themeTextColor }}>{t("completeness", "Account Completeness")}</Text>
          <Text style={{ fontSize: 14, fontWeight: "900", color: completeness === 100 ? "#0F9D58" : "#F59E0B" }}>{completeness}%</Text>
        </View>
        <View style={{ height: 10, backgroundColor: isDark ? "#1E293B" : "#E2E8F0", borderRadius: 5, overflow: "hidden" }}>
          <View style={{ width: `${completeness}%`, height: "100%", backgroundColor: completeness === 100 ? "#0F9D58" : "#F59E0B", borderRadius: 5 }} />
        </View>
        <Text style={{ fontSize: 11, color: themeSubtitleColor, marginTop: 8 }}>
          {completeness === 100 
            ? t("kyc_complete_hint", "Perfect! Your profile is complete and identity documents are ready.")
            : t("kyc_pending_hint", "Complete all fields and upload ID + Selfie to achieve 100% verification and unlock all tabs.")}
        </Text>
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
        {t("change_photo", "Change Photo")}
      </Text>

      <View style={[styles.formCardLight, { backgroundColor: themeCardBg, borderColor: themeBorderColor, padding: 20, borderRadius: 24, borderWidth: 1 }]}>
        <Text style={[styles.inputLabelField, { color: themeSubtitleColor }]}>{t("fullname", "Full Name")}</Text>
        <TextInput
          style={[styles.textInputField, { backgroundColor: isDark ? "#0F172A" : "#F8FAFC", borderColor: themeBorderColor, color: themeTextColor }]}
          value={editName}
          onChangeText={setEditName}
          placeholder="e.g. John Kamau"
          placeholderTextColor={isDark ? "#4B5563" : "#9CA3AF"}
        />

        <Text style={[styles.inputLabelField, { color: themeSubtitleColor, marginTop: 14 }]}>{t("email", "Email Address")}</Text>
        <TextInput
          style={[styles.textInputField, { backgroundColor: isDark ? "#0F172A" : "#F8FAFC", borderColor: themeBorderColor, color: themeTextColor }]}
          value={editEmail}
          onChangeText={setEditEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          placeholder="e.g. john@example.com"
          placeholderTextColor={isDark ? "#4B5563" : "#9CA3AF"}
        />

        <Text style={[styles.inputLabelField, { color: themeSubtitleColor, marginTop: 14 }]}>{t("phone", "Phone Number")}</Text>
        <TextInput
          style={[styles.textInputField, { backgroundColor: isDark ? "#0F172A" : "#F8FAFC", borderColor: themeBorderColor, color: themeTextColor }]}
          value={editPhone}
          onChangeText={setEditPhone}
          keyboardType="phone-pad"
          placeholder="e.g. +254 712 345 678"
          placeholderTextColor={isDark ? "#4B5563" : "#9CA3AF"}
        />

        <Text style={[styles.inputLabelField, { color: themeSubtitleColor, marginTop: 14 }]}>{t("bio", "Bio Description")}</Text>
        <TextInput
          style={[styles.textInputField, { backgroundColor: isDark ? "#0F172A" : "#F8FAFC", borderColor: themeBorderColor, color: themeTextColor, height: 80 }]}
          value={editBio}
          onChangeText={setEditBio}
          placeholder="Write something about yourself..."
          placeholderTextColor={isDark ? "#4B5563" : "#9CA3AF"}
          multiline
        />

        <Text style={[styles.inputLabelField, { color: themeSubtitleColor, marginTop: 14 }]}>{t("nationalId", "National ID / Passport")}</Text>
        <TextInput
          style={[styles.textInputField, { backgroundColor: isDark ? "#0F172A" : "#F8FAFC", borderColor: themeBorderColor, color: themeTextColor }]}
          value={editNationalId}
          onChangeText={setEditNationalId}
          keyboardType="numeric"
          placeholder="e.g. 32456789"
          placeholderTextColor={isDark ? "#4B5563" : "#9CA3AF"}
        />

        <Text style={[styles.inputLabelField, { color: themeSubtitleColor, marginTop: 14 }]}>{t("occupation", "Occupation")}</Text>
        <TextInput
          style={[styles.textInputField, { backgroundColor: isDark ? "#0F172A" : "#F8FAFC", borderColor: themeBorderColor, color: themeTextColor }]}
          value={editOccupation}
          onChangeText={setEditOccupation}
          placeholder="e.g. Entrepreneur, Farmer"
          placeholderTextColor={isDark ? "#4B5563" : "#9CA3AF"}
        />

        <Text style={[styles.inputLabelField, { color: themeSubtitleColor, marginTop: 14 }]}>{t("dob", "Date of Birth")}</Text>
        <TouchableOpacity
          onPress={handleOpenDatePicker}
          style={[styles.textInputField, { backgroundColor: isDark ? "#0F172A" : "#F8FAFC", borderColor: themeBorderColor, justifyContent: "center" }]}
        >
          <Text style={{ color: editDob && editDob !== "Not Specified" ? themeTextColor : (isDark ? "#4B5563" : "#9CA3AF") }}>
            {editDob && editDob !== "Not Specified" ? editDob : t("select_dob", "Select Date of Birth")}
          </Text>
        </TouchableOpacity>

        <Text style={[styles.inputLabelField, { color: themeSubtitleColor, marginTop: 14 }]}>{t("county", "County / Region")}</Text>
        <TextInput
          style={[styles.textInputField, { backgroundColor: isDark ? "#0F172A" : "#F8FAFC", borderColor: themeBorderColor, color: themeTextColor }]}
          value={editCounty}
          onChangeText={setEditCounty}
          placeholder="e.g. Nairobi, Mombasa"
          placeholderTextColor={isDark ? "#4B5563" : "#9CA3AF"}
        />

        <Text style={[styles.inputLabelField, { color: themeSubtitleColor, marginTop: 14 }]}>{t("physical_address", "Physical Address")}</Text>
        <TextInput
          style={[styles.textInputField, { backgroundColor: isDark ? "#0F172A" : "#F8FAFC", borderColor: themeBorderColor, color: themeTextColor }]}
          value={editAddress}
          onChangeText={setEditAddress}
          placeholder="e.g. Suite 5B, Kilimani Road"
          placeholderTextColor={isDark ? "#4B5563" : "#9CA3AF"}
        />

        <Text style={[styles.inputLabelField, { color: themeSubtitleColor, marginTop: 14 }]}>{t("gender", "Gender")}</Text>
        <View style={styles.pickerAlternativeRow}>
          {["Male", "Female", "Other"].map((g) => (
            <TouchableOpacity
              key={g}
              onPress={() => setEditGender(g)}
              style={[
                styles.pickerOptionButton,
                { backgroundColor: isDark ? "#0F172A" : "#F3F4F6", borderColor: themeBorderColor },
                editGender === g ? styles.pickerOptionButtonActive : null
              ]}
            >
              <Text style={[styles.pickerOptionText, { color: isDark ? "#94A3B8" : "#4B5563" }, editGender === g ? styles.pickerOptionTextActive : null]}>
                {g}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={[styles.inputLabelField, { color: themeSubtitleColor, marginTop: 14 }]}>{t("marital_status", "Marital Status")}</Text>
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

        {/* ── DOCUMENT VERIFICATION SEC ── */}
        <View style={{ height: 1, backgroundColor: themeBorderColor, marginVertical: 18 }} />
        <Text style={{ fontSize: 14, fontWeight: "800", color: themeTextColor, marginBottom: 12 }}>🔒 {t("kyc_documents", "KYC Verification Documents")}</Text>

        {/* ID Document Button */}
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
          <View style={{ flex: 1, marginRight: 8 }}>
            <Text style={{ fontSize: 12, fontWeight: "700", color: themeTextColor }}>{t("id_document", "ID Document")}</Text>
            <Text style={{ fontSize: 10, color: themeSubtitleColor, marginTop: 2 }}>
              {editIdDocument ? `✓ ${editIdDocument}` : t("id_not_uploaded", "No ID uploaded yet")}
            </Text>
          </View>
          <TouchableOpacity
            onPress={simulateIdUpload}
            style={{
              backgroundColor: editIdDocument ? "#E8F5E9" : "#0F9D58",
              paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8,
              borderWidth: 1, borderColor: editIdDocument ? "#4CAF50" : "#0F9D58"
            }}
          >
            <Text style={{ fontSize: 11, fontWeight: "700", color: editIdDocument ? "#2E7D32" : "#FFFFFF" }}>
              {editIdDocument ? t("uploaded", "Uploaded ✓") : t("upload_id_btn", "Upload ID")}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Selfie Face Verification Button */}
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
          <View style={{ flex: 1, marginRight: 8 }}>
            <Text style={{ fontSize: 12, fontWeight: "700", color: themeTextColor }}>{t("selfie", "Selfie (Face Verification)")}</Text>
            <Text style={{ fontSize: 10, color: themeSubtitleColor, marginTop: 2 }}>
              {editSelfie ? `✓ ${editSelfie}` : t("selfie_not_captured", "No selfie captured yet")}
            </Text>
          </View>
          <TouchableOpacity
            onPress={simulateSelfieCapture}
            style={{
              backgroundColor: editSelfie ? "#E8F5E9" : "#0F9D58",
              paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8,
              borderWidth: 1, borderColor: editSelfie ? "#4CAF50" : "#0F9D58"
            }}
          >
            <Text style={{ fontSize: 11, fontWeight: "700", color: editSelfie ? "#2E7D32" : "#FFFFFF" }}>
              {editSelfie ? t("captured", "Captured ✓") : t("capture_selfie_btn", "Capture Selfie")}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Bottom Actions Buttons Row */}
        <View style={{ flexDirection: "row", gap: 12, marginTop: 28 }}>
          <TouchableOpacity onPress={() => setActiveSubScreen("profile")} style={[styles.walletActionBtnOutline, { flex: 1, marginHorizontal: 0, borderColor: themeBorderColor, paddingVertical: 12, borderRadius: 12, justifyContent: "center", alignItems: "center" }]}>
            <Text style={[styles.walletActionBtnOutlineText, { color: themeSubtitleColor }]}>{t("cancel", "Cancel")}</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleSaveProfile} style={[styles.walletActionBtnOutline, { flex: 1, marginHorizontal: 0, backgroundColor: "#0F9D58", borderColor: "#0F9D58", paddingVertical: 12, borderRadius: 12, justifyContent: "center", alignItems: "center" }]}>
            <Text style={[styles.walletActionBtnOutlineText, { color: "#ffffff" }]}>{t("save", "Save Profile")}</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* ── CUSTOM DATE PICKER CALENDAR MODAL ── */}
      <Modal visible={showDatePicker} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.stkModalCard, { width: 340, backgroundColor: themeCardBg, borderColor: themeBorderColor, borderWidth: 1, padding: 18 }]}>
            <Text style={{ fontSize: 16, fontWeight: "800", color: themeTextColor, textAlign: "center", marginBottom: 12 }}>
              📅 {t("select_date_of_birth", "Select Date of Birth")}
            </Text>

            {/* Date display & Selector Row */}
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 10, borderBottomWidth: 1, borderColor: themeBorderColor, marginBottom: 10 }}>
              <TouchableOpacity onPress={() => setTempMonth(prev => (prev === 0 ? 11 : prev - 1))} style={{ padding: 6 }}>
                <Text style={{ fontSize: 18, color: "#0F9D58", fontWeight: "900" }}>←</Text>
              </TouchableOpacity>
              <Text style={{ fontSize: 15, fontWeight: "700", color: themeTextColor }}>
                {months[tempMonth]} {tempYear}
              </Text>
              <TouchableOpacity onPress={() => setTempMonth(prev => (prev === 11 ? 0 : prev + 1))} style={{ padding: 6 }}>
                <Text style={{ fontSize: 18, color: "#0F9D58", fontWeight: "900" }}>→</Text>
              </TouchableOpacity>
            </View>

            {/* Year Scroller Row */}
            <Text style={{ fontSize: 10, color: themeSubtitleColor, fontWeight: "700", textTransform: "uppercase", marginBottom: 6 }}>{t("year", "Year")}</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ maxHeight: 40, marginBottom: 12 }}>
              {years.map(y => (
                <TouchableOpacity
                  key={y}
                  onPress={() => setTempYear(y)}
                  style={{
                    paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, marginRight: 6,
                    backgroundColor: tempYear === y ? "#0F9D58" : (isDark ? "#1E293B" : "#F3F4F6"),
                  }}
                >
                  <Text style={{ fontSize: 12, fontWeight: "700", color: tempYear === y ? "#FFFFFF" : themeTextColor }}>{y}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* Days grid layout */}
            <Text style={{ fontSize: 10, color: themeSubtitleColor, fontWeight: "700", textTransform: "uppercase", marginBottom: 6 }}>{t("day", "Day")}</Text>
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6, justifyContent: "center", marginBottom: 18 }}>
              {Array.from({ length: 30 }, (_, i) => i + 1).map(day => (
                <TouchableOpacity
                  key={day}
                  onPress={() => setTempDay(day)}
                  style={{
                    width: 36, height: 36, borderRadius: 18, alignItems: "center", justifyContent: "center",
                    backgroundColor: tempDay === day ? "#0F9D58" : (isDark ? "#1E293B" : "#F3F4F6"),
                  }}
                >
                  <Text style={{ fontSize: 12, fontWeight: "700", color: tempDay === day ? "#FFFFFF" : themeTextColor }}>{day}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Actions */}
            <View style={{ flexDirection: "row", gap: 10 }}>
              <TouchableOpacity onPress={() => setShowDatePicker(false)} style={{ flex: 1, paddingVertical: 12, borderRadius: 10, borderWidth: 1, borderColor: themeBorderColor, alignItems: "center" }}>
                <Text style={{ color: themeSubtitleColor, fontWeight: "700", fontSize: 13 }}>{t("cancel")}</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleConfirmDate} style={{ flex: 1, paddingVertical: 12, borderRadius: 10, backgroundColor: "#0F9D58", alignItems: "center" }}>
                <Text style={{ color: "#FFFFFF", fontWeight: "700", fontSize: 13 }}>{t("select", "Select")}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}
