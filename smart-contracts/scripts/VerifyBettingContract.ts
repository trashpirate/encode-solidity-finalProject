import { ethers } from "ethers";
import * as hre from "hardhat";
import { MyERC20Token, MyERC20Token__factory } from "../typechain-types";
import * as dotenv from "dotenv";
dotenv.config();

// run this script with hardhat: npx hardhat run ./scripts/VerifyTokenContract.ts --network NETWORKNAME

const constructorArguments = ["0xa84517F6E1448B7d6Cb50c8Af1579F8bEB6092C7"];
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

  // get contract
  const contractFactory = new MyERC20Token__factory(wallet);
  const contract = (await contractFactory.attach(contractAddress)) as MyERC20Token;

  // verify contract
  console.log("Verifying contract on Etherscan...");
  if (constructorArguments != null) {
    await hre.run("verify:verify", {
      address: contractAddress,
      constructorArguments: constructorArguments,
    });
  } else {
    await hre.run("verify:verify", {
      address: contractAddress,
    });
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
