// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title LoopToken
 * @dev LoopPoints ERC-20 reward token minted to chama members for good saving habits.
 */
contract LoopToken is ERC20, Ownable {
    mapping(address => bool) public isMinter;

    event MinterSet(address indexed minter, bool status);

    modifier onlyMinter() {
        require(isMinter[msg.sender] || msg.sender == owner(), "LoopToken: caller is not a minter");
        _;
    }

    constructor() ERC20("LoopPoints", "LOOP") Ownable(msg.sender) {
        // Mint initial supply of 1,000,000 LOOP to the owner for initial liquidity/airdrops
        _mint(msg.sender, 1_000_000 * 10**decimals());
        isMinter[msg.sender] = true;
    }

    /**
     * @dev Set minter status for external contracts (e.g., CircleVault, LendingPool).
     */
    function setMinter(address _minter, bool _status) external onlyOwner {
        require(_minter != address(0), "LoopToken: invalid minter address");
        isMinter[_minter] = _status;
        emit MinterSet(_minter, _status);
    }

    /**
     * @dev Mint new LoopPoints. Only authorized minters can call.
     */
    function mint(address _to, uint256 _amount) external onlyMinter {
        require(_to != address(0), "LoopToken: invalid recipient address");
        _mint(_to, _amount);
    }
}
