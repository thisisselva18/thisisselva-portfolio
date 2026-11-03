// Every design-kit piece on one page, for checking the design (docs/BUILD.md Phase 3).
// All the words are real ones from src/content/; the small labels naming each piece are
// for builders only. Not part of the site: it 404s in production.

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import { extras } from "@/content/extras";
import { head, timeline, zoomOut } from "@/content/scenes";
import { intro } from "@/content/intro";
import { site } from "@/content/site";
import type { Scene } from "@/content/types";
import { RedString } from "@/components/head/RedString";
import { CornerTag } from "@/components/ui/CornerTag";
import { CrayonScribble, type CrayonColour, type ScribbleKind } from "@/components/ui/CrayonScribble";
import { Dot } from "@/components/ui/Dot";
import { DottedLine } from "@/components/ui/DottedLine";
import { MarkerNote } from "@/components/ui/MarkerNote";
import { NewsprintBand } from "@/components/ui/NewsprintBand";
import { PointerLabel } from "@/components/ui/PointerLabel";
import { RedBurst } from "@/components/ui/RedBurst";
import { LabelStrip } from "@/components/ui/LabelStrip";
import { MarkerLink } from "@/components/ui/MarkerLink";
import { MediaImage } from "@/components/ui/MediaImage";
import { PostCard } from "@/components/ui/PostCard";
import { ReelEmbed } from "@/components/ui/ReelEmbed";
import { StatCallout } from "@/components/ui/StatCallout";
import { StickerButton } from "@/components/ui/StickerButton";
import { StickyNote } from "@/components/ui/StickyNote";
import { Supertitle } from "@/components/ui/Supertitle";
import { TapedFrame } from "@/components/ui/TapedFrame";
import { WorkCard } from "@/components/ui/WorkCard";
import { StickReplay } from "./StickReplay";

export const metadata: Metadata = { title: "Kit", robots: { index: false, follow: false } };

const scene = (id: string): Scene => {
  const found = timeline.find((s) => s.id === id);
  if (!found) throw new Error(`No scene ${id} in scenes.ts`);
  return found;
};

function Piece({ name, children, wide }: { name: string; children: ReactNode; wide?: boolean }) {
  return (
    <section className={`border-t border-ink/15 pt-6 ${wide ? "lg:col-span-2" : ""}`}>
      <h2 className="mb-8 font-mono text-mono text-ink/60">{name}</h2>
      {children}
    </section>
  );
}

