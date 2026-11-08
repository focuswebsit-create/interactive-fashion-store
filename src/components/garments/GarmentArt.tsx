import { useId, type ReactNode } from "react";
import type { IllustrationSpec, Silhouette } from "@/lib/catalog/types";
import { luminance, mix, shade } from "./color";

/**
 * Vector "studio cut-out" garment illustrations, each on a wooden hanger.
 *
 * Every illustration shares one coordinate system (400 × 600) and one hook
 * position, so any garment hangs on the rail at exactly the same point —
 * that is what keeps the rack aligned. Real photography can replace these
 * via `ProductMedia.kind === "photo"` (see GarmentVisual).
 */
export const GARMENT_VIEWBOX = { width: 400, height: 600 } as const;
/** Inside apex of the hanger hook, in viewBox units. The rail passes here. */
export const HOOK_ANCHOR = { x: 200, y: 8 } as const;

type NeckStyle = "crew" | "hood" | "collar" | "wide-collar";
type Geo = {
  widen: number;
  hem: number;
  sleeve: "short" | "long";
  cuff: number;
  neck: NeckStyle;
  hemBand: number;
  cuffBand: number;
  shirttail?: boolean;
  texture: "jersey" | "fleece" | "knit" | "woven" | "nylon";
};

const GEO: Record<Silhouette, Geo> = {
  tee: { widen: 6, hem: 452, sleeve: "short", cuff: 0, neck: "crew", hemBand: 0, cuffBand: 0, texture: "jersey" },
  longsleeve: { widen: 4, hem: 462, sleeve: "long", cuff: 440, neck: "crew", hemBand: 0, cuffBand: 0, texture: "jersey" },
  crew: { widen: 8, hem: 458, sleeve: "long", cuff: 436, neck: "crew", hemBand: 28, cuffBand: 30, texture: "fleece" },
  knit: { widen: 6, hem: 452, sleeve: "long", cuff: 434, neck: "crew", hemBand: 32, cuffBand: 32, texture: "knit" },
  hoodie: { widen: 12, hem: 476, sleeve: "long", cuff: 446, neck: "hood", hemBand: 30, cuffBand: 32, texture: "fleece" },
  "zip-hoodie": { widen: 10, hem: 470, sleeve: "long", cuff: 444, neck: "hood", hemBand: 28, cuffBand: 30, texture: "fleece" },
  shirt: { widen: 4, hem: 472, sleeve: "long", cuff: 440, neck: "collar", hemBand: 0, cuffBand: 26, shirttail: true, texture: "woven" },
  overshirt: { widen: 8, hem: 466, sleeve: "long", cuff: 442, neck: "collar", hemBand: 0, cuffBand: 24, texture: "woven" },
  jacket: { widen: 14, hem: 446, sleeve: "long", cuff: 440, neck: "wide-collar", hemBand: 18, cuffBand: 20, texture: "nylon" },
};

/** Mirror a left-half path onto the right half. */
const MIRROR = "translate(400 0) scale(-1 1)";

function frontNeckY(g: Geo) {
  switch (g.neck) {
    case "hood":
      return 150;
    case "collar":
      return 122;
    case "wide-collar":
      return 128;
    default:
      return g.sleeve === "short" ? 110 : 112;
  }
}

function geometry(g: Geo) {
  const sx = 82 - g.widen; // shoulder point
  const sy = 110 + g.widen * 0.4;
  const ax = 86 - g.widen; // armpit
  const ay = g.sleeve === "short" ? 198 : 206;
  const hx = 88 - g.widen * 0.8; // hem at side seam
  const cf = frontNeckY(g);
  return { sx, sy, ax, ay, hx, cf };
}

function necklinePath(cf: number) {
  return `M150 86 C156 ${cf - 8} 180 ${cf} 200 ${cf} C220 ${cf} 244 ${cf - 8} 250 86`;
}

function bodyHalf(g: Geo) {
  const { sx, sy, ax, ay, hx, cf } = geometry(g);
  const hem = g.hem;
  let d = `M201 ${cf} C180 ${cf} 156 ${cf - 8} 150 86 `;
  d += `C128 90 ${104 - g.widen * 0.5} ${99 + g.widen * 0.2} ${sx} ${sy} `;
  d += `C${sx + 1} ${sy + 30} ${ax} ${ay - 40} ${ax} ${ay} `;
  if (g.shirttail) {
    d += `C${ax} ${ay + 90} ${hx} ${hem - 140} ${hx} ${hem - 22} `;
    d += `C${hx + 4} ${hem + 2} 150 ${hem + 16} 201 ${hem + 16} Z`;
  } else {
    d += `C${ax} ${ay + 90} ${hx} ${hem - 120} ${hx} ${hem} `;
    d += `Q140 ${hem + 5} 201 ${hem + 6} Z`;
  }
  return d;
}

