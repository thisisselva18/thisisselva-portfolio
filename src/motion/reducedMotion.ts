// prefers-reduced-motion (design.md section 10): no jitter, no stop-motion choppiness,
// zooms become crossfades, and sticky notes fade in already stuck. Story mode still works.

import gsap from "gsap";

export function prefersReducedMotion(): boolean {
  return typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/** The calm stand-in for anything that would move: a short, plain fade in, in place. */
export function fadeIn(el: Element, seconds = 0.3): gsap.core.Timeline {
  return gsap.timeline().fromTo(el, { opacity: 0 }, { opacity: 1, duration: seconds, ease: "none", clearProps: "opacity" });
}
