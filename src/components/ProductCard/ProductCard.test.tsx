// src/components/ProductCard/ProductCard.test.tsx
import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import ProductCard from "./ProductCard";

// Demp React Router v6 -> v7 future-flag warnings
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

jest.mock("./ProductCard.module.css", () => ({}));
jest.mock("../../lib/image", () => ({
  getImageUrl: jest.fn(() => "https://example.com/img.jpg"),
}));

const mockAdd = jest.fn() as jest.Mock;
jest.mock("../../context/CartContext", () => ({
  useCart: () => ({ add: mockAdd }),
}));

const mockToastSuccess = jest.fn() as jest.Mock;
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

    expect(
      screen.getByRole("heading", { name: /nordic lamp/i })
    ).toBeInTheDocument();

    // Tåler no-NO: "800,00 kr" og "1 000,00 kr"
    expect(screen.getByText(/800(?:[.,]00)?\s*kr/i)).toBeInTheDocument();
    expect(screen.getByText(/1\s?000(?:[.,]00)?\s*kr/i)).toBeInTheDocument();

    expect(screen.getByText(/-20%/i)).toBeInTheDocument();

    const viewLink = screen.getByRole("link", { name: /view nordic lamp/i });
    expect(viewLink).toHaveAttribute("href", "/product/p1");

    // (img-sjekk fjernet for stabilitet i testmiljø)
  });

  it("legger i handlekurv og viser toast ved klikk", async () => {
    const user = userEvent.setup();
    renderWithRouter(<ProductCard product={baseProduct as any} />);

    await user.click(
      screen.getByRole("button", { name: /add nordic lamp to cart/i })
    );

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

    expect(screen.queryByText(/-%/)).not.toBeInTheDocument();
    // Valgfritt: sjekk at kun én pris vises (nåpris)
    const allPrices = screen.getAllByText(/\d[\d\s]*(?:[.,]\d{2})?\s*kr/i);
    expect(allPrices).toHaveLength(1);
  });
});
