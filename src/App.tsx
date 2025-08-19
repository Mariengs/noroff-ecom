import { Routes, Route } from "react-router-dom";
import Layout from "./components/Layout/Layout";
import ScrollToTop from "./components/ScrollToTop";
import Home from "./pages/Home/Home";
import ProductPage from "./pages/Product/ProductPage";
import CheckoutPage from "./pages/Checkout/CheckoutPage";
import CheckoutSuccessPage from "./pages/CheckoutSuccess/CheckoutSuccessPage";
import ContactPage from "./pages/Contact/ContactPage";

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
