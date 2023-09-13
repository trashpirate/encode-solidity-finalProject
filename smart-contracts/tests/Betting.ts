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
    const startPrice = ethers.parseUnits("1");
    const endPrice = ethers.parseUnits("2");

    beforeEach(async () => {
      accounts = await ethers.getSigners();
      tokenContract = await loadFixture(deployTokenContract);
      await tokenContract.waitForDeployment();

      bettingContract = await loadFixture(deployBettingContract);
      await bettingContract.waitForDeployment();
    });

    it("returns correct closing time after opening round", async () => {
      const newLockTime = (Date.now() + 5).toString();
      const newClosingTime = (Date.now() + 10).toString();

      // owner can open round
      await bettingContract.openRound(newLockTime, newClosingTime, startPrice);
      const closingTime = await bettingContract.roundClosingTime();
      expect(newClosingTime).to.eq(closingTime);
    });

    it("round is flagged open after opening", async () => {
      const newLockTime = (Date.now() + 5).toString();
      const newClosingTime = (Date.now() + 10).toString();

      // round is now flagged as open
      await bettingContract.openRound(newLockTime, newClosingTime, startPrice);
      const roundOpen = await bettingContract.roundOpen();
      expect(roundOpen).to.eq(true);
    });

    it("locks current prize when open round", async () => {
      const newLockTime = (Date.now() + 5).toString();
      const newClosingTime = (Date.now() + 10).toString();

      // locked prize is not zero
      await bettingContract.openRound(newLockTime, newClosingTime, startPrice);
      const lockedPrice = await bettingContract.lockedPrice();
      expect(lockedPrice).not.eq(0);
    });

    it("only owner can open round", async () => {
      const newLockTime = (Date.now() + 5).toString();
      const newClosingTime = (Date.now() + 10).toString();

      // other account cannot open round
      await expect(
        bettingContract.connect(accounts[1]).openRound(newLockTime, newClosingTime, startPrice)
      ).to.be.reverted;
    });

    it("round can be closed after closingTime", async () => {
      // open round
      const newLockTime = (Date.now() + 5).toString();
      const newClosingTime = (Date.now() + 10).toString();
      const afterCloseTime = Date.now() + 15;
      await bettingContract.openRound(newLockTime, newClosingTime, startPrice);

      // close round
      await time.increaseTo(afterCloseTime);
      await bettingContract.closeRound(endPrice);
      const roundOpen = await bettingContract.roundOpen();

      // round is now flagged as closed
      expect(roundOpen).to.eq(false);
    });

    it("round determins winner after closeRound correctly", async () => {
      // open round
      const newLockTime = (Date.now() + 5).toString();
      const newClosingTime = (Date.now() + 10).toString();
      const afterCloseTime = Date.now() + 15;
      await bettingContract.openRound(newLockTime, newClosingTime, startPrice);

      // close round
      await time.increaseTo(afterCloseTime);
      await bettingContract.closeRound(endPrice);

      // get winner
      const winner = await bettingContract.winner();
      expect(winner).to.eq(0);
    });

    it("closeRound reverts before closingTime", async () => {
      const newLockTime = (Date.now() + 5).toString();
      const newClosingTime = (Date.now() + 10).toString();
      await bettingContract.openRound(newLockTime, newClosingTime, startPrice);

      // round is now flagged as closed
      await expect(bettingContract.closeRound(endPrice)).to.be.reverted;
    });
  });

  describe("when player interacts with betting contract", async () => {
    const startPrice = ethers.parseUnits("1");
    const endPrice = ethers.parseUnits("2");
    beforeEach(async () => {
      accounts = await ethers.getSigners();
      tokenContract = await loadFixture(deployTokenContract);
      await tokenContract.waitForDeployment();
      await tokenContract.transfer(accounts[1].address, ethers.parseUnits("100000"));
      await tokenContract.transfer(accounts[2].address, ethers.parseUnits("100000"));
      await tokenContract.transfer(accounts[3].address, ethers.parseUnits("100000"));
      await tokenContract.transfer(accounts[4].address, ethers.parseUnits("100000"));

      bettingContract = await loadFixture(deployBettingContract);
      await bettingContract.waitForDeployment();
    });

    describe("when betting is open", async () => {
      const newLockTime = (Date.now() + 5).toString();
      const newClosingTime = (Date.now() + 10).toString();
      const afterCloseTime = Date.now() + 15;

      beforeEach(async () => {
        await bettingContract.openRound(newLockTime, newClosingTime, startPrice);
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

      it("position is correct", async () => {
        const amountPlayer1 = ethers.parseUnits("15");

        //  player places bet down
        await tokenContract
          .connect(accounts[1])
          .approve(bettingContract.getAddress(), amountPlayer1);
        await bettingContract.connect(accounts[1]).betDown(amountPlayer1);

        // get bet position
        const betInfo = await bettingContract.book(accounts[1].address);
        expect(betInfo[0]).to.eq(1n);
      });
      it("amount is correct", async () => {
        const amountPlayer1 = ethers.parseUnits("15");

        // check balance before betting
        const balancePlayer1Before = await tokenContract.balanceOf(accounts[1].address);

        //  player places bet down
        await tokenContract
          .connect(accounts[1])
          .approve(bettingContract.getAddress(), amountPlayer1);
        await bettingContract.connect(accounts[1]).betDown(amountPlayer1);

        // check balance after betting
        const balancePlayer1After = await tokenContract.balanceOf(accounts[1].address);

        // check amount in contract
        const betInfo = await bettingContract.book(accounts[1].address);
        expect(betInfo.amount).to.eq(amountPlayer1);

        // check balance of player
        expect(balancePlayer1Before).to.eq(balancePlayer1After + amountPlayer1);
      });
    });
    describe("when betting is closed", async () => {
      const newLockTime = (Date.now() + 5).toString();
      const newClosingTime = (Date.now() + 10).toString();
      const afterCloseTime = Date.now() + 15;

      const amountPlayer1 = ethers.parseUnits("15");
      const amountPlayer2 = ethers.parseUnits("20");
      const amountPlayer3 = ethers.parseUnits("10");

      beforeEach(async () => {
        await bettingContract.openRound(newLockTime, newClosingTime, startPrice);
        // first player places bet down
        await tokenContract
          .connect(accounts[1])
          .approve(bettingContract.getAddress(), amountPlayer1);
        await bettingContract.connect(accounts[1]).betDown(amountPlayer1);

        // second player places bet up
        await tokenContract
          .connect(accounts[2])
          .approve(bettingContract.getAddress(), amountPlayer2);
        await bettingContract.connect(accounts[2]).betUp(amountPlayer2);

        // first player places bet up
        await tokenContract
          .connect(accounts[3])
          .approve(bettingContract.getAddress(), amountPlayer3);
        await bettingContract.connect(accounts[3]).betUp(amountPlayer3);

        // close round
        await time.increaseTo(afterCloseTime);
        await bettingContract.closeRound(endPrice);
      });

      it("player can claim correct amount", async () => {
        // calc reward
        const totalBetAmount = amountPlayer1 + amountPlayer2 + amountPlayer3;
        const totalWinnerAmount = await bettingContract.upPool();
        const fee = await bettingContract.bettingFee();
        const expectedReward =
          (amountPlayer2 * (totalBetAmount - (fee * totalBetAmount) / 10000n)) / totalWinnerAmount;

        // get balance before claim for account 1
        const balanceBeforeClaim1 = await tokenContract.balanceOf(accounts[2].address);

        // claim prize
        const claimTx = await bettingContract.connect(accounts[2]).claimPrize();
        await claimTx.wait();
        const balanceAfterClaim1 = await tokenContract.balanceOf(accounts[2].address);
        const rewardsAmount = balanceAfterClaim1 - balanceBeforeClaim1;
        expect(rewardsAmount).to.eq(expectedReward);
      });
      it("claimed flag is correct", async () => {
        // get betting info before claim
        const betInfoBefore = await bettingContract.book(accounts[3].address);
        expect(betInfoBefore.claimed).to.eq(false);

        // claim prize
        const claimTx = await bettingContract.connect(accounts[3]).claimPrize();
        await claimTx.wait();
        // get betting info after claim
        const betInfoAfter = await bettingContract.book(accounts[3].address);
        expect(betInfoAfter.claimed).to.eq(true);
      });
      it("is reverted when did not bet", async () => {
        await expect(bettingContract.connect(accounts[4]).claimPrize()).to.be.reverted;
      });
      it("is reverted when not winning", async () => {
        await expect(bettingContract.connect(accounts[1]).claimPrize()).to.be.reverted;
      });
      it("is reverted when already claimed", async () => {
        const claimTx = await bettingContract.connect(accounts[2]).claimPrize();
        claimTx.wait();
        await expect(bettingContract.connect(accounts[2]).claimPrize()).to.be.reverted;
      });
    });
  });
});
