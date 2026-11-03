// A big Geist Serif number with a hand-drawn red crayon circle round it
// (design.md section 8). One per scene at most: it comes from Scene.stat.
// The number is already in the note beside it, so this is hidden from screen readers rather
// than read twice. When the number is in the supertitle itself, the supertitle circles it in
// place instead (Supertitle `circle`, user's call 3 Nov 2026), and there's no callout.

import { scribbleLoop } from "@/lib/rough";
import { CrayonFilter } from "./CrayonFilter";

export function StatCallout({ stat, className }: { stat: string; className?: string }) {
  return (
    <span aria-hidden className={`relative m-[0.25em] inline-block px-[0.3em] py-[0.2em] ${className ?? ""}`}>
      <span className="relative z-10 whitespace-nowrap font-serif text-[calc(var(--supertitle-size)*1.4)] leading-none text-ink">{stat}</span>
      <CrayonLoop stat={stat} />
    </span>
  );
}

// The red crayon loop on its own, round whatever positioned box it's put in.
// It spills a little past the box, so it clears the text's corners.
export function CrayonLoop({ stat }: { stat: string }) {
  const id = `crayon-${stat.replace(/[^a-z0-9]/gi, "")}`;
  return (
    <svg aria-hidden className="pointer-events-none absolute -inset-x-[5%] -inset-y-[12%] h-[124%] w-[110%] overflow-visible" viewBox="0 0 100 100" preserveAspectRatio="none">
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
  );
}
