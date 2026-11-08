import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // When switching to Shopify product photos, allow the CDN, e.g.:
  // images: { remotePatterns: [{ protocol: "https", hostname: "cdn.shopify.com" }] },
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
