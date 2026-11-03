// A post screenshot printed like a clipping (design.md section 8): its real colours,
// a thin white border, a slight angle and one strip of tape. If the post's view count
// is filled in, it's typed on a label strip at the bottom corner.

import { tilt } from "@/lib/rough";
import { LabelStrip } from "./LabelStrip";
import { MediaImage } from "./MediaImage";
import { Tape } from "./Tape";

type Props = {
  src: string;
  alt: string;
  views?: string;
  sizes: string;
  className?: string;
};

export function PostCard({ src, alt, views, sizes, className }: Props) {
  return (
    <figure
      className={`relative m-0 bg-white p-1.5 shadow-lift ${className ?? ""}`}
      style={{ rotate: `${tilt(`post:${src}`, 3)}deg` }}
    >
      <MediaImage src={src} alt={alt} sizes={sizes} />
      <Tape at="top" seed={src} />
      {views ? <LabelStrip text={views} className="absolute -bottom-3 right-3" /> : null}
    </figure>
  );
}
