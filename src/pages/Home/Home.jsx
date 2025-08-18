import { useEffect, useMemo, useState } from "react";
import { getProducts } from "../../lib/api";
import ProductCard from "../../components/ProductCard/ProductCard";
import SearchBar from "../../components/SearchBar/SearchBar";
import ProductCardSkeleton from "../../components/ProductCard/ProductCardSkeleton";

export default function Home() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const data = await getProducts();
        setProducts(Array.isArray(data) ? data : data?.results || []);
      } catch (e) {
        setError("Could not load products");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return products;
    return products.filter((p) => p.title?.toLowerCase().includes(q));
  }, [products, query]);

  if (loading) {
    return (
      <section className="container--narrow">
        <h1 className="home-title">Products</h1>
        <p className="home-subtitle">Loading your pastel picks…</p>

        <div className="grid--products">
          {Array.from({ length: 12 }).map((_, i) => (
            <ProductCardSkeleton key={i} />
          ))}
        </div>
      </section>
    );
  }
  if (error) return <p role="alert">{error}</p>;

  return (
    <section className="container--narrow">
      <h1>Products</h1>
      <p className="home-subtitle">Thoughtful products, quietly beautiful.</p>

      <SearchBar
        value={query}
        onChange={setQuery}
        results={filtered.slice(0, 8)}
      />

      <div className="grid--products">
        {filtered.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </section>
  );
}
