import { render, screen } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import userEvent from "@testing-library/user-event";
import ProductPage from "./ProductPage";

// CSS module mock
jest.mock(
  "./ProductPage.module.css",
  () =>
    new Proxy(
      {},
      {
        get: (_t, p: string) => p,
      }
    )
);

// Mocks
const mockGetProduct = jest.fn();
jest.mock("../../lib/api", () => ({
  getProduct: (...args: any[]) => mockGetProduct(...args),
}));

const mockAdd = jest.fn();
jest.mock("../../context/CartContext", () => ({
  useCart: () => ({ add: mockAdd }),
}));

const mockToastSuccess = jest.fn();
jest.mock("../../components/Toast/ToastProvider", () => ({
  useToast: () => ({ success: mockToastSuccess }),
}));

const mockNavigate = jest.fn();
jest.mock("react-router-dom", () => {
  const actual = jest.requireActual("react-router-dom");
  return { ...actual, useNavigate: () => mockNavigate };
});

// Silence React Router future-flag warnings
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

// Helpers
function renderAt(path = "/product/p1") {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/product/:id" element={<ProductPage />} />
      </Routes>
    </MemoryRouter>
  );
}

const product = {
  id: "p1",
  title: "Nordic Lamp",
  description: "A cozy lamp",
  price: 1000,
  discountedPrice: 800,
  rating: 4.5,
  image: { url: "https://img/lamp.jpg", alt: "Lamp image" },
  tags: ["New", "Scandi"],
  reviews: [
    { id: "r1", username: "Alice", rating: 5, description: "Great!" },
    { id: "r2", username: "Bob", rating: 4, description: "Nice lamp" },
  ],
} as const;

describe("ProductPage", () => {
  beforeEach(() => {
    mockGetProduct.mockReset();
    mockAdd.mockReset();
    mockToastSuccess.mockReset();
    mockNavigate.mockReset();
  });

  it("shows loading, then renders product details", async () => {
    mockGetProduct.mockResolvedValueOnce(product);

    renderAt("/product/p1");

    expect(await screen.findByText(/loading.*…/i)).toBeInTheDocument();

    expect(
      await screen.findByRole("heading", { name: /nordic lamp/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("img", { name: /lamp image|nordic lamp/i })
    ).toBeInTheDocument();
    expect(screen.getByText(/on sale/i)).toBeInTheDocument();
    expect(screen.getByText(/-20%/i)).toBeInTheDocument();

    const nowEl = screen.getByText((content, element) => {
      return element?.tagName === "STRONG" && /kr/i.test(content);
    });
    expect(nowEl).toBeInTheDocument();
    expect(screen.getByText(/rating:/i)).toHaveTextContent(/4\.5\/5/i);
    expect(
      screen.getByRole("heading", { name: /reviews/i })
    ).toBeInTheDocument();
    expect(screen.getByText(/alice/i)).toBeInTheDocument();
    expect(screen.getByText(/bob/i)).toBeInTheDocument();
    expect(screen.getByText(/great!/i)).toBeInTheDocument();
    expect(screen.getByText(/nice lamp/i)).toBeInTheDocument();
    expect(screen.getByText(/new/i)).toBeInTheDocument();
    expect(screen.getByText(/scandi/i)).toBeInTheDocument();
  });

  it("handles API error and shows an alert", async () => {
    // The component uses the fallback message
    mockGetProduct.mockRejectedValueOnce({ status: 500 });

    renderAt("/product/p1");

    expect(await screen.findByText(/loading.*…/i)).toBeInTheDocument();
    expect(await screen.findByRole("alert")).toHaveTextContent(
      /could not load product/i
    );
  });

  it("adds to cart and shows toast with action that navigates", async () => {
    const user = userEvent.setup();
    mockGetProduct.mockResolvedValueOnce(product);

    renderAt("/product/p1");

    await screen.findByRole("heading", { name: /nordic lamp/i });
    await user.click(screen.getByRole("button", { name: /add to cart/i }));

    expect(mockAdd).toHaveBeenCalledTimes(1);
    expect(mockAdd).toHaveBeenCalledWith({
      id: "p1",
      title: "Nordic Lamp",
      price: 1000,
      discountedPrice: 800,
      imageUrl: "https://img/lamp.jpg",
    });

    expect(mockToastSuccess).toHaveBeenCalledTimes(1);
    const [message, opts] = mockToastSuccess.mock.calls[0];
    expect(message).toMatch(/added to your cart/i);
    expect(opts).toMatchObject({
      duration: 2500,
      action: { label: "Go to cart" },
    });

    opts.action.onClick?.();
    expect(mockNavigate).toHaveBeenCalledWith("/checkout");
  });
});
