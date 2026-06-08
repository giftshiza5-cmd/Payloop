// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";

interface ICircleVault {
    function isMember(address _member) external view returns (bool);
    function getMembers() external view returns (address[] memory);
    function disburseLoan(address payable _borrower, uint256 _amount) external;
    function repayLoan(address _borrower) external payable;
}

interface ICreditScore {
    function getCreditScore(address _user) external view returns (uint256);
    function recordLoanRepayment(address _user, bool _onTime) external;
    function recordLoanDefault(address _user) external;
}

/**
 * @title LendingPool
 * @dev Manages chama loan requests, member voting, dynamic interest rates, disbursement, and repayments.
 */
contract LendingPool is Ownable {
    ICircleVault public circleVault;
    ICreditScore public creditScore;

    struct Loan {
        uint256 id;
        address payable borrower;
        uint256 amount;
        uint256 interestRate; // In basis points (e.g. 500 = 5%)
        uint256 duration; // Duration in seconds
        uint256 repaymentDeadline;
        uint256 votesFor;
        uint256 votesAgainst;
        bool active;
        bool approved;
        bool repaid;
        uint256 requestedAt;
    }

    Loan[] public loans;
    
    // loanId => voter => hasVoted
    mapping(uint256 => mapping(address => bool)) public hasVoted;
    
    // Configurable parameters
    uint256 public votingPeriod = 3 days;
    uint256 public consensusThreshold = 50; // Required percentage of approval (e.g. 50 = 50%)
    uint256 public constant BASE_INTEREST_RATE = 1000; // 10% baseline in basis points

    event LoanRequested(uint256 indexed loanId, address indexed borrower, uint256 amount, uint256 interestRate);
    event Voted(uint256 indexed loanId, address indexed voter, bool support, uint256 currentVotesFor);
    event LoanApproved(uint256 indexed loanId);
    event LoanDisbursed(uint256 indexed loanId, address indexed borrower, uint256 amount);
    event LoanRepaid(uint256 indexed loanId, address indexed borrower, uint256 amountPaid);
    event LoanDefaulted(uint256 indexed loanId, address indexed borrower);

    modifier onlyMember() {
        require(circleVault.isMember(msg.sender), "LendingPool: caller is not a chama member");
        _;
    }

    constructor(address _circleVault, address _creditScore) Ownable(msg.sender) {
        require(_circleVault != address(0), "LendingPool: invalid vault address");
        require(_creditScore != address(0), "LendingPool: invalid credit score address");
        circleVault = ICircleVault(_circleVault);
        creditScore = ICreditScore(_creditScore);
    }

    /**
     * @dev Submit a loan request. Interest rate is dynamic based on borrower's credit score.
     */
    function requestLoan(uint256 _amount, uint256 _duration) external onlyMember {
        require(_amount > 0, "LendingPool: amount must be greater than 0");
        require(_duration > 0, "LendingPool: duration must be greater than 0");

        // Calculate dynamic interest rate based on credit score
        // Default CreditScore range is 0 to 1000. 
        // A higher score (e.g., 800+) gets a lower interest rate (5%). 
        // A lower score (e.g., <300) gets standard rate (10%).
        uint256 score = creditScore.getCreditScore(msg.sender);
        uint256 interestRate = BASE_INTEREST_RATE; // 10% baseline
        
        if (score >= 800) {
            interestRate = 500; // 5% interest
        } else if (score >= 600) {
            interestRate = 700; // 7% interest
        } else if (score >= 400) {
            interestRate = 850; // 8.5% interest
        }

        uint256 loanId = loans.length;
        loans.push(Loan({
            id: loanId,
            borrower: payable(msg.sender),
            amount: _amount,
            interestRate: interestRate,
            duration: _duration,
            repaymentDeadline: 0,
            votesFor: 0,
            votesAgainst: 0,
            active: true,
            approved: false,
            repaid: false,
            requestedAt: block.timestamp
        }));

        emit LoanRequested(loanId, msg.sender, _amount, interestRate);
    }

    /**
     * @dev Vote on a pending loan request. One member = one vote.
     */
    function voteOnLoan(uint256 _loanId, bool _support) external onlyMember {
        require(_loanId < loans.length, "LendingPool: invalid loan ID");
        Loan storage loan = loans[_loanId];
        require(loan.active, "LendingPool: loan request is not active");
        require(!loan.approved, "LendingPool: loan is already approved");
        require(block.timestamp <= loan.requestedAt + votingPeriod, "LendingPool: voting period has ended");
        require(!hasVoted[_loanId][msg.sender], "LendingPool: member has already voted");

        hasVoted[_loanId][msg.sender] = true;

        if (_support) {
            loan.votesFor++;
        } else {
            loan.votesAgainst++;
        }

        emit Voted(_loanId, msg.sender, _support, loan.votesFor);

        // Check if consensus is met to auto-approve
        address[] memory membersList = circleVault.getMembers();
        uint256 totalMembers = membersList.length;
        require(totalMembers > 0, "LendingPool: vault has no members");

        // (votesFor * 100) / totalMembers >= consensusThreshold
        if ((loan.votesFor * 100) / totalMembers >= consensusThreshold) {
            loan.approved = true;
            emit LoanApproved(_loanId);
        }
    }

    /**
     * @dev Disburse approved loan. Borrower or admin can trigger.
     */
    function disburseLoan(uint256 _loanId) external {
        require(_loanId < loans.length, "LendingPool: invalid loan ID");
        Loan storage loan = loans[_loanId];
        require(loan.approved, "LendingPool: loan is not approved");
        require(loan.active, "LendingPool: loan is not active");
        require(loan.repaymentDeadline == 0, "LendingPool: already disbursed");

        loan.repaymentDeadline = block.timestamp + loan.duration;
        circleVault.disburseLoan(loan.borrower, loan.amount);

        emit LoanDisbursed(_loanId, loan.borrower, loan.amount);
    }

    /**
     * @dev Repay loan with interest.
     */
    function repayLoan(uint256 _loanId) external payable {
        require(_loanId < loans.length, "LendingPool: invalid loan ID");
        Loan storage loan = loans[_loanId];
        require(loan.active && loan.approved, "LendingPool: loan is not in active repayment state");
        require(!loan.repaid, "LendingPool: loan already repaid");

        // Calculate amount due (amount + interest)
        uint256 interestAmount = (loan.amount * loan.interestRate) / 10000;
        uint256 totalDue = loan.amount + interestAmount;

        require(msg.value >= totalDue, "LendingPool: insufficient repayment amount");

        loan.repaid = true;
        loan.active = false;

        // Return funds back to the CircleVault
        circleVault.repayLoan{value: msg.value}(loan.borrower);

        // Record repayment status on-chain in CreditScore
        bool onTime = block.timestamp <= loan.repaymentDeadline;
        creditScore.recordLoanRepayment(loan.borrower, onTime);

        // Refund excess tokens if sent too much
        if (msg.value > totalDue) {
            payable(msg.sender).transfer(msg.value - totalDue);
        }

        emit LoanRepaid(_loanId, loan.borrower, totalDue);
    }

    /**
     * @dev Check and flag default if deadline has passed.
     */
    function flagDefault(uint256 _loanId) external {
        require(_loanId < loans.length, "LendingPool: invalid loan ID");
        Loan storage loan = loans[_loanId];
        require(loan.active && loan.approved && !loan.repaid, "LendingPool: loan not in active status");
        require(block.timestamp > loan.repaymentDeadline, "LendingPool: deadline not yet passed");

        loan.active = false;
        creditScore.recordLoanDefault(loan.borrower);

        emit LoanDefaulted(_loanId, loan.borrower);
    }

    // Helper view functions
    function getLoansCount() external view returns (uint256) {
        return loans.length;
    }
}
