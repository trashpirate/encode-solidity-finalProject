"use client";
import styles from "./page.module.css";
import "./globals.css";
import Betting from "@/components/betting";
import CountdownTimer from "@/components/countdown";
import Image from "next/image";

export default function Home() {
  return (
    <main className={styles.main}>
      <h3 className={styles.notice}>V1.1 BETA</h3>
      <h1>PLACE YOUR BET</h1>
      <h4>Will $LICK price go UP or DOWN?</h4>
      <Image
        src="/betting_icon_0.png"
        width={225}
        height={125}
        alt="betting illustration petlfg"
        style={{ margin: "20px auto", filter: "drop-shadow(0 0 0.1rem #a85507)" }}
      />
      <CountdownTimer />
      <Betting></Betting>
    </main>
  );
}
