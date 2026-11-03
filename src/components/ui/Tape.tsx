// A strip of kraft tape holding something down at one corner or the top edge
// (design.md section 5: one or two corners, never all four). Decoration only.
// The parent must be position: relative.

import type { CSSProperties } from "react";
import { random, tornEdges } from "@/lib/rough";

export type TapeAt = "top" | "top-left" | "top-right" | "bottom-left" | "bottom-right";

const place: Record<TapeAt, { style: CSSProperties; angle: number }> = {
  top: { style: { top: "-0.8rem", left: "50%", translate: "-50% 0" }, angle: 0 },
  "top-left": { style: { top: "0.1rem", left: "-1.6rem" }, angle: -38 },
  "top-right": { style: { top: "0.1rem", right: "-1.6rem" }, angle: 38 },
  "bottom-left": { style: { bottom: "0.1rem", left: "-1.6rem" }, angle: 38 },
  "bottom-right": { style: { bottom: "0.1rem", right: "-1.6rem" }, angle: -38 },
};

export function Tape({ at, seed, length }: { at: TapeAt; seed: string; length?: string }) {
  const r = random(`tape:${seed}:${at}`);
  const { style, angle } = place[at];
  return (
    <span
      aria-hidden
      className="tape"
      style={{
        ...style,
        rotate: `${angle + (r() - 0.5) * 10}deg`,
        clipPath: tornEdges(`${seed}:${at}`, ["left", "right"], { depth: 7, teeth: 6 }),
        ...(length ? ({ "--tape-length": length } as CSSProperties) : {}),
      }}
    />
  );
}
