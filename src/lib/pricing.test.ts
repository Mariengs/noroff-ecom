import { formatNOK, discountPercent } from "./pricing";

describe("formatNOK", () => {
  it("formats positive numbers as NOK currency", () => {
    const out = formatNOK(1234.5);
    expect(out).toMatch(/kr/i);
    expect(out).toMatch(/1234|1.?234/);
  });

  it("formats zero", () => {
    const out = formatNOK(0);
    expect(out).toMatch(/kr/i);
  });

  it("returns en dash for non-finite values", () => {
    expect(formatNOK(NaN)).toBe("–");
    expect(formatNOK(Infinity as unknown as number)).toBe("–");
    expect(formatNOK(-Infinity as unknown as number)).toBe("–");
  });
});

describe("discountPercent", () => {
  it("returns rounded percent discount when valid", () => {
    expect(discountPercent(1000, 800)).toBe(20);
    expect(discountPercent(999, 899)).toBe(10); // 10.01 → 10 after round
  });

  it("returns 0 when no discount or discount is negative", () => {
    expect(discountPercent(1000, 1000)).toBe(0); // no discount
    expect(discountPercent(1000, 1200)).toBe(0); // 'discount' higher than price → clamp to 0
  });

  it("returns 0 for invalid inputs", () => {
    expect(discountPercent(0, 100)).toBe(0); // price <= 0
    expect(discountPercent(-10, 5)).toBe(0);
    expect(discountPercent(1000, null)).toBe(0);
    expect(discountPercent(1000, undefined)).toBe(0);
    expect(discountPercent(NaN as any, 10)).toBe(0);
    expect(discountPercent(100, NaN as any)).toBe(0);
  });
});
