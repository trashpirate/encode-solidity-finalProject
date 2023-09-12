import styles from "./betAction.module.css";
import { bettingABI } from "@/assets/Betting";
import { parseUnits } from "viem";
import { useContractWrite, usePrepareContractWrite, useWaitForTransaction } from "wagmi";


const TOKEN_CONTRACT = process.env.NEXT_PUBLIC_TOKEN_CONTRACT as `0x${string}`;
const BETTING_CONTRACT = process.env.NEXT_PUBLIC_BETTING_ADDRESS as `0x${string}`;
const NETWORK_SCAN = process.env.NEXT_PUBLIC_NETWORK_SCAN;

export default function OwnerClaimButton(params: {OwnerWithdrawlAmount: string}) {
  const { config } = usePrepareContractWrite({
    address: BETTING_CONTRACT as `0x${string}`,
    abi: bettingABI,
    functionName: 'ownerWithdraw',
    args: [parseUnits(`${params.OwnerWithdrawlAmount ?? '0'}`, 18)],
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
          style={{ background: "rgb(14, 207, 143)"}}
          disabled={!write || isLoading}
          onClick={() => write?.()}
        >
          {isLoading ? "Submitting..." : `Owner Claim`}
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
