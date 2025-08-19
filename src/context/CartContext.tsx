import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  type ReactNode,
} from "react";

/** Domenetyper */
export type CartItem = {
  id: string;
  title: string;
  price: number;
  discountedPrice?: number;
  imageUrl?: string; // <- vi vil alltid fylle denne
  image?: string; // legacy (string) – mappes til imageUrl
  qty: number;
};

export interface CartState {
  items: CartItem[];
}

/** Pris-hjelper */
const activePrice = (i: CartItem) =>
  typeof i.discountedPrice === "number" ? i.discountedPrice : i.price;

/** Hent URL fra string | { url } | annet */
function getImgUrlFromAny(input: unknown): string | undefined {
  if (!input) return undefined;
  if (typeof input === "string") return input;
  if (typeof input === "object") {
    const url = (input as any)?.url;
    if (typeof url === "string") return url;
  }
  return undefined;
}

/** Normaliser payload slik at imageUrl settes */
function normalizePayload(
  payload: Omit<CartItem, "qty">
): Omit<CartItem, "qty"> {
  return {
    ...payload,
    imageUrl:
      payload.imageUrl ?? getImgUrlFromAny((payload as any).image) ?? undefined,
  };
}

/** Actions */
type AddAction = { type: "ADD"; id: string; payload: Omit<CartItem, "qty"> };
type AddQtyAction = {
  type: "ADD_QTY";
  payload: Omit<CartItem, "qty">;
  qty: number;
};
type IncAction = { type: "INC"; id: string };
type DecAction = { type: "DEC"; id: string };
type RemoveAction = { type: "REMOVE"; id: string };
type ClearAction = { type: "CLEAR" };

type Action =
  | AddAction
  | AddQtyAction
  | IncAction
  | DecAction
  | RemoveAction
  | ClearAction;

/** Context-verdi */
export interface CartContextValue {
  items: CartItem[];
  totalQty: number;
  totalAmount: number;
  add: (payload: Omit<CartItem, "qty">) => void;
  addQty: (payload: Omit<CartItem, "qty">, qty: number) => void;
  inc: (id: string) => void;
  dec: (id: string) => void;
  remove: (id: string) => void;
  clear: () => void;
}

const CartContext = createContext<CartContextValue | null>(null);

/** Initial state fra localStorage — normaliser gamle entries */
const initial = (): CartState => {
  if (typeof window === "undefined") return { items: [] };
  try {
    const raw = localStorage.getItem("cart-v1");
    const parsed = raw ? (JSON.parse(raw) as Partial<CartState>) : null;
    if (parsed && Array.isArray(parsed.items)) {
      return {
        items: parsed.items
          .filter((i: any) => i && typeof i.id === "string")
          .map((i: any) => {
            const imageUrl =
              typeof i.imageUrl === "string"
                ? i.imageUrl
                : getImgUrlFromAny(i.image) ??
                  getImgUrlFromAny(i.thumbnail) ??
                  undefined;

            return {
              id: String(i.id),
              title: String(i.title ?? ""),
              price: Number(i.price ?? 0),
              discountedPrice:
                typeof i.discountedPrice === "number"
                  ? i.discountedPrice
                  : undefined,
              imageUrl,
              qty: Math.max(0, Number(i.qty ?? 0)),
            } as CartItem;
          })
          .filter((i) => i.qty > 0),
      };
    }
    return { items: [] };
  } catch {
    return { items: [] };
  }
};

/** Reducer */
function reducer(state: CartState, action: Action): CartState {
  switch (action.type) {
    case "ADD": {
      const payload = normalizePayload(action.payload);
      const exists = state.items.find((i) => i.id === action.id);
      const items = exists
        ? state.items.map((i) =>
            i.id === action.id ? { ...i, qty: i.qty + 1 } : i
          )
        : [...state.items, { ...payload, qty: 1 }];
      return { ...state, items };
    }

    case "ADD_QTY": {
      const payload = normalizePayload(action.payload);
      const { qty } = action;
      const exists = state.items.find((i) => i.id === payload.id);
      const items = exists
        ? state.items.map((i) =>
            i.id === payload.id ? { ...i, qty: i.qty + qty } : i
          )
        : [...state.items, { ...payload, qty }];
      return { ...state, items };
    }

    case "INC": {
      const items = state.items.map((i) =>
        i.id === action.id ? { ...i, qty: i.qty + 1 } : i
      );
      return { ...state, items };
    }

    case "DEC": {
      const items = state.items
        .map((i) => (i.id === action.id ? { ...i, qty: i.qty - 1 } : i))
        .filter((i) => i.qty > 0);
      return { ...state, items };
    }

    case "REMOVE": {
      return { ...state, items: state.items.filter((i) => i.id !== action.id) };
    }

    case "CLEAR":
      return { items: [] };

    default: {
      // Exhaustiveness-sjekk (hindrer "glemte" cases ved endringer)
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const _exhaustive: never = action;
      return state;
    }
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(
    reducer,
    undefined as unknown as CartState,
    initial
  );

  useEffect(() => {
    try {
      localStorage.setItem("cart-v1", JSON.stringify(state));
    } catch {
      /* ignore */
    }
  }, [state]);

  const totalQty = useMemo(
    () => state.items.reduce((s, i) => s + i.qty, 0),
    [state.items]
  );

  const totalAmount = useMemo(
    () => state.items.reduce((s, i) => s + activePrice(i) * i.qty, 0),
    [state.items]
  );

  const value: CartContextValue = {
    items: state.items,
    totalQty,
    totalAmount,
    add: (payload) => dispatch({ type: "ADD", id: payload.id, payload }),
    addQty: (payload, qty) => dispatch({ type: "ADD_QTY", payload, qty }),
    inc: (id) => dispatch({ type: "INC", id }),
    dec: (id) => dispatch({ type: "DEC", id }),
    remove: (id) => dispatch({ type: "REMOVE", id }),
    clear: () => dispatch({ type: "CLEAR" }),
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
