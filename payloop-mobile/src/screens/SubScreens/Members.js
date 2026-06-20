import React from "react";
import { View, Text, TouchableOpacity, ScrollView, TextInput } from "react-native";
import { useApp } from "../../context/AppContext";
import { styles } from "../../../styles";

export default function Members() {
  const {
    members,
    searchMemberQuery,
    setSearchMemberQuery,
    setActiveSubScreen
  } = useApp();

  const filteredMembers = members.filter(
    (m) =>
      m.name.toLowerCase().includes(searchMemberQuery.toLowerCase()) ||
      m.handle.toLowerCase().includes(searchMemberQuery.toLowerCase())
  );

  return (
    <ScrollView style={styles.tabContentLight}>
      <View style={styles.subScreenHeader}>
        <TouchableOpacity onPress={() => setActiveSubScreen(null)} style={styles.backButton}>
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.subScreenTitle}>Members</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.searchBarBox}>
        <TextInput
          style={styles.searchBarInput}
          placeholder="Search members..."
          placeholderTextColor="#9CA3AF"
          value={searchMemberQuery}
          onChangeText={setSearchMemberQuery}
        />
      </View>

      <View style={styles.membersListContainer}>
        {filteredMembers.map((member, index) => (
          <View key={index} style={styles.memberListItemRow}>
            <View style={styles.memberLeftSection}>
              <View style={styles.memberAvatarContainer}>
                <Text style={styles.memberAvatarEmoji}>{member.avatar}</Text>
              </View>
              <View style={styles.memberInfoCol}>
                <Text style={styles.memberInfoName}>{member.name}</Text>
                <Text style={styles.memberInfoHandle}>{member.handle}</Text>
              </View>
            </View>
            <View style={styles.memberRightSection}>
              <View style={[styles.statusIndicatorDot, member.status === "Active" ? styles.statusActiveDot : styles.statusInactiveDot]} />
              <Text style={[styles.statusIndicatorText, member.status === "Active" ? styles.statusActiveText : styles.statusInactiveText]}>
                {member.status}
              </Text>
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}
