# Prompt to paste into Claude Code

I want you to BUILD a working interactive fashion ecommerce demo, not generate mockups or only describe the implementation. This is a new isolated project. Do not touch or modify any of my other projects.

Reference images are under `reference-frames/`: `rack.png` is the browse view, `detail.png` is the selected garment view, and `return.png` is another moment in the interaction. Inspect the references before coding. If they are not accessible in your environment, ask me to attach them as images.

The target interaction is: a long row of individually hung clothing items on a continuous rail against a spacious white page; very subtle pastel gradient at the bottom; horizontal drag/swipe; click one item and animate that same item to the center-left while other garments recede; product details appear on the right; return smoothly to the original rack and scroll position.

Use Next.js App Router, TypeScript, Tailwind CSS and Motion for React. Use an actual shared-element transition (`layoutId`), not a slide-show. Build demo catalog of 10 sample garments using modular product data. Use accessible components and mobile gestures. Provide size options, quantity, cart drawer, and local-cart persistence. Checkout must be marked demo-only; prepare a separate Shopify Storefront API adapter for later, but DO NOT require Shopify credentials yet.

Priorities:
1. Accurate visual layout and interaction based on references.
2. Good image assets and naturally aligned hangers; no fake floating garments.
3. Real animated component behavior, desktop and mobile.
4. A functional demo cart with clear demo/production distinction.
5. Stable code, passing typecheck/lint/build.

Do not copy the names or brand logos visible in the third-party video. Use neutral fictional products until I provide rights-cleared assets.

Work in a new folder/repo called interactive-fashion-store. First create the architecture, then write the code and run the app. Test the rack, click-to-detail, back transition, cart and mobile layout. Fix bugs you encounter. At the end, report what is working, how to preview locally, how to deploy through GitHub/Vercel, and what information is still needed for Shopify checkout. Do not say the storefront is complete if you have not run or verified it.
