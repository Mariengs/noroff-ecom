import type { Product } from "../types/onlineShop";

export class ApiError extends Error {
  status: number;
  url: string;
  body?: unknown;
  constructor(
    message: string,
    opts: { status: number; url: string; body?: unknown }
  ) {
    super(message);
    this.name = "ApiError";
    this.status = opts.status;
    this.url = opts.url;
    this.body = opts.body;
  }
}

type FetchOpts = {
  signal?: AbortSignal;
  timeoutMs?: number;
};

async function fetchJson(
  url: string,
  { signal, timeoutMs = 10000 }: FetchOpts = {}
) {
  const controller = new AbortController();
  let timedOut = false;

  const onAbort = () => controller.abort();
  if (signal) signal.addEventListener("abort", onAbort);

  const t = setTimeout(() => {
    timedOut = true;
    controller.abort();
  }, timeoutMs);

  try {
    const res = await fetch(url, { signal: controller.signal });
    const isJson = (res.headers.get("content-type") || "").includes(
      "application/json"
    );
    const raw = isJson
      ? await res.json().catch(() => null)
      : await res.text().catch(() => "");

    if (!res.ok) {
      const msg =
        (raw &&
          typeof raw === "object" &&
          "message" in raw &&
          (raw as any).message) ||
        (raw &&
          typeof raw === "object" &&
          Array.isArray((raw as any).errors) &&
          (raw as any).errors[0]?.message) ||
        (typeof raw === "string" && raw.trim()) ||
        `HTTP ${res.status} ${res.statusText}`;
      throw new ApiError(msg, { status: res.status, url, body: raw });
    }

    return raw;
  } catch (e: any) {
    if (e?.name === "AbortError") {
      if (timedOut) {
        throw new Error("Request timed out.");
      }

      throw e;
    }
    if (typeof navigator !== "undefined" && navigator.onLine === false) {
      throw new Error("You appear to be offline.");
    }
    throw e;
  } finally {
    clearTimeout(t);
    if (signal) signal.removeEventListener("abort", onAbort);
  }
}

const API = "https://v2.api.noroff.dev";

export async function getProducts(opts?: FetchOpts): Promise<Product[]> {
  const json = (await fetchJson(`${API}/online-shop`, opts)) as {
    data: Product[];
  };
  return json.data;
}

export async function getProduct(
  id: string,
  opts?: FetchOpts
): Promise<Product> {
  const json = (await fetchJson(`${API}/online-shop/${id}`, opts)) as {
    data: Product;
  };
  return json.data;
}
