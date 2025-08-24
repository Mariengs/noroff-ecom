import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CartProvider, useCart, type CartItem } from "./CartContext";

// Helper
function Harness() {
  const cart = useCart();
  return (
    <div>
      <div data-testid="totalQty">{cart.totalQty}</div>
      <div data-testid="totalAmount">{cart.totalAmount}</div>

      <button
        onClick={() =>
          cart.add({
            id: "p1",
            title: "Lamp",
            price: 1000,
            discountedPrice: 800,
            imageUrl: "u",
          })
        }
      >
        add-p1
      </button>

      <button
        onClick={() =>
          cart.addQty(
            {
              id: "p2",
              title: "Chair",
              price: 500,
            },
            3
          )
        }
      >
        addqty-p2x3
      </button>

      <button onClick={() => cart.inc("p1")}>inc-p1</button>
      <button onClick={() => cart.dec("p1")}>dec-p1</button>
      <button onClick={() => cart.remove("p2")}>remove-p2</button>
      <button onClick={() => cart.clear()}>clear</button>
    </div>
  );
}

function renderWithProvider(ui: React.ReactElement = <Harness />) {
  return render(<CartProvider>{ui}</CartProvider>);
}

describe("CartContext", () => {
  beforeEach(() => {
    localStorage.clear();
    jest.restoreAllMocks();
  });

  it("throws if useCart is used outside CartProvider", () => {
    const Bad = () => {
      // eslint-disable-next-line react-hooks/rules-of-hooks
      useCart();
      return null;
    };
    const spy = jest.spyOn(console, "error").mockImplementation(() => {});
    expect(() => render(<Bad />)).toThrow(
      /useCart must be used within CartProvider/i
    );
    spy.mockRestore();
  });

  it("initializes from localStorage and normalizes legacy fields", () => {
    // legacy/partial entries, including zero qty and missing id
    localStorage.setItem(
      "cart-v1",
      JSON.stringify({
        items: [
          {
            id: "ok1",
            title: "Old A",
            price: 100,
            qty: 2,
            image: { url: "img-a" },
          },
          {
            id: "ok2",
            title: "Old B",
            price: 200,
            qty: 1,
            thumbnail: "thumb-b",
          },
          { id: "zero", title: "Zero", price: 50, qty: 0 }, // should be filtered out
          { title: "No ID", price: 10, qty: 1 }, // invalid, filtered
        ],
      })
    );

    renderWithProvider();

    // Derived totals: 2*100 + 1*200 = 400
    expect(screen.getByTestId("totalQty")).toHaveTextContent("3");
    expect(screen.getByTestId("totalAmount")).toHaveTextContent("400");
  });

  it("ADD adds a new item or increments existing; discountedPrice is used for totals", async () => {
    const user = userEvent.setup();
    renderWithProvider();

    await user.click(screen.getByRole("button", { name: /add-p1/i }));
    expect(screen.getByTestId("totalQty")).toHaveTextContent("1");
    // discountedPrice 800 is used
    expect(screen.getByTestId("totalAmount")).toHaveTextContent("800");

    // Add same again -> qty 2, amount 1600
    await user.click(screen.getByRole("button", { name: /add-p1/i }));
    expect(screen.getByTestId("totalQty")).toHaveTextContent("2");
    expect(screen.getByTestId("totalAmount")).toHaveTextContent("1600");
  });

  it("ADD_QTY inserts or increments by arbitrary qty", async () => {
    const user = userEvent.setup();
    renderWithProvider();

    await user.click(screen.getByRole("button", { name: /addqty-p2x3/i }));
    expect(screen.getByTestId("totalQty")).toHaveTextContent("3");
    expect(screen.getByTestId("totalAmount")).toHaveTextContent("1500"); // 3 * 500

    // Add p2 again with qty 3 -> 6 total
    await user.click(screen.getByRole("button", { name: /addqty-p2x3/i }));
    expect(screen.getByTestId("totalQty")).toHaveTextContent("6");
    expect(screen.getByTestId("totalAmount")).toHaveTextContent("3000");
  });

  it("INC/DEC adjust qty and DEC removes item when qty hits 0", async () => {
    const user = userEvent.setup();
    renderWithProvider();

    // add p1 twice -> qty 2, amount 1600
    await user.click(screen.getByRole("button", { name: /add-p1/i }));
    await user.click(screen.getByRole("button", { name: /add-p1/i }));
    expect(screen.getByTestId("totalQty")).toHaveTextContent("2");
    expect(screen.getByTestId("totalAmount")).toHaveTextContent("1600");

    await user.click(screen.getByRole("button", { name: /inc-p1/i }));
    expect(screen.getByTestId("totalQty")).toHaveTextContent("3");

    await user.click(screen.getByRole("button", { name: /dec-p1/i }));
    await user.click(screen.getByRole("button", { name: /dec-p1/i }));
    // one more DEC removes the item
    await user.click(screen.getByRole("button", { name: /dec-p1/i }));
    expect(screen.getByTestId("totalQty")).toHaveTextContent("0");
    expect(screen.getByTestId("totalAmount")).toHaveTextContent("0");
  });

  it("REMOVE deletes a specific item", async () => {
    const user = userEvent.setup();
    renderWithProvider();

    await user.click(screen.getByRole("button", { name: /add-p1/i }));
    await user.click(screen.getByRole("button", { name: /addqty-p2x3/i }));
    expect(screen.getByTestId("totalQty")).toHaveTextContent("4");

    await user.click(screen.getByRole("button", { name: /remove-p2/i }));
    // only p1 remains (qty 1, amount 800)
    expect(screen.getByTestId("totalQty")).toHaveTextContent("1");
    expect(screen.getByTestId("totalAmount")).toHaveTextContent("800");
  });

  it("CLEAR empties the cart", async () => {
    const user = userEvent.setup();
    renderWithProvider();

    await user.click(screen.getByRole("button", { name: /add-p1/i }));
    await user.click(screen.getByRole("button", { name: /clear/i }));

    expect(screen.getByTestId("totalQty")).toHaveTextContent("0");
    expect(screen.getByTestId("totalAmount")).toHaveTextContent("0");
  });

  it("persists to localStorage on state changes", async () => {
    const user = userEvent.setup();
    const setItemSpy = jest.spyOn(Storage.prototype, "setItem");
    renderWithProvider();

    await user.click(screen.getByRole("button", { name: /add-p1/i }));
    expect(setItemSpy).toHaveBeenCalledWith(
      "cart-v1",
      expect.stringContaining('"items":')
    );
  });

  it("normalizes payload image fields into imageUrl", () => {
    // Unit-ish check via reducer by dispatching ADD_QTY with only legacy 'image'
    localStorage.setItem("cart-v1", JSON.stringify({ items: [] }));
    function Probe() {
      const { addQty, items } = useCart();
      React.useEffect(() => {
        addQty(
          {
            id: "x",
            title: "X",
            price: 10,
            image: { url: "legacy-url" },
          } as unknown as Omit<CartItem, "qty">,
          1
        );
      }, [addQty]);
      return <div data-testid="imgUrl">{items[0]?.imageUrl ?? ""}</div>;
    }
    render(
      <CartProvider>
        <Probe />
      </CartProvider>
    );
    expect(screen.getByTestId("imgUrl")).toHaveTextContent("legacy-url");
  });
});
