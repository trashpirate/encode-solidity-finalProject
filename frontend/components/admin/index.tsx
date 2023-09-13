import styles from "./admin.module.css";
import CloseRoundButton from "./closeRoundButton";
import OpenRoundButton from "./openRoundButton";
import OwnerClaimButton from "./ownerWithdraw";

export default function Admin() {
  return (
    <div className={styles.main}>
      <h1>Admin Panel</h1>
      <OpenRoundButton lockTime="2345" closingTime="1234"></OpenRoundButton>
      <CloseRoundButton></CloseRoundButton>
      <OwnerClaimButton></OwnerClaimButton>
    </div>
  );
}
