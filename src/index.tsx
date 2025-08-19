// src/index.tsx eller src/main.tsx
import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { CartProvider } from "./context/CartContext";
import { ToastProvider } from "./components/Toast/ToastProvider";
import App from "./App";
import "./styles/globals.css";

const savedTheme = localStorage.getItem("theme"); // 'light' | 'dark' | 'system' | null
if (savedTheme === "dark" || savedTheme === "light") {
  document.documentElement.setAttribute("data-theme", savedTheme);
} else {
  // 'system' eller null: fjern attributt så @media-regelen får styre
  document.documentElement.removeAttribute("data-theme");
}

const rootEl = document.getElementById("root");
if (!rootEl) throw new Error("Root element not found: #root");

createRoot(rootEl).render(
  <React.StrictMode>
    <BrowserRouter>
      <CartProvider>
        <ToastProvider>
          <App />
        </ToastProvider>
      </CartProvider>
    </BrowserRouter>
  </React.StrictMode>
);
