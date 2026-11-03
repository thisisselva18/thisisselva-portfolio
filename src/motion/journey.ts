// Scroll mode's motion (Phase 5, design.md section 10). Everything here animates things into the
// places their layout already gives them, and never moves where they end up: transforms and
// opacity only, cleared when they land. What moves is found by data attributes:
//
//   [data-head-burst]   the red burst and yellow scribble behind the kid (slap in)
//   [data-head-object]  the objects round the head (fly out of his head, then idle jitter)
//   [data-head-note]    the marker note (slap in)
//   [data-fade]         supertitles and buttons (a plain fade: text never bounces)
//   [data-pop]          cards, cutouts, reels (pop in, 12fps)
//   [data-sticky-note]  the details (the stick)
//
// Until its turn, each is hidden by materials.css (html[data-motion] … :not([data-entered])).
// Once in, it stays in: scrolling back up shows it already in place.

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { setStringSlack, remeasureString } from "./events";
import { FPS, flyOut, jitter, pop, stick } from "./presets";
import { fadeIn, prefersReducedMotion } from "./reducedMotion";

const FRAME = 1 / FPS;
const SCROLL_IN = "[data-pop], [data-sticky-note], [data-fade]";
const SLACK = 0.14; // how loose the string's first run hangs while the head opens

/** Marks an element as in (so the stylesheet stops hiding it), holding it hidden until its animation starts. */
function arm(el: Element) {
  gsap.set(el, { opacity: 0 });
  (el as HTMLElement).dataset.entered = "";
}

/** Shows an element in place at once, with no animation (it was passed before the page opened). */
function show(el: Element) {
  (el as HTMLElement).dataset.entered = "";
}

function animate(el: Element): gsap.core.Timeline {
  if (el.matches("[data-sticky-note]")) return stick(el);
  if (el.matches("[data-pop]")) return pop(el);
  return fadeIn(el, 0.4);
}

/**
 * The head opens as soon as the page does (user: speed up the beginning, 4 Nov 2026): the burst
 * slaps in, the lines fade in right behind it, the objects fly out of his head one frame apart
 * while the string's first run is pulled taut as each lands, and the marker note slaps in
 * halfway through. All in about 1.2s. Then the objects idle-jitter while the head is on screen.
 * Returns the opening timeline.
 */
export function openHead(section: HTMLElement): gsap.core.Timeline | null {
  const burst = Array.from(section.querySelectorAll("[data-head-burst]"));
  const objects = Array.from(section.querySelectorAll("[data-head-object]"));
  const note = Array.from(section.querySelectorAll("[data-head-note]"));
  const text = Array.from(section.querySelectorAll("[data-fade]"));
  const all = [...burst, ...objects, ...note, ...text];

  // Already scrolled past (a reload halfway down): it's simply open.
  if (section.getBoundingClientRect().bottom < 0) {
    all.forEach(show);
    startJitter(section, objects);
    return null;
  }

  const reduced = prefersReducedMotion();
  const tl = gsap.timeline();
  all.forEach(arm);

  if (reduced) {
    // Everything fades in, already in place, together.
    all.forEach((el) => tl.add(fadeIn(el), 0));
    return tl;
  }

  burst.forEach((el, i) => tl.add(pop(el, 2.2), i * FRAME));

  // Each object flies from the middle of his head (behind it: the objects sit under the cutout).
  const face = section.querySelector("[data-head-cutout]")?.getBoundingClientRect();
  const start = FRAME;
  const step = FRAME;
  const slack = { v: SLACK };
  tl.call(() => setStringSlack(SLACK), [], 0);
  objects.forEach((el, i) => {
    const r = el.getBoundingClientRect();
    const from: [number, number] = face
      ? [face.left + face.width / 2 - (r.left + r.width / 2), face.top + face.height * 0.35 - (r.top + r.height / 2)]
      : [0, 0];
    tl.add(flyOut(el, from), start + i * step);
    // As it lands (its fifth frame), the string pulls a little tauter, in one held step.
    tl.to(slack, { v: SLACK * (1 - (i + 1) / objects.length), duration: FRAME, ease: "steps(1)", onUpdate: () => setStringSlack(slack.v) }, start + i * step + 4 * FRAME);
  });

  const landed = start + (objects.length - 1) * step + 5 * FRAME;
  // The words don't wait for the objects: readable within about 0.7s.
  text.forEach((el, i) => tl.add(fadeIn(el, 0.35), 2 * FRAME + i * 0.08));
  note.forEach((el) => tl.add(pop(el), 6 * FRAME));
  tl.call(() => startJitter(section, objects), [], landed + FRAME);
  return tl;
}

/** Idle jitter for the objects round the head, paused while the head is off screen. */
function startJitter(section: HTMLElement, objects: Element[]) {
  const jitters = objects.map((el, i) => jitter(el, i + 1)).filter((t): t is gsap.core.Timeline => !!t);
  if (!jitters.length) return;
  ScrollTrigger.create({
    trigger: section,
    start: "top bottom",
    end: "bottom top",
    onToggle: (self) => jitters.forEach((t) => (self.isActive ? t.resume() : t.pause())),
  });
}

/**
 * Everything after the head comes in as it scrolls into view: notes stick, cards pop, lines fade.
 * Whatever comes into view together goes in one after another (a pile builds up), in page order.
 * Anything already scrolled past when the page opens is simply there.
 */
export function enterOnScroll(root: HTMLElement) {
  const head = root.querySelector("#head");
  const items = Array.from(root.querySelectorAll<HTMLElement>(SCROLL_IN)).filter((el) => !head?.contains(el));
  const waiting: HTMLElement[] = [];
  for (const el of items) {
    if (el.getBoundingClientRect().bottom < 0) show(el);
    else waiting.push(el);
  }
  // A pile: two frames between cards, a little longer between notes, and never a long wait.
  const gap = (el: Element) => (el.matches("[data-sticky-note]") ? 0.25 : 2 * FRAME);
  ScrollTrigger.batch(waiting, {
    start: "top 88%",
    once: true,
    interval: 0.1,
    onEnter: (batch) => {
      const tl = gsap.timeline({ onComplete: remeasureString });
      let at = 0;
      // In page order, whichever order they crossed the line in.
      [...batch].sort((a, b) => (a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1)).forEach((el) => {
        arm(el);
        tl.add(animate(el), Math.min(at, 1.2));
        at += gap(el);
      });
    },
  });
}
