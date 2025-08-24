import { getProducts, getProduct } from "./api";

describe("api helpers", () => {
  const originalFetch = global.fetch as any;

  beforeEach(() => {
    global.fetch = jest.fn();
  });

  afterEach(() => {
    jest.resetAllMocks();
    global.fetch = originalFetch;
  });

  it("getProducts: calls the Noroff list endpoint and unwraps json.data", async () => {
    const sample = [{ id: "p1" }, { id: "p2" }];
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: sample }),
    });

    const data = await getProducts();

    expect(global.fetch).toHaveBeenCalledWith(
      "https://v2.api.noroff.dev/online-shop"
    );
    expect(data).toEqual(sample);
  });

  it("getProducts: throws on non-ok response", async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 500,
      json: async () => ({}),
    });

    await expect(getProducts()).rejects.toThrow(/HTTP 500/);
  });

  it("getProduct: calls the item endpoint with id and unwraps json.data", async () => {
    const sample = { id: "p42", title: "Lamp" };
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: sample }),
    });

    const data = await getProduct("p42");

    expect(global.fetch).toHaveBeenCalledWith(
      "https://v2.api.noroff.dev/online-shop/p42"
    );
    expect(data).toEqual(sample);
  });

  it("getProduct: throws on non-ok response", async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 404,
      json: async () => ({}),
    });

    await expect(getProduct("nope")).rejects.toThrow(/HTTP 404/);
  });
});
