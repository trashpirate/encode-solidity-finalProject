"use client";
import styles from "./page.module.css";
import "../globals.css";
import Admin from "../../components/admin";

export default function AdminPanel() {
  return (
    <main className={styles.main}>
      <Admin></Admin>
    </main>
  );
}
