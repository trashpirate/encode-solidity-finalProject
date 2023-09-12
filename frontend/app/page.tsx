"use client";
import styles from "./page.module.css";
import "./globals.css";
import Betting from "@/components/betting";
import CountdownTimer from "@/components/countdown";
import Image from "next/image";

export default function Home() {
  return (
    <main className={styles.main}>
      <h1>BETTING DAPP</h1>
      <h2>PLACE YOUR BET</h2>
      <h4>Will $MTK price go UP or DOWN?</h4>
      <Image
        src="/UporDown.png"
        width={250}
        height={225}
        alt="betting illustration betting dapp"
        style={{ margin: "20px auto" }}
      />
      <CountdownTimer />
      <Betting></Betting>
    </main>
  );
}
