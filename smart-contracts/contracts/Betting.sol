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
    uint256 public prizePool;
    /// @notice Amount of tokens in the owner pool
    uint256 public ownerPool;
    /// @notice Flag indicating whether the betting is open for bets or not
    bool public roundOpen;
    /// @notice Timestamp of the lottery next closing date and time
    uint256 public roundClosingTime;
    /// @notice Mapping of prize available for withdraw for each account
    mapping(address => uint256) public prize;

    /// @dev List of bet slots
    address[] _slots;

    /// @notice Constructor function
    /// @param _betPrice Amount of tokens required for placing a bet that goes for the prize pool
    /// @param _betFee Amount of tokens required for placing a bet that goes for the owner pool
    constructor(
        uint256 _betPrice,
        uint256 _betFee
    ) {
        paymentToken = new MyERC20Token(msg.sender);
        betPrice = _betPrice;
        betFee = _betFee;
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

    /// @notice Charges the bet price and creates a new bet slot with the sender's address
    function bet() public whenRoundOpen {
        ownerPool += betFee;
        prizePool += betPrice;
        _slots.push(msg.sender);
        paymentToken.transferFrom(msg.sender, address(this), betPrice + betFee);
    }

    // /// @notice Calls the bet function `times` times
    // function betMany(uint256 times) external {
    //     require(times > 0);
    //     while (times > 0) {
    //         bet();
    //         times--;
    //     }
    // }

    /// @notice Closes the betting round and calculates the prize, if any
    /// @dev Anyone can call this function at any time after the closing time
    function closeRound() external {
        require(block.timestamp >= roundClosingTime, "Too soon to close");
        require(roundOpen, "Already closed");
        if (_slots.length > 0) {
            // TODO
            // uint256 winnerIndex = getRandomNumber() % _slots.length;
            // address winner = _slots[winnerIndex];
            // prize[winner] += prizePool;
            prizePool = 0;
            delete (_slots);
        }
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
