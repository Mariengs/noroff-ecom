import { Link } from "react-router-dom";
import styles from "./Footer.module.css";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <Link to="/" className={styles.brand} aria-label="Go to homepage">
          LumiShop
        </Link>

        <nav className={styles.links} aria-label="Footer navigation">
          <Link to="/" aria-label="Home">
            Home
          </Link>
          <Link to="/contact" aria-label="Contact">
            Contact
          </Link>
        </nav>

        <small className={styles.copy}>
          © {year} LumiShop — All rights reserved.
        </small>
      </div>
    </footer>
  );
}
