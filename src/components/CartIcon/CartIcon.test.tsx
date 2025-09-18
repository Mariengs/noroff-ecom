import React from "react";
import { render, screen, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import CartIcon from "./CartIcon";

beforeAll(() => {
  const origWarn = console.warn;
  jest
    .spyOn(console, "warn")
    .mockImplementation((msg?: any, ...rest: any[]) => {
      if (
        typeof msg === "string" &&
        msg.includes("React Router Future Flag Warning")
      )
        return;
      origWarn(msg, ...rest);
    });
});

// Mock CSS-modul
jest.mock("./CartIcon.module.css", () => ({
  button: "button",
  bump: "bump",
  floating: "floating",
  icon: "icon",
  badge: "badge",
}));

// --- Mock useCart (styr totalQty via variabel) ---
let mockQty = 0;
jest.mock("../../context/CartContext", () => ({
  useCart: () => ({ totalQty: mockQty }),
}));

// --- Mock useNavigate checks navigation ---
const mockNavigate = jest.fn();
jest.mock("react-router-dom", () => {
  const actual = jest.requireActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

function renderWithRouter() {
  return render(
    <MemoryRouter>
      <CartIcon />
    </MemoryRouter>
  );
}

describe("CartIcon", () => {
  beforeEach(() => {
    mockNavigate.mockClear();
  });

  afterEach(() => {});

  it("viser tom-tilstand når totalQty = 0 (ingen badge)", () => {
    mockQty = 0;
    renderWithRouter();
    expect(screen.getByText(/cart is empty/i)).toBeInTheDocument();
    expect(screen.queryByText(/^\s*0\s*$/)).not.toBeInTheDocument();
  });

  it("viser badge og riktig live-tekst når totalQty > 0", () => {
    mockQty = 3;
    renderWithRouter();
    expect(screen.getByText("3")).toBeInTheDocument();
    expect(screen.getByText(/3 items in cart/i)).toBeInTheDocument();
  });

  it("får bump-klasse når qty endres, og fjerner den etter 450ms", () => {
    jest.useFakeTimers();

    mockQty = 0;
    const { rerender } = renderWithRouter();

    mockQty = 2;
    rerender(
      <MemoryRouter>
        <CartIcon />
      </MemoryRouter>
    );

    const button = screen.getByRole("button", { name: /open cart/i });
    expect(button.className).toMatch(/\bbump\b/);

    act(() => {
      jest.advanceTimersByTime(500);
    });
    expect(button.className).not.toMatch(/\bbump\b/);

    jest.useRealTimers();
  });

  it('blir "floating" når scrollY > 150 og rendres via portal', () => {
    Object.defineProperty(window, "scrollY", { value: 200, writable: true });
    mockQty = 1;
    renderWithRouter();
    const button = screen.getByRole("button", { name: /open cart/i });
    expect(button.className).toMatch(/\bfloating\b/);
  });

  it("navigerer til /checkout når man klikker", async () => {
    const user = userEvent.setup();
    mockQty = 2;
    renderWithRouter();

    await user.click(screen.getByRole("button", { name: /open cart/i }));
    expect(mockNavigate).toHaveBeenCalledWith("/checkout");
  });
});
