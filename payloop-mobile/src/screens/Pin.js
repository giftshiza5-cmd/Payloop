import React from "react";
import { View, Text, TouchableOpacity, Alert } from "react-native";
import { StatusBar } from "expo-status-bar";
import { useApp } from "../context/AppContext";

export default function Pin() {
  const {
    selectedUser,
    pinCode,
    isDark,
    handlePinPress,
    setCurrentScreen
  } = useApp();

  const pinDots = [1, 2, 3, 4, 5, 6];
  const keyBg = isDark ? "#1F2937" : "#FFFFFF";
  const keyBorder = isDark ? "#374151" : "#E5E7EB";
  const keyColor = isDark ? "#F9FAFB" : "#111827";

  const renderKey = (val, display) => (
    <TouchableOpacity
      onPress={() => handlePinPress(val)}
      style={{
        width: 76, height: 76, borderRadius: 38,
        backgroundColor: keyBg, borderWidth: 1.5, borderColor: keyBorder,
        alignItems: "center", justifyContent: "center",
        shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 4, elevation: 2
      }}
    >
      <Text style={{ fontSize: typeof display === "string" && display.length > 2 ? 22 : 26, fontWeight: "700", color: keyColor }}>{display}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={{ flex: 1, backgroundColor: isDark ? "#0A0F1E" : "#F0FDF9", alignItems: "center" }}>
      <StatusBar style={isDark ? "light" : "dark"} />

      {/* User avatar + greeting */}
      <View style={{
        width: "100%", alignItems: "center",
        paddingTop: 70, paddingBottom: 40,
        backgroundColor: "#0F9D58",
        borderBottomLeftRadius: 40, borderBottomRightRadius: 40
      }}>
        <View style={{
          width: 80, height: 80, borderRadius: 24,
          backgroundColor: "rgba(255,255,255,0.2)",
          alignItems: "center", justifyContent: "center",
          borderWidth: 2, borderColor: "rgba(255,255,255,0.4)",
          marginBottom: 14
        }}>
          <Text style={{ fontSize: 40 }}>
            {selectedUser && selectedUser.avatar && selectedUser.avatar.length <= 4 ? selectedUser.avatar : "👤"}
          </Text>
        </View>
        <Text style={{ color: "#FFF", fontSize: 20, fontWeight: "800" }}>
          {selectedUser ? selectedUser.name : "PayLoop User"}
        </Text>
        <Text style={{ color: "rgba(255,255,255,0.7)", fontSize: 13, marginTop: 4 }}>Enter your 6-digit PIN</Text>
      </View>

      {/* PIN dots */}
      <View style={{ flexDirection: "row", gap: 14, marginTop: 36, marginBottom: 32 }}>
        {pinDots.map((d, idx) => (
          <View
            key={d}
            style={{
              width: 16, height: 16, borderRadius: 8,
              backgroundColor: pinCode.length > idx
                ? "#0F9D58"
                : (isDark ? "#374151" : "#D1D5DB"),
              borderWidth: pinCode.length > idx ? 0 : 1.5,
              borderColor: isDark ? "#4B5563" : "#9CA3AF"
            }}
          />
        ))}
      </View>

      {/* Keypad */}
      <View style={{ gap: 14 }}>
        <View style={{ flexDirection: "row", gap: 20 }}>
          {renderKey("1", "1")}
          {renderKey("2", "2")}
          {renderKey("3", "3")}
        </View>
        <View style={{ flexDirection: "row", gap: 20 }}>
          {renderKey("4", "4")}
          {renderKey("5", "5")}
          {renderKey("6", "6")}
        </View>
        <View style={{ flexDirection: "row", gap: 20 }}>
          {renderKey("7", "7")}
          {renderKey("8", "8")}
          {renderKey("9", "9")}
        </View>
        <View style={{ flexDirection: "row", gap: 20 }}>
          {renderKey("biometric", "👤")}
          {renderKey("0", "0")}
          {renderKey("back", "⌫")}
        </View>
      </View>

      <TouchableOpacity
        onPress={() => Alert.alert("Reset PIN", "Reset instructions will be sent to your registered email.")}
        style={{ marginTop: 28 }}
      >
        <Text style={{ color: isDark ? "#34D399" : "#0F9D58", fontSize: 14, fontWeight: "600" }}>Forgot PIN?</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => setCurrentScreen("login")} style={{ marginTop: 10 }}>
        <Text style={{ color: isDark ? "#6B7280" : "#9CA3AF", fontSize: 13 }}>← Switch Account</Text>
      </TouchableOpacity>
    </View>
  );
}
