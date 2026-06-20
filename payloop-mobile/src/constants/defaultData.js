export const KES_PER_USDC = 130;

export const DEFAULT_MEMBERS = [
  { name: "Mary Wanjiku", handle: "@mary.w", status: "Active", avatar: "👩‍🌾" },
  { name: "Peter Mwangi", handle: "@peterm", status: "Active", avatar: "👨‍🔧" },
  { name: "Grace Njeri", handle: "@gracen", status: "Active", avatar: "👩‍💼" },
  { name: "David Ochieng", handle: "@david.o", status: "Active", avatar: "👨‍🌾" },
  { name: "Esther Muthoni", handle: "@esther.m", status: "Inactive", avatar: "👩‍⚕️" }
];

export const DEFAULT_NOTIFICATIONS = [
  { id: 1, title: "Contribution Reminder", message: "You have a contribution of 100 USDC due in 5 days.", time: "2m ago", icon: "⏰" },
  { id: 2, title: "Loan Request Update", message: "Your loan request of 15,000 USDC is under review.", time: "1h ago", icon: "🤝" },
  { id: 3, title: "Contribution Received", message: "Mary Wanjiku contributed 100 USDC to the group.", time: "3h ago", icon: "🟢" },
  { id: 4, title: "Meeting Announcement", message: "Group meeting on 15 May 2024 at 7:00 PM.", time: "1d ago", icon: "📢" }
];

export const DEFAULT_TRANSACTIONS = [
  { id: 1, type: "Contribution", amount: -100.00, date: "5 May 2024, 10:30 AM", status: "Completed", isIncome: false },
  { id: 2, type: "Loan Disbursement", amount: 15000.00, date: "2 May 2024, 02:15 PM", status: "Completed", isIncome: true },
  { id: 3, type: "Loan Repayment", amount: -2500.00, date: "28 Apr 2024, 08:20 AM", status: "Completed", isIncome: false },
  { id: 4, type: "Withdrawal Request", amount: -500.00, date: "25 Apr 2024, 11:10 AM", status: "Pending", isIncome: false },
  { id: 5, type: "Contribution", amount: -100.00, date: "21 Apr 2024, 10:30 AM", status: "Completed", isIncome: false }
];

export const DEFAULT_LOANS = [
  {
    id: 0,
    borrower: "John Kamau",
    address: "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC",
    amount: 15000.00,
    interestRate: 7.5,
    duration: 6,
    votesFor: 4,
    votesAgainst: 1,
    active: true,
    approved: true,
    repaid: false,
    repaymentDeadline: Math.floor(Date.now() / 1000) + 15 * 86400,
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
