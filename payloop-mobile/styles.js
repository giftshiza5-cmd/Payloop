import { StyleSheet, Dimensions, Platform, StatusBar } from "react-native";
const { width } = Dimensions.get("window");
const STATUS_BAR_HEIGHT = Platform.OS === "ios" ? 44 : (StatusBar.currentHeight || 24);

export const styles = StyleSheet.create({
  // SPLASH SCREEN
  splashContainer: {
    flex: 1,
    backgroundColor: "#0F9D58",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 50
  },
  splashLogoWrapper: {
    alignItems: "center",
    marginTop: 180
  },
  logoBadgeBig: {
    width: 90,
    height: 90,
    borderRadius: 24,
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20
  },
  logoEmojiBig: {
    fontSize: 52,
    color: "#ffffff"
  },
  splashTitle: {
    fontSize: 36,
    fontWeight: "bold",
    color: "#ffffff",
    letterSpacing: 1
  },
  splashSubtitle: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.75)",
    marginTop: 8
  },
  splashFooter: {
    alignItems: "center"
  },
  splashFooterText: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.6)",
    fontWeight: "600"
  },

  // ONBOARDING SCREEN
  containerLight: {
    flex: 1,
    backgroundColor: "#F9FAFB",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
    paddingTop: STATUS_BAR_HEIGHT,
    position: "relative"
  },
  skipButtonTop: {
    position: "absolute",
    top: STATUS_BAR_HEIGHT + 12,
    right: 24,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    zIndex: 10
  },
  skipButtonTextTop: {
    fontSize: 13,
    fontWeight: "bold",
    color: "#6B7280"
  },
  onboardingHeroBox: {
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: "rgba(15, 157, 88, 0.08)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24
  },
  onboardingHeroEmoji: {
    fontSize: 72,
    textAlign: "center"
  },
  onboardingInfoBox: {
    alignItems: "center",
    paddingHorizontal: 16
  },
  onboardingLabel: {
    fontSize: 11,
    fontWeight: "800",
    color: "#0F9D58",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 10
  },
  onboardingTitle: {
    fontSize: 24,
    fontWeight: "800",
    color: "#111827",
    textAlign: "center"
  },
  onboardingDesc: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
    marginTop: 10,
    lineHeight: 20
  },
  carouselIndicators: {
    flexDirection: "row",
    gap: 8,
    marginVertical: 24
  },
  indicatorDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#E5E7EB"
  },
  indicatorDotActive: {
    backgroundColor: "#0F9D58",
    width: 16
  },
  onboardingActionRow: {
    flexDirection: "row",
    gap: 16,
    width: "100%",
    marginTop: 10
  },
  onboardingBackBtn: {
    flex: 1,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center"
  },
  onboardingBackBtnText: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#4B5563"
  },
  onboardingNextBtn: {
    flex: 1,
    backgroundColor: "#0F9D58",
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center"
  },
  onboardingNextBtnText: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#ffffff"
  },

  // WELCOME SCREEN
  welcomeLogoContainer: {
    alignItems: "center",
    marginTop: 60
  },
  welcomeLogoCircle: {
    width: 70,
    height: 70,
    borderRadius: 18,
    backgroundColor: "rgba(15, 157, 88,0.08)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16
  },
  welcomeLogoEmoji: {
    fontSize: 36
  },
  welcomeAppName: {
    fontSize: 26,
    fontWeight: "800",
    color: "#111827"
  },
  welcomeAppSubtitle: {
    fontSize: 14,
    color: "#6B7280",
    marginTop: 6
  },
  welcomeIllustrationBox: {
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 40
  },
  welcomeIllustrationEmoji: {
    fontSize: 54
  },
  welcomeActionsGroup: {
    width: "100%",
    gap: 12,
    marginBottom: 40
  },
  buttonWelcomeCreate: {
    width: "100%",
    backgroundColor: "#0F9D58",
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center"
  },
  buttonWelcomeLogin: {
    width: "100%",
    backgroundColor: "#ffffff",
    borderWidth: 1.5,
    borderColor: "#0F9D58",
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center"
  },
  buttonWelcomeLoginText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#0F9D58"
  },

  // REGISTRATION PAGE
  authScrollContainer: {
    paddingTop: STATUS_BAR_HEIGHT + 20,
    paddingBottom: 40,
    paddingHorizontal: 24,
    backgroundColor: "#F9FAFB"
  },
  authHeaderBox: {
    alignItems: "center",
    marginBottom: 24
  },
  authHeaderTitle: {
    fontSize: 26,
    fontWeight: "800",
    color: "#111827"
  },
  authHeaderSubtitle: {
    fontSize: 14,
    color: "#6B7280",
    marginTop: 6,
    textAlign: "center"
  },
  authFormBox: {
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.02,
    shadowRadius: 2,
    elevation: 1
  },
  authFormLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: "#4B5563",
    marginTop: 12,
    textTransform: "uppercase"
  },
  authFormInput: {
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginTop: 6,
    color: "#111827",
    fontSize: 14
  },
  authBackLink: {
    alignItems: "center",
    marginVertical: 16
  },
  authBackLinkText: {
    fontSize: 14,
    color: "#6B7280",
    fontWeight: "600"
  },

  // EMAIL VERIFICATION SCREEN
  verificationHeader: {
    alignItems: "center",
    marginBottom: 24
  },
  verificationEmoji: {
    fontSize: 50,
    marginBottom: 14
  },
  verificationTitle: {
    fontSize: 24,
    fontWeight: "800",
    color: "#111827"
  },
  verificationSubtitle: {
    fontSize: 14,
    color: "#6B7280",
    marginTop: 8,
    textAlign: "center",
    lineHeight: 20
  },
  verificationEmailHighlight: {
    fontWeight: "bold",
    color: "#0F9D58"
  },
  verificationInputWrapper: {
    width: "100%",
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 14,
    padding: 14,
    alignItems: "center",
    marginBottom: 20
  },
  otpTextInputBox: {
    fontSize: 28,
    fontWeight: "bold",
    letterSpacing: 8,
    textAlign: "center",
    color: "#111827",
    width: "80%"
  },
  otpSecondaryActionsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginTop: 20,
    paddingHorizontal: 10
  },
  otpTimerLink: {
    padding: 4
  },
  otpTimerLinkText: {
    fontSize: 13,
    color: "#0F9D58",
    fontWeight: "700"
  },
  otpTimerLinkDisabled: {
    color: "#9CA3AF"
  },
  changeEmailLink: {
    padding: 4
  },
  changeEmailLinkText: {
    fontSize: 13,
    color: "#6B7280",
    fontWeight: "600"
  },

  // CONNECT WALLET
  connectWalletHeaderBox: {
    alignItems: "center",
    marginBottom: 40,
    paddingHorizontal: 12
  },
  connectWalletTitle: {
    fontSize: 26,
    fontWeight: "800",
    color: "#111827"
  },
  connectWalletSubtitle: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 20,
    marginTop: 10
  },
  walletOptionsListWidth: {
    width: "100%",
    gap: 12,
    marginBottom: 40
  },
  skipWalletBtn: {
    padding: 10
  },
  skipWalletBtnText: {
    fontSize: 15,
    color: "#0F9D58",
    fontWeight: "bold"
  },

  // COMPLETE PROFILE MOCK PHOTOS
  avatarSelectionContainerMock: {
    alignItems: "center",
    marginBottom: 20
  },
  avatarMockCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#F3F4F6",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    alignItems: "center",
    justifyContent: "center"
  },
  avatarMockEmoji: {
    fontSize: 36
  },
  avatarMockLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#0F9D58",
    marginTop: 8
  },

  // PIN CODE LAYOUTS
  pinHeaderBox: {
    alignItems: "center",
    marginBottom: 30,
    paddingHorizontal: 16
  },
  pinTitle: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#111827"
  },
  pinSubtitle: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 20,
    marginTop: 6
  },
  pinDotsRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 40
  },
  pinDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: "#E5E7EB"
  },
  pinDotFilled: {
    backgroundColor: "#0F9D58"
  },
  keypadContainer: {
    width: "100%",
    paddingHorizontal: 20,
    gap: 14
  },
  keypadRow: {
    flexDirection: "row",
    justifyContent: "space-between"
  },
  keypadKey: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    alignItems: "center",
    justifyContent: "center"
  },
  keyText: {
    fontSize: 24,
    fontWeight: "600",
    color: "#111827"
  },
  keyTextEmoji: {
    fontSize: 22
  },
  forgotPinLink: {
    marginTop: 32
  },
  forgotPinText: {
    fontSize: 14,
    color: "#0F9D58",
    fontWeight: "600"
  },

  // APP FRAME & TAB CONTAINER
  containerApp: {
    flex: 1,
    backgroundColor: "#F9FAFB"
  },
  tabContentLight: {
    flex: 1,
    paddingTop: STATUS_BAR_HEIGHT + 16,
    paddingHorizontal: 20,
    paddingBottom: 95
  },
  subScreenHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    alignItems: "center",
    justifyContent: "center"
  },
  backButtonText: {
    fontSize: 20,
    color: "#111827",
    fontWeight: "bold"
  },
  subScreenTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#111827"
  },
  headerActionButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 8
  },
  headerActionButtonText: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#0F9D58"
  },
  headerActionButtonSave: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#ffffff",
    backgroundColor: "#0F9D58",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6
  },

  // DASHBOARD HEADER USER CARD
  dashboardHeaderUserCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16
  },
  dashboardUserLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1
  },
  dashboardUserAvatarCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(15, 157, 88, 0.08)",
    borderWidth: 1.5,
    borderColor: "#0F9D58",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12
  },
  dashboardUserAvatarText: {
    fontSize: 20
  },
  dashboardUserGreetingsCol: {
    justifyContent: "center",
    flex: 1
  },
  greetingsLabel: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#111827"
  },
  badgeRowFlex: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 2,
    gap: 6,
    flexWrap: "wrap"
  },
  chamaBadgeName: {
    fontSize: 11,
    color: "#6B7280"
  },
  tierHeaderBadgeBadge: {
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 4
  },
  tierHeaderBadgeText: {
    fontSize: 9,
    fontWeight: "bold"
  },
  notificationBellCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    alignItems: "center",
    justifyContent: "center",
    position: "relative"
  },
  notificationBellIcon: {
    fontSize: 18
  },
  notificationCountRedBadge: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#EF4444",
    position: "absolute",
    top: 10,
    right: 11
  },

  // CURRENCY TOGGLE HEADER
  currencyToggleHeaderWrapper: {
    justifyContent: "center",
    marginLeft: 10
  },
  currencyTogglePill: {
    flexDirection: "row",
    backgroundColor: "#E5E7EB",
    borderRadius: 12,
    padding: 2,
    width: 90
  },
  currencyPillHalf: {
    flex: 1,
    paddingVertical: 4,
    alignItems: "center",
    borderRadius: 10
  },
  currencyPillHalfActive: {
    backgroundColor: "#ffffff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    elevation: 1
  },
  currencyPillLabelText: {
    fontSize: 9,
    fontWeight: "700",
    color: "#6B7280"
  },
  currencyPillLabelActiveText: {
    color: "#0F9D58"
  },

  // ANNOUNCEMENTS MARQUEE CARD
  announcementAlertTickerCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFBEB",
    borderWidth: 1,
    borderColor: "#FDE68A",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 16
  },
  announcementIconEmoji: {
    fontSize: 14,
    marginRight: 8
  },
  marqueeScrollBox: {
    flex: 1
  },
  announcementTickerText: {
    fontSize: 11,
    color: "#B45309",
    fontWeight: "600"
  },

  // Savings Big Card
  savingsBigCard: {
    width: "100%",
    backgroundColor: "#ffffff",
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02,
    shadowRadius: 4,
    elevation: 2
  },
  savingsBigCardTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  },
  savingsLabelCol: {
    flex: 1
  },
  savingsCardLabel: {
    fontSize: 12,
    color: "#6B7280",
    fontWeight: "600",
    textTransform: "uppercase"
  },
  savingsCardValue: {
    fontSize: 22,
    fontWeight: "800",
    color: "#111827",
    marginTop: 6
  },
  savingsCardGrowthText: {
    fontSize: 11,
    fontWeight: "bold",
    color: "#0F9D58",
    marginTop: 6
  },
  sparklineContainer: {
    justifyContent: "center",
    alignItems: "center"
  },

  // Stats grid
  quickStatsGridRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16
  },
  quickStatMiniCard: {
    width: "48%",
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 16,
    padding: 16
  },
  quickStatLabel: {
    fontSize: 11,
    color: "#6B7280",
    fontWeight: "500"
  },
  quickStatValue: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#111827",
    marginTop: 4
  },

  // Alerts indicator card
  alertsSplitBox: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 24
  },
  alertIndicatorCard: {
    width: "48%",
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 16,
    padding: 16
  },
  alertCardLabel: {
    fontSize: 10,
    color: "#9CA3AF",
    textTransform: "uppercase",
    fontWeight: "bold"
  },
  alertCardMain: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#111827",
    marginTop: 6
  },
  alertCardSub: {
    fontSize: 11,
    color: "#6B7280",
    marginTop: 2
  },
  scoreRowFlexInline: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 6,
    gap: 6
  },
  alertCardScoreNum: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#111827"
  },
  miniScoreDotIndicatorBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4
  },
  miniScoreDotLabel: {
    fontSize: 9,
    fontWeight: "700"
  },

  // Quick action section
  quickActionsSection: {
    width: "100%",
    marginBottom: 80
  },
  sectionTitleHeader: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#374151",
    marginBottom: 14
  },
  quickActionsGridContainer: {
    flexDirection: "row",
    justifyContent: "space-between"
  },
  quickActionButtonBox: {
    width: "22%",
    alignItems: "center"
  },
  quickActionIconCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.02,
    shadowRadius: 2,
    elevation: 1
  },
  quickActionIconEmoji: {
    fontSize: 22
  },
  quickActionLabelText: {
    fontSize: 11,
    color: "#4B5563",
    fontWeight: "600",
    marginTop: 8
  },

  // BOTTOM TAB BAR
  bottomTabBar: {
    position: "absolute",
    bottom: 0,
    flexDirection: "row",
    backgroundColor: "#ffffff",
    borderTopWidth: 1,
    borderColor: "#E5E7EB",
    paddingBottom: 24,
    paddingTop: 10,
    width: "100%"
  },
  tabBarItem: {
    flex: 1,
    alignItems: "center"
  },
  tabBarIcon: {
    fontSize: 20,
    opacity: 0.4
  },
  tabBarIconActive: {
    opacity: 1,
    fontSize: 23,
    textShadowColor: "rgba(15, 157, 88, 0.6)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8
  },
  tabBarLabel: {
    fontSize: 11,
    color: "#9CA3AF",
    marginTop: 2,
    fontWeight: "500"
  },
  tabBarLabelActive: {
    color: "#0F9D58",
    fontWeight: "700"
  },

  // SCREEN 6: SAVINGS
  monthlyProgressCard: {
    backgroundColor: "#ffffff",
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    marginBottom: 16
  },
  monthlyProgressCardHeader: {
    fontSize: 14,
    fontWeight: "700",
    color: "#374151",
    marginBottom: 16
  },
  monthlyProgressContentSplit: {
    flexDirection: "row",
    alignItems: "center",
    gap: 20
  },
  savingsCircleGaugeBox: {
    alignItems: "center",
    justifyContent: "center"
  },
  savingsCircleTextOverlay: {
    position: "absolute",
    alignItems: "center"
  },
  savingsCirclePercentage: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#111827"
  },
  savingsCircleSub: {
    fontSize: 9,
    color: "#6B7280"
  },
  monthlyProgressStatsCol: {
    flex: 1,
    gap: 10
  },
  progressStatRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10
  },
  progressStatDot: {
    fontSize: 12
  },
  progressStatLabel: {
    fontSize: 10,
    color: "#9CA3AF"
  },
  progressStatVal: {
    fontSize: 13,
    fontWeight: "700",
    color: "#374151",
    marginTop: 1
  },
  recentContributionsSection: {
    marginBottom: 20
  },
  recentContributionsHeader: {
    fontSize: 14,
    fontWeight: "700",
    color: "#374151",
    marginBottom: 12
  },
  recentContributionsCardList: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    padding: 16,
    gap: 14
  },
  contribItemRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  },
  contribLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12
  },
  contribIconSquare: {
    width: 36,
    height: 36,
    backgroundColor: "#F3F4F6",
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center"
  },
  contribIconEmoji: {
    fontSize: 16
  },
  contribDate: {
    fontSize: 13,
    fontWeight: "600",
    color: "#111827"
  },
  contribStatus: {
    fontSize: 10,
    color: "#9CA3AF",
    marginTop: 2
  },
  contribAmount: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#0F9D58"
  },
  buttonForestGreenBigSubmitSavings: {
    width: "100%",
    backgroundColor: "#0F9D58",
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 100
  },

  // SCREEN 7: CONTRIBUTION
  contributionFormCard: {
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 20,
    padding: 20,
    marginBottom: 100
  },
  inputLabelLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: "#6B7280",
    textTransform: "uppercase"
  },
  largeAmountInputBox: {
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1.5,
    borderColor: "#E5E7EB",
    paddingVertical: 10,
    marginTop: 8
  },
  largeAmountTextInput: {
    fontSize: 36,
    fontWeight: "bold",
    color: "#111827",
    flex: 1
  },
  largeAmountCurrency: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#6B7280",
    marginLeft: 10
  },
  quickSelectAmountsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 14
  },
  quickAmtBtn: {
    width: "22%",
    backgroundColor: "#F3F4F6",
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: "center"
  },
  quickAmtBtnActive: {
    backgroundColor: "#0F9D58"
  },
  quickAmtBtnText: {
    fontSize: 13,
    fontWeight: "bold",
    color: "#4B5563"
  },
  quickAmtBtnTextActive: {
    color: "#ffffff"
  },
  paymentMethodOptionCard: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 14,
    padding: 14,
    marginTop: 10
  },
  paymentMethodActiveCard: {
    borderColor: "#0F9D58"
  },
  paymentMethodLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12
  },
  paymentMethodIconBadgeMpesa: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: "rgba(15, 157, 88,0.08)",
    alignItems: "center",
    justifyContent: "center"
  },
  paymentMethodIconBadgeCrypto: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: "rgba(230,126,34,0.08)",
    alignItems: "center",
    justifyContent: "center"
  },
  paymentMethodIconText: {
    fontSize: 18
  },
  paymentMethodLabelCol: {
    justifyContent: "center"
  },
  paymentMethodName: {
    fontSize: 14,
    fontWeight: "700",
    color: "#111827"
  },
  paymentMethodDetails: {
    fontSize: 10,
    color: "#6B7280",
    marginTop: 2
  },
  paymentMethodCheckOutline: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: "#D1D5DB"
  },
  paymentMethodChecked: {
    borderColor: "#0F9D58",
    backgroundColor: "#0F9D58"
  },
  walletBalanceSummaryBox: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 14,
    borderTopWidth: 1,
    borderColor: "#F3F4F6",
    marginTop: 20
  },
  walletBalanceTextSecondary: {
    fontSize: 13,
    color: "#6B7280"
  },
  walletBalanceTextPrimary: {
    fontSize: 13,
    fontWeight: "700",
    color: "#111827"
  },
  buttonForestGreenSubmitContribution: {
    width: "100%",
    backgroundColor: "#0F9D58",
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 16
  },

  // SCREEN 8: LOANS REQUESTS
  loanRequestSegmentContainer: {
    flexDirection: "row",
    backgroundColor: "#E5E7EB",
    borderRadius: 10,
    padding: 3,
    marginBottom: 16
  },
  loanSegmentTab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: "center",
    borderRadius: 8
  },
  loanSegmentTabActive: {
    backgroundColor: "#ffffff"
  },
  loanSegmentTabText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#6B7280"
  },
  loanSegmentTabActiveText: {
    color: "#0F9D58"
  },
  loanRequestFormCard: {
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 20,
    padding: 20,
    marginBottom: 100
  },
  loanInputLabelField: {
    fontSize: 12,
    fontWeight: "700",
    color: "#6B7280",
    marginTop: 14,
    textTransform: "uppercase"
  },
  loanAmountInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1.5,
    borderColor: "#E5E7EB",
    paddingVertical: 4
  },
  loanAmountTextInputField: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#111827",
    flex: 1
  },
  loanAmountCurrencyBadge: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#6B7280"
  },
  loanLimitWarningLabel: {
    fontSize: 10,
    color: "#9CA3AF",
    marginTop: 4
  },
  dropdownSelectorBox: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 6
  },
  purposePillOption: {
    backgroundColor: "#F3F4F6",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E5E7EB"
  },
  purposePillOptionActive: {
    backgroundColor: "rgba(15, 157, 88,0.08)",
    borderColor: "#0F9D58"
  },
  purposePillText: {
    fontSize: 12,
    color: "#4B5563",
    fontWeight: "600"
  },
  purposePillTextActive: {
    color: "#0F9D58"
  },
  estimatedRepaymentBannerBox: {
    backgroundColor: "rgba(15, 157, 88,0.03)",
    borderWidth: 1,
    borderColor: "rgba(15, 157, 88,0.08)",
    borderRadius: 14,
    padding: 16,
    marginTop: 20
  },
  repayEstLabel: {
    fontSize: 11,
    color: "#6B7280"
  },
  repayEstVal: {
    fontSize: 20,
    fontWeight: "800",
    color: "#0F9D58",
    marginTop: 4
  },
  repayEstSub: {
    fontSize: 10,
    color: "#9CA3AF",
    marginTop: 4
  },

  // LOAN LIST
  loanListContainer: {
    gap: 16,
    marginBottom: 100
  },
  groupLoanItemCard: {
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 18,
    padding: 16
  },
  groupLoanCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    borderBottomWidth: 1,
    borderColor: "#F3F4F6",
    paddingBottom: 10
  },
  groupLoanIdLabel: {
    fontSize: 11,
    fontFamily: "monospace",
    color: "#9CA3AF"
  },
  groupLoanBorrower: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#111827",
    marginTop: 2
  },
  loanRepaidStatusBadge: {
    fontSize: 9,
    fontWeight: "bold",
    color: "#9CA3AF",
    backgroundColor: "#F3F4F6",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4
  },
  loanActiveStatusBadge: {
    fontSize: 9,
    fontWeight: "bold",
    color: "#E67E22",
    backgroundColor: "rgba(230,126,34,0.08)",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4
  },
  loanApprovedStatusBadge: {
    fontSize: 9,
    fontWeight: "bold",
    color: "#3B82F6",
    backgroundColor: "rgba(59,130,246,0.08)",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4
  },
  loanVotingStatusBadge: {
    fontSize: 9,
    fontWeight: "bold",
    color: "#0F9D58",
    backgroundColor: "rgba(15, 157, 88,0.08)",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4
  },
  groupLoanMainStatsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 12
  },
  groupLoanStatLabel: {
    fontSize: 9,
    color: "#9CA3AF"
  },
  groupLoanStatValue: {
    fontSize: 13,
    fontWeight: "700",
    color: "#374151",
    marginTop: 2
  },
  consensusVotingBarBoxCombined: {
    backgroundColor: "#F9FAFB",
    padding: 10,
    borderRadius: 10,
    marginTop: 12,
    borderWidth: 1,
    borderColor: "#F3F4F6"
  },
  consensusHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  },
  consensusLabel: {
    fontSize: 11,
    color: "#6B7280"
  },
  consensusVotes: {
    fontSize: 11,
    fontWeight: "bold",
    color: "#111827"
  },
  consensusProgressOuterBar: {
    height: 8,
    backgroundColor: "#E5E7EB",
    borderRadius: 4,
    marginTop: 8,
    overflow: "hidden"
  },
  consensusProgressInnerBar: {
    height: "100%",
    backgroundColor: "#0F9D58",
    borderRadius: 4
  },
  consensusMinRequiredText: {
    fontSize: 9,
    color: "#9CA3AF",
    marginTop: 6
  },
  loanActionsRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 12
  },
  voteYesButton: {
    flex: 1,
    backgroundColor: "rgba(15, 157, 88,0.05)",
    borderWidth: 1,
    borderColor: "rgba(15, 157, 88,0.12)",
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: "center"
  },
  voteYesButtonText: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#0F9D58"
  },
  voteNoButton: {
    flex: 1,
    backgroundColor: "rgba(239,68,68,0.05)",
    borderWidth: 1,
    borderColor: "rgba(239,68,68,0.12)",
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: "center"
  },
  voteNoButtonText: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#EF4444"
  },
  actionLoanDisburseButton: {
    flex: 1,
    backgroundColor: "#0F9D58",
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: "center"
  },
  actionLoanDisburseButtonText: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#ffffff"
  },
  actionLoanRepayButton: {
    flex: 1,
    backgroundColor: "#E67E22",
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: "center"
  },
  actionLoanRepayButtonText: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#ffffff"
  },

  // SCREEN 9: CREDITLOOP SCORE
  scoreGaugeBox: {
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 20
  },
  gaugeTextOverlay: {
    position: "absolute",
    top: 50,
    alignItems: "center",
    width: "80%"
  },
  gaugeScoreNum: {
    fontSize: 48,
    fontWeight: "900",
    color: "#111827"
  },
  gaugeStatusLabel: {
    fontSize: 16,
    fontWeight: "bold",
    marginTop: 4
  },
  gaugeDetailText: {
    fontSize: 10,
    color: "#6B7280",
    textAlign: "center",
    marginTop: 6
  },
  scoreBreakdownCard: {
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 20,
    padding: 16,
    marginBottom: 16
  },
  scoreBreakdownHeader: {
    fontSize: 13,
    fontWeight: "700",
    color: "#6B7280",
    textTransform: "uppercase",
    marginBottom: 12
  },
  scoreBreakdownItemRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderColor: "#F3F4F6"
  },
  scoreBreakdownLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10
  },
  scoreBreakdownIndicator: {
    fontSize: 12
  },
  scoreBreakdownLabel: {
    fontSize: 13,
    color: "#374151"
  },
  scoreBreakdownValue: {
    fontSize: 13,
    fontWeight: "bold",
    color: "#111827"
  },
  qrCodeScannerValidationCard: {
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 20,
    padding: 20,
    alignItems: "center",
    marginBottom: 16
  },
  qrCodeLabelText: {
    fontSize: 11,
    color: "#6B7280",
    marginTop: 12,
    fontWeight: "500"
  },
  howItWorksLink: {
    alignItems: "center",
    marginVertical: 14
  },
  howItWorksLinkText: {
    fontSize: 12,
    color: "#0F9D58",
    fontWeight: "600"
  },

  // SCREEN 10: MORE MENU
  userProfileMenuCard: {
    flexDirection: "row",
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 20,
    padding: 16,
    marginBottom: 16
  },
  userMenuAvatarCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "rgba(15, 157, 88,0.08)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16
  },
  userMenuAvatarText: {
    fontSize: 28
  },
  userMenuMetaCol: {
    flex: 1,
    justifyContent: "center"
  },
  userMenuName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#111827"
  },
  userMenuAddress: {
    fontSize: 11,
    color: "#6B7280",
    fontFamily: "monospace",
    marginTop: 2
  },
  viewProfileBtn: {
    marginTop: 6
  },
  viewProfileBtnText: {
    fontSize: 12,
    color: "#0F9D58",
    fontWeight: "700"
  },
  menuLinksListCard: {
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginBottom: 100
  },
  menuLinkRowItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderColor: "#F3F4F6"
  },
  menuIcon: {
    fontSize: 18,
    marginRight: 14
  },
  menuLabelText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
    flex: 1
  },
  menuChevron: {
    fontSize: 16,
    color: "#D1D5DB"
  },
  menuIconRed: {
    fontSize: 18,
    marginRight: 14
  },
  menuLabelTextRed: {
    fontSize: 14,
    fontWeight: "600",
    color: "#EF4444",
    flex: 1
  },

  // SCREEN 11: PROFILE
  profileAvatarCard: {
    alignItems: "center",
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 20,
    padding: 20,
    marginBottom: 16
  },
  profileBigAvatarCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(15, 157, 88,0.08)",
    borderWidth: 2,
    borderColor: "#0F9D58",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12
  },
  profileBigAvatarText: {
    fontSize: 36
  },
  profileCardName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#111827"
  },
  profileCardAddress: {
    fontSize: 11,
    color: "#6B7280",
    fontFamily: "monospace",
    marginTop: 4
  },
  profileDetailsCard: {
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginBottom: 60
  },
  profileDetailRow: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderColor: "#F3F4F6"
  },
  profileDetailLabel: {
    fontSize: 10,
    color: "#9CA3AF",
    textTransform: "uppercase"
  },
  profileDetailValue: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
    marginTop: 2
  },

  // SCREEN 12: EDIT PROFILE
  formCardLight: {
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 20,
    padding: 20,
    marginBottom: 60
  },
  inputLabelField: {
    fontSize: 12,
    fontWeight: "700",
    color: "#4B5563",
    marginTop: 12
  },
  textInputField: {
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginTop: 6,
    color: "#111827",
    fontSize: 14
  },
  pickerAlternativeRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 8
  },
  pickerOptionButton: {
    flex: 1,
    backgroundColor: "#F3F4F6",
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E5E7EB"
  },
  pickerOptionButtonActive: {
    backgroundColor: "#0F9D58"
  },
  pickerOptionText: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#4B5563"
  },
  pickerOptionTextActive: {
    color: "#ffffff"
  },

  // SCREEN 13: NOTIFICATIONS
  notificationsListContainer: {
    gap: 12,
    marginBottom: 60
  },
  notificationItemCard: {
    flexDirection: "row",
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 16,
    padding: 14,
    gap: 12
  },
  notifIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center"
  },
  notifIconText: {
    fontSize: 18
  },
  notifDetailsCol: {
    flex: 1
  },
  notifHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  },
  notifItemTitle: {
    fontSize: 13,
    fontWeight: "bold",
    color: "#111827"
  },
  notifItemTime: {
    fontSize: 10,
    color: "#9CA3AF"
  },
  notifItemMessage: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 4,
    lineHeight: 16
  },

  // SCREEN 14: TRANSACTIONS LIST
  txFilterTabsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16
  },
  txFilterTabButton: {
    backgroundColor: "#E5E7EB",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14
  },
  txFilterTabButtonActive: {
    backgroundColor: "#0F9D58"
  },
  txFilterTabText: {
    fontSize: 11,
    fontWeight: "bold",
    color: "#4B5563"
  },
  txFilterTabTextActive: {
    color: "#ffffff"
  },
  txListContainer: {
    gap: 12,
    marginBottom: 60
  },
  txItemCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 16,
    padding: 14
  },
  txIconGroup: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12
  },
  txIconBadge: {
    width: 36,
    height: 36,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center"
  },
  txBadgeIncome: {
    backgroundColor: "rgba(15, 157, 88,0.06)"
  },
  txBadgeExpense: {
    backgroundColor: "rgba(239,68,68,0.06)"
  },
  txBadgeEmoji: {
    fontSize: 16
  },
  txInfoGroup: {
    justifyContent: "center"
  },
  txInfoType: {
    fontSize: 13,
    fontWeight: "bold",
    color: "#111827"
  },
  txInfoDate: {
    fontSize: 10,
    color: "#9CA3AF",
    marginTop: 2
  },
  txValueGroup: {
    alignItems: "flex-end"
  },
  txAmountText: {
    fontSize: 13,
    fontWeight: "bold"
  },
  txAmountIncome: {
    color: "#0F9D58"
  },
  txAmountExpense: {
    color: "#EF4444"
  },
  txStatusText: {
    fontSize: 9,
    fontWeight: "bold",
    marginTop: 4
  },
  txStatusSuccess: {
    color: "#0F9D58"
  },
  txStatusPending: {
    color: "#E67E22"
  },

  // SCREEN 15: MEMBERS
  searchBarBox: {
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 16
  },
  searchBarInput: {
    color: "#111827",
    fontSize: 13
  },
  membersListContainer: {
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 20,
    padding: 16,
    gap: 14,
    marginBottom: 60
  },
  memberListItemRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  },
  memberLeftSection: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12
  },
  memberAvatarContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center"
  },
  memberAvatarEmoji: {
    fontSize: 18
  },
  memberInfoCol: {
    justifyContent: "center"
  },
  memberInfoName: {
    fontSize: 13,
    fontWeight: "bold",
    color: "#111827"
  },
  memberInfoHandle: {
    fontSize: 10,
    color: "#9CA3AF",
    marginTop: 1
  },
  memberRightSection: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6
  },
  statusIndicatorDot: {
    width: 6,
    height: 6,
    borderRadius: 3
  },
  statusActiveDot: {
    backgroundColor: "#0F9D58"
  },
  statusInactiveDot: {
    backgroundColor: "#EF4444"
  },
  statusIndicatorText: {
    fontSize: 11,
    fontWeight: "600"
  },
  statusActiveText: {
    color: "#0F9D58"
  },
  statusInactiveText: {
    color: "#EF4444"
  },

  // RETRO USSD SIMULATOR STYLING DETAILS
  ussdPhoneOutlineFrame: {
    flex: 1,
    backgroundColor: "#D1D5DB",
    borderWidth: 8,
    borderColor: "#374151",
    borderRadius: 24,
    padding: 16,
    gap: 16,
    maxHeight: 500,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 5
  },
  ussdScreenDisplayBox: {
    flex: 1,
    backgroundColor: "#000000",
    borderRadius: 12,
    padding: 12,
    justifyContent: "space-between",
    borderWidth: 1.5,
    borderColor: "#9CA3AF"
  },
  ussdHeaderSignalText: {
    fontSize: 10,
    color: "#D1D5DB",
    fontFamily: "monospace",
    borderBottomWidth: 1,
    borderColor: "#374151",
    paddingBottom: 4
  },
  ussdMenuBodyBox: {
    flex: 1,
    marginTop: 10,
    gap: 6
  },
  ussdMenuText: {
    color: "#F59E0B", // Amber retro screen
    fontFamily: "monospace",
    fontSize: 13,
    lineHeight: 18
  },
  ussdPromptInputWrapper: {
    borderTopWidth: 1,
    borderColor: "#374151",
    paddingTop: 8,
    marginTop: 10
  },
  ussdPromptTextInputField: {
    color: "#ffffff",
    fontFamily: "monospace",
    fontSize: 14,
    backgroundColor: "#1F2937",
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 6
  },
  ussdKeysContainerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12
  },
  ussdCancelButton: {
    flex: 1,
    backgroundColor: "#EF4444",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center"
  },
  ussdCancelBtnText: {
    color: "#ffffff",
    fontWeight: "bold",
    fontSize: 13
  },
  ussdSendButton: {
    flex: 1,
    backgroundColor: "#10B981",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center"
  },
  ussdSendBtnText: {
    color: "#ffffff",
    fontWeight: "bold",
    fontSize: 13
  },

  // COMMON LOADER & OVERLAY MODALS
  loadingOverlay: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    zIndex: 999,
    alignItems: "center",
    justifyContent: "center"
  },
  loadingText: {
    color: "#0F9D58",
    fontSize: 14,
    fontWeight: "bold",
    marginTop: 10
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "flex-end"
  },
  metamaskCard: {
    backgroundColor: "#121217",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#1d1d29",
    width: "100%"
  },
  metamaskHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    alignItems: "center"
  },
  metamaskBrand: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#e67e22"
  },
  metamaskNetwork: {
    fontSize: 10,
    color: "#0F9D58",
    fontWeight: "600",
    backgroundColor: "rgba(15, 157, 88,0.1)",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4
  },
  metamaskBody: {
    alignItems: "center",
    width: "100%",
    marginVertical: 24
  },
  metamaskAction: {
    fontSize: 13,
    color: "#9ca3af"
  },
  metamaskAmount: {
    fontSize: 32,
    fontWeight: "800",
    color: "#ffffff",
    marginTop: 8
  },
  metamaskDivider: {
    height: 1,
    backgroundColor: "#181822",
    width: "100%",
    marginVertical: 14
  },
  metaLabel: {
    fontSize: 12,
    color: "#6b7280"
  },
  metaVal: {
    fontSize: 12,
    color: "#ffffff",
    fontWeight: "bold"
  },
  metamaskActions: {
    flexDirection: "row",
    gap: 12,
    width: "100%",
    marginBottom: 10
  },
  metaCancel: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#27273a",
    alignItems: "center"
  },
  metaCancelText: {
    fontSize: 13,
    fontWeight: "bold",
    color: "#9ca3af"
  },
  metaConfirm: {
    flex: 1,
    backgroundColor: "#e67e22",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center"
  },
  metaConfirmText: {
    fontSize: 13,
    fontWeight: "bold",
    color: "#ffffff"
  },
  metamaskRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    paddingVertical: 6
  },

  // STK M-PESA POPUP MODAL STYLING
  stkModalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.75)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20
  },
  stkPushCard: {
    width: "100%",
    maxWidth: 320,
    backgroundColor: "#1F2937", // SIM Dark theme gray
    borderRadius: 20,
    padding: 20,
    borderWidth: 1.5,
    borderColor: "#4B5563"
  },
  stkHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderBottomWidth: 1.5,
    borderColor: "#374151",
    paddingBottom: 10
  },
  stkBrandLabel: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#D1D5DB",
    textTransform: "uppercase"
  },
  stkSafaricomLabel: {
    fontSize: 11,
    fontWeight: "600",
    color: "#10B981"
  },
  stkBodyGroup: {
    alignItems: "center",
    marginVertical: 18
  },
  stkPushMessage: {
    fontSize: 13,
    color: "#9CA3AF",
    textAlign: "center"
  },
  stkPushAmount: {
    fontSize: 24,
    fontWeight: "800",
    color: "#ffffff",
    marginTop: 8
  },
  stkPinDotsContainer: {
    flexDirection: "row",
    gap: 12,
    marginVertical: 14
  },
  stkPinDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#4B5563"
  },
  stkPinDotFilled: {
    backgroundColor: "#10B981"
  },
  stkPinHelperText: {
    fontSize: 10,
    color: "#9CA3AF"
  },
  stkNumpadGrid: {
    gap: 10,
    marginTop: 8
  },
  stkNumpadRow: {
    flexDirection: "row",
    justifyContent: "space-between"
  },
  stkNumKey: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: "#374151",
    alignItems: "center",
    justifyContent: "center"
  },
  stkNumText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#ffffff"
  },
  stkNumTextEmoji: {
    fontSize: 18,
    color: "#9CA3AF"
  },
  stkActionCancelKey: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: "rgba(239,68,68,0.1)",
    alignItems: "center",
    justifyContent: "center"
  },
  stkActionCancelText: {
    color: "#EF4444",
    fontSize: 11,
    fontWeight: "bold"
  },

  // DIGITAL RECEIPT MODAL STYLING
  receiptModalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.7)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24
  },
  receiptCardWrapper: {
    width: "100%",
    backgroundColor: "#ffffff",
    borderRadius: 24,
    padding: 24,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4
  },
  receiptSuccessIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "rgba(15, 157, 88,0.06)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14
  },
  receiptCheckEmoji: {
    fontSize: 32
  },
  receiptAppNameHeader: {
    fontSize: 14,
    color: "#6B7280",
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.5
  },
  receiptBodySection: {
    width: "100%",
    alignItems: "center",
    marginVertical: 18
  },
  receiptAmountTitle: {
    fontSize: 12,
    color: "#9CA3AF"
  },
  receiptAmountVal: {
    fontSize: 30,
    fontWeight: "900",
    color: "#111827",
    marginTop: 6
  },
  receiptStatusTextLabel: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#0F9D58",
    backgroundColor: "rgba(15, 157, 88,0.08)",
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 6,
    marginTop: 8
  },
  receiptDashedSeparator: {
    height: 1.5,
    borderWidth: 1.5,
    borderColor: "#E5E7EB",
    borderStyle: "dashed",
    width: "100%",
    marginVertical: 20
  },
  receiptInfoRowItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    paddingVertical: 8
  },
  receiptInfoLabel: {
    fontSize: 12,
    color: "#6B7280"
  },
  receiptInfoVal: {
    fontSize: 12,
    color: "#111827",
    fontWeight: "600"
  },
  receiptInfoValMonospace: {
    fontSize: 11,
    fontFamily: "monospace",
    color: "#111827",
    fontWeight: "600"
  },
  receiptActionsRow: {
    width: "100%",
    gap: 10,
    marginTop: 6
  },
  receiptShareBtn: {
    width: "100%",
    backgroundColor: "#0F9D58",
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center"
  },
  receiptShareBtnText: {
    color: "#ffffff",
    fontWeight: "bold",
    fontSize: 14
  },
  receiptCloseBtn: {
    width: "100%",
    backgroundColor: "#ffffff",
    borderWidth: 1.5,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center"
  },
  receiptCloseBtnText: {
    color: "#4B5563",
    fontWeight: "bold",
    fontSize: 14
  },

  /* HIGH-CONTRAST TOP BAR */
  topBarContainer: {
    paddingTop: STATUS_BAR_HEIGHT,
    height: 64 + STATUS_BAR_HEIGHT,
    backgroundColor: "#0B251C", // Deep forest green for high contrast
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    borderBottomWidth: 1.5,
    borderBottomColor: "#051A13",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3
  },
  topBarLeft: {
    flexDirection: "row",
    alignItems: "center"
  },
  topBarAvatarBox: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.25)"
  },
  topBarAvatarEmoji: {
    fontSize: 18
  },
  topBarTextCol: {
    justifyContent: "center"
  },
  topBarGreetingText: {
    fontSize: 13,
    fontWeight: "800",
    color: "#ffffff"
  },
  topBarChamaRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 2
  },
  topBarPulseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#10B981",
    marginRight: 4
  },
  topBarChamaText: {
    fontSize: 10,
    color: "#A7F3D0",
    fontWeight: "600"
  },
  topBarRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8
  },
  topBarCurrencyPill: {
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)"
  },
  topBarCurrencyText: {
    fontSize: 10,
    fontWeight: "800",
    color: "#ffffff"
  },
  topBarIconBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    alignItems: "center",
    justifyContent: "center",
    position: "relative"
  },
  topBarIconEmoji: {
    fontSize: 16
  },
  topBarRedBadge: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#EF4444",
    position: "absolute",
    top: 8,
    right: 8
  },

  /* SKELETON LOADER */
  skeletonContainer: {
    flex: 1,
    padding: 16,
    backgroundColor: "#F9FAFB",
    gap: 16
  },
  skeletonTopBar: {
    height: 50,
    backgroundColor: "#E5E7EB",
    borderRadius: 12
  },
  skeletonSummaryCard: {
    height: 140,
    backgroundColor: "#E5E7EB",
    borderRadius: 20
  },
  skeletonGridRow: {
    flexDirection: "row",
    gap: 12
  },
  skeletonGridItem: {
    flex: 1,
    height: 70,
    backgroundColor: "#E5E7EB",
    borderRadius: 16
  },
  skeletonTitle: {
    width: 140,
    height: 16,
    backgroundColor: "#E5E7EB",
    borderRadius: 4,
    marginTop: 8
  },
  skeletonTrackerCard: {
    height: 110,
    backgroundColor: "#E5E7EB",
    borderRadius: 20
  },

  /* NEW HOME DASHBOARD COMPONENTS */
  summaryCardForestGreen: {
    backgroundColor: "#005A3C", // Deep forest green base
    borderRadius: 20,
    padding: 18,
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3
  },
  summaryCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start"
  },
  summaryCardLabel: {
    fontSize: 11,
    color: "#A7F3D0",
    fontWeight: "700",
    textTransform: "uppercase"
  },
  summaryCardValue: {
    fontSize: 24,
    fontWeight: "900",
    color: "#ffffff",
    marginTop: 4
  },
  summaryGrowthBadge: {
    backgroundColor: "rgba(16, 185, 129, 0.2)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "rgba(16, 185, 129, 0.3)"
  },
  summaryGrowthText: {
    fontSize: 10,
    fontWeight: "800",
    color: "#34D399"
  },
  summaryCardDivider: {
    height: 1,
    backgroundColor: "rgba(255, 255, 255, 0.12)",
    marginVertical: 14
  },
  summaryCardDetailsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  },
  summaryDetailCol: {
    flex: 1
  },
  summaryDetailColAlignEnd: {
    flex: 1.2,
    alignItems: "flex-end"
  },
  summaryDetailLabel: {
    fontSize: 9,
    color: "#A7F3D0",
    fontWeight: "600"
  },
  summaryDetailValue: {
    fontSize: 13,
    fontWeight: "800",
    color: "#ffffff",
    marginTop: 2
  },
  summaryProgressContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 4
  },
  summaryProgressBarBg: {
    width: 44,
    height: 4,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 2
  },
  summaryProgressBarFill: {
    height: "100%",
    backgroundColor: "#34D399",
    borderRadius: 2
  },
  summaryProgressText: {
    fontSize: 9,
    fontWeight: "800",
    color: "#ffffff"
  },
  summaryStatusBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(52, 211, 153, 0.15)",
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 6,
    marginTop: 2
  },
  summaryStatusPulse: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#34D399",
    marginRight: 4
  },
  summaryStatusText: {
    fontSize: 8,
    fontWeight: "900",
    color: "#34D399"
  },

  /* QUICK ACTIONS GRID */
  quickActionsContainer: {
    marginHorizontal: 16,
    marginBottom: 16
  },
  homeSectionTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: "#1E293B",
    marginBottom: 10,
    textTransform: "uppercase",
    letterSpacing: 0.5
  },
  quickActionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 10
  },
  quickActionCard: {
    width: "48%", // 2 columns
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 12,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.02,
    shadowRadius: 2,
    elevation: 1
  },
  actionIconWrapper: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10
  },
  actionIconEmoji: {
    fontSize: 18
  },
  actionTextCol: {
    flex: 1
  },
  actionTitle: {
    fontSize: 12,
    fontWeight: "800",
    color: "#1E293B"
  },
  actionSubtitle: {
    fontSize: 9,
    color: "#64748B",
    marginTop: 1
  },

  /* CREDITLOOP METER */
  creditLoopCard: {
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 20,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 16
  },
  creditScoreContentBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16
  },
  creditMeterWrapper: {
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    width: 120
  },
  creditScoreOverlayLabel: {
    position: "absolute",
    top: 35,
    alignItems: "center"
  },
  creditScoreScoreVal: {
    fontSize: 20,
    fontWeight: "900",
    color: "#1E293B"
  },
  creditScoreTierBadgeText: {
    fontSize: 9,
    fontWeight: "800",
    textTransform: "uppercase"
  },
  creditScoreDetailsCol: {
    flex: 1,
    justifyContent: "center"
  },
  scoreLevelRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4
  },
  scoreRatingLabel: {
    fontSize: 11,
    color: "#64748B",
    fontWeight: "600"
  },
  scoreRatingValue: {
    fontSize: 11,
    fontWeight: "800"
  },
  scoreTrendRow: {
    backgroundColor: "#ECFDF5",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    alignSelf: "flex-start",
    marginTop: 4,
    borderWidth: 0.5,
    borderColor: "#A7F3D0"
  },
  scoreTrendText: {
    fontSize: 9,
    color: "#059669",
    fontWeight: "800"
  },
  scoreTipMessage: {
    fontSize: 9,
    color: "#475569",
    marginTop: 6,
    lineHeight: 13,
    fontStyle: "italic"
  },

  /* TRACKER & WARNINGS */
  trackerContainer: {
    marginHorizontal: 16,
    marginBottom: 16
  },
  trackerCard: {
    backgroundColor: "#ffffff",
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: "#E2E8F0",
    padding: 16
  },
  trackerOverdueCard: {
    borderColor: "#FCA5A5",
    backgroundColor: "#FEF2F2"
  },
  trackerHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start"
  },
  trackerTitleCol: {
    flex: 1
  },
  trackerCardLabel: {
    fontSize: 10,
    fontWeight: "800",
    color: "#64748B",
    letterSpacing: 0.5
  },
  trackerAmount: {
    fontSize: 18,
    fontWeight: "900",
    color: "#1E293B",
    marginTop: 2
  },
  onTimeBadge: {
    backgroundColor: "#ECFDF5",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 0.5,
    borderColor: "#A7F3D0"
  },
  onTimeBadgeText: {
    fontSize: 9,
    fontWeight: "800",
    color: "#059669"
  },
  warningBadge: {
    backgroundColor: "#FEF2F2",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#EF4444"
  },
  warningBadgeText: {
    fontSize: 9,
    fontWeight: "900",
    color: "#DC2626"
  },
  trackerDueDateText: {
    fontSize: 11,
    color: "#475569",
    fontWeight: "600",
    marginTop: 10
  },
  trackerProgressBarBg: {
    height: 6,
    backgroundColor: "#E2E8F0",
    borderRadius: 3,
    marginVertical: 10
  },
  trackerProgressBarFill: {
    height: "100%",
    backgroundColor: "#0F9D58",
    borderRadius: 3
  },
  trackerStatusDescText: {
    fontSize: 10,
    fontWeight: "600",
    color: "#64748B"
  },

  /* ACTIVE LOAN OVERVIEW */
  activeLoanContainer: {
    marginHorizontal: 16,
    marginBottom: 16
  },
  loanStatusCard: {
    backgroundColor: "#ffffff",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    padding: 16
  },
  loanHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start"
  },
  loanCardLabel: {
    fontSize: 9,
    fontWeight: "800",
    color: "#64748B"
  },
  loanBalanceText: {
    fontSize: 18,
    fontWeight: "900",
    color: "#1E293B",
    marginTop: 2
  },
  loanRepayProgressBadge: {
    backgroundColor: "#EFF6FF",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 0.5,
    borderColor: "#BFDBFE"
  },
  loanRepayProgressText: {
    fontSize: 9,
    fontWeight: "800",
    color: "#2563EB"
  },
  loanDueDateText: {
    fontSize: 11,
    color: "#475569",
    fontWeight: "600",
    marginTop: 8
  },
  loanProgressBarOuter: {
    height: 6,
    backgroundColor: "#E2E8F0",
    borderRadius: 3,
    marginVertical: 10
  },
  loanProgressBarInner: {
    height: "100%",
    backgroundColor: "#2563EB",
    borderRadius: 3
  },
  loanActionsRowDashboard: {
    marginTop: 4
  },
  loanDashboardRepayBtn: {
    backgroundColor: "#2563EB",
    borderRadius: 10,
    paddingVertical: 8,
    alignItems: "center"
  },
  loanDashboardRepayBtnText: {
    color: "#ffffff",
    fontWeight: "800",
    fontSize: 11
  },
  noLoanStatusCard: {
    backgroundColor: "#ffffff",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    padding: 16,
    alignItems: "center"
  },
  noLoanCardHeader: {
    fontSize: 14,
    fontWeight: "800",
    color: "#1E293B"
  },
  noLoanCardMessage: {
    fontSize: 11,
    color: "#475569",
    textAlign: "center",
    marginTop: 6,
    lineHeight: 16
  },
  noLoanCardActionBtn: {
    backgroundColor: "#0F9D58",
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginTop: 12
  },
  noLoanCardActionBtnText: {
    color: "#ffffff",
    fontSize: 11,
    fontWeight: "800"
  },

  /* SAVINGS GOAL PROGRESS CARD */
  goalContainer: {
    marginHorizontal: 16,
    marginBottom: 16
  },
  goalCard: {
    backgroundColor: "#ffffff",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    padding: 16
  },
  goalTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  },
  goalTitleCol: {
    flex: 1,
    marginRight: 10
  },
  goalHeaderTitle: {
    fontSize: 13,
    fontWeight: "800",
    color: "#1E293B"
  },
  goalStatsText: {
    fontSize: 15,
    fontWeight: "900",
    color: "#0F9D58",
    marginTop: 4
  },
  goalBottomRow: {
    marginTop: 10,
    borderTopWidth: 0.5,
    borderTopColor: "#E2E8F0",
    paddingTop: 8
  },
  goalDeadlineText: {
    fontSize: 10,
    color: "#64748B",
    fontWeight: "600"
  },
  goalMotivationalText: {
    fontSize: 10,
    fontWeight: "800",
    color: "#047857",
    marginTop: 4
  },

  /* RECENT ACTIVITIES */
  activityFeedContainer: {
    marginHorizontal: 16,
    marginBottom: 16
  },
  sectionHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10
  },
  viewAllTextLink: {
    fontSize: 11,
    color: "#0F9D58",
    fontWeight: "700"
  },
  activityListCard: {
    backgroundColor: "#ffffff",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    padding: 10
  },
  activityItemRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 0.5,
    borderBottomColor: "#F1F5F9"
  },
  activityIconBadge: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: "#F1F5F9",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10
  },
  activityEmoji: {
    fontSize: 16
  },
  activityItemDetails: {
    flex: 1
  },
  activityTitle: {
    fontSize: 12,
    fontWeight: "800",
    color: "#1E293B"
  },
  activityDate: {
    fontSize: 9,
    color: "#64748B",
    marginTop: 1
  },
  activityAmountCol: {
    alignItems: "flex-end"
  },
  activityAmountVal: {
    fontSize: 12,
    fontWeight: "800"
  },
  activityStatus: {
    fontSize: 8,
    color: "#64748B",
    marginTop: 1,
    textTransform: "uppercase",
    fontWeight: "700"
  },

  /* CHAMA CIRCLE HUB */
  groupInfoContainer: {
    marginHorizontal: 16,
    marginBottom: 16
  },
  groupInfoCard: {
    backgroundColor: "#ffffff",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    padding: 16
  },
  groupInfoStatRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  },
  groupStatBox: {
    alignItems: "center",
    flex: 1
  },
  groupStatEmoji: {
    fontSize: 20
  },
  groupStatVal: {
    fontSize: 11,
    fontWeight: "800",
    color: "#1E293B",
    marginTop: 4
  },
  groupStatSub: {
    fontSize: 8,
    color: "#64748B",
    marginTop: 1
  },
  groupAnnouncementTicker: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFBEB",
    borderWidth: 0.5,
    borderColor: "#FDE68A",
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 6,
    marginTop: 12,
    gap: 8
  },
  announcementEmoji: {
    fontSize: 12
  },
  announcementTextTitle: {
    fontSize: 10,
    color: "#B45309",
    fontWeight: "700"
  },

  /* WALLET OVERVIEW WIDGET */
  walletWidgetContainer: {
    marginHorizontal: 16,
    marginBottom: 16
  },
  walletWidgetCard: {
    backgroundColor: "#ffffff",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    padding: 16
  },
  walletWidgetHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  },
  walletWidgetProviderText: {
    fontSize: 12,
    fontWeight: "800",
    color: "#1E293B"
  },
  walletWidgetStatusBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ECFDF5",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6
  },
  walletWidgetPulseDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#10B981",
    marginRight: 4
  },
  walletWidgetStatusLabel: {
    fontSize: 8,
    fontWeight: "800",
    color: "#059669"
  },
  walletWidgetAddressBox: {
    backgroundColor: "#F8FAFC",
    borderRadius: 10,
    padding: 8,
    marginVertical: 10,
    borderWidth: 0.5,
    borderColor: "#E2E8F0"
  },
  walletWidgetAddressText: {
    fontSize: 10,
    fontFamily: "monospace",
    color: "#475569",
    textAlign: "center"
  },
  walletWidgetDetailsRow: {
    flexDirection: "row",
    justifyContent: "space-between"
  },
  walletWidgetLabel: {
    fontSize: 10,
    color: "#64748B",
    fontWeight: "600"
  },
  walletWidgetValue: {
    color: "#1E293B",
    fontWeight: "700"
  },

  /* QR SCANNER SIMULATOR OVERLAY */
  qrScannerOverlay: {
    flex: 1,
    backgroundColor: "#0F172A"
  },
  qrScannerHeader: {
    height: 60,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#1E293B"
  },
  qrScannerTitle: {
    color: "#ffffff",
    fontWeight: "800",
    fontSize: 15
  },
  qrScannerCloseBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "#1E293B",
    alignItems: "center",
    justifyContent: "center"
  },
  qrScannerCloseBtnText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "bold"
  },
  qrScannerBoxContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center"
  },
  qrScannerFinderFrame: {
    width: 220,
    height: 220,
    borderWidth: 3,
    borderColor: "#0F9D58",
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    position: "relative"
  },
  qrScannerLaserLine: {
    width: "90%",
    height: 2,
    backgroundColor: "#10B981",
    position: "absolute",
    top: "50%"
  },
  qrScannerInstruction: {
    color: "#94A3B8",
    fontSize: 11,
    marginTop: 20,
    textAlign: "center",
    paddingHorizontal: 30,
    fontWeight: "600"
  },
  qrScannerFooter: {
    padding: 30,
    alignItems: "center"
  },
  qrScannerSimulateBtn: {
    backgroundColor: "#0F9D58",
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    width: "100%",
    alignItems: "center"
  },
  qrScannerSimulateBtnText: {
    color: "#ffffff",
    fontWeight: "800",
    fontSize: 14
  },

  /* COMMON HELPERS */
  textGreen: {
    color: "#0F9D58"
  },
  textRed: {
    color: "#EF4444"
  },

  /* NEW SAVINGS PAGE STYLES */
  savingsOnTrackBadge: {
    backgroundColor: "rgba(16, 185, 129, 0.15)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 0.5,
    borderColor: "#10B981"
  },
  savingsOnTrackBadgeText: {
    fontSize: 9,
    fontWeight: "800",
    color: "#059669"
  },
  savingsTrackerCard: {
    backgroundColor: "#ffffff",
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: "#E2E8F0",
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 16
  },
  savingsProgressTitle: {
    fontSize: 13,
    fontWeight: "800",
    color: "#1E293B"
  },
  savingsProgressDeadline: {
    fontSize: 10,
    color: "#64748B",
    marginTop: 2
  },
  savingsTargetLabel: {
    fontSize: 13,
    fontWeight: "900",
    color: "#0F9D58"
  },
  savingsProgressDetailsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 10
  },
  savingsProgressStatusText: {
    fontSize: 10,
    fontWeight: "600",
    color: "#64748B"
  },
  savingsQuickContributeBtn: {
    backgroundColor: "#0F9D58",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6
  },
  savingsQuickContributeBtnText: {
    color: "#ffffff",
    fontSize: 10,
    fontWeight: "800"
  },
  savingsGoalsContainer: {
    marginHorizontal: 16,
    marginBottom: 16
  },
  savingsSectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10
  },
  savingsSectionTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: "#1E293B",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 8
  },
  savingsAddGoalBtn: {
    backgroundColor: "rgba(15, 157, 88, 0.08)",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderWidth: 0.5,
    borderColor: "#0F9D58"
  },
  savingsAddGoalBtnText: {
    color: "#0F9D58",
    fontSize: 10,
    fontWeight: "800"
  },
  savingsGoalItemRow: {
    flexDirection: "row",
    backgroundColor: "#ffffff",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    padding: 14,
    marginBottom: 10,
    alignItems: "center"
  },
  savingsGoalIconCol: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "rgba(15, 157, 88, 0.06)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12
  },
  savingsGoalIconEmoji: {
    fontSize: 20
  },
  savingsGoalInfoCol: {
    flex: 1
  },
  savingsGoalTitleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  },
  savingsGoalTitle: {
    fontSize: 12,
    fontWeight: "800",
    color: "#1E293B"
  },
  savingsGoalPercentage: {
    fontSize: 12,
    fontWeight: "800",
    color: "#0F9D58"
  },
  savingsGoalProgressWrapper: {
    height: 5,
    backgroundColor: "#E2E8F0",
    borderRadius: 2.5,
    marginVertical: 8
  },
  savingsGoalProgressBarBg: {
    height: "100%",
    backgroundColor: "#E2E8F0",
    borderRadius: 2.5
  },
  savingsGoalProgressBarFill: {
    height: "100%",
    backgroundColor: "#0F9D58",
    borderRadius: 2.5
  },
  savingsGoalStatsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  },
  savingsGoalAmountLabel: {
    fontSize: 10,
    color: "#64748B",
    fontWeight: "600"
  },
  savingsGoalDeadline: {
    fontSize: 9,
    color: "#94A3B8"
  },
  savingsAnalyticsContainer: {
    marginHorizontal: 16,
    marginBottom: 16
  },
  savingsAnalyticsChartCard: {
    backgroundColor: "#ffffff",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    padding: 16
  },
  chartTitleLabel: {
    fontSize: 11,
    color: "#64748B",
    fontWeight: "700"
  },
  chartMonthsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    marginTop: 6
  },
  chartMonthLabel: {
    fontSize: 9,
    color: "#64748B",
    fontWeight: "700",
    width: 30,
    textAlign: "center"
  },
  chartInsightsBox: {
    backgroundColor: "#ECFDF5",
    borderWidth: 0.5,
    borderColor: "#A7F3D0",
    borderRadius: 10,
    padding: 10,
    marginTop: 12
  },
  chartInsightsText: {
    fontSize: 10,
    color: "#047857",
    lineHeight: 14,
    fontWeight: "600"
  },
  communalSavingsContainer: {
    marginHorizontal: 16,
    marginBottom: 16
  },
  communalSavingsCard: {
    backgroundColor: "#ffffff",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    padding: 16
  },
  communalRankHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  },
  communalRankSub: {
    fontSize: 11,
    color: "#64748B",
    fontWeight: "600"
  },
  communalRankVal: {
    fontSize: 15,
    fontWeight: "900",
    color: "#0F9D58"
  },
  communalDivider: {
    height: 0.5,
    backgroundColor: "#E2E8F0",
    marginVertical: 12
  },
  rankListWrapper: {
    gap: 8
  },
  rankItemRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 6,
    borderRadius: 8,
    paddingHorizontal: 8
  },
  rankItemRowActive: {
    backgroundColor: "rgba(15, 157, 88, 0.05)"
  },
  rankNumText: {
    fontSize: 11,
    width: 20,
    color: "#64748B",
    fontWeight: "700"
  },
  rankEmojiText: {
    fontSize: 16,
    marginRight: 10
  },
  rankNameText: {
    fontSize: 11,
    color: "#1E293B",
    flex: 1
  },
  rankValText: {
    fontSize: 11,
    color: "#1E293B",
    fontWeight: "700"
  },
  rewardsContainer: {
    marginHorizontal: 16,
    marginBottom: 16
  },
  rewardsGrid: {
    flexDirection: "row",
    justifyContent: "space-between"
  },
  rewardBadgeCard: {
    width: "31%",
    backgroundColor: "#ffffff",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    padding: 10,
    alignItems: "center"
  },
  rewardEmoji: {
    fontSize: 22
  },
  rewardTitle: {
    fontSize: 10,
    fontWeight: "800",
    color: "#1E293B",
    marginTop: 4,
    textAlign: "center"
  },
  rewardDesc: {
    fontSize: 8,
    color: "#64748B",
    textAlign: "center",
    marginTop: 2
  },
  historyContainer: {
    marginHorizontal: 16,
    marginBottom: 16
  },
  historyFilterScrollPills: {
    flexDirection: "row"
  },
  filterGroupPillRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6
  },
  filterTitleLabel: {
    fontSize: 10,
    fontWeight: "700",
    color: "#64748B",
    marginRight: 4
  },
  filterPill: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    backgroundColor: "#F1F5F9",
    borderWidth: 0.5,
    borderColor: "#CBD5E1"
  },
  filterPillActive: {
    backgroundColor: "#0F9D58",
    borderColor: "#0F9D58"
  },
  filterPillText: {
    fontSize: 9,
    fontWeight: "700",
    color: "#64748B"
  },
  filterPillTextActive: {
    color: "#ffffff"
  },
  historyCardList: {
    backgroundColor: "#ffffff",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    padding: 10,
    marginTop: 12
  },
  historyEmptyStateBox: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 20
  },
  emptyStateEmoji: {
    fontSize: 28
  },
  emptyStateText: {
    fontSize: 10,
    color: "#64748B",
    fontWeight: "600",
    marginTop: 6
  },
  contribHistoryItemRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 0.5,
    borderBottomColor: "#F1F5F9"
  },
  contribHistoryLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1
  },
  contribHistoryIconWrapper: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: "#F1F5F9",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10
  },
  contribHistoryEmoji: {
    fontSize: 16
  },
  contribHistoryDate: {
    fontSize: 11,
    fontWeight: "800",
    color: "#1E293B"
  },
  contribHistoryRef: {
    fontSize: 8,
    color: "#94A3B8",
    marginTop: 1
  },
  contribHistoryRight: {
    alignItems: "flex-end",
    gap: 4
  },
  contribHistoryAmount: {
    fontSize: 11,
    fontWeight: "800",
    color: "#1E293B"
  },
  historyReceiptBtn: {
    backgroundColor: "rgba(15, 157, 88, 0.08)",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6
  },
  historyReceiptBtnText: {
    color: "#0F9D58",
    fontSize: 8,
    fontWeight: "800"
  },
  goalAddCardWrapper: {
    width: "90%",
    backgroundColor: "#ffffff",
    borderRadius: 24,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4
  },
  goalAddHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomWidth: 0.5,
    borderBottomColor: "#E2E8F0",
    paddingBottom: 12
  },
  goalAddHeaderTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: "#1E293B"
  },
  goalAddCloseBtn: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: "#F1F5F9",
    alignItems: "center",
    justifyContent: "center"
  },
  goalAddCloseBtnText: {
    color: "#64748B",
    fontSize: 10,
    fontWeight: "bold"
  },
  goalAddFormCardBody: {
    marginTop: 14
  },
  goalAddFormLabel: {
    fontSize: 10,
    fontWeight: "800",
    color: "#64748B",
    marginTop: 10,
    textTransform: "uppercase"
  },
  goalAddFormInput: {
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginTop: 4,
    color: "#1E293B",
    fontSize: 11
  },
  badgeSelectorRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 6
  },
  badgeSelectorPillOption: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#F1F5F9",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#E2E8F0"
  },
  badgeSelectorPillOptionActive: {
    backgroundColor: "#D1FAE5",
    borderColor: "#34D399"
  },
  badgeSelectorEmojiText: {
    fontSize: 16
  },
  goalAddSubmitBtn: {
    backgroundColor: "#0F9D58",
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: "center",
    marginTop: 16
  },
  goalAddSubmitBtnText: {
    color: "#ffffff",
    fontWeight: "800",
    fontSize: 12
  },

  // LOAN PAGE UPGRADE STYLES
  loanOverviewCard: {
    backgroundColor: "#0F172A",
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4
  },
  loanOverviewTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  },
  loanOverviewLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: "#94A3B8",
    textTransform: "uppercase",
    letterSpacing: 0.5
  },
  loanOverviewValue: {
    fontSize: 26,
    fontWeight: "800",
    color: "#F8FAFC",
    marginTop: 6
  },
  loanIndicatorBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12
  },
  loanIndicatorBadgeText: {
    fontSize: 12,
    fontWeight: "800"
  },
  loanOverviewSeparator: {
    height: 1,
    backgroundColor: "#334155",
    marginVertical: 16
  },
  loanOverviewStatsGrid: {
    flexDirection: "row",
    justifyContent: "space-between"
  },
  loanOverviewStatCol: {
    flex: 1
  },
  loanOverviewStatLabel: {
    fontSize: 10,
    fontWeight: "600",
    color: "#94A3B8"
  },
  loanOverviewStatValue: {
    fontSize: 14,
    fontWeight: "700",
    color: "#E2E8F0",
    marginTop: 4
  },
  loanRequestBtnPrimary: {
    backgroundColor: "#0F9D58",
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16
  },
  loanRequestBtnPrimaryText: {
    fontSize: 15,
    fontWeight: "800",
    color: "#ffffff"
  },
  loanActiveStatusCard: {
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 20,
    padding: 20,
    marginBottom: 16
  },
  loanActiveHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16
  },
  loanActiveTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: "#1E293B"
  },
  loanActiveStatsGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
    backgroundColor: "#F8FAFC",
    padding: 12,
    borderRadius: 12
  },
  loanActiveStatItem: {
    flex: 1
  },
  loanActiveStatLabel: {
    fontSize: 9,
    fontWeight: "700",
    color: "#64748B",
    textTransform: "uppercase"
  },
  loanActiveStatValue: {
    fontSize: 13,
    fontWeight: "700",
    color: "#334155",
    marginTop: 4
  },
  repaymentTrackerBox: {
    marginBottom: 16
  },
  repaymentTrackerHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6
  },
  repaymentTrackerLabel: {
    fontSize: 11,
    fontWeight: "600",
    color: "#64748B"
  },
  repaymentTrackerPercent: {
    fontSize: 11,
    fontWeight: "700",
    color: "#0F9D58"
  },
  repaymentProgressOuterBar: {
    height: 8,
    backgroundColor: "#E2E8F0",
    borderRadius: 4,
    marginBottom: 8
  },
  repaymentProgressInnerBar: {
    height: "100%",
    backgroundColor: "#0F9D58",
    borderRadius: 4
  },
  repaymentTrackerRemaining: {
    fontSize: 11,
    color: "#64748B"
  },
  nextRepayReminderBox: {
    flexDirection: "row",
    backgroundColor: "#EEF2F6",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 12,
    padding: 12,
    marginBottom: 16
  },
  repayReminderLabel: {
    fontSize: 10,
    fontWeight: "600",
    color: "#64748B"
  },
  repayReminderDate: {
    fontSize: 13,
    fontWeight: "700",
    color: "#1E293B",
    marginTop: 2
  },
  repayReminderAmountLabel: {
    fontSize: 10,
    fontWeight: "600",
    color: "#64748B"
  },
  repayReminderAmount: {
    fontSize: 14,
    fontWeight: "800",
    color: "#EF4444",
    marginTop: 2
  },
  quickRepayModuleBox: {
    backgroundColor: "#F8FAFC",
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0"
  },
  quickRepayTitle: {
    fontSize: 11,
    fontWeight: "700",
    color: "#64748B",
    textTransform: "uppercase",
    marginBottom: 8
  },
  quickRepayBtnRow: {
    flexDirection: "row",
    gap: 8
  },
  quickRepayMpesaBtn: {
    flex: 1,
    backgroundColor: "#E0F2FE",
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#BAE6FD"
  },
  quickRepayMpesaText: {
    fontSize: 11,
    fontWeight: "800",
    color: "#0369A1"
  },
  quickRepayWalletBtn: {
    flex: 1,
    backgroundColor: "#FFF3E0",
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#FFE0B2"
  },
  quickRepayWalletText: {
    fontSize: 11,
    fontWeight: "800",
    color: "#E65100"
  },
  loanActiveEmptyCard: {
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 20,
    padding: 24,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16
  },
  loanEmptyEmoji: {
    fontSize: 40,
    marginBottom: 12
  },
  loanEmptyTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: "#1E293B",
    marginBottom: 6
  },
  loanEmptyDesc: {
    fontSize: 12,
    color: "#64748B",
    textAlign: "center",
    lineHeight: 18,
    paddingHorizontal: 16
  },
  eligibilityFactorsCard: {
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 20,
    padding: 16,
    marginBottom: 16
  },
  eligibilityFactorsTitle: {
    fontSize: 13,
    fontWeight: "800",
    color: "#1E293B",
    marginBottom: 12
  },
  eligibilityFactorItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9"
  },
  factorDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#0F9D58",
    marginRight: 10
  },
  factorLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: "#334155"
  },
  factorDesc: {
    fontSize: 9,
    color: "#64748B",
    marginTop: 2
  },
  factorStatusOk: {
    fontSize: 10,
    fontWeight: "700",
    color: "#0F9D58",
    backgroundColor: "#D1FAE5",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4
  },
  consensusVotingSectionCard: {
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 20,
    padding: 16,
    marginBottom: 16
  },
  consensusSectionTitle: {
    fontSize: 13,
    fontWeight: "800",
    color: "#1E293B",
    marginBottom: 12
  },
  consensusEmptyText: {
    fontSize: 11,
    color: "#64748B",
    fontStyle: "italic",
    textAlign: "center",
    paddingVertical: 10
  },
  consensusProposalCard: {
    backgroundColor: "#F8FAFC",
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    marginBottom: 10
  },
  proposalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12
  },
  proposalBorrower: {
    fontSize: 12,
    fontWeight: "700",
    color: "#1E293B"
  },
  proposalMeta: {
    fontSize: 10,
    color: "#64748B",
    marginTop: 2
  },
  proposalAmount: {
    fontSize: 13,
    fontWeight: "800",
    color: "#0F9D58"
  },
  consensusProgressBarRow: {
    marginBottom: 12
  },
  proposalVoteActionsRow: {
    flexDirection: "row",
    gap: 8
  },
  loanHistoryContainer: {
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 20,
    padding: 16,
    marginBottom: 16
  },
  loanHistoryTitle: {
    fontSize: 13,
    fontWeight: "800",
    color: "#1E293B",
    marginBottom: 12
  },
  historyFilterScrollPills: {
    flexDirection: "row",
    marginBottom: 12
  },
  historyFilterPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: "#F1F5F9",
    marginRight: 6,
    borderWidth: 1,
    borderColor: "#E2E8F0"
  },
  historyFilterPillActive: {
    backgroundColor: "#0F9D58",
    borderColor: "#0F9D58"
  },
  historyFilterPillText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#64748B"
  },
  historyFilterPillActiveText: {
    color: "#ffffff"
  },
  historyEmptyText: {
    fontSize: 11,
    color: "#64748B",
    textAlign: "center",
    paddingVertical: 20
  },
  historyLoanRowItem: {
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
    paddingVertical: 12
  },
  historyRowTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  },
  historyLoanPurpose: {
    fontSize: 12,
    fontWeight: "700",
    color: "#1E293B"
  },
  historyLoanBorrower: {
    fontSize: 10,
    color: "#64748B",
    marginTop: 2
  },
  historyRowBottom: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 8
  },
  historyLoanAmount: {
    fontSize: 13,
    fontWeight: "700",
    color: "#334155"
  },
  historyLoanRate: {
    fontSize: 10,
    color: "#94A3B8"
  },
  historyDisburseActionBtn: {
    backgroundColor: "#0F9D58",
    borderRadius: 8,
    paddingVertical: 6,
    alignItems: "center",
    marginTop: 10
  },
  historyDisburseActionBtnText: {
    fontSize: 11,
    fontWeight: "800",
    color: "#ffffff"
  },
  creditImpactInfoCard: {
    backgroundColor: "#EEF2F6",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0"
  },
  creditImpactTitle: {
    fontSize: 12,
    fontWeight: "800",
    color: "#334155",
    marginBottom: 6
  },
  creditImpactDesc: {
    fontSize: 11,
    color: "#64748B",
    lineHeight: 16
  },
  tipsSectionContainer: {
    marginBottom: 20
  },
  tipsSectionTitle: {
    fontSize: 13,
    fontWeight: "800",
    color: "#1E293B",
    marginBottom: 10
  },
  tipsScrollContainer: {
    flexDirection: "row"
  },
  tipCardItem: {
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 14,
    padding: 12,
    width: 180,
    marginRight: 10
  },
  tipCardEmoji: {
    fontSize: 20,
    marginBottom: 6
  },
  tipCardTitle: {
    fontSize: 11,
    fontWeight: "700",
    color: "#1E293B"
  },
  tipCardBody: {
    fontSize: 9,
    color: "#64748B",
    marginTop: 4,
    lineHeight: 12
  },
  loanModalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end"
  },
  loanModalCard: {
    backgroundColor: "#ffffff",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    maxHeight: "85%"
  },
  loanModalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
    paddingBottom: 12,
    marginBottom: 16
  },
  loanModalTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#1E293B"
  },
  loanModalCloseBtn: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: "#F1F5F9",
    alignItems: "center",
    justifyContent: "center"
  },
  loanModalCloseBtnText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#64748B"
  },
  loanModalBody: {
    paddingBottom: 20
  },
  loanLimitErrorLabel: {
    fontSize: 10,
    fontWeight: "700",
    color: "#EF4444",
    marginTop: 4
  },

  // SCORE PAGE UPGRADE STYLES
  scoreOverviewCard: {
    backgroundColor: "#0F172A",
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4
  },
  scoreCardContainerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  },
  scoreCardTitle: {
    fontSize: 11,
    fontWeight: "700",
    color: "#94A3B8",
    textTransform: "uppercase",
    letterSpacing: 0.5
  },
  scoreCardValue: {
    fontSize: 32,
    fontWeight: "800",
    color: "#F8FAFC",
    marginTop: 6
  },
  scoreCardMax: {
    fontSize: 11,
    color: "#64748B",
    marginTop: 2
  },
  scoreTierBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    marginTop: 10,
    alignSelf: "flex-start"
  },
  scoreTierBadgeText: {
    fontSize: 11,
    fontWeight: "800"
  },
  circularGaugeBox: {
    position: "relative",
    width: 110,
    height: 110,
    alignItems: "center",
    justifyContent: "center"
  },
  circularGaugeTextOverlay: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center"
  },
  circularGaugeScoreVal: {
    fontSize: 22,
    fontWeight: "800"
  },
  circularGaugeScoreLabel: {
    fontSize: 9,
    fontWeight: "600",
    color: "#94A3B8",
    textTransform: "uppercase",
    marginTop: 1
  },
  scoreHistoryCard: {
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 20,
    padding: 16,
    marginBottom: 16
  },
  scoreHistoryCardTitle: {
    fontSize: 13,
    fontWeight: "800",
    color: "#1E293B",
    marginBottom: 12
  },
  chartWrapperBox: {
    alignItems: "center",
    justifyContent: "center",
    marginTop: 4
  },
  scoreBreakdownCard: {
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 20,
    padding: 16,
    marginBottom: 16
  },
  scoreBreakdownHeader: {
    fontSize: 13,
    fontWeight: "800",
    color: "#1E293B",
    marginBottom: 14
  },
  breakdownRowItemBox: {
    marginBottom: 12
  },
  breakdownItemHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6
  },
  breakdownItemLabel: {
    fontSize: 11,
    fontWeight: "600",
    color: "#475569"
  },
  breakdownItemValue: {
    fontSize: 11,
    fontWeight: "700",
    color: "#334155"
  },
  breakdownProgressBarContainer: {
    height: 6,
    backgroundColor: "#F1F5F9",
    borderRadius: 3
  },
  breakdownProgressBarFill: {
    height: "100%",
    borderRadius: 3
  },
  achievementsSectionCard: {
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 20,
    padding: 16,
    marginBottom: 16
  },
  achievementsSectionTitle: {
    fontSize: 13,
    fontWeight: "800",
    color: "#1E293B",
    marginBottom: 12
  },
  achievementsGridRowContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 10
  },
  achievementCardBox: {
    width: "48%",
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 14,
    padding: 12,
    alignItems: "center",
    position: "relative",
    overflow: "hidden"
  },
  achievementLockedCardBox: {
    opacity: 0.6
  },
  achievementIconCircleWrapper: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#E0F2FE",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8
  },
  achievementLockedIconCircle: {
    backgroundColor: "#E2E8F0"
  },
  achievementEmoji: {
    fontSize: 20
  },
  achievementTitleText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#1E293B",
    textAlign: "center"
  },
  achievementDescText: {
    fontSize: 9,
    color: "#64748B",
    textAlign: "center",
    marginTop: 4,
    lineHeight: 12
  },
  lockedBadgeOverlay: {
    position: "absolute",
    top: 6,
    right: 6,
    backgroundColor: "rgba(226, 232, 240, 0.8)",
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center"
  },
  lockedBadgeIcon: {
    fontSize: 9
  },
  benefitsContainerCard: {
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 20,
    padding: 16,
    marginBottom: 16
  },
  benefitsSectionTitle: {
    fontSize: 13,
    fontWeight: "800",
    color: "#1E293B",
    marginBottom: 12
  },
  benefitsTierListItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9"
  },
  benefitsTierListItemActive: {
    backgroundColor: "#F0FDF4",
    paddingHorizontal: 8,
    borderRadius: 10,
    borderColor: "#DCFCE7",
    borderWidth: 1
  },
  tierIndicatorCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#F1F5F9",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10
  },
  tierNameLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: "#1E293B"
  },
  tierBenefitsValue: {
    fontSize: 9,
    color: "#64748B",
    marginTop: 2,
    lineHeight: 12
  },
  activeTierIndicatorLabel: {
    fontSize: 9,
    fontWeight: "800",
    color: "#0F9D58",
    backgroundColor: "#D1FAE5",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4
  },
  recommendationsCardBox: {
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 20,
    padding: 16,
    marginBottom: 16
  },
  recommendationsBoxTitle: {
    fontSize: 13,
    fontWeight: "800",
    color: "#1E293B",
    marginBottom: 12
  },
  recommendationItemBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 10,
    paddingRight: 10
  },
  recommendationBullet: {
    fontSize: 14,
    marginRight: 8,
    marginTop: 1
  },
  recommendationTextBody: {
    fontSize: 11,
    color: "#475569",
    lineHeight: 16,
    flex: 1
  },
  scoreVerificationBtnRow: {
    flexDirection: "row",
    gap: 8,
    width: "100%",
    marginTop: 14
  },
  scoreShareOutlineBtn: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#ffffff"
  },
  scoreShareOutlineBtnText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#475569"
  },
  scoreDownloadOutlineBtn: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#ffffff"
  },
  scoreDownloadOutlineBtnText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#475569"
  },
  activitiesContainerCard: {
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 20,
    padding: 16,
    marginBottom: 20
  },
  activitiesSectionTitle: {
    fontSize: 13,
    fontWeight: "800",
    color: "#1E293B",
    marginBottom: 12
  },
  activityRowLogItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9"
  },
  activityLeftPart: {
    flex: 1,
    paddingRight: 10
  },
  activityDateLabel: {
    fontSize: 9,
    fontWeight: "600",
    color: "#94A3B8"
  },
  activityLogText: {
    fontSize: 11,
    color: "#475569",
    marginTop: 2
  },
  activityPointsEarnedGreen: {
    fontSize: 12,
    fontWeight: "800",
    color: "#0F9D58"
  },
  
  // REDESIGNED MORE TAB AND DETAIL SUB-SCREENS STYLES
  moreProfileCard: {
    backgroundColor: "#ffffff",
    borderRadius: 24,
    padding: 20,
    marginHorizontal: 16,
    marginVertical: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 3,
  },
  moreProfileTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  moreAvatarInfoCol: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    gap: 16,
  },
  moreAvatarBox: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#F1F5F9",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  moreAvatarEmoji: {
    fontSize: 32,
  },
  moreCameraBadge: {
    position: "absolute",
    bottom: -2,
    right: -2,
    backgroundColor: "#0F9D58",
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#ffffff",
  },
  moreCameraBadgeText: {
    fontSize: 10,
    color: "#ffffff",
  },
  moreUserInfoBox: {
    flex: 1,
    justifyContent: "center",
  },
  moreUserName: {
    fontSize: 18,
    fontWeight: "800",
    color: "#1E293B",
    letterSpacing: -0.3,
  },
  moreMemberIdRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
    gap: 6,
  },
  moreMemberIdText: {
    fontSize: 13,
    color: "#64748B",
    fontFamily: "monospace",
    fontWeight: "600",
  },
  moreCopyBtn: {
    padding: 2,
  },
  moreCopyBtnEmoji: {
    fontSize: 12,
    color: "#64748B",
  },
  moreRoleBadge: {
    alignSelf: "flex-start",
    backgroundColor: "#ECFDF5",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    marginTop: 6,
    borderWidth: 0.5,
    borderColor: "#A7F3D0",
  },
  moreRoleBadgeText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#0F9D58",
  },
  moreScoreSummaryPanel: {
    backgroundColor: "#F8FAFC",
    borderRadius: 16,
    padding: 12,
    width: 120,
    borderWidth: 1,
    borderColor: "#F1F5F9",
    alignItems: "center",
    position: "relative",
  },
  moreScoreLabel: {
    fontSize: 9,
    fontWeight: "700",
    color: "#64748B",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  moreScoreVal: {
    fontSize: 24,
    fontWeight: "800",
    color: "#0F9D58",
    marginVertical: 2,
  },
  moreScoreRating: {
    fontSize: 9,
    fontWeight: "700",
    color: "#0F9D58",
  },
  moreScoreChevron: {
    position: "absolute",
    right: 8,
    top: "50%",
    transform: [{ translateY: -10 }],
    fontSize: 18,
    color: "#94A3B8",
  },
  moreOverviewSeparator: {
    height: 1,
    backgroundColor: "#F1F5F9",
    marginVertical: 16,
  },
  moreStatsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  moreStatItemCol: {
    flex: 1,
    alignItems: "center",
  },
  moreStatIcon: {
    fontSize: 18,
    marginBottom: 4,
  },
  moreStatLabel: {
    fontSize: 10,
    color: "#64748B",
    fontWeight: "500",
  },
  moreStatVal: {
    fontSize: 11,
    fontWeight: "700",
    color: "#1E293B",
    marginTop: 2,
  },
  moreMenuBlockCard: {
    backgroundColor: "#ffffff",
    borderRadius: 20,
    marginHorizontal: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    overflow: "hidden",
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 2,
  },
  moreMenuRowItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
  },
  moreMenuIconBox: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: "#F0FDF4",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 0.5,
    borderColor: "#DCFCE7",
  },
  moreMenuIconEmoji: {
    fontSize: 18,
  },
  moreMenuLabelCol: {
    flex: 1,
    marginLeft: 14,
  },
  moreMenuLabel: {
    fontSize: 14,
    fontWeight: "700",
    color: "#1E293B",
  },
  moreMenuDesc: {
    fontSize: 11,
    color: "#64748B",
    marginTop: 2,
  },
  moreMenuDivider: {
    height: 1,
    backgroundColor: "#F1F5F9",
    marginLeft: 68,
  },
  moreMenuChevron: {
    fontSize: 20,
    color: "#94A3B8",
    paddingHorizontal: 4,
  },
  detailCardBox: {
    backgroundColor: "#ffffff",
    borderRadius: 24,
    padding: 20,
    marginHorizontal: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 10,
    elevation: 2,
  },
  detailCardHeader: {
    fontSize: 16,
    fontWeight: "800",
    color: "#1E293B",
    marginBottom: 12,
  },
  detailCardDescription: {
    fontSize: 13,
    color: "#64748B",
    lineHeight: 20,
    marginBottom: 8,
  },
  dividerSlate: {
    height: 1,
    backgroundColor: "#F1F5F9",
    marginVertical: 14,
  },
  detailItemRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
  },
  detailLabel: {
    fontSize: 13,
    color: "#64748B",
    fontWeight: "500",
  },
  detailValue: {
    fontSize: 13,
    fontWeight: "700",
    color: "#1E293B",
  },
  walletStatusRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  statusPillGreen: {
    backgroundColor: "#ECFDF5",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    borderWidth: 0.5,
    borderColor: "#A7F3D0",
  },
  statusPillGreenText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#0F9D58",
  },
  walletAddressBox: {
    backgroundColor: "#F8FAFC",
    borderRadius: 14,
    padding: 14,
    marginTop: 12,
    borderWidth: 1,
    borderColor: "#F1F5F9",
  },
  walletAddressLabel: {
    fontSize: 10,
    fontWeight: "700",
    color: "#64748B",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  addressStringCopyRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  walletAddressTextMonospace: {
    fontSize: 12,
    fontFamily: "monospace",
    color: "#334155",
    flex: 1,
  },
  addressCopyBtnSmall: {
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 6,
    padding: 6,
  },
  walletActionBtnOutline: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#0F9D58",
    borderRadius: 14,
    paddingVertical: 12,
    marginHorizontal: 16,
    marginVertical: 4,
  },
  walletActionBtnOutlineText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#0F9D58",
  },
  walletActionBtnDisconnect: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FEF2F2",
    borderWidth: 1,
    borderColor: "#FCA5A5",
    borderRadius: 14,
    paddingVertical: 12,
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 20,
  },
  walletActionBtnDisconnectText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#EF4444",
  },
  securityChangePinRowItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
  },
  securityPinChangeLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: "#1E293B",
  },
  settingToggleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
  },
  settingToggleLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: "#1E293B",
  },
  settingToggleDesc: {
    fontSize: 11,
    color: "#64748B",
    marginTop: 2,
  },
  switchOuterTrack: {
    width: 44,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#E2E8F0",
    padding: 2,
    justifyContent: "center",
  },
  switchOuterTrackActive: {
    backgroundColor: "#0F9D58",
  },
  switchInnerDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#ffffff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.5,
    elevation: 2,
  },
  switchInnerDotActive: {
    transform: [{ translateX: 20 }],
  },
  sessionDetailsBox: {
    backgroundColor: "#F8FAFC",
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: "#F1F5F9",
    marginBottom: 12,
  },
  sessionLocationLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: "#1E293B",
  },
  sessionStatusText: {
    fontSize: 11,
    color: "#64748B",
    marginTop: 2,
  },
  revokeSessionsBtn: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 12,
    paddingVertical: 10,
  },
  revokeSessionsBtnText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#64748B",
  },
  pillSelectorRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 4,
  },
  pillSelectorBtn: {
    flex: 1,
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: "center",
  },
  pillSelectorBtnActive: {
    backgroundColor: "#0F9D58",
    borderColor: "#0F9D58",
  },
  pillSelectorBtnText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#64748B",
  },
  pillSelectorBtnTextActive: {
    color: "#ffffff",
    fontWeight: "700",
  },
  announcementItemCardBox: {
    backgroundColor: "#ffffff",
    borderRadius: 20,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 2,
  },
  announcementCardTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  announcementMetaLabel: {
    fontSize: 10,
    color: "#64748B",
    fontWeight: "600",
  },
  announcementUnreadDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#0F9D58",
  },
  announcementMainTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: "#1E293B",
  },
  announcementMessageContent: {
    fontSize: 12,
    color: "#475569",
    lineHeight: 18,
    marginTop: 6,
  },
  announcementsMarkReadBtn: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#0F9D58",
    borderRadius: 14,
    paddingVertical: 12,
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 30,
  },
  announcementsMarkReadBtnText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#0F9D58",
  },
  aboutPlatformCardBox: {
    backgroundColor: "#ffffff",
    borderRadius: 24,
    padding: 24,
    marginHorizontal: 16,
    marginVertical: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    alignItems: "center",
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 10,
    elevation: 2,
  },
  aboutLogoCircle: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: "#F0FDF4",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#DCFCE7",
    marginBottom: 14,
  },
  aboutLogoEmoji: {
    fontSize: 32,
  },
  aboutVersionTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#1E293B",
  },
  aboutVersionNumber: {
    fontSize: 12,
    color: "#64748B",
    marginTop: 2,
  },
  aboutPlatformDesc: {
    fontSize: 13,
    color: "#475569",
    textAlign: "center",
    lineHeight: 20,
    marginTop: 12,
  },
  aboutMissionText: {
    fontSize: 13,
    color: "#475569",
    lineHeight: 20,
  },
  aboutLinksBlock: {
    backgroundColor: "#ffffff",
    borderRadius: 20,
    marginHorizontal: 16,
    marginBottom: 30,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    overflow: "hidden",
  },
  aboutLinkItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
  },
  aboutLinkText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#1E293B",
  },
  faqItemRow: {
    paddingVertical: 10,
  },
  faqQuestionText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#1E293B",
    lineHeight: 18,
  },
  faqAnswerText: {
    fontSize: 12,
    color: "#64748B",
    lineHeight: 18,
    marginTop: 4,
  },
  helpContactBtnOutline: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#0F9D58",
    borderRadius: 12,
    paddingVertical: 10,
    marginTop: 10,
  },
  helpContactBtnOutlineText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#0F9D58",
  },
  // IN-APP MESSAGE BANNER
  bannerOverlay: {
    position: "absolute",
    top: STATUS_BAR_HEIGHT + 10,
    left: 20,
    right: 20,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 8,
    zIndex: 10000
  },
  bannerText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "bold",
    letterSpacing: 0.3
  },
  // LOGIN / SANDBOX SELECTOR STYLES
  loginHeaderWrapper: {
    alignItems: "center",
    marginBottom: 24,
    marginTop: 20
  },
  loginTitle: {
    fontSize: 24,
    fontWeight: "800",
    color: "#111827",
    textAlign: "center"
  },
  loginSubtitle: {
    fontSize: 14,
    color: "#6B7280",
    marginTop: 6,
    textAlign: "center",
    paddingHorizontal: 16
  },
  sandboxContainer: {
    width: "100%",
    gap: 12,
    marginBottom: 20
  },
  sandboxUserButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02,
    shadowRadius: 3,
    elevation: 1
  },
  sandboxUserEmoji: {
    fontSize: 24,
    marginRight: 12
  },
  sandboxUserDetail: {
    flex: 1
  },
  sandboxUserName: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#111827"
  },
  sandboxUserAddress: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 2
  }
});
