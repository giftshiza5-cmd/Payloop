import React from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { useApp } from "../../context/AppContext";
import { styles } from "../../../styles";

export default function GroupInfo() {
  const {
    vaultBalance,
    formatValue,
    setActiveSubScreen,
    themeBg,
    themeCardBg,
    themeBorderColor,
    themeTextColor,
    themeSubtitleColor,
    themeDividerColor
  } = useApp();

  return (
    <ScrollView style={[styles.tabContentLight, { backgroundColor: themeBg, paddingTop: 16 }]} showsVerticalScrollIndicator={false}>

      <View style={[styles.detailCardBox, { backgroundColor: themeCardBg, borderColor: themeBorderColor }]}>
        <Text style={[styles.detailCardHeader, { color: themeTextColor }]}>Green Savers Circle</Text>
        <Text style={[styles.detailCardDescription, { color: themeSubtitleColor }]}>
          A collective savings group focused on funding agricultural equipment, business expansions, and providing mutual credit loops for members.
        </Text>

        <View style={[styles.dividerSlate, { backgroundColor: themeDividerColor }]} />

        <View style={[styles.detailItemRow, { borderColor: themeBorderColor }]}>
          <Text style={[styles.detailLabel, { color: themeSubtitleColor }]}>Chama Name</Text>
          <Text style={[styles.detailValue, { color: themeTextColor }]}>Green Savers</Text>
        </View>
        <View style={[styles.detailItemRow, { borderColor: themeBorderColor }]}>
          <Text style={[styles.detailLabel, { color: themeSubtitleColor }]}>Total Vault Balance</Text>
          <Text style={[styles.detailValue, { color: "#0F9D58", fontWeight: "800" }]}>{formatValue(vaultBalance)}</Text>
        </View>
        <View style={[styles.detailItemRow, { borderColor: themeBorderColor }]}>
          <Text style={[styles.detailLabel, { color: themeSubtitleColor }]}>Active Savers</Text>
          <Text style={[styles.detailValue, { color: themeTextColor }]}>12 Members</Text>
        </View>
        <View style={[styles.detailItemRow, { borderColor: themeBorderColor }]}>
          <Text style={[styles.detailLabel, { color: themeSubtitleColor }]}>Cycle Duration</Text>
          <Text style={[styles.detailValue, { color: themeTextColor }]}>Weekly (Every Sunday)</Text>
        </View>
        <View style={[styles.detailItemRow, { borderColor: themeBorderColor }]}>
          <Text style={[styles.detailLabel, { color: themeSubtitleColor }]}>Savings Target Goal</Text>
          <Text style={[styles.detailValue, { color: themeTextColor }]}>Chama Tractor Fund</Text>
        </View>
      </View>

      <View style={[styles.detailCardBox, { backgroundColor: themeCardBg, borderColor: themeBorderColor }]}>
        <Text style={[styles.detailCardHeader, { color: themeTextColor }]}>Consensus Rules & Policies</Text>
        
        <View style={[styles.detailItemRow, { borderColor: themeBorderColor }]}>
          <Text style={[styles.detailLabel, { color: themeSubtitleColor }]}>Min Contribution</Text>
          <Text style={[styles.detailValue, { color: themeTextColor }]}>{formatValue(100)} / week</Text>
        </View>
        <View style={[styles.detailItemRow, { borderColor: themeBorderColor }]}>
          <Text style={[styles.detailLabel, { color: themeSubtitleColor }]}>Late Penalty Fine</Text>
          <Text style={[styles.detailValue, { color: themeTextColor }]}>{formatValue(5)} / week</Text>
        </View>
        <View style={[styles.detailItemRow, { borderColor: themeBorderColor }]}>
          <Text style={[styles.detailLabel, { color: themeSubtitleColor }]}>Borrowing Multiple</Text>
          <Text style={[styles.detailValue, { color: themeTextColor }]}>3.0x Savings Balance</Text>
        </View>
        <View style={[styles.detailItemRow, { borderColor: themeBorderColor }]}>
          <Text style={[styles.detailLabel, { color: themeSubtitleColor }]}>Consensus Threshold</Text>
          <Text style={[styles.detailValue, { color: themeTextColor }]}>60% Member YES votes</Text>
        </View>
      </View>
    </ScrollView>
  );
}
