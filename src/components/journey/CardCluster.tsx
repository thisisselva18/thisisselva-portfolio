// One scene's card cluster (design.md sections 7–9): its media sets as a loose pile, like a
// handful of prints dropped on a desk. The first card is the lead: bigger, and the only one the
// red string ties to (one pin per cluster). Photos, posts, thumbnails and videos are mounted
// cards with a polaroid caption when the user gave them words; cutouts and stickers stand on
// their own. A set's alt names the set for screen readers; a scene's cardsAlt names the cluster.

import type { ReactNode } from "react";
import type { Media, MediaSet } from "@/content/types";
import { CornerTag } from "@/components/ui/CornerTag";
import { CrayonScribble } from "@/components/ui/CrayonScribble";
import { InViewVideo } from "@/components/ui/InViewVideo";
import { LabelStrip } from "@/components/ui/LabelStrip";
import { mediaSize } from "@/components/ui/MediaImage";
import { PointerLabel, type Pointer } from "@/components/ui/PointerLabel";
import { WorkCard } from "@/components/ui/WorkCard";

type Props = {
  seed: string;
  sets: MediaSet[];
  label?: string; // the scene's cardsAlt
  cornerTags?: string[]; // the scene's corner tags, stamped on the first cards in order
  labelStrip?: string; // extras.labelStrips: on the last set
  pointers?: string[]; // extras.pointerLabels: round the camera
  tied?: boolean; // false for a second cluster in the same scene: the string ties each scene once
};

type Shown = Extract<Media, { kind: "image" | "post" | "video" }>;

// Videos need their compressed file and poster (npm run assets); until then they're left out.
const ready = (m: Media): m is Shown =>
  m.kind === "image" || m.kind === "post" ? !!mediaSize(m.src) : m.kind === "video" ? !!mediaSize(m.poster) : false;

// A cutout or sticker stands on its own; everything else is mounted.
const standsAlone = (m: Shown) => m.kind === "image" && /^\/media\/(cutouts|stickers|xeneva\/sticker)/.test(m.src);

// Where the camera's pointer labels point, in % of its box (the same spots as on /kit).
const CAMERA_POINTS: Pick<Pointer, "at" | "label">[] = [
  { at: [62, 60], label: [104, 92] },
  { at: [79, 12], label: [104, -6] },
  { at: [12, 40], label: [-4, 88] },
];

export function CardCluster({ seed, sets, label, cornerTags = [], labelStrip, pointers, tied = true }: Props) {
  const shownSets = sets.map((set) => ({ set, items: set.items.filter(ready) })).filter((s) => s.items.length);

  if (!shownSets.length && !tied) return null;
  // Nothing to show yet (Anthpo): a crayon mark holds the string's place.
  if (!shownSets.length) {
    return (
      <div className="relative mx-auto aspect-square w-40 sm:w-52" aria-hidden>
        <CrayonScribble kind="loop" colour="pink" seed={`${seed}:empty`} className="absolute inset-0 size-full" />
        <span data-string-pin className="absolute left-1/2 top-[18%] block size-2.5 -translate-x-1/2 rounded-full bg-ink shadow-lift" />
      </div>
    );
  }

  // Corner tag i goes on the first card of set i (or the next card of the last set).
  const corners = new Map<string, string>();
  cornerTags.forEach((tag, i) => {
    const s = Math.min(i, shownSets.length - 1);
    const item = shownSets[s].items[Math.max(0, i - s)] ?? shownSets[s].items[0];
    corners.set(key(item), tag);
  });

  return (
    <div role={label ? "group" : undefined} aria-label={label} className="flex flex-col items-center">
      {shownSets.map(({ set, items }, s) => (
        <div
          key={set.label}
          role={set.alt && !label ? "group" : undefined}
          aria-label={set.alt && !label ? set.alt : undefined}
          className={`relative flex w-full flex-wrap items-start justify-center ${s > 0 ? (pointers ? "mt-6" : "-mt-4 sm:-mt-8") : ""}`}
        >
          {items.map((m, i) => {
            const lead = s === 0 && i === 0;
            const alone = standsAlone(m);
            // A set's only video plays wide (the IndiaFOSS ad); photos and videos in the sets after
            // the first (the meetups, the vlog clips) are bigger than the first set's extras.
            const wide = lead || (m.kind === "video" && items.length === 1);
            const later = s > 0 && !alone;
            const width = wide
              ? alone
                ? "w-[62%] max-w-[18rem]"
                : "w-[80%] max-w-[26rem]"
              : alone
                ? "w-[30%] max-w-[9rem]"
                : later
                  ? "w-[50%] max-w-[17rem]"
                  : "w-[48%] max-w-[15rem]";
            // A messy pile: neighbours overlap a little and sit at slightly different heights.
            const pile = wide ? "z-0" : `${later ? "-mx-[3%]" : "-mx-[1.5%]"} ${i % 2 ? "mt-8" : "-mt-2"}`;
            const corner = corners.get(key(m));
            let card: ReactNode = (
              <WorkCard
                src={m.src}
                alt={m.kind === "video" ? "" : (m.alt ?? "")}
                sizes={wide ? "(max-width: 640px) 80vw, 416px" : "(max-width: 640px) 50vw, 272px"}
                mount={!alone}
                attach={lead && tied ? (alone ? "tape" : "pin") : "none"}
                caption={alone ? undefined : m.alt}
                corner={corner ? <CornerTag text={corner} /> : null}
                media={m.kind === "video" ? <InViewVideo src={m.src} poster={m.poster} label={m.alt || set.alt} /> : undefined}
              />
            );
            if (lead && pointers && m.kind === "image" && m.src.endsWith("/camera.png")) {
              card = <PointerLabel pointers={pointers.map((text, p) => ({ text, ...CAMERA_POINTS[p] }))}>{card}</PointerLabel>;
            }
            return (
              <div key={key(m)} className={`relative ${width} ${pile}`}>
                {card}
              </div>
            );
          })}
          {labelStrip && s === shownSets.length - 1 ? (
            <LabelStrip text={labelStrip} className={`absolute left-[8%] z-20 ${pointers && shownSets.length === 1 ? "-top-3" : "-bottom-3"}`} />
          ) : null}
        </div>
      ))}
    </div>
  );
}

const key = (m: Shown) => m.src;
