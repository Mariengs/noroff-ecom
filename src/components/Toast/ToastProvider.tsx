import {
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import styles from "./Toast.module.css";

export type ToastType = "info" | "success" | "error";

export type ToastAction = {
  label: string;
  onClick?: () => void;
};

export type ToastItem = {
  id: number;
  message: string;
  type: ToastType;
  duration: number;
  action?: ToastAction;
};

export type PushArgs = {
  message: string;
  type?: ToastType;
  duration?: number;
  action?: ToastAction;
};

export interface ToastAPI {
  notify: (message: string, opts?: Omit<PushArgs, "message">) => number;
  success: (
    message: string,
    opts?: Omit<PushArgs, "message" | "type">
  ) => number;
  error: (message: string, opts?: Omit<PushArgs, "message" | "type">) => number;
  info: (message: string, opts?: Omit<PushArgs, "message" | "type">) => number;
  remove: (id: number) => void;
}

const ToastCtx = createContext<ToastAPI | null>(null);

let idCounter = 0;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const remove = useCallback((id: number) => {
    setToasts((curr) => curr.filter((t) => t.id !== id));
  }, []);

  const push = useCallback(
    ({ message, type = "info", duration = 3000, action }: PushArgs): number => {
      const id = ++idCounter;
      const toast: ToastItem = { id, message, type, duration, action };
      setToasts((curr) => [...curr, toast]);
      if (duration > 0) {
        // auto-dismiss
        window.setTimeout(() => remove(id), duration);
      }
      return id;
    },
    [remove]
  );

  const apiRef = useRef<ToastAPI>({
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
        <div className={styles.container} aria-live="polite" aria-atomic={true}>
          {toasts.map((t) => (
            <div key={t.id} className={`${styles.toast} ${styles[t.type]}`}>
              <div className={styles.content}>
                <span className={styles.icon} aria-hidden={true}>
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

export function useToast(): ToastAPI {
  const ctx = useContext(ToastCtx);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}
