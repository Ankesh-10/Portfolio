import { test, expect } from "@playwright/test";
import { visibleRows } from "./helpers";

test.use({ viewport: { width: 1366, height: 657 } });

test("first visit to / boots: attribute set before paint, progressive, complete by ~1.9s, intro skippable control", async ({
  page,
}) => {
  await page.goto("/", { waitUntil: "commit" });
  await page.waitForSelector(".buf-row", { state: "attached" });
  expect(await page.evaluate(() => document.documentElement.getAttribute("data-boot"))).toBe("1");
  await page.waitForTimeout(250);
  const early = await visibleRows(page);
  await page.waitForTimeout(400);
  const mid = await visibleRows(page);
  expect(early[0]).toBeLessThan(early[1]);
  expect(mid[0]).toBeGreaterThan(early[0]);
  await expect(page.locator(".skip-intro")).toBeVisible();
  await page.waitForTimeout(1300);
  const end = await visibleRows(page);
  expect(end[0]).toBe(end[1]);
  await expect(page.locator(".skip-intro")).toBeHidden();
  expect(await page.evaluate(() => document.documentElement.hasAttribute("data-boot"))).toBe(false);
});

test("a second load of / in the same session is a landing, not a boot", async ({ page }) => {
  await page.goto("/");
  await page.waitForTimeout(300);
  await page.reload({ waitUntil: "commit" });
  expect(
    await page.evaluate(
      () =>
        document.documentElement.hasAttribute("data-landing") &&
        !document.documentElement.hasAttribute("data-boot"),
    ),
  ).toBe(true);
  await page.waitForTimeout(500);
  const [on, all] = await visibleRows(page);
  expect(on).toBe(all);
});

test("any key skips the intro", async ({ page }) => {
  await page.goto("/", { waitUntil: "commit" });
  await page.waitForTimeout(300);
  await page.keyboard.press("Shift");
  await page.waitForTimeout(60);
  const [on, all] = await visibleRows(page);
  expect(on).toBe(all);
});

test("with the JS bundle blocked, all home text is still visible by 1.7s (hard end state)", async ({
  page,
}) => {
  await page.route("**/*.js", (r) => r.abort());
  await page.goto("/", { waitUntil: "commit" });
  await page.waitForSelector(".buf-row", { state: "attached" });
  await page.waitForTimeout(1700);
  const [on, all] = await visibleRows(page);
  expect(on).toBe(all);
});

test.describe("reduced motion", () => {
  test("no boot and everything is visible at once", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/", { waitUntil: "commit" });
    expect(await page.evaluate(() => document.documentElement.hasAttribute("data-boot"))).toBe(
      false,
    );
    await page.waitForTimeout(300);
    const [on, all] = await visibleRows(page);
    expect(on).toBe(all);
  });
});

test("‖ motion off (persisted) means no boot", async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem("motion", "off"));
  await page.goto("/", { waitUntil: "commit" });
  expect(await page.evaluate(() => document.documentElement.hasAttribute("data-boot"))).toBe(false);
});

test("tab change: first visit reveals progressively, return visit is faster, reveal class is removed", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");
  await page.waitForTimeout(2000);
  await page.click("nav[aria-label=Sections] a[aria-label=About]");
  await page.waitForFunction(() => location.pathname === "/about");
  await page.waitForTimeout(80);
  const a1 = await visibleRows(page);
  await page.waitForTimeout(900);
  const a2 = await visibleRows(page);
  expect(a1[0]).toBeLessThan(a1[1]);
  expect(a2[0]).toBe(a2[1]);
  expect(await page.evaluate(() => !document.querySelector(".buf-reveal"))).toBe(true);
  await page.click("nav[aria-label=Sections] a[aria-label=Skills]");
  await page.waitForFunction(() => location.pathname === "/skills");
  await page.waitForTimeout(800);
  await page.click("nav[aria-label=Sections] a[aria-label=About]");
  await page.waitForFunction(() => location.pathname === "/about");
  await page.waitForTimeout(400);
  const a3 = await visibleRows(page);
  expect(a3[0]).toBe(a3[1]);
});

test("command output streams, marks the buffer busy, then settles", async ({ page }) => {
  await page.goto("/about");
  await page.waitForTimeout(500);
  await page.click("#cmdline");
  await page.keyboard.type("help");
  await page.keyboard.press("Enter");
  await page.waitForTimeout(40);
  expect(await page.locator(".buf-scroll").getAttribute("aria-busy")).toBe("true");
  await page.waitForTimeout(600);
  expect(await page.locator(".buf-scroll").getAttribute("aria-busy")).toBe("false");
});

// Regression guard: CSS reveal animations must not delay LCP. With `animation-fill-mode: both`, Chromium withheld
// animated text from LCP until the boot attribute was removed at 1.6s (spec §9 targets LCP < 1.5s).
for (const [name, vp, mobile, max] of [
  ["phone", { width: 412, height: 823 }, true, 800],
  ["desktop", { width: 1350, height: 940 }, false, 1400],
] as const) {
  test(`LCP stays early during the boot (${name}, < ${max}ms)`, async ({ browser }) => {
    const ctx = await browser.newContext({ viewport: vp, isMobile: mobile, hasTouch: mobile });
    const page = await ctx.newPage();
    await page.addInitScript(() => {
      (window as unknown as { __lcp: number }).__lcp = 0;
      new PerformanceObserver((l) =>
        l
          .getEntries()
          .forEach(
            (e) => ((window as unknown as { __lcp: number }).__lcp = Math.round(e.startTime)),
          ),
      ).observe({ type: "largest-contentful-paint", buffered: true });
    });
    await page.goto("/");
    await page.waitForTimeout(2200);
    const lcp = await page.evaluate(() => (window as unknown as { __lcp: number }).__lcp);
    expect(lcp).toBeGreaterThan(0);
    expect(lcp).toBeLessThan(max);
    await ctx.close();
  });
}
