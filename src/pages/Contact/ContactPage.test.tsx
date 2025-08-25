import { render, screen, act, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ContactPage from "./ContactPage";
import { ToastProvider } from "../../components/Toast/ToastProvider";

jest.mock(
  "./ContactPage.module.css",
  () => new Proxy({}, { get: (_t, p) => String(p) })
);

beforeEach(() => {
  window.scrollTo = jest.fn();
  jest.clearAllMocks();
});

function renderPage() {
  return render(
    <ToastProvider>
      <ContactPage />
    </ToastProvider>
  );
}

describe("ContactPage", () => {
  it("keeps Submit disabled until all fields are valid, and shows/clears field errors while typing", async () => {
    const user = userEvent.setup();
    renderPage();

    const submit = screen.getByRole("button", { name: /submit/i });
    expect(submit).toHaveAttribute("aria-disabled", "true");

    const fullName = screen.getByLabelText(/full name/i);
    await user.type(fullName, "Al");
    expect(
      await screen.findByText(/full name must be at least 3 characters/i)
    ).toBeInTheDocument();
    await user.type(fullName, "i");
    expect(
      screen.queryByText(/full name must be at least 3 characters/i)
    ).not.toBeInTheDocument();

    const subject = screen.getByLabelText(/subject/i);
    await user.type(subject, "Hi");
    expect(
      await screen.findByText(/subject must be at least 3 characters/i)
    ).toBeInTheDocument();
    await user.clear(subject);
    await user.type(subject, "Hello");

    const email = screen.getByLabelText(/email/i);
    await user.type(email, "not-an-email");
    expect(
      await screen.findByText(/please enter a valid email address/i)
    ).toBeInTheDocument();
    await user.clear(email);
    await user.type(email, "alice@example.com");
    expect(
      screen.queryByText(/please enter a valid email address/i)
    ).not.toBeInTheDocument();

    const message = screen.getByLabelText(/message/i);
    await user.type(message, "short");
    expect(
      await screen.findByText(/message must be at least 10 characters/i)
    ).toBeInTheDocument();
    await user.clear(message);
    await user.type(message, "This is a valid message.");

    expect(submit).toHaveAttribute("aria-disabled", "false");
  });

  it("submits a valid form → shows success view, toast, scrollTo, focuses on topAnchor, and auto-dismisses toast", async () => {
    jest.useFakeTimers();
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    const logSpy = jest.spyOn(console, "log").mockImplementation(() => {});

    try {
      renderPage();

      await user.type(screen.getByLabelText(/full name/i), "Alice Wonderland");
      await user.type(screen.getByLabelText(/subject/i), "Hello there");
      await user.type(screen.getByLabelText(/email/i), "alice@example.com");
      await user.type(
        screen.getByLabelText(/message/i),
        "This is a valid message body."
      );

      const submit = screen.getByRole("button", { name: /submit/i });
      expect(submit).toHaveAttribute("aria-disabled", "false");

      await user.click(submit);

      expect(
        await screen.findByText(/thanks! we received your message/i)
      ).toBeInTheDocument();
      expect(screen.getByText(/we’ll get back to you at/i)).toHaveTextContent(
        "alice@example.com"
      );

      // Toast should appear (rendered via ToastProvider)
      expect(
        screen.getByText(/message sent successfully/i)
      ).toBeInTheDocument();

      expect(window.scrollTo).toHaveBeenCalled();

      await act(async () => {
        jest.advanceTimersByTime(60);
      });
      const topAnchor = screen.getByTestId("topAnchor");
      expect(topAnchor).toHaveFocus();

      await act(async () => {
        jest.advanceTimersByTime(5000);
      });
      await waitFor(() =>
        expect(
          screen.queryByText(/message sent successfully/i)
        ).not.toBeInTheDocument()
      );
    } finally {
      logSpy.mockRestore();
      jest.useRealTimers();
    }
  });

  it("keeps Submit disabled when any field is invalid; enables it when all fields are valid", async () => {
    const user = userEvent.setup();
    renderPage();

    const submit = screen.getByRole("button", { name: /submit/i });
    expect(submit).toHaveAttribute("aria-disabled", "true");

    await user.type(screen.getByLabelText(/full name/i), "Bob");
    await user.type(screen.getByLabelText(/subject/i), "Ok");
    await user.type(screen.getByLabelText(/email/i), "bob@example.com");
    await user.type(screen.getByLabelText(/message/i), "Long enough message");
    expect(submit).toHaveAttribute("aria-disabled", "true");

    await user.clear(screen.getByLabelText(/subject/i));
    await user.type(screen.getByLabelText(/subject/i), "Okay");
    expect(submit).toHaveAttribute("aria-disabled", "false");
  });
});
