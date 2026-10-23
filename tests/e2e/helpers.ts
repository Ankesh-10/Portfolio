import type { Page } from "@playwright/test";

export const routes = [
  "/",
  "/about",
  "/projects",
  "/projects/project-name",
  "/skills",
  "/certs",
  "/certs/aws-cloud-practitioner",
  "/contact",
];

/** [visible rows, total rows] among the buffer's own lines, by opacity of their content. */
export const visibleRows = (page: Page) =>
  page.evaluate(() => {
    const rows = [...document.querySelectorAll(".buf-scroll > div > .buf-row[data-kind]")].filter(
      (r) => (r as HTMLElement).offsetParent !== null,
    );
    const on = rows.filter((r) => {
      const cnt = r.querySelector(".buf-cnt")!;
      const pfx = r.querySelector(".rv-pfx");
      return (
        Number(getComputedStyle(cnt).opacity) > 0.5 ||
        (pfx && Number(getComputedStyle(pfx).opacity) > 0.5)
      );
    });
    return [on.length, rows.length] as const;
  });

export const goto = async (page: Page, path: string) => {
  await page.goto(path);
  await page.waitForLoadState("networkidle");
};
