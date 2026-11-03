// A reel or video in its frame (design.md section 8): a vertical reel sits in a phone,
// a wide one or a YouTube video in a polaroid, with tape on top. Underneath it, a small
// white sticker button links to the original. The button's words come from extras.ts.
// YouTube and Instagram load their real players only when tapped. A link's tag (like the
// viral reel's) is typed on a label strip stuck to the frame's top corner.

import type { Link, Media } from "@/content/types";
import { tilt } from "@/lib/rough";
import { InstagramEmbed } from "./InstagramEmbed";
import { LabelStrip } from "./LabelStrip";
import { InViewVideo } from "./InViewVideo";
import { mediaSize } from "./MediaImage";
import { TapedFrame } from "./TapedFrame";
import { YouTubeEmbed } from "./YouTubeEmbed";

type Props = {
  media: Extract<Media, { kind: "video" | "youtube" | "instagram" }>;
  original?: Link; // where the button goes
  groupTitle?: string; // the set's alt, when its embeds share one title (the club reels)
  button: string; // extras.embedButton
  className?: string;
};

// White, not red: a row of reels would otherwise put several red shapes on one screen.
function OriginalButton({ link, text }: { link: Link; text: string }) {
  return (
    <a
      href={link.href}
      target="_blank"
      rel="noopener noreferrer"
      className="sticker-button inline-block rounded-full border-2 border-ink bg-white px-4 py-2 text-center font-sans text-sm font-bold uppercase tracking-wide text-ink shadow-lift"
      style={{ rotate: `${tilt(`button:${link.href}`, 3)}deg` }}
    >
      {text}
    </a>
  );
}

export function ReelEmbed({ media, original, groupTitle, button, className }: Props) {
  // Names the player for screen readers: its own title or alt, else its set's shared title,
  // else the link it came from.
  const label = (media.kind === "video" ? media.alt : media.title) || groupTitle || original?.label || "";

  let frame;
  if (media.kind === "youtube") {
    frame = (
      <TapedFrame seed={media.id} className="w-full">
        <YouTubeEmbed id={media.id} title={label} />
      </TapedFrame>
    );
  } else if (media.kind === "instagram") {
    frame = (
      <TapedFrame seed={media.id} variant="phone" className="w-full">
        <InstagramEmbed id={media.id} poster={media.poster} label={label} />
      </TapedFrame>
    );
  } else {
    const size = mediaSize(media.poster);
    const vertical = size ? size.height > size.width : true;
    frame = (
      <TapedFrame seed={media.src} variant={vertical ? "phone" : "polaroid"} className="w-full">
        <InViewVideo src={media.src} poster={media.poster} label={label || undefined} />
      </TapedFrame>
    );
  }

  return (
    <div className={`flex flex-col items-center gap-6 ${className ?? ""}`}>
      <div className="relative w-full">
        {frame}
        {original?.tag ? <LabelStrip text={original.tag} className="absolute -right-4 top-6 z-30 whitespace-nowrap" /> : null}
      </div>
      {original ? <OriginalButton link={original} text={button} /> : null}
    </div>
  );
}
