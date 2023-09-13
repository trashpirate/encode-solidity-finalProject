import styles from "./betAction.module.css";

import { bettingABI } from "@/assets/Betting";
import { useContractWrite, usePrepareContractWrite, useWaitForTransaction } from "wagmi";
import { parseUnits } from "viem";

const BETTING_CONTRACT = process.env.NEXT_PUBLIC_BETTING_ADDRESS as `0x${string}`;
const NETWORK_SCAN = process.env.NEXT_PUBLIC_NETWORK_SCAN;

export default function BetButton(params: { action: string; transferAmount: string }) {
  const betFunction = params.action === "UP" ? "betUp" : "betDown";

  const { config } = usePrepareContractWrite({
    address: BETTING_CONTRACT,
    abi: bettingABI,
    functionName: "betDown",
    args: [parseUnits(`${Number(params.transferAmount)}`, 18)],
  });
  const { data, error, isError, write } = useContractWrite(config);
  console.log(data);

  const { isLoading, isSuccess } = useWaitForTransaction({
    confirmations: 2,
    hash: data?.hash,
  });

  const getButtonColor = () => {
    if (params.action === "UP") {
      return { background: "rgb(14, 207, 143)" };
    } else {
      return { background: "rgb(240, 31, 94)" };
    }
  };

  return (
    <div>
      <div>
        <button
          className={styles.button}
          style={getButtonColor()}
          disabled={!write || isLoading}
          onClick={() => write?.()}
        >
          {isLoading ? "Submitting..." : `Bet ${params.action}`}
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
