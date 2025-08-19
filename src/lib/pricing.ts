// Rask formatter – kan evt. flyttes til en memoized formatter hvis du kaller den ofte
export function formatNOK(amount: number): string {
  try {
    if (!Number.isFinite(amount)) return "–";
    return new Intl.NumberFormat("no-NO", {
      style: "currency",
      currency: "NOK",
    }).format(amount);
  } catch {
    return `${amount} NOK`;
  }
}

/**
 * Beregner rabatt i prosent (avrundet til nærmeste heltall).
 * Returnerer 0 hvis input er ugyldig eller ingen rabatt.
 */
export function discountPercent(
  price: number,
  discountedPrice: number | null | undefined
): number {
  if (
    !Number.isFinite(price) ||
    price <= 0 ||
    discountedPrice == null ||
    !Number.isFinite(discountedPrice)
  ) {
    return 0;
  }
  const pct = Math.round(((price - discountedPrice) / price) * 100);
  return Math.max(0, pct);
}
