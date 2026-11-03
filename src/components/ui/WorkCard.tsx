// A piece of work as a card (design.md section 8): a cutout or photo mounted on a
// slightly thicker piece of paper, at a small angle, with a pin or a bit of tape where
// the red string attaches. The attach point carries data-string-pin, so the red string
// can find it later.

import type { ReactNode } from "react";
import { tilt } from "@/lib/rough";
import { MediaImage } from "./MediaImage";
import { Tape, type TapeAt } from "./Tape";

type Props = {
  src: string;
  alt: string; // "" when the card set's alt covers it
  sizes: string;
  attach?: "pin" | "tape"; // where the red string ties on
  tapes?: TapeAt[]; // extra tape at a corner or two, never all four
  mount?: boolean; // false for a cutout that stands on its own, with only its sticker border
  corner?: ReactNode; // a CornerTag, at the bottom-right corner like a date stamp on a photo
  className?: string;
};

export function WorkCard({ src, alt, sizes, attach = "pin", tapes = [], mount = true, corner, className }: Props) {
  const isCutout = !mount;
  return (
    <figure
      className={`relative m-0 ${mount ? "texture texture-mount p-[var(--mount-border)] shadow-lift" : "cutout-lift"} ${className ?? ""}`}
      style={{ rotate: `${tilt(`card:${src}`, 4)}deg` }}
    >
      <MediaImage src={src} alt={alt} sizes={sizes} />
      {attach === "pin" ? (
        <span
          aria-hidden
          data-string-pin
          className="absolute left-1/2 top-1.5 z-10 block size-2.5 -translate-x-1/2 rounded-full bg-ink shadow-lift"
        />
      ) : (
        <span aria-hidden data-string-pin className="absolute left-1/2 top-0 block size-0" />
      )}
      {attach === "tape" && !isCutout ? <Tape at="top" seed={src} /> : null}
      {tapes.map((at) => (
        <Tape key={at} at={at} seed={src} />
      ))}
      {corner ? <div className="absolute -bottom-3 -right-3 z-20">{corner}</div> : null}
    </figure>
  );
}
