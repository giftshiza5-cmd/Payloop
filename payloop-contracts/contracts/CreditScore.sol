// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title CreditScore
 * @dev Manages on-chain user credit reputation scores. Clamped between 100 and 1000.
 */
contract CreditScore is Ownable {
    mapping(address => uint256) private scores;
    mapping(address => bool) public isAuthorizedCaller;
    
    uint256 public constant DEFAULT_SCORE = 500;
    uint256 public constant MIN_SCORE = 100;
    uint256 public constant MAX_SCORE = 1000;

    event ScoreUpdated(address indexed user, uint256 newScore, string changeType);
    event CallerAuthorized(address indexed caller, bool status);

    modifier onlyAuthorized() {
        require(isAuthorizedCaller[msg.sender] || msg.sender == owner(), "CreditScore: caller is not authorized");
        _;
    }

    constructor() Ownable(msg.sender) {
        isAuthorizedCaller[msg.sender] = true;
    }

    /**
     * @dev Set authorization status for external contracts (e.g. CircleVault, LendingPool).
     */
    function setAuthorizedCaller(address _caller, bool _status) external onlyOwner {
        require(_caller != address(0), "CreditScore: invalid caller address");
        isAuthorizedCaller[_caller] = _status;
        emit CallerAuthorized(_caller, _status);
    }

    /**
     * @dev Fetch user credit score. Defaults to 500 if never set.
     */
    function getCreditScore(address _user) external view returns (uint256) {
        require(_user != address(0), "CreditScore: invalid user address");
        uint256 score = scores[_user];
        return score == 0 ? DEFAULT_SCORE : score;
    }

    /**
     * @dev Add score points.
     */
    function _addPoints(address _user, uint256 _points, string memory _type) internal {
        uint256 currentScore = scores[_user] == 0 ? DEFAULT_SCORE : scores[_user];
        uint256 newScore = currentScore + _points;
        if (newScore > MAX_SCORE) {
            newScore = MAX_SCORE;
        }
        scores[_user] = newScore;
        emit ScoreUpdated(_user, newScore, _type);
    }

    /**
     * @dev Deduct score points.
     */
    function _deductPoints(address _user, uint256 _points, string memory _type) internal {
        uint256 currentScore = scores[_user] == 0 ? DEFAULT_SCORE : scores[_user];
        uint256 newScore = currentScore > _points ? currentScore - _points : MIN_SCORE;
        if (newScore < MIN_SCORE) {
            newScore = MIN_SCORE;
        }
        scores[_user] = newScore;
        emit ScoreUpdated(_user, newScore, _type);
    }

    /**
     * @dev Record chama contribution status.
     */
    function recordContribution(address _user, bool _onTime) external onlyAuthorized {
        if (_onTime) {
            _addPoints(_user, 10, "CONTRIBUTION_ON_TIME");
        } else {
            _deductPoints(_user, 20, "CONTRIBUTION_LATE");
        }
    }

    /**
     * @dev Record loan repayment status.
     */
    function recordLoanRepayment(address _user, bool _onTime) external onlyAuthorized {
        if (_onTime) {
            _addPoints(_user, 15, "LOAN_REPAID_ON_TIME");
        } else {
            _addPoints(_user, 5, "LOAN_REPAID_LATE");
        }
    }

    /**
     * @dev Record loan defaults. Heavy deduction.
     */
    function recordLoanDefault(address _user) external onlyAuthorized {
        _deductPoints(_user, 100, "LOAN_DEFAULT");
    }
}
