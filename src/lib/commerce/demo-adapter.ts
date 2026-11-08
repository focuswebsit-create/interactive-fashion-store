import { demoProducts } from "@/lib/catalog/products";
import { CheckoutError, type CommerceAdapter } from "./types";

/**
 * Local-only adapter. `createCheckout` validates and prices the bag on the
 * server, then returns a DEMO reference. No payment is taken, no order is
 * created, nothing leaves this server.
 */
export const demoAdapter: CommerceAdapter = {
  mode: "demo",
  async listProducts() {
    return demoProducts;
  },
  async getProduct(handle) {
    return demoProducts.find((p) => p.handle === handle) ?? null;
  },
  async createCheckout(lines) {
    if (lines.length === 0) throw new CheckoutError("Your bag is empty.");
    let amount = 0;
    let itemCount = 0;
    for (const line of lines) {
      const product = demoProducts.find((p) => p.id === line.productId);
      const variant = product?.variants.find((v) => v.size === line.size);
      if (!product || !variant) throw new CheckoutError("An item in your bag is no longer available.");
      if (!variant.available) throw new CheckoutError(`${product.name} in ${line.size} is sold out.`);
      amount += product.price.amount * line.quantity;
      itemCount += line.quantity;
    }
    const reference = `DEMO-${Date.now().toString(36).toUpperCase().slice(-6)}`;
    return {
      kind: "demo",
      reference,
      itemCount,
      total: { amount, currencyCode: "USD" },
      message: "Demo checkout only — no payment was taken and no order was placed.",
    };
  },
};
