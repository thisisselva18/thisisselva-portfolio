"use client";

// The red string (design.md sections 5, 8 and 10): one length of real-looking string in
// --red, slightly fuzzy, sagging only a little between pins. It ties every [data-string-pin]
// inside its parent, in page order, and is measured again whenever the parent changes size.
// The cards hang from it: each sways gently from its pin (stop-motion, off with reduced
// motion), and the pin stays put, so the string itself never has to move.
// It's decoration, not the screen's one red shape. Put it inside a positioned parent, after the cards.
//
// Scroll mode (Phase 5): with `grow`, the string draws itself down the page as the visitor
// scrolls, its tip a little ahead of what they're reading, and never draws back up. The head
// opening makes its first run slack and pulls it taut (src/motion/events.ts). With reduced
// motion it's simply there.

import { useId, useLayoutEffect, useRef, useState } from "react";
import { sagPath } from "@/lib/rough";
import { STRING_MEASURE, STRING_SLACK } from "@/motion/events";
import { sway as swayCard } from "@/motion/presets";
import { prefersReducedMotion } from "@/motion/reducedMotion";

type Props = {
  sag?: number; // how far it dips between two pins, as a fraction of the run
  sway?: boolean; // whether the cards hanging from it sway
  grow?: boolean; // scroll mode: draws itself down the page as the visitor scrolls
  layer?: "front" | "behind"; // behind: under the cards and notes, showing in the gaps (the page)
  className?: string;
};

// How far down the screen the string's tip runs: a little ahead of what's being read.
const TIP = 0.8;
// The clip that hides the string below its tip reaches this far past everything else.
const FAR = 100_000;

export function RedString({ sag = 0.05, sway = true, grow = false, layer = "front", className }: Props) {
  const svg = useRef<SVGSVGElement>(null);
  const clip = useRef<SVGRectElement>(null);
  const [d, setD] = useState("");
  const [growing, setGrowing] = useState(false);
  const id = `string-${useId().replace(/[^a-zA-Z0-9_-]/g, "")}`;

  useLayoutEffect(() => {
    const parent = svg.current?.parentElement;
    if (!parent) return;
    let points: [number, number][] = [];
    let slack = 0;
    const draw = () => setD(sagPath(points, sag, slack));
    const pins = () => Array.from(parent.querySelectorAll<HTMLElement>("[data-string-pin]"));
    const measure = () => {
      const box = parent.getBoundingClientRect();
      points = pins().map((pin) => {
        const r = pin.getBoundingClientRect();
        return [r.left + r.width / 2 - box.left, r.top + r.height / 2 - box.top] as [number, number];
      });
      draw();
    };
    const onSlack = (e: Event) => {
      slack = (e as CustomEvent<number>).detail;
      draw();
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(parent);
    // Late fonts and images can move pins without changing the parent's size much.
    document.fonts?.ready.then(measure);
    window.addEventListener("load", measure);
    window.addEventListener(STRING_MEASURE, measure);
    window.addEventListener(STRING_SLACK, onSlack);

    // Growing with the scroll: the clip's bottom edge follows the tip, and only ever goes down.
    const grows = grow && !prefersReducedMotion();
    setGrowing(grows);
    let reach = -Infinity;
    let frame = 0;
    const tip = () => {
      frame = 0;
      reach = Math.max(reach, window.innerHeight * TIP - parent.getBoundingClientRect().top);
      clip.current?.setAttribute("height", String(FAR + reach));
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(tip);
    };
    if (grows) {
      tip();
      window.addEventListener("scroll", onScroll, { passive: true });
      window.addEventListener("resize", onScroll);
    }

    // Each card swings round its own pin (the pin's spot inside the card, before any tilt).
    const swings = sway
      ? pins().map((pin, i) => {
          const card = pin.offsetParent as HTMLElement | null;
          if (!card || !parent.contains(card)) return null;
          // offsetLeft/Top ignore the pin's own CSS translate (it's centred with one, often in %), so add it back.
          const size = [pin.offsetWidth, pin.offsetHeight];
          const [tx = 0, ty = 0] = getComputedStyle(pin)
            .translate.split(" ")
            .map((v, axis) => (v.endsWith("%") ? (parseFloat(v) / 100) * size[axis] : parseFloat(v) || 0));
          const tilt = parseFloat(getComputedStyle(card).rotate) || 0; // the card's own crooked angle
          return swayCard(card, [pin.offsetLeft + size[0] / 2 + tx, pin.offsetTop + size[1] / 2 + ty], tilt, i + 1);
        })
      : [];

    return () => {
      observer.disconnect();
      window.removeEventListener("load", measure);
      window.removeEventListener(STRING_MEASURE, measure);
      window.removeEventListener(STRING_SLACK, onSlack);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (frame) cancelAnimationFrame(frame);
      swings.forEach((tween) => tween?.revert());
    };
  }, [sag, sway, grow]);

  return (
    <svg
      ref={svg}
      aria-hidden
      data-red-string
      className={`pointer-events-none absolute inset-0 ${layer === "behind" ? "z-0" : "z-30"} size-full overflow-visible ${className ?? ""}`}
    >
      <defs>
        {/* A few loose fibres round the string: a soft, slightly ragged halo, not a clean line. */}
        <filter id={`${id}-fuzz`} x="-5%" y="-5%" width="110%" height="110%">
          <feTurbulence type="fractalNoise" baseFrequency="1.4" numOctaves="1" seed="3" result="noise" />
          <feDisplacementMap in="SourceGraphic" in2="noise" scale="2.2" />
        </filter>
        {/* Always there, so the scroll code can move its edge; only used while growing. */}
        <clipPath id={`${id}-drawn`}>
          <rect ref={clip} data-string-tip x={-FAR} y={-FAR} width={FAR * 2} height={FAR} />
        </clipPath>
      </defs>
      <g clipPath={growing ? `url(#${id}-drawn)` : undefined}>
        <path d={d} fill="none" stroke="var(--red)" strokeWidth="4" strokeOpacity="0.28" filter={`url(#${id}-fuzz)`} />
        <path d={d} fill="none" stroke="var(--red)" strokeWidth="2" strokeLinecap="round" />
        {/* A twist of darker fibre along it, so it reads as twisted string, not a drawn line. */}
        <path d={d} fill="none" stroke="var(--ink)" strokeOpacity="0.18" strokeWidth="2" strokeDasharray="2 5" />
      </g>
    </svg>
  );
}
