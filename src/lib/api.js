export const BASE_URL = "https://v2.api.noroff.dev/online-shop";

async function get(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const json = await res.json();
  return json?.data ?? json;
}

export async function getProducts() {
  return get(BASE_URL);
}

export async function getProduct(id) {
  return get(`${BASE_URL}/${id}`);
}
