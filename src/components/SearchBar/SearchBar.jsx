import { useNavigate } from "react-router-dom";
import styles from "./SearchBar.module.css";

export default function SearchBar({ value, onChange, results }) {
  const navigate = useNavigate();

  return (
    <div className={styles.wrap}>
      <input
        className={styles.input}
        placeholder="Search products…"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-label="Search products"
      />
      {value && results?.length > 0 && (
        <ul className={styles.dropdown} role="listbox">
          {results.map((r) => (
            <li key={r.id} role="option">
              <button onClick={() => navigate(`/product/${r.id}`)}>
                {r.title}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
