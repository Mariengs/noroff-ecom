import { useNavigate } from "react-router-dom";
import { useCart } from "../../context/CartContext";
import styles from "./CartIcon.module.css";

export default function CartIcon() {
  const { totalQty } = useCart();
  const navigate = useNavigate();
  return (
    <button
      className={styles.button}
      onClick={() => navigate("/checkout")}
      aria-label="Open cart"
    >
      <span role="img" aria-hidden>
        🛒
      </span>
      {totalQty > 0 && <span className={styles.badge}>{totalQty}</span>}
    </button>
  );
}
