import React from "react";
import { View, Text, TouchableOpacity, ScrollView, RefreshControl, TextInput } from "react-native";
import { useApp } from "../../context/AppContext";
import { styles } from "../../../styles";

export default function AdminGovernance() {
  const {
    newPollTitle,
    setNewPollTitle,
    newPollDesc,
    setNewPollDesc,
    newPollType,
    newPollOptions,
    setNewPollOptions,
    newPollQuorum,
    setNewPollQuorum,
    showAddPollModal,
    setShowAddPollModal,
    adminPollsList,
    isRefreshing,
    setIsRefreshing,
    fetchWithTimeout,
    BACKEND_URL,
    currentGroup,
    selectedUser,
    showBanner,
    fetchAdminPolls,
    setActiveSubScreen,
    isDark,
    themeBg,
    themeCardBg,
    themeBorderColor,
    themeTextColor,
    themeSubtitleColor
  } = useApp();

  const handleCreatePoll = async () => {
    if (!newPollTitle) {
      showBanner("Poll title is required", "error");
      return;
    }
    try {
      const res = await fetchWithTimeout(`${BACKEND_URL}/api/admin/governance/${currentGroup.id}/polls`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newPollTitle,
          description: newPollDesc,
          poll_type: newPollType,
          options: newPollOptions,
          quorum_percent: newPollQuorum,
          ends_at: new Date(Date.now() + 7 * 86400 * 1000).toISOString(),
          email: selectedUser.email
        })
      });
      if (res.ok) {
        showBanner("Consensus poll launched successfully", "success");
        setNewPollTitle("");
        setNewPollDesc("");
        setShowAddPollModal(false);
        fetchAdminPolls(currentGroup.id);
      }
    } catch (e) {
      console.log("Error creating poll:", e);
    }
  };

  const handleCastVote = async (pollId, option) => {
    try {
      const res = await fetchWithTimeout(`${BACKEND_URL}/api/admin/governance/${currentGroup.id}/polls/${pollId}/vote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ option, email: selectedUser.email })
      });
      if (res.ok) {
        showBanner("Vote cast successfully", "success");
        fetchAdminPolls(currentGroup.id);
      }
    } catch (e) {
      console.log("Error casting vote:", e);
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
            if (currentGroup) await fetchAdminPolls(currentGroup.id);
            setIsRefreshing(false);
          }} 
        />
      }
    >
      <View style={styles.subScreenHeader}>
        <TouchableOpacity onPress={() => setActiveSubScreen(null)} style={[styles.backButton, { backgroundColor: themeCardBg, borderColor: themeBorderColor }]}>
          <Text style={[styles.backButtonText, { color: themeTextColor }]}>←</Text>
        </TouchableOpacity>
        <Text style={[styles.subScreenTitle, { color: themeTextColor, fontSize: 18 }]}>Governance & Voting</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={{ paddingHorizontal: 16, paddingBottom: 30 }}>
        <Text style={{ fontSize: 12, color: themeSubtitleColor, marginBottom: 14 }}>
          Create constitutional amendments, elect officials, and monitor voting quorum
        </Text>

        {/* Launch Poll Modal */}
        {showAddPollModal ? (
          <View style={{ backgroundColor: themeCardBg, borderWidth: 2, borderColor: "#0F9D58", borderRadius: 16, padding: 14, marginBottom: 16 }}>
            <Text style={{ fontSize: 14, fontWeight: "bold", color: themeTextColor, marginBottom: 12 }}>Launch Consensus Poll</Text>
            
            <Text style={{ fontSize: 11, color: themeSubtitleColor }}>Poll Title</Text>
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
              value={newPollTitle}
              onChangeText={setNewPollTitle}
              placeholder="e.g. Increase Emergency Reserves"
              placeholderTextColor={themeSubtitleColor}
            />

            <Text style={{ fontSize: 11, color: themeSubtitleColor }}>Description / Agenda</Text>
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
              value={newPollDesc}
              onChangeText={setNewPollDesc}
              multiline
              placeholder="Details of the proposal..."
              placeholderTextColor={themeSubtitleColor}
            />

            <Text style={{ fontSize: 11, color: themeSubtitleColor }}>Options (Comma separated)</Text>
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
              value={newPollOptions}
              onChangeText={setNewPollOptions}
            />

            <Text style={{ fontSize: 11, color: themeSubtitleColor }}>Quorum Percentage (%)</Text>
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
                marginBottom: 14
              }}
              value={newPollQuorum}
              onChangeText={setNewPollQuorum}
              keyboardType="numeric"
            />

            <View style={{ flexDirection: "row", gap: 10 }}>
              <TouchableOpacity
                onPress={() => setShowAddPollModal(false)}
                style={{ flex: 1, borderHeight: 1, borderColor: themeSubtitleColor, borderWidth: 1, borderRadius: 8, paddingVertical: 8, alignItems: "center" }}
              >
                <Text style={{ color: themeSubtitleColor, fontSize: 12 }}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleCreatePoll}
                style={{ flex: 1, backgroundColor: "#0F9D58", borderRadius: 8, paddingVertical: 8, alignItems: "center" }}
              >
                <Text style={{ color: "#ffffff", fontSize: 12, fontWeight: "bold" }}>Launch Poll</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <TouchableOpacity
            onPress={() => setShowAddPollModal(true)}
            style={{
              backgroundColor: "#0F9D58",
              borderRadius: 12,
              paddingVertical: 12,
              alignItems: "center",
              marginBottom: 16
            }}
          >
            <Text style={{ color: "#ffffff", fontWeight: "bold", fontSize: 13 }}>+ Launch Consensus Poll</Text>
          </TouchableOpacity>
        )}

        {/* Poll list */}
        {adminPollsList.length > 0 ? (
          adminPollsList.map(poll => {
            const options = typeof poll.options === "string" ? JSON.parse(poll.options) : poll.options || [];
            const votes = typeof poll.votes === "string" ? JSON.parse(poll.votes) : poll.votes || {};
            
            const totalVotes = Object.values(votes).reduce((a, b) => (parseInt(a) || 0) + (parseInt(b) || 0), 0);

            return (
              <View
                key={poll.id}
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
                  <Text style={{ fontSize: 13, color: themeSubtitleColor, textTransform: "uppercase" }}>{poll.poll_type}</Text>
                  <View style={{ backgroundColor: poll.status === "active" ? "rgba(16, 185, 129, 0.15)" : "rgba(107, 114, 128, 0.15)", borderRadius: 6, paddingHorizontal: 6, paddingVertical: 2 }}>
                    <Text style={{ fontSize: 10, fontWeight: "bold", color: poll.status === "active" ? "#10B981" : "#6B7280" }}>{poll.status}</Text>
                  </View>
                </View>

                <Text style={{ fontSize: 15, fontWeight: "800", color: themeTextColor, marginTop: 6 }}>{poll.title}</Text>
                <Text style={{ fontSize: 12, color: themeSubtitleColor, marginTop: 4 }}>{poll.description}</Text>

                {/* Options & Progress bars */}
                <View style={{ marginTop: 12 }}>
                  {options.map((opt, oIdx) => {
                    const optVotes = parseInt(votes[opt] || 0);
                    const pct = totalVotes > 0 ? (optVotes / totalVotes) * 100 : 0;
                    return (
                      <View key={oIdx} style={{ marginBottom: 10 }}>
                        <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 4 }}>
                          <Text style={{ fontSize: 12, color: themeTextColor }}>{opt}</Text>
                          <Text style={{ fontSize: 11, color: themeSubtitleColor }}>{optVotes} votes ({pct.toFixed(0)}%)</Text>
                        </View>
                        
                        {/* Progress bar line */}
                        <View style={{ height: 6, backgroundColor: isDark ? "#1E293B" : "#E2E8F0", borderRadius: 3, overflow: "hidden", flexDirection: "row" }}>
                          <View style={{ width: `${pct}%`, height: "100%", backgroundColor: "#0F9D58" }} />
                        </View>

                        {/* Vote Button for active polls */}
                        {poll.status === "active" && (
                          <TouchableOpacity
                            onPress={() => handleCastVote(poll.id, opt)}
                            style={{
                              marginTop: 6,
                              paddingVertical: 4,
                              paddingHorizontal: 10,
                              borderRadius: 6,
                              backgroundColor: isDark ? "#1E293B" : "#F3F4F6",
                              borderWidth: 0.5,
                              borderColor: themeBorderColor,
                              alignSelf: "flex-start"
                            }}
                          >
                            <Text style={{ fontSize: 10, color: themeTextColor }}>Cast Vote</Text>
                          </TouchableOpacity>
                        )}
                      </View>
                    );
                  })}
                </View>

                <Text style={{ fontSize: 10, color: themeSubtitleColor, marginTop: 8 }}>
                  Ends At: {new Date(poll.ends_at).toLocaleDateString()} · Quorum: {poll.quorum_percent}%
                </Text>
              </View>
            );
          })
        ) : (
          <View style={{ backgroundColor: themeCardBg, borderWidth: 1, borderColor: themeBorderColor, borderRadius: 16, padding: 30, alignItems: "center" }}>
            <Text style={{ fontSize: 13, color: themeSubtitleColor }}>No voting polls active.</Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
}
