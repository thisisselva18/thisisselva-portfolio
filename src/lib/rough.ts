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

type Point = [number, number];

// A smooth curve through points (Catmull-Rom as cubic Béziers), as SVG path commands after the M.
function through(pts: Point[]): string {
  let d = "";
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

/**
 * A kid's zigzag across a 100 x 100 box: uneven teeth, a little crooked,
 * and gone over twice so the two passes don't quite line up.
 */
export function zigzag(seed: string, { teeth = 6, passes = 2 } = {}): string {
  const r = random(`zigzag:${seed}`);
  let d = "";
  for (let p = 0; p < passes; p++) {
    const drift = (r() - 0.5) * 8;
    for (let i = 0; i <= teeth * 2; i++) {
      const x = 2 + (96 * i) / (teeth * 2) + (r() - 0.5) * 4;
      const up = i % 2 === 0;
      const y = (up ? 12 + r() * 14 : 74 + r() * 14) + drift;
      d += `${i === 0 ? " M" : " L"} ${round(x)} ${round(y)}`;
    }
  }
  return d.trim();
}

/** A star drawn in one go, the way a kid does it: five points, one stroke, not quite closed. */
export function star(seed: string): string {
  const r = random(`star:${seed}`);
  const start = -Math.PI / 2 + (r() - 0.5) * 0.4;
  const pts: Point[] = [];
  for (let i = 0; i <= 5; i++) {
    const a = start + (i * 4 * Math.PI) / 5; // every second point of a pentagon
    const rad = 44 + (r() - 0.5) * 10;
    pts.push([50 + Math.cos(a) * rad, 52 + Math.sin(a) * rad]);
  }
  pts[5] = [pts[5][0] + 4 + r() * 4, pts[5][1] + 3 + r() * 4]; // overshoots the start
  return `M ${round(pts[0][0])} ${round(pts[0][1])}` + pts.slice(1).map(([x, y]) => ` L ${round(x)} ${round(y)}`).join("");
}

/**
 * Short strokes bursting out from behind something: rays from round the middle of a
 * 100 x 100 box towards its edge, each a little bent. Several subpaths in one d.
 */
export function burstStrokes(seed: string, { count = 9 } = {}): string {
  const r = random(`strokes:${seed}`);
  let d = "";
  for (let i = 0; i < count; i++) {
    const a = (i / count) * Math.PI * 2 + (r() - 0.5) * 0.5;
    const from = 30 + r() * 8;
    const to = from + 10 + r() * 10;
    const bend = (r() - 0.5) * 0.25;
    const at = (rad: number, b: number): Point => [50 + Math.cos(a + b) * rad, 50 + Math.sin(a + b) * rad];
    const [x1, y1] = at(from, 0);
    const [cx, cy] = at((from + to) / 2, bend);
    const [x2, y2] = at(to, 0);
    d += ` M ${round(x1)} ${round(y1)} Q ${round(cx)} ${round(cy)} ${round(x2)} ${round(y2)}`;
  }
  return d.trim();
}

/**
 * A curve from one point to another that bows out to one side by `bend`
 * (a fraction of the distance; negative bows the other way).
 */
export function curve(from: Point, to: Point, bend = 0.15): string {
  const [x1, y1] = from;
  const [x2, y2] = to;
  const dx = x2 - x1;
  const dy = y2 - y1;
  const cx = (x1 + x2) / 2 - dy * bend;
  const cy = (y1 + y2) / 2 + dx * bend;
  return `M ${round(x1)} ${round(y1)} Q ${round(cx)} ${round(cy)} ${round(x2)} ${round(y2)}`;
}

/**
 * A string hung between pins: from each pin to the next it sags down under its own
 * weight, more on longer runs. `sag` is a fraction of each run's length.
 */
export function sagPath(pins: Point[], sag = 0.12): string {
  if (pins.length < 2) return "";
  let d = `M ${round(pins[0][0])} ${round(pins[0][1])}`;
  for (let i = 1; i < pins.length; i++) {
    const [x1, y1] = pins[i - 1];
    const [x2, y2] = pins[i];
    const drop = Math.hypot(x2 - x1, y2 - y1) * sag;
    // Two control points pulled down: a softer, rope-like curve than a single quadratic.
    d += ` C ${round(x1 + (x2 - x1) / 3)} ${round(y1 + (y2 - y1) / 3 + drop)} ${round(x1 + ((x2 - x1) * 2) / 3)} ${round(y1 + ((y2 - y1) * 2) / 3 + drop)} ${round(x2)} ${round(y2)}`;
  }
  return d;
}

/**
 * A burst of torn-paper rays, like the sun behind the kid on the rocket, as CSS polygon()s
 * in percent of its box. `rim` is the same shape a little bigger, for the white torn rim
 * showing round the red.
 */
export function burstRays(seed: string, { rays = 15 } = {}): { burst: string; rim: string } {
  const r = random(`burst:${seed}`);
  const step = (Math.PI * 2) / rays;
  const pts: Point[] = []; // in a -50..50 box round the middle
  for (let i = 0; i < rays; i++) {
    const a = i * step + (r() - 0.5) * step * 0.3;
    const inner = 22 + r() * 8;
    const outer = 40 + r() * 10;
    const half = step * (0.42 + r() * 0.12);
    const at = (rad: number, ang: number): Point => [Math.cos(ang) * rad, Math.sin(ang) * rad];
    // valley, up one torn side, a blunt torn tip, down the other side
    pts.push(at(inner, a));
    for (const t of [0.35, 0.7]) pts.push(at(inner + (outer - inner) * t + (r() - 0.5) * 2.5, a + half * t + (r() - 0.5) * 0.03));
    pts.push(at(outer, a + half - step * 0.03), at(outer - 1 - r() * 2, a + half), at(outer, a + half + step * 0.03));
    for (const t of [0.7, 0.35]) pts.push(at(inner + (outer - inner) * t + (r() - 0.5) * 2.5, a + half * (2 - t) + (r() - 0.5) * 0.03));
  }
  const poly = (scale: number) => `polygon(${pts.map(([x, y]) => `${round(50 + x * scale)}% ${round(50 + y * scale)}%`).join(", ")})`;
  return { burst: poly(1), rim: poly(1.035) };
}

/** A gentle wave across a width, `waves` crests long, for a band of newsprint to run along. */
export function wave(seed: string, width: number, y: number, amplitude: number, waves = 2): string {
  const r = random(`wave:${seed}`);
  const phase = r() * Math.PI * 2;
  const pts: Point[] = [];
  const n = waves * 8;
  for (let i = 0; i <= n; i++) {
    const x = (width * i) / n;
    pts.push([x, y + Math.sin(phase + (i / n) * waves * Math.PI * 2) * amplitude]);
  }
  return `M ${round(pts[0][0])} ${round(pts[0][1])}` + through(pts);
}
