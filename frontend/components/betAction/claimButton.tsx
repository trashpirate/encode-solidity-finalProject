import styles from "./betAction.module.css";

import { bettingABI } from "@/assets/Betting";
import { useContractWrite, usePrepareContractWrite, useWaitForTransaction } from "wagmi";
import { parseUnits } from "viem";

const BETTING_CONTRACT = process.env.NEXT_PUBLIC_BETTING_CONTRACT as `0x${string}`;
const NETWORK_SCAN = process.env.NEXT_PUBLIC_NETWORK_SCAN;

export default function ClaimButton() {
  const { config } = usePrepareContractWrite({
    address: BETTING_CONTRACT,
    abi: bettingABI,
    functionName: "claimPrize",
  });
  const { data, error, isError, write } = useContractWrite(config);

  const { isLoading, isSuccess } = useWaitForTransaction({
    confirmations: 2,
    hash: data?.hash,
  });

  return (
    <div>
      <div>
        <button
          className={styles.button}
          style={{ background: "rgb(214, 165, 4)" }}
          disabled={!write || isLoading}
          onClick={() => write?.()}
        >
          {isLoading ? "Submitting..." : `Claim Reward`}
        </button>
      </div>
      {isSuccess && (
        <div className={styles.message}>
          Successfully Claimed!
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
