import { ethers } from "ethers";
import { Platform } from "react-native";
import { CONTRACT_ADDRESSES, ABIS } from "./contracts";

// Determine local Hardhat or Amoy testnet RPC Endpoint
const defaultRpc = "https://rpc-amoy.polygon.technology";
let rpcUrl = process.env.EXPO_PUBLIC_AMOY_RPC_URL;
if (!rpcUrl) {
  rpcUrl = defaultRpc;
}

// If we are on Android emulator, replace localhost references with Android localhost loopback IP
if (rpcUrl && typeof rpcUrl === "string" && Platform.OS === "android") {
  rpcUrl = rpcUrl.replace("localhost", "10.0.2.2").replace("127.0.0.1", "10.0.2.2");
}

// -------------------------------------------------------------
// ADDRESS VALIDATION — strict 42-char hex check
// Returns true only for a proper EVM address like 0x + 40 hex chars
// -------------------------------------------------------------
export const isValidEVMAddress = (address) => {
  if (!address || typeof address !== "string") return false;
  if (address.length !== 42) return false;          // must be exactly 42 chars
  if (!address.startsWith("0x")) return false;       // must start with 0x
  return ethers.isAddress(address);                  // ethers internal checksum check
};

// -------------------------------------------------------------
// PROVIDER & MOCK SIGNERS INITIALIZER
// -------------------------------------------------------------
export const getProvider = () => {
  return new ethers.JsonRpcProvider(rpcUrl);
};

// Hardhat default accounts private keys for testing sandbox environment
const MOCK_KEYS = {
  // Treasurer (Admin) - Account #0
  "0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266": "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80",
  // John Kamau - Account #1
  "0x90f79bf6eb2c4f870365e785982e1f101e93b906": "0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d",
  // Mary Wanjiku - Account #2
  "0x3c44cdddb6a900fa2b585dd299e03d12fa4293bc": "0x5de4111afa70414177ec497b7b112110055c567a261a2c793873426c14e07c03"
};

export const getSigner = (address) => {
  if (!address || !isValidEVMAddress(address)) return null;
  const provider = getProvider();
  const normalizedAddress = address.toLowerCase().trim();
  const key = MOCK_KEYS[normalizedAddress];
  if (key) {
    return new ethers.Wallet(key, provider);
  }
  return null;
};

// -------------------------------------------------------------
// CONTRACT ACCESSORS
// -------------------------------------------------------------
export const getCircleVaultContract = (providerOrSigner) => {
  return new ethers.Contract(CONTRACT_ADDRESSES.CircleVault, ABIS.CircleVault, providerOrSigner);
};

export const getLendingPoolContract = (providerOrSigner) => {
  return new ethers.Contract(CONTRACT_ADDRESSES.LendingPool, ABIS.LendingPool, providerOrSigner);
};

export const getCreditScoreContract = (providerOrSigner) => {
  return new ethers.Contract(CONTRACT_ADDRESSES.CreditScore, ABIS.CreditScore, providerOrSigner);
};

export const getLoopTokenContract = (providerOrSigner) => {
  return new ethers.Contract(CONTRACT_ADDRESSES.LoopToken, ABIS.LoopToken, providerOrSigner);
};

// -------------------------------------------------------------
// READ OPERATIONS — all wrapped with graceful fallbacks
// -------------------------------------------------------------

/**
 * Fetch on-chain credit score. Returns 500 if contract not deployed or returns empty data.
 */
export const fetchOnChainCreditScore = async (address) => {
  if (!isValidEVMAddress(address)) {
    console.log(`[blockchain] Skipping getCreditScore: invalid address "${address}"`);
    return 500; // default credit score
  }
  try {
    const provider = getProvider();
    const contract = getCreditScoreContract(provider);
    const score = await contract.getCreditScore(address);
    const parsed = Number(score);
    // If contract returns 0 (not initialized), return a sensible default
    return parsed > 0 ? parsed : 500;
  } catch (err) {
    // BAD_DATA means contract not deployed on this network — silent fallback
    if (err.code === "BAD_DATA" || err.code === "CALL_EXCEPTION") {
      console.log("[blockchain] getCreditScore: contract not on this network, using default 500");
      return 500;
    }
    throw err; // re-throw unexpected errors
  }
};

/**
 * Fetch on-chain LoopToken balance. Returns 0 if contract unavailable.
 */
export const fetchOnChainLoopBalance = async (address) => {
  if (!isValidEVMAddress(address)) {
    console.log(`[blockchain] Skipping balanceOf: invalid address "${address}"`);
    return 0;
  }
  try {
    const provider = getProvider();
    const contract = getLoopTokenContract(provider);
    const balance = await contract.balanceOf(address);
    return Number(ethers.formatEther(balance));
  } catch (err) {
    if (err.code === "BAD_DATA" || err.code === "CALL_EXCEPTION") {
      console.log("[blockchain] balanceOf: contract not on this network, returning 0");
      return 0;
    }
    throw err;
  }
};

/**
 * Fetch vault details. Returns safe defaults if contract unavailable.
 */
