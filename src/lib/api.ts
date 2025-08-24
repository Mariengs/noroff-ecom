import type { Product } from "../types/onlineShop";

export async function getProducts(): Promise<Product[]> {
  const res = await fetch("https://v2.api.noroff.dev/online-shop");
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const json = await res.json();
  return json.data as Product[]; // Noroff-API legger arrayet i .data
}

export async function getProduct(id: string): Promise<Product> {
  const res = await fetch(`https://v2.api.noroff.dev/online-shop/${id}`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const json = await res.json();
  return json.data as Product;
}
