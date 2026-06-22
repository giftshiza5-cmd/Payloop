import React from "react";
import {
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  Image,
  Share,
  Alert
} from "react-native";
import { useApp } from "../../context/AppContext";
import { styles } from "../../../styles";

export default function MoreTab() {
  const {
    selectedUser,
    currentGroupRole,
    themeTextColor,
    themeSubtitleColor,
    themeDividerColor,
    themeCardBg,
    themeBorderColor,
    isDark,
    themeBg,
    chamaName,
    setActiveSubScreen,
    setActiveTab,
    loans,
    currentGroup,
    showBanner,
    setSelectedUser,
    setCurrentScreen,
    setCurrentGroupRole,
    setAdminPrivileges,
    userGroups,
    setCurrentGroup,
    fetchGroupData
  } = useApp();

  if (!selectedUser) return null;

  const isAdmin = currentGroupRole === "Admin";

  const MenuRow = ({ label, desc, onPress, accentColor = "#0F9D58", danger = false, badge = null }) => (
    <TouchableOpacity
      onPress={onPress}
      style={{
        flexDirection: "row", alignItems: "center",
        paddingVertical: 14, paddingHorizontal: 16, gap: 12
      }}
      activeOpacity={0.65}
    >
      {/* Left accent bar */}
      <View style={{ width: 3, height: 36, borderRadius: 2, backgroundColor: danger ? "#EF4444" : accentColor }} />
      <View style={{ flex: 1 }}>
        <Text style={{ fontSize: 14, fontWeight: "700", color: danger ? "#EF4444" : themeTextColor, marginBottom: 2 }}>{label}</Text>
        {desc ? <Text style={{ fontSize: 11, color: themeSubtitleColor, lineHeight: 15 }}>{desc}</Text> : null}
      </View>
      {badge ? (
        <View style={{ backgroundColor: accentColor, borderRadius: 10, paddingHorizontal: 8, paddingVertical: 2, marginRight: 6 }}>
          <Text style={{ color: "#FFF", fontSize: 10, fontWeight: "700" }}>{badge}</Text>
        </View>
      ) : null}
      <Text style={{ fontSize: 18, color: danger ? "#EF4444" : isDark ? "#475569" : "#CBD5E1", fontWeight: "300" }}>›</Text>
    </TouchableOpacity>
  );

  const MenuDivider = () => (
    <View style={{ height: 1, backgroundColor: themeDividerColor, marginLeft: 31 }} />
  );

  const SectionCard = ({ children, style }) => (
    <View style={[{
      backgroundColor: themeCardBg, borderRadius: 16, marginHorizontal: 16, marginBottom: 12,
      borderWidth: 1, borderColor: themeBorderColor,
      shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 4, elevation: 2
    }, style]}>
      {children}
    </View>
  );

  const SectionLabel = ({ text, color = "#0F9D58" }) => (
    <Text style={{ fontSize: 10, fontWeight: "800", color, letterSpacing: 1.2, paddingHorizontal: 16, paddingTop: 14, paddingBottom: 4 }}>
      {text.toUpperCase()}
    </Text>
  );

  return (
    <ScrollView style={[styles.tabContentLight, { backgroundColor: themeBg }]} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>

      {/* ── PROFILE CARD ── */}
      <View style={{
        marginHorizontal: 16, marginTop: 16, marginBottom: 12,
        backgroundColor: themeCardBg, borderRadius: 20, padding: 18,
        borderWidth: 1, borderColor: themeBorderColor,
        shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 3
      }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 14 }}>
          <TouchableOpacity onPress={() => setActiveSubScreen("profile")} style={{
            width: 64, height: 64, borderRadius: 32,
            backgroundColor: isDark ? "#1E293B" : "#F1F5F9",
            alignItems: "center", justifyContent: "center",
            borderWidth: 2, borderColor: isAdmin ? "#0F9D58" : themeBorderColor
          }}>
            {selectedUser.avatarUri
              ? <Image source={{ uri: selectedUser.avatarUri }} style={{ width: 60, height: 60, borderRadius: 30 }} />
              : <Text style={{ fontSize: 28 }}>👤</Text>
            }
          </TouchableOpacity>

          <View style={{ flex: 1 }}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
              <Text style={{ fontSize: 16, fontWeight: "800", color: themeTextColor }}>{selectedUser.name}</Text>
              {isAdmin && (
                <View style={{ backgroundColor: "#FBBF24", borderRadius: 8, paddingHorizontal: 7, paddingVertical: 2 }}>
                  <Text style={{ color: "#78350F", fontSize: 9, fontWeight: "900" }}>👑 ADMIN</Text>
                </View>
              )}
            </View>
            <Text style={{ fontSize: 12, color: themeSubtitleColor, marginTop: 2 }}>{selectedUser.email}</Text>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 6, marginTop: 6 }}>
              <View style={{ backgroundColor: isAdmin ? "rgba(15,157,88,0.12)" : isDark ? "#1E293B" : "#F1F5F9", borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3, borderWidth: 1, borderColor: isAdmin ? "#0F9D58" : themeBorderColor }}>
                <Text style={{ fontSize: 10, fontWeight: "700", color: isAdmin ? "#0F9D58" : themeSubtitleColor }}>{currentGroupRole} · {chamaName}</Text>
              </View>
              <View style={{ backgroundColor: "#D1FAE5", borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3 }}>
                <Text style={{ fontSize: 10, fontWeight: "700", color: "#065F46" }}>Verified ✓</Text>
              </View>
            </View>
          </View>

          <TouchableOpacity onPress={() => setActiveTab("score")} style={{ alignItems: "center" }}>
            <Text style={{ fontSize: 22, fontWeight: "900", color: "#0F9D58" }}>{selectedUser.creditScore}</Text>
            <Text style={{ fontSize: 9, color: themeSubtitleColor, fontWeight: "600" }}>SCORE</Text>
          </TouchableOpacity>
        </View>

        {/* Stats row */}
        <View style={{ flexDirection: "row", marginTop: 14, paddingTop: 14, borderTopWidth: 1, borderTopColor: themeDividerColor }}>
          {[
            { label: "Balance", value: `KES ${(selectedUser.balance || 0).toLocaleString()}` },
            { label: "Savings", value: `KES ${(selectedUser.savings || 0).toLocaleString()}` },
            { label: "Loop Pts", value: `${selectedUser.loopPoints || 0}` },
            { label: "Profile", value: "85%" }
          ].map((s, i) => (
            <View key={i} style={{ flex: 1, alignItems: "center" }}>
              <Text style={{ fontSize: 12, fontWeight: "800", color: themeTextColor }}>{s.value}</Text>
              <Text style={{ fontSize: 9, color: themeSubtitleColor, marginTop: 1 }}>{s.label}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* ── ACTIVE WORKSPACE (Chama Switcher) ── */}
      {userGroups && userGroups.length > 0 && (
        <>
          <SectionLabel text="Active Workspace" color="#0F9D58" />
          <SectionCard style={{ paddingVertical: 4 }}>
            {userGroups.map((grp, idx) => {
              const isSelected = currentGroup?.id === grp.id;
              return (
                <View key={grp.id}>
                  <TouchableOpacity
                    onPress={async () => {
                      if (isSelected) return;
                      setCurrentGroup(grp);
                      await fetchGroupData(grp.id, selectedUser.email);
                      showBanner(`Switched to Chama: ${grp.name}`, "success");
                    }}
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "space-between",
                      paddingVertical: 12,
                      paddingHorizontal: 16,
                      backgroundColor: isSelected ? (isDark ? "rgba(15, 157, 88, 0.08)" : "rgba(15, 157, 88, 0.05)") : "transparent",
                    }}
                    activeOpacity={0.65}
                  >
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                      <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: isSelected ? "#0F9D58" : "#94A3B8" }} />
                      <Text style={{ fontSize: 13, fontWeight: isSelected ? "700" : "500", color: isSelected ? "#0F9D58" : themeTextColor }}>
                        {grp.name}
                      </Text>
                    </View>
                    {isSelected ? (
                      <Text style={{ color: "#0F9D58", fontSize: 11, fontWeight: "800" }}>Active ✓</Text>
                    ) : (
                      <Text style={{ color: themeSubtitleColor, fontSize: 11 }}>Switch</Text>
                    )}
                  </TouchableOpacity>
                  {idx < userGroups.length - 1 && <View style={{ height: 1, backgroundColor: themeDividerColor, marginLeft: 16 }} />}
                </View>
              );
            })}
          </SectionCard>
        </>
      )}

      {/* ── ADMIN TOOLS SECTION (Admin only) ── */}
      {isAdmin && (
        <>
          <SectionLabel text="Admin Control Panel" color="#0F9D58" />
          <SectionCard style={{ borderColor: "rgba(15,157,88,0.3)", borderWidth: 1.5 }}>
            <MenuRow
              label="Admin Dashboard"
              desc="Live chama performance metrics, charts & health data"
              accentColor="#0F9D58"
              onPress={() => setActiveSubScreen("adminDashboard")}
              badge="LIVE"
            />
            <MenuDivider />
            <MenuRow
              label="Approvals Center"
              desc="Review join requests, micro-loans, KYC, & withdrawals"
              accentColor="#10B981"
              onPress={() => setActiveSubScreen("adminApprovals")}
              badge={loans.filter(l => !l.approved && l.active).length > 0 ? "PENDING" : null}
            />
            <MenuDivider />
            <MenuRow
              label="Financial Control Module"
              desc="Edit contribution rules, penalties, rates, grace days"
              accentColor="#6366F1"
              onPress={() => setActiveSubScreen("adminFinancialRules")}
            />
            <MenuDivider />
            <MenuRow
              label="Advanced Loan Manager"
              desc="Restructure outstanding loans, waive penalty margins"
              accentColor="#F59E0B"
              onPress={() => setActiveSubScreen("adminLoanManagement")}
            />
            <MenuDivider />
            <MenuRow
              label="Governance & Voting"
              desc="Launch consensus polls, elect officers, view quorum"
              accentColor="#3B82F6"
              onPress={() => setActiveSubScreen("adminGovernance")}
            />
            <MenuDivider />
            <MenuRow
              label="Security & Audit Logs"
              desc="View group activities audit trails and session logs"
              accentColor="#8B5CF6"
              onPress={() => setActiveSubScreen("adminSecurity")}
            />
            <MenuDivider />
            <MenuRow
              label="Communication Hub"
              desc="Publish and broadcast alerts directly to member feeds"
              accentColor="#EC4899"
              onPress={() => setActiveSubScreen("adminCommunication")}
            />
            <MenuDivider />
            <MenuRow
              label="Members Directory"
              desc="Manage roster, promote roles, suspend member profiles"
              accentColor="#14B8A6"
              onPress={() => setActiveSubScreen("adminMemberManagement")}
            />
            <MenuDivider />
            <MenuRow
              label="Agendas & Meetings"
              desc="Schedule statutory general assemblies, AGMs & meetings"
              accentColor="#A855F7"
              onPress={() => setActiveSubScreen("adminMeetings")}
            />
            <MenuDivider />
            <MenuRow
              label="Financial Reports"
              desc="Generate asset balance sheets and cooperative audits"
              accentColor="#F43F5E"
              onPress={() => setActiveSubScreen("adminReports")}
            />
            <SectionCard style={{ marginHorizontal: 0, marginBottom: 0, borderRadius: 0, borderWidth: 0 }}>
              <MenuRow
                label="Super Admin Panel"
                desc="Overview of system-wide uptime and global metrics"
                accentColor="#64748B"
                onPress={() => setActiveSubScreen("superAdminPanel")}
              />
            </SectionCard>
            <MenuDivider />
            <MenuRow
              label="Share Invite Code"
              desc={currentGroup?.invite_code ? `Code: ${currentGroup.invite_code}` : "Generate & share group invite link"}
              accentColor="#0EA5E9"
              badge="SHARE"
              onPress={() => {
                if (currentGroup?.invite_code) {
                  Share.share({ message: `Join "${currentGroup.name}" on PayLoop!\n\nInvite Code: ${currentGroup.invite_code}` });
                } else {
                  showBanner("No invite code available", "warning");
                }
              }}
            />
          </SectionCard>
        </>
      )}

      {/* ── CHAMA GOVERNANCE ── */}
      <SectionLabel text="Chama Governance" color="#6366F1" />
      <SectionCard>
        <MenuRow label="Group Info" desc="View group details, rules and contribution schedule" accentColor="#6366F1" onPress={() => setActiveSubScreen("groupInfo")} />
        <MenuDivider />
        <MenuRow label="Members Directory" desc="View all group members and their roles" accentColor="#8B5CF6" onPress={() => setActiveSubScreen("members")} />
        <MenuDivider />
        <MenuRow label="Announcements" desc="Group announcements and pinned updates" accentColor="#A78BFA" onPress={() => setActiveSubScreen("announcementsFeed")} />
      </SectionCard>

      {/* ── WALLET & FINANCE ── */}
      <SectionLabel text="Wallet & Finance" color="#3B82F6" />
      <SectionCard>
        <MenuRow label="My Wallet" desc="Balances, linked accounts and Web3 address" accentColor="#3B82F6" onPress={() => setActiveSubScreen("walletDetails")} />
        <MenuDivider />
        <MenuRow label="Transaction History" desc="Full ledger of deposits, withdrawals and loans" accentColor="#0EA5E9" onPress={() => setActiveSubScreen("transactions")} />
        <MenuDivider />
        <MenuRow label="Savings Goals" desc="Track and manage your personal savings targets" accentColor="#06B6D4" onPress={() => setActiveTab("savings")} />
      </SectionCard>

      {/* ── ACCOUNT ── */}
      <SectionLabel text="Account & Profile" color="#F59E0B" />
      <SectionCard>
        <MenuRow label="Personal Details" desc="Name, phone, ID and profile information" accentColor="#F59E0B" onPress={() => setActiveSubScreen("profile")} />
        <MenuDivider />
        <MenuRow label="Account Settings" desc="Account preferences and linked services" accentColor="#FBBF24" onPress={() => setActiveSubScreen("accountDetails")} />
      </SectionCard>

      {/* ── SECURITY & DISPLAY ── */}
      <SectionLabel text="Security & Display" color="#EF4444" />
      <SectionCard>
        <MenuRow label="Security & PIN" desc="Change PIN, biometrics and 2FA settings" accentColor="#EF4444" onPress={() => setActiveSubScreen("securitySettings")} />
        <MenuDivider />
        <MenuRow label="Appearance" desc={`Theme: ${isDark ? "Dark" : "Light"} · Language & display`} accentColor="#F97316" onPress={() => setActiveSubScreen("appearanceSettings")} />
        <MenuDivider />
        <MenuRow label="System Settings" desc="Customize transaction limits, notifications, and biometric login" accentColor="#10B981" onPress={() => Alert.alert("Settings", "Simulating settings menu. Customize limits, notifications, and biometric login.")} />
      </SectionCard>

      {/* ── ABOUT & SUPPORT ── */}
      <SectionLabel text="About & Support" color="#64748B" />
      <SectionCard>
        <MenuRow label="About PayLoop" desc="Version, legal documents and platform info" accentColor="#64748B" onPress={() => setActiveSubScreen("aboutPayloop")} />
        <MenuDivider />
        <MenuRow label="Help Center" desc="FAQs, guides and customer support" accentColor="#94A3B8" onPress={() => setActiveSubScreen("helpCenter")} />
      </SectionCard>

      {/* ── LOGOUT ── */}
      <SectionCard style={{ marginBottom: 30 }}>
        <MenuRow
          label="Log Out"
          desc="Sign out of your PayLoop account"
          danger
          onPress={() => Alert.alert(
            "Log Out",
            "Are you sure you want to log out?",
            [
              { text: "Cancel", style: "cancel" },
              { text: "Log Out", style: "destructive", onPress: () => { setSelectedUser(null); setCurrentScreen("welcome"); setActiveSubScreen(null); setCurrentGroupRole("Member"); setAdminPrivileges(null); } }
            ]
          )}
        />
      </SectionCard>
    </ScrollView>
  );
}
