import { test, expect } from "@playwright/test";

test.use({
  viewport: { width: 1440, height: 900 },
  permissions: ["clipboard-read", "clipboard-write"],
});

const run = async (page: import("@playwright/test").Page, cmd: string) => {
  await page.click("#cmdline");
  await page.keyboard.type(cmd);
  await page.keyboard.press("Enter");
  await page.waitForTimeout(250);
};
const tail = (page: import("@playwright/test").Page) =>
  page.evaluate(() =>
    (document.querySelector(".buf-scroll") as HTMLElement).innerText
      .split("\n")
      .filter((l) => l.trim() && !/^~?\s*~$/.test(l.trim()) && !/^\d*$/.test(l.trim()))
      .slice(-8)
      .join("\n"),
  );

test.beforeEach(async ({ page }) => {
  await page.goto("/");
  await page.waitForTimeout(600);
});

test("basic commands and easter eggs", async ({ page }) => {
  const cases: [string, RegExp][] = [
    ["whoami", /ankesh — full-stack developer/],
    ["projcts", /did you mean 'projects'\?/],
    ["rm -rf /", /nice try\./],
    ["vim", /already in it/],
    [":q", /there is no escape\. \(try :help\)/],
    ["help", /get in touch/],
    ["neofetch", /portfolio-sh/],
    ["history", /whoami/],
  ];
  for (const [cmd, re] of cases) {
    await run(page, cmd);
    expect(await tail(page), cmd).toMatch(re);
  }
});

test("email copies, resume downloads with its real size, clear tidies", async ({ page }) => {
  await run(page, "email");
  expect(await tail(page)).toMatch(/copied ✓ /);
  expect(await page.evaluate(() => navigator.clipboard.readText())).toContain("@");
  const [dl] = await Promise.all([page.waitForEvent("download"), run(page, "resume")]);
  expect(dl.suggestedFilename()).toBe("resume.pdf");
  expect(await tail(page)).toMatch(/downloading resume\.pdf \(\d+ KB\) ✓/);
  await run(page, "clear");
  expect(await tail(page)).not.toMatch(/downloading/);
});

test("Tab completes commands and arguments, ↑ recalls history", async ({ page }) => {
  await page.click("#cmdline");
  await page.keyboard.type("proj");
  await page.keyboard.press("Tab");
  expect(await page.inputValue("#cmdline")).toBe("projects");
  await page.fill("#cmdline", "open project-t");
  await page.keyboard.press("Tab");
  expect(await page.inputValue("#cmdline")).toBe("open project-two");
  await page.fill("#cmdline", "");
  await run(page, "whoami");
  await page.keyboard.press("ArrowUp");
  expect(await page.inputValue("#cmdline")).toBe("whoami");
});

test("navigation from the command line keeps focus there and announces the route", async ({
  page,
}) => {
  await run(page, "about");
  await page.waitForFunction(() => location.pathname === "/about");
  expect(await page.evaluate(() => document.activeElement?.id)).toBe("cmdline");
  await expect(page.locator("[role=status]")).toContainText("About");
});

test("palette: opens on /, 8 items when empty, fuzzy search runs a command, focus goes to main, Esc closes", async ({
  page,
}) => {
  await page.keyboard.press("/");
  await expect(page.getByRole("combobox")).toBeVisible();
  await expect(page.getByRole("option")).toHaveCount(8);
  await page.keyboard.type("skil");
  await page.keyboard.press("Enter");
  await page.waitForFunction(() => location.pathname === "/skills");
  expect(await page.evaluate(() => document.activeElement?.id)).toBe("content");
  await page.keyboard.press("/");
  await page.keyboard.press("Escape");
  await expect(page.getByRole("combobox")).toBeHidden();
});

test("single-key shortcuts work outside fields and can be turned off", async ({ page }) => {
  await page.keyboard.press("2");
  await page.waitForFunction(() => location.pathname === "/projects");
  await run(page, "shortcuts off");
  await page.evaluate(() => (document.activeElement as HTMLElement).blur());
  await page.keyboard.press("1");
  await page.waitForTimeout(300);
  expect(new URL(page.url()).pathname).toBe("/projects");
  await run(page, "shortcuts on");
  await page.evaluate(() => (document.activeElement as HTMLElement).blur());
  await page.keyboard.press("1");
  await page.waitForFunction(() => location.pathname === "/about");
});

test("sudo hire-me opens contact", async ({ page }) => {
  await run(page, "sudo hire-me");
  expect(await tail(page)).toMatch(/access granted/);
  await page.waitForFunction(() => location.pathname === "/contact", null, { timeout: 4000 });
});

test("the command line is the only thing that takes ':' — typing it into the mail form stays text", async ({
  page,
}) => {
  await page.goto("/contact");
  await page.click("text=send a message");
  await page.keyboard.type(":q projects");
  expect(await page.inputValue("#mail-name")).toBe(":q projects");
  expect(new URL(page.url()).pathname).toBe("/contact");
});
