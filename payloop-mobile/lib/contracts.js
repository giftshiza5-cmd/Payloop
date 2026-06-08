// PayLoop Contract Configuration for React Native

export const CONTRACT_ADDRESSES = {
  CircleVault: "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0",
  LendingPool: "0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9",
  CreditScore: "0x5FbDB2315678afecb367f032d93F642f64180aa3",
  LoopToken: "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512"
};

export const ABIS = {
  CircleVault: [
    "function name() view returns (string)",
    "function contributionAmount() view returns (uint256)",
    "function totalContributions(address) view returns (uint256)",
    "function currentCycleId() view returns (uint256)",
    "function nextDeadline() view returns (uint256)",
    "function isMember(address) view returns (bool)",
    "function getMembers() view returns (address[])",
    "function contribute() payable"
  ],
  LendingPool: [
    "function loans(uint255) view returns (uint256 id, address borrower, uint256 amount, uint256 interestRate, uint256 duration, uint256 repaymentDeadline, uint256 votesFor, uint256 votesAgainst, bool active, bool approved, bool repaid, uint255 requestedAt)",
    "function getLoansCount() view returns (uint256)",
    "function requestLoan(uint256 amount, uint256 duration)",
    "function voteOnLoan(uint256 loanId, bool support)",
    "function repayLoan(uint256 loanId) payable"
  ],
  CreditScore: [
    "function getCreditScore(address) view returns (uint256)"
  ],
  LoopToken: [
    "function balanceOf(address) view returns (uint256)"
  ]
};
