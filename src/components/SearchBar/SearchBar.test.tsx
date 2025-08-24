import React, { useState } from "react";
import { render, screen, fireEvent, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import SearchBar, { SearchResult } from "./SearchBar";

// Suppress React Router warnings in the log
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

// Mock CSS module for stable classNames
jest.mock("./SearchBar.module.css", () => ({
  wrap: "wrap",
  inputWrap: "inputWrap",
  input: "input",
  icon: "icon",
  clear: "clear",
  dropdown: "dropdown",
  option: "option",
  active: "active",
  thumb: "thumb",
  thumbFallback: "thumbFallback",
  meta: "meta",
  title: "title",
  sub: "sub",
}));

// Mock useNavigate
const mockNavigate = jest.fn();
jest.mock("react-router-dom", () => {
  const actual = jest.requireActual("react-router-dom");
  return { ...actual, useNavigate: () => mockNavigate };
});

// Helper component for controlled value
function Harness({
  initial = "",
  results,
}: {
  initial?: string;
  results: SearchResult[];
}) {
  const [val, setVal] = useState(initial);
  return (
    <MemoryRouter>
      <SearchBar value={val} onChange={setVal} results={results} />
      {/* Click area outside to test "click outside" */}
      <div data-testid="outside">outside</div>
    </MemoryRouter>
  );
}

const results: SearchResult[] = [
  { id: "a1", title: "Lamp Shade", category: "Home", image: { url: "x" } },
  { id: "b2", title: "Table Lamp", category: "Lighting" },
];

describe("SearchBar", () => {
  beforeEach(() => {
    mockNavigate.mockClear();
  });

  it("types into the field, shows dropdown and Clear button", async () => {
    const user = userEvent.setup();
    render(<Harness results={results} />);

    const input = screen.getByRole("combobox", { name: /search products/i });

    // Starts empty
    expect(input).toHaveValue("");

    // Type – onChange should update value
    await user.type(input, "lam");
    expect(input).toHaveValue("lam");

    // Opens dropdown when value && results.length
    expect(input).toHaveAttribute("aria-expanded", "true");

    // Listbox and two options
    const listbox = screen.getByRole("listbox");
    const options = within(listbox).getAllByRole("option");
    expect(options).toHaveLength(2);
    expect(within(listbox).getByText(/lamp shade/i)).toBeInTheDocument();
    expect(within(listbox).getByText(/table lamp/i)).toBeInTheDocument();

    // Clear button visible
    expect(
      screen.getByRole("button", { name: /clear search/i })
    ).toBeInTheDocument();
  });

  it("arrow keys navigate suggestions and Enter navigates to selected product", async () => {
    const user = userEvent.setup();
    render(<Harness results={results} />);
    const input = screen.getByRole("combobox", { name: /search products/i });

    // Open via typing
    await user.type(input, "l");
    expect(input).toHaveAttribute("aria-expanded", "true");

    // ArrowDown -> select first
    await user.keyboard("{ArrowDown}");
    // aria-activedescendant is set; check that one option has aria-selected=true
    let listbox = screen.getByRole("listbox");
    let opts = within(listbox).getAllByRole("option");
    expect(opts[0]).toHaveAttribute("aria-selected", "true");

    // ArrowDown again -> second
    await user.keyboard("{ArrowDown}");
    listbox = screen.getByRole("listbox");
    opts = within(listbox).getAllByRole("option");
    expect(opts[1]).toHaveAttribute("aria-selected", "true");

    // Enter -> navigate to /product/b2
    await user.keyboard("{Enter}");
    expect(mockNavigate).toHaveBeenCalledWith("/product/b2");
  });

  it("Escape closes dropdown", async () => {
    const user = userEvent.setup();
    render(<Harness results={results} />);
    const input = screen.getByRole("combobox", { name: /search products/i });

    await user.type(input, "ta");
    expect(screen.getByRole("listbox")).toBeInTheDocument();

    await user.keyboard("{Escape}");
    expect(input).toHaveAttribute("aria-expanded", "false");
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
  });

  it("Clear button empties field and closes dropdown", async () => {
    const user = userEvent.setup();
    render(<Harness results={results} />);
    const input = screen.getByRole("combobox", { name: /search products/i });
    await user.type(input, "lam");
    expect(screen.getByRole("listbox")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /clear search/i }));
    expect(input).toHaveValue("");
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
  });

  it("click outside closes dropdown", async () => {
    const user = userEvent.setup();
    render(<Harness results={results} />);
    const input = screen.getByRole("combobox", { name: /search products/i });
    await user.type(input, "lam");
    expect(screen.getByRole("listbox")).toBeInTheDocument();

    await user.click(screen.getByTestId("outside"));
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
  });

  it("mouse hover + mousedown on a result navigates correctly", async () => {
    const user = userEvent.setup();
    render(<Harness results={results} />);
    const input = screen.getByRole("combobox", { name: /search products/i });
    await user.type(input, "lamp");

    const listbox = screen.getByRole("listbox");
    const opt = within(listbox).getByRole("option", { name: /lamp shade/i });

    // onMouseEnter sets activeIndex
    fireEvent.mouseEnter(opt);
    expect(opt).toHaveAttribute("aria-selected", "true");

    // onMouseDown navigates (with preventDefault)
    fireEvent.mouseDown(opt);
    expect(mockNavigate).toHaveBeenCalledWith("/product/a1");
  });

  it("ArrowDown opens dropdown even without typing when results exist", async () => {
    const user = userEvent.setup();
    render(<Harness initial="" results={results} />);

    const input = screen.getByRole("combobox", { name: /search products/i });

    // Ensure focus first (otherwise keystrokes go to document and won’t hit input’s onKeyDown)
    await user.click(input);

    await user.keyboard("{ArrowDown}");
    expect(input).toHaveAttribute("aria-expanded", "true");

    const listbox = screen.getByRole("listbox");
    const opts = within(listbox).getAllByRole("option");
    expect(opts[0]).toHaveAttribute("aria-selected", "true");
  });
});
