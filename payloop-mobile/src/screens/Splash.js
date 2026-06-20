import React from "react";
import { View, Text, ActivityIndicator } from "react-native";
import { StatusBar } from "expo-status-bar";
import { styles } from "../../styles";

export default function Splash() {
  return (
    <View style={styles.splashContainer}>
      <StatusBar style="light" />
      <View style={styles.splashLogoWrapper}>
        <View style={styles.logoBadgeBig}>
          <Text style={styles.logoEmojiBig}>♾️</Text>
        </View>
        <Text style={styles.splashTitle}>PayLoop</Text>
        <Text style={styles.splashSubtitle}>Save Together. Grow Together.</Text>
      </View>
      <View style={styles.splashFooter}>
        <ActivityIndicator size="small" color="#ffffff" style={{ marginBottom: 16 }} />
        <Text style={styles.splashFooterText}>🛡️ Secure • Transparent • Decentralized</Text>
      </View>
    </View>
  );
}
