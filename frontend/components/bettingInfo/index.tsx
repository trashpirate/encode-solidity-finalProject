import styles from "./bettingInfo.module.css";

import { tokenABI } from "../../assets/LICK_proxy";
import { useContractReads } from "wagmi";
import { formatUnits } from "viem";
import { useEffect, useState } from "react";
import BettingCard from "../bettingCard";

const TOKEN_CONTRACT = process.env.NEXT_PUBLIC_TOKEN_CONTRACT as `0x${string}`;
const UP_ADDRESS = process.env.NEXT_PUBLIC_UP_ADDRESS as `0x${string}`;
const DOWN_ADDRESS = process.env.NEXT_PUBLIC_DOWN_ADDRESS as `0x${string}`;

export default function BettingInfo() {
  const { data, isError, isLoading } = useContractReads({
    contracts: [
      {
        address: TOKEN_CONTRACT,
        abi: tokenABI,
        functionName: "balanceOf",
        args: [UP_ADDRESS],
      },
      {
        address: TOKEN_CONTRACT,
        abi: tokenABI,
        functionName: "balanceOf",
        args: [DOWN_ADDRESS],
      },
    ],
    watch: true,
  });

  const [hydrated, setHydrated] = useState(false);
  useEffect(() => {
    setHydrated(true);
  }, []);

  if (!hydrated) {
    return null;
  }

  const balanceUp =
    typeof data?.[0]?.result === "bigint" ? Number(formatUnits(data?.[0]?.result, 18)) : 0;
  const balanceDown =
    typeof data?.[1]?.result === "bigint" ? Number(formatUnits(data?.[1]?.result, 18)) : 0;

  const total = balanceDown + balanceUp;
  const down = balanceDown > 0 ? total / balanceDown : 0;
  const up = balanceUp > 0 ? total / balanceUp : 0;

  if (isLoading) return <div className={styles.message}>Fetching results…</div>;
  if (isError) return <div className={styles.error_message}>Error fetching contract data</div>;

  const chartData = {
    labels: ["UP", "DOWN"],
    datasets: [
      {
        label: "Bets",
        data: [balanceUp, balanceDown],
        backgroundColor: ["rgb(14, 207, 143)", "rgb(240, 31, 94)"],
        hoverOffset: 4,
      },
    ],
  };

  return (
    <div className={styles.container}>
      <BettingCard prizePool={total} ratioDown={down} ratioUp={up}></BettingCard>
    </div>
  );
}
