// A year or date ("1994", "August 2025") on a small torn strip of kraft tape,
// like the date label on a photo (design.md section 8). It goes in a corner of
// the card cluster, never above a headline (no eyebrow text).

import { tilt, tornEdges } from "@/lib/rough";

export function CornerTag({ text, className }: { text: string; className?: string }) {
  return (
    <span className={`inline-block ${className ?? ""}`} style={{ rotate: `${tilt(`corner:${text}`, 3)}deg` }}>
      <span
        className="texture texture-kraft block px-3.5 py-1.5 font-mono text-mono leading-none tracking-wide text-ink"
        style={{ clipPath: tornEdges(`corner:${text}`, ["left", "right"], { depth: 6, teeth: 5 }) }}
      >
        {text}
      </span>
    </span>
  );
}
