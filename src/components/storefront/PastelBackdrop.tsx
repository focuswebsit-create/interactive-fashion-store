"use client";

import { motion } from "motion/react";

/** White page with a very soft pastel wash rising from the bottom edge. */
export function PastelBackdrop({ dimmed }: { dimmed: boolean }) {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 bg-[var(--page)]">
      <motion.div
        className="pastel-wash absolute inset-x-0 bottom-0 h-[46svh]"
        initial={false}
        animate={{ opacity: dimmed ? 0.35 : 1 }}
        transition={{ duration: 0.6 }}
      />
    </div>
  );
}
