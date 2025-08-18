import styles from "./ProductCard.module.css";

export default function ProductCardSkeleton() {
  return (
    <article className={styles.card} aria-hidden="true">
      <div className={styles.media}>
        <div className="skeleton" style={{ width: "100%", height: 140 }} />
      </div>

      <div className={styles.body}>
        <div className="skeleton" style={{ width: "80%", height: 14 }} />
        <div style={{ display: "flex", gap: 6, marginTop: 8 }}>
          <div className="skeleton" style={{ width: 70, height: 16 }} />
          <div className="skeleton" style={{ width: 50, height: 14 }} />
        </div>
        <div
          className="skeleton"
          style={{ width: "100%", height: 34, marginTop: 10 }}
        />
      </div>
    </article>
  );
}
