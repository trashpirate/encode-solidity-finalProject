import {expect} from "chai";
import {ethers} from "hardhat";
import {MyERC20Token} from "../typechain-types";
import {HardhatEthersSigner} from "@nomicfoundation/hardhat-ethers/signers";

describe("Basic tests for understanding ERC20", async () => {
    let myERC20Contract: MyERC20Token;
    let accounts: HardhatEthersSigner[];

    // can be improved with load fixture
    beforeEach(async () => {
        accounts = await ethers.getSigners();
        const myERC20ContractFactory = await ethers.getContractFactory(
            "MyERC20Token"
        );
        myERC20Contract = await myERC20ContractFactory.deploy();
        await myERC20Contract.waitForDeployment();
    });

    it("should have zero total supply at deployment", async () => {
        const totalSupplyBN = await myERC20Contract.totalSupply();
        const decimals = await myERC20Contract.decimals();
        const totalSupply = parseFloat(ethers.formatUnits(totalSupplyBN, decimals));
        expect(totalSupply).to.eq(0);
    });

    it("triggers the Transfer event with the address of the sender when sending transactions", async function () {
        // TODO: Mint tokens for accounts[0].address
        const senderAddress = accounts[0].address;
        const receiverAddress = accounts[1].address;

        const mintTx = await myERC20Contract.mint(senderAddress, 2);
        await mintTx.wait();
        await expect(myERC20Contract.transfer(receiverAddress, 1))
            .to.emit(myERC20Contract, "Transfer")
            .withArgs(senderAddress, receiverAddress, 1);
    });
});
