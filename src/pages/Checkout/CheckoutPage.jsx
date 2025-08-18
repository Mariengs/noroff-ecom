import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../../context/CartContext";
import { formatNOK } from "../../lib/pricing";

export default function CheckoutPage() {
  const { items, inc, dec, remove, totalAmount } = useCart();
  const navigate = useNavigate();

  if (items.length === 0) {
    return (
      <section>
        <h1>Your cart</h1>
        <p>Your cart is empty.</p>
        <Link to="/">Go back to products</Link>
      </section>
    );
  }

  return (
    <section>
      <h1>Your cart</h1>
      <ul className="cart-list">
        {items.map((i) => (
          <li key={i.id} className="cart-item">
            {i.image && <img src={i.image} alt="" />}
            <div className="info">
              <strong>{i.title}</strong>
              <div className="qty">
                <button onClick={() => dec(i.id)} aria-label="Decrease">
                  −
                </button>
                <span>{i.qty}</span>
                <button onClick={() => inc(i.id)} aria-label="Increase">
                  +
                </button>
              </div>
              <button className="link" onClick={() => remove(i.id)}>
                Remove
              </button>
            </div>
            <div className="line-total">
              {formatNOK(i.qty * (i.discountedPrice ?? i.price))}
            </div>
          </li>
        ))}
      </ul>

      <div className="checkout-summary">
        <div className="total">
          <span>Total</span>
          <strong>{formatNOK(totalAmount)}</strong>
        </div>
        <button onClick={() => navigate("/success")}>Checkout</button>
      </div>
    </section>
  );
}
