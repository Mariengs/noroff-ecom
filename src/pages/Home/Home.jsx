import { useEffect, useMemo, useState } from "react";
import { getProducts } from "../../lib/api";
import ProductCard from "../../components/ProductCard/ProductCard";
import SearchBar from "../../components/SearchBar/SearchBar";
import ProductCardSkeleton from "../../components/ProductCard/ProductCardSkeleton";
import SortButton from "../../components/SortButton/SortButton";

export default function Home() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState("default");

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const data = await getProducts();
        setProducts(Array.isArray(data) ? data : data?.results || []);
      } catch {
        setError("Could not load products");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return products;

    const tokens = q.split(/\s+/).filter(Boolean);

    function matches(p) {
      const title = (p.title || "").toLowerCase();
      const tags = Array.isArray(p.tags)
        ? p.tags.map((t) => String(t).toLowerCase())
        : [];

      return tokens.every((tok) => {
        if (tok.startsWith("#")) {
          const needle = tok.slice(1);
          return tags.some((t) => t.includes(needle));
        }

        return title.includes(tok) || tags.some((t) => t.includes(tok));
      });
    }

    return products.filter(matches);
  }, [products, query]);

  const sorted = useMemo(() => {
    const arr = [...filtered];
    switch (sort) {
      case "price-asc":
        return arr.sort(
          (a, b) =>
            (a.discountedPrice ?? a.price) - (b.discountedPrice ?? b.price)
        );
      case "price-desc":
        return arr.sort(
          (a, b) =>
            (b.discountedPrice ?? b.price) - (a.discountedPrice ?? a.price)
        );
      case "rating":
        return arr.sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));
      case "title":
        return arr.sort((a, b) => (a.title ?? "").localeCompare(b.title ?? ""));
      default:
        return arr;
    }
  }, [filtered, sort]);

  const searchResults = useMemo(() => {
    return sorted.slice(0, 8).map((p) => ({
      ...p,

      category: Array.isArray(p.tags)
        ? p.tags.slice(0, 3).join(", ")
        : undefined,

      image: p.image?.url ?? p.image ?? undefined,
    }));
  }, [sorted]);

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
      <SearchBar value={query} onChange={setQuery} results={searchResults} />
      <SortButton value={sort} onChange={setSort} />
      <div className="grid--products">
        {sorted.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </section>
  );
}
