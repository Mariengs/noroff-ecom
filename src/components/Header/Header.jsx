import { NavLink } from "react-router-dom";
import CartIcon from "../CartIcon/CartIcon";
import styles from "./Header.module.css";

export default function Header() {
  return (
    <header className={styles.header}>
      <nav className={styles.nav}>
        <NavLink to="/" className={styles.brand}>
          MyShop
        </NavLink>
        <div className={styles.links}>
          <NavLink to="/" end>
            Home
          </NavLink>
          <NavLink to="/contact">Contact</NavLink>
          <CartIcon />
        </div>
      </nav>
    </header>
  );
}
