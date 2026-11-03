// One timeline entry (design.md section 7): the card cluster on the scene's side, and the
// supertitles, stat and sticky notes on the other. On a phone the cards go on top and the
// notes below, centred, so the red string runs straight down the middle.
// Media the script places after a note (embeds, photos) is laid out here, under that note.

import { Fragment } from "react";
import { extras } from "@/content/extras";
import type { Link, MediaSet, Scene as SceneContent, StickyNote as NoteContent } from "@/content/types";
import { ReelEmbed } from "@/components/ui/ReelEmbed";
import { StatCallout } from "@/components/ui/StatCallout";
import { StickyNote } from "@/components/ui/StickyNote";
import { Supertitle } from "@/components/ui/Supertitle";
import { WorkCard } from "@/components/ui/WorkCard";
import { CardCluster } from "./CardCluster";

type Embed = Extract<MediaSet["items"][number], { kind: "youtube" | "instagram" }>;
const isEmbed = (m: MediaSet["items"][number]): m is Embed => m.kind === "youtube" || m.kind === "instagram";

const button = (id: string) => extras.embedButton[id] ?? extras.embedButton.default;
const originalFor = (note: NoteContent, id: string) => note.links?.find((l) => l.href.includes(id));

function NoteMedia({ set, note }: { set: MediaSet; note: NoteContent }) {
  const embeds = set.items.filter(isEmbed);

  // A run of reels (the clubs): one row per link group, each under its label. On a phone the
  // row scrolls sideways inside itself; on a laptop the reels fan out, overlapping a little.
  if (embeds.length > 1) {
    const groups: { group?: string; reels: { media: Embed; original?: Link }[] }[] = [];
    for (const media of embeds) {
      const original = originalFor(note, media.id);
      const last = groups[groups.length - 1];
      if (last && last.group === original?.group) last.reels.push({ media, original });
      else groups.push({ group: original?.group, reels: [{ media, original }] });
    }
    return (
      <div role="group" aria-label={set.alt} className="w-full space-y-6">
        {groups.map(({ group, reels }) => (
          <div key={group ?? reels[0].media.id}>
            {group ? <p className="mb-2 px-2 font-mono text-mono text-ink">{group}</p> : null}
            <div className="-mx-[var(--gutter-phone)] flex snap-x snap-mandatory gap-5 overflow-x-auto px-[var(--gutter-phone)] pb-4 pt-6 sm:mx-0 sm:gap-0 sm:overflow-visible sm:px-0">
              {reels.map(({ media, original }, i) => (
                <ReelEmbed
                  key={media.id}
                  media={media}
                  original={original}
                  groupTitle={set.alt}
                  button={button(media.id)}
                  className={`w-[62vw] max-w-[15rem] shrink-0 snap-center sm:w-[12rem] ${i ? "sm:-ml-3" : ""} ${i % 2 ? "sm:mt-6" : ""}`}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (embeds.length === 1) {
    const media = embeds[0];
    return (
      <ReelEmbed
        media={media}
        original={originalFor(note, media.id)}
        groupTitle={set.alt}
        button={button(media.id)}
        className={media.kind === "youtube" ? "w-[calc(100%-1.5rem)] max-w-md" : "w-[62vw] max-w-[15rem]"}
      />
    );
  }

  // Pictures: a small pile of captioned cards.
  const pictures = set.items.flatMap((m) => (m.kind === "image" || m.kind === "post" ? [m] : []));
  return (
    <div role={set.alt ? "group" : undefined} aria-label={set.alt} className="flex w-full flex-wrap items-start justify-center">
      {pictures.map((m, i) => (
        <div key={m.src} className={`${pictures.length > 1 ? "w-[52%] max-w-[16rem]" : "w-[78%] max-w-[22rem]"} ${i ? "-ml-[4%] mt-10" : ""}`}>
          <WorkCard src={m.src} alt={m.alt ?? ""} sizes="(max-width: 640px) 60vw, 352px" attach="none" caption={m.alt} />
        </div>
      ))}
    </div>
  );
}

// Scenes whose story has a second part: from card set `cards` and note `notes` on, it goes under
// the card cluster on a laptop, so both halves stay full (the user: Shunya's reel and its notes
// fill the side under the club photos). On a phone it simply follows, in reading order.
const SECOND_PART: Record<string, { cards: number; notes: number }> = {
  "clubs-2025": { cards: 1, notes: 1 },
};

function Notes({ scene, notes, from }: { scene: SceneContent; notes: NoteContent[]; from: number }) {
  return notes.map((note, i) => (
    <Fragment key={note.heading ?? note.body[0] ?? i}>
      <StickyNote note={note} seed={`${scene.id}-${from + i}`} className="w-full" />
      {note.media?.map((set) => <NoteMedia key={set.label} set={set} note={note} />)}
    </Fragment>
  ));
}

export function Scene({ scene }: { scene: SceneContent }) {
  const right = scene.side === "right";
  const corners = scene.supertitles.flatMap((l) => (l.cornerTag ? [l.cornerTag] : []));
  // A stat that's already in a supertitle is circled there, not repeated below it.
  const statInLine = !!scene.stat && scene.supertitles.some((l) => l.text.includes(scene.stat as string));
  const split = SECOND_PART[scene.id];
  const cards = split ? scene.cards.slice(0, split.cards) : scene.cards;
  const notes = split ? scene.notes.slice(0, split.notes) : scene.notes;
  const cardsCol = right ? "lg:col-start-2" : "lg:col-start-1";
  const textCol = right ? "lg:col-start-1" : "lg:col-start-2";
  return (
    <section
      id={scene.id}
      aria-labelledby={`${scene.id}-title`}
      className="relative z-10 grid gap-12 py-20 sm:py-28 lg:grid-cols-2 lg:items-start lg:gap-16"
    >
      <div className={`min-w-0 lg:row-start-1 lg:pt-10 ${cardsCol}`}>
        <CardCluster
          seed={scene.id}
          sets={cards}
          label={scene.cardsAlt}
          cornerTags={corners}
          labelStrip={(extras.labelStrips as Record<string, string>)[scene.id]}
          pointers={(extras.pointerLabels as Record<string, readonly string[]>)[scene.id]?.slice()}
        />
      </div>

      <div className={`flex min-w-0 flex-col items-center gap-8 lg:row-span-2 lg:row-start-1 lg:items-start ${textCol}`}>
        <div className="w-full space-y-4 text-center lg:text-left">
          {scene.supertitles.map((line, i) => (
            <Supertitle key={line.text} line={line} strip circle={statInLine ? scene.stat : undefined} as={i === 0 ? "h2" : "p"} {...(i === 0 ? { id: `${scene.id}-title` } : {})} className="mx-auto lg:mx-0" />
          ))}
        </div>
        {scene.stat && !statInLine ? <StatCallout stat={scene.stat} /> : null}
        <Notes scene={scene} notes={notes} from={0} />
      </div>

      {split ? (
        <div className={`flex min-w-0 flex-col items-center gap-8 lg:row-start-2 lg:items-start ${cardsCol}`}>
          <CardCluster seed={`${scene.id}-2`} sets={scene.cards.slice(split.cards)} tied={false} />
          <Notes scene={scene} notes={scene.notes.slice(split.notes)} from={split.notes} />
        </div>
      ) : null}
    </section>
  );
}