export default function Kit() {
  if (process.env.NODE_ENV === "production") notFound();

  const camera = scene("camera-2017");
  const music = scene("music-2020");
  const youtube = scene("youtube-2024");
  const clubs = scene("clubs-2025");
  const blrSys = scene("bengaluru-systems-2026");
  // An embed from a note, with the link it came with ("EMBED + LINK") and its button's words.
  const embed = (s: Scene, id: string) => {
    for (const note of s.notes) {
      const set = note.media?.find((st) => st.items.some((m) => "id" in m && m.id === id));
      const media = set?.items.find((m) => "id" in m && m.id === id);
      if (media && (media.kind === "youtube" || media.kind === "instagram")) {
        const original = note.links?.find((l) => l.href.includes(id));
        return { media, original, groupTitle: set?.alt, button: extras.embedButton[id] ?? extras.embedButton.default };
      }
    }
    throw new Error(`No embed ${id} in ${s.id}`);
  };
  const latestVideo = embed(camera, "7C35Sxp9B3g");
  const viralReel = embed(clubs, "DN8dYkhCac1");
  const townSquare = intro.flatMap((b) => b.supertitles).find((l) => l.size === "small" && l.text.length > 32);
  const stats = timeline.filter((s) => s.stat).map((s) => s.stat as string);
  const cardSizes = "(max-width: 640px) 70vw, 300px";
  // Newsprint: the script's own scene headings and action lines, as texture.
  const newsprint = [head, ...timeline, zoomOut, site.end].flatMap((m) => [m.slug, ...m.visual.split("\n")]);
  // Where each pointer label points on the camera cutout, in % of its box.
  const [point, shoot, upload] = extras.pointerLabels["camera-2017"];
  const pointers = [
    { text: point, at: [62, 60], label: [104, 92] },
    { text: shoot, at: [79, 12], label: [104, -6] },
    { text: upload, at: [12, 40], label: [-4, 88] },
  ] satisfies { text: string; at: [number, number]; label: [number, number] }[];
  const crayons: CrayonColour[] = ["pink", "yellow", "blue", "green"];
  const kinds: ScribbleKind[] = ["loop", "zigzag", "star", "underline", "burst"];

  return (
    <main className="mx-auto max-w-[90rem] px-[var(--gutter-phone)] py-16 sm:px-10">
      <div className="grid gap-x-16 gap-y-20 lg:grid-cols-2">
        <Piece name="Supertitle: main, with the Heart face once" wide>
          <div className="space-y-10">
            <Supertitle line={head.supertitles[2]} as="h1" />
            <Supertitle line={youtube.supertitles[0]} />
            <Supertitle line={blrSys.supertitles[0]} />
          </div>
        </Piece>

        <Piece name="Supertitle: small, under its main line (serif up to 32 characters, then sans)">
          <div className="space-y-12">
            <div>
              <Supertitle line={music.supertitles[0]} />
              <Supertitle line={music.supertitles[1]} />
            </div>
            {townSquare ? <Supertitle line={townSquare} /> : null}
          </div>
        </Piece>

        <Piece name="Supertitle: on a strip of paper, for busy moments">
          <div className="texture texture-kraft p-8">
            <Supertitle line={clubs.supertitles[1]} strip />
          </div>
        </Piece>

        <Piece name="StickyNote: one note, with a link">
          <StickyNote note={camera.notes[0]} seed={`${camera.id}-0`} />
        </Piece>

        <Piece name="StickyNote: with a sticker button">
          <StickyNote note={music.notes[0]} seed={`${music.id}-0`} />
        </Piece>

        <Piece name="StickyNote: a pile, one note per part, with grouped links. The stick: drops in, top sticks, bottom flaps once (12fps)" wide>
          <StickReplay>
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:gap-0">
            {clubs.notes.slice(0, 3).map((note, i) => (
              <StickyNote key={note.heading ?? i} note={note} seed={`${clubs.id}-${i}`} className={`lg:-mr-4 lg:w-[23rem] lg:flex-none ${["", "lg:mt-10", "lg:mt-20"][i]}`} />
            ))}
          </div>
          </StickReplay>
        </Piece>

        <Piece name="WorkCard: mounted photo with a pin, mounted photo with tape, cutout on its own">
          <div className="flex flex-wrap items-start gap-10">
            <WorkCard
              src="/media/photos/clubs/rotaract-poster.jpg"
              alt=""
              sizes={cardSizes}
              className="w-44 sm:w-52"
              corner={clubs.supertitles[0].cornerTag ? <CornerTag text={clubs.supertitles[0].cornerTag} /> : null}
            />
            <WorkCard src="/media/photos/clubs/ecell-poster.jpg" alt="" sizes={cardSizes} attach="tape" className="w-48 sm:w-56" />
            <WorkCard src="/media/cutouts/guitar.png" alt="" sizes="120px" mount={false} className="w-20" />
          </div>
        </Piece>

        <Piece name="Cutouts from Photoroom: childhood (B&W halftone), present day (colour print)">
          <div className="flex flex-wrap items-end gap-8">
            <WorkCard src="/media/cutouts/childhood.png" alt="" sizes="(max-width: 640px) 60vw, 280px" mount={false} attach="tape" className="w-56" />
            <WorkCard src="/media/cutouts/present-day.png" alt="" sizes="(max-width: 640px) 60vw, 280px" mount={false} attach="tape" className="w-56" />
          </div>
        </Piece>

        <Piece name="PostCard: a clipping with one strip of tape">
          <PostCard src="/media/posts/bengaluru-systems/post-1.png" alt="" sizes="(max-width: 640px) 85vw, 360px" className="max-w-sm" />
        </Piece>

        <Piece name="TapedFrame: polaroid (thumbnail), phone (stand-in photo until the reels are compressed)">
          <div className="flex flex-wrap items-start gap-12">
            <TapedFrame seed="kit-polaroid" className="w-64">
              <MediaImage src="/media/youtube/four-years-ch1.png" alt="" sizes="256px" />
            </TapedFrame>
            <TapedFrame seed="kit-phone" variant="phone" className="ml-3 w-40">
              <MediaImage src="/media/photos/clubs/rotaract-poster.jpg" alt="" sizes="160px" />
            </TapedFrame>
          </div>
        </Piece>

        <Piece name="ReelEmbed: YouTube (the latest video) and an Instagram reel, each loading on tap, with its button underneath" wide>
          <div className="flex flex-col items-center gap-14 sm:flex-row sm:items-start sm:justify-start">
            <ReelEmbed {...latestVideo} className="w-[calc(100%-1.5rem)] max-w-md" />
            <ReelEmbed {...viralReel} className="w-52" />
          </div>
        </Piece>

        <Piece name="StickerButton">
          <div className="flex flex-wrap items-center gap-8">
            <StickerButton label={site.landing.story.button} />
            <StickerButton label={site.landing.scroll.button} />
            <StickerButton label={site.controls.replay} />
          </div>
        </Piece>

        <Piece name="MarkerLink">
          <ul className="space-y-3 text-details">
            {site.end.links.map((link) => (
              <li key={link.href}>
                <MarkerLink link={link} />
              </li>
            ))}
          </ul>
        </Piece>

        <Piece name="StatCallout: one per scene, from Scene.stat">
          <div className="flex flex-wrap items-center gap-10">
            {stats.map((stat) => (
              <StatCallout key={stat} stat={stat} />
            ))}
          </div>
        </Piece>

        <Piece name="CornerTag and LabelStrip">
          <div className="flex flex-wrap items-center gap-8">
            {youtube.supertitles.map((l) => (l.cornerTag ? <CornerTag key={l.cornerTag} text={l.cornerTag} /> : null))}
            {Object.values(extras.labelStrips).map((text) => (
              <LabelStrip key={text} text={text} />
            ))}
          </div>
        </Piece>

        <Piece name="Dot: breathing, on paper and on story-black">
          <div className="flex items-center gap-10">
            <Dot />
            <div className="flex h-28 w-48 items-center justify-center bg-story-black">
              <Dot tone="dark" />
            </div>
          </div>
        </Piece>

        <Piece name="CrayonScribble: loop, zigzag, star, underline, burst, in the four crayons">
          <div className="grid grid-cols-5 gap-4">
            {crayons.flatMap((colour) =>
              kinds.map((kind) => <CrayonScribble key={`${colour}-${kind}`} kind={kind} colour={colour} seed={`kit-${colour}-${kind}`} className="aspect-square w-full" />),
            )}
          </div>
        </Piece>

        <Piece name="RedBurst behind the childhood cutout, a crayon burst, and the marker note (the hand: Selva's traced arrow)" wide>
          <div className="flex flex-col items-center gap-8 overflow-x-clip py-16 sm:flex-row sm:justify-center sm:gap-4">
            <div className="relative mt-16 w-56 sm:w-72">
              <RedBurst seed="head" className="absolute -left-[25%] -top-[22%] w-[150%]" />
              <CrayonScribble kind="burst" colour="yellow" seed="head" weight={6} className="absolute -left-[38%] -top-[35%] aspect-square w-[176%]" />
              <WorkCard src="/media/cutouts/childhood.png" alt="" sizes="(max-width: 640px) 60vw, 288px" mount={false} attach="tape" className="relative" />
              {/* Anchored to the cutout: the words sit on clean paper above the burst, and the
                  arrow's tip lands on the top of the head (not the face). The tip is about 8px
                  in from the words' left edge and 124px below their top. */}
              <MarkerNote text={extras.markerNote.head} className="absolute left-[120px] top-[-106px] z-10 sm:left-[194px] sm:top-[-109px]" />
            </div>
          </div>
        </Piece>

        <Piece name="PointerLabel: the camera (words from extras.pointerLabels)">
          <div className="flex justify-center px-16 py-10">
            <PointerLabel pointers={pointers} className="w-56 sm:w-64">
              <WorkCard src="/media/cutouts/camera.png" alt="" sizes="256px" mount={false} attach="tape" />
            </PointerLabel>
          </div>
        </Piece>

        <Piece name="DottedLine: a card to its label">
          <div className="relative h-56 max-w-md">
            <WorkCard src="/media/cutouts/guitar.png" alt="" sizes="120px" mount={false} className="absolute left-2 top-2 w-20" />
            <div className="absolute bottom-4 right-4">
              <LabelStrip text={extras.labelStrips["camera-2017"]} />
            </div>
            <DottedLine from={[96, 96]} to={[250, 180]} />
          </div>
        </Piece>

        <Piece name="NewsprintBand behind the present-day cutout (the script's scene headings and action lines), with one crayon scribble left by the kid" wide>
          <div className="relative flex justify-center overflow-hidden py-6">
            <NewsprintBand lines={newsprint} seed="the-end" bands={9} className="absolute inset-x-0 top-1/2 h-[19rem] -translate-y-1/2" />
            <div className="relative w-56 sm:w-64">
              <WorkCard src="/media/cutouts/present-day.png" alt="" sizes="(max-width: 640px) 60vw, 256px" mount={false} attach="tape" />
              <CrayonScribble kind="star" colour="blue" seed="the-end" className="absolute -right-14 top-6 w-12" />
            </div>
          </div>
        </Piece>

        <Piece name="Red string sample: one length, sagging a little; the cards hang from it and sway. Routing is Phase 4" wide>
          <div className="relative flex flex-wrap items-start justify-between gap-y-24 px-2 pb-6 pt-4">
            <WorkCard src="/media/photos/clubs/rotaract-poster.jpg" alt="" sizes={cardSizes} className="w-40 sm:w-52" />
            <WorkCard src="/media/youtube/four-years-ch1.png" alt="" sizes={cardSizes} className="mt-20 w-52 sm:mr-24 sm:w-72" />
            <RedString />
          </div>
        </Piece>
      </div>
    </main>
  );
}
