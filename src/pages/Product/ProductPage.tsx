import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getProduct } from "../../lib/api";
import { useCart } from "../../context/CartContext";
import { formatNOK, discountPercent } from "../../lib/pricing";
import { getImageUrl } from "../../lib/image";
import { useToast } from "../../components/Toast/ToastProvider";
import s from "./ProductPage.module.css";
import type { Product } from "../../types/onlineShop";

export default function ProductPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const toast = useToast();
  const { add } = useCart();

  const [product, setProduct] = useState<Product | null>(null);
  const [activeIdx, setActiveIdx] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadTick, setReloadTick] = useState(0); // for “Try again”

  useEffect(() => {
    const ac = new AbortController();

    async function load() {
      try {
        setLoading(true);
        setError(null);

        if (!id) {
          setError("Invalid product id");
          setProduct(null);
          return;
        }

        const data = await getProduct(id, {
          signal: ac.signal,
          timeoutMs: 15000,
        });
        if (ac.signal.aborted) return; // ikke sett state etter abort

        setProduct(data);
        setActiveIdx(0);
      } catch (e: any) {
        if (ac.signal.aborted) return; // ignorer abort (StrictMode / navigasjon)
        if (e?.name === "AbortError") return;

        // 404 → “not found”, ellers vis feilmelding fra Error/ApiError
        const is404 =
          e &&
          typeof e === "object" &&
          "status" in e &&
          (e as any).status === 404;
        if (is404) {
          setError("Product not found.");
          setProduct(null);
        } else {
          setError(e instanceof Error ? e.message : "Could not load product");
        }
      } finally {
        if (ac.signal.aborted) return;
        setLoading(false);
      }
    }

    load();
    return () => ac.abort();
  }, [id, reloadTick]);

  // Avledede verdier (før early returns)
  const primary = product ? getImageUrl(product) : null;
  const altText = product?.image?.alt || product?.title || "";

  // API-et har i praksis ett bilde; galleri for ev. fremtid
  const gallery = useMemo<string[]>(
    () => (primary ? [primary] : []),
    [primary]
  );

  useEffect(() => {
    if (activeIdx >= gallery.length) setActiveIdx(0);
  }, [gallery, activeIdx]);

  const activeSrc = gallery[activeIdx] || primary || "";

  const hasDiscount =
    product?.discountedPrice != null &&
    product.discountedPrice < (product?.price ?? 0);

  const pct =
    hasDiscount && product
      ? discountPercent(product.price, product.discountedPrice)
      : 0;

  if (loading) return <p className={s.loading}>Loading product…⏳</p>;

  if (error) {
    return (
      <section className={s.section}>
        <div className={s.wrap}>
          <p role="alert" className={s.error}>
            {error}
          </p>
          <div className={s.ctaRow} style={{ gap: "0.5rem" }}>
            <button
              className={s.btn}
              onClick={() => setReloadTick((n) => n + 1)}
            >
              Try again
            </button>
            <button className={s.btn} onClick={() => navigate(-1)}>
              Go back
            </button>
          </div>
        </div>
      </section>
    );
  }

  if (!product) return null;

  function handleAdd(): void {
    if (!product) return;

    const imageUrl = activeSrc || product.image?.url;

    add({
      id: product.id,
      title: product.title,
      price: product.price,
      discountedPrice: product.discountedPrice,
      imageUrl,
    });

    toast.success(`${product.title} added to your cart`, {
      duration: 2500,
      action: {
        label: "Go to cart",
        onClick: () => navigate("/checkout"),
      },
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
