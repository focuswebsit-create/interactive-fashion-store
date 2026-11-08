/**
 * Catalog domain types. These are provider-agnostic: the demo catalog and the
 * (future) Shopify adapter both map into these shapes, so UI components never
 * depend on a specific commerce backend.
 */

export type Size = "XS" | "S" | "M" | "L" | "XL" | "XXL";

export type Money = {
  /** Amount in minor units (cents) to avoid floating point drift. */
  amount: number;
  currencyCode: string;
};

export type Variant = {
  /** Stable local id, e.g. `everyday-tee-m`. */
  id: string;
  size: Size;
  available: boolean;
  /**
   * Shopify ProductVariant GID (gid://shopify/ProductVariant/123). Only set
   * when the product is sourced from / mapped to Shopify.
   */
  providerVariantId?: string;
};

export type Silhouette =
  | "tee"
  | "longsleeve"
  | "crew"
  | "knit"
  | "hoodie"
  | "zip-hoodie"
  | "shirt"
  | "overshirt"
  | "jacket";

/** Parameters for the built-in vector garment illustrations. */
export type IllustrationSpec = {
  silhouette: Silhouette;
  /** Main fabric colour (hex). */
  color: string;
  /** Trim colour for rib, buttons, drawcords etc. Defaults to a shade of `color`. */
  trim?: string;
  /** Optional small chest print / embroidery mark colour. */
  mark?: string;
  /** Relative body length, 0.9–1.1. */
  length?: number;
};

/**
 * Product media. `illustration` is the placeholder used by the demo.
 * `photo` is for rights-cleared cut-out photography: provide the pixel size
 * and the position of the hanger hook (as fractions of width/height) so the
 * garment can be hung precisely on the rail.
 */
export type ProductMedia =
  | { kind: "illustration"; spec: IllustrationSpec; alt: string }
  | {
      kind: "photo";
      src: string;
      width: number;
      height: number;
      /** Hook apex position, as a fraction of the image box (0–1). */
      hook: { x: number; y: number };
      alt: string;
    };

export type Product = {
  id: string;
  handle: string;
  name: string;
  /** Short category label shown above the name, e.g. "T-shirt". */
  category: string;
  /** Navigation group used by the header filter. */
  group: "tops" | "sweats" | "shirts" | "outerwear";
  colorName: string;
  /** Swatch colour for UI chips. */
  swatch: string;
  price: Money;
  /** One-line rack/tag copy. */
  tagline: string;
  description: string;
  details: string[];
  variants: Variant[];
  media: ProductMedia;
};

export const SIZE_ORDER: Size[] = ["XS", "S", "M", "L", "XL", "XXL"];
