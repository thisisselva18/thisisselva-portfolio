import { expect, test } from "@playwright/test";
import { timeline } from "../src/content/scenes";

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

// Reels show a cover until tapped; only then does Instagram's player load.
test("an Instagram reel loads its player only when tapped", async ({ page }, testInfo) => {
  await page.goto("/kit");
  await expect(page.locator('iframe[src*="instagram.com"]')).toHaveCount(0);

  // The club reels share their set's title as their name.
  const reels = timeline.flatMap((s) => s.notes).flatMap((n) => n.media ?? []).find((set) => set.items.some((m) => "id" in m && m.id === "DN8dYkhCac1"));
  const cover = page.getByRole("button", { name: reels?.alt });
  await cover.scrollIntoViewIfNeeded();
  await cover.click();

  const player = page.locator('iframe[src="https://www.instagram.com/p/DN8dYkhCac1/embed"]');
  await expect(player).toHaveCount(1);
  await page.waitForTimeout(3000); // Instagram's page is outside our control; this is only for the screenshot
  await player.screenshot({ path: testInfo.outputPath("instagram-playing.png") });
});
