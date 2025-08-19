import {
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import styles from "./Toast.module.css";

const ToastCtx = createContext(null);
let idCounter = 0;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const remove = useCallback((id) => {
    setToasts((curr) => curr.filter((t) => t.id !== id));
  }, []);

  const push = useCallback(
    ({ message, type = "info", duration = 3000, action }) => {
      const id = ++idCounter;
      const toast = { id, message, type, duration, action };
      setToasts((curr) => [...curr, toast]);
      if (duration > 0) {
        // auto-dismiss
        setTimeout(() => remove(id), duration);
      }
      return id;
    },
    [remove]
  );

  const apiRef = useRef({
    notify: (message, opts = {}) => push({ ...opts, message }),
    success: (message, opts = {}) =>
      push({ ...opts, type: "success", message }),
    error: (message, opts = {}) => push({ ...opts, type: "error", message }),
    info: (message, opts = {}) => push({ ...opts, type: "info", message }),
    remove,
  });

  return (
    <ToastCtx.Provider value={apiRef.current}>
      {children}
      {createPortal(
        <div className={styles.container} aria-live="polite" aria-atomic="true">
          {toasts.map((t) => (
            <div key={t.id} className={`${styles.toast} ${styles[t.type]}`}>
              <div className={styles.content}>
                <span className={styles.icon} aria-hidden>
                  {t.type === "success"
                    ? "✅"
                    : t.type === "error"
                    ? "⚠️"
                    : "ℹ️"}
                </span>
                <div className={styles.message}>{t.message}</div>

                {t.action && (
                  <button
                    className={styles.action}
                    onClick={() => {
                      t.action?.onClick?.();
                      remove(t.id);
                    }}
                  >
                    {t.action.label}
                  </button>
                )}

                <button
                  className={styles.close}
                  aria-label="Close"
                  onClick={() => remove(t.id)}
                >
                  ✕
                </button>
              </div>
            </div>
          ))}
        </div>,
        document.body
      )}
    </ToastCtx.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastCtx);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}
