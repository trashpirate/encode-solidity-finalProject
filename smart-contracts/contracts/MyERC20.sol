// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";


contract MyERC20Token is ERC20, Ownable {

    constructor() ERC20("MyERC20Token", "MTK") {
        _mint(msg.sender, 1000000 * 10 ** 18);
    }

}