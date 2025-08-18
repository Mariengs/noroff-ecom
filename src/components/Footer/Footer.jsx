import styles from "./Footer.module.css";

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <p className={styles.brand}>MyShop</p>
        <nav className={styles.links} aria-label="Footer">
          <a
            href="https://github.com/Mariengs"
            target="_blank"
            rel="noreferrer"
          >
            GitHub
          </a>
          <a href="/contact">Contact</a>
        </nav>
        <small className={styles.copy}>
          © {new Date().getFullYear()} MyShop — All rights reserved.
        </small>
      </div>
    </footer>
  );
}
