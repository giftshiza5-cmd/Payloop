import React from "react";
import { View, Text } from "react-native";
import { StatusBar } from "expo-status-bar";
import { AppProvider, useApp } from "./src/context/AppContext";
import Splash from "./src/screens/Splash";
import Onboarding from "./src/screens/Onboarding";
import Welcome from "./src/screens/Welcome";
import Register from "./src/screens/Register";
import Login from "./src/screens/Login";
import Pin from "./src/screens/Pin";
import CompleteProfile from "./src/screens/CompleteProfile";
import Dashboard from "./src/screens/Dashboard";
import { styles } from "./styles";

function RootNavigator() {
  const { currentScreen, banner, isDark } = useApp();

  const renderBanner = () => {
    if (!banner) return null;
    let bgColor = "#0F9D58";
    let icon = "✅";
    if (banner.type === "error") {
      bgColor = "#EF4444";
      icon = "❌";
    } else if (banner.type === "warning") {
      bgColor = "#F59E0B";
      icon = "⚠️";
    } else if (banner.type === "info") {
      bgColor = "#3B82F6";
      icon = "ℹ️";
    }
    return (
      <View style={[styles.bannerOverlay, { backgroundColor: bgColor }]}>
        <Text style={styles.bannerText}>{icon}  {banner.message}</Text>
      </View>
    );
  };

  const renderScreen = () => {
    switch (currentScreen) {
      case "splash":
        return <Splash />;
      case "onboarding":
        return <Onboarding />;
      case "welcome":
        return <Welcome />;
      case "register":
        return <Register />;
      case "login":
        return <Login />;
      case "pin":
        return <Pin />;
      case "completeProfile":
        return <CompleteProfile />;
      case "dashboard":
        return <Dashboard />;
      default:
        return <Splash />;
    }
  };

  return (
    <View style={styles.containerApp}>
      <StatusBar style={isDark ? "light" : "dark"} />
      {renderBanner()}
      <View style={{ flex: 1 }}>
        {renderScreen()}
      </View>
    </View>
  );
}

export default function App() {
  return (
    <AppProvider>
      <RootNavigator />
    </AppProvider>
  );
}
