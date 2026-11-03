// A supertitle: the storyteller's voice (design.md sections 4 and 8).
// Main lines: Geist Serif, big, at most about 20 characters a line, never hyphenated.
// Small lines: half size, directly under the main line, and in Geist Sans when
// they're over 32 characters (they'd wrap at phone width). Text never rotates.
// "Storyteller by heart." alone uses Geist Serif Heart (face: "heart" in content).

import type { Supertitle as SupertitleLine } from "@/content/types";

const SMALL_SERIF_MAX = 32;

type Props = {
  line: SupertitleLine;
  as?: "h1" | "h2" | "h3" | "p";
  strip?: boolean; // on a busy moment: sits on a solid strip of paper, like a label stuck on top
  className?: string;
};

export function Supertitle({ line, as: Tag = "p", strip, className }: Props) {
  const small = line.size === "small";
  const face =
    line.face === "heart" ? "font-heart" : small && line.text.length > SMALL_SERIF_MAX ? "font-sans" : "font-serif";
  const size = small ? "text-supertitle-small max-w-[32ch]" : "text-supertitle max-w-[var(--supertitle-measure)]";
  return (
    <Tag className={`${face} ${size} font-normal text-balance text-ink [hyphens:none] ${className ?? ""}`}>
      {strip ? <span className="bg-paper px-[0.2em] [box-decoration-break:clone]">{line.text}</span> : line.text}
    </Tag>
  );
}
