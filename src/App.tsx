import { Routes, Route } from "react-router-dom";
import Layout from "./components/Layout/Layout";
import ScrollToTop from "./components/ScrollToTop";
import Home from "./pages/Home/Home";
import ProductPage from "./pages/Product/ProductPage";
import CheckoutPage from "./pages/Checkout/CheckoutPage";
import CheckoutSuccessPage from "./pages/CheckoutSuccess/CheckoutSuccessPage";
import ContactPage from "./pages/Contact/ContactPage";

/**
 * Main application component that sets up routing and layout structure.
 * Renders the app within a Layout wrapper and includes route definitions
 * for all major pages (Home, Product, Checkout, Success, Contact).
 * @returns {JSX.Element} The root application component with routing configured
 */
export default function App() {
  return (
    <Layout>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/product/:id" element={<ProductPage />} />
        <Route path="/checkout" element={<CheckoutPage />} />
        <Route path="/success" element={<CheckoutSuccessPage />} />
        <Route path="/contact" element={<ContactPage />} />
      </Routes>
    </Layout>
  );
}
