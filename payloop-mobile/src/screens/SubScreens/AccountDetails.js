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
    <ScrollView style={[styles.tabContentLight, { backgroundColor: themeBg, paddingTop: 16 }]} showsVerticalScrollIndicator={false}>
      <View style={[styles.detailCardBox, { backgroundColor: themeCardBg, borderColor: themeBorderColor }]}>
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <Text style={[styles.detailCardHeader, { color: themeTextColor, marginBottom: 0 }]}>Identity Profile</Text>
          <TouchableOpacity onPress={() => setActiveSubScreen("editProfile")} style={{ backgroundColor: "#0F9D58", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6 }}>
            <Text style={{ color: "#FFF", fontSize: 11, fontWeight: "700" }}>Edit</Text>
          </TouchableOpacity>
        </View>

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
