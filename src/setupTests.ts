import "@testing-library/jest-dom";

beforeAll(() => {
  jest.spyOn(console, "warn").mockImplementation((msg, ...rest) => {
    if (
      typeof msg === "string" &&
      msg.includes("React Router Future Flag Warning")
    ) {
      return;
    }

    // @ts-ignore
    console._warnOriginal?.(msg, ...rest);
  });

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
