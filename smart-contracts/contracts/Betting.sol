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
    /// @notice betting free going to owner: rate (e.g. 200 = 2%, 150 = 1.50%)
    uint256 public bettingFee;
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
    /// @notice Locked price at the start of the round
    uint256 public lockedPrice;
    /// @notice Winner: UP == true, DOWN == false
    Position public winner;
    /// @notice reward amount that is totally paid out
    uint256 public rewardAmount;
    /// @notice reward amount to calculate the proportions between winners
    uint256 public rewardBaseAmount;

    /// @notice Mapping of prize available for withdraw for each account
    mapping(address => uint256) public prize;
    /// @notice Mapping of betting info for each account
    mapping(address => BetInfo) public book;

    /// @notice Positions to bet on
    enum Position {
        up,
        down
    }
    /// @notice bettig info for each player
    struct BetInfo {
        Position position;
        uint256 amount;
        bool claimed;
    }

    /// @notice Constructor function
    /// @param _tokenAddress address of the token contract
    constructor(address _tokenAddress) {
        paymentToken = MyERC20Token(_tokenAddress);

        // set betting fee to 0.2%
        bettingFee = 20; 
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
    function openRound(uint256 _closingTime, uint256 _startPrice) external onlyOwner whenRoundClosed {
        require(
            _closingTime > block.timestamp,
            "Closing time must be in the future"
        );
        roundClosingTime = _closingTime;

        lockedPrice = _startPrice;

        roundOpen = true;
    }

    /// @notice the sender's address places a bet with a token amount for UP
    function betUp(uint256 amount) public whenRoundOpen {
        // ownerPool += bettingFee * amount;
        totalPool += amount;
        upPool += amount;
        book[msg.sender].position = Position.up;
        book[msg.sender].amount += amount;
        paymentToken.transferFrom(msg.sender, address(this), amount);
    }

    /// @notice  the sender's address places a bet with a token amount for DOWN
    function betDown(uint256 amount) public whenRoundOpen {
        // ownerPool += bettingFee * amount;

        totalPool += amount;
        downPool += amount;
        book[msg.sender].position = Position.down;
        book[msg.sender].amount += amount;
        paymentToken.transferFrom(msg.sender, address(this), amount);
    }

    /// @notice Closes the betting round and calculates the prize, if any
    /// @dev Anyone can call this function at any time after the closing time
    function closeRound(uint256 endPrice) external onlyOwner {
        require(block.timestamp >= roundClosingTime, "Too soon to close");
        require(roundOpen, "Already closed");

        uint256 fee;
        if (lockedPrice < endPrice) {
            // UP wins
            winner = Position.up;
            fee = (totalPool * bettingFee) / 10000 ;
            ownerPool += fee;
            rewardAmount = totalPool - fee;
            rewardBaseAmount = upPool;
            
        } else if (lockedPrice > endPrice){
            // DOWN wins
            winner = Position.down;
            fee = (totalPool * bettingFee) / 10000 ;
            ownerPool += fee;
            rewardAmount = totalPool - fee;
            rewardBaseAmount = downPool;
        }
        else {
            // House wins
            ownerPool += totalPool;
        }
        totalPool = 0;
        lockedPrice = 0;
        roundOpen = false;
    }

    function eligible(address account) public view returns (bool){
        if (book[account].position == winner && book[account].claimed == false){
            return true;
        }
        else {
            return false;
        }
    }

    /// @notice withdraws prize (need reentrancy guard?)
    function claimPrize() external {
        require(eligible(msg.sender), "Not eligible for prize.");
        uint256 amount = book[msg.sender].amount * rewardAmount / rewardBaseAmount;
        book[msg.sender].claimed = true;
        paymentToken.transfer(msg.sender, amount);

    }

    function reward(address account) external view returns (uint256) {
        return (book[account].amount * rewardAmount / rewardBaseAmount);
    }

    /// @notice withdraws ownerpool from the owner's pool (need reentrancy guard?)
    function ownerWithdraw() external onlyOwner {
        require(ownerPool > 0, "Not enough fees collected");
        paymentToken.transfer(msg.sender, ownerPool);
    }
}
