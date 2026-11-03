// Scroll mode (Phase 4): the whole portfolio reads top to bottom on a phone and a laptop,
// and every link in src/content/ is on the page and goes to the right place.

import { expect, test, type Page } from "@playwright/test";
import { head, timeline, zoomOut } from "../src/content/scenes";
import { site } from "../src/content/site";

const contentLinks = [...timeline.flatMap((s) => s.notes.flatMap((n) => n.links ?? [])), ...site.end.links];

async function scrollThrough(page: Page) {
  const height = await page.evaluate(() => document.body.scrollHeight);
  for (let y = 0; y < height; y += 800) {
    await page.evaluate((y) => window.scrollTo(0, y), y);
    await page.waitForTimeout(60);
  }
  await page.waitForLoadState("networkidle");
}

test("the journey loads with no errors, no missing media and no sideways scroll", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
  page.on("response", (r) => r.status() >= 400 && errors.push(`${r.status()} ${r.url()}`));
  await page.goto("/");
  await scrollThrough(page);

  expect(errors).toEqual([]);
  expect(await page.locator("[data-missing-media]").count()).toBe(0);
  const { scroll, client } = await page.evaluate(() => ({ scroll: document.documentElement.scrollWidth, client: document.documentElement.clientWidth }));
  expect(scroll).toBeLessThanOrEqual(client);
});

test("every scene is on the page, in order, with its first supertitle", async ({ page }) => {
  await page.goto("/");
  const ids = await page.$$eval("main section", (s) => s.map((e) => e.id));
  expect(ids).toEqual([head.id, ...timeline.map((s) => s.id), "the-end"]);
  // Each scene's first line is its heading, named once (the paper strip under it is a hidden copy).
  for (const s of [head, ...timeline, zoomOut]) await expect(page.getByRole("heading", { name: s.supertitles[0].text, exact: true })).toBeVisible();
});

test("every link in the content is a link on the page", async ({ page }) => {
  await page.goto("/");
  const hrefs = await page.$$eval("main a[href]", (as) => as.map((a) => a.getAttribute("href")));
  for (const link of contentLinks) expect(hrefs, link.href).toContain(link.href);
  // External links open in a new tab, safely.
  const unsafe = await page.$$eval("main a[href^='http']", (as) =>
    as.filter((a) => a.getAttribute("target") !== "_blank" || !(a.getAttribute("rel") ?? "").includes("noopener")).map((a) => a.getAttribute("href")),
  );
  expect(unsafe).toEqual([]);
});

test("one red string ties the head, every scene's cluster and the end", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("main [data-string-pin]")).toHaveCount(timeline.length + 2);
  for (const s of timeline) await expect(page.locator(`#${s.id} [data-string-pin]`)).toHaveCount(1);
});

test("with reduced motion, nothing on the string sways", async ({ browser }) => {
  const context = await browser.newContext({ reducedMotion: "reduce" });
  const page = await context.newPage();
  await page.goto("/");
  await page.waitForTimeout(1500);
  const moved = await page.$$eval("main [data-string-pin]", (pins) =>
    pins.map((p) => p.closest("figure")).filter((f) => f && getComputedStyle(f).transform !== "none").length,
  );
  expect(moved).toBe(0);
  await context.close();
});
