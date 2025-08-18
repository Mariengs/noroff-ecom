import { NavLink } from "react-router-dom";
import CartIcon from "../CartIcon/CartIcon";
import styles from "./Header.module.css";
import Logo from "../../assets/logo.svg"; // 👈 importér SVG som React-komponent
import ThemeToggle from "../ThemeToggle/ThemeToggle";

export default function Header() {
  return (
    <header className={styles.header}>
      <nav className={styles.nav}>
        <NavLink to="/" className={styles.brand}>
          <img src={Logo} alt="LumiShop logo" className={styles.logo} />
          LumiShop
        </NavLink>

        <div className={styles.links}>
          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              `${styles.link} ${isActive ? styles.active : ""}`
            }
          >
            Home
          </NavLink>
          <NavLink
            to="/contact"
            className={({ isActive }) =>
              `${styles.link} ${isActive ? styles.active : ""}`
            }
          >
            Contact
          </NavLink>
          <ThemeToggle />
          <CartIcon />
        </div>
      </nav>
    </header>
  );
}
