// One prepared image from public/media/, served by next/image at the right size.
// Width and height come from src/generated/media-sizes.json (written by `npm run assets`).
// A file that hasn't been prepared yet shows as a plain kraft placeholder, so layouts don't jump.

import Image from "next/image";
import mediaSizes from "@/generated/media-sizes.json";

const known: Record<string, { width: number; height: number }> = mediaSizes;

type Props = {
  src: string;
  alt: string; // "" for decorative, or when the card set's alt covers it
  sizes: string; // how wide it shows, for the srcset: "(max-width: 640px) 80vw, 320px"
  className?: string;
  preload?: boolean;
};

export function MediaImage({ src, alt, sizes, className, preload }: Props) {
  const size = known[src];
  if (!size) {
    return (
      <span
        className={`block aspect-[4/3] w-full bg-kraft/40 ${className ?? ""}`}
        role={alt ? "img" : undefined}
        aria-label={alt || undefined}
        aria-hidden={alt ? undefined : true}
        data-missing-media={src}
      />
    );
  }
  return (
    <Image
      src={src}
      alt={alt}
      width={size.width}
      height={size.height}
      sizes={sizes}
      preload={preload}
      className={`block h-auto w-full ${className ?? ""}`}
    />
  );
}

export function mediaSize(src: string) {
  return known[src];
}
