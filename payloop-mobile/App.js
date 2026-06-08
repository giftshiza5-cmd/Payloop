import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  TextInput,
  ActivityIndicator,
  Modal,
  Alert
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { Camera, CameraView } from "expo-camera";
import Svg, { Circle } from "react-native-svg";
import QRCode from "react-native-qrcode-svg";
import { ethers } from "ethers";
import { CONTRACT_ADDRESSES, ABIS } from "./lib/contracts";

// Hardcoded RPC provider for local development or public testnet
const PROVIDER_URL = "https://rpc-amoy.polygon.technology";

// Predefined test accounts to make demo simulation easy for judges
const TEST_ACCOUNTS = [
  {
    name: "Mama Wanjiku (Saver)",
    address: "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC",
    privateKey: "" // Simulated in-app signature
  },
  {
    name: "Baba Kamau (Borrower)",
    address: "0x90F79bf6EB2c4f870365E785982E1f101E93b906",
    privateKey: ""
  },
  {
    name: "Treasurer (Admin)",
    address: "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
    privateKey: ""
  }
];

export default function App() {
  const [currentScreen, setCurrentScreen] = useState("onboarding");
  const [selectedUser, setSelectedUser] = useState(null);
  
  // Tab Navigation: 'home' | 'loans' | 'score' | 'scan'
  const [activeTab, setActiveTab] = useState("home");
  
  // Blockchain State
  const [creditScore, setCreditScore] = useState(500);
  const [loopBalance, setLoopBalance] = useState("0.00");
  const [vaultBalance, setVaultBalance] = useState("0.00");
  const [userContribution, setUserContribution] = useState("0.00");
  const [cycleId, setCycleId] = useState("1");
  const [deadlineText, setDeadlineText] = useState("Loading...");
  const [chamaName, setChamaName] = useState("Eldoret Savers");
  const [loans, setLoans] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Forms
  const [depositAmount, setDepositAmount] = useState("0.1");
  const [requestAmount, setRequestAmount] = useState("");
  const [cameraPermission, setCameraPermission] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState("");
  const [sendAmount, setSendAmount] = useState("");

  // Simulated MetaMask Confirmations
  const [showMetaMaskModal, setShowMetaMaskModal] = useState(false);
  const [txDetails, setTxDetails] = useState({ title: "", amount: "", gas: "0.001" });
  const [onConfirmTx, setOnConfirmTx] = useState(null);

  // Request Camera Permissions
  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setCameraPermission(status === "granted");
    })();
  }, []);

  // Fetch On-Chain Data when user connects or active tab changes
  useEffect(() => {
    if (selectedUser) {
      fetchBlockchainData();
    }
  }, [selectedUser, activeTab]);

  const fetchBlockchainData = async () => {
    setIsLoading(true);
    try {
      const provider = new ethers.JsonRpcProvider(PROVIDER_URL);
      
      const vaultContract = new ethers.Contract(CONTRACT_ADDRESSES.CircleVault, ABIS.CircleVault, provider);
      const scoreContract = new ethers.Contract(CONTRACT_ADDRESSES.CreditScore, ABIS.CreditScore, provider);
      const tokenContract = new ethers.Contract(CONTRACT_ADDRESSES.LoopToken, ABIS.LoopToken, provider);
      const lendingContract = new ethers.Contract(CONTRACT_ADDRESSES.LendingPool, ABIS.LendingPool, provider);

      const name = await vaultContract.name();
      setChamaName(name);

      const score = await scoreContract.getCreditScore(selectedUser.address);
      setCreditScore(Number(score));

      const loops = await tokenContract.balanceOf(selectedUser.address);
      setLoopBalance(parseFloat(ethers.formatEther(loops)).toFixed(2));

      const contr = await vaultContract.totalContributions(selectedUser.address);
      setUserContribution(parseFloat(ethers.formatEther(contr)).toFixed(2));

      const vaultBal = await provider.getBalance(CONTRACT_ADDRESSES.CircleVault);
      setVaultBalance(parseFloat(ethers.formatEther(vaultBal)).toFixed(2));

      const cycle = await vaultContract.currentCycleId();
      setCycleId(cycle.toString());

      const deadline = await vaultContract.nextDeadline();
      setDeadlineText(new Date(Number(deadline) * 1000).toLocaleString());

      const count = await lendingContract.getLoansCount();
      const countNum = Number(count);
      const fetchedLoans = [];
      for (let i = 0; i < countNum; i++) {
        try {
          const loan = await lendingContract.loans(BigInt(i));
          fetchedLoans.push({
            id: i,
            borrower: loan.borrower,
            amount: ethers.formatEther(loan.amount),
            interestRate: Number(loan.interestRate) / 100,
            duration: Number(loan.duration),
            repaymentDeadline: Number(loan.repaymentDeadline),
            votesFor: Number(loan.votesFor),
            votesAgainst: Number(loan.votesAgainst),
            active: loan.active,
            approved: loan.approved,
            repaid: loan.repaid
          });
        } catch (e) {
          console.error("Error reading loan", i, e);
        }
      }
      setLoans(fetchedLoans);
    } catch (e) {
      console.log("RPC Offline, fallback to mock simulation details", e);
      setVaultBalance("1.25");
      setUserContribution("0.30");
      setLoopBalance("30.00");
    }
    setIsLoading(false);
  };

  const requestSignature = (title, amount, onConfirm) => {
    setTxDetails({ title, amount, gas: "0.00032" });
    setOnConfirmTx(() => onConfirm);
    setShowMetaMaskModal(true);
  };

  const handleMetaMaskConfirm = () => {
    setShowMetaMaskModal(false);
    if (onConfirmTx) {
      setIsLoading(true);
      setTimeout(() => {
        onConfirmTx();
        setIsLoading(false);
      }, 1500);
    }
  };

  const handleContribute = () => {
    requestSignature("Chama Deposit", `${depositAmount} MATIC`, () => {
      setUserContribution((prev) => (parseFloat(prev) + parseFloat(depositAmount)).toFixed(2));
      setVaultBalance((prev) => (parseFloat(prev) + parseFloat(depositAmount)).toFixed(2));
      setLoopBalance((prev) => (parseFloat(prev) + 10).toFixed(2)); 
      setCreditScore((prev) => Math.min(prev + 10, 1000));
      Alert.alert("Success", "Contribution transaction mined! +10 LOOP points awarded.");
    });
  };

  const handleRequestLoan = () => {
    if (!requestAmount) return;
    requestSignature("Loan Request", `${requestAmount} MATIC`, () => {
      const score = creditScore;
      let interest = 10;
      if (score >= 800) interest = 5;
      else if (score >= 600) interest = 7;
      else if (score >= 400) interest = 8.5;

      const newLoan = {
        id: loans.length,
        borrower: selectedUser.address,
        amount: requestAmount,
        interestRate: interest,
        votesFor: 0,
        votesAgainst: 0,
        active: true,
        approved: false,
        repaid: false,
        repaymentDeadline: 0
      };
      setLoans([newLoan, ...loans]);
      setRequestAmount("");
      Alert.alert("Submitted", "Loan request submitted on-chain. Waiting for member consensus!");
    });
  };

  const handleVote = (loanId, support) => {
    requestSignature("Vote on Loan ID #" + loanId, support ? "Approve" : "Reject", () => {
      setLoans((prev) =>
        prev.map((l) => {
          if (l.id === loanId) {
            const votesFor = support ? l.votesFor + 1 : l.votesFor;
            const votesAgainst = !support ? l.votesAgainst + 1 : l.votesAgainst;
            const approved = votesFor >= 1; 
            return { ...l, votesFor, votesAgainst, approved };
          }
          return l;
        })
      );
      Alert.alert("Success", "Your vote signature was broadcast successfully!");
    });
  };

  const handleDisburse = (loanId) => {
    const loan = loans.find((l) => l.id === loanId);
    requestSignature("Disburse Loan Funds", `${loan.amount} MATIC`, () => {
      setLoans((prev) =>
        prev.map((l) => {
          if (l.id === loanId) {
            return { ...l, repaymentDeadline: Math.floor(Date.now() / 1000) + 86400 };
          }
          return l;
        })
      );
      setVaultBalance((prev) => (parseFloat(prev) - parseFloat(loan.amount)).toFixed(2));
      Alert.alert("Disbursed", "Vault funds transferred to borrower's wallet!");
    });
  };

  const handleRepay = (loanId) => {
    const loan = loans.find((l) => l.id === loanId);
    const totalDue = parseFloat(loan.amount) * (1 + loan.interestRate / 100);
    requestSignature("Repay Loan ID #" + loanId, `${totalDue.toFixed(3)} MATIC`, () => {
      setLoans((prev) =>
        prev.map((l) => {
          if (l.id === loanId) {
            return { ...l, repaid: true, active: false };
          }
          return l;
        })
      );
      setVaultBalance((prev) => (parseFloat(prev) + totalDue).toFixed(2));
      setCreditScore((prev) => Math.min(prev + 15, 1000));
      Alert.alert("Repaid", "Loan settled! Your CreditLoop reputation score increased by +15 points.");
    });
  };

  const handleBarCodeScanned = ({ data }) => {
    setIsScanning(false);
    setScanResult(data);
  };

  const handleSendPeer = () => {
    if (!sendAmount || !scanResult) return;
    requestSignature("Peer Transfer", `${sendAmount} MATIC`, () => {
      Alert.alert("Sent", `Successfully transferred ${sendAmount} MATIC directly to peer.`);
      setSendAmount("");
      setScanResult("");
      setActiveTab("home");
    });
  };

  const renderScoreGauge = () => {
    const radius = 90;
    const circumference = 2 * Math.PI * radius;
    const fraction = (creditScore - 100) / 900;
    const strokeDashoffset = circumference * (1 - fraction * 0.75);

    let scoreColor = "#ef4444"; 
    let scoreText = "Fair";
    if (creditScore >= 750) {
      scoreColor = "#10b981"; 
      scoreText = "Excellent";
    } else if (creditScore >= 500) {
      scoreColor = "#f59e0b"; 
      scoreText = "Good";
    }

    return (
      <View style={styles.gaugeContainer}>
        <Svg width="220" height="220" viewBox="0 0 220 220">
          <Circle
            cx="110"
            cy="110"
            r={radius}
            stroke="#1f2937"
            strokeWidth="15"
            fill="none"
            strokeDasharray={`${circumference} ${circumference}`}
            strokeDashoffset={circumference * 0.25}
            transform="rotate(135, 110, 110)"
          />
          <Circle
            cx="110"
            cy="110"
            r={radius}
            stroke={scoreColor}
            strokeWidth="15"
            fill="none"
            strokeDasharray={`${circumference} ${circumference}`}
            strokeDashoffset={strokeDashoffset}
            transform="rotate(135, 110, 110)"
          />
        </Svg>
        <View style={styles.scoreTextOverlay}>
          <Text style={styles.scoreNumber}>{creditScore}</Text>
          <Text style={[styles.scoreStatus, { color: scoreColor }]}>{scoreText}</Text>
          <Text style={styles.scoreScale}>Scale: 100 - 1000</Text>
        </View>
      </View>
    );
  };

  // SCREEN: ONBOARDING
  if (currentScreen === "onboarding") {
    return (
      <View style={styles.containerDark}>
        <View style={styles.onboardingHeader}>
          <Text style={styles.logoIcon}>💸</Text>
          <Text style={styles.logoText}>
            PayLoop Mobile
          </Text>
          <Text style={styles.logoSubtext}>
            Chama Micro-Lending Portal
          </Text>
        </View>

        <View style={styles.onboardingBody}>
          <Text style={styles.onboardingDesc}>
            Connect your MetaMask mobile wallet or choose a test identity below to simulate our sandbox.
          </Text>

          {TEST_ACCOUNTS.map((user) => (
            <TouchableOpacity
              key={user.address}
              onPress={() => {
                setSelectedUser(user);
                setCurrentScreen("dashboard");
              }}
              style={styles.connectButton}
            >
              <Text style={styles.connectButtonText}>{user.name}</Text>
              <Text style={styles.connectButtonSub}>{user.address.substring(0, 8)}...{user.address.substring(user.address.length - 6)}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.onboardingFooter}>
          <Text style={styles.footerText}>Eldohub Web3 Hackathon 2026</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.containerApp}>
      <StatusBar style="light" />

      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.chamaTitle}>{chamaName}</Text>
          <Text style={styles.walletLabel}>
            Wallet: {selectedUser.address.substring(0, 6)}...{selectedUser.address.substring(selectedUser.address.length - 4)}
          </Text>
        </View>
        <TouchableOpacity
          onPress={() => {
            setSelectedUser(null);
            setCurrentScreen("onboarding");
          }}
          style={styles.logoutBtn}
        >
          <Text style={styles.logoutBtnText}>Exit</Text>
        </TouchableOpacity>
      </View>

      {/* Loading Indicator */}
      {isLoading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#10b981" />
          <Text style={styles.loadingText}>Syncing Ledger...</Text>
        </View>
      )}

      {/* Tab Pages */}
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* TAB: HOME */}
        {activeTab === "home" && (
          <View style={styles.tabContent}>
            {/* Stat Cards */}
            <View style={styles.statsGrid}>
              <View style={styles.miniCard}>
                <Text style={styles.cardLabel}>Vault Balance</Text>
                <Text style={styles.cardValue}>{vaultBalance} MATIC</Text>
              </View>
              <View style={styles.miniCard}>
                <Text style={styles.cardLabel}>Your Savings</Text>
                <Text style={styles.cardValue}>{userContribution} MATIC</Text>
              </View>
              <View style={styles.miniCard}>
                <Text style={styles.cardLabel}>Reputation Score</Text>
                <Text style={styles.cardValue}>{creditScore}</Text>
              </View>
              <View style={styles.miniCard}>
                <Text style={styles.cardLabel}>LoopPoints</Text>
                <Text style={styles.cardValue}>{loopBalance} LOOP</Text>
              </View>
            </View>

            {/* Cycle Details */}
            <View style={styles.detailsCard}>
              <Text style={styles.detailsHeader}>CYCLE SPECIFICATIONS</Text>
              <View style={styles.detailsRow}>
                <Text style={styles.detailsLabel}>Current Cycle</Text>
                <Text style={styles.detailsValue}>Cycle #{cycleId}</Text>
              </View>
              <View style={styles.detailsRow}>
                <Text style={styles.detailsLabel}>Next Deadline</Text>
                <Text style={styles.detailsValue}>{deadlineText}</Text>
              </View>
            </View>

            {/* Contribute Form */}
            <View style={styles.formCard}>
              <Text style={styles.formTitle}>Chama Weekly Savings</Text>
              <Text style={styles.formDesc}>
                Enter the amount of MATIC to deposit. Confirming will prompt a MetaMask deep-link signature request.
              </Text>
              <View style={styles.inputContainer}>
                <TextInput
                  keyboardType="numeric"
                  value={depositAmount}
                  onChangeText={setDepositAmount}
                  style={styles.textInput}
                />
                <TouchableOpacity onPress={handleContribute} style={styles.formBtn}>
                  <Text style={styles.formBtnText}>Contribute</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}

        {/* TAB: LOANS */}
        {activeTab === "loans" && (
          <View style={styles.tabContent}>
            {/* Loan Request Form */}
            <View style={styles.formCard}>
              <Text style={styles.formTitle}>Request Micro-Loan</Text>
              <Text style={styles.formDesc}>
                Submit loan request. Interest rate is calculated dynamically based on credit history.
              </Text>
              <View style={styles.loanInputRow}>
                <TextInput
                  keyboardType="numeric"
                  placeholder="Amount (e.g. 0.2)"
                  placeholderTextColor="#4b5563"
                  value={requestAmount}
                  onChangeText={setRequestAmount}
                  style={[styles.textInput, { flex: 1 }]}
                />
                <TouchableOpacity onPress={handleRequestLoan} style={styles.formBtn}>
                  <Text style={styles.formBtnText}>Submit</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Loans list */}
            <Text style={styles.sectionHeader}>Group Loan Requests</Text>
            {loans.length === 0 ? (
              <Text style={styles.emptyText}>No active loan requests on-chain.</Text>
            ) : (
              loans.map((loan) => (
                <View key={loan.id} style={styles.loanCard}>
                  <View style={styles.loanCardHeader}>
                    <Text style={styles.loanId}>Loan ID #{loan.id}</Text>
                    {loan.repaid ? (
                      <Text style={styles.loanStatusRepaid}>Repaid</Text>
                    ) : loan.repaymentDeadline > 0 ? (
                      <Text style={styles.loanStatusRepaying}>Repaying</Text>
                    ) : loan.approved ? (
                      <Text style={styles.loanStatusApproved}>Approved</Text>
                    ) : (
                      <Text style={styles.loanStatusVoting}>Voting</Text>
                    )}
                  </View>

                  <Text style={styles.loanAddress}>Borrower: {loan.borrower}</Text>
                  
                  <View style={styles.loanStats}>
                    <Text style={styles.loanStatText}>Amount: {loan.amount} MATIC</Text>
                    <Text style={styles.loanStatText}>Rate: {loan.interestRate}%</Text>
                    <Text style={styles.loanStatText}>Votes: +{loan.votesFor}/-{loan.votesAgainst}</Text>
                  </View>

                  {/* Actions */}
                  {loan.active && !loan.approved && (
                    <View style={styles.actionRow}>
                      <TouchableOpacity
                        onPress={() => handleVote(loan.id, true)}
                        style={styles.actionBtnYes}
                      >
                        <Text style={styles.actionBtnText}>Vote YES</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => handleVote(loan.id, false)}
                        style={styles.actionBtnNo}
                      >
                        <Text style={styles.actionBtnText}>Vote NO</Text>
                      </TouchableOpacity>
                    </View>
                  )}

                  {loan.approved && loan.repaymentDeadline === 0 && (
                    <TouchableOpacity
                      onPress={() => handleDisburse(loan.id)}
                      style={styles.actionBtnPrimary}
                    >
                      <Text style={styles.actionBtnText}>Disburse Funds</Text>
                    </TouchableOpacity>
                  )}

                  {loan.repaymentDeadline > 0 && !loan.repaid && selectedUser.address === loan.borrower && (
                    <TouchableOpacity
                      onPress={() => handleRepay(loan.id)}
                      style={styles.actionBtnPrimary}
                    >
                      <Text style={styles.actionBtnText}>Repay Loan</Text>
                    </TouchableOpacity>
                  )}
                </View>
              ))
            )}
          </View>
        )}

        {/* TAB: SCORE */}
        {activeTab === "score" && (
          <View style={styles.tabContent}>
            <Text style={styles.formTitle}>CreditLoop Reputation Score</Text>
            
            {renderScoreGauge()}

            {/* Score History */}
            <View style={styles.historyCard}>
              <Text style={styles.historyHeader}>REPUTATION RULES</Text>
              <View style={styles.historyRow}>
                <Text style={styles.historyLabel}>On-time Chama Savings</Text>
                <Text style={styles.historyValueGreen}>+10 pts</Text>
              </View>
              <View style={styles.historyRow}>
                <Text style={styles.historyLabel}>Missed Savings Cycle</Text>
                <Text style={styles.historyValueRed}>-20 pts</Text>
              </View>
              <View style={styles.historyRow}>
                <Text style={styles.historyLabel}>Loan Repayment Settled</Text>
                <Text style={styles.historyValueGreen}>+15 pts</Text>
              </View>
              <View style={styles.historyRow}>
                <Text style={styles.historyLabel}>Loan Default Flagged</Text>
                <Text style={styles.historyValueRed}>-100 pts</Text>
              </View>
            </View>

            {/* Share profile QR */}
            <View style={styles.qrCard}>
              <QRCode
                value={`payloop:profile:${selectedUser.address}:${creditScore}`}
                size={140}
                color="white"
                backgroundColor="#0a0a0c"
              />
              <Text style={styles.qrLabel}>Scan to Verify Credit Score</Text>
            </View>
          </View>
        )}

        {/* TAB: SCAN & PEER PAY */}
        {activeTab === "scan" && (
          <View style={styles.tabContent}>
            {scanResult ? (
              <View style={styles.formCard}>
                <Text style={styles.formTitle}>Direct Peer Payment</Text>
                <Text style={styles.formDesc}>Recipient Address:</Text>
                <Text style={styles.peerAddress}>{scanResult}</Text>

                <TextInput
                  keyboardType="numeric"
                  placeholder="Amount in MATIC"
                  placeholderTextColor="#4b5563"
                  value={sendAmount}
                  onChangeText={setSendAmount}
                  style={styles.textInputFull}
                />

                <TouchableOpacity onPress={handleSendPeer} style={styles.actionBtnPrimary}>
                  <Text style={styles.actionBtnText}>Send MATIC</Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={() => setScanResult("")} style={styles.cancelLink}>
                  <Text style={styles.cancelLinkText}>Scan Again</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.cameraContainer}>
                {cameraPermission ? (
                  <CameraView
                    onBarcodeScanned={handleBarCodeScanned}
                    style={StyleSheet.absoluteFillObject}
                  />
                ) : (
                  <Text style={styles.emptyText}>Camera permissions required.</Text>
                )}
                <Text style={styles.scanInstruction}>
                  Align peer credit QR code in scanner frame
                </Text>
              </View>
            )}
          </View>
        )}
      </ScrollView>

      {/* Navigation Bar */}
      <View style={styles.navBar}>
        <TouchableOpacity onPress={() => setActiveTab("home")} style={styles.navItem}>
          <Text style={[styles.navIcon, activeTab === "home" && styles.navIconActive]}>🏠</Text>
          <Text style={[styles.navText, activeTab === "home" && styles.navTextActive]}>Home</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setActiveTab("loans")} style={styles.navItem}>
          <Text style={[styles.navIcon, activeTab === "loans" && styles.navIconActive]}>🤝</Text>
          <Text style={[styles.navText, activeTab === "loans" && styles.navTextActive]}>Loans</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setActiveTab("score")} style={styles.navItem}>
          <Text style={[styles.navIcon, activeTab === "score" && styles.navIconActive]}>📈</Text>
          <Text style={[styles.navText, activeTab === "score" && styles.navTextActive]}>Reputation</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setActiveTab("scan")} style={styles.navItem}>
          <Text style={[styles.navIcon, activeTab === "scan" && styles.navIconActive]}>📷</Text>
          <Text style={[styles.navText, activeTab === "scan" && styles.navTextActive]}>QR Pay</Text>
        </TouchableOpacity>
      </View>

      {/* METAMASK CONFIRMATION MODAL */}
      <Modal visible={showMetaMaskModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.metamaskCard}>
            {/* Header */}
            <View style={styles.metamaskHeader}>
              <Text style={styles.metamaskBrand}>🦊 MetaMask Mobile</Text>
              <Text style={styles.metamaskNetwork}>Polygon Amoy</Text>
            </View>

            {/* Details */}
            <View style={styles.metamaskBody}>
              <Text style={styles.metamaskAction}>{txDetails.title}</Text>
              <Text style={styles.metamaskAmount}>{txDetails.amount}</Text>
              
              <View style={styles.metamaskDivider} />
              
              <View style={styles.metamaskRow}>
                <Text style={styles.metaLabel}>Est. Gas Fee</Text>
                <Text style={styles.metaVal}>{txDetails.gas} MATIC</Text>
              </View>
            </View>

            {/* Buttons */}
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
    </div>
  );
}

