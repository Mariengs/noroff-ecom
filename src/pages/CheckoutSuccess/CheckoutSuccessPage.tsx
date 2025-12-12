import { useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../../context/CartContext";
import { useToast } from "../../components/Toast/ToastProvider";
import styles from "./CheckoutSuccess.module.css";

const CHECKOUT_TOAST_KEY = "checkout:toast-shown";

export default function CheckoutSuccessPage() {
  const { clear } = useCart();
  const toast = useToast();
  const navigate = useNavigate();
  const cleared = useRef(false);

  useEffect(() => {
    if (sessionStorage.getItem(CHECKOUT_TOAST_KEY)) return;

    sessionStorage.setItem(CHECKOUT_TOAST_KEY, "1");

    if (!cleared.current) {
      clear();
      cleared.current = true;
    }

    toast.success("Checkout complete – thanks for your order!", {
      duration: 3000,
      action: {
        label: "Back to store",
        onClick: () => navigate("/"),
      },
    });

    const t = window.setTimeout(() => {
      sessionStorage.removeItem(CHECKOUT_TOAST_KEY);
    }, 3500);

    return () => {
      window.clearTimeout(t);
    };
  }, [clear, toast, navigate]);

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
