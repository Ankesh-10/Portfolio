import { test, expect } from "@playwright/test";

test.use({ viewport: { width: 1440, height: 900 } });

test("mail form: validation, draft, cancel, restore, failed and sent states", async ({ page }) => {
  await page.goto("/contact");
  await page.click("text=send a message");
  await expect(page.locator("#mail-name")).toBeFocused();
  for (const k of ["name", "email", "message"])
    await expect(page.locator(`label[for=mail-${k}]`)).toBeVisible();

  await page.keyboard.press("Enter"); // empty name
  await expect(page.locator("form[data-mail]")).toContainText("! name can't be empty");
  await expect(page.locator("#mail-name")).toBeFocused();
  await page.keyboard.type("Ada");
  await page.keyboard.press("Enter");
  await expect(page.locator("#mail-email")).toBeFocused();
  await page.keyboard.type("ada.example.com");
  await page.keyboard.press("Enter");
  await expect(page.locator("form[data-mail]")).toContainText(
    "! email needs an @ — e.g. you@company.com",
  );
  expect(await page.locator("#mail-email").getAttribute("aria-invalid")).toBe("true");
  expect(await page.inputValue("#mail-email")).toBe("ada.example.com"); // value kept
  await page.fill("#mail-email", "ada@example.com");
  await page.keyboard.press("Enter");
  await page.keyboard.type("Hello");
  await page.keyboard.press("Enter");
  await page.keyboard.type("second line");
  expect(await page.inputValue("#mail-message")).toBe("Hello\nsecond line");

  await page.keyboard.press("Escape");
  await expect(page.locator("form[data-mail]")).toBeHidden();
  await expect(page.locator(".buf-scroll")).toContainText(
    "mail cancelled — draft saved. type mail to continue, or mail --discard.",
  );
  await expect(page.locator("#cmdline")).toBeFocused();

  await page.keyboard.type("mail");
  await page.keyboard.press("Enter");
  await expect(page.locator("#mail-message")).toBeFocused(); // first empty field (all filled → message)
  expect(await page.inputValue("#mail-message")).toBe("Hello\nsecond line"); // no stray newline from the Enter that opened it

  // Mail server not configured in the test env → the API answers 503 and the UI says so, keeping the message.
  await page.keyboard.press("Control+Enter");
  await expect(page.locator("form[data-mail]")).toContainText(
    "failed: couldn't reach the mail server. your message is still here",
  );
  expect(await page.inputValue("#mail-message")).toContain("Hello");

  await page.route("**/api/contact", (r) =>
    r.fulfill({ status: 200, contentType: "application/json", body: '{"ok":true}' }),
  );
  await page.click("form[data-mail] button[type=submit]");
  await expect(page.locator(".buf-scroll")).toContainText("sent ✓ — I'll reply within 2 days");
  expect(await page.evaluate(() => sessionStorage.getItem("mail-draft"))).toBeNull();
  await expect(page.locator("[role=status]")).toContainText("Mail sent");
});

test("/api/contact: validation, honeypot, rate limit", async ({ request }) => {
  const post = (data: object, ip: string) =>
    request.post("/api/contact", { data, headers: { "x-forwarded-for": ip } });
  const bad = await post({ name: "", email: "nope", message: "" }, "10.0.0.1");
  expect(bad.status()).toBe(422);
  expect((await bad.json()).errors.email).toMatch(/needs an @/);
  const bot = await post(
    { name: "Bot", email: "a@b.co", message: "x", website: "spam" },
    "10.0.0.2",
  );
  expect(bot.status()).toBe(200); // pretends to succeed, sends nothing
  const ok = { name: "A", email: "a@b.co", message: "hi" };
  const codes = [];
  for (let i = 0; i < 4; i++) codes.push((await post(ok, "10.0.0.3")).status());
  expect(codes.slice(0, 3).every((c) => c === 503 || c === 200 || c === 502)).toBe(true); // delivery depends on env
  expect(codes[3]).toBe(429);
});
