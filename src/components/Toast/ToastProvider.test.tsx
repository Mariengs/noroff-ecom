import React from "react";
import { render, screen, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ToastProvider, useToast } from "./ToastProvider";

jest.mock("./Toast.module.css", () => ({
  container: "container",
  toast: "toast",
  content: "content",
  icon: "icon",
  message: "message",
  action: "action",
  close: "close",
  info: "info",
  success: "success",
  error: "error",
}));

function Harness() {
  const toast = useToast();
  return (
    <div>
      <button onClick={() => toast.notify("hello", { duration: 0 })}>
        notify
      </button>
      <button onClick={() => toast.success("yay", { duration: 0 })}>
        success
      </button>
      <button onClick={() => toast.error("nope", { duration: 0 })}>
        error
      </button>
      <button onClick={() => toast.info("info", { duration: 0 })}>info</button>
      <button
        onClick={() =>
          toast.notify("with action", {
            duration: 0,
            action: { label: "Undo", onClick: jest.fn() },
          })
        }
      >
        with-action
      </button>
      <button onClick={() => toast.notify("auto", { duration: 1000 })}>
        auto
      </button>
    </div>
  );
}

function renderWithProvider(ui: React.ReactElement = <Harness />) {
  return render(<ToastProvider>{ui}</ToastProvider>);
}

describe("ToastProvider", () => {
  it("kaster feil hvis useToast brukes utenfor provider", () => {
    const Bad = () => {
      // eslint-disable-next-line react-hooks/rules-of-hooks
      useToast();
      return null;
    };
    // Demp bare denne error-loggen
    const spy = jest.spyOn(console, "error").mockImplementation(() => {});
    expect(() => render(<Bad />)).toThrow(
      /useToast must be used within ToastProvider/i
    );
    spy.mockRestore();
  });

  it("renderer notify/success/error/info med riktig tekst og ikon", async () => {
    const user = userEvent.setup();
    renderWithProvider();

    // notify -> meldingen rendres i .message
    await user.click(screen.getByRole("button", { name: /notify/i }));
    expect(
      screen.getByText("hello", { selector: ".message" })
    ).toBeInTheDocument();

    // success
    await user.click(screen.getByRole("button", { name: /success/i }));
    expect(
      screen.getByText("yay", { selector: ".message" })
    ).toBeInTheDocument();
    expect(screen.getAllByText("✅").length).toBeGreaterThan(0);

    // error
    await user.click(screen.getByRole("button", { name: /error/i }));
    expect(
      screen.getByText("nope", { selector: ".message" })
    ).toBeInTheDocument();
    expect(screen.getAllByText("⚠️").length).toBeGreaterThan(0);

    // info (unngå kollisjon med "info"-knappen)
    await user.click(screen.getByRole("button", { name: /info/i }));
    expect(
      screen.getByText("info", { selector: ".message" })
    ).toBeInTheDocument();
    expect(screen.getAllByText("ℹ️").length).toBeGreaterThan(0);
  });

  it("lukker via Close-knappen (✕)", async () => {
    const user = userEvent.setup();
    renderWithProvider();

    await user.click(screen.getByRole("button", { name: /notify/i }));
    expect(
      screen.getByText("hello", { selector: ".message" })
    ).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /close/i }));
    expect(
      screen.queryByText("hello", { selector: ".message" })
    ).not.toBeInTheDocument();
  });

  it("action-knapp kaller onClick og lukker toasten", async () => {
    const user = userEvent.setup();
    renderWithProvider();

    await user.click(screen.getByRole("button", { name: /with-action/i }));
    expect(
      screen.getByText("with action", { selector: ".message" })
    ).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /undo/i }));
    expect(
      screen.queryByText("with action", { selector: ".message" })
    ).not.toBeInTheDocument();
  });

  it("auto-dismiss fjerner toasten etter duration", () => {
    jest.useFakeTimers();
    renderWithProvider();

    act(() => {
      screen.getByRole("button", { name: /auto/i }).click();
    });
    expect(
      screen.getByText("auto", { selector: ".message" })
    ).toBeInTheDocument();

    act(() => {
      jest.advanceTimersByTime(1000);
    });
    expect(
      screen.queryByText("auto", { selector: ".message" })
    ).not.toBeInTheDocument();

    jest.useRealTimers();
  });
});
