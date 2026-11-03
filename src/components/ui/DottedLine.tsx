// A thin dotted path in ink for the smaller connections (design.md section 5): a card to
// its sticky note, a card to its spot on the year bar. Made of dots, like everything else.
// It fills its positioned parent; from and to are in px from the parent's top-left corner.

import { curve } from "@/lib/rough";

type Props = {
  from: [number, number];
  to: [number, number];
  bend?: number; // how far it bows out, as a fraction of its length (negative: the other way)
  className?: string;
};

export function DottedLine({ from, to, bend = 0.12, className }: Props) {
  return (
    <svg aria-hidden className={`pointer-events-none absolute inset-0 size-full overflow-visible ${className ?? ""}`}>
      <path
        d={curve(from, to, bend)}
        fill="none"
        stroke="var(--ink)"
        strokeWidth="2.6"
        strokeLinecap="round"
        strokeDasharray="0 8"
      />
    </svg>
  );
}
