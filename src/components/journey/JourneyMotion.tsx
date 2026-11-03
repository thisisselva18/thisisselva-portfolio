"use client";

// Scroll mode's motion, switched on (Phase 5): smooth scrolling, the head opening, and
// everything after it coming in as it scrolls into view (src/motion/journey.ts). Renders nothing.
// Tells the stylesheet it's running (html[data-motion="ready"]), so the inline script in the
// layout doesn't give up and show everything.

import { useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { enterOnScroll, openHead } from "@/motion/journey";
import { startSmoothScroll } from "@/motion/scroll";

export function JourneyMotion() {
  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const root = document.querySelector<HTMLElement>("main[data-journey]");
    if (!root) return;
    document.documentElement.dataset.motion = "ready";
    const stopScroll = startSmoothScroll();
    const ctx = gsap.context(() => {
      const head = root.querySelector<HTMLElement>("#head");
      if (head) openHead(head);
      enterOnScroll(root);
    }, root);
    return () => {
      ctx.revert();
      stopScroll();
      root.querySelectorAll("[data-entered]").forEach((el) => delete (el as HTMLElement).dataset.entered);
    };
  }, []);
  return null;
}
