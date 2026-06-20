import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  Image,
  ScrollView,
  Alert,
  ActivityIndicator,
  Share,
  StyleSheet
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { CameraView } from "expo-camera";
import { useApp } from "../context/AppContext";
import { styles } from "../../styles";

// Tabs
import HomeTab from "./Tabs/HomeTab";
import SavingsTab from "./Tabs/SavingsTab";
import LoansTab from "./Tabs/LoansTab";
import ScoreTab from "./Tabs/ScoreTab";
import MoreTab from "./Tabs/MoreTab";

// Sub-screens
import Profile from "./SubScreens/Profile";
import EditProfile from "./SubScreens/EditProfile";
import Notifications from "./SubScreens/Notifications";
import Transactions from "./SubScreens/Transactions";
import Members from "./SubScreens/Members";
import Contribute from "./SubScreens/Contribute";
import UssdSim from "./SubScreens/UssdSim";
import GroupInfo from "./SubScreens/GroupInfo";
import WalletDetails from "./SubScreens/WalletDetails";
import AccountDetails from "./SubScreens/AccountDetails";
import SecuritySettings from "./SubScreens/SecuritySettings";
import AppearanceSettings from "./SubScreens/AppearanceSettings";
import AnnouncementsFeed from "./SubScreens/AnnouncementsFeed";
import AboutPayloop from "./SubScreens/AboutPayloop";
import HelpCenter from "./SubScreens/HelpCenter";
import VerifyIdentity from "./SubScreens/VerifyIdentity";

// Admin Screens
import AdminDashboard from "./Admin/AdminDashboard";
import AdminApprovals from "./Admin/AdminApprovals";
import AdminFinancialRules from "./Admin/AdminFinancialRules";
import AdminLoanManagement from "./Admin/AdminLoanManagement";
import AdminGovernance from "./Admin/AdminGovernance";
import AdminSecurity from "./Admin/AdminSecurity";
import AdminCommunication from "./Admin/AdminCommunication";
import AdminMemberManagement from "./Admin/AdminMemberManagement";
import AdminMeetings from "./Admin/AdminMeetings";
import AdminReports from "./Admin/AdminReports";
import SuperAdminPanel from "./Admin/SuperAdminPanel";

