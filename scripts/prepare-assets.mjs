// Reads assets.manifest.json and writes web-ready files from Material/ to public/media/
// (docs/BUILD.md section 6). Never writes to Material/.
//
// Treatments run in the order the manifest lists them:
//   uncheck         remove a fake "transparency" checkerboard baked into a cutout: flood-fills
//                   from the edges over the checker's two colours, up to the sticker border
//   trim            crop away empty transparent space around a cutout
//   crop            cut strips off the edges, as fractions: "crop": { "bottom": 0.06 } (e.g. a screenshot's UI)
//   bw-halftone     black-and-white print: faded ink-on-paper duotone with chunky dots over it
//   colour-print    colour print: warmed, faded colour with a CMY dot screen over it
//   sticker-border  a white, slightly rough sticker border around a cutout
//   trace           ink on white (a scanned drawing) traced into an SVG path in currentColor.
//                   Must be last, and the out file must end in .svg.
// A src can be a scanned PDF (one page, one JPEG inside, like a phone scanner app makes):
// the JPEG is read straight out of it.
// Every file is resized to maxWidth first (never enlarged). AVIF/WebP and responsive
// sizes are served by next/image, so this writes one PNG or JPG per entry.
//
// It also writes src/generated/media-sizes.json (width and height of every file),
// so components can give next/image its sizes without guessing.
//
// Run with `npm run assets`. Add `-- <text>` to only run entries whose out path contains <text>.

import sharp from "sharp";
import potrace from "potrace";
import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, rmSync, statSync, writeFileSync } from "node:fs";
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

// The first JPEG inside a PDF. Scanner apps save each page as one JPEG, so this is the scan itself.
function jpegFromPdf(path) {
  const pdf = readFileSync(path);
  const at = pdf.indexOf("/DCTDecode");
  if (at < 0) throw new Error(`${path}: no JPEG inside`);
  const length = Number(pdf.toString("latin1", at, at + 300).match(/\/Length (\d+)/)?.[1]);
  let start = pdf.indexOf("stream", at) + "stream".length;
  if (pdf[start] === 13) start++;
  if (pdf[start] === 10) start++;
  return pdf.subarray(start, start + length);
}

// Ink lines on white paper into one SVG path. Faint scan lines and specks drop out.
async function trace(buffer) {
  const ink = await sharp(buffer).flatten({ background: "#ffffff" }).greyscale().threshold(170).trim({ threshold: 40 }).png().toBuffer();
  const { width, height } = await sharp(ink).metadata();
  const svg = await new Promise((resolve, reject) =>
    potrace.trace(ink, { threshold: 128, turdSize: 12, optTolerance: 0.3, color: "currentColor", background: "transparent" }, (err, out) =>
      err ? reject(err) : resolve(out),
    ),
  );
  return { svg: svg.replace(/<rect[^>]*\/>/, ""), width, height };
}

// A fake checkerboard "transparency" baked into an image (common in downloaded cutouts).
// The checker's two colours are read from the image's edge; everything joined to the edge
// in those colours becomes transparent. The cutout's own sticker border stops the fill.
async function uncheck(img) {
  const { data, info } = await img.ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const { width: w, height: h } = info;
  const at = (x, y) => (y * w + x) * 4;
  const lum = (i) => data[i] * 0.2126 + data[i + 1] * 0.7152 + data[i + 2] * 0.0722;
  const edge = [];
  for (let x = 0; x < w; x++) edge.push(at(x, 0), at(x, h - 1));
  for (let y = 0; y < h; y++) edge.push(at(0, y), at(w - 1, y));
  const lums = edge.map(lum).sort((a, b) => a - b);
  const checker = [lums[Math.floor(lums.length * 0.05)], lums[Math.floor(lums.length * 0.95)]];
  const near = (i) => {
    const sat = Math.max(data[i], data[i + 1], data[i + 2]) - Math.min(data[i], data[i + 1], data[i + 2]);
    const l = lum(i);
    return sat < 24 && checker.some((c) => Math.abs(l - c) < 22);
  };
  const seen = new Uint8Array(w * h);
  const stack = edge.filter(near).map((i) => i / 4);
  while (stack.length) {
    const p = stack.pop();
    if (seen[p]) continue;
    seen[p] = 1;
    const x = p % w;
    const y = (p - x) / w;
    for (const [nx, ny] of [[x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]]) {
      if (nx < 0 || ny < 0 || nx >= w || ny >= h) continue;
      const q = ny * w + nx;
      if (!seen[q] && near(q * 4)) stack.push(q);
    }
  }
  // Clear the filled pixels, and soften the one-pixel rim next to them.
  for (let p = 0; p < w * h; p++) if (seen[p]) data[p * 4 + 3] = 0;
  for (let y = 1; y < h - 1; y++) {
    for (let x = 1; x < w - 1; x++) {
      const p = y * w + x;
      if (seen[p]) continue;
      const open = seen[p - 1] + seen[p + 1] + seen[p - w] + seen[p + w];
      if (open) data[p * 4 + 3] = Math.round(255 * (1 - open * 0.15));
    }
  }
  return sharp(data, { raw: info });
}

