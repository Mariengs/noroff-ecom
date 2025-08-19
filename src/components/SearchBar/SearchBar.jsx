import { useNavigate } from "react-router-dom";
import { useEffect, useId, useRef, useState } from "react";
import styles from "./SearchBar.module.css";

export default function SearchBar({ value, onChange, results = [] }) {
  const navigate = useNavigate();
  const listboxId = useId();
  const wrapRef = useRef(null);

  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);

  useEffect(() => {
    setOpen(Boolean(value && results.length));
    setActiveIndex(-1);
  }, [value, results]);

  useEffect(() => {
    function onDocMouseDown(e) {
      if (!wrapRef.current) return;
      if (!wrapRef.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", onDocMouseDown);
    return () => document.removeEventListener("mousedown", onDocMouseDown);
  }, []);

  function handleKeyDown(e) {
    if (
      !open &&
      (e.key === "ArrowDown" || e.key === "ArrowUp") &&
      results.length
    ) {
      setOpen(true);
      setActiveIndex(0);
      e.preventDefault();
      return;
    }
    if (!open) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter" && activeIndex >= 0) {
      e.preventDefault();
      navigate(`/product/${results[activeIndex].id}`);
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  }

  const showClear = Boolean(value);

  return (
    <div className={styles.wrap} ref={wrapRef}>
      <div className={styles.inputWrap}>
        <span className={styles.icon} aria-hidden>
          🔎
        </span>

        <input
          className={styles.input}
          placeholder="Search products…"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            if (value && results.length) setOpen(true);
          }}
          aria-label="Search products"
          role="combobox"
          aria-autocomplete="list"
          aria-expanded={open}
          aria-controls={open ? listboxId : undefined}
          aria-activedescendant={
            open && activeIndex >= 0
              ? `${listboxId}-opt-${activeIndex}`
              : undefined
          }
        />

        {showClear && (
          <button
            type="button"
            className={styles.clear}
            onClick={() => {
              onChange("");
              setOpen(false);
              setActiveIndex(-1);
            }}
            aria-label="Clear search"
            title="Clear"
          >
            ✕
          </button>
        )}
      </div>

      {open && (
        <ul id={listboxId} className={styles.dropdown} role="listbox">
          {results.map((r, i) => {
            const isActive = i === activeIndex;
            const imgSrc = r.image?.url || r.image || r.thumbnail || null;

            return (
              <li
                key={r.id}
                id={`${listboxId}-opt-${i}`}
                role="option"
                aria-selected={isActive}
                className={`${styles.option} ${isActive ? styles.active : ""}`}
                onMouseEnter={() => setActiveIndex(i)}
                onMouseDown={(e) => {
                  e.preventDefault();
                  navigate(`/product/${r.id}`);
                }}
              >
                {imgSrc ? (
                  <img
                    className={styles.thumb}
                    src={imgSrc}
                    alt=""
                    aria-hidden
                    loading="lazy"
                    decoding="async"
                  />
                ) : (
                  <div className={styles.thumbFallback} aria-hidden>
                    🛍️
                  </div>
                )}
                <div className={styles.meta}>
                  <div className={styles.title}>{r.title}</div>
                  {r.category && <div className={styles.sub}>{r.category}</div>}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
