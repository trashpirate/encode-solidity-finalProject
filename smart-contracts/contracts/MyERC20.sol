// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";


contract MyERC20Token is ERC20, Ownable {

    constructor(address newOwner) ERC20("MyERC20Token", "MTK") {
        mint(newOwner, 1000000 * 10 ** 18);
        transferOwnership(newOwner);
    }
 
    function mint(address to, uint256 amount) public onlyOwner {
        _mint(to, amount);
    }
}