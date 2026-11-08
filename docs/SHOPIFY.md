# Connecting Shopify (later)

The storefront runs entirely on the local demo catalog today. A Shopify
Storefront API adapter is already written (`src/lib/commerce/shopify/`) but is
**inactive** until you configure it. Nothing in the demo needs Shopify.

## What I need from you

1. **Store domain**: `your-store.myshopify.com`
2. **A Storefront API access token.** Install the *Headless* sales channel in
   Shopify admin and create a storefront. Copy the **private** token (preferred:
   it is only used server-side). The public token also works.
3. **Products set up for the rack:**
   - a `Size` option whose values are XS/S/M/L/XL/XXL
   - a featured image that is a **cut-out photo of the garment on a hanger**,
     shot straight on, on a transparent or plain white background, at least
     1600 px tall
   - the tag `rack` (or set `SHOPIFY_RACK_QUERY` to another search query)
   - optional metafield `custom.hanger_hook` (single-line text) giving the
     hook apex position as fractions of the image, e.g. `0.5,0.03`. This is
     what lets real photos hang exactly on the rail. The default is `0.5,0.02`.
   - product type such as `Hoodie`, `T-shirt`, `Shirt` or `Jacket` (drives the
     header filters)
4. **Markets, currency, shipping, taxes and payments** configured in Shopify.
   Checkout is Shopify's own hosted checkout, so those settings apply there.
5. **Rights-cleared imagery and copy** for every product.

## Turning it on

```bash
# .env.local (or the Vercel project's Environment Variables)
COMMERCE_PROVIDER=shopify
SHOPIFY_STORE_DOMAIN=your-store.myshopify.com
SHOPIFY_STOREFRONT_PRIVATE_TOKEN=shpat_...
SHOPIFY_STOREFRONT_API_VERSION=2026-10   # confirm the current stable version
```

Then add your image host to `images.remotePatterns` in `next.config.ts`
(`cdn.shopify.com`) and redeploy.

What changes when it's on:

- `getCommerce()` (`src/lib/commerce/index.ts`) returns the Shopify adapter.
- Products come from the Storefront `products` query, cached with `"use cache"`
  and `cacheLife("minutes")` under the tag `shopify-products`.
- "Checkout" calls `/api/checkout` → `cartCreate` with the matching
  `ProductVariant` IDs, and the browser is redirected to Shopify's
  `checkoutUrl`. The "demo only" labels disappear automatically
  (`mode === "shopify"`).
- If the env vars are incomplete, the app logs a warning and stays on the demo
  catalog instead of breaking.

## Not done yet (do this when going live)

- Test against a real store. The adapter type-checks, but it has **not been
  run against Shopify** because there are no credentials yet.
- Keep the cart in a Shopify cart (`cartLinesAdd`/`cartLinesUpdate`) instead of
  creating it at checkout, if you need discounts or live inventory in the bag.
- Revalidate on product webhooks (`revalidateTag("shopify-products")`).
- Legal pages (privacy, terms, returns) and analytics/consent.
