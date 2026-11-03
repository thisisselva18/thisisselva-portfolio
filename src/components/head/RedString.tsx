"use client";

// The red string (design.md sections 5, 8 and 10): one length of real-looking string in
// --red, slightly fuzzy, sagging only a little between pins. It ties every [data-string-pin]
// inside its parent, in page order, and is measured again whenever the parent changes size.
// The cards hang from it: each sways gently from its pin (stop-motion, off with reduced
// motion), and the pin stays put, so the string itself never has to move.
// It's decoration, not the screen's one red shape. Put it inside a positioned parent, after the cards.

import { useLayoutEffect, useRef, useState } from "react";
import { sagPath } from "@/lib/rough";
import { sway as swayCard } from "@/motion/presets";

type Props = {
  sag?: number; // how far it dips between two pins, as a fraction of the run
  sway?: boolean; // whether the cards hanging from it sway
  className?: string;
};

export function RedString({ sag = 0.05, sway = true, className }: Props) {
  const svg = useRef<SVGSVGElement>(null);
  const [d, setD] = useState("");

  useLayoutEffect(() => {
    const parent = svg.current?.parentElement;
    if (!parent) return;
    const pins = () => Array.from(parent.querySelectorAll<HTMLElement>("[data-string-pin]"));
    const measure = () => {
      const box = parent.getBoundingClientRect();
      const points = pins().map((pin) => {
        const r = pin.getBoundingClientRect();
        return [r.left + r.width / 2 - box.left, r.top + r.height / 2 - box.top] as [number, number];
      });
      setD(sagPath(points, sag));
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(parent);

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
      swings.forEach((tween) => tween?.revert());
    };
  }, [sag, sway]);

  return (
    <svg ref={svg} aria-hidden className={`pointer-events-none absolute inset-0 z-30 size-full overflow-visible ${className ?? ""}`}>
      <defs>
        {/* A few loose fibres round the string: a soft, slightly ragged halo, not a clean line. */}
        <filter id="string-fuzz" x="-5%" y="-5%" width="110%" height="110%">
          <feTurbulence type="fractalNoise" baseFrequency="1.4" numOctaves="1" seed="3" result="noise" />
          <feDisplacementMap in="SourceGraphic" in2="noise" scale="2.2" />
        </filter>
      </defs>
      <path d={d} fill="none" stroke="var(--red)" strokeWidth="4" strokeOpacity="0.28" filter="url(#string-fuzz)" />
      <path d={d} fill="none" stroke="var(--red)" strokeWidth="2" strokeLinecap="round" />
      {/* A twist of darker fibre along it, so it reads as twisted string, not a drawn line. */}
      <path d={d} fill="none" stroke="var(--ink)" strokeOpacity="0.18" strokeWidth="2" strokeDasharray="2 5" />
    </svg>
  );
}
