import { SIZE_ORDER, type Product, type Size } from "@/lib/catalog/types";
import type { ShopifyProductNode } from "./queries";

const GROUPS: Record<string, Product["group"]> = {
  hoodie: "sweats",
  sweatshirt: "sweats",
  "t-shirt": "tops",
  tee: "tops",
  knitwear: "tops",
  shirt: "shirts",
  overshirt: "shirts",
  jacket: "outerwear",
  outerwear: "outerwear",
};

/** Parse the `custom.hanger_hook` metafield, e.g. "0.5,0.03". */
export function parseHook(value: string | undefined | null) {
  const [x, y] = (value ?? "").split(",").map(Number);
  return Number.isFinite(x) && Number.isFinite(y) && x >= 0 && x <= 1 && y >= 0 && y <= 1 ? { x, y } : { x: 0.5, y: 0.02 };
}

/**
 * Map a Storefront product into the app's Product type. Products without a
 * featured image or a "Size" option are skipped (returns null), because the
 * rack needs a cut-out photo and sized variants.
 */
export function mapShopifyProduct(node: ShopifyProductNode): Product | null {
  const image = node.featuredImage;
  if (!image) return null;
  const variants = node.variants.nodes
    .map((v) => {
      const size = v.selectedOptions.find((o) => o.name.toLowerCase() === "size")?.value.toUpperCase() as Size | undefined;
      return size && SIZE_ORDER.includes(size)
        ? { id: `${node.handle}-${size.toLowerCase()}`, size, available: v.availableForSale, providerVariantId: v.id }
        : null;
    })
    .filter((v): v is NonNullable<typeof v> => v !== null)
    .sort((a, b) => SIZE_ORDER.indexOf(a.size) - SIZE_ORDER.indexOf(b.size));
  if (variants.length === 0) return null;

  const colorOption = node.options.find((o) => o.name.toLowerCase() === "color")?.optionValues[0];
  const price = node.priceRange.minVariantPrice;
  const category = node.productType || "Apparel";
  return {
    id: node.id,
    handle: node.handle,
    name: node.title,
    category,
    group: GROUPS[category.toLowerCase()] ?? "tops",
    colorName: colorOption?.name ?? "",
    swatch: colorOption?.swatch?.color ?? "#d4d4d4",
    price: { amount: Math.round(Number(price.amount) * 100), currencyCode: price.currencyCode },
    tagline: node.description.split(/(?<=\.)\s/)[0] ?? "",
    description: node.description,
    details: node.tags.filter((t) => !t.startsWith("_")),
    variants,
    media: {
      kind: "photo",
      src: image.url,
      width: image.width,
      height: image.height,
      hook: parseHook(node.hangerHook?.value),
      alt: image.altText ?? node.title,
    },
  };
}