const steps = {
  uncheck,
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
  trace: (img) => img, // runs at the end, on the finished bitmap
};

const sizes = existsSync(SIZES) ? JSON.parse(readFileSync(SIZES, "utf8")) : {};

// Videos (.mp4 out): muted H.264 with faststart, scaled so the long side is at most maxWidth,
// plus a poster frame (.jpg next to it) taken `posterAt` seconds in. Uses ffmpeg-static's binary
// if it was downloaded, else ffmpeg on the PATH. Without either, videos are skipped with a warning.
function findFfmpeg() {
  const local = "node_modules/ffmpeg-static/ffmpeg" + (process.platform === "win32" ? ".exe" : "");
  if (existsSync(local)) return local;
  return spawnSync("ffmpeg", ["-version"]).status === 0 ? "ffmpeg" : null;
}
function video(entry) {
  const ffmpeg = findFfmpeg();
  if (!ffmpeg) {
    console.warn(`skipped  ${entry.out} (no ffmpeg: run \`npm install-scripts approve ffmpeg-static && npm rebuild ffmpeg-static\`, or install ffmpeg)`);
    return;
  }
  mkdirSync(dirname(entry.out), { recursive: true });
  const long = entry.maxWidth;
  const run = (args) => {
    const r = spawnSync(ffmpeg, ["-y", "-loglevel", "error", ...args], { stdio: "inherit" });
    if (r.status !== 0) throw new Error(`${entry.out}: ffmpeg failed`);
  };
  run(["-i", entry.src, "-vf", `scale='if(gt(iw,ih),min(${long},iw),-2)':'if(gt(iw,ih),-2,min(${long},ih))'`, "-c:v", "libx264", "-crf", "26", "-preset", "veryfast", "-pix_fmt", "yuv420p", "-an", "-movflags", "+faststart", entry.out]);
  const poster = entry.out.replace(/\.mp4$/, ".jpg");
  run(["-ss", String(entry.posterAt ?? 2), "-i", entry.out, "-frames:v", "1", "-q:v", "3", poster]);
  return poster;
}

for (const entry of manifest) {
  if (only && !entry.out.includes(only)) continue;
  if (!existsSync(entry.src)) {
    console.warn(`missing  ${entry.src}`);
    continue;
  }
  if (entry.out.endsWith(".mp4")) {
    const poster = video(entry);
    if (poster) {
      const { width, height } = await sharp(poster).metadata();
      sizes[entry.out.replace(/^public/, "")] = { width, height };
      sizes[poster.replace(/^public/, "")] = { width, height };
      console.log(`${entry.out.replace(/^public/, "")}  ${width}x${height}  ${(statSync(entry.out).size / 1048576).toFixed(1)}MB (video)`);
    }
    continue;
  }
  const unknown = entry.treatment.filter((t) => !steps[t]);
  if (unknown.length) throw new Error(`${entry.out}: unknown treatment ${unknown.join(", ")}`);

  // Trim and crop before resizing, so maxWidth applies to what's left.
  const before = ["uncheck", "trim", "crop"];
  let img = sharp(entry.src.endsWith(".pdf") ? jpegFromPdf(entry.src) : entry.src).rotate();
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
  const web = entry.out.replace(/^public/, "");

  if (entry.treatment.includes("trace")) {
    if (!entry.out.endsWith(".svg")) throw new Error(`${entry.out}: trace writes an .svg`);
    const { svg, width, height } = await trace(buffer);
    writeFileSync(entry.out, svg);
    sizes[web] = { width, height };
    console.log(`${web}  ${width}x${height}  ${(svg.length / 1024).toFixed(0)}KB (traced)`);
    continue;
  }

  img = sharp(buffer);
  const out = entry.out.endsWith(".jpg")
    ? await img.flatten({ background: "#ffffff" }).jpeg({ quality: entry.quality ?? 86, mozjpeg: true }).toFile(entry.out)
    : await img.png({ compressionLevel: 9, effort: 8 }).toFile(entry.out);

  sizes[web] = { width: out.width, height: out.height };
  console.log(`${web}  ${out.width}x${out.height}  ${(out.size / 1024).toFixed(0)}KB`);
}

mkdirSync(dirname(SIZES), { recursive: true });
const sorted = Object.fromEntries(Object.entries(sizes).sort(([a], [b]) => a.localeCompare(b)));
writeFileSync(SIZES, JSON.stringify(sorted, null, 2) + "\n");

// next/image caches its resized copies by URL, so a changed file would keep showing the old
// version. Clear that cache whenever files are rewritten.
for (const cache of [".next/dev/cache/images", ".next/cache/images"]) rmSync(cache, { recursive: true, force: true });
