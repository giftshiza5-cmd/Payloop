import React from "react";
import { View, Text, TouchableOpacity, ScrollView, Alert } from "react-native";
import { useApp } from "../../context/AppContext";
import { styles } from "../../../styles";

export default function HelpCenter() {
  const {
    setActiveSubScreen,
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
        <Text style={[styles.subScreenTitle, { color: themeTextColor }]}>Help & Support</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={[styles.detailCardBox, { backgroundColor: themeCardBg, borderColor: themeBorderColor }]}>
        <Text style={[styles.detailCardHeader, { color: themeTextColor }]}>Frequently Asked Questions</Text>
        
        <View style={[styles.faqItemRow, { borderColor: themeBorderColor }]}>
          <Text style={[styles.faqQuestionText, { color: themeTextColor }]}>Q: How does CreditLoop calculate my score?</Text>
          <Text style={[styles.faqAnswerText, { color: themeSubtitleColor }]}>
            A: CreditLoop aggregates contribution frequency, loan repayment speed, voting participation, and savings ratios.
          </Text>
        </View>

        <View style={[styles.dividerSlate, { backgroundColor: themeDividerColor }]} />

        <View style={[styles.faqItemRow, { borderColor: themeBorderColor }]}>
          <Text style={[styles.faqQuestionText, { color: themeTextColor }]}>Q: Can I withdraw my savings pool balance?</Text>
          <Text style={[styles.faqAnswerText, { color: themeSubtitleColor }]}>
            A: Yes, but withdrawals are locked during active contribution cycles to maintain vault liquidity, subject to chama consensus rules.
          </Text>
        </View>

        <View style={[styles.dividerSlate, { backgroundColor: themeDividerColor }]} />

        <View style={[styles.faqItemRow, { borderColor: themeBorderColor }]}>
          <Text style={[styles.faqQuestionText, { color: themeTextColor }]}>Q: What happens if I miss a contribution deadline?</Text>
          <Text style={[styles.faqAnswerText, { color: themeSubtitleColor }]}>
            A: Overdue cycles incur a penalty fine and will penalize your CreditLoop consistency score.
          </Text>
        </View>
      </View>

      <View style={[styles.detailCardBox, { backgroundColor: themeCardBg, borderColor: themeBorderColor }]}>
        <Text style={[styles.detailCardHeader, { color: themeTextColor }]}>Contact Support</Text>
        
        <TouchableOpacity 
          onPress={() => Alert.alert("Live Chat", "Connecting to live support chat node...")} 
          style={[styles.helpContactBtnOutline, { backgroundColor: themeCardBg, borderColor: themeBorderColor, marginHorizontal: 0 }]}
        >
          <Text style={[styles.helpContactBtnOutlineText, { color: themeTextColor }]}>💬 Start Live Chat</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          onPress={() => Alert.alert("Email Support", "Launching email composer to support@payloop.io")} 
          style={[styles.helpContactBtnOutline, { backgroundColor: themeCardBg, borderColor: themeBorderColor, marginHorizontal: 0 }]}
        >
          <Text style={[styles.helpContactBtnOutlineText, { color: themeTextColor }]}>✉️ Email support@payloop.io</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}
