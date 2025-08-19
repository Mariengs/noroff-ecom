import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import { useCart } from "../../context/CartContext";
import styles from "./CartIcon.module.css";

export default function CartIcon() {
  const { totalQty } = useCart();
  const navigate = useNavigate();

  const [bump, setBump] = useState(false);
  const [floating, setFloating] = useState(false);
  const prevQty = useRef(totalQty);

  // Bump ved endring i antall
  useEffect(() => {
    if (totalQty !== prevQty.current) {
      setBump(true);
      const t = setTimeout(() => setBump(false), 450);
      prevQty.current = totalQty;
      return () => clearTimeout(t);
    }
  }, [totalQty]);

  // Toggle floating ved scroll
  useEffect(() => {
    const onScroll = () => setFloating(window.scrollY > 150);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const Button = (
    <button
      className={`${styles.button} ${bump ? styles.bump : ""} ${
        floating ? styles.floating : ""
      }`}
      onClick={() => navigate("/checkout")}
      aria-label="Open cart"
      type="button"
    >
      <span className={styles.icon} aria-hidden>
        🛒
      </span>

      {totalQty > 0 && (
        <span className={styles.badge} aria-hidden>
          {totalQty}
        </span>
      )}

      {/* Skjult live-region for skjermlesere */}
      <span className="sr-only" aria-live="polite">
        {totalQty > 0 ? `${totalQty} items in cart` : "Cart is empty"}
      </span>
    </button>
  );

  // Når floating = true, rendres i <body> så den ikke påvirkes av header-layout
  if (floating && typeof document !== "undefined") {
    return createPortal(Button, document.body);
  }
  return Button;
}
