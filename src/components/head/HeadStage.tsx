// The head (design.md section 9, "The head"): the childhood cutout in the middle with the red
// burst behind it, the objects that burst out in a loose ring around it (never over the face),
// the marker note pointing at the top of his head, then the three supertitles.
// In scroll mode this is simply on screen when the page opens. The red string starts at the top
// of his head. The opening and the cards flying out are Phase 5.

import type { CSSProperties } from "react";
import { extras } from "@/content/extras";
import { head } from "@/content/scenes";
import { CrayonScribble } from "@/components/ui/CrayonScribble";
import { MarkerNote } from "@/components/ui/MarkerNote";
import { RedBurst } from "@/components/ui/RedBurst";
import { Supertitle } from "@/components/ui/Supertitle";
import { WorkCard } from "@/components/ui/WorkCard";

// Where each burst object sits round the head, in % of the stage (left, top, width class).
// Kept to the sides and below, clear of the face and of the marker note top right.
// `lg` moves an object on a laptop, where the corner lines would hide it (the user's marks).
const RING: { left: number; top: number; w: string; lg?: [number, number] }[] = [
  { left: 1, top: 4, w: "w-[19%] sm:w-[11%]", lg: [13, 25] }, // camera
  { left: 2, top: 34, w: "w-[18%] sm:w-[9%]" }, // the cat (the favicon)
  { left: 1, top: 60, w: "w-[13%] sm:w-[7%]" }, // guitar
  { left: 81, top: 32, w: "w-[19%] sm:w-[10%]" }, // piano
  { left: 81, top: 52, w: "w-[18%] sm:w-[9%]" }, // headphones
  { left: 14, top: 78, w: "w-[20%] sm:w-[12%]" }, // Currents (a little bigger, the user's call)
  { left: 22, top: 1, w: "w-[17%] sm:w-[9%]", lg: [12, 50] }, // writing
  { left: 66, top: 80, w: "w-[15%] sm:w-[7%]" }, // idea
  { left: 80, top: 76, w: "w-[20%] sm:w-[11%]" }, // megaphone
  { left: 93, top: 6, w: "w-[6%] sm:w-[3%]" }, // music staff
];

// The lines that move to the stage's top corners on a laptop: which line, where, and its lean.
const CORNER_LINES = [
  { line: 1, at: "left-[1%] top-[8%] w-[38%]", lean: -6 }, // "One life, tons of stories to tell."
  { line: 2, at: "right-[1%] top-[9%] w-[28%]", lean: 6 }, // "Storyteller by heart."
];
const CORNER_SIZE = "!text-[length:calc(var(--supertitle-size)*0.55)]";

export function HeadStage() {
  const [cutoutSet, objectsSet] = head.cards;
  const cutout = cutoutSet.items[0];
  const objects = objectsSet.items.flatMap((m) => (m.kind === "image" ? [m] : []));
  if (cutout.kind !== "image") return null;

  return (
    <section id={head.id} aria-labelledby="head-title" className="relative z-10 pb-12 pt-10 sm:pt-16">
      <div className="relative mx-auto max-w-[64rem] px-[2%] pb-28 pt-36 sm:pb-36 sm:pt-40">
        <div aria-hidden>
          {objects.map((m, i) => (
            <div
              key={m.src}
              className={`absolute left-[var(--at-l)] top-[var(--at-t)] lg:left-[var(--at-lg-l)] lg:top-[var(--at-lg-t)] ${RING[i]?.w ?? "w-[14%]"}`}
              style={
                {
                  "--at-l": `${RING[i]?.left ?? 0}%`,
                  "--at-t": `${RING[i]?.top ?? 0}%`,
                  "--at-lg-l": `${RING[i]?.lg?.[0] ?? RING[i]?.left ?? 0}%`,
                  "--at-lg-t": `${RING[i]?.lg?.[1] ?? RING[i]?.top ?? 0}%`,
                } as CSSProperties
              }
            >
              <WorkCard src={m.src} alt="" sizes="(max-width: 640px) 20vw, 120px" mount={false} attach="none" />
            </div>
          ))}
        </div>

        <div className="relative mx-auto w-56 sm:w-72">
          <RedBurst seed="head" className="absolute -left-[25%] -top-[22%] w-[150%]" />
          <CrayonScribble kind="burst" colour="yellow" seed="head" weight={6} className="absolute -left-[38%] -top-[35%] aspect-square w-[176%]" />
          <WorkCard src={cutout.src} alt={cutout.alt ?? ""} sizes="(max-width: 640px) 60vw, 288px" mount={false} attach="tape" className="relative" />
          {/* Anchored to the cutout, as on /kit: the arrow's tip lands on the top of the head. */}
          <MarkerNote text={extras.markerNote.head} className="absolute left-[120px] top-[-106px] z-10 sm:left-[194px] sm:top-[-109px]" />
        </div>

        {/* On a laptop, the second and third lines sit in the top corners, among the objects, leaning
            outwards (the user's call, 3 Nov 2026). On a phone the corners are too narrow, so they
            stay under the first line (below). Overlapping the objects is fine. */}
        {CORNER_LINES.map(({ line: l, at, lean }) => (
          <div key={l} aria-hidden className={`absolute z-20 hidden lg:block ${at}`} style={{ rotate: `${lean}deg` }}>
            <Supertitle line={head.supertitles[l]} strip className={`mx-auto text-center ${CORNER_SIZE}`} />
          </div>
        ))}
      </div>

      <div className="mx-auto flex max-w-[40rem] flex-col items-center gap-5 text-center">
        {head.supertitles.map((line, i) => (
          <Supertitle
            key={line.text}
            line={line}
            strip
            as={i === 0 ? "h1" : "p"}
            {...(i === 0 ? { id: "head-title" } : {})}
            className={`mx-auto ${CORNER_LINES.some((c) => c.line === i) ? "lg:sr-only" : ""}`}
          />
        ))}
      </div>
    </section>
  );
}
