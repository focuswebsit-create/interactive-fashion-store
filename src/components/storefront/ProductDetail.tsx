"use client";

import { useEffect, useId, useRef, useState } from "react";
import { motion, type PanInfo } from "motion/react";
import type { Product, Size } from "@/lib/catalog/types";
import { formatMoney } from "@/lib/format";
import { useCart } from "@/lib/cart/cart-context";
import { GarmentVisual, HOOK_FRACTION } from "@/components/garments/GarmentVisual";
import { QuantityStepper } from "@/components/ui/QuantityStepper";
import { EASE_OUT, RACK_TURN, SPRING_LAYOUT, garmentLayoutId } from "./constants";

type Props = {
  product: Product;
  /** Animate the garment in from the rack (false on a cold deep-link load). */
  fromRack: boolean;
  onClose: () => void;
};

const reveal = {
  hidden: { opacity: 0, y: 14 },
  show: (i: number) => ({ opacity: 1, y: 0, transition: { delay: 0.28 + i * 0.06, duration: 0.5, ease: EASE_OUT } }),
  exit: { opacity: 0, y: 8, transition: { duration: 0.18 } },
};

export function ProductDetail({ product, fromRack, onClose }: Props) {
  const cart = useCart();
  const headingRef = useRef<HTMLHeadingElement>(null);
  const firstAvailable = product.variants.find((v) => v.available)?.size ?? null;
  const [size, setSize] = useState<Size | null>(firstAvailable);
  const [quantity, setQuantity] = useState(1);
  const [tab, setTab] = useState<"size" | "details">("size");
  const [added, setAdded] = useState(false);
  const ids = useId();
  const transformOrigin = `${HOOK_FRACTION.x * 100}% ${HOOK_FRACTION.y * 100}%`;

  useEffect(() => {
    const t = window.setTimeout(() => headingRef.current?.focus({ preventScroll: true }), 350);
    return () => window.clearTimeout(t);
  }, []);

  useEffect(() => {
    if (!added) return;
    const t = window.setTimeout(() => setAdded(false), 2200);
    return () => window.clearTimeout(t);
  }, [added]);

  const addToCart = () => {
    if (!size) return;
    cart.add(product.id, size, quantity);
    setAdded(true);
  };

  // Mobile: pull the garment down (from the top of the sheet) to return to
  // the rack. When the sheet is scrolled, the same gesture scrolls it instead.
  const dialogRef = useRef<HTMLDivElement>(null);
  const panFromTop = useRef(false);
  const onPanStart = () => {
    panFromTop.current = (dialogRef.current?.scrollTop ?? 0) <= 0;
  };
  const onPan = (_: PointerEvent, info: PanInfo) => {
    if (!panFromTop.current && dialogRef.current) dialogRef.current.scrollTop -= info.delta.y;
  };
  const onPanEnd = (_: PointerEvent, info: PanInfo) => {
    if (!panFromTop.current) return;
    if (info.offset.y > 110 || (info.offset.y > 40 && info.velocity.y > 500)) onClose();
  };

  const tabs = [
    { id: "size", label: "Size" },
    { id: "details", label: "Details" },
  ] as const;

  return (
    <motion.div
      role="dialog"
      aria-modal="true"
      aria-labelledby={`${ids}-title`}
      ref={dialogRef}
      className="fixed inset-0 z-30 overflow-y-auto overscroll-contain md:overflow-hidden"
      initial="hidden"
      animate="show"
      exit="exit"
    >
      <motion.div
        aria-hidden
        className="fixed inset-0 bg-[var(--detail-bg)]"
        variants={{ hidden: { opacity: 0 }, show: { opacity: 1, transition: { duration: 0.5 } }, exit: { opacity: 0, transition: { duration: 0.45, delay: 0.05 } } }}
      />

      <motion.button
        type="button"
        onClick={onClose}
        custom={0}
        variants={reveal}
        className="fixed right-3 top-3 z-20 flex h-11 items-center gap-2 rounded-full border border-neutral-200 bg-white/80 px-4 text-xs font-medium text-neutral-700 backdrop-blur transition hover:border-neutral-300 hover:text-black sm:right-6 sm:top-5"
      >
        Close
        <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden stroke="currentColor" strokeWidth="1.4"><path d="M2 2l8 8M10 2l-8 8" /></svg>
      </motion.button>

      <div className="relative grid min-h-full grid-rows-[auto_1fr] md:h-full md:grid-cols-[1.2fr_1fr] md:grid-rows-1">
        {/* Garment column */}
        <motion.div
          className="relative flex touch-pan-x justify-center pt-[7svh] md:items-start md:justify-end md:pr-[4vw] md:pt-[9svh]"
          onPanStart={onPanStart}
          onPan={onPan}
          onPanEnd={onPanEnd}
        >
          <div className="relative aspect-[2/3] h-[52svh] md:h-[min(84svh,880px)]">
            {/* The cord the hanger hangs from */}
            <motion.span
              aria-hidden
              className="absolute left-1/2 w-px -translate-x-1/2 bg-gradient-to-b from-neutral-300/0 via-neutral-400/70 to-neutral-500"
              style={{ top: "-100svh", height: `calc(100svh + ${HOOK_FRACTION.y * 100}% + 2px)` }}
              variants={{
                hidden: { opacity: 0, scaleY: 0, originY: 0 },
                show: { opacity: 1, scaleY: 1, transition: { delay: 0.35, duration: 0.5, ease: EASE_OUT } },
                exit: { opacity: 0, transition: { duration: 0.12 } },
              }}
            />
            <motion.div
              layoutId={garmentLayoutId(product.id)}
              layoutCrossfade={false}
              transition={SPRING_LAYOUT}
              className="absolute inset-0 z-10"
              initial={fromRack ? undefined : { opacity: 0, y: 24 }}
              animate={fromRack ? undefined : { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE_OUT } }}
              // On close the rack copy takes over the flight; hide this one at once.
              exit={{ opacity: 0, transition: { duration: 0 } }}
            >
              <motion.div
                className="h-full w-full"
                style={{ transformOrigin, transformPerspective: 1100 }}
                initial={fromRack ? { rotateY: RACK_TURN } : false}
                animate={{ rotateY: 0 }}
                transition={{ ...SPRING_LAYOUT, delay: 0.04 }}
              >
                <GarmentVisual media={product.media} labelled sizes="(max-width: 768px) 70vw, 45vw" priority />
              </motion.div>
            </motion.div>
          </div>
        </motion.div>

        {/* Details column */}
        <div className="relative -mt-[7svh] flex flex-col justify-start px-6 pb-16 md:mt-0 md:justify-center md:pb-0 md:pl-[2vw] md:pr-10 md:pt-0">
          <div className="w-full max-w-[330px] max-md:mx-auto">
            <motion.p custom={0} variants={reveal} className="text-[11px] uppercase tracking-[0.18em] text-neutral-500">
              {product.category}
            </motion.p>
            <motion.h1
              ref={headingRef}
              tabIndex={-1}
              id={`${ids}-title`}
              custom={1}
              variants={reveal}
              className="mt-2 text-lg font-medium tracking-tight text-neutral-900 outline-none"
            >
              {product.name}
            </motion.h1>
            <motion.p custom={1} variants={reveal} className="mt-0.5 text-sm text-neutral-600">
              {formatMoney(product.price)}
              <span className="mx-2 text-neutral-300">·</span>
              <span className="inline-flex items-center gap-1.5">
                <span className="inline-block h-2.5 w-2.5 rounded-full ring-1 ring-black/10" style={{ background: product.swatch }} />
                {product.colorName}
              </span>
            </motion.p>

            <motion.div custom={2} variants={reveal} className="mt-6">
              <div role="tablist" aria-label="Product information" className="flex gap-5 border-b border-neutral-200 text-xs">
                {tabs.map((t) => (
                  <button
                    key={t.id}
                    role="tab"
                    type="button"
                    id={`${ids}-tab-${t.id}`}
                    aria-selected={tab === t.id}
                    aria-controls={`${ids}-panel-${t.id}`}
                    tabIndex={tab === t.id ? 0 : -1}
                    onClick={() => setTab(t.id)}
                    onKeyDown={(e) => {
                      if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
                        const next = tab === "size" ? "details" : "size";
                        setTab(next);
                        document.getElementById(`${ids}-tab-${next}`)?.focus();
                      }
                    }}
                    className={`relative -mb-px py-2.5 transition-colors ${tab === t.id ? "text-neutral-900" : "text-neutral-500 hover:text-neutral-800"}`}
                  >
                    {t.label}
                    {tab === t.id && <motion.span layoutId={`${ids}-tab-underline`} className="absolute inset-x-0 bottom-0 h-px bg-neutral-900" />}
                  </button>
                ))}
              </div>

              <div
                role="tabpanel"
                id={`${ids}-panel-size`}
                aria-labelledby={`${ids}-tab-size`}
                hidden={tab !== "size"}
                className="pt-4"
              >
                <fieldset>
                  <legend className="sr-only">Choose a size</legend>
                  <div className="flex flex-wrap gap-2">
                    {product.variants.map((v) => (
                      <label key={v.id} className={`relative ${v.available ? "cursor-pointer" : "cursor-not-allowed"}`}>
                        <input
                          type="radio"
                          name={`${ids}-size`}
                          value={v.size}
                          checked={size === v.size}
                          disabled={!v.available}
                          onChange={() => setSize(v.size)}
                          className="peer sr-only"
                        />
                        <span
                          className={`grid h-11 min-w-11 place-items-center rounded-full px-3 text-xs font-medium transition peer-focus-visible:ring-2 peer-focus-visible:ring-neutral-900 peer-focus-visible:ring-offset-2 ${
                            size === v.size
                              ? "bg-neutral-900 text-white"
                              : v.available
                                ? "bg-white text-neutral-800 ring-1 ring-neutral-200 hover:ring-neutral-400"
                                : "bg-transparent text-neutral-400 line-through ring-1 ring-neutral-100"
                          }`}
                        >
                          {v.size}
                          {!v.available && <span className="sr-only"> (sold out)</span>}
                        </span>
                      </label>
                    ))}
                  </div>
                </fieldset>
                <div className="mt-4 flex items-center justify-between">
                  <span className="text-xs text-neutral-500" id={`${ids}-qty-label`}>
                    Quantity
                  </span>
                  <QuantityStepper value={quantity} onChange={setQuantity} labelledBy={`${ids}-qty-label`} />
                </div>
              </div>

              <div
                role="tabpanel"
                id={`${ids}-panel-details`}
                aria-labelledby={`${ids}-tab-details`}
                hidden={tab !== "details"}
                className="pt-4 text-sm leading-relaxed text-neutral-600"
              >
                <p>{product.description}</p>
                <ul className="mt-3 space-y-1 text-xs text-neutral-500">
                  {product.details.map((d) => (
                    <li key={d}>— {d}</li>
                  ))}
                </ul>
              </div>
            </motion.div>

            <motion.div custom={3} variants={reveal} className="mt-6">
              <button
                type="button"
                onClick={addToCart}
                disabled={!size}
                className="h-12 w-full rounded-full bg-neutral-950 text-sm font-medium text-white transition hover:bg-neutral-800 active:scale-[0.99] disabled:cursor-not-allowed disabled:bg-neutral-300"
              >
                {!size ? "Sold out" : added ? "Added to bag ✓" : "Add to bag"}
              </button>
              <p role="status" aria-live="polite" className="mt-3 min-h-5 text-center text-xs text-neutral-500">
                {added ? (
                  <>
                    Added {quantity} × {product.name} ({size}).{" "}
                    <button type="button" onClick={cart.open} className="font-medium text-neutral-900 underline underline-offset-2">
                      View bag
                    </button>
                  </>
                ) : (
                  <span className="text-neutral-400">Demo store — checkout is simulated.</span>
                )}
              </p>
            </motion.div>

            <motion.div custom={4} variants={reveal} className="mt-6 flex items-center justify-between text-xs text-neutral-500">
              <span>{product.tagline}</span>
              <button
                type="button"
                onClick={() => setTab("details")}
                className="shrink-0 pl-4 text-neutral-700 underline-offset-4 hover:underline"
              >
                Product details
              </button>
            </motion.div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
