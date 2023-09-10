import { ethers } from "ethers";
import * as hre from "hardhat";
import { MyERC20Token__factory } from "../typechain-types";
import * as dotenv from "dotenv";
dotenv.config();

async function main() {
  const ownerAddress = "0xCbA52038BF0814bC586deE7C061D6cb8B203f8e1";

  const provider = new ethers.JsonRpcProvider(process.env.RPC_ENDPOINT_URL ?? "");
  const wallet = new ethers.Wallet(process.env.PRIVATE_KEYS?.split(",")[0] ?? "", provider);

  console.log(`Using address ${wallet.address}`);
  const balanceBN = await provider.getBalance(wallet.address);
  const balance = Number(ethers.formatUnits(balanceBN));
  console.log(`Wallet balance ${balance}`);
  if (balance < 0.01) {
    throw new Error("Not enough ether");
  }

  const contractFactory = new MyERC20Token__factory(wallet);
  const contract = await contractFactory.deploy(ownerAddress);
  await contract.waitForDeployment();
  const contractAddress = await contract.getAddress();
  console.log(`Token contract deployed at ${contractAddress}`);

  // wait for confirmations
  console.log(`Waiting for confirmations...`);
  const WAIT_BLOCK_CONFIRMATIONS = 6;
  const deploymentReceipt = await contract.deploymentTransaction()?.wait(WAIT_BLOCK_CONFIRMATIONS);
  console.log(`Contract confirmed with ${WAIT_BLOCK_CONFIRMATIONS} confirmations.`);

  console.log("Verifying contract on Etherscan...");
  await hre.run("verify:verify", {
    address: contract.getAddress(),
    constructorArguments: [ownerAddress],
  });
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
