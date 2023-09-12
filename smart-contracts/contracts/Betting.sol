// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.9;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {MyERC20Token} from "./MyERC20.sol";

/// @title Betting Contract using ERC20
/// @author Nadina Oates
/// @notice You can use this contract for running futures bets on price movement
/// @dev
/// @custom:teaching This is a bootcamp final project
contract Betting is Ownable {
    /// @notice Address of the token used as payment for the bets
    MyERC20Token public paymentToken;
    /// @notice Amount of tokens required for placing a bet that goes for the prize pool
    uint256 public betPrice;
    /// @notice Amount of tokens required for placing a bet that goes for the owner pool
    uint256 public betFee;
    /// @notice Amount of tokens in the prize pool
    uint256 public totalPool;
    /// @notice Amount of tokens betting UP
    uint256 public upPool;
    /// @notice Amount of tokens betting DOWN
    uint256 public downPool;
    /// @notice Amount of tokens in the owner pool
    uint256 public ownerPool;
    /// @notice Flag indicating whether the betting is open for bets or not
    bool public roundOpen;
    /// @notice Timestamp of the lottery next closing date and time
    uint256 public roundClosingTime;
    /// @notice Mapping of prize available for withdraw for each account
    mapping(address => uint256) public prize;
    /// @notice Mapping of betting info for each account
    mapping(address => BetInfo) public book;

    enum Position {
        up, down
    }

    struct BetInfo {
        Position position;
        uint256 amount;
        bool claimed;
    }


    /// @notice Constructor function
    /// @param _tokenAddress address of the token contract
    constructor(address _tokenAddress) {
        paymentToken = MyERC20Token(_tokenAddress);
    }

    /// @notice Passes when the betting round is at closed state
    modifier whenRoundClosed() {
        require(!roundOpen, "Betting is open");
        _;
    }

    /// @notice Passes when the betting is at open state and the current block timestamp is lower than the betting closing date
    modifier whenRoundOpen() {
        require(
            roundOpen && block.timestamp < roundClosingTime,
            "Betting round is closed"
        );
        _;
    }

    /// @notice Opens the betting round for receiving bets
    function openRound(uint256 closingTime) external onlyOwner whenRoundClosed {
        require(
            closingTime > block.timestamp,
            "Closing time must be in the future"
        );
        roundClosingTime = closingTime;
        roundOpen = true;
    }

    /// @notice the sender's address places a bet with a token amount for UP
    function betUp(uint256 amount) public whenRoundOpen {
        // ownerPool += betFee * amount;
        upPool += amount;
        book[msg.sender].position = Position.up;
        book[msg.sender].amount += amount;
        paymentToken.transferFrom(msg.sender, address(this), amount);
    }

    /// @notice  the sender's address places a bet with a token amount for DOWN
    function betDown(uint256 amount) public whenRoundOpen {
        // ownerPool += betFee * amount;
        downPool += amount;
        book[msg.sender].position = Position.down;
        book[msg.sender].amount += amount;
        paymentToken.transferFrom(msg.sender, address(this), amount);
    }
    
    /// @notice Closes the betting round and calculates the prize, if any
    /// @dev Anyone can call this function at any time after the closing time
    function closeRound() external onlyOwner {
        require(block.timestamp >= roundClosingTime, "Too soon to close");
        require(roundOpen, "Already closed");
        // if (_slots.length > 0) {
        //     // TODO
        //     // uint256 winnerIndex = getRandomNumber() % _slots.length;
        //     // address winner = _slots[winnerIndex];
        //     // prize[winner] += totalPool;
        //     totalPool = 0;
        // }
        roundOpen = false;
    }

    /// @notice Withdraws `amount` from that accounts's prize pool
    function claimPrize(uint256 amount) external {
        require(amount <= prize[msg.sender], "Not enough prize");
        prize[msg.sender] -= amount;
        paymentToken.transfer(msg.sender, amount);
    }

    /// @notice Withdraws `amount` from the owner's pool
    function ownerWithdraw(uint256 amount) external onlyOwner {
        require(amount <= ownerPool, "Not enough fees collected");
        ownerPool -= amount;
        paymentToken.transfer(msg.sender, amount);
    }
}
