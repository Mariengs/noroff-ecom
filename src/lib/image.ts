import type { Product } from "../types/onlineShop";

export function getImageUrl(p: Product): string | undefined {
  return p?.image?.url ?? undefined;
}
