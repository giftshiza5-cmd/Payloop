import React from "react";
import { View, Text, TouchableOpacity, ScrollView, RefreshControl, TextInput } from "react-native";
import { useApp } from "../../context/AppContext";
import { styles } from "../../../styles";

export default function AdminMeetings() {
  const {
    newMeetingTitle,
    setNewMeetingTitle,
    newMeetingAgenda,
    setNewMeetingAgenda,
    newMeetingDate,
    setNewMeetingDate,
    newMeetingLocation,
    setNewMeetingLocation,
    newMeetingType,
    setNewMeetingType,
    showAddMeetingModal,
    setShowAddMeetingModal,
    adminMeetingsList,
    isRefreshing,
    setIsRefreshing,
    fetchWithTimeout,
    BACKEND_URL,
    currentGroup,
    selectedUser,
    showBanner,
    fetchAdminMeetings,
    setActiveSubScreen,
    isDark,
    themeBg,
    themeCardBg,
    themeBorderColor,
    themeTextColor,
    themeSubtitleColor
  } = useApp();

  const handleCreateMeeting = async () => {
    if (!newMeetingTitle) {
      showBanner("Meeting title is required", "error");
      return;
    }
    try {
      const res = await fetchWithTimeout(`${BACKEND_URL}/api/admin/meetings/${currentGroup.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newMeetingTitle,
          agenda: newMeetingAgenda,
          meeting_date: newMeetingDate || new Date(Date.now() + 3 * 86400 * 1000).toISOString(),
          location: newMeetingLocation,
          meeting_type: newMeetingType,
          email: selectedUser.email
        })
      });
      if (res.ok) {
        showBanner("Meeting scheduled successfully", "success");
        setNewMeetingTitle("");
        setNewMeetingAgenda("");
        setNewMeetingLocation("");
        setNewMeetingDate("");
        setShowAddMeetingModal(false);
        fetchAdminMeetings(currentGroup.id);
      }
    } catch (e) {
      console.log("Error creating meeting:", e);
    }
  };

  return (
    <ScrollView 
      style={[styles.tabContentLight, { backgroundColor: themeBg }]} 
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl 
          refreshing={isRefreshing} 
          onRefresh={async () => {
            setIsRefreshing(true);
            if (currentGroup) await fetchAdminMeetings(currentGroup.id);
            setIsRefreshing(false);
          }} 
        />
      }
    >
      <View style={styles.subScreenHeader}>
        <TouchableOpacity onPress={() => setActiveSubScreen(null)} style={[styles.backButton, { backgroundColor: themeCardBg, borderColor: themeBorderColor }]}>
          <Text style={[styles.backButtonText, { color: themeTextColor }]}>←</Text>
        </TouchableOpacity>
        <Text style={[styles.subScreenTitle, { color: themeTextColor, fontSize: 18 }]}>Meetings & Assemblies</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={{ paddingHorizontal: 16, paddingBottom: 30 }}>
        <Text style={{ fontSize: 12, color: themeSubtitleColor, marginBottom: 14 }}>
          Schedule statutory general meetings, webinars and check attendance records
        </Text>

        {/* Schedule Meeting Modal */}
        {showAddMeetingModal ? (
          <View style={{ backgroundColor: themeCardBg, borderWidth: 2, borderColor: "#0F9D58", borderRadius: 16, padding: 14, marginBottom: 16 }}>
            <Text style={{ fontSize: 14, fontWeight: "bold", color: themeTextColor, marginBottom: 12 }}>Schedule Meeting</Text>
            
            <Text style={{ fontSize: 11, color: themeSubtitleColor }}>Meeting Title</Text>
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
              value={newMeetingTitle}
              onChangeText={setNewMeetingTitle}
              placeholder="e.g. Q3 Savings Strategy AGM"
              placeholderTextColor={themeSubtitleColor}
            />

            <Text style={{ fontSize: 11, color: themeSubtitleColor }}>Agenda Details</Text>
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
                marginBottom: 10,
                height: 60
              }}
              value={newMeetingAgenda}
              onChangeText={setNewMeetingAgenda}
              multiline
              placeholder="Key items to discuss..."
              placeholderTextColor={themeSubtitleColor}
            />

            <Text style={{ fontSize: 11, color: themeSubtitleColor }}>Location / Link</Text>
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
              value={newMeetingLocation}
              onChangeText={setNewMeetingLocation}
              placeholder="e.g. Eldoret Office / Zoom link"
              placeholderTextColor={themeSubtitleColor}
            />

            <Text style={{ fontSize: 11, color: themeSubtitleColor }}>Meeting Type</Text>
            <View style={styles.pickerAlternativeRow}>
              {["regular", "emergency", "agm"].map(t => (
                <TouchableOpacity
                  key={t}
                  onPress={() => setNewMeetingType(t)}
                  style={[
                    styles.pickerOptionButton,
                    { backgroundColor: isDark ? "#0F172A" : "#F3F4F6", borderColor: themeBorderColor },
                    newMeetingType === t ? styles.pickerOptionButtonActive : null
                  ]}
                >
                  <Text style={[styles.pickerOptionText, { color: isDark ? "#94A3B8" : "#4B5563" }, newMeetingType === t ? styles.pickerOptionTextActive : null]}>
                    {t.toUpperCase()}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={{ flexDirection: "row", gap: 10, marginTop: 14 }}>
              <TouchableOpacity
                onPress={() => setShowAddMeetingModal(false)}
                style={{ flex: 1, borderHeight: 1, borderColor: themeSubtitleColor, borderWidth: 1, borderRadius: 8, paddingVertical: 8, alignItems: "center" }}
              >
                <Text style={{ color: themeSubtitleColor, fontSize: 12 }}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleCreateMeeting}
                style={{ flex: 1, backgroundColor: "#0F9D58", borderRadius: 8, paddingVertical: 8, alignItems: "center" }}
              >
                <Text style={{ color: "#ffffff", fontSize: 12, fontWeight: "bold" }}>Schedule</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <TouchableOpacity
            onPress={() => setShowAddMeetingModal(true)}
            style={{
              backgroundColor: "#0F9D58",
              borderRadius: 12,
              paddingVertical: 12,
              alignItems: "center",
              marginBottom: 16
            }}
          >
            <Text style={{ color: "#ffffff", fontWeight: "bold", fontSize: 13 }}>+ Schedule Meeting Assembly</Text>
          </TouchableOpacity>
        )}

        {/* Meetings list */}
        {adminMeetingsList.length > 0 ? (
          adminMeetingsList.map(meet => (
            <View
              key={meet.id}
              style={{
                backgroundColor: themeCardBg,
                borderWidth: 1,
                borderColor: themeBorderColor,
                borderRadius: 16,
                padding: 14,
                marginBottom: 12
              }}
            >
              <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                <View style={{ backgroundColor: meet.meeting_type === "emergency" ? "rgba(239, 68, 68, 0.15)" : "rgba(99, 102, 241, 0.15)", borderRadius: 6, paddingHorizontal: 6, paddingVertical: 2 }}>
                  <Text style={{ fontSize: 9, fontWeight: "bold", color: meet.meeting_type === "emergency" ? "#EF4444" : "#6366F1" }}>{meet.meeting_type.toUpperCase()}</Text>
                </View>
                <View style={{ backgroundColor: meet.status === "scheduled" ? "rgba(245, 158, 11, 0.15)" : "rgba(107, 114, 128, 0.15)", borderRadius: 6, paddingHorizontal: 6, paddingVertical: 2 }}>
                  <Text style={{ fontSize: 10, fontWeight: "bold", color: meet.status === "scheduled" ? "#F59E0B" : "#6B7280" }}>{meet.status}</Text>
                </View>
              </View>

              <Text style={{ fontSize: 15, fontWeight: "800", color: themeTextColor, marginTop: 6 }}>{meet.title}</Text>
              <Text style={{ fontSize: 12, color: themeSubtitleColor, marginTop: 4 }}>Date: {new Date(meet.meeting_date).toLocaleString()}</Text>
              <Text style={{ fontSize: 12, color: themeTextColor, marginTop: 2 }}>Location: {meet.location}</Text>
              <Text style={{ fontSize: 12, color: themeSubtitleColor, marginTop: 4 }}>Agenda: {meet.agenda}</Text>

              {meet.minutes ? (
                <View style={{ marginTop: 10, padding: 8, borderRadius: 8, backgroundColor: isDark ? "#0F172A" : "#F8FAFC", borderWidth: 0.5, borderColor: themeBorderColor }}>
                  <Text style={{ fontSize: 11, fontWeight: "bold", color: themeTextColor }}>Meeting Minutes</Text>
                  <Text style={{ fontSize: 11, color: themeSubtitleColor, marginTop: 2 }}>{meet.minutes}</Text>
                </View>
              ) : (
                meet.status === "completed" && (
                  <Text style={{ fontSize: 11, color: themeSubtitleColor, marginTop: 8, fontStyle: "italic" }}>No minutes uploaded yet.</Text>
                )
              )}
            </View>
          ))
        ) : (
          <View style={{ backgroundColor: themeCardBg, borderWidth: 1, borderColor: themeBorderColor, borderRadius: 16, padding: 30, alignItems: "center" }}>
            <Text style={{ fontSize: 13, color: themeSubtitleColor }}>No meetings scheduled.</Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
}
