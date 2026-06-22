import React, { createContext, useState, useEffect, useContext } from "react";
import { Platform, Alert } from "react-native";
import { ethers } from "ethers";
import { useCameraPermissions } from "expo-camera";
import {
  fetchOnChainCreditScore,
  fetchOnChainLoopBalance,
  fetchOnChainVaultDetails,
  fetchOnChainMembers,
  fetchOnChainLoans,
  isValidEVMAddress,
  executeOnChainContribution,
  executeOnChainLoanRequest,
  executeOnChainVote,
  executeOnChainRepayment
} from "../../lib/blockchain";
import {
  KES_PER_USDC,
  DEFAULT_MEMBERS,
  DEFAULT_NOTIFICATIONS,
  DEFAULT_TRANSACTIONS,
  DEFAULT_LOANS
} from "../constants/defaultData";

const _noop = () => {};
const _noopStr = () => "";

export const AppContext = createContext({
  // Navigation
  currentScreen: "splash",
  setCurrentScreen: _noop,
  activeTab: "home",
  setActiveTab: _noop,
  activeSubScreen: null,
  setActiveSubScreen: _noop,
  // User
  selectedUser: null,
  setSelectedUser: _noop,
  registeredUsers: [],
  // Currency helpers — prevents ReferenceError on Hermes
  currency: "KES",
  setCurrency: _noop,
  formatValue: _noopStr,
  convertUsdc: (v) => v,
  getCreditTier: () => ({ name: "Bronze", color: "#CD7F32", bg: "rgba(205,127,50,0.08)", rate: 12, badge: "Bronze" }),
  // Theme
  isDark: false,
  themeBg: "#F9FAFB",
  themeCardBg: "#FFFFFF",
  themeTextColor: "#111827",
  themeBorderColor: "#E5E7EB",
  themeSubtitleColor: "#6B7280",
  themeHeaderBg: "#FFFFFF",
  themeDividerColor: "#F1F5F9",
  // Translation
  t: (k) => k,
  // Misc
  isDashboardLoading: false,
  isRefreshing: false,
  banner: null,
  showBanner: _noop,
  handleDashboardRefresh: _noop,
  onboardingSlides: [],
  onboardingIndex: 0,
  setOnboardingIndex: _noop,
  handleOnboardingNext: _noop,
  KES_PER_USDC: 130,
});

export const useApp = () => useContext(AppContext);


