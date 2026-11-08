import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { CheckoutError, type CommerceAdapter } from "../types";
import { storefrontFetch } from "./client";
import type { ShopifyConfig } from "./config";
import { mapShopifyProduct } from "./mappers";
import { CART_CREATE_MUTATION, PRODUCTS_QUERY, type CartCreateResult, type ProductsQueryResult } from "./queries";

async function fetchRackProducts(config: ShopifyConfig) {
  "use cache";
  cacheLife("minutes");
  cacheTag("shopify-products");
  const data = await storefrontFetch<ProductsQueryResult>(config, PRODUCTS_QUERY, {
    first: 50,
    // Only products tagged for the rack; change to suit your store.
    query: process.env.SHOPIFY_RACK_QUERY ?? "tag:rack",
  });
  return data.products.nodes.map(mapShopifyProduct).filter((p) => p !== null);
}

/**
 * Shopify Storefront API adapter. Not used until COMMERCE_PROVIDER=shopify
 * and credentials are configured (see .env.example / docs/SHOPIFY.md).
 * Checkout uses Shopify's own hosted checkout via `cart.checkoutUrl`.
 */
export function createShopifyAdapter(config: ShopifyConfig): CommerceAdapter {
  return {
    mode: "shopify",
    listProducts: () => fetchRackProducts(config),
    async getProduct(handle) {
      return (await fetchRackProducts(config)).find((p) => p.handle === handle) ?? null;
    },
    async createCheckout(lines) {
      if (lines.length === 0) throw new CheckoutError("Your bag is empty.");
      const products = await fetchRackProducts(config);
      const cartLines = lines.map((line) => {
        const variant = products.find((p) => p.id === line.productId)?.variants.find((v) => v.size === line.size);
        if (!variant?.providerVariantId) throw new CheckoutError("An item in your bag is no longer available.");
        return { merchandiseId: variant.providerVariantId, quantity: line.quantity };
      });
      const data = await storefrontFetch<CartCreateResult>(config, CART_CREATE_MUTATION, { lines: cartLines });
      const { cart, userErrors } = data.cartCreate;
      if (userErrors.length || !cart) throw new CheckoutError(userErrors[0]?.message ?? "Could not create checkout.", 502);
      return { kind: "redirect", url: cart.checkoutUrl };
    },
  };
}
