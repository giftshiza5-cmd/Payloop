// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";

interface ICreditScore {
    function recordContribution(address _user, bool _onTime) external;
}

interface ILoopToken {
    function mint(address _to, uint256 _amount) external;
}

/**
 * @title CircleVault
 * @dev Handles chama savings circles, member contributions, and multi-sig vault withdrawals.
 */
contract CircleVault is Ownable {
    // Group configuration
    string public name;
    uint256 public contributionAmount; // Minimum amount required per cycle (in wei)
    uint256 public cycleDuration; // Duration of a saving cycle in seconds (e.g. 1 week)
    uint256 public nextDeadline; // Timestamp for the next contribution deadline
    
    // Member tracking
    address[] public members;
    mapping(address => bool) public isMember;
    mapping(address => uint256) public totalContributions;
    mapping(address => uint256) public lastContributionCycle; // Cycle ID of last contribution
    uint256 public currentCycleId;
    
    // Multi-sig admins
    address[] public admins;
    mapping(address => bool) public isAdmin;
    uint256 public requiredApprovals; // Threshold of admin approvals required for withdrawal
    
    // Authorized lending pool contract
    address public lendingPool;
    
    // CreditScore contract
    address public creditScore;
    
    // LoopToken contract
    address public loopToken;
    
    // Multi-sig withdrawal proposals
    struct WithdrawalProposal {
        address payable recipient;
        uint256 amount;
        string reason;
        uint256 approvalCount;
        bool executed;
    }
    
    WithdrawalProposal[] public proposals;
    // proposalId => admin => approved
    mapping(uint256 => mapping(address => bool)) public hasApproved;
    
    // Events
    event MemberAdded(address indexed member);
    event MemberRemoved(address indexed member);
    event Contributed(address indexed member, uint256 amount, uint256 cycleId);
    event WithdrawalProposed(uint256 indexed proposalId, address indexed recipient, uint256 amount, string reason);
    event WithdrawalApproved(uint256 indexed proposalId, address indexed admin);
    event WithdrawalExecuted(uint256 indexed proposalId, address indexed recipient, uint256 amount);
    event LendingPoolSet(address indexed lendingPool);
    event CreditScoreSet(address indexed creditScore);
    event LoopTokenSet(address indexed loopToken);
    event LoanDisbursed(address indexed recipient, uint256 amount);
    event LoanRepaid(address indexed sender, uint256 amount);

    modifier onlyAdmin() {
        require(isAdmin[msg.sender], "CircleVault: caller is not an admin");
        _;
    }

    modifier onlyLendingPool() {
        require(msg.sender == lendingPool, "CircleVault: caller is not the LendingPool");
        _;
    }

    /**
     * @dev Constructor initializes the savings circle.
     * @param _name Name of the savings group.
     * @param _contributionAmount Amount required per cycle (in wei).
     * @param _cycleDuration Cycle length in seconds (e.g., 604800 for 1 week).
     * @param _admins List of admin addresses for the multi-sig vault.
     * @param _requiredApprovals Number of admin approvals required to execute a withdrawal.
     */
    constructor(
        string memory _name,
        uint256 _contributionAmount,
        uint256 _cycleDuration,
        address[] memory _admins,
        uint256 _requiredApprovals
    ) Ownable(msg.sender) {
        require(_admins.length > 0, "CircleVault: at least one admin required");
        require(_requiredApprovals > 0 && _requiredApprovals <= _admins.length, "CircleVault: invalid required approvals");
        
        name = _name;
        contributionAmount = _contributionAmount;
        cycleDuration = _cycleDuration;
        nextDeadline = block.timestamp + _cycleDuration;
        requiredApprovals = _requiredApprovals;
        currentCycleId = 1;
        
        for (uint256 i = 0; i < _admins.length; i++) {
            address admin = _admins[i];
            require(admin != address(0), "CircleVault: invalid admin address");
            require(!isAdmin[admin], "CircleVault: duplicate admin");
            admins.push(admin);
            isAdmin[admin] = true;
        }
    }

    /**
     * @dev Set the LendingPool contract address. Only owner (deployer) can set.
     */
    function setLendingPool(address _lendingPool) external onlyOwner {
        require(_lendingPool != address(0), "CircleVault: invalid lending pool address");
        lendingPool = _lendingPool;
        emit LendingPoolSet(_lendingPool);
    }

    /**
     * @dev Set the CreditScore contract address. Only owner can set.
     */
    function setCreditScore(address _creditScore) external onlyOwner {
        require(_creditScore != address(0), "CircleVault: invalid credit score address");
        creditScore = _creditScore;
        emit CreditScoreSet(_creditScore);
    }

    /**
     * @dev Set the LoopToken contract address. Only owner can set.
     */
    function setLoopToken(address _loopToken) external onlyOwner {
        require(_loopToken != address(0), "CircleVault: invalid loop token address");
        loopToken = _loopToken;
        emit LoopTokenSet(_loopToken);
    }

    /**
     * @dev Add a member to the chama. Only admins can add.
     */
    function addMember(address _member) external onlyAdmin {
        require(_member != address(0), "CircleVault: invalid member address");
        require(!isMember[_member], "CircleVault: already a member");
        
        isMember[_member] = true;
        members.push(_member);
        emit MemberAdded(_member);
    }

    /**
     * @dev Remove a member. Only admins can remove.
     */
    function removeMember(address _member) external onlyAdmin {
        require(isMember[_member], "CircleVault: not a member");
        isMember[_member] = false;
        
        // Remove from members array
        for (uint256 i = 0; i < members.length; i++) {
            if (members[i] == _member) {
                members[i] = members[members.length - 1];
                members.pop();
                break;
            }
        }
        emit MemberRemoved(_member);
    }

    /**
     * @dev Contribute funds for the current cycle.
     */
    function contribute() external payable {
        require(isMember[msg.sender], "CircleVault: caller is not a member");
        require(msg.value >= contributionAmount, "CircleVault: insufficient contribution amount");
        
        bool onTime = block.timestamp <= nextDeadline;
        if (creditScore != address(0)) {
            ICreditScore(creditScore).recordContribution(msg.sender, onTime);
        }
        if (onTime && loopToken != address(0)) {
            ILoopToken(loopToken).mint(msg.sender, 10 * 10**18); // 10 LOOP tokens
        }

        // Handle deadline rolling over if we are past it
        if (block.timestamp > nextDeadline) {
            uint256 cyclesMissed = (block.timestamp - nextDeadline) / cycleDuration + 1;
            nextDeadline += cyclesMissed * cycleDuration;
            currentCycleId += cyclesMissed;
        }
        
        totalContributions[msg.sender] += msg.value;
        lastContributionCycle[msg.sender] = currentCycleId;
        
        emit Contributed(msg.sender, msg.value, currentCycleId);
    }

    /**
     * @dev Record contribution made via mobile money (M-Pesa) on behalf of a member. Only admins/relayer can call.
     */
    function contributeOnBehalf(address _member) external payable onlyAdmin {
        require(isMember[_member], "CircleVault: target is not a member");
        require(msg.value >= contributionAmount, "CircleVault: insufficient contribution amount");
        
        bool onTime = block.timestamp <= nextDeadline;
        if (creditScore != address(0)) {
            ICreditScore(creditScore).recordContribution(_member, onTime);
        }
        if (onTime && loopToken != address(0)) {
            ILoopToken(loopToken).mint(_member, 10 * 10**18); // 10 LOOP tokens
        }

        // Handle deadline rolling over if we are past it
        if (block.timestamp > nextDeadline) {
            uint256 cyclesMissed = (block.timestamp - nextDeadline) / cycleDuration + 1;
            nextDeadline += cyclesMissed * cycleDuration;
            currentCycleId += cyclesMissed;
        }
        
        totalContributions[_member] += msg.value;
        lastContributionCycle[_member] = currentCycleId;
        
        emit Contributed(_member, msg.value, currentCycleId);
    }

    /**
     * @dev Propose a multi-sig vault withdrawal. Only admins can propose.
     */
    function proposeWithdrawal(
        address payable _recipient,
        uint256 _amount,
        string calldata _reason
    ) external onlyAdmin returns (uint256) {
        require(_recipient != address(0), "CircleVault: invalid recipient");
        require(_amount <= address(this).balance, "CircleVault: insufficient vault balance");
        
        uint256 proposalId = proposals.length;
        proposals.push(WithdrawalProposal({
            recipient: _recipient,
            amount: _amount,
            reason: _reason,
            approvalCount: 1,
            executed: false
        }));
        
        hasApproved[proposalId][msg.sender] = true;
        
        emit WithdrawalProposed(proposalId, _recipient, _amount, _reason);
        emit WithdrawalApproved(proposalId, msg.sender);
        
        return proposalId;
    }

    /**
     * @dev Approve an active withdrawal proposal. Only admins can approve.
     */
    function approveWithdrawal(uint256 _proposalId) external onlyAdmin {
        require(_proposalId < proposals.length, "CircleVault: invalid proposal ID");
        WithdrawalProposal storage proposal = proposals[_proposalId];
        require(!proposal.executed, "CircleVault: proposal already executed");
        require(!hasApproved[_proposalId][msg.sender], "CircleVault: already approved by this admin");
        
        proposal.approvalCount++;
        hasApproved[_proposalId][msg.sender] = true;
        
        emit WithdrawalApproved(_proposalId, msg.sender);
    }

    /**
     * @dev Execute an approved withdrawal proposal. Anyone can call once threshold met.
     */
    function executeWithdrawal(uint256 _proposalId) external {
        require(_proposalId < proposals.length, "CircleVault: invalid proposal ID");
        WithdrawalProposal storage proposal = proposals[_proposalId];
        require(!proposal.executed, "CircleVault: proposal already executed");
        require(proposal.approvalCount >= requiredApprovals, "CircleVault: insufficient admin approvals");
        require(proposal.amount <= address(this).balance, "CircleVault: insufficient vault balance for execution");
        
        proposal.executed = true;
        proposal.recipient.transfer(proposal.amount);
        
        emit WithdrawalExecuted(_proposalId, proposal.recipient, proposal.amount);
    }

    /**
     * @dev Disburse loan to a borrower. Can only be called by the authorized LendingPool.
     */
    function disburseLoan(address payable _borrower, uint256 _amount) external onlyLendingPool {
        require(_amount <= address(this).balance, "CircleVault: insufficient vault balance for loan");
        _borrower.transfer(_amount);
        emit LoanDisbursed(_borrower, _amount);
    }

    /**
     * @dev Repay loan back to the vault. Can only be called by the authorized LendingPool.
     */
    function repayLoan(address _borrower) external payable onlyLendingPool {
        emit LoanRepaid(_borrower, msg.value);
    }

    /**
     * @dev Fallback function to accept standard MATIC deposits.
     */
    receive() external payable {
        if (isMember[msg.sender]) {
            totalContributions[msg.sender] += msg.value;
            emit Contributed(msg.sender, msg.value, currentCycleId);
        }
    }

    // Helper view functions
    function getMembers() external view returns (address[] memory) {
        return members;
    }

    function getAdmins() external view returns (address[] memory) {
        return admins;
    }

    function getProposalsCount() external view returns (uint256) {
        return proposals.length;
    }
}