function sleeveHalf(g: Geo) {
  const { sx, sy, ax, ay } = geometry(g);
  if (g.sleeve === "short") {
    return `M${sx + 2} ${sy - 2} C${sx - 14} ${sy + 20} ${sx - 34} ${sy + 52} ${sx - 46} ${sy + 82} L${sx - 14} ${sy + 106} C${sx - 6} ${sy + 100} ${ax} ${ay - 4} ${ax + 4} ${ay - 8} Z`;
  }
  const c = g.cuff;
  return `M${sx + 2} ${sy - 2} C${sx - 16} ${sy + 30} ${sx - 26} ${sy + 100} ${sx - 27} ${sy + 190} L${sx - 29} ${c} L${sx + 5} ${c + 3} L${sx + 8} ${sy + 190} C${sx + 9} ${sy + 150} ${ax + 2} ${ay + 10} ${ax + 3} ${ay - 6} Z`;
}

function cuffBandHalf(g: Geo) {
  const { sx } = geometry(g);
  const c = g.cuff;
  const b = g.cuffBand;
  return `M${sx - 28.6} ${c - b} L${sx - 29} ${c} L${sx + 5} ${c + 3} L${sx + 6.4} ${c - b + 2} Z`;
}

function hemBandHalf(g: Geo) {
  const { hx } = geometry(g);
  const h = g.hem;
  const b = g.hemBand;
  return `M${hx + 1.5} ${h - b} L${hx + 2} ${h} Q140 ${h + 5} 201 ${h + 6} L201 ${h - b + 6} Q140 ${h - b + 5} ${hx + 1.5} ${h - b} Z`;
}

/** Soft vertical fold: a tapered quad filled with a bbox-relative gradient. */
function fold(x1: number, y1: number, x2: number, y2: number, w1: number, w2: number, bend = 0) {
  const mx = (x1 + x2) / 2 + bend;
  const my = (y1 + y2) / 2;
  const mw = (w1 + w2) / 2;
  return `M${x1 - w1} ${y1} Q${mx - mw} ${my} ${x2 - w2} ${y2} L${x2 + w2} ${y2} Q${mx + mw} ${my} ${x1 + w1} ${y1} Z`;
}

type Props = {
  spec: IllustrationSpec;
  className?: string;
  /** Accessible label. Omit when the parent already labels the garment. */
  title?: string;
  /** Render the soft wall shadow (off for tiny thumbnails). */
  shadow?: boolean;
};

