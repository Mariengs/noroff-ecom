import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { useCart } from "../../context/CartContext";
import styles from "./CheckoutSuccess.module.css";

export default function CheckoutSuccessPage() {
  const { clear } = useCart();

  // Beskytt mot dobbel kjøring i React 18 StrictMode (dev)
  const cleared = useRef(false);

  useEffect(() => {
    if (!cleared.current) {
      clear();
      cleared.current = true;
    }
  }, [clear]);

  return (
    <section className={styles.page}>
      <div className={styles.card} role="status" aria-live="polite">
        <div className={styles.icon} aria-hidden={true}>
          ✓
        </div>

        <h1 className={styles.title}>Order successful 🎉</h1>
        <p className={styles.subtitle}>
          Thanks for your purchase. Your order has been placed successfully.
        </p>

        <div className={styles.actions}>
          <Link to="/" className={styles.primaryBtn} aria-label="Back to store">
            Back to store
          </Link>
        </div>

        <p className={styles.hint}>
          A confirmation has been sent to your email.
        </p>
      </div>
    </section>
  );
}
