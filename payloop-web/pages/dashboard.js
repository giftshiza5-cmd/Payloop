import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { 
  useAccount, 
  useWalletClient, 
  usePublicClient,
  useReadContract, 
  useWriteContract 
} from "wagmi";
import { parseEther, formatEther } from "viem";
import { 
  CircleVaultArtifact, 
  LendingPoolArtifact, 
  CreditScoreArtifact, 
  LoopTokenArtifact 
} from "../lib/contracts";
import ConnectButton from "../components/ConnectButton";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, BarChart, Bar, Legend, Cell, PieChart, Pie } from "recharts";

export default function Dashboard() {
  const router = useRouter();
  const { address, isConnected } = useAccount();

  const [mounted, setMounted] = useState(false);
  
  // Navigation & Workspace State
  const [activeTab, setActiveTab] = useState("overview"); // e.g. overview, my-groups, create-group, join-group, savings, contributions, loans, wallet, deposit, withdraw, transfer, connected-wallets, transactions, members, announcements, reports, notifications, profile, settings
  
  // Authentication & Profile State
  const [user, setUser] = useState(null);
  const [token, setToken] = useState("");
  
  // Groups State
  const [groups, setGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null); // The currently active group object
  const [groupDashboardData, setGroupDashboardData] = useState(null);
  const [groupMembers, setGroupMembers] = useState([]);
  const [groupLoans, setGroupLoans] = useState([]);
  const [groupContributions, setGroupContributions] = useState([]);

  // Wallets State
  const [wallets, setWallets] = useState([]);
  const [selectedWalletType, setSelectedWalletType] = useState("PayLoop Wallet");
  
  // Inputs State
  // Create Group Inputs
  const [newGroupName, setNewGroupName] = useState("");
  const [newGroupDesc, setNewGroupDesc] = useState("");
  const [newGroupCat, setNewGroupCat] = useState("Chama");
  const [newGroupMaxMembers, setNewGroupMaxMembers] = useState("50");
  const [newGroupContribAmt, setNewGroupContribAmt] = useState("10");
  const [newGroupFreq, setNewGroupFreq] = useState("Weekly");
  const [newGroupInterest, setNewGroupInterest] = useState("8");
  const [newGroupVoteThreshold, setNewGroupVoteThreshold] = useState("50");
  
  // Join Group Inputs
  const [joinInviteCode, setJoinInviteCode] = useState("");
  
  // Contribution Inputs
  const [contribAmount, setContribAmount] = useState("");
  const [contribPayMethod, setContribPayMethod] = useState("PayLoop Wallet");

  // Loan Request Inputs
  const [loanAmount, setLoanAmount] = useState("");
  const [loanDuration, setLoanDuration] = useState("3"); // months
  const [loanPurpose, setLoanPurpose] = useState("");

  // Wallet Transaction Inputs
  const [depositAmount, setDepositAmount] = useState("");
  const [depositMethod, setDepositMethod] = useState("M-Pesa");
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [withdrawMethod, setWithdrawMethod] = useState("M-Pesa");
  const [transferAmount, setTransferAmount] = useState("");
  const [transferFrom, setTransferFrom] = useState("M-Pesa");
  const [transferTo, setTransferTo] = useState("PayLoop Wallet");
  const [connectWalletType, setConnectWalletType] = useState("MetaMask");
  const [connectWalletAddr, setConnectWalletAddr] = useState("");

  // Admin Publish Announcements Input
  const [annTitle, setAnnTitle] = useState("");
  const [annContent, setAnnContent] = useState("");

  // Loading indicator states
  const [isLoading, setIsLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  // Check login on mount
  useEffect(() => {
    setMounted(true);
    const savedUser = localStorage.getItem("payloop_user");
    const savedToken = localStorage.getItem("payloop_user_token");

    if (!savedUser || !savedToken) {
      router.push("/login");
    } else {
      setUser(JSON.parse(savedUser));
      setToken(savedToken);
    }
  }, []);

  // Fetch groups and wallets once user details are loaded
  useEffect(() => {
    if (user) {
      fetchUserGroups();
      fetchUserWallets();
    }
  }, [user]);

  // Fetch group specific details when selectedGroup changes
  useEffect(() => {
    if (selectedGroup) {
      fetchGroupDashboard(selectedGroup.id);
      fetchGroupMembers(selectedGroup.id);
      fetchGroupLoans(selectedGroup.id);
      fetchGroupContributions(selectedGroup.id);
    }
  }, [selectedGroup]);

  // Sync Web3 wallet address if connected
  useEffect(() => {
    if (isConnected && address && user) {
      // Connect MetaMask wallet automatically to backend
      fetch("http://localhost:5000/api/wallets/connect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: user.email, walletType: "MetaMask", walletAddress: address })
      })
      .then(() => fetchUserWallets())
      .catch(console.error);
    }
  }, [isConnected, address]);

  // API FETCH FUNCTIONS
  const fetchUserGroups = async () => {
    if (!user) return;
    try {
      const res = await fetch(`http://localhost:5000/api/groups/my-groups?email=${user.email}`);
      const data = await res.json();
      if (res.ok) {
        setGroups(data);
        if (data.length > 0 && !selectedGroup) {
          setSelectedGroup(data[0]);
        }
      }
    } catch (e) {
      console.error("Error fetching groups:", e);
    }
  };

  const fetchUserWallets = async () => {
    if (!user) return;
    try {
      const res = await fetch(`http://localhost:5000/api/wallets?email=${user.email}`);
      const data = await res.json();
      if (res.ok) {
        setWallets(data);
        // Sync user state with primary PayLoop wallet values
        const primary = data.find(w => w.wallet_type === "PayLoop Wallet");
        if (primary && user) {
          const updated = {
            ...user,
            balance: primary.balance,
            savings: primary.savings,
            active_loan: primary.active_loan,
            loop_points: primary.loop_points
          };
          setUser(updated);
          localStorage.setItem("payloop_user", JSON.stringify(updated));
        }
      }
    } catch (e) {
      console.error("Error fetching wallets:", e);
    }
  };

  const fetchGroupDashboard = async (groupId) => {
    if (!user) return;
    try {
      const res = await fetch(`http://localhost:5000/api/groups/${groupId}/dashboard?email=${user.email}`);
      const data = await res.json();
      if (res.ok) {
        setGroupDashboardData(data);
      }
    } catch (e) {
      console.error("Error fetching group dashboard:", e);
    }
  };

  const fetchGroupMembers = async (groupId) => {
    try {
      const res = await fetch(`http://localhost:5000/api/groups/${groupId}/members`);
      const data = await res.json();
      if (res.ok) {
        setGroupMembers(data);
      }
    } catch (e) {
      console.error("Error fetching members:", e);
    }
  };

  const fetchGroupLoans = async (groupId) => {
    try {
      const res = await fetch(`http://localhost:5000/api/loans?groupId=${groupId}`);
      const data = await res.json();
      if (res.ok) {
        setGroupLoans(data);
      }
    } catch (e) {
      console.error("Error fetching loans:", e);
    }
  };

  const fetchGroupContributions = async (groupId) => {
    if (!user) return;
    try {
      const res = await fetch(`http://localhost:5000/api/savings/transactions?email=${user.email}&groupId=${groupId}`);
      const data = await res.json();
      if (res.ok) {
        setGroupContributions(data);
      }
    } catch (e) {
      console.error("Error fetching contributions:", e);
    }
  };

  // ACTION SUBMISSIONS
  const handleCreateGroup = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      const res = await fetch("http://localhost:5000/api/groups/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newGroupName,
          description: newGroupDesc,
          category: newGroupCat,
          maxMembers: newGroupMaxMembers,
          contributionAmount: newGroupContribAmt,
          contributionFrequency: newGroupFreq,
          loanInterestRate: newGroupInterest,
          votingThreshold: newGroupVoteThreshold,
          email: user.email
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      alert(`Chama "${newGroupName}" successfully created! Share invite code: ${data.group.invite_code}`);
      setNewGroupName("");
      setNewGroupDesc("");
      await fetchUserGroups();
      setSelectedGroup(data.group);
      setActiveTab("overview");
    } catch (err) {
      alert(err.message || "Failed to create group");
    } finally {
      setActionLoading(false);
    }
  };

  const handleJoinGroup = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      const res = await fetch("http://localhost:5000/api/groups/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ inviteCode: joinInviteCode, email: user.email })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      alert(`Successfully joined "${data.group.name}"!`);
      setJoinInviteCode("");
      await fetchUserGroups();
      setSelectedGroup(data.group);
      setActiveTab("overview");
    } catch (err) {
      alert(err.message || "Failed to join group");
    } finally {
      setActionLoading(false);
    }
  };

  const handleSubmitContribution = async (e) => {
    e.preventDefault();
    if (!selectedGroup) return;
    setActionLoading(true);
    try {
      const res = await fetch("http://localhost:5000/api/savings/contribute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: user.email,
          amount: contribAmount,
          paymentMethod: contribPayMethod,
          groupId: selectedGroup.id
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      alert("Contribution submitted successfully! 🪙 Earned 10 LOOP Reward Points.");
      setContribAmount("");
      await fetchUserWallets();
      await fetchGroupDashboard(selectedGroup.id);
      await fetchGroupContributions(selectedGroup.id);
      setActiveTab("overview");
    } catch (err) {
      alert(err.message || "Contribution failed");
    } finally {
      setActionLoading(false);
    }
  };

  const handleRequestLoan = async (e) => {
    e.preventDefault();
    if (!selectedGroup) return;
    setActionLoading(true);
    try {
      const res = await fetch("http://localhost:5000/api/loans/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: user.email,
          amount: loanAmount,
          duration: loanDuration,
          purpose: loanPurpose,
          groupId: selectedGroup.id
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      alert("Loan request successfully registered! Sent to group consensus voting.");
      setLoanAmount("");
      setLoanPurpose("");
      await fetchGroupLoans(selectedGroup.id);
      setActiveTab("loans");
    } catch (err) {
      alert(err.message || "Loan request failed");
    } finally {
      setActionLoading(false);
    }
  };

  const handleVoteOnLoan = async (loanId, support) => {
    setActionLoading(true);
    try {
      const res = await fetch("http://localhost:5000/api/loans/vote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ loanId, voterEmail: user.email, support })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      alert(data.approved ? "Consensus reached! Loan Approved & Disbursed! 🎉" : "Your vote was recorded successfully.");
      if (selectedGroup) {
        await fetchGroupLoans(selectedGroup.id);
        await fetchUserWallets();
        await fetchGroupDashboard(selectedGroup.id);
      }
    } catch (err) {
      alert(err.message || "Voting failed");
    } finally {
      setActionLoading(false);
    }
  };

  const handleRepayLoan = async (loanId, amount) => {
    setActionLoading(true);
    try {
      const res = await fetch("http://localhost:5000/api/loans/repay", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: user.email, loanId, amount })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      alert("Loan repayment successful! Reputation score boosted (+15 pts). 📈");
      if (selectedGroup) {
        await fetchGroupLoans(selectedGroup.id);
        await fetchUserWallets();
        await fetchGroupDashboard(selectedGroup.id);
      }
    } catch (err) {
      alert(err.message || "Repayment failed");
    } finally {
      setActionLoading(false);
    }
  };

  // WALLET ACTIONS
  const handleDepositWallet = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      const res = await fetch("http://localhost:5000/api/wallets/deposit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: user.email, amount: depositAmount, paymentMethod: depositMethod })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      alert(`Simulated Deposit of KES ${parseFloat(depositAmount).toLocaleString()} processed successfully!`);
      setDepositAmount("");
      await fetchUserWallets();
      setActiveTab("wallet");
    } catch (err) {
      alert(err.message || "Deposit failed");
    } finally {
      setActionLoading(false);
    }
  };

  const handleWithdrawWallet = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      const res = await fetch("http://localhost:5000/api/wallets/withdraw", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: user.email, amount: withdrawAmount, paymentMethod: withdrawMethod })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      alert(`Simulated Withdrawal of KES ${parseFloat(withdrawAmount).toLocaleString()} processed successfully!`);
      setWithdrawAmount("");
      await fetchUserWallets();
      setActiveTab("wallet");
    } catch (err) {
      alert(err.message || "Withdrawal failed");
    } finally {
      setActionLoading(false);
    }
  };

  const handleTransferWallet = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      const res = await fetch("http://localhost:5000/api/wallets/transfer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: user.email, fromWalletType: transferFrom, toWalletType: transferTo, amount: transferAmount })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      alert("Internal Transfer executed successfully!");
      setTransferAmount("");
      await fetchUserWallets();
      setActiveTab("wallet");
    } catch (err) {
      alert(err.message || "Transfer failed");
    } finally {
      setActionLoading(false);
    }
  };

  const handleConnectExternalWallet = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      const res = await fetch("http://localhost:5000/api/wallets/connect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: user.email, walletType: connectWalletType, walletAddress: connectWalletAddr })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      alert(`${connectWalletType} connected successfully!`);
      setConnectWalletAddr("");
      await fetchUserWallets();
    } catch (err) {
      alert(err.message || "Link failed");
    } finally {
      setActionLoading(false);
    }
  };

  const handlePublishAnnouncement = async (e) => {
    e.preventDefault();
    if (!selectedGroup) return;
    setActionLoading(true);
    try {
      const res = await fetch(`http://localhost:5000/api/groups/${selectedGroup.id}/announcements`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: annTitle, content: annContent })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      alert("Announcement published successfully!");
      setAnnTitle("");
      setAnnContent("");
      await fetchGroupDashboard(selectedGroup.id);
    } catch (err) {
      alert(err.message || "Announcement publication failed");
    } finally {
      setActionLoading(false);
    }
  };

  const handlePromoteMember = async (targetEmail) => {
    if (!selectedGroup) return;
    setActionLoading(true);
    try {
      const res = await fetch(`http://localhost:5000/api/groups/${selectedGroup.id}/members/promote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userEmail: targetEmail })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      alert("Member promoted to Admin role!");
      await fetchGroupMembers(selectedGroup.id);
    } catch (err) {
      alert(err.message || "Promotion failed");
    } finally {
      setActionLoading(false);
    }
  };

  const handleRemoveMember = async (targetEmail) => {
    if (!selectedGroup) return;
    if (!confirm("Are you sure you want to remove this member from the group?")) return;
    setActionLoading(true);
    try {
      const res = await fetch(`http://localhost:5000/api/groups/${selectedGroup.id}/members/remove`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userEmail: targetEmail })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      alert("Member removed successfully.");
      await fetchGroupMembers(selectedGroup.id);
    } catch (err) {
      alert(err.message || "Removal failed");
    } finally {
      setActionLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("payloop_user");
    localStorage.removeItem("payloop_user_token");
    router.push("/login");
  };

  if (!mounted || !user) return null;

  // Retrieve user role in selected group
  const userRole = groupDashboardData?.userRole || "Member";

  // Recharts custom values / mock charts fallback
  const mockChartData = [
    { name: "Jan", Savings: 12000, Loans: 5000, Repayments: 3000 },
    { name: "Feb", Savings: 24000, Loans: 8000, Repayments: 5500 },
    { name: "Mar", Savings: 38000, Loans: 12000, Repayments: 9000 },
    { name: "Apr", Savings: 55000, Loans: 15000, Repayments: 11000 },
    { name: "May", Savings: groupDashboardData?.metrics?.groupSavings || 72000, Loans: groupDashboardData?.metrics?.activeLoansTotal || 18000, Repayments: 15000 }
  ];

  return (
    <div className="min-h-screen bg-[#070708] text-zinc-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-black relative">
      <Head>
        <title>PayLoop — Personal Dashboard</title>
      </Head>

      {/* Glow Effects */}
      <div className="absolute top-[-30%] left-[-20%] w-[50%] h-[50%] rounded-full bg-emerald-500/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-35%] right-[-20%] w-[50%] h-[50%] rounded-full bg-indigo-500/5 blur-[120px] pointer-events-none" />

      {/* Top Header */}
      <header className="w-full bg-zinc-950/80 border-b border-zinc-900 backdrop-blur-md px-6 py-4 flex items-center justify-between z-10 sticky top-0">
        <div className="flex items-center gap-6">
          <Link href="/" className="text-xl font-bold tracking-tight bg-gradient-to-r from-emerald-400 via-teal-400 to-indigo-400 bg-clip-text text-transparent flex items-center gap-2">
            <span>💸</span> PayLoop
          </Link>
          
          {/* Group Switcher dropdown */}
          {groups.length > 0 && (
            <div className="relative flex items-center gap-2 bg-zinc-900/60 border border-zinc-850 hover:border-zinc-800 px-3.5 py-1.5 rounded-xl transition-all cursor-pointer group">
              <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Group:</span>
              <select
                value={selectedGroup?.id || ""}
                onChange={(e) => {
                  const selected = groups.find(g => g.id === e.target.value);
                  setSelectedGroup(selected);
                }}
                className="bg-transparent text-xs font-semibold text-emerald-400 focus:outline-none cursor-pointer pr-4"
              >
                {groups.map((g) => (
                  <option key={g.id} value={g.id} className="bg-zinc-950 text-white">
                    {g.name}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        <div className="flex items-center gap-5">
          {/* User ID and Reputation Score header pill */}
          <div className="bg-zinc-900/40 border border-zinc-850 px-4 py-1.5 rounded-xl hidden md:flex items-center gap-4 text-xs font-semibold">
            <span className="font-mono text-zinc-400">{user.user_id_code}</span>
            <span className="h-3.5 w-px bg-zinc-800" />
            <span className="text-teal-400">Score: {user.reputation_score}/1000</span>
          </div>

          <ConnectButton />
          
          {/* User profile identifier */}
          <div className="flex items-center gap-2">
            <span className="w-9 h-9 rounded-xl bg-zinc-900 border border-zinc-850 flex items-center justify-center text-lg">
              {user.avatar || "👤"}
            </span>
            <div className="flex flex-col hidden sm:block">
              <span className="text-xs font-bold text-white block leading-none">{user.name}</span>
              <span className="text-[10px] text-zinc-500 font-mono mt-0.5 block">{user.handle}</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Workspace Layout */}
      <div className="flex-grow flex flex-col lg:flex-row max-w-7xl mx-auto w-full px-4 sm:px-6 py-6 gap-6 z-10">
        
        {/* Sidebar Structure */}
        <aside className="w-full lg:w-64 shrink-0 flex flex-col gap-1.5 bg-zinc-950/30 border border-zinc-900/50 p-3.5 rounded-2xl backdrop-blur-md max-h-[calc(100vh-120px)] overflow-y-auto">
          <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest px-3 block mb-1">Navigation</span>
          
          <button
            onClick={() => setActiveTab("overview")}
            className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-3 ${
              activeTab === "overview"
                ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-400"
                : "bg-transparent border border-transparent hover:bg-zinc-900/50 text-zinc-400 hover:text-zinc-200"
            }`}
          >
            📊 Dashboard Overview
          </button>

          <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest px-3 block mt-4 mb-1">Groups</span>
          <button
            onClick={() => setActiveTab("my-groups")}
            className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-3 ${
              activeTab === "my-groups"
                ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-400"
                : "bg-transparent border border-transparent hover:bg-zinc-900/50 text-zinc-400 hover:text-zinc-200"
            }`}
          >
            👥 My Groups ({groups.length})
          </button>
          <button
            onClick={() => setActiveTab("create-group")}
            className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-3 ${
              activeTab === "create-group"
                ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-400"
                : "bg-transparent border border-transparent hover:bg-zinc-900/50 text-zinc-400 hover:text-zinc-200"
            }`}
          >
            ➕ Create Group
          </button>
          <button
            onClick={() => setActiveTab("join-group")}
            className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-3 ${
              activeTab === "join-group"
                ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-400"
                : "bg-transparent border border-transparent hover:bg-zinc-900/50 text-zinc-400 hover:text-zinc-200"
            }`}
          >
            🔑 Join Group (Code)
          </button>

          <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest px-3 block mt-4 mb-1">Savings & Credit</span>
          <button
            onClick={() => setActiveTab("savings")}
            className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-3 ${
              activeTab === "savings"
                ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-400"
                : "bg-transparent border border-transparent hover:bg-zinc-900/50 text-zinc-400 hover:text-zinc-200"
            }`}
          >
            🎯 Personal Goals
          </button>
          <button
            onClick={() => setActiveTab("contributions")}
            className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-3 ${
              activeTab === "contributions"
                ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-400"
                : "bg-transparent border border-transparent hover:bg-zinc-900/50 text-zinc-400 hover:text-zinc-200"
            }`}
          >
            💰 Group Contributions
          </button>
          <button
            onClick={() => setActiveTab("loans")}
            className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-3 ${
              activeTab === "loans"
                ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-400"
                : "bg-transparent border border-transparent hover:bg-zinc-900/50 text-zinc-400 hover:text-zinc-200"
            }`}
          >
            🤝 Chama Lending Pool
          </button>

          <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest px-3 block mt-4 mb-1">Wallet Hub</span>
          <button
            onClick={() => setActiveTab("wallet")}
            className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-3 ${
              activeTab === "wallet"
                ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-400"
                : "bg-transparent border border-transparent hover:bg-zinc-900/50 text-zinc-400 hover:text-zinc-200"
            }`}
          >
            💳 PayLoop Wallet
          </button>
          <button
            onClick={() => setActiveTab("deposit")}
            className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-3 ${
              activeTab === "deposit"
                ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-400"
                : "bg-transparent border border-transparent hover:bg-zinc-900/50 text-zinc-400 hover:text-zinc-200"
            }`}
          >
            📥 Deposit Funds
          </button>
          <button
            onClick={() => setActiveTab("withdraw")}
            className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-3 ${
              activeTab === "withdraw"
                ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-400"
                : "bg-transparent border border-transparent hover:bg-zinc-900/50 text-zinc-400 hover:text-zinc-200"
            }`}
          >
            📤 Withdraw Funds
          </button>
          <button
            onClick={() => setActiveTab("transfer")}
            className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-3 ${
              activeTab === "transfer"
                ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-400"
                : "bg-transparent border border-transparent hover:bg-zinc-900/50 text-zinc-400 hover:text-zinc-200"
            }`}
          >
            🔄 Transfer Balance
          </button>

          <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest px-3 block mt-4 mb-1">Ecosystem logs</span>
          <button
            onClick={() => setActiveTab("transactions")}
            className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-3 ${
              activeTab === "transactions"
                ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-400"
                : "bg-transparent border border-transparent hover:bg-zinc-900/50 text-zinc-400 hover:text-zinc-200"
            }`}
          >
            📜 Transactions History
          </button>
          <button
            onClick={() => setActiveTab("members")}
            className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-3 ${
              activeTab === "members"
                ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-400"
                : "bg-transparent border border-transparent hover:bg-zinc-900/50 text-zinc-400 hover:text-zinc-200"
            }`}
          >
            👥 Group Members List
          </button>
          <button
            onClick={() => setActiveTab("announcements")}
            className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-3 ${
              activeTab === "announcements"
                ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-400"
                : "bg-transparent border border-transparent hover:bg-zinc-900/50 text-zinc-400 hover:text-zinc-200"
            }`}
          >
            📢 Announcements
          </button>

          <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest px-3 block mt-4 mb-1">Account & Settings</span>
          <button
            onClick={() => setActiveTab("profile")}
            className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-3 ${
              activeTab === "profile"
                ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-400"
                : "bg-transparent border border-transparent hover:bg-zinc-900/50 text-zinc-400 hover:text-zinc-200"
            }`}
          >
            👤 My Profile Details
          </button>
          
          <button
            onClick={handleLogout}
            className="w-full text-left px-3 py-2.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-3 bg-transparent border border-transparent hover:bg-rose-950/10 text-rose-500 hover:text-rose-400 mt-auto"
          >
            🚪 Sign Out Account
          </button>
        </aside>

        {/* Main Work Area */}
        <main className="flex-grow min-w-0 bg-zinc-950/10 border border-zinc-900/40 p-6 rounded-2xl backdrop-blur-md">
          {actionLoading && (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center flex-col gap-3">
              <span className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
              <span className="text-zinc-300 text-xs font-semibold font-mono tracking-wider">Processing Transaction...</span>
            </div>
          )}

          {/* TAB 1: OVERVIEW */}
          {activeTab === "overview" && (
            <div className="flex flex-col gap-6 animate-fadeIn">
              {/* Group stats summary */}
              {selectedGroup ? (
                <>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-zinc-950/80 border border-zinc-900 p-5 rounded-2xl">
                      <span className="text-zinc-500 text-[10px] font-bold uppercase tracking-wider">Selected Group</span>
                      <p className="text-sm font-extrabold text-white mt-1.5 overflow-hidden text-ellipsis whitespace-nowrap">
                        {selectedGroup.name}
                      </p>
                    </div>

                    <div className="bg-zinc-950/80 border border-zinc-900 p-5 rounded-2xl">
                      <span className="text-zinc-500 text-[10px] font-bold uppercase tracking-wider">Group Savings Pool</span>
                      <p className="text-2xl font-extrabold text-emerald-400 mt-1">
                        KES {parseFloat(groupDashboardData?.metrics?.groupSavings || 0).toLocaleString()}
                      </p>
                    </div>

                    <div className="bg-zinc-950/80 border border-zinc-900 p-5 rounded-2xl">
                      <span className="text-zinc-500 text-[10px] font-bold uppercase tracking-wider">Your Savings Here</span>
                      <p className="text-2xl font-extrabold text-teal-400 mt-1">
                        KES {parseFloat(groupDashboardData?.metrics?.userSavingsInGroup || 0).toLocaleString()}
                      </p>
                    </div>

                    <div className="bg-zinc-950/80 border border-zinc-900 p-5 rounded-2xl">
                      <span className="text-zinc-500 text-[10px] font-bold uppercase tracking-wider">Active Group Loans</span>
                      <p className="text-2xl font-extrabold text-indigo-400 mt-1">
                        KES {parseFloat(groupDashboardData?.metrics?.activeLoansTotal || 0).toLocaleString()}
                      </p>
                    </div>
                  </div>

                  {/* Dashboard metrics and charts */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Recharts AreaChart */}
                    <div className="bg-zinc-950/80 border border-zinc-900 p-5 rounded-3xl lg:col-span-2">
                      <div className="flex justify-between items-center mb-5">
                        <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Group Savings Trend</h3>
                        <span className="text-[10px] px-2.5 py-0.5 bg-emerald-500/10 text-emerald-400 rounded-full border border-emerald-500/10 font-bold uppercase">Dynamic</span>
                      </div>
                      <div className="h-64 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={mockChartData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                            <defs>
                              <linearGradient id="colorSavings" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                                <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                              </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#131318" />
                            <XAxis dataKey="name" stroke="#4b5563" fontSize={10} />
                            <YAxis stroke="#4b5563" fontSize={10} />
                            <Tooltip contentStyle={{ backgroundColor: '#09090b', borderColor: '#1f2937', color: '#fff' }} />
                            <Area type="monotone" dataKey="Savings" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorSavings)" />
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

                    {/* Group info and switcher details */}
                    <div className="bg-zinc-950/80 border border-zinc-900 p-6 rounded-3xl flex flex-col justify-between">
                      <div className="flex flex-col gap-4">
                        <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-2">Chama Policy Details</h3>
                        
                        <div className="border-b border-zinc-900 pb-3">
                          <span className="text-[10px] text-zinc-500 uppercase font-semibold">Min Contribution</span>
                          <p className="text-sm font-extrabold text-zinc-200 mt-1">
                            KES {selectedGroup.contribution_amount.toLocaleString()} / {selectedGroup.contribution_frequency}
                          </p>
                        </div>

                        <div className="border-b border-zinc-900 pb-3">
                          <span className="text-[10px] text-zinc-500 uppercase font-semibold">Group Code & Invite Code</span>
                          <p className="text-sm font-extrabold text-zinc-200 mt-1 font-mono">
                            {selectedGroup.group_id_code} • <span className="text-emerald-400 font-bold">{selectedGroup.invite_code}</span>
                          </p>
                        </div>

                        <div>
                          <span className="text-[10px] text-zinc-500 uppercase font-semibold">Consensus Vote Threshold</span>
                          <p className="text-sm font-extrabold text-zinc-200 mt-1">
                            {selectedGroup.voting_threshold}% Approval required
                          </p>
                        </div>
                      </div>

                      <div className="mt-4 pt-4 border-t border-zinc-900">
                        <span className="text-[10px] text-zinc-500 uppercase font-bold block mb-1">Your Role in Group</span>
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-teal-500/10 border border-teal-500/20 text-teal-400 rounded-lg text-xs font-bold">
                          {userRole === "Admin" ? "👑 Admin / Treasurer" : "👤 Registered Member"}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Group Announcements section */}
                  <div className="bg-zinc-950/80 border border-zinc-900 p-5 rounded-3xl mt-2">
                    <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-4">📢 Group Announcements</h3>
                    {groupDashboardData?.announcements?.length === 0 ? (
                      <p className="text-zinc-650 text-xs italic py-2">No announcements currently published.</p>
                    ) : (
                      <div className="flex flex-col gap-3">
                        {groupDashboardData?.announcements?.map((a) => (
                          <div key={a.id} className="bg-zinc-900/30 border border-zinc-900 p-4 rounded-2xl flex flex-col gap-1.5 hover:border-zinc-850 transition-colors">
                            <div className="flex justify-between items-center">
                              <h4 className="text-xs font-bold text-white">{a.title}</h4>
                              <span className="text-[9px] text-zinc-500 font-mono">{new Date(a.created_at).toLocaleDateString()}</span>
                            </div>
                            <p className="text-zinc-400 text-xs leading-relaxed">{a.content}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div className="p-12 text-center flex flex-col items-center justify-center gap-4 bg-zinc-950/30 border border-zinc-900 rounded-3xl">
                  <span className="text-5xl">👋</span>
                  <h2 className="text-xl font-extrabold text-white">Welcome, {user.name}!</h2>
                  <p className="text-zinc-400 text-sm max-w-sm">
                    You do not belong to any savings groups yet. Create a group or ask for an invitation code to get started.
                  </p>
                  <div className="flex gap-4 mt-2">
                    <button onClick={() => setActiveTab("create-group")} className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-black font-semibold rounded-xl text-xs">
                      Create Group
                    </button>
                    <button onClick={() => setActiveTab("join-group")} className="px-5 py-2.5 bg-zinc-900 border border-zinc-800 hover:bg-zinc-850 text-zinc-300 font-semibold rounded-xl text-xs">
                      Join Group
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: MY GROUPS */}
          {activeTab === "my-groups" && (
            <div className="flex flex-col gap-6 animate-fadeIn">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-lg font-extrabold text-white">Joined Cooperatives & Groups</h2>
                  <p className="text-zinc-400 text-xs mt-1">Manage all groups you are a registered member of.</p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => setActiveTab("create-group")} className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-bold rounded-xl">
                    Create New
                  </button>
                  <button onClick={() => setActiveTab("join-group")} className="px-4 py-2 bg-zinc-900 border border-zinc-800 hover:bg-zinc-850 text-zinc-300 text-xs font-bold rounded-xl">
                    Join via Code
                  </button>
                </div>
              </div>

              {groups.length === 0 ? (
                <div className="p-12 text-center text-zinc-500 text-sm">
                  You have not joined any groups yet.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {groups.map((g) => (
                    <div 
                      key={g.id} 
                      className={`bg-zinc-950/60 border p-5 rounded-3xl backdrop-blur-md flex flex-col justify-between gap-5 transition-all ${
                        selectedGroup?.id === g.id 
                          ? "border-emerald-500/20 shadow-lg shadow-emerald-500/5" 
                          : "border-zinc-900 hover:border-zinc-800"
                      }`}
                    >
                      <div>
                        <div className="flex justify-between items-start">
                          <div>
                            <span className="text-[10px] text-emerald-400 font-mono font-bold tracking-wider">{g.group_id_code}</span>
                            <h3 className="text-sm font-extrabold text-white mt-1">{g.name}</h3>
                          </div>
                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                            g.role === "Admin" ? "bg-teal-500/10 text-teal-400" : "bg-zinc-900 text-zinc-400"
                          }`}>
                            {g.role}
                          </span>
                        </div>
                        <p className="text-zinc-400 text-xs mt-3 leading-relaxed min-h-[40px] line-clamp-2">{g.description}</p>
                      </div>

                      <div className="border-t border-zinc-900/60 pt-4 flex items-center justify-between">
                        <div className="flex gap-4 text-xs font-semibold text-zinc-400">
                          <span>👥 {g.members_count} Members</span>
                          <span>💰 KES {parseFloat(g.group_savings || 0).toLocaleString()}</span>
                        </div>
                        
                        <button
                          onClick={() => {
                            setSelectedGroup(g);
                            setActiveTab("overview");
                          }}
                          className="px-4.5 py-2 bg-zinc-900 hover:bg-zinc-850 text-emerald-400 hover:text-emerald-300 text-xs font-bold rounded-xl border border-zinc-850 hover:border-zinc-800 transition-all"
                        >
                          Select Group
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: CREATE GROUP */}
          {activeTab === "create-group" && (
            <div className="flex flex-col gap-6 max-w-xl animate-fadeIn">
              <div>
                <h2 className="text-lg font-extrabold text-white">Create a New Savings Group</h2>
                <p className="text-zinc-400 text-xs mt-1">Setup your group policies. You will be assigned as the administrator.</p>
              </div>

              <form onSubmit={handleCreateGroup} className="flex flex-col gap-4 bg-zinc-950/40 border border-zinc-900 p-6 rounded-3xl backdrop-blur-md">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="block text-zinc-400 text-xs font-semibold uppercase tracking-wider mb-2">
                      Group / Chama Name
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Eldoret Farmers Savings Circle"
                      value={newGroupName}
                      onChange={(e) => setNewGroupName(e.target.value)}
                      className="w-full bg-zinc-900/50 border border-zinc-850 px-4 py-3 rounded-xl text-sm text-white focus:outline-none focus:border-emerald-500"
                      required
                    />
                  </div>

                  <div className="col-span-2">
                    <label className="block text-zinc-400 text-xs font-semibold uppercase tracking-wider mb-2">
                      Group Description
                    </label>
                    <textarea
                      placeholder="Specify the purpose of this chama..."
                      rows="2"
                      value={newGroupDesc}
                      onChange={(e) => setNewGroupDesc(e.target.value)}
                      className="w-full bg-zinc-900/50 border border-zinc-850 px-4 py-3 rounded-xl text-sm text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-zinc-400 text-xs font-semibold uppercase tracking-wider mb-2">
                      Category
                    </label>
                    <select
                      value={newGroupCat}
                      onChange={(e) => setNewGroupCat(e.target.value)}
                      className="w-full bg-zinc-900/50 border border-zinc-850 px-4 py-3 rounded-xl text-sm text-white focus:outline-none"
                    >
                      <option value="Chama">Chama</option>
                      <option value="SACCO">SACCO</option>
                      <option value="Investment Club">Investment Club</option>
                      <option value="Welfare Group">Welfare Group</option>
                      <option value="Savings Circle">Savings Circle</option>
                      <option value="Cooperative">Cooperative</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-zinc-400 text-xs font-semibold uppercase tracking-wider mb-2">
                      Max Members
                    </label>
                    <input
                      type="number"
                      value={newGroupMaxMembers}
                      onChange={(e) => setNewGroupMaxMembers(e.target.value)}
                      className="w-full bg-zinc-900/50 border border-zinc-850 px-4 py-3 rounded-xl text-sm text-white focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-zinc-400 text-xs font-semibold uppercase tracking-wider mb-2">
                      Contribution Amount (KES)
                    </label>
                    <input
                      type="number"
                      placeholder="e.g. 500"
                      value={newGroupContribAmt}
                      onChange={(e) => setNewGroupContribAmt(e.target.value)}
                      className="w-full bg-zinc-900/50 border border-zinc-850 px-4 py-3 rounded-xl text-sm text-white focus:outline-none font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-zinc-400 text-xs font-semibold uppercase tracking-wider mb-2">
                      Contribution Frequency
                    </label>
                    <select
                      value={newGroupFreq}
                      onChange={(e) => setNewGroupFreq(e.target.value)}
                      className="w-full bg-zinc-900/50 border border-zinc-850 px-4 py-3 rounded-xl text-sm text-white focus:outline-none"
                    >
                      <option value="Weekly">Weekly</option>
                      <option value="Monthly">Monthly</option>
                      <option value="Quarterly">Quarterly</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-zinc-400 text-xs font-semibold uppercase tracking-wider mb-2">
                      Loan Interest Rate (% p.a.)
                    </label>
                    <input
                      type="number"
                      placeholder="e.g. 8"
                      value={newGroupInterest}
                      onChange={(e) => setNewGroupInterest(e.target.value)}
                      className="w-full bg-zinc-900/50 border border-zinc-850 px-4 py-3 rounded-xl text-sm text-white focus:outline-none font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-zinc-400 text-xs font-semibold uppercase tracking-wider mb-2">
                      Consensus Threshold (%)
                    </label>
                    <input
                      type="number"
                      placeholder="e.g. 50"
                      value={newGroupVoteThreshold}
                      onChange={(e) => setNewGroupVoteThreshold(e.target.value)}
                      className="w-full bg-zinc-900/50 border border-zinc-850 px-4 py-3 rounded-xl text-sm text-white focus:outline-none font-mono"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-black font-extrabold rounded-xl shadow-lg shadow-emerald-500/5 active:scale-95 transition-all text-sm mt-4"
                >
                  Create & Launch Group
                </button>
              </form>
            </div>
          )}

          {/* TAB 4: JOIN GROUP */}
          {activeTab === "join-group" && (
            <div className="flex flex-col gap-6 max-w-md animate-fadeIn">
              <div>
                <h2 className="text-lg font-extrabold text-white">Join a Savings Group</h2>
                <p className="text-zinc-400 text-xs mt-1">Enter an invitation code to request entry into an active group.</p>
              </div>

              <form onSubmit={handleJoinGroup} className="flex flex-col gap-4 bg-zinc-950/40 border border-zinc-900 p-6 rounded-3xl backdrop-blur-md">
                <div>
                  <label className="block text-zinc-400 text-xs font-semibold uppercase tracking-wider mb-2">
                    Group Invite Code / ID
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. CHAMA-E7F92D"
                    value={joinInviteCode}
                    onChange={(e) => setJoinInviteCode(e.target.value)}
                    className="w-full bg-zinc-900/50 border border-zinc-850 px-4 py-3.5 rounded-xl text-sm text-center text-white focus:outline-none focus:border-emerald-500 font-mono tracking-wider uppercase"
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-black font-extrabold rounded-xl shadow-lg shadow-emerald-500/5 active:scale-95 transition-all text-sm mt-2"
                >
                  Verify & Join Group
                </button>
              </form>
            </div>
          )}

          {/* TAB 5: SAVINGS / GOALS */}
          {activeTab === "savings" && (
            <div className="flex flex-col gap-6 animate-fadeIn">
              <div>
                <h2 className="text-lg font-extrabold text-white">Personal Savings Goals</h2>
                <p className="text-zinc-400 text-xs mt-1">Establish milestones to track your progress and trigger reputation updates.</p>
              </div>
              <div className="p-8 bg-zinc-950/40 border border-zinc-900 rounded-3xl text-center text-zinc-500 text-xs max-w-md">
                💼 Personal savings goals module. Set targets to lock savings automatically from your PayLoop Wallet.
              </div>
            </div>
          )}

          {/* TAB 6: CONTRIBUTIONS */}
          {activeTab === "contributions" && (
            <div className="flex flex-col gap-6 max-w-md animate-fadeIn">
              <div>
                <h2 className="text-lg font-extrabold text-white">Submit Chama Contribution</h2>
                <p className="text-zinc-400 text-xs mt-1">Contribute to the group's pooled savings. Earn credit loop points for on-time payments.</p>
              </div>

              {selectedGroup ? (
                <form onSubmit={handleSubmitContribution} className="flex flex-col gap-4 bg-zinc-950/40 border border-zinc-900 p-6 rounded-3xl backdrop-blur-md">
                  <div className="p-4 bg-zinc-900/30 border border-zinc-900 rounded-2xl flex flex-col gap-2">
                    <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Group Target Policy</span>
                    <p className="text-xs text-zinc-300 font-semibold leading-relaxed">
                      This group requires a minimum contribution of <strong className="text-white">KES {selectedGroup.contribution_amount.toLocaleString()}</strong>, payable {selectedGroup.contribution_frequency.toLowerCase()}.
                    </p>
                  </div>

                  <div>
                    <label className="block text-zinc-400 text-xs font-semibold uppercase tracking-wider mb-2">
                      Contribution Amount (KES)
                    </label>
                    <input
                      type="number"
                      placeholder={`e.g. ${selectedGroup.contribution_amount}`}
                      value={contribAmount}
                      onChange={(e) => setContribAmount(e.target.value)}
                      className="w-full bg-zinc-900/50 border border-zinc-850 px-4 py-3 rounded-xl text-sm text-white focus:outline-none focus:border-emerald-500 font-mono"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-zinc-400 text-xs font-semibold uppercase tracking-wider mb-2">
                      Source Account
                    </label>
                    <select
                      value={contribPayMethod}
                      onChange={(e) => setContribPayMethod(e.target.value)}
                      className="w-full bg-zinc-900/50 border border-zinc-850 px-4 py-3 rounded-xl text-sm text-white focus:outline-none"
                    >
                      <option value="PayLoop Wallet">PayLoop Wallet (Balance: KES {user.balance?.toLocaleString()})</option>
                      <option value="M-Pesa">Direct M-Pesa push</option>
                    </select>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-black font-extrabold rounded-xl shadow-lg active:scale-95 transition-all text-sm mt-2"
                  >
                    Submit Contribution
                  </button>
                </form>
              ) : (
                <p className="text-zinc-500 text-xs italic">Please select or join a group first.</p>
              )}
            </div>
          )}

          {/* TAB 7: LOANS */}
          {activeTab === "loans" && (
            <div className="flex flex-col gap-6 animate-fadeIn">
              <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                <div>
                  <h2 className="text-lg font-extrabold text-white">Chama Micro-Lending Pool</h2>
                  <p className="text-zinc-400 text-xs mt-1">Borrow funds from the group. Requests are approved by peer- consensus voting.</p>
                </div>
              </div>

              {selectedGroup ? (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Request Loan Form */}
                  <div className="bg-zinc-950/60 border border-zinc-900 p-6 rounded-3xl backdrop-blur-md h-fit">
                    <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-4">Request a Loan</h3>
                    
                    <form onSubmit={handleRequestLoan} className="flex flex-col gap-4">
                      <div>
                        <label className="block text-zinc-400 text-[10px] font-bold uppercase tracking-wider mb-2">
                          Borrow Amount (KES)
                        </label>
                        <input
                          type="number"
                          placeholder="e.g. 5000"
                          value={loanAmount}
                          onChange={(e) => setLoanAmount(e.target.value)}
                          className="w-full bg-zinc-900/50 border border-zinc-850 px-4 py-3 rounded-xl text-sm text-white focus:outline-none font-mono"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-zinc-400 text-[10px] font-bold uppercase tracking-wider mb-2">
                          Repayment Duration (Months)
                        </label>
                        <select
                          value={loanDuration}
                          onChange={(e) => setLoanDuration(e.target.value)}
                          className="w-full bg-zinc-900/50 border border-zinc-850 px-4 py-3 rounded-xl text-xs text-white focus:outline-none"
                        >
                          <option value="1">1 Month</option>
                          <option value="3">3 Months</option>
                          <option value="6">6 Months</option>
                          <option value="12">12 Months</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-zinc-400 text-[10px] font-bold uppercase tracking-wider mb-2">
                          Purpose of Loan
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. Purchase agricultural inputs"
                          value={loanPurpose}
                          onChange={(e) => setLoanPurpose(e.target.value)}
                          className="w-full bg-zinc-900/50 border border-zinc-850 px-4 py-3 rounded-xl text-xs text-white focus:outline-none"
                          required
                        />
                      </div>

                      <div className="bg-zinc-900/30 p-3.5 rounded-xl border border-zinc-900 text-[10px] text-zinc-400 flex flex-col gap-1.5 mt-1">
                        <span className="font-bold text-zinc-300 uppercase">Dynamic Interest Rate Policy</span>
                        <p>Interest rate is calculated based on your current credit history reputation score:</p>
                        <ul className="list-disc list-inside mt-0.5 flex flex-col gap-0.5 font-mono text-[9px]">
                          <li>Score 900+ : <strong className="text-emerald-400">5.0% interest</strong></li>
                          <li>Score 750-899: <strong className="text-emerald-400">7.5% interest</strong></li>
                          <li>Score 600-749: <strong className="text-emerald-400">10% interest</strong></li>
                          <li>Score &lt; 600: <strong className="text-rose-400">12% interest</strong></li>
                        </ul>
                      </div>

                      <button
                        type="submit"
                        className="w-full py-3 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-black font-extrabold rounded-xl text-xs shadow-lg active:scale-95 transition-all mt-2"
                      >
                        Submit Request
                      </button>
                    </form>
                  </div>

                  {/* Active Requests List */}
                  <div className="bg-zinc-950/60 border border-zinc-900 p-6 rounded-3xl backdrop-blur-md lg:col-span-2 flex flex-col gap-4">
                    <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Active Group Loan Requests</h3>
                    
                    {groupLoans.length === 0 ? (
                      <p className="text-zinc-550 text-xs italic text-center py-12">No active loan requests in this group.</p>
                    ) : (
                      <div className="flex flex-col gap-4 divide-y divide-zinc-900">
                        {groupLoans.map((loan) => (
                          <div key={loan.id} className="pt-4 first:pt-0 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                            <div className="flex flex-col gap-1">
                              <div className="flex items-center gap-2">
                                <span className="text-[10px] px-2 py-0.5 bg-zinc-900 border border-zinc-800 text-zinc-400 rounded-full font-mono">
                                  Loan ID: #{loan.id.substring(0, 8)}
                                </span>
                                <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase ${
                                  loan.status === "Disbursed" ? "bg-emerald-500/10 text-emerald-400" :
                                  loan.status === "Repaid" ? "bg-indigo-500/10 text-indigo-400" : "bg-amber-500/10 text-amber-400"
                                }`}>
                                  {loan.status}
                                </span>
                              </div>
                              <h4 className="text-xs font-extrabold text-white mt-1">
                                Borrower: <span className="text-zinc-400 font-normal">{loan.borrower} ({loan.user_email})</span>
                              </h4>
                              <p className="text-zinc-500 text-[10px] italic">Purpose: "{loan.purpose}"</p>
                              <div className="flex gap-4 text-[10px] text-zinc-400 mt-1.5 font-semibold">
                                <span>Amount: <strong className="text-white">KES {parseFloat(loan.amount).toLocaleString()}</strong></span>
                                <span>Interest: <strong>{loan.interest_rate}%</strong></span>
                                <span>Consensus: <strong className="text-emerald-400">+{loan.votes_for} YES</strong> / <strong className="text-rose-400">-{loan.votes_against} NO</strong></span>
                              </div>
                            </div>

                            {/* Loan Action buttons based on status & user */}
                            <div className="flex items-center gap-2 shrink-0">
                              {loan.status === "Pending" && (
                                <>
                                  <button
                                    onClick={() => handleVoteOnLoan(loan.id, true)}
                                    className="px-2.5 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/10 rounded-lg text-[10px] font-bold transition-all"
                                  >
                                    Vote YES
                                  </button>
                                  <button
                                    onClick={() => handleVoteOnLoan(loan.id, false)}
                                    className="px-2.5 py-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/10 rounded-lg text-[10px] font-bold transition-all"
                                  >
                                    Vote NO
                                  </button>
                                </>
                              )}

                              {loan.status === "Disbursed" && loan.user_email === user.email && (
                                <button
                                  onClick={() => {
                                    const totalDue = parseFloat(loan.amount) * (1 + parseFloat(loan.interest_rate) / 100);
                                    handleRepayLoan(loan.id, totalDue);
                                  }}
                                  className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-lg text-[10px]"
                                >
                                  Repay KES {((parseFloat(loan.amount) * (1 + parseFloat(loan.interest_rate) / 100))).toLocaleString()}
                                </button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <p className="text-zinc-500 text-xs italic">Please select or join a group first.</p>
              )}
            </div>
          )}

          {/* TAB 8: WALLET */}
          {activeTab === "wallet" && (
            <div className="flex flex-col gap-6 animate-fadeIn">
              <div>
                <h2 className="text-lg font-extrabold text-white">Your Wallets & Connected Accounts</h2>
                <p className="text-zinc-400 text-xs mt-1">Move funds between your internal wallet, bank accounts, mobile money, and Web3 accounts.</p>
              </div>

              {/* Wallet balances grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {wallets.map((w) => (
                  <div key={w.id} className="bg-zinc-950/80 border border-zinc-900 p-5 rounded-3xl relative overflow-hidden flex flex-col justify-between min-h-[120px]">
                    <div className="flex justify-between items-start">
                      <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">{w.wallet_type}</span>
                      <span className="text-[9px] px-2 py-0.5 bg-zinc-900 border border-zinc-850 rounded-full font-mono text-zinc-400">
                        {w.wallet_address ? `${w.wallet_address.substring(0, 6)}...` : "Internal"}
                      </span>
                    </div>
                    
                    <div className="mt-3">
                      {w.wallet_type === "MetaMask" ? (
                        <p className="text-xl font-bold text-white font-mono">{w.balance} ETH</p>
                      ) : (
                        <p className="text-2xl font-extrabold text-white">KES {w.balance.toLocaleString()}</p>
                      )}
                      {w.wallet_type === "PayLoop Wallet" && (
                        <span className="text-[9px] text-zinc-500 block mt-1">Savings Pool: KES {w.savings.toLocaleString()}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Link New Wallet Form */}
              <div className="bg-zinc-950/40 border border-zinc-900 p-6 rounded-3xl max-w-md mt-2">
                <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-4">🔗 Connect External Account</h3>
                <form onSubmit={handleConnectExternalWallet} className="flex flex-col gap-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-zinc-400 text-[10px] font-bold uppercase tracking-wider mb-2">Account Type</label>
                      <select
                        value={connectWalletType}
                        onChange={(e) => setConnectWalletType(e.target.value)}
                        className="w-full bg-zinc-900/50 border border-zinc-850 px-3 py-2.5 rounded-xl text-xs text-white focus:outline-none"
                      >
                        <option value="M-Pesa">M-Pesa Mobile Money</option>
                        <option value="Equity Bank">Equity Bank</option>
                        <option value="KCB">KCB Bank</option>
                        <option value="MetaMask">MetaMask (Web3)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-zinc-400 text-[10px] font-bold uppercase tracking-wider mb-2">Account ID / Address</label>
                      <input
                        type="text"
                        placeholder="e.g. phone/address/acc"
                        value={connectWalletAddr}
                        onChange={(e) => setConnectWalletAddr(e.target.value)}
                        className="w-full bg-zinc-900/50 border border-zinc-850 px-3 py-2.5 rounded-xl text-xs text-white focus:outline-none font-mono"
                        required
                      />
                    </div>
                  </div>
                  <button
                    type="submit"
                    className="w-full py-3 bg-zinc-900 border border-zinc-800 hover:bg-zinc-850 text-zinc-300 font-bold rounded-xl text-xs active:scale-95 transition-all"
                  >
                    Link Wallet
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* TAB 9: DEPOSIT */}
          {activeTab === "deposit" && (
            <div className="flex flex-col gap-6 max-w-md animate-fadeIn">
              <div>
                <h2 className="text-lg font-extrabold text-white">Deposit Funds to PayLoop Wallet</h2>
                <p className="text-zinc-400 text-xs mt-1">Fund your wallet using mobile money or bank transfers.</p>
              </div>

              <form onSubmit={handleDepositWallet} className="flex flex-col gap-4 bg-zinc-950/40 border border-zinc-900 p-6 rounded-3xl backdrop-blur-md">
                <div>
                  <label className="block text-zinc-400 text-xs font-semibold uppercase tracking-wider mb-2">
                    Deposit Amount (KES)
                  </label>
                  <input
                    type="number"
                    placeholder="e.g. 2500"
                    value={depositAmount}
                    onChange={(e) => setDepositAmount(e.target.value)}
                    className="w-full bg-zinc-900/50 border border-zinc-850 px-4 py-3.5 rounded-xl text-sm text-white focus:outline-none focus:border-emerald-500 font-mono"
                    required
                  />
                </div>

                <div>
                  <label className="block text-zinc-400 text-xs font-semibold uppercase tracking-wider mb-2">
                    Payment Channel
                  </label>
                  <select
                    value={depositMethod}
                    onChange={(e) => setDepositMethod(e.target.value)}
                    className="w-full bg-zinc-900/50 border border-zinc-850 px-4 py-3 rounded-xl text-sm text-white focus:outline-none"
                  >
                    <option value="M-Pesa">M-Pesa Mobile Money</option>
                    <option value="Equity Bank">Equity Bank Transfer</option>
                  </select>
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-black font-extrabold rounded-xl shadow-lg active:scale-95 transition-all text-sm mt-2"
                >
                  Initiate Deposit Request
                </button>
              </form>
            </div>
          )}

          {/* TAB 10: WITHDRAW */}
          {activeTab === "withdraw" && (
            <div className="flex flex-col gap-6 max-w-md animate-fadeIn">
              <div>
                <h2 className="text-lg font-extrabold text-white">Withdraw Balance</h2>
                <p className="text-zinc-400 text-xs mt-1">Withdraw funds directly to your mobile money or linked bank account.</p>
              </div>

              <form onSubmit={handleWithdrawWallet} className="flex flex-col gap-4 bg-zinc-950/40 border border-zinc-900 p-6 rounded-3xl backdrop-blur-md">
                <div>
                  <label className="block text-zinc-400 text-xs font-semibold uppercase tracking-wider mb-2">
                    Withdrawal Amount (KES)
                  </label>
                  <input
                    type="number"
                    placeholder="e.g. 1000"
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(e.target.value)}
                    className="w-full bg-zinc-900/50 border border-zinc-850 px-4 py-3.5 rounded-xl text-sm text-white focus:outline-none focus:border-emerald-500 font-mono"
                    required
                  />
                </div>

                <div>
                  <label className="block text-zinc-400 text-xs font-semibold uppercase tracking-wider mb-2">
                    Withdrawal Destination
                  </label>
                  <select
                    value={withdrawMethod}
                    onChange={(e) => setWithdrawMethod(e.target.value)}
                    className="w-full bg-zinc-900/50 border border-zinc-850 px-4 py-3 rounded-xl text-sm text-white focus:outline-none"
                  >
                    <option value="M-Pesa">M-Pesa Mobile money</option>
                    <option value="Equity Bank">Linked Equity Bank Account</option>
                  </select>
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-black font-extrabold rounded-xl shadow-lg active:scale-95 transition-all text-sm mt-2"
                >
                  Process Withdrawal
                </button>
              </form>
            </div>
          )}

          {/* TAB 11: TRANSFER */}
          {activeTab === "transfer" && (
            <div className="flex flex-col gap-6 max-w-md animate-fadeIn">
              <div>
                <h2 className="text-lg font-extrabold text-white">Internal Wallet Transfer</h2>
                <p className="text-zinc-400 text-xs mt-1">Move funds instantly between your connected accounts (e.g. M-Pesa to PayLoop Wallet).</p>
              </div>

              <form onSubmit={handleTransferWallet} className="flex flex-col gap-4 bg-zinc-950/40 border border-zinc-900 p-6 rounded-3xl backdrop-blur-md">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-zinc-400 text-xs font-semibold uppercase tracking-wider mb-2">Source Wallet</label>
                    <select
                      value={transferFrom}
                      onChange={(e) => setTransferFrom(e.target.value)}
                      className="w-full bg-zinc-900/50 border border-zinc-850 px-3 py-2.5 rounded-xl text-xs text-white focus:outline-none"
                    >
                      <option value="M-Pesa">M-Pesa</option>
                      <option value="PayLoop Wallet">PayLoop Wallet</option>
                      <option value="Equity Bank">Equity Bank</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-zinc-400 text-xs font-semibold uppercase tracking-wider mb-2">Target Wallet</label>
                    <select
                      value={transferTo}
                      onChange={(e) => setTransferTo(e.target.value)}
                      className="w-full bg-zinc-900/50 border border-zinc-850 px-3 py-2.5 rounded-xl text-xs text-white focus:outline-none"
                    >
                      <option value="PayLoop Wallet">PayLoop Wallet</option>
                      <option value="M-Pesa">M-Pesa</option>
                      <option value="Equity Bank">Equity Bank</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-zinc-400 text-xs font-semibold uppercase tracking-wider mb-2">
                    Transfer Amount (KES)
                  </label>
                  <input
                    type="number"
                    placeholder="e.g. 500"
                    value={transferAmount}
                    onChange={(e) => setTransferAmount(e.target.value)}
                    className="w-full bg-zinc-900/50 border border-zinc-850 px-4 py-3 rounded-xl text-sm text-white focus:outline-none focus:border-emerald-500 font-mono"
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-black font-extrabold rounded-xl shadow-lg active:scale-95 transition-all text-sm mt-2"
                >
                  Execute Transfer
                </button>
              </form>
            </div>
          )}

          {/* TAB 12: TRANSACTIONS */}
          {activeTab === "transactions" && (
            <div className="flex flex-col gap-6 animate-fadeIn">
              <div>
                <h2 className="text-lg font-extrabold text-white">Transactions History</h2>
                <p className="text-zinc-400 text-xs mt-1">Audit log of all deposits, transfers, contributions, and repayments.</p>
              </div>

              {selectedGroup ? (
                <div className="bg-zinc-950/60 border border-zinc-900 rounded-3xl overflow-hidden backdrop-blur-md">
                  {groupContributions.length === 0 ? (
                    <div className="p-12 text-center text-zinc-500 text-xs">No transactions logged under this group.</div>
                  ) : (
                    <div className="divide-y divide-zinc-900">
                      {groupContributions.map((tx) => (
                        <div key={tx.id} className="p-4 flex items-center justify-between hover:bg-zinc-900/10 transition-colors">
                          <div className="flex items-center gap-3">
                            <span className={`w-8 h-8 rounded-xl flex items-center justify-center text-sm ${
                              tx.type === "Contribution" ? "bg-emerald-500/10 text-emerald-400" :
                              tx.type === "Deposit" ? "bg-teal-500/10 text-teal-400" : "bg-rose-500/10 text-rose-400"
                            }`}>
                              {tx.type === "Contribution" ? "💰" : tx.type === "Deposit" ? "📥" : "📤"}
                            </span>
                            <div>
                              <h4 className="text-xs font-bold text-white">{tx.type} to Group</h4>
                              <span className="text-[10px] text-zinc-500 font-mono mt-0.5 block">{tx.reference} • {tx.payment_method}</span>
                            </div>
                          </div>
                          
                          <div className="text-right">
                            <span className={`text-xs font-bold font-mono ${tx.amount > 0 ? "text-emerald-400" : "text-zinc-200"}`}>
                              {tx.amount > 0 ? "+" : ""}{tx.amount.toLocaleString()} KES
                            </span>
                            <span className="text-[10px] text-zinc-500 font-mono block mt-0.5">{tx.date}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-zinc-500 text-xs italic">Select a group to load transactions.</p>
              )}
            </div>
          )}

          {/* TAB 13: GROUP MEMBERS LIST */}
          {activeTab === "members" && (
            <div className="flex flex-col gap-6 animate-fadeIn">
              <div>
                <h2 className="text-lg font-extrabold text-white">Chama Whitelist Members</h2>
                <p className="text-zinc-400 text-xs mt-1">Review active members and credit scores within this group.</p>
              </div>

              {selectedGroup ? (
                <div className="bg-zinc-950/60 border border-zinc-900 rounded-3xl overflow-hidden backdrop-blur-md">
                  <div className="divide-y divide-zinc-900">
                    {groupMembers.map((m) => (
                      <div key={m.email} className="p-4.5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:bg-zinc-900/10 transition-colors">
                        <div className="flex items-center gap-3">
                          <span className="w-10 h-10 rounded-xl bg-zinc-900 border border-zinc-850 flex items-center justify-center text-lg">
                            {m.avatar || "👤"}
                          </span>
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="text-xs font-bold text-white leading-none">{m.name}</h4>
                              <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase ${
                                m.role === "Admin" ? "bg-teal-500/10 text-teal-400" : "bg-zinc-900 text-zinc-400"
                              }`}>
                                {m.role}
                              </span>
                            </div>
                            <span className="text-[10px] text-zinc-500 font-mono mt-1 block">{m.handle} • {m.email}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-6 text-right w-full sm:w-auto justify-between sm:justify-end">
                          <div className="text-left sm:text-right">
                            <span className="text-[9px] text-zinc-500 uppercase font-bold block">Chama Savings</span>
                            <span className="text-xs font-bold text-white font-mono">KES {m.member_savings.toLocaleString()}</span>
                          </div>
                          
                          <div className="text-left sm:text-right">
                            <span className="text-[9px] text-zinc-500 uppercase font-bold block">Credit Score</span>
                            <span className="text-xs font-bold text-teal-400 font-mono">{m.credit_score}/1000</span>
                          </div>

                          {/* Render admin promote/remove features ONLY if logged-in user is Admin of group */}
                          {userRole === "Admin" && m.email !== user.email && (
                            <div className="flex gap-2">
                              {m.role !== "Admin" && (
                                <button
                                  onClick={() => handlePromoteMember(m.email)}
                                  className="px-2.5 py-1.5 bg-teal-500/10 hover:bg-teal-500/20 text-teal-400 border border-teal-500/10 rounded-lg text-[10px] font-bold"
                                >
                                  Make Admin
                                </button>
                              )}
                              <button
                                onClick={() => handleRemoveMember(m.email)}
                                className="px-2.5 py-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/10 rounded-lg text-[10px] font-bold"
                              >
                                Remove
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <p className="text-zinc-500 text-xs italic">Select a group to load members.</p>
              )}
            </div>
          )}

          {/* TAB 14: ANNOUNCEMENTS PUBLISH (Available to Admin) */}
          {activeTab === "announcements" && (
            <div className="flex flex-col gap-6 animate-fadeIn">
              <div>
                <h2 className="text-lg font-extrabold text-white">Chama Announcements</h2>
                <p className="text-zinc-400 text-xs mt-1">Announcements, updates, and alerts published by group administrators.</p>
              </div>

              {selectedGroup ? (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Create Announcement Form - Visible only if User is Admin */}
                  {userRole === "Admin" ? (
                    <div className="bg-zinc-950/60 border border-zinc-900 p-6 rounded-3xl backdrop-blur-md h-fit">
                      <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-4">New Announcement</h3>
                      <form onSubmit={handlePublishAnnouncement} className="flex flex-col gap-4">
                        <div>
                          <label className="block text-zinc-400 text-[10px] font-bold uppercase tracking-wider mb-2">Title</label>
                          <input
                            type="text"
                            placeholder="e.g. Next Meeting Notice"
                            value={annTitle}
                            onChange={(e) => setAnnTitle(e.target.value)}
                            className="w-full bg-zinc-900/50 border border-zinc-850 px-4 py-3 rounded-xl text-xs text-white focus:outline-none"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-zinc-400 text-[10px] font-bold uppercase tracking-wider mb-2">Content</label>
                          <textarea
                            placeholder="Enter announcement details..."
                            rows="4"
                            value={annContent}
                            onChange={(e) => setAnnContent(e.target.value)}
                            className="w-full bg-zinc-900/50 border border-zinc-850 px-4 py-3 rounded-xl text-xs text-white focus:outline-none"
                            required
                          />
                        </div>
                        <button
                          type="submit"
                          className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold rounded-xl text-xs shadow-lg active:scale-95 transition-all mt-2"
                        >
                          Publish Announcement
                        </button>
                      </form>
                    </div>
                  ) : (
                    <div className="bg-zinc-950/40 border border-zinc-900/80 p-5 rounded-3xl h-fit">
                      <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Announcement Policy</span>
                      <p className="text-xs text-zinc-400 mt-2 leading-relaxed">
                        Announcements can only be published by group administrators (admins/treasurers). Please contact your administrator if you have updates to post.
                      </p>
                    </div>
                  )}

                  {/* List of Announcements */}
                  <div className="bg-zinc-950/60 border border-zinc-900 p-6 rounded-3xl backdrop-blur-md lg:col-span-2 flex flex-col gap-4">
                    <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Recent Group Updates</h3>
                    {groupDashboardData?.announcements?.length === 0 ? (
                      <p className="text-zinc-550 text-xs italic text-center py-12">No announcements published in this group.</p>
                    ) : (
                      <div className="flex flex-col gap-3">
                        {groupDashboardData?.announcements?.map((a) => (
                          <div key={a.id} className="p-4 bg-zinc-900/20 border border-zinc-900 rounded-2xl flex flex-col gap-2">
                            <div className="flex justify-between items-center">
                              <h4 className="text-xs font-extrabold text-white">{a.title}</h4>
                              <span className="text-[9px] text-zinc-500 font-mono">{new Date(a.created_at).toLocaleDateString()}</span>
                            </div>
                            <p className="text-zinc-400 text-xs leading-relaxed">{a.content}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <p className="text-zinc-500 text-xs italic">Select a group first.</p>
              )}
            </div>
          )}

          {/* TAB 15: MY PROFILE DETAILS */}
          {activeTab === "profile" && (
            <div className="flex flex-col gap-6 max-w-xl animate-fadeIn">
              <div>
                <h2 className="text-lg font-extrabold text-white">Your PayLoop Profile</h2>
                <p className="text-zinc-400 text-xs mt-1">Review and manage your KYC documentation, bio, and personal details.</p>
              </div>

              <div className="bg-zinc-950/40 border border-zinc-900 p-6 rounded-3xl flex flex-col gap-5 backdrop-blur-md">
                <div className="flex items-center gap-4 border-b border-zinc-900 pb-5">
                  <span className="w-16 h-16 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-3xl">
                    {user.avatar || "👤"}
                  </span>
                  <div>
                    <h3 className="text-base font-extrabold text-white">{user.name}</h3>
                    <span className="text-xs text-zinc-400 font-mono block mt-0.5">{user.handle} • {user.user_id_code}</span>
                    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-md text-[9px] font-bold uppercase mt-2">
                      Level: {user.verification_level}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="text-zinc-500 font-semibold uppercase text-[9px] tracking-wider block">Email Address</span>
                    <span className="text-zinc-200 font-mono block mt-1">{user.email}</span>
                  </div>
                  <div>
                    <span className="text-zinc-500 font-semibold uppercase text-[9px] tracking-wider block">Phone Number</span>
                    <span className="text-zinc-200 font-mono block mt-1">{user.phone}</span>
                  </div>
                  <div>
                    <span className="text-zinc-500 font-semibold uppercase text-[9px] tracking-wider block">Gender</span>
                    <span className="text-zinc-200 block mt-1">{user.gender || "Not Specified"}</span>
                  </div>
                  <div>
                    <span className="text-zinc-500 font-semibold uppercase text-[9px] tracking-wider block">Date of Birth</span>
                    <span className="text-zinc-200 block mt-1 font-mono">{user.dob || "Not Specified"}</span>
                  </div>
                  {user.county && (
                    <div>
                      <span className="text-zinc-500 font-semibold uppercase text-[9px] tracking-wider block">County</span>
                      <span className="text-zinc-200 block mt-1">{user.county}</span>
                    </div>
                  )}
                  {user.occupation && (
                    <div>
                      <span className="text-zinc-500 font-semibold uppercase text-[9px] tracking-wider block">Occupation</span>
                      <span className="text-zinc-200 block mt-1">{user.occupation}</span>
                    </div>
                  )}
                </div>

                {user.bio && (
                  <div className="border-t border-zinc-900 pt-4 text-xs">
                    <span className="text-zinc-500 font-semibold uppercase text-[9px] tracking-wider block mb-1">Biography</span>
                    <p className="text-zinc-400 leading-relaxed italic">"{user.bio}"</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
