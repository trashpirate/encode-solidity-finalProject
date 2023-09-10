import styles from "./footer.module.css";

export default function Footer() {
  return (
    <div className={styles.footer}>
      <a href="https://petlfg.com/" target={"_blank"}>
        <img
          id="badge-button"
          style={{ width: "240px", height: "53px" }}
          src="./petlfg.svg"
          alt="PetLFG LICK"
        />
      </a>
    </div>
  );
}
