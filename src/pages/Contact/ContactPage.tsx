import { useId, useState, useEffect, useMemo, useRef } from "react";
import s from "./ContactPage.module.css";

type FormValues = {
  fullName: string;
  subject: string;
  email: string;
  body: string;
};

type FormErrors = Partial<Record<keyof FormValues, string>>;
type Toast = { type: "success" | "error"; message: string } | null;

function isEmail(v: string): boolean {
  return /.+@.+\..+/.test(v);
}

function validate(v: FormValues): FormErrors {
  const e: FormErrors = {};
  if (!v.fullName || v.fullName.trim().length < 3)
    e.fullName = "Full name must be at least 3 characters.";
  if (!v.subject || v.subject.trim().length < 3)
    e.subject = "Subject must be at least 3 characters.";
  if (!v.email || !isEmail(v.email))
    e.email = "Please enter a valid email address.";
  if (!v.body || v.body.trim().length < 10)
    e.body = "Message must be at least 10 characters.";
  return e;
}

export default function ContactPage() {
  const id = useId();
  const [values, setValues] = useState<FormValues>({
    fullName: "",
    subject: "",
    email: "",
    body: "",
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [sent, setSent] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [toast, setToast] = useState<Toast>(null);

  const topRef = useRef<HTMLDivElement>(null);
  const hasErrors = useMemo(
    () => Object.keys(validate(values)).length > 0,
    [values]
  );

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 5000);
    return () => clearTimeout(t);
  }, [toast]);

  useEffect(() => {
    if (sent) {
      window.scrollTo({ top: 0, behavior: "smooth" });
      setTimeout(() => topRef.current?.focus(), 50);
    }
  }, [sent, toast]);

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) {
    const { name, value } = e.target;
    setValues((prev) => ({ ...prev, [name]: value }));

    setErrors((prev) => {
      const next = { ...prev };
      const fieldErrors = validate({ ...values, [name]: value } as FormValues);
      const key = name as keyof FormValues;
      if (fieldErrors[key]) next[key] = fieldErrors[key];
      else delete next[key];
      return next;
    });
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const eobj = validate(values);
    setErrors(eobj);

    if (Object.keys(eobj).length > 0) {
      setToast({
        type: "error",
        message: "Please fix the highlighted errors.",
      });
      return;
    }

    try {
      setSubmitting(true);
      // Send til API her om ønskelig
      console.log("Contact form data:", values);
      setSent(true);
      setToast({ type: "success", message: "Message sent successfully!" });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className={`${s.section} ${sent ? s.sent : ""}`}>
      <div
        ref={topRef}
        tabIndex={-1}
        aria-hidden="true"
        className={s.topAnchor}
      />

      {toast && (
        <div
          className={`${s.toast} ${
            toast.type === "success" ? s.toastSuccess : s.toastError
          }`}
          role="status"
          aria-live="polite"
          aria-atomic="true"
        >
          {toast.message}
        </div>
      )}

      <div className={s.wrap}>
        <h1 className={s.title}>Contact</h1>

        {sent ? (
          <div
            className={s.success}
            role="status"
            aria-live="polite"
            aria-atomic="true"
          >
            <h2>Thanks! We received your message.</h2>
            <p className={s.helper}>
              We’ll get back to you at <strong>{values.email}</strong>.
            </p>
          </div>
        ) : (
          <div className={s.card}>
            <form className={s.form} onSubmit={handleSubmit} noValidate>
              {/* Full name */}
              <div className={s.row}>
                <label className={s.label} htmlFor={`${id}-fullName`}>
                  Full name{" "}
                  <span className={s.required} aria-hidden="true">
                    *
                  </span>
                </label>
                <input
                  id={`${id}-fullName`}
                  className={s.input}
                  name="fullName"
                  value={values.fullName}
                  onChange={handleChange}
                  minLength={3}
                  required
                  aria-invalid={Boolean(errors.fullName)}
                  aria-describedby={
                    errors.fullName ? `${id}-fullName-err` : undefined
                  }
                  autoComplete="name"
                />
                {errors.fullName && (
                  <small
                    id={`${id}-fullName-err`}
                    role="alert"
                    className={s.errorText}
                  >
                    {errors.fullName}
                  </small>
                )}
              </div>

              {/* Subject */}
              <div className={s.row}>
                <label className={s.label} htmlFor={`${id}-subject`}>
                  Subject{" "}
                  <span className={s.required} aria-hidden="true">
                    *
                  </span>
                </label>
                <input
                  id={`${id}-subject`}
                  className={s.input}
                  name="subject"
                  value={values.subject}
                  onChange={handleChange}
                  minLength={3}
                  required
                  aria-invalid={Boolean(errors.subject)}
                  aria-describedby={
                    errors.subject ? `${id}-subject-err` : undefined
                  }
                />
                {errors.subject && (
                  <small
                    id={`${id}-subject-err`}
                    role="alert"
                    className={s.errorText}
                  >
                    {errors.subject}
                  </small>
                )}
              </div>

              {/* Email */}
              <div className={s.row}>
                <label className={s.label} htmlFor={`${id}-email`}>
                  Email{" "}
                  <span className={s.required} aria-hidden="true">
                    *
                  </span>
                </label>
                <input
                  id={`${id}-email`}
                  className={s.input}
                  name="email"
                  type="email"
                  value={values.email}
                  onChange={handleChange}
                  inputMode="email"
                  required
                  aria-invalid={Boolean(errors.email)}
                  aria-describedby={
                    errors.email ? `${id}-email-err` : undefined
                  }
                  autoComplete="email"
                />
                {errors.email && (
                  <small
                    id={`${id}-email-err`}
                    role="alert"
                    className={s.errorText}
                  >
                    {errors.email}
                  </small>
                )}
                <span className={s.helper}>We’ll only use this to reply.</span>
              </div>

              {/* Message */}
              <div className={s.row}>
                <label className={s.label} htmlFor={`${id}-body`}>
                  Message{" "}
                  <span className={s.required} aria-hidden="true">
                    *
                  </span>
                </label>
                <textarea
                  id={`${id}-body`}
                  className={s.textarea}
                  name="body"
                  value={values.body}
                  onChange={handleChange}
                  minLength={10}
                  required
                  aria-invalid={Boolean(errors.body)}
                  aria-describedby={errors.body ? `${id}-body-err` : undefined}
                />
                {errors.body && (
                  <small
                    id={`${id}-body-err`}
                    role="alert"
                    className={s.errorText}
                  >
                    {errors.body}
                  </small>
                )}
              </div>

              {/* Actions */}
              <div className={s.actions}>
                <button
                  className={s.btn}
                  type="submit"
                  disabled={submitting || hasErrors}
                >
                  {submitting ? "Sending…" : "Submit"}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </section>
  );
}