export default function Dashboard() {
  const {
    // Navigation & Tabs
    currentScreen,
    setCurrentScreen,
    activeTab,
    setActiveTab,
    activeSubScreen,
    setActiveSubScreen,
    loansSubTab,
    setLoansSubTab,
    isDrawerOpen,
    setIsDrawerOpen,

    // App State / Data
    selectedUser,
    setSelectedUser,
    userGroups,
    currentGroup,
    setCurrentGroup,
    fetchGroupData,
    currentGroupRole,
    setCurrentGroupRole,
    setAdminPrivileges,
    chamaName,
    setChamaName,
    loans,
    currency,
    setCurrency,
    showQrScanner,
    setShowQrScanner,
    permission,
    requestPermission,

    // Overlay Modals State
    showMetaMaskModal,
    setShowMetaMaskModal,
    txDetails,
    handleMetaMaskConfirm,
    showStkModal,
    setShowStkModal,
    stkPayDetails,
    stkPinCode,
    setStkPinCode,
    showReceiptModal,
    setShowReceiptModal,
    receiptDetails,
    handleShareReceipt,
    showAvatarPicker,
    setShowAvatarPicker,
    editAvatarUri,
    setEditAvatarUri,
    depositAmount,
    setDepositAmount,
    setPaymentMethod,
    
    // UI Theme & Helpers
    isDark,
    themeBg,
    themeCardBg,
    themeBorderColor,
    themeTextColor,
    themeSubtitleColor,
    themeDividerColor,
    isDashboardLoading,
    showBanner,
    t,
    isLoading,
    launchDigitalReceipt,
    requestSignature,
    formatValue
  } = useApp();

  const getTimeGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 17) return "Good Afternoon";
    return "Good Evening";
  };

  const handleBarCodeScanned = ({ data }) => {
    if (!showQrScanner) return;
    setShowQrScanner(false);

    let address = data.trim();
    if (address.toLowerCase().startsWith("ethereum:")) {
      address = address.substring(9).split("@")[0].split("?")[0];
    } else if (address.toLowerCase().startsWith("payloop:")) {
      address = address.substring(8).split("?")[0];
    }

    // Direct check since we don't have ethers globally here (or we can use regex)
    const isEthAddress = /^0x[a-fA-F0-9]{40}$/.test(address);
    if (isEthAddress) {
      Alert.alert(
        "QR Code Scanned! 🎯",
        `Recipient Address:\n${address}\n\nWould you like to send a peer-to-peer payment?`,
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Send KES (M-Pesa)",
            onPress: () => {
              setDepositAmount("500");
              setPaymentMethod("mpesa");
              // Set details for STK push Pin
              stkPayDetails.title = `P2P to ${address.substring(0, 6)}...${address.substring(38)}`;
              stkPayDetails.amountFormatted = "KES 500.00";
              stkPayDetails.onFinish = () => {
                showBanner("P2P Payment via M-Pesa successful!", "success");
                launchDigitalReceipt("P2P Payment", 3.85, address);
              };
              setShowStkModal(true);
            }
          },
          {
            text: "Send USDC (MetaMask)",
            onPress: () => {
              requestSignature("P2P USDC Transfer", "3.85 USDC", () => {
                showBanner("P2P USDC Transfer successful!", "success");
                launchDigitalReceipt("P2P USDC Transfer", 3.85, address);
              });
            }
          }
        ]
      );
    } else {
      Alert.alert("Invalid QR Code", `Scanned content is not a valid Web3 address:\n${data}`);
    }
  };

  const renderTopBar = () => {
    return (
      <View style={styles.topBarContainer}>
        <View style={styles.topBarLeft}>
          <TouchableOpacity onPress={() => setIsDrawerOpen(true)} style={{ marginRight: 10, padding: 4 }}>
            <Text style={{ fontSize: 22, color: isDark ? "#FFFFFF" : "#1E293B" }}>☰</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => setActiveSubScreen("profile")} style={styles.topBarAvatarBox}>
            {selectedUser?.avatarUri ? (
              <Image source={{ uri: selectedUser.avatarUri }} style={{ width: 32, height: 32, borderRadius: 16 }} />
            ) : (
              <Text style={styles.topBarAvatarEmoji}>👤</Text>
            )}
          </TouchableOpacity>
          <View style={styles.topBarTextCol}>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Text style={styles.topBarGreetingText}>{getTimeGreeting()}, {selectedUser?.name?.split(" ")[0]} 👋</Text>
              {currentGroupRole === "Admin" ? (
                <View style={{ backgroundColor: "#FBBF24", paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6, marginLeft: 6, flexDirection: "row", alignItems: "center", gap: 2 }}>
                  <Text style={{ fontSize: 9 }}>👑</Text>
                  <Text style={{ color: "#78350F", fontSize: 9, fontWeight: "bold" }}>Admin</Text>
                </View>
              ) : selectedUser?.verification_level === "FULLY_VERIFIED" ? (
                <View style={{ backgroundColor: "#FBBF24", paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6, marginLeft: 6 }}>
                  <Text style={{ color: "#78350F", fontSize: 9, fontWeight: "bold" }}>Level 2 ✓</Text>
                </View>
              ) : selectedUser?.is_email_verified ? (
                <View style={{ backgroundColor: "#D1FAE5", paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6, marginLeft: 6 }}>
                  <Text style={{ color: "#065F46", fontSize: 9, fontWeight: "bold" }}>Level 1 ✓</Text>
                </View>
              ) : null}
            </View>
            <View style={styles.topBarChamaRow}>
              <View style={styles.topBarPulseDot} />
              <Text style={styles.topBarChamaText}>{chamaName}</Text>
              <View style={{
                marginLeft: 6,
                backgroundColor: currentGroupRole === "Admin" ? "rgba(15,157,88,0.15)" : "rgba(100,116,139,0.12)",
                borderRadius: 8, paddingHorizontal: 6, paddingVertical: 1,
                borderWidth: 1, borderColor: currentGroupRole === "Admin" ? "#0F9D58" : "#94A3B8"
              }}>
                <Text style={{ fontSize: 9, fontWeight: "700", color: currentGroupRole === "Admin" ? "#0F9D58" : "#94A3B8" }}>
                  {currentGroupRole}
                </Text>
              </View>
            </View>
          </View>
        </View>
        
        <View style={styles.topBarRight}>
          <TouchableOpacity
            onPress={() => setCurrency(currency === "KES" ? "USDC" : "KES")}
            style={styles.topBarCurrencyPill}
          >
            <Text style={styles.topBarCurrencyText}>{currency}</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => Alert.alert("Settings", "Simulating settings menu. Customize limits, notifications, and biometric login.")} style={styles.topBarIconBtn}>
            <Text style={styles.topBarIconEmoji}>⚙️</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => setActiveSubScreen("notifications")} style={styles.topBarIconBtn}>
            <Text style={styles.topBarIconEmoji}>🔔</Text>
            <View style={styles.topBarRedBadge} />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderSkeletonLoader = () => {
    return (
      <View style={styles.skeletonContainer}>
        <View style={styles.skeletonTopBar} />
        <View style={styles.skeletonSummaryCard} />
        <View style={styles.skeletonGridRow}>
          <View style={styles.skeletonGridItem} />
          <View style={styles.skeletonGridItem} />
        </View>
        <View style={styles.skeletonGridRow}>
          <View style={styles.skeletonGridItem} />
          <View style={styles.skeletonGridItem} />
        </View>
        <View style={styles.skeletonTitle} />
        <View style={styles.skeletonTrackerCard} />
      </View>
    );
  };

  const renderAvatarPickerModal = () => {
    if (!showAvatarPicker) return null;
    const presets = [
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?fit=crop&w=150&h=150",
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?fit=crop&w=150&h=150",
      "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?fit=crop&w=150&h=150",
      "https://images.unsplash.com/photo-1517841905240-472988babdf9?fit=crop&w=150&h=150"
    ];

    const handleSelectPreset = (uri) => {
      if (activeSubScreen === "editProfile") {
        setEditAvatarUri(uri);
      } else {
        setSelectedUser(prev => prev ? ({ ...prev, avatarUri: uri }) : prev);
      }
      setShowAvatarPicker(false);
    };

    const handleCaptureSimulation = () => {
      Alert.alert("Camera Simulation", "Simulating photo capture. Adjusting lens and capturing...");
      setTimeout(() => {
        handleSelectPreset("https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?fit=crop&w=150&h=150");
      }, 1200);
    };

    const handleGallerySimulation = () => {
      Alert.alert("Gallery Simulation", "Opening device file manager... Uploading portrait...");
      setTimeout(() => {
        handleSelectPreset("https://images.unsplash.com/photo-1494790108377-be9c29b29330?fit=crop&w=150&h=150");
      }, 1200);
    };

    return (
      <Modal visible={showAvatarPicker} transparent animationType="slide" onRequestClose={() => setShowAvatarPicker(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.detailCardBox, { borderBottomLeftRadius: 0, borderBottomRightRadius: 0, marginBottom: 0, paddingBottom: 40, backgroundColor: themeCardBg, borderColor: themeBorderColor }]}>
            <Text style={[styles.detailCardHeader, { color: themeTextColor, fontSize: 16, textAlign: "center", marginBottom: 16 }]}>
              {t("choose_avatar")}
            </Text>
            
            <View style={{ flexDirection: "row", justifyContent: "space-around", marginVertical: 20 }}>
              {presets.map((p, idx) => (
                <TouchableOpacity key={idx} onPress={() => handleSelectPreset(p)}>
                  <Image 
                    source={{ uri: p }} 
                    style={{ 
                      width: 60, 
                      height: 60, 
                      borderRadius: 30, 
                      borderWidth: 3, 
                      borderColor: (activeSubScreen === "editProfile" ? editAvatarUri : selectedUser?.avatarUri) === p ? "#0F9D58" : "transparent" 
                    }} 
                  />
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity onPress={handleCaptureSimulation} style={[styles.walletActionBtnOutline, { marginHorizontal: 0, paddingVertical: 10, marginVertical: 6 }]}>
              <Text style={styles.walletActionBtnOutlineText}>{t("take_photo")}</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={handleGallerySimulation} style={[styles.walletActionBtnOutline, { marginHorizontal: 0, paddingVertical: 10, marginVertical: 6 }]}>
              <Text style={styles.walletActionBtnOutlineText}>{t("upload_library")}</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => setShowAvatarPicker(false)} style={[styles.walletActionBtnDisconnect, { marginHorizontal: 0, paddingVertical: 10, marginVertical: 6, backgroundColor: isDark ? "#3f1f1f" : "#FEF2F2", borderColor: isDark ? "#7f1d1d" : "#FCA5A5" }]}>
              <Text style={styles.walletActionBtnDisconnectText}>{t("cancel")}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    );
  };

  const renderActiveSubScreen = () => {
    switch (activeSubScreen) {
      case "adminDashboard":
        return <AdminDashboard />;
      case "adminApprovals":
        return <AdminApprovals />;
      case "adminFinancialRules":
      case "groupSettings":
        return <AdminFinancialRules />;
      case "adminLoanManagement":
      case "disbursement":
        return <AdminLoanManagement />;
      case "adminGovernance":
        return <AdminGovernance />;
      case "adminSecurity":
        return <AdminSecurity />;
      case "adminCommunication":
      case "announcements":
        return <AdminCommunication />;
      case "adminMemberManagement":
      case "groupMembers":
        return <AdminMemberManagement />;
      case "adminMeetings":
        return <AdminMeetings />;
      case "adminReports":
        return <AdminReports />;
      case "superAdminPanel":
        return <SuperAdminPanel />;
      case "groupInfo":
        return <GroupInfo />;
      case "walletDetails":
        return <WalletDetails />;
      case "accountDetails":
        return <AccountDetails />;
      case "securitySettings":
        return <SecuritySettings />;
      case "appearanceSettings":
        return <AppearanceSettings />;
      case "announcementsFeed":
        return <AnnouncementsFeed />;
      case "aboutPayloop":
        return <AboutPayloop />;
      case "helpCenter":
        return <HelpCenter />;
      case "verifyIdentity":
        return <VerifyIdentity />;
      case "profile":
        return <Profile />;
      case "editProfile":
        return <EditProfile />;
      case "notifications":
        return <Notifications />;
      case "transactions":
        return <Transactions />;
      case "members":
        return <Members />;
      case "contribute":
        return <Contribute />;
      case "ussd":
        return <UssdSim />;
      default:
        return null;
    }
  };

  const renderActiveTab = () => {
    switch (activeTab) {
      case "home":
        return <HomeTab />;
      case "savings":
        return <SavingsTab />;
      case "loans":
        return <LoansTab />;
      case "score":
        return <ScoreTab />;
      case "more":
        return <MoreTab />;
      default:
        return null;
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: themeBg }}>
      <StatusBar style={isDark ? "light" : "dark"} />
      
      {activeSubScreen !== null ? (
        renderActiveSubScreen()
      ) : (
        <View style={{ flex: 1 }}>
          {renderTopBar()}
          {isDashboardLoading ? renderSkeletonLoader() : renderActiveTab()}
        </View>
      )}

      {/* Bottom Navigation Bar */}
      {activeSubScreen === null && (
        <View style={[styles.bottomTabBar, { paddingBottom: 6, paddingTop: 0, height: 58 }]}>
          {[
            { key: "home", label: "Home" },
            { key: "savings", label: "Savings" },
            { key: "loans", label: "Loans" },
            { key: "score", label: "Score" },
            { key: "more", label: currentGroupRole === "Admin" ? "Admin" : "More" }
          ].map((tab) => {
            const isActive = activeTab === tab.key;
            const isAdminTab = tab.key === "more" && currentGroupRole === "Admin";
            return (
              <TouchableOpacity
                key={tab.key}
                onPress={() => setActiveTab(tab.key)}
                style={{ flex: 1, alignItems: "center", justifyContent: "flex-start", paddingTop: 0 }}
                activeOpacity={0.75}
              >
                <View style={{
                  height: 3, width: isActive ? "60%" : 0, borderRadius: 2,
                  backgroundColor: "#0F9D58",
                  marginBottom: 8
                }} />
                <Text style={{
                  fontSize: isActive ? 11.5 : 11,
                  fontWeight: isActive ? "800" : "500",
                  color: isActive ? "#0F9D58" : (isDark ? "#64748B" : "#94A3B8"),
                  letterSpacing: isActive ? -0.2 : 0
                }}>
                  {tab.label}
                </Text>
                {isAdminTab && (
                  <View style={{ width: 5, height: 5, borderRadius: 3, backgroundColor: "#FBBF24", position: "absolute", top: 6, right: "24%" }} />
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      )}

      {/* Hamburger Drawer Overlay Menu Modal */}
      {isDrawerOpen && (
        <Modal visible={isDrawerOpen} transparent animationType="fade" onRequestClose={() => setIsDrawerOpen(false)}>
          <View style={{ flex: 1, flexDirection: "row" }}>
            <View style={{
              width: 280, height: "100%",
              backgroundColor: isDark ? "#0A0F1E" : "#FFFFFF",
              borderRightWidth: 1.5, borderColor: isDark ? "#1F2937" : "#E5E7EB",
              paddingTop: 56, paddingHorizontal: 20
            }}>
              <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 24, gap: 12 }}>
                <View style={{ width: 48, height: 48, borderRadius: 24, backgroundColor: isDark ? "#1F2937" : "#F3F4F6", alignItems: "center", justifyContent: "center" }}>
                  {selectedUser?.avatarUri ? (
                    <Image source={{ uri: selectedUser.avatarUri }} style={{ width: 48, height: 48, borderRadius: 24 }} />
                  ) : (
                    <Text style={{ fontSize: 24 }}>👤</Text>
                  )}
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 16, fontWeight: "bold", color: themeTextColor }} numberOfLines={1}>
                    {selectedUser?.name || "Guest"}
                  </Text>
                  <Text style={{ fontSize: 11, color: "#0F9D58", fontWeight: "700", marginTop: 2 }}>
                    ⭐ Score: {selectedUser?.creditScore || 500}
                  </Text>
                </View>
              </View>

              {userGroups.length > 0 && (
                <View style={{ marginBottom: 20 }}>
                  <Text style={{ fontSize: 10, color: themeSubtitleColor, fontWeight: "bold", textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 6 }}>
                    Active Workspace
                  </Text>
                  <ScrollView style={{ maxHeight: 120, borderWidth: 1, borderColor: themeBorderColor, borderRadius: 10, backgroundColor: isDark ? "#111827" : "#F8FAFC" }}>
                    {userGroups.map((grp) => {
                      const isSelected = currentGroup?.id === grp.id;
                      return (
                        <TouchableOpacity
                          key={grp.id}
                          onPress={async () => {
                            setCurrentGroup(grp);
                            await fetchGroupData(grp.id, selectedUser.email);
                            setIsDrawerOpen(false);
                            showBanner(`Switched to Chama: ${grp.name}`, "success");
                          }}
                          style={{
                            padding: 10,
                            flexDirection: "row", alignItems: "center", justifyContent: "space-between",
                            backgroundColor: isSelected ? (isDark ? "rgba(15,157,88,0.15)" : "#E8F5E9") : "transparent",
                            borderBottomWidth: 0.5, borderBottomColor: themeBorderColor
                          }}
                        >
                          <Text style={{ fontSize: 12, fontWeight: isSelected ? "bold" : "normal", color: isSelected ? "#0F9D58" : themeTextColor }} numberOfLines={1}>
                            {grp.name}
                          </Text>
                          {isSelected && <Text style={{ color: "#0F9D58", fontSize: 10 }}>✓</Text>}
                        </TouchableOpacity>
                      );
                    })}
                  </ScrollView>
                </View>
              )}

              <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ gap: 4 }}>
                {[
                  { id: "dashboard", label: "Dashboard", emoji: "📊", action: () => { setCurrentScreen("dashboard"); setActiveTab("home"); setActiveSubScreen(null); } },
                  { id: "savings", label: "Savings Goals", emoji: "💰", action: () => { setCurrentScreen("dashboard"); setActiveTab("savings"); setActiveSubScreen(null); } },
                  { id: "loans", label: "Borrow / Loans", emoji: "🤝", action: () => { setCurrentScreen("dashboard"); setActiveTab("loans"); setActiveSubScreen(null); } },
                  { id: "score", label: "Reputation Score", emoji: "📈", action: () => { setCurrentScreen("dashboard"); setActiveTab("score"); setActiveSubScreen(null); } },
                  { id: "wallet", label: "My Wallet Workspace", emoji: "💼", action: () => { setActiveSubScreen("walletDetails"); } },
                  { id: "transactions", label: "Transactions History", emoji: "🧾", action: () => { setActiveSubScreen("transactions"); } },
                  { id: "announcements", label: "Announcements Feed", emoji: "📢", action: () => { setActiveSubScreen("announcementsFeed"); } },
                  { id: "profile", label: "View Profile", emoji: "👤", action: () => { setActiveSubScreen("profile"); } },
                  { id: "settings", label: "Settings", emoji: "⚙️", action: () => { setActiveSubScreen("appearanceSettings"); } },
                ].map(item => (
                  <TouchableOpacity
                    key={item.id}
                    onPress={() => {
                      item.action();
                      setIsDrawerOpen(false);
                    }}
                    style={{
                      flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 12, paddingHorizontal: 10, borderRadius: 10
                    }}
                  >
                    <Text style={{ fontSize: 18 }}>{item.emoji}</Text>
                    <Text style={{ fontSize: 14, fontWeight: "600", color: themeTextColor }}>{item.label}</Text>
                  </TouchableOpacity>
                ))}

                <TouchableOpacity
                  onPress={() => {
                    setIsDrawerOpen(false);
                    Alert.alert(
                      t("logout"),
                      "Are you sure you want to log out of your PayLoop account?",
                      [
                        { text: t("cancel"), style: "cancel" },
                        { text: t("logout"), style: "destructive", onPress: () => {
                            setSelectedUser(null);
                            setCurrentScreen("welcome");
                            setActiveSubScreen(null);
                          }
                        }
                      ]
                    );
                  }}
                  style={{
                    flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 12, paddingHorizontal: 10, borderRadius: 10, marginTop: 20
                  }}
                >
                  <Text style={{ fontSize: 18 }}>🚪</Text>
                  <Text style={{ fontSize: 14, fontWeight: "bold", color: "#E53935" }}>Logout</Text>
                </TouchableOpacity>
              </ScrollView>
            </View>

            <TouchableOpacity onPress={() => setIsDrawerOpen(false)} style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.5)" }} />
          </View>
        </Modal>
      )}

      {/* METAMASK TRANSACTION SIGNATURE OVERLAY */}
      <Modal visible={showMetaMaskModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.metamaskCard}>
            <View style={styles.metamaskHeader}>
              <Text style={styles.metamaskBrand}>🦊 MetaMask Mobile</Text>
              <Text style={styles.metamaskNetwork}>Polygon Amoy</Text>
            </View>

            <View style={styles.metamaskBody}>
              <Text style={styles.metamaskAction}>{txDetails.title}</Text>
              <Text style={styles.metamaskAmount}>{txDetails.amount}</Text>
              <View style={styles.metamaskDivider} />
              <View style={styles.metamaskRow}>
                <Text style={styles.metaLabel}>Est. Gas Fee</Text>
                <Text style={styles.metaVal}>{txDetails.gas} MATIC</Text>
              </View>
            </View>

            <View style={styles.metamaskActions}>
              <TouchableOpacity onPress={() => setShowMetaMaskModal(false)} style={styles.metaCancel}>
                <Text style={styles.metaCancelText}>REJECT</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleMetaMaskConfirm} style={styles.metaConfirm}>
                <Text style={styles.metaConfirmText}>CONFIRM</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* M-PESA SIM TOOLKIT STK PUSH PIN MODAL */}
      <Modal visible={showStkModal} transparent animationType="fade">
        <View style={styles.stkModalOverlay}>
          <View style={styles.stkPushCard}>
            <View style={styles.stkHeaderRow}>
              <Text style={styles.stkBrandLabel}>SIM Toolkit</Text>
              <Text style={styles.stkSafaricomLabel}>Safaricom</Text>
            </View>
            
            <View style={styles.stkBodyGroup}>
              <Text style={styles.stkPushMessage}>{stkPayDetails.title || "Pay KES to PayLoop Chama?"}</Text>
              <Text style={styles.stkPushAmount}>{stkPayDetails.amountFormatted}</Text>
              
              <View style={styles.stkPinDotsContainer}>
                {[1, 2, 3, 4].map((d, idx) => (
                  <View
                    key={d}
                    style={[
                      styles.stkPinDot,
                      stkPinCode.length > idx ? styles.stkPinDotFilled : null
                    ]}
                  />
                ))}
              </View>
              <Text style={styles.stkPinHelperText}>Enter your 4-digit M-Pesa PIN</Text>
            </View>

            {/* Simulated Numeric Keypad */}
            <View style={styles.stkNumPadContainer}>
              {[
                ["1", "2", "3"],
                ["4", "5", "6"],
                ["7", "8", "9"],
                ["✕", "0", "OK"]
              ].map((row, rIdx) => (
                <View key={rIdx} style={styles.stkNumPadRow}>
                  {row.map((key) => {
                    const isSpecial = key === "✕" || key === "OK";
                    return (
                      <TouchableOpacity
                        key={key}
                        onPress={() => {
                          if (key === "✕") {
                            setStkPinCode("");
                          } else if (key === "OK") {
                            if (stkPinCode.length === 4) {
                              setShowStkModal(false);
                              if (stkPayDetails.onFinish) {
                                stkPayDetails.onFinish();
                              }
                            } else {
                              Alert.alert("Invalid PIN", "PIN must be exactly 4 digits.");
                            }
                          } else {
                            if (stkPinCode.length < 4) {
                              setStkPinCode(prev => prev + key);
                            }
                          }
                        }}
                        style={[styles.stkNumKey, isSpecial ? styles.stkSpecialKey : null]}
                      >
                        <Text style={[styles.stkNumKeyText, isSpecial ? styles.stkSpecialKeyText : null]}>{key}</Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              ))}
            </View>
          </View>
        </View>
      </Modal>

      {/* DIGITAL RECEIPT MODAL */}
      <Modal visible={showReceiptModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.receiptContainer}>
            <View style={styles.receiptHeader}>
              <Text style={styles.receiptHeaderEmoji}>🧾</Text>
              <Text style={styles.receiptHeaderTitle}>Transaction Receipt</Text>
              <Text style={styles.receiptHeaderStatus}>TRANSACTION SECURED</Text>
            </View>
            <View style={styles.receiptBody}>
              <View style={styles.receiptRow}>
                <Text style={styles.receiptLabel}>Transaction ID</Text>
                <Text style={styles.receiptValue}>{receiptDetails.txId}</Text>
              </View>
              <View style={styles.receiptRow}>
                <Text style={styles.receiptLabel}>Transaction Type</Text>
                <Text style={styles.receiptValue}>{receiptDetails.title}</Text>
              </View>
              <View style={styles.receiptRow}>
                <Text style={styles.receiptLabel}>Amount Transferred</Text>
                <Text style={styles.receiptValue}>{formatValue(receiptDetails.amount)}</Text>
              </View>
              <View style={styles.receiptRow}>
                <Text style={styles.receiptLabel}>Date & Time</Text>
                <Text style={styles.receiptValue}>{receiptDetails.date}</Text>
              </View>
              <View style={styles.receiptRow}>
                <Text style={styles.receiptLabel}>Recipient / Destination</Text>
                <Text style={styles.receiptValue}>{receiptDetails.recipient}</Text>
              </View>
            </View>
            <View style={styles.receiptFooter}>
              <TouchableOpacity onPress={handleShareReceipt} style={styles.receiptShareBtn}>
                <Text style={styles.receiptShareBtnText}>🔗 Share Receipt</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setShowReceiptModal(false)} style={styles.receiptCloseBtn}>
                <Text style={styles.receiptCloseBtnText}>Close Receipt</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* REAL QR CODE SCANNER OVERLAY */}
      <Modal visible={showQrScanner} transparent={false} animationType="slide">
        <View style={{ flex: 1, backgroundColor: "#000000" }}>
          {!permission ? (
            <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: "#000000" }}>
              <ActivityIndicator size="large" color="#0F9D58" />
              <Text style={{ color: "#ffffff", marginTop: 12 }}>Initializing Camera...</Text>
            </View>
          ) : !permission.granted ? (
            <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: "#000000", paddingHorizontal: 30 }}>
              <Text style={{ color: "#ffffff", fontSize: 22, fontWeight: "bold", textAlign: "center", marginBottom: 12 }}>Camera Access Required 📷</Text>
              <Text style={{ color: "#9CA3AF", fontSize: 14, textAlign: "center", marginBottom: 32, lineHeight: 22 }}>
                We need your permission to use the camera in order to scan peer-to-peer payment QR codes.
              </Text>
              <TouchableOpacity
                onPress={requestPermission}
                style={[styles.buttonWelcomeCreate, { width: "100%", marginVertical: 0 }]}
              >
                <Text style={styles.buttonTextPrimary}>Grant Camera Permission</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setShowQrScanner(false)}
                style={{ marginTop: 20, padding: 8 }}
              >
                <Text style={{ color: "#9CA3AF", fontSize: 15, fontWeight: "600" }}>Cancel</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={{ flex: 1 }}>
              <CameraView
                style={StyleSheet.absoluteFillObject}
                facing="back"
                barcodeScannerSettings={{
                  barcodeTypes: ["qr"],
                }}
                onBarcodeScanned={handleBarCodeScanned}
              />
              
              <View style={styles.qrScannerOverlay}>
                <View style={styles.qrScannerHeader}>
                  <Text style={styles.qrScannerTitle}>Scan PayLoop QR Code</Text>
                  <TouchableOpacity onPress={() => setShowQrScanner(false)} style={styles.qrScannerCloseBtn}>
                    <Text style={styles.qrScannerCloseBtnText}>✕</Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.qrScannerBoxContainer}>
                  <View style={styles.qrScannerFinderFrame}>
                    <View style={styles.qrScannerLaserLine} />
                  </View>
                  <Text style={styles.qrScannerInstruction}>Align QR code inside the box to transfer funds</Text>
                </View>

                <View style={styles.qrScannerFooter}>
                  <TouchableOpacity
                    onPress={() => {
                      const mockScannedData = { data: "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC" };
                      handleBarCodeScanned(mockScannedData);
                    }}
                    style={styles.qrScannerSimulateBtn}
                  >
                    <Text style={styles.qrScannerSimulateBtnText}>Simulate Scan Success</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          )}
        </View>
      </Modal>

      {renderAvatarPickerModal()}
    </View>
  );
}
