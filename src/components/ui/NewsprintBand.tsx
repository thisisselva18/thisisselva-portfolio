// Wavy bands of printed text running behind a cutout (design.md section 5), like the woman
// in the pink suit. The lines are real ones from the script (scene headings and action
// lines, passed in), small Geist Mono in ink at low contrast. Decoration only: hidden from
// screen readers. The text stays the same size at any width; wider screens just show more.

import { wave } from "@/lib/rough";

type Props = {
  lines: string[];
  seed: string;
  bands?: number;
  className?: string; // give it a height: the bands spread over it
};

const WIDTH = 1600; // wide enough for a desktop screen at 1:1
const GAP = 34; // between bands, in px
const SIZE = 13; // the text, in px

export function NewsprintBand({ lines, seed, bands = 5, className }: Props) {
  const height = GAP * (bands + 1);
  // Each band starts at a different line, so no two bands read the same.
  const text = (i: number) => {
    const from = (i * 2) % lines.length;
    const run = [...lines.slice(from), ...lines.slice(0, from)];
    return [...run, ...run].join("  ·  ");
  };
  return (
    <svg
      aria-hidden
      className={`pointer-events-none block w-full ${className ?? ""}`}
      viewBox={`0 0 ${WIDTH} ${height}`}
      preserveAspectRatio="xMidYMid slice"
    >
      <defs>
        {Array.from({ length: bands }, (_, i) => (
          <path key={i} id={`news-${seed}-${i}`} d={wave(`${seed}:${i}`, WIDTH + 200, GAP * (i + 1), 7, 2)} transform="translate(-100 0)" />
        ))}
      </defs>
      <g className="font-mono" fill="var(--ink)" style={{ fontSize: SIZE, opacity: "var(--newsprint-opacity)" }}>
        {Array.from({ length: bands }, (_, i) => (
          <text key={i}>
            <textPath href={`#news-${seed}-${i}`}>{text(i)}</textPath>
          </text>
        ))}
      </g>
    </svg>
  );
}
