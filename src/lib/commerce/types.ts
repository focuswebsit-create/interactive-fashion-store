import type { Product, Size } from "@/lib/catalog/types";

export type CommerceMode = "demo" | "shopify";

export type CheckoutLineInput = { productId: string; size: Size; quantity: number };

export type CheckoutResult =
  | { kind: "demo"; reference: string; itemCount: number; total: { amount: number; currencyCode: string }; message: string }
  | { kind: "redirect"; url: string };

/**
 * The only surface the UI/route handlers depend on. Implementations:
 *  - `demoAdapter`   — local catalog, simulated checkout (default)
 *  - `shopifyAdapter` — Storefront API (enabled by env, see .env.example)
 */
export interface CommerceAdapter {
  readonly mode: CommerceMode;
  listProducts(): Promise<Product[]>;
  getProduct(handle: string): Promise<Product | null>;
  createCheckout(lines: CheckoutLineInput[]): Promise<CheckoutResult>;
}

export class CheckoutError extends Error {
  constructor(
    message: string,
    readonly status = 400,
  ) {
    super(message);
  }
}
