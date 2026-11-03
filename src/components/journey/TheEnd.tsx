// The zoom out and the end (design.md section 9, "The end"): "So much more to come", then the
// present-day cutout in front of wavy newsprint bands made from the script's own lines, the
// social links around him like cards, one crayon scribble, and the dot as the dot of the
// exclamation mark in "Hit me up!". The red string ends at the top of his head.
// In scroll mode the cutout and the link cards pop in, and the lines fade in (Phase 5).

import { head, timeline, zoomOut } from "@/content/scenes";
import { site } from "@/content/site";
import { tilt } from "@/lib/rough";
import { CrayonScribble } from "@/components/ui/CrayonScribble";
import { Dot } from "@/components/ui/Dot";
import { MediaImage } from "@/components/ui/MediaImage";
import { NewsprintBand } from "@/components/ui/NewsprintBand";
import { Supertitle } from "@/components/ui/Supertitle";
import { WorkCard } from "@/components/ui/WorkCard";
import type { Link } from "@/content/types";

// A social link as a card: the network's icon and its name, the whole card one link (the user's
// call, 3 Nov 2026). The name is the script's label up to the dash ("LinkedIn – linkedin.com/...").
function LinkCard({ link }: { link: Link }) {
  const name = link.label.split(" – ")[0];
  const icon = `/media/icons/${name.toLowerCase()}.png`;
  return (
    // The tilt sits on the link, not the item, so the item can pop in without losing it.
    <li data-pop>
      <a
        style={{ rotate: `${tilt(`end:${link.href}`, 3)}deg` }}
        href={link.href}
        target="_blank"
        rel="noopener noreferrer"
        className="sticker-button texture texture-mount flex items-center gap-4 px-5 py-3 font-sans text-[length:var(--supertitle-small-size)] font-medium leading-none text-ink shadow-lift"
      >
        <span className="block w-[1.4em] shrink-0">
          <MediaImage src={icon} alt="" sizes="48px" />
        </span>
        {name}
      </a>
    </li>
  );
}

// The signoff, with the dot standing in for the dot of its last "!".
function Signoff({ text }: { text: string }) {
  const bang = text.endsWith("!");
  return (
    <p data-fade className="font-serif text-supertitle text-ink">
      {bang ? text.slice(0, -1) : text}
      {bang ? (
        <span className="relative inline-block">
          <span className="inline-block [clip-path:inset(0_0_24%_0)]">{text.slice(-1)}</span>
          <Dot className="absolute bottom-[0.09em] left-1/2 -translate-x-1/2" />
        </span>
      ) : null}
    </p>
  );
}

export function TheEnd() {
  const { end } = site;
  const cutout = zoomOut.cards[0].items[0];
  const newsprint = [head, ...timeline, zoomOut, end].flatMap((m) => [m.slug, ...m.visual.split("\n")]);
  const half = Math.ceil(end.links.length / 2);
  if (cutout.kind !== "image") return null;

  return (
    <section id="the-end" aria-labelledby="zoom-out-title" className="relative z-10 flex flex-col items-center gap-14 pb-28 pt-20 sm:pt-28">
      <div data-fade className="w-full">
        <Supertitle line={zoomOut.supertitles[0]} strip as="h2" id="zoom-out-title" className="mx-auto text-center" />
      </div>

      <div className="relative w-full">
        <NewsprintBand lines={newsprint} seed="the-end" bands={9} className="absolute -inset-x-4 top-1/2 sm:-inset-x-10 h-[19rem] -translate-y-1/2 sm:h-[24rem]" />
        <div className="relative grid items-center gap-10 lg:grid-cols-[1fr_auto_1fr]">
          <div data-pop className="relative mx-auto w-60 sm:w-72 lg:order-2">
            <WorkCard src={cutout.src} alt={cutout.alt ?? ""} sizes="(max-width: 640px) 64vw, 288px" mount={false} attach="tape" />
            <CrayonScribble kind="star" colour="blue" seed="the-end" className="absolute -right-14 top-6 w-12" />
          </div>
          <ul className="flex flex-col items-center gap-9 lg:order-1 lg:items-end">
            {end.links.slice(0, half).map((link) => (
              <LinkCard key={link.href} link={link} />
            ))}
          </ul>
          <ul className="flex flex-col items-center gap-9 lg:order-3 lg:items-start">
            {end.links.slice(half).map((link) => (
              <LinkCard key={link.href} link={link} />
            ))}
          </ul>
        </div>
      </div>

      <Signoff text={end.signoff.text} />
    </section>
  );
}
