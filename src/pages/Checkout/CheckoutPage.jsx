// src/pages/CheckoutPage/CheckoutPage.jsx
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../../context/CartContext";
import { formatNOK } from "../../lib/pricing";
import styles from "./CheckoutPage.module.css";

export default function CheckoutPage() {
  const { items, inc, dec, remove, totalAmount } = useCart();
  const navigate = useNavigate();

  if (items.length === 0) {
    return (
      <section className={styles.empty}>
        <div className={styles.emptyCard}>
          <div className={styles.emptyIcon} aria-hidden>
            🛒
          </div>
          <h1>Your cart</h1>
          <p>Your cart is empty.</p>
          <Link to="/" className={styles.primaryLink}>
            Go back to products
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className={styles.page}>
      <header className={styles.header}>
        <h1>Your cart</h1>
        <p>Review your items and proceed to checkout.</p>
      </header>

      <div className={styles.layout}>
        {/* Left: cart items */}
        <ul className={styles.list} aria-label="Cart items">
          {items.map((i) => {
            const unit = i.discountedPrice ?? i.price;
            const hasDiscount =
              typeof i.discountedPrice === "number" &&
              i.discountedPrice < i.price;
            const lineTotal = unit * i.qty;

            return (
              <li key={i.id} className={styles.item}>
                {i.image ? (
                  <img
                    className={styles.thumb}
                    src={i.image}
                    alt={i.title}
                    loading="lazy"
                    decoding="async"
                  />
                ) : (
                  <div className={styles.thumbFallback} aria-hidden>
                    🛍️
                  </div>
                )}

                <div className={styles.info}>
                  <strong className={styles.title}>{i.title}</strong>

                  <div className={styles.prices}>
                    {hasDiscount ? (
                      <>
                        <span className={styles.priceNow}>
                          {formatNOK(unit)}
                        </span>
                        <span className={styles.priceWas}>
                          {formatNOK(i.price)}
                        </span>
                      </>
                    ) : (
                      <span className={styles.priceNow}>{formatNOK(unit)}</span>
                    )}
                  </div>

                  <div className={styles.controls}>
                    <div className={styles.qty}>
                      <button
                        type="button"
                        className={styles.qtyBtn}
                        onClick={() => dec(i.id)}
                        aria-label={`Decrease quantity of ${i.title}`}
                      >
                        −
                      </button>
                      <span className={styles.qtyValue} aria-live="polite">
                        {i.qty}
                      </span>
                      <button
                        type="button"
                        className={styles.qtyBtn}
                        onClick={() => inc(i.id)}
                        aria-label={`Increase quantity of ${i.title}`}
                      >
                        +
                      </button>
                    </div>

                    <button
                      type="button"
                      className={styles.remove}
                      onClick={() => remove(i.id)}
                      aria-label={`Remove ${i.title} from cart`}
                    >
                      Remove
                    </button>
                  </div>
                </div>

                <div className={styles.lineTotal}>{formatNOK(lineTotal)}</div>
              </li>
            );
          })}
        </ul>

        {/* Right: sticky summary */}
        <aside className={styles.checkoutSummary} aria-label="Order summary">
          <div className={styles.total}>
            <span>Total</span>
            <strong>{formatNOK(totalAmount)}</strong>
          </div>

          <button
            type="button"
            className={styles.checkoutBtn}
            onClick={() => navigate("/success")}
            aria-label="Proceed to checkout"
          >
            Checkout
          </button>

          <Link
            to="/"
            className={styles.primaryLink}
            aria-label="Continue shopping"
          >
            Continue shopping
          </Link>
        </aside>
      </div>
    </section>
  );
}
