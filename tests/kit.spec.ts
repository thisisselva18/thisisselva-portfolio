import { expect, test } from "@playwright/test";

// /kit shows every design-kit piece. Screenshots go to test-results/ for a person to look at.
test("the kit renders every piece without errors", async ({ page, viewport }, testInfo) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  page.on("console", (m) => {
    if (m.type() === "error") errors.push(m.text());
  });

  await page.goto("/kit");
  await page.waitForLoadState("networkidle");

  // Every sample's media has been prepared by `npm run assets`.
  await expect(page.locator("[data-missing-media]")).toHaveCount(0);

  // Nothing pushes the page sideways on a phone.
  // A phone browser widens its layout to fit overflow, so compare with the width asked for.
  const width = await page.evaluate(() => document.documentElement.scrollWidth);
  expect(width).toBeLessThanOrEqual(viewport!.width);

  // Wait for lazy images, then take the screenshot.
  await page.evaluate(async () => {
    for (let y = 0; y < document.body.scrollHeight; y += 600) {
      window.scrollTo(0, y);
      await new Promise((r) => requestAnimationFrame(r));
    }
    window.scrollTo(0, 0);
  });
  await page.waitForLoadState("networkidle");
  await page.screenshot({ path: testInfo.outputPath("kit.png"), fullPage: true });

  expect(errors).toEqual([]);
});
