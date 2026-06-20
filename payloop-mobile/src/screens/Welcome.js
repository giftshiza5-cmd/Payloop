import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  StatusBar as RNStatusBar,
  Platform
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { useApp } from "../context/AppContext";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");
const STATUS_BAR_H = Platform.OS === "ios" ? 44 : (RNStatusBar.currentHeight || 24);

// ─── Exact group data seeded in the DB ─────────────────────────────────────
const PREVIEW_GROUP = {
  name: "Eldoret Investors Circle",
  category: "Investment Club",
  status: "Active Pool",
  totalFundKES: "KES 309,100.75",
  totalFundProgress: 0.78,         // 78 % of cycle target
  apyRate: "7.50%",
  members: 3,
  maxMembers: 10,
  nextPayout: "15 Jul 2026",
  monthlyContribution: "KES 1,950", // 15 USDC × 130
  cycleProgress: "78%",
};

const PILLS = ["Secure", "Instant", "Web3"];

export default function Welcome() {
  const {
    setCurrentScreen,
    selectedUser,
    isDark,
  } = useApp();

  // ── Colour tokens ──────────────────────────────────────────────────────────
  const green   = "#0F9D58";
  const greenLt = "#16A85F";
  const card    = isDark ? "#111827" : "#FFFFFF";
  const textPri = isDark ? "#F9FAFB" : "#111827";
  const textSec = isDark ? "#9CA3AF" : "#6B7280";
  const border  = isDark ? "rgba(255,255,255,0.08)" : "rgba(15,157,88,0.14)";
  const heroBg  = isDark ? "#0A2E1C" : "#0F9D58";

  // ── Progress bar ───────────────────────────────────────────────────────────
  const ProgressBar = ({ value, height = 6, trackColor, fillColor }) => (
    <View style={{
      height,
      borderRadius: height / 2,
      backgroundColor: trackColor || (isDark ? "#1F2937" : "#E5E7EB"),
      overflow: "hidden",
    }}>
      <View style={{
        height,
        width: `${Math.round(value * 100)}%`,
        borderRadius: height / 2,
        backgroundColor: fillColor || green,
      }} />
    </View>
  );

  // ── Stat column ────────────────────────────────────────────────────────────
  const Stat = ({ label, value, accent }) => (
    <View style={{ flex: 1 }}>
      <Text style={{ fontSize: 9, color: textSec, textTransform: "uppercase", letterSpacing: 0.6, marginBottom: 3 }}>
        {label}
      </Text>
      <Text style={{ fontSize: 13, fontWeight: "700", color: accent || textPri }}>
        {value}
      </Text>
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: isDark ? "#0A0F1E" : "#F0FDF9" }}>
      <StatusBar style="light" />

      <ScrollView
        contentContainerStyle={{ paddingBottom: 0 }}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        {/* ── HERO SECTION ─────────────────────────────────────────────────── */}
        <View style={{
          minHeight: SCREEN_HEIGHT * 0.56,
          backgroundColor: heroBg,
          paddingTop: STATUS_BAR_H + 24,
          paddingHorizontal: 28,
          paddingBottom: 64,
          position: "relative",
          overflow: "hidden",
        }}>
          {/* Abstract mesh circles — no icons */}
          <View style={{ position: "absolute", top: -90, right: -90, width: 280, height: 280, borderRadius: 140, backgroundColor: "rgba(255,255,255,0.055)" }} />
          <View style={{ position: "absolute", top: 60, left: -100, width: 220, height: 220, borderRadius: 110, backgroundColor: "rgba(255,255,255,0.04)" }} />
          <View style={{ position: "absolute", bottom: -50, right: 30, width: 180, height: 180, borderRadius: 90, backgroundColor: "rgba(255,255,255,0.065)" }} />
          <View style={{ position: "absolute", bottom: 40, left: -40, width: 120, height: 120, borderRadius: 60, backgroundColor: "rgba(255,255,255,0.035)" }} />
          {/* subtle inner gradient ring */}
          <View style={{ position: "absolute", top: "20%", right: "10%", width: 140, height: 140, borderRadius: 70, borderWidth: 1.5, borderColor: "rgba(255,255,255,0.09)" }} />
          <View style={{ position: "absolute", top: "30%", right: "15%", width: 90, height: 90, borderRadius: 45, borderWidth: 1, borderColor: "rgba(255,255,255,0.06)" }} />

          {/* ── LOGO CONTAINER (glassmorphism) ──────────────────────────────── */}
          <View style={{
            width: 80, height: 80, borderRadius: 24,
            backgroundColor: "rgba(255,255,255,0.14)",
            borderWidth: 1.5, borderColor: "rgba(255,255,255,0.30)",
            alignItems: "center", justifyContent: "center",
            marginBottom: 22,
            shadowColor: "#000", shadowOffset: { width: 0, height: 10 },
            shadowOpacity: 0.22, shadowRadius: 14, elevation: 10,
          }}>
            {/* Geometric "P" wordmark — no icon */}
            <Text style={{
              fontSize: 36, fontWeight: "900", color: "#FFFFFF",
              letterSpacing: -2, lineHeight: 40,
            }}>P</Text>
          </View>

          {/* ── BRAND NAME & TAGLINE ────────────────────────────────────────── */}
          <Text style={{
            fontSize: 38, fontWeight: "900", color: "#FFFFFF",
            letterSpacing: -1.2, marginBottom: 8,
          }}>
            PayLoop
          </Text>
          <Text style={{
            fontSize: 15, color: "rgba(255,255,255,0.82)",
            lineHeight: 22, maxWidth: 280, marginBottom: 28,
          }}>
            The modern savings & micro-lending platform built for cooperative finance circles.
          </Text>

          {/* ── TEXT-ONLY PILLS ─────────────────────────────────────────────── */}
          <View style={{ flexDirection: "row", gap: 8, flexWrap: "wrap" }}>
            {PILLS.map(label => (
              <View
                key={label}
                style={{
                  paddingVertical: 6, paddingHorizontal: 16,
                  borderRadius: 24,
                  backgroundColor: "rgba(255,255,255,0.12)",
                  borderWidth: 1, borderColor: "rgba(255,255,255,0.22)",
                }}
              >
                <Text style={{ color: "#FFFFFF", fontSize: 12, fontWeight: "700", letterSpacing: 0.3 }}>
                  {label}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* ── WHITE CONTENT SECTION (curved transition) ────────────────────── */}
        <View style={{
          backgroundColor: card,
          borderTopLeftRadius: 40, borderTopRightRadius: 40,
          marginTop: -40,
          paddingTop: 32, paddingHorizontal: 24, paddingBottom: 48,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: -6 },
          shadowOpacity: 0.07, shadowRadius: 16, elevation: 12,
        }}>

          {/* ── CHAMA POOL CARD ──────────────────────────────────────────────── */}
          <View style={{
            borderRadius: 28,
            backgroundColor: isDark ? "#0D1F14" : "#FAFFFE",
            borderWidth: 1.5, borderColor: isDark ? "rgba(15,157,88,0.22)" : "rgba(15,157,88,0.18)",
            padding: 20,
            marginBottom: 32,
            shadowColor: green,
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: 0.12, shadowRadius: 20, elevation: 6,
          }}>
            {/* Card header row */}
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 10, color: textSec, textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 4 }}>
                  Featured Pool
                </Text>
                <Text style={{ fontSize: 16, fontWeight: "800", color: textPri, letterSpacing: -0.3 }}>
                  {PREVIEW_GROUP.name}
                </Text>
                <Text style={{ fontSize: 11, color: textSec, marginTop: 2 }}>
                  {PREVIEW_GROUP.category}
                </Text>
              </View>
              {/* Status badge — text only, no icon */}
              <View style={{
                backgroundColor: isDark ? "rgba(15,157,88,0.15)" : "#DCFCE7",
                paddingHorizontal: 10, paddingVertical: 5,
                borderRadius: 20,
                borderWidth: 1, borderColor: isDark ? "rgba(15,157,88,0.3)" : "rgba(15,157,88,0.35)",
              }}>
                <Text style={{ fontSize: 10, fontWeight: "800", color: green, letterSpacing: 0.3 }}>
                  {PREVIEW_GROUP.status}
                </Text>
              </View>
            </View>

            {/* Total Fund — large typography */}
            <View style={{ marginBottom: 4 }}>
              <Text style={{ fontSize: 10, color: textSec, textTransform: "uppercase", letterSpacing: 0.7 }}>
                Total Fund
              </Text>
              <View style={{ flexDirection: "row", alignItems: "baseline", gap: 10, marginTop: 4 }}>
                <Text style={{ fontSize: 28, fontWeight: "900", color: textPri, letterSpacing: -1 }}>
                  {PREVIEW_GROUP.totalFundKES}
                </Text>
                <Text style={{ fontSize: 12, fontWeight: "700", color: green }}>
                  ▲ {PREVIEW_GROUP.apyRate} APY
                </Text>
              </View>
            </View>

            {/* Cycle progress bar */}
            <View style={{ marginBottom: 16 }}>
              <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 6 }}>
                <Text style={{ fontSize: 10, color: textSec }}>Savings Cycle</Text>
                <Text style={{ fontSize: 10, fontWeight: "700", color: green }}>{PREVIEW_GROUP.cycleProgress}</Text>
              </View>
              <ProgressBar value={PREVIEW_GROUP.totalFundProgress} height={6} />
            </View>

            {/* Stat row */}
            <View style={{
              flexDirection: "row", gap: 0,
              paddingTop: 16,
              borderTopWidth: 1, borderTopColor: isDark ? "rgba(255,255,255,0.06)" : "#F3F4F6",
            }}>
              <Stat label="Members" value={`${PREVIEW_GROUP.members} / ${PREVIEW_GROUP.maxMembers}`} />
              <Stat label="APY Rate" value={PREVIEW_GROUP.apyRate} accent={green} />
            </View>

            <View style={{
              flexDirection: "row", gap: 0,
              paddingTop: 12, marginTop: 12,
              borderTopWidth: 1, borderTopColor: isDark ? "rgba(255,255,255,0.06)" : "#F3F4F6",
            }}>
              <Stat label="Next Payout" value={PREVIEW_GROUP.nextPayout} />
              <Stat label="Monthly Contribution" value={PREVIEW_GROUP.monthlyContribution} />
            </View>
          </View>

          {/* ── HEADING ──────────────────────────────────────────────────────── */}
          <Text style={{
            fontSize: 24, fontWeight: "900", color: textPri,
            letterSpacing: -0.6, marginBottom: 6,
          }}>
            Start Your Financial Journey
          </Text>
          <Text style={{ fontSize: 14, color: textSec, lineHeight: 22, marginBottom: 28 }}>
            Join thousands of Kenyans saving smarter with transparent, blockchain-powered cooperative finance.
          </Text>

          {/* ── PRIMARY BUTTON — Create Account ─────────────────────────────── */}
          <TouchableOpacity
            onPress={() => setCurrentScreen("register")}
            activeOpacity={0.88}
            style={{
              backgroundColor: green,
              borderRadius: 18,
              paddingVertical: 17,
              alignItems: "center",
              marginBottom: 14,
              shadowColor: green,
              shadowOffset: { width: 0, height: 6 },
              shadowOpacity: 0.38, shadowRadius: 12, elevation: 7,
            }}
          >
            <Text style={{ color: "#FFFFFF", fontSize: 16, fontWeight: "800", letterSpacing: 0.2 }}>
              Create Account
            </Text>
          </TouchableOpacity>

          {/* ── OUTLINED SIGN IN BUTTON ──────────────────────────────────────── */}
          <TouchableOpacity
            onPress={() => setCurrentScreen(selectedUser?.name ? "pin" : "login")}
            activeOpacity={0.85}
            style={{
              backgroundColor: "transparent",
              borderRadius: 18,
              paddingVertical: 16,
              alignItems: "center",
              borderWidth: 1.5,
              borderColor: isDark ? "rgba(15,157,88,0.45)" : "rgba(15,157,88,0.35)",
              marginBottom: 24,
            }}
          >
            <Text style={{ color: isDark ? "#34D399" : green, fontSize: 16, fontWeight: "700" }}>
              Sign In
            </Text>
          </TouchableOpacity>

          {/* ── FOOTER ───────────────────────────────────────────────────────── */}
          <View style={{ flexDirection: "row", justifyContent: "center", flexWrap: "wrap", gap: 4 }}>
            <Text style={{ fontSize: 11, color: isDark ? "#4B5563" : "#9CA3AF" }}>
              By continuing you agree to our
            </Text>
            <TouchableOpacity>
              <Text style={{ fontSize: 11, color: isDark ? "#6EE7B7" : green, fontWeight: "600" }}>
                Terms of Service
              </Text>
            </TouchableOpacity>
            <Text style={{ fontSize: 11, color: isDark ? "#4B5563" : "#9CA3AF" }}>&</Text>
            <TouchableOpacity>
              <Text style={{ fontSize: 11, color: isDark ? "#6EE7B7" : green, fontWeight: "600" }}>
                Privacy Policy
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
