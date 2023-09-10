"use client";

import { ConnectKitButton } from "connectkit";
import styles from "./navbar.module.css";
export default function Navbar() {
  return (
    <nav className={styles.navbar}>
      <div className={styles.navbar_menu}>
        <a href="https://petlfg.com/" target={"_blank"}>
          <img style={{ width: "48px", height: "48px" }} src="./petlfg.svg" alt="PetLFG LICK" />
        </a>
        <a
          href="https://forms.gle/vA8RdUsUjPgeCp1bA"
          target={"_blank"}
          style={{
            color: `white`,
            background: "rgb(56, 56, 56)",
            padding: `10px 15px`,
            borderRadius: `12px`,
          }}
        >
          APPLY TO LIST
        </a>
      </div>
      <ConnectKitButton />
    </nav>
  );
}
