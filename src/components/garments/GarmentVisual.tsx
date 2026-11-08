import Image from "next/image";
import type { ProductMedia } from "@/lib/catalog/types";
import { GARMENT_VIEWBOX, GarmentArt, HOOK_ANCHOR } from "./GarmentArt";

/** Hook position as a fraction of the 2:3 garment box. */
export const HOOK_FRACTION = {
  x: HOOK_ANCHOR.x / GARMENT_VIEWBOX.width,
  y: HOOK_ANCHOR.y / GARMENT_VIEWBOX.height,
};

type Props = {
  media: ProductMedia;
  className?: string;
  /** Provide when the visual itself should be announced (not inside a labelled button). */
  labelled?: boolean;
  shadow?: boolean;
  sizes?: string;
  priority?: boolean;
};

/**
 * Renders a garment inside a 2:3 box whose hook always sits at HOOK_FRACTION.
 * Photos are positioned using their own `hook` metadata so real cut-outs hang
 * on the rail exactly like the placeholder illustrations.
 */
export function GarmentVisual({ media, className = "", labelled = false, shadow = true, sizes, priority }: Props) {
  if (media.kind === "illustration") {
    return (
      <GarmentArt
        spec={media.spec}
        title={labelled ? media.alt : undefined}
        shadow={shadow}
        className={`block h-full w-full ${className}`}
      />
    );
  }
  // Scale the photo so the hook lands on HOOK_FRACTION and the garment fills
  // the remaining height of the box.
  const boxAspect = GARMENT_VIEWBOX.width / GARMENT_VIEWBOX.height;
  const heightPct = ((1 - HOOK_FRACTION.y) / (1 - media.hook.y)) * 100;
  const widthPct = (heightPct * (media.width / media.height)) / boxAspect;
  const topPct = HOOK_FRACTION.y * 100 - media.hook.y * heightPct;
  const leftPct = HOOK_FRACTION.x * 100 - media.hook.x * widthPct;
  return (
    <div className={`relative h-full w-full ${className}`}>
      <Image
        src={media.src}
        alt={labelled ? media.alt : ""}
        width={media.width}
        height={media.height}
        sizes={sizes ?? "(max-width: 768px) 60vw, 40vw"}
        priority={priority}
        draggable={false}
        className="absolute max-w-none select-none"
        style={{ width: `${widthPct}%`, height: `${heightPct}%`, top: `${topPct}%`, left: `${leftPct}%` }}
      />
    </div>
  );
}
