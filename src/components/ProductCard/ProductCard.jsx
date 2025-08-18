import { Link } from "react-router-dom";
import styles from "./ProductCard.module.css";
import { getImageUrl } from "../../lib/image";

export default function ProductCard({ product }) {
  const { id, title, price, discountedPrice = price } = product || {};

  const imageUrl = getImageUrl(product);

  const hasDiscount = discountedPrice < price;
  const pct = hasDiscount
    ? Math.round(((price - discountedPrice) / price) * 100)
    : 0;

  const formatNOK = (n) =>
    new Intl.NumberFormat("no-NO", {
      style: "currency",
      currency: "NOK",
    }).format(n);

  return (
    <article className={styles.card}>
      <div className={styles.media}>
        {imageUrl ? (
          <img src={imageUrl} alt={title} loading="lazy" />
        ) : (
          <div className={styles.placeholder} aria-hidden />
        )}
        {hasDiscount && <span className={styles.badge}>-{pct}%</span>}
      </div>

      <div className={styles.body}>
        <h3 className={styles.title} title={title}>
          {title}
        </h3>

        <div className={styles.pricing}>
          <span className={styles.now}>{formatNOK(discountedPrice)}</span>
          {hasDiscount && (
            <span className={styles.was}>{formatNOK(price)}</span>
          )}
        </div>

        <Link
          className={styles.button}
          to={`/product/${id}`}
          aria-label={`View ${title}`}
        >
          View product
        </Link>
      </div>
    </article>
  );
}
