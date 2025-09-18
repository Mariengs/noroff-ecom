import React, { useState } from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import SortButton, { SortOption, SortValue } from "./SortButton";

// Mock CSS module for stable class names
jest.mock("./SortButton.module.css", () => ({
  wrap: "wrap",
  button: "button",
  chevron: "chevron",
  dropdown: "dropdown",
  option: "option",
  active: "active",
}));

function Harness({
  initial = "default" as SortValue,
  options,
}: {
  initial?: SortValue;
  options?: SortOption[];
}) {
  const [val, setVal] = useState<SortValue>(initial);
  return (
    <>
      <SortButton value={val} onChange={setVal} options={options} />
      {/* Clickable area outside the component for "click outside" test */}
      <div data-testid="outside">outside</div>
    </>
  );
}

describe("SortButton", () => {
  it("shows the current label and toggles dropdown on click", async () => {
    const user = userEvent.setup();
    render(<Harness initial="price-asc" />);

    // Button shows the selected label
    const btn = screen.getByRole("button", { name: /price: low/i });
    expect(btn).toBeInTheDocument();
    expect(btn).toHaveAttribute("aria-haspopup", "listbox");
    expect(btn).toHaveAttribute("aria-expanded", "false");

    // Open
    await user.click(btn);
    expect(btn).toHaveAttribute("aria-expanded", "true");

    // Listbox and options appear
    const listbox = screen.getByRole("listbox", { name: /sort products/i });
    const opt1 = screen.getByRole("option", { name: /recommended/i });
    const opt2 = screen.getByRole("option", { name: /price: low → high/i });
    expect(listbox).toBeInTheDocument();
    expect(opt1).toBeInTheDocument();
    expect(opt2).toBeInTheDocument();

    // Current value has aria-selected=true
    expect(opt2).toHaveAttribute("aria-selected", "true");
  });

  it("selects a new option, calls onChange, and closes the dropdown", async () => {
    const user = userEvent.setup();
    render(<Harness initial="default" />);

    const btn = screen.getByRole("button", { name: /recommended/i });
    await user.click(btn);

    // Select "Title A → Z"
    const titleOpt = screen.getByRole("option", { name: /title a → z/i });
    await user.click(titleOpt);

    // Dropdown closed, button text updated
    expect(btn).toHaveAttribute("aria-expanded", "false");
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();

    // Button should show the new label
    expect(
      screen.getByRole("button", { name: /title a → z/i })
    ).toBeInTheDocument();
  });

  it("closes when clicking outside", async () => {
    const user = userEvent.setup();
    render(<Harness />);

    const btn = screen.getByRole("button", { name: /recommended/i });
    await user.click(btn);
    expect(screen.getByRole("listbox")).toBeInTheDocument();

    await user.click(screen.getByTestId("outside"));
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
    expect(btn).toHaveAttribute("aria-expanded", "false");
  });

  it("uses custom options when provided", async () => {
    const user = userEvent.setup();
    const custom: SortOption[] = [
      { value: "default", label: "Best" },
      { value: "title", label: "Alphabetical" },
    ];
    render(<Harness initial="default" options={custom} />);

    // Button shows custom label
    const btn = screen.getByRole("button", { name: /best/i });
    expect(btn).toBeInTheDocument();

    await user.click(btn);
    expect(screen.getByRole("option", { name: /best/i })).toBeInTheDocument();
    expect(
      screen.getByRole("option", { name: /alphabetical/i })
    ).toBeInTheDocument();

    // Select "Alphabetical"
    await user.click(screen.getByRole("option", { name: /alphabetical/i }));
    expect(
      screen.getByRole("button", { name: /alphabetical/i })
    ).toBeInTheDocument();
  });

  it("aria-selected reflects the chosen value", async () => {
    const user = userEvent.setup();
    render(<Harness initial="price-desc" />);

    const btn = screen.getByRole("button", { name: /price: high → low/i });
    await user.click(btn);

    const highLow = screen.getByRole("option", { name: /price: high → low/i });
    const lowHigh = screen.getByRole("option", { name: /price: low → high/i });

    expect(highLow).toHaveAttribute("aria-selected", "true");
    expect(lowHigh).toHaveAttribute("aria-selected", "false");
  });
});
