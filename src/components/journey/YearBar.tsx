"use client";

// The year bar (design.md section 8): a thin strip of kraft tape along the bottom of the screen,
// 2017 to 2026. It fades in as the first scene (2017) arrives, after the head, and stays to the
// end. The dot sits on it and slides along as the visitor scrolls, reaching each scene's date as
// that scene reaches the middle of the screen; the stretch it has travelled is filled in red.
// At the end it's full, with the dot at the very end. Decoration: the years are in the corner tags.
// With reduced motion the dot doesn't slide: it sits on the date of the scene being read.

import { useEffect, useRef } from "react";
import { timeline, yearBar } from "@/content/scenes";
import { sceneDates } from "@/lib/years";
import { tornEdges } from "@/lib/rough";
import { prefersReducedMotion } from "@/motion/reducedMotion";
import { Dot } from "@/components/ui/Dot";

// The bar runs from the start of its first year to the end of its last.
const FROM = Number(yearBar.from);
const TO = Number(yearBar.to) + 1;
const at = (date: number) => Math.min(1, Math.max(0, (date - FROM) / (TO - FROM)));
// Each scene's spot on the bar, then the end (full).
const STOPS = [...sceneDates(timeline).map(at), 1];
const TICKS = Array.from({ length: TO - FROM - 1 }, (_, i) => at(FROM + i + 1)); // each new year
const SECTIONS = [...timeline.map((s) => s.id), "the-end"];

export function YearBar() {
  const bar = useRef<HTMLDivElement>(null);
  const fill = useRef<HTMLSpanElement>(null);
  const dot = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const reduced = prefersReducedMotion();
    let arrivals: number[] = []; // the scroll position at which each stop is reached
    let frame = 0;

    const update = () => {
      frame = 0;
      const y = window.scrollY;
      const n = arrivals.length;
      let p = STOPS[0];
      if (y >= arrivals[n - 1]) p = STOPS[n - 1];
      else
        for (let i = 0; i < n - 1; i++) {
          if (y >= arrivals[i] && y < arrivals[i + 1]) {
            p = reduced ? STOPS[i] : STOPS[i] + (STOPS[i + 1] - STOPS[i]) * ((y - arrivals[i]) / (arrivals[i + 1] - arrivals[i]));
            break;
          }
        }
      const shown = y >= arrivals[0] - window.innerHeight * 0.35;
      if (bar.current) {
        bar.current.dataset.shown = String(shown);
        bar.current.dataset.at = p.toFixed(4);
      }
      if (fill.current) fill.current.style.width = `${p * 100}%`;
      if (dot.current) dot.current.style.left = `${p * 100}%`;
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    // A scene arrives when its top reaches the middle of the screen.
    const measure = () => {
      arrivals = SECTIONS.map((id) => {
        const el = document.getElementById(id);
        return el ? el.getBoundingClientRect().top + window.scrollY - window.innerHeight * 0.5 : Infinity;
      });
      schedule();
    };

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(document.body);
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", measure);
    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", measure);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <div
      ref={bar}
      aria-hidden
      data-year-bar
      data-shown="false"
      className="pointer-events-none fixed inset-x-0 bottom-0 z-40 px-[var(--gutter-phone)] pb-[max(0.75rem,env(safe-area-inset-bottom))] opacity-0 transition-opacity duration-500 data-[shown=true]:opacity-100 sm:px-10 sm:pb-4"
    >
      <div className="mx-auto flex max-w-[56rem] items-center gap-3">
        <span className="bg-paper px-1 font-mono text-mono leading-none text-ink">{yearBar.from}</span>
        <div className="relative h-3 flex-1">
          <span className="year-bar__tape absolute inset-0" style={{ clipPath: tornEdges("year-bar", ["left", "right"], { depth: 4, teeth: 4 }) }} />
          {TICKS.map((t) => (
            <span key={t} className="absolute inset-y-[3px] w-px bg-ink/40" style={{ left: `${t * 100}%` }} />
          ))}
          <span ref={fill} className="absolute left-0 top-1/2 h-[3px] -translate-y-1/2 bg-red" style={{ width: 0 }} />
          <span ref={dot} data-year-dot className="absolute top-1/2 flex -translate-x-1/2 -translate-y-1/2" style={{ left: 0 }}>
            <Dot />
          </span>
        </div>
        <span className="bg-paper px-1 font-mono text-mono leading-none text-ink">{yearBar.to}</span>
      </div>
    </div>
  );
}
