// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.9;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import {AggregatorV3Interface} from "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";

import {MyERC20Token} from "./MyERC20.sol";

/// @title Betting Contract using ERC20
/// @author Nadina Oates
/// @notice You can use this contract for running futures bets on price movement
/// @dev
/// @custom:learning This is a bootcamp final project
contract Betting is Ownable, ReentrancyGuard {
    /// @notice Oracle interface from Chainlink
    AggregatorV3Interface internal dataFeed;
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
    /// @notice Timestamp of the round's next closing date and time
    uint256 public roundClosingTime;
    /// @notice Timestamp of the betting not allowed anymore: must be before closing time
    uint256 public roundLockTime;
    /// @notice Locked price at the start of the round
    int256 public lockedPrice;
    /// @notice Locked price at the start of the round
    int256 public endPrice;
    /// @notice Winner: UP == true, DOWN == false
    Position public winner;
    /// @notice reward amount that is totally paid out
    uint256 public rewardAmount;
    /// @notice reward amount to calculate the proportions between winners
    uint256 public rewardBaseAmount;
   
    /// @notice Mapping of betting info for each account
    mapping(address => BetInfo) public book;

    /// @notice Positions to bet on
    enum Position {
        none,
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

        // initialize oracle
        dataFeed = AggregatorV3Interface(0x1b44F3514812d835EB1BDB0acB33d3fA3351Ee43);
    }

    /// @notice Passes when the betting round is at closed state
    modifier whenRoundClosed() {
        require(!roundOpen, "Betting round is open");
        _;
    }

    /// @notice Passes when the betting is at open state and the current block timestamp is lower than the betting closing date
    modifier whenRoundOpen() {
        require(
            roundOpen && block.timestamp < roundLockTime,
            "Betting round is closed"
        );
        _;
    }

    /// @notice Opens the betting round for receiving bets
    function openRound(uint256 _lockTime, uint256 _closingTime) external onlyOwner whenRoundClosed {
        require(
            _closingTime > block.timestamp,
            "Closing time must be in the future"
        );
        require(
            _closingTime > _lockTime,
            "Closing time must be later than lock time"
        );
        roundClosingTime = _closingTime;
        roundLockTime = _lockTime;
        lockedPrice = getLatestData();

        rewardAmount = 0;
        rewardBaseAmount = 0;
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
    /// @dev Only owner can call this function at any time after the closing time
    function closeRound() external onlyOwner {
        require(block.timestamp >= roundClosingTime, "Too soon to close");
        require(roundOpen, "Already closed");
        endPrice =  getLatestData() + 10; // oracle returns same value because of update frequency: (+ 10) simulates price increase

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
            winner = Position.none;
            ownerPool += totalPool;
        }
        totalPool = 0;
        lockedPrice = 0;
        roundOpen = false;
    }

    function eligible(address account) public view returns (bool){
        if (book[account].position == winner && book[account].claimed == false && book[account].amount > 0 && rewardAmount > 0){
            return true;
        }
        else {
            return false;
        }
    }

    /// @notice withdraws prize (need reentrancy guard?)
    function claimPrize() external nonReentrant {
        require(eligible(msg.sender), "Not eligible for prize.");
        uint256 amount = book[msg.sender].amount * rewardAmount / rewardBaseAmount;
        book[msg.sender].claimed = true;
        paymentToken.transfer(msg.sender, amount);

    }

    /// @notice retrieves expected reward for account
    function reward(address account) external view returns (uint256) {
        return (book[account].amount * rewardAmount / rewardBaseAmount);
    }

    /// @notice withdraws ownerpool from the owner's pool (need reentrancy guard?)
    function ownerWithdraw() external onlyOwner {
        require(ownerPool > 0, "Not enough fees collected");
        paymentToken.transfer(msg.sender, ownerPool);
    }

    /// @notice gets current price from oracle 
    function getLatestData() internal view returns (int256) {
        // prettier-ignore
        (
            /* uint80 roundID */,
            int answer,
            /*uint startedAt*/,
            /*uint timeStamp*/,
            /*uint80 answeredInRound*/
        ) = dataFeed.latestRoundData();
        return answer;
    }
}
