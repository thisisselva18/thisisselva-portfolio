// One timeline entry (design.md section 7): the card cluster on the scene's side, and the
// supertitles, stat and sticky notes on the other. On a phone the cards go on top and the
// notes below, centred, so the red string runs straight down the middle.
// Media the script places after a note (embeds, photos) is laid out here, under that note.

import { Fragment } from "react";
import { extras } from "@/content/extras";
import type { Link, MediaSet, Scene as SceneContent, StickyNote as NoteContent } from "@/content/types";
import { InViewVideo } from "@/components/ui/InViewVideo";
import { OriginalButton, ReelEmbed } from "@/components/ui/ReelEmbed";
import { StatCallout } from "@/components/ui/StatCallout";
import { StickyNote } from "@/components/ui/StickyNote";
import { Supertitle } from "@/components/ui/Supertitle";
import { WorkCard } from "@/components/ui/WorkCard";
import { CardCluster } from "./CardCluster";

type Embed = Extract<MediaSet["items"][number], { kind: "youtube" | "instagram" }>;
const isEmbed = (m: MediaSet["items"][number]): m is Embed => m.kind === "youtube" || m.kind === "instagram";

const button = (id: string) => extras.embedButton[id] ?? extras.embedButton.default;
const originalFor = (note: NoteContent, id: string) => note.links?.find((l) => l.href.includes(id));

