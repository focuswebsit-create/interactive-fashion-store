"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useMotionValueEvent, useScroll, useSpring, useTransform, useVelocity } from "motion/react";
import type { Product } from "@/lib/catalog/types";
import { RackItem } from "./RackItem";
import { RACK_SCROLL_KEY } from "./constants";
import { useRackScroll } from "./useRackScroll";

type Props = {
  products: Product[];
  selectedHandle: string | null;
  returningHandle: string | null;
  receded: boolean;
  /** Centre this handle on first mount (deep link to a product). */
  initialFocusHandle: string | null;
  onSelect: (product: Product) => void;
  onFocusItem: (product: Product | null) => void;
};

export function Rack({ products, selectedHandle, returningHandle, receded, initialFocusHandle, onSelect, onFocusItem }: Props) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  useRackScroll(scrollerRef, !receded);

  // Restore the previous scroll position (or centre a deep-linked garment).
  useLayoutEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;
    if (initialFocusHandle) {
      const item = el.querySelector<HTMLElement>(`[data-rack-handle="${initialFocusHandle}"]`)?.closest("li");
      if (item) el.scrollLeft = item.offsetLeft + item.offsetWidth / 2 - el.clientWidth / 2;
      return;
    }
    try {
      const saved = Number(sessionStorage.getItem(RACK_SCROLL_KEY));
      if (saved > 0) el.scrollLeft = saved;
    } catch {
      /* ignore */
    }
    // Only on mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Garments sway on their hooks in response to rail velocity.
  const { scrollX, scrollXProgress } = useScroll({ container: scrollerRef });
  const velocity = useVelocity(scrollX);
  const swayTarget = useTransform(velocity, (v) => Math.max(-7, Math.min(7, -v / 260)));
  const sway = useSpring(swayTarget, { stiffness: 90, damping: 9, mass: 0.9 });

  // Progress indicator + persistence.
  const [thumb, setThumb] = useState(0.3);
  const [edges, setEdges] = useState({ start: true, end: false });
  const measure = useCallback(() => {
    const el = scrollerRef.current;
    if (!el) return;
    setThumb(Math.min(1, el.clientWidth / Math.max(1, el.scrollWidth)));
    setEdges({ start: el.scrollLeft < 4, end: el.scrollLeft > el.scrollWidth - el.clientWidth - 4 });
  }, []);
  useEffect(() => {
    measure();
    const ro = new ResizeObserver(measure);
    if (scrollerRef.current) ro.observe(scrollerRef.current);
    return () => ro.disconnect();
  }, [measure, products.length]);
  const saveTimer = useRef<number | undefined>(undefined);
  useMotionValueEvent(scrollX, "change", (x) => {
    measure();
    window.clearTimeout(saveTimer.current);
    saveTimer.current = window.setTimeout(() => {
      try {
        sessionStorage.setItem(RACK_SCROLL_KEY, String(Math.round(x)));
      } catch {
        /* ignore */
      }
    }, 150);
  });
  const thumbX = useTransform(scrollXProgress, (p) => `${p * (1 - thumb) * 100}%`);

  const page = (dir: 1 | -1) => {
    const el = scrollerRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * el.clientWidth * 0.6, behavior: "smooth" });
  };

  // Roving arrow-key navigation between garments.
  const onKeyDown = (e: React.KeyboardEvent<HTMLUListElement>) => {
    if (e.key !== "ArrowRight" && e.key !== "ArrowLeft" && e.key !== "Home" && e.key !== "End") return;
    const buttons = Array.from(e.currentTarget.querySelectorAll<HTMLButtonElement>("button[data-rack-handle]"));
    const i = buttons.indexOf(document.activeElement as HTMLButtonElement);
    if (i === -1) return;
    e.preventDefault();
    const next =
      e.key === "Home" ? 0 : e.key === "End" ? buttons.length - 1 : Math.max(0, Math.min(buttons.length - 1, i + (e.key === "ArrowRight" ? 1 : -1)));
    buttons[next].focus({ preventScroll: true });
    buttons[next].closest("li")?.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
  };

  const selectedIndex = products.findIndex((p) => p.handle === (selectedHandle ?? returningHandle));

  return (
    <section aria-label="Clothing rack" className="absolute inset-0">
      {/* The rail is fixed; hangers slide along it. */}
      <motion.div
        aria-hidden
        className="rail pointer-events-none absolute inset-x-0"
        style={{ top: "calc(var(--rack-top) + var(--rail-y) - 1.5px)" }}
        initial={false}
        animate={{ opacity: receded ? 0 : 1 }}
        transition={{ duration: 0.4, delay: receded ? 0.1 : 0.25 }}
      />

      <motion.div
        ref={scrollerRef}
        layoutScroll
        className="rack-scroller absolute inset-0 overflow-x-auto overflow-y-hidden"
        style={{ paddingTop: "var(--rack-top)" }}
      >
        <ul
          className="flex w-max min-w-full items-start justify-center"
          style={{ paddingInline: "var(--rack-pad)" }}
          onKeyDown={onKeyDown}
        >
          <AnimatePresence mode="popLayout" initial={false}>
            {products.map((product, index) => (
              <RackItem
                key={product.id}
                product={product}
                index={index}
                distance={selectedIndex === -1 ? 0 : Math.abs(index - selectedIndex)}
                isSelected={product.handle === selectedHandle}
                returning={product.handle === returningHandle}
                receded={receded}
                sway={sway}
                onSelect={onSelect}
                onFocusItem={onFocusItem}
              />
            ))}
          </AnimatePresence>
        </ul>
      </motion.div>

      {/* Bottom controls */}
      <motion.div
        className="pointer-events-none absolute inset-x-0 bottom-[max(1.25rem,env(safe-area-inset-bottom))] flex items-center justify-between px-4 sm:px-8"
        initial={false}
        animate={{ opacity: receded ? 0 : 1 }}
        transition={{ duration: 0.3 }}
      >
        <div className="pointer-events-auto flex items-center gap-1">
          <button
            type="button"
            onClick={() => page(-1)}
            disabled={edges.start}
            aria-label="Scroll rack left"
            className="grid h-11 w-11 place-items-center rounded-full text-neutral-600 transition hover:bg-black/5 disabled:opacity-30"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M10 3 5 8l5 5" /></svg>
          </button>
          <button
            type="button"
            onClick={() => page(1)}
            disabled={edges.end}
            aria-label="Scroll rack right"
            className="grid h-11 w-11 place-items-center rounded-full text-neutral-600 transition hover:bg-black/5 disabled:opacity-30"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden fill="none" stroke="currentColor" strokeWidth="1.5"><path d="m6 3 5 5-5 5" /></svg>
          </button>
          <span className="ml-2 hidden text-[11px] tracking-wide text-neutral-500 md:inline">Drag or scroll to browse</span>
        </div>
        <div aria-hidden className="absolute left-1/2 h-px w-24 -translate-x-1/2 bg-neutral-300/80 sm:w-32">
          <motion.div className="absolute inset-y-[-0.5px] bg-neutral-800" style={{ width: `${thumb * 100}%`, left: thumbX }} />
        </div>
        <div className="w-11" />
      </motion.div>
    </section>
  );
}
