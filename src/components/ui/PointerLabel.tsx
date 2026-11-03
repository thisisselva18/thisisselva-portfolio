// Pointer labels (design.md section 5): thin ink lines from parts of an object to a few
// small Geist Mono words, like the "Aperture / Focus / Shoot" camera. Two or three at most.
// The object goes in as children; the words come from src/content/extras.ts, and where
// each one points is layout, given by whoever places it.

import type { ReactNode } from "react";
import { curve } from "@/lib/rough";

export type Pointer = {
  text: string;
  at: [number, number]; // the part of the object it points to, in % of the object's box
  label: [number, number]; // where the words sit, in % of the object's box (can be outside it)
};

export function PointerLabel({ pointers, children, className }: { pointers: Pointer[]; children: ReactNode; className?: string }) {
  return (
    <div className={`relative ${className ?? ""}`}>
      {children}
      <svg aria-hidden className="pointer-events-none absolute inset-0 size-full overflow-visible" viewBox="0 0 100 100" preserveAspectRatio="none">
        {pointers.map((p, i) => (
          <g key={p.text}>
            <path
              d={curve(p.label, p.at, i % 2 ? 0.08 : -0.08)}
              fill="none"
              stroke="var(--ink)"
              strokeWidth="1.25"
              strokeLinecap="round"
              vectorEffect="non-scaling-stroke"
            />
          </g>
        ))}
      </svg>
      {/* The tip of each line is a dot, outside the stretched SVG so it stays round. */}
      {pointers.map((p) => (
        <span
          key={`dot-${p.text}`}
          aria-hidden
          className="absolute block size-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-ink"
          style={{ left: `${p.at[0]}%`, top: `${p.at[1]}%` }}
        />
      ))}
      {pointers.map((p) => (
        <span
          key={`label-${p.text}`}
          className={`absolute whitespace-nowrap bg-paper px-1 font-mono text-mono leading-none text-ink ${
            p.label[0] < 50 ? "-translate-x-full" : ""
          } -translate-y-1/2`}
          style={{ left: `${p.label[0]}%`, top: `${p.label[1]}%` }}
        >
          {p.text}
        </span>
      ))}
    </div>
  );
}
