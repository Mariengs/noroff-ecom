import { useEffect } from "react";
import { Link } from "react-router-dom";
import { useCart } from "../../context/CartContext";

export default function CheckoutSuccessPage() {
  const { clear } = useCart();

  useEffect(() => {
    clear();
  }, [clear]);

  return (
    <section>
      <h1>Order successful 🎉</h1>
      <p>Thanks for your purchase. Your order has been placed successfully.</p>
      <Link to="/">Back to store</Link>
    </section>
  );
}