export function GarmentArt({ spec, className, title, shadow = true }: Props) {
  const rawId = useId();
  const id = (s: string) => `g${rawId.replace(/[^a-zA-Z0-9]/g, "")}-${s}`;
  const url = (s: string) => `url(#${id(s)})`;

  const g = GEO[spec.silhouette];
  const { sx, sy, cf } = geometry(g);
  const base = spec.color;
  const light = luminance(base) > 0.45;
  const trim = spec.trim ?? shade(base, light ? -0.1 : 0.22);
  const rib = shade(base, light ? -0.06 : -0.08);
  const inside = shade(base, light ? -0.32 : -0.42);
  const seam = light ? shade(base, -0.32) : shade(base, 0.2);
  const outline = shade(base, light ? -0.22 : -0.35);
  const hem = g.hem;

  const body = bodyHalf(g);
  const sleeve = sleeveHalf(g);
  const silhouette = (
    <>
      <path d={body} />
      <path d={body} transform={MIRROR} />
      <path d={sleeve} />
      <path d={sleeve} transform={MIRROR} />
    </>
  );

  // Drape folds — deliberately asymmetric so the cloth doesn't read as a curtain.
  const folds: { d: string; tone: "dark" | "light" }[] = [
    { d: fold(124, 150, 112, hem - 4, 3, 15, -6), tone: "dark" },
    { d: fold(152, 140, 150, hem - 4, 3, 12, -3), tone: "light" },
    { d: fold(186, 168, 182, hem - 2, 2, 7, 3), tone: "dark" },
    { d: fold(238, 150, 246, hem - 4, 4, 16, 5), tone: "light" },
    { d: fold(262, 160, 270, hem - 6, 2, 10, 2), tone: "dark" },
    { d: fold(292, 150, 300, hem - 30, 2, 8, 4), tone: "dark" },
    { d: fold(104, 128, 134, 214, 2, 6, 6), tone: "dark" },
    { d: fold(296, 128, 268, 206, 2, 5, -6), tone: "dark" },
  ];
  const sleeveFold = (m: boolean, d: string, tone: "dark" | "light") => ({
    d: m ? d.replace(/(-?\d+(?:\.\d+)?) (-?\d+(?:\.\d+)?)/g, (_, x, y) => `${400 - Number(x)} ${y}`) : d,
    tone,
  });
  for (const m of [false, true]) {
    if (g.sleeve === "long") {
      folds.push(sleeveFold(m, fold(sx - 10, sy + 50, sx - 14, g.cuff - g.cuffBand - 6, 2, 7, m ? 3 : -3), "light"));
      folds.push(sleeveFold(m, fold(sx - 2, sy + 120, sx - 6, g.cuff - g.cuffBand - 4, 2, 5, 2), "dark"));
    } else {
      folds.push(sleeveFold(m, fold(sx - 6, sy + 14, sx - 28, sy + 86, 2, 7, -2), "dark"));
    }
  }

  let details: ReactNode = null;
  switch (spec.silhouette) {
    case "hoodie":
      details = (
        <g>
          <path d="M122 330 L278 330 L298 424 L102 424 Z" fill={shade(base, light ? -0.03 : 0.025)} />
          <path d="M122 330 L278 330" stroke={seam} strokeWidth={1.2} strokeDasharray="3 3" opacity={0.6} fill="none" />
          <path d="M122 330 C110 362 104 394 102 424" stroke={shade(base, -0.3)} strokeWidth={3} fill="none" opacity={0.7} />
          <path d="M278 330 C290 362 296 394 298 424" stroke={shade(base, -0.3)} strokeWidth={3} fill="none" opacity={0.7} />
        </g>
      );
      break;
    case "zip-hoodie":
      details = (
        <g>
          <path d={`M200 ${cf - 6} L200 ${hem + 4}`} stroke={shade(base, -0.25)} strokeWidth={10} />
          <path d={`M200 ${cf - 6} L200 ${hem + 4}`} stroke={trim} strokeWidth={4} strokeDasharray="1.6 1.6" />
          <rect x={195.5} y={cf - 2} width={9} height={18} rx={2.5} fill={trim} />
          <rect x={198} y={cf + 14} width={4} height={14} rx={2} fill={shade(trim, -0.15)} />
          <path d="M112 332 C122 362 128 392 130 418" stroke={shade(base, -0.35)} strokeWidth={3} fill="none" />
          <path d="M288 332 C278 362 272 392 270 418" stroke={shade(base, -0.35)} strokeWidth={3} fill="none" />
        </g>
      );
      break;
    case "shirt":
    case "overshirt": {
      const buttons: number[] = [];
      for (let y = cf + 26; y < hem - 26; y += spec.silhouette === "shirt" ? 58 : 64) buttons.push(y);
      const placketBottom = g.shirttail ? hem + 16 : hem + 6;
      details = (
        <g>
          <rect x={191} y={cf - 6} width={18} height={placketBottom - cf + 6} fill={shade(base, light ? 0.06 : 0.03)} />
          <path d={`M191 ${cf} V${placketBottom} M209 ${cf} V${placketBottom}`} stroke={seam} strokeWidth={1} strokeDasharray="3 3" opacity={0.5} />
          {buttons.map((y) => (
            <g key={y}>
              <circle cx={200} cy={y} r={4.6} fill={trim} stroke={shade(trim, -0.25)} strokeWidth={0.8} />
              <circle cx={198.6} cy={y - 1.2} r={0.7} fill={shade(trim, -0.4)} />
              <circle cx={201.4} cy={y + 1.2} r={0.7} fill={shade(trim, -0.4)} />
            </g>
          ))}
          {spec.silhouette === "shirt" ? (
            <path d="M228 176 H268 V218 L248 228 L228 218 Z" fill="none" stroke={seam} strokeWidth={1.1} strokeDasharray="3 2.5" opacity={0.6} />
          ) : (
            [false, true].map((m) => (
              <g key={String(m)} transform={m ? MIRROR : undefined}>
                <path d="M114 176 H168 V232 Q141 238 114 232 Z" fill={shade(base, 0.03)} stroke={outline} strokeWidth={1} opacity={0.9} />
                <path d="M112 168 H170 V190 Q141 196 112 190 Z" fill={shade(base, light ? -0.04 : 0.05)} stroke={outline} strokeWidth={1} />
                <circle cx={141} cy={187} r={3.6} fill={trim} />
              </g>
            ))
          )}
        </g>
      );
      break;
    }
    case "jacket":
      details = (
        <g>
          <path d={`M200 ${cf} V${hem + 6}`} stroke={shade(base, -0.4)} strokeWidth={1.5} />
          {[0, 1, 2, 3, 4].map((i) => (
            <g key={i}>
              <circle cx={206} cy={cf + 24 + i * 62} r={5.4} fill={trim} />
              <circle cx={206} cy={cf + 24 + i * 62} r={2.2} fill={shade(trim, -0.3)} />
            </g>
          ))}
          <path d="M110 318 L128 392" stroke={shade(base, -0.45)} strokeWidth={3} />
          <path d="M290 318 L272 392" stroke={shade(base, -0.45)} strokeWidth={3} />
          <path d="M92 446 C88 462 92 474 88 488" stroke={trim} strokeWidth={2.5} fill="none" />
          <path d="M308 446 C312 462 308 474 312 488" stroke={trim} strokeWidth={2.5} fill="none" />
          <rect x={84.5} y={486} width={7} height={11} rx={3} fill={shade(trim, -0.2)} />
          <rect x={308.5} y={486} width={7} height={11} rx={3} fill={shade(trim, -0.2)} />
        </g>
      );
      break;
    case "tee":
      details = spec.mark ? (
        <g transform="translate(250 168)" opacity={0.92}>
          <circle r={8} fill="none" stroke={spec.mark} strokeWidth={1.8} />
          <path d="M-3.5 4 L0 -4.5 L3.5 4" fill="none" stroke={spec.mark} strokeWidth={1.6} strokeLinejoin="round" />
        </g>
      ) : null;
      break;
    default:
      break;
  }

  return (
    <svg
      viewBox={`0 0 ${GARMENT_VIEWBOX.width} ${GARMENT_VIEWBOX.height}`}
      className={className}
      role={title ? "img" : undefined}
      aria-hidden={title ? undefined : true}
      aria-label={title}
      focusable="false"
    >
      <defs>
        <clipPath id={id("clip")}>{silhouette}</clipPath>
        <linearGradient id={id("side")} gradientUnits="userSpaceOnUse" x1="34" y1="0" x2="366" y2="0">
          <stop offset="0" stopColor="#000" stopOpacity={light ? 0.2 : 0.34} />
          <stop offset="0.2" stopColor="#000" stopOpacity="0" />
          <stop offset="0.5" stopColor="#fff" stopOpacity={light ? 0.1 : 0.06} />
          <stop offset="0.8" stopColor="#000" stopOpacity="0" />
          <stop offset="1" stopColor="#000" stopOpacity={light ? 0.22 : 0.36} />
        </linearGradient>
        <linearGradient id={id("top")} gradientUnits="userSpaceOnUse" x1="0" y1="86" x2="0" y2={hem + 20}>
          <stop offset="0" stopColor="#fff" stopOpacity={light ? 0.25 : 0.14} />
          <stop offset="0.28" stopColor="#fff" stopOpacity="0" />
          <stop offset="0.82" stopColor="#000" stopOpacity="0" />
          <stop offset="1" stopColor="#000" stopOpacity={light ? 0.1 : 0.2} />
        </linearGradient>
        <linearGradient id={id("fdark")} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#000" stopOpacity="0" />
          <stop offset="0.5" stopColor="#000" stopOpacity={light ? 0.13 : 0.26} />
          <stop offset="1" stopColor="#000" stopOpacity="0" />
        </linearGradient>
        <linearGradient id={id("flight")} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#fff" stopOpacity="0" />
          <stop offset="0.5" stopColor="#fff" stopOpacity={light ? 0.3 : 0.1} />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
        <linearGradient id={id("wood")} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#d9a873" />
          <stop offset="0.55" stopColor="#b47b48" />
          <stop offset="1" stopColor="#8f5a30" />
        </linearGradient>
        <linearGradient id={id("metal")} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#7d8186" />
          <stop offset="0.5" stopColor="#c9ccd0" />
          <stop offset="1" stopColor="#6e7277" />
        </linearGradient>
        <pattern id={id("rib")} width="3.4" height="8" patternUnits="userSpaceOnUse">
          <rect width="1.5" height="8" fill="#000" opacity={light ? 0.07 : 0.16} />
        </pattern>
        <pattern id={id("knit")} width="7" height="9" patternUnits="userSpaceOnUse">
          <path d="M0 0 L3.5 4.5 L7 0 M0 4.5 L3.5 9 L7 4.5" fill="none" stroke="#000" strokeWidth="0.8" opacity={0.08} />
        </pattern>
        <pattern id={id("twill")} width="5" height="5" patternUnits="userSpaceOnUse" patternTransform="rotate(35)">
          <rect width="1" height="5" fill="#000" opacity={light ? 0.04 : 0.07} />
        </pattern>
        {shadow && (
          <filter id={id("shadow")} x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="9" />
          </filter>
        )}
      </defs>

      {/* soft wall shadow */}
      {shadow && (
        <g transform="translate(7 14)" fill="#1d2230" opacity={0.13} filter={url("shadow")}>
          {silhouette}
        </g>
      )}

      {/* hood falls behind the garment */}
      {g.neck === "hood" && (
        <path d="M110 136 C98 72 146 40 200 40 C254 40 302 72 290 136 Z" fill={shade(base, light ? -0.1 : -0.16)} />
      )}

      {/* inside of the back neck, visible through the neckline */}
      <path d={`M150 86 Q200 94 250 86 C244 ${cf - 8} 220 ${cf} 200 ${cf} C180 ${cf} 156 ${cf - 8} 150 86 Z`} fill={inside} />
      {(g.neck === "collar" || g.neck === "wide-collar") && (
        <path d="M148 88 Q200 72 252 88 L252 92 Q200 80 148 92 Z" fill={shade(base, light ? -0.08 : 0.05)} />
      )}

      {/* wooden hanger bar — hidden under the shoulders, visible at the neck */}
      <path d="M88 122 Q200 58 312 122" stroke={url("wood")} strokeWidth={13} strokeLinecap="round" fill="none" />
      <path d="M94 116 Q200 54 306 116" stroke="#f3d3ad" strokeWidth={1.4} strokeLinecap="round" fill="none" opacity={0.7} />
      <rect x={193} y={70} width={14} height={18} rx={3} fill={url("wood")} />

      {/* garment */}
      <g fill={base}>{silhouette}</g>

      <g clipPath={url("clip")}>
        {g.texture === "knit" && <rect x="0" y="0" width="400" height="600" fill={url("knit")} />}
        {(g.texture === "woven" || g.texture === "nylon") && <rect x="0" y="0" width="400" height="600" fill={url("twill")} />}
        {details}
        {g.hemBand > 0 && (
          <>
            {[false, true].map((m) => (
              <g key={String(m)} transform={m ? MIRROR : undefined}>
                <path d={hemBandHalf(g)} fill={rib} />
                <path d={hemBandHalf(g)} fill={url("rib")} />
              </g>
            ))}
          </>
        )}
        {g.cuffBand > 0 && (
          <>
            {[false, true].map((m) => (
              <g key={String(m)} transform={m ? MIRROR : undefined}>
                <path d={cuffBandHalf(g)} fill={g.texture === "woven" ? shade(base, light ? -0.04 : 0.03) : rib} />
                {g.texture !== "woven" && <path d={cuffBandHalf(g)} fill={url("rib")} />}
              </g>
            ))}
          </>
        )}
        {/* folds and drape */}
        {folds.map((f, i) => (
          <path key={i} d={f.d} fill={url(f.tone === "dark" ? "fdark" : "flight")} />
        ))}
        <rect x="0" y="0" width="400" height="600" fill={url("side")} />
        <rect x="0" y="0" width="400" height="600" fill={url("top")} />
        {/* stitch lines */}
        <g fill="none" stroke={seam} strokeWidth={1.1} strokeDasharray="3.2 2.6" opacity={0.55}>
          {g.hemBand === 0 && !g.shirttail && <path d={`M60 ${hem - 12} Q200 ${hem - 2} 340 ${hem - 12}`} />}
          {g.sleeve === "short" && (
            <>
              <path d={`M${sx - 40} ${sy + 74} L${sx - 12} ${sy + 95}`} />
              <path d={`M${400 - sx + 40} ${sy + 74} L${400 - sx + 12} ${sy + 95}`} />
            </>
          )}
          {g.sleeve === "long" && g.cuffBand === 0 && (
            <>
              <path d={`M${sx - 29} ${g.cuff - 12} L${sx + 5} ${g.cuff - 9}`} />
              <path d={`M${400 - sx + 29} ${g.cuff - 12} L${400 - sx - 5} ${g.cuff - 9}`} />
            </>
          )}
          <path d={`M${sx + 4} ${sy + 4} C${sx + 4} ${sy + 34} ${sx + 8} ${sy + 70} ${sx + 10} ${sy + 92}`} />
          <path d={`M${400 - sx - 4} ${sy + 4} C${400 - sx - 4} ${sy + 34} ${400 - sx - 8} ${sy + 70} ${400 - sx - 10} ${sy + 92}`} />
        </g>
      </g>

      {/* neck finishes */}
      {g.neck === "crew" && (
        <g fill="none">
          <path d={necklinePath(cf)} stroke={rib} strokeWidth={g.texture === "jersey" ? 8 : 12} />
          <path d={necklinePath(cf)} stroke={url("rib")} strokeWidth={g.texture === "jersey" ? 8 : 12} />
          <path d={necklinePath(cf + (g.texture === "jersey" ? 5 : 7))} stroke={seam} strokeWidth={1} strokeDasharray="3 2.5" opacity={0.5} />
        </g>
      )}
      {g.neck === "hood" && (
        <g>
          <path d="M146 84 C148 112 170 142 206 158" stroke={shade(base, light ? -0.05 : 0.04)} strokeWidth={17} strokeLinecap="round" fill="none" />
          <path d="M254 84 C252 112 230 142 194 158" stroke={shade(base, light ? -0.02 : 0.07)} strokeWidth={17} strokeLinecap="round" fill="none" />
          <path d="M254 84 C252 112 230 142 194 158" stroke={shade(base, -0.3)} strokeWidth={1} fill="none" opacity={0.5} transform="translate(-6 6)" />
          {spec.silhouette === "hoodie" && (
            <g>
              <circle cx={176} cy={150} r={3.2} fill={shade(base, -0.35)} />
              <circle cx={224} cy={150} r={3.2} fill={shade(base, -0.35)} />
              <path d="M176 151 C173 190 179 224 174 262" stroke={trim} strokeWidth={4.2} strokeLinecap="round" fill="none" />
              <path d="M224 151 C227 186 222 216 227 250" stroke={trim} strokeWidth={4.2} strokeLinecap="round" fill="none" />
              <rect x={171.5} y={260} width={5} height={12} rx={1.6} fill={shade(trim, -0.2)} />
              <rect x={224.5} y={248} width={5} height={12} rx={1.6} fill={shade(trim, -0.2)} />
            </g>
          )}
        </g>
      )}
      {(g.neck === "collar" || g.neck === "wide-collar") && (
        <g>
          {[false, true].map((m) => {
            const wide = g.neck === "wide-collar";
            const tipX = wide ? 146 : 158;
            const tipY = wide ? 156 : 142;
            return (
              <path
                key={String(m)}
                transform={m ? MIRROR : undefined}
                d={`M201 ${cf - 14} L150 84 C${tipX - 8} ${96} ${tipX - 8} ${tipY - 30} ${tipX} ${tipY} C${tipX + 16} ${tipY - 10} ${188} ${cf - 2} 201 ${cf - 6} Z`}
                fill={shade(base, m ? (light ? 0.04 : 0.07) : light ? 0.02 : 0.04)}
                stroke={outline}
                strokeWidth={1}
              />
            );
          })}
        </g>
      )}

      {/* hook: always on top, passes over the rail */}
      <path d="M200 76 L200 50 C200 38 216 34 216 21 C216 11 209 5 200 5 C191 5 185 11 185 19" stroke={url("metal")} strokeWidth={4.6} strokeLinecap="round" fill="none" />
      <path d="M199 74 L199 50 C199 39 214.5 34.5 214.5 21" stroke="#eef0f2" strokeWidth={1.1} strokeLinecap="round" fill="none" opacity={0.8} />
    </svg>
  );
}

/** A colour that reads on top of the garment (used for small labels). */
export function contrastOn(hex: string) {
  return luminance(hex) > 0.45 ? mix(hex, "#000", 0.75) : mix(hex, "#fff", 0.85);
}
