import styles from "./betAction.module.css";

import { tokenABI } from '@/assets/MyERC20Token';
import { bettingABI } from "@/assets/Betting";

import { useContractWrite, usePrepareContractWrite, useWaitForTransaction } from "wagmi";
import { parseUnits } from "viem";

const TOKEN_CONTRACT = process.env.NEXT_PUBLIC_TOKEN_CONTRACT as `0x${string}`;
const BETTING_CONTRACT = process.env.NEXT_PUBLIC_BETTING_CONTRACT as `0x${string}`;
// const UP_ADDRESS = process.env.NEXT_PUBLIC_UP_ADDRESS as `0x${string}`;
// const DOWN_ADDRESS = process.env.NEXT_PUBLIC_DOWN_ADDRESS as `0x${string}`;
const NETWORK_SCAN = process.env.NEXT_PUBLIC_NETWORK_SCAN;

// export default function BetButton(params: { action: string; transferAmount: string }) {
export default function BetButton() {
  // const walletAddress = params.action === "UP" ? UP_ADDRESS : DOWN_ADDRESS;

  const { config } = usePrepareContractWrite({
    address: BETTING_CONTRACT as `0x${string}`,
    abi: bettingABI,
    functionName: "bet",
    // args: [walletAddress as `0x${string}`, parseUnits(`${Number(params.transferAmount)}`, 18)],
  });
  const { data, error, isError, write } = useContractWrite(config);

  const { isLoading, isSuccess } = useWaitForTransaction({
    confirmations: 2,
    hash: data?.hash,
  });

  // const getButtonColor = () => {
  //   if (params.action === "UP") {
  //     return { background: "rgb(14, 207, 143)" };
  //   } else {
  //     return { background: "rgb(240, 31, 94)" };
  //   }
  // };

  return (
    <div>
      <div>
        <button
          className={styles.button}
          // style={getButtonColor()}
          style={{ background: "rgb(14, 207, 143)"}}
          disabled={!write || isLoading}
          onClick={() => write?.()}
        >
          {/* {isLoading ? "Submitting..." : `Bet ${params.action}`} */}
          {isLoading ? "Submitting..." : `Bet`}
        </button>
      </div>
      {isSuccess && (
        <div className={styles.message}>
          Successfully Submitted!
          <a target={"_blank"} href={`${NETWORK_SCAN}/${data?.hash}`}>
            <div>
              <p>View on BaseScan</p>
            </div>
          </a>
        </div>
      )}
      {isError && <div className={styles.error_message}>Transaction aborted.</div>}
    </div>
  );
}
