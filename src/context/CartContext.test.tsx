/**
 * @jest-environment jsdom
 */
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { CartProvider, useCart } from "./CartContext";

let setItemMock: jest.SpyInstance;

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
    // Gjør localStorage.setItem billig (men fortsatt spy-bar)
    setItemMock = jest
      .spyOn(Storage.prototype, "setItem")
      .mockImplementation(() => {});
  });

  it("throws if useCart is used outside CartProvider", () => {
    const Bad = () => {
      // eslint-disable-next-line react-hooks/rules-of-hooks
      useCart();
      return null;
    };
    // Demp kun denne error-loggen
    const spy = jest.spyOn(console, "error").mockImplementation(() => {});
    expect(() => render(<Bad />)).toThrow(
      /useCart must be used within CartProvider/i
    );
    spy.mockRestore();
  });

  it("initializes from localStorage and normalizes legacy fields", () => {
    // Seed UDEN setItem (siden setItem er mock'et til no-op)
    (localStorage as any)["cart-v1"] = JSON.stringify({
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
        { id: "zero", title: "Zero", price: 50, qty: 0 }, // filtreres bort
        { title: "No ID", price: 10, qty: 1 }, // ugyldig, filtreres
      ],
    });

    renderWithProvider();

    // Avledede totaler: 2*100 + 1*200 = 400
    expect(screen.getByTestId("totalQty")).toHaveTextContent("3");
    expect(screen.getByTestId("totalAmount")).toHaveTextContent("400");
  });

  it("ADD adds a new item or increments existing; discountedPrice is used for totals", () => {
    renderWithProvider();

    const addP1 = screen.getByRole("button", { name: /add-p1/i });
    fireEvent.click(addP1);
    expect(screen.getByTestId("totalQty")).toHaveTextContent("1");
    // discountedPrice 800 brukes
    expect(screen.getByTestId("totalAmount")).toHaveTextContent("800");

    // Legg til samme igjen -> qty 2, amount 1600
    fireEvent.click(addP1);
    expect(screen.getByTestId("totalQty")).toHaveTextContent("2");
    expect(screen.getByTestId("totalAmount")).toHaveTextContent("1600");
  });

  it("ADD_QTY inserts or increments by arbitrary qty", () => {
    renderWithProvider();

    const addP2x3 = screen.getByRole("button", { name: /addqty-p2x3/i });
    fireEvent.click(addP2x3);
    expect(screen.getByTestId("totalQty")).toHaveTextContent("3");
    expect(screen.getByTestId("totalAmount")).toHaveTextContent("1500"); // 3 * 500

    // Legg p2 igjen med qty 3 -> 6 totalt
    fireEvent.click(addP2x3);
    expect(screen.getByTestId("totalQty")).toHaveTextContent("6");
    expect(screen.getByTestId("totalAmount")).toHaveTextContent("3000");
  });

  it("INC/DEC adjust qty and DEC removes item when qty hits 0", () => {
    renderWithProvider();

    const addP1 = screen.getByRole("button", { name: /add-p1/i });
    const incP1 = screen.getByRole("button", { name: /inc-p1/i });
    const decP1 = screen.getByRole("button", { name: /dec-p1/i });

    // add p1 twice -> qty 2, amount 1600
    fireEvent.click(addP1);
    fireEvent.click(addP1);
    expect(screen.getByTestId("totalQty")).toHaveTextContent("2");
    expect(screen.getByTestId("totalAmount")).toHaveTextContent("1600");

    fireEvent.click(incP1);
    expect(screen.getByTestId("totalQty")).toHaveTextContent("3");

    fireEvent.click(decP1);
    fireEvent.click(decP1);
    // én DEC til fjerner produktet
    fireEvent.click(decP1);
    expect(screen.getByTestId("totalQty")).toHaveTextContent("0");
    expect(screen.getByTestId("totalAmount")).toHaveTextContent("0");
  });

  it("REMOVE deletes a specific item", () => {
    renderWithProvider();

    const addP1 = screen.getByRole("button", { name: /add-p1/i });
    const addP2x3 = screen.getByRole("button", { name: /addqty-p2x3/i });
    const removeP2 = screen.getByRole("button", { name: /remove-p2/i });

    fireEvent.click(addP1);
    fireEvent.click(addP2x3);
    expect(screen.getByTestId("totalQty")).toHaveTextContent("4");

    fireEvent.click(removeP2);
    // kun p1 igjen (qty 1, amount 800)
    expect(screen.getByTestId("totalQty")).toHaveTextContent("1");
    expect(screen.getByTestId("totalAmount")).toHaveTextContent("800");
  });

  it("CLEAR empties the cart", () => {
    renderWithProvider();

    const addP1 = screen.getByRole("button", { name: /add-p1/i });
    const clearBtn = screen.getByRole("button", { name: /clear/i });

    fireEvent.click(addP1);
    fireEvent.click(clearBtn);

    expect(screen.getByTestId("totalQty")).toHaveTextContent("0");
    expect(screen.getByTestId("totalAmount")).toHaveTextContent("0");
  });

  it("persists to localStorage on state changes", () => {
    renderWithProvider();

    const addP1 = screen.getByRole("button", { name: /add-p1/i });
    fireEvent.click(addP1);

    expect(setItemMock).toHaveBeenCalledWith(
      "cart-v1",
      expect.stringContaining('"items":')
    );
  });

  it("normalizes payload image fields into imageUrl", () => {
    // Rask provider-sjekk ved å dispatch'e ADD_QTY med legacy 'image'
    (localStorage as any)["cart-v1"] = JSON.stringify({ items: [] });
    function Probe() {
      const { addQty, items } = useCart();
      React.useEffect(() => {
        addQty(
          {
            id: "x",
            title: "X",
            price: 10,
            image: { url: "legacy-url" },
          } as any, // unngå type-import
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
