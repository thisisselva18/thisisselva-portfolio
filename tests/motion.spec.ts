// Scroll mode's motion (Phase 5): things are animated into their places and never moved from
// them; once in, they stay in; nothing pushes the page sideways at phone width; the year bar's
// dot only moves forward as you scroll down; the string draws itself and never draws back;
// and with reduced motion nothing moves at all.

import { expect, test, type Page } from "@playwright/test";

const MOVING = "main[data-journey] :is([data-pop], [data-fade], [data-sticky-note], [data-head-burst], [data-head-object], [data-head-note])";

async function scrollThrough(page: Page, step = 600, wait = 120) {
  const height = await page.evaluate(() => document.body.scrollHeight);
  for (let y = 0; y <= height; y += step) {
    await page.evaluate((y) => window.scrollTo(0, y), y);
    await page.waitForTimeout(wait);
  }
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await page.waitForTimeout(2500); // the last pile finishes
}

/** Where everything that moves has ended up, in page coordinates, plus each note's tilt. */
async function landed(page: Page) {
  return page.$$eval(MOVING, (els) => {
    // Cards hanging from the string sway (Phase 3/4, off with reduced motion); anything inside one
    // moves with it, so its own transform is checked instead of where it is.
    const swaying = Array.from(document.querySelectorAll<HTMLElement>("main [data-string-pin]")).map((pin) => pin.offsetParent);
    return els.map((el) => {
      const r = el.getBoundingClientRect();
      return {
        x: r.left + scrollX,
        y: r.top + scrollY,
        w: r.width,
        h: r.height,
        rotate: getComputedStyle(el).rotate,
        transform: getComputedStyle(el).transform,
        jitters: el.matches("[data-head-object]"),
        sways: swaying.some((card) => card && card !== el && card.contains(el)),
        what: `${el.closest("section")?.id} ${el.tagName} ${[...el.attributes].map((a) => a.name).filter((n) => n.startsWith("data-")).join(",")}`,
      };
    });
  });
}

test("motion animates things into their places and never moves where they end up", async ({ page, browser }) => {
  await page.goto("/");
  await page.waitForLoadState("networkidle");
  await scrollThrough(page);
  const moved = await landed(page);

  const context = await browser.newContext({ reducedMotion: "reduce", viewport: page.viewportSize()!, isMobile: test.info().project.name === "phone", hasTouch: test.info().project.name === "phone" });
  const still = await context.newPage();
  await still.goto("/");
  await still.waitForLoadState("networkidle");
  await scrollThrough(still);
  const expected = await landed(still);
  await context.close();

  expect(moved.length).toBe(expected.length);
  expect(moved.length).toBeGreaterThan(100);
  const off = moved.flatMap((m, i) => {
    const e = expected[i];
    if (m.sways) return m.transform === "none" && m.rotate === e.rotate ? [] : [{ i, moved: m, expected: e }];
    const slack = m.jitters ? 2 : 1; // the head's objects idle-jitter by up to 1.5px
    const bad = Math.abs(m.x - e.x) > slack || Math.abs(m.y - e.y) > slack || Math.abs(m.w - e.w) > 1 || Math.abs(m.h - e.h) > 1 || m.rotate !== e.rotate;
    return bad ? [{ i, moved: m, expected: e }] : [];
  });
  expect(off).toEqual([]);
});

test("once in, everything stays in, and each note keeps its tilt", async ({ page }) => {
  await page.goto("/");
  await scrollThrough(page);
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(600);
  const hidden = await page.$$eval(MOVING, (els) => els.filter((el) => !el.hasAttribute("data-entered") || getComputedStyle(el).opacity !== "1").length);
  expect(hidden).toBe(0);
  const untilted = await page.$$eval("main [data-sticky-note]", (notes) =>
    notes.filter((n) => getComputedStyle(n).rotate === "none" || getComputedStyle(n).transform !== "none").length,
  );
  expect(untilted).toBe(0);
});

test("the head opens without pushing the page sideways", async ({ page }) => {
  await page.goto("/", { waitUntil: "domcontentloaded" });
  const widths: number[] = [];
  for (let t = 0; t < 30; t++) {
    widths.push(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth));
    await page.waitForTimeout(100);
  }
  expect(Math.max(...widths)).toBeLessThanOrEqual(0);
  // It has opened: every object round the head has landed and shows.
  const shown = await page.$$eval("[data-head-object]", (els) => els.map((el) => getComputedStyle(el).opacity));
  expect(shown.length).toBeGreaterThan(0);
  expect(shown.every((o) => o === "1")).toBe(true);
});

test("the year bar shows from the first scene, and its dot only moves forward", async ({ page }) => {
  await page.goto("/");
  const bar = page.locator("[data-year-bar]");
  await expect(bar).toHaveAttribute("data-shown", "false");
  const height = await page.evaluate(() => document.body.scrollHeight);
  const at: number[] = [];
  for (let y = 0; y <= height; y += 700) {
    await page.evaluate((y) => window.scrollTo(0, y), y);
    await page.waitForTimeout(120);
    at.push(Number(await bar.getAttribute("data-at")));
  }
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await page.waitForTimeout(300);
  await expect(bar).toHaveAttribute("data-shown", "true");
  await expect(bar).toHaveAttribute("data-at", "1.0000");
  for (let i = 1; i < at.length; i++) expect(at[i]).toBeGreaterThanOrEqual(at[i - 1]);
});

test("the string draws itself down the page and never draws back", async ({ page }) => {
  await page.goto("/");
  await page.waitForTimeout(500);
  const tip = () => page.locator("[data-string-tip]").getAttribute("height").then(Number);
  const start = await tip();
  await page.evaluate(() => window.scrollTo(0, 4000));
  await page.waitForTimeout(400);
  const down = await tip();
  expect(down).toBeGreaterThan(start + 3000);
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(400);
  expect(await tip()).toBe(down);
});

test("with reduced motion nothing moves: things fade in, in place, and the string is simply there", async ({ browser }) => {
  const context = await browser.newContext({ reducedMotion: "reduce" });
  const page = await context.newPage();
  await page.goto("/", { waitUntil: "domcontentloaded" });
  const transformed = () =>
    page.$$eval(MOVING, (els) => els.filter((el) => getComputedStyle(el).transform !== "none").length);
  for (let t = 0; t < 8; t++) {
    expect(await transformed()).toBe(0);
    await page.waitForTimeout(150);
  }
  await scrollThrough(page, 800, 80);
  expect(await transformed()).toBe(0);
  expect(await page.locator("[data-red-string] g[clip-path]").count()).toBe(0);
  await context.close();
});
