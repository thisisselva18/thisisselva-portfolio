"use client";

// /kit only: plays the stick on every sticky note inside, one after another, once when the
// page opens and again on Replay. The real triggers (scroll, the audio clock) are Phase 5 and 7.

import { useEffect, useRef, type ReactNode } from "react";
import { stickPile } from "@/motion/presets";

export function StickReplay({ children }: { children: ReactNode }) {
  const box = useRef<HTMLDivElement>(null);
  const play = () => {
    const notes = Array.from(box.current?.querySelectorAll("[data-sticky-note]") ?? []);
    if (notes.length) stickPile(notes);
  };
  useEffect(play, []);
  return (
    <div>
      <button type="button" onClick={play} className="mb-6 font-mono text-mono text-ink underline underline-offset-4" data-replay>
        Replay the stick
      </button>
      <div ref={box} data-stick-replay>
        {children}
      </div>
    </div>
  );
}
