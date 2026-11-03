// Reads assets.manifest.json and writes web-ready files from Material/ to public/media/
// (docs/BUILD.md section 6). Never writes to Material/.
//
// Treatments run in the order the manifest lists them:
//   trim            crop away empty transparent space around a cutout
//   crop            cut strips off the edges, as fractions: "crop": { "bottom": 0.06 } (e.g. a screenshot's UI)
//   bw-halftone     black-and-white print: faded ink-on-paper duotone with chunky dots over it
//   colour-print    colour print: warmed, faded colour with a CMY dot screen over it
//   sticker-border  a white, slightly rough sticker border around a cutout
// Every file is resized to maxWidth first (never enlarged). AVIF/WebP and responsive
// sizes are served by next/image, so this writes one PNG or JPG per entry.
//
// It also writes src/generated/media-sizes.json (width and height of every file),
// so components can give next/image its sizes without guessing.
//
// Run with `npm run assets`. Add `-- <text>` to only run entries whose out path contains <text>.

import sharp from "sharp";
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";

const manifest = JSON.parse(readFileSync("assets.manifest.json", "utf8"));
const only = process.argv[2];
const SIZES = "src/generated/media-sizes.json";

// Ink and paper come from the design tokens, so the dots are the site's ink.
const tokens = readFileSync("src/styles/tokens.css", "utf8");
const hex = (name) => {
  const m = tokens.match(new RegExp(`--${name}:\\s*#([0-9a-f]{6})`, "i"));
  if (!m) throw new Error(`--${name} isn't in tokens.css`);
  return [0, 2, 4].map((i) => parseInt(m[1].slice(i, i + 2), 16) / 255);
};
const INK = hex("ink");
const PAPER = hex("paper");

const smooth = (edge0, edge1, x) => {
  const t = Math.min(1, Math.max(0, (x - edge0) / (edge1 - edge0)));
  return t * t * (3 - 2 * t);
};
const mix = (a, b, t) => a + (b - a) * t;

// How much of a pixel a halftone dot covers. The grid is rotated by `angle`, each cell
// is `cell` px, and the dot's area follows the ink amount at that pixel (0..1).
function dotCover(x, y, ink, cell, angle) {
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);
  const u = (x * cos + y * sin) / cell;
  const v = (-x * sin + y * cos) / cell;
  const du = (u - Math.floor(u) - 0.5) * cell;
  const dv = (v - Math.floor(v) - 0.5) * cell;
  const d = Math.hypot(du, dv);
  const r = cell * 0.5 * Math.SQRT2 * Math.sqrt(Math.min(1, Math.max(0, ink)));
  return 1 - smooth(r - 0.75, r + 0.75, d);
}

// Chunky, printed dots: about 110 across the image, never under 5px.
const cellFor = (width) => Math.max(5, Math.round(width / 110));

async function bwHalftone(img) {
  const { data, info } = await img.ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const cell = cellFor(info.width);
  const angle = Math.PI / 4;
  for (let y = 0; y < info.height; y++) {
    for (let x = 0; x < info.width; x++) {
      const i = (y * info.width + x) * 4;
      const lum = (0.2126 * data[i] + 0.7152 * data[i + 1] + 0.0722 * data[i + 2]) / 255;
      const tone = 0.05 + smooth(0, 1, lum) * 0.9; // a little contrast, then faded: no pure black or white
      const ink = 1 - tone;
      const dots = dotCover(x, y, ink, cell, angle);
      // A soft duotone underneath keeps faces readable; the dots sit on top.
      const amount = mix(ink * 0.7, dots, 0.55);
      for (let c = 0; c < 3; c++) data[i + c] = Math.round(mix(PAPER[c], INK[c], amount) * 255);
    }
  }
  return sharp(data, { raw: info });
}

async function colourPrint(img) {
  const { data, info } = await img.ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const cell = cellFor(info.width);
  const angles = [(15 * Math.PI) / 180, (75 * Math.PI) / 180, 0]; // cyan, magenta, yellow screens
  for (let y = 0; y < info.height; y++) {
    for (let x = 0; x < info.width; x++) {
      const i = (y * info.width + x) * 4;
      let rgb = [data[i] / 255, data[i + 1] / 255, data[i + 2] / 255];
      const grey = 0.2126 * rgb[0] + 0.7152 * rgb[1] + 0.0722 * rgb[2];
      rgb = rgb.map((v) => mix(v, grey, 0.18)); // a little faded
      rgb = [rgb[0] * 1.02, rgb[1], rgb[2] * 0.93]; // a little warm
      rgb = rgb.map((v, c) => mix(PAPER[c] * 0.08, PAPER[c], Math.min(1, v)) * 0.94 + 0.03); // printed on paper
      for (let c = 0; c < 3; c++) {
        const ink = 1 - rgb[c];
        const dots = 1 - dotCover(x, y, ink, cell, angles[c]);
        // Dots fade out in the highlights, so light areas don't sparkle with colour.
        const strength = 0.32 * smooth(0.08, 0.35, ink);
        data[i + c] = Math.round(Math.min(1, Math.max(0, mix(rgb[c], dots, strength))) * 255);
      }
    }
  }
  return sharp(data, { raw: info });
}

