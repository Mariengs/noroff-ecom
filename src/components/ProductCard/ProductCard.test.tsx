import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

type Product = { id: string; title: string; price: number; image?: string };
function ProductCard({
  product,
  onAddToCart,
}: {
  product: Product;
  onAddToCart: (p: Product) => void;
}) {
  return (
    <article>
      <h3>{product.title}</h3>
      <p>{product.price}</p>
      <button onClick={() => onAddToCart(product)}>Add to cart</button>
    </article>
  );
}

test("adds product to cart on click", async () => {
  const user = userEvent.setup();
  const onAdd = vi.fn();
  const product = { id: "1", title: "Lamp", price: 499 };

  render(<ProductCard product={product} onAddToCart={onAdd} />);

  await user.click(screen.getByRole("button", { name: /add to cart/i }));
  expect(onAdd).toHaveBeenCalledWith(product);
});
