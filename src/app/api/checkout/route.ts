import { NextResponse } from "next/server";
import { CheckoutError, getCommerce, type CheckoutLineInput } from "@/lib/commerce";
import { SIZE_ORDER, type Size } from "@/lib/catalog/types";
import { MAX_QTY_PER_LINE } from "@/lib/cart/cart-reducer";

function parseLines(body: unknown): CheckoutLineInput[] | null {
  if (!body || typeof body !== "object" || !Array.isArray((body as { lines?: unknown }).lines)) return null;
  const lines: CheckoutLineInput[] = [];
  for (const raw of (body as { lines: unknown[] }).lines.slice(0, 50)) {
    const { productId, size, quantity } = (raw ?? {}) as Record<string, unknown>;
    if (typeof productId !== "string" || !SIZE_ORDER.includes(size as Size)) return null;
    if (typeof quantity !== "number" || !Number.isInteger(quantity) || quantity < 1 || quantity > MAX_QTY_PER_LINE) return null;
    lines.push({ productId, size: size as Size, quantity });
  }
  return lines;
}

/**
 * Server-side checkout entry point. In demo mode this validates and prices
 * the bag and returns a DEMO reference; with Shopify configured it creates a
 * Storefront cart and returns Shopify's hosted checkout URL.
 */
export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
  const lines = parseLines(body);
  if (!lines) return NextResponse.json({ error: "Invalid bag contents." }, { status: 400 });
  try {
    const result = await getCommerce().createCheckout(lines);
    return NextResponse.json(result);
  } catch (err) {
    if (err instanceof CheckoutError) return NextResponse.json({ error: err.message }, { status: err.status });
    console.error("[checkout]", err);
    return NextResponse.json({ error: "Checkout is temporarily unavailable." }, { status: 502 });
  }
}
