import { useState } from "react";

function isEmail(v) {
  return /.+@.+\..+/.test(v);
}

export default function ContactPage() {
  const [values, setValues] = useState({
    fullName: "",
    subject: "",
    email: "",
    body: "",
  });
  const [errors, setErrors] = useState({});
  const [sent, setSent] = useState(false);

  function validate(v) {
    const e = {};
    if (!v.fullName || v.fullName.trim().length < 3)
      e.fullName = "Full name must be at least 3 characters";
    if (!v.subject || v.subject.trim().length < 3)
      e.subject = "Subject must be at least 3 characters";
    if (!v.email || !isEmail(v.email))
      e.email = "Please enter a valid email address";
    if (!v.body || v.body.trim().length < 3)
      e.body = "Body must be at least 3 characters";
    return e;
  }

  function handleChange(e) {
    const { name, value } = e.target;
    setValues((prev) => ({ ...prev, [name]: value }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    const eobj = validate(values);
    setErrors(eobj);
    if (Object.keys(eobj).length === 0) {
      console.log("Contact form data:", values);
      setSent(true);
    }
  }

  return (
    <section>
      <h1>Contact</h1>
      {sent ? (
        <p>Thanks! We received your message.</p>
      ) : (
        <form onSubmit={handleSubmit} noValidate>
          <label>
            Full name
            <input
              name="fullName"
              value={values.fullName}
              onChange={handleChange}
              required
            />
            {errors.fullName && <small role="alert">{errors.fullName}</small>}
          </label>
          <label>
            Subject
            <input
              name="subject"
              value={values.subject}
              onChange={handleChange}
              required
            />
            {errors.subject && <small role="alert">{errors.subject}</small>}
          </label>
          <label>
            Email
            <input
              name="email"
              type="email"
              value={values.email}
              onChange={handleChange}
              required
            />
            {errors.email && <small role="alert">{errors.email}</small>}
          </label>
          <label>
            Body
            <textarea
              name="body"
              value={values.body}
              onChange={handleChange}
              required
            />
            {errors.body && <small role="alert">{errors.body}</small>}
          </label>
          <button type="submit">Submit</button>
        </form>
      )}
    </section>
  );
}
