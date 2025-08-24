import { Link } from "react-router-dom";
import styles from "./ProductCard.module.css";
import { getImageUrl } from "../../lib/image";
import type { Product } from "../../types/onlineShop";
import { useCart } from "../../context/CartContext";
import { useToast } from "../Toast/ToastProvider";

type Props = {
  product: Product;
};

export default function ProductCard({ product }: Props) {
  const { id, title, price, discountedPrice = price } = product;
  const { add } = useCart();
  const toast = useToast();

  const imageUrl = getImageUrl(product);
  const hasDiscount = discountedPrice < price && price > 0;

  const pct = hasDiscount
    ? Math.round(((price - discountedPrice) / price) * 100)
    : 0;

  const formatNOK = (n: number) =>
    new Intl.NumberFormat("no-NO", {
      style: "currency",
      currency: "NOK",
    }).format(n);

  function handleAddToCart() {
    add({
      id: product.id,
      title: product.title,
      price: product.price,
      discountedPrice: product.discountedPrice,
      imageUrl: product.image?.url,
    });
    toast.success(`Added ${product.title} to cart`);
  }

  return (
    <article className={styles.card}>
      <div className={styles.media}>
        {imageUrl ? (
          <img src={imageUrl} alt={title} loading="lazy" />
        ) : (
          <div className={styles.placeholder} aria-hidden={true} />
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

        <div className={styles.actions}>
          <Link
            className={`btn btn-primary ${styles.button}`}
            to={`/product/${id}`}
            aria-label={`View ${title}`}
          >
            View product
          </Link>

          <button
            type="button"
            className={`btn ${styles.button}`}
            onClick={handleAddToCart}
            aria-label={`Add ${title} to cart`}
          >
            Add to cart
          </button>
        </div>
      </div>
    </article>
  );
}
