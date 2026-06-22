import React from "react";
import { View, Text, TouchableOpacity, ScrollView, Alert } from "react-native";
import { useApp } from "../../context/AppContext";
import { styles } from "../../../styles";

export default function AnnouncementsFeed() {
  const {
    setActiveSubScreen,
    themeBg,
    themeCardBg,
    themeBorderColor,
    themeTextColor,
    themeSubtitleColor
  } = useApp();

  return (
    <ScrollView style={[styles.tabContentLight, { backgroundColor: themeBg, paddingTop: 16 }]} showsVerticalScrollIndicator={false}>

      <View style={[styles.announcementItemCardBox, { backgroundColor: themeCardBg, borderColor: themeBorderColor }]}>
        <View style={styles.announcementCardTop}>
          <Text style={[styles.announcementMetaLabel, { color: themeSubtitleColor }]}>8 Jun 2026 • Group Consensus</Text>
          <View style={styles.announcementUnreadDot} />
        </View>
        <Text style={[styles.announcementMainTitle, { color: themeTextColor }]}>Consensus Voting Cycle Opens Friday</Text>
        <Text style={[styles.announcementMessageContent, { color: themeSubtitleColor }]}>
          Consensus voting starts on Friday morning for Peter Mwangi's agricultural tractor loan request (5,000 USDC). Please review proposal details in the Loan tab and prepare your ledger key signature.
        </Text>
      </View>

      <View style={[styles.announcementItemCardBox, { backgroundColor: themeCardBg, borderColor: themeBorderColor }]}>
        <View style={styles.announcementCardTop}>
          <Text style={[styles.announcementMetaLabel, { color: themeSubtitleColor }]}>4 Jun 2026 • Tier Updates</Text>
        </View>
        <Text style={[styles.announcementMainTitle, { color: themeTextColor }]}>Platinum Tier Interest Rate Reduced</Text>
        <Text style={[styles.announcementMessageContent, { color: themeSubtitleColor }]}>
          We have updated the CircleVault smart contracts. Members qualifying for Platinum Tier (CreditLoop score 800+) will now access loans at a reduced interest rate of 5.0% p.a.
        </Text>
      </View>

      <View style={[styles.announcementItemCardBox, { backgroundColor: themeCardBg, borderColor: themeBorderColor }]}>
        <View style={styles.announcementCardTop}>
          <Text style={[styles.announcementMetaLabel, { color: themeSubtitleColor }]}>30 May 2026 • General</Text>
        </View>
        <Text style={[styles.announcementMainTitle, { color: themeTextColor }]}>Monthly Chama Physical Meeting</Text>
        <Text style={[styles.announcementMessageContent, { color: themeSubtitleColor }]}>
          Our monthly offline meeting will take place at the local community library hall on Sunday, June 15, 2026 at 7 PM. All members must attend to synchronize local bookkeeping balances.
        </Text>
      </View>

      <TouchableOpacity 
        onPress={() => Alert.alert("Success", "All group announcements marked as read.")} 
        style={[styles.announcementsMarkReadBtn, { borderColor: themeBorderColor, backgroundColor: themeCardBg }]}
      >
        <Text style={[styles.announcementsMarkReadBtnText, { color: themeTextColor }]}>Mark All as Read</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}
