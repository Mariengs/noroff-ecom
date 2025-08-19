import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../../context/CartContext";
import { formatNOK } from "../../lib/pricing";
import styles from "./CheckoutPage.module.css";
import { useToast } from "../../components/Toast/ToastProvider"; // juster sti hvis nødvendig

export default function CheckoutPage() {
  const { items, inc, dec, remove, addQty, totalAmount } = useCart();
  const navigate = useNavigate();
  const toast = useToast();

  if (items.length === 0) {
    return (
      <section className={styles.empty}>
        <div className={styles.emptyCard}>
          <div className={styles.emptyIcon} aria-hidden={true}>
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
        <ul className={styles.list} aria-label="Cart items">
          {items.map((i) => {
            const unit =
              typeof i.discountedPrice === "number"
                ? i.discountedPrice
                : i.price;
            const hasDiscount =
              typeof i.discountedPrice === "number" &&
              i.discountedPrice < i.price;
            const lineTotal = unit * i.qty;

            // 👇 robust bilde-henting
            const imgSrc =
              i.imageUrl ??
              (typeof (i as any).image === "string"
                ? (i as any).image
                : (i as any).image?.url) ??
              (i as any).thumbnail ??
              null;

            return (
              <li key={i.id} className={styles.item}>
                {imgSrc ? (
                  <img
                    className={styles.thumb}
                    src={imgSrc}
                    alt={i.title}
                    loading="lazy"
                    decoding="async"
                  />
                ) : (
                  <div className={styles.thumbFallback} aria-hidden={true}>
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
                        onClick={() => {
                          const snapshot = { ...i };
                          dec(i.id);
                          if (snapshot.qty > 1) {
                            toast.info(`Removed 1 × ${snapshot.title}`, {
                              duration: 3000,
                              action: {
                                label: "Undo",
                                onClick: () => inc(snapshot.id),
                              },
                            });
                          } else {
                            toast.error(`${snapshot.title} removed from cart`, {
                              duration: 4000,
                              action: {
                                label: "Undo",
                                onClick: () => addQty(snapshot, 1),
                              },
                            });
                          }
                        }}
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
                      onClick={() => {
                        const snapshot = { ...i };
                        remove(i.id);
                        toast.error(`${snapshot.title} removed from cart`, {
                          duration: 4000,
                          action: {
                            label: "Undo",
                            onClick: () => addQty(snapshot, snapshot.qty),
                          },
                        });
                      }}
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

        <aside className={styles.checkoutSummary} aria-label="Order summary">
          <div className={styles.total}>
            <span>Total</span>
            <strong>{formatNOK(totalAmount)}</strong>
          </div>

          <button
            type="button"
            className={styles.checkoutBtn}
            onClick={() => {
              toast.success("Checkout complete! 🎉", { duration: 3500 });
              navigate("/success");
            }}
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
