import "server-only";
import type { ShopifyConfig } from "./config";

type GraphQLResponse<T> = { data?: T; errors?: { message: string }[] };

/** Minimal Storefront API GraphQL client (server-side only). */
export async function storefrontFetch<T>(
  config: ShopifyConfig,
  query: string,
  variables: Record<string, unknown> = {},
): Promise<T> {
  const headers: Record<string, string> = { "Content-Type": "application/json", Accept: "application/json" };
  if (config.tokenKind === "private") headers["Shopify-Storefront-Private-Token"] = config.token;
  else headers["X-Shopify-Storefront-Access-Token"] = config.token;

  const res = await fetch(`https://${config.storeDomain}/api/${config.apiVersion}/graphql.json`, {
    method: "POST",
    headers,
    body: JSON.stringify({ query, variables }),
  });
  if (!res.ok) throw new Error(`Shopify Storefront API responded ${res.status}`);
  const json = (await res.json()) as GraphQLResponse<T>;
  if (json.errors?.length) throw new Error(`Shopify Storefront API: ${json.errors.map((e) => e.message).join("; ")}`);
  if (!json.data) throw new Error("Shopify Storefront API returned no data");
  return json.data;
}
