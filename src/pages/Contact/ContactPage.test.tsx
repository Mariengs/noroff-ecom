import React from "react";
import { render, screen, act, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ContactPage from "./ContactPage";

jest.mock(
  "./ContactPage.module.css",
  () => new Proxy({}, { get: (_t, p) => String(p) })
);

beforeEach(() => {
  window.scrollTo = jest.fn();
  jest.clearAllMocks();
});

describe("ContactPage", () => {
  it("holder Submit disabled til alle felter er gyldige, og viser/rydder feltfeil mens man skriver", async () => {
    const user = userEvent.setup();
    render(<ContactPage />);

    const submit = screen.getByRole("button", { name: /submit/i });
    expect(submit).toBeDisabled();

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

    expect(submit).not.toBeDisabled();
  });

  it("submits gyldig skjema → success-view, toast, scrollTo, fokus på topAnchor, auto-dismiss", async () => {
    jest.useFakeTimers();
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    const logSpy = jest.spyOn(console, "log").mockImplementation(() => {});

    try {
      render(<ContactPage />);

      await user.type(screen.getByLabelText(/full name/i), "Alice Wonderland");
      await user.type(screen.getByLabelText(/subject/i), "Hello there");
      await user.type(screen.getByLabelText(/email/i), "alice@example.com");
      await user.type(
        screen.getByLabelText(/message/i),
        "This is a valid message body."
      );

      const submit = screen.getByRole("button", { name: /submit/i });
      expect(submit).not.toBeDisabled();

      await user.click(submit);

      expect(
        await screen.findByText(/thanks! we received your message/i)
      ).toBeInTheDocument();
      expect(screen.getByText(/we’ll get back to you at/i)).toHaveTextContent(
        "alice@example.com"
      );

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

  it("Submit forblir disabled når et felt er ugyldig; blir enabled når alt er gyldig", async () => {
    const user = userEvent.setup();
    render(<ContactPage />);

    const submit = screen.getByRole("button", { name: /submit/i });
    expect(submit).toBeDisabled();

    await user.type(screen.getByLabelText(/full name/i), "Bob");
    await user.type(screen.getByLabelText(/subject/i), "Ok");
    await user.type(screen.getByLabelText(/email/i), "bob@example.com");
    await user.type(screen.getByLabelText(/message/i), "Long enough message");
    expect(submit).toBeDisabled();

    await user.clear(screen.getByLabelText(/subject/i));
    await user.type(screen.getByLabelText(/subject/i), "Okay");
    expect(submit).not.toBeDisabled();
  });
});