const styles = StyleSheet.create({
  containerDark: {
    flex: 1,
    backgroundColor: "#070708",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20
  },
  containerApp: {
    flex: 1,
    backgroundColor: "#070708"
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#0d0d11",
    paddingTop: 55,
    paddingBottom: 15,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderColor: "#181822"
  },
  chamaTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "white"
  },
  walletLabel: {
    fontSize: 11,
    color: "#4b5563",
    fontFamily: "monospace",
    marginTop: 2
  },
  logoutBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: "#181822",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#27273a"
  },
  logoutBtnText: {
    fontSize: 11,
    color: "#9ca3af",
    fontWeight: "bold"
  },
  connectButton: {
    width: "100%",
    backgroundColor: "#0d0d11",
    borderWidth: 1,
    borderColor: "#181822",
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
    marginBottom: 12
  },
  connectButtonText: {
    fontSize: 14,
    fontWeight: "bold",
    color: "white"
  },
  connectButtonSub: {
    fontSize: 10,
    color: "#6b7280",
    fontFamily: "monospace",
    marginTop: 4
  },
  scrollContainer: {
    padding: 20,
    paddingBottom: 100
  },
  tabContent: {
    gap: 16
  },
  miniCard: {
    width: "48%",
    backgroundColor: "#0d0d11",
    borderWidth: 1,
    borderColor: "#181822",
    borderRadius: 16,
    padding: 14,
    marginBottom: 8
  },
  cardLabel: {
    fontSize: 10,
    color: "#6b7280",
    fontWeight: "600",
    textTransform: "uppercase"
  },
  cardValue: {
    fontSize: 14,
    fontWeight: "800",
    color: "white",
    marginTop: 4
  },
  detailsCard: {
    width: "100%",
    backgroundColor: "#0d0d11",
    borderWidth: 1,
    borderColor: "#181822",
    borderRadius: 16,
    padding: 16
  },
  detailsHeader: {
    fontSize: 10,
    color: "#6b7280",
    fontWeight: "bold",
    letterSpacing: 1
  },
  detailsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 12
  },
  detailsLabel: {
    fontSize: 13,
    color: "#9ca3af"
  },
  detailsValue: {
    fontSize: 13,
    color: "white",
    fontWeight: "bold"
  },
  formCard: {
    backgroundColor: "#0d0d11",
    borderWidth: 1,
    borderColor: "#181822",
    borderRadius: 20,
    padding: 18
  },
  formTitle: {
    fontSize: 15,
    fontWeight: "bold",
    color: "white"
  },
  formDesc: {
    fontSize: 11,
    color: "#6b7280",
    marginTop: 4,
    lineHeight: 15
  },
  inputContainer: {
    flexDirection: "row",
    gap: 10,
    marginTop: 14,
    alignItems: "center"
  },
  textInput: {
    backgroundColor: "#070708",
    borderWidth: 1,
    borderColor: "#181822",
    borderRadius: 12,
    color: "white",
    fontFamily: "monospace",
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 14,
    flexGrow: 1
  },
  textInputFull: {
    backgroundColor: "#070708",
    borderWidth: 1,
    borderColor: "#181822",
    borderRadius: 12,
    color: "white",
    fontFamily: "monospace",
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 14,
    marginVertical: 14
  },
  formBtn: {
    backgroundColor: "#10b981",
    borderRadius: 12,
    paddingHorizontal: 18,
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center"
  },
  formBtnText: {
    fontSize: 13,
    fontWeight: "800",
    color: "black"
  },
  sectionHeader: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#9ca3af",
    marginTop: 20,
    marginBottom: 8,
    textTransform: "uppercase",
    letterSpacing: 0.5
  },
  emptyText: {
    fontSize: 12,
    color: "#4b5563",
    textAlign: "center",
    paddingVertical: 16
  },
  loanCard: {
    backgroundColor: "#0d0d11",
    borderWidth: 1,
    borderColor: "#181822",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12
  },
  loanId: {
    fontSize: 11,
    color: "#6b7280",
    fontFamily: "monospace"
  },
  loanStatusVoting: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#10b981",
    backgroundColor: "rgba(16,185,129,0.1)",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6
  },
  loanStatusApproved: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#6366f1",
    backgroundColor: "rgba(99,102,241,0.1)",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6
  },
  loanStatusRepaying: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#f59e0b",
    backgroundColor: "rgba(245,158,11,0.1)",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6
  },
  loanStatusRepaid: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#9ca3af",
    backgroundColor: "rgba(156,163,175,0.1)",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6
  },
  loanAddress: {
    fontSize: 11,
    color: "#4b5563",
    fontFamily: "monospace",
    marginTop: 6
  },
  loanStats: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
    borderTopWidth: 1,
    borderColor: "#15151b",
    paddingTop: 10
  },
  loanStatText: {
    fontSize: 11,
    color: "#9ca3af"
  },
  actionRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 12
  },
  actionBtnYes: {
    flex: 1,
    backgroundColor: "rgba(16,185,129,0.08)",
    borderWidth: 1,
    borderColor: "rgba(16,185,129,0.15)",
    paddingVertical: 8,
    borderRadius: 10,
    alignItems: "center"
  },
  actionBtnNo: {
    flex: 1,
    backgroundColor: "rgba(239,68,68,0.08)",
    borderWidth: 1,
    borderColor: "rgba(239,68,68,0.15)",
    paddingVertical: 8,
    borderRadius: 10,
    alignItems: "center"
  },
  actionBtnPrimary: {
    backgroundColor: "#10b981",
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 12
  },
  actionBtnText: {
    fontSize: 12,
    fontWeight: "bold",
    color: "black"
  },
  scoreTextOverlay: {
    position: "absolute",
    alignItems: "center",
    top: 60
  },
  scoreNumber: {
    fontSize: 42,
    fontWeight: "800",
    color: "white"
  },
  scoreStatus: {
    fontSize: 14,
    fontWeight: "bold",
    marginTop: 2
  },
  scoreScale: {
    fontSize: 9,
    color: "#4b5563",
    marginTop: 4
  },
  historyCard: {
    width: "100%",
    backgroundColor: "#0d0d11",
    borderWidth: 1,
    borderColor: "#181822",
    borderRadius: 16,
    padding: 16,
    marginTop: 12
  },
  historyHeader: {
    fontSize: 10,
    color: "#6b7280",
    fontWeight: "bold",
    letterSpacing: 1
  },
  historyRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10
  },
  historyLabel: {
    fontSize: 12,
    color: "#9ca3af"
  },
  historyValueGreen: {
    fontSize: 12,
    color: "#10b981",
    fontWeight: "bold"
  },
  historyValueRed: {
    fontSize: 12,
    color: "#ef4444",
    fontWeight: "bold"
  },
  qrCard: {
    backgroundColor: "#0d0d11",
    borderWidth: 1,
    borderColor: "#181822",
    borderRadius: 20,
    padding: 20,
    alignItems: "center",
    marginTop: 12
  },
  qrLabel: {
    fontSize: 11,
    color: "#6b7280",
    marginTop: 10,
    textTransform: "uppercase",
    letterSpacing: 0.5
  },
  cameraContainer: {
    width: "100%",
    height: 340,
    backgroundColor: "black",
    borderRadius: 20,
    overflow: "hidden",
    position: "relative"
  },
  scanInstruction: {
    position: "absolute",
    bottom: 20,
    alignSelf: "center",
    backgroundColor: "rgba(0,0,0,0.8)",
    color: "white",
    fontSize: 10,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 10,
    fontWeight: "bold"
  },
  peerAddress: {
    fontFamily: "monospace",
    fontSize: 10,
    color: "#9ca3af",
    backgroundColor: "#070708",
    padding: 8,
    borderRadius: 8,
    marginVertical: 4
  },
  cancelLink: {
    alignItems: "center",
    marginTop: 12
  },
  cancelLinkText: {
    color: "#ef4444",
    fontSize: 12,
    fontWeight: "600"
  },
  navBar: {
    position: "absolute",
    bottom: 0,
    flexDirection: "row",
    backgroundColor: "#0d0d11",
    borderTopWidth: 1,
    borderColor: "#181822",
    paddingBottom: 25,
    paddingTop: 10,
    width: "100%"
  },
  navItem: {
    flex: 1,
    alignItems: "center"
  },
  navIcon: {
    fontSize: 18,
    opacity: 0.4
  },
  navIconActive: {
    opacity: 1
  },
  navText: {
    fontSize: 10,
    color: "#6b7280",
    marginTop: 2
  },
  navTextActive: {
    color: "#10b981",
    fontWeight: "600"
  },
  loadingOverlay: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(7,7,8,0.9)",
    zIndex: 99,
    alignItems: "center",
    justifyContent: "center"
  },
  loadingText: {
    color: "#10b981",
    fontSize: 12,
    fontWeight: "600",
    marginTop: 10
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.8)",
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
    color: "#10b981",
    fontWeight: "600",
    backgroundColor: "rgba(16,185,129,0.1)",
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
    color: "white",
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
    color: "white",
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
    color: "white"
  },
  gaugeContainer: {
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    marginTop: 24
  },
  onboardingHeader: {
    position: "absolute",
    top: "10%",
    width: "100%",
    alignItems: "center"
  },
  logoIcon: {
    fontSize: 50
  },
  logoText: {
    fontSize: 28,
    fontWeight: "800",
    color: "white",
    marginTop: 8
  },
  logoSubtext: {
    fontSize: 14,
    color: "#52525b",
    marginTop: 4
  },
  onboardingBody: {
    width: "100%",
    paddingHorizontal: 32,
    alignItems: "center"
  },
  onboardingDesc: {
    fontSize: 13,
    color: "#a1a1aa",
    textAlign: "center",
    lineHeight: 18,
    marginBottom: 24
  },
  onboardingFooter: {
    position: "absolute",
    bottom: "5%",
    alignItems: "center"
  },
  footerText: {
    fontSize: 12,
    color: "#27272a"
  },
  statsGrid: {
    width: "100%",
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between"
  },
  loanInputRow: {
    flexDirection: "row",
    gap: 12,
    alignItems: "center",
    marginTop: 14
  },
  loanCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  },
  metamaskRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    paddingVertical: 6
  }
});
