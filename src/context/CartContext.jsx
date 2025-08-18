import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useReducer,
} from "react";

const CartContext = createContext(null);

const initial = () => {
  try {
    return JSON.parse(localStorage.getItem("cart-v1")) || { items: [] };
  } catch {
    return { items: [] };
  }
};

function reducer(state, action) {
  switch (action.type) {
    case "ADD": {
      const { id, payload } = action;
      const exists = state.items.find((i) => i.id === id);
      const items = exists
        ? state.items.map((i) => (i.id === id ? { ...i, qty: i.qty + 1 } : i))
        : [...state.items, { ...payload, qty: 1 }];
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
        .map((i) =>
          i.id === action.id ? { ...i, qty: Math.max(1, i.qty - 1) } : i
        )
        .filter((i) => i.qty > 0);
      return { ...state, items };
    }
    case "REMOVE": {
      return { ...state, items: state.items.filter((i) => i.id !== action.id) };
    }
    case "CLEAR":
      return { items: [] };
    default:
      return state;
  }
}

export function CartProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, undefined, initial);

  useEffect(() => {
    localStorage.setItem("cart-v1", JSON.stringify(state));
  }, [state]);

  const totalQty = useMemo(
    () => state.items.reduce((s, i) => s + i.qty, 0),
    [state.items]
  );
  const totalAmount = useMemo(
    () =>
      state.items.reduce(
        (s, i) => s + (i.discountedPrice ?? i.price) * i.qty,
        0
      ),
    [state.items]
  );

  const value = {
    items: state.items,
    totalQty,
    totalAmount,
    add: (payload) => dispatch({ type: "ADD", id: payload.id, payload }),
    inc: (id) => dispatch({ type: "INC", id }),
    dec: (id) => dispatch({ type: "DEC", id }),
    remove: (id) => dispatch({ type: "REMOVE", id }),
    clear: () => dispatch({ type: "CLEAR" }),
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
