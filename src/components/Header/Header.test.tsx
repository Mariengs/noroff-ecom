import React from "react";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Header from "./Header";

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

// Mock CSS
jest.mock("./Header.module.css", () => ({
  header: "header",
  nav: "nav",
  brand: "brand",
  logo: "logo",
  links: "links",
  link: "link",
  active: "active",
}));

// Mock child components
jest.mock("../CartIcon/CartIcon", () => () => <div>CartIcon</div>);
jest.mock("../ThemeToggle/ThemeToggle", () => () => (
  <button type="button" aria-label="Theme toggle">
    ThemeToggle
  </button>
));

// Mock SVG import
jest.mock("../../assets/logo.svg", () => "logo.svg");

function renderHeaderAt(pathname: string = "/") {
  return render(
    <MemoryRouter initialEntries={[pathname]}>
      <Header />
    </MemoryRouter>
  );
}

describe("Header", () => {
  it("renders navigation landmark with brand and logo", () => {
    renderHeaderAt("/");

    // Nav landmark
    const nav = screen.getByRole("navigation", { name: /main/i });
    expect(nav).toBeInTheDocument();

    // Brand link (logo + text) points to "/"
    const brand = screen.getByRole("link", { name: /lumishop/i });
    expect(brand).toHaveAttribute("href", "/");

    // Logo image exists
    expect(
      screen.getByRole("img", { name: /lumishop logo/i })
    ).toBeInTheDocument();
  });

  it("has Home and Contact links with correct href and aria-labels", () => {
    renderHeaderAt("/");

    const home = screen.getByRole("link", { name: /home/i });
    const contact = screen.getByRole("link", { name: /contact/i });

    expect(home).toHaveAttribute("href", "/");
    expect(contact).toHaveAttribute("href", "/contact");
  });

  it("sets 'active' class on Home when we are at /", () => {
    renderHeaderAt("/");

    const home = screen.getByRole("link", { name: /home/i });
    const contact = screen.getByRole("link", { name: /contact/i });

    expect(home.className).toMatch(/\bactive\b/);
    expect(contact.className).not.toMatch(/\bactive\b/);
  });

  it("sets 'active' class on Contact when we are at /contact", () => {
    renderHeaderAt("/contact");

    const home = screen.getByRole("link", { name: /home/i });
    const contact = screen.getByRole("link", { name: /contact/i });

    expect(contact.className).toMatch(/\bactive\b/);
    expect(home.className).not.toMatch(/\bactive\b/);
  });

  it("renders ThemeToggle and CartIcon", () => {
    renderHeaderAt("/");

    expect(
      screen.getByRole("button", { name: /theme toggle/i })
    ).toBeInTheDocument();
    expect(screen.getByText("CartIcon")).toBeInTheDocument();
  });
});
