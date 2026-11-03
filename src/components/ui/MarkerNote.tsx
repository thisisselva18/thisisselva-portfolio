// The hand (design.md section 4): a few handwritten words and Selva's own marker arrow,
// scanned and traced (Material/point.pdf → /media/marks/arrow.svg). One per screen at most.
// The words are a stand-in face (Permanent Marker) until the handwriting is scanned too.
// The words stay level (text never rotates); only the arrow turns.

import type { CSSProperties } from "react";

const ARROW = "/media/marks/arrow.svg"; // 577 x 727, drawn pointing down and to the left; 80px wide here

type Props = {
  text: string;
  point?: "down-left" | "down-right"; // which way the arrow points, from under the words
  turn?: number; // a little extra turn on the arrow, in degrees
  className?: string;
};

export function MarkerNote({ text, point = "down-left", turn = 0, className }: Props) {
  const right = point === "down-right";
  return (
    // The arrow hangs from under the start of the words (down-left) or their end (down-right),
    // so its tip sits a fixed distance from the words: about 8px in from their edge, 124px below their top.
    <span className={`inline-flex flex-col ${right ? "items-end" : "items-start"} ${className ?? ""}`}>
      <span className="whitespace-nowrap font-marker text-marker leading-none text-ink">{text}</span>
      <span
        aria-hidden
        className="marker-arrow mt-1 block w-20"
        style={{ "--arrow": `url(${ARROW})`, transform: `${right ? "scaleX(-1) " : ""}rotate(${turn}deg)` } as CSSProperties}
      />
    </span>
  );
}
