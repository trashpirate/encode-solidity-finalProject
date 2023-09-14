import { expect } from "chai";
import { ethers } from "hardhat";
import { Betting, MyERC20Token } from "../typechain-types";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import { time, reset } from "@nomicfoundation/hardhat-network-helpers";
import { AddressLike } from "ethers";

let tokenAddress: AddressLike;

// function to deploy token contract
async function deployTokenContract() {
  const tokenFactory = await ethers.getContractFactory("MyERC20Token");
  const tokenContract = await tokenFactory.deploy();
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

describe("Tests for Betting contract", async () => {
  let bettingContract: Betting;
  let tokenContract: MyERC20Token;
  let accounts: HardhatEthersSigner[];

  let timeoffset: number;
  let timestamp: number;
  let newLockTime: string;
  let afterLockTime: number;
  let newClosingTime: string;
  let afterCloseTime: number;

  // deployment
  describe("when betting contract is deployed", async () => {
    beforeEach(async () => {
      accounts = await ethers.getSigners();
      tokenContract = await deployTokenContract();
      await tokenContract.waitForDeployment();

      bettingContract = await deployBettingContract();
      await bettingContract.waitForDeployment();
    });

    afterEach(async () => {
      await reset();
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
      timeoffset = 5 * 60;
      timestamp = await time.latest();
      newLockTime = (timestamp + timeoffset).toString();
      afterLockTime = timestamp + 2 * timeoffset;
      newClosingTime = (timestamp + 3 * timeoffset).toString();
      afterCloseTime = timestamp + 4 * timeoffset;

      accounts = await ethers.getSigners();
      tokenContract = await deployTokenContract();
      await tokenContract.waitForDeployment();
      await tokenContract.transfer(accounts[1].address, ethers.parseUnits("100000"));

      bettingContract = await deployBettingContract();
      await bettingContract.waitForDeployment();
    });

    afterEach(async () => {
      await reset();
    });

    it("returns correct closing time after opening round", async () => {
      // owner can open round
      await bettingContract.openRound(newLockTime, newClosingTime);
      const closingTime = await bettingContract.roundClosingTime();
      expect(newClosingTime).to.eq(closingTime);
    });

    it("round is flagged open after opening", async () => {
      // round is now flagged as open
      await bettingContract.openRound(newLockTime, newClosingTime);
      const roundOpen = await bettingContract.roundOpen();
      expect(roundOpen).to.eq(true);
    });

    it("locks current prize when open round", async () => {
      // locked prize is not zero
      await bettingContract.openRound(newLockTime, newClosingTime);
      const lockedPrice = await bettingContract.lockedPrice();
      expect(lockedPrice).not.eq(0);
    });

    it("only owner can open round", async () => {
      // other account cannot open round
      await expect(bettingContract.connect(accounts[1]).openRound(newLockTime, newClosingTime)).to
        .be.reverted;
    });

    it("round can be closed after closingTime", async () => {
      // open round
      await bettingContract.openRound(newLockTime, newClosingTime);

      // close round
      await time.increaseTo(afterCloseTime);
      await bettingContract.closeRound();
      const roundOpen = await bettingContract.roundOpen();

      // round is now flagged as closed
      expect(roundOpen).to.eq(false);
    });

    it("round determins winner after closeRound correctly", async () => {
      // open round
      await bettingContract.openRound(newLockTime, newClosingTime);

      // close round
      await time.increaseTo(afterCloseTime);
      await bettingContract.closeRound();

      // get winner
      const winner = await bettingContract.winner();
      expect(winner).to.eq(1);
    });

    it("closeRound reverts before closingTime", async () => {
      const newLockTime = (Date.now() + 5).toString();
      const newClosingTime = (Date.now() + 10).toString();
      await bettingContract.openRound(newLockTime, newClosingTime);

      // round is now flagged as closed
      await expect(bettingContract.closeRound()).to.be.reverted;
    });

    it("admin can withdraw fee", async () => {
      // open round
      await bettingContract.openRound(newLockTime, newClosingTime);

      // betting
      const betAmount = ethers.parseUnits("10");
      await tokenContract.connect(accounts[1]).approve(bettingContract.getAddress(), betAmount);
      await bettingContract.connect(accounts[1]).betUp(betAmount);

      // close round
      await time.increaseTo(afterCloseTime);
      await bettingContract.closeRound();

      // calc fees
      const fee = await bettingContract.bettingFee();
      const totalFee = (fee * betAmount) / BigInt(10000);

      // withdraw fees
      const balanceBefore = await tokenContract.balanceOf(accounts[0]);
      await bettingContract.ownerWithdraw();
      const balanceAfter = await tokenContract.balanceOf(accounts[0]);

      expect(balanceAfter).to.eq(balanceBefore + totalFee);
    });
    it("fee withdrawal reverted when pool empty", async () => {
      // open round
      await bettingContract.openRound(newLockTime, newClosingTime);

      // close round
      await time.increaseTo(afterCloseTime);
      await bettingContract.closeRound();

      await expect(bettingContract.ownerWithdraw()).to.be.reverted;
    });
  });

  describe("when player interacts with betting contract", async () => {
    beforeEach(async () => {
      timeoffset = 5 * 60;
      timestamp = await time.latest();
      newLockTime = (timestamp + timeoffset).toString();
      afterLockTime = timestamp + 2 * timeoffset;
      newClosingTime = (timestamp + 3 * timeoffset).toString();
      afterCloseTime = timestamp + 4 * timeoffset;

      accounts = await ethers.getSigners();
      tokenContract = await deployTokenContract();
      await tokenContract.waitForDeployment();
      await tokenContract.transfer(accounts[1].address, ethers.parseUnits("100000"));
      await tokenContract.transfer(accounts[2].address, ethers.parseUnits("100000"));
      await tokenContract.transfer(accounts[3].address, ethers.parseUnits("100000"));
      await tokenContract.transfer(accounts[4].address, ethers.parseUnits("100000"));

      bettingContract = await deployBettingContract();
      await bettingContract.waitForDeployment();
    });

    afterEach(async () => {
      await reset();
    });

    describe("when betting round is open", async () => {
      beforeEach(async () => {
        timeoffset = 5 * 60;
        timestamp = await time.latest();
        newLockTime = (timestamp + timeoffset).toString();
        afterLockTime = timestamp + 2 * timeoffset;
        newClosingTime = (timestamp + 3 * timeoffset).toString();
        afterCloseTime = timestamp + 4 * timeoffset;

        await bettingContract.openRound(newLockTime, newClosingTime);
      });

      it("player can place UP bet", async () => {
        const betAmount = ethers.parseUnits("10");
        await tokenContract.connect(accounts[1]).approve(bettingContract.getAddress(), betAmount);
        await bettingContract.connect(accounts[1]).betUp(betAmount);
        const upPoolAmount = await bettingContract.upPool();
        expect(upPoolAmount).to.eq(betAmount);
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
        expect(betInfo[0]).to.eq(2n);
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

      it("betting reverts when round locked", async () => {
        const betAmount = ethers.parseUnits("10");
        await tokenContract.connect(accounts[1]).approve(bettingContract.getAddress(), betAmount);

        await time.increaseTo(afterLockTime);
        await expect(bettingContract.connect(accounts[1]).betDown(betAmount)).to.be.reverted;
      });
    });
    describe("when betting is closed", async () => {
      const amountPlayer1 = ethers.parseUnits("15");
      const amountPlayer2 = ethers.parseUnits("20");
      const amountPlayer3 = ethers.parseUnits("10");

      beforeEach(async () => {
        timeoffset = 5 * 60;
        timestamp = await time.latest();
        newLockTime = (timestamp + timeoffset).toString();
        afterLockTime = timestamp + 2 * timeoffset;
        newClosingTime = (timestamp + 3 * timeoffset).toString();
        afterCloseTime = timestamp + 4 * timeoffset;

        await bettingContract.openRound(newLockTime, newClosingTime);
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
        await bettingContract.closeRound();
      });

      afterEach(async () => {
        await reset();
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