function NoteMedia({ set, note, wide, fill }: { set: MediaSet; note: NoteContent; wide?: boolean; fill?: boolean }) {
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
      <div role="group" aria-label={set.alt} className={`w-full space-y-6 ${wide ? "lg:flex lg:items-start lg:justify-center lg:gap-16 lg:space-y-0" : ""}`}>
        {groups.map(({ group, reels }) => (
          <div key={group ?? reels[0].media.id} className="min-w-0">
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

  // Pictures: a small pile of captioned cards. A picture on its own (the SoundCloud screenshot)
  // keeps its caption on show, not only on hover (the user's call).
  const pictures = set.items.flatMap((m) => (m.kind === "image" || m.kind === "post" || m.kind === "video" ? [m] : []));
  return (
    <div role={set.alt ? "group" : undefined} aria-label={set.alt} className="flex w-full flex-wrap items-start justify-center">
      {pictures.map((m, i) => (
        <div key={m.src} className={`${pictures.length > 1 ? "w-[52%] max-w-[16rem]" : fill ? "w-full max-w-[24rem]" : m.kind === "video" ? "w-[62%] max-w-[15rem]" : "w-[78%] max-w-[22rem]"} ${i ? "-ml-[4%] mt-10" : ""}`}>
          <WorkCard
            src={m.src}
            alt={m.kind === "video" ? "" : (m.alt ?? "")}
            sizes="(max-width: 640px) 60vw, 352px"
            attach="none"
            caption={m.alt}
            captionShown={pictures.length === 1 || extras.shownCaptions.includes(m.src)}
            media={m.kind === "video" ? <InViewVideo src={m.src} poster={m.poster} label={m.alt || set.alt || set.label} /> : undefined}
          />
        </div>
      ))}
    </div>
  );
}

// Scenes told in parts (the user: the clubs and Shunya are two blocks, each one a tidy
// rectangle). Each part has its own supertitles, cards and notes; the sides flip from one part
// to the next, so the page still zigzags. `wideMedia` lays its notes' media (the club reels)
// across the whole block underneath; `mediaBeside` puts its notes' pictures with the cards (the
// SoundCloud screenshot next to the music note); `tail` notes sit side by side under the block. On a phone
// it all reads top to bottom in that order. Only the first part's cards are tied to the string.
// `mediaUnder` puts its notes' pictures under the cards on a laptop (Homebrew's "Spotted in the
// wild"), and after their note on a phone, so the notes on the other side sit close together.
// `buttonsUnderCards` drops its notes' embeds and puts each one's Watch here button under the cards
// instead, where the same video already plays (the IndiaFOSS ad, the user's call).
// `embedsAsCards` shows its notes' embeds on the cards side, one under another, in place of cards
// (Anthpo has no pictures; its two videos go there, the user's call). `tailMediaBeside` puts the tail
// notes' media on the left with the tail notes stacked beside it (the Shunya QR video, Day 0, What happened).
type Part = { lines: number[]; cards: number[]; notes: number[]; tail?: number[]; wideMedia?: boolean; mediaBeside?: boolean; mediaUnder?: boolean; buttonsUnderCards?: boolean; embedsAsCards?: boolean; tailMediaBeside?: boolean };
const PARTS: Record<string, Part[]> = {
  "clubs-2025": [
    { lines: [0], cards: [0], notes: [0], wideMedia: true },
    { lines: [1], cards: [1], notes: [1, 2], tail: [3, 4], tailMediaBeside: true },
  ],
  "music-2020": [{ lines: [0, 1], cards: [0], notes: [0], mediaBeside: true }],
  "homebrew-2026": [{ lines: [0], cards: [0], notes: [0, 1, 2], mediaUnder: true }],
  anthpo: [{ lines: [0], cards: [], notes: [0], embedsAsCards: true }],
  "indiafoss-2026": [{ lines: [0], cards: [0, 1], notes: [0, 1, 2, 3], buttonsUnderCards: true }],
};

// A headline whose stat starts its own line ("120K+ impressions.") is sized to its column, so that
// line never has to wrap or run over: the line is about 9em wide, so at most 10.5% of the column.
const FIT_STAT_LINE = "!text-[length:min(var(--supertitle-size),10.5cqi)]";

// A note's link the user turned into a button under the cards (the Shunya reel): it sits centred
// under the lead card's tilted bottom edge.
function movedButtons(scene: SceneContent, part: Part) {
  const moved = [...part.notes, ...(part.tail ?? [])].flatMap((i) => (scene.notes[i].links ?? []).filter((l) => extras.linkButtons[l.href]));
  return moved.length ? (
    <div className="flex flex-wrap justify-center gap-4 whitespace-nowrap">
      {moved.map((l) => (
        <OriginalButton key={l.href} link={l} text={extras.linkButtons[l.href]} />
      ))}
    </div>
  ) : undefined;
}

function Note({ scene, i, noMedia, phoneOnlyMedia }: { scene: SceneContent; i: number; noMedia?: boolean; phoneOnlyMedia?: boolean }) {
  const note = scene.notes[i];
  return (
    <>
      <StickyNote note={note} seed={`${scene.id}-${i}`} className="w-full" />
      {noMedia
        ? null
        : note.media?.map((set) =>
            phoneOnlyMedia ? (
              <div key={set.label} className="w-full lg:hidden">
                <NoteMedia set={set} note={note} />
              </div>
            ) : (
              <NoteMedia key={set.label} set={set} note={note} />
            ),
          )}
    </>
  );
}

export function Scene({ scene }: { scene: SceneContent }) {
  const corners = (lines: number[]) => lines.flatMap((l) => (scene.supertitles[l].cornerTag ? [scene.supertitles[l].cornerTag as string] : []));
  // A stat that's already in a supertitle is circled there, not repeated below it.
  const statInLine = !!scene.stat && scene.supertitles.some((l) => l.text.includes(scene.stat as string));
  const all = (n: number) => Array.from({ length: n }, (_, i) => i);
  const parts: Part[] = PARTS[scene.id] ?? [{ lines: all(scene.supertitles.length), cards: all(scene.cards.length), notes: all(scene.notes.length) }];
  const split = parts.length > 1 || !!PARTS[scene.id];

  return (
    <section id={scene.id} aria-labelledby={`${scene.id}-title`} className="relative z-10 space-y-14 py-16 sm:py-20">
      {parts.map((part, p) => {
        const right = (scene.side === "right") !== (p % 2 === 1);
        const cardsCol = right ? "lg:col-start-2" : "lg:col-start-1";
        const textCol = right ? "lg:col-start-1" : "lg:col-start-2";
        return (
          <div key={p} className={`grid gap-8 lg:grid-cols-2 lg:gap-x-16 lg:gap-y-6 ${split ? "lg:items-center" : "lg:items-start"}`}>
            <div className={`min-w-0 lg:row-start-1 ${split ? "" : "lg:pt-10"} ${cardsCol} ${part.mediaBeside ? "flex items-center justify-center gap-[4%]" : ""}`}>
              {part.embedsAsCards ? (
                <div className="relative flex flex-col items-center gap-8">
                  <span aria-hidden data-string-pin className="absolute left-1/2 top-0 z-30 block size-2.5 -translate-x-1/2 rounded-full bg-ink shadow-lift" />
                  {part.notes.flatMap((i) =>
                    (scene.notes[i].media ?? []).flatMap((set) =>
                      set.items.filter(isEmbed).map((m) => <NoteMedia key={m.id} set={{ ...set, items: [m] }} note={scene.notes[i]} />),
                    ),
                  )}
                </div>
              ) : (
              <div className={part.mediaBeside ? "w-[34%] shrink-0" : ""}>
                <CardCluster
                  seed={p ? `${scene.id}-${p}` : scene.id}
                  sets={part.cards.map((c) => scene.cards[c])}
                  label={p ? undefined : scene.cardsAlt}
                  cornerTags={corners(part.lines)}
                  labelStrip={p ? undefined : extras.labelStrips[scene.id]}
                  pointers={p ? undefined : (extras.pointerLabels as Record<string, readonly string[]>)[scene.id]?.slice()}
                  tied={p === 0}
                  fill={part.mediaBeside}
                  underLead={movedButtons(scene, part)}
                />
              </div>
              )}
              {/* The notes' pictures beside the cards (the SoundCloud screenshot next to the music note). */}
              {part.buttonsUnderCards ? (
                <div className="mt-6 flex flex-wrap justify-center gap-4">
                  {part.notes.flatMap((i) =>
                    (scene.notes[i].media ?? []).flatMap((set) =>
                      set.items.filter(isEmbed).flatMap((m) => {
                        const original = originalFor(scene.notes[i], m.id);
                        return original ? [<OriginalButton key={m.id} link={original} text={button(m.id)} />] : [];
                      }),
                    ),
                  )}
                </div>
              ) : null}
              {part.mediaUnder ? (
                <div className="mt-6 hidden lg:block">
                  {part.notes.flatMap((i) => scene.notes[i].media?.map((set) => <NoteMedia key={set.label} set={set} note={scene.notes[i]} />) ?? [])}
                </div>
              ) : null}
              {part.mediaBeside ? (
                <div className="min-w-0 flex-1">
                  {part.notes.flatMap((i) => scene.notes[i].media?.map((set) => <NoteMedia key={set.label} set={set} note={scene.notes[i]} fill />) ?? [])}
                </div>
              ) : null}
            </div>

            <div className={`flex min-w-0 flex-col items-center gap-5 lg:row-start-1 lg:items-start ${textCol}`}>
              <div className="@container w-full space-y-4 text-center lg:text-left">
                {part.lines.map((l, i) => {
                  const line = scene.supertitles[l];
                  const heading = l === 0 ? { as: "h2" as const, id: `${scene.id}-title` } : i === 0 ? { as: "h3" as const } : { as: "p" as const };
                  return <Supertitle key={line.text} line={line} strip circle={statInLine ? scene.stat : undefined} {...heading} className={`mx-auto lg:mx-0 ${statInLine ? FIT_STAT_LINE : ""}`} />;
                })}
                {p === 0
                  ? extras.extraLines[scene.id]?.map(({ text, circle }) => <Supertitle key={text} line={{ text }} strip circle={circle} className={`mx-auto !mt-1 lg:mx-0 ${FIT_STAT_LINE}`} />)
                  : null}
              </div>
              {p === 0 && scene.stat && !statInLine ? <StatCallout stat={scene.stat} /> : null}
              {part.notes.map((i) => (
                <Note key={i} scene={scene} i={i} noMedia={part.wideMedia || part.mediaBeside || part.buttonsUnderCards || part.embedsAsCards} phoneOnlyMedia={part.mediaUnder} />
              ))}
            </div>

            {part.wideMedia ? (
              <div className="min-w-0 lg:col-span-2">
                {part.notes.flatMap((i) => scene.notes[i].media?.map((set) => <NoteMedia key={set.label} set={set} note={scene.notes[i]} wide />) ?? [])}
              </div>
            ) : null}

            {part.tail && part.tailMediaBeside ? (
              <div className="grid min-w-0 gap-5 lg:col-span-2 lg:grid-cols-2 lg:gap-x-16">
                {/* The video lines up with the notes' column edge above, and runs from the top of the
                    first tail note to the bottom of the last (cropping a little, never squashing). */}
                <div className="relative hidden lg:block">
                  {part.tail.flatMap((i) =>
                    (scene.notes[i].media ?? []).flatMap((set) =>
                      set.items.flatMap((m) =>
                        m.kind === "video" ? (
                          <div key={m.src} className="absolute inset-y-0 left-5 aspect-[9/16]">
                            <WorkCard
                              src={m.src}
                              alt=""
                              sizes="240px"
                              attach="none"
                              className="flex h-full flex-col"
                              media={<InViewVideo src={m.src} poster={m.poster} label={m.alt || set.alt || set.label} className="min-h-0 grow object-cover" />}
                            />
                          </div>
                        ) : (
                          []
                        ),
                      ),
                    ),
                  )}
                </div>
                <div className="flex min-w-0 flex-col items-center gap-5 lg:items-start">
                  {part.tail.map((i) => (
                    <Note key={i} scene={scene} i={i} phoneOnlyMedia />
                  ))}
                </div>
              </div>
            ) : part.tail ? (
              <div className="grid min-w-0 gap-5 lg:col-span-2 lg:grid-cols-2 lg:items-start lg:gap-16">
                {part.tail.map((i) => (
                  <div key={i} className="flex min-w-0 flex-col items-center gap-5">
                    <Note scene={scene} i={i} />
                  </div>
                ))}
              </div>
            ) : null}
          </div>
        );
      })}
    </section>
  );
}
