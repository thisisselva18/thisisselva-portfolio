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
  // Let the notes finish their stick (it plays once on /kit), so the layout is at rest.
  await page.waitForFunction(() => !document.querySelector('[data-sticky-note][style*="transform"]'));

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
test("an Instagram reel is a screenshot with its button, not a player", async ({ page }) => {
  await page.goto("/kit");
  await expect(page.locator('iframe[src*="instagram.com"]')).toHaveCount(0);
  await expect(page.locator('img[src*="DN8dYkhCac1"]')).toHaveCount(1);
  // Nothing to tap on the reel itself: the only way through is the button to the original.
  await expect(page.locator('button:has(img[src*="DN8dYkhCac1"])')).toHaveCount(0);
  await expect(page.locator('a[href="https://www.instagram.com/reel/DN8dYkhCac1"]').first()).toBeVisible();
});

// Records every inline style a note is given, so the test sees each stop-motion pose.
const watchStyles = (note: import("@playwright/test").Locator) =>
  note.evaluate((el) => {
    const seen: string[] = [];
    (window as unknown as { __poses: string[] }).__poses = seen;
    new MutationObserver(() => seen.push((el as HTMLElement).style.transform)).observe(el, { attributes: true, attributeFilter: ["style"] });
  });
const poses = (page: import("@playwright/test").Page) => page.evaluate(() => (window as unknown as { __poses: string[] }).__poses);

// The stick: a note drops in, its top sticks, its bottom flaps once, and it stays stuck.
test("sticky notes stick in and stay stuck", async ({ page }) => {
  await page.goto("/kit");
  await page.waitForLoadState("networkidle");
  const note = page.locator("[data-stick-replay] [data-sticky-note]").first();
  await note.scrollIntoViewIfNeeded();
  await watchStyles(note);
  await page.locator("[data-replay]").click();
  await page.waitForTimeout(1200);
  // It went through held, tilted poses (the bottom edge lifted, then flapping)...
  const tilted = (await poses(page)).filter((t) => t.includes("rotateX"));
  expect(tilted.length).toBeGreaterThanOrEqual(4);
  // ...and ended flat, fully there, with GSAP letting go of it.
  expect(await note.evaluate((el) => getComputedStyle(el).transform)).toBe("none");
  expect(await note.evaluate((el) => getComputedStyle(el).opacity)).toBe("1");
});

test("with reduced motion, notes only fade in, already stuck", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/kit");
  await page.waitForLoadState("networkidle");
  const note = page.locator("[data-stick-replay] [data-sticky-note]").first();
  await note.scrollIntoViewIfNeeded();
  await watchStyles(note);
  await page.locator("[data-replay]").click();
  await page.waitForTimeout(1200);
  expect((await poses(page)).filter((t) => t !== "")).toEqual([]);
  expect(await note.evaluate((el) => getComputedStyle(el).opacity)).toBe("1");
});

// Decoration is hidden from screen readers: newsprint, scribbles, the burst, the string, the dot.
test("decorations are hidden from screen readers", async ({ page }) => {
  await page.goto("/kit");
  const exposed = await page.evaluate(() =>
    Array.from(document.querySelectorAll("textPath, [data-dot], svg path, .marker-arrow"))
      .filter((el) => !el.closest('[aria-hidden="true"], [aria-hidden=""]'))
      .map((el) => el.outerHTML.slice(0, 80)),
  );
  expect(exposed).toEqual([]);
});

// A link that wraps gets one marker line under each of its lines.
test("a wrapped link is underlined line by line", async ({ page }) => {
  await page.goto("/kit");
  const wraps = page.locator(".marker-link-wrap[data-measured]");
  await expect(wraps.first()).toBeVisible();
  const counts = await wraps.evaluateAll((els) =>
    els.map((el) => ({
      lines: el.querySelector(".marker-link")!.getClientRects().length,
      underlines: el.querySelectorAll(".marker-link__lines > svg").length,
    })),
  );
  for (const c of counts) expect(c.underlines).toBe(c.lines);
});

// Cards hung on the red string sway from their pin: they move, the pin doesn't.
test("cards on the string sway from their pins", async ({ page }) => {
  await page.goto("/kit");
  await page.waitForLoadState("networkidle");
  const sample = page.locator("section", { hasText: "Red string sample" });
  await sample.scrollIntoViewIfNeeded();
  const read = () =>
    sample.evaluate((el) =>
      Array.from(el.querySelectorAll<HTMLElement>("[data-string-pin]")).map((pin) => {
        const r = pin.getBoundingClientRect();
        const box = el.getBoundingClientRect(); // relative to the section, so scrolling doesn't count
        return { pin: [r.left + r.width / 2 - box.left, r.top + r.height / 2 - box.top], card: (pin.offsetParent as HTMLElement).style.transform };
      }),
    );
  const before = await read();
  await page.waitForTimeout(900);
  const after = await read();
  expect(before).toHaveLength(2);
  before.forEach((b, i) => {
    expect(after[i].card, "the card swings").not.toBe(b.card);
    expect(Math.abs(after[i].pin[0] - b.pin[0]), "the pin stays put").toBeLessThan(1);
    expect(Math.abs(after[i].pin[1] - b.pin[1]), "the pin stays put").toBeLessThan(1);
  });
});

test("with reduced motion, the cards on the string hang still", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/kit");
  await page.waitForLoadState("networkidle");
  const transforms = await page
    .locator("section", { hasText: "Red string sample" })
    .evaluate((el) => Array.from(el.querySelectorAll<HTMLElement>("[data-string-pin]")).map((pin) => (pin.offsetParent as HTMLElement).style.transform));
  expect(transforms).toEqual(["", ""]);
});
