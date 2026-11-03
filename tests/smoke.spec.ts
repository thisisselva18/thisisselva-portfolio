import { expect, test } from "@playwright/test";

test("the page sits on textured paper", async ({ page }, testInfo) => {
  const textures: string[] = [];
  page.on("response", (r) => {
    if (r.url().includes("/textures/") && r.ok()) textures.push(new URL(r.url()).pathname);
  });

  await page.goto("/");
  await page.waitForLoadState("networkidle");

  const background = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);
  expect(background).toBe("rgb(246, 243, 236)");
  expect(textures.sort()).toEqual(["/textures/paper-tone.webp", "/textures/paper.webp"]);

  await page.screenshot({ path: testInfo.outputPath("home.png"), fullPage: true });
});

test("all four faces load", async ({ page }) => {
  await page.goto("/");

  for (const token of ["--face-serif", "--face-heart", "--face-sans", "--face-mono"]) {
    const loaded = await page.evaluate(async (name) => {
      const family = getComputedStyle(document.documentElement).getPropertyValue(name).split(",")[0].trim();
      const faces = await document.fonts.load(`48px ${family}`);
      return { family, count: faces.length };
    }, token);
    expect(loaded.count, `${token} (${loaded.family})`).toBeGreaterThan(0);
  }
});
