import styles from "./betAction.module.css";
import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import ApproveButton from "./approveButton";
import BetUpButton from "./betUpButton";
import BetDownButton from "./betDownButton";
import ClaimButton from "./claimButton";

export default function BetAction() {
  const [transferAmount, setTransferAmount] = useState("");
  const [bettingAllowed, setBettingAllowed] = useState<boolean>(false);
  const [roundID, setRoundID] = useState<number | null>(null);

  useEffect(() => {
    const socket = io(`${process.env.NEXT_PUBLIC_BASE_URL}`);

    socket.on("connect", function () {
      console.log("Connected");
      socket.emit("events", { test: "test" });
      socket.emit("identity", 0, (response: any) => console.log("Identity:", response));
    });

    // Listen for the "bettingStarted" event
    socket.on("events", function (data) {
      setBettingAllowed(data.open);
      setRoundID(data.id);
    });

    // Listen for the "bettingStarted" event
    socket.on("bettingStarted", () => {
      fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/get-round`, {
        credentials: "include",
      })
        .then((res) => res.json())
        .then((data) => {
          setBettingAllowed(data.open);
          setRoundID(data.id);
        });
    });

    // Listen for the "bettingStarted" event
    socket.on("bettingEnded", () => {
      fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/get-round`, {
        credentials: "include",
      })
        .then((res) => res.json())
        .then((data) => {
          setBettingAllowed(data.open);
          setRoundID(data.id);
        });
    });

    socket.on("exception", function (data) {
      console.log("event", data);
      setBettingAllowed(data.open);
      setRoundID(data.id);
    });

    // Clean up the socket connection when the component unmounts
    return () => {
      socket.disconnect();
    };
  }, [bettingAllowed, roundID]);

  return (
    <div className={styles.container}>
      {/* {(!bettingAllowed || roundID == null) && (
        <h2 className={styles.container_buttons} style={{ margin: "auto" }}>
          Betting Closed!
        </h2>
      )} */}
      {/* {bettingAllowed && roundID != null && (
        
      )} */}
      <div className={styles.container_entry}>
        <form className={styles.form}>
          <label>
            Enter MTK Amount:
            <input
              type="number"
              value={transferAmount}
              placeholder="0"
              onChange={(e) => setTransferAmount(e.target.value)}
            />
          </label>
        </form>
        <ApproveButton transferAmount={transferAmount}></ApproveButton>
        <div className={styles.container_buttons}>
          <BetUpButton transferAmount={transferAmount}></BetUpButton>
          <BetDownButton transferAmount={transferAmount}></BetDownButton>
        </div>
        <ClaimButton></ClaimButton>
      </div>
    </div>
  );
}
