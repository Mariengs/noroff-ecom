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

  function makeResponse({
    ok,
    status = ok ? 200 : 500,
    contentType = "application/json",
    jsonBody,
    textBody = "",
  }: {
    ok: boolean;
    status?: number;
    contentType?: string | null;
    jsonBody?: any;
    textBody?: string;
  }) {
    return {
      ok,
      status,
      headers: {
        get: (key: string) =>
          key.toLowerCase() === "content-type" ? contentType : null,
      },
      json: async () => jsonBody,
      text: async () => textBody,
    };
  }

  it("getProducts: calls the Noroff list endpoint and unwraps json.data", async () => {
    const sample = [{ id: "p1" }, { id: "p2" }];

    (global.fetch as jest.Mock).mockResolvedValueOnce(
      makeResponse({
        ok: true,
        jsonBody: { data: sample },
      })
    );

    const data = await getProducts();

    expect(global.fetch).toHaveBeenCalledWith(
      "https://v2.api.noroff.dev/online-shop",
      expect.any(Object)
    );
    expect(data).toEqual(sample);
  });

  it("getProducts: throws on non-ok response", async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce(
      makeResponse({
        ok: false,
        status: 500,
        jsonBody: {},
      })
    );

    await expect(getProducts()).rejects.toThrow(/HTTP 500/);
  });

  it("getProduct: calls the item endpoint with id and unwraps json.data", async () => {
    const sample = { id: "p42", title: "Lamp" };

    (global.fetch as jest.Mock).mockResolvedValueOnce(
      makeResponse({
        ok: true,
        jsonBody: { data: sample },
      })
    );

    const data = await getProduct("p42");

    expect(global.fetch).toHaveBeenCalledWith(
      "https://v2.api.noroff.dev/online-shop/p42",
      expect.any(Object)
    );
    expect(data).toEqual(sample);
  });

  it("getProduct: throws on non-ok response", async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce(
      makeResponse({
        ok: false,
        status: 404,
        jsonBody: {},
      })
    );

    await expect(getProduct("nope")).rejects.toThrow(/HTTP 404/);
  });
});
