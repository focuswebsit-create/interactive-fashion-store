import type { Product, Size } from "@/lib/catalog/types";

export const CART_STORAGE_KEY = "ifs.cart.v1";
export const MAX_QTY_PER_LINE = 10;

export type CartLine = {
  productId: string;
  size: Size;
  quantity: number;
};

export type CartState = { lines: CartLine[]; hydrated: boolean };

export type CartAction =
  | { type: "add"; productId: string; size: Size; quantity: number }
  | { type: "setQuantity"; productId: string; size: Size; quantity: number }
  | { type: "remove"; productId: string; size: Size }
  | { type: "clear" }
  | { type: "hydrate"; lines: CartLine[] };

const clampQty = (q: number) => Math.max(1, Math.min(MAX_QTY_PER_LINE, Math.floor(q)));
const same = (l: CartLine, productId: string, size: Size) => l.productId === productId && l.size === size;

export function cartReducer(state: CartState, action: CartAction): CartState {
  const lines = linesReducer(state.lines, action);
  const hydrated = state.hydrated || action.type === "hydrate";
  return lines === state.lines && hydrated === state.hydrated ? state : { lines, hydrated };
}

function linesReducer(lines: CartLine[], action: CartAction): CartLine[] {
  switch (action.type) {
    case "add": {
      const existing = lines.find((l) => same(l, action.productId, action.size));
      if (existing) {
        return lines.map((l) => (l === existing ? { ...l, quantity: clampQty(l.quantity + action.quantity) } : l));
      }
      return [...lines, { productId: action.productId, size: action.size, quantity: clampQty(action.quantity) }];
    }
    case "setQuantity":
      if (action.quantity <= 0) return lines.filter((l) => !same(l, action.productId, action.size));
      return lines.map((l) => (same(l, action.productId, action.size) ? { ...l, quantity: clampQty(action.quantity) } : l));
    case "remove":
      return lines.filter((l) => !same(l, action.productId, action.size));
    case "clear":
      return [];
    case "hydrate":
      return action.lines;
  }
}

/**
 * Parse untrusted persisted data. Drops lines whose product or size no longer
 * exists (or is sold out) so a stale localStorage can never break the UI.
 */
export function sanitizeLines(raw: unknown, products: Product[]): CartLine[] {
  if (!raw || typeof raw !== "object" || !Array.isArray((raw as { lines?: unknown }).lines)) return [];
  const out: CartLine[] = [];
  for (const item of (raw as { lines: unknown[] }).lines) {
    if (!item || typeof item !== "object") continue;
    const { productId, size, quantity } = item as Record<string, unknown>;
    if (typeof productId !== "string" || typeof size !== "string" || typeof quantity !== "number") continue;
    const product = products.find((p) => p.id === productId);
    const variant = product?.variants.find((v) => v.size === size);
    if (!product || !variant || !variant.available || !Number.isFinite(quantity) || quantity < 1) continue;
    if (out.some((l) => same(l, productId, variant.size))) continue;
    out.push({ productId, size: variant.size, quantity: clampQty(quantity) });
  }
  return out;
}
