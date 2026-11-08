---
name: fashion-rack-experience
description: Build or refine a high-quality interactive fashion store with a horizontal clothing rack, draggable garments, smooth transitions to product detail pages, and responsive ecommerce interactions.
---

# Interactive Fashion Rack Experience

Use this skill when building or modifying the fashion storefront demonstrated in `reference-frames/`.

## Design fidelity
- The visual references are examples of the interaction and layout, not assets to copy pixel-for-pixel or brands to reproduce.
- Home view: editorial white space, a fine horizontal hanging rail, individually suspended clothing with hangers, and a very subtle pastel gradient near the lower edge.
- Detail view: one selected garment becomes larger and moves naturally into the central-left portion of the screen; concise details and a working call-to-action appear on the right.
- Avoid default card-grid ecommerce styling. No generic dashboards, boxed product cards, giant headings, excessive particles, or fake screenshots.
- Maintain minimal typography, generous whitespace, crisp apparel cutouts, and realistic proportions.

## Behavior
- Desktop users drag or wheel through the horizontal rack; mobile users swipe it.
- Hover/touch feedback is gentle; item selection is unmistakable.
- Clicking/tapping a garment animates THAT SAME garment seamlessly from the rack to the detail position. Implement a true shared-element transition, e.g. Motion for React `layoutId` with LayoutGroup/AnimatePresence as appropriate. Do not simply fade an unrelated image onto the page.
- The rest of the rail fades/slides away during the transition; product information reveals sequentially.
- Back navigation restores the rack and its previous scroll position. Back/forward browser history works.
- Provide size selection, accessible quantity, add-to-cart action, cart drawer with state persistence, error/empty states.
- Honor prefers-reduced-motion, keyboard navigation, meaningful alt text, and 44px minimum touch targets where applicable.
- Aim for smooth animation without layout jumps or external hotlink reliance.

## Implementation
- Use Next.js App Router, TypeScript, Tailwind CSS and Motion for React (`motion/react`).
- Create explicit data types and local mock products before integrating any ecommerce provider.
- Keep products, UI, animations and Shopify integration isolated in separate modules.
- Images used for production need real supplier/user-provided assets with appropriate rights. Where authentic images are not available, use explicitly marked placeholders; never silently represent reference screenshots as products.
- Make local demo function fully without a Shopify account. Label any checkout action demo-only until integrated.
- When integrating Shopify, use current official Storefront API practices: real product variants, cart mutations and Shopify's checkout URL. Never embed secret private tokens in public client code.
- Check mobile and desktop, keyboard interactions, dev console, npm run build, lint and type-check; resolve actual issues before reporting success.

## Definition of done
1. The rack actually scrolls/drags and is visually aligned.
2. Selecting any garment plays a smooth tracked-object transition to detail.
3. Going back restores prior state.
4. Product selection, cart and responsive layouts work.
5. Build succeeds; no placeholder checkout is claimed to be live.
6. Provide an easy local launch command and deployment instructions.
