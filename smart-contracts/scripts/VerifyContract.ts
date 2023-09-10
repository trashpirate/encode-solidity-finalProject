import { ethers } from "ethers";
import * as hre from "hardhat";
import { MyERC20Token, MyERC20Token__factory } from "../typechain-types";
import * as dotenv from "dotenv";
import {AddressLike, Addressable} from "ethers";
dotenv.config();

const constructorArguments = ["0xCbA52038BF0814bC586deE7C061D6cb8B203f8e1"];
const contractAddress =  "0x855DA24d2Fc7Ef7AaCF29B3d027eC70Ab11947DF";

async function main() {
  
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
  const contract = await contractFactory.attach(contractAddress) as MyERC20Token;

  console.log("Verifying contract on Etherscan...");
  await hre.run("verify:verify", {
    address: contractAddress,
    constructorArguments: constructorArguments,
  });
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
