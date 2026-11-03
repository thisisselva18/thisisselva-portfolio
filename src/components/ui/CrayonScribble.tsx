// A kid's crayon scribble (design.md sections 3 and 5): lines only, never fills, in one
// of the four crayon colours, wobbly and waxy. It sits behind or around things, never on
// a face or text. Size it with className; the drawing stretches to fill the box.

import { burstStrokes, scribbleLoop, star, wobblyLine, zigzag } from "@/lib/rough";
import { CrayonFilter } from "./CrayonFilter";

export type CrayonColour = "pink" | "yellow" | "blue" | "green";
export type ScribbleKind = "loop" | "zigzag" | "star" | "underline" | "burst";

type Props = {
  kind: ScribbleKind;
  colour: CrayonColour;
  seed: string; // keeps the same scribble on every visit
  weight?: number; // stroke width in px
  className?: string;
};

const draw: Record<ScribbleKind, (seed: string) => string> = {
  loop: (seed) => scribbleLoop(seed),
  zigzag: (seed) => zigzag(seed),
  star: (seed) => star(seed),
  // Gone over twice, like a kid underlining something that matters.
  underline: (seed) => `${wobblyLine(seed, 100, 100, { wobble: 0.12 })} ${wobblyLine(`${seed}:2`, 100, 100, { wobble: 0.14 })}`,
  burst: (seed) => burstStrokes(seed),
};

// A star and a burst keep their shape; the rest stretch to whatever they go round or under.
const keepsShape: ScribbleKind[] = ["star", "burst"];

export function CrayonScribble({ kind, colour, seed, weight = 5, className }: Props) {
  const id = `crayon-${kind}-${seed.replace(/[^a-z0-9]/gi, "")}`;
  return (
    <svg
      aria-hidden
      className={`pointer-events-none overflow-visible ${className ?? ""}`}
      viewBox="0 0 100 100"
      preserveAspectRatio={keepsShape.includes(kind) ? "xMidYMid meet" : "none"}
    >
      <defs>
        <CrayonFilter id={id} />
      </defs>
      <path
        d={draw[kind](seed)}
        fill="none"
        stroke={`var(--crayon-${colour})`}
        strokeWidth={weight}
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
        filter={`url(#${id})`}
      />
    </svg>
  );
}
