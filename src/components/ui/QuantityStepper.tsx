"use client";

import { MAX_QTY_PER_LINE } from "@/lib/cart/cart-reducer";

type Props = {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  labelledBy?: string;
  label?: string;
  size?: "md" | "sm";
};

/** Accessible −/+ quantity control (spinbutton semantics). */
export function QuantityStepper({ value, onChange, min = 1, max = MAX_QTY_PER_LINE, labelledBy, label, size = "md" }: Props) {
  const btn = size === "md" ? "h-11 w-11" : "h-9 w-9";
  return (
    <div
      role="spinbutton"
      tabIndex={0}
      aria-valuenow={value}
      aria-valuemin={min}
      aria-valuemax={max}
      aria-labelledby={labelledBy}
      aria-label={labelledBy ? undefined : (label ?? "Quantity")}
      onKeyDown={(e) => {
        if (e.key === "ArrowUp" || e.key === "ArrowRight") {
          e.preventDefault();
          onChange(Math.min(max, value + 1));
        } else if (e.key === "ArrowDown" || e.key === "ArrowLeft") {
          e.preventDefault();
          onChange(Math.max(min, value - 1));
        }
      }}
      className="inline-flex items-center rounded-full ring-1 ring-neutral-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-900"
    >
      <button
        type="button"
        tabIndex={-1}
        aria-label="Decrease quantity"
        disabled={value <= min}
        onClick={() => onChange(Math.max(min, value - 1))}
        className={`${btn} grid place-items-center rounded-full text-neutral-700 transition hover:bg-black/5 disabled:opacity-30`}
      >
        <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden stroke="currentColor" strokeWidth="1.4"><path d="M2 6h8" /></svg>
      </button>
      <span className="w-6 text-center text-sm tabular-nums" aria-hidden>
        {value}
      </span>
      <button
        type="button"
        tabIndex={-1}
        aria-label="Increase quantity"
        disabled={value >= max}
        onClick={() => onChange(Math.min(max, value + 1))}
        className={`${btn} grid place-items-center rounded-full text-neutral-700 transition hover:bg-black/5 disabled:opacity-30`}
      >
        <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden stroke="currentColor" strokeWidth="1.4"><path d="M2 6h8M6 2v8" /></svg>
      </button>
    </div>
  );
}
