import styles from "./betAction.module.css";

import { bettingABI } from "@/assets/Betting";
import { useContractWrite, usePrepareContractWrite, useWaitForTransaction } from "wagmi";
import { parseUnits } from "viem";

const BETTING_CONTRACT = process.env.NEXT_PUBLIC_BETTING_CONTRACT as `0x${string}`;
const NETWORK_SCAN = process.env.NEXT_PUBLIC_NETWORK_SCAN;

export default function BetUpButton(params: { transferAmount: string }) {
  const { config } = usePrepareContractWrite({
    address: BETTING_CONTRACT,
    abi: bettingABI,
    functionName: "betUp",
    args: [parseUnits(params.transferAmount, 18)],
  });
  const { data, error, isError, write } = useContractWrite(config);
  console.log(data);

  const { isLoading, isSuccess } = useWaitForTransaction({
    confirmations: 2,
    hash: data?.hash,
  });

  return (
    <div>
      <div>
        <button
          className={styles.button}
          style={{ background: "rgb(14, 207, 143)" }}
          disabled={!write || isLoading}
          onClick={() => write?.()}
        >
          {isLoading ? "Submitting..." : `Bet UP`}
        </button>
      </div>
      {isSuccess && (
        <div className={styles.message}>
          Successfully Submitted!
          <a target={"_blank"} href={`${NETWORK_SCAN}/${data?.hash}`}>
            <div>
              <p>View on Etherscan</p>
            </div>
          </a>
        </div>
      )}
      {isError && <div className={styles.error_message}>Transaction aborted.</div>}
    </div>
  );
}
