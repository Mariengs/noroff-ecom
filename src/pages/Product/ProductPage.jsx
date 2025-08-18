import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getProduct } from "../../lib/api";
import { useCart } from "../../context/CartContext";
import { formatNOK, discountPercent } from "../../lib/pricing";
import { getImageUrl } from "../../lib/image";

export default function ProductPage() {
  const { id } = useParams();
  const { add } = useCart();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const data = await getProduct(id);
        setProduct(data);
      } catch (e) {
        setError("Could not load product");
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  if (loading) return <p>Loading…</p>;
  if (error) return <p role="alert">{error}</p>;
  if (!product) return null;

  const img = getImageUrl(product);
  const hasDiscount =
    product.discountedPrice != null && product.discountedPrice < product.price;
  const pct = discountPercent(product.price, product.discountedPrice);

  function handleAdd() {
    add({
      id: product.id,
      title: product.title,
      price: product.price,
      discountedPrice: product.discountedPrice ?? product.price,
      image: img,
    });
  }

  return (
    <section>
      <div className="product-hero">
        {img && <img src={img} alt={product.title} />}
        <div>
          <h1>{product.title}</h1>
          <p>{product.description}</p>
          <div className="price-block">
            <strong>
              {formatNOK(product.discountedPrice ?? product.price)}
            </strong>
            {hasDiscount && (
              <span className="was">
                {formatNOK(product.price)} (-{pct}%)
              </span>
            )}
          </div>
          <button onClick={handleAdd}>Add to cart</button>
        </div>
      </div>

      {Array.isArray(product.reviews) && product.reviews.length > 0 && (
        <div className="reviews">
          <h2>Reviews</h2>
          <ul>
            {product.reviews.map((r, idx) => (
              <li key={r.id || idx}>
                <strong>{r.username || "Anonymous"}</strong> –{" "}
                {r.rating ? `${r.rating}/5` : ""}
                <p>{r.description || r.text}</p>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
