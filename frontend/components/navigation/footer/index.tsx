import styles from "./footer.module.css";

export default function Footer() {
  return (
    <div className={styles.footer}>
      <a href="/" target={"_blank"}>
        <img
          id="badge-button"
          style={{ width: "240px", height: "53px" }}
          src="./group4.svg"
          alt="Group 4 logo"
        />
      </a>
    </div>
  );
}
