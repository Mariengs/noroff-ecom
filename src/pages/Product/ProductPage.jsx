import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { getProduct } from "../../lib/api";
import { useCart } from "../../context/CartContext";
import { formatNOK, discountPercent } from "../../lib/pricing";
import { getImageUrl } from "../../lib/image";
import s from "./ProductPage.module.css";

export default function ProductPage() {
  const { id } = useParams();
  const { add } = useCart();

  const [product, setProduct] = useState(null);
  const [activeIdx, setActiveIdx] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setError("");
        const data = await getProduct(id);
        setProduct(data);
        setActiveIdx(0);
      } catch (e) {
        setError("Could not load product");
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  // Avledede verdier (før early returns)
  const primary = product ? getImageUrl(product) : null;
  const altText = product?.image?.alt || product?.title || "";

  // API-et har i praksis ett bilde; beholder galleri-API for fremtidig støtte
  const gallery = useMemo(() => (primary ? [primary] : []), [primary]);

  useEffect(() => {
    if (activeIdx >= gallery.length) setActiveIdx(0);
  }, [gallery, activeIdx]);

  const activeSrc = gallery[activeIdx] || primary || "";

  const hasDiscount =
    product?.discountedPrice != null && product.discountedPrice < product.price;

  const pct = hasDiscount
    ? discountPercent(product.price, product.discountedPrice)
    : 0;

  // Early returns
  if (loading) return <p className={s.loading}>Loading…</p>;
  if (error)
    return (
      <p role="alert" className={s.error}>
        {error}
      </p>
    );
  if (!product) return null;

  function handleAdd() {
    add({
      id: product.id,
      title: product.title,
      price: product.price,
      discountedPrice: product.discountedPrice ?? product.price,
      image: activeSrc,
    });
  }

  return (
    <section className={s.section}>
      <div className={s.wrap}>
        {/* Hero */}
        <div className={s.hero}>
          {/* Media-kort */}
          <div className={s.mediaCard}>
            <div className={s.media}>
              {activeSrc && (
                <img className={s.img} src={activeSrc} alt={altText} />
              )}
            </div>

            {gallery.length > 1 && (
              <div
                className={s.thumbs}
                role="listbox"
                aria-label="Product images"
              >
                {gallery.map((src, idx) => (
                  <button
                    key={src + idx}
                    className={s.thumbBtn}
                    type="button"
                    aria-current={idx === activeIdx ? "true" : "false"}
                    aria-label={`Image ${idx + 1}`}
                    onClick={() => setActiveIdx(idx)}
                  >
                    <img className={s.thumbImg} src={src} alt="" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info-kort */}
          <div className={s.infoCard}>
            <h1 className={s.title}>{product.title}</h1>

            {product.description && (
              <p className={s.desc}>{product.description}</p>
            )}

            <div className={s.badges}>
              {hasDiscount && <span className={s.badge}>On sale</span>}
              {Array.isArray(product.tags) &&
                product.tags.slice(0, 3).map((t) => (
                  <span key={t} className={s.badge}>
                    {t}
                  </span>
                ))}
            </div>

            <div className={s.priceBlock} aria-live="polite">
              <strong className={s.priceNow}>
                {formatNOK(product.discountedPrice ?? product.price)}
              </strong>
              {hasDiscount && (
                <>
                  <span className={s.priceWas}>{formatNOK(product.price)}</span>
                  <span className={s.pct}>-{pct}%</span>
                </>
              )}
            </div>

            <div className={s.ctaRow}>
              <button className={s.btn} onClick={handleAdd}>
                Add to cart
              </button>
              <div className={s.meta}>
                {product.rating != null && (
                  <span>
                    Rating: <strong>{product.rating}/5</strong>
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Reviews */}
        {Array.isArray(product.reviews) && product.reviews.length > 0 && (
          <div className={s.reviews}>
            <div className={s.reviewsCard}>
              <h2>Reviews</h2>
              <ul className={s.reviewList}>
                {product.reviews.map((r, idx) => (
                  <li className={s.reviewItem} key={r.id || idx}>
                    <div className={s.reviewHead}>
                      <span>{r.username || "Anonymous"}</span>
                      {r.rating != null && (
                        <span className={s.rating}>{r.rating}/5</span>
                      )}
                    </div>
                    {r.description && <p>{r.description}</p>}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
