import React, { useRef } from "react";
import { View, Text, TouchableOpacity, Dimensions, FlatList, Image } from "react-native";
import { StatusBar } from "expo-status-bar";
import { useApp } from "../context/AppContext";
import { styles } from "../../styles";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

export default function Onboarding() {
  const {
    onboardingIndex,
    setOnboardingIndex,
    onboardingSlides,
    setCurrentScreen,
    isDark,
    themeBg,
    themeCardBg,
    themeBorderColor,
    themeTextColor,
    themeSubtitleColor,
    t
  } = useApp();

  const flatListRef = useRef(null);

  const handleScroll = (event) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(offsetX / SCREEN_WIDTH);
    if (index !== onboardingIndex && index >= 0 && index < onboardingSlides.length) {
      setOnboardingIndex(index);
    }
  };

  const handleNext = () => {
    if (onboardingIndex < onboardingSlides.length - 1) {
      const nextIndex = onboardingIndex + 1;
      setOnboardingIndex(nextIndex);
      flatListRef.current?.scrollToIndex({ index: nextIndex, animated: true });
    } else {
      setCurrentScreen("welcome");
    }
  };

  const handleBack = () => {
    if (onboardingIndex > 0) {
      const prevIndex = onboardingIndex - 1;
      setOnboardingIndex(prevIndex);
      flatListRef.current?.scrollToIndex({ index: prevIndex, animated: true });
    }
  };

  // Dynamic themes for active indicator dot and shadow
  const activeSlideHsl = [
    { bg: "rgba(15, 157, 88, 0.12)", color: "#0F9D58" },
    { bg: "rgba(212, 175, 55, 0.12)", color: "#D4AF37" },
    { bg: "rgba(66, 133, 244, 0.12)", color: "#4285F4" },
    { bg: "rgba(139, 92, 246, 0.12)", color: "#8B5CFA" }
  ][onboardingIndex] || { bg: "rgba(15, 157, 88, 0.12)", color: "#0F9D58" };

  const renderSlideItem = ({ item, index }) => {
    const slideHsl = [
      { bg: "rgba(15, 157, 88, 0.12)", color: "#0F9D58" },
      { bg: "rgba(212, 175, 55, 0.12)", color: "#D4AF37" },
      { bg: "rgba(66, 133, 244, 0.12)", color: "#4285F4" },
      { bg: "rgba(139, 92, 246, 0.12)", color: "#8B5CFA" }
    ][index] || { bg: "rgba(15, 157, 88, 0.12)", color: "#0F9D58" };

    return (
      <View style={{ width: SCREEN_WIDTH, alignItems: "center", justifyContent: "center", paddingHorizontal: 24 }}>
        <View style={[
          styles.onboardingHeroBox, 
          { 
            backgroundColor: isDark ? "rgba(255, 255, 255, 0.04)" : slideHsl.bg,
            borderWidth: 2,
            borderColor: isDark ? "rgba(255, 255, 255, 0.08)" : slideHsl.bg,
            shadowColor: slideHsl.color,
            shadowOffset: { width: 0, height: 12 },
            shadowOpacity: 0.15,
            shadowRadius: 24,
            elevation: 8,
            overflow: "hidden"
          }
        ]}>
          <Image 
            source={item.image} 
            style={{ width: "100%", height: "100%", resizeMode: "cover" }} 
          />
        </View>
        
        <View style={styles.onboardingInfoBox}>
          <Text style={[styles.onboardingLabel, { color: slideHsl.color }]}>{item.label}</Text>
          <Text style={[styles.onboardingTitle, { color: themeTextColor }]}>{item.title}</Text>
          <Text style={[styles.onboardingDesc, { color: themeSubtitleColor }]}>{item.desc}</Text>
        </View>
      </View>
    );
  };

  return (
    <View style={[styles.containerLight, { backgroundColor: themeBg, paddingHorizontal: 0 }]}>
      <StatusBar style={isDark ? "light" : "dark"} />
      
      {/* Skip Button Top */}
      {onboardingIndex < 3 && (
        <TouchableOpacity 
          onPress={() => setCurrentScreen("welcome")} 
          style={[styles.skipButtonTop, { backgroundColor: themeCardBg, borderColor: themeBorderColor }]}
        >
          <Text style={[styles.skipButtonTextTop, { color: themeTextColor }]}>{t("skip")}</Text>
        </TouchableOpacity>
      )}

      {/* Swipable Slides Container */}
      <View style={{ flex: 1, justifyContent: "center", marginTop: 60 }}>
        <FlatList
          ref={flatListRef}
          data={onboardingSlides}
          renderItem={renderSlideItem}
          keyExtractor={(_, index) => index.toString()}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onScroll={handleScroll}
          scrollEventThrottle={16}
          onMomentumScrollEnd={handleScroll}
        />
      </View>
      
      {/* Bottom Indicators & Actions */}
      <View style={{ width: "100%", paddingHorizontal: 24, alignItems: "center", marginBottom: 36 }}>
        <View style={styles.carouselIndicators}>
          {onboardingSlides.map((_, idx) => (
            <View
              key={idx}
              style={[
                styles.indicatorDot,
                idx === onboardingIndex 
                  ? [styles.indicatorDotActive, { backgroundColor: activeSlideHsl.color, width: 22 }] 
                  : { backgroundColor: isDark ? "#4B5563" : "#E5E7EB" }
              ]}
            />
          ))}
        </View>

        <View style={styles.onboardingActionRow}>
          {onboardingIndex > 0 ? (
            <TouchableOpacity 
              onPress={handleBack} 
              style={[styles.onboardingBackBtn, { backgroundColor: themeCardBg, borderColor: themeBorderColor }]}
            >
              <Text style={[styles.onboardingBackBtnText, { color: themeTextColor }]}>{t("back")}</Text>
            </TouchableOpacity>
          ) : (
            <View style={{ flex: 1 }} />
          )}

          <TouchableOpacity 
            onPress={handleNext} 
            style={[
              styles.onboardingNextBtn, 
              { 
                backgroundColor: activeSlideHsl.color,
                shadowColor: activeSlideHsl.color,
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.25,
                shadowRadius: 8,
                elevation: 4
              }
            ]}
          >
            <Text style={styles.onboardingNextBtnText}>
              {onboardingIndex === 3 ? t("get_started") : t("next")}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}
