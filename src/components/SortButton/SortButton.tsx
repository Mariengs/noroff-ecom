import { useEffect, useRef, useState } from "react";
import styles from "./SortButton.module.css";

export type SortValue =
  | "default"
  | "price-asc"
  | "price-desc"
  | "rating"
  | "title";

export type SortOption = {
  value: SortValue;
  label: string;
};

const DEFAULT_OPTIONS: Readonly<SortOption[]> = [
  { value: "default", label: "Recommended" },
  { value: "price-asc", label: "Price: Low → High" },
  { value: "price-desc", label: "Price: High → Low" },
  { value: "rating", label: "Rating: High → Low" },
  { value: "title", label: "Title A → Z" },
] as const;

type Props = {
  value: SortValue;
  onChange: (val: SortValue) => void;
  options?: SortOption[];
};

export default function SortButton({
  value = "default",
  onChange,
  options,
}: Props) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);

  const opts =
    Array.isArray(options) && options.length ? options : DEFAULT_OPTIONS;
  const current = opts.find((o) => o.value === value) ?? opts[0];

  useEffect(() => {
    function onDocDown(e: MouseEvent) {
      if (!ref.current) return;
      if (!ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDocDown);
    return () => document.removeEventListener("mousedown", onDocDown);
  }, []);

  function choose(val: SortValue) {
    onChange(val);
    setOpen(false);
  }

  return (
    <div className={styles.wrap} ref={ref}>
      <button
        type="button"
        className={styles.button}
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        {current?.label ?? "Sort"}
        <span className={styles.chevron} aria-hidden={true}>
          ▾
        </span>
      </button>

      {open && (
        <ul
          className={styles.dropdown}
          role="listbox"
          aria-label="Sort products"
        >
          {opts.map((o) => (
            <li
              key={o.value}
              role="option"
              aria-selected={o.value === value}
              className={`${styles.option} ${
                o.value === value ? styles.active : ""
              }`}
              onMouseDown={(e) => {
                e.preventDefault();
                choose(o.value);
              }}
            >
              {o.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
