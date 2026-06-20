import React from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { useApp } from "../../context/AppContext";
import { styles } from "../../../styles";

export default function AccountDetails() {
  const {
    selectedUser,
    setActiveSubScreen,
    themeBg,
    themeCardBg,
    themeBorderColor,
    themeTextColor,
    themeSubtitleColor
  } = useApp();

  return (
    <ScrollView style={[styles.tabContentLight, { backgroundColor: themeBg }]} showsVerticalScrollIndicator={false}>
      <View style={styles.subScreenHeader}>
        <TouchableOpacity onPress={() => setActiveSubScreen(null)} style={[styles.backButton, { backgroundColor: themeCardBg, borderColor: themeBorderColor }]}>
          <Text style={[styles.backButtonText, { color: themeTextColor }]}>←</Text>
        </TouchableOpacity>
        <Text style={[styles.subScreenTitle, { color: themeTextColor }]}>Account Information</Text>
        <TouchableOpacity onPress={() => setActiveSubScreen("editProfile")} style={[styles.headerActionButton, { backgroundColor: themeCardBg, borderColor: themeBorderColor }]}>
          <Text style={styles.headerActionButtonText}>Edit</Text>
        </TouchableOpacity>
      </View>

      <View style={[styles.detailCardBox, { backgroundColor: themeCardBg, borderColor: themeBorderColor }]}>
        <Text style={[styles.detailCardHeader, { color: themeTextColor }]}>Identity Profile</Text>

        <View style={[styles.detailItemRow, { borderColor: themeBorderColor }]}>
          <Text style={[styles.detailLabel, { color: themeSubtitleColor }]}>Full Name</Text>
          <Text style={[styles.detailValue, { color: themeTextColor }]}>{selectedUser?.name}</Text>
        </View>
        <View style={[styles.detailItemRow, { borderColor: themeBorderColor }]}>
          <Text style={[styles.detailLabel, { color: themeSubtitleColor }]}>Email Address</Text>
          <Text style={[styles.detailValue, { color: themeTextColor }]}>{selectedUser?.email}</Text>
        </View>
        <View style={[styles.detailItemRow, { borderColor: themeBorderColor }]}>
          <Text style={[styles.detailLabel, { color: themeSubtitleColor }]}>Phone Number</Text>
          <Text style={[styles.detailValue, { color: themeTextColor }]}>{selectedUser?.phone}</Text>
        </View>
        <View style={[styles.detailItemRow, { borderColor: themeBorderColor }]}>
          <Text style={[styles.detailLabel, { color: themeSubtitleColor }]}>Date of Birth</Text>
          <Text style={[styles.detailValue, { color: themeTextColor }]}>{selectedUser?.dob || "Not Specified"}</Text>
        </View>
        <View style={[styles.detailItemRow, { borderColor: themeBorderColor }]}>
          <Text style={[styles.detailLabel, { color: themeSubtitleColor }]}>Gender</Text>
          <Text style={[styles.detailValue, { color: themeTextColor }]}>{selectedUser?.gender || "Not Specified"}</Text>
        </View>
        {selectedUser?.county ? (
          <View style={[styles.detailItemRow, { borderColor: themeBorderColor }]}>
            <Text style={[styles.detailLabel, { color: themeSubtitleColor }]}>County</Text>
            <Text style={[styles.detailValue, { color: themeTextColor }]}>{selectedUser.county}</Text>
          </View>
        ) : null}
      </View>

      <View style={[styles.detailCardBox, { backgroundColor: themeCardBg, borderColor: themeBorderColor }]}>
        <Text style={[styles.detailCardHeader, { color: themeTextColor }]}>Professional & KYC Status</Text>

        <View style={[styles.detailItemRow, { borderColor: themeBorderColor }]}>
          <Text style={[styles.detailLabel, { color: themeSubtitleColor }]}>Occupation</Text>
          <Text style={[styles.detailValue, { color: themeTextColor }]}>{selectedUser?.occupation || "Not Specified"}</Text>
        </View>
        <View style={[styles.detailItemRow, { borderColor: themeBorderColor }]}>
          <Text style={[styles.detailLabel, { color: themeSubtitleColor }]}>KYC Status</Text>
          <Text style={[styles.detailValue, { color: selectedUser?.verification_level === "FULLY_VERIFIED" ? "#0F9D58" : "#D97706", fontWeight: "700" }]}>
            {selectedUser?.verification_level === "FULLY_VERIFIED" ? "Fully Verified ✅" : "Basic/Unverified ⚠️"}
          </Text>
        </View>
        <View style={[styles.detailItemRow, { borderColor: themeBorderColor }]}>
          <Text style={[styles.detailLabel, { color: themeSubtitleColor }]}>Member Since</Text>
          <Text style={[styles.detailValue, { color: themeTextColor }]}>
            {selectedUser?.joined_date ? new Date(selectedUser.joined_date).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : (selectedUser?.joinedDate || "12 Jan 2024")}
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}
