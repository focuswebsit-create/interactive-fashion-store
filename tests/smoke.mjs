/**
 * End-to-end smoke test for the rack storefront.
 *   npm run build && npm start          (or npm run dev)
 *   npm run test:smoke                  (BASE_URL defaults to http://localhost:3000)
 * Requires a Chromium for Playwright: `npx playwright install chromium` once.
 * Screenshots are written to ./test-results/.
 */
import assert from "node:assert/strict";
import { mkdirSync } from "node:fs";
import { chromium, devices } from "playwright";

const BASE = process.env.BASE_URL ?? "http://localhost:3000";
const OUT = "test-results";
mkdirSync(OUT, { recursive: true });

const launchOptions = process.env.PW_CHROMIUM_PATH ? { executablePath: process.env.PW_CHROMIUM_PATH } : {};
const browser = await chromium.launch(launchOptions);
const consoleErrors = [];
const watch = (page) => {
  page.on("pageerror", (e) => consoleErrors.push(`pageerror: ${e.message}`));
  page.on("console", (m) => m.type() === "error" && !m.text().includes("400") && consoleErrors.push(m.text()));
};
const step = async (name, fn) => {
  process.stdout.write(`• ${name} … `);
  await fn();
  console.log("ok");
};
const scrollLeft = (page) => page.evaluate(() => Math.round(document.querySelector(".rack-scroller").scrollLeft));

