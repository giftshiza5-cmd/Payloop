import React, { useState } from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { useApp } from "../../context/AppContext";
import { styles } from "../../../styles";

export default function AppearanceSettings() {
  const {
    appearanceTheme,
    setAppearanceTheme,
    appearanceLanguage,
    setAppearanceLanguage,
    setActiveSubScreen,
    isDark,
    themeBg,
    themeCardBg,
    themeBorderColor,
    themeTextColor
  } = useApp();

  const [appearanceFontSize, setAppearanceFontSize] = useState("Standard");

  return (
    <ScrollView style={[styles.tabContentLight, { backgroundColor: themeBg }]} showsVerticalScrollIndicator={false}>
      <View style={styles.subScreenHeader}>
        <TouchableOpacity onPress={() => setActiveSubScreen(null)} style={[styles.backButton, { backgroundColor: themeCardBg, borderColor: themeBorderColor }]}>
          <Text style={[styles.backButtonText, { color: themeTextColor }]}>←</Text>
        </TouchableOpacity>
        <Text style={[styles.subScreenTitle, { color: themeTextColor }]}>Appearance</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={[styles.detailCardBox, { backgroundColor: themeCardBg, borderColor: themeBorderColor }]}>
        <Text style={[styles.detailCardHeader, { color: themeTextColor }]}>Color Theme</Text>
        <View style={styles.pillSelectorRow}>
          {["Light", "Dark", "System"].map((t) => (
            <TouchableOpacity
              key={t}
              onPress={() => setAppearanceTheme(t)}
              style={[
                styles.pillSelectorBtn, 
                { backgroundColor: isDark ? "#0F172A" : "#F3F4F6", borderColor: themeBorderColor },
                appearanceTheme === t ? styles.pillSelectorBtnActive : null
              ]}
            >
              <Text style={[styles.pillSelectorBtnText, appearanceTheme === t ? styles.pillSelectorBtnTextActive : null]}>{t}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={[styles.detailCardBox, { backgroundColor: themeCardBg, borderColor: themeBorderColor }]}>
        <Text style={[styles.detailCardHeader, { color: themeTextColor }]}>App Language</Text>
        <View style={styles.pillSelectorRow}>
          {["English", "Kiswahili"].map((lang) => (
            <TouchableOpacity
              key={lang}
              onPress={() => setAppearanceLanguage(lang)}
              style={[
                styles.pillSelectorBtn, 
                { backgroundColor: isDark ? "#0F172A" : "#F3F4F6", borderColor: themeBorderColor },
                appearanceLanguage === lang ? styles.pillSelectorBtnActive : null
              ]}
            >
              <Text style={[styles.pillSelectorBtnText, appearanceLanguage === lang ? styles.pillSelectorBtnTextActive : null]}>{lang}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={[styles.detailCardBox, { backgroundColor: themeCardBg, borderColor: themeBorderColor }]}>
        <Text style={[styles.detailCardHeader, { color: themeTextColor }]}>Display Font Size</Text>
        <View style={styles.pillSelectorRow}>
          {["Standard", "Large", "Extra Large"].map((size) => (
            <TouchableOpacity
              key={size}
              onPress={() => setAppearanceFontSize(size)}
              style={[
                styles.pillSelectorBtn, 
                { backgroundColor: isDark ? "#0F172A" : "#F3F4F6", borderColor: themeBorderColor },
                appearanceFontSize === size ? styles.pillSelectorBtnActive : null
              ]}
            >
              <Text style={[styles.pillSelectorBtnText, appearanceFontSize === size ? styles.pillSelectorBtnTextActive : null]}>{size}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}
