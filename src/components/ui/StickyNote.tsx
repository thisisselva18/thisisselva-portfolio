// The details, on a sticky note (design.md section 8): a square-ish note in --note,
// Geist Sans in ink, at a small angle, the bottom corner curling up very slightly with
// the only shadow under the curl. No tape: it's sticky. Links and buttons sit on the note.
// Media the script places after a note is laid out by the scene, not inside the note.

import type { Link, StickyNote as StickyNoteContent } from "@/content/types";
import { extras } from "@/content/extras";
import { tilt } from "@/lib/rough";
import { MarkerLink } from "./MarkerLink";
import { StickerButton } from "./StickerButton";

type Props = {
  note: StickyNoteContent;
  seed: string; // keeps each note's angle the same on every visit: the scene id plus its index
  className?: string;
};

// Runs of links that share a group ("REELS – ROTARACT") stay together under their label.
function groupLinks(links: Link[]) {
  const runs: { group?: string; links: Link[] }[] = [];
  for (const link of links) {
    const last = runs[runs.length - 1];
    if (last && last.group === link.group) last.links.push(link);
    else runs.push({ group: link.group, links: [link] });
  }
  return runs;
}

// A link that belongs to an embed in this note ("EMBED + LINK" in the script) is shown as the
// button under that embed, so the note doesn't repeat it.
function embedIds(note: StickyNoteContent) {
  return (note.media ?? [])
    .flatMap((set) => set.items)
    .flatMap((m) => (m.kind === "youtube" || m.kind === "instagram" ? [m.id] : []));
}

export function StickyNote({ note, seed, className }: Props) {
  const embedded = embedIds(note);
  const links = note.links?.filter((l) => l.style !== "button" && !embedded.some((id) => l.href.includes(id)) && !extras.linkButtons[l.href]) ?? [];
  const buttons = note.links?.filter((l) => l.style === "button") ?? [];

  return (
    <div
      className={`sticky-note mx-2 max-w-[30rem] ${className ?? ""}`}
      style={{ rotate: `${tilt(`note:${seed}`, 3)}deg` }}
      data-sticky-note
    >
      <span className="sticky-note__curl-shadow" aria-hidden />
      <div className="texture texture-note sticky-note__paper px-6 py-6 font-sans text-details text-ink sm:px-7 sm:py-7">
        {note.heading ? <h3 className="mb-3 text-details font-semibold leading-snug">{note.heading}</h3> : null}
        {note.body.filter((paragraph) => !extras.hiddenParagraphs.includes(paragraph)).map((paragraph) => (
          <p key={paragraph} className="mb-3 max-w-[var(--details-measure)] last:mb-0">
            {paragraph}
          </p>
        ))}
        {links.length ? (
          <div className="mt-4 space-y-3">
            {groupLinks(links).map((run) => (
              <div key={run.group ?? run.links[0].href}>
                {run.group ? <p className="mb-1 font-mono text-mono">{run.group}</p> : null}
                <ul className="space-y-1">
                  {run.links.map((link) => (
                    <li key={link.href}>
                      <MarkerLink link={{ ...link, label: extras.linkLabels[link.label] ?? link.label }} />
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        ) : null}
        {buttons.length ? (
          <div className="mt-5 flex flex-wrap gap-4">
            {buttons.map((b) => (
              <StickerButton key={b.href} label={b.label} href={b.href} />
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}
