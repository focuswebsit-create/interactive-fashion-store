"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, type PanInfo } from "motion/react";
import { useCart } from "@/lib/cart/cart-context";
import type { CheckoutResult, CommerceMode } from "@/lib/commerce/types";
import { formatMoney } from "@/lib/format";
import { GarmentVisual } from "@/components/garments/GarmentVisual";
import { QuantityStepper } from "@/components/ui/QuantityStepper";
import { DemoBadge } from "@/components/ui/DemoBadge";

type CheckoutState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "done"; result: Extract<CheckoutResult, { kind: "demo" }> };

export function CartDrawer({ mode }: { mode: CommerceMode }) {
  const cart = useCart();
  const { isOpen, close: closeCart } = cart;
  const panelRef = useRef<HTMLDivElement>(null);
  const restoreFocus = useRef<HTMLElement | null>(null);
  const [checkout, setCheckout] = useState<CheckoutState>({ status: "idle" });

  // Focus management + Escape + simple focus trap.
  useEffect(() => {
    if (!isOpen) return;
    restoreFocus.current = document.activeElement as HTMLElement | null;
    const t = window.setTimeout(() => panelRef.current?.querySelector<HTMLElement>("[data-autofocus]")?.focus(), 50);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        closeCart();
      }
      if (e.key === "Tab" && panelRef.current) {
        const focusables = Array.from(
          panelRef.current.querySelectorAll<HTMLElement>('button:not([disabled]), a[href], [tabindex="0"]'),
        );
        if (focusables.length === 0) return;
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    window.addEventListener("keydown", onKey, true);
    return () => {
      window.clearTimeout(t);
      window.removeEventListener("keydown", onKey, true);
      restoreFocus.current?.focus?.({ preventScroll: true });
    };
  }, [isOpen, closeCart]);

  const close = () => {
    cart.close();
    if (checkout.status !== "loading") setCheckout({ status: "idle" });
  };

  const startCheckout = async () => {
    setCheckout({ status: "loading" });
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lines: cart.lines.map(({ productId, size, quantity }) => ({ productId, size, quantity })) }),
      });
      const data = (await res.json()) as CheckoutResult | { error: string };
      if (!res.ok || "error" in data) throw new Error("error" in data ? data.error : "Checkout failed.");
      if (data.kind === "redirect") {
        window.location.assign(data.url);
        return;
      }
      setCheckout({ status: "done", result: data });
      cart.clear();
    } catch (err) {
      setCheckout({ status: "error", message: err instanceof Error ? err.message : "Checkout failed." });
    }
  };

  const onDragEnd = (_: unknown, info: PanInfo) => {
    if (info.offset.x > 120 || info.velocity.x > 600) close();
  };

  return (
    <AnimatePresence>
      {cart.isOpen && (
        <div className="fixed inset-0 z-50">
          <motion.div
            className="absolute inset-0 bg-neutral-900/20 backdrop-blur-[2px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={close}
            aria-hidden
          />
          <motion.div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="cart-title"
            className="absolute inset-y-0 right-0 flex w-full max-w-[420px] flex-col bg-white shadow-[-20px_0_60px_-30px_rgba(0,0,0,0.3)]"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 320, damping: 34 }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={{ left: 0, right: 0.6 }}
            onDragEnd={onDragEnd}
          >
            <div className="flex items-center justify-between border-b border-neutral-100 px-5 py-4">
              <div className="flex items-center gap-2">
                <h2 id="cart-title" className="text-sm font-medium">
                  Your bag {cart.count > 0 && <span className="text-neutral-500">({cart.count})</span>}
                </h2>
                {mode === "demo" && <DemoBadge />}
              </div>
              <button
                type="button"
                data-autofocus
                onClick={close}
                aria-label="Close bag"
                className="grid h-11 w-11 place-items-center rounded-full text-neutral-600 hover:bg-black/5"
              >
                <svg width="14" height="14" viewBox="0 0 12 12" aria-hidden stroke="currentColor" strokeWidth="1.3"><path d="M2 2l8 8M10 2l-8 8" /></svg>
              </button>
            </div>

            {checkout.status === "done" ? (
              <div className="flex flex-1 flex-col items-center justify-center px-8 text-center">
                <div className="grid h-12 w-12 place-items-center rounded-full bg-emerald-50 text-emerald-700">
                  <svg width="20" height="20" viewBox="0 0 20 20" aria-hidden fill="none" stroke="currentColor" strokeWidth="1.6"><path d="m5 10.5 3.2 3L15 6.5" /></svg>
                </div>
                <h3 className="mt-4 text-base font-medium">Demo checkout complete</h3>
                <p className="mt-2 text-sm text-neutral-600">{checkout.result.message}</p>
                <dl className="mt-5 w-full rounded-xl bg-neutral-50 p-4 text-left text-xs text-neutral-600">
                  <div className="flex justify-between"><dt>Reference</dt><dd className="font-mono">{checkout.result.reference}</dd></div>
                  <div className="mt-1 flex justify-between"><dt>Items</dt><dd>{checkout.result.itemCount}</dd></div>
                  <div className="mt-1 flex justify-between"><dt>Simulated total</dt><dd>{formatMoney(checkout.result.total)}</dd></div>
                </dl>
                <button type="button" onClick={close} className="mt-6 h-11 rounded-full bg-neutral-950 px-6 text-sm font-medium text-white">
                  Back to the rack
                </button>
              </div>
            ) : cart.lines.length === 0 ? (
              <div className="flex flex-1 flex-col items-center justify-center px-8 text-center">
                <p className="text-sm text-neutral-600">Your bag is empty.</p>
                <button type="button" onClick={close} className="mt-4 h-11 rounded-full px-5 text-sm font-medium ring-1 ring-neutral-200 hover:ring-neutral-400">
                  Browse the rack
                </button>
              </div>
            ) : (
              <>
                <ul className="flex-1 divide-y divide-neutral-100 overflow-y-auto px-5" aria-label="Items in your bag">
                  <AnimatePresence initial={false}>
                    {cart.lines.map((line) => (
                      <motion.li
                        key={`${line.productId}-${line.size}`}
                        layout
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="flex gap-4 py-4">
                          <div className="h-[96px] w-[64px] shrink-0 rounded-lg bg-neutral-50">
                            <GarmentVisual media={line.product.media} shadow={false} sizes="64px" />
                          </div>
                          <div className="flex min-w-0 flex-1 flex-col">
                            <div className="flex items-start justify-between gap-2">
                              <div className="min-w-0">
                                <p className="truncate text-sm font-medium">{line.product.name}</p>
                                <p className="text-xs text-neutral-500">
                                  {line.product.colorName} · Size {line.size}
                                </p>
                              </div>
                              <p className="text-sm tabular-nums">{formatMoney(line.lineTotal)}</p>
                            </div>
                            <div className="mt-auto flex items-center justify-between pt-2">
                              <QuantityStepper
                                size="sm"
                                value={line.quantity}
                                label={`Quantity for ${line.product.name}, size ${line.size}`}
                                onChange={(q) => cart.setQuantity(line.productId, line.size, q)}
                              />
                              <button
                                type="button"
                                onClick={() => cart.remove(line.productId, line.size)}
                                className="h-9 px-2 text-xs text-neutral-500 underline-offset-4 hover:text-neutral-900 hover:underline"
                                aria-label={`Remove ${line.product.name}, size ${line.size}`}
                              >
                                Remove
                              </button>
                            </div>
                          </div>
                        </div>
                      </motion.li>
                    ))}
                  </AnimatePresence>
                </ul>
                <div className="border-t border-neutral-100 px-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-4">
                  <div className="flex justify-between text-sm">
                    <span>Subtotal</span>
                    <span className="tabular-nums">{formatMoney(cart.subtotal)}</span>
                  </div>
                  <p className="mt-1 text-xs text-neutral-500">Shipping and taxes calculated at checkout.</p>
                  {checkout.status === "error" && (
                    <p role="alert" className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-xs text-red-700">
                      {checkout.message}
                    </p>
                  )}
                  <button
                    type="button"
                    onClick={startCheckout}
                    disabled={checkout.status === "loading"}
                    className="mt-4 h-12 w-full rounded-full bg-neutral-950 text-sm font-medium text-white transition hover:bg-neutral-800 disabled:opacity-60"
                  >
                    {checkout.status === "loading" ? "Processing…" : mode === "demo" ? "Checkout (demo only)" : "Checkout"}
                  </button>
                  {mode === "demo" && (
                    <p className="mt-2 text-center text-[11px] leading-snug text-amber-800">
                      Demo storefront: no payment is taken and no order is placed.
                    </p>
                  )}
                </div>
              </>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
