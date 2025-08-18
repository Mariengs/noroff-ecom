import { useNavigate } from "react-router-dom";
import { useEffect, useId, useState } from "react";
import styles from "./SearchBar.module.css";

export default function SearchBar({ value, onChange, results }) {
  const navigate = useNavigate();
  const listboxId = useId();
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);

  useEffect(() => {
    setOpen(Boolean(value && results?.length));
    setActiveIndex(-1);
  }, [value, results]);

  function onKeyDown(e) {
    if (!open) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter" && activeIndex >= 0) {
      e.preventDefault();
      const r = results[activeIndex];
      navigate(`/product/${r.id}`);
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  }

  return (
    <div className={styles.wrap}>
      <input
        className={styles.input}
        placeholder="Search products…"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={onKeyDown}
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

      {open && (
        <ul id={listboxId} className={styles.dropdown} role="listbox">
          {results.map((r, i) => (
            <li
              key={r.id}
              id={`${listboxId}-opt-${i}`}
              role="option"
              aria-selected={i === activeIndex}
              onMouseEnter={() => setActiveIndex(i)}
              onMouseDown={(e) => {
                // onMouseDown for å unngå blur før click
                e.preventDefault();
                navigate(`/product/${r.id}`);
              }}
            >
              {r.title}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
