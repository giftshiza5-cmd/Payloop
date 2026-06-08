import Head from "next/head";
import Link from "next/link";
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
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";

export default function Dashboard() {
  const { address, isConnected } = useAccount();
  const { data: walletClient } = useWalletClient();
  const publicClient = usePublicClient();
  const { writeContractAsync } = useWriteContract();

  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");

  // Contract Addresses (stored in LocalStorage for sandbox persistence)
  const [vaultAddress, setVaultAddress] = useState("");
  const [lendingAddress, setLendingAddress] = useState("");
  const [scoreAddress, setScoreAddress] = useState("");
  const [tokenAddress, setTokenAddress] = useState("");

  // Input states for Deployment Wizard
  const [circleName, setCircleName] = useState("Nairobi Entrepreneurs");
  const [minContribution, setMinContribution] = useState("0.1"); // in MATIC/ETH
  const [cycleDurationOption, setCycleDurationOption] = useState("3600"); // default 1 hour in seconds
  const [adminAddressesText, setAdminAddressesText] = useState("");
  const [requiredApprovalsCount, setRequiredApprovalsCount] = useState("1");
  const [isDeploying, setIsDeploying] = useState(false);

  // Input states for Admin management
  const [newMemberAddress, setNewMemberAddress] = useState("");
  const [isAddingMember, setIsAddingMember] = useState(false);
  const [withdrawRecipient, setWithdrawRecipient] = useState("");
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [withdrawReason, setWithdrawReason] = useState("");
  const [isProposingWithdraw, setIsProposingWithdraw] = useState(false);

  // Input states for Lending
  const [loanAmount, setLoanAmount] = useState("");
  const [loanDuration, setLoanDuration] = useState("86400"); // 1 day in seconds
  const [isRequestingLoan, setIsRequestingLoan] = useState(false);

  // Save/Contribution states
  const [contributionAmountInput, setContributionAmountInput] = useState("0.1");
  const [isContributing, setIsContributing] = useState(false);

  // Load contract addresses from local storage on mount
  useEffect(() => {
    setMounted(true);
    setVaultAddress(localStorage.getItem("payloop_vault") || "");
    setLendingAddress(localStorage.getItem("payloop_lending") || "");
    setScoreAddress(localStorage.getItem("payloop_score") || "");
    setTokenAddress(localStorage.getItem("payloop_token") || "");
    if (address) {
      setAdminAddressesText(address);
    }
  }, [address]);

  // Persist address changes
  const saveAddresses = (vault, lending, score, token) => {
    setVaultAddress(vault);
    setLendingAddress(lending);
    setScoreAddress(score);
    setTokenAddress(token);
    localStorage.setItem("payloop_vault", vault);
    localStorage.setItem("payloop_lending", lending);
    localStorage.setItem("payloop_score", score);
    localStorage.setItem("payloop_token", token);
  };

  const clearAddresses = () => {
    saveAddresses("", "", "", "");
  };

  // ----------------------------------------------------
  // READ CONTRACT HOOKS
  // ----------------------------------------------------

  // CircleVault Reads
  const { data: circleNameOnChain } = useReadContract({
    abi: CircleVaultArtifact.abi,
    address: vaultAddress || undefined,
    functionName: "name",
  });

  const { data: contributionAmountOnChain } = useReadContract({
    abi: CircleVaultArtifact.abi,
    address: vaultAddress || undefined,
    functionName: "contributionAmount",
  });

  const { data: currentCycleIdOnChain } = useReadContract({
    abi: CircleVaultArtifact.abi,
    address: vaultAddress || undefined,
    functionName: "currentCycleId",
  });

  const { data: nextDeadlineOnChain } = useReadContract({
    abi: CircleVaultArtifact.abi,
    address: vaultAddress || undefined,
    functionName: "nextDeadline",
  });

  const { data: membersOnChain } = useReadContract({
    abi: CircleVaultArtifact.abi,
    address: vaultAddress || undefined,
    functionName: "getMembers",
  });

  // CreditScore Reads
  const { data: userCreditScore } = useReadContract({
    abi: CreditScoreArtifact.abi,
    address: scoreAddress || undefined,
    functionName: "getCreditScore",
    args: address ? [address] : undefined,
  });

  // LoopToken Reads
  const { data: userLoopPointsBalance } = useReadContract({
    abi: LoopTokenArtifact.abi,
    address: tokenAddress || undefined,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
  });

  // LendingPool Reads
  const { data: loansCount } = useReadContract({
    abi: LendingPoolArtifact.abi,
    address: lendingAddress || undefined,
    functionName: "getLoansCount",
  });

  // Fetch all loans dynamically
  const [loansList, setLoansList] = useState([]);
  useEffect(() => {
    async function fetchLoans() {
      if (!lendingAddress || !loansCount) return;
      const count = Number(loansCount);
      const loans = [];
      for (let i = 0; i < count; i++) {
        try {
          const loan = await publicClient.readContract({
            address: lendingAddress,
            abi: LendingPoolArtifact.abi,
            functionName: "loans",
            args: [BigInt(i)],
          });
          loans.push({
            id: i,
            borrower: loan[1],
            amount: formatEther(loan[2]),
            interestRate: Number(loan[3]) / 100, // Basis points to percentage
            duration: Number(loan[4]),
            repaymentDeadline: Number(loan[5]),
            votesFor: Number(loan[6]),
            votesAgainst: Number(loan[7]),
            active: loan[8],
            approved: loan[9],
            repaid: loan[10],
          });
        } catch (e) {
          console.error("Error fetching loan", i, e);
        }
      }
      setLoansList(loans);
    }
    fetchLoans();
  }, [lendingAddress, loansCount, activeTab]);

  // Fetch vault balance
  const [vaultBalance, setVaultBalance] = useState("0");
  useEffect(() => {
    async function fetchBalance() {
      if (!vaultAddress) return;
      try {
        const balance = await publicClient.getBalance({ address: vaultAddress });
        setVaultBalance(formatEther(balance));
      } catch (e) {
        console.error(e);
      }
    }
    fetchBalance();
  }, [vaultAddress, activeTab]);

  // ----------------------------------------------------
  // WRITE CONTRACT METHODS
  // ----------------------------------------------------

  // Deploy Contract Wizard (deploys CreditScore, LoopToken, CircleVault, and LendingPool)
  const handleFullSetup = async () => {
    if (!walletClient) {
      alert("Please connect your MetaMask wallet first!");
      return;
    }
    try {
      setIsDeploying(true);
      console.log("Starting deployment flow...");

      // 1. Deploy CreditScore
      const scoreHash = await walletClient.deployContract({
        abi: CreditScoreArtifact.abi,
        bytecode: CreditScoreArtifact.bytecode,
      });
      const scoreReceipt = await publicClient.waitForTransactionReceipt({ hash: scoreHash });
      const scoreAddr = scoreReceipt.contractAddress;
      console.log("Deployed CreditScore to:", scoreAddr);

      // 2. Deploy LoopToken
      const tokenHash = await walletClient.deployContract({
        abi: LoopTokenArtifact.abi,
        bytecode: LoopTokenArtifact.bytecode,
      });
      const tokenReceipt = await publicClient.waitForTransactionReceipt({ hash: tokenHash });
      const tokenAddr = tokenReceipt.contractAddress;
      console.log("Deployed LoopToken to:", tokenAddr);

      // 3. Deploy CircleVault
      const contributionWei = parseEther(minContribution);
      const cycleDurationSec = BigInt(cycleDurationOption);
      const adminsList = adminAddressesText.split(",").map(a => a.trim());
      const approvalsThreshold = BigInt(requiredApprovalsCount);

      const vaultHash = await walletClient.deployContract({
        abi: CircleVaultArtifact.abi,
        bytecode: CircleVaultArtifact.bytecode,
        args: [
          circleName,
          contributionWei,
          cycleDurationSec,
          adminsList,
          approvalsThreshold
        ],
      });
      const vaultReceipt = await publicClient.waitForTransactionReceipt({ hash: vaultHash });
      const vaultAddr = vaultReceipt.contractAddress;
      console.log("Deployed CircleVault to:", vaultAddr);

      // 4. Deploy LendingPool
      const lendingHash = await walletClient.deployContract({
        abi: LendingPoolArtifact.abi,
        bytecode: LendingPoolArtifact.bytecode,
        args: [vaultAddr, scoreAddr],
      });
      const lendingReceipt = await publicClient.waitForTransactionReceipt({ hash: lendingHash });
      const lendingAddr = lendingReceipt.contractAddress;
      console.log("Deployed LendingPool to:", lendingAddr);

      // Save to state/LocalStorage
      saveAddresses(vaultAddr, lendingAddr, scoreAddr, tokenAddr);

      // 5. Wire dependencies (Post-deployment auth setup)
      console.log("Configuring on-chain authorizations...");
      
      // Authorize CircleVault and LendingPool on CreditScore
      await writeContractAsync({
        address: scoreAddr,
        abi: CreditScoreArtifact.abi,
        functionName: "setAuthorizedCaller",
        args: [vaultAddr, true],
      });
      await writeContractAsync({
        address: scoreAddr,
        abi: CreditScoreArtifact.abi,
        functionName: "setAuthorizedCaller",
        args: [lendingAddr, true],
      });

      // Authorize CircleVault to mint LoopTokens
      await writeContractAsync({
        address: tokenAddr,
        abi: LoopTokenArtifact.abi,
        functionName: "setMinter",
        args: [vaultAddr, true],
      });

      // Set references on CircleVault
      await writeContractAsync({
        address: vaultAddr,
        abi: CircleVaultArtifact.abi,
        functionName: "setLendingPool",
        args: [lendingAddr],
      });
      await writeContractAsync({
        address: vaultAddr,
        abi: CircleVaultArtifact.abi,
        functionName: "setCreditScore",
        args: [scoreAddr],
      });
      await writeContractAsync({
        address: vaultAddr,
        abi: CircleVaultArtifact.abi,
        functionName: "setLoopToken",
        args: [tokenAddr],
      });

      console.log("All systems wired successfully!");
      alert("Savings Circle & Contracts Deployed and Configured Successfully!");
      setIsDeploying(false);
      setActiveTab("overview");
    } catch (e) {
      console.error("Deployment failed", e);
      alert(`Deployment failed: ${e.message || e}`);
      setIsDeploying(false);
    }
  };

  // Contribute to Savings Circle
  const handleContribute = async () => {
    if (!vaultAddress) return;
    try {
      setIsContributing(true);
      const tx = await writeContractAsync({
        address: vaultAddress,
        abi: CircleVaultArtifact.abi,
        functionName: "contribute",
        value: parseEther(contributionAmountInput),
      });
      await publicClient.waitForTransactionReceipt({ hash: tx });
      alert("Contribution recorded successfully!");
      setIsContributing(false);
      // Refresh balance
      const balance = await publicClient.getBalance({ address: vaultAddress });
      setVaultBalance(formatEther(balance));
    } catch (e) {
      console.error(e);
      alert(`Contribution failed: ${e.message || e}`);
      setIsContributing(false);
    }
  };

  // Add Member
  const handleAddMember = async () => {
    if (!vaultAddress || !newMemberAddress) return;
    try {
      setIsAddingMember(true);
      const tx = await writeContractAsync({
        address: vaultAddress,
        abi: CircleVaultArtifact.abi,
        functionName: "addMember",
        args: [newMemberAddress],
      });
      await publicClient.waitForTransactionReceipt({ hash: tx });
      alert("Member added successfully!");
      setNewMemberAddress("");
      setIsAddingMember(false);
    } catch (e) {
      console.error(e);
      alert(`Failed to add member: ${e.message || e}`);
      setIsAddingMember(false);
    }
  };

  // Request Loan
  const handleRequestLoan = async () => {
    if (!lendingAddress) return;
    try {
      setIsRequestingLoan(true);
      const tx = await writeContractAsync({
        address: lendingAddress,
        abi: LendingPoolArtifact.abi,
        functionName: "requestLoan",
        args: [parseEther(loanAmount), BigInt(loanDuration)],
      });
      await publicClient.waitForTransactionReceipt({ hash: tx });
      alert("Loan request submitted successfully!");
      setLoanAmount("");
      setIsRequestingLoan(false);
    } catch (e) {
      console.error(e);
      alert(`Failed to request loan: ${e.message || e}`);
      setIsRequestingLoan(false);
    }
  };

  // Vote on Loan
  const handleVoteOnLoan = async (loanId, support) => {
    if (!lendingAddress) return;
    try {
      const tx = await writeContractAsync({
        address: lendingAddress,
        abi: LendingPoolArtifact.abi,
        functionName: "voteOnLoan",
        args: [BigInt(loanId), support],
      });
      await publicClient.waitForTransactionReceipt({ hash: tx });
      alert("Vote recorded!");
    } catch (e) {
      console.error(e);
      alert(`Failed to vote: ${e.message || e}`);
    }
  };

  // Disburse Loan
  const handleDisburseLoan = async (loanId) => {
    if (!lendingAddress) return;
    try {
      const tx = await writeContractAsync({
        address: lendingAddress,
        abi: LendingPoolArtifact.abi,
        functionName: "disburseLoan",
        args: [BigInt(loanId)],
      });
      await publicClient.waitForTransactionReceipt({ hash: tx });
      alert("Loan disbursed to borrower!");
    } catch (e) {
      console.error(e);
      alert(`Failed to disburse: ${e.message || e}`);
    }
  };

  // Repay Loan
  const handleRepayLoan = async (loanId, amount) => {
    if (!lendingAddress) return;
    try {
      const tx = await writeContractAsync({
        address: lendingAddress,
        abi: LendingPoolArtifact.abi,
        functionName: "repayLoan",
        args: [BigInt(loanId)],
        value: parseEther(amount),
      });
      await publicClient.waitForTransactionReceipt({ hash: tx });
      alert("Loan repaid successfully!");
    } catch (e) {
      console.error(e);
      alert(`Repayment failed: ${e.message || e}`);
    }
  };

  // Propose Admin Withdrawal
  const handleProposeWithdraw = async () => {
    if (!vaultAddress) return;
    try {
      setIsProposingWithdraw(true);
      const tx = await writeContractAsync({
        address: vaultAddress,
        abi: CircleVaultArtifact.abi,
        functionName: "proposeWithdrawal",
        args: [
          withdrawRecipient,
          parseEther(withdrawAmount),
          withdrawReason
        ],
      });
      await publicClient.waitForTransactionReceipt({ hash: tx });
      alert("Withdrawal proposal submitted!");
      setWithdrawRecipient("");
      setWithdrawAmount("");
      setWithdrawReason("");
      setIsProposingWithdraw(false);
    } catch (e) {
      console.error(e);
      alert(`Failed to propose withdrawal: ${e.message || e}`);
      setIsProposingWithdraw(false);
    }
  };

  if (!mounted) return null;

  // Mock savings growth history for chart rendering
  const chartData = [
    { name: "Cycle 1", Savings: 0.2 },
    { name: "Cycle 2", Savings: 0.5 },
    { name: "Cycle 3", Savings: 0.9 },
    { name: "Cycle 4", Savings: 1.4 },
    { name: "Cycle 5", Savings: parseFloat(vaultBalance) || 1.4 },
  ];

  return (
    <div className="min-h-screen bg-[#070708] text-zinc-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-black relative">
      <Head>
        <title>PayLoop — Admin Dashboard</title>
      </Head>

      {/* Header */}
      <header className="w-full bg-zinc-950/80 border-b border-zinc-900 backdrop-blur-md px-8 py-4 flex items-center justify-between z-10 sticky top-0">
        <div className="flex items-center gap-2">
          <Link href="/" className="text-xl font-bold tracking-tight bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent flex items-center gap-2">
            <span>💸</span> PayLoop
          </Link>
          <span className="text-xs px-2.5 py-0.5 bg-zinc-900 text-zinc-400 border border-zinc-800 rounded-full font-mono">
            Admin Dashboard
          </span>
        </div>
        <div className="flex items-center gap-4">
          <ConnectButton />
        </div>
      </header>

      {/* Main Layout */}
      <div className="flex-grow flex flex-col lg:flex-row max-w-7xl mx-auto w-full px-6 py-8 gap-8">
        {/* Sidebar */}
        <aside className="w-full lg:w-64 shrink-0 flex flex-col gap-2">
          <button
            onClick={() => setActiveTab("overview")}
            className={`w-full text-left px-4 py-3 rounded-xl font-medium transition-colors flex items-center gap-3 ${
              activeTab === "overview"
                ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-400"
                : "bg-zinc-950/40 border border-zinc-900 hover:border-zinc-800 text-zinc-400 hover:text-zinc-200"
            }`}
          >
            📊 Group Overview
          </button>
          <button
            onClick={() => setActiveTab("contribute")}
            className={`w-full text-left px-4 py-3 rounded-xl font-medium transition-colors flex items-center gap-3 ${
              activeTab === "contribute"
                ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-400"
                : "bg-zinc-950/40 border border-zinc-900 hover:border-zinc-800 text-zinc-400 hover:text-zinc-200"
            }`}
          >
            💰 Save & Rewards
          </button>
          <button
            onClick={() => setActiveTab("loans")}
            className={`w-full text-left px-4 py-3 rounded-xl font-medium transition-colors flex items-center gap-3 ${
              activeTab === "loans"
                ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-400"
                : "bg-zinc-950/40 border border-zinc-900 hover:border-zinc-800 text-zinc-400 hover:text-zinc-200"
            }`}
          >
            🤝 Lending Pool
          </button>
          <button
            onClick={() => setActiveTab("admin")}
            className={`w-full text-left px-4 py-3 rounded-xl font-medium transition-colors flex items-center gap-3 ${
              activeTab === "admin"
                ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-400"
                : "bg-zinc-950/40 border border-zinc-900 hover:border-zinc-800 text-zinc-400 hover:text-zinc-200"
            }`}
          >
            ⚙️ Circle Manager
          </button>
        </aside>

        {/* Content Panel */}
        <main className="flex-grow">
          {/* TAB 1: OVERVIEW */}
          {activeTab === "overview" && (
            <div className="flex flex-col gap-6">
              {/* Stats Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div className="bg-zinc-950 border border-zinc-900 rounded-2xl p-5 shadow-xl shadow-black/20">
                  <span className="text-zinc-500 text-xs font-semibold tracking-wider uppercase">Chama Name</span>
                  <p className="text-lg font-bold text-white mt-1 overflow-hidden text-ellipsis whitespace-nowrap">
                    {vaultAddress ? circleNameOnChain || "Loading..." : "No Active Chama"}
                  </p>
                </div>
                <div className="bg-zinc-950 border border-zinc-900 rounded-2xl p-5 shadow-xl shadow-black/20">
                  <span className="text-zinc-500 text-xs font-semibold tracking-wider uppercase">Vault Balance</span>
                  <p className="text-2xl font-bold text-emerald-400 mt-1">
                    {vaultBalance} MATIC
                  </p>
                </div>
                <div className="bg-zinc-950 border border-zinc-900 rounded-2xl p-5 shadow-xl shadow-black/20">
                  <span className="text-zinc-500 text-xs font-semibold tracking-wider uppercase">Credit Score</span>
                  <p className="text-2xl font-bold text-teal-400 mt-1">
                    {userCreditScore ? Number(userCreditScore) : "500"}/1000
                  </p>
                </div>
                <div className="bg-zinc-950 border border-zinc-900 rounded-2xl p-5 shadow-xl shadow-black/20">
                  <span className="text-zinc-500 text-xs font-semibold tracking-wider uppercase">LoopPoints Balance</span>
                  <p className="text-2xl font-bold text-indigo-400 mt-1">
                    {userLoopPointsBalance ? parseFloat(formatEther(userLoopPointsBalance)).toFixed(2) : "0.00"} LOOP
                  </p>
                </div>
              </div>

              {/* Chart & Details block */}
              {vaultAddress ? (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Chart Card */}
                  <div className="bg-zinc-950 border border-zinc-900 rounded-2xl p-6 shadow-xl lg:col-span-2">
                    <h3 className="text-sm font-bold text-zinc-400 mb-6 uppercase tracking-wider">Savings Growth Chart</h3>
                    <div className="h-64 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                          <defs>
                            <linearGradient id="colorSavings" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                              <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="#18181b" />
                          <XAxis dataKey="name" stroke="#52525b" fontSize={11} />
                          <YAxis stroke="#52525b" fontSize={11} />
                          <Tooltip contentStyle={{ backgroundColor: '#09090b', borderColor: '#27272a', color: '#fff' }} />
                          <Area type="monotone" dataKey="Savings" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorSavings)" />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Circle info details */}
                  <div className="bg-zinc-950 border border-zinc-900 rounded-2xl p-6 shadow-xl flex flex-col justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-zinc-400 mb-4 uppercase tracking-wider">Chama Specifications</h3>
                      <div className="flex flex-col gap-4">
                        <div className="border-b border-zinc-900 pb-3">
                          <span className="text-xs text-zinc-500">Target Contribution</span>
                          <p className="text-sm font-bold text-zinc-200 mt-0.5">
                            {contributionAmountOnChain ? formatEther(contributionAmountOnChain) : "0.1"} MATIC per cycle
                          </p>
                        </div>
                        <div className="border-b border-zinc-900 pb-3">
                          <span className="text-xs text-zinc-500">Current Cycle ID</span>
                          <p className="text-sm font-bold text-zinc-200 mt-0.5">
                            Cycle #{currentCycleIdOnChain ? currentCycleIdOnChain.toString() : "1"}
                          </p>
                        </div>
                        <div className="pb-3">
                          <span className="text-xs text-zinc-500">Next Deadline</span>
                          <p className="text-sm font-bold text-zinc-200 mt-0.5">
                            {nextDeadlineOnChain ? new Date(Number(nextDeadlineOnChain) * 1000).toLocaleString() : "Loading..."}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="bg-zinc-900/40 border border-zinc-800 p-3.5 rounded-xl text-xs text-zinc-400 mt-4">
                      <p className="font-semibold text-zinc-300">Contract Addresses:</p>
                      <p className="mt-1 font-mono break-all">Vault: {vaultAddress}</p>
                      <p className="mt-1 font-mono break-all">Lending: {lendingAddress}</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-zinc-950 border border-zinc-900 rounded-2xl p-12 text-center shadow-xl shadow-black/20 flex flex-col items-center justify-center gap-4">
                  <span className="text-4xl">🛠️</span>
                  <h3 className="text-xl font-bold text-white">No Savings Circle Configured</h3>
                  <p className="text-zinc-400 text-sm max-w-md">
                    To start, navigate to the **Circle Manager** tab in the sidebar and deploy the PayLoop smart contract wizard.
                  </p>
                  <button
                    onClick={() => setActiveTab("admin")}
                    className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-black font-semibold rounded-xl"
                  >
                    Open Circle Manager Wizard
                  </button>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: SAVE & CONTRIBUTIONS */}
          {activeTab === "contribute" && (
            <div className="flex flex-col gap-6">
              <div className="bg-zinc-950 border border-zinc-900 rounded-2xl p-6 shadow-xl">
                <h3 className="text-lg font-bold text-white mb-2">Cycle Contribution Portal</h3>
                <p className="text-zinc-400 text-sm mb-6">
                  Save MATIC into your chama vault. Saving on-time increases your CreditLoop score and mints LOOP points rewards.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 items-end max-w-md">
                  <div className="flex-grow">
                    <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wide mb-2">
                      Contribution Amount (MATIC)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={contributionAmountInput}
                      onChange={(e) => setContributionAmountInput(e.target.value)}
                      className="w-full bg-zinc-900 border border-zinc-850 px-4 py-3 rounded-xl font-mono text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <button
                    onClick={handleContribute}
                    disabled={isContributing || !vaultAddress}
                    className="px-6 py-3 bg-emerald-500 hover:bg-emerald-400 disabled:bg-zinc-800 text-black font-semibold rounded-xl transition-all"
                  >
                    {isContributing ? "Confirming..." : "Submit Savings"}
                  </button>
                </div>
              </div>

              {/* Loop Reward Status */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="bg-zinc-950 border border-zinc-900 rounded-2xl p-6 shadow-xl">
                  <h4 className="font-bold text-zinc-300 mb-2">On-Time Reward Metric</h4>
                  <p className="text-zinc-400 text-sm leading-relaxed">
                    Savers receive **10 LOOP** tokens for every on-time payment. Delaying payments beyond deadlines drops your CreditLoop reputation by **20 points** and disqualifies rewards.
                  </p>
                </div>
                <div className="bg-zinc-950 border border-zinc-900 rounded-2xl p-6 shadow-xl flex items-center justify-between">
                  <div>
                    <span className="text-xs text-zinc-500 uppercase font-semibold">Your Wallet Balance</span>
                    <h5 className="text-2xl font-bold text-indigo-400 mt-1">
                      {userLoopPointsBalance ? parseFloat(formatEther(userLoopPointsBalance)).toFixed(2) : "0.00"} LOOP
                    </h5>
                  </div>
                  <div className="w-12 h-12 rounded-full bg-indigo-500/10 flex items-center justify-center text-indigo-400 text-2xl">
                    🪙
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: LENDING POOL */}
          {activeTab === "loans" && (
            <div className="flex flex-col gap-6">
              {/* Submit Request Box */}
              <div className="bg-zinc-950 border border-zinc-900 rounded-2xl p-6 shadow-xl">
                <h3 className="text-lg font-bold text-white mb-2">Request Micro-Loan</h3>
                <p className="text-zinc-400 text-sm mb-6">
                  Borrow funds directly from the group savings vault. Your interest rate is dynamically reduced based on your on-chain credit score.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
                  <div>
                    <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wide mb-2">
                      Loan Amount (MATIC)
                    </label>
                    <input
                      type="number"
                      placeholder="e.g. 0.5"
                      value={loanAmount}
                      onChange={(e) => setLoanAmount(e.target.value)}
                      className="w-full bg-zinc-900 border border-zinc-850 px-4 py-3 rounded-xl font-mono text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wide mb-2">
                      Repayment Duration
                    </label>
                    <select
                      value={loanDuration}
                      onChange={(e) => setLoanDuration(e.target.value)}
                      className="w-full bg-zinc-900 border border-zinc-850 px-4 py-3 rounded-xl text-white focus:outline-none focus:border-emerald-500"
                    >
                      <option value="60">1 Minute (Dev Testing)</option>
                      <option value="3600">1 Hour</option>
                      <option value="86400">1 Day</option>
                      <option value="604800">1 Week</option>
                    </select>
                  </div>
                  <button
                    onClick={handleRequestLoan}
                    disabled={isRequestingLoan || !lendingAddress}
                    className="px-6 py-3 bg-emerald-500 hover:bg-emerald-400 disabled:bg-zinc-800 text-black font-semibold rounded-xl transition-all"
                  >
                    {isRequestingLoan ? "Submitting..." : "Submit Loan Request"}
                  </button>
                </div>
              </div>

              {/* Active Requests List */}
              <div className="bg-zinc-950 border border-zinc-900 rounded-2xl shadow-xl overflow-hidden">
                <div className="p-6 border-b border-zinc-900">
                  <h3 className="font-bold text-white">Active Loan Requests</h3>
                </div>
                {loansList.length === 0 ? (
                  <div className="p-12 text-center text-zinc-500 text-sm">
                    No active loan requests on-chain.
                  </div>
                ) : (
                  <div className="divide-y divide-zinc-900">
                    {loansList.map((loan) => (
                      <div key={loan.id} className="p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div>
                          <span className="text-xs px-2 py-0.5 bg-zinc-900 border border-zinc-800 text-zinc-400 rounded-full font-mono">
                            Loan ID #{loan.id}
                          </span>
                          <h4 className="text-base font-bold text-white mt-1">
                            Borrower: <span className="font-mono text-sm text-zinc-400">{loan.borrower.substring(0,6)}...{loan.borrower.substring(loan.borrower.length-4)}</span>
                          </h4>
                          <div className="flex items-center gap-4 text-xs text-zinc-500 mt-2">
                            <span>Amount: <strong className="text-emerald-400">{loan.amount} MATIC</strong></span>
                            <span>Interest: <strong>{loan.interestRate}%</strong></span>
                            <span>Votes: <strong className="text-emerald-400">+{loan.votesFor}</strong> / <strong className="text-rose-400">-{loan.votesAgainst}</strong></span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          {loan.active && !loan.approved && (
                            <>
                              <button
                                onClick={() => handleVoteOnLoan(loan.id, true)}
                                className="px-3 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 rounded-lg text-xs font-semibold"
                              >
                                Vote YES
                              </button>
                              <button
                                onClick={() => handleVoteOnLoan(loan.id, false)}
                                className="px-3 py-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 rounded-lg text-xs font-semibold"
                              >
                                Vote NO
                              </button>
                            </>
                          )}

                          {loan.approved && loan.repaymentDeadline === 0 && (
                            <button
                              onClick={() => handleDisburseLoan(loan.id)}
                              className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-black font-bold rounded-lg text-xs"
                            >
                              Disburse Funds
                            </button>
                          )}

                          {loan.repaymentDeadline > 0 && !loan.repaid && (
                            <div className="flex items-center gap-3">
                              <span className="text-xs text-amber-400">Active Repayment Mode</span>
                              {address === loan.borrower && (
                                <button
                                  onClick={() => {
                                    // Calculate total due
                                    const amountDue = (parseFloat(loan.amount) * (1 + loan.interestRate / 100)).toString();
                                    handleRepayLoan(loan.id, amountDue);
                                  }}
                                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-lg text-xs"
                                >
                                  Repay Loan
                                </button>
                              )}
                            </div>
                          )}

                          {loan.repaid && (
                            <span className="px-3 py-1 bg-emerald-950 border border-emerald-900 text-emerald-400 rounded-full text-xs font-semibold">
                              Fully Repaid
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 4: CIRCLE MANAGER */}
          {activeTab === "admin" && (
            <div className="flex flex-col gap-6">
              {/* Deployer Wizard */}
              <div className="bg-zinc-950 border border-zinc-900 rounded-2xl p-6 shadow-xl">
                <h3 className="text-lg font-bold text-white mb-2">Savings Circle Deployer Wizard</h3>
                <p className="text-zinc-400 text-sm mb-6">
                  Deploy a brand new chama contract system to Polygon. This deploys 4 interconnected contracts: CircleVault, LendingPool, CreditScore, and LoopToken.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wide mb-2">
                      Circle Name
                    </label>
                    <input
                      type="text"
                      value={circleName}
                      onChange={(e) => setCircleName(e.target.value)}
                      className="w-full bg-zinc-900 border border-zinc-850 px-4 py-3 rounded-xl text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wide mb-2">
                      Cycle Minimum Contribution (MATIC)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={minContribution}
                      onChange={(e) => setMinContribution(e.target.value)}
                      className="w-full bg-zinc-900 border border-zinc-850 px-4 py-3 rounded-xl font-mono text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wide mb-2">
                      Cycle Duration Option
                    </label>
                    <select
                      value={cycleDurationOption}
                      onChange={(e) => setCycleDurationOption(e.target.value)}
                      className="w-full bg-zinc-900 border border-zinc-850 px-4 py-3 rounded-xl text-white focus:outline-none focus:border-emerald-500"
                    >
                      <option value="60">1 Minute (Dev Testing)</option>
                      <option value="3600">1 Hour</option>
                      <option value="86400">1 Day</option>
                      <option value="604800">1 Week</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wide mb-2">
                      Admin Threshold Approvals
                    </label>
                    <input
                      type="number"
                      value={requiredApprovalsCount}
                      onChange={(e) => setRequiredApprovalsCount(e.target.value)}
                      className="w-full bg-zinc-900 border border-zinc-850 px-4 py-3 rounded-xl text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wide mb-2">
                      Admins (Comma-separated addresses)
                    </label>
                    <textarea
                      rows="2"
                      value={adminAddressesText}
                      onChange={(e) => setAdminAddressesText(e.target.value)}
                      placeholder="0x..., 0x..."
                      className="w-full bg-zinc-900 border border-zinc-850 px-4 py-3 rounded-xl font-mono text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                <div className="flex gap-4 mt-6">
                  <button
                    onClick={handleFullSetup}
                    disabled={isDeploying}
                    className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 disabled:bg-zinc-800 text-black font-extrabold rounded-xl shadow-lg active:scale-95 transition-all"
                  >
                    {isDeploying ? "Deploying & Wiring Setup..." : "Deploy Savings Circle"}
                  </button>
                  {vaultAddress && (
                    <button
                      onClick={clearAddresses}
                      className="px-6 py-3 bg-zinc-900 border border-zinc-800 text-rose-500 hover:bg-rose-950/10 rounded-xl"
                    >
                      Clear Saved Address Cache
                    </button>
                  )}
                </div>
              </div>

              {vaultAddress && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Member Whitelist Manager */}
                  <div className="bg-zinc-950 border border-zinc-900 rounded-2xl p-6 shadow-xl">
                    <h3 className="font-bold text-white mb-2">Manage Whitelist Members</h3>
                    <p className="text-zinc-400 text-xs mb-6">
                      Add new member addresses into the savings group. Only active members can contribute or borrow.
                    </p>

                    <div className="flex flex-col gap-4">
                      <div>
                        <label className="block text-xs text-zinc-500 mb-2">Member Address</label>
                        <input
                          type="text"
                          placeholder="0x..."
                          value={newMemberAddress}
                          onChange={(e) => setNewMemberAddress(e.target.value)}
                          className="w-full bg-zinc-900 border border-zinc-850 px-4 py-3 rounded-xl font-mono text-xs text-white focus:outline-none focus:border-emerald-500"
                        />
                      </div>
                      <button
                        onClick={handleAddMember}
                        disabled={isAddingMember || !newMemberAddress}
                        className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 disabled:bg-zinc-800 text-black font-semibold rounded-xl text-sm"
                      >
                        {isAddingMember ? "Adding..." : "Add Member"}
                      </button>
                    </div>

                    {/* Current Members List */}
                    <div className="mt-6">
                      <span className="text-xs text-zinc-500 font-semibold block mb-2">Active Members List:</span>
                      <div className="max-h-40 overflow-y-auto border border-zinc-900 rounded-lg divide-y divide-zinc-900 font-mono text-xs">
                        {membersOnChain && membersOnChain.length > 0 ? (
                          membersOnChain.map((m) => (
                            <div key={m} className="p-2.5 text-zinc-300 bg-zinc-950/50">
                              {m}
                            </div>
                          ))
                        ) : (
                          <div className="p-4 text-center text-zinc-650">No members configured.</div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Multi-Sig Withdraw Request */}
                  <div className="bg-zinc-950 border border-zinc-900 rounded-2xl p-6 shadow-xl">
                    <h3 className="font-bold text-white mb-2">Multi-Sig Vault Withdrawal</h3>
                    <p className="text-zinc-400 text-xs mb-6">
                      Propose standard withdrawal from the vault balance. Requires multiple admin signatures to execute.
                    </p>

                    <div className="flex flex-col gap-4">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs text-zinc-500 mb-2">Recipient</label>
                          <input
                            type="text"
                            placeholder="0x..."
                            value={withdrawRecipient}
                            onChange={(e) => setWithdrawRecipient(e.target.value)}
                            className="w-full bg-zinc-900 border border-zinc-850 px-4 py-3 rounded-xl font-mono text-xs text-white focus:outline-none focus:border-emerald-500"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-zinc-500 mb-2">Amount (MATIC)</label>
                          <input
                            type="number"
                            step="0.01"
                            placeholder="0.1"
                            value={withdrawAmount}
                            onChange={(e) => setWithdrawAmount(e.target.value)}
                            className="w-full bg-zinc-900 border border-zinc-850 px-4 py-3 rounded-xl font-mono text-xs text-white focus:outline-none focus:border-emerald-500"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs text-zinc-500 mb-2">Reason/Description</label>
                        <input
                          type="text"
                          placeholder="e.g. Buy solar panels"
                          value={withdrawReason}
                          onChange={(e) => setWithdrawReason(e.target.value)}
                          className="w-full bg-zinc-900 border border-zinc-850 px-4 py-3 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
                        />
                      </div>
                      <button
                        onClick={handleProposeWithdraw}
                        disabled={isProposingWithdraw || !withdrawRecipient || !withdrawAmount}
                        className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 disabled:bg-zinc-800 text-black font-semibold rounded-xl text-sm"
                      >
                        {isProposingWithdraw ? "Proposing..." : "Propose Vault Withdrawal"}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
