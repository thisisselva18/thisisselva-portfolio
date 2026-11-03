// Smooth scrolling (Phase 5): Lenis drives the page, and GSAP's ticker drives Lenis, so
// ScrollTrigger and Lenis agree on every frame. Lenis smooths the wheel and trackpad only:
// phones keep their own touch scrolling (Lenis's default). It still runs on phones, so story
// mode (Phase 7) can scroll the page with it. Off with reduced motion: the browser's own scroll.

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
import { prefersReducedMotion } from "./reducedMotion";

let lenis: Lenis | null = null;

/** The running Lenis, for story mode's auto-scroll later. Null with reduced motion. */
export function getLenis() {
  return lenis;
}

/** Starts smooth scrolling; returns the function that stops it. */
export function startSmoothScroll(): () => void {
  gsap.registerPlugin(ScrollTrigger);
  if (prefersReducedMotion()) return () => {};
  const instance = new Lenis({ autoRaf: false });
  lenis = instance;
  instance.on("scroll", ScrollTrigger.update);
  const raf = (time: number) => instance.raf(time * 1000);
  gsap.ticker.add(raf);
  gsap.ticker.lagSmoothing(0);
  return () => {
    gsap.ticker.remove(raf);
    instance.destroy();
    if (lenis === instance) lenis = null;
  };
}
