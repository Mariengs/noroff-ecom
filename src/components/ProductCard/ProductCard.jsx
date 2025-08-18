import { Link } from "react-router-dom";
import { discountPercent, formatNOK } from "../../lib/pricing";
import { getImageUrl } from "../../lib/image";
import styles from "./ProductCard.module.css";

export default function ProductCard({ product }) {
  const img = getImageUrl(product);
  const pct = discountPercent(product.price, product.discountedPrice);
  const showDiscount =
    product.discountedPrice != null && product.discountedPrice < product.price;

  return (
    <article className={styles.card}>
      {img && <img src={img} alt={product.title} className={styles.img} />}
      <div className={styles.body}>
        <h3 className={styles.title}>{product.title}</h3>
        <div className={styles.prices}>
          <span className={styles.now}>
            {formatNOK(product.discountedPrice ?? product.price)}
          </span>
          {showDiscount && (
            <>
              <span className={styles.was}>{formatNOK(product.price)}</span>
              <span className={styles.badge}>-{pct}%</span>
            </>
          )}
        </div>
        <Link className={styles.button} to={`/product/${product.id}`}>
          View product
        </Link>
      </div>
    </article>
  );
}
