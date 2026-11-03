// Seeded randomness for the handmade look: tilts, torn edges and wobbly lines.
// Everything is worked out from a seed string (usually the content it belongs to),
// so a piece is drawn the same way on the server and in the browser, and on every visit.

/** A random number generator seeded from a string (cyrb53-style hash into mulberry32). */
export function random(seed: string): () => number {
  let h = 1779033703 ^ seed.length;
  for (let i = 0; i < seed.length; i++) {
    h = Math.imul(h ^ seed.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  let state = h >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const round = (n: number) => Math.round(n * 100) / 100;

/**
 * A small angle in degrees, between -max and max, never close to level:
 * cards and notes always sit at least a little crooked.
 */
export function tilt(seed: string, max: number): number {
  const r = random(`tilt:${seed}`);
  const size = max * (0.3 + r() * 0.7);
  return round(r() < 0.5 ? -size : size);
}

type Edge = "top" | "right" | "bottom" | "left";

/**
 * A CSS polygon() whose chosen edges are torn: jagged, a few percent deep.
 * Straight edges stay on the box. `depth` is in percent of the box across that edge.
 */
export function tornEdges(seed: string, edges: Edge[], { depth = 6, teeth = 9 } = {}): string {
  const r = random(`torn:${seed}`);
  const torn = new Set(edges);
  const points: string[] = [];
  const jag = () => r() * depth;

  // Walk the box clockwise from the top-left corner.
  const side = (edge: Edge, from: [number, number], to: [number, number], inward: [number, number]) => {
    const n = torn.has(edge) ? teeth : 1;
    for (let i = 0; i < n; i++) {
      const t = i / n;
      const x = from[0] + (to[0] - from[0]) * t;
      const y = from[1] + (to[1] - from[1]) * t;
      const d = torn.has(edge) ? jag() : 0;
      points.push(`${round(x + inward[0] * d)}% ${round(y + inward[1] * d)}%`);
    }
  };
  side("top", [0, 0], [100, 0], [0, 1]);
  side("right", [100, 0], [100, 100], [-1, 0]);
  side("bottom", [100, 100], [0, 100], [0, -1]);
  side("left", [0, 100], [0, 0], [1, 0]);
  return `polygon(${points.join(", ")})`;
}

/**
 * A hand-drawn line across a width x height box, as an SVG path:
 * it drifts a little up and down and overshoots slightly at each end.
 */
export function wobblyLine(seed: string, width: number, height: number, { wobble = 0.35, segments = 5 } = {}): string {
  const r = random(`line:${seed}`);
  const mid = height / 2;
  const y = () => round(mid + (r() - 0.5) * height * wobble * 2);
  let d = `M ${round(-width * 0.01)} ${y()}`;
  for (let i = 1; i <= segments; i++) {
    const x = (width * 1.02 * i) / segments;
    const cx = x - width / segments / 2;
    d += ` Q ${round(cx)} ${y()} ${round(x)} ${y()}`;
  }
  return d;
}

/**
 * A loop drawn round something by hand, like a crayon circle round a number:
 * an uneven, squarish oval that goes round a bit more than once and doesn't meet itself.
 * It's squarish so it hugs the corners of a line of text instead of cutting through them.
 * Drawn in a 100 x 100 box.
 */
export function scribbleLoop(seed: string, { turns = 1.12, points = 36 } = {}): string {
  const r = random(`loop:${seed}`);
  const start = r() * Math.PI * 2;
  const total = Math.PI * 2 * turns;
  const pts: [number, number][] = [];
  for (let i = 0; i <= points; i++) {
    const a = start + (total * i) / points;
    const k = i / points;
    const rx = 47 + (r() - 0.5) * 4 - k * 3;
    const ry = 44 + (r() - 0.5) * 5 + k * 4;
    // A superellipse: |cos|^0.6 pushes the curve out towards the box's corners.
    const sx = Math.sign(Math.cos(a)) * Math.abs(Math.cos(a)) ** 0.6;
    const sy = Math.sign(Math.sin(a)) * Math.abs(Math.sin(a)) ** 0.6;
    pts.push([50 + sx * rx, 50 + sy * ry]);
  }
  // A smooth curve through the points (Catmull-Rom as cubic Béziers).
  let d = `M ${round(pts[0][0])} ${round(pts[0][1])}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[Math.max(0, i - 1)];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[Math.min(pts.length - 1, i + 2)];
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
    const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    d += ` C ${round(c1[0])} ${round(c1[1])} ${round(c2[0])} ${round(c2[1])} ${round(p2[0])} ${round(p2[1])}`;
  }
  return d;
}
