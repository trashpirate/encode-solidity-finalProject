import styles from "./betAction.module.css";

import { tokenABI } from "../../assets/MyERC20Token";
import { useContractWrite, usePrepareContractWrite, useWaitForTransaction } from "wagmi";
import { parseUnits } from "viem";

const TOKEN_CONTRACT = process.env.NEXT_PUBLIC_TOKEN_CONTRACT as `0x${string}`;
const BETTING_CONTRACT = process.env.NEXT_PUBLIC_BETTING_CONTRACT as `0x${string}`;
const NETWORK_SCAN = process.env.NEXT_PUBLIC_NETWORK_SCAN;

export default function ApproveButton(params: { transferAmount: string }) {
  const { config } = usePrepareContractWrite({
    address: TOKEN_CONTRACT,
    abi: tokenABI,
    functionName: "approve",
    args: [BETTING_CONTRACT, parseUnits(`${Number(params.transferAmount)}`, 18)],
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
          style={{ background: "rgb(250, 250, 250)" }}
          disabled={!write || isLoading}
          onClick={() => write?.()}
        >
          {isLoading ? "Approving..." : `Approve`}
        </button>
      </div>
      {isSuccess && (
        <div className={styles.message}>
          Successfully Approved!
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
