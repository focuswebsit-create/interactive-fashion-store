import "server-only";
import { demoAdapter } from "./demo-adapter";
import { readShopifyConfig } from "./shopify/config";
import { createShopifyAdapter } from "./shopify/adapter";
import type { CommerceAdapter } from "./types";

export type { CommerceAdapter, CommerceMode, CheckoutResult, CheckoutLineInput } from "./types";
export { CheckoutError } from "./types";

/**
 * Picks the commerce backend. Demo is the default and needs no credentials.
 * Shopify is used only when explicitly requested AND fully configured, so a
 * half-configured environment never silently breaks the storefront.
 */
export function getCommerce(): CommerceAdapter {
  if (process.env.COMMERCE_PROVIDER === "shopify") {
    const config = readShopifyConfig();
    if (config) return createShopifyAdapter(config);
    console.warn("[commerce] COMMERCE_PROVIDER=shopify but Shopify env vars are missing — using demo catalog.");
  }
  return demoAdapter;
}
