// Draws the paper textures once and writes them to public/textures/.
// A placeholder until a real paper scan replaces it (same file names).
//
//   paper.webp       1024px seamless grain with faint fibres
//   paper-tone.webp  512px seamless soft blotches, shown stretched to 1600px
//   note.webp        512px fine, smooth grain for the sticky notes
//   kraft.webp       512px coarse grain with long fibres, for kraft scraps and corner tags
//   tape.webp        512px streaky grain running along the tape, for kraft tape
//
// Run with `npm run textures`. Every noise layer wraps at the tile edge, so both tile without seams.

import sharp from "sharp";
import { mkdirSync } from "node:fs";

const OUT = "public/textures";

// Seeded random, so the textures come out the same every run.
function rng(seed) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Value noise on a grid that wraps every `period` cells.
function tiledNoise(size, period, random) {
  const grid = Float32Array.from({ length: period * period }, random);
  const out = new Float32Array(size * size);
  const fade = (t) => t * t * (3 - 2 * t);
  for (let y = 0; y < size; y++) {
    const gy = (y / size) * period;
    const y0 = Math.floor(gy);
    const y1 = (y0 + 1) % period;
    const ty = fade(gy - y0);
    for (let x = 0; x < size; x++) {
      const gx = (x / size) * period;
      const x0 = Math.floor(gx);
      const x1 = (x0 + 1) % period;
      const tx = fade(gx - x0);
      const a = grid[y0 * period + x0];
      const b = grid[y0 * period + x1];
      const c = grid[y1 * period + x0];
      const d = grid[y1 * period + x1];
      out[y * size + x] = (a + (b - a) * tx) * (1 - ty) + (c + (d - c) * tx) * ty;
    }
  }
  return out;
}

// Sum of octaves, each period doubling. Returns values roughly in 0..1.
function fractal(size, basePeriod, octaves, random) {
  const out = new Float32Array(size * size);
  let amp = 1;
  let total = 0;
  for (let o = 0; o < octaves; o++) {
    const layer = tiledNoise(size, basePeriod << o, random);
    for (let i = 0; i < out.length; i++) out[i] += layer[i] * amp;
    total += amp;
    amp *= 0.5;
  }
  for (let i = 0; i < out.length; i++) out[i] /= total;
  return out;
}

// A light box blur that wraps, to soften per-pixel noise into grain.
function blurWrap(src, size) {
  const out = new Float32Array(src.length);
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      let sum = 0;
      for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
          sum += src[((y + dy + size) % size) * size + ((x + dx + size) % size)];
        }
      }
      out[y * size + x] = sum / 9;
    }
  }
  return out;
}

function toWebp(values, size, file, quality) {
  const pixels = Buffer.alloc(size * size);
  for (let i = 0; i < values.length; i++) {
    pixels[i] = Math.round(Math.min(1, Math.max(0, values[i])) * 255);
  }
  return sharp(pixels, { raw: { width: size, height: size, channels: 1 } })
    .webp({ quality, effort: 6 })
    .toFile(`${OUT}/${file}`);
}

// Fibres: short, slightly curved strands, mostly darker, a few lighter. They wrap at the edge.
function fibres(values, size, random, { count, min, max, dark, strength, angle: fixed }) {
  for (let f = 0; f < count; f++) {
    let x = random() * size;
    let y = random() * size;
    let angle = fixed === undefined ? random() * Math.PI * 2 : fixed + (random() - 0.5) * 0.3;
    const length = min + random() * (max - min);
    const bend = (random() - 0.5) * 0.008;
    const amount = (random() < dark ? -1 : 0.6) * (0.08 + random() * strength);
    for (let s = 0; s < length; s++) {
      angle += bend;
      x += Math.cos(angle);
      y += Math.sin(angle);
      const px = ((Math.round(x) % size) + size) % size;
      const py = ((Math.round(y) % size) + size) % size;
      values[py * size + px] += amount;
    }
  }
}

