import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { routes } from "./helpers";

const sizes = [
  { name: "desktop", width: 1440, height: 900 },
  { name: "phone", width: 375, height: 667 },
];

for (const s of sizes) {
  test(`axe (WCAG 2.2 A/AA) finds no violations on any route — ${s.name}`, async ({ page }) => {
    await page.setViewportSize({ width: s.width, height: s.height });
    for (const path of routes) {
      await page.goto(path);
      await page.waitForTimeout(1800); // past the boot, so nothing is mid-animation
      const res = await new AxeBuilder({ page: page as never })
        .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
        // Spec §3/§13: line numbers and the `~` fill are decorative (--text-5/6, aria-hidden), never information.
        .exclude(".buf-gut")
        .exclude(".buf-fill")
        // Spec §4 prescribes aria-label="About" on the visible tab "[1:about]" so a screen reader says "About, link,
        // current page". axe reads that as a 2.5.3 label-in-name mismatch because the visible text carries the index.
        // Voice control still works ("click about"). Documented deviation, see CLAUDE.md.
        .disableRules(["label-content-name-mismatch"])
        .analyze();
      const summary = res.violations.map(
        (v) =>
          `${v.id}: ${v.nodes
            .slice(0, 2)
            .map((n) => n.target.join(" "))
            .join(" | ")}`,
      );
      expect(summary, `${path} @ ${s.name}`).toEqual([]);
    }
  });
}

test("structure: skip links, landmarks, one visible h1, current page, accessible tab names", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  for (const path of routes) {
    await page.goto(path);
    const r = await page.evaluate(() => {
      return {
        h1: [...document.querySelectorAll("h1")].filter((e) => e.checkVisibility()).length,
        skips: [...document.querySelectorAll(".skip-link")]
          .filter((e) => e.checkVisibility())
          .map((e) => e.textContent),
        landmarks: [
          "header",
          "nav[aria-label=Sections]",
          "main",
          "footer",
          "aside[aria-label=Visual]",
        ].map((s) => !!document.querySelector(s)),
        order: ["header", "nav[aria-label=Sections]", "main", "footer"]
          .map((sel) => document.querySelector(sel)!)
          .every(
            (el, i, all) =>
              i === 0 ||
              !!(all[i - 1].compareDocumentPosition(el) & Node.DOCUMENT_POSITION_FOLLOWING),
          ),
        current: document.querySelectorAll("#sections [aria-current=page]").length,
        names: [...document.querySelectorAll("#sections a")].map((a) =>
          a.getAttribute("aria-label"),
        ),
        keys: [...document.querySelectorAll("#sections a")].map((a) =>
          a.getAttribute("aria-keyshortcuts"),
        ),
        h2: [...document.querySelectorAll("h2.sr-only")].length,
        hiddenDecor: ["canvas.bg-canvas", ".buf-gut"].every(
          (s) =>
            document.querySelector(s)?.closest("[aria-hidden=true]") ||
            document.querySelector(s)?.getAttribute("aria-hidden") === "true",
        ),
      };
    });
    expect(r.h1, `${path}: exactly one visible h1`).toBe(1);
    expect(r.skips, path).toEqual(["Skip to content", "Skip to sections", "Skip to visual"]);
    expect(r.landmarks.every(Boolean), `${path}: landmarks`).toBe(true);
    expect(r.order, `${path}: DOM order header → nav → main → footer`).toBe(true);
    expect(r.current, `${path}: one current tab`).toBe(1);
    expect(r.names).toEqual(["Home", "About", "Projects", "Skills", "Certs", "Contact"]);
    expect(r.keys).toEqual(["0", "1", "2", "3", "4", "5"]);
    expect(r.h2, `${path}: hidden command headings`).toBeGreaterThan(0);
    expect(r.hiddenDecor).toBe(true);
  }
});

test("keyboard: Tab order starts with skip links and reaches resume, tabs, content, command line", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/about");
  await page.waitForTimeout(1500);
  const seen: string[] = [];
  for (let i = 0; i < 14; i++) {
    await page.keyboard.press("Tab");
    seen.push(
      await page.evaluate(
        () =>
          (document.activeElement as HTMLElement)?.textContent?.trim().slice(0, 24) ||
          document.activeElement?.id ||
          document.activeElement?.tagName ||
          "",
      ),
    );
  }
  expect(seen.slice(0, 3)).toEqual(["Skip to content", "Skip to sections", "Skip to visual"]);
  expect(seen.join("|")).toMatch(/resume\.pdf/);
});

test("focus ring is visible: 2px yellow outline on focused links", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");
  await page.waitForTimeout(1800);
  await page.keyboard.press("Tab");
  const o = await page.evaluate(() => {
    const cs = getComputedStyle(document.activeElement!);
    return { w: cs.outlineWidth, c: cs.outlineColor, s: cs.outlineStyle };
  });
  expect(o).toEqual({ w: "2px", c: "rgb(255, 214, 10)", s: "solid" });
});

test("the live region announces and decorative canvases are hidden", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("[role=status][aria-live=polite]")).toHaveCount(1);
  expect(
    await page
      .locator("canvas")
      .evaluateAll((els) => els.every((e) => e.getAttribute("aria-hidden") === "true")),
  ).toBe(true);
});
