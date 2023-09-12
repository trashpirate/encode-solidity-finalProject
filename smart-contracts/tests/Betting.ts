import { expect } from "chai";
import { ethers } from "hardhat";
import { Betting, Betting__factory, MyERC20Token } from "../typechain-types";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import { loadFixture, time } from "@nomicfoundation/hardhat-network-helpers";
import { AddressLike } from "ethers";

let tokenAddress: AddressLike;

// function to deploy token contract
async function deployTokenContract() {
  const tokenFactory = await ethers.getContractFactory("MyERC20Token");
  const tokenContract = await tokenFactory.deploy("0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266");
  await tokenContract.waitForDeployment();
  tokenAddress = await tokenContract.getAddress();
  return tokenContract;
}

// function to deploy betting contract
async function deployBettingContract() {
  const contractFactory = await ethers.getContractFactory("Betting");
  const contract = await contractFactory.deploy(tokenAddress);
  await contract.waitForDeployment();
  return contract;
}

async function getLastBlockNumber() {
  const lastBlock = await ethers.provider.getBlock("latest");
  const lastBlockNumber = lastBlock?.number ?? 0;
  return lastBlockNumber;
}

describe("Tests for Betting contract", async () => {
  let bettingContract: Betting;
  let tokenContract: MyERC20Token;
  let accounts: HardhatEthersSigner[];

  // deployment
  describe("when betting contract is deployed", async () => {
    beforeEach(async () => {
      accounts = await ethers.getSigners();
      tokenContract = await loadFixture(deployTokenContract);
      await tokenContract.waitForDeployment();

      bettingContract = await loadFixture(deployBettingContract);
      await bettingContract.waitForDeployment();
    });

    it("should return correct token address", async () => {
      const paymentToken = await bettingContract.paymentToken();
      expect(paymentToken).to.eq(tokenAddress);
    });

    it("round should be closed", async () => {
      const roundOpen = await bettingContract.roundOpen();
      expect(roundOpen).to.eq(false);
    });
  });

  // admin
  describe("when admin interacts with betting contract", async () => {
    beforeEach(async () => {
      accounts = await ethers.getSigners();
      tokenContract = await loadFixture(deployTokenContract);
      await tokenContract.waitForDeployment();

      bettingContract = await loadFixture(deployBettingContract);
      await bettingContract.waitForDeployment();
    });

    it("returns correct closing time after opening round", async () => {
      const newClosingTime = (Date.now() + 10).toString();

      // owner can open round
      await bettingContract.openRound(newClosingTime);
      const closingTime = await bettingContract.roundClosingTime();
      expect(newClosingTime).to.eq(closingTime);
    });

    it("round is flagged open after opening", async () => {
      const newClosingTime = (Date.now() + 10).toString();

      // round is now flagged as open
      await bettingContract.openRound(newClosingTime);
      const roundOpen = await bettingContract.roundOpen();
      expect(roundOpen).to.eq(true);
    });

    it("only owner can open round", async () => {
      const newClosingTime = (Date.now() + 10).toString();

      // other account cannot open round
      await expect(bettingContract.connect(accounts[1]).openRound(newClosingTime)).to.be.reverted;
    });

    it("round can be closed after closingTime", async () => {
      const currentTime = Date.now();
      await bettingContract.openRound((currentTime + 10).toString());

      await time.increaseTo(currentTime + 11);
      await bettingContract.closeRound();
      const roundOpen = await bettingContract.roundOpen();

      // round is now flagged as closed
      expect(roundOpen).to.eq(false);
    });

    it("closeRound reverts before closingTime", async () => {
      const currentTime = Date.now();
      await bettingContract.openRound((currentTime + 10).toString());

      // round is now flagged as closed
      await expect(bettingContract.closeRound()).to.be.reverted;
    });
  });

  describe("when player interacts with betting contract", async () => {
    beforeEach(async () => {
      accounts = await ethers.getSigners();
      tokenContract = await loadFixture(deployTokenContract);
      await tokenContract.waitForDeployment();
      await tokenContract.transfer(accounts[1].address, ethers.parseUnits("100000"));

      bettingContract = await loadFixture(deployBettingContract);
      await bettingContract.waitForDeployment();
    });

    describe("when betting is open", async () => {
      beforeEach(async () => {
        const currentTime = Date.now();
        await bettingContract.openRound((currentTime + 100).toString());
      });

      it("player can place UP bet", async () => {
        const betAmount = ethers.parseUnits("10");
        await tokenContract.connect(accounts[1]).approve(bettingContract.getAddress(), betAmount);
        await bettingContract.connect(accounts[1]).betUp(betAmount);
        const upPollAmount = await bettingContract.upPool();
        expect(upPollAmount).to.eq(betAmount);
      });

      it("player can place DOWN bet", async () => {
        const betAmount = ethers.parseUnits("10");
        await tokenContract.connect(accounts[1]).approve(bettingContract.getAddress(), betAmount);
        await bettingContract.connect(accounts[1]).betDown(betAmount);
        const downPollAmount = await bettingContract.downPool();
        expect(downPollAmount).to.eq(betAmount);
      });

      describe("player's betting info is updated corretly", async () => {
        it("position is correct", async () => {
          const betAmount = ethers.parseUnits("10");
          await tokenContract.connect(accounts[1]).approve(bettingContract.getAddress(), betAmount);
          await bettingContract.connect(accounts[1]).betDown(betAmount);

          const betInfo = await bettingContract.book(accounts[1].address);
          console.log(betInfo);
          expect(betInfo[0]).to.eq(1n);
          
        });
        it("amount is correct", async () => {
          const betAmount = ethers.parseUnits("10");
          await tokenContract.connect(accounts[1]).approve(bettingContract.getAddress(), betAmount);
          await bettingContract.connect(accounts[1]).betDown(betAmount);

          const betInfo = await bettingContract.book(accounts[1].address);
          expect(betInfo.amount).to.eq(betAmount);
        });
        it("claimed is correct", async () => {
          const betAmount = ethers.parseUnits("10");
          await tokenContract.connect(accounts[1]).approve(bettingContract.getAddress(), betAmount);
          await bettingContract.connect(accounts[1]).betDown(betAmount);

          const betInfo = await bettingContract.book(accounts[1].address);
          expect(betInfo.claimed).to.eq(false);
          // TODO: needs to be adjusted after added prize distribution functionality
        });

      });
    });
  });
});
