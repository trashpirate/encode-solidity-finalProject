import styles from "./betAction.module.css";

import { tokenABI } from '@/assets/MyERC20Token';
import { bettingABI } from "@/assets/Betting";

import { useContractWrite, usePrepareContractWrite, useWaitForTransaction } from "wagmi";
import { parseUnits } from "viem";

const TOKEN_CONTRACT = process.env.NEXT_PUBLIC_TOKEN_CONTRACT as `0x${string}`;
const BETTING_CONTRACT = process.env.NEXT_PUBLIC_BETTING_ADDRESS as `0x${string}`;
const NETWORK_SCAN = process.env.NEXT_PUBLIC_NETWORK_SCAN;

// Open the round only if owner of the contract
export default function OpenRoundButton(params: {closingTime: string}) {


  const { config } = usePrepareContractWrite({
    address: BETTING_CONTRACT as `0x${string}`,
    abi: bettingABI,
    functionName: 'openRound',
    args: [parseUnits(`${params.closingTime ?? '2'}`, 18)],
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
          {isLoading ? "Opening round..." : `Open Round`}
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
