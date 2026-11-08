import type { Product, Size, Variant } from "./types";

/**
 * Demo catalog — 10 fictional garments for the fictional label "Rail Studio".
 * All names, copy and artwork are placeholders; swap in rights-cleared
 * product data/photography before going live.
 */

const usd = (dollars: number) => ({ amount: Math.round(dollars * 100), currencyCode: "USD" });

function variants(handle: string, sizes: Size[], soldOut: Size[] = []): Variant[] {
  return sizes.map((size) => ({
    id: `${handle}-${size.toLowerCase()}`,
    size,
    available: !soldOut.includes(size),
  }));
}

const CORE: Size[] = ["S", "M", "L", "XL"];
const EXTENDED: Size[] = ["XS", "S", "M", "L", "XL"];

export const demoProducts: Product[] = [
  {
    id: "p01",
    handle: "heavyweight-hoodie-ink",
    name: "Heavyweight Hoodie",
    category: "Hoodie",
    group: "sweats",
    colorName: "Ink Navy",
    swatch: "#1f2638",
    price: usd(96),
    tagline: "Crafted in heavyweight fleece. Cut oversized.",
    description:
      "A dense 460 gsm loopback fleece hoodie with a double-layer hood, dropped shoulders and a roomy kangaroo pocket.",
    details: ["100% organic cotton loopback", "460 gsm", "Oversized fit — size down for regular", "Machine wash cold"],
    variants: variants("heavyweight-hoodie-ink", CORE),
    media: {
      kind: "illustration",
      alt: "Navy heavyweight hoodie on a wooden hanger",
      spec: { silhouette: "hoodie", color: "#1f2638" },
    },
  },
  {
    id: "p02",
    handle: "loop-crew-fog",
    name: "Loop Crew",
    category: "Sweatshirt",
    group: "sweats",
    colorName: "Fog Grey",
    swatch: "#c9ccd1",
    price: usd(78),
    tagline: "Brushed loopback, ribbed everything.",
    description:
      "A clean crewneck sweatshirt in brushed loopback with deep rib collar, cuffs and hem. Softens with every wash.",
    details: ["100% cotton", "380 gsm", "Relaxed fit", "Garment dyed"],
    variants: variants("loop-crew-fog", EXTENDED, ["XS"]),
    media: {
      kind: "illustration",
      alt: "Light grey crewneck sweatshirt on a wooden hanger",
      spec: { silhouette: "crew", color: "#c9ccd1" },
    },
  },
  {
    id: "p03",
    handle: "zip-hoodie-graphite",
    name: "Zip Hoodie",
    category: "Hoodie",
    group: "sweats",
    colorName: "Graphite",
    swatch: "#34363a",
    price: usd(108),
    tagline: "Two-way zip. Split pockets.",
    description:
      "A heavyweight full-zip hoodie with a two-way metal zipper, lined hood and split front pockets.",
    details: ["100% organic cotton", "440 gsm", "Regular fit", "Two-way metal zip"],
    variants: variants("zip-hoodie-graphite", CORE, ["XL"]),
    media: {
      kind: "illustration",
      alt: "Graphite zip hoodie on a wooden hanger",
      spec: { silhouette: "zip-hoodie", color: "#34363a", trim: "#9a9ca0" },
    },
  },
  {
    id: "p04",
    handle: "long-sleeve-tee-bone",
    name: "Long Sleeve Tee",
    category: "T-shirt",
    group: "tops",
    colorName: "Bone",
    swatch: "#ece3cf",
    price: usd(46),
    tagline: "Compact jersey, long and lean.",
    description: "A midweight long sleeve tee in compact ring-spun jersey with a narrow rib collar.",
    details: ["100% cotton jersey", "220 gsm", "Regular fit", "Pre-shrunk"],
    variants: variants("long-sleeve-tee-bone", EXTENDED),
    media: {
      kind: "illustration",
      alt: "Bone coloured long sleeve t-shirt on a wooden hanger",
      spec: { silhouette: "longsleeve", color: "#ece3cf" },
    },
  },
  {
    id: "p05",
    handle: "heavyweight-hoodie-pine",
    name: "Heavyweight Hoodie",
    category: "Hoodie",
    group: "sweats",
    colorName: "Pine",
    swatch: "#2f6b45",
    price: usd(96),
    tagline: "Crafted in heavyweight fleece. Made to last.",
    description:
      "Our 460 gsm hoodie in a deep pine green. Double-layer hood, flat drawcords and a roomy kangaroo pocket.",
    details: ["100% organic cotton loopback", "460 gsm", "Oversized fit", "Machine wash cold"],
    variants: variants("heavyweight-hoodie-pine", CORE, ["S"]),
    media: {
      kind: "illustration",
      alt: "Pine green heavyweight hoodie on a wooden hanger",
      spec: { silhouette: "hoodie", color: "#2f6b45", trim: "#e9efe9" },
    },
  },
  {
    id: "p06",
    handle: "everyday-tee-black",
    name: "Everyday Tee",
    category: "T-shirt",
    group: "tops",
    colorName: "Black",
    swatch: "#1b1b1c",
    price: usd(38),
    tagline: "The one you reach for first.",
    description:
      "A boxy heavyweight tee with a dense rib collar and a small tonal chest mark. Holds its shape wash after wash.",
    details: ["100% cotton jersey", "240 gsm", "Boxy fit", "Tonal embroidery"],
    variants: variants("everyday-tee-black", EXTENDED),
    media: {
      kind: "illustration",
      alt: "Black t-shirt with a small chest mark on a wooden hanger",
      spec: { silhouette: "tee", color: "#1b1b1c", mark: "#f1ece6" },
    },
  },
  {
    id: "p07",
    handle: "merino-knit-oat",
    name: "Merino Knit",
    category: "Knitwear",
    group: "tops",
    colorName: "Oat",
    swatch: "#d8c7a8",
    price: usd(124),
    tagline: "Fine-gauge merino, fully fashioned.",
    description: "A soft fine-gauge merino crewneck, fully fashioned with ribbed collar, cuffs and hem.",
    details: ["100% extra-fine merino", "12 gauge", "Regular fit", "Hand wash or wool cycle"],
    variants: variants("merino-knit-oat", CORE),
    media: {
      kind: "illustration",
      alt: "Oat coloured merino knit sweater on a wooden hanger",
      spec: { silhouette: "knit", color: "#d8c7a8" },
    },
  },
  {
    id: "p08",
    handle: "work-overshirt-olive",
    name: "Work Overshirt",
    category: "Overshirt",
    group: "shirts",
    colorName: "Olive",
    swatch: "#5f6446",
    price: usd(118),
    tagline: "Brushed twill with flap pockets.",
    description:
      "A sturdy brushed cotton twill overshirt with twin flap pockets, horn-effect buttons and a boxy cut for layering.",
    details: ["100% cotton twill", "Boxy fit", "Corozo-look buttons", "Machine wash 30°"],
    variants: variants("work-overshirt-olive", CORE),
    media: {
      kind: "illustration",
      alt: "Olive work overshirt on a wooden hanger",
      spec: { silhouette: "overshirt", color: "#5f6446", trim: "#2e2a22" },
    },
  },
  {
    id: "p09",
    handle: "oxford-shirt-sky",
    name: "Oxford Shirt",
    category: "Shirt",
    group: "shirts",
    colorName: "Sky",
    swatch: "#bcd0e4",
    price: usd(84),
    tagline: "Soft oxford cloth, button-down collar.",
    description: "A classic oxford cloth shirt with a button-down collar, single chest pocket and curved hem.",
    details: ["100% cotton oxford", "Regular fit", "Mother-of-pearl effect buttons", "Machine wash 30°"],
    variants: variants("oxford-shirt-sky", EXTENDED, ["XL"]),
    media: {
      kind: "illustration",
      alt: "Light blue oxford shirt on a wooden hanger",
      spec: { silhouette: "shirt", color: "#bcd0e4", trim: "#f4f4f2" },
    },
  },
  {
    id: "p10",
    handle: "coach-jacket-carbon",
    name: "Coach Jacket",
    category: "Jacket",
    group: "outerwear",
    colorName: "Carbon",
    swatch: "#26282c",
    price: usd(148),
    tagline: "Water-resistant shell, snap front.",
    description:
      "A lightweight water-resistant coach jacket with a snap front, mesh lining and drawcord hem.",
    details: ["100% recycled nylon shell", "Mesh lined", "Relaxed fit", "DWR finish"],
    variants: variants("coach-jacket-carbon", CORE),
    media: {
      kind: "illustration",
      alt: "Carbon black coach jacket on a wooden hanger",
      spec: { silhouette: "jacket", color: "#26282c", trim: "#c8c9cc" },
    },
  },
];
