import { test, expect } from "@playwright/test";
import { routes } from "./helpers";

// Spec §7.0: the last stats row must be fully visible without scrolling on the common laptop sizes.
for (const [w, h] of [
  [1366, 657],
  [1280, 720],
]) {
  test(`home fits the fold at ${w}×${h}`, async ({ page }) => {
    await page.setViewportSize({ width: w, height: h });
    await page.goto("/");
    await page.waitForTimeout(1800); // past the boot
    const r = await page.evaluate(() => {
      const scroller = document.querySelector(".buf-scroll")!.getBoundingClientRect();
      const last = [...document.querySelectorAll("dd")].pop()!.getBoundingClientRect();
      const nudge = [...document.querySelectorAll(".buf-cnt p")].find((p) =>
        /new here/.test(p.textContent ?? ""),
      );
      return {
        scrollBottom: scroller.bottom,
        lastBottom: last.bottom,
        nudge: !!nudge && nudge.getBoundingClientRect().bottom < scroller.bottom,
      };
    });
    expect(r.lastBottom).toBeLessThanOrEqual(r.scrollBottom);
    expect(r.nudge).toBe(true);
  });
}

test("phone: name, role, status and the start of the intro are above the fold (375×667)", async ({
  page,
}) => {
  await page.setViewportSize({ width: 375, height: 667 });
  await page.goto("/");
  await page.waitForTimeout(1200);
  const r = await page.evaluate(() => {
    const visibleH1 = [...document.querySelectorAll("h1")].filter((e) => e.checkVisibility());
    const lead = [...document.querySelectorAll(".buf-cnt p")].find((p) =>
      /Full-stack/.test(p.textContent ?? ""),
    )!;
    return {
      h1: visibleH1.map((e) => e.textContent),
      leadBottom: lead.getBoundingClientRect().bottom,
      usable: innerHeight - 88,
    };
  });
  expect(r.h1).toEqual(["Ankesh Jaiswal"]);
  expect(r.leadBottom).toBeLessThan(r.usable);
});

for (const w of [375, 820, 1024, 1440]) {
  test(`no horizontal scroll at ${w}px on every route`, async ({ page }) => {
    await page.setViewportSize({ width: w, height: 800 });
    for (const path of routes) {
      await page.goto(path);
      await page.waitForTimeout(300);
      expect(
        await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
        `${path} @ ${w}`,
      ).toBe(true);
    }
  });
}

test("phone bottom bar: 2 rows × 4 cells, each ≥ 44px, 88px tall, fixed to the bottom", async ({
  page,
}) => {
  await page.setViewportSize({ width: 375, height: 667 });
  await page.goto("/");
  const bar = await page.evaluate(() => {
    const n = document.querySelector("#sections-m")!;
    const r = n.getBoundingClientRect();
    return {
      cells: n.children.length,
      h: Math.round(r.height),
      bottom: Math.round(r.bottom),
      min: Math.min(...[...n.children].map((c) => c.getBoundingClientRect().height)),
    };
  });
  expect(bar).toMatchObject({ cells: 8, h: 88, bottom: 667 });
  expect(bar.min).toBeGreaterThanOrEqual(44);
});

test("desktop targets: tmux tabs and controls are ≥ 24px tall", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");
  const small = await page.evaluate(() =>
    [...document.querySelectorAll("#sections a, #sections button, header a, header button")]
      .filter((e) => (e as HTMLElement).offsetParent !== null)
      .map((e) => Math.round(e.getBoundingClientRect().height))
      .filter((h) => h < 24),
  );
  expect(small).toEqual([]);
});

test("tablet keeps the split and the terminal never overflows its window", async ({ page }) => {
  for (const w of [820, 1024]) {
    await page.setViewportSize({ width: w, height: 900 });
    await page.goto("/");
    await page.waitForTimeout(1600);
    const overflow = await page.evaluate(() => {
      const win = document.querySelector(".term-win")!.getBoundingClientRect();
      return [...document.querySelectorAll(".term-win *")].filter(
        (e) =>
          (e as HTMLElement).offsetParent &&
          e.getBoundingClientRect().right > win.right + 1 &&
          !e.closest(".buf-scroll"),
      ).length;
    });
    expect(overflow, `${w}px`).toBe(0);
    await expect(page.locator("[aria-label='ID badge']")).toBeVisible();
  }
});