export const fetchOnChainVaultDetails = async () => {
  const defaults = {
    name: "Green Savers Eldoret",
    vaultBalance: 0,
    nextDeadline: "N/A",
    contributionAmount: 0.1
  };
  try {
    const provider = getProvider();
    const contract = getCircleVaultContract(provider);

    const name = await contract.name();
    const balanceWei = await provider.getBalance(CONTRACT_ADDRESSES.CircleVault);
    const nextDeadlineUnix = await contract.nextDeadline();
    const contributionAmountWei = await contract.contributionAmount();

    return {
      name,
      vaultBalance: parseFloat(ethers.formatEther(balanceWei)),
      nextDeadline: new Date(Number(nextDeadlineUnix) * 1000).toLocaleDateString("en-GB", {
        day: "numeric", month: "short", year: "numeric"
      }),
      contributionAmount: parseFloat(ethers.formatEther(contributionAmountWei))
    };
  } catch (err) {
    if (err.code === "BAD_DATA" || err.code === "CALL_EXCEPTION") {
      console.log("[blockchain] fetchOnChainVaultDetails: contract not on this network, using defaults");
      return defaults;
    }
    throw err;
  }
};

/**
 * Fetch member list from CircleVault. Returns [] if unavailable.
 */
export const fetchOnChainMembers = async () => {
  try {
    const provider = getProvider();
    const vault = getCircleVaultContract(provider);
    const memberAddresses = await vault.getMembers();

    const memberDetails = [];
    for (const addr of memberAddresses) {
      try {
        const totalContributionWei = await vault.totalContributions(addr);
        memberDetails.push({
          address: addr,
          totalContribution: parseFloat(ethers.formatEther(totalContributionWei))
        });
      } catch {
        memberDetails.push({ address: addr, totalContribution: 0 });
      }
    }
    return memberDetails;
  } catch (err) {
    if (err.code === "BAD_DATA" || err.code === "CALL_EXCEPTION") {
      console.log("[blockchain] fetchOnChainMembers: contract not on this network, returning []");
      return [];
    }
    throw err;
  }
};

/**
 * Fetch active loans from LendingPool. Returns [] if unavailable.
 */
export const fetchOnChainLoans = async () => {
  try {
    const provider = getProvider();
    const pool = getLendingPoolContract(provider);
    const count = await pool.getLoansCount();

    const loans = [];
    for (let i = 0; i < Number(count); i++) {
      try {
        const loan = await pool.loans(i);
        loans.push({
          id: Number(loan.id),
          borrower: loan.borrower,
          amount: parseFloat(ethers.formatEther(loan.amount)),
          interestRate: parseFloat(loan.interestRate.toString()) / 100,
          duration: Number(loan.duration),
          votesFor: Number(loan.votesFor),
          votesAgainst: Number(loan.votesAgainst),
          active: loan.active,
          approved: loan.approved,
          repaid: loan.repaid,
          purpose: "Chama Loan Project"
        });
      } catch {
        // Skip malformed loan entries
      }
    }
    return loans;
  } catch (err) {
    if (err.code === "BAD_DATA" || err.code === "CALL_EXCEPTION") {
      console.log("[blockchain] fetchOnChainLoans: contract not on this network, returning []");
      return [];
    }
    throw err;
  }
};

// -------------------------------------------------------------
// WRITE OPERATIONS — guard against missing signer & low balance
// -------------------------------------------------------------

/**
 * Submit contribution to CircleVault. Throws a user-friendly error if not possible.
 */
export const executeOnChainContribution = async (userAddress, amountEth) => {
  if (!isValidEVMAddress(userAddress)) {
    throw new Error("No signer/private key available for this wallet address");
  }
  const signer = getSigner(userAddress);
  if (!signer) {
    throw new Error("No signer/private key available for this wallet address");
  }

  // Check balance before attempting
  const provider = getProvider();
  const balance = await provider.getBalance(userAddress);
  const required = ethers.parseEther(amountEth.toString());
  if (balance < required) {
    throw new Error(`Insufficient funds: have ${ethers.formatEther(balance)} ETH, need ${amountEth} ETH`);
  }

  const vault = getCircleVaultContract(signer);
  const tx = await vault.contribute({ value: required });
  await tx.wait();
  return tx.hash;
};

/**
 * Request a loan from LendingPool.
 */
export const executeOnChainLoanRequest = async (userAddress, amountEth, durationMonths) => {
  if (!isValidEVMAddress(userAddress)) {
    throw new Error("No signer/private key available for this wallet address");
  }
  const signer = getSigner(userAddress);
  if (!signer) {
    throw new Error("No signer/private key available for this wallet address");
  }

  const pool = getLendingPoolContract(signer);
  const tx = await pool.requestLoan(
    ethers.parseEther(amountEth.toString()),
    Number(durationMonths)
  );
  await tx.wait();
  return tx.hash;
};

/**
 * Vote on a loan request.
 */
export const executeOnChainVote = async (userAddress, loanId, support) => {
  if (!isValidEVMAddress(userAddress)) {
    throw new Error("No signer/private key available for this wallet address");
  }
  const signer = getSigner(userAddress);
  if (!signer) {
    throw new Error("No signer/private key available for this wallet address");
  }

  const pool = getLendingPoolContract(signer);
  const tx = await pool.voteOnLoan(Number(loanId), support);
  await tx.wait();
  return tx.hash;
};

/**
 * Repay a loan.
 */
export const executeOnChainRepayment = async (userAddress, loanId, amountEth) => {
  if (!isValidEVMAddress(userAddress)) {
    throw new Error("No signer/private key available for this wallet address");
  }
  const signer = getSigner(userAddress);
  if (!signer) {
    throw new Error("No signer/private key available for this wallet address");
  }

  const pool = getLendingPoolContract(signer);
  const tx = await pool.repayLoan(Number(loanId), {
    value: ethers.parseEther(amountEth.toString())
  });
  await tx.wait();
  return tx.hash;
};
