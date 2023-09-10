import styles from "./betting.module.css";
import BetAction from "../betAction";
import BettingInfo from "../bettingInfo";

export default function Betting() {
  return (
    <div className={styles.container}>
      <BettingInfo></BettingInfo>
      <div className={styles.actions_container}>
        <BetAction></BetAction>
      </div>
    </div>
  );
}
