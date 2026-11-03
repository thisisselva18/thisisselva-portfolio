// Checks src/content/ against docs/script.md, both ways:
//   - every word in src/content/ is in the script (nothing invented)
//   - every on-screen line, detail paragraph, link and timecode in the script is in src/content/
// plus the story timing. Run with `npm run test:content`.
//
// docs/ is private and not in the repo, so this skips itself when the script isn't there.

import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";

import { site } from "../src/content/site.ts";
import { intro } from "../src/content/intro.ts";
import { head, timeline, zoomOut, yearBar } from "../src/content/scenes.ts";

const SCRIPT = new URL("../docs/script.md", import.meta.url);
const skip = existsSync(SCRIPT) ? false : "docs/script.md isn't here (docs/ is private)";

// Words that came from the user, not the script.
const FROM_USER = new Set([site.title, site.description]);

const norm = (s) => s.replace(/\s+/g, " ").trim();

// script.md as paragraphs, with pandoc's markdown escapes undone.
function readScript() {
  const paragraphs = [];
  let buf = [];
  let quoted = false;
  const flush = () => {
    if (buf.length) paragraphs.push({ text: norm(buf.join(" ")), quoted });
    buf = [];
  };
  for (let line of readFileSync(SCRIPT, "utf8").split(/\r?\n/)) {
    if (line.startsWith("<!--")) continue;
    const isQuote = line.startsWith(">");
    line = line.replace(/^>\s?/, "").replace(/<\/?u>/g, "").replace(/\\([-|#_*[\]()>])/g, "$1");
    if (!line.trim()) {
      flush();
      continue;
    }
    if (!buf.length) quoted = isQuote;
    buf.push(line.replace(/\\$/, "").trim());
    if (!/( {2}|\\)$/.test(line)) flush();
  }
  flush();
  return paragraphs;
}

// Every copy string in the content, with the key it sits under.
function collect(node, key, out) {
  if (typeof node === "string") {
    out.push({ key, value: node });
  } else if (Array.isArray(node)) {
    for (const item of node) collect(item, key, out);
  } else if (node && typeof node === "object") {
    const isEmbed = node.kind === "youtube" || node.kind === "instagram";
    const isMediaSet = Array.isArray(node.items);
    for (const [k, v] of Object.entries(node)) {
      if (["alt", "tag", "views"].includes(k) || (isEmbed && k === "title")) continue; // from the user
      if (isMediaSet && k === "label") continue; // for builders only, never shown
      collect(v, k, out);
    }
  }
  return out;
}

const COPY_KEYS = new Set(["text", "heading", "body", "label", "cornerTag", "group", "visual", "button", "pause", "replay", "title", "artist", "from", "to"]);
const content = { site, intro, head, timeline, zoomOut, yearBar };
const strings = collect(content, "", []).filter((s) => COPY_KEYS.has(s.key));
const hrefs = collect(content, "", []).filter((s) => s.key === "href").map((s) => s.value);
const shown = new Set(strings.filter((s) => s.key !== "visual").map((s) => norm(s.value)));

test("every word in src/content/ is in the script", { skip }, () => {
  const script = readScript().map((p) => p.text).join("\n");
  const missing = strings
    .flatMap((s) => (s.key === "visual" ? s.value.split("\n") : [s.value]))
    .map(norm)
    .filter((v) => v && !FROM_USER.has(v) && !script.includes(v));
  assert.deepEqual(missing, [], "these aren't in docs/script.md word for word");
});

test("every stat is a word-for-word piece of the script", { skip }, () => {
  const script = readScript().map((p) => p.text).join("\n");
  const stats = timeline.filter((s) => s.stat);
  assert.ok(stats.length > 0, "found the stats");
  assert.deepEqual(stats.filter((s) => !script.includes(s.stat)).map((s) => `${s.id}: ${s.stat}`), []);
});

test("every on-screen line in the script is in src/content/", { skip }, () => {
  const missing = [];
  for (const { text } of readScript()) {
    const supertitle = text.match(/^SUPERTITLE(?: \((?:SMALL|CORNER)\))?: (.+)$/);
    const button = text.match(/^BUTTON: (.+?)(?: \(.*\))?(?: – .*)?$/);
    const line = supertitle?.[1] ?? button?.[1];
    if (line && !shown.has(line)) missing.push(text);
  }
  assert.deepEqual(missing, []);
});

test("every detail paragraph in the script is in src/content/", { skip }, () => {
  const bodies = new Set(strings.filter((s) => s.key === "body").map((s) => norm(s.value)));
  const missing = readScript()
    .filter((p) => p.quoted && p.text !== "SELVA (ON SCREEN)")
    .map((p) => p.text)
    .filter((t) => !bodies.has(t));
  assert.deepEqual(missing, []);
});

test("every link in the script is in src/content/", { skip }, () => {
  const bare = (u) => u.replace(/^https?:\/\/(www\.)?/, "");
  const ours = new Set(hrefs.map(bare));
  const urls = (text) => text.match(/\b[a-z0-9.-]+\.(?:com|be)\/[^\s|)]+/gi) ?? [];
  const lines = readScript().filter((p) => /^(LINKS?|REELS|EMBED \+ LINK|BUTTON|SUPERTITLE \(SMALL\)):?/.test(p.text));

  // Guards the pattern itself: a line that exists only to carry links must yield at least one.
  const unread = lines.filter((p) => /^(LINKS?|REELS|EMBED \+ LINK)/.test(p.text) && !urls(p.text).length);
  assert.deepEqual(unread.map((p) => p.text), [], "link lines the pattern couldn't read");

  const theirs = lines.flatMap((p) => urls(p.text));
  assert.deepEqual(theirs.filter((u) => !ours.has(u)), []);
});

test("every timecode in the script is in src/content/", { skip }, () => {
  const ours = new Set([...intro, head, ...timeline, zoomOut, site.end].map((m) => m.timecode));
  const theirs = readScript()
    .map((p) => p.text.match(/– (\d+):(\d\d)\b/))
    .filter(Boolean)
    .map(([, m, s]) => Number(m) * 60 + Number(s));
  assert.ok(theirs.length > 20, "found the script's timecodes");
  assert.deepEqual(theirs.filter((t) => !ours.has(t)), []);
});

test("the story runs 0:00 to 1:30 with no gaps", () => {
  const moments = [...intro, head, ...timeline, zoomOut, site.end];
  assert.equal(moments[0].timecode, 0);
  for (let i = 0; i < moments.length - 1; i++) {
    assert.equal(moments[i].holdFor, moments[i + 1].timecode - moments[i].timecode, `holdFor of ${moments[i].id ?? "the end"}`);
  }
  assert.equal(site.end.timecode + site.end.holdFor, 90, '"Hit me up!" lands at 1:30');
});

test("timeline sides alternate, starting on the left", () => {
  timeline.forEach((scene, i) => assert.equal(scene.side, i % 2 ? "right" : "left", scene.id));
});

test("Geist Serif Heart is used exactly once", () => {
  const hearts = collect(content, "", []).filter((s) => s.key === "face" && s.value === "heart");
  assert.equal(hearts.length, 1);
});

test("words still to come from the user", (t) => {
  const pending = [];
  const walk = (node, where) => {
    if (Array.isArray(node)) return node.forEach((n) => walk(n, where));
    if (!node || typeof node !== "object") return;
    if (node.kind === "youtube" || node.kind === "instagram") {
      if (!node.title) pending.push(`${where}: title for ${node.kind} ${node.id}`);
    } else if (node.kind && !node.alt) pending.push(`${where}: alt for ${node.src}`);
    for (const [k, v] of Object.entries(node)) if (k !== "items") walk(v, node.id ?? where);
    if (node.items) walk(node.items, node.alt ? `${where} (set has group alt)` : where);
  };
  walk(content, "site");
  t.diagnostic(`${pending.length} pending (fine for now: alt text and embed titles come from docs/media-review.html)`);
});
