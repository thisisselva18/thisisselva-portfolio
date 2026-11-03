// Colours and faces only come from src/styles/tokens.css (CLAUDE.md). This fails if a
// component or stylesheet writes a colour or font family of its own.
// Run with `npm run test:content`.

import { test } from "node:test";
import assert from "node:assert/strict";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

const files = (dir) =>
  readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    return statSync(path).isDirectory() ? files(path) : [path];
  });

const checked = [...files("src/components"), ...files("src/app"), "src/styles/materials.css"].filter((f) =>
  /\.(tsx?|css)$/.test(f),
);

test("no hard-coded colours outside tokens.css", () => {
  const colour = /#[0-9a-f]{3,8}\b|\b(?:rgba?|hsla?|oklch|oklab)\(/gi;
  const found = checked.flatMap((f) =>
    readFileSync(f, "utf8")
      .split("\n")
      .flatMap((line, i) => (line.match(colour) ? [`${f}:${i + 1}: ${line.trim()}`] : [])),
  );
  assert.deepEqual(found, []);
});

test("no font families outside tokens.css", () => {
  const found = checked.flatMap((f) =>
    readFileSync(f, "utf8")
      .split("\n")
      .flatMap((line, i) => (/font-family:(?!\s*var\()/.test(line) ? [`${f}:${i + 1}: ${line.trim()}`] : [])),
  );
  assert.deepEqual(found, []);
});
