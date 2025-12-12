export function formatNOK(amount: number): string {
  try {
    if (!Number.isFinite(amount)) return "â€“";
    return new Intl.NumberFormat("no-NO", {
      style: "currency",
      currency: "NOK",
    }).format(amount);
  } catch {
    return `${amount} NOK`;
  }
}

export function discountPercent(
  price: number,
  discountedPrice: number | null | undefined
): number {
  if (
    !Number.isFinite(price) ||
    price <= 0 ||
    discountedPrice === null ||
    discountedPrice === undefined ||
    !Number.isFinite(discountedPrice)
  ) {
    return 0;
  }
  const pct = Math.round(((price - discountedPrice) / price) * 100);
  return Math.max(0, pct);
}
