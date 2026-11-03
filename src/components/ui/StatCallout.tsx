// A big Geist Serif number with a hand-drawn red crayon circle round it
// (design.md section 8). One per scene at most: it comes from Scene.stat.
// The number is already in the supertitle or note beside it, so this is
// hidden from screen readers rather than read twice.

import { scribbleLoop } from "@/lib/rough";
import { CrayonFilter } from "./CrayonFilter";

export function StatCallout({ stat, className }: { stat: string; className?: string }) {
  const id = `crayon-${stat.replace(/[^a-z0-9]/gi, "")}`;
  return (
    <span aria-hidden className={`relative m-[0.25em] inline-block px-[0.3em] py-[0.2em] ${className ?? ""}`}>
      <span className="relative z-10 whitespace-nowrap font-serif text-[calc(var(--supertitle-size)*1.4)] leading-none text-ink">{stat}</span>
      {/* The loop spills a little past the box (the margin makes room), so it clears the text's corners. */}
      <svg className="absolute -inset-x-[5%] -inset-y-[12%] h-[124%] w-[110%] overflow-visible" viewBox="0 0 100 100" preserveAspectRatio="none">
        <defs>
          <CrayonFilter id={id} />
        </defs>
        <path
          d={scribbleLoop(stat)}
          fill="none"
          stroke="var(--red)"
          strokeWidth="6"
          strokeLinecap="round"
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
          filter={`url(#${id})`}
        />
      </svg>
    </span>
  );
}
