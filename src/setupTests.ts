import "@testing-library/jest-dom";

// legg øverst i ProductCard.test.tsx (eller i setupTests.ts)
beforeAll(() => {
  jest.spyOn(console, "warn").mockImplementation((msg, ...rest) => {
    if (
      typeof msg === "string" &&
      msg.includes("React Router Future Flag Warning")
    ) {
      return; // svelg disse
    }
    // ellers logg som vanlig
    // @ts-ignore
    console._warnOriginal?.(msg, ...rest);
  });

  // bevar original warn om du vil
  // @ts-ignore
  if (!console._warnOriginal) console._warnOriginal = console.warn;
});

afterAll(() => {
  // @ts-ignore
  if (console._warnOriginal) {
    // @ts-ignore
    console.warn = console._warnOriginal;
  }
});
