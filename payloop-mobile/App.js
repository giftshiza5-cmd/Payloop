import React, { useState, useEffect } from "react";
import { styles } from "./styles";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  TextInput,
  ActivityIndicator,
  Modal,
  Alert,
  Dimensions,
  Share,
  RefreshControl,
  Image,
  Platform
} from "react-native";
import { StatusBar } from "expo-status-bar";
import Svg, { Circle, Path, Line, Polyline, Text as SvgText } from "react-native-svg";
import QRCode from "react-native-qrcode-svg";

const { width } = Dimensions.get("window");

// Constants
const KES_PER_USDC = 130;

// Mock default dataset for demo sandbox simulation
const DEFAULT_MEMBERS = [
  { name: "Mary Wanjiku", handle: "@mary.w", status: "Active", avatar: "👩‍🌾" },
  { name: "Peter Mwangi", handle: "@peterm", status: "Active", avatar: "👨‍🔧" },
  { name: "Grace Njeri", handle: "@gracen", status: "Active", avatar: "👩‍💼" },
  { name: "David Ochieng", handle: "@david.o", status: "Active", avatar: "👨‍🌾" },
  { name: "Esther Muthoni", handle: "@esther.m", status: "Inactive", avatar: "👩‍⚕️" }
];

const DEFAULT_NOTIFICATIONS = [
  { id: 1, title: "Contribution Reminder", message: "You have a contribution of 100 USDC due in 5 days.", time: "2m ago", icon: "⏰" },
  { id: 2, title: "Loan Request Update", message: "Your loan request of 15,000 USDC is under review.", time: "1h ago", icon: "🤝" },
  { id: 3, title: "Contribution Received", message: "Mary Wanjiku contributed 100 USDC to the group.", time: "3h ago", icon: "🟢" },
  { id: 4, title: "Meeting Announcement", message: "Group meeting on 15 May 2024 at 7:00 PM.", time: "1d ago", icon: "📢" }
];

const DEFAULT_TRANSACTIONS = [
  { id: 1, type: "Contribution", amount: -100.00, date: "5 May 2024, 10:30 AM", status: "Completed", isIncome: false },
  { id: 2, type: "Loan Disbursement", amount: 15000.00, date: "2 May 2024, 02:15 PM", status: "Completed", isIncome: true },
  { id: 3, type: "Loan Repayment", amount: -2500.00, date: "28 Apr 2024, 08:20 AM", status: "Completed", isIncome: false },
  { id: 4, type: "Withdrawal Request", amount: -500.00, date: "25 Apr 2024, 11:10 AM", status: "Pending", isIncome: false },
  { id: 5, type: "Contribution", amount: -100.00, date: "21 Apr 2024, 10:30 AM", status: "Completed", isIncome: false }
];

const DEFAULT_LOANS = [
  {
    id: 0,
    borrower: "John Kamau",
    address: "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC",
    amount: 15000.00, // Stored in USDC
    interestRate: 7.5,
    duration: 6,
    votesFor: 4,
    votesAgainst: 1,
    active: true,
    approved: true,
    repaid: false,
    repaymentDeadline: Math.floor(Date.now() / 1000) + 15 * 86400, // 15 days from now
    purpose: "Business Expansion"
  },
  {
    id: 1,
    borrower: "Peter Mwangi",
    address: "0x90F79bf6EB2c4f870365E785982E1f101E93b906",
    amount: 5000.00,
    interestRate: 10,
    duration: 6,
    votesFor: 1,
    votesAgainst: 1,
    active: true,
    approved: false,
    repaid: false,
    repaymentDeadline: 0,
    purpose: "Agriculture Machinery"
  },
  {
    id: 2,
    borrower: "John Kamau",
    address: "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC",
    amount: 2500.00,
    interestRate: 10,
    duration: 3,
    votesFor: 3,
    votesAgainst: 0,
    active: false,
    approved: true,
    repaid: true,
    repaymentDeadline: Math.floor(Date.now() / 1000) - 60 * 86400,
    purpose: "School Fees"
  },
  {
    id: 3,
    borrower: "Mary Wanjiku",
    address: "0x25a56ec7ab88b098defb751b7401b5f6d8976fd",
    amount: 10000.00,
    interestRate: 5,
    duration: 12,
    votesFor: 5,
    votesAgainst: 0,
    active: false,
    approved: true,
    repaid: true,
    repaymentDeadline: Math.floor(Date.now() / 1000) - 120 * 86400,
    purpose: "Medical Clinic Upgrade"
  }
];

