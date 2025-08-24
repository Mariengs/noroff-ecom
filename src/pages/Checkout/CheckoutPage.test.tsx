import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import CheckoutPage from "./CheckoutPage";
import { MemoryRouter } from "react-router-dom";
import { ToastProvider } from "../../components/Toast/ToastProvider";

// CSS module mock
jest.mock(
  "./CheckoutPage.module.css",
  () => new Proxy({}, { get: (_t, p) => String(p) })
);

// Mock useNavigate
const mockNavigate = jest.fn();
jest.mock("react-router-dom", () => {
  const actual = jest.requireActual("react-router-dom");
  return { ...actual, useNavigate: () => mockNavigate };
});

// Mock useCart
const mockUseCart = jest.fn();
jest.mock("../../context/CartContext", () => ({
  useCart: () => mockUseCart(),
}));

function renderCheckout() {
  return render(
    <MemoryRouter>
      <ToastProvider>
        <CheckoutPage />
      </ToastProvider>
    </MemoryRouter>
  );
}

describe("CheckoutPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("viser tom-tilstand når handlekurven er tom", () => {
    mockUseCart.mockReturnValue({
      items: [],
      totalAmount: 0,
      inc: jest.fn(),
      dec: jest.fn(),
      remove: jest.fn(),
      addQty: jest.fn(),
    });

    renderCheckout();

    expect(
      screen.getByRole("heading", { name: /your cart/i })
    ).toBeInTheDocument();
    expect(screen.getByText(/your cart is empty/i)).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /go back to products/i })
    ).toHaveAttribute("href", "/");
  });

  it("pluss-knapp viser success-toast og Undo kaller dec(id)", async () => {
    const user = userEvent.setup();
    const inc = jest.fn();
    const dec = jest.fn();

    mockUseCart.mockReturnValue({
      items: [
        {
          id: "p1",
          title: "Lamp",
          price: 1000,
          discountedPrice: 800,
          imageUrl: "x",
          qty: 1,
        },
      ],
      totalAmount: 800,
      inc,
      dec,
      remove: jest.fn(),
      addQty: jest.fn(),
    });

    renderCheckout();

    await user.click(
      screen.getByRole("button", { name: /increase quantity of lamp/i })
    );

    expect(await screen.findByText(/added 1 × lamp/i)).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: /undo/i }));
    expect(dec).toHaveBeenCalledWith("p1");
  });

  it("minus fra qty=2 viser info-toast og Undo kaller inc(id)", async () => {
    const user = userEvent.setup();
    const inc = jest.fn();
    const dec = jest.fn();

    mockUseCart.mockReturnValue({
      items: [
        {
          id: "p2",
          title: "Chair",
          price: 500,
          discountedPrice: undefined,
          imageUrl: "y",
          qty: 2,
        },
      ],
      totalAmount: 1000,
      inc,
      dec,
      remove: jest.fn(),
      addQty: jest.fn(),
    });

    renderCheckout();

    await user.click(
      screen.getByRole("button", { name: /decrease quantity of chair/i })
    );

    expect(await screen.findByText(/removed 1 × chair/i)).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: /undo/i }));
    expect(inc).toHaveBeenCalledWith("p2");
  });

  it("minus fra qty=1 viser error-toast og Undo kaller addQty(snapshot, 1)", async () => {
    const user = userEvent.setup();
    const addQty = jest.fn();
    const dec = jest.fn();

    const snapshot = {
      id: "p3",
      title: "Table",
      price: 700,
      discountedPrice: 650,
      imageUrl: "z",
      qty: 1,
    };

    mockUseCart.mockReturnValue({
      items: [snapshot],
      totalAmount: 650,
      inc: jest.fn(),
      dec,
      remove: jest.fn(),
      addQty,
    });

    renderCheckout();

    await user.click(
      screen.getByRole("button", { name: /decrease quantity of table/i })
    );

    expect(
      await screen.findByText(/table removed from cart/i)
    ).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /undo/i }));
    expect(addQty).toHaveBeenCalledTimes(1);
    expect(addQty.mock.calls[0][0]).toEqual(
      expect.objectContaining({ id: "p3", title: "Table" })
    );
    expect(addQty.mock.calls[0][1]).toBe(1);
  });

  it("remove viser error-toast og Undo kaller addQty(snapshot, snapshot.qty)", async () => {
    const user = userEvent.setup();
    const addQty = jest.fn();
    const remove = jest.fn();

    const snapshot = {
      id: "p4",
      title: "Sofa",
      price: 3000,
      discountedPrice: undefined,
      imageUrl: "u",
      qty: 3,
    };

    mockUseCart.mockReturnValue({
      items: [snapshot],
      totalAmount: 9000,
      inc: jest.fn(),
      dec: jest.fn(),
      remove,
      addQty,
    });

    renderCheckout();

    await user.click(
      screen.getByRole("button", { name: /remove sofa from cart/i })
    );

    expect(
      await screen.findByText(/sofa removed from cart/i)
    ).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /undo/i }));
    expect(addQty).toHaveBeenCalledWith(
      expect.objectContaining({ id: "p4", title: "Sofa" }),
      3
    );
  });

  it("checkout viser success-toast og navigerer til /success", async () => {
    const user = userEvent.setup();

    mockUseCart.mockReturnValue({
      items: [
        {
          id: "p1",
          title: "Lamp",
          price: 1000,
          discountedPrice: 800,
          imageUrl: "x",
          qty: 1,
        },
      ],
      totalAmount: 800,
      inc: jest.fn(),
      dec: jest.fn(),
      remove: jest.fn(),
      addQty: jest.fn(),
    });

    renderCheckout();

    await user.click(
      screen.getByRole("button", { name: /proceed to checkout/i })
    );

    expect(await screen.findByText(/checkout complete/i)).toBeInTheDocument();
    expect(mockNavigate).toHaveBeenCalledWith("/success");
  });
});
