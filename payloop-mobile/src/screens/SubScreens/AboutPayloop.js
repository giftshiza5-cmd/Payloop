import React from "react";
import { View, Text, TouchableOpacity, ScrollView, Alert } from "react-native";
import { useApp } from "../../context/AppContext";
import { styles } from "../../../styles";

export default function AboutPayloop() {
  const {
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
    <ScrollView style={[styles.tabContentLight, { backgroundColor: themeBg, paddingTop: 16 }]} showsVerticalScrollIndicator={false}>

      <View style={[styles.aboutPlatformCardBox, { backgroundColor: themeCardBg, borderColor: themeBorderColor }]}>
        <View style={[styles.aboutLogoCircle, { backgroundColor: isDark ? "#0F172A" : "rgba(15, 157, 88,0.08)" }]}>
          <Text style={styles.aboutLogoEmoji}>🔂</Text>
        </View>
        <Text style={[styles.aboutVersionTitle, { color: themeTextColor }]}>PayLoop mobile application</Text>
        <Text style={[styles.aboutVersionNumber, { color: themeSubtitleColor }]}>Version 1.4.2</Text>
        <Text style={[styles.aboutPlatformDesc, { color: themeSubtitleColor }]}>
          PayLoop is a decentralized community credit and mutual savings platform empowering informal financial circles (chamas) to pool funds, verify reputation scores, and access interest-optimized credit lines securely.
        </Text>
      </View>

      <View style={[styles.detailCardBox, { backgroundColor: themeCardBg, borderColor: themeBorderColor }]}>
        <Text style={[styles.detailCardHeader, { color: themeTextColor }]}>Core Mission & Values</Text>
        <Text style={[styles.aboutMissionText, { color: themeSubtitleColor }]}>
          Our mission is to build a transparent, trust-less, and hyper-local credit loop ledger for everyone, eliminating dependency on high-interest commercial bank loans.
        </Text>
      </View>

      <View style={[styles.aboutLinksBlock, { backgroundColor: themeCardBg, borderColor: themeBorderColor }]}>
        <TouchableOpacity onPress={() => Alert.alert("Website", "Opening www.payloop.io in browser...")} style={[styles.aboutLinkItem, { borderColor: themeBorderColor }]}>
          <Text style={[styles.aboutLinkText, { color: themeTextColor }]}>Official Website</Text>
          <Text style={[styles.moreMenuChevron, { color: themeSubtitleColor }]}>›</Text>
        </TouchableOpacity>
        <View style={[styles.dividerSlate, { backgroundColor: themeDividerColor }]} />
        <TouchableOpacity onPress={() => Alert.alert("Privacy", "Opening Privacy Policy...")} style={[styles.aboutLinkItem, { borderColor: themeBorderColor }]}>
          <Text style={[styles.aboutLinkText, { color: themeTextColor }]}>Privacy Policy</Text>
          <Text style={[styles.moreMenuChevron, { color: themeSubtitleColor }]}>›</Text>
        </TouchableOpacity>
        <View style={[styles.dividerSlate, { backgroundColor: themeDividerColor }]} />
        <TouchableOpacity onPress={() => Alert.alert("Terms", "Opening Terms of Service...")} style={[styles.aboutLinkItem, { borderColor: themeBorderColor }]}>
          <Text style={[styles.aboutLinkText, { color: themeTextColor }]}>Terms and Conditions</Text>
          <Text style={[styles.moreMenuChevron, { color: themeSubtitleColor }]}>›</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}
