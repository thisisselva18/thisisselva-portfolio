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
  id?: string;
};

export function Supertitle({ line, as: Tag = "p", strip, className, id }: Props) {
  const small = line.size === "small";
  const face =
    line.face === "heart" ? "font-heart" : small && line.text.length > SMALL_SERIF_MAX ? "font-sans" : "font-serif";
  const size = small ? "text-supertitle-small max-w-[32ch]" : "text-supertitle max-w-[var(--supertitle-measure)]";
  const classes = `${face} ${size} font-normal text-balance text-ink [hyphens:none] ${className ?? ""}`;
  if (!strip) {
    return (
      <Tag id={id} className={classes}>
        {line.text}
      </Tag>
    );
  }
  // The strip of paper is drawn in its own layer under the words: each line's strip is taller
  // than the tight line height, so painted inline it would cover the descenders of the line above.
  // Both layers are the same text in the same box, so they wrap identically.
  const pad = "px-[0.2em] [box-decoration-break:clone]";
  return (
    <Tag id={id} className={`grid ${classes}`}>
      <span aria-hidden className="[grid-area:1/1]">
        <span className={`bg-paper text-transparent ${pad}`}>{line.text}</span>
      </span>
      <span className="relative [grid-area:1/1]">
        <span className={pad}>{line.text}</span>
      </span>
    </Tag>
  );
}