// A white border that follows the cutout's outline, with a slightly rough edge.
async function stickerBorder(img) {
  const meta = await img.metadata();
  const border = Math.max(6, Math.round(meta.width * 0.012));
  const pad = border + 4;
  const padded = await img
    .extend({ top: pad, bottom: pad, left: pad, right: pad, background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toBuffer();
  const { data: alpha, info } = await sharp(padded)
    .extractChannel(3)
    .blur(border * 0.6)
    .raw()
    .toBuffer({ resolveWithObject: true });

  // Threshold the blurred alpha into a grown outline. A wobble in the threshold roughens the edge.
  const mask = Buffer.alloc(info.width * info.height);
  for (let y = 0; y < info.height; y++) {
    for (let x = 0; x < info.width; x++) {
      const wobble = Math.sin(x * 0.21 + y * 0.07) * Math.sin(y * 0.17 - x * 0.05) * 6;
      const a = alpha[y * info.width + x];
      mask[y * info.width + x] = Math.round(smooth(8 + wobble, 22 + wobble, a) * 255);
    }
  }
  const white = await sharp({ create: { width: info.width, height: info.height, channels: 3, background: "#ffffff" } })
    .joinChannel(mask, { raw: { width: info.width, height: info.height, channels: 1 } })
    .png()
    .toBuffer();
  return sharp(white).composite([{ input: padded }]);
}

const steps = {
  trim: (img) => img.trim({ threshold: 1 }),
  crop: async (img, entry) => {
    const { width, height } = await img.metadata();
    const c = { top: 0, right: 0, bottom: 0, left: 0, ...entry.crop };
    const left = Math.round(width * c.left);
    const top = Math.round(height * c.top);
    return img.extract({
      left,
      top,
      width: width - left - Math.round(width * c.right),
      height: height - top - Math.round(height * c.bottom),
    });
  },
  "bw-halftone": bwHalftone,
  "colour-print": colourPrint,
  "sticker-border": stickerBorder,
};

const sizes = existsSync(SIZES) ? JSON.parse(readFileSync(SIZES, "utf8")) : {};

for (const entry of manifest) {
  if (only && !entry.out.includes(only)) continue;
  if (!existsSync(entry.src)) {
    console.warn(`missing  ${entry.src}`);
    continue;
  }
  const unknown = entry.treatment.filter((t) => !steps[t]);
  if (unknown.length) throw new Error(`${entry.out}: unknown treatment ${unknown.join(", ")}`);

  // Trim and crop before resizing, so maxWidth applies to what's left.
  const before = ["trim", "crop"];
  let img = sharp(entry.src).rotate();
  let buffer = await img.png().toBuffer();
  for (const t of entry.treatment) {
    if (before.includes(t)) buffer = await (await steps[t](sharp(buffer), entry)).png().toBuffer();
  }
  buffer = await sharp(buffer).resize({ width: entry.maxWidth, withoutEnlargement: true }).png().toBuffer();
  for (const t of entry.treatment) {
    if (before.includes(t)) continue;
    buffer = await (await steps[t](sharp(buffer))).png().toBuffer();
  }

  mkdirSync(dirname(entry.out), { recursive: true });
  img = sharp(buffer);
  const out = entry.out.endsWith(".jpg")
    ? await img.flatten({ background: "#ffffff" }).jpeg({ quality: 86, mozjpeg: true }).toFile(entry.out)
    : await img.png({ compressionLevel: 9, effort: 8 }).toFile(entry.out);

  const web = entry.out.replace(/^public/, "");
  sizes[web] = { width: out.width, height: out.height };
  console.log(`${web}  ${out.width}x${out.height}  ${(out.size / 1024).toFixed(0)}KB`);
}

mkdirSync(dirname(SIZES), { recursive: true });
const sorted = Object.fromEntries(Object.entries(sizes).sort(([a], [b]) => a.localeCompare(b)));
writeFileSync(SIZES, JSON.stringify(sorted, null, 2) + "\n");

// next/image caches its resized copies by URL, so a changed file would keep showing the old
// version. Clear that cache whenever files are rewritten.
for (const cache of [".next/dev/cache/images", ".next/cache/images"]) rmSync(cache, { recursive: true, force: true });
