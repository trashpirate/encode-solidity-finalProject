import { ethers } from "ethers";
import { Betting, Betting__factory} from "../typechain-types";
import * as dotenv from "dotenv";
dotenv.config();

const contractAddress =  "0x10133dcf0F23922e94103E077244DEE243f30feC";

async function main() {
    // define provider
  const provider = new ethers.JsonRpcProvider(
    process.env.RPC_ENDPOINT_URL ?? ""
  );

  // define wallet
  const wallet = new ethers.Wallet(
    process.env.PRIVATE_KEYS?.split(",")[0] ?? "",
    provider
  );

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

  // open betting round
  const closeTime = await contract.roundClosingTime();
  const lockTime = await contract.roundLockTime();
  const blockNumber = await provider.getBlock("latest");
  const timestamp = blockNumber?.timestamp ? blockNumber?.timestamp : 0;
  const timeRemaining = Number(closeTime) - timestamp;
  console.log("Lock time set to: " + new Date(Number(lockTime) * 1000));
  console.log("Close time set to: " + new Date(Number(closeTime) * 1000));
  
  if (timeRemaining < 0){
    console.log("Closing round")
const openTx = await contract.closeRound();
  await openTx.wait();
  }
  else {
    const date = new Date(timeRemaining * 1000);
    console.log(`${date.getHours()} hrs ${date.getMinutes()} min ${date.getSeconds()} sec}`)
  }

  const openFlag = await contract.roundOpen();
  openFlag ? console.log('Round is open.') : console.log('Round is closed.')
 
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
