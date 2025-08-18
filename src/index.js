import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { CartProvider } from "./context/CartContext"; // ← viktig
import App from "./App";
import "./styles/globals.css";

const savedTheme = localStorage.getItem("theme"); // 'light' | 'dark' | 'system' | null
if (savedTheme === "dark" || savedTheme === "light") {
  document.documentElement.setAttribute("data-theme", savedTheme);
} else {
  // 'system' eller null: fjern attributt så @media-regelen får styre
  document.documentElement.removeAttribute("data-theme");
}

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <CartProvider>
        <App />
      </CartProvider>
    </BrowserRouter>
  </React.StrictMode>
);
