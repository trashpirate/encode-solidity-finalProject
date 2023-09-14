import { ethers } from "ethers";
import { Betting, Betting__factory } from "../typechain-types";
import * as dotenv from "dotenv";
dotenv.config();

const contractAddress = "0x10133dcf0F23922e94103E077244DEE243f30feC";

async function main() {
  // define provider
  const provider = new ethers.JsonRpcProvider(process.env.RPC_ENDPOINT_URL ?? "");

  // define wallet
  const wallet = new ethers.Wallet(process.env.PRIVATE_KEYS?.split(",")[0] ?? "", provider);

  // wallet info
  console.log(`Using address ${wallet.address}`);
  const balanceBN = await provider.getBalance(wallet.address);
  const balance = Number(ethers.formatUnits(balanceBN));
  console.log(`Wallet balance ${balance}`);
  if (balance < 0.01) {
    throw new Error("Not enough ether");
  }

  // get betting contract
  const contractFactory = new Betting__factory(wallet);
  const contract = (await contractFactory.attach(contractAddress)) as Betting;

  // timestamps
  const timeoffset = 1 * 60;
  const blockNumber = await provider.getBlock("latest");
  const timestamp = blockNumber?.timestamp ? blockNumber?.timestamp : 0;
  const newLockTime = timestamp + timeoffset;
  const newClosingTime = timestamp + 3 * timeoffset;

  console.log(new Date(newLockTime * 1000));
  console.log(new Date(newClosingTime * 1000));

  // open betting round
  let openFlag = await contract.roundOpen();
  openFlag ? console.log("Round is now open.") : console.log("Round is now closed.");
  if (!openFlag) {
    const openTx = await contract.openRound(newLockTime, newClosingTime);
    await openTx.wait();
  }
  openFlag = await contract.roundOpen();
  openFlag ? console.log("Round is now open.") : console.log("Round is now closed.");

  const lockTime = await contract.roundLockTime();
  const closeTime = await contract.roundClosingTime();

  console.log("Lock time set to: " + new Date(Number(lockTime) * 1000));
  console.log("Close time set to: " + new Date(Number(closeTime) * 1000));
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
