// src/components/ThemeToggle/ThemeToggle.jsx
import { useEffect, useState } from "react";
import styles from "./ThemeToggle.module.css";

// liten utils for å lese systempreferanse
function systemPrefersDark() {
  return (
    window.matchMedia &&
    window.matchMedia("(prefers-color-scheme: dark)").matches
  );
}

export default function ThemeToggle() {
  const [mode, setMode] = useState(
    () => localStorage.getItem("theme") || "system"
  );
  const isSystemDark = systemPrefersDark();

  // bruk effekt for å anvende modus på <html>
  useEffect(() => {
    if (mode === "dark" || mode === "light") {
      document.documentElement.setAttribute("data-theme", mode);
      localStorage.setItem("theme", mode);
    } else {
      // system
      document.documentElement.removeAttribute("data-theme");
      localStorage.setItem("theme", "system");
    }
  }, [mode]);

  // oppdater hvis bruker endrer systemtema mens appen er åpen og vi er i "system"
  useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = () => {
      if (mode === "system") {
        // trigger re-render for ikon
        setMode("system");
      }
    };
    mq.addEventListener?.("change", handler);
    return () => mq.removeEventListener?.("change", handler);
  }, [mode]);

  // sykle moduser: Light -> Dark -> System
  function cycle() {
    setMode((m) =>
      m === "light" ? "dark" : m === "dark" ? "system" : "light"
    );
  }

  // hvilket ikon/label?
  const effectiveDark = mode === "dark" || (mode === "system" && isSystemDark);
  const icon = mode === "system" ? "🖥️" : effectiveDark ? "☀️" : "🌙";
  const label =
    mode === "system"
      ? "Following system theme (click to force light)"
      : effectiveDark
      ? "Dark theme (click for System)"
      : "Light theme (click for Dark)";

  return (
    <button
      type="button"
      onClick={cycle}
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
