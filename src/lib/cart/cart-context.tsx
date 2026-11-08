"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useReducer, useRef, useState, type ReactNode } from "react";
import type { Money, Product, Size } from "@/lib/catalog/types";
import { CART_STORAGE_KEY, cartReducer, sanitizeLines, type CartLine } from "./cart-reducer";

export type ResolvedLine = CartLine & { product: Product; lineTotal: Money };

type CartContextValue = {
  lines: ResolvedLine[];
  count: number;
  subtotal: Money;
  /** True once persisted state has been read (avoids hydration flashes). */
  ready: boolean;
  isOpen: boolean;
  open: () => void;
  close: () => void;
  add: (productId: string, size: Size, quantity: number) => void;
  setQuantity: (productId: string, size: Size, quantity: number) => void;
  remove: (productId: string, size: Size) => void;
  clear: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);

function readStorage(products: Product[]): CartLine[] {
  try {
    const raw = window.localStorage.getItem(CART_STORAGE_KEY);
    return raw ? sanitizeLines(JSON.parse(raw), products) : [];
  } catch {
    return [];
  }
}

export function CartProvider({ products, children }: { products: Product[]; children: ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, { lines: [], hydrated: false });
  const ready = state.hydrated;
  const [isOpen, setOpen] = useState(false);
  const skipNextWrite = useRef(false);

  // Load persisted cart after mount (localStorage is client-only).
  useEffect(() => {
    dispatch({ type: "hydrate", lines: readStorage(products) });
    const onStorage = (e: StorageEvent) => {
      if (e.key !== CART_STORAGE_KEY) return;
      skipNextWrite.current = true;
      dispatch({ type: "hydrate", lines: readStorage(products) });
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [products]);

  useEffect(() => {
    if (!ready) return;
    if (skipNextWrite.current) {
      skipNextWrite.current = false;
      return;
    }
    try {
      window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify({ lines: state.lines }));
    } catch {
      /* storage full or disabled — cart still works in memory */
    }
  }, [state.lines, ready]);

  const add = useCallback((productId: string, size: Size, quantity: number) => dispatch({ type: "add", productId, size, quantity }), []);
  const setQuantity = useCallback(
    (productId: string, size: Size, quantity: number) => dispatch({ type: "setQuantity", productId, size, quantity }),
    [],
  );
  const remove = useCallback((productId: string, size: Size) => dispatch({ type: "remove", productId, size }), []);
  const clear = useCallback(() => dispatch({ type: "clear" }), []);
  const open = useCallback(() => setOpen(true), []);
  const close = useCallback(() => setOpen(false), []);

  const value = useMemo<CartContextValue>(() => {
    const lines: ResolvedLine[] = [];
    for (const l of state.lines) {
      const product = products.find((p) => p.id === l.productId);
      if (!product) continue;
      lines.push({ ...l, product, lineTotal: { amount: product.price.amount * l.quantity, currencyCode: product.price.currencyCode } });
    }
    const currencyCode = products[0]?.price.currencyCode ?? "USD";
    return {
      lines,
      count: lines.reduce((n, l) => n + l.quantity, 0),
      subtotal: { amount: lines.reduce((n, l) => n + l.lineTotal.amount, 0), currencyCode },
      ready,
      isOpen,
      open,
      close,
      add,
      setQuantity,
      remove,
      clear,
    };
  }, [state.lines, products, ready, isOpen, open, close, add, setQuantity, remove, clear]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside <CartProvider>");
  return ctx;
}
