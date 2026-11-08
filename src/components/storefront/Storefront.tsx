"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, LayoutGroup, MotionConfig, motion } from "motion/react";
import type { Product } from "@/lib/catalog/types";
import type { CommerceMode } from "@/lib/commerce/types";
import { CartProvider, useCart } from "@/lib/cart/cart-context";
import { formatMoney } from "@/lib/format";
import { CartDrawer } from "@/components/cart/CartDrawer";
import { Header, type RackFilter } from "./Header";
import { PastelBackdrop } from "./PastelBackdrop";
import { ProductDetail } from "./ProductDetail";
import { Rack } from "./Rack";

type Props = {
  products: Product[];
  /** Product handle from the URL (`/product/[handle]`), or null for the rack. */
  initialHandle: string | null;
  mode: CommerceMode;
  siteName: string;
};

export function Storefront(props: Props) {
  return (
    <CartProvider products={props.products}>
      <MotionConfig reducedMotion="user">
        <LayoutGroup>
          <Shell {...props} />
        </LayoutGroup>
      </MotionConfig>
    </CartProvider>
  );
}

const handleFromPath = (path: string) => path.match(/^\/product\/([^/?#]+)/)?.[1] ?? null;

function Shell({ products, initialHandle, mode, siteName }: Props) {
  const cart = useCart();
  const [selectedHandle, setSelectedHandle] = useState<string | null>(initialHandle);
  const [returningHandle, setReturningHandle] = useState<string | null>(null);
  const [fromRack, setFromRack] = useState(false);
  const [filter, setFilter] = useState<RackFilter>("all");
  const [focused, setFocused] = useState<Product | null>(null);
  /** True when the open detail view was pushed onto history by us. */
  const pushedRef = useRef(false);

  const selected = useMemo(() => products.find((p) => p.handle === selectedHandle) ?? null, [products, selectedHandle]);
  const visible = useMemo(
    () => (filter === "all" ? products : products.filter((p) => p.group === filter || p.handle === selectedHandle)),
    [products, filter, selectedHandle],
  );

  const restoreFocusTo = (handle: string) => {
    // Wait for the rack button to be interactive again.
    window.setTimeout(() => {
      document.querySelector<HTMLElement>(`[data-rack-handle="${handle}"]`)?.focus({ preventScroll: true });
    }, 60);
  };

  const open = useCallback((product: Product) => {
    setReturningHandle(null);
    setFromRack(true);
    setSelectedHandle(product.handle);
    window.history.pushState(null, "", `/product/${product.handle}`);
    pushedRef.current = true;
  }, []);

  const close = useCallback(() => {
    if (!selectedHandle) return;
    if (pushedRef.current) {
      // Pop our own history entry so Back/Forward stay consistent; the
      // popstate handler below performs the actual state change.
      window.history.back();
      return;
    }
    // Cold deep link: there is no rack entry behind us, so replace it.
    window.history.replaceState(null, "", "/");
    setReturningHandle(selectedHandle);
    setSelectedHandle(null);
    restoreFocusTo(selectedHandle);
  }, [selectedHandle]);

  // Browser Back/Forward.
  const selectedRef = useRef(selectedHandle);
  useEffect(() => {
    selectedRef.current = selectedHandle;
  }, [selectedHandle]);
  useEffect(() => {
    const onPop = () => {
      const handle = handleFromPath(window.location.pathname);
      const valid = handle && products.some((p) => p.handle === handle) ? handle : null;
      const prev = selectedRef.current;
      if (prev === valid) return;
      if (prev && !valid) {
        setReturningHandle(prev);
        pushedRef.current = false;
        restoreFocusTo(prev);
      }
      if (valid) {
        setReturningHandle(null);
        setFromRack(true);
        pushedRef.current = true;
      }
      setSelectedHandle(valid);
    };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, [products]);

  // Escape closes the detail view (the cart drawer handles its own Escape).
  useEffect(() => {
    if (!selectedHandle) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !cart.isOpen) close();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [selectedHandle, close, cart.isOpen]);

  // Keep the tab title in sync with the shallow route.
  useEffect(() => {
    document.title = selected ? `${selected.name} — ${selected.colorName} · ${siteName}` : `${siteName} — The Rack`;
  }, [selected, siteName]);

  // Clear the "returning" marker once the fly-back has finished.
  useEffect(() => {
    if (!returningHandle) return;
    const t = window.setTimeout(() => setReturningHandle(null), 900);
    return () => window.clearTimeout(t);
  }, [returningHandle]);

  const detailOpen = selected !== null;
  const info = focused ?? null;

  return (
    <div className="relative flex h-svh min-h-[520px] flex-col overflow-hidden">
      <PastelBackdrop dimmed={detailOpen} />

      <div inert={detailOpen || cart.isOpen} className="relative flex flex-1 flex-col">
        <Header hidden={detailOpen} filter={filter} onFilter={setFilter} mode={mode} />

        <motion.p
          className="relative z-10 mt-6 text-center text-[10px] uppercase tracking-[0.28em] text-neutral-500 md:mt-8"
          initial={false}
          animate={{ opacity: detailOpen ? 0 : 1 }}
        >
          New collection <span className="mx-2 text-neutral-300">—</span> Autumn rack
        </motion.p>

        <main className="relative flex-1">
          <h1 className="sr-only">Rail Studio — browse the rack</h1>
          <Rack
            products={visible}
            selectedHandle={selectedHandle}
            returningHandle={returningHandle}
            receded={detailOpen}
            initialFocusHandle={initialHandle}
            onSelect={open}
            onFocusItem={setFocused}
          />

          {/* Contextual copy, bottom right (like a shop window card). */}
          <motion.div
            aria-live="polite"
            className="pointer-events-none absolute bottom-[max(1.4rem,env(safe-area-inset-bottom))] right-4 hidden max-w-[260px] text-right text-[11px] leading-snug text-neutral-600 sm:right-8 md:block"
            initial={false}
            animate={{ opacity: detailOpen ? 0 : 1 }}
          >
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={info?.id ?? "default"}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.18 }}
              >
                {info ? (
                  <>
                    <p className="font-medium text-neutral-900">
                      {info.name} <span className="font-normal text-neutral-500">— {formatMoney(info.price)}</span>
                    </p>
                    <p>{info.tagline}</p>
                  </>
                ) : (
                  <>
                    <p>Heavyweight basics, cut to last.</p>
                    <p className="text-neutral-400">Select a piece to see it up close.</p>
                  </>
                )}
              </motion.div>
            </AnimatePresence>
          </motion.div>
        </main>
      </div>

      <div inert={cart.isOpen}>
        <AnimatePresence>
          {selected && <ProductDetail key={selected.id} product={selected} fromRack={fromRack} onClose={close} />}
        </AnimatePresence>
      </div>

      <CartDrawer mode={mode} />
    </div>
  );
}
