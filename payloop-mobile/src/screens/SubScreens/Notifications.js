import React from "react";
import { View, Text, TouchableOpacity, ScrollView, Platform } from "react-native";
import { useApp } from "../../context/AppContext";
import { styles } from "../../../styles";

export default function Notifications() {
  const {
    selectedUser,
    notifications,
    setNotifications,
    setActiveSubScreen,
    isDark,
    themeCardBg,
    themeBorderColor,
    themeTextColor,
    themeSubtitleColor,
    registerPushNotifications,
    showBanner
  } = useApp();

  return (
    <ScrollView style={styles.tabContentLight}>
      <View style={styles.subScreenHeader}>
        <TouchableOpacity onPress={() => setActiveSubScreen(null)} style={styles.backButton}>
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.subScreenTitle}>Notifications</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Push Notification Registration Panel */}
      <View style={{
        margin: 16,
        padding: 16,
        borderRadius: 16,
        backgroundColor: themeCardBg,
        borderWidth: 1,
        borderColor: themeBorderColor,
        marginBottom: 16
      }}>
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
            <Text style={{ fontSize: 24 }}>📲</Text>
            <View style={{ flexShrink: 1 }}>
              <Text style={{ fontSize: 16, fontWeight: "bold", color: themeTextColor }}>Push Notifications</Text>
              <Text style={{ fontSize: 12, color: themeSubtitleColor }}>
                {selectedUser?.pushToken ? "Status: Active" : "Status: Inactive"}
              </Text>
            </View>
          </View>
          <View style={{
            paddingHorizontal: 8,
            paddingVertical: 4,
            borderRadius: 12,
            backgroundColor: selectedUser?.pushToken ? "rgba(15, 157, 88, 0.15)" : "rgba(107, 114, 128, 0.15)"
          }}>
            <Text style={{
              fontSize: 11,
              fontWeight: "bold",
              color: selectedUser?.pushToken ? "#0F9D58" : "#6B7280"
            }}>
              {selectedUser?.pushToken ? "Registered" : "Not Linked"}
            </Text>
          </View>
        </View>

        {selectedUser?.pushToken ? (
          <View style={{ marginBottom: 12, padding: 10, borderRadius: 8, backgroundColor: isDark ? "#0F172A" : "#F3F4F6", borderWidth: 1, borderColor: themeBorderColor }}>
            <Text style={{ fontSize: 11, color: themeSubtitleColor, fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace' }} numberOfLines={1} ellipsizeMode="middle">
              FCM Token: {selectedUser.pushToken}
            </Text>
          </View>
        ) : (
          <Text style={{ fontSize: 13, color: themeSubtitleColor, marginBottom: 12, lineHeight: 18 }}>
            Register this device to receive real-time contribution alerts, meeting reminders, and loan status updates.
          </Text>
        )}

        <View style={{ flexDirection: "row", gap: 10 }}>
          <TouchableOpacity
            onPress={() => {
              const randomToken = "fcm_token_" + Math.random().toString(36).substring(2, 10) + "_" + Date.now();
              registerPushNotifications(randomToken);
            }}
            style={{
              flex: 2,
              backgroundColor: "#0052CC",
              paddingVertical: 12,
              borderRadius: 10,
              alignItems: "center",
              justifyContent: "center"
            }}
          >
            <Text style={{ color: "#ffffff", fontWeight: "bold", fontSize: 13 }}>
              {selectedUser?.pushToken ? "Refresh Device Token" : "Register FCM Token"}
            </Text>
          </TouchableOpacity>

          {selectedUser?.pushToken && (
            <TouchableOpacity
              onPress={() => {
                const newNotif = {
                  id: String(Date.now()),
                  title: "⏰ Contribution Due Reminder",
                  message: `Your savings group contribution is due in 3 days. tap to pay now.`,
                  time: "Just now",
                  icon: "⏳",
                  read: false
                };
                setNotifications((prev) => [newNotif, ...prev]);
                showBanner("Contribution alert push simulated!", "success");
              }}
              style={{
                flex: 1,
                backgroundColor: "transparent",
                paddingVertical: 12,
                borderRadius: 10,
                borderWidth: 1,
                borderColor: themeBorderColor,
                alignItems: "center",
                justifyContent: "center"
              }}
            >
              <Text style={{ color: themeTextColor, fontWeight: "600", fontSize: 13 }}>Simulate Push</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      <View style={styles.notificationsListContainer}>
        {notifications.map((notif) => (
          <View key={notif.id} style={styles.notificationItemCard}>
            <View style={styles.notifIconCircle}>
              <Text style={styles.notifIconText}>{notif.icon}</Text>
            </View>
            <View style={styles.notifDetailsCol}>
              <View style={styles.notifHeaderRow}>
                <Text style={styles.notifItemTitle}>{notif.title}</Text>
                <Text style={styles.notifItemTime}>{notif.time}</Text>
              </View>
              <Text style={styles.notifItemMessage}>{notif.message}</Text>
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}
