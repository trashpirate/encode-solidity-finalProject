"use client";

import { ConnectKitButton } from "connectkit";
import styles from "./navbar.module.css";
export default function Navbar() {
  return (
    <nav className={styles.navbar}>
      <div className={styles.navbar_menu}>
        <a href='/' target={"_blank"}>
          <img style={{ width: "48px", height: "48px" }} src="./group4.svg" alt="Group4 Logo" />
        </a>
        <a
          href="https://forms.gle/nMA82tYCGM1gh4fm6"
          target={"_blank"}
          style={{
            color: `white`,
            background: "rgb(56, 56, 56)",
            padding: `10px 15px`,
            borderRadius: `12px`,
          }}
        >
          GIVE US FEEDBACK
        </a>
      </div>
      <ConnectKitButton />
    </nav>
  );
}
