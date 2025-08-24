import React from "react";
import { render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Footer from "./Footer";

function renderFooter() {
  return render(
    <MemoryRouter>
      <Footer />
    </MemoryRouter>
  );
}

describe("Footer", () => {
  it("renders brand link to homepage", () => {
    renderFooter();
    const brandLink = screen.getByRole("link", { name: /go to homepage/i });
    expect(brandLink).toHaveAttribute("href", "/");
  });

  it("renders navigation links with correct href and labels", () => {
    renderFooter();

    // Scope queries to the footer navigation
    const nav = screen.getByRole("navigation", { name: /footer navigation/i });
    const homeLink = within(nav).getByRole("link", { name: /home/i });
    const contactLink = within(nav).getByRole("link", { name: /contact/i });

    expect(homeLink).toHaveAttribute("href", "/");
    expect(contactLink).toHaveAttribute("href", "/contact");
  });

  it("renders the current year in the copyright", () => {
    renderFooter();
    const year = new Date().getFullYear();
    expect(
      screen.getByText(new RegExp(`© ${year} LumiShop`, "i"))
    ).toBeInTheDocument();
  });
});
