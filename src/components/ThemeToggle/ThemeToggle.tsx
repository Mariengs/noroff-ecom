import { useEffect, useState } from "react";
import styles from "./ThemeToggle.module.css";

type Mode = "light" | "dark";

function systemPrefersDark(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia?.("(prefers-color-scheme: dark)")?.matches ?? false;
}

function readInitialMode(): Mode {
  if (typeof window === "undefined") return "light";
  try {
    const saved = localStorage.getItem("theme");
    if (saved === "light" || saved === "dark") return saved;
    return systemPrefersDark() ? "dark" : "light";
  } catch {
    return "light";
  }
}

export default function ThemeToggle() {
  const [mode, setMode] = useState<Mode>(readInitialMode);

  // Hold <html data-theme> og localStorage i sync
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", mode);
    try {
      localStorage.setItem("theme", mode);
    } catch {
      /* ignore */
    }
  }, [mode]);

  // (Valgfritt) Følg systemendringer live
  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = () => {
      const saved = localStorage.getItem("theme");
      // Bare auto-oppdater hvis bruker ikke har lagret et eksplisitt valg
      if (saved !== "light" && saved !== "dark") {
        setMode(mq.matches ? "dark" : "light");
      }
    };
    mq.addEventListener?.("change", handler);
    return () => mq.removeEventListener?.("change", handler);
  }, []);

  const isDark = mode === "dark";
  const icon = isDark ? "🌙" : "☀️";
  const label = isDark
    ? "Dark theme (click for Light)"
    : "Light theme (click for Dark)";

  return (
    <button
      type="button"
      onClick={() => setMode((m) => (m === "light" ? "dark" : "light"))}
      className={styles.toggle}
      aria-label={label}
      title={label}
    >
      <span className={styles.icon} aria-hidden={true}>
        {icon}
      </span>
    </button>
  );
}
