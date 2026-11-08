import type { Money } from "@/lib/catalog/types";

const formatters = new Map<string, Intl.NumberFormat>();

export function formatMoney(money: Money): string {
  let f = formatters.get(money.currencyCode);
  if (!f) {
    f = new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: money.currencyCode,
      minimumFractionDigits: money.amount % 100 === 0 ? 0 : 2,
      maximumFractionDigits: 2,
    });
    formatters.set(money.currencyCode, f);
  }
  return f.format(money.amount / 100);
}

export function multiplyMoney(money: Money, qty: number): Money {
  return { amount: money.amount * qty, currencyCode: money.currencyCode };
}