export default function App() {
  // Navigation State
  // 'splash' | 'onboarding' | 'welcome' | 'register' | 'verification' | 'createPin' | 'connectWallet' | 'completeProfile' | 'login' | 'pin' | 'dashboard'
  const [currentScreen, setCurrentScreen] = useState("splash");
  
  // Dashboard Tabs: 'home' | 'savings' | 'loans' | 'score' | 'more'
  const [activeTab, setActiveTab] = useState("home");
  
  // Secondary screens under dashboard: null | 'profile' | 'editProfile' | 'notifications' | 'transactions' | 'members' | 'contribute' | 'ussd'
  const [activeSubScreen, setActiveSubScreen] = useState(null);

  // Currency Selector: 'KES' | 'USDC' (Default to KES)
  const [currency, setCurrency] = useState("KES");

  // Onboarding Slides Index
  const [onboardingIndex, setOnboardingIndex] = useState(0);

  // Dashboard Loader & Refresh States
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isDashboardLoading, setIsDashboardLoading] = useState(false);
  const [showQrScanner, setShowQrScanner] = useState(false);
  const [savingsGoal, setSavingsGoal] = useState({
    title: "Chama Tractor Fund",
    target: 2000.00, // USDC
    current: 1250.00, // USDC
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

  let BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL || "http://localhost:5000";
  if (Platform.OS === "android") {
    BACKEND_URL = BACKEND_URL.replace("localhost", "10.0.2.2").replace("127.0.0.1", "10.0.2.2");
  }

  // Helper to run fetch with a timeout
  const fetchWithTimeout = async (url, options = {}, timeout = 6000) => {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout);
    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal
      });
      clearTimeout(id);
      return response;
    } catch (error) {
      clearTimeout(id);
      throw error;
    }
  };

  // Helper to map snake_case database properties to camelCase UI properties
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
      dob: user.dob || "12 Aug 1990"
    };
  };

  // Global User State
  const [selectedUser, setSelectedUser] = useState(null);
  const [registeredUsers, setRegisteredUsers] = useState([]);

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

  const [pinCode, setPinCode] = useState(""); // Stores typed login PIN
  
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
  const [vaultBalance, setVaultBalance] = useState(25000.00); // in MATIC/USDC
  const [loans, setLoans] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [members, setMembers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [banner, setBanner] = useState(null);

  const showBanner = (message, type = "success") => {
    setBanner({ message, type });
  };

  const renderModernHeader = (title, onBackPress) => {
    return (
      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", width: "100%", paddingVertical: 12, marginBottom: 12, borderBottomWidth: 1, borderBottomColor: themeDividerColor }}>
        <TouchableOpacity 
          onPress={onBackPress} 
          style={{
            width: 38, 
            height: 38, 
            borderRadius: 19, 
            backgroundColor: isDark ? "#1E293B" : "#ffffff", 
            borderWidth: 1, 
            borderColor: themeBorderColor, 
            alignItems: "center", 
            justifyContent: "center",
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.04,
            shadowRadius: 2,
            elevation: 1
          }}
        >
          <Text style={{ fontSize: 16, color: themeTextColor, fontWeight: "bold" }}>←</Text>
        </TouchableOpacity>
        <Text style={{ fontSize: 16, fontWeight: "800", color: themeTextColor, flex: 1, textAlign: "center", marginRight: 38 }}>{title}</Text>
      </View>
    );
  };

  // Fetch data for a logged-in user
  const fetchUserData = async (email) => {
    setIsLoading(true);
    try {
      // 1. Fetch profile
      const profRes = await fetchWithTimeout(`${BACKEND_URL}/api/users/profile?email=${email}`);
      if (!profRes.ok) throw new Error("Profile not found");
      const profile = await profRes.json();
      
      // Map loaded user profile properties
      setSelectedUser(mapUserProperties(profile));

      // 2. Fetch transactions
      const txRes = await fetchWithTimeout(`${BACKEND_URL}/api/savings/transactions?email=${email}`);
      if (txRes.ok) {
        const txList = await txRes.json();
        const mappedTxs = txList.map((t, idx) => ({
          id: t.id || idx,
          type: t.type,
          amount: t.amount,
          date: t.date,
          status: t.status,
          isIncome: t.amount > 0
        }));
        setTransactions(mappedTxs);
      }

      // 3. Fetch goals
      const goalsRes = await fetchWithTimeout(`${BACKEND_URL}/api/savings/goals?email=${email}`);
      if (goalsRes.ok) {
        const goalsList = await goalsRes.json();
        const mappedGoals = goalsList.map(g => ({
          id: g.id,
          title: g.name,
          target: g.targetAmount,
          current: g.savedAmount,
          deadline: g.deadline,
          badge: g.badge
        }));
        setSavingsGoals(mappedGoals);
      }

      // 4. Fetch all loans
      const loansRes = await fetchWithTimeout(`${BACKEND_URL}/api/loans`);
      if (loansRes.ok) {
        const loansList = await loansRes.json();
        setLoans(loansList);
      }

      // 5. Fetch registered users list (for members list in dashboard)
      const listRes = await fetchWithTimeout(`${BACKEND_URL}/api/users/list`);
      if (listRes.ok) {
        const usersList = await listRes.json();
        setMembers(usersList.map(u => mapUserProperties(u)));
      }

      setIsLoading(false);
    } catch (error) {
      setIsLoading(false);
      showBanner("Failed to synchronize data with database", "error");
      console.log("fetchUserData error:", error);
    }
  };

  // Fetch all registered users for the sandbox profile picker list
  const fetchRegisteredUsers = async () => {
    try {
      const response = await fetchWithTimeout(`${BACKEND_URL}/api/users/list`);
      if (response.ok) {
        const usersList = await response.json();
        setRegisteredUsers(usersList.map(u => mapUserProperties(u)));
      }
    } catch (e) {
      console.log("Failed to fetch registered users list:", e);
    }
  };

  // Forms states
  const [depositAmount, setDepositAmount] = useState("100"); // Stored in user's typed currency
  const [paymentMethod, setPaymentMethod] = useState("mpesa"); // 'mpesa' | 'metamask'
  const [requestAmount, setRequestAmount] = useState("15000"); // Stored in user's typed currency
  const [requestPurpose, setRequestPurpose] = useState("Business");
  const [requestDuration, setRequestDuration] = useState("6 months");
  const [requestNote, setRequestNote] = useState("");
  const [loansSubTab, setLoansSubTab] = useState("request"); // 'request' | 'my'
  const [showLoanRequestModal, setShowLoanRequestModal] = useState(false);
  const [loanHistoryFilter, setLoanHistoryFilter] = useState("All"); // 'All' | 'Active' | 'Completed' | 'Voting' | 'Approved' | 'Rejected'
  const [securityPinToggle, setSecurityPinToggle] = useState(true);
  const [securityBiometricToggle, setSecurityBiometricToggle] = useState(true);
  const [appearanceTheme, setAppearanceTheme] = useState("Light"); // 'Light' | 'Dark' | 'System'
  const [appearanceLanguage, setAppearanceLanguage] = useState("English"); // 'English' | 'Kiswahili'
  const [appearanceFontSize, setAppearanceFontSize] = useState("Standard"); // 'Standard' | 'Large' | 'Extra Large'
  const [accessibilityHighContrast, setAccessibilityHighContrast] = useState(false);
  const [accessibilityReduceMotion, setAccessibilityReduceMotion] = useState(false);
  const [searchMemberQuery, setSearchMemberQuery] = useState("");
  const [txFilter, setTxFilter] = useState("All"); // 'All' | 'Contributions' | 'Loans' | 'Other'

  // MetaMask/Wallet Overlay states
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

  // Profile Edit fields temp state
  const [editName, setEditName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editBio, setEditBio] = useState("");
  const [editMarital, setEditMarital] = useState("");
  const [editAvatarUri, setEditAvatarUri] = useState("");
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);

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

  const isDark = appearanceTheme === "Dark";
  const themeBg = isDark ? "#0F172A" : "#F9FAFB";
  const themeCardBg = isDark ? "#1E293B" : "#ffffff";
  const themeTextColor = isDark ? "#F8FAFC" : "#1E293B";
  const themeBorderColor = isDark ? "#334155" : "#E2E8F0";
  const themeSubtitleColor = isDark ? "#94A3B8" : "#64748B";
  const themeHeaderBg = isDark ? "#0F172A" : "#ffffff";
  const themeDividerColor = isDark ? "#334155" : "#F1F5F9";

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

  // Tab transition trigger for loan request form modal
  useEffect(() => {
    if (activeTab === "loans" && loansSubTab === "request") {
      setShowLoanRequestModal(true);
      setLoansSubTab("");
    }
  }, [activeTab, loansSubTab]);

  // Fetch registered users when entering sandbox selector screen
  useEffect(() => {
    if (currentScreen === "login") {
      fetchRegisteredUsers();
    }
  }, [currentScreen]);

  // -------------------------------------------------------------
  // CURRENCY CONVERSION & FORMATTING HELPERS
  // -------------------------------------------------------------
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

  // -------------------------------------------------------------
  // CREDITLOOP SCORE TIERS & REPUTATION BADGES
  // -------------------------------------------------------------
  const getCreditTier = (score) => {
    if (score >= 800) {
      return { name: "Platinum", color: "#00875A", bg: "rgba(0,135,90,0.08)", rate: 5, badge: "💎 Platinum" };
    } else if (score >= 650) {
      return { name: "Gold", color: "#D4AF37", bg: "rgba(212,175,55,0.08)", rate: 7.5, badge: "⭐ Gold" };
    } else if (score >= 400) {
      return { name: "Silver", color: "#718096", bg: "rgba(113,128,150,0.08)", rate: 10, badge: "🔘 Silver" };
    } else {
      return { name: "Bronze", color: "#CD7F32", bg: "rgba(205,127,50,0.08)", rate: 12, badge: "🟫 Bronze" };
    }
  };

  // -------------------------------------------------------------
  // SIM SIMULATOR HANDLERS
  // -------------------------------------------------------------

  // STK PIN entries
  const handleStkPinPress = (key) => {
    if (key === "back") {
      setStkPinCode((prev) => prev.slice(0, -1));
    } else {
      if (stkPinCode.length < 4) {
        const newPin = stkPinCode + key;
        setStkPinCode(newPin);
        if (newPin.length === 4) {
          setIsLoading(true);
          setTimeout(() => {
            setIsLoading(false);
            setShowStkModal(false);
            setStkPinCode("");
            if (stkPayDetails.onFinish) {
              stkPayDetails.onFinish();
            }
          }, 1500);
        }
      }
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
      await Share.share({ message: text });
    } catch (e) {
      console.log("Error sharing", e);
    }
  };

  // Handle demo wallet logins
  const handleSandboxLogin = (userType) => {
    let mockData = {};
    if (userType === "wanjiku") {
      mockData = {
        name: "Mary Wanjiku",
        email: "wanjiku@savers.ke",
        phone: "+254 722 111 222",
        bio: "Dedicated market vendor and savings circle leader.",
        maritalStatus: "Married",
        occupation: "Retail Trader",
        gender: "Female",
        dob: "14 May 1978",
        address: "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC",
        savings: 85200.00,
        balance: 12450.00,
        activeLoan: 0.00,
        creditScore: 820,
        loopPoints: 980
      };
    } else if (userType === "kamau") {
      mockData = {
        name: "John Kamau",
        email: "johnkamau@gmail.com",
        phone: "+254 712 345 678",
        bio: "Entrepreneur and chama member passionate about financial freedom.",
        maritalStatus: "Married",
        occupation: "Business Owner",
        gender: "Male",
        dob: "12 Aug 1990",
        address: "0x90F79bf6EB2c4f870365E785982E1f101E93b906",
        savings: 125450.75,
        balance: 25450.75,
        activeLoan: 15000.00,
        creditScore: 785,
        loopPoints: 450
      };
    } else {
      mockData = {
        name: "Treasurer (Admin)",
        email: "treasurer@chama.org",
        phone: "+254 701 555 444",
        bio: "Group administrator and treasurer.",
        maritalStatus: "Single",
        occupation: "Accountant",
        gender: "Male",
        dob: "05 Jan 1992",
        address: "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
        savings: 210000.00,
        balance: 98450.00,
        activeLoan: 0.00,
        creditScore: 910,
        loopPoints: 1250
      };
    }
    setSelectedUser(mockData);
    setPinCode("");
    setCurrentScreen("pin");
  };

  // Handle PIN Keypad Press (Unified for 6 digits)
  const handlePinPress = (key) => {
    if (key === "back") {
      setPinCode((prev) => prev.slice(0, -1));
    } else if (key === "biometric") {
      if (selectedUser) {
        setIsLoading(true);
        fetchUserData(selectedUser.email).then(() => {
          setIsLoading(false);
          setPinCode("");
          setCurrentScreen("dashboard");
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
              setCreatedPin(newPin);
              setIsLoading(false);
              setCurrentScreen("connectWallet");
              showBanner("Secure PIN established!", "success");
            } else {
              if (selectedUser && newPin === selectedUser.pin) {
                await fetchUserData(selectedUser.email);
                setIsLoading(false);
                setCurrentScreen("dashboard");
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

  // Handle Register Sign Up (Sends real OTP)
  const handleRegisterSubmit = async () => {
    if (!regName || !regEmail || !regPhone || !regPassword) {
      showBanner("Please fill in all the registration fields.", "error");
      return;
    }
    if (regPassword !== regConfirmPassword) {
      showBanner("Passwords do not match.", "error");
      return;
    }
    setIsLoading(true);
    try {
      const response = await fetchWithTimeout(`${BACKEND_URL}/api/auth/send-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: regEmail })
      });
      const data = await response.json();
      setIsLoading(false);
      if (response.ok) {
        setOtpTimer(59);
        setCurrentScreen("verification");
        showBanner("OTP verification code sent!", "success");
        
        // Auto-fill helper (auto pick code for testing)
        if (data.otp) {
          setSentOtp(data.otp);
          setTimeout(() => {
            setOtpCode(data.otp);
            showBanner(`Auto-picked OTP: ${data.otp}`, "info");
          }, 800);
        }
      } else {
        showBanner(data.error || "Failed to send verification code", "error");
      }
    } catch (e) {
      setIsLoading(false);
      showBanner("Failed to connect to authentication server", "error");
      console.log(e);
    }
  };

  // Handle OTP Verification submission (Verifies on backend)
  const handleVerifyOtp = async () => {
    if (otpCode.length < 4) {
      showBanner("Please enter the verification code.", "error");
      return;
    }
    setIsLoading(true);
    try {
      const response = await fetchWithTimeout(`${BACKEND_URL}/api/auth/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: regEmail, code: otpCode })
      });
      const data = await response.json();
      setIsLoading(false);
      if (response.ok) {
        setPinCode("");
        setCurrentScreen("createPin");
        showBanner("Email verified! Please create your PIN.", "success");
      } else {
        showBanner(data.error || "Invalid verification code", "error");
      }
    } catch (e) {
      setIsLoading(false);
      showBanner("Failed to connect to verification server", "error");
      console.log(e);
    }
  };

  // Fetch the latest OTP from backend for testing/auto-fill sandbox support
  const handleFetchLatestOtp = async () => {
    if (!regEmail) {
      showBanner("No email address provided.", "error");
      return;
    }
    setIsLoading(true);
    try {
      const response = await fetchWithTimeout(`${BACKEND_URL}/api/auth/latest-otp?email=${regEmail}`);
      const data = await response.json();
      setIsLoading(false);
      if (response.ok && data.code) {
        setSentOtp(data.code);
        setOtpCode(data.code);
        showBanner(`Auto-picked OTP: ${data.code}`, "success");
      } else {
        showBanner(data.error || "No active OTP found for this email", "error");
      }
    } catch (e) {
      setIsLoading(false);
      showBanner("Failed to fetch latest OTP code", "error");
      console.log(e);
    }
  };

  // Resend OTP via real email sending endpoint
  const handleResendOtp = async () => {
    if (!regEmail) {
      showBanner("No email address provided.", "error");
      return;
    }
    setIsLoading(true);
    try {
      const response = await fetchWithTimeout(`${BACKEND_URL}/api/auth/send-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: regEmail })
      });
      const data = await response.json();
      setIsLoading(false);
      if (response.ok) {
        setOtpTimer(59);
        if (data.otp) {
          setSentOtp(data.otp);
          setOtpCode(data.otp);
          showBanner("New OTP sent & auto-filled!", "success");
        } else {
          showBanner("New verification OTP code sent!", "success");
        }
      } else {
        showBanner(data.error || "Failed to resend code", "error");
      }
    } catch (e) {
      setIsLoading(false);
      showBanner("Failed to connect to authentication server", "error");
      console.log(e);
    }
  };

  // Handle Profile Completion (Saves to Firestore)
  const handleProfileComplete = async () => {
    setIsLoading(true);
    try {
      const newUser = {
        email: regEmail,
        name: regName,
        phone: regPhone,
        pin: createdPin || regPassword, // use the user-created numeric PIN or registration password fallback
        avatar: profAvatarUri || "👩‍🌾",
        gender: profGender || "Female",
        maritalStatus: profMarital || "Single"
      };

      const response = await fetchWithTimeout(`${BACKEND_URL}/api/users/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newUser)
      });
      const data = await response.json();
      setIsLoading(false);

      if (response.ok) {
        await fetchUserData(regEmail);
        setCurrentScreen("dashboard");
        setTimeout(() => {
          Alert.alert(
            "🎉 Account Created!",
            `Welcome to PayLoop, ${regName}!\n\nYour account has been successfully set up. Start saving and growing with your chama today.`,
            [{ text: "Let's Go!", style: "default" }]
          );
        }, 400);
      } else {
        showBanner(data.error || "Registration failed", "error");
      }
    } catch (e) {
      setIsLoading(false);
      showBanner("Failed to register profile with backend", "error");
      console.log(e);
    }
  };

  // Contribute Transaction Flow
  const handleContributeSubmit = () => {
    const rawVal = parseFloat(depositAmount);
    if (isNaN(rawVal) || rawVal <= 0) {
      showBanner("Please enter a valid contribution amount.", "error");
      return;
    }

    // Convert to internal USDC
    const amountUsdc = currency === "KES" ? rawVal / KES_PER_USDC : rawVal;

    const executePayment = async () => {
      setIsLoading(true);
      try {
        const response = await fetchWithTimeout(`${BACKEND_URL}/api/savings/contribute`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: selectedUser.email,
            amount: amountUsdc,
            paymentMethod: paymentMethod === "metamask" ? "MetaMask" : "M-Pesa"
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

          // Show receipt card
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
      // M-Pesa STK Push PIN Simulation
      setStkPinCode("");
      setStkPayDetails({
        title: "Green Future Chama Vault",
        amountFormatted: formatValue(amountUsdc),
        onFinish: executePayment
      });
      setShowStkModal(true);
    }
  };

  // Submit Loan Request Flow
  const handleLoanRequestSubmit = () => {
    const rawVal = parseFloat(requestAmount);
    if (isNaN(rawVal) || rawVal <= 0) {
      showBanner("Please enter a valid loan amount.", "error");
      return;
    }

    const amountUsdc = currency === "KES" ? rawVal / KES_PER_USDC : rawVal;

    requestSignature("Submit Loan Request", `${amountUsdc.toFixed(2)} USDC`, async () => {
      setIsLoading(true);
      try {
        const response = await fetchWithTimeout(`${BACKEND_URL}/api/loans/request`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: selectedUser.email,
            amount: amountUsdc,
            duration: parseInt(requestDuration) || 6,
            purpose: requestPurpose
          })
        });
        const data = await response.json();
        if (response.ok) {
          await fetchUserData(selectedUser.email);

          const newNotif = {
            id: Date.now(),
            title: "Loan Request Registered",
            message: `Your loan request of ${formatValue(amountUsdc)} is now pending member voting.`,
            time: "Just now",
            icon: "🤝"
          };
          setNotifications([newNotif, ...notifications]);

          showBanner("Loan request submitted! Awaiting consensus.", "success");
          setLoansSubTab("my");
        } else {
          setIsLoading(false);
          showBanner(data.error || "Failed to submit loan", "error");
        }
      } catch (e) {
        setIsLoading(false);
        showBanner("Failed to connect to lending server", "error");
        console.log(e);
      }
    });
  };

  // Group consensus voting
  const handleVoteOnLoan = (loanId, support) => {
    requestSignature(`Vote on Loan ID #${loanId}`, support ? "YES (Approve)" : "NO (Reject)", async () => {
      setIsLoading(true);
      try {
        const response = await fetchWithTimeout(`${BACKEND_URL}/api/loans/vote`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            loanId: loanId,
            voterEmail: selectedUser.email,
            support: support
          })
        });
        const data = await response.json();
        if (response.ok) {
          await fetchUserData(selectedUser.email);
          showBanner(data.approved ? "Consensus reached! Loan Approved. 🎉" : "Vote registered successfully!", "success");
        } else {
          setIsLoading(false);
          showBanner(data.error || "Failed to record vote", "error");
        }
      } catch (e) {
        setIsLoading(false);
        showBanner("Failed to connect to voting server", "error");
        console.log(e);
      }
    });
  };

  // Disburse approved funds
  const handleDisburseLoan = (loanId) => {
    const loan = loans.find((l) => l.id === loanId);
    requestSignature("Disburse Loan Funds", `${loan.amount.toFixed(2)} USDC`, () => {
      setLoans((prev) =>
        prev.map((l) => {
          if (l.id === loanId) {
            return { ...l, repaymentDeadline: Math.floor(Date.now() / 1000) + (l.duration * 30 * 86400) };
          }
          return l;
        })
      );
      setSelectedUser((prev) => ({
        ...prev,
        balance: prev.balance + loan.amount,
        activeLoan: loan.amount
      }));

      const newTx = {
        id: Date.now(),
        type: "Loan Disbursement",
        amount: loan.amount,
        date: new Date().toLocaleString(),
        status: "Completed",
        isIncome: true
      };
      setTransactions([newTx, ...transactions]);

      showBanner("Vault funds transferred to wallet!", "success");
    });
  };

  // Repay active loan
  const handleRepayLoan = (loanId) => {
    const loan = loans.find((l) => l.id === loanId);
    if (!loan) return;
    const totalDue = loan.amount * (1 + (loan.interestRate / 100));

    const executeRepayment = async () => {
      setIsLoading(true);
      try {
        const response = await fetchWithTimeout(`${BACKEND_URL}/api/loans/repay`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: selectedUser.email,
            loanId: loanId,
            amount: totalDue
          })
        });
        const data = await response.json();
        if (response.ok) {
          await fetchUserData(selectedUser.email);

          const newNotif = {
            id: Date.now(),
            title: "Loan Settled 🎉",
            message: `You fully repaid your loan of ${formatValue(loan.amount)}. CreditLoop score raised.`,
            time: "Just now",
            icon: "📈"
          };
          setNotifications([newNotif, ...notifications]);
          showBanner("Loan repaid successfully!", "success");

          // Show receipt card
          setTimeout(() => {
            launchDigitalReceipt("Loan Repayment Settle", totalDue, "Green Future Chama Vault");
          }, 300);
        } else {
          setIsLoading(false);
          showBanner(data.error || "Repayment failed", "error");
        }
      } catch (e) {
        setIsLoading(false);
        showBanner("Failed to connect to repayment server", "error");
        console.log(e);
      }
    };

    if (paymentMethod === "metamask") {
      requestSignature("Repay Loan", `${totalDue.toFixed(2)} USDC`, executeRepayment);
    } else {
      // M-Pesa STK Push PIN Simulation
      setStkPinCode("");
      setStkPayDetails({
        title: "Repay Loan ID #" + loanId,
        amountFormatted: formatValue(totalDue),
        onFinish: executeRepayment
      });
      setShowStkModal(true);
    }
  };

  // Open MetaMask signature request modal
  const requestSignature = (title, amount, onConfirm) => {
    setTxDetails({ title, amount, gas: "0.001" });
    setOnConfirmTx(() => onConfirm);
    setShowMetaMaskModal(true);
  };

  // Handle MetaMask modal confirm button
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
      // Onboarding & Authentication
      slide1_title: "Save Smarter Together",
      slide1_desc: "Track contributions, monitor savings growth, and manage your chama digitally.",
      slide1_label: "Smart Savings",
      slide2_title: "Reputation Credit Loops",
      slide2_desc: "Establish trust and borrowing capacity without collateral based on saving habits.",
      slide2_label: "CreditScore",
      slide3_title: "Consensus Ledgers",
      slide3_desc: "Submit and review loan requests. Chama members vote to release funds instantly.",
      slide3_label: "Governance",
      slide4_title: "USSD Offline Support",
      slide4_desc: "No internet? Use our offline USSD channel to check scores and save securely.",
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
      auto_fetch_otp: "Auto-Fetch OTP (Sandbox)"
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
      // Onboarding & Authentication
      slide1_title: "Weka Akiba Pamoja na Wengine",
      slide1_desc: "Fuatilia michango, kukuza akiba, na simamia chama chako kidijitali.",
      slide1_label: "Akiba Salama",
      slide2_title: "Mizunguko ya Mikopo ya Uaminifu",
      slide2_desc: "Jenga uaminifu na uwezo wa kukopa bila dhamana kulingana na tabia zako za kuweka akiba.",
      slide2_label: "Alama ya Mkopo",
      slide3_title: "Maamuzi ya Kikundi",
      slide3_desc: "Wasilisha na pitia mikopo. Wanachama wa chama watapiga kura kutoa fedha papo hapo.",
      slide3_label: "Utawala",
      slide4_title: "Msaada wa USSD Nje ya Mtandao",
      slide4_desc: "Huna mtandao? Tumia USSD yetu ya nje ya mtandao kuangalia alama na kuweka akiba salama.",
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
      auto_fetch_otp: "Chukua OTP Otomatiki (Sandbox)"
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
      image: "👩‍🌾👨‍🔧👩‍💼",
      label: t("slide1_label")
    },
    {
      title: t("slide2_title"),
      desc: t("slide2_desc"),
      image: "🤝💸✨",
      label: t("slide2_label")
    },
    {
      title: t("slide3_title"),
      desc: t("slide3_desc"),
      image: "📈⭐📊",
      label: t("slide3_label")
    },
    {
      title: t("slide4_title"),
      desc: t("slide4_desc"),
      image: "🛡️🔗🦊",
      label: t("slide4_label")
    }
  ];

  // Open Edit Profile
  const openEditProfile = () => {
    setEditName(selectedUser.name);
    setEditEmail(selectedUser.email);
    setEditPhone(selectedUser.phone);
    setEditBio(selectedUser.bio);
    setEditMarital(selectedUser.maritalStatus);
    setEditAvatarUri(selectedUser.avatarUri || "");
    setActiveSubScreen("editProfile");
  };

  // Save Edit Profile
  const handleSaveProfile = () => {
    setSelectedUser((prev) => ({
      ...prev,
      name: editName,
      email: editEmail,
      phone: editPhone,
      bio: editBio,
      maritalStatus: editMarital,
      avatarUri: editAvatarUri
    }));
    showBanner("Profile updated successfully!", "success");
    setActiveSubScreen("profile");
  };

  const handleOnboardingNext = () => {
    if (onboardingIndex < onboardingSlides.length - 1) {
      setOnboardingIndex(onboardingIndex + 1);
    } else {
      setCurrentScreen("welcome");
    }
  };

  // -------------------------------------------------------------
  // USSD OFFLINE CODE INTERPRETER
  // -------------------------------------------------------------
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
          
          // Trigger mock update
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

  // -------------------------------------------------------------
  // RENDERING GAUGE HELPERS
  // -------------------------------------------------------------

  const getTimeGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 17) return "Good Afternoon";
    return "Good Evening";
  };

  const renderSavingsCircleGauge = (progress = 0.78, label = "collected") => {
    const radius = 50;
    const circumference = Math.PI * 2 * radius;
    const strokeDashoffset = circumference * (1 - progress);

    return (
      <View style={styles.savingsCircleGaugeBox}>
        <Svg width="120" height="120" viewBox="0 0 120 120">
          <Circle
            cx="60"
            cy="60"
            r={radius}
            stroke="#E5E7EB"
            strokeWidth="10"
            fill="none"
          />
          <Circle
            cx="60"
            cy="60"
            r={radius}
            stroke="#00875A"
            strokeWidth="10"
            fill="none"
            strokeDasharray={`${circumference} ${circumference}`}
            strokeDashoffset={strokeDashoffset}
            transform="rotate(-90, 60, 60)"
            strokeLinecap="round"
          />
        </Svg>
        <View style={styles.savingsCircleTextOverlay}>
          <Text style={styles.savingsCirclePercentage}>{Math.round(progress * 100)}%</Text>
          <Text style={styles.savingsCircleSub}>{label}</Text>
        </View>
      </View>
    );
  };

  const renderTrendLine = () => {
    return (
      <Svg width="120" height="50" viewBox="0 0 120 50">
        <Polyline
          fill="none"
          stroke="#00875A"
          strokeWidth="3"
          points="0,45 20,40 40,42 60,25 80,30 100,10 120,5"
        />
        <Circle cx="120" cy="5" r="4" fill="#00875A" />
      </Svg>
    );
  };

  const renderScoreGaugeLarge = (score) => {
    // Semicircular progress gauge from 0 to 180 degrees
    const radius = 60;
    const circumference = Math.PI * radius; // 188.4
    // Score is between 300 and 850, let's normalize it between 0 and 1
    const normalized = Math.max(0, Math.min(1, (score - 300) / 550));
    const strokeDashoffset = circumference * (1 - normalized);
    const tier = getCreditTier(score);

    return (
      <View style={styles.scoreGaugeBox}>
        <Svg width="180" height="110" viewBox="0 0 180 110">
          {/* Background semicircular path */}
          <Path
            d="M 20 90 A 70 70 0 0 1 160 90"
            fill="none"
            stroke="#E5E7EB"
            strokeWidth="12"
            strokeLinecap="round"
          />
          {/* Progress semicircular path */}
          <Path
            d="M 20 90 A 70 70 0 0 1 160 90"
            fill="none"
            stroke={tier.color}
            strokeWidth="12"
            strokeLinecap="round"
            strokeDasharray={`${circumference} ${circumference}`}
            strokeDashoffset={strokeDashoffset}
          />
        </Svg>
        <View style={styles.scoreGaugeOverlay}>
          <Text style={styles.scoreGaugeValueText}>{score}</Text>
          <Text style={[styles.scoreGaugeTierText, { color: tier.color }]}>{tier.name} Tier</Text>
        </View>
      </View>
    );
  };

  const handleDashboardRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      // Simulate ledger sync changes
      setSelectedUser((prev) => ({
        ...prev,
        savings: prev.savings + (Math.random() > 0.5 ? 5.00 : 0.00),
        balance: prev.balance + (Math.random() > 0.5 ? 10.00 : -5.00),
        creditScore: Math.min(1000, prev.creditScore + (Math.random() > 0.6 ? 3 : -1))
      }));
    }, 1200);
  };

  const renderTopBar = () => {
    return (
      <View style={styles.topBarContainer}>
        <View style={styles.topBarLeft}>
          <TouchableOpacity onPress={() => setActiveSubScreen("profile")} style={styles.topBarAvatarBox}>
            {selectedUser.avatarUri ? (
              <Image source={{ uri: selectedUser.avatarUri }} style={{ width: 32, height: 32, borderRadius: 16 }} />
            ) : (
              <Text style={styles.topBarAvatarEmoji}>👤</Text>
            )}
          </TouchableOpacity>
          <View style={styles.topBarTextCol}>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Text style={styles.topBarGreetingText}>{getTimeGreeting()}, {selectedUser.name.split(" ")[0]} 👋</Text>
              {selectedUser.verification_level === "FULLY_VERIFIED" ? (
                <View style={{ backgroundColor: "#FBBF24", paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6, marginLeft: 6 }}>
                  <Text style={{ color: "#78350F", fontSize: 9, fontWeight: "bold" }}>Level 2 ✓</Text>
                </View>
              ) : selectedUser.is_email_verified ? (
                <View style={{ backgroundColor: "#D1FAE5", paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6, marginLeft: 6 }}>
                  <Text style={{ color: "#065F46", fontSize: 9, fontWeight: "bold" }}>Level 1 ✓</Text>
                </View>
              ) : (
                <View style={{ backgroundColor: "#FEE2E2", paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6, marginLeft: 6 }}>
                  <Text style={{ color: "#991B1B", fontSize: 9, fontWeight: "bold" }}>Unverified ✗</Text>
                </View>
              )}
            </View>
            <View style={styles.topBarChamaRow}>
              <View style={styles.topBarPulseDot} />
              <Text style={styles.topBarChamaText}>{chamaName}</Text>
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

  // -------------------------------------------------------------
  // HOME PAGE MODULAR TAB CONTENT
  // -------------------------------------------------------------
  const renderHomeTabContent = () => {
    const tier = getCreditTier(selectedUser.creditScore);
    return (
      <ScrollView 
        style={styles.tabContentLight}
        contentContainerStyle={{ paddingBottom: 100 }}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleDashboardRefresh}
            colors={["#00875A"]}
            tintColor="#00875A"
          />
        }
      >
        {/* Verification Warning Banner */}
        {selectedUser.verification_level !== "FULLY_VERIFIED" && (
          <View style={{
            backgroundColor: "#FEF3C7",
            marginHorizontal: 16,
            marginTop: 16,
            padding: 12,
            borderRadius: 12,
            borderWidth: 1,
            borderColor: "#F59E0B",
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between"
          }}>
            <View style={{ flex: 1, flexDirection: "row", alignItems: "center" }}>
              <Text style={{ fontSize: 18, marginRight: 8 }}>⚠️</Text>
              <Text style={{ color: "#78350F", fontSize: 12, fontWeight: "500", flex: 1 }}>
                {!selectedUser.is_email_verified 
                  ? "Verify your email to secure your account and join group activities."
                  : "Verify your identity (Level 2) to unlock borrowing and Chama loans."}
              </Text>
            </View>
            <TouchableOpacity 
              onPress={() => {
                if (!selectedUser.is_email_verified) {
                  setCurrentScreen("emailVerification");
                } else {
                  setPhoneForVerification(selectedUser.phone || "");
                  setIsPhoneVerifiedState(selectedUser.is_phone_verified || false);
                  setIsVerificationSmsSent(false);
                  setVerificationSmsCode("");
                  setIdDocUri(null);
                  setSelfieUri(null);
                  setVerificationSuccess(false);
                  setActiveSubScreen("verifyIdentity");
                }
              }}
              style={{
                backgroundColor: "#D97706",
                paddingVertical: 6,
                paddingHorizontal: 10,
                borderRadius: 8
              }}
            >
              <Text style={{ color: "#FFFFFF", fontSize: 12, fontWeight: "bold" }}>Verify</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* 1. SAVINGS SUMMARY CARD */}
        <View style={styles.summaryCardForestGreen}>
          <View style={styles.summaryCardHeader}>
            <View>
              <Text style={styles.summaryCardLabel}>Total Savings Balance</Text>
              <Text style={styles.summaryCardValue}>{formatValue(selectedUser.savings)}</Text>
            </View>
            <View style={styles.summaryGrowthBadge}>
              <Text style={styles.summaryGrowthText}>▲ 12.5%</Text>
            </View>
          </View>

          <View style={styles.summaryCardDivider} />

          <View style={styles.summaryCardDetailsRow}>
            <View style={styles.summaryDetailCol}>
              <Text style={styles.summaryDetailLabel}>Wallet Balance</Text>
              <Text style={styles.summaryDetailValue}>{formatValue(selectedUser.balance)}</Text>
            </View>
            <View style={styles.summaryDetailCol}>
              <Text style={styles.summaryDetailLabel}>Cycle Progress</Text>
              <View style={styles.summaryProgressContainer}>
                <View style={styles.summaryProgressBarBg}>
                  <View style={[styles.summaryProgressBarFill, { width: '78%' }]} />
                </View>
                <Text style={styles.summaryProgressText}>78%</Text>
              </View>
            </View>
            <View style={styles.summaryDetailColAlignEnd}>
              <Text style={styles.summaryDetailLabel}>Member Status</Text>
              <View style={styles.summaryStatusBadge}>
                <View style={styles.summaryStatusPulse} />
                <Text style={styles.summaryStatusText}>ACTIVE</Text>
              </View>
            </View>
          </View>
        </View>

        {/* 2. QUICK ACTIONS GRID (2 Columns) */}
        <View style={styles.quickActionsContainer}>
          <Text style={styles.homeSectionTitle}>Quick Services</Text>
          <View style={styles.quickActionsGrid}>
            
            <TouchableOpacity onPress={() => setActiveSubScreen("contribute")} style={styles.quickActionCard}>
              <View style={[styles.actionIconWrapper, { backgroundColor: 'rgba(0, 135, 90, 0.08)' }]}>
                <Text style={styles.actionIconEmoji}>💸</Text>
              </View>
              <View style={styles.actionTextCol}>
                <Text style={styles.actionTitle}>Contribute</Text>
                <Text style={styles.actionSubtitle}>Save to chama</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => { setActiveTab("loans"); setLoansSubTab("request"); }} style={styles.quickActionCard}>
              <View style={[styles.actionIconWrapper, { backgroundColor: 'rgba(13, 148, 136, 0.08)' }]}>
                <Text style={styles.actionIconEmoji}>🤝</Text>
              </View>
              <View style={styles.actionTextCol}>
                <Text style={styles.actionTitle}>Request Loan</Text>
                <Text style={styles.actionSubtitle}>Borrow funds</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity 
              onPress={() => {
                if (selectedUser.activeLoan > 0) {
                  handleRepayLoan(0);
                } else {
                  Alert.alert("No Loan", "You don't have any outstanding loans to repay.");
                }
              }} 
              style={styles.quickActionCard}
            >
              <View style={[styles.actionIconWrapper, { backgroundColor: 'rgba(219, 39, 119, 0.08)' }]}>
                <Text style={styles.actionIconEmoji}>💳</Text>
              </View>
              <View style={styles.actionTextCol}>
                <Text style={styles.actionTitle}>Repay Loan</Text>
                <Text style={styles.actionSubtitle}>Pay balance</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity 
              onPress={() => {
                Alert.alert(
                  "Wallet Identity", 
                  `Address:\n${selectedUser.address}\n\nNetwork: Polygon Amoy\nStatus: Connected ✅`,
                  [
                    { text: "Copy Address", onPress: () => Share.share({ message: selectedUser.address }) },
                    { text: "Close", style: "cancel" }
                  ]
                );
              }} 
              style={styles.quickActionCard}
            >
              <View style={[styles.actionIconWrapper, { backgroundColor: 'rgba(79, 70, 229, 0.08)' }]}>
                <Text style={styles.actionIconEmoji}>💼</Text>
              </View>
              <View style={styles.actionTextCol}>
                <Text style={styles.actionTitle}>View Wallet</Text>
                <Text style={styles.actionSubtitle}>Manage Web3</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => setActiveSubScreen("transactions")} style={styles.quickActionCard}>
              <View style={[styles.actionIconWrapper, { backgroundColor: 'rgba(217, 119, 6, 0.08)' }]}>
                <Text style={styles.actionIconEmoji}>🧾</Text>
              </View>
              <View style={styles.actionTextCol}>
                <Text style={styles.actionTitle}>Receipts</Text>
                <Text style={styles.actionSubtitle}>Get history</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => setShowQrScanner(true)} style={styles.quickActionCard}>
              <View style={[styles.actionIconWrapper, { backgroundColor: 'rgba(107, 114, 128, 0.08)' }]}>
                <Text style={styles.actionIconEmoji}>📷</Text>
              </View>
              <View style={styles.actionTextCol}>
                <Text style={styles.actionTitle}>Scan QR</Text>
                <Text style={styles.actionSubtitle}>Scan to verify</Text>
              </View>
            </TouchableOpacity>

          </View>
        </View>

        {/* 3. CREDITLOOP SCORE CARD */}
        <View style={styles.creditLoopCard}>
          <Text style={styles.homeSectionTitle}>CreditLoop Reputation</Text>
          <View style={styles.creditScoreContentBox}>
            <View style={styles.creditMeterWrapper}>
              <Svg width="120" height="75" viewBox="0 0 120 75">
                <Path
                  d="M 15 65 A 45 45 0 0 1 105 65"
                  fill="none"
                  stroke="#E5E7EB"
                  strokeWidth="8"
                  strokeLinecap="round"
                />
                <Path
                  d="M 15 65 A 45 45 0 0 1 105 65"
                  fill="none"
                  stroke={tier.color}
                  strokeWidth="8"
                  strokeLinecap="round"
                  strokeDasharray={`${Math.PI * 45} ${Math.PI * 45}`}
                  strokeDashoffset={(Math.PI * 45) * (1 - (selectedUser.creditScore - 300) / 550)}
                />
              </Svg>
              <View style={styles.creditScoreOverlayLabel}>
                <Text style={styles.creditScoreScoreVal}>{selectedUser.creditScore}</Text>
                <Text style={[styles.creditScoreTierBadgeText, { color: tier.color }]}>{tier.name}</Text>
              </View>
            </View>

            <View style={styles.creditScoreDetailsCol}>
              <View style={styles.scoreLevelRow}>
                <Text style={styles.scoreRatingLabel}>Rating:</Text>
                <Text style={[styles.scoreRatingValue, { color: tier.color }]}>
                  {selectedUser.creditScore >= 800 ? "Excellent" : selectedUser.creditScore >= 650 ? "Good" : selectedUser.creditScore >= 400 ? "Fair" : "Risk"}
                </Text>
              </View>
              <View style={styles.scoreTrendRow}>
                <Text style={styles.scoreTrendText}>▲ +15 pts this cycle</Text>
              </View>
              <Text style={styles.scoreTipMessage}>
                💡 Every timely contribution increases your score and lowers borrowing rates.
              </Text>
            </View>
          </View>
        </View>

        {/* 4. CONTRIBUTION TRACKER WIDGET */}
        <View style={styles.trackerContainer}>
          <Text style={styles.homeSectionTitle}>Contribution Tracker</Text>
          
          {selectedUser.savings === 0 ? (
            <View style={[styles.trackerCard, styles.trackerOverdueCard]}>
              <View style={styles.trackerHeaderRow}>
                <View style={styles.trackerTitleCol}>
                  <Text style={[styles.trackerCardLabel, { color: '#DC2626' }]}>WEEKLY CHAMA CONTRIBUTION</Text>
                  <Text style={styles.trackerAmount}>{formatValue(100)}</Text>
                </View>
                <View style={styles.warningBadge}>
                  <Text style={styles.warningBadgeText}>⚠️ OVERDUE</Text>
                </View>
              </View>
              <Text style={styles.trackerDueDateText}>Was due on: 8 May 2024 (2 days ago)</Text>
              <View style={[styles.trackerProgressBarBg, { backgroundColor: '#FCA5A5' }]}>
                <View style={[styles.trackerProgressBarFill, { width: '0%', backgroundColor: '#EF4444' }]} />
              </View>
              <Text style={[styles.trackerStatusDescText, { color: '#B91C1C' }]}>
                ⚠️ Your account reputation score is currently frozen. Pay now to unfreeze.
              </Text>
            </View>
          ) : (
            <View style={styles.trackerCard}>
              <View style={styles.trackerHeaderRow}>
                <View style={styles.trackerTitleCol}>
                  <Text style={styles.trackerCardLabel}>WEEKLY CHAMA CONTRIBUTION</Text>
                  <Text style={styles.trackerAmount}>{formatValue(100)}</Text>
                </View>
                <View style={styles.onTimeBadge}>
                  <Text style={styles.onTimeBadgeText}>ON TRACK</Text>
                </View>
              </View>
              <Text style={styles.trackerDueDateText}>Due: 15 June 2026 (5 days remaining)</Text>
              <View style={styles.trackerProgressBarBg}>
                <View style={[styles.trackerProgressBarFill, { width: '78%' }]} />
              </View>
              <Text style={styles.trackerStatusDescText}>
                🟢 Chama collected 7,800 USDC of 10,000 USDC target (78% complete)
              </Text>
            </View>
          )}
        </View>

        {/* 5. ACTIVE LOAN OVERVIEW */}
        <View style={styles.activeLoanContainer}>
          <Text style={styles.homeSectionTitle}>Active Loan Status</Text>
          
          {selectedUser.activeLoan > 0 ? (
            <View style={styles.loanStatusCard}>
              <View style={styles.loanHeaderRow}>
                <View>
                  <Text style={styles.loanCardLabel}>OUTSTANDING BALANCE</Text>
                  <Text style={styles.loanBalanceText}>{formatValue(selectedUser.activeLoan)}</Text>
                </View>
                <View style={styles.loanRepayProgressBadge}>
                  <Text style={styles.loanRepayProgressText}>16.6% Repaid</Text>
                </View>
              </View>

                      <Text style={styles.loanDueDateText}>Next payment: 28 May 2024 • Interest Rate: {tier.rate}%</Text>
              
              <View style={styles.loanProgressBarOuter}>
                <View style={[styles.loanProgressBarInner, { width: '16.6%' }]} />
              </View>

              <View style={styles.loanActionsRowDashboard}>
                <TouchableOpacity onPress={() => handleRepayLoan(0)} style={styles.loanDashboardRepayBtn}>
                  <Text style={styles.loanDashboardRepayBtnText}>Repay Installment</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <View style={styles.noLoanStatusCard}>
              <Text style={styles.noLoanCardHeader}>No Active Loans</Text>
              <Text style={styles.noLoanCardMessage}>
                Based on your {tier.badge} credit tier, you are currently pre-approved for loans up to **{formatValue(25000 / KES_PER_USDC)}** at a premium rate of only **{tier.rate}% p.a.**
              </Text>
              <TouchableOpacity 
                onPress={() => { setActiveTab("loans"); setLoansSubTab("request"); }} 
                style={styles.noLoanCardActionBtn}
              >
                <Text style={styles.noLoanCardActionBtnText}>Apply Now</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* 6. SAVINGS GOAL PROGRESS CARD */}
        <View style={styles.goalContainer}>
          <Text style={styles.homeSectionTitle}>Savings Target Goal</Text>
          <View style={styles.goalCard}>
            <View style={styles.goalTopRow}>
              <View style={styles.goalTitleCol}>
                <Text style={styles.goalHeaderTitle}>{savingsGoal.title}</Text>
                <Text style={styles.goalStatsText}>
                  {formatValue(savingsGoal.current)} of {formatValue(savingsGoal.target)}
                </Text>
              </View>
              {renderSavingsCircleGauge(savingsGoal.current / savingsGoal.target, "saved")}
            </View>
            <View style={styles.goalBottomRow}>
              <Text style={styles.goalDeadlineText}>Est. Completion: {savingsGoal.deadline}</Text>
              <Text style={styles.goalMotivationalText}>🎯 Keep going! You are {Math.round((savingsGoal.current / savingsGoal.target) * 100)}% towards your target.</Text>
            </View>
          </View>
        </View>

        {/* 7. RECENT ACTIVITIES FEED */}
        <View style={styles.activityFeedContainer}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.homeSectionTitle}>Recent Activities</Text>
            <TouchableOpacity onPress={() => setActiveSubScreen("transactions")}>
              <Text style={styles.viewAllTextLink}>View All ›</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.activityListCard}>
            {transactions.slice(0, 3).map((item, idx) => (
              <View key={item.id || idx} style={styles.activityItemRow}>
                <View style={styles.activityIconBadge}>
                  <Text style={styles.activityEmoji}>{item.type === "Contribution" ? "💸" : item.isIncome ? "📥" : "📤"}</Text>
                </View>
                <View style={styles.activityItemDetails}>
                  <Text style={styles.activityTitle}>{item.type}</Text>
                  <Text style={styles.activityDate}>{item.date.split(",")[0]}</Text>
                </View>
                <View style={styles.activityAmountCol}>
                  <Text style={[styles.activityAmountVal, item.isIncome ? { color: '#00875A' } : { color: '#EF4444' }]}>
                    {item.isIncome ? "+" : "-"}{formatValue(Math.abs(item.amount))}
                  </Text>
                  <Text style={styles.activityStatus}>{item.status}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* 8. CHAMA INFO SECTION */}
        <View style={styles.groupInfoContainer}>
          <Text style={styles.homeSectionTitle}>Chama Circle Hub</Text>
          <View style={styles.groupInfoCard}>
            <View style={styles.groupInfoStatRow}>
              <View style={styles.groupStatBox}>
                <Text style={styles.groupStatEmoji}>👥</Text>
                <Text style={styles.groupStatVal}>{members.length} Members</Text>
                <Text style={styles.groupStatSub}>Active Circle</Text>
              </View>
              <View style={styles.groupStatBox}>
                <Text style={styles.groupStatEmoji}>📅</Text>
                <Text style={styles.groupStatVal}>15 May 2024</Text>
                <Text style={styles.groupStatSub}>Next Meeting</Text>
              </View>
              <View style={styles.groupStatBox}>
                <Text style={styles.groupStatEmoji}>🛡️</Text>
                <Text style={styles.groupStatVal}>Consensus</Text>
                <Text style={styles.groupStatSub}>Multi-Sig Active</Text>
              </View>
            </View>

            <View style={styles.groupAnnouncementTicker}>
              <Text style={styles.announcementEmoji}>📢</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.announcementTextTitle} numberOfLines={1}>
                  Consensus Meeting reminder: 15 May at Eldoret Hub.
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* 9. DECENTRALIZED WALLET STATUS */}
        <View style={styles.walletWidgetContainer}>
          <Text style={styles.homeSectionTitle}>Decentralized Wallet Status</Text>
          <View style={styles.walletWidgetCard}>
            <View style={styles.walletWidgetHeader}>
              <Text style={styles.walletWidgetProviderText}>🦊 MetaMask Ledger Identity</Text>
              <View style={styles.walletWidgetStatusBadge}>
                <View style={styles.walletWidgetPulseDot} />
                <Text style={styles.walletWidgetStatusLabel}>CONNECTED</Text>
              </View>
            </View>

            <View style={styles.walletWidgetAddressBox}>
              <Text style={styles.walletWidgetAddressText}>{selectedUser.address}</Text>
            </View>

            <View style={styles.walletWidgetDetailsRow}>
              <Text style={styles.walletWidgetLabel}>Network: <Text style={styles.walletWidgetValue}>Polygon Amoy</Text></Text>
              <Text style={styles.walletWidgetLabel}>Status: <Text style={styles.walletWidgetValue}>Healthy</Text></Text>
            </View>
          </View>
        </View>
      </ScrollView>
    );
  };

  // -------------------------------------------------------------
  // SAVINGS PAGE MODULAR TAB CONTENT
  // -------------------------------------------------------------
  const handleCreateGoalSubmit = async () => {
    if (!newGoalTitle || !newGoalTarget) {
      Alert.alert("Error", "Please enter goal title and target amount.");
      return;
    }
    const val = parseFloat(newGoalTarget);
    if (isNaN(val) || val <= 0) {
      Alert.alert("Error", "Please enter a valid target amount.");
      return;
    }
    const targetUsdc = currency === "KES" ? val / KES_PER_USDC : val;
    setIsLoading(true);
    try {
      const response = await fetchWithTimeout(`${BACKEND_URL}/api/savings/create-goal`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: selectedUser.email,
          name: newGoalTitle,
          targetAmount: targetUsdc,
          deadline: newGoalDeadline || "31 Dec 2026",
          badge: newGoalBadge || "💰"
        })
      });
      const data = await response.json();
      if (response.ok) {
        await fetchUserData(selectedUser.email);
        setNewGoalTitle("");
        setNewGoalTarget("");
        setNewGoalDeadline("");
        setNewGoalBadge("💰");
        setShowAddGoalModal(false);
        Alert.alert("Goal Created! 🎉", `Target "${newGoalTitle}" has been added to your savings goals.`);
      } else {
        setIsLoading(false);
        Alert.alert("Error", data.error || "Failed to create savings goal.");
      }
    } catch (e) {
      setIsLoading(false);
      Alert.alert("Error", "Failed to connect to savings goal service.");
      console.log(e);
    }
  };

  const renderSavingsTabContent = () => {
    const totalContributedUsdc = transactions
      .filter((t) => t.type === "Contribution" && t.status === "Completed")
      .reduce((acc, t) => acc + Math.abs(t.amount), 0);

    const goalProgressPct = selectedUser.savings > 0 ? Math.min(1, selectedUser.savings / 2000) : 0; // Target chama pool is 2000 USDC

    // History filter logic
    const filteredTxs = transactions.filter((t) => {
      if (t.type !== "Contribution") return false;
      
      // Status filter
      if (historyFilterStatus !== "All" && t.status !== historyFilterStatus) return false;
      
      // Payment method filter (M-Pesa STK receipts are mock matched, MetaMask txs use matching blockchain addresses)
      if (historyFilterMethod !== "All") {
        const isMpesa = t.date.includes("MPESA") || t.id.toString().includes("mpesa");
        if (historyFilterMethod === "M-Pesa" && !isMpesa) return false;
        if (historyFilterMethod === "MetaMask" && isMpesa) return false;
      }
      
      // Month filter
      if (historyFilterMonth !== "All") {
        if (!t.date.includes(historyFilterMonth)) return false;
      }
      
      return true;
    });

    return (
      <ScrollView 
        style={styles.tabContentLight}
        contentContainerStyle={{ paddingBottom: 100 }}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleDashboardRefresh}
            colors={["#00875A"]}
            tintColor="#00875A"
          />
        }
      >
        {/* 1. SAVINGS OVERVIEW CARD */}
        <View style={styles.summaryCardForestGreen}>
          <View style={styles.summaryCardHeader}>
            <View>
              <Text style={styles.summaryCardLabel}>Total Balance Saved</Text>
              <Text style={styles.summaryCardValue}>{formatValue(selectedUser.savings)}</Text>
            </View>
            <View style={styles.savingsOnTrackBadge}>
              <Text style={styles.savingsOnTrackBadgeText}>🟢 AHEAD</Text>
            </View>
          </View>
          <View style={styles.summaryCardDivider} />
          <View style={styles.summaryCardDetailsRow}>
            <View style={styles.summaryDetailCol}>
              <Text style={styles.summaryDetailLabel}>Total Contributed</Text>
              <Text style={styles.summaryDetailValue}>{formatValue(totalContributedUsdc)}</Text>
            </View>
            <View style={styles.summaryDetailColAlignEnd}>
              <Text style={styles.summaryDetailLabel}>Total Growth</Text>
              <Text style={[styles.summaryDetailValue, { color: '#34D399' }]}>▲ +14.2%</Text>
            </View>
          </View>
        </View>

        {/* 2. WEEKLY PROGRESS BAR & CONTRIBUTE BUTTON */}
        <View style={styles.savingsTrackerCard}>
          <View style={styles.trackerHeaderRow}>
            <View>
              <Text style={styles.savingsProgressTitle}>Weekly Contribution Cycle</Text>
              <Text style={styles.savingsProgressDeadline}>Due in 5 days (15 June 2026)</Text>
            </View>
            <Text style={styles.savingsTargetLabel}>{formatValue(100)} / week</Text>
          </View>

          <View style={styles.trackerProgressBarBg}>
            <View style={[styles.trackerProgressBarFill, { width: `${goalProgressPct * 100}%` }]} />
          </View>

          <View style={styles.savingsProgressDetailsRow}>
            <Text style={styles.savingsProgressStatusText}>
              {selectedUser.savings > 0 ? "🟢 You are currently up to date" : "⚠️ Payment due immediately"}
            </Text>
            <TouchableOpacity onPress={() => setActiveSubScreen("contribute")} style={styles.savingsQuickContributeBtn}>
              <Text style={styles.savingsQuickContributeBtnText}>Contribute Now</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* 3. SAVINGS GOALS SECTION */}
        <View style={styles.savingsGoalsContainer}>
          <View style={styles.savingsSectionHeader}>
            <Text style={styles.savingsSectionTitle}>Savings Goals & Targets</Text>
            <TouchableOpacity onPress={() => setShowAddGoalModal(true)} style={styles.savingsAddGoalBtn}>
              <Text style={styles.savingsAddGoalBtnText}>+ New Goal</Text>
            </TouchableOpacity>
          </View>

          {savingsGoals.map((goal) => {
            const pct = Math.min(1, goal.current / goal.target);
            return (
              <View key={goal.id} style={styles.savingsGoalItemRow}>
                <View style={styles.savingsGoalIconCol}>
                  <Text style={styles.savingsGoalIconEmoji}>{goal.badge}</Text>
                </View>
                <View style={styles.savingsGoalInfoCol}>
                  <View style={styles.savingsGoalTitleRow}>
                    <Text style={styles.savingsGoalTitle}>{goal.title}</Text>
                    <Text style={styles.savingsGoalPercentage}>{Math.round(pct * 100)}%</Text>
                  </View>
                  <View style={styles.savingsGoalProgressWrapper}>
                    <View style={styles.savingsGoalProgressBarBg}>
                      <View style={[styles.savingsGoalProgressBarFill, { width: `${pct * 100}%` }]} />
                    </View>
                  </View>
                  <View style={styles.savingsGoalStatsRow}>
                    <Text style={styles.savingsGoalAmountLabel}>
                      {formatValue(goal.current)} saved of {formatValue(goal.target)}
                    </Text>
                    <Text style={styles.savingsGoalDeadline}>End: {goal.deadline}</Text>
                  </View>
                </View>
              </View>
            );
          })}
        </View>

        {/* 4. VISUAL SAVINGS ANALYTICS */}
        <View style={styles.savingsAnalyticsContainer}>
          <Text style={styles.savingsSectionTitle}>Savings Analytics & Trends</Text>
          <View style={styles.savingsAnalyticsChartCard}>
            <Text style={styles.chartTitleLabel}>Monthly Contribution Volume (USDC/KES)</Text>
            
            <Svg width="100%" height="110" viewBox="0 0 300 110" style={{ marginTop: 10 }}>
              <Line x1="10" y1="95" x2="290" y2="95" stroke="#CBD5E1" strokeWidth="1" />
              {/* Bars representing volumes */}
              <Line x1="40" y1="95" x2="40" y2="40" stroke="#00875A" strokeWidth="16" strokeLinecap="round" />
              <Line x1="90" y1="95" x2="90" y2="60" stroke="#10B981" strokeWidth="16" strokeLinecap="round" />
              <Line x1="140" y1="95" x2="140" y2="25" stroke="#047857" strokeWidth="16" strokeLinecap="round" />
              <Line x1="190" y1="95" x2="190" y2="55" stroke="#00875A" strokeWidth="16" strokeLinecap="round" />
              <Line x1="240" y1="95" x2="240" y2="35" stroke="#34D399" strokeWidth="16" strokeLinecap="round" />
            </Svg>
            
            <View style={styles.chartMonthsRow}>
              <Text style={styles.chartMonthLabel}>Jan</Text>
              <Text style={styles.chartMonthLabel}>Feb</Text>
              <Text style={styles.chartMonthLabel}>Mar</Text>
              <Text style={styles.chartMonthLabel}>Apr</Text>
              <Text style={styles.chartMonthLabel}>May</Text>
            </View>

            <View style={styles.chartInsightsBox}>
              <Text style={styles.chartInsightsText}>
                📈 Your contributions increased by **35%** in March. Keep up this consistency to boost your CreditLoop score.
              </Text>
            </View>
          </View>
        </View>

        {/* 5. GROUP SAVINGS SUMMARY (RANKINGS & COMMUNAL STATUS) */}
        <View style={styles.communalSavingsContainer}>
          <Text style={styles.savingsSectionTitle}>Communal Leaderboard</Text>
          <View style={styles.communalSavingsCard}>
            <View style={styles.communalRankHeader}>
              <Text style={styles.communalRankSub}>My Rank position</Text>
              <Text style={styles.communalRankVal}>Rank #3 of 6</Text>
            </View>

            <View style={styles.communalDivider} />

            {/* Rankings List */}
            <View style={styles.rankListWrapper}>
              <View style={styles.rankItemRow}>
                <Text style={styles.rankNumText}>1</Text>
                <Text style={styles.rankEmojiText}>👩‍💼</Text>
                <Text style={styles.rankNameText}>Grace Njeri</Text>
                <Text style={styles.rankValText}>{formatValue(920)}</Text>
              </View>
              <View style={styles.rankItemRow}>
                <Text style={styles.rankNumText}>2</Text>
                <Text style={styles.rankEmojiText}>👩‍🌾</Text>
                <Text style={styles.rankNameText}>Mary Wanjiku</Text>
                <Text style={styles.rankValText}>{formatValue(850)}</Text>
              </View>
              <View style={[styles.rankItemRow, styles.rankItemRowActive]}>
                <Text style={[styles.rankNumText, { color: '#00875A', fontWeight: 'bold' }]}>3</Text>
                <Text style={styles.rankEmojiText}>👤</Text>
                <Text style={[styles.rankNameText, { fontWeight: 'bold' }]}>{selectedUser.name} (You)</Text>
                <Text style={[styles.rankValText, { fontWeight: 'bold' }]}>{formatValue(selectedUser.savings)}</Text>
              </View>
              <View style={styles.rankItemRow}>
                <Text style={styles.rankNumText}>4</Text>
                <Text style={styles.rankEmojiText}>👨‍🔧</Text>
                <Text style={styles.rankNameText}>Peter Mwangi</Text>
                <Text style={styles.rankValText}>{formatValue(640)}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* 6. REWARDS & MILESTONE BADGES */}
        <View style={styles.rewardsContainer}>
          <Text style={styles.savingsSectionTitle}>Savings Badges Earned</Text>
          <View style={styles.rewardsGrid}>
            <View style={styles.rewardBadgeCard}>
              <Text style={styles.rewardEmoji}>🏆</Text>
              <Text style={styles.rewardTitle}>First Step</Text>
              <Text style={styles.rewardDesc}>Saved first coin</Text>
            </View>
            <View style={styles.rewardBadgeCard}>
              <Text style={styles.rewardEmoji}>🔥</Text>
              <Text style={styles.rewardTitle}>Streak Saver</Text>
              <Text style={styles.rewardDesc}>3 on-time saves</Text>
            </View>
            <View style={styles.rewardBadgeCard}>
              <Text style={styles.rewardEmoji}>🎯</Text>
              <Text style={styles.rewardTitle}>Target Met</Text>
              <Text style={styles.rewardDesc}>School fees done</Text>
            </View>
          </View>
        </View>

        {/* 7. CONTRIBUTION HISTORY & TIMELINE FILTERS */}
        <View style={styles.historyContainer}>
          <Text style={styles.savingsSectionTitle}>Contribution Timeline</Text>
          
          {/* History filter columns */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.historyFilterScrollPills}>
            <View style={styles.filterGroupPillRow}>
              <Text style={styles.filterTitleLabel}>Month:</Text>
              {["All", "May", "Apr", "Mar"].map((m) => (
                <TouchableOpacity
                  key={m}
                  onPress={() => setHistoryFilterMonth(m)}
                  style={[styles.filterPill, historyFilterMonth === m ? styles.filterPillActive : null]}
                >
                  <Text style={[styles.filterPillText, historyFilterMonth === m ? styles.filterPillTextActive : null]}>
                    {m}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={[styles.historyFilterScrollPills, { marginTop: 8 }]}>
            <View style={styles.filterGroupPillRow}>
              <Text style={styles.filterTitleLabel}>Pay Method:</Text>
              {["All", "M-Pesa", "MetaMask"].map((met) => (
                <TouchableOpacity
                  key={met}
                  onPress={() => setHistoryFilterMethod(met)}
                  style={[styles.filterPill, historyFilterMethod === met ? styles.filterPillActive : null]}
                >
                  <Text style={[styles.filterPillText, historyFilterMethod === met ? styles.filterPillTextActive : null]}>
                    {met}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>

          {/* History timeline list */}
          <View style={styles.historyCardList}>
            {filteredTxs.length === 0 ? (
              <View style={styles.historyEmptyStateBox}>
                <Text style={styles.emptyStateEmoji}>📂</Text>
                <Text style={styles.emptyStateText}>No contributions found matching filters</Text>
              </View>
            ) : (
              filteredTxs.map((item) => {
                const isMpesa = item.date.includes("MPESA") || item.id.toString().includes("mpesa") || item.id % 2 === 0;
                return (
                  <View key={item.id} style={styles.contribHistoryItemRow}>
                    <View style={styles.contribHistoryLeft}>
                      <View style={styles.contribHistoryIconWrapper}>
                        <Text style={styles.contribHistoryEmoji}>{isMpesa ? "📱" : "🦊"}</Text>
                      </View>
                      <View>
                        <Text style={styles.contribHistoryDate}>{item.date.split(",")[0]}</Text>
                        <Text style={styles.contribHistoryRef}>Ref: TX-CHAMA-{item.id.toString().substring(0, 5)}</Text>
                      </View>
                    </View>
                    <View style={styles.contribHistoryRight}>
                      <Text style={styles.contribHistoryAmount}>{formatValue(Math.abs(item.amount))}</Text>
                      <TouchableOpacity 
                        onPress={() => {
                          setReceiptDetails({
                            txId: "TX-RECEIPT-" + item.id,
                            title: "Chama Contribution",
                            amount: Math.abs(item.amount),
                            date: item.date,
                            recipient: "Green Future Chama Vault"
                          });
                          setShowReceiptModal(true);
                        }} 
                        style={styles.historyReceiptBtn}
                      >
                        <Text style={styles.historyReceiptBtnText}>Receipt</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                );
              })
            )}
          </View>
        </View>

        {/* GOAL ADDITION MODAL SIMULATOR */}
        <Modal visible={showAddGoalModal} transparent animationType="slide">
          <View style={styles.modalOverlay}>
            <View style={styles.goalAddCardWrapper}>
              <View style={styles.goalAddHeaderRow}>
                <Text style={styles.goalAddHeaderTitle}>Create Savings Target Goal</Text>
                <TouchableOpacity onPress={() => setShowAddGoalModal(false)} style={styles.goalAddCloseBtn}>
                  <Text style={styles.goalAddCloseBtnText}>✕</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.goalAddFormCardBody}>
                <Text style={styles.goalAddFormLabel}>Goal Name</Text>
                <TextInput
                  style={styles.goalAddFormInput}
                  placeholder="e.g. Asset Purchase"
                  placeholderTextColor="#9CA3AF"
                  value={newGoalTitle}
                  onChangeText={setNewGoalTitle}
                />

                <Text style={styles.goalAddFormLabel}>Target Amount ({currency})</Text>
                <TextInput
                  style={styles.goalAddFormInput}
                  placeholder="e.g. 50000"
                  placeholderTextColor="#9CA3AF"
                  keyboardType="numeric"
                  value={newGoalTarget}
                  onChangeText={setNewGoalTarget}
                />

                <Text style={styles.goalAddFormLabel}>Deadline Date</Text>
                <TextInput
                  style={styles.goalAddFormInput}
                  placeholder="e.g. 31 Dec 2026"
                  placeholderTextColor="#9CA3AF"
                  value={newGoalDeadline}
                  onChangeText={setNewGoalDeadline}
                />

                <Text style={styles.goalAddFormLabel}>Select Icon Badge</Text>
                <View style={styles.badgeSelectorRow}>
                  {["💰", "💼", "🎓", "🛡️", "🏠", "🚜"].map((emoji) => (
                    <TouchableOpacity
                      key={emoji}
                      onPress={() => setNewGoalBadge(emoji)}
                      style={[
                        styles.badgeSelectorPillOption,
                        newGoalBadge === emoji ? styles.badgeSelectorPillOptionActive : null
                      ]}
                    >
                      <Text style={styles.badgeSelectorEmojiText}>{emoji}</Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <TouchableOpacity onPress={handleCreateGoalSubmit} style={styles.goalAddSubmitBtn}>
                  <Text style={styles.goalAddSubmitBtnText}>Create Goal</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </ScrollView>
    );
  };

  // -------------------------------------------------------------
  // SCREEN RENDERING BRANCHES
  // -------------------------------------------------------------

  if (currentScreen === "splash") {
    // SCREEN 1: SPLASH SCREEN
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

  if (currentScreen === "onboarding") {
    // SCREEN 2: ONBOARDING SCREEN (4 slides)
    const slide = onboardingSlides[onboardingIndex];
    return (
      <View style={[styles.containerLight, { backgroundColor: themeBg }]}>
        <StatusBar style={isDark ? "light" : "dark"} />
        {onboardingIndex < 3 && (
          <TouchableOpacity onPress={() => setCurrentScreen("welcome")} style={[styles.skipButtonTop, { backgroundColor: themeCardBg, borderColor: themeBorderColor }]}>
            <Text style={[styles.skipButtonTextTop, { color: themeTextColor }]}>{t("skip")}</Text>
          </TouchableOpacity>
        )}

        <View style={[styles.onboardingHeroBox, { backgroundColor: isDark ? "rgba(255, 255, 255, 0.05)" : "rgba(0, 135, 90, 0.08)" }]}>
          <Text style={styles.onboardingHeroEmoji}>{slide.image}</Text>
        </View>
        
        <View style={styles.onboardingInfoBox}>
          <Text style={[styles.onboardingLabel, { color: "#00875A" }]}>{slide.label}</Text>
          <Text style={[styles.onboardingTitle, { color: themeTextColor }]}>{slide.title}</Text>
          <Text style={[styles.onboardingDesc, { color: themeSubtitleColor }]}>{slide.desc}</Text>
        </View>

        <View style={styles.carouselIndicators}>
          {onboardingSlides.map((_, idx) => (
            <View
              key={idx}
              style={[
                styles.indicatorDot,
                idx === onboardingIndex ? styles.indicatorDotActive : { backgroundColor: isDark ? "#4B5563" : "#E5E7EB" }
              ]}
            />
          ))}
        </View>

        <View style={styles.onboardingActionRow}>
          {onboardingIndex > 0 ? (
            <TouchableOpacity onPress={() => setOnboardingIndex(onboardingIndex - 1)} style={[styles.onboardingBackBtn, { backgroundColor: themeCardBg, borderColor: themeBorderColor }]}>
              <Text style={[styles.onboardingBackBtnText, { color: themeTextColor }]}>{t("back")}</Text>
            </TouchableOpacity>
          ) : (
            <View style={{ flex: 1 }} />
          )}

          <TouchableOpacity onPress={handleOnboardingNext} style={styles.onboardingNextBtn}>
            <Text style={styles.onboardingNextBtnText}>
              {onboardingIndex === 3 ? t("get_started") : t("next")}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  if (currentScreen === "welcome") {
    return (
      <View style={{ flex: 1, backgroundColor: isDark ? "#0A0F1E" : "#F0FDF9" }}>
        <StatusBar style="light" />

        {/* Deep gradient hero background */}
        <View style={{
          position: "absolute", top: 0, left: 0, right: 0, height: "60%",
          backgroundColor: "#00875A",
          borderBottomLeftRadius: 48,
          borderBottomRightRadius: 48,
          overflow: "hidden"
        }}>
          {/* Decorative circles */}
          <View style={{ position: "absolute", top: -60, right: -60, width: 220, height: 220, borderRadius: 110, backgroundColor: "rgba(255,255,255,0.06)" }} />
          <View style={{ position: "absolute", top: 40, left: -80, width: 180, height: 180, borderRadius: 90, backgroundColor: "rgba(255,255,255,0.05)" }} />
          <View style={{ position: "absolute", bottom: -30, right: 40, width: 120, height: 120, borderRadius: 60, backgroundColor: "rgba(255,255,255,0.07)" }} />
        </View>

        {/* Logo + Brand */}
        <View style={{ alignItems: "center", marginTop: 70, paddingHorizontal: 24 }}>
          <View style={{
            width: 84, height: 84, borderRadius: 26,
            backgroundColor: "rgba(255,255,255,0.18)",
            alignItems: "center", justifyContent: "center",
            borderWidth: 1.5, borderColor: "rgba(255,255,255,0.35)",
            marginBottom: 18,
            shadowColor: "#000", shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.2, shadowRadius: 12, elevation: 8
          }}>
            <Text style={{ fontSize: 42 }}>♾️</Text>
          </View>
          <Text style={{ fontSize: 36, fontWeight: "900", color: "#FFFFFF", letterSpacing: -0.5 }}>PayLoop</Text>
          <Text style={{ fontSize: 14, color: "rgba(255,255,255,0.8)", marginTop: 6, textAlign: "center", lineHeight: 20 }}>
            Web3-Powered Chama Savings & Micro-Lending
          </Text>
        </View>

        {/* Feature pills */}
        <View style={{ flexDirection: "row", justifyContent: "center", gap: 8, marginTop: 24, paddingHorizontal: 24, flexWrap: "wrap" }}>
          {["🔒 Secure", "⚡ Instant", "🌍 Web3"].map(tag => (
            <View key={tag} style={{ backgroundColor: "rgba(255,255,255,0.18)", borderRadius: 20, paddingVertical: 5, paddingHorizontal: 14, borderWidth: 1, borderColor: "rgba(255,255,255,0.25)" }}>
              <Text style={{ color: "#FFF", fontSize: 12, fontWeight: "600" }}>{tag}</Text>
            </View>
          ))}
        </View>

        {/* Bottom card */}
        <View style={{
          position: "absolute", bottom: 0, left: 0, right: 0,
          backgroundColor: isDark ? "#111827" : "#FFFFFF",
          borderTopLeftRadius: 36, borderTopRightRadius: 36,
          paddingHorizontal: 28, paddingTop: 36, paddingBottom: 50,
          shadowColor: "#000", shadowOffset: { width: 0, height: -4 }, shadowOpacity: 0.08, shadowRadius: 16, elevation: 10
        }}>
          <Text style={{ fontSize: 22, fontWeight: "800", color: isDark ? "#F9FAFB" : "#111827", marginBottom: 4 }}>
            Start Your Journey 🚀
          </Text>
          <Text style={{ fontSize: 14, color: isDark ? "#9CA3AF" : "#6B7280", marginBottom: 28, lineHeight: 20 }}>
            Join thousands saving smarter with blockchain-powered chama circles.
          </Text>

          <TouchableOpacity
            onPress={() => setCurrentScreen("register")}
            style={{
              backgroundColor: "#00875A", borderRadius: 16, paddingVertical: 17,
              alignItems: "center", marginBottom: 14,
              shadowColor: "#00875A", shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.35, shadowRadius: 10, elevation: 6
            }}
          >
            <Text style={{ color: "#FFF", fontSize: 16, fontWeight: "800", letterSpacing: 0.3 }}>✨ Create Account</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setCurrentScreen(selectedUser && selectedUser.name ? "pin" : "login")}
            style={{
              backgroundColor: "transparent", borderRadius: 16, paddingVertical: 16,
              alignItems: "center", borderWidth: 1.5,
              borderColor: isDark ? "#374151" : "#D1FAE5"
            }}
          >
            <Text style={{ color: isDark ? "#34D399" : "#00875A", fontSize: 16, fontWeight: "700" }}>Sign In →</Text>
          </TouchableOpacity>

          <Text style={{ color: isDark ? "#6B7280" : "#9CA3AF", fontSize: 11, textAlign: "center", marginTop: 20 }}>
            By continuing you agree to our Terms of Service & Privacy Policy
          </Text>
        </View>
      </View>
    );
  }

  if (currentScreen === "register") {
    const inputStyle = {
      backgroundColor: isDark ? "#1F2937" : "#F9FAFB",
      borderRadius: 12, borderWidth: 1.5,
      borderColor: isDark ? "#374151" : "#E5E7EB",
      color: isDark ? "#F9FAFB" : "#111827",
      paddingHorizontal: 16, paddingVertical: 14,
      fontSize: 15, marginTop: 6
    };
    const labelStyle = {
      fontSize: 12, fontWeight: "700",
      color: isDark ? "#9CA3AF" : "#374151",
      marginTop: 16, textTransform: "uppercase", letterSpacing: 0.6
    };
    return (
      <View style={{ flex: 1, backgroundColor: isDark ? "#0A0F1E" : "#F0FDF9" }}>
        <StatusBar style={isDark ? "light" : "dark"} />

        {/* Header strip */}
        <View style={{
          paddingTop: 56, paddingBottom: 24, paddingHorizontal: 24,
          backgroundColor: "#00875A",
          borderBottomLeftRadius: 32, borderBottomRightRadius: 32
        }}>
          <TouchableOpacity
            onPress={() => setCurrentScreen("welcome")}
            style={{ flexDirection: "row", alignItems: "center", marginBottom: 16 }}
          >
            <Text style={{ color: "rgba(255,255,255,0.8)", fontSize: 22, marginRight: 8 }}>←</Text>
            <Text style={{ color: "rgba(255,255,255,0.8)", fontSize: 14, fontWeight: "600" }}>Back</Text>
          </TouchableOpacity>
          <Text style={{ fontSize: 28, fontWeight: "900", color: "#FFF", letterSpacing: -0.5 }}>Create Account</Text>
          <Text style={{ fontSize: 14, color: "rgba(255,255,255,0.75)", marginTop: 4 }}>Join PayLoop — free & takes 60 seconds</Text>
        </View>

        <ScrollView
          contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 24, paddingBottom: 50 }}
          showsVerticalScrollIndicator={false}
        >
          <View style={{
            backgroundColor: isDark ? "#111827" : "#FFFFFF",
            borderRadius: 24, padding: 22,
            borderWidth: 1, borderColor: isDark ? "#1F2937" : "#E5E7EB",
            shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 3
          }}>
            <Text style={labelStyle}>Full Name</Text>
            <TextInput style={inputStyle} placeholder="John Kamau" placeholderTextColor={isDark ? "#4B5563" : "#9CA3AF"} value={regName} onChangeText={setRegName} />

            <Text style={labelStyle}>Email Address</Text>
            <TextInput style={inputStyle} placeholder="john@gmail.com" placeholderTextColor={isDark ? "#4B5563" : "#9CA3AF"} keyboardType="email-address" autoCapitalize="none" value={regEmail} onChangeText={setRegEmail} />

            <Text style={labelStyle}>Phone Number</Text>
            <TextInput style={inputStyle} placeholder="+254 712 345 678" placeholderTextColor={isDark ? "#4B5563" : "#9CA3AF"} keyboardType="phone-pad" value={regPhone} onChangeText={setRegPhone} />

            <Text style={labelStyle}>Password</Text>
            <TextInput style={inputStyle} placeholder="Min. 6 characters" placeholderTextColor={isDark ? "#4B5563" : "#9CA3AF"} secureTextEntry value={regPassword} onChangeText={setRegPassword} />

            <Text style={labelStyle}>Confirm Password</Text>
            <TextInput style={inputStyle} placeholder="Repeat password" placeholderTextColor={isDark ? "#4B5563" : "#9CA3AF"} secureTextEntry value={regConfirmPassword} onChangeText={setRegConfirmPassword} />
          </View>

          {/* Security badge */}
          <View style={{ flexDirection: "row", alignItems: "center", marginTop: 14, marginBottom: 20, paddingHorizontal: 4 }}>
            <Text style={{ fontSize: 14, marginRight: 6 }}>🔒</Text>
            <Text style={{ fontSize: 12, color: isDark ? "#6B7280" : "#9CA3AF", flex: 1 }}>
              Your data is encrypted end-to-end. We never sell your information.
            </Text>
          </View>

          <TouchableOpacity
            onPress={handleRegisterSubmit}
            disabled={isLoading}
            style={{
              backgroundColor: "#00875A", borderRadius: 16, paddingVertical: 17,
              alignItems: "center", opacity: isLoading ? 0.75 : 1,
              shadowColor: "#00875A", shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.3, shadowRadius: 10, elevation: 5
            }}
          >
            {isLoading
              ? <ActivityIndicator color="#FFF" size="small" />
              : <Text style={{ color: "#FFF", fontSize: 16, fontWeight: "800" }}>Create My Account →</Text>
            }
          </TouchableOpacity>

          <TouchableOpacity onPress={() => setCurrentScreen(selectedUser && selectedUser.name ? "pin" : "login")} style={{ alignItems: "center", marginTop: 20 }}>
            <Text style={{ color: isDark ? "#9CA3AF" : "#6B7280", fontSize: 14 }}>
              Already have an account? <Text style={{ color: "#00875A", fontWeight: "700" }}>Sign In</Text>
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    );
  }

  if (currentScreen === "verification") {
    return (
      <View style={{ flex: 1, backgroundColor: isDark ? "#0A0F1E" : "#F0FDF9" }}>
        <StatusBar style={isDark ? "light" : "dark"} />

        {/* Header */}
        <View style={{
          paddingTop: 56, paddingBottom: 28, paddingHorizontal: 24,
          backgroundColor: "#4F46E5",
          borderBottomLeftRadius: 32, borderBottomRightRadius: 32
        }}>
          <TouchableOpacity onPress={() => setCurrentScreen("register")} style={{ flexDirection: "row", alignItems: "center", marginBottom: 16 }}>
            <Text style={{ color: "rgba(255,255,255,0.8)", fontSize: 22, marginRight: 8 }}>←</Text>
            <Text style={{ color: "rgba(255,255,255,0.8)", fontSize: 14, fontWeight: "600" }}>Back</Text>
          </TouchableOpacity>
          <Text style={{ fontSize: 34, marginBottom: 8 }}>📬</Text>
          <Text style={{ fontSize: 26, fontWeight: "900", color: "#FFF" }}>Verify Email</Text>
          <Text style={{ fontSize: 13, color: "rgba(255,255,255,0.75)", marginTop: 4, lineHeight: 19 }}>
            We sent a 6-digit code to{"\n"}<Text style={{ fontWeight: "700", color: "#C7D2FE" }}>{regEmail || "your email"}</Text>
          </Text>
        </View>

        <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 32, paddingBottom: 50 }} showsVerticalScrollIndicator={false}>
          {/* Sandbox OTP preview */}
          {sentOtp ? (
            <View style={{
              backgroundColor: isDark ? "#064E3B" : "#ECFDF5",
              borderRadius: 16, padding: 16, marginBottom: 20,
              borderWidth: 1.5, borderColor: "#34D399",
              flexDirection: "row", alignItems: "center"
            }}>
              <Text style={{ fontSize: 22, marginRight: 12 }}>🔑</Text>
              <View>
                <Text style={{ color: isDark ? "#6EE7B7" : "#065F46", fontSize: 11, fontWeight: "600", textTransform: "uppercase", letterSpacing: 0.5 }}>Sandbox OTP Code</Text>
                <Text style={{ color: "#00875A", fontSize: 28, fontWeight: "900", letterSpacing: 6, marginTop: 2 }}>{sentOtp}</Text>
              </View>
            </View>
          ) : null}

          {/* OTP input */}
          <View style={{
            backgroundColor: isDark ? "#111827" : "#FFFFFF",
            borderRadius: 24, padding: 28,
            borderWidth: 1.5, borderColor: isDark ? "#1F2937" : "#E0E7FF",
            alignItems: "center",
            shadowColor: "#4F46E5", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.08, shadowRadius: 12, elevation: 4
          }}>
            <Text style={{ color: isDark ? "#9CA3AF" : "#6B7280", fontSize: 13, marginBottom: 18 }}>Enter the 6-digit verification code</Text>
            <TextInput
              style={{
                fontSize: 34, fontWeight: "900", letterSpacing: 12,
                textAlign: "center", color: isDark ? "#F9FAFB" : "#111827",
                width: "100%", paddingVertical: 8,
                borderBottomWidth: 2, borderBottomColor: "#4F46E5"
              }}
              placeholder="• • • • • •"
              placeholderTextColor={isDark ? "#374151" : "#D1D5DB"}
              keyboardType="numeric"
              maxLength={6}
              value={otpCode}
              onChangeText={setOtpCode}
            />
          </View>

          <TouchableOpacity
            onPress={handleVerifyOtp}
            disabled={isLoading}
            style={{
              backgroundColor: "#4F46E5", borderRadius: 16, paddingVertical: 17,
              alignItems: "center", marginTop: 20, opacity: isLoading ? 0.75 : 1,
              shadowColor: "#4F46E5", shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.35, shadowRadius: 10, elevation: 5
            }}
          >
            {isLoading
              ? <ActivityIndicator color="#FFF" size="small" />
              : <Text style={{ color: "#FFF", fontSize: 16, fontWeight: "800" }}>✅ Verify & Continue</Text>
            }
          </TouchableOpacity>

          {/* Sandbox auto-fill */}
          <TouchableOpacity
            onPress={handleFetchLatestOtp}
            disabled={isLoading}
            style={{
              backgroundColor: isDark ? "#1F2937" : "#F3F4F6",
              borderRadius: 16, paddingVertical: 14,
              alignItems: "center", marginTop: 12,
              borderWidth: 1, borderColor: isDark ? "#374151" : "#E5E7EB"
            }}
          >
            {isLoading
              ? <ActivityIndicator color="#4F46E5" size="small" />
              : <Text style={{ color: "#4F46E5", fontSize: 14, fontWeight: "700" }}>⚡ Auto-Fill OTP (Sandbox)</Text>
            }
          </TouchableOpacity>

          {/* Resend / Change email row */}
          <View style={[styles.otpSecondaryActionsRow, { marginTop: 24 }]}>
            <TouchableOpacity
              disabled={otpTimer > 0}
              onPress={handleResendOtp}
              style={styles.otpTimerLink}
            >
              <Text style={[styles.otpTimerLinkText, { color: otpTimer > 0 ? (isDark ? "#475569" : "#9CA3AF") : "#00875A" }]}>
                {otpTimer > 0 ? `${t("resend_code")} (${otpTimer}s)` : t("resend_code")}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => setCurrentScreen("register")} style={styles.changeEmailLink}>
              <Text style={[styles.changeEmailLinkText, { color: "#00875A" }]}>{t("change_email")}</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    );
  }

  if (currentScreen === "createPin") {
    // SCREEN 6: CREATE PIN SCREEN
    const pinDots = [1, 2, 3, 4, 5, 6];
    return (
      <View style={[styles.containerLight, { backgroundColor: themeBg }]}>
        <StatusBar style={isDark ? "light" : "dark"} />
        <View style={styles.pinHeaderBox}>
          <Text style={[styles.pinTitle, { color: themeTextColor }]}>{t("create_pin_title")}</Text>
          <Text style={[styles.pinSubtitle, { color: themeSubtitleColor }]}>{t("create_pin_subtitle")}</Text>
        </View>

        <View style={styles.pinDotsRow}>
          {pinDots.map((d, idx) => (
            <View
              key={d}
              style={[
                styles.pinDot,
                { backgroundColor: isDark ? "#334155" : "#E5E7EB" },
                pinCode.length > idx ? styles.pinDotFilled : null
              ]}
            />
          ))}
        </View>

        <View style={styles.keypadContainer}>
          <View style={styles.keypadRow}>
            <TouchableOpacity onPress={() => handlePinPress("1")} style={[styles.keypadKey, { backgroundColor: themeCardBg, borderColor: themeBorderColor }]}><Text style={[styles.keyText, { color: themeTextColor }]}>1</Text></TouchableOpacity>
            <TouchableOpacity onPress={() => handlePinPress("2")} style={[styles.keypadKey, { backgroundColor: themeCardBg, borderColor: themeBorderColor }]}><Text style={[styles.keyText, { color: themeTextColor }]}>2</Text></TouchableOpacity>
            <TouchableOpacity onPress={() => handlePinPress("3")} style={[styles.keypadKey, { backgroundColor: themeCardBg, borderColor: themeBorderColor }]}><Text style={[styles.keyText, { color: themeTextColor }]}>3</Text></TouchableOpacity>
          </View>
          <View style={styles.keypadRow}>
            <TouchableOpacity onPress={() => handlePinPress("4")} style={[styles.keypadKey, { backgroundColor: themeCardBg, borderColor: themeBorderColor }]}><Text style={[styles.keyText, { color: themeTextColor }]}>4</Text></TouchableOpacity>
            <TouchableOpacity onPress={() => handlePinPress("5")} style={[styles.keypadKey, { backgroundColor: themeCardBg, borderColor: themeBorderColor }]}><Text style={[styles.keyText, { color: themeTextColor }]}>5</Text></TouchableOpacity>
            <TouchableOpacity onPress={() => handlePinPress("6")} style={[styles.keypadKey, { backgroundColor: themeCardBg, borderColor: themeBorderColor }]}><Text style={[styles.keyText, { color: themeTextColor }]}>6</Text></TouchableOpacity>
          </View>
          <View style={styles.keypadRow}>
            <TouchableOpacity onPress={() => handlePinPress("7")} style={[styles.keypadKey, { backgroundColor: themeCardBg, borderColor: themeBorderColor }]}><Text style={[styles.keyText, { color: themeTextColor }]}>7</Text></TouchableOpacity>
            <TouchableOpacity onPress={() => handlePinPress("8")} style={[styles.keypadKey, { backgroundColor: themeCardBg, borderColor: themeBorderColor }]}><Text style={[styles.keyText, { color: themeTextColor }]}>8</Text></TouchableOpacity>
            <TouchableOpacity onPress={() => handlePinPress("9")} style={[styles.keypadKey, { backgroundColor: themeCardBg, borderColor: themeBorderColor }]}><Text style={[styles.keyText, { color: themeTextColor }]}>9</Text></TouchableOpacity>
          </View>
          <View style={styles.keypadRow}>
            <View style={[styles.keypadKey, { opacity: 0 }]} />
            <TouchableOpacity onPress={() => handlePinPress("0")} style={[styles.keypadKey, { backgroundColor: themeCardBg, borderColor: themeBorderColor }]}><Text style={[styles.keyText, { color: themeTextColor }]}>0</Text></TouchableOpacity>
            <TouchableOpacity onPress={() => handlePinPress("back")} style={[styles.keypadKey, { backgroundColor: themeCardBg, borderColor: themeBorderColor }]}><Text style={[styles.keyTextEmoji, { color: themeTextColor }]}>⌫</Text></TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }

  if (currentScreen === "connectWallet") {
    // SCREEN 7: CONNECT WALLET
    return (
      <View style={[styles.containerLight, { backgroundColor: themeBg }]}>
        <StatusBar style={isDark ? "light" : "dark"} />
        <View style={styles.connectWalletHeaderBox}>
          <Text style={[styles.connectWalletTitle, { color: themeTextColor }]}>{t("connect_wallet_title")}</Text>
          <Text style={[styles.connectWalletSubtitle, { color: themeSubtitleColor }]}>{t("connect_wallet_subtitle")}</Text>
        </View>

        <View style={styles.walletOptionsListWidth}>
          <TouchableOpacity onPress={() => requestSignature("Connect Wallet", "Auth Token Sign", () => setCurrentScreen("completeProfile"))} style={[styles.walletButton, { backgroundColor: themeCardBg, borderColor: themeBorderColor }]}>
            <Text style={styles.walletIcon}>🦊</Text>
            <Text style={[styles.walletButtonText, { color: themeTextColor }]}>MetaMask</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => Alert.alert("WalletConnect", "Connecting to WalletConnect registry...")} style={[styles.walletButton, { backgroundColor: themeCardBg, borderColor: themeBorderColor }]}>
            <Text style={styles.walletIcon}>⚡</Text>
            <Text style={[styles.walletButtonText, { color: themeTextColor }]}>WalletConnect</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity onPress={() => setCurrentScreen("completeProfile")} style={styles.skipWalletBtn}>
          <Text style={[styles.skipWalletBtnText, { color: "#00875A" }]}>{t("skip_now")}</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (currentScreen === "completeProfile") {
    // SCREEN 8: COMPLETE PROFILE PAGE
    return (
      <ScrollView contentContainerStyle={[styles.authScrollContainer, { backgroundColor: themeBg }]} style={{ backgroundColor: themeBg }}>
        <StatusBar style={isDark ? "light" : "dark"} />
        {renderModernHeader(t("complete_profile_title"), () => setCurrentScreen("connectWallet"))}
        
        <View style={[styles.authHeaderBox, { marginTop: 6, marginBottom: 16 }]}>
          <Text style={[styles.authHeaderSubtitle, { color: themeSubtitleColor }]}>{t("complete_profile_subtitle")}</Text>
        </View>

        <TouchableOpacity onPress={() => setShowAvatarPicker(true)} style={styles.avatarSelectionContainerMock}>
          {profAvatarUri ? (
            <Image source={{ uri: profAvatarUri }} style={{ width: 80, height: 80, borderRadius: 40, borderWidth: 1.5, borderColor: "#00875A" }} />
          ) : (
            <View style={[styles.avatarMockCircle, { backgroundColor: isDark ? "#1E293B" : "#F3F4F6", borderColor: themeBorderColor }]}>
              <Text style={styles.avatarMockEmoji}>👤</Text>
            </View>
          )}
          <Text style={styles.avatarMockLabel}>{profAvatarUri ? t("change_photo") : t("upload_photo")}</Text>
        </TouchableOpacity>

        <View style={styles.authFormBox}>
          <Text style={[styles.authFormLabel, { color: themeTextColor }]}>{t("gender")}</Text>
          <View style={styles.pickerAlternativeRow}>
            {["Male", "Female", "Other"].map((g) => (
              <TouchableOpacity
                key={g}
                onPress={() => setProfGender(g)}
                style={[
                  styles.pickerOptionButton,
                  { backgroundColor: isDark ? "#0F172A" : "#F3F4F6", borderColor: themeBorderColor },
                  profGender === g ? styles.pickerOptionButtonActive : null
                ]}
              >
                <Text style={[styles.pickerOptionText, { color: isDark ? "#94A3B8" : "#4B5563" }, profGender === g ? styles.pickerOptionTextActive : null]}>
                  {g}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={[styles.authFormLabel, { marginTop: 14, color: themeTextColor }]}>{t("dob")}</Text>
          <TextInput
            style={[styles.authFormInput, { backgroundColor: themeCardBg, color: themeTextColor, borderColor: themeBorderColor }]}
            placeholder="12 Aug 1990"
            placeholderTextColor={isDark ? "#64748B" : "#9CA3AF"}
            value={profDob}
            onChangeText={setProfDob}
          />

          <Text style={[styles.authFormLabel, { color: themeTextColor }]}>{t("marital_status")}</Text>
          <View style={styles.pickerAlternativeRow}>
            {["Single", "Married", "Other"].map((m) => (
              <TouchableOpacity
                key={m}
                onPress={() => setProfMarital(m)}
                style={[
                  styles.pickerOptionButton,
                  { backgroundColor: isDark ? "#0F172A" : "#F3F4F6", borderColor: themeBorderColor },
                  profMarital === m ? styles.pickerOptionButtonActive : null
                ]}
              >
                <Text style={[styles.pickerOptionText, { color: isDark ? "#94A3B8" : "#4B5563" }, profMarital === m ? styles.pickerOptionTextActive : null]}>
                  {m}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={[styles.authFormLabel, { marginTop: 14, color: themeTextColor }]}>{t("occupation")}</Text>
          <TextInput
            style={[styles.authFormInput, { backgroundColor: themeCardBg, color: themeTextColor, borderColor: themeBorderColor }]}
            placeholder="e.g. Business Owner"
            placeholderTextColor={isDark ? "#64748B" : "#9CA3AF"}
            value={profOccupation}
            onChangeText={setProfOccupation}
          />

          <Text style={[styles.authFormLabel, { color: themeTextColor }]}>{t("county")}</Text>
          <TextInput
            style={[styles.authFormInput, { backgroundColor: themeCardBg, color: themeTextColor, borderColor: themeBorderColor }]}
            placeholder="e.g. Uasin Gishu"
            placeholderTextColor={isDark ? "#64748B" : "#9CA3AF"}
            value={profCounty}
            onChangeText={setProfCounty}
          />

          <Text style={[styles.authFormLabel, { color: themeTextColor }]}>{t("bio_label")}</Text>
          <TextInput
            style={[styles.authFormInput, { height: 70, backgroundColor: themeCardBg, color: themeTextColor, borderColor: themeBorderColor }]}
            placeholder="A short story about your goals..."
            placeholderTextColor={isDark ? "#64748B" : "#9CA3AF"}
            multiline
            value={profBio}
            onChangeText={setProfBio}
          />

          <TouchableOpacity 
            onPress={handleProfileComplete} 
            disabled={isLoading}
            style={[styles.buttonForestGreenSubmitContribution, { opacity: isLoading ? 0.7 : 1 }]}
          >
            {isLoading ? (
              <ActivityIndicator color="#ffffff" size="small" />
            ) : (
              <Text style={styles.buttonTextPrimary}>{t("save_continue")}</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    );
  }

  if (currentScreen === "login") {
    return (
      <View style={{ flex: 1, backgroundColor: isDark ? "#0A0F1E" : "#F0FDF9" }}>
        <StatusBar style={isDark ? "light" : "dark"} />

        {/* Header */}
        <View style={{
          paddingTop: 56, paddingBottom: 28, paddingHorizontal: 24,
          backgroundColor: "#00875A",
          borderBottomLeftRadius: 32, borderBottomRightRadius: 32
        }}>
          <TouchableOpacity onPress={() => setCurrentScreen("welcome")} style={{ flexDirection: "row", alignItems: "center", marginBottom: 16 }}>
            <Text style={{ color: "rgba(255,255,255,0.8)", fontSize: 22, marginRight: 8 }}>←</Text>
            <Text style={{ color: "rgba(255,255,255,0.8)", fontSize: 14, fontWeight: "600" }}>Back</Text>
          </TouchableOpacity>
          <Text style={{ fontSize: 28, fontWeight: "900", color: "#FFF", letterSpacing: -0.3 }}>Welcome Back 👋</Text>
          <Text style={{ fontSize: 14, color: "rgba(255,255,255,0.75)", marginTop: 4 }}>Select your account to continue</Text>
        </View>

        <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 28, paddingBottom: 50 }} showsVerticalScrollIndicator={false}>
          {registeredUsers.length === 0 ? (
            <View style={{
              backgroundColor: isDark ? "#111827" : "#FFF",
              borderRadius: 24, padding: 36, alignItems: "center",
              borderWidth: 1, borderColor: isDark ? "#1F2937" : "#E5E7EB"
            }}>
              <Text style={{ fontSize: 48, marginBottom: 16 }}>🔍</Text>
              <Text style={{ color: isDark ? "#F9FAFB" : "#111827", fontSize: 18, fontWeight: "800", marginBottom: 8 }}>No Accounts Found</Text>
              <Text style={{ color: isDark ? "#9CA3AF" : "#6B7280", fontSize: 14, textAlign: "center", marginBottom: 24, lineHeight: 20 }}>
                Start by creating your first PayLoop account to join the network.
              </Text>
              <TouchableOpacity
                onPress={() => setCurrentScreen("register")}
                style={{ backgroundColor: "#00875A", borderRadius: 14, paddingVertical: 14, paddingHorizontal: 32 }}
              >
                <Text style={{ color: "#FFF", fontWeight: "800", fontSize: 15 }}>Create Account</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <>
              <Text style={{ color: isDark ? "#9CA3AF" : "#6B7280", fontSize: 12, fontWeight: "700", textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 12 }}>
                {registeredUsers.length} Account{registeredUsers.length !== 1 ? "s" : ""} on this device
              </Text>
              {registeredUsers.map((user) => (
                <TouchableOpacity
                  key={user.email}
                  onPress={() => {
                    setSelectedUser(user);
                    setPinCode("");
                    setCurrentScreen("pin");
                  }}
                  style={{
                    backgroundColor: isDark ? "#111827" : "#FFFFFF",
                    borderRadius: 20, padding: 18, marginBottom: 12,
                    flexDirection: "row", alignItems: "center",
                    borderWidth: 1.5, borderColor: isDark ? "#1F2937" : "#D1FAE5",
                    shadowColor: "#00875A", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.07, shadowRadius: 8, elevation: 2
                  }}
                >
                  <View style={{
                    width: 52, height: 52, borderRadius: 16,
                    backgroundColor: isDark ? "#1F2937" : "#ECFDF5",
                    alignItems: "center", justifyContent: "center", marginRight: 14,
                    borderWidth: 1, borderColor: isDark ? "#374151" : "#D1FAE5"
                  }}>
                    <Text style={{ fontSize: 26 }}>{user.avatar && user.avatar.length <= 4 ? user.avatar : "👤"}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ color: isDark ? "#F9FAFB" : "#111827", fontSize: 16, fontWeight: "700" }}>{user.name}</Text>
                    <Text style={{ color: isDark ? "#6B7280" : "#9CA3AF", fontSize: 12, marginTop: 2 }}>
                      {user.email}
                    </Text>
                    <View style={{ flexDirection: "row", alignItems: "center", marginTop: 5, gap: 8 }}>
                      <View style={{ backgroundColor: "#D1FAE5", borderRadius: 8, paddingHorizontal: 8, paddingVertical: 2 }}>
                        <Text style={{ color: "#065F46", fontSize: 10, fontWeight: "700" }}>Score: {user.creditScore || user.credit_score || 500}</Text>
                      </View>
                      <View style={{ backgroundColor: user.verification_level === "FULLY_VERIFIED" ? "#D1FAE5" : "#FEF3C7", borderRadius: 8, paddingHorizontal: 8, paddingVertical: 2 }}>
                        <Text style={{ color: user.verification_level === "FULLY_VERIFIED" ? "#065F46" : "#92400E", fontSize: 10, fontWeight: "700" }}>
                          {user.verification_level === "FULLY_VERIFIED" ? "✅ Verified" : "⚠️ Unverified"}
                        </Text>
                      </View>
                    </View>
                  </View>
                  <Text style={{ color: "#00875A", fontSize: 22 }}>›</Text>
                </TouchableOpacity>
              ))}

              <TouchableOpacity
                onPress={() => setCurrentScreen("register")}
                style={{
                  borderRadius: 16, paddingVertical: 14, alignItems: "center",
                  borderWidth: 1.5, borderColor: isDark ? "#374151" : "#D1FAE5",
                  borderStyle: "dashed", marginTop: 4
                }}
              >
                <Text style={{ color: isDark ? "#34D399" : "#00875A", fontSize: 14, fontWeight: "700" }}>+ Add Another Account</Text>
              </TouchableOpacity>
            </>
          )}
        </ScrollView>
      </View>
    );
  }

  if (currentScreen === "pin") {
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
          backgroundColor: "#00875A",
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
                  ? "#00875A"
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
          <Text style={{ color: isDark ? "#34D399" : "#00875A", fontSize: 14, fontWeight: "600" }}>Forgot PIN?</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => setCurrentScreen("login")} style={{ marginTop: 10 }}>
          <Text style={{ color: isDark ? "#6B7280" : "#9CA3AF", fontSize: 13 }}>← Switch Account</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const renderLoansTabContent = () => {
    // Calculations
    const tier = getCreditTier(selectedUser.creditScore);
    
    // Eligibility limit calculation based on savings (3x)
    const maxCapacity = Math.round(selectedUser.savings * 3);
    const activeLoanAmount = selectedUser.activeLoan;
    const availableLimit = Math.max(0, maxCapacity - activeLoanAmount);

    let eligibilityStatus = "Limited";
    let eligibilityColor = "#CD7F32"; // Bronze
    if (selectedUser.creditScore >= 800) {
      eligibilityStatus = "Excellent";
      eligibilityColor = "#00875A"; // Emerald
    } else if (selectedUser.creditScore >= 650) {
      eligibilityStatus = "Good";
      eligibilityColor = "#D4AF37"; // Gold
    } else if (selectedUser.creditScore >= 400) {
      eligibilityStatus = "Fair";
      eligibilityColor = "#718096"; // Silver
    }

    // Find if the user has an active loan in the list
    const userActiveLoan = loans.find(l => l.borrower === selectedUser.name && l.active && l.approved && !l.repaid);
    
    // Loan History Filtering
    const filteredLoans = loans.filter(l => {
      if (loanHistoryFilter === "All") return true;
      if (loanHistoryFilter === "Active") return l.active && l.approved && !l.repaid;
      if (loanHistoryFilter === "Completed") return l.repaid;
      if (loanHistoryFilter === "Voting") return !l.approved && !l.repaid && l.votesFor < 2;
      if (loanHistoryFilter === "Approved") return l.approved && !l.active && !l.repaid;
      return true;
    });

    // Real-time monthly installment calculation for the request form modal
    const parsedRequestAmount = parseFloat(requestAmount) || 0;
    const monthlyInstallment = parsedRequestAmount > 0 
      ? (parsedRequestAmount * (1 + (tier.rate / 100)) / (parseInt(requestDuration) || 6))
      : 0;

    return (
      <ScrollView style={styles.tabContentLight} showsVerticalScrollIndicator={false}>
        {/* Header Title */}
        <View style={styles.subScreenHeader}>
          <View style={{ width: 20 }} />
          <Text style={styles.subScreenTitle}>Credit & Loans</Text>
          <View style={{ width: 20 }} />
        </View>

        {/* 1. LOAN OVERVIEW CARD */}
        <View style={styles.loanOverviewCard}>
          <View style={styles.loanOverviewTopRow}>
            <View>
              <Text style={styles.loanOverviewLabel}>Eligible Borrowing Capacity</Text>
              <Text style={styles.loanOverviewValue}>{formatValue(maxCapacity)}</Text>
            </View>
            <View style={[styles.loanIndicatorBadge, { backgroundColor: eligibilityColor + "15" }]}>
              <Text style={[styles.loanIndicatorBadgeText, { color: eligibilityColor }]}>
                {eligibilityStatus}
              </Text>
            </View>
          </View>

          <View style={styles.loanOverviewSeparator} />

          <View style={styles.loanOverviewStatsGrid}>
            <View style={styles.loanOverviewStatCol}>
              <Text style={styles.loanOverviewStatLabel}>Active Loan Balance</Text>
              <Text style={styles.loanOverviewStatValue}>{formatValue(activeLoanAmount)}</Text>
            </View>
            <View style={styles.loanOverviewStatCol}>
              <Text style={styles.loanOverviewStatLabel}>Available Limit</Text>
              <Text style={[styles.loanOverviewStatValue, { color: "#00875A" }]}>
                {formatValue(availableLimit)}
              </Text>
            </View>
            <View style={styles.loanOverviewStatCol}>
              <Text style={styles.loanOverviewStatLabel}>CreditLoop Score</Text>
              <Text style={[styles.loanOverviewStatValue, { color: "#4F46E5" }]}>
                {selectedUser.creditScore}
              </Text>
            </View>
          </View>
        </View>

        {/* REQUEST LOAN QUICK SHORTCUT BUTTON */}
        {selectedUser.verification_level !== "FULLY_VERIFIED" ? (
          /* ── BLOCKED: user not verified ── */
          <View style={{
            marginHorizontal: 16,
            marginBottom: 16,
            backgroundColor: isDark ? "#1C1917" : "#FEF3C7",
            borderRadius: 14,
            padding: 16,
            borderWidth: 1,
            borderColor: "#F59E0B",
            flexDirection: "row",
            alignItems: "center",
            gap: 12
          }}>
            <Text style={{ fontSize: 28 }}>🔒</Text>
            <View style={{ flex: 1 }}>
              <Text style={{ color: isDark ? "#FCD34D" : "#92400E", fontWeight: "700", fontSize: 14, marginBottom: 3 }}>
                Identity Verification Required
              </Text>
              <Text style={{ color: isDark ? "#D97706" : "#78350F", fontSize: 12, lineHeight: 17 }}>
                Complete Level 2 verification to unlock borrowing and Chama loan requests.
              </Text>
              <TouchableOpacity
                onPress={() => {
                  setPhoneForVerification(selectedUser.phone || "");
                  setIsPhoneVerifiedState(selectedUser.is_phone_verified || false);
                  setIsVerificationSmsSent(false);
                  setVerificationSmsCode("");
                  setIdDocUri(null);
                  setSelfieUri(null);
                  setVerificationSuccess(false);
                  setActiveSubScreen("verifyIdentity");
                }}
                style={{
                  marginTop: 10,
                  backgroundColor: "#D97706",
                  borderRadius: 8,
                  paddingVertical: 9,
                  alignItems: "center"
                }}
              >
                <Text style={{ color: "#FFF", fontWeight: "700", fontSize: 13 }}>🪪 Verify My Identity</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <TouchableOpacity
            onPress={() => {
              if (activeLoanAmount > 0) {
                Alert.alert("Active Loan Pending", "You already have an active loan. Please repay your current loan before applying for a new one.");
              } else {
                setShowLoanRequestModal(true);
              }
            }}
            style={styles.loanRequestBtnPrimary}
          >
            <Text style={styles.loanRequestBtnPrimaryText}>🤝 Request New Loan</Text>
          </TouchableOpacity>
        )}

        {/* 2. DYNAMIC LOAN STATUS SECTION */}
        {userActiveLoan ? (
          <View style={styles.loanActiveStatusCard}>
            <View style={styles.loanActiveHeaderRow}>
              <Text style={styles.loanActiveTitle}>Active Loan Details</Text>
              <Text style={styles.loanActiveStatusBadge}>Outstanding</Text>
            </View>

            <View style={styles.loanActiveStatsGrid}>
              <View style={styles.loanActiveStatItem}>
                <Text style={styles.loanActiveStatLabel}>Approved Principal</Text>
                <Text style={styles.loanActiveStatValue}>{formatValue(userActiveLoan.amount)}</Text>
              </View>
              <View style={styles.loanActiveStatItem}>
                <Text style={styles.loanActiveStatLabel}>Interest Rate</Text>
                <Text style={styles.loanActiveStatValue}>{userActiveLoan.interestRate}% ({tier.name})</Text>
              </View>
              <View style={styles.loanActiveStatItem}>
                <Text style={styles.loanActiveStatLabel}>Term Length</Text>
                <Text style={styles.loanActiveStatValue}>{userActiveLoan.duration} Months</Text>
              </View>
            </View>

            {/* Repayment Progress Tracker */}
            <View style={styles.repaymentTrackerBox}>
              <View style={styles.repaymentTrackerHeader}>
                <Text style={styles.repaymentTrackerLabel}>Repayment Progress</Text>
                <Text style={styles.repaymentTrackerPercent}>0% Repaid</Text>
              </View>
              <View style={styles.repaymentProgressOuterBar}>
                <View style={[styles.repaymentProgressInnerBar, { width: "0%" }]} />
              </View>
              <Text style={styles.repaymentTrackerRemaining}>
                Outstanding Balance: <Text style={{fontWeight: "bold"}}>{formatValue(userActiveLoan.amount * (1 + (userActiveLoan.interestRate / 100)))}</Text>
              </Text>
            </View>

            {/* Next Repayment Reminder */}
            <View style={styles.nextRepayReminderBox}>
              <View style={{ flex: 1 }}>
                <Text style={styles.repayReminderLabel}>Next Repayment Due</Text>
                <Text style={styles.repayReminderDate}>
                  {new Date(userActiveLoan.repaymentDeadline * 1000).toLocaleDateString(undefined, {
                    day: 'numeric', month: 'short', year: 'numeric'
                  })}
                </Text>
              </View>
              <View style={{ alignItems: "flex-end" }}>
                <Text style={styles.repayReminderAmountLabel}>Amount Due</Text>
                <Text style={styles.repayReminderAmount}>
                  {formatValue((userActiveLoan.amount * (1 + (userActiveLoan.interestRate / 100))) / userActiveLoan.duration)}
                </Text>
              </View>
            </View>

            {/* QUICK REPAYMENT MODULE */}
            <View style={styles.quickRepayModuleBox}>
              <Text style={styles.quickRepayTitle}>Quick Repay Module</Text>
              <View style={styles.quickRepayBtnRow}>
                <TouchableOpacity
                  onPress={() => {
                    setPaymentMethod("mpesa");
                    handleRepayLoan(userActiveLoan.id);
                  }}
                  style={styles.quickRepayMpesaBtn}
                >
                  <Text style={styles.quickRepayMpesaText}>💸 Repay via M-Pesa</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => {
                    setPaymentMethod("metamask");
                    handleRepayLoan(userActiveLoan.id);
                  }}
                  style={styles.quickRepayWalletBtn}
                >
                  <Text style={styles.quickRepayWalletText}>🦊 Repay via MetaMask</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        ) : (
          <View style={styles.loanActiveEmptyCard}>
            <Text style={styles.loanEmptyEmoji}>🎉</Text>
            <Text style={styles.loanEmptyTitle}>No Active Loans</Text>
            <Text style={styles.loanEmptyDesc}>
              You currently have no active borrowings. You are pre-approved for up to {formatValue(maxCapacity)} at an interest rate of {tier.rate}% based on your {tier.name} credit tier.
            </Text>
          </View>
        )}

        {/* 3. LOAN ELIGIBILITY WIDGET */}
        <View style={styles.eligibilityFactorsCard}>
          <Text style={styles.eligibilityFactorsTitle}>How Your Borrowing Limit is Calculated</Text>
          
          <View style={styles.eligibilityFactorItem}>
            <View style={styles.factorDot} />
            <View style={{ flex: 1 }}>
              <Text style={styles.factorLabel}>Chama Savings Multiplier</Text>
              <Text style={styles.factorDesc}>Chama policy allows borrowing up to 3x your total locked savings pool.</Text>
            </View>
            <Text style={styles.factorStatusOk}>3.0x Match</Text>
          </View>

          <View style={styles.eligibilityFactorItem}>
            <View style={styles.factorDot} />
            <View style={{ flex: 1 }}>
              <Text style={styles.factorLabel}>Contribution Consistency</Text>
              <Text style={styles.factorDesc}>Maintaining a 90%+ weekly chama deposit frequency raises limits.</Text>
            </View>
            <Text style={styles.factorStatusOk}>94% Freq</Text>
          </View>

          <View style={styles.eligibilityFactorItem}>
            <View style={styles.factorDot} />
            <View style={{ flex: 1 }}>
              <Text style={styles.factorLabel}>CreditLoop Score Status</Text>
              <Text style={styles.factorDesc}>A higher reputation score lowers interest rates and unlocks larger loans.</Text>
            </View>
            <Text style={[styles.factorStatusOk, { color: eligibilityColor }]}>{selectedUser.creditScore} ({tier.name})</Text>
          </View>
        </View>

        {/* 4. GROUP CONSENSUS VOTING TRACKER */}
        <View style={styles.consensusVotingSectionCard}>
          <Text style={styles.consensusSectionTitle}>Chama Loan Governance (Consensus)</Text>
          
          {loans.filter(l => !l.approved && !l.repaid && l.borrower !== selectedUser.name).length === 0 ? (
            <Text style={styles.consensusEmptyText}>No active loan proposals are currently undergoing voting in your Chama circle.</Text>
          ) : (
            loans.filter(l => !l.approved && !l.repaid && l.borrower !== selectedUser.name).map((proposal) => {
              const totalVotes = proposal.votesFor + proposal.votesAgainst;
              const consensusPct = totalVotes > 0 ? (proposal.votesFor / totalVotes) * 100 : 0;
              return (
                <View key={proposal.id} style={styles.consensusProposalCard}>
                  <View style={styles.proposalHeader}>
                    <View>
                      <Text style={styles.proposalBorrower}>{proposal.borrower}</Text>
                      <Text style={styles.proposalMeta}>{proposal.purpose} • {proposal.duration} Months</Text>
                    </View>
                    <Text style={styles.proposalAmount}>{formatValue(proposal.amount)}</Text>
                  </View>

                  <View style={styles.consensusProgressBarRow}>
                    <View style={styles.consensusHeaderRow}>
                      <Text style={styles.consensusLabel}>Consensus Status</Text>
                      <Text style={styles.consensusVotes}>+{proposal.votesFor} YES / -{proposal.votesAgainst} NO ({consensusPct.toFixed(0)}%)</Text>
                    </View>
                    <View style={styles.consensusProgressOuterBar}>
                      <View style={[styles.consensusProgressInnerBar, { width: `${consensusPct}%` }]} />
                    </View>
                    <Text style={styles.consensusMinRequiredText}>Requires minimum 60% YES votes to approve disbursement</Text>
                  </View>

                  <View style={styles.proposalVoteActionsRow}>
                    <TouchableOpacity onPress={() => handleVoteOnLoan(proposal.id, true)} style={styles.voteYesButton}>
                      <Text style={styles.voteYesButtonText}>Vote YES</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => handleVoteOnLoan(proposal.id, false)} style={styles.voteNoButton}>
                      <Text style={styles.voteNoButtonText}>Vote NO</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })
          )}
        </View>

        {/* 5. LOAN HISTORY LIST & FILTERS */}
        <View style={styles.loanHistoryContainer}>
          <View style={styles.loanHistoryHeaderRow}>
            <Text style={styles.loanHistoryTitle}>Loan History</Text>
          </View>

          {/* History filter pills */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.historyFilterScrollPills}>
            {["All", "Active", "Completed", "Voting", "Approved"].map((status) => (
              <TouchableOpacity
                key={status}
                onPress={() => setLoanHistoryFilter(status)}
                style={[
                  styles.historyFilterPill,
                  loanHistoryFilter === status ? styles.historyFilterPillActive : null
                ]}
              >
                <Text style={[
                  styles.historyFilterPillText,
                  loanHistoryFilter === status ? styles.historyFilterPillActiveText : null
                ]}>
                  {status}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Loans list */}
          {filteredLoans.length === 0 ? (
            <Text style={styles.historyEmptyText}>No loans matching the selected filter.</Text>
          ) : (
            filteredLoans.map((loan) => {
              const isOwnLoan = loan.borrower === selectedUser.name;
              
              // Define status badge styling
              let statusLabel = "Voting";
              let statusBadgeStyle = styles.loanVotingStatusBadge;
              if (loan.repaid) {
                statusLabel = "Repaid";
                statusBadgeStyle = styles.loanRepaidStatusBadge;
              } else if (loan.repaymentDeadline > 0) {
                statusLabel = "Active";
                statusBadgeStyle = styles.loanActiveStatusBadge;
              } else if (loan.approved) {
                statusLabel = "Approved";
                statusBadgeStyle = styles.loanApprovedStatusBadge;
              }

              return (
                <TouchableOpacity
                  key={loan.id}
                  onPress={() => {
                    if (loan.repaid || loan.repaymentDeadline > 0) {
                      launchDigitalReceipt(
                        loan.repaid ? "Repaid Loan Receipt" : "Active Loan Principal",
                        loan.amount,
                        loan.borrower
                      );
                    }
                  }}
                  style={styles.historyLoanRowItem}
                >
                  <View style={styles.historyRowTop}>
                    <View>
                      <Text style={styles.historyLoanPurpose}>{loan.purpose}</Text>
                      <Text style={styles.historyLoanBorrower}>{isOwnLoan ? "You" : loan.borrower} • ID #{loan.id}</Text>
                    </View>
                    <Text style={statusBadgeStyle}>{statusLabel}</Text>
                  </View>

                  <View style={styles.historyRowBottom}>
                    <Text style={styles.historyLoanAmount}>{formatValue(loan.amount)}</Text>
                    <Text style={styles.historyLoanRate}>{loan.interestRate}% Interest • {loan.duration} months</Text>
                  </View>

                  {/* Disbursement Action for Admin */}
                  {loan.approved && loan.repaymentDeadline === 0 && (
                    <TouchableOpacity
                      onPress={() => handleDisburseLoan(loan.id)}
                      style={styles.historyDisburseActionBtn}
                    >
                      <Text style={styles.historyDisburseActionBtnText}>Disburse Funds</Text>
                    </TouchableOpacity>
                  )}
                </TouchableOpacity>
              );
            })
          )}
        </View>

        {/* 6. CREDITLOOP IMPACT CARD */}
        <View style={styles.creditImpactInfoCard}>
          <Text style={styles.creditImpactTitle}>CreditLoop Reputation Impact</Text>
          <Text style={styles.creditImpactDesc}>
            Your CreditLoop score is the heart of your Chama reputation. Timely loan repayments increase your score by up to <Text style={{fontWeight: "bold", color: "#00875A"}}>+25 points</Text>, unlocking a lower interest rate tier. Overdue repayments will cause score penalties and reduced borrowing capacities.
          </Text>
        </View>

        {/* 7. FINANCIAL TIPS & RECOMMENDATIONS */}
        <View style={styles.tipsSectionContainer}>
          <Text style={styles.tipsSectionTitle}>Financial Tips & Advice</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tipsScrollContainer}>
            <View style={styles.tipCardItem}>
              <Text style={styles.tipCardEmoji}>💡</Text>
              <Text style={styles.tipCardTitle}>Smart Borrowing</Text>
              <Text style={styles.tipCardBody}>
                Only apply for credit that matches your business cashflows to prevent defaults.
              </Text>
            </View>
            <View style={styles.tipCardItem}>
              <Text style={styles.tipCardEmoji}>📈</Text>
              <Text style={styles.tipCardTitle}>Unlock Lower Rates</Text>
              <Text style={styles.tipCardBody}>
                Consistently save to hit Platinum status and pay only 5% p.a.
              </Text>
            </View>
          </ScrollView>
        </View>

        {/* 8. LOAN APPLICATION MODAL */}
        <Modal visible={showLoanRequestModal} transparent animationType="slide">
          <View style={styles.loanModalOverlay}>
            <View style={styles.loanModalCard}>
              <View style={styles.loanModalHeader}>
                <Text style={styles.loanModalTitle}>Request a Loan</Text>
                <TouchableOpacity onPress={() => setShowLoanRequestModal(false)} style={styles.loanModalCloseBtn}>
                  <Text style={styles.loanModalCloseBtnText}>✕</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.loanModalBody}>
                <Text style={styles.loanInputLabelField}>Loan Amount in {currency}</Text>
                <View style={styles.loanAmountInputContainer}>
                  <TextInput
                    style={styles.loanAmountTextInputField}
                    keyboardType="numeric"
                    value={requestAmount}
                    onChangeText={setRequestAmount}
                    placeholder="0.00"
                  />
                  <Text style={styles.loanAmountCurrencyBadge}>{currency}</Text>
                </View>
                
                {parsedRequestAmount > availableLimit && (
                  <Text style={styles.loanLimitErrorLabel}>
                    ⚠️ Amount exceeds your available limit of {formatValue(availableLimit)}
                  </Text>
                )}
                <Text style={styles.loanLimitWarningLabel}>
                  Available limit: {formatValue(availableLimit)}
                </Text>

                <Text style={styles.loanInputLabelField}>Purpose of Loan</Text>
                <View style={styles.dropdownSelectorBox}>
                  {["Business", "Education", "Medical", "Agriculture"].map((p) => (
                    <TouchableOpacity
                      key={p}
                      onPress={() => setRequestPurpose(p)}
                      style={[
                        styles.purposePillOption,
                        requestPurpose === p ? styles.purposePillOptionActive : null
                      ]}
                    >
                      <Text style={[styles.purposePillText, requestPurpose === p ? styles.purposePillTextActive : null]}>
                        {p}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <Text style={styles.loanInputLabelField}>Repayment Period</Text>
                <View style={styles.dropdownSelectorBox}>
                  {["3 months", "6 months", "12 months"].map((dur) => (
                    <TouchableOpacity
                      key={dur}
                      onPress={() => setRequestDuration(dur)}
                      style={[
                        styles.purposePillOption,
                        requestDuration === dur ? styles.purposePillOptionActive : null
                      ]}
                    >
                      <Text style={[styles.purposePillText, requestDuration === dur ? styles.purposePillTextActive : null]}>
                        {dur}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <Text style={styles.loanInputLabelField}>Note (Optional)</Text>
                <TextInput
                  style={[styles.textInputField, { height: 50, marginTop: 4 }]}
                  placeholder="Describe your loan purpose..."
                  value={requestNote}
                  onChangeText={setRequestNote}
                />

                <View style={styles.estimatedRepaymentBannerBox}>
                  <Text style={styles.repayEstLabel}>Estimated Installment (Includes {tier.rate}% interest)</Text>
                  <Text style={styles.repayEstVal}>
                    {parsedRequestAmount > 0 
                      ? `${formatValue(monthlyInstallment)} / Month`
                      : formatValue(0)}
                  </Text>
                  <Text style={styles.repayEstSub}>Dynamic interest rate based on your {tier.name} credit tier</Text>
                </View>

                <TouchableOpacity
                  onPress={() => {
                    if (parsedRequestAmount <= 0) {
                      Alert.alert("Invalid Amount", "Please enter a valid loan amount.");
                      return;
                    }
                    if (parsedRequestAmount > availableLimit) {
                      Alert.alert("Limit Exceeded", "The requested amount exceeds your eligible borrowing limit.");
                      return;
                    }
                    handleLoanRequestSubmit();
                    setShowLoanRequestModal(false);
                  }}
                  style={styles.buttonForestGreenSubmitContribution}
                >
                  <Text style={styles.buttonTextPrimary}>Submit Request</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </ScrollView>
    );
  };

  const renderScoreTabContent = () => {
    const score = selectedUser.creditScore;
    const maxScore = 1000;
    
    // Normalization for circle progress
    const radius = 45;
    const circumference = 2 * Math.PI * radius; // ~282.74
    const progress = Math.min(1, Math.max(0, score / maxScore));
    const strokeDashoffset = circumference * (1 - progress);

    const tier = getCreditTier(score);

    let ratingStatus = "Bronze";
    let ratingColor = "#CD7F32";
    if (score >= 800) {
      ratingStatus = "Excellent (Platinum)";
      ratingColor = "#00875A";
    } else if (score >= 650) {
      ratingStatus = "Good (Gold)";
      ratingColor = "#D4AF37";
    } else if (score >= 400) {
      ratingStatus = "Fair (Silver)";
      ratingColor = "#718096";
    } else {
      ratingStatus = "Needs Improvement (Bronze)";
      ratingColor = "#CD7F32";
    }

    // Dynamic points breakdown
    const contributionPoints = Math.round(score * 0.40);
    const repaymentPoints = Math.round(score * 0.25);
    const participationPoints = Math.round(score * 0.20);
    const growthPoints = Math.max(0, score - contributionPoints - repaymentPoints - participationPoints);

    // Coordinate calculation for SVG line chart (Score History over 6 months: Dec - May)
    const scoreToY = (val) => {
      const minVal = 600;
      const maxVal = 900;
      const height = 90;
      const topPadding = 15;
      const pct = (val - minVal) / (maxVal - minVal);
      return height - (pct * height) + topPadding;
    };

    const points = [
      { month: "Dec", score: 710, x: 30, y: scoreToY(710) },
      { month: "Jan", score: 725, x: 84, y: scoreToY(725) },
      { month: "Feb", score: 740, x: 138, y: scoreToY(740) },
      { month: "Mar", score: 750, x: 192, y: scoreToY(750) },
      { month: "Apr", score: 770, x: 246, y: scoreToY(770) },
      { month: "May", score: score, x: 300, y: scoreToY(score) }
    ];

    const polylinePoints = points.map(p => `${p.x},${p.y}`).join(" ");

    // Achievements list
    const achievements = [
      { id: 1, icon: "🚀", title: "First Step", desc: "First chama contribution made.", unlocked: true },
      { id: 2, icon: "⚡", title: "Punctual Saver", desc: "3 consecutive weekly deposits.", unlocked: true },
      { id: 3, icon: "🎯", title: "Reliable Borrower", desc: "Repaid first loan early.", unlocked: true },
      { id: 4, icon: "💎", title: "Elite Saver", desc: "Reached 800+ CreditLoop score.", unlocked: score >= 800 }
    ];

    // Share action
    const handleShareScore = async () => {
      try {
        const shareText = `My CreditLoop Score on PayLoop is ${score}/1000 (${tier.name} Tier)! I qualify for low-interest loans in my chama group. Verify my rep address: ${selectedUser.address}`;
        await Share.share({
          message: shareText,
          title: "Verify my CreditLoop Reputation"
        });
      } catch (err) {
        Alert.alert("Error sharing score", err.message);
      }
    };

    return (
      <ScrollView style={styles.tabContentLight} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.subScreenHeader}>
          <View style={{ width: 20 }} />
          <Text style={styles.subScreenTitle}>CreditLoop Reputation</Text>
          <View style={{ width: 20 }} />
        </View>

        {/* 1. CREDITLOOP SCORE CARD WITH CIRCULAR GAUGE */}
        <View style={styles.scoreOverviewCard}>
          <View style={styles.scoreCardContainerRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.scoreCardTitle}>CreditLoop Score</Text>
              <Text style={styles.scoreCardValue}>{score}</Text>
              <Text style={styles.scoreCardMax}>out of 1000</Text>
              <View style={[styles.scoreTierBadge, { backgroundColor: ratingColor + "15" }]}>
                <Text style={[styles.scoreTierBadgeText, { color: ratingColor }]}>
                  {ratingStatus}
                </Text>
              </View>
            </View>

            <View style={styles.circularGaugeBox}>
              <Svg width="110" height="110" viewBox="0 0 110 110">
                {/* Background Ring */}
                <Circle
                  cx="55"
                  cy="55"
                  r={radius}
                  stroke="#334155"
                  strokeWidth="8"
                  fill="none"
                />
                {/* Progress Ring */}
                <Circle
                  cx="55"
                  cy="55"
                  r={radius}
                  stroke={ratingColor}
                  strokeWidth="8"
                  fill="none"
                  strokeDasharray={`${circumference} ${circumference}`}
                  strokeDashoffset={strokeDashoffset}
                  transform="rotate(-90, 55, 55)"
                  strokeLinecap="round"
                />
              </Svg>
              <View style={styles.circularGaugeTextOverlay}>
                <Text style={[styles.circularGaugeScoreVal, { color: ratingColor }]}>{score}</Text>
                <Text style={styles.circularGaugeScoreLabel}>Points</Text>
              </View>
            </View>
          </View>
        </View>

        {/* 2. PROGRESSION CHART (Score History) */}
        <View style={styles.scoreHistoryCard}>
          <Text style={styles.scoreHistoryCardTitle}>Score Progression (6 Months)</Text>
          <View style={styles.chartWrapperBox}>
            <Svg width="100%" height="130" viewBox="0 0 320 130">
              {/* Grid Lines */}
              <Line x1="30" y1="15" x2="300" y2="15" stroke="#F1F5F9" strokeWidth="1" strokeDasharray="3 3" />
              <Line x1="30" y1="60" x2="300" y2="60" stroke="#F1F5F9" strokeWidth="1" strokeDasharray="3 3" />
              <Line x1="30" y1="110" x2="300" y2="110" stroke="#E2E8F0" strokeWidth="1" />
              
              {/* Fill Area Underneath Line */}
              <Path
                d={`M ${points[0].x},110 ` + points.map(p => `L ${p.x},${p.y}`).join(" ") + ` L ${points[points.length - 1].x},110 Z`}
                fill={`${ratingColor}12`}
              />

              {/* Line path */}
              <Path
                d={`M ` + points.map(p => `${p.x},${p.y}`).join(" L ")}
                fill="none"
                stroke={ratingColor}
                strokeWidth="3.5"
                strokeLinecap="round"
              />

              {/* Data points */}
              {points.map((p, idx) => (
                <Circle
                  key={idx}
                  cx={p.x}
                  cy={p.y}
                  r="5"
                  fill={ratingColor}
                  stroke="#ffffff"
                  strokeWidth="2"
                />
              ))}

              {/* Labels */}
              {points.map((p, idx) => (
                <SvgText
                  key={`lbl-${idx}`}
                  x={p.x}
                  y={p.y - 10}
                  fontSize="8"
                  fontWeight="bold"
                  fill="#64748B"
                  textAnchor="middle"
                >
                  {p.score}
                </SvgText>
              ))}

              {/* X Axis Labels */}
              {points.map((p, idx) => (
                <SvgText
                  key={`x-lbl-${idx}`}
                  x={p.x}
                  y="125"
                  fontSize="9"
                  fontWeight="bold"
                  fill="#94A3B8"
                  textAnchor="middle"
                >
                  {p.month}
                </SvgText>
              ))}
            </Svg>
          </View>
        </View>

        {/* 3. SCORE BREAKDOWN SECTION */}
        <View style={styles.scoreBreakdownCard}>
          <Text style={styles.scoreBreakdownHeader}>Score Factors Breakdown</Text>
          
          <View style={styles.breakdownRowItemBox}>
            <View style={styles.breakdownItemHeaderRow}>
              <Text style={styles.breakdownItemLabel}>Weekly Contribution Consistency</Text>
              <Text style={styles.breakdownItemValue}>{contributionPoints} / 400 pts</Text>
            </View>
            <View style={styles.breakdownProgressBarContainer}>
              <View style={[styles.breakdownProgressBarFill, { width: `${(contributionPoints / 400) * 100}%`, backgroundColor: ratingColor }]} />
            </View>
          </View>

          <View style={styles.breakdownRowItemBox}>
            <View style={styles.breakdownItemHeaderRow}>
              <Text style={styles.breakdownItemLabel}>Loan Repayment Integrity</Text>
              <Text style={styles.breakdownItemValue}>{repaymentPoints} / 250 pts</Text>
            </View>
            <View style={styles.breakdownProgressBarContainer}>
              <View style={[styles.breakdownProgressBarFill, { width: `${(repaymentPoints / 250) * 100}%`, backgroundColor: ratingColor }]} />
            </View>
          </View>

          <View style={styles.breakdownRowItemBox}>
            <View style={styles.breakdownItemHeaderRow}>
              <Text style={styles.breakdownItemLabel}>Chama Voting & Governance</Text>
              <Text style={styles.breakdownItemValue}>{participationPoints} / 200 pts</Text>
            </View>
            <View style={styles.breakdownProgressBarContainer}>
              <View style={[styles.breakdownProgressBarFill, { width: `${(participationPoints / 200) * 100}%`, backgroundColor: ratingColor }]} />
            </View>
          </View>

          <View style={styles.breakdownRowItemBox}>
            <View style={styles.breakdownItemHeaderRow}>
              <Text style={styles.breakdownItemLabel}>Savings Pool Growth Rate</Text>
              <Text style={styles.breakdownItemValue}>{growthPoints} / 150 pts</Text>
            </View>
            <View style={styles.breakdownProgressBarContainer}>
              <View style={[styles.breakdownProgressBarFill, { width: `${(growthPoints / 150) * 100}%`, backgroundColor: ratingColor }]} />
            </View>
          </View>
        </View>

        {/* 4. ACHIEVEMENTS & MILESTONES */}
        <View style={styles.achievementsSectionCard}>
          <Text style={styles.achievementsSectionTitle}>Unlocked Badges & Milestones</Text>
          <View style={styles.achievementsGridRowContainer}>
            {achievements.map((ach) => (
              <View key={ach.id} style={[styles.achievementCardBox, !ach.unlocked ? styles.achievementLockedCardBox : null]}>
                <View style={[styles.achievementIconCircleWrapper, !ach.unlocked ? styles.achievementLockedIconCircle : null]}>
                  <Text style={styles.achievementEmoji}>{ach.icon}</Text>
                </View>
                <Text style={styles.achievementTitleText}>{ach.title}</Text>
                <Text style={styles.achievementDescText}>{ach.desc}</Text>
                {!ach.unlocked && <View style={styles.lockedBadgeOverlay}><Text style={styles.lockedBadgeIcon}>🔒</Text></View>}
              </View>
            ))}
          </View>
        </View>

        {/* 5. BENEFITS SECTION */}
        <View style={styles.benefitsContainerCard}>
          <Text style={styles.benefitsSectionTitle}>Your CreditLoop Score Benefits</Text>
          
          <View style={[styles.benefitsTierListItem, score >= 800 ? styles.benefitsTierListItemActive : null]}>
            <View style={styles.tierIndicatorCircle}><Text style={{fontSize: 10}}>💎</Text></View>
            <View style={{ flex: 1 }}>
              <Text style={styles.tierNameLabel}>Platinum Tier (800+ Score)</Text>
              <Text style={styles.tierBenefitsValue}>Up to 4.0x Chama Savings Loan • 5.0% Interest rate p.a. • Instant Auto-Approvals</Text>
            </View>
            {score >= 800 && <Text style={styles.activeTierIndicatorLabel}>Active</Text>}
          </View>

          <View style={[styles.benefitsTierListItem, (score >= 650 && score < 800) ? styles.benefitsTierListItemActive : null]}>
            <View style={styles.tierIndicatorCircle}><Text style={{fontSize: 10}}>⭐</Text></View>
            <View style={{ flex: 1 }}>
              <Text style={styles.tierNameLabel}>Gold Tier (650 - 799 Score)</Text>
              <Text style={styles.tierBenefitsValue}>Up to 3.0x Chama Savings Loan • 7.5% Interest rate p.a. • Priority voting rights</Text>
            </View>
            {(score >= 650 && score < 800) && <Text style={styles.activeTierIndicatorLabel}>Active</Text>}
          </View>

          <View style={[styles.benefitsTierListItem, (score >= 400 && score < 650) ? styles.benefitsTierListItemActive : null]}>
            <View style={styles.tierIndicatorCircle}><Text style={{fontSize: 10}}>🔘</Text></View>
            <View style={{ flex: 1 }}>
              <Text style={styles.tierNameLabel}>Silver Tier (400 - 649 Score)</Text>
              <Text style={styles.tierBenefitsValue}>Up to 2.0x Chama Savings Loan • 10% Interest rate p.a. • Standard voting consensus</Text>
            </View>
            {(score >= 400 && score < 650) && <Text style={styles.activeTierIndicatorLabel}>Active</Text>}
          </View>
        </View>

        {/* 6. IMPROVEMENT RECOMMENDATIONS */}
        <View style={styles.recommendationsCardBox}>
          <Text style={styles.recommendationsBoxTitle}>Personal Recommendations</Text>
          
          <View style={styles.recommendationItemBox}>
            <Text style={styles.recommendationBullet}>💡</Text>
            <Text style={styles.recommendationTextBody}>
              Deposit your weekly KES 13,000 contribution before Friday to increase your Deposit Consistency score by <Text style={{fontWeight: "bold", color: "#00875A"}}>+5 pts</Text>.
            </Text>
          </View>

          {selectedUser.activeLoan > 0 && (
            <View style={styles.recommendationItemBox}>
              <Text style={styles.recommendationBullet}>💡</Text>
              <Text style={styles.recommendationTextBody}>
                Pay off your active business expansion loan ahead of schedule to claim the Reliable Borrower booster (<Text style={{fontWeight: "bold", color: "#00875A"}}>+25 pts</Text>).
              </Text>
            </View>
          )}

          <View style={styles.recommendationItemBox}>
            <Text style={styles.recommendationBullet}>💡</Text>
            <Text style={styles.recommendationTextBody}>
              Vote on active member loan request proposals. Participating in consensus signatures earns <Text style={{fontWeight: "bold", color: "#00875A"}}>+3 pts</Text> per broadcast vote.
            </Text>
          </View>
        </View>

        {/* 7. SHARE SCORE & CREDENTIAL VERIFICATION */}
        <View style={styles.qrCodeScannerValidationCard}>
          <Text style={styles.qrCodeScannerValidationCardTitle}>Reputation Verification</Text>
          <View style={{ padding: 12, backgroundColor: "#ffffff", borderRadius: 12, borderWidth: 1, borderColor: "#E2E8F0" }}>
            <QRCode
              value={`payloop:profile:${selectedUser.address}:${selectedUser.creditScore}`}
              size={130}
              color="#0F172A"
              backgroundColor="#ffffff"
            />
          </View>
          <Text style={styles.qrCodeLabelText}>On-chain reputation address: {selectedUser.address.substring(0, 16)}...</Text>
          
          <View style={styles.scoreVerificationBtnRow}>
            <TouchableOpacity onPress={handleShareScore} style={styles.scoreShareOutlineBtn}>
              <Text style={styles.scoreShareOutlineBtnText}>🔗 Share Reputation</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              onPress={() => Alert.alert("Exporting Report", "Generating and downloading your secure credit report... Saved as CreditLoop_Report_John.pdf")} 
              style={styles.scoreDownloadOutlineBtn}
            >
              <Text style={styles.scoreDownloadOutlineBtnText}>📋 Download Audit PDF</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* 8. RECENT SCORE ACTIVITIES */}
        <View style={styles.activitiesContainerCard}>
          <Text style={styles.activitiesSectionTitle}>Recent Score Activities</Text>
          
          <View style={styles.activityRowLogItem}>
            <View style={styles.activityLeftPart}>
              <Text style={styles.activityDateLabel}>8 Jun 2026</Text>
              <Text style={styles.activityLogText}>Voted YES on Peter Mwangi's Loan Request</Text>
            </View>
            <Text style={styles.activityPointsEarnedGreen}>+3 pts</Text>
          </View>

          <View style={styles.activityRowLogItem}>
            <View style={styles.activityLeftPart}>
              <Text style={styles.activityDateLabel}>4 Jun 2026</Text>
              <Text style={styles.activityLogText}>Weekly Chama Vault deposit completed</Text>
            </View>
            <Text style={styles.activityPointsEarnedGreen}>+5 pts</Text>
          </View>

          <View style={styles.activityRowLogItem}>
            <View style={styles.activityLeftPart}>
              <Text style={styles.activityDateLabel}>28 May 2026</Text>
              <Text style={styles.activityLogText}>Repaid principal for Education Loan ID #2 early</Text>
            </View>
            <Text style={styles.activityPointsEarnedGreen}>+15 pts</Text>
          </View>
        </View>
      </ScrollView>
    );
  };

  const renderMoreTabContent = () => {
    return (
      <ScrollView style={[styles.tabContentLight, { backgroundColor: themeBg }]} showsVerticalScrollIndicator={false}>
        {/* Header Title */}
        <View style={styles.subScreenHeader}>
          <View style={{ width: 20 }} />
          <Text style={[styles.subScreenTitle, { color: themeTextColor }]}>{t("more")}</Text>
          <View style={{ width: 20 }} />
        </View>

        {/* 1. PROFILE CARD */}
        <View style={[styles.moreProfileCard, { backgroundColor: themeCardBg, borderColor: themeBorderColor }]}>
          <View style={styles.moreProfileTopRow}>
            {/* Left part: Avatar & Info */}
            <TouchableOpacity onPress={() => setActiveSubScreen("profile")} style={styles.moreAvatarInfoCol}>
              <View style={styles.moreAvatarBox}>
                {selectedUser.avatarUri ? (
                  <Image source={{ uri: selectedUser.avatarUri }} style={{ width: 62, height: 62, borderRadius: 31 }} />
                ) : (
                  <Text style={styles.moreAvatarEmoji}>👤</Text>
                )}
                <View style={styles.moreCameraBadge}>
                  <Text style={styles.moreCameraBadgeText}>📷</Text>
                </View>
              </View>
              <View style={styles.moreUserInfoBox}>
                <Text style={[styles.moreUserName, { color: themeTextColor }]}>{selectedUser.name}</Text>
                <View style={styles.moreMemberIdRow}>
                  <Text style={[styles.moreMemberIdText, { color: themeSubtitleColor }]}>PLM-483920</Text>
                  <TouchableOpacity onPress={() => showBanner("Membership ID copied to clipboard!", "success")} style={styles.moreCopyBtn}>
                    <Text style={styles.moreCopyBtnEmoji}>📋</Text>
                  </TouchableOpacity>
                </View>
                <View style={styles.moreRoleBadge}>
                  <Text style={styles.moreRoleBadgeText}>✓ {t("role")}</Text>
                </View>
              </View>
            </TouchableOpacity>

            {/* Right part: CreditLoop score panel */}
            <TouchableOpacity onPress={() => setActiveTab("score")} style={[styles.moreScoreSummaryPanel, { backgroundColor: isDark ? "#1E293B" : "#F8FAFC", borderColor: themeBorderColor }]}>
              <Text style={[styles.moreScoreLabel, { color: themeSubtitleColor }]}>{t("creditloop_score")}</Text>
              <Text style={styles.moreScoreVal}>{selectedUser.creditScore}</Text>
              <Text style={styles.moreScoreRating}>🟢 {t("excellent")}</Text>
              <Text style={styles.moreScoreChevron}>›</Text>
            </TouchableOpacity>
          </View>

          <View style={[styles.moreOverviewSeparator, { backgroundColor: themeDividerColor }]} />

          {/* Stats Grid */}
          <View style={styles.moreStatsRow}>
            <View style={styles.moreStatItemCol}>
              <Text style={styles.moreStatIcon}>👥</Text>
              <Text style={[styles.moreStatLabel, { color: themeSubtitleColor }]}>{t("group")}</Text>
              <Text style={[styles.moreStatVal, { color: themeTextColor }]}>Green Savers</Text>
            </View>
            <View style={styles.moreStatItemCol}>
              <Text style={styles.moreStatIcon}>🛡️</Text>
              <Text style={[styles.moreStatLabel, { color: themeSubtitleColor }]}>{t("role")}</Text>
              <Text style={[styles.moreStatVal, { color: themeTextColor }]}>Member</Text>
            </View>
            <View style={styles.moreStatItemCol}>
              <Text style={styles.moreStatIcon}>📅</Text>
              <Text style={[styles.moreStatLabel, { color: themeSubtitleColor }]}>{t("joined")}</Text>
              <Text style={[styles.moreStatVal, { color: themeTextColor }]}>12 Jan 2024</Text>
            </View>
            <View style={styles.moreStatItemCol}>
              <Text style={styles.moreStatIcon}>🔄</Text>
              <Text style={[styles.moreStatLabel, { color: themeSubtitleColor }]}>{t("profile_completion")}</Text>
              <Text style={[styles.moreStatVal, { color: themeTextColor }]}>85% Complete</Text>
            </View>
          </View>
        </View>

        {/* 2. GROUPED MENU OPTIONS CARDS */}
        
        {/* GROUP 1: Chama Governance */}
        <View style={[styles.moreMenuBlockCard, { backgroundColor: themeCardBg, borderColor: themeBorderColor }]}>
          <TouchableOpacity onPress={() => setActiveSubScreen("groupInfo")} style={styles.moreMenuRowItem}>
            <View style={styles.moreMenuIconBox}>
              <Text style={styles.moreMenuIconEmoji}>👥</Text>
            </View>
            <View style={styles.moreMenuLabelCol}>
              <Text style={[styles.moreMenuLabel, { color: themeTextColor }]}>{t("group_info")}</Text>
              <Text style={[styles.moreMenuDesc, { color: themeSubtitleColor }]}>View group details, rules and updates</Text>
            </View>
            <Text style={styles.moreMenuChevron}>›</Text>
          </TouchableOpacity>

          <View style={[styles.moreMenuDivider, { backgroundColor: themeDividerColor }]} />

          <TouchableOpacity onPress={() => setActiveSubScreen("members")} style={styles.moreMenuRowItem}>
            <View style={styles.moreMenuIconBox}>
              <Text style={styles.moreMenuIconEmoji}>👥</Text>
            </View>
            <View style={styles.moreMenuLabelCol}>
              <Text style={[styles.moreMenuLabel, { color: themeTextColor }]}>{t("members")}</Text>
              <Text style={[styles.moreMenuDesc, { color: themeSubtitleColor }]}>View all group members and roles</Text>
            </View>
            <Text style={styles.moreMenuChevron}>›</Text>
          </TouchableOpacity>
        </View>

        {/* GROUP 2: Wallet & Account */}
        <View style={[styles.moreMenuBlockCard, { backgroundColor: themeCardBg, borderColor: themeBorderColor }]}>
          <TouchableOpacity onPress={() => setActiveSubScreen("walletDetails")} style={styles.moreMenuRowItem}>
            <View style={styles.moreMenuIconBox}>
              <Text style={styles.moreMenuIconEmoji}>👛</Text>
            </View>
            <View style={styles.moreMenuLabelCol}>
              <Text style={[styles.moreMenuLabel, { color: themeTextColor }]}>{t("wallet")}</Text>
              <Text style={[styles.moreMenuDesc, { color: themeSubtitleColor }]}>View wallet, balance and transactions</Text>
            </View>
            <Text style={styles.moreMenuChevron}>›</Text>
          </TouchableOpacity>

          <View style={[styles.moreMenuDivider, { backgroundColor: themeDividerColor }]} />

          <TouchableOpacity onPress={() => setActiveSubScreen("accountDetails")} style={styles.moreMenuRowItem}>
            <View style={styles.moreMenuIconBox}>
              <Text style={styles.moreMenuIconEmoji}>👤</Text>
            </View>
            <View style={styles.moreMenuLabelCol}>
              <Text style={[styles.moreMenuLabel, { color: themeTextColor }]}>{t("account")}</Text>
              <Text style={[styles.moreMenuDesc, { color: themeSubtitleColor }]}>Personal information and account details</Text>
            </View>
            <Text style={styles.moreMenuChevron}>›</Text>
          </TouchableOpacity>
        </View>

        {/* GROUP 3: Security & Display */}
        <View style={[styles.moreMenuBlockCard, { backgroundColor: themeCardBg, borderColor: themeBorderColor }]}>
          <TouchableOpacity onPress={() => setActiveSubScreen("securitySettings")} style={styles.moreMenuRowItem}>
            <View style={styles.moreMenuIconBox}>
              <Text style={styles.moreMenuIconEmoji}>🔒</Text>
            </View>
            <View style={styles.moreMenuLabelCol}>
              <Text style={[styles.moreMenuLabel, { color: themeTextColor }]}>{t("security")}</Text>
              <Text style={[styles.moreMenuDesc, { color: themeSubtitleColor }]}>PIN, biometrics, 2FA and account security</Text>
            </View>
            <Text style={styles.moreMenuChevron}>›</Text>
          </TouchableOpacity>

          <View style={[styles.moreMenuDivider, { backgroundColor: themeDividerColor }]} />

          <TouchableOpacity onPress={() => setActiveSubScreen("appearanceSettings")} style={styles.moreMenuRowItem}>
            <View style={styles.moreMenuIconBox}>
              <Text style={styles.moreMenuIconEmoji}>🎨</Text>
            </View>
            <View style={styles.moreMenuLabelCol}>
              <Text style={[styles.moreMenuLabel, { color: themeTextColor }]}>{t("appearance")}</Text>
              <Text style={[styles.moreMenuDesc, { color: themeSubtitleColor }]}>Theme, language and display preferences</Text>
            </View>
            <Text style={styles.moreMenuChevron}>›</Text>
          </TouchableOpacity>
        </View>

        {/* GROUP 4: History & Alerts */}
        <View style={[styles.moreMenuBlockCard, { backgroundColor: themeCardBg, borderColor: themeBorderColor }]}>
          <TouchableOpacity onPress={() => setActiveSubScreen("transactions")} style={styles.moreMenuRowItem}>
            <View style={styles.moreMenuIconBox}>
              <Text style={styles.moreMenuIconEmoji}>🧾</Text>
            </View>
            <View style={styles.moreMenuLabelCol}>
              <Text style={[styles.moreMenuLabel, { color: themeTextColor }]}>{t("receipts")}</Text>
              <Text style={[styles.moreMenuDesc, { color: themeSubtitleColor }]}>Download and share your receipts</Text>
            </View>
            <Text style={styles.moreMenuChevron}>›</Text>
          </TouchableOpacity>

          <View style={[styles.moreMenuDivider, { backgroundColor: themeDividerColor }]} />

          <TouchableOpacity onPress={() => setActiveSubScreen("transactions")} style={styles.moreMenuRowItem}>
            <View style={styles.moreMenuIconBox}>
              <Text style={styles.moreMenuIconEmoji}>📊</Text>
            </View>
            <View style={styles.moreMenuLabelCol}>
              <Text style={[styles.moreMenuLabel, { color: themeTextColor }]}>{t("transactions")}</Text>
              <Text style={[styles.moreMenuDesc, { color: themeSubtitleColor }]}>View all your transactions</Text>
            </View>
            <Text style={styles.moreMenuChevron}>›</Text>
          </TouchableOpacity>

          <View style={[styles.moreMenuDivider, { backgroundColor: themeDividerColor }]} />

          <TouchableOpacity onPress={() => setActiveSubScreen("notifications")} style={styles.moreMenuRowItem}>
            <View style={styles.moreMenuIconBox}>
              <Text style={styles.moreMenuIconEmoji}>🔔</Text>
            </View>
            <View style={styles.moreMenuLabelCol}>
              <Text style={[styles.moreMenuLabel, { color: themeTextColor }]}>{t("notifications")}</Text>
              <Text style={[styles.moreMenuDesc, { color: themeSubtitleColor }]}>Manage your notification preferences</Text>
            </View>
            <Text style={styles.moreMenuChevron}>›</Text>
          </TouchableOpacity>

          <View style={[styles.moreMenuDivider, { backgroundColor: themeDividerColor }]} />

          <TouchableOpacity onPress={() => setActiveSubScreen("announcementsFeed")} style={styles.moreMenuRowItem}>
            <View style={styles.moreMenuIconBox}>
              <Text style={styles.moreMenuIconEmoji}>📢</Text>
            </View>
            <View style={styles.moreMenuLabelCol}>
              <Text style={[styles.moreMenuLabel, { color: themeTextColor }]}>{t("announcements")}</Text>
              <Text style={[styles.moreMenuDesc, { color: themeSubtitleColor }]}>Group announcements and updates</Text>
            </View>
            <Text style={styles.moreMenuChevron}>›</Text>
          </TouchableOpacity>
        </View>

        {/* GROUP 5: About & Support */}
        <View style={[styles.moreMenuBlockCard, { backgroundColor: themeCardBg, borderColor: themeBorderColor }]}>
          <TouchableOpacity onPress={() => setActiveSubScreen("aboutPayloop")} style={styles.moreMenuRowItem}>
            <View style={styles.moreMenuIconBox}>
              <Text style={styles.moreMenuIconEmoji}>🟢</Text>
            </View>
            <View style={styles.moreMenuLabelCol}>
              <Text style={[styles.moreMenuLabel, { color: themeTextColor }]}>{t("about")}</Text>
              <Text style={[styles.moreMenuDesc, { color: themeSubtitleColor }]}>Learn more about PayLoop</Text>
            </View>
            <Text style={styles.moreMenuChevron}>›</Text>
          </TouchableOpacity>

          <View style={[styles.moreMenuDivider, { backgroundColor: themeDividerColor }]} />

          <TouchableOpacity onPress={() => setActiveSubScreen("helpCenter")} style={styles.moreMenuRowItem}>
            <View style={styles.moreMenuIconBox}>
              <Text style={styles.moreMenuIconEmoji}>❓</Text>
            </View>
            <View style={styles.moreMenuLabelCol}>
              <Text style={[styles.moreMenuLabel, { color: themeTextColor }]}>{t("help")}</Text>
              <Text style={[styles.moreMenuDesc, { color: themeSubtitleColor }]}>FAQs, guides and support</Text>
            </View>
            <Text style={styles.moreMenuChevron}>›</Text>
          </TouchableOpacity>
        </View>

        {/* GROUP 6: Log Out */}
        <View style={[styles.moreMenuBlockCard, { backgroundColor: themeCardBg, borderColor: themeBorderColor, marginBottom: 30 }]}>
          <TouchableOpacity
            onPress={() => {
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
            style={styles.moreMenuRowItem}
          >
            <View style={[styles.moreMenuIconBox, { backgroundColor: "#FEE2E2" }]}>
              <Text style={[styles.moreMenuIconEmoji, { color: "#EF4444" }]}>🚪</Text>
            </View>
            <View style={styles.moreMenuLabelCol}>
              <Text style={[styles.moreMenuLabel, { color: "#EF4444" }]}>{t("logout")}</Text>
              <Text style={[styles.moreMenuDesc, { color: "#FCA5A5" }]}>Log out of your account</Text>
            </View>
            <Text style={[styles.moreMenuChevron, { color: "#EF4444" }]}>›</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    );
  };

  // -------------------------------------------------------------
  // DETAIL SUB-SCREENS FOR MORE MENU
  // -------------------------------------------------------------
  
  const renderGroupInfoScreen = () => {
    return (
      <ScrollView style={styles.tabContentLight} showsVerticalScrollIndicator={false}>
        <View style={styles.subScreenHeader}>
          <TouchableOpacity onPress={() => setActiveSubScreen(null)} style={styles.backButton}>
            <Text style={styles.backButtonText}>←</Text>
          </TouchableOpacity>
          <Text style={styles.subScreenTitle}>Group Information</Text>
          <View style={{ width: 40 }} />
        </View>

        <View style={styles.detailCardBox}>
          <Text style={styles.detailCardHeader}>Green Savers Circle</Text>
          <Text style={styles.detailCardDescription}>
            A collective savings group focused on funding agricultural equipment, business expansions, and providing mutual credit loops for members.
          </Text>

          <View style={styles.dividerSlate} />

          <View style={styles.detailItemRow}>
            <Text style={styles.detailLabel}>Chama Name</Text>
            <Text style={styles.detailValue}>Green Savers</Text>
          </View>
          <View style={styles.detailItemRow}>
            <Text style={styles.detailLabel}>Total Vault Balance</Text>
            <Text style={[styles.detailValue, { color: "#00875A", fontWeight: "800" }]}>{formatValue(vaultBalance)}</Text>
          </View>
          <View style={styles.detailItemRow}>
            <Text style={styles.detailLabel}>Active Savers</Text>
            <Text style={styles.detailValue}>12 Members</Text>
          </View>
          <View style={styles.detailItemRow}>
            <Text style={styles.detailLabel}>Cycle Duration</Text>
            <Text style={styles.detailValue}>Weekly (Every Sunday)</Text>
          </View>
          <View style={styles.detailItemRow}>
            <Text style={styles.detailLabel}>Savings Target Goal</Text>
            <Text style={styles.detailValue}>Chama Tractor Fund</Text>
          </View>
        </View>

        <View style={styles.detailCardBox}>
          <Text style={styles.detailCardHeader}>Consensus Rules & Policies</Text>
          
          <View style={styles.detailItemRow}>
            <Text style={styles.detailLabel}>Min Contribution</Text>
            <Text style={styles.detailValue}>{formatValue(100)} / week</Text>
          </View>
          <View style={styles.detailItemRow}>
            <Text style={styles.detailLabel}>Late Penalty Fine</Text>
            <Text style={styles.detailValue}>{formatValue(5)} / week</Text>
          </View>
          <View style={styles.detailItemRow}>
            <Text style={styles.detailLabel}>Borrowing Multiple</Text>
            <Text style={styles.detailValue}>3.0x Savings Balance</Text>
          </View>
          <View style={styles.detailItemRow}>
            <Text style={styles.detailLabel}>Consensus Threshold</Text>
            <Text style={styles.detailValue}>60% Member YES votes</Text>
          </View>
        </View>
      </ScrollView>
    );
  };

  const renderWalletDetailsScreen = () => {
    const handleCopy = () => {
      showBanner("Wallet Address copied to clipboard!", "success");
    };

    return (
      <ScrollView style={styles.tabContentLight} showsVerticalScrollIndicator={false}>
        <View style={styles.subScreenHeader}>
          <TouchableOpacity onPress={() => setActiveSubScreen(null)} style={styles.backButton}>
            <Text style={styles.backButtonText}>←</Text>
          </TouchableOpacity>
          <Text style={styles.subScreenTitle}>Wallet Settings</Text>
          <View style={{ width: 40 }} />
        </View>

        <View style={styles.detailCardBox}>
          <View style={styles.walletStatusRow}>
            <Text style={styles.detailCardHeader}>Web3 Ledger Node</Text>
            <View style={styles.statusPillGreen}>
              <Text style={styles.statusPillGreenText}>Connected</Text>
            </View>
          </View>

          <View style={styles.detailItemRow}>
            <Text style={styles.detailLabel}>Network</Text>
            <Text style={styles.detailValue}>Polygon Amoy (Testnet)</Text>
          </View>

          <View style={styles.detailItemRow}>
            <Text style={styles.detailLabel}>Wallet Balance</Text>
            <Text style={[styles.detailValue, { color: "#00875A", fontWeight: "800" }]}>{formatValue(selectedUser.balance)}</Text>
          </View>

          <View style={styles.walletAddressBox}>
            <Text style={styles.walletAddressLabel}>On-chain Wallet Address</Text>
            <View style={styles.addressStringCopyRow}>
              <Text style={styles.walletAddressTextMonospace}>{selectedUser.address}</Text>
              <TouchableOpacity onPress={handleCopy} style={styles.addressCopyBtnSmall}>
                <Text style={{ fontSize: 12 }}>📋</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <View style={{ gap: 10, paddingHorizontal: 4, marginBottom: 20 }}>
          <TouchableOpacity onPress={handleCopy} style={styles.walletActionBtnOutline}>
            <Text style={styles.walletActionBtnOutlineText}>📋 Copy Public Address</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            onPress={() => Alert.alert("Blockchain Explorer", "Launching simulated explorer session on Polygonscan to scan signatures...")} 
            style={styles.walletActionBtnOutline}
          >
            <Text style={styles.walletActionBtnOutlineText}>🔍 View on Polygonscan</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            onPress={() => {
              Alert.alert("Disconnect", "Simulating ledger disconnection. Please sign pin on your wallet device to reconnect.");
            }} 
            style={styles.walletActionBtnDisconnect}
          >
            <Text style={styles.walletActionBtnDisconnectText}>Disconnect Wallet</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    );
  };

  const renderAccountDetailsScreen = () => {
    return (
      <ScrollView style={styles.tabContentLight} showsVerticalScrollIndicator={false}>
        <View style={styles.subScreenHeader}>
          <TouchableOpacity onPress={() => setActiveSubScreen(null)} style={styles.backButton}>
            <Text style={styles.backButtonText}>←</Text>
          </TouchableOpacity>
          <Text style={styles.subScreenTitle}>Account Information</Text>
          <TouchableOpacity onPress={() => setActiveSubScreen("editProfile")} style={styles.headerActionButton}>
            <Text style={styles.headerActionButtonText}>Edit</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.detailCardBox}>
          <Text style={styles.detailCardHeader}>Identity Profile</Text>

          <View style={styles.detailItemRow}>
            <Text style={styles.detailLabel}>Full Name</Text>
            <Text style={styles.detailValue}>{selectedUser.name}</Text>
          </View>
          <View style={styles.detailItemRow}>
            <Text style={styles.detailLabel}>Email Address</Text>
            <Text style={styles.detailValue}>{selectedUser.email}</Text>
          </View>
          <View style={styles.detailItemRow}>
            <Text style={styles.detailLabel}>Phone Number</Text>
            <Text style={styles.detailValue}>{selectedUser.phone}</Text>
          </View>
          <View style={styles.detailItemRow}>
            <Text style={styles.detailLabel}>Date of Birth</Text>
            <Text style={styles.detailValue}>12 Aug 1990</Text>
          </View>
          <View style={styles.detailItemRow}>
            <Text style={styles.detailLabel}>Gender</Text>
            <Text style={styles.detailValue}>Male</Text>
          </View>
        </View>

        <View style={styles.detailCardBox}>
          <Text style={styles.detailCardHeader}>Professional & KYC Status</Text>

          <View style={styles.detailItemRow}>
            <Text style={styles.detailLabel}>Occupation</Text>
            <Text style={styles.detailValue}>Business Owner</Text>
          </View>
          <View style={styles.detailItemRow}>
            <Text style={styles.detailLabel}>Monthly Income</Text>
            <Text style={styles.detailValue}>KES 150,000 - 300,000</Text>
          </View>
          <View style={styles.detailItemRow}>
            <Text style={styles.detailLabel}>KYC Status</Text>
            <Text style={[styles.detailValue, { color: "#00875A", fontWeight: "700" }]}>Verified ✅</Text>
          </View>
          <View style={styles.detailItemRow}>
            <Text style={styles.detailLabel}>Member Since</Text>
            <Text style={styles.detailValue}>12 Jan 2024</Text>
          </View>
        </View>
      </ScrollView>
    );
  };

  const renderSecuritySettingsScreen = () => {
    return (
      <ScrollView style={styles.tabContentLight} showsVerticalScrollIndicator={false}>
        <View style={styles.subScreenHeader}>
          <TouchableOpacity onPress={() => setActiveSubScreen(null)} style={styles.backButton}>
            <Text style={styles.backButtonText}>←</Text>
          </TouchableOpacity>
          <Text style={styles.subScreenTitle}>Security Settings</Text>
          <View style={{ width: 40 }} />
        </View>

        <View style={styles.detailCardBox}>
          <Text style={styles.detailCardHeader}>Authentication</Text>

          <TouchableOpacity 
            onPress={() => Alert.alert("Change PIN", "Simulating PIN revision. We have dispatched authentication code to your registered email.")} 
            style={styles.securityChangePinRowItem}
          >
            <Text style={styles.securityPinChangeLabel}>Change Account PIN</Text>
            <Text style={styles.moreMenuChevron}>›</Text>
          </TouchableOpacity>

          <View style={styles.dividerSlate} />

          <View style={styles.settingToggleRow}>
            <View style={{ flex: 1, paddingRight: 10 }}>
              <Text style={styles.settingToggleLabel}>Enable Startup PIN</Text>
              <Text style={styles.settingToggleDesc}>Request 6 digit PIN on mobile startup</Text>
            </View>
            <TouchableOpacity 
              onPress={() => setSecurityPinToggle(!securityPinToggle)} 
              style={[styles.switchOuterTrack, securityPinToggle ? styles.switchOuterTrackActive : null]}
            >
              <View style={[styles.switchInnerDot, securityPinToggle ? styles.switchInnerDotActive : null]} />
            </TouchableOpacity>
          </View>

          <View style={styles.dividerSlate} />

          <View style={styles.settingToggleRow}>
            <View style={{ flex: 1, paddingRight: 10 }}>
              <Text style={styles.settingToggleLabel}>Biometric Login</Text>
              <Text style={styles.settingToggleDesc}>Enable Face ID or Touch ID logins</Text>
            </View>
            <TouchableOpacity 
              onPress={() => setSecurityBiometricToggle(!securityBiometricToggle)} 
              style={[styles.switchOuterTrack, securityBiometricToggle ? styles.switchOuterTrackActive : null]}
            >
              <View style={[styles.switchInnerDot, securityBiometricToggle ? styles.switchInnerDotActive : null]} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.detailCardBox}>
          <Text style={styles.detailCardHeader}>Active Session</Text>
          <View style={styles.sessionDetailsBox}>
            <Text style={styles.sessionLocationLabel}>Uasin Gishu, Kenya</Text>
            <Text style={styles.sessionStatusText}>Android Device • Current Active Session</Text>
          </View>
          <TouchableOpacity 
            onPress={() => Alert.alert("Sessions Revoked", "Successfully logged out of all other devices.")} 
            style={styles.revokeSessionsBtn}
          >
            <Text style={styles.revokeSessionsBtnText}>Terminate Other Sessions</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    );
  };

  const renderAppearanceSettingsScreen = () => {
    return (
      <ScrollView style={styles.tabContentLight} showsVerticalScrollIndicator={false}>
        <View style={styles.subScreenHeader}>
          <TouchableOpacity onPress={() => setActiveSubScreen(null)} style={styles.backButton}>
            <Text style={styles.backButtonText}>←</Text>
          </TouchableOpacity>
          <Text style={styles.subScreenTitle}>Appearance</Text>
          <View style={{ width: 40 }} />
        </View>

        <View style={styles.detailCardBox}>
          <Text style={styles.detailCardHeader}>Color Theme</Text>
          <View style={styles.pillSelectorRow}>
            {["Light", "Dark", "System"].map((t) => (
              <TouchableOpacity
                key={t}
                onPress={() => setAppearanceTheme(t)}
                style={[styles.pillSelectorBtn, appearanceTheme === t ? styles.pillSelectorBtnActive : null]}
              >
                <Text style={[styles.pillSelectorBtnText, appearanceTheme === t ? styles.pillSelectorBtnTextActive : null]}>{t}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.detailCardBox}>
          <Text style={styles.detailCardHeader}>App Language</Text>
          <View style={styles.pillSelectorRow}>
            {["English", "Kiswahili"].map((lang) => (
              <TouchableOpacity
                key={lang}
                onPress={() => setAppearanceLanguage(lang)}
                style={[styles.pillSelectorBtn, appearanceLanguage === lang ? styles.pillSelectorBtnActive : null]}
              >
                <Text style={[styles.pillSelectorBtnText, appearanceLanguage === lang ? styles.pillSelectorBtnTextActive : null]}>{lang}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.detailCardBox}>
          <Text style={styles.detailCardHeader}>Display Font Size</Text>
          <View style={styles.pillSelectorRow}>
            {["Standard", "Large", "Extra Large"].map((size) => (
              <TouchableOpacity
                key={size}
                onPress={() => setAppearanceFontSize(size)}
                style={[styles.pillSelectorBtn, appearanceFontSize === size ? styles.pillSelectorBtnActive : null]}
              >
                <Text style={[styles.pillSelectorBtnText, appearanceFontSize === size ? styles.pillSelectorBtnTextActive : null]}>{size}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.detailCardBox}>
          <Text style={styles.detailCardHeader}>Accessibility Toggles</Text>
          
          <View style={styles.settingToggleRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.settingToggleLabel}>High Contrast Text</Text>
              <Text style={styles.settingToggleDesc}>Improves legibility by increasing color ratios</Text>
            </View>
            <TouchableOpacity 
              onPress={() => setAccessibilityHighContrast(!accessibilityHighContrast)} 
              style={[styles.switchOuterTrack, accessibilityHighContrast ? styles.switchOuterTrackActive : null]}
            >
              <View style={[styles.switchInnerDot, accessibilityHighContrast ? styles.switchInnerDotActive : null]} />
            </TouchableOpacity>
          </View>

          <View style={styles.dividerSlate} />

          <View style={styles.settingToggleRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.settingToggleLabel}>Reduce Motion</Text>
              <Text style={styles.settingToggleDesc}>Disables transitions and animations</Text>
            </View>
            <TouchableOpacity 
              onPress={() => setAccessibilityReduceMotion(!accessibilityReduceMotion)} 
              style={[styles.switchOuterTrack, accessibilityReduceMotion ? styles.switchOuterTrackActive : null]}
            >
              <View style={[styles.switchInnerDot, accessibilityReduceMotion ? styles.switchInnerDotActive : null]} />
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    );
  };

  const renderAnnouncementsFeedScreen = () => {
    return (
      <ScrollView style={styles.tabContentLight} showsVerticalScrollIndicator={false}>
        <View style={styles.subScreenHeader}>
          <TouchableOpacity onPress={() => setActiveSubScreen(null)} style={styles.backButton}>
            <Text style={styles.backButtonText}>←</Text>
          </TouchableOpacity>
          <Text style={styles.subScreenTitle}>Chama Announcements</Text>
          <View style={{ width: 40 }} />
        </View>

        <View style={styles.announcementItemCardBox}>
          <View style={styles.announcementCardTop}>
            <Text style={styles.announcementMetaLabel}>8 Jun 2026 • Group Consensus</Text>
            <View style={styles.announcementUnreadDot} />
          </View>
          <Text style={styles.announcementMainTitle}>Consensus Voting Cycle Opens Friday</Text>
          <Text style={styles.announcementMessageContent}>
            Consensus voting starts on Friday morning for Peter Mwangi's agricultural tractor loan request (5,000 USDC). Please review proposal details in the Loan tab and prepare your ledger key signature.
          </Text>
        </View>

        <View style={styles.announcementItemCardBox}>
          <View style={styles.announcementCardTop}>
            <Text style={styles.announcementMetaLabel}>4 Jun 2026 • Tier Updates</Text>
          </View>
          <Text style={styles.announcementMainTitle}>Platinum Tier Interest Rate Reduced</Text>
          <Text style={styles.announcementMessageContent}>
            We have updated the CircleVault smart contracts. Members qualifying for Platinum Tier (CreditLoop score 800+) will now access loans at a reduced interest rate of 5.0% p.a.
          </Text>
        </View>

        <View style={styles.announcementItemCardBox}>
          <View style={styles.announcementCardTop}>
            <Text style={styles.announcementMetaLabel}>30 May 2026 • General</Text>
          </View>
          <Text style={styles.announcementMainTitle}>Monthly Chama Physical Meeting</Text>
          <Text style={styles.announcementMessageContent}>
            Our monthly offline meeting will take place at the local community library hall on Sunday, June 15, 2026 at 7 PM. All members must attend to synchronize local bookkeeping balances.
          </Text>
        </View>

        <TouchableOpacity 
          onPress={() => Alert.alert("Success", "All group announcements marked as read.")} 
          style={styles.announcementsMarkReadBtn}
        >
          <Text style={styles.announcementsMarkReadBtnText}>Mark All as Read</Text>
        </TouchableOpacity>
      </ScrollView>
    );
  };

  const renderAboutPayloopScreen = () => {
    return (
      <ScrollView style={styles.tabContentLight} showsVerticalScrollIndicator={false}>
        <View style={styles.subScreenHeader}>
          <TouchableOpacity onPress={() => setActiveSubScreen(null)} style={styles.backButton}>
            <Text style={styles.backButtonText}>←</Text>
          </TouchableOpacity>
          <Text style={styles.subScreenTitle}>About PayLoop</Text>
          <View style={{ width: 40 }} />
        </View>

        <View style={styles.aboutPlatformCardBox}>
          <View style={styles.aboutLogoCircle}>
            <Text style={styles.aboutLogoEmoji}>🔂</Text>
          </View>
          <Text style={styles.aboutVersionTitle}>PayLoop mobile application</Text>
          <Text style={styles.aboutVersionNumber}>Version 1.4.2</Text>
          <Text style={styles.aboutPlatformDesc}>
            PayLoop is a decentralized community credit and mutual savings platform empowering informal financial circles (chamas) to pool funds, verify reputation scores, and access interest-optimized credit lines securely.
          </Text>
        </View>

        <View style={styles.detailCardBox}>
          <Text style={styles.detailCardHeader}>Core Mission & Values</Text>
          <Text style={styles.aboutMissionText}>
            Our mission is to build a transparent, trust-less, and hyper-local credit loop ledger for everyone, eliminating dependency on high-interest commercial bank loans.
          </Text>
        </View>

        <View style={styles.aboutLinksBlock}>
          <TouchableOpacity onPress={() => Alert.alert("Website", "Opening www.payloop.io in browser...")} style={styles.aboutLinkItem}>
            <Text style={styles.aboutLinkText}>Official Website</Text>
            <Text style={styles.moreMenuChevron}>›</Text>
          </TouchableOpacity>
          <View style={styles.dividerSlate} />
          <TouchableOpacity onPress={() => Alert.alert("Privacy", "Opening Privacy Policy...")} style={styles.aboutLinkItem}>
            <Text style={styles.aboutLinkText}>Privacy Policy</Text>
            <Text style={styles.moreMenuChevron}>›</Text>
          </TouchableOpacity>
          <View style={styles.dividerSlate} />
          <TouchableOpacity onPress={() => Alert.alert("Terms", "Opening Terms of Service...")} style={styles.aboutLinkItem}>
            <Text style={styles.aboutLinkText}>Terms and Conditions</Text>
            <Text style={styles.moreMenuChevron}>›</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    );
  };

  const renderHelpCenterScreen = () => {
    return (
      <ScrollView style={styles.tabContentLight} showsVerticalScrollIndicator={false}>
        <View style={styles.subScreenHeader}>
          <TouchableOpacity onPress={() => setActiveSubScreen(null)} style={styles.backButton}>
            <Text style={styles.backButtonText}>←</Text>
          </TouchableOpacity>
          <Text style={styles.subScreenTitle}>Help & Support</Text>
          <View style={{ width: 40 }} />
        </View>

        <View style={styles.detailCardBox}>
          <Text style={styles.detailCardHeader}>Frequently Asked Questions</Text>
          
          <View style={styles.faqItemRow}>
            <Text style={styles.faqQuestionText}>Q: How does CreditLoop calculate my score?</Text>
            <Text style={styles.faqAnswerText}>
              A: CreditLoop aggregates contribution frequency, loan repayment speed, voting participation, and savings ratios.
            </Text>
          </View>

          <View style={styles.dividerSlate} />

          <View style={styles.faqItemRow}>
            <Text style={styles.faqQuestionText}>Q: Can I withdraw my savings pool balance?</Text>
            <Text style={styles.faqAnswerText}>
              A: Yes, but withdrawals are locked during active contribution cycles to maintain vault liquidity, subject to chama consensus rules.
            </Text>
          </View>

          <View style={styles.dividerSlate} />

          <View style={styles.faqItemRow}>
            <Text style={styles.faqQuestionText}>Q: What happens if I miss a contribution deadline?</Text>
            <Text style={styles.faqAnswerText}>
              A: Overdue cycles incur a penalty fine and will penalize your CreditLoop consistency score.
            </Text>
          </View>
        </View>

        <View style={styles.detailCardBox}>
          <Text style={styles.detailCardHeader}>Contact Support</Text>
          
          <TouchableOpacity 
            onPress={() => Alert.alert("Live Chat", "Connecting to live support chat node...")} 
            style={styles.helpContactBtnOutline}
          >
            <Text style={styles.helpContactBtnOutlineText}>💬 Start Live Chat</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            onPress={() => Alert.alert("Email Support", "Launching email composer to support@payloop.io")} 
            style={styles.helpContactBtnOutline}
          >
            <Text style={styles.helpContactBtnOutlineText}>✉️ Email support@payloop.io</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
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
        setSelectedUser(prev => ({ ...prev, avatarUri: uri }));
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
                      borderColor: (activeSubScreen === "editProfile" ? editAvatarUri : selectedUser.avatarUri) === p ? "#00875A" : "transparent" 
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

  // -------------------------------------------------------------
  // IDENTITY VERIFICATION SCREEN (Level 2)
  // -------------------------------------------------------------

  const renderVerifyIdentityScreen = () => {
    // Step states: 'phone' | 'documents' | 'selfie' | 'success'
    const step = verificationSuccess ? "success" :
                 (idDocUri && selfieUri) ? "selfie" :
                 idDocUri ? "selfie" :
                 isPhoneVerifiedState ? "documents" : "phone";

    const handleSendPhoneSms = async () => {
      if (!phoneForVerification || phoneForVerification.length < 9) {
        Alert.alert("Invalid Phone", "Please enter a valid phone number to verify.");
        return;
      }
      try {
        const res = await fetchWithTimeout(`${BACKEND_URL}/api/auth/send-otp`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: selectedUser.email, purpose: "phone_verification" })
        });
        const data = await res.json();
        if (res.ok) {
          setIsVerificationSmsSent(true);
          Alert.alert("Code Sent 📱", `A verification code was sent to ${phoneForVerification}.`);
        } else {
          Alert.alert("Error", data.error || "Failed to send verification code.");
        }
      } catch (e) {
        // Simulate for sandbox
        setIsVerificationSmsSent(true);
        Alert.alert("Code Sent 📱", `[Sandbox] A 6-digit code was simulated to ${phoneForVerification}.`);
      }
    };

    const handleVerifyPhoneCode = async () => {
      if (verificationSmsCode.length < 6) {
        Alert.alert("Invalid Code", "Enter the 6-digit code you received.");
        return;
      }
      try {
        const res = await fetchWithTimeout(`${BACKEND_URL}/api/auth/verify-otp`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: selectedUser.email, code: verificationSmsCode, purpose: "phone_verification" })
        });
        const data = await res.json();
        if (res.ok) {
          setIsPhoneVerifiedState(true);
          setIsVerificationSmsSent(false);
          setVerificationSmsCode("");
          showBanner("Phone number verified! Now upload your ID document.", "success");
        } else {
          Alert.alert("Incorrect Code", data.error || "The code you entered is incorrect or has expired.");
        }
      } catch (e) {
        // Sandbox: accept any 6-digit code
        if (verificationSmsCode.length === 6) {
          setIsPhoneVerifiedState(true);
          setIsVerificationSmsSent(false);
          setVerificationSmsCode("");
          showBanner("[Sandbox] Phone verified! Now upload your ID.", "success");
        } else {
          Alert.alert("Error", "Network error during verification.");
        }
      }
    };

    const handleUploadIdDoc = async () => {
      // Simulate selecting an ID document
      Alert.alert("Upload ID Document", "Simulating document upload...");
      setTimeout(async () => {
        const simulatedUrl = "https://sandbox-docs.payloop.io/id_" + Date.now() + ".jpg";
        setIdDocUri(simulatedUrl);
        try {
          await fetchWithTimeout(`${BACKEND_URL}/api/users/upload-document`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: selectedUser.email, docType: "National_ID", fileUrl: simulatedUrl })
          });
        } catch (e) { /* sandbox - ignore network */ }
        showBanner("ID document uploaded ✅ Now capture a selfie.", "success");
      }, 1500);
    };

    const handleUploadSelfie = async () => {
      Alert.alert("Capture Selfie", "Simulating selfie capture...");
      setTimeout(async () => {
        const simulatedUrl = "https://sandbox-docs.payloop.io/selfie_" + Date.now() + ".jpg";
        setSelfieUri(simulatedUrl);
        try {
          const res = await fetchWithTimeout(`${BACKEND_URL}/api/users/upload-document`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: selectedUser.email, docType: "Selfie", fileUrl: simulatedUrl })
          });
          const data = await res.json();
          if (data.levelUpgraded) {
            setSelectedUser(prev => ({ ...prev, verification_level: "FULLY_VERIFIED" }));
          }
        } catch (e) {
          // Sandbox: just promote locally
          setSelectedUser(prev => ({ ...prev, verification_level: "FULLY_VERIFIED" }));
        }
        setVerificationSuccess(true);
        showBanner("🎉 Identity fully verified! You can now request loans.", "success");
      }, 1800);
    };

    return (
      <ScrollView
        style={[styles.tabContentLight, { backgroundColor: themeBg }]}
        contentContainerStyle={{ paddingBottom: 60 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.subScreenHeader}>
          <TouchableOpacity
            onPress={() => setActiveSubScreen(null)}
            style={[styles.backButton, { backgroundColor: themeCardBg, borderColor: themeBorderColor }]}
          >
            <Text style={[styles.backButtonText, { color: themeTextColor }]}>←</Text>
          </TouchableOpacity>
          <Text style={[styles.subScreenTitle, { color: themeTextColor }]}>Identity Verification</Text>
          <View style={{ width: 40 }} />
        </View>

        {/* Progress Steps Bar */}
        <View style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          marginHorizontal: 20,
          marginBottom: 24,
          marginTop: 4
        }}>
          {[
            { label: "Phone", key: "phone" },
            { label: "ID Doc", key: "documents" },
            { label: "Selfie", key: "selfie" },
            { label: "Done", key: "success" }
          ].map((s, idx, arr) => {
            const isActive = step === s.key;
            const isDone = (
              (s.key === "phone" && (isPhoneVerifiedState || step === "documents" || step === "selfie" || step === "success")) ||
              (s.key === "documents" && (idDocUri || step === "selfie" || step === "success")) ||
              (s.key === "selfie" && (selfieUri || step === "success")) ||
              (s.key === "success" && verificationSuccess)
            );
            return (
              <React.Fragment key={s.key}>
                <View style={{ alignItems: "center" }}>
                  <View style={{
                    width: 32,
                    height: 32,
                    borderRadius: 16,
                    backgroundColor: isDone ? "#00875A" : isActive ? "#4F46E5" : (isDark ? "#374151" : "#E5E7EB"),
                    alignItems: "center",
                    justifyContent: "center",
                    borderWidth: isActive ? 2 : 0,
                    borderColor: "#818CF8"
                  }}>
                    <Text style={{ color: isDone || isActive ? "#FFF" : "#9CA3AF", fontSize: 13, fontWeight: "bold" }}>
                      {isDone ? "✓" : (idx + 1)}
                    </Text>
                  </View>
                  <Text style={{ fontSize: 10, marginTop: 3, color: isDone ? "#00875A" : isActive ? "#4F46E5" : (isDark ? "#9CA3AF" : "#6B7280"), fontWeight: isActive ? "700" : "400" }}>
                    {s.label}
                  </Text>
                </View>
                {idx < arr.length - 1 && (
                  <View style={{
                    flex: 1,
                    height: 2,
                    backgroundColor: isDone ? "#00875A" : (isDark ? "#374151" : "#E5E7EB"),
                    marginHorizontal: 4,
                    marginBottom: 16
                  }} />
                )}
              </React.Fragment>
            );
          })}
        </View>

        {/* SUCCESS STATE */}
        {verificationSuccess ? (
          <View style={{
            backgroundColor: isDark ? "#064E3B" : "#ECFDF5",
            marginHorizontal: 16,
            borderRadius: 20,
            padding: 32,
            alignItems: "center",
            borderWidth: 1,
            borderColor: "#6EE7B7"
          }}>
            <Text style={{ fontSize: 64, marginBottom: 16 }}>🎉</Text>
            <Text style={{ fontSize: 22, fontWeight: "800", color: "#00875A", marginBottom: 8, textAlign: "center" }}>
              Identity Verified!
            </Text>
            <Text style={{ fontSize: 14, color: isDark ? "#6EE7B7" : "#065F46", textAlign: "center", lineHeight: 20, marginBottom: 24 }}>
              You are now a fully verified PayLoop member. You can request Chama loans and access all premium features.
            </Text>
            <View style={{ flexDirection: "row", gap: 12 }}>
              <View style={{ backgroundColor: "#00875A", paddingVertical: 6, paddingHorizontal: 14, borderRadius: 20 }}>
                <Text style={{ color: "#FFF", fontWeight: "700", fontSize: 12 }}>✅ Level 2 — Fully Verified</Text>
              </View>
            </View>
            <TouchableOpacity
              onPress={() => setActiveSubScreen(null)}
              style={{
                marginTop: 24,
                backgroundColor: "#00875A",
                borderRadius: 12,
                paddingVertical: 14,
                paddingHorizontal: 40,
                width: "100%",
                alignItems: "center"
              }}
            >
              <Text style={{ color: "#FFF", fontWeight: "700", fontSize: 16 }}>Go to Dashboard</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            {/* STEP 1: PHONE VERIFICATION */}
            <View style={{
              marginHorizontal: 16,
              marginBottom: 16,
              backgroundColor: themeCardBg,
              borderRadius: 16,
              padding: 20,
              borderWidth: 1,
              borderColor: isPhoneVerifiedState ? "#6EE7B7" : themeBorderColor,
              opacity: isPhoneVerifiedState ? 0.7 : 1
            }}>
              <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 14 }}>
                <View style={{
                  width: 36,
                  height: 36,
                  borderRadius: 18,
                  backgroundColor: isPhoneVerifiedState ? "#00875A" : "#4F46E5",
                  alignItems: "center",
                  justifyContent: "center",
                  marginRight: 10
                }}>
                  <Text style={{ color: "#FFF", fontWeight: "800" }}>{isPhoneVerifiedState ? "✓" : "1"}</Text>
                </View>
                <View>
                  <Text style={{ color: themeTextColor, fontWeight: "700", fontSize: 15 }}>Phone Number Verification</Text>
                  <Text style={{ color: isDark ? "#9CA3AF" : "#6B7280", fontSize: 12 }}>
                    {isPhoneVerifiedState ? "Verified ✅" : "Confirm your mobile number"}
                  </Text>
                </View>
              </View>

              {!isPhoneVerifiedState && (
                <>
                  <TextInput
                    style={{
                      backgroundColor: isDark ? "#1F2937" : "#F9FAFB",
                      borderRadius: 10,
                      borderWidth: 1,
                      borderColor: themeBorderColor,
                      color: themeTextColor,
                      paddingHorizontal: 14,
                      paddingVertical: 11,
                      fontSize: 15,
                      marginBottom: 10
                    }}
                    placeholder="e.g. +254 712 345 678"
                    placeholderTextColor={isDark ? "#6B7280" : "#9CA3AF"}
                    keyboardType="phone-pad"
                    value={phoneForVerification}
                    onChangeText={setPhoneForVerification}
                    editable={!isVerificationSmsSent}
                  />

                  {!isVerificationSmsSent ? (
                    <TouchableOpacity
                      onPress={handleSendPhoneSms}
                      style={{ backgroundColor: "#4F46E5", borderRadius: 10, paddingVertical: 13, alignItems: "center" }}
                    >
                      <Text style={{ color: "#FFF", fontWeight: "700", fontSize: 14 }}>📱 Send Verification Code</Text>
                    </TouchableOpacity>
                  ) : (
                    <>
                      <Text style={{ color: isDark ? "#9CA3AF" : "#6B7280", fontSize: 12, marginBottom: 8 }}>
                        Enter the 6-digit code sent to {phoneForVerification}
                      </Text>
                      <TextInput
                        style={{
                          backgroundColor: isDark ? "#1F2937" : "#F9FAFB",
                          borderRadius: 10,
                          borderWidth: 1,
                          borderColor: themeBorderColor,
                          color: themeTextColor,
                          paddingHorizontal: 14,
                          paddingVertical: 11,
                          fontSize: 22,
                          letterSpacing: 8,
                          textAlign: "center",
                          marginBottom: 10,
                          fontWeight: "700"
                        }}
                        placeholder="● ● ● ● ● ●"
                        placeholderTextColor={isDark ? "#374151" : "#D1D5DB"}
                        keyboardType="number-pad"
                        maxLength={6}
                        value={verificationSmsCode}
                        onChangeText={setVerificationSmsCode}
                      />
                      <TouchableOpacity
                        onPress={handleVerifyPhoneCode}
                        style={{ backgroundColor: "#00875A", borderRadius: 10, paddingVertical: 13, alignItems: "center", marginBottom: 8 }}
                      >
                        <Text style={{ color: "#FFF", fontWeight: "700", fontSize: 14 }}>✅ Verify Code</Text>
                      </TouchableOpacity>
                      <TouchableOpacity onPress={() => setIsVerificationSmsSent(false)}>
                        <Text style={{ color: "#4F46E5", fontSize: 12, textAlign: "center" }}>Resend Code</Text>
                      </TouchableOpacity>
                    </>
                  )}
                </>
              )}
            </View>

            {/* STEP 2: ID DOCUMENT UPLOAD */}
            <View style={{
              marginHorizontal: 16,
              marginBottom: 16,
              backgroundColor: themeCardBg,
              borderRadius: 16,
              padding: 20,
              borderWidth: 1,
              borderColor: idDocUri ? "#6EE7B7" : themeBorderColor,
              opacity: !isPhoneVerifiedState ? 0.45 : 1
            }}>
              <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 14 }}>
                <View style={{
                  width: 36,
                  height: 36,
                  borderRadius: 18,
                  backgroundColor: idDocUri ? "#00875A" : (!isPhoneVerifiedState ? (isDark ? "#374151" : "#E5E7EB") : "#F59E0B"),
                  alignItems: "center",
                  justifyContent: "center",
                  marginRight: 10
                }}>
                  <Text style={{ color: idDocUri || isPhoneVerifiedState ? "#FFF" : "#6B7280", fontWeight: "800" }}>{idDocUri ? "✓" : "2"}</Text>
                </View>
                <View>
                  <Text style={{ color: themeTextColor, fontWeight: "700", fontSize: 15 }}>Government-Issued ID</Text>
                  <Text style={{ color: isDark ? "#9CA3AF" : "#6B7280", fontSize: 12 }}>
                    {idDocUri ? "Uploaded ✅" : "National ID, Passport, or Driver's License"}
                  </Text>
                </View>
              </View>

              {idDocUri ? (
                <View style={{ backgroundColor: isDark ? "#064E3B" : "#ECFDF5", borderRadius: 10, padding: 10, flexDirection: "row", alignItems: "center" }}>
                  <Text style={{ fontSize: 20, marginRight: 8 }}>🪪</Text>
                  <Text style={{ color: "#00875A", fontSize: 12, flex: 1 }}>Document uploaded and under review (Auto-approved in sandbox)</Text>
                </View>
              ) : (
                <>
                  <Text style={{ color: isDark ? "#9CA3AF" : "#6B7280", fontSize: 12, marginBottom: 12, lineHeight: 17 }}>
                    Upload a clear photo of the front of your National ID or Passport. Ensure all corners are visible and details are legible.
                  </Text>
                  <TouchableOpacity
                    onPress={isPhoneVerifiedState ? handleUploadIdDoc : undefined}
                    style={{
                      backgroundColor: isPhoneVerifiedState ? "#F59E0B" : (isDark ? "#374151" : "#E5E7EB"),
                      borderRadius: 10,
                      paddingVertical: 13,
                      alignItems: "center",
                      flexDirection: "row",
                      justifyContent: "center",
                      gap: 8
                    }}
                  >
                    <Text style={{ color: isPhoneVerifiedState ? "#FFF" : "#9CA3AF", fontWeight: "700", fontSize: 14 }}>
                      📸 Upload ID Document
                    </Text>
                  </TouchableOpacity>
                </>
              )}
            </View>

            {/* STEP 3: SELFIE CAPTURE */}
            <View style={{
              marginHorizontal: 16,
              marginBottom: 16,
              backgroundColor: themeCardBg,
              borderRadius: 16,
              padding: 20,
              borderWidth: 1,
              borderColor: selfieUri ? "#6EE7B7" : themeBorderColor,
              opacity: !idDocUri ? 0.45 : 1
            }}>
              <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 14 }}>
                <View style={{
                  width: 36,
                  height: 36,
                  borderRadius: 18,
                  backgroundColor: selfieUri ? "#00875A" : (!idDocUri ? (isDark ? "#374151" : "#E5E7EB") : "#EC4899"),
                  alignItems: "center",
                  justifyContent: "center",
                  marginRight: 10
                }}>
                  <Text style={{ color: selfieUri || idDocUri ? "#FFF" : "#6B7280", fontWeight: "800" }}>{selfieUri ? "✓" : "3"}</Text>
                </View>
                <View>
                  <Text style={{ color: themeTextColor, fontWeight: "700", fontSize: 15 }}>Live Selfie Capture</Text>
                  <Text style={{ color: isDark ? "#9CA3AF" : "#6B7280", fontSize: 12 }}>
                    {selfieUri ? "Selfie captured ✅" : "Take a photo of your face to confirm identity"}
                  </Text>
                </View>
              </View>

              {selfieUri ? (
                <View style={{ backgroundColor: isDark ? "#064E3B" : "#ECFDF5", borderRadius: 10, padding: 10, flexDirection: "row", alignItems: "center" }}>
                  <Text style={{ fontSize: 20, marginRight: 8 }}>🤳</Text>
                  <Text style={{ color: "#00875A", fontSize: 12, flex: 1 }}>Selfie matched against ID. Liveness check passed.</Text>
                </View>
              ) : (
                <>
                  <Text style={{ color: isDark ? "#9CA3AF" : "#6B7280", fontSize: 12, marginBottom: 12, lineHeight: 17 }}>
                    Look directly at the camera in a well-lit space. Remove glasses and ensure your full face is visible.
                  </Text>
                  <TouchableOpacity
                    onPress={idDocUri ? handleUploadSelfie : undefined}
                    style={{
                      backgroundColor: idDocUri ? "#EC4899" : (isDark ? "#374151" : "#E5E7EB"),
                      borderRadius: 10,
                      paddingVertical: 13,
                      alignItems: "center",
                      flexDirection: "row",
                      justifyContent: "center",
                      gap: 8
                    }}
                  >
                    <Text style={{ color: idDocUri ? "#FFF" : "#9CA3AF", fontWeight: "700", fontSize: 14 }}>
                      🤳 Capture Selfie
                    </Text>
                  </TouchableOpacity>
                </>
              )}
            </View>

            {/* Info note */}
            <View style={{
              marginHorizontal: 16,
              backgroundColor: isDark ? "#1E3A5F" : "#EFF6FF",
              borderRadius: 12,
              padding: 14,
              borderWidth: 1,
              borderColor: isDark ? "#3B82F6" : "#BFDBFE",
              flexDirection: "row"
            }}>
              <Text style={{ fontSize: 16, marginRight: 8 }}>🔒</Text>
              <Text style={{ color: isDark ? "#93C5FD" : "#1E40AF", fontSize: 12, flex: 1, lineHeight: 17 }}>
                Your documents are encrypted and only used for identity verification. PayLoop never shares your data with third parties without consent.
              </Text>
            </View>
          </>
        )}
      </ScrollView>
    );
  };

  // -------------------------------------------------------------
  // DASHBOARD LAYOUT & CHILD SCREENS
  // -------------------------------------------------------------

  const renderDashboardScreen = () => {
    if (activeSubScreen === "groupInfo") return renderGroupInfoScreen();
    if (activeSubScreen === "walletDetails") return renderWalletDetailsScreen();
    if (activeSubScreen === "accountDetails") return renderAccountDetailsScreen();
    if (activeSubScreen === "securitySettings") return renderSecuritySettingsScreen();
    if (activeSubScreen === "appearanceSettings") return renderAppearanceSettingsScreen();
    if (activeSubScreen === "announcementsFeed") return renderAnnouncementsFeedScreen();
    if (activeSubScreen === "aboutPayloop") return renderAboutPayloopScreen();
    if (activeSubScreen === "helpCenter") return renderHelpCenterScreen();
    if (activeSubScreen === "verifyIdentity") return renderVerifyIdentityScreen();

    if (activeSubScreen === "profile") {
      // SCREEN 11: MY PROFILE
      return (
        <ScrollView style={[styles.tabContentLight, { backgroundColor: themeBg }]} showsVerticalScrollIndicator={false}>
          <View style={styles.subScreenHeader}>
            <TouchableOpacity onPress={() => setActiveSubScreen(null)} style={[styles.backButton, { backgroundColor: themeCardBg, borderColor: themeBorderColor }]}>
              <Text style={[styles.backButtonText, { color: themeTextColor }]}>←</Text>
            </TouchableOpacity>
            <Text style={[styles.subScreenTitle, { color: themeTextColor }]}>{t("profile")}</Text>
            <TouchableOpacity onPress={openEditProfile} style={styles.headerActionButton}>
              <Text style={styles.headerActionButtonText}>{t("edit")}</Text>
            </TouchableOpacity>
          </View>

          <View style={[styles.profileAvatarCard, { backgroundColor: themeCardBg, borderColor: themeBorderColor }]}>
            <TouchableOpacity onPress={() => setShowAvatarPicker(true)} style={{ position: "relative" }}>
              <View style={[styles.profileBigAvatarCircle, { backgroundColor: isDark ? "#334155" : "#F3F4F6", borderColor: themeBorderColor }]}>
                {selectedUser.avatarUri ? (
                  <Image source={{ uri: selectedUser.avatarUri }} style={{ width: 96, height: 96, borderRadius: 48 }} />
                ) : (
                  <Text style={styles.profileBigAvatarText}>👤</Text>
                )}
              </View>
              <View style={[styles.moreCameraBadge, { width: 30, height: 30, borderRadius: 15, right: 2, bottom: 2, borderWidth: 3, borderColor: themeCardBg }]}>
                <Text style={{ fontSize: 12, color: "#ffffff" }}>📷</Text>
              </View>
            </TouchableOpacity>
            <Text style={[styles.profileCardName, { color: themeTextColor }]}>{selectedUser.name}</Text>
            <Text style={[styles.profileCardAddress, { color: themeSubtitleColor }]}>
              {selectedUser.address.substring(0, 10)}...{selectedUser.address.substring(selectedUser.address.length - 8)}
            </Text>
          </View>

          <View style={[styles.profileDetailsCard, { backgroundColor: themeCardBg, borderColor: themeBorderColor }]}>
            <View style={styles.profileDetailRow}>
              <Text style={[styles.profileDetailLabel, { color: themeSubtitleColor }]}>{t("fullname")}</Text>
              <Text style={[styles.profileDetailValue, { color: themeTextColor }]}>{selectedUser.name}</Text>
            </View>
            <View style={[styles.dividerSlate, { backgroundColor: themeDividerColor, marginVertical: 8 }]} />
            <View style={styles.profileDetailRow}>
              <Text style={[styles.profileDetailLabel, { color: themeSubtitleColor }]}>{t("email")}</Text>
              <Text style={[styles.profileDetailValue, { color: themeTextColor }]}>{selectedUser.email}</Text>
            </View>
            <View style={[styles.dividerSlate, { backgroundColor: themeDividerColor, marginVertical: 8 }]} />
            <View style={styles.profileDetailRow}>
              <Text style={[styles.profileDetailLabel, { color: themeSubtitleColor }]}>{t("phone")}</Text>
              <Text style={[styles.profileDetailValue, { color: themeTextColor }]}>{selectedUser.phone}</Text>
            </View>
            <View style={[styles.dividerSlate, { backgroundColor: themeDividerColor, marginVertical: 8 }]} />
            <View style={styles.profileDetailRow}>
              <Text style={[styles.profileDetailLabel, { color: themeSubtitleColor }]}>{t("bio")}</Text>
              <Text style={[styles.profileDetailValue, { color: themeTextColor, flex: 1, textAlign: 'right' }]} numberOfLines={2}>{selectedUser.bio}</Text>
            </View>
            <View style={[styles.dividerSlate, { backgroundColor: themeDividerColor, marginVertical: 8 }]} />
            <View style={styles.profileDetailRow}>
              <Text style={[styles.profileDetailLabel, { color: themeSubtitleColor }]}>{t("marital_status")}</Text>
              <Text style={[styles.profileDetailValue, { color: themeTextColor }]}>{selectedUser.maritalStatus}</Text>
            </View>
            <View style={[styles.dividerSlate, { backgroundColor: themeDividerColor, marginVertical: 8 }]} />
            <View style={styles.profileDetailRow}>
              <Text style={[styles.profileDetailLabel, { color: themeSubtitleColor }]}>Occupation</Text>
              <Text style={[styles.profileDetailValue, { color: themeTextColor }]}>{selectedUser.occupation}</Text>
            </View>
            <View style={[styles.dividerSlate, { backgroundColor: themeDividerColor, marginVertical: 8 }]} />
            <View style={styles.profileDetailRow}>
              <Text style={[styles.profileDetailLabel, { color: themeSubtitleColor }]}>Gender</Text>
              <Text style={[styles.profileDetailValue, { color: themeTextColor }]}>{selectedUser.gender}</Text>
            </View>
            <View style={[styles.dividerSlate, { backgroundColor: themeDividerColor, marginVertical: 8 }]} />
            <View style={styles.profileDetailRow}>
              <Text style={[styles.profileDetailLabel, { color: themeSubtitleColor }]}>Date of Birth</Text>
              <Text style={[styles.profileDetailValue, { color: themeTextColor }]}>{selectedUser.dob}</Text>
            </View>
          </View>

          {/* Log Out Button at the bottom of Profile */}
          <TouchableOpacity
            onPress={() => {
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
            style={[styles.walletActionBtnDisconnect, { marginHorizontal: 0, marginTop: 10, marginBottom: 40 }]}
          >
            <Text style={styles.walletActionBtnDisconnectText}>🚪 {t("logout")}</Text>
          </TouchableOpacity>
        </ScrollView>
      );
    }

    if (activeSubScreen === "editProfile") {
      // SCREEN 12: EDIT PROFILE
      return (
        <ScrollView style={[styles.tabContentLight, { backgroundColor: themeBg }]} showsVerticalScrollIndicator={false}>
          <View style={styles.subScreenHeader}>
            <TouchableOpacity onPress={() => setActiveSubScreen("profile")} style={[styles.backButton, { backgroundColor: themeCardBg, borderColor: themeBorderColor }]}>
              <Text style={[styles.backButtonText, { color: themeTextColor }]}>←</Text>
            </TouchableOpacity>
            <Text style={[styles.subScreenTitle, { color: themeTextColor }]}>{t("edit_profile")}</Text>
            <View style={{ width: 40 }} />
          </View>

          {/* Editable Avatar */}
          <TouchableOpacity onPress={() => setShowAvatarPicker(true)} style={{ alignSelf: "center", marginBottom: 20, position: "relative" }}>
            <View style={[styles.profileBigAvatarCircle, { backgroundColor: isDark ? "#334155" : "#F3F4F6", borderColor: themeBorderColor }]}>
              {editAvatarUri ? (
                <Image source={{ uri: editAvatarUri }} style={{ width: 96, height: 96, borderRadius: 48 }} />
              ) : (
                <Text style={styles.profileBigAvatarText}>👤</Text>
              )}
            </View>
            <View style={[styles.moreCameraBadge, { width: 30, height: 30, borderRadius: 15, right: 2, bottom: 2, borderWidth: 3, borderColor: themeCardBg }]}>
              <Text style={{ fontSize: 12, color: "#ffffff" }}>📷</Text>
            </View>
          </TouchableOpacity>
          <Text style={{ alignSelf: "center", fontSize: 13, fontWeight: "700", color: "#00875A", marginBottom: 15 }}>
            {t("change_photo")}
          </Text>

          <View style={[styles.formCardLight, { backgroundColor: themeCardBg, borderColor: themeBorderColor, padding: 20, borderRadius: 24, borderWidth: 1 }]}>
            <Text style={[styles.inputLabelField, { color: themeSubtitleColor }]}>{t("fullname")}</Text>
            <TextInput
              style={[styles.textInputField, { backgroundColor: isDark ? "#0F172A" : "#F8FAFC", borderColor: themeBorderColor, color: themeTextColor }]}
              value={editName}
              onChangeText={setEditName}
            />

            <Text style={[styles.inputLabelField, { color: themeSubtitleColor, marginTop: 14 }]}>{t("email")}</Text>
            <TextInput
              style={[styles.textInputField, { backgroundColor: isDark ? "#0F172A" : "#F8FAFC", borderColor: themeBorderColor, color: themeTextColor }]}
              value={editEmail}
              onChangeText={setEditEmail}
              keyboardType="email-address"
            />

            <Text style={[styles.inputLabelField, { color: themeSubtitleColor, marginTop: 14 }]}>{t("phone")}</Text>
            <TextInput
              style={[styles.textInputField, { backgroundColor: isDark ? "#0F172A" : "#F8FAFC", borderColor: themeBorderColor, color: themeTextColor }]}
              value={editPhone}
              onChangeText={setEditPhone}
              keyboardType="phone-pad"
            />

            <Text style={[styles.inputLabelField, { color: themeSubtitleColor, marginTop: 14 }]}>{t("bio")}</Text>
            <TextInput
              style={[styles.textInputField, { backgroundColor: isDark ? "#0F172A" : "#F8FAFC", borderColor: themeBorderColor, color: themeTextColor, height: 80 }]}
              value={editBio}
              onChangeText={setEditBio}
              multiline
            />

            <Text style={[styles.inputLabelField, { color: themeSubtitleColor, marginTop: 14 }]}>{t("marital_status")}</Text>
            <View style={styles.pickerAlternativeRow}>
              {["Single", "Married", "Other"].map((status) => (
                <TouchableOpacity
                  key={status}
                  onPress={() => setEditMarital(status)}
                  style={[
                    styles.pickerOptionButton,
                    { backgroundColor: isDark ? "#0F172A" : "#F3F4F6", borderColor: themeBorderColor },
                    editMarital === status ? styles.pickerOptionButtonActive : null
                  ]}
                >
                  <Text style={[styles.pickerOptionText, { color: isDark ? "#94A3B8" : "#4B5563" }, editMarital === status ? styles.pickerOptionTextActive : null]}>
                    {status}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Bottom Actions Buttons Row */}
            <View style={{ flexDirection: "row", gap: 12, marginTop: 24 }}>
              <TouchableOpacity onPress={() => setActiveSubScreen("profile")} style={[styles.walletActionBtnOutline, { flex: 1, marginHorizontal: 0, borderColor: themeBorderColor, paddingVertical: 10 }]}>
                <Text style={[styles.walletActionBtnOutlineText, { color: themeSubtitleColor }]}>{t("cancel")}</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleSaveProfile} style={[styles.walletActionBtnOutline, { flex: 1, marginHorizontal: 0, backgroundColor: "#00875A", borderColor: "#00875A", paddingVertical: 10 }]}>
                <Text style={[styles.walletActionBtnOutlineText, { color: "#ffffff" }]}>{t("save")}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      );
    }

    if (activeSubScreen === "notifications") {
      // SCREEN 13: NOTIFICATIONS
      return (
        <ScrollView style={styles.tabContentLight}>
          <View style={styles.subScreenHeader}>
            <TouchableOpacity onPress={() => setActiveSubScreen(null)} style={styles.backButton}>
              <Text style={styles.backButtonText}>←</Text>
            </TouchableOpacity>
            <Text style={styles.subScreenTitle}>Notifications</Text>
            <View style={{ width: 40 }} />
          </View>

          <View style={styles.notificationsListContainer}>
            {notifications.map((notif) => (
              <View key={notif.id} style={styles.notificationItemCard}>
                <View style={styles.notifIconCircle}>
                  <Text style={styles.notifIconText}>{notif.icon}</Text>
                </View>
                <View style={styles.notifDetailsCol}>
                  <View style={styles.notifHeaderRow}>
                    <Text style={styles.notifItemTitle}>{notif.title}</Text>
                    <Text style={styles.notifItemTime}>{notif.time}</Text>
                  </View>
                  <Text style={styles.notifItemMessage}>{notif.message}</Text>
                </View>
              </View>
            ))}
          </View>
        </ScrollView>
      );
    }

    if (activeSubScreen === "transactions") {
      // SCREEN 14: TRANSACTIONS
      const filteredTxs = transactions.filter((tx) => {
        if (txFilter === "All") return true;
        if (txFilter === "Contributions") return tx.type === "Contribution";
        return tx.type.includes("Loan");
      });

      return (
        <ScrollView style={styles.tabContentLight}>
          <View style={styles.subScreenHeader}>
            <TouchableOpacity onPress={() => setActiveSubScreen(null)} style={styles.backButton}>
              <Text style={styles.backButtonText}>←</Text>
            </TouchableOpacity>
            <Text style={styles.subScreenTitle}>Transactions</Text>
            <View style={{ width: 40 }} />
          </View>

          <View style={styles.txFilterTabsRow}>
            {["All", "Contributions", "Loans"].map((filter) => (
              <TouchableOpacity
                key={filter}
                onPress={() => setTxFilter(filter)}
                style={[
                  styles.txFilterTabButton,
                  txFilter === filter ? styles.txFilterTabButtonActive : null
                ]}
              >
                <Text style={[styles.txFilterTabText, txFilter === filter ? styles.txFilterTabTextActive : null]}>
                  {filter}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.txListContainer}>
            {filteredTxs.map((tx) => (
              <View key={tx.id} style={styles.txItemCard}>
                <View style={styles.txIconGroup}>
                  <View style={[styles.txIconBadge, tx.isIncome ? styles.txBadgeIncome : styles.txBadgeExpense]}>
                    <Text style={styles.txBadgeEmoji}>{tx.isIncome ? "📥" : "📤"}</Text>
                  </View>
                  <View style={styles.txInfoGroup}>
                    <Text style={styles.txInfoType}>{tx.type}</Text>
                    <Text style={styles.txInfoDate}>{tx.date}</Text>
                  </View>
                </View>
                <View style={styles.txValueGroup}>
                  <Text style={[styles.txAmountText, tx.isIncome ? styles.txAmountIncome : styles.txAmountExpense]}>
                    {formatValue(Math.abs(tx.amount))}
                  </Text>
                  <Text style={[styles.txStatusText, tx.status === "Completed" ? styles.txStatusSuccess : styles.txStatusPending]}>
                    {tx.status}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </ScrollView>
      );
    }

    if (activeSubScreen === "members") {
      // SCREEN 15: MEMBERS DIRECTORY
      const filteredMembers = members.filter(
        (m) =>
          m.name.toLowerCase().includes(searchMemberQuery.toLowerCase()) ||
          m.handle.toLowerCase().includes(searchMemberQuery.toLowerCase())
      );

      return (
        <ScrollView style={styles.tabContentLight}>
          <View style={styles.subScreenHeader}>
            <TouchableOpacity onPress={() => setActiveSubScreen(null)} style={styles.backButton}>
              <Text style={styles.backButtonText}>←</Text>
            </TouchableOpacity>
            <Text style={styles.subScreenTitle}>Members</Text>
            <View style={{ width: 40 }} />
          </View>

          <View style={styles.searchBarBox}>
            <TextInput
              style={styles.searchBarInput}
              placeholder="Search members..."
              placeholderTextColor="#9CA3AF"
              value={searchMemberQuery}
              onChangeText={setSearchMemberQuery}
            />
          </View>

          <View style={styles.membersListContainer}>
            {filteredMembers.map((member, index) => (
              <View key={index} style={styles.memberListItemRow}>
                <View style={styles.memberLeftSection}>
                  <View style={styles.memberAvatarContainer}>
                    <Text style={styles.memberAvatarEmoji}>{member.avatar}</Text>
                  </View>
                  <View style={styles.memberInfoCol}>
                    <Text style={styles.memberInfoName}>{member.name}</Text>
                    <Text style={styles.memberInfoHandle}>{member.handle}</Text>
                  </View>
                </View>
                <View style={styles.memberRightSection}>
                  <View style={[styles.statusIndicatorDot, member.status === "Active" ? styles.statusActiveDot : styles.statusInactiveDot]} />
                  <Text style={[styles.statusIndicatorText, member.status === "Active" ? styles.statusActiveText : styles.statusInactiveText]}>
                    {member.status}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </ScrollView>
      );
    }

    if (activeSubScreen === "contribute") {
      // SCREEN 7: MAKE CONTRIBUTION
      const amounts = currency === "KES" ? ["5,000", "10,000", "20,000", "50,000"] : ["50", "100", "200", "500"];
      return (
        <ScrollView style={styles.tabContentLight}>
          <View style={styles.subScreenHeader}>
            <TouchableOpacity onPress={() => setActiveSubScreen(null)} style={styles.backButton}>
              <Text style={styles.backButtonText}>←</Text>
            </TouchableOpacity>
            <Text style={styles.subScreenTitle}>Make Contribution</Text>
            <View style={{ width: 40 }} />
          </View>

          <View style={styles.contributionFormCard}>
            <Text style={styles.inputLabelLabel}>Amount in {currency}</Text>
            <View style={styles.largeAmountInputBox}>
              <TextInput
                style={styles.largeAmountTextInput}
                keyboardType="numeric"
                value={depositAmount}
                onChangeText={setDepositAmount}
              />
              <Text style={styles.largeAmountCurrency}>{currency}</Text>
            </View>

            <View style={styles.quickSelectAmountsRow}>
              {amounts.map((amt) => (
                <TouchableOpacity
                  key={amt}
                  onPress={() => setDepositAmount(amt.replace(/,/g, ""))}
                  style={[
                    styles.quickAmtBtn,
                    depositAmount === amt.replace(/,/g, "") ? styles.quickAmtBtnActive : null
                  ]}
                >
                  <Text style={[styles.quickAmtBtnText, depositAmount === amt.replace(/,/g, "") ? styles.quickAmtBtnTextActive : null]}>
                    {amt}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={[styles.inputLabelLabel, { marginTop: 20 }]}>Payment Method</Text>
            
            <TouchableOpacity onPress={() => setPaymentMethod("mpesa")} style={[styles.paymentMethodOptionCard, paymentMethod === "mpesa" ? styles.paymentMethodActiveCard : null]}>
              <View style={styles.paymentMethodLeft}>
                <View style={styles.paymentMethodIconBadgeMpesa}>
                  <Text style={styles.paymentMethodIconText}>🟢</Text>
                </View>
                <View style={styles.paymentMethodLabelCol}>
                  <Text style={styles.paymentMethodName}>M-Pesa</Text>
                  <Text style={styles.paymentMethodDetails}>SIM Toolkit Push Authorization</Text>
                </View>
              </View>
              <View style={[styles.paymentMethodCheckOutline, paymentMethod === "mpesa" ? styles.paymentMethodChecked : null]} />
            </TouchableOpacity>

            <TouchableOpacity onPress={() => setPaymentMethod("metamask")} style={[styles.paymentMethodOptionCard, paymentMethod === "metamask" ? styles.paymentMethodActiveCard : null]}>
              <View style={styles.paymentMethodLeft}>
                <View style={styles.paymentMethodIconBadgeCrypto}>
                  <Text style={styles.paymentMethodIconText}>🦊</Text>
                </View>
                <View style={styles.paymentMethodLabelCol}>
                  <Text style={styles.paymentMethodName}>MetaMask (Polygon)</Text>
                  <Text style={styles.paymentMethodDetails}>Gas fee: 0.0015 MATIC</Text>
                </View>
              </View>
              <View style={[styles.paymentMethodCheckOutline, paymentMethod === "metamask" ? styles.paymentMethodChecked : null]} />
            </TouchableOpacity>

            <View style={styles.walletBalanceSummaryBox}>
              <Text style={styles.walletBalanceTextSecondary}>Wallet Balance</Text>
              <Text style={styles.walletBalanceTextPrimary}>{formatValue(selectedUser.balance)}</Text>
            </View>

            <TouchableOpacity onPress={handleContributeSubmit} style={styles.buttonForestGreenSubmitContribution}>
              <Text style={styles.buttonTextPrimary}>Continue</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      );
    }

    if (activeSubScreen === "ussd") {
      // OFFLINE USSD SIMULATOR SCREEN
      return (
        <View style={styles.tabContentLight}>
          <View style={styles.subScreenHeader}>
            <TouchableOpacity onPress={() => setActiveSubScreen(null)} style={styles.backButton}>
              <Text style={styles.backButtonText}>←</Text>
            </TouchableOpacity>
            <Text style={styles.subScreenTitle}>USSD Simulator</Text>
            <View style={{ width: 40 }} />
          </View>

          <View style={styles.ussdPhoneOutlineFrame}>
            {/* Screen bezel */}
            <View style={styles.ussdScreenDisplayBox}>
              <Text style={styles.ussdHeaderSignalText}>📶 Safaricom | USSD *384*25#</Text>
              
              {ussdDisplayScreen === "main" && (
                <View style={styles.ussdMenuBodyBox}>
                  <Text style={styles.ussdMenuText}>Welcome to PayLoop Offline</Text>
                  <Text style={styles.ussdMenuText}>1. Check Balance</Text>
                  <Text style={styles.ussdMenuText}>2. Save to Chama</Text>
                  <Text style={styles.ussdMenuText}>3. Request Loan</Text>
                  <Text style={styles.ussdMenuText}>4. Credit Score Info</Text>
                  <Text style={styles.ussdMenuText}>5. Announcements</Text>
                </View>
              )}

              {ussdDisplayScreen === "balance" && (
                <View style={styles.ussdMenuBodyBox}>
                  <Text style={styles.ussdMenuText}>Your Savings: {formatValue(selectedUser.savings)}</Text>
                  <Text style={styles.ussdMenuText}>Wallet Bal: {formatValue(selectedUser.balance)}</Text>
                  <Text style={styles.ussdMenuText}>0. Back to Main</Text>
                </View>
              )}

              {ussdDisplayScreen === "save" && (
                <View style={styles.ussdMenuBodyBox}>
                  <Text style={styles.ussdMenuText}>Enter savings amount in {currency}:</Text>
                  <Text style={styles.ussdMenuText}>0. Back</Text>
                </View>
              )}

              {ussdDisplayScreen === "save_success" && (
                <View style={styles.ussdMenuBodyBox}>
                  <Text style={styles.ussdMenuText}>M-Pesa STK Push initiated for {currency} {ussdAmountEntered}.</Text>
                  <Text style={styles.ussdMenuText}>Please authorize on your phone.</Text>
                  <Text style={styles.ussdMenuText}>0. Back</Text>
                </View>
              )}

              {ussdDisplayScreen === "loan" && (
                <View style={styles.ussdMenuBodyBox}>
                  <Text style={styles.ussdMenuText}>Enter loan amount in {currency}:</Text>
                  <Text style={styles.ussdMenuText}>0. Back</Text>
                </View>
              )}

              {ussdDisplayScreen === "loan_success" && (
                <View style={styles.ussdMenuBodyBox}>
                  <Text style={styles.ussdMenuText}>Loan request of {currency} {ussdAmountEntered} submitted to Chama!</Text>
                  <Text style={styles.ussdMenuText}>Members will vote on consensus.</Text>
                  <Text style={styles.ussdMenuText}>0. Back</Text>
                </View>
              )}

              {ussdDisplayScreen === "score" && (
                <View style={styles.ussdMenuBodyBox}>
                  <Text style={styles.ussdMenuText}>CreditScore: {selectedUser.creditScore}</Text>
                  <Text style={styles.ussdMenuText}>Tier: {getCreditTier(selectedUser.creditScore).badge}</Text>
                  <Text style={styles.ussdMenuText}>0. Back</Text>
                </View>
              )}

              {ussdDisplayScreen === "announcements" && (
                <View style={styles.ussdMenuBodyBox}>
                  <Text style={styles.ussdMenuText}>Ann: General Meeting on 15 May at 7:00 PM.</Text>
                  <Text style={styles.ussdMenuText}>0. Back</Text>
                </View>
              )}

              <View style={styles.ussdPromptInputWrapper}>
                <TextInput
                  style={styles.ussdPromptTextInputField}
                  placeholder="Enter option..."
                  placeholderTextColor="#4b5563"
                  value={ussdInputText}
                  onChangeText={setUssdInputText}
                  keyboardType="numeric"
                  onSubmitEditing={handleUssdSubmitInput}
                />
              </View>
            </View>

            {/* Actions */}
            <View style={styles.ussdKeysContainerRow}>
              <TouchableOpacity onPress={() => { setUssdDisplayScreen("main"); setUssdInputText(""); }} style={styles.ussdCancelButton}>
                <Text style={styles.ussdCancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleUssdSubmitInput} style={styles.ussdSendButton}>
                <Text style={styles.ussdSendBtnText}>Send</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      );
    }

    // Standard Tab Rendering
    switch (activeTab) {
      case "home":
        // SCREEN 5: DASHBOARD (HOME SCREEN) - UPGRADED FINANCIAL COMMAND CENTER
        const tier = getCreditTier(selectedUser.creditScore);
        return (
          <View style={{ flex: 1, backgroundColor: "#F9FAFB" }}>
            {/* Topbar of different contrast/color */}
            {renderTopBar()}

            {isDashboardLoading ? (
              renderSkeletonLoader()
            ) : (
              <ScrollView 
                style={styles.tabContentLight}
                contentContainerStyle={{ paddingBottom: 100 }}
                refreshControl={
                  <RefreshControl
                    refreshing={isRefreshing}
                    onRefresh={handleDashboardRefresh}
                    colors={["#00875A"]}
                    tintColor="#00875A"
                  />
                }
              >
                {/* 1. SAVINGS SUMMARY CARD */}
                <View style={styles.summaryCardForestGreen}>
                  <View style={styles.summaryCardHeader}>
                    <View>
                      <Text style={styles.summaryCardLabel}>Total Savings Balance</Text>
                      <Text style={styles.summaryCardValue}>{formatValue(selectedUser.savings)}</Text>
                    </View>
                    <View style={styles.summaryGrowthBadge}>
                      <Text style={styles.summaryGrowthText}>▲ 12.5%</Text>
                    </View>
                  </View>

                  <View style={styles.summaryCardDivider} />

                  <View style={styles.summaryCardDetailsRow}>
                    <View style={styles.summaryDetailCol}>
                      <Text style={styles.summaryDetailLabel}>Wallet Balance</Text>
                      <Text style={styles.summaryDetailValue}>{formatValue(selectedUser.balance)}</Text>
                    </View>
                    <View style={styles.summaryDetailCol}>
                      <Text style={styles.summaryDetailLabel}>Cycle Progress</Text>
                      <View style={styles.summaryProgressContainer}>
                        <View style={styles.summaryProgressBarBg}>
                          <View style={[styles.summaryProgressBarFill, { width: '78%' }]} />
                        </View>
                        <Text style={styles.summaryProgressText}>78%</Text>
                      </View>
                    </View>
                    <View style={styles.summaryDetailColAlignEnd}>
                      <Text style={styles.summaryDetailLabel}>Member Status</Text>
                      <View style={styles.summaryStatusBadge}>
                        <View style={styles.summaryStatusPulse} />
                        <Text style={styles.summaryStatusText}>ACTIVE</Text>
                      </View>
                    </View>
                  </View>
                </View>

                {/* 2. QUICK ACTIONS GRID (2 Columns) */}
                <View style={styles.quickActionsContainer}>
                  <Text style={styles.homeSectionTitle}>Quick Services</Text>
                  <View style={styles.quickActionsGrid}>
                    
                    <TouchableOpacity onPress={() => setActiveSubScreen("contribute")} style={styles.quickActionCard}>
                      <View style={[styles.actionIconWrapper, { backgroundColor: 'rgba(0, 135, 90, 0.08)' }]}>
                        <Text style={styles.actionIconEmoji}>💸</Text>
                      </View>
                      <View style={styles.actionTextCol}>
                        <Text style={styles.actionTitle}>Contribute</Text>
                        <Text style={styles.actionSubtitle}>Save to chama</Text>
                      </View>
                    </TouchableOpacity>

                    <TouchableOpacity onPress={() => { setActiveTab("loans"); setLoansSubTab("request"); }} style={styles.quickActionCard}>
                      <View style={[styles.actionIconWrapper, { backgroundColor: 'rgba(13, 148, 136, 0.08)' }]}>
                        <Text style={styles.actionIconEmoji}>🤝</Text>
                      </View>
                      <View style={styles.actionTextCol}>
                        <Text style={styles.actionTitle}>Request Loan</Text>
                        <Text style={styles.actionSubtitle}>Borrow funds</Text>
                      </View>
                    </TouchableOpacity>

                    <TouchableOpacity 
                      onPress={() => {
                        if (selectedUser.activeLoan > 0) {
                          handleRepayLoan(0);
                        } else {
                          Alert.alert("No Loan", "You don't have any outstanding loans to repay.");
                        }
                      }} 
                      style={styles.quickActionCard}
                    >
                      <View style={[styles.actionIconWrapper, { backgroundColor: 'rgba(219, 39, 119, 0.08)' }]}>
                        <Text style={styles.actionIconEmoji}>💳</Text>
                      </View>
                      <View style={styles.actionTextCol}>
                        <Text style={styles.actionTitle}>Repay Loan</Text>
                        <Text style={styles.actionSubtitle}>Pay balance</Text>
                      </View>
                    </TouchableOpacity>

                    <TouchableOpacity 
                      onPress={() => {
                        Alert.alert(
                          "Wallet Identity", 
                          `Address:\n${selectedUser.address}\n\nNetwork: Polygon Amoy\nStatus: Connected ✅`,
                          [
                            { text: "Copy Address", onPress: () => Share.share({ message: selectedUser.address }) },
                            { text: "Close", style: "cancel" }
                          ]
                        );
                      }} 
                      style={styles.quickActionCard}
                    >
                      <View style={[styles.actionIconWrapper, { backgroundColor: 'rgba(79, 70, 229, 0.08)' }]}>
                        <Text style={styles.actionIconEmoji}>💼</Text>
                      </View>
                      <View style={styles.actionTextCol}>
                        <Text style={styles.actionTitle}>View Wallet</Text>
                        <Text style={styles.actionSubtitle}>Manage Web3</Text>
                      </View>
                    </TouchableOpacity>

                    <TouchableOpacity onPress={() => setActiveSubScreen("transactions")} style={styles.quickActionCard}>
                      <View style={[styles.actionIconWrapper, { backgroundColor: 'rgba(217, 119, 6, 0.08)' }]}>
                        <Text style={styles.actionIconEmoji}>🧾</Text>
                      </View>
                      <View style={styles.actionTextCol}>
                        <Text style={styles.actionTitle}>Receipts</Text>
                        <Text style={styles.actionSubtitle}>Get history</Text>
                      </View>
                    </TouchableOpacity>

                    <TouchableOpacity onPress={() => setShowQrScanner(true)} style={styles.quickActionCard}>
                      <View style={[styles.actionIconWrapper, { backgroundColor: 'rgba(107, 114, 128, 0.08)' }]}>
                        <Text style={styles.actionIconEmoji}>📷</Text>
                      </View>
                      <View style={styles.actionTextCol}>
                        <Text style={styles.actionTitle}>Scan QR</Text>
                        <Text style={styles.actionSubtitle}>Scan to verify</Text>
                      </View>
                    </TouchableOpacity>

                  </View>
                </View>

                {/* 3. CREDITLOOP SCORE CARD */}
                <View style={styles.creditLoopCard}>
                  <Text style={styles.homeSectionTitle}>CreditLoop Reputation</Text>
                  <View style={styles.creditScoreContentBox}>
                    <View style={styles.creditMeterWrapper}>
                      <Svg width="120" height="75" viewBox="0 0 120 75">
                        <Path
                          d="M 15 65 A 45 45 0 0 1 105 65"
                          fill="none"
                          stroke="#E5E7EB"
                          strokeWidth="8"
                          strokeLinecap="round"
                        />
                        <Path
                          d="M 15 65 A 45 45 0 0 1 105 65"
                          fill="none"
                          stroke={tier.color}
                          strokeWidth="8"
                          strokeLinecap="round"
                          strokeDasharray={`${Math.PI * 45} ${Math.PI * 45}`}
                          strokeDashoffset={(Math.PI * 45) * (1 - (selectedUser.creditScore - 300) / 550)}
                        />
                      </Svg>
                      <View style={styles.creditScoreOverlayLabel}>
                        <Text style={styles.creditScoreScoreVal}>{selectedUser.creditScore}</Text>
                        <Text style={[styles.creditScoreTierBadgeText, { color: tier.color }]}>{tier.name}</Text>
                      </View>
                    </View>

                    <View style={styles.creditScoreDetailsCol}>
                      <View style={styles.scoreLevelRow}>
                        <Text style={styles.scoreRatingLabel}>Rating:</Text>
                        <Text style={[styles.scoreRatingValue, { color: tier.color }]}>
                          {selectedUser.creditScore >= 800 ? "Excellent" : selectedUser.creditScore >= 650 ? "Good" : selectedUser.creditScore >= 400 ? "Fair" : "Risk"}
                        </Text>
                      </View>
                      <View style={styles.scoreTrendRow}>
                        <Text style={styles.scoreTrendText}>▲ +15 pts this cycle</Text>
                      </View>
                      <Text style={styles.scoreTipMessage}>
                        💡 Every timely contribution increases your score and lowers borrowing rates.
                      </Text>
                    </View>
                  </View>
                </View>

                {/* 4. CONTRIBUTION TRACKER WIDGET */}
                <View style={styles.trackerContainer}>
                  <Text style={styles.homeSectionTitle}>Contribution Tracker</Text>
                  
                  {selectedUser.savings === 0 ? (
                    <View style={[styles.trackerCard, styles.trackerOverdueCard]}>
                      <View style={styles.trackerHeaderRow}>
                        <View style={styles.trackerTitleCol}>
                          <Text style={[styles.trackerCardLabel, { color: '#DC2626' }]}>WEEKLY CHAMA CONTRIBUTION</Text>
                          <Text style={styles.trackerAmount}>{formatValue(100)}</Text>
                        </View>
                        <View style={styles.warningBadge}>
                          <Text style={styles.warningBadgeText}>⚠️ OVERDUE</Text>
                        </View>
                      </View>
                      <Text style={styles.trackerDueDateText}>Was due on: 8 May 2024 (2 days ago)</Text>
                      <View style={[styles.trackerProgressBarBg, { backgroundColor: '#FCA5A5' }]}>
                        <View style={[styles.trackerProgressBarFill, { width: '0%', backgroundColor: '#EF4444' }]} />
                      </View>
                      <Text style={[styles.trackerStatusDescText, { color: '#B91C1C' }]}>
                        ⚠️ Your account reputation score is currently frozen. Pay now to unfreeze.
                      </Text>
                    </View>
                  ) : (
                    <View style={styles.trackerCard}>
                      <View style={styles.trackerHeaderRow}>
                        <View style={styles.trackerTitleCol}>
                          <Text style={styles.trackerCardLabel}>WEEKLY CHAMA CONTRIBUTION</Text>
                          <Text style={styles.trackerAmount}>{formatValue(100)}</Text>
                        </View>
                        <View style={styles.onTimeBadge}>
                          <Text style={styles.onTimeBadgeText}>ON TRACK</Text>
                        </View>
                      </View>
                      <Text style={styles.trackerDueDateText}>Due: 15 June 2026 (5 days remaining)</Text>
                      <View style={styles.trackerProgressBarBg}>
                        <View style={[styles.trackerProgressBarFill, { width: '78%' }]} />
                      </View>
                      <Text style={styles.trackerStatusDescText}>
                        🟢 Chama collected 7,800 USDC of 10,000 USDC target (78% complete)
                      </Text>
                    </View>
                  )}
                </View>

                {/* 5. ACTIVE LOAN OVERVIEW */}
                <View style={styles.activeLoanContainer}>
                  <Text style={styles.homeSectionTitle}>Active Loan Status</Text>
                  
                  {selectedUser.activeLoan > 0 ? (
                    <View style={styles.loanStatusCard}>
                      <View style={styles.loanHeaderRow}>
                        <View>
                          <Text style={styles.loanCardLabel}>OUTSTANDING BALANCE</Text>
                          <Text style={styles.loanBalanceText}>{formatValue(selectedUser.activeLoan)}</Text>
                        </View>
                        <View style={styles.loanRepayProgressBadge}>
                          <Text style={styles.loanRepayProgressText}>16.6% Repaid</Text>
                        </View>
                      </View>

                      <Text style={styles.loanDueDateText}>Next payment: 28 May 2024 • Interest Rate: {tier.rate}%</Text>
                      
                      <View style={styles.loanProgressBarOuter}>
                        <View style={[styles.loanProgressBarInner, { width: '16.6%' }]} />
                      </View>

                      <View style={styles.loanActionsRowDashboard}>
                        <TouchableOpacity onPress={() => handleRepayLoan(0)} style={styles.loanDashboardRepayBtn}>
                          <Text style={styles.loanDashboardRepayBtnText}>Repay Installment</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  ) : (
                    <View style={styles.noLoanStatusCard}>
                      <Text style={styles.noLoanCardHeader}>No Active Loans</Text>
                      <Text style={styles.noLoanCardMessage}>
                        Based on your {tier.badge} credit tier, you are currently pre-approved for loans up to **{formatValue(25000 / KES_PER_USDC)}** at a premium rate of only **{tier.rate}% p.a.**
                      </Text>
                      <TouchableOpacity 
                        onPress={() => { setActiveTab("loans"); setLoansSubTab("request"); }} 
                        style={styles.noLoanCardActionBtn}
                      >
                        <Text style={styles.noLoanCardActionBtnText}>Apply Now</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>

                {/* 6. SAVINGS GOAL PROGRESS CARD */}
                <View style={styles.goalContainer}>
                  <Text style={styles.homeSectionTitle}>Savings Target Goal</Text>
                  <View style={styles.goalCard}>
                    <View style={styles.goalTopRow}>
                      <View style={styles.goalTitleCol}>
                        <Text style={styles.goalHeaderTitle}>{savingsGoal.title}</Text>
                        <Text style={styles.goalStatsText}>
                          {formatValue(savingsGoal.current)} of {formatValue(savingsGoal.target)}
                        </Text>
                      </View>
                      {renderSavingsCircleGauge(savingsGoal.current / savingsGoal.target, "saved")}
                    </View>
                    <View style={styles.goalBottomRow}>
                      <Text style={styles.goalDeadlineText}>Est. Completion: {savingsGoal.deadline}</Text>
                      <Text style={styles.goalMotivationalText}>🎯 Keep going! You are {Math.round((savingsGoal.current / savingsGoal.target) * 100)}% towards your target.</Text>
                    </View>
                  </View>
                </View>

                {/* 7. RECENT ACTIVITIES FEED */}
                <View style={styles.activityFeedContainer}>
                  <View style={styles.sectionHeaderRow}>
                    <Text style={styles.homeSectionTitle}>Recent Activities</Text>
                    <TouchableOpacity onPress={() => setActiveSubScreen("transactions")}>
                      <Text style={styles.viewAllTextLink}>View All ›</Text>
                    </TouchableOpacity>
                  </View>

                  <View style={styles.activityListCard}>
                    {transactions.slice(0, 3).map((item, idx) => (
                      <View key={item.id || idx} style={styles.activityItemRow}>
                        <View style={styles.activityIconBadge}>
                          <Text style={styles.activityEmoji}>{item.type === "Contribution" ? "💸" : item.isIncome ? "📥" : "📤"}</Text>
                        </View>
                        <View style={styles.activityItemDetails}>
                          <Text style={styles.activityTitle}>{item.type}</Text>
                          <Text style={styles.activityDate}>{item.date.split(",")[0]}</Text>
                        </View>
                        <View style={styles.activityAmountCol}>
                          <Text style={[styles.activityAmountVal, item.isIncome ? { color: '#00875A' } : { color: '#EF4444' }]}>
                            {item.isIncome ? "+" : "-"}{formatValue(Math.abs(item.amount))}
                          </Text>
                          <Text style={styles.activityStatus}>{item.status}</Text>
                        </View>
                      </View>
                    ))}
                  </View>
                </View>

                {/* 8. CHAMA INFO SECTION */}
                <View style={styles.groupInfoContainer}>
                  <Text style={styles.homeSectionTitle}>Chama Circle Hub</Text>
                  <View style={styles.groupInfoCard}>
                    <View style={styles.groupInfoStatRow}>
                      <View style={styles.groupStatBox}>
                        <Text style={styles.groupStatEmoji}>👥</Text>
                        <Text style={styles.groupStatVal}>{members.length} Members</Text>
                        <Text style={styles.groupStatSub}>Active Circle</Text>
                      </View>
                      <View style={styles.groupStatBox}>
                        <Text style={styles.groupStatEmoji}>📅</Text>
                        <Text style={styles.groupStatVal}>15 May 2024</Text>
                        <Text style={styles.groupStatSub}>Next Meeting</Text>
                      </View>
                      <View style={styles.groupStatBox}>
                        <Text style={styles.groupStatEmoji}>🛡️</Text>
                        <Text style={styles.groupStatVal}>Consensus</Text>
                        <Text style={styles.groupStatSub}>Multi-Sig Active</Text>
                      </View>
                    </View>

                    <View style={styles.groupAnnouncementTicker}>
                      <Text style={styles.announcementEmoji}>📢</Text>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.announcementTextTitle} numberOfLines={1}>
                          Consensus Meeting reminder: 15 May at Eldoret Hub.
                        </Text>
                      </View>
                    </View>
                  </View>
                </View>

                {/* 9. DECENTRALIZED WALLET STATUS */}
                <View style={styles.walletWidgetContainer}>
                  <Text style={styles.homeSectionTitle}>Decentralized Wallet Status</Text>
                  <View style={styles.walletWidgetCard}>
                    <View style={styles.walletWidgetHeader}>
                      <Text style={styles.walletWidgetProviderText}>🦊 MetaMask Ledger Identity</Text>
                      <View style={styles.walletWidgetStatusBadge}>
                        <View style={styles.walletWidgetPulseDot} />
                        <Text style={styles.walletWidgetStatusLabel}>CONNECTED</Text>
                      </View>
                    </View>

                    <View style={styles.walletWidgetAddressBox}>
                      <Text style={styles.walletWidgetAddressText}>{selectedUser.address}</Text>
                    </View>

                    <View style={styles.walletWidgetDetailsRow}>
                      <Text style={styles.walletWidgetLabel}>Network: <Text style={styles.walletWidgetValue}>Polygon Amoy</Text></Text>
                      <Text style={styles.walletWidgetLabel}>Status: <Text style={styles.walletWidgetValue}>Healthy</Text></Text>
                    </View>
                  </View>
                </View>

              </ScrollView>
            )}
          </View>
        );

      case "savings":
        // SCREEN 6: MY SAVINGS SCREEN - UPGRADED GROWTH CENTER
        return (
          <View style={{ flex: 1, backgroundColor: "#F9FAFB" }}>
            {/* Topbar of different contrast/color */}
            {renderTopBar()}
            {isDashboardLoading ? renderSkeletonLoader() : renderSavingsTabContent()}
          </View>
        );

      case "loans":
        return (
          <View style={{ flex: 1, backgroundColor: "#F9FAFB" }}>
            {renderTopBar()}
            {isDashboardLoading ? renderSkeletonLoader() : renderLoansTabContent()}
          </View>
        );

      case "score":
        return (
          <View style={{ flex: 1, backgroundColor: "#F9FAFB" }}>
            {renderTopBar()}
            {isDashboardLoading ? renderSkeletonLoader() : renderScoreTabContent()}
          </View>
        );

      case "more":
        return (
          <View style={{ flex: 1, backgroundColor: "#F9FAFB" }}>
            {renderTopBar()}
            {isDashboardLoading ? renderSkeletonLoader() : renderMoreTabContent()}
          </View>
        );

      default:
        return null;
    }
  };

  const renderBanner = () => {
    if (!banner) return null;
    let bgColor = "#00875A";
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

  return (
    <View style={styles.containerApp}>
      <StatusBar style={isDark ? "light" : "dark"} />
      {renderBanner()}
      <View style={{ flex: 1 }}>{renderDashboardScreen()}</View>

      {isLoading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#00875A" />
          <Text style={styles.loadingText}>Syncing Ledger...</Text>
        </View>
      )}

      {activeSubScreen === null && currentScreen === "dashboard" && (
        <View style={styles.bottomTabBar}>
          <TouchableOpacity onPress={() => setActiveTab("home")} style={styles.tabBarItem}>
            <Text style={[styles.tabBarIcon, activeTab === "home" ? styles.tabBarIconActive : null]}>🏠</Text>
            <Text style={[styles.tabBarLabel, activeTab === "home" ? styles.tabBarLabelActive : null]}>Home</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setActiveTab("savings")} style={styles.tabBarItem}>
            <Text style={[styles.tabBarIcon, activeTab === "savings" ? styles.tabBarIconActive : null]}>💰</Text>
            <Text style={[styles.tabBarLabel, activeTab === "savings" ? styles.tabBarLabelActive : null]}>Savings</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setActiveTab("loans")} style={styles.tabBarItem}>
            <Text style={[styles.tabBarIcon, activeTab === "loans" ? styles.tabBarIconActive : null]}>🤝</Text>
            <Text style={[styles.tabBarLabel, activeTab === "loans" ? styles.tabBarLabelActive : null]}>Loans</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setActiveTab("score")} style={styles.tabBarItem}>
            <Text style={[styles.tabBarIcon, activeTab === "score" ? styles.tabBarIconActive : null]}>📈</Text>
            <Text style={[styles.tabBarLabel, activeTab === "score" ? styles.tabBarLabelActive : null]}>Score</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setActiveTab("more")} style={styles.tabBarItem}>
            <Text style={[styles.tabBarIcon, activeTab === "more" ? styles.tabBarIconActive : null]}>☰</Text>
            <Text style={[styles.tabBarLabel, activeTab === "more" ? styles.tabBarLabelActive : null]}>More</Text>
          </TouchableOpacity>
        </View>
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
              <TouchableOpacity
                onPress={() => setShowMetaMaskModal(false)}
                style={styles.metaCancel}
              >
                <Text style={styles.metaCancelText}>REJECT</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleMetaMaskConfirm}
                style={styles.metaConfirm}
              >
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
              <Text style={styles.stkPushMessage}>Pay KES to PayLoop Chama?</Text>
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

            {/* Custom numpad for STK push */}
            <View style={styles.stkNumpadGrid}>
              <View style={styles.stkNumpadRow}>
                <TouchableOpacity onPress={() => handleStkPinPress("1")} style={styles.stkNumKey}><Text style={styles.stkNumText}>1</Text></TouchableOpacity>
                <TouchableOpacity onPress={() => handleStkPinPress("2")} style={styles.stkNumKey}><Text style={styles.stkNumText}>2</Text></TouchableOpacity>
                <TouchableOpacity onPress={() => handleStkPinPress("3")} style={styles.stkNumKey}><Text style={styles.stkNumText}>3</Text></TouchableOpacity>
              </View>
              <View style={styles.stkNumpadRow}>
                <TouchableOpacity onPress={() => handleStkPinPress("4")} style={styles.stkNumKey}><Text style={styles.stkNumText}>4</Text></TouchableOpacity>
                <TouchableOpacity onPress={() => handleStkPinPress("5")} style={styles.stkNumKey}><Text style={styles.stkNumText}>5</Text></TouchableOpacity>
                <TouchableOpacity onPress={() => handleStkPinPress("6")} style={styles.stkNumKey}><Text style={styles.stkNumText}>6</Text></TouchableOpacity>
              </View>
              <View style={styles.stkNumpadRow}>
                <TouchableOpacity onPress={() => handleStkPinPress("7")} style={styles.stkNumKey}><Text style={styles.stkNumText}>7</Text></TouchableOpacity>
                <TouchableOpacity onPress={() => handleStkPinPress("8")} style={styles.stkNumKey}><Text style={styles.stkNumText}>8</Text></TouchableOpacity>
                <TouchableOpacity onPress={() => handleStkPinPress("9")} style={styles.stkNumKey}><Text style={styles.stkNumText}>9</Text></TouchableOpacity>
              </View>
              <View style={styles.stkNumpadRow}>
                <TouchableOpacity onPress={() => setShowStkModal(false)} style={styles.stkActionCancelKey}><Text style={styles.stkActionCancelText}>Cancel</Text></TouchableOpacity>
                <TouchableOpacity onPress={() => handleStkPinPress("0")} style={styles.stkNumKey}><Text style={styles.stkNumText}>0</Text></TouchableOpacity>
                <TouchableOpacity onPress={() => handleStkPinPress("back")} style={styles.stkNumKey}><Text style={styles.stkNumTextEmoji}>⌫</Text></TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </Modal>

      {/* SHAREABLE DIGITAL TRANSACTION RECEIPT MODAL */}
      <Modal visible={showReceiptModal} transparent animationType="slide">
        <View style={styles.receiptModalOverlay}>
          <View style={styles.receiptCardWrapper}>
            <View style={styles.receiptSuccessIconCircle}>
              <Text style={styles.receiptCheckEmoji}>🎉</Text>
            </View>
            <Text style={styles.receiptAppNameHeader}>PayLoop Receipt</Text>
            
            <View style={styles.receiptBodySection}>
              <Text style={styles.receiptAmountTitle}>Amount Transacted</Text>
              <Text style={styles.receiptAmountVal}>{formatValue(receiptDetails.amount)}</Text>
              <Text style={styles.receiptStatusTextLabel}>Status: Success</Text>

              <View style={styles.receiptDashedSeparator} />

              <View style={styles.receiptInfoRowItem}>
                <Text style={styles.receiptInfoLabel}>Transaction ID</Text>
                <Text style={styles.receiptInfoValMonospace}>{receiptDetails.txId}</Text>
              </View>

              <View style={styles.receiptInfoRowItem}>
                <Text style={styles.receiptInfoLabel}>Timestamp</Text>
                <Text style={styles.receiptInfoVal}>{receiptDetails.date}</Text>
              </View>

              <View style={styles.receiptInfoRowItem}>
                <Text style={styles.receiptInfoLabel}>Gas / Transaction Fee</Text>
                <Text style={styles.receiptInfoVal}>KES 0.00 (Zero Fee)</Text>
              </View>

              <View style={styles.receiptInfoRowItem}>
                <Text style={styles.receiptInfoLabel}>Recipient</Text>
                <Text style={styles.receiptInfoVal}>{receiptDetails.recipient}</Text>
              </View>
            </View>

            <View style={styles.receiptActionsRow}>
              <TouchableOpacity onPress={handleShareReceipt} style={styles.receiptShareBtn}>
                <Text style={styles.receiptShareBtnText}>Share Receipt</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setShowReceiptModal(false)} style={styles.receiptCloseBtn}>
                <Text style={styles.receiptCloseBtnText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* SIMULATED QR CODE SCANNER OVERLAY */}
      <Modal visible={showQrScanner} transparent animationType="slide">
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
            <Text style={styles.qrScannerInstruction}>Align QR code inside the box to verify consensus</Text>
          </View>

          <View style={styles.qrScannerFooter}>
            <TouchableOpacity
              onPress={() => {
                setShowQrScanner(false);
                Alert.alert(
                  "Verification Success ✅",
                  "Consensus verification success! Score and wallet integrity signature matches the multi-sig circle ledger.",
                  [{ text: "Great!", style: "default" }]
                );
              }}
              style={styles.qrScannerSimulateBtn}
            >
              <Text style={styles.qrScannerSimulateBtnText}>Simulate Scan Success</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {renderAvatarPickerModal()}
    </View>
  );
}

// -------------------------------------------------------------
// STYLING SHEET
// -------------------------------------------------------------
