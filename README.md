# Interactive Fashion Store: Rack Demo

A working demo storefront in which garments hang individually on one continuous
rail. Drag or swipe the rail, pick a garment, and **that same garment** lifts
off the rail, turns to face you and settles centre-left while the rest of the
rack recedes and the product details appear on the right. Closing it sends the
garment back to its hook, and the rack is where you left it.

> **Demo store.** All products are fictional ("Rail Studio") with placeholder
> vector artwork. Checkout is simulated: no payment is taken and no order is
> placed. A Shopify adapter is prepared but switched off (see
> [`docs/SHOPIFY.md`](docs/SHOPIFY.md)).

Stack: Next.js 16 (App Router, Cache Components) · React 19 · TypeScript ·
Tailwind CSS 4 · Motion for React (`motion/react`).

## Run it locally

Requires Node 20.9+ (tested on Node 22).

```bash
npm install
npm run dev          # http://localhost:3000
```

Production build:

```bash
npm run build && npm start
```

Checks:

```bash
npm run typecheck    # next typegen + tsc
npm run lint         # eslint (next core-web-vitals + typescript)
npm run build
npm run test:smoke   # Playwright e2e against a running server (BASE_URL=http://localhost:3000)
```

`test:smoke` needs a Playwright Chromium (`npx playwright install chromium`
once). It covers the rack, drag, wheel, click → detail, close with scroll
restoration, Back/Forward/Escape, add to bag, persistence across reload, demo
checkout, server-side validation, and on iPhone 13 emulation: swipe the rack,
tap to open, swipe down to close.

## What it does

| Area | Behaviour |
| --- | --- |
| Rack | One fixed rail. 10 hangers slide along it inside a native horizontal scroller. Mouse drag has inertia, the vertical wheel scrolls sideways smoothly, touch keeps native momentum. Garments **sway on their hooks** in response to rail speed (spring physics). Price tags hang off each hanger. A hover or keyboard focus turns a garment towards you. |
| Selection | Click, tap or Enter. The garment is a Motion `layoutId` shared element: the rack copy unmounts and the detail copy mounts in the same commit, so Motion animates the one garment from its hook to the detail position while it turns from 56° to face-on. The other garments recede with a stagger based on distance from the selected one. |
| Detail | Garment centre-left, hanging from a cord. Category, name, price, colour, Size/Details tabs, size radio pills (sold-out sizes disabled), quantity stepper, "Add to bag" with live status. Close button, Escape, browser Back, or **swipe down** on mobile. |
| Routing | `/product/[handle]` is a real, prerendered, deep-linkable URL. In-app navigation uses `history.pushState`, so the rack never unmounts and its scroll position is kept. A cold deep link opens the detail with the rack positioned behind it. |
| Cart | Drawer with focus trap, Escape and swipe-right to close. Per-line quantity and remove, subtotal. Persisted in `localStorage` (validated on load and synced across tabs). |
| Checkout | `POST /api/checkout` validates and prices the bag on the server. In demo mode it returns a `DEMO-XXXXXX` reference, and the UI says plainly that no payment was taken. With Shopify configured it redirects to Shopify's hosted checkout. |
| Filters | All / Tops / Sweats / Shirts / Outerwear. Garments slide along the rail as items leave or arrive. |
| Accessibility | Real buttons and labels, arrow/Home/End roving focus across the rack, `aria-modal` dialogs with focus moved in and restored, `inert` background, size options as native radios, `prefers-reduced-motion` respected (`MotionConfig reducedMotion="user"`), touch targets of 44px or more. |

## Architecture

```
src/
  app/
    layout.tsx                 root layout, metadata, viewport
    page.tsx                   "/" → <Storefront initialHandle={null}>
    product/[handle]/page.tsx  deep link, generateStaticParams + metadata
    api/checkout/route.ts      server-side checkout (demo or Shopify)
    globals.css                rack metrics (CSS vars), rail, pastel wash
  components/
    storefront/
      Storefront.tsx           shell: selection ⇄ URL, history, Escape, layout group
      Rack.tsx                 rail, scroller (layoutScroll), sway physics, progress, keyboard
      RackItem.tsx             one hanger: tag, hover turn, shared element
      ProductDetail.tsx        detail dialog, shared element target, purchase UI
      useRackScroll.ts         drag + inertia, wheel → horizontal, click suppression
      Header.tsx, PastelBackdrop.tsx, constants.ts
    garments/
      GarmentArt.tsx           parametric SVG garments on wooden hangers
      GarmentVisual.tsx        illustration or photo, both aligned to the same hook point
    cart/CartDrawer.tsx
    ui/QuantityStepper.tsx, DemoBadge.tsx
  lib/
    catalog/                   provider-agnostic types + 10 demo products
    cart/                      pure reducer + sanitiser, React context + persistence
    commerce/
      types.ts                 CommerceAdapter interface
      demo-adapter.ts          local catalog + simulated checkout
      shopify/                 Storefront API client, queries, mappers, adapter (inactive)
      index.ts                 getCommerce(): picks the adapter from env
tests/smoke.mjs                Playwright end-to-end smoke test
reference-frames/              the reference screenshots (not used as assets)
```

UI components import only `lib/catalog` types and `lib/cart`. Only the server
(pages and the route handler) talks to `lib/commerce`, so switching to Shopify
does not touch the UI.

### Garment assets and hanger alignment

Every garment is drawn in a shared 400×600 coordinate system with the
hanger-hook apex at `(200, 8)`. The rack places that point exactly on the rail
line, so hangers always hook onto the rail and nothing floats.
`ProductMedia.kind === "photo"` supports real cut-out photography: give the
image size and the hook position as fractions (`hook: { x, y }`) and
`GarmentVisual` scales and offsets the photo so its hook lands on the same
point.

**The current artwork is placeholder vector illustration**, generated in code.
Replace it with rights-cleared photography before using this commercially.

## Deploy (GitHub → Vercel)

1. Push this repository to GitHub (it already is, if you're reading this there).
2. In Vercel, choose **Add New → Project**, import the repo, and keep the
   detected **Next.js** preset. No build settings to change: `npm run build`,
   output handled by Vercel.
3. Environment variables: none are needed for the demo. Optionally set
   `COMMERCE_PROVIDER=demo` to be explicit.
4. Deploy. Each push to a branch gets a Preview URL, and merges to the default
   branch go to Production.

Never put Shopify tokens in client code or `NEXT_PUBLIC_*` variables. Add them
in Vercel → Project → Settings → Environment Variables when you're ready.

## Known limitations

- Placeholder garments are stylised vector art, not photography.
- The Shopify adapter type-checks but has not been run against a live store
  (no credentials yet). See [`docs/SHOPIFY.md`](docs/SHOPIFY.md) for what's
  needed.
- No prev/next navigation between garments inside the detail view yet.
- Only English and USD are wired up.
