import { ethers } from "ethers";
import { Betting, Betting__factory} from "../typechain-types";
import * as dotenv from "dotenv";
dotenv.config();

const contractAddress =  "0xAed298e5d34a32cf6510fB14b2fedBf8575536fe";

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
  const timeoffset = 20 * 60;
  const newLockTime = (Date.now() + timeoffset).toString();
  const newClosingTime = (Date.now() + timeoffset + 5).toString();
  const openTx = await contract.openRound(newLockTime, newClosingTime);
  await openTx.wait();

  const openFlag = await contract.roundOpen();
  openFlag ? console.log('Round is open.') : console.log('Round is closed.')
 
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
