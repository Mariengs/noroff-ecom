import { useEffect, useMemo, useState } from "react";
import { getProducts } from "../../lib/api";
import ProductCard from "../../components/ProductCard/ProductCard";
import SearchBar, {
  type SearchResult,
} from "../../components/SearchBar/SearchBar";
import ProductCardSkeleton from "../../components/ProductCard/ProductCardSkeleton";
import SortButton, {
  type SortValue,
} from "../../components/SortButton/SortButton";
import type { Product } from "../../types/onlineShop";
import styles from "./Home.module.css";
import logoSrc from "../../assets/logo.svg";

function Title({
  as: Tag = "h1",
  className = "",
}: {
  as?: keyof JSX.IntrinsicElements;
  className?: string;
}) {
  const cls = [styles.homeTitle, className].filter(Boolean).join(" ");
  return (
    <Tag className={cls}>
      <img src={logoSrc} alt="LumiShop logo" className={styles.logo} />
      LumiShop
    </Tag>
  );
}

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadTick, setReloadTick] = useState(0);

  const [query, setQuery] = useState<string>("");
  const [sort, setSort] = useState<SortValue>("default");

  useEffect(() => {
    const ac = new AbortController();

    async function load() {
      try {
        setLoading(true);
        setError(null);
        const data = await getProducts({ signal: ac.signal });
        if (ac.signal.aborted) return;
        setProducts(Array.isArray(data) ? data : []);
      } catch (e: any) {
        if (ac.signal.aborted) return;
        if (e?.name === "AbortError") return;
        setError(e instanceof Error ? e.message : "Could not load products");
      } finally {
        if (ac.signal.aborted) return;
        setLoading(false);
      }
    }

    load();
    return () => ac.abort();
  }, [reloadTick]);

  const filtered = useMemo<Product[]>(() => {
    const q = query.trim().toLowerCase();
    if (!q) return products;

    const tokens = q.split(/\s+/).filter(Boolean);

    function matches(p: Product): boolean {
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

  const sorted = useMemo<Product[]>(() => {
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

  const searchResults: SearchResult[] = useMemo(() => {
    return sorted.slice(0, 8).map((p) => ({
      id: p.id,
      title: p.title,
      category: Array.isArray(p.tags)
        ? p.tags.slice(0, 3).join(", ")
        : undefined,
      image: (p as any).image?.url ?? (p as any).image ?? undefined,
      thumbnail: undefined,
    }));
  }, [sorted]);

  if (loading) {
    return (
      <section className="container--narrow">
        <Title as="h1" />
        <p className="home-subtitle">Loading products...</p>
        <div className="grid--products">
          {Array.from({ length: 12 }).map((_, i) => (
            <ProductCardSkeleton key={`skeleton-${i}`} />
          ))}
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="container--narrow">
        <Title as="h1" />
        <div role="alert" style={{ marginTop: "0.5rem" }}>
          <p style={{ margin: 0 }}>Couldn´t load products.</p>
          <small style={{ color: "#666" }}>{error}</small>
        </div>
        <button
          className="btn"
          style={{ marginTop: "1rem" }}
          onClick={() => setReloadTick((n) => n + 1)}
        >
          Try again
        </button>
      </section>
    );
  }

  if (!sorted.length) {
    return (
      <section className="container--narrow">
        <Title as="h1" />
        <p className="home-subtitle">
          No products matched your search. Try something else¸
        </p>
        <SearchBar value={query} onChange={setQuery} results={[]} />
      </section>
    );
  }

  return (
    <section className="container--narrow">
      <Title as="h1" />
      <p className="home-subtitle">Thoughtful products, quietly beautiful</p>

      <SearchBar value={query} onChange={setQuery} results={searchResults} />
      <SortButton value={sort} onChange={setSort} />

      <div className="grid--products">
        {sorted.map((p) => (
          <ProductCard
            key={p.id}
            product={p}
            primaryBtnClass="btn btn-primary"
            cartBtnClass="btn btn-cart"
          />
        ))}
      </div>
    </section>
  );
}
