import { render, screen, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ThemeToggle from "./ThemeToggle";

// Mock CSS module
jest.mock("./ThemeToggle.module.css", () => ({
  toggle: "toggle",
  icon: "icon",
}));

type MQListener = (ev?: MediaQueryListEvent) => void;

let currentMQ: any = null;
const listeners: MQListener[] = [];

function setMatchMedia(matches: boolean) {
  currentMQ = {
    matches,
    media: "(prefers-color-scheme: dark)",
    onchange: null,
    addEventListener: (_type: "change", cb: MQListener) => listeners.push(cb),
    removeEventListener: (_type: "change", cb: MQListener) => {
      const i = listeners.indexOf(cb);
      if (i >= 0) listeners.splice(i, 1);
    },

    addListener: () => {},
    removeListener: () => {},
    dispatchEvent: () => true,
  };

  window.matchMedia = jest.fn().mockImplementation(() => currentMQ);
}

function fireSystemChange(toMatches: boolean) {
  if (currentMQ) currentMQ.matches = toMatches;

  listeners.forEach((cb) =>
    cb?.({ matches: toMatches } as unknown as MediaQueryListEvent)
  );
}

describe("ThemeToggle", () => {
  beforeEach(() => {
    localStorage.clear();
    listeners.splice(0, listeners.length);
    currentMQ = null;
    jest.restoreAllMocks();
  });

  it("uses saved theme from localStorage on first render", () => {
    localStorage.setItem("theme", "dark");
    setMatchMedia(false);

    render(<ThemeToggle />);

    expect(
      screen.getByRole("button", { name: /dark theme \(click for light\)/i })
    ).toBeInTheDocument();
    expect(document.documentElement).toHaveAttribute("data-theme", "dark");
  });

  it("uses system preference when no saved theme", () => {
    localStorage.removeItem("theme");
    setMatchMedia(true);

    render(<ThemeToggle />);

    expect(
      screen.getByRole("button", { name: /dark theme \(click for light\)/i })
    ).toBeInTheDocument();
    expect(document.documentElement).toHaveAttribute("data-theme", "dark");
  });

  it("toggles theme on click and persists to localStorage", async () => {
    const user = userEvent.setup();

    localStorage.removeItem("theme");
    setMatchMedia(false);

    const setItemSpy = jest.spyOn(Storage.prototype, "setItem");

    render(<ThemeToggle />);

    const btn = screen.getByRole("button", {
      name: /light theme \(click for dark\)/i,
    });
    expect(document.documentElement).toHaveAttribute("data-theme", "light");

    await user.click(btn);
    expect(
      await screen.findByRole("button", {
        name: /dark theme \(click for light\)/i,
      })
    ).toBeInTheDocument();
    expect(document.documentElement).toHaveAttribute("data-theme", "dark");
    expect(setItemSpy).toHaveBeenCalledWith("theme", "dark");
  });

  it("reacts to system color-scheme changes when no saved theme", async () => {
    localStorage.removeItem("theme");
    setMatchMedia(false);

    render(<ThemeToggle />);

    // After mount, "light" is saved in localStorage
    expect(
      screen.getByRole("button", { name: /light theme \(click for dark\)/i })
    ).toBeInTheDocument();

    // Simulate that NO theme is saved at the time of change:
    localStorage.removeItem("theme");

    // System switches to dark -> wrap in act to flush setState
    await act(async () => {
      fireSystemChange(true);
    });

    // Wait until DOM reflects new state
    expect(
      await screen.findByRole("button", {
        name: /dark theme \(click for light\)/i,
      })
    ).toBeInTheDocument();
    expect(document.documentElement).toHaveAttribute("data-theme", "dark");
  });

  it("ignores system changes when a theme is saved", () => {
    localStorage.setItem("theme", "light");
    setMatchMedia(false);

    render(<ThemeToggle />);

    expect(
      screen.getByRole("button", { name: /light theme \(click for dark\)/i })
    ).toBeInTheDocument();

    fireSystemChange(true);

    expect(
      screen.getByRole("button", { name: /light theme \(click for dark\)/i })
    ).toBeInTheDocument();
    expect(document.documentElement).toHaveAttribute("data-theme", "light");
  });
});
