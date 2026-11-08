"use client";

import { memo, useState } from "react";
import { motion, useTransform, type MotionValue } from "motion/react";
import type { Product } from "@/lib/catalog/types";
import { formatMoney } from "@/lib/format";
import { GarmentVisual, HOOK_FRACTION } from "@/components/garments/GarmentVisual";
import { EASE_OUT, HOVER_TURN, RACK_TURN, SPRING_LAYOUT, garmentLayoutId } from "./constants";

type Props = {
  product: Product;
  index: number;
  /** Distance (in items) from the garment being opened; drives the stagger. */
  distance: number;
  isSelected: boolean;
  receded: boolean;
  /** This garment is flying back from the detail view. */
  returning: boolean;
  sway: MotionValue<number>;
  onSelect: (product: Product) => void;
  onFocusItem: (product: Product | null) => void;
};

const transformOrigin = `${HOOK_FRACTION.x * 100}% ${HOOK_FRACTION.y * 100}%`;

function RackItemImpl({ product, index, distance, isSelected, receded, returning, sway, onSelect, onFocusItem }: Props) {
  const [active, setActive] = useState(false);
  // Small per-garment variation so the rack doesn't swing like one rigid block.
  const factor = 0.8 + ((index * 37) % 10) / 25;
  const rotate = useTransform(sway, (v) => v * factor);
  const label = `${product.name}, ${product.colorName}, ${formatMoney(product.price)}`;

  return (
    <motion.li
      layout="position"
      className="relative shrink-0"
      style={{ width: "var(--slot)", height: "var(--rack-h)" }}
      initial={{ opacity: 0, y: 12 }}
      animate={
        receded && !isSelected
          ? { opacity: 0, y: 26, scale: 0.94, transition: { duration: 0.35, delay: Math.min(distance, 6) * 0.03, ease: EASE_OUT } }
          : { opacity: 1, y: 0, scale: 1, transition: { duration: 0.55, delay: receded ? 0 : 0.1 + Math.min(distance, 6) * 0.04, ease: EASE_OUT } }
      }
      exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
    >
      <motion.div
        className="absolute left-1/2"
        style={{
          width: "var(--g-w)",
          height: "var(--g-h)",
          marginLeft: "calc(var(--g-w) / -2)",
          top: `calc(var(--rail-y) - var(--g-h) * ${HOOK_FRACTION.y})`,
          rotate,
          transformOrigin,
        }}
      >
        <button
          type="button"
          data-rack-handle={product.handle}
          aria-label={label}
          aria-haspopup="dialog"
          onClick={() => onSelect(product)}
          onPointerEnter={(e) => {
            if (e.pointerType === "mouse") {
              setActive(true);
              onFocusItem(product);
            }
          }}
          onPointerLeave={() => {
            setActive(false);
            onFocusItem(null);
          }}
          onFocus={(e) => {
            // Only keyboard focus turns the garment; programmatic focus
            // restoration after closing the detail view should not.
            if (!e.currentTarget.matches(":focus-visible")) return;
            setActive(true);
            onFocusItem(product);
          }}
          onBlur={() => {
            setActive(false);
            onFocusItem(null);
          }}
          className="rack-hit group absolute inset-x-[14%] top-0 bottom-[16%] cursor-pointer rounded-[28px] outline-none"
        />
        {/* The shared element. Removed while open so the detail view owns it. */}
        {!isSelected && (
          <motion.div
            layoutId={garmentLayoutId(product.id)}
            layoutCrossfade={false}
            transition={SPRING_LAYOUT}
            className="pointer-events-none absolute inset-0"
            style={{ zIndex: returning ? 40 : undefined }}
          >
            <motion.div
              className="h-full w-full"
              style={{ transformOrigin, transformPerspective: 1100 }}
              initial={returning ? { rotateY: 0 } : false}
              animate={{ rotateY: active ? HOVER_TURN : RACK_TURN, scale: active ? 1.035 : 1 }}
              transition={returning ? { ...SPRING_LAYOUT, delay: 0.05 } : { type: "spring", stiffness: 140, damping: 18 }}
            >
              <GarmentVisual media={product.media} sizes="200px" />
            </motion.div>
          </motion.div>
        )}
        {/* Price tag tied to the hanger. */}
        <motion.div
          aria-hidden
          className="pointer-events-none absolute"
          style={{ left: "calc(50% + var(--g-w) * 0.07)", top: "calc(var(--g-h) * 0.02)", transformOrigin: "0% 0%" }}
          animate={{ rotate: active ? -10 : -3, opacity: isSelected ? 0 : 1 }}
          transition={{ type: "spring", stiffness: 160, damping: 12 }}
        >
          <span className="absolute left-0 top-0 h-[18px] w-px origin-top -rotate-[28deg] bg-neutral-400/80" />
          <span className="absolute left-[7px] top-[15px] whitespace-nowrap rounded-[3px] border border-neutral-200 bg-white px-1.5 py-[3px] text-[9px] font-medium leading-none tracking-wide text-neutral-700 shadow-[0_1px_2px_rgba(0,0,0,0.08)]">
            {formatMoney(product.price)}
          </span>
        </motion.div>
      </motion.div>
    </motion.li>
  );
}

export const RackItem = memo(RackItemImpl);
