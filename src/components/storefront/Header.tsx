"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { useCart } from "@/lib/cart/cart-context";
import type { CommerceMode } from "@/lib/commerce/types";
import { DemoBadge } from "@/components/ui/DemoBadge";

export type RackFilter = "all" | "tops" | "sweats" | "shirts" | "outerwear";
export const FILTERS: { id: RackFilter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "tops", label: "Tops" },
  { id: "sweats", label: "Sweats" },
  { id: "shirts", label: "Shirts" },
  { id: "outerwear", label: "Outerwear" },
];

type Props = {
  hidden: boolean;
  filter: RackFilter;
  onFilter: (f: RackFilter) => void;
  mode: CommerceMode;
};

export function Header({ hidden, filter, onFilter, mode }: Props) {
  const cart = useCart();
  return (
    <motion.header
      className="relative z-20 px-4 pt-[max(0.9rem,env(safe-area-inset-top))] sm:px-8"
      initial={false}
      animate={{ opacity: hidden ? 0 : 1, y: hidden ? -8 : 0 }}
      transition={{ duration: 0.35 }}
    >
      <div className="grid grid-cols-[1fr_auto] items-center gap-4 md:grid-cols-[1fr_auto_1fr]">
        <Link href="/" className="flex items-center gap-2 text-[13px] font-semibold tracking-[0.22em] text-neutral-900" aria-label="Rail Studio — home">
          <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden fill="none" stroke="currentColor" strokeWidth="1.4">
            <path d="M1 4h16" />
            <path d="M9 4v2.5c0 1 1.5 1 1.5 2S9 10 9 10l-6 4h12l-6-4" strokeLinejoin="round" />
          </svg>
          RAIL STUDIO
        </Link>
        <nav aria-label="Filter the rack" className="order-3 col-span-2 -mx-4 overflow-x-auto px-4 md:order-none md:col-span-1 md:mx-0 md:px-0">
          <ul className="flex justify-center gap-1 text-[11px] tracking-wide">
            {FILTERS.map((f) => (
              <li key={f.id}>
                <button
                  type="button"
                  aria-pressed={filter === f.id}
                  onClick={() => onFilter(f.id)}
                  className={`relative h-9 rounded-full px-3 transition-colors ${filter === f.id ? "text-neutral-950" : "text-neutral-500 hover:text-neutral-900"}`}
                >
                  {filter === f.id && (
                    <motion.span layoutId="filter-pill" className="absolute inset-0 rounded-full bg-black/[0.05]" transition={{ type: "spring", stiffness: 300, damping: 30 }} />
                  )}
                  <span className="relative">{f.label}</span>
                </button>
              </li>
            ))}
          </ul>
        </nav>
        <div className="flex items-center justify-end gap-3">
          {mode === "demo" && <DemoBadge />}
          <button
            type="button"
            onClick={cart.open}
            aria-label={`Open bag, ${cart.count} item${cart.count === 1 ? "" : "s"}`}
            className="relative flex h-11 items-center gap-2 rounded-full px-3 text-xs text-neutral-800 transition hover:bg-black/5"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden fill="none" stroke="currentColor" strokeWidth="1.3">
              <path d="M3 5h10l-.8 9H3.8L3 5Z" strokeLinejoin="round" />
              <path d="M5.5 5V4a2.5 2.5 0 0 1 5 0v1" />
            </svg>
            <span className="hidden sm:inline">Bag</span>
            <motion.span
              key={cart.count}
              initial={{ scale: 0.6 }}
              animate={{ scale: 1 }}
              className={`grid h-5 min-w-5 place-items-center rounded-full px-1 text-[10px] font-semibold tabular-nums ${cart.count ? "bg-neutral-900 text-white" : "bg-neutral-200 text-neutral-600"}`}
            >
              {cart.ready ? cart.count : 0}
            </motion.span>
          </button>
        </div>
      </div>
    </motion.header>
  );
}
