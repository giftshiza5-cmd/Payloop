import React from "react";
import { View, Text, TouchableOpacity, ScrollView, TextInput } from "react-native";
import { useApp } from "../../context/AppContext";
import { styles } from "../../../styles";

export default function AdminCommunication() {
  const {
    broadcastTitle,
    setBroadcastTitle,
    broadcastContent,
    setBroadcastContent,
    fetchWithTimeout,
    BACKEND_URL,
    currentGroup,
    selectedUser,
    showBanner,
    fetchGroupData,
    announcements,
    setActiveSubScreen,
    isDark,
    themeBg,
    themeCardBg,
    themeBorderColor,
    themeTextColor,
    themeSubtitleColor
  } = useApp();

  const handleBroadcast = async () => {
    if (!broadcastTitle || !broadcastContent) {
      showBanner("Title and Content are required", "error");
      return;
    }
    try {
      const res = await fetchWithTimeout(`${BACKEND_URL}/api/admin/communication/${currentGroup.id}/broadcast`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: broadcastTitle,
          content: broadcastContent,
          email: selectedUser.email
        })
      });
      if (res.ok) {
        showBanner("Broadcast announcement posted", "success");
        setBroadcastTitle("");
        setBroadcastContent("");
        if (currentGroup) fetchGroupData(currentGroup.id, selectedUser.email);
      }
    } catch (e) {
      console.log("Error broadcasting:", e);
    }
  };

  return (
    <ScrollView style={[styles.tabContentLight, { backgroundColor: themeBg }]} showsVerticalScrollIndicator={false}>
      <View style={styles.subScreenHeader}>
        <TouchableOpacity onPress={() => setActiveSubScreen(null)} style={[styles.backButton, { backgroundColor: themeCardBg, borderColor: themeBorderColor }]}>
          <Text style={[styles.backButtonText, { color: themeTextColor }]}>←</Text>
        </TouchableOpacity>
        <Text style={[styles.subScreenTitle, { color: themeTextColor, fontSize: 18 }]}>Communication Hub</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={{ paddingHorizontal: 16, paddingBottom: 30 }}>
        <Text style={{ fontSize: 12, color: themeSubtitleColor, marginBottom: 14 }}>
          Publish announcements directly to member home feeds
        </Text>

        <View style={{ backgroundColor: themeCardBg, borderWidth: 1, borderColor: themeBorderColor, borderRadius: 16, padding: 14, marginBottom: 16 }}>
          <Text style={{ fontSize: 13, fontWeight: "bold", color: themeTextColor, marginBottom: 12 }}>New Broadcast Notice</Text>

          <Text style={{ fontSize: 11, color: themeSubtitleColor }}>Announcement Title</Text>
          <TextInput
            style={{
              backgroundColor: isDark ? "#0F172A" : "#F3F4F6",
              borderWidth: 1,
              borderColor: themeBorderColor,
              borderRadius: 8,
              padding: 8,
              fontSize: 12,
              color: themeTextColor,
              marginTop: 4,
              marginBottom: 10
            }}
            value={broadcastTitle}
            onChangeText={setBroadcastTitle}
            placeholder="e.g. System Maintenance Notice"
            placeholderTextColor={themeSubtitleColor}
          />

          <Text style={{ fontSize: 11, color: themeSubtitleColor }}>Announcement Message Body</Text>
          <TextInput
            style={{
              backgroundColor: isDark ? "#0F172A" : "#F3F4F6",
              borderWidth: 1,
              borderColor: themeBorderColor,
              borderRadius: 8,
              padding: 8,
              fontSize: 12,
              color: themeTextColor,
              marginTop: 4,
              marginBottom: 14,
              height: 80
            }}
            value={broadcastContent}
            onChangeText={setBroadcastContent}
            multiline
            placeholder="Write message details..."
            placeholderTextColor={themeSubtitleColor}
          />

          <TouchableOpacity
            onPress={handleBroadcast}
            style={{
              backgroundColor: "#0F9D58",
              borderRadius: 12,
              paddingVertical: 12,
              alignItems: "center"
            }}
          >
            <Text style={{ color: "#ffffff", fontWeight: "bold", fontSize: 13 }}>Broadcast Notice</Text>
          </TouchableOpacity>
        </View>

        {/* Past announcements feed */}
        <Text style={{ fontSize: 13, fontWeight: "700", color: themeTextColor, marginBottom: 10 }}>Announcement History</Text>
        {announcements && announcements.length > 0 ? (
          announcements.map(ann => (
            <View
              key={ann.id}
              style={{
                backgroundColor: themeCardBg,
                borderWidth: 1,
                borderColor: themeBorderColor,
                borderRadius: 12,
                padding: 12,
                marginBottom: 10
              }}
            >
              <Text style={{ fontSize: 13, fontWeight: "bold", color: themeTextColor }}>{ann.title}</Text>
              <Text style={{ fontSize: 12, color: themeSubtitleColor, marginTop: 4 }}>{ann.content}</Text>
              <Text style={{ fontSize: 9, color: themeSubtitleColor, marginTop: 6 }}>
                Posted: {new Date(ann.created_at).toLocaleString()}
              </Text>
            </View>
          ))
        ) : (
          <View style={{ backgroundColor: themeCardBg, borderWidth: 1, borderColor: themeBorderColor, borderRadius: 16, padding: 30, alignItems: "center" }}>
            <Text style={{ fontSize: 13, color: themeSubtitleColor }}>No previous announcements.</Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
}
