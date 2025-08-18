export function formatNOK(amount) {
  try {
    return new Intl.NumberFormat("no-NO", {
      style: "currency",
      currency: "NOK",
    }).format(amount);
  } catch {
    return `${amount} NOK`;
  }
}

export function discountPercent(price, discountedPrice) {
  if (!price || price <= 0 || discountedPrice == null) return 0;
  const pct = Math.round(((price - discountedPrice) / price) * 100);
  return Math.max(0, pct);
}
