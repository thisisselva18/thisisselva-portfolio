// A few typed words on a narrow strip of paper, stuck on slightly crooked
// (design.md section 5). Geist Mono, ink on white, torn at both ends.

import { tilt, tornEdges } from "@/lib/rough";

export function LabelStrip({ text, className }: { text: string; className?: string }) {
  return (
    <span className={`cutout-lift inline-block ${className ?? ""}`} style={{ rotate: `${tilt(text, 2.5)}deg` }}>
      <span
        className="block bg-white px-3 py-1 font-mono text-mono leading-tight text-ink"
        style={{ clipPath: tornEdges(text, ["left", "right"], { depth: 4, teeth: 5 }) }}
      >
        {text}
      </span>
    </span>
  );
}
