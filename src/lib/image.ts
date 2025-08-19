import type { Product } from "../types/onlineShop";

export function getImageUrl(p: Product): string | undefined {
  // Tilpass til ditt datastruktur; dette er et eksempel
  return p?.image?.url ?? undefined;
}