export const AppProvider = ({ children }) => {
  // Navigation State
  const [currentScreen, setCurrentScreen] = useState("splash");
  const [loginMethod, setLoginMethod] = useState("picker"); // 'picker' | 'credentials'
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [focusedInput, setFocusedInput] = useState(null);
  const [permission, requestPermission] = useCameraPermissions();
  
  // Dashboard Tabs
  const [activeTab, setActiveTab] = useState("home");
  const [activeSubScreen, setActiveSubScreen] = useState(null);

  // Currency Selector
  const [currency, setCurrency] = useState("KES");

  // Onboarding Slides Index
  const [onboardingIndex, setOnboardingIndex] = useState(0);

  // Dashboard Loader & Refresh States
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isDashboardLoading, setIsDashboardLoading] = useState(false);
  const [showQrScanner, setShowQrScanner] = useState(false);
  const [savingsGoal, setSavingsGoal] = useState({
    title: "Chama Tractor Fund",
    target: 2000.00,
    current: 1250.00,
    deadline: "30 Aug 2026"
  });

  // Multiple Savings Goals state
  const [savingsGoals, setSavingsGoals] = useState([]);
  
  // History Filter states
  const [historyFilterMonth, setHistoryFilterMonth] = useState("All");
  const [historyFilterMethod, setHistoryFilterMethod] = useState("All");
  const [historyFilterStatus, setHistoryFilterStatus] = useState("All");

  // New goal creation inputs
  const [showAddGoalModal, setShowAddGoalModal] = useState(false);
  const [newGoalTitle, setNewGoalTitle] = useState("");
  const [newGoalTarget, setNewGoalTarget] = useState("");
  const [newGoalDeadline, setNewGoalDeadline] = useState("");
  const [newGoalBadge, setNewGoalBadge] = useState("💰");

  // Language settings
  const [appearanceLanguage, setAppearanceLanguage] = useState("English"); // 'English' | 'Kiswahili'

  // Backend URL logic
  let initialBackendUrl = process.env.EXPO_PUBLIC_BACKEND_URL || "http://localhost:5000";
  if (Platform.OS === "android") {
    initialBackendUrl = initialBackendUrl.replace("localhost", "10.0.2.2").replace("127.0.0.1", "10.0.2.2");
  }
  const [backendUrl, setBackendUrl] = useState(initialBackendUrl);

  const BACKEND_URL = backendUrl;

  // Helper to run fetch with a timeout
  const fetchWithTimeout = async (url, options = {}, timeout = 10000) => {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout);

    const headers = {
      ...(options.headers || {}),
      "ngrok-skip-browser-warning": "true",
      "User-Agent": "PayLoopMobile/1.0"
    };

    try {
      const response = await fetch(url, {
        ...options,
        headers,
        signal: controller.signal
      });
      clearTimeout(id);

      // Fallback if the response indicates a tunnel gateway error (502, 503, 504)
      if (!response.ok && (response.status === 502 || response.status === 503 || response.status === 504)) {
        if (!url.includes("localhost") && !url.includes("127.0.0.1") && !url.includes("10.0.2.2")) {
          const localBackend = Platform.OS === "android" ? "http://10.0.2.2:5000" : "http://localhost:5000";
          console.log(`[fetchWithTimeout] Received HTTP ${response.status} from tunnel. Retrying with local backend: ${localBackend}`);
          const fallbackUrl = url.replace(BACKEND_URL, localBackend);
          const retryController = new AbortController();
          const retryId = setTimeout(() => retryController.abort(), timeout);
          try {
            const fallbackResponse = await fetch(fallbackUrl, {
              ...options,
              headers,
              signal: retryController.signal
            });
            clearTimeout(retryId);
            setBackendUrl(localBackend);
            console.log(`[fetchWithTimeout] Successfully connected to local backend after HTTP ${response.status}. Updated BACKEND_URL.`);
            return fallbackResponse;
          } catch (retryError) {
            clearTimeout(retryId);
            return response;
          }
        }
      }

      return response;
    } catch (error) {
      clearTimeout(id);

      // Fallback: If remote tunnel fails/times out, retry with local backend
      const localBackend = Platform.OS === "android" ? "http://10.0.2.2:5000" : "http://localhost:5000";
      if (!url.includes("localhost") && !url.includes("127.0.0.1") && !url.includes("10.0.2.2")) {
        console.log(`[fetchWithTimeout] Fetch to ${url} failed. Retrying with local backend: ${localBackend}`);
        const fallbackUrl = url.replace(BACKEND_URL, localBackend);
        const retryController = new AbortController();
        const retryId = setTimeout(() => retryController.abort(), timeout);
        try {
          const response = await fetch(fallbackUrl, {
            ...options,
            headers,
            signal: retryController.signal
          });
          clearTimeout(retryId);
          setBackendUrl(localBackend);
          console.log(`[fetchWithTimeout] Successfully connected to local backend. Updated BACKEND_URL.`);
          return response;
        } catch (retryError) {
          clearTimeout(retryId);
          throw retryError;
        }
      }
      throw error;
    }
  };

  // Safe JSON parser
  const safeResponseJson = async (response) => {
    const contentType = response.headers.get("content-type") || "";
    if (!contentType.includes("application/json")) {
      const text = await response.text();
      console.log("[safeResponseJson] Non-JSON response (first 120 chars):", text.slice(0, 120));
      return null;
    }
    return response.json();
  };

  // Helper to map database properties to UI properties
  const mapUserProperties = (user) => {
    if (!user) return null;
    return {
      ...user,
      address: user.wallet_address || user.address || "0x0000000000000000000000000000000000000000",
      creditScore: user.credit_score !== undefined ? user.credit_score : (user.creditScore || 500),
      activeLoan: user.active_loan !== undefined ? parseFloat(user.active_loan) : (user.activeLoan || 0),
      savings: user.savings !== undefined ? parseFloat(user.savings) : 0,
      balance: user.balance !== undefined ? parseFloat(user.balance) : 1000,
      loopPoints: user.loop_points !== undefined ? user.loop_points : (user.loopPoints || 0),
      maritalStatus: user.marital_status || user.maritalStatus || "Single",
      avatarUri: user.avatar || user.avatarUri || "👤",
      avatar: user.avatar || user.avatarUri || "👤",
      bio: user.bio || "Active Chama Member",
      occupation: user.occupation || "Entrepreneur",
      dob: user.dob || "12 Aug 1990",
      county: user.county || "",
      gender: user.gender || "Not Specified",
      pushToken: user.push_token || user.pushToken || null,
      nationalId: user.national_id || user.nationalId || "",
      id_document_front: user.id_document_front || "",
      id_document_back: user.id_document_back || "",
      selfie: user.selfie || "",
      physical_address: user.physical_address || user.address || "",
      is_email_verified: user.is_email_verified !== undefined ? user.is_email_verified : false,
      verification_level: user.verification_level || "BASIC"
    };
  };

  // Global User State
  const [selectedUser, setSelectedUser] = useState(null);
  const [registeredUsers, setRegisteredUsers] = useState([]);

  // Multi-Group Ecosystem states
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [userGroups, setUserGroups] = useState([]);
  const [currentGroup, setCurrentGroup] = useState(null);
  const [groupStats, setGroupStats] = useState(null);
  const [announcements, setAnnouncements] = useState([]);
  const [currentGroupRole, setCurrentGroupRole] = useState("Member"); 
  const [adminPrivileges, setAdminPrivileges] = useState(null);

  // Admin Panel states
  const [adminDashboardData, setAdminDashboardData] = useState(null);
  const [adminApprovalsList, setAdminApprovalsList] = useState([]);
  const [adminFinancialRules, setAdminFinancialRules] = useState(null);
  const [adminLoansList, setAdminLoansList] = useState([]);
  const [adminLoansAnalytics, setAdminLoansAnalytics] = useState(null);
  const [adminPollsList, setAdminPollsList] = useState([]);
  const [adminMeetingsList, setAdminMeetingsList] = useState([]);
  const [adminAuditLogs, setAdminAuditLogs] = useState([]);
  const [adminMembersList, setAdminMembersList] = useState([]);
  const [adminReportsData, setAdminReportsData] = useState(null);
  const [superAdminData, setSuperAdminData] = useState(null);

  // Admin local form states
  const [newPollTitle, setNewPollTitle] = useState("");
  const [newPollDesc, setNewPollDesc] = useState("");
  const [newPollOptions, setNewPollOptions] = useState("[\"Yes\", \"No\"]");
  const [newPollQuorum, setNewPollQuorum] = useState("50");
  const [newPollType, setNewPollType] = useState("vote");
  const [showAddPollModal, setShowAddPollModal] = useState(false);

  const [broadcastTitle, setBroadcastTitle] = useState("");
  const [broadcastContent, setBroadcastContent] = useState("");

  const [newMeetingTitle, setNewMeetingTitle] = useState("");
  const [newMeetingAgenda, setNewMeetingAgenda] = useState("");
  const [newMeetingLocation, setNewMeetingLocation] = useState("");
  const [newMeetingDate, setNewMeetingDate] = useState("");
  const [newMeetingType, setNewMeetingType] = useState("regular");
  const [showAddMeetingModal, setShowAddMeetingModal] = useState(false);

  const [appSubTab, setAppSubTab] = useState("All");
  const [selectedApprovalIds, setSelectedApprovalIds] = useState([]);
  const [reviewNotes, setReviewNotes] = useState("");

  const [restructureLoanId, setRestructureLoanId] = useState(null);
  const [newLoanDuration, setNewLoanDuration] = useState("");
  const [newLoanInterest, setNewLoanInterest] = useState("");

  const [rulesContributionAmount, setRulesContributionAmount] = useState("");
  const [rulesPenaltyRate, setRulesPenaltyRate] = useState("");
  const [rulesMultiplier, setRulesMultiplier] = useState("");
  const [rulesInterestRate, setRulesInterestRate] = useState("");
  const [rulesEmergency, setRulesEmergency] = useState("");
  const [rulesWithdrawal, setRulesWithdrawal] = useState("");
  const [rulesGracePeriod, setRulesGracePeriod] = useState("");

  useEffect(() => {
    if (adminFinancialRules) {
      setRulesContributionAmount(adminFinancialRules.contribution_amount?.toString() || "500");
      setRulesPenaltyRate(adminFinancialRules.late_penalty_rate?.toString() || "5.00");
      setRulesMultiplier(adminFinancialRules.max_loan_multiplier?.toString() || "3.00");
      setRulesInterestRate(adminFinancialRules.loan_interest_rate?.toString() || "10.00");
      setRulesEmergency(adminFinancialRules.emergency_fund_percent?.toString() || "10.00");
      setRulesWithdrawal(adminFinancialRules.max_withdrawal_percent?.toString() || "80.00");
      setRulesGracePeriod(adminFinancialRules.grace_period_days?.toString() || "7");
    }
  }, [adminFinancialRules]);

  // 4-Step Stepper Registration states
  const [regStep, setRegStep] = useState(1);
  const [regNationalId, setRegNationalId] = useState("");
  const [regReferral, setRegReferral] = useState("");
  const [groupSetupChoice, setGroupSetupChoice] = useState("create"); 
  const [createdGroupName, setCreatedGroupName] = useState("");
  const [createdGroupDesc, setCreatedGroupDesc] = useState("");
  const [createdGroupContrib, setCreatedGroupContrib] = useState("500");
  const [inviteCode, setInviteCode] = useState("");

  // Authentication & Registration Form states
  const [regName, setRegName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPhone, setRegPhone] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regConfirmPassword, setRegConfirmPassword] = useState("");

  const [otpCode, setOtpCode] = useState("");
  const [otpTimer, setOtpTimer] = useState(59);
  const [sentOtp, setSentOtp] = useState("");
  const [createdPin, setCreatedPin] = useState("");
  const [isConfirmingPin, setIsConfirmingPin] = useState(false);
  const [tempPin, setTempPin] = useState("");

  const [pinCode, setPinCode] = useState(""); 
  
  // Complete Profile Form states
  const [profGender, setProfGender] = useState("Male");
  const [profDob, setProfDob] = useState("12 Aug 1990");
  const [profMarital, setProfMarital] = useState("Single");
  const [profOccupation, setProfOccupation] = useState("Business Owner");
  const [profCounty, setProfCounty] = useState("Uasin Gishu");
  const [profBio, setProfBio] = useState("");
  const [profAvatarUri, setProfAvatarUri] = useState("");

  // Identity Verification Form states
  const [phoneForVerification, setPhoneForVerification] = useState("");
  const [verificationSmsCode, setVerificationSmsCode] = useState("");
  const [isVerificationSmsSent, setIsVerificationSmsSent] = useState(false);
  const [isPhoneVerifiedState, setIsPhoneVerifiedState] = useState(false);
  const [selectedDocType, setSelectedDocType] = useState("National_ID");
  const [idDocUri, setIdDocUri] = useState(null);
  const [selfieUri, setSelfieUri] = useState(null);
  const [isScanningDoc, setIsScanningDoc] = useState(false);
  const [isScanningFace, setIsScanningFace] = useState(false);
  const [isSubmittingVerification, setIsSubmittingVerification] = useState(false);
  const [verificationSuccess, setVerificationSuccess] = useState(false);

  // Blockchain/Mock State variables
  const [chamaName, setChamaName] = useState("Green Savers Eldoret");
  const [vaultBalance, setVaultBalance] = useState(25000.00); 
  const [loans, setLoans] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [members, setMembers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [banner, setBanner] = useState(null);

  const showBanner = (message, type = "success") => {
    setBanner({ message, type });
  };

  // Theme calculations moved after appearanceTheme state declaration

  // Localization dictionary
  const translations = {
    English: {
      more: "More",
      profile: "My Profile",
      group_info: "Group Information",
      members: "Members",
      wallet: "Wallet",
      account: "Account",
      security: "Security",
      appearance: "Appearance",
      receipts: "My Receipts",
      transactions: "Transactions",
      notifications: "Notifications",
      announcements: "Announcements",
      about: "About PayLoop",
      help: "Help Center",
      logout: "Log Out",
      save: "Save",
      edit: "Edit",
      group: "Group",
      role: "Role",
      joined: "Joined",
      profile_completion: "Profile",
      creditloop_score: "CreditLoop Score",
      excellent: "Excellent",
      connect_status: "Connected",
      cancel: "Cancel",
      edit_profile: "Edit Profile",
      fullname: "Full Name",
      email: "Email Address",
      phone: "Phone Number",
      bio: "Bio",
      marital_status: "Marital Status",
      change_photo: "Change Photo",
      choose_avatar: "Choose Profile Avatar",
      take_photo: "Simulate Photo Capture 📷",
      upload_library: "Simulate Gallery Upload 🖼️",
      slide1_title: "Cooperative Savings Circle",
      slide1_desc: "Pool resources securely with your Chama or savings group. Automatically track individual member contributions, schedule weekly deposits, and watch your collective interest compound in real time with absolute transparency.",
      slide1_label: "Smart Savings",
      slide2_title: "Trust-Based Credit Scoring",
      slide2_desc: "Build a digital credit history without requiring traditional collateral. Your creditworthiness is calculated dynamically based on your consistent saving habits, community reputation, and active participation in lending loops.",
      slide2_label: "CreditScore",
      slide3_title: "Democratic Chama Governance",
      slide3_desc: "Participate in transparent decentralized decision making. Submit loan requests to your savings circle, and members cast cryptographic votes to approve and release funds directly to your wallet instantly.",
      slide3_label: "Governance",
      slide4_title: "Hybrid Offline Accessibility",
      slide4_desc: "Access your financial account anywhere, even without an internet connection. Seamlessly check your credit score, deposit savings, or vote on pending loans using our secure and lightweight USSD backup channel.",
      slide4_label: "Accessibility",
      skip: "Skip",
      next: "Next",
      back: "Back",
      get_started: "Get Started",
      welcome_title: "Welcome to PayLoop",
      welcome_subtitle: "Digital Savings & Lending Platform",
      create_account: "Create Account",
      login: "Login",
      verification_title: "Verify Your Email",
      verification_subtitle: "We've sent a 6-digit OTP code to:",
      verify: "Verify",
      resend_code: "Resend Code",
      change_email: "Change Email",
      create_pin_title: "Create Secure PIN",
      create_pin_subtitle: "Create a secure 6-digit PIN code for quick login and transaction approvals",
      enter_pin_title: "Enter PIN",
      enter_pin_subtitle: "Enter your 6 digit PIN to continue",
      connect_wallet_title: "Connect Wallet",
      connect_wallet_subtitle: "Choose a Web3 provider to verify your blockchain identity and start transaction locks",
      skip_now: "Skip for Now",
      complete_profile_title: "Complete Profile",
      complete_profile_subtitle: "Provide additional details to establish trust within your savings circle",
      upload_photo: "Upload Profile Photo",
      gender: "Gender",
      dob: "Date of Birth",
      occupation: "Occupation",
      county: "County",
      bio_label: "Biography (Bio)",
      save_continue: "Save and Continue",
      sandbox_title: "Sandbox Identity",
      sandbox_subtitle: "Select a sandbox profile to verify the mobile application",
      password: "Password",
      confirm_password: "Confirm Password",
      register_subtitle: "Register to start saving and lending",
      back_welcome: "Back to Welcome",
      forgot_pin: "Forgot PIN?",
      auto_fetch_otp: "Auto-Fetch OTP (Sandbox)",
      active_workspace: "Active Workspace",
      id_document: "ID Document",
      selfie: "Selfie (Face Verification)",
      completeness: "Account Completeness",
      system_settings: "System Settings",
      change_pin: "Change PIN",
      biometric_setup: "Biometrics Setup",
      connect_metamask: "Connect MetaMask Wallet",
      setup_6digit_pin: "Setup 6-Digit PIN",
      physical_address: "Physical Address"
    },
    Kiswahili: {
      more: "Zaidi",
      profile: "Wasifu Wangu",
      group_info: "Habari ya Kikundi",
      members: "Wanachama",
      wallet: "Mkoba",
      account: "Akaunti",
      security: "Usalama",
      appearance: "Muonekano",
      receipts: "Stakabadhi Zangu",
      transactions: "Miamala",
      notifications: "Arifa",
      announcements: "Matangazo",
      about: "Kuhusu PayLoop",
      help: "Kituo cha Msaada",
      logout: "Ondoka",
      save: "Hifadhi",
      edit: "Hariri",
      group: "Kikundi",
      role: "Wajibu",
      joined: "Alijiunga",
      profile_completion: "Wasifu",
      creditloop_score: "Alama ya CreditLoop",
      excellent: "Bora Sana",
      connect_status: "Imeunganishwa",
      cancel: "Ghairi",
      edit_profile: "Hariri Wasifu",
      fullname: "Jina Kamili",
      email: "Barua Pepe",
      phone: "Nambari ya Simu",
      bio: "Wasifu",
      marital_status: "Hali ya Ndoa",
      change_photo: "Badilisha Picha",
      choose_avatar: "Chagua Picha ya Wasifu",
      take_photo: "Piga Picha ya Simu 📷",
      upload_library: "Pakia kutoka Nyaraka 🖼️",
      slide1_title: "Mzunguko wa Akiba wa Ushirika",
      slide1_desc: "Kusanya rasilimali kwa usalama na Chama chako. Fuatilia michango ya kila mwanachama kiotomatiki, ratibu amana za kila wiki, na uone riba ya kikundi ikiongezeka kwa wakati halisi kwa uwazi kabisa.",
      slide1_label: "Akiba Salama",
      slide2_title: "Alama za Mikopo Kulingana na Uaminifu",
      slide2_desc: "Jenga historia ya mikopo ya kidijitali bila hitaji la dhamana ya kawaida. Uwezo wako wa kukopa unakidhiwa kiotomatiki kulingana na tabia zako thabiti za kuweka akiba na sifa yako katika kikundi.",
      slide2_label: "Alama ya Mkopo",
      slide3_title: "Utawala wa Kidemokrasia wa Chama",
      slide3_desc: "Shiriki katika kufanya maamuzi kwa uwazi na ya kidemokrasia. Tuma maombi ya mkopo kwa kikundi chako, na wanachama watapiga kura zilizosimbwa kuidhinisha na kutoa pesa moja kwa moja kwenye mkoba wako papo hapo.",
      slide3_label: "Utawala",
      slide4_title: "Ufikiaji wa Nje ya Mtandao",
      slide4_desc: "Fikia akaunti yako ya kifedha popote, hata bila muunganisho wa mtandao. Angalia alama zako za mkopo kwa urahisi, weka akiba, au upige kura kwenye mikopo inayosubiri kwa kutumia njia yetu salama ya USSD.",
      slide4_label: "Ufikiaji",
      skip: "Ruka",
      next: "Mbele",
      back: "Nyuma",
      get_started: "Anza Sasa",
      welcome_title: "Karibu Kwenye PayLoop",
      welcome_subtitle: "Mfumo wa Dijitali wa Akiba na Mikopo",
      create_account: "Fungua Akaunti",
      login: "Ingia",
      verification_title: "Thibitisha Barua Pepe Yako",
      verification_subtitle: "Tumetuma msimbo wa tarakimu 6 kwa:",
      verify: "Thibitisha",
      resend_code: "Tuma Msimbo Tena",
      change_email: "Badilisha Barua Pepe",
      create_pin_title: "Unda PIN Salama",
      create_pin_subtitle: "Unda msimbo salama wa PIN wa tarakimu 6 kwa kuingia haraka na kuidhinisha miamala",
      enter_pin_title: "Ingiza PIN",
      enter_pin_subtitle: "Ingiza PIN yako ya tarakimu 6 ili kuendelea",
      connect_wallet_title: "Unganisha Mkoba",
      connect_wallet_subtitle: "Chagua mkoba wa Web3 ili kuthibitisha utambulisho wako wa blockchain",
      skip_now: "Ruka kwa Sasa",
      complete_profile_title: "Kamilisha Wasifu",
      complete_profile_subtitle: "Weka maelezo zaidi ili kujenga uaminifu katika kikundi chako cha akiba",
      upload_photo: "Pakia Picha ya Wasifu",
      gender: "Jinsia",
      dob: "Tarehe ya Kuzaliwa",
      occupation: "Kazi",
      county: "Kaunti",
      bio_label: "Maelezo Mafupi (Bio)",
      save_continue: "Hifadhi na Uendelee",
      sandbox_title: "Utambulisho wa Jaribio",
      sandbox_subtitle: "Chagua wasifu wa jaribio ili kujaribu programu ya simu",
      password: "Nenosiri",
      confirm_password: "Thibitisha Nenosiri",
      register_subtitle: "Sajili ili uanze kuweka akiba na kukopa",
      back_welcome: "Rudi Mwanzo",
      forgot_pin: "Umesahau PIN?",
      auto_fetch_otp: "Chukua OTP Otomatiki (Sandbox)",
      active_workspace: "Eneo Kazi Ambalo Liko Wazi",
      id_document: "Nyaraka ya Kitambulisho",
      selfie: "Picha ya Selfie (Uthibitisho wa Sura)",
      completeness: "Ukamilifu wa Akaunti",
      system_settings: "Mipangilio ya Mfumo",
      change_pin: "Badilisha PIN",
      biometric_setup: "Usanidi wa Alama za Vidole",
      connect_metamask: "Unganisha Mkoba wa MetaMask",
      setup_6digit_pin: "Sanidi PIN ya Tarakimu 6",
      physical_address: "Anwani ya Makazi"
    }
  };
  
  const t = (key) => {
    const lang = appearanceLanguage || "English";
    return translations[lang][key] || translations["English"][key] || key;
  };

  // Onboarding slides config (4 Screens) dynamically translated
  const onboardingSlides = [
    {
      title: t("slide1_title"),
      desc: t("slide1_desc"),
      image: require("../../assets/onboarding_savings.png"),
      label: t("slide1_label")
    },
    {
      title: t("slide2_title"),
      desc: t("slide2_desc"),
      image: require("../../assets/onboarding_credit.png"),
      label: t("slide2_label")
    },
    {
      title: t("slide3_title"),
      desc: t("slide3_desc"),
      image: require("../../assets/onboarding_governance.png"),
      label: t("slide3_label")
    },
    {
      title: t("slide4_title"),
      desc: t("slide4_desc"),
      image: require("../../assets/onboarding_offline.png"),
      label: t("slide4_label")
    }
  ];

  const handleOnboardingNext = () => {
    if (onboardingIndex < onboardingSlides.length - 1) {
      setOnboardingIndex(onboardingIndex + 1);
    } else {
      setCurrentScreen("welcome");
    }
  };

  // Handle PIN Keypad Press (Unified for 6 digits)
  const handlePinPress = (key) => {
    if (key === "back") {
      setPinCode((prev) => prev.slice(0, -1));
    } else if (key === "biometric") {
      if (selectedUser) {
        setIsLoading(true);
        fetchUserData(selectedUser.email).then((userObj) => {
          setIsLoading(false);
          setPinCode("");
          if (userObj && userObj.verification_level !== "FULLY_VERIFIED") {
            setCurrentScreen("completeProfile");
          } else {
            setCurrentScreen("dashboard");
          }
          showBanner("Biometric identity verified!", "success");
        });
      } else {
        showBanner("No active profile loaded", "error");
      }
    } else {
      if (pinCode.length < 6) {
        const newPin = pinCode + key;
        setPinCode(newPin);
        
        if (newPin.length === 6) {
          setIsLoading(true);
          setTimeout(async () => {
            setPinCode("");
            if (currentScreen === "createPin") {
              if (!isConfirmingPin) {
                setTempPin(newPin);
                setIsConfirmingPin(true);
                setIsLoading(false);
                showBanner("Please confirm your PIN code.", "info");
              } else {
                if (newPin === tempPin) {
                  setCreatedPin(newPin);
                  setIsConfirmingPin(false);
                  setTempPin("");
                  setIsLoading(false);
                  setCurrentScreen("connectWallet");
                  showBanner("Secure PIN established! 🔒", "success");
                } else {
                  setIsConfirmingPin(false);
                  setTempPin("");
                  setIsLoading(false);
                  showBanner("PINs did not match! Please try again.", "error");
                }
              }
            } else {
              if (selectedUser && (newPin === selectedUser.pin || selectedUser.isMetaMask)) {
                const userObj = await fetchUserData(selectedUser.email) || selectedUser;
                setIsLoading(false);
                if (userObj && userObj.verification_level !== "FULLY_VERIFIED") {
                  setCurrentScreen("completeProfile");
                } else {
                  setCurrentScreen("dashboard");
                }
                showBanner("Access granted!", "success");
              } else {
                setIsLoading(false);
                showBanner("Invalid PIN code. Please try again.", "error");
              }
            }
          }, 800);
        }
      }
    }
  };

  // Admin fetch functions
  const fetchAdminDashboard = async (groupId) => {
    try {
      const res = await fetchWithTimeout(`${BACKEND_URL}/api/admin/dashboard/${groupId}?t=${Date.now()}`);
      if (res.ok) {
        const data = await safeResponseJson(res);
        if (data && data.success) {
          setAdminDashboardData(data);
        }
      }
    } catch (err) {
      console.log("Error fetching admin dashboard:", err);
    }
  };

  const fetchAdminApprovals = async (groupId) => {
    try {
      const res = await fetchWithTimeout(`${BACKEND_URL}/api/admin/approvals/${groupId}?t=${Date.now()}`);
      if (res.ok) {
        const data = await safeResponseJson(res);
        if (data) setAdminApprovalsList(data);
      }
    } catch (err) {
      console.log("Error fetching admin approvals:", err);
    }
  };

  const fetchAdminFinancialRules = async (groupId) => {
    try {
      const res = await fetchWithTimeout(`${BACKEND_URL}/api/admin/financial-rules/${groupId}?t=${Date.now()}`);
      if (res.ok) {
        const data = await safeResponseJson(res);
        if (data) setAdminFinancialRules(data);
      }
    } catch (err) {
      console.log("Error fetching admin financial rules:", err);
    }
  };

  const fetchAdminLoans = async (groupId) => {
    try {
      const res = await fetchWithTimeout(`${BACKEND_URL}/api/admin/loans/${groupId}?t=${Date.now()}`);
      if (res.ok) {
        const data = await safeResponseJson(res);
        if (data) {
          setAdminLoansList(data.loans || []);
          setAdminLoansAnalytics(data.analytics || null);
        }
      }
    } catch (err) {
      console.log("Error fetching admin loans:", err);
    }
  };

  const fetchAdminPolls = async (groupId) => {
    try {
      const res = await fetchWithTimeout(`${BACKEND_URL}/api/admin/governance/${groupId}/polls?t=${Date.now()}`);
      if (res.ok) {
        const data = await safeResponseJson(res);
        if (data) setAdminPollsList(data);
      }
    } catch (err) {
      console.log("Error fetching admin polls:", err);
    }
  };

  const fetchAdminMeetings = async (groupId) => {
    try {
      const res = await fetchWithTimeout(`${BACKEND_URL}/api/admin/meetings/${groupId}?t=${Date.now()}`);
      if (res.ok) {
        const data = await safeResponseJson(res);
        if (data) setAdminMeetingsList(data);
      }
    } catch (err) {
      console.log("Error fetching admin meetings:", err);
    }
  };

  const fetchAdminAuditLogs = async (groupId) => {
    try {
      const res = await fetchWithTimeout(`${BACKEND_URL}/api/admin/audit-log/${groupId}?t=${Date.now()}`);
      if (res.ok) {
        const data = await safeResponseJson(res);
        if (data) setAdminAuditLogs(data);
      }
    } catch (err) {
      console.log("Error fetching admin audit logs:", err);
    }
  };

  const fetchAdminMembers = async (groupId) => {
    try {
      const res = await fetchWithTimeout(`${BACKEND_URL}/api/admin/members/${groupId}?t=${Date.now()}`);
      if (res.ok) {
        const data = await safeResponseJson(res);
        if (data) setAdminMembersList(data);
      }
    } catch (err) {
      console.log("Error fetching admin members:", err);
    }
  };

  const fetchAdminReports = async (groupId) => {
    try {
      const res = await fetchWithTimeout(`${BACKEND_URL}/api/admin/reports/${groupId}?t=${Date.now()}`);
      if (res.ok) {
        const data = await safeResponseJson(res);
        if (data) setAdminReportsData(data);
      }
    } catch (err) {
      console.log("Error fetching admin reports:", err);
    }
  };

  const fetchSuperAdminData = async () => {
    try {
      const res = await fetchWithTimeout(`${BACKEND_URL}/api/super-admin/overview?t=${Date.now()}`);
      if (res.ok) {
        const data = await safeResponseJson(res);
        if (data && data.success) setSuperAdminData(data.metrics);
      }
    } catch (err) {
      console.log("Error fetching super admin data:", err);
    }
  };

  const fetchGroupData = async (groupId, email) => {
    if (!groupId) return;
    const now = Date.now();
    try {
      const dbRes = await fetchWithTimeout(`${BACKEND_URL}/api/groups/${groupId}/dashboard?email=${email}&t=${now}`);
      if (dbRes.ok) {
        const data = await safeResponseJson(dbRes);
        if (data) {
          setGroupStats(data);
          setChamaName(data.group.name);
          setVaultBalance(data.groupSavings !== undefined ? data.groupSavings : (data.group?.group_savings || 0));
          if (data.announcements) {
            setAnnouncements(data.announcements);
          }
          const role = data.userRole || "Member";
          setCurrentGroupRole(role);
          if (role === "Admin") {
            setAdminPrivileges({
              canApproveLoans: true,
              canRejectLoans: true,
              canRemoveMembers: true,
              canPromoteMembers: true,
              canPostAnnouncements: true,
              canEditGroupSettings: true,
              canViewAllTransactions: true,
              canDisburseFunds: true,
              canSetContributionRules: true,
              canInviteMembers: true
            });
          } else {
            setAdminPrivileges(null);
          }
        }
      }
      
      const membersRes = await fetchWithTimeout(`${BACKEND_URL}/api/groups/${groupId}/members?t=${now}`);
      if (membersRes.ok) {
        const membersList = await safeResponseJson(membersRes);
        if (Array.isArray(membersList)) {
          setMembers(membersList.map(u => mapUserProperties(u)));
        }
      }
    } catch (err) {
      console.log("Error in fetchGroupData:", err.message);
    }
  };

  const fetchUserData = async (email) => {
    setIsLoading(true);
    const now = Date.now();
    try {
      const profRes = await fetchWithTimeout(`${BACKEND_URL}/api/users/profile?email=${email}&t=${now}`);
      if (!profRes.ok) throw new Error("Profile not found");
      const profile = await safeResponseJson(profRes);
      if (!profile) throw new Error("Profile response was not valid JSON");

      const mappedUser = mapUserProperties(profile);
      setSelectedUser(mappedUser);

      try {
        const groupsRes = await fetchWithTimeout(`${BACKEND_URL}/api/groups/my-groups?email=${email}&t=${now}`);
        if (groupsRes.ok) {
          const list = await safeResponseJson(groupsRes);
          if (Array.isArray(list)) {
            setUserGroups(list);
            if (list.length > 0) {
              setCurrentGroup(list[0]);
              await fetchGroupData(list[0].id, email);
            } else {
              setCurrentGroup(null);
              setGroupStats(null);
              setAnnouncements([]);
            }
          }
        }
      } catch (gErr) {
        console.log("Error loading groups in fetchUserData:", gErr.message);
      }

      const txRes = await fetchWithTimeout(`${BACKEND_URL}/api/savings/transactions?email=${email}&t=${now}`);
      if (txRes.ok) {
        const txList = await safeResponseJson(txRes);
        if (Array.isArray(txList)) {
          setTransactions(txList.map((t, idx) => ({
            id: t.id || idx,
            type: t.type,
            amount: t.amount,
            date: t.date,
            status: t.status,
            isIncome: t.amount > 0
          })));
        }
      }

      const goalsRes = await fetchWithTimeout(`${BACKEND_URL}/api/savings/goals?email=${email}&t=${now}`);
      if (goalsRes.ok) {
        const goalsList = await safeResponseJson(goalsRes);
        if (Array.isArray(goalsList)) {
          setSavingsGoals(goalsList.map(g => ({
            id: g.id,
            title: g.name,
            target: g.targetAmount,
            current: g.savedAmount,
            deadline: g.deadline,
            badge: g.badge
          })));
        }
      }

      let initialLoans = [];
      const loansRes = await fetchWithTimeout(`${BACKEND_URL}/api/loans?t=${now}`);
      if (loansRes.ok) {
        const loansList = await safeResponseJson(loansRes);
        if (Array.isArray(loansList)) {
          initialLoans = loansList;
          setLoans(initialLoans);
        }
      }

      let initialMembers = [];
      const listRes = await fetchWithTimeout(`${BACKEND_URL}/api/users/list?t=${now}`);
      if (listRes.ok) {
        const usersList = await safeResponseJson(listRes);
        if (Array.isArray(usersList)) {
          initialMembers = usersList.map(u => mapUserProperties(u));
          setMembers(initialMembers);
        }
      }

      const userAddr = mappedUser?.address;
      if (userAddr && isValidEVMAddress(userAddr)) {
        try {
          console.log(`Syncing on-chain data for: ${userAddr}`);
          const onChainScore = await fetchOnChainCreditScore(userAddr);
          const onChainLoop = await fetchOnChainLoopBalance(userAddr);

          try {
            const vaultDetails = await fetchOnChainVaultDetails();
            if (vaultDetails.vaultBalance > 0) setVaultBalance(vaultDetails.vaultBalance);
            if (vaultDetails.name && vaultDetails.name !== "Green Savers Eldoret") {
              setChamaName(vaultDetails.name);
            }
          } catch (vaultErr) {
            console.log("On-chain vault sync failed, using defaults:", vaultErr.message);
          }

          try {
            const onChainMembers = await fetchOnChainMembers();
            if (onChainMembers.length > 0) {
              const syncedMembers = initialMembers.map(m => {
                const chainMem = onChainMembers.find(cm => cm.address.toLowerCase() === m.address.toLowerCase());
                if (chainMem) return { ...m, savings: chainMem.totalContribution };
                return m;
              });
              setMembers(syncedMembers);
              const currentUserChainMem = onChainMembers.find(cm => cm.address.toLowerCase() === userAddr.toLowerCase());
              if (currentUserChainMem) mappedUser.savings = currentUserChainMem.totalContribution;
            }
          } catch (memErr) {
            console.log("On-chain member sync failed, using DB fallbacks:", memErr.message);
          }

          try {
            const onChainLoansList = await fetchOnChainLoans();
            if (onChainLoansList && onChainLoansList.length > 0) {
              setLoans(onChainLoansList);
              const userActiveLoans = onChainLoansList.filter(l => l.borrower.toLowerCase() === userAddr.toLowerCase() && l.active && !l.repaid);
              mappedUser.activeLoan = userActiveLoans.reduce((sum, l) => sum + l.amount, 0);
            }
          } catch (loanErr) {
            console.log("On-chain loans sync failed, using DB fallbacks:", loanErr.message);
          }

          mappedUser.creditScore = onChainScore;
          mappedUser.loopPoints = onChainLoop;
          setSelectedUser({ ...mappedUser });
          console.log("Smart Contract synchronization complete.");
        } catch (chainErr) {
          console.log("On-chain read failed, falling back to database/mock data:", chainErr.message);
        }
      }

      setIsLoading(false);
      return mappedUser;
    } catch (error) {
      setIsLoading(false);
      showBanner("Failed to synchronize data with database", "error");
      console.log("fetchUserData error:", error);
    }
  };

  const fetchRegisteredUsers = async () => {
    const fetchUrl = `${BACKEND_URL}/api/users/list?t=${Date.now()}`;
    console.log(`[fetchRegisteredUsers] Fetching users list from: ${fetchUrl}`);
    try {
      const response = await fetchWithTimeout(fetchUrl);
      if (response.ok) {
        const usersList = await safeResponseJson(response);
        if (usersList && Array.isArray(usersList)) {
          console.log(`[fetchRegisteredUsers] Successfully loaded ${usersList.length} users.`);
          setRegisteredUsers(usersList.map(u => mapUserProperties(u)));
        }
      }
    } catch (e) {
      console.log("Failed to fetch registered users list:", e);
    }
  };

  // Log backend URL on startup
  useEffect(() => {
    console.log(`====================================================`);
    console.log(`🚀 PayLoop Mobile connecting to backend URL: ${BACKEND_URL}`);
    console.log(`====================================================`);
  }, []);

  // Splash auto-advance
  useEffect(() => {
    if (currentScreen === "splash") {
      const timer = setTimeout(() => {
        setCurrentScreen("onboarding");
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, [currentScreen]);

  // Auto-hide message banner
  useEffect(() => {
    if (banner) {
      const timer = setTimeout(() => {
        setBanner(null);
      }, 3500);
      return () => clearTimeout(timer);
    }
  }, [banner]);

  // OTP Timer countdown
  useEffect(() => {
    if (currentScreen === "verification" && otpTimer > 0) {
      const interval = setInterval(() => {
        setOtpTimer((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [currentScreen, otpTimer]);

  // Dashboard skeleton loader trigger
  useEffect(() => {
    if (currentScreen === "dashboard") {
      setIsDashboardLoading(true);
      const timer = setTimeout(() => {
        setIsDashboardLoading(false);
      }, 1200);
      return () => clearTimeout(timer);
    }
  }, [currentScreen]);

  // Fetch registered users when entering sandbox selector screen
  useEffect(() => {
    if (currentScreen === "login") {
      fetchRegisteredUsers();
    }
  }, [currentScreen]);

  // Admin sync trigger
  useEffect(() => {
    if (!currentGroup || !selectedUser) return;
    const gId = currentGroup.id;
    if (activeSubScreen === "adminDashboard") {
      fetchAdminDashboard(gId);
    } else if (activeSubScreen === "adminApprovals") {
      fetchAdminApprovals(gId);
    } else if (activeSubScreen === "adminFinancialRules" || activeSubScreen === "groupSettings") {
      fetchAdminFinancialRules(gId);
    } else if (activeSubScreen === "adminLoanManagement" || activeSubScreen === "disbursement") {
      fetchAdminLoans(gId);
    } else if (activeSubScreen === "adminGovernance") {
      fetchAdminPolls(gId);
    } else if (activeSubScreen === "adminMeetings") {
      fetchAdminMeetings(gId);
    } else if (activeSubScreen === "adminSecurity") {
      fetchAdminAuditLogs(gId);
    } else if (activeSubScreen === "adminMemberManagement" || activeSubScreen === "groupMembers") {
      fetchAdminMembers(gId);
    } else if (activeSubScreen === "adminReports") {
      fetchAdminReports(gId);
    } else if (activeSubScreen === "superAdminPanel") {
      fetchSuperAdminData();
    }
  }, [activeSubScreen, currentGroup, selectedUser]);

  // Forms states
  const [depositAmount, setDepositAmount] = useState("100"); 
  const [paymentMethod, setPaymentMethod] = useState("mpesa"); 
  const [requestAmount, setRequestAmount] = useState("15000"); 
  const [requestPurpose, setRequestPurpose] = useState("Business");
  const [requestDuration, setRequestDuration] = useState("6 months");
  const [requestNote, setRequestNote] = useState("");
  const [loansSubTab, setLoansSubTab] = useState("request"); 
  const [showLoanRequestModal, setShowLoanRequestModal] = useState(false);
  const [loanHistoryFilter, setLoanHistoryFilter] = useState("All"); 
  const [securityPinToggle, setSecurityPinToggle] = useState(true);
  const [securityBiometricToggle, setSecurityBiometricToggle] = useState(true);
  const [appearanceTheme, setAppearanceTheme] = useState("Light"); 
  const [appearanceFontSize, setAppearanceFontSize] = useState("Standard");

  const getFontSize = (baseSize) => {
    if (appearanceFontSize === "Large") return baseSize * 1.25;
    if (appearanceFontSize === "Extra Large") return baseSize * 1.5;
    return baseSize;
  };

  const isDark = appearanceTheme === "Dark";
  const themeBg = isDark ? "#0F172A" : "#F9FAFB";
  const themeCardBg = isDark ? "#1E293B" : "#ffffff";
  const themeTextColor = isDark ? "#F8FAFC" : "#1E293B";
  const themeBorderColor = isDark ? "#334155" : "#E2E8F0";
  const themeSubtitleColor = isDark ? "#94A3B8" : "#64748B";
  const themeHeaderBg = isDark ? "#0F172A" : "#ffffff";
  const themeDividerColor = isDark ? "#334155" : "#F1F5F9";

  // Tab transition trigger for loan request form modal
  useEffect(() => {
    if (activeTab === "loans" && loansSubTab === "request") {
      setShowLoanRequestModal(true);
      setLoansSubTab("");
    }
  }, [activeTab, loansSubTab]);

  const [connectedWalletAddress, setConnectedWalletAddress] = useState("");

  const convertUsdc = (amountUsdc) => {
    const val = parseFloat(amountUsdc) || 0;
    if (currency === "KES") {
      return val * KES_PER_USDC;
    }
    return val;
  };

  const formatValue = (amountUsdc) => {
    const converted = convertUsdc(amountUsdc);
    return currency === "KES"
      ? `KES ${converted.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
      : `${converted.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USDC`;
  };

  const getCreditTier = (score) => {
    if (score >= 800) {
      return { name: "Platinum", color: "#0F9D58", bg: "rgba(15, 157, 88,0.08)", rate: 5, badge: "💎 Platinum" };
    } else if (score >= 650) {
      return { name: "Gold", color: "#D4AF37", bg: "rgba(212,175,55,0.08)", rate: 7.5, badge: "⭐ Gold" };
    } else if (score >= 400) {
      return { name: "Silver", color: "#718096", bg: "rgba(113,128,150,0.08)", rate: 10, badge: "🔘 Silver" };
    } else {
      return { name: "Bronze", color: "#CD7F32", bg: "rgba(205,127,50,0.08)", rate: 12, badge: "🟫 Bronze" };
    }
  };

  // Manual Sign In logic
  const handleManualLogin = async () => {
    if (!loginEmail || !loginPassword) {
      Alert.alert("Input Error", "Please fill in all fields.");
      return;
    }
    setIsLoading(true);
    const user = registeredUsers.find(
      (u) => 
        (u.email && u.email.toLowerCase() === loginEmail.toLowerCase()) ||
        (u.phone && u.phone.replace(/[^0-9]/g, "") === loginEmail.replace(/[^0-9]/g, ""))
    );
    
    if (user && (loginPassword === user.pin || loginPassword === "123456" || loginPassword === user.password)) {
      setSelectedUser(user);
      const userObj = await fetchUserData(user.email);
      setIsLoading(false);
      setLoginEmail("");
      setLoginPassword("");
      if (userObj && userObj.verification_level === "BASIC") {
        setCurrentScreen("completeProfile");
      } else {
        setCurrentScreen("dashboard");
      }
      showBanner("Access granted!", "success");
    } else {
      setIsLoading(false);
      Alert.alert("Authentication Failed", "No matching user found with the provided credentials.");
    }
  };

  // Stepper Registration Handlers
  const handleRegisterNext = async () => {
    if (regStep === 1) {
      if (!regEmail || !regPhone || !regPassword || !regConfirmPassword) {
        showBanner("Please fill in all details.", "error");
        return;
      }
      if (regPassword !== regConfirmPassword) {
        showBanner("Passwords do not match.", "error");
        return;
      }
      setRegStep(2);
    } else if (regStep === 2) {
      if (groupSetupChoice === "join" && !inviteCode) {
        showBanner("Please enter a Chama invitation code.", "error");
        return;
      }
      if (groupSetupChoice === "create" && !createdGroupName) {
        showBanner("Please enter a Chama name.", "error");
        return;
      }
      setRegStep(3);
    }
  };

  const handleCompleteRegister = async () => {
    if (!createdPin) {
      showBanner("Please set up your security PIN.", "error");
      return;
    }
    if (createdPin.length !== 6) {
      showBanner("PIN must be exactly 6 digits.", "error");
      return;
    }
    setIsLoading(true);
    try {
      const newUser = {
        email: regEmail,
        name: regEmail.split("@")[0].toUpperCase(),
        phone: regPhone,
        pin: createdPin,
        avatar: profAvatarUri || "👤",
        gender: "Not Specified",
        maritalStatus: "Single",
        occupation: "Not Specified",
        dob: "Not Specified",
        county: "Not Specified",
        bio: `Active Member of Chama ${createdGroupName || chamaName}`,
        nationalId: "",
        referralCode: regReferral,
        walletAddress: connectedWalletAddress || undefined
      };

      const response = await fetchWithTimeout(`${BACKEND_URL}/api/users/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newUser)
      });
      const data = await response.json();

      if (!response.ok) {
        setIsLoading(false);
        showBanner(data.error || "Profile registration failed", "error");
        return;
      }

      if (groupSetupChoice === "create" && createdGroupName) {
        try {
          const groupRes = await fetchWithTimeout(`${BACKEND_URL}/api/groups/create`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              name: createdGroupName,
              description: createdGroupDesc || "Active chama circle",
              category: "Chama",
              maxMembers: 100,
              contributionAmount: parseFloat(createdGroupContrib) || 500.0,
              contributionFrequency: "Weekly",
              loanInterestRate: 10.0,
              votingThreshold: 50,
              email: regEmail
            })
          });
          const groupData = await groupRes.json();
          if (groupRes.ok) {
            setCurrentGroupRole("Admin");
            setAdminPrivileges(groupData.adminPrivileges || {
              canApproveLoans: true, canRejectLoans: true, canRemoveMembers: true,
              canPromoteMembers: true, canPostAnnouncements: true, canEditGroupSettings: true,
              canViewAllTransactions: true, canDisburseFunds: true, canSetContributionRules: true,
              canInviteMembers: true
            });
            if (groupData.group) {
              setCurrentGroup(groupData.group);
              setChamaName(groupData.group.name);
            }
            showBanner(`Chama "${createdGroupName}" created! You are the Admin.`, "success");
          }
        } catch (gErr) {
          console.log("Failed to create group:", gErr.message);
        }
      } else if (groupSetupChoice === "join" && inviteCode) {
        try {
          const joinRes = await fetchWithTimeout(`${BACKEND_URL}/api/groups/join`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              inviteCode: inviteCode,
              email: regEmail
            })
          });
          const joinData = await joinRes.json();
          if (joinRes.ok) {
            showBanner("Joined chama circle successfully!", "success");
          } else {
            showBanner(joinData.error || "Failed to join Chama", "error");
          }
        } catch (jErr) {
          console.log("Failed to join group:", jErr.message);
        }
      }

      try {
        await fetchUserData(regEmail);
      } catch (fetchErr) {
        console.log("fetchUserData after registration failed:", fetchErr.message);
        setSelectedUser({
          name: regEmail.split("@")[0].toUpperCase(),
          email: regEmail,
          phone: regPhone,
          bio: `Active Member`,
          occupation: "Not Specified",
          dob: "Not Specified",
          county: "Not Specified",
          gender: "Not Specified",
          maritalStatus: "Single",
          avatar: profAvatarUri || "👤",
          address: connectedWalletAddress || "0x0000000000000000000000000000000000000000",
          balance: 1000,
          savings: 0,
          activeLoan: 0,
          creditScore: 500,
          loopPoints: 0,
          verification_level: "UNVERIFIED"
        });
      }

      setIsLoading(false);
      setCurrentScreen("pin"); // Redirect to PIN screen
      setRegStep(1); 
      Alert.alert(
        "Welcome to PayLoop!",
        `Your account has been successfully created.\n\nPlease enter your new 6-digit PIN to log in.`,
        [{ text: "Continue", style: "default" }]
      );
    } catch (error) {
      setIsLoading(false);
      showBanner("Failed to synchronize data with database", "error");
      console.log("fetchUserData error:", error);
    }
  };

  // Profile Edit fields temp state
  const [editName, setEditName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editBio, setEditBio] = useState("");
  const [editMarital, setEditMarital] = useState("");
  const [editAvatarUri, setEditAvatarUri] = useState("");
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);
  const [editOccupation, setEditOccupation] = useState("");
  const [editDob, setEditDob] = useState("");
  const [editGender, setEditGender] = useState("");
  const [editCounty, setEditCounty] = useState("");
  const [editAddress, setEditAddress] = useState("");
  const [editNationalId, setEditNationalId] = useState("");
  const [editIdDocument, setEditIdDocument] = useState("");
  const [editSelfie, setEditSelfie] = useState("");

  // MetaMask modal signature simulation states
  const [showMetaMaskModal, setShowMetaMaskModal] = useState(false);
  const [txDetails, setTxDetails] = useState({ title: "", amount: "", gas: "0.001" });
  const [onConfirmTx, setOnConfirmTx] = useState(null);

  // M-Pesa SIM Toolkit STK Push simulation states
  const [showStkModal, setShowStkModal] = useState(false);
  const [stkPinCode, setStkPinCode] = useState("");
  const [stkPayDetails, setStkPayDetails] = useState({ title: "", amountFormatted: "", onFinish: null });

  // Shareable Digital Receipt states
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [receiptDetails, setReceiptDetails] = useState({ txId: "", title: "", amount: 0, date: "", recipient: "" });

  // USSD Offline Simulator states
  const [ussdInputText, setUssdInputText] = useState("");
  const [ussdDisplayScreen, setUssdDisplayScreen] = useState("main"); // 'main' | 'balance' | 'save' | 'loan' | 'score' | 'announcements' | 'save_success' | 'loan_success'
  const [ussdAmountEntered, setUssdAmountEntered] = useState("");

  // UI Search/Filter states
  const [txFilter, setTxFilter] = useState("All");
  const [searchMemberQuery, setSearchMemberQuery] = useState("");

  // Open Edit Profile
  const openEditProfile = () => {
    setEditName(selectedUser.name || "");
    setEditEmail(selectedUser.email || "");
    setEditPhone(selectedUser.phone || "");
    setEditBio(selectedUser.bio || "");
    setEditMarital(selectedUser.maritalStatus || "");
    setEditAvatarUri(selectedUser.avatarUri || "");
    setEditOccupation(selectedUser.occupation || "");
    setEditDob(selectedUser.dob || "");
    setEditGender(selectedUser.gender || "");
    setEditCounty(selectedUser.county || "");
    setEditAddress(selectedUser.address || "");
    setEditNationalId(selectedUser.nationalId || "");
    setEditIdDocument(selectedUser.id_document || "");
    setEditSelfie(selectedUser.selfie || "");
    setActiveSubScreen("editProfile");
  };

  // Save Edit Profile
  const handleSaveProfile = async () => {
    setIsLoading(true);
    const finalVerificationLevel = (editIdDocument && editSelfie) ? "FULLY_VERIFIED" : "UNVERIFIED";
    try {
      const response = await fetchWithTimeout(`${BACKEND_URL}/api/users/update-profile`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: selectedUser.email,
          name: editName,
          phone: editPhone,
          bio: editBio,
          maritalStatus: editMarital,
          avatar: editAvatarUri || selectedUser.avatar,
          occupation: editOccupation,
          dob: editDob,
          gender: editGender,
          county: editCounty,
          address: editAddress,
          nationalId: editNationalId,
          id_document: editIdDocument,
          selfie: editSelfie,
          verification_level: finalVerificationLevel
        })
      });
      const data = await response.json();
      setIsLoading(false);
      if (response.ok) {
        setSelectedUser((prev) => ({
          ...prev,
          name: editName,
          phone: editPhone,
          bio: editBio,
          maritalStatus: editMarital,
          avatarUri: editAvatarUri || prev.avatarUri,
          avatar: editAvatarUri || prev.avatar,
          occupation: editOccupation,
          dob: editDob,
          gender: editGender,
          county: editCounty,
          address: editAddress,
          nationalId: editNationalId,
          id_document: editIdDocument,
          selfie: editSelfie,
          verification_level: finalVerificationLevel
        }));
        showBanner("Profile updated successfully!", "success");
        if (finalVerificationLevel === "FULLY_VERIFIED") {
          setActiveSubScreen(null);
        } else {
          setActiveSubScreen("profile");
        }
      } else {
        showBanner(data.error || "Failed to update profile", "error");
      }
    } catch (e) {
      setIsLoading(false);
      setSelectedUser((prev) => ({
        ...prev,
        name: editName,
        phone: editPhone,
        bio: editBio,
        maritalStatus: editMarital,
        avatarUri: editAvatarUri || prev.avatarUri,
        avatar: editAvatarUri || prev.avatar,
        occupation: editOccupation,
        dob: editDob,
        gender: editGender,
        county: editCounty,
        address: editAddress,
        nationalId: editNationalId,
        id_document: editIdDocument,
        selfie: editSelfie,
        verification_level: finalVerificationLevel
      }));
      showBanner("Profile saved locally (offline mode)", "info");
      if (finalVerificationLevel === "FULLY_VERIFIED") {
        setActiveSubScreen(null);
      } else {
        setActiveSubScreen("profile");
      }
    }
  };

  // Register push notifications
  const registerPushNotifications = async (tokenValue) => {
    if (!selectedUser || !selectedUser.email) {
      showBanner("Please log in to register push notifications", "error");
      return;
    }
    setIsLoading(true);
    try {
      const response = await fetchWithTimeout(`${BACKEND_URL}/api/users/update-profile`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: selectedUser.email,
          pushToken: tokenValue
        })
      });
      const data = await response.json();
      setIsLoading(false);
      if (response.ok && data.success) {
        setSelectedUser((prev) => ({
          ...prev,
          pushToken: tokenValue,
          push_token: tokenValue
        }));
        showBanner("Push token registered successfully!", "success");
        
        const newNotif = {
          id: String(Date.now()),
          title: "🔔 Push Alerts Active",
          message: "This device is now registered to receive contribution reminders and loan status updates.",
          time: "Just now",
          icon: "📲",
          read: false
        };
        setNotifications((prev) => [newNotif, ...prev]);
      } else {
        showBanner(data.error || "Failed to register push token", "error");
      }
    } catch (e) {
      setIsLoading(false);
      showBanner("Failed to connect to backend", "error");
      console.log(e);
    }
  };

  // Trigger Receipt modal
  const launchDigitalReceipt = (title, amountUsdc, recipient) => {
    const txId = "TX-MPESA-" + Math.floor(100000 + Math.random() * 900000) + "K";
    setReceiptDetails({
      txId,
      title,
      amount: amountUsdc,
      date: new Date().toLocaleString(),
      recipient
    });
    setShowReceiptModal(true);
  };

  // Share digital receipt
  const handleShareReceipt = async () => {
    try {
      const text = `PayLoop Receipt:\nStatus: Success\nTransaction ID: ${receiptDetails.txId}\nAmount: ${formatValue(receiptDetails.amount)}\nDate: ${receiptDetails.date}\nRecipient: ${receiptDetails.recipient}`;
      Alert.alert("Share Receipt", text);
    } catch (error) {
      console.log("Error sharing receipt:", error);
    }
  };

  // Signature Request simulator
  const requestSignature = (title, amount, onConfirm) => {
    setTxDetails({ title, amount, gas: "0.001" });
    setOnConfirmTx(() => onConfirm);
    setShowMetaMaskModal(true);
  };

  // Handle MetaMask modal confirm
  const handleMetaMaskConfirm = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setShowMetaMaskModal(false);
      if (onConfirmTx) {
        onConfirmTx();
      }
    }, 1200);
  };

  // Submit Contribution Flow
  const handleContributeSubmit = () => {
    const rawVal = parseFloat(depositAmount);
    if (isNaN(rawVal) || rawVal <= 0) {
      showBanner("Please enter a valid contribution amount.", "error");
      return;
    }
    const amountUsdc = currency === "KES" ? rawVal / KES_PER_USDC : rawVal;

    const executePayment = async () => {
      setIsLoading(true);
      try {
        let txHash = "";
        try {
          console.log(`Submitting on-chain contribution for: ${selectedUser.address}`);
          txHash = await executeOnChainContribution(selectedUser.address, amountUsdc);
          console.log(`On-chain contribution tx confirmed: ${txHash}`);
        } catch (chainErr) {
          console.log("On-chain contribution simulated/skipped:", chainErr.message);
        }

        const response = await fetchWithTimeout(`${BACKEND_URL}/api/savings/contribute`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: selectedUser.email,
            amount: amountUsdc,
            paymentMethod: paymentMethod === "metamask" ? "MetaMask" : "M-Pesa",
            reference: txHash || undefined
          })
        });
        const data = await response.json();
        if (response.ok) {
          await fetchUserData(selectedUser.email);
          
          const newNotif = {
            id: Date.now(),
            title: "Contribution Succeeded",
            message: `Your deposit of ${formatValue(amountUsdc)} has been safely locked in the CircleVault contract.`,
            time: "Just now",
            icon: "🟢"
          };
          setNotifications([newNotif, ...notifications]);

          setActiveSubScreen(null);
          setActiveTab("home");
          showBanner("Contribution successfully locked! 🎉", "success");

          setTimeout(() => {
            launchDigitalReceipt("Contribution Deposit", amountUsdc, "Green Future Chama Vault");
          }, 300);
        } else {
          setIsLoading(false);
          showBanner(data.error || "Contribution failed", "error");
        }
      } catch (e) {
        setIsLoading(false);
        showBanner("Failed to connect to savings relayer", "error");
        console.log(e);
      }
    };

    if (paymentMethod === "metamask") {
      requestSignature("Group Vault Contribution", `${amountUsdc.toFixed(2)} USDC`, executePayment);
    } else {
      setStkPinCode("");
      setStkPayDetails({
        title: "Green Future Chama Vault",
        amountFormatted: formatValue(amountUsdc),
        onFinish: executePayment
      });
      setShowStkModal(true);
    }
  };

  // Handle USSD simulation submit input
  const handleUssdSubmitInput = () => {
    const input = ussdInputText.trim();
    setUssdInputText("");

    if (ussdDisplayScreen === "main") {
      if (input === "1") {
        setUssdDisplayScreen("balance");
      } else if (input === "2") {
        setUssdDisplayScreen("save");
        setUssdAmountEntered("");
      } else if (input === "3") {
        setUssdDisplayScreen("loan");
        setUssdAmountEntered("");
      } else if (input === "4") {
        setUssdDisplayScreen("score");
      } else if (input === "5") {
        setUssdDisplayScreen("announcements");
      } else {
        Alert.alert("Invalid Choice", "Please enter 1, 2, 3, 4, or 5.");
      }
    } else if (ussdDisplayScreen === "balance") {
      if (input === "0") setUssdDisplayScreen("main");
    } else if (ussdDisplayScreen === "save") {
      if (input === "0") {
        setUssdDisplayScreen("main");
      } else {
        const amt = parseFloat(input);
        if (isNaN(amt) || amt <= 0) {
          Alert.alert("Error", "Enter a valid amount.");
        } else {
          setUssdAmountEntered(amt);
          setUssdDisplayScreen("save_success");
          
          const amountUsdc = currency === "KES" ? amt / KES_PER_USDC : amt;
          setSelectedUser((prev) => ({
            ...prev,
            savings: prev.savings + amountUsdc
          }));
        }
      }
    } else if (ussdDisplayScreen === "save_success") {
      if (input === "0") setUssdDisplayScreen("main");
    } else if (ussdDisplayScreen === "loan") {
      if (input === "0") {
        setUssdDisplayScreen("main");
      } else {
        const amt = parseFloat(input);
        if (isNaN(amt) || amt <= 0) {
          Alert.alert("Error", "Enter a valid amount.");
        } else {
          setUssdAmountEntered(amt);
          setUssdDisplayScreen("loan_success");

          const amountUsdc = currency === "KES" ? amt / KES_PER_USDC : amt;
          const tier = getCreditTier(selectedUser.creditScore);
          const newLoan = {
            id: loans.length,
            borrower: selectedUser.name,
            address: selectedUser.address,
            amount: amountUsdc,
            interestRate: tier.rate,
            duration: 6,
            votesFor: 0,
            votesAgainst: 0,
            active: true,
            approved: false,
            repaid: false,
            repaymentDeadline: 0,
            purpose: "USSD Request"
          };
          setLoans([newLoan, ...loans]);
        }
      }
    } else if (ussdDisplayScreen === "loan_success") {
      if (input === "0") setUssdDisplayScreen("main");
    } else if (ussdDisplayScreen === "score") {
      if (input === "0") setUssdDisplayScreen("main");
    } else if (ussdDisplayScreen === "announcements") {
      if (input === "0") setUssdDisplayScreen("main");
    }
  };

  return (
    <AppContext.Provider
      value={{
        currentScreen, setCurrentScreen,
        loginMethod, setLoginMethod,
        loginEmail, setLoginEmail,
        loginPassword, setLoginPassword,
        focusedInput, setFocusedInput,
        permission, requestPermission,
        activeTab, setActiveTab,
        activeSubScreen, setActiveSubScreen,
        currency, setCurrency,
        onboardingIndex, setOnboardingIndex,
        isRefreshing, setIsRefreshing,
        isDashboardLoading, setIsDashboardLoading,
        showQrScanner, setShowQrScanner,
        savingsGoal, setSavingsGoal,
        savingsGoals, setSavingsGoals,
        historyFilterMonth, setHistoryFilterMonth,
        historyFilterMethod, setHistoryFilterMethod,
        historyFilterStatus, setHistoryFilterStatus,
        showAddGoalModal, setShowAddGoalModal,
        newGoalTitle, setNewGoalTitle,
        newGoalTarget, setNewGoalTarget,
        newGoalDeadline, setNewGoalDeadline,
        newGoalBadge, setNewGoalBadge,
        BACKEND_URL,
        fetchWithTimeout,
        safeResponseJson,
        mapUserProperties,
        selectedUser, setSelectedUser,
        registeredUsers, setRegisteredUsers,
        isDrawerOpen, setIsDrawerOpen,
        userGroups, setUserGroups,
        currentGroup, setCurrentGroup,
        groupStats, setGroupStats,
        announcements, setAnnouncements,
        currentGroupRole, setCurrentGroupRole,
        adminPrivileges, setAdminPrivileges,
        adminDashboardData, setAdminDashboardData,
        adminApprovalsList, setAdminApprovalsList,
        adminFinancialRules, setAdminFinancialRules,
        adminLoansList, setAdminLoansList,
        adminLoansAnalytics, setAdminLoansAnalytics,
        adminPollsList, setAdminPollsList,
        adminMeetingsList, setAdminMeetingsList,
        adminAuditLogs, setAdminAuditLogs,
        adminMembersList, setAdminMembersList,
        adminReportsData, setAdminReportsData,
        superAdminData, setSuperAdminData,
        newPollTitle, setNewPollTitle,
        newPollDesc, setNewPollDesc,
        newPollOptions, setNewPollOptions,
        newPollQuorum, setNewPollQuorum,
        newPollType, setNewPollType,
        showAddPollModal, setShowAddPollModal,
        broadcastTitle, setBroadcastTitle,
        broadcastContent, setBroadcastContent,
        newMeetingTitle, setNewMeetingTitle,
        newMeetingAgenda, setNewMeetingAgenda,
        newMeetingLocation, setNewMeetingLocation,
        newMeetingDate, setNewMeetingDate,
        newMeetingType, setNewMeetingType,
        showAddMeetingModal, setShowAddMeetingModal,
        appSubTab, setAppSubTab,
        selectedApprovalIds, setSelectedApprovalIds,
        reviewNotes, setReviewNotes,
        restructureLoanId, setRestructureLoanId,
        newLoanDuration, setNewLoanDuration,
        newLoanInterest, setNewLoanInterest,
        rulesContributionAmount, setRulesContributionAmount,
        rulesPenaltyRate, setRulesPenaltyRate,
        rulesMultiplier, setRulesMultiplier,
        rulesInterestRate, setRulesInterestRate,
        rulesEmergency, setRulesEmergency,
        rulesWithdrawal, setRulesWithdrawal,
        rulesGracePeriod, setRulesGracePeriod,
        regStep, setRegStep,
        regNationalId, setRegNationalId,
        regReferral, setRegReferral,
        groupSetupChoice, setGroupSetupChoice,
        createdGroupName, setCreatedGroupName,
        createdGroupDesc, setCreatedGroupDesc,
        createdGroupContrib, setCreatedGroupContrib,
        inviteCode, setInviteCode,
        regName, setRegName,
        regEmail, setRegEmail,
        regPhone, setRegPhone,
        regPassword, setRegPassword,
        regConfirmPassword, setRegConfirmPassword,
        otpCode, setOtpCode,
        otpTimer, setOtpTimer,
        sentOtp, setSentOtp,
        createdPin, setCreatedPin,
        isConfirmingPin, setIsConfirmingPin,
        tempPin, setTempPin,
        pinCode, setPinCode,
        profGender, setProfGender,
        profDob, setProfDob,
        profMarital, setProfMarital,
        profOccupation, setProfOccupation,
        profCounty, setProfCounty,
        profBio, setProfBio,
        profAvatarUri, setProfAvatarUri,
        phoneForVerification, setPhoneForVerification,
        verificationSmsCode, setVerificationSmsCode,
        isVerificationSmsSent, setIsVerificationSmsSent,
        isPhoneVerifiedState, setIsPhoneVerifiedState,
        selectedDocType, setSelectedDocType,
        idDocUri, setIdDocUri,
        selfieUri, setSelfieUri,
        isScanningDoc, setIsScanningDoc,
        isScanningFace, setIsScanningFace,
        isSubmittingVerification, setIsSubmittingVerification,
        verificationSuccess, setVerificationSuccess,
        chamaName, setChamaName,
        vaultBalance, setVaultBalance,
        loans, setLoans,
        transactions, setTransactions,
        notifications, setNotifications,
        members, setMembers,
        isLoading, setIsLoading,
        banner, setBanner,
        showBanner,
        convertUsdc,
        formatValue,
        getCreditTier,
        fetchUserData,
        fetchRegisteredUsers,
        handleManualLogin,
        handleRegisterNext,
        handleCompleteRegister,
        fetchAdminDashboard,
        fetchAdminApprovals,
        fetchAdminFinancialRules,
        fetchAdminLoans,
        fetchAdminPolls,
        fetchAdminMeetings,
        fetchAdminAuditLogs,
        fetchAdminMembers,
        fetchAdminReports,
        fetchSuperAdminData,
        fetchGroupData,
        depositAmount, setDepositAmount,
        paymentMethod, setPaymentMethod,
        requestAmount, setRequestAmount,
        requestPurpose, setRequestPurpose,
        requestDuration, setRequestDuration,
        requestNote, setRequestNote,
        loansSubTab, setLoansSubTab,
        showLoanRequestModal, setShowLoanRequestModal,
        loanHistoryFilter, setLoanHistoryFilter,
        securityPinToggle, setSecurityPinToggle,
        securityBiometricToggle, setSecurityBiometricToggle,
        appearanceTheme, setAppearanceTheme,
        connectedWalletAddress, setConnectedWalletAddress,
        isDark, themeBg, themeCardBg, themeTextColor, themeBorderColor, themeSubtitleColor, themeHeaderBg, themeDividerColor,
        appearanceLanguage, setAppearanceLanguage, t, onboardingSlides, handleOnboardingNext, handlePinPress,
        appearanceFontSize, setAppearanceFontSize, getFontSize,
        editName, setEditName, editEmail, setEditEmail, editPhone, setEditPhone, editBio, setEditBio, editMarital, setEditMarital, editAvatarUri, setEditAvatarUri, showAvatarPicker, setShowAvatarPicker,
        editOccupation, setEditOccupation, editDob, setEditDob, editGender, setEditGender, editCounty, setEditCounty, editAddress, setEditAddress, editNationalId, setEditNationalId, editIdDocument, setEditIdDocument, editSelfie, setEditSelfie,
        showMetaMaskModal, setShowMetaMaskModal, txDetails, setTxDetails, onConfirmTx, setOnConfirmTx, requestSignature, handleMetaMaskConfirm,
        showStkModal, setShowStkModal, stkPinCode, setStkPinCode, stkPayDetails, setStkPayDetails,
        showReceiptModal, setShowReceiptModal, receiptDetails, setReceiptDetails, launchDigitalReceipt, handleShareReceipt,
        ussdInputText, setUssdInputText, ussdDisplayScreen, setUssdDisplayScreen, ussdAmountEntered, setUssdAmountEntered, handleUssdSubmitInput,
        txFilter, setTxFilter, searchMemberQuery, setSearchMemberQuery,
        openEditProfile, handleSaveProfile, registerPushNotifications, handleContributeSubmit
      }}
    >
      {children}
    </AppContext.Provider>
  );
};
