/**
 * Shopify Storefront API configuration — read from server-side env only.
 * Nothing here is required for the demo; the adapter is only activated when
 * COMMERCE_PROVIDER=shopify AND the required variables are present.
 */
export type ShopifyConfig = {
  storeDomain: string; // e.g. "your-store.myshopify.com"
  apiVersion: string; // e.g. "2026-10"
  /** Private Storefront token (preferred, server only) or public token. */
  token: string;
  tokenKind: "private" | "public";
};

export const DEFAULT_SHOPIFY_API_VERSION = "2026-10";

export function readShopifyConfig(env: NodeJS.ProcessEnv = process.env): ShopifyConfig | null {
  const storeDomain = env.SHOPIFY_STORE_DOMAIN?.trim().replace(/^https?:\/\//, "").replace(/\/$/, "");
  const privateToken = env.SHOPIFY_STOREFRONT_PRIVATE_TOKEN?.trim();
  const publicToken = env.SHOPIFY_STOREFRONT_PUBLIC_TOKEN?.trim();
  const token = privateToken || publicToken;
  if (!storeDomain || !token) return null;
  return {
    storeDomain,
    apiVersion: env.SHOPIFY_STOREFRONT_API_VERSION?.trim() || DEFAULT_SHOPIFY_API_VERSION,
    token,
    tokenKind: privateToken ? "private" : "public",
  };
}
