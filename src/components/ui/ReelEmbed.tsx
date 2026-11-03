// A reel or video in its frame (design.md section 8): a vertical reel sits in a phone,
// a wide one or a YouTube video in a polaroid, with tape on top. Muted, with a small
// sticker link to watch the original. The sticker's words come from extras.ts.

import type { Link, Media } from "@/content/types";
import { tilt } from "@/lib/rough";
import { mediaSize } from "./MediaImage";
import { InViewVideo } from "./InViewVideo";
import { TapedFrame } from "./TapedFrame";
import { YouTubeEmbed } from "./YouTubeEmbed";

type Props = {
  media: Extract<Media, { kind: "video" | "youtube" }>;
  original?: Link; // where "watch the original" goes
  sticker: string; // extras.reelSticker
  className?: string;
};

function OriginalSticker({ link, text }: { link: Link; text: string }) {
  return (
    <a
      href={link.href}
      target="_blank"
      rel="noopener noreferrer"
      className="absolute -bottom-4 -right-3 z-20 inline-block rounded-full border-2 border-ink bg-white px-3.5 py-1.5 font-sans text-sm font-bold uppercase tracking-wide text-ink shadow-lift"
      style={{ rotate: `${tilt(`sticker:${link.href}`, 6)}deg` }}
    >
      {text}
    </a>
  );
}

export function ReelEmbed({ media, original, sticker, className }: Props) {
  const footer = original ? <OriginalSticker link={original} text={sticker} /> : null;

  if (media.kind === "youtube") {
    return (
      <TapedFrame seed={media.id} footer={footer} className={className}>
        <YouTubeEmbed id={media.id} title={media.title} />
      </TapedFrame>
    );
  }

  const size = mediaSize(media.poster);
  const vertical = size ? size.height > size.width : true;
  return (
    <TapedFrame seed={media.src} variant={vertical ? "phone" : "polaroid"} footer={footer} className={className}>
      <InViewVideo src={media.src} poster={media.poster} label={media.alt} />
    </TapedFrame>
  );
}
