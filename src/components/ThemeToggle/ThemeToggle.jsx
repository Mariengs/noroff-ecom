// src/components/ThemeToggle/ThemeToggle.jsx
import { useEffect, useState } from "react";
import styles from "./ThemeToggle.module.css";

function systemPrefersDark() {
  return (
    typeof window !== "undefined" &&
    window.matchMedia?.("(prefers-color-scheme: dark)")?.matches
  );
}

export default function ThemeToggle() {
  // Init: følg system ÉN gang, hvis ingenting lagret
  const [mode, setMode] = useState(() => {
    const saved = localStorage.getItem("theme");
    if (saved === "light" || saved === "dark") return saved;
    return systemPrefersDark() ? "dark" : "light";
  });

  // Anvend valgt modus på <html> (bare light/dark – ingen system lenger)
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", mode);
    localStorage.setItem("theme", mode);
  }, [mode]);

  // Toggle mellom light <-> dark
  function toggle() {
    setMode((m) => (m === "light" ? "dark" : "light"));
  }

  const isDark = mode === "dark";
  const icon = isDark ? "🌙" : "☀️";
  const label = isDark
    ? "Dark theme (click for Light)"
    : "Light theme (click for Dark)";

  return (
    <button
      type="button"
      onClick={toggle}
      className={styles.toggle}
      aria-label={label}
      title={label}
    >
      <span className={styles.icon} aria-hidden>
        {icon}
      </span>
    </button>
  );
}
