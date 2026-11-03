// A piece of work as a card (design.md section 8): a cutout or photo mounted on a
// slightly thicker piece of paper, at a small angle, with a pin or a bit of tape where
// the red string attaches. The attach point carries data-string-pin, so the red string
// can find it later. In a cluster only the lead card is tied on (attach="none" for the rest).
//
// Polaroid caption (design.md section 8, user's call): a mounted card with a caption gets a
// wide bottom edge, and the caption sits in it. It fades in on hover or focus, and is always
// shown on touch screens. It repeats the image's alt, so screen readers skip it.

import type { ReactNode } from "react";
import { tilt } from "@/lib/rough";
import { MediaImage } from "./MediaImage";
import { Tape, type TapeAt } from "./Tape";

type Props = {
  src: string;
  alt: string; // "" when the card set's alt covers it
  sizes: string;
  attach?: "pin" | "tape" | "none"; // where the red string ties on; "none" for cards it doesn't tie
  tapes?: TapeAt[]; // extra tape at a corner or two, never all four
  mount?: boolean; // false for a cutout that stands on its own, with only its sticker border
  corner?: ReactNode; // a CornerTag, at the bottom-right corner like a date stamp on a photo
  caption?: string; // the user's words, in the polaroid gap (mounted cards only)
  media?: ReactNode; // shown instead of the image (a video)
  stretch?: boolean; // grow to fill a taller box, cropping the picture (never squashing it)
  className?: string;
};

export function WorkCard({ src, alt, sizes, attach = "pin", tapes = [], mount = true, corner, caption, media, stretch, className }: Props) {
  const isCutout = !mount;
  const polaroid = mount && !!caption;
  return (
    <figure
      className={`group relative m-0 ${stretch ? "flex grow flex-col" : ""} ${mount ? "texture texture-mount p-[var(--mount-border)] shadow-lift" : "cutout-lift"} ${polaroid ? "pb-[var(--polaroid-gap)]" : ""} ${className ?? ""}`}
      style={{ rotate: `${tilt(`card:${src}`, 4)}deg` }}
    >
      {media ?? <MediaImage src={src} alt={alt} sizes={sizes} className={stretch ? "min-h-0 grow object-cover" : undefined} />}
      {attach === "pin" ? (
        <span
          aria-hidden
          data-string-pin
          className="absolute left-1/2 top-1.5 z-10 block size-2.5 -translate-x-1/2 rounded-full bg-ink shadow-lift"
        />
      ) : attach === "tape" ? (
        <span aria-hidden data-string-pin className="absolute left-1/2 top-0 block size-0" />
      ) : null}
      {attach === "tape" && !isCutout ? <Tape at="top" seed={src} /> : null}
      {tapes.map((at) => (
        <Tape key={at} at={at} seed={src} />
      ))}
      {polaroid ? (
        <figcaption
          aria-hidden
          className="absolute inset-x-[var(--mount-border)] bottom-0 flex h-[var(--polaroid-gap)] items-center justify-center text-center font-mono text-caption leading-tight text-ink opacity-0 transition-opacity duration-200 group-hover:opacity-100 group-focus-within:opacity-100 [@media(hover:none)]:opacity-100"
          data-caption
        >
          <span className="line-clamp-2">{caption}</span>
        </figcaption>
      ) : null}
      {corner ? <div className="absolute -bottom-3 -right-3 z-20">{corner}</div> : null}
    </figure>
  );
}