try {
  // ───────────── Desktop ─────────────
  const desk = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  watch(desk);
  await desk.goto(BASE, { waitUntil: "networkidle" });
  await desk.evaluate(() => {
    localStorage.clear();
    sessionStorage.clear();
  });
  await desk.reload({ waitUntil: "networkidle" });

  await step("rack renders 10 garments on the rail", async () => {
    assert.equal(await desk.locator("[data-rack-handle]").count(), 10);
    await desk.screenshot({ path: `${OUT}/desktop-rack.png` });
  });

  await step("mouse drag scrolls the rack without opening a garment", async () => {
    await desk.mouse.move(900, 450);
    await desk.mouse.down();
    for (let i = 1; i <= 10; i++) {
      await desk.mouse.move(900 - i * 30, 452);
      await desk.waitForTimeout(16);
    }
    await desk.mouse.up();
    await desk.waitForTimeout(1200);
    assert.ok((await scrollLeft(desk)) > 100, "rack should have scrolled");
    assert.equal(new URL(desk.url()).pathname, "/");
  });

  await step("wheel scrolls horizontally", async () => {
    await desk.evaluate(() => (document.querySelector(".rack-scroller").scrollLeft = 0));
    await desk.mouse.move(700, 450);
    await desk.mouse.wheel(0, 200);
    await desk.waitForTimeout(900);
    assert.ok((await scrollLeft(desk)) > 50);
  });

  let before;
  await step("click opens detail with shared-element transition and shallow URL", async () => {
    await desk.evaluate(() => (document.querySelector(".rack-scroller").scrollLeft = 260));
    await desk.waitForTimeout(300);
    // Pick the garment closest to the viewport centre (fully visible).
    const centre = await desk.$$eval("[data-rack-handle]", (els) =>
      els
        .map((e) => ({ h: e.dataset.rackHandle, d: Math.abs(e.getBoundingClientRect().x + e.getBoundingClientRect().width / 2 - innerWidth / 2) }))
        .sort((a, b) => a.d - b.d)[0].h,
    );
    await desk.locator(`[data-rack-handle="${centre}"]`).click();
    await desk.waitForTimeout(1300);
    assert.equal(new URL(desk.url()).pathname, `/product/${centre}`);
    // Read after the click: Playwright may scroll the target into view first.
    before = await scrollLeft(desk);
    assert.ok(before > 0, "test needs a non-zero rack position");
    await desk.getByRole("dialog").getByRole("heading").waitFor();
    await desk.screenshot({ path: `${OUT}/desktop-detail.png` });
  });

  await step("close returns to the rack at the same scroll position", async () => {
    await desk.getByRole("button", { name: "Close" }).click();
    await desk.waitForTimeout(1300);
    assert.equal(new URL(desk.url()).pathname, "/");
    assert.equal(await desk.getByRole("dialog").count(), 0);
    assert.equal(await scrollLeft(desk), before);
  });

  await step("browser forward/back + Escape", async () => {
    await desk.goForward();
    await desk.waitForTimeout(1000);
    assert.equal(await desk.getByRole("dialog").count(), 1);
    await desk.keyboard.press("Escape");
    await desk.waitForTimeout(1000);
    assert.equal(new URL(desk.url()).pathname, "/");
  });

  await step("add to bag, persist across reload, demo checkout", async () => {
    await desk.locator('[data-rack-handle="loop-crew-fog"]').click();
    await desk.waitForTimeout(1100);
    await desk.getByRole("radio", { name: /^L/ }).check({ force: true });
    await desk.getByRole("button", { name: "Increase quantity" }).click();
    await desk.getByRole("button", { name: /Add to bag/ }).click();
    await desk.getByRole("status").getByText("Added 2").waitFor();
    await desk.reload({ waitUntil: "networkidle" });
    await desk.waitForTimeout(600);
    assert.match(await desk.getByRole("button", { name: /Open bag/ }).getAttribute("aria-label"), /2 items/);
    await desk.getByRole("button", { name: "Close" }).click();
    await desk.waitForTimeout(900);
    await desk.getByRole("button", { name: /Open bag/ }).click();
    await desk.getByRole("button", { name: /Checkout \(demo only\)/ }).click();
    await desk.getByText("Demo checkout complete").waitFor();
    await desk.screenshot({ path: `${OUT}/desktop-checkout.png` });
  });

  await step("checkout API rejects sold-out sizes", async () => {
    const res = await desk.request.post(`${BASE}/api/checkout`, { data: { lines: [{ productId: "p03", size: "XL", quantity: 1 }] } });
    assert.equal(res.status(), 400);
  });

  // ───────────── Mobile ─────────────
  const ctx = await browser.newContext({ ...devices["iPhone 13"] });
  const mob = await ctx.newPage();
  watch(mob);
  const cdp = await ctx.newCDPSession(mob);
  const swipe = async (x1, y1, x2, y2, steps = 12) => {
    await cdp.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [{ x: x1, y: y1 }] });
    for (let i = 1; i <= steps; i++)
      await cdp.send("Input.dispatchTouchEvent", { type: "touchMove", touchPoints: [{ x: x1 + ((x2 - x1) * i) / steps, y: y1 + ((y2 - y1) * i) / steps }] });
    await cdp.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
  };
  await mob.goto(BASE, { waitUntil: "networkidle" });

  await step("mobile: swipe the rack", async () => {
    await swipe(330, 420, 60, 425);
    await mob.waitForTimeout(1200);
    assert.ok((await scrollLeft(mob)) > 50);
    await mob.screenshot({ path: `${OUT}/mobile-rack.png` });
  });

  await step("mobile: tap opens detail, swipe down closes", async () => {
    const target = await mob.$$eval("[data-rack-handle]", (els) =>
      els.map((e) => ({ h: e.dataset.rackHandle, x: e.getBoundingClientRect().x })).find((o) => o.x > 20 && o.x < 300)?.h,
    );
    await mob.tap(`[data-rack-handle="${target}"]`);
    await mob.waitForTimeout(1300);
    assert.equal(new URL(mob.url()).pathname, `/product/${target}`);
    await mob.screenshot({ path: `${OUT}/mobile-detail.png` });
    await swipe(195, 200, 195, 430);
    await mob.waitForTimeout(1300);
    assert.equal(new URL(mob.url()).pathname, "/");
  });

  assert.deepEqual(consoleErrors, [], `console errors:\n${consoleErrors.join("\n")}`);
  console.log("\nAll smoke checks passed.");
} finally {
  await browser.close();
}