function grain() {
  const size = 1024;
  const random = rng(1994);

  const white = blurWrap(Float32Array.from({ length: size * size }, random), size);
  const tooth = fractal(size, 64, 3, random);
  const values = new Float32Array(size * size);
  for (let i = 0; i < values.length; i++) {
    values[i] = 0.78 + (white[i] - 0.5) * 0.5 + (tooth[i] - 0.5) * 0.3;
  }

  fibres(values, size, random, { count: 200, min: 20, max: 130, dark: 0.8, strength: 0.14 });

  return toWebp(values, size, "paper.webp", 60);
}

function tone() {
  const size = 512;
  const blotches = fractal(size, 3, 3, rng(2006));
  const values = blotches.map((v) => 0.55 + v * 0.45);
  return toWebp(values, size, "paper-tone.webp", 80);
}

function note() {
  const size = 512;
  const random = rng(2017);
  const white = blurWrap(Float32Array.from({ length: size * size }, random), size);
  const tooth = fractal(size, 32, 2, random);
  const values = new Float32Array(size * size);
  for (let i = 0; i < values.length; i++) values[i] = 0.9 + (white[i] - 0.5) * 0.3 + (tooth[i] - 0.5) * 0.16;
  fibres(values, size, random, { count: 40, min: 10, max: 50, dark: 0.7, strength: 0.08 });
  return toWebp(values, size, "note.webp", 70);
}

function kraft() {
  const size = 512;
  const random = rng(2020);
  const white = blurWrap(Float32Array.from({ length: size * size }, random), size);
  const tooth = fractal(size, 16, 4, random);
  const values = new Float32Array(size * size);
  for (let i = 0; i < values.length; i++) values[i] = 0.7 + (white[i] - 0.5) * 0.6 + (tooth[i] - 0.5) * 0.45;
  fibres(values, size, random, { count: 120, min: 30, max: 160, dark: 0.55, strength: 0.1 });
  return toWebp(values, size, "kraft.webp", 65);
}

// Tape grain runs along the strip: noise stretched sideways, plus a few long streaks.
function tape() {
  const size = 512;
  const random = rng(2024);
  const streaks = tiledNoiseXY(size, 2, 96, random);
  const fine = blurWrap(Float32Array.from({ length: size * size }, random), size);
  const values = new Float32Array(size * size);
  for (let i = 0; i < values.length; i++) values[i] = 0.8 + (streaks[i] - 0.5) * 0.35 + (fine[i] - 0.5) * 0.3;
  fibres(values, size, random, { count: 60, min: 80, max: 300, dark: 0.5, strength: 0.1, angle: 0 });
  return toWebp(values, size, "tape.webp", 70);
}

// Value noise with separate periods across and down, so it can streak.
function tiledNoiseXY(size, px, py, random) {
  const grid = Float32Array.from({ length: px * py }, random);
  const out = new Float32Array(size * size);
  const fade = (t) => t * t * (3 - 2 * t);
  for (let y = 0; y < size; y++) {
    const gy = (y / size) * py;
    const y0 = Math.floor(gy);
    const y1 = (y0 + 1) % py;
    const ty = fade(gy - y0);
    for (let x = 0; x < size; x++) {
      const gx = (x / size) * px;
      const x0 = Math.floor(gx);
      const x1 = (x0 + 1) % px;
      const tx = fade(gx - x0);
      const a = grid[y0 * px + x0];
      const b = grid[y0 * px + x1];
      const c = grid[y1 * px + x0];
      const d = grid[y1 * px + x1];
      out[y * size + x] = (a + (b - a) * tx) * (1 - ty) + (c + (d - c) * tx) * ty;
    }
  }
  return out;
}

mkdirSync(OUT, { recursive: true });
const results = await Promise.all([grain(), tone(), note(), kraft(), tape()]);
for (const r of results) console.log(`${r.width}x${r.height}, ${(r.size / 1024).toFixed(0)}KB`);
