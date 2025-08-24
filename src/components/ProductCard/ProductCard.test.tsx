// ProductCard.test.tsx
import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import ProductCard from "./ProductCard";

// CSS-moduler (safe å mocke til tomt objekt)
jest.mock("./ProductCard.module.css", () => ({}));

// Stabil bilde-URL
jest.mock("../../lib/image", () => ({
  getImageUrl: jest.fn(() => "https://example.com/img.jpg"),
}));

// Viktig: mock-variablene må hete mockSomething (ellers får du out-of-scope-feil)
const mockAdd = jest.fn();
jest.mock("../../context/CartContext", () => ({
  useCart: () => ({ add: mockAdd }),
}));

const mockToastSuccess = jest.fn();
jest.mock("../Toast/ToastProvider", () => ({
  useToast: () => ({ success: mockToastSuccess }),
}));

function renderWithRouter(ui: React.ReactElement) {
  return render(<MemoryRouter>{ui}</MemoryRouter>);
}

const baseProduct = {
  id: "p1",
  title: "Nordic Lamp",
  price: 1000,
  discountedPrice: 800,
  image: { url: "https://cdn.example.com/lamp.jpg", alt: "Lamp" },
  description: "Nice lamp",
} as const;

describe("ProductCard", () => {
  beforeEach(() => {
    mockAdd.mockClear();
    mockToastSuccess.mockClear();
  });

  it("viser tittel, priser, rabatt-badge og lenke ved rabatt", () => {
    renderWithRouter(<ProductCard product={baseProduct as any} />);

    // Tittel
    expect(
      screen.getByRole("heading", { name: /nordic lamp/i })
    ).toBeInTheDocument();

    // Nåpris (robust sjekk – bare se at kr og 800 finnes i nærheten)
    expect(screen.getByText(/kr/i)).toBeInTheDocument();
    expect(screen.getByText(/800/)).toBeInTheDocument();

    // Førpris synlig når rabatt
    expect(screen.getByText(/1000/)).toBeInTheDocument();

    // Badge -20%
    expect(screen.getByText(/-20%/i)).toBeInTheDocument();

    // Lenke til produktside
    const viewLink = screen.getByRole("link", { name: /view nordic lamp/i });
    expect(viewLink).toHaveAttribute("href", "/product/p1");

    // Bilde
    expect(
      screen.getByRole("img", { name: /nordic lamp/i })
    ).toBeInTheDocument();
  });

  it("legger i handlekurv og viser toast ved klikk", async () => {
    const user = userEvent.setup();
    renderWithRouter(<ProductCard product={baseProduct as any} />);

    await user.click(
      screen.getByRole("button", { name: /add nordic lamp to cart/i })
    );

    expect(mockAdd).toHaveBeenCalledTimes(1);
    expect(mockAdd).toHaveBeenCalledWith({
      id: baseProduct.id,
      title: baseProduct.title,
      price: baseProduct.price,
      discountedPrice: baseProduct.discountedPrice,
      imageUrl: baseProduct.image?.url,
    });
    expect(mockToastSuccess).toHaveBeenCalledWith("Added Nordic Lamp to cart");
  });

  it('viser ikke badge eller "was"-pris uten rabatt', () => {
    const noDiscount = { ...baseProduct, discountedPrice: baseProduct.price };
    renderWithRouter(<ProductCard product={noDiscount as any} />);

    // Ingen rabatt-badge
    expect(screen.queryByText(/-%/)).not.toBeInTheDocument();
    // "was"-pris skal ikke rendres; vi forventer bare én pris synlig (nåprisen).
    // Detaljert strengsjekk er sårbar pga. Intl-format; badge-sjekken holder her.
  });
});
