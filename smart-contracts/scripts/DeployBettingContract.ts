import { ethers } from "ethers";
import { Betting__factory } from "../typechain-types";
import * as dotenv from "dotenv";
dotenv.config();

async function main() {
  const args = process.argv.slice(2);
  const tokenAddress = args[0];
  console.log(`Token Address ${tokenAddress}`);

  const provider = new ethers.JsonRpcProvider(process.env.RPC_ENDPOINT_URL ?? "");
  const wallet = new ethers.Wallet(process.env.PRIVATE_KEYS?.split(",")[0] ?? "", provider);

  console.log(`Using address ${wallet.address}`);
  const balanceBN = await provider.getBalance(wallet.address);
  const balance = Number(ethers.formatUnits(balanceBN));
  console.log(`Wallet balance ${balance}`);
  if (balance < 0.01) {
    throw new Error("Not enough ether");
  }

  const contractFactory = new Betting__factory(wallet);
  const contract = await contractFactory.deploy(tokenAddress);
  await contract.waitForDeployment();
  const contractAddress = await contract.getAddress();
  console.log(`Token contract deployed at ${contractAddress}`);

}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
