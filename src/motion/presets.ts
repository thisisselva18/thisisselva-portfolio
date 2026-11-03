// The handmade motion (design.md section 10). Cutouts and notes move in stop-motion: held
// poses, about 12 a second, not smooth tweens. Camera moves are the one smooth thing, and
// live with the scroll code (Phase 5).
//
// Each preset returns a GSAP timeline. Scroll mode plays it when its section comes into
// view; story mode will pause it and seek it from the audio clock, so nothing here waits
// on its own timers.

import gsap from "gsap";
import { fadeIn, prefersReducedMotion } from "./reducedMotion";

/** Stop-motion frame rate. */
export const FPS = 12;

type Pose = gsap.TweenVars;

/** Holds each pose for one frame, like stop-motion: no in-betweens. */
function frames(el: Element, poses: Pose[]): gsap.core.Timeline {
  const tl = gsap.timeline();
  poses.forEach((pose, i) => tl.set(el, pose, i / FPS));
  return tl;
}

/**
 * The stick: a sticky note drops in from slightly above, a little bigger than it ends up,
 * and slaps onto the paper. The top edge sticks first, then the bottom edge flaps up once
 * and settles flat. Six frames, about 450ms. With reduced motion it fades in already stuck.
 *
 * The note's own tilt is the CSS `rotate` property, so the transforms here don't touch it.
 */
export function stick(note: Element): gsap.core.Timeline {
  if (prefersReducedMotion()) return fadeIn(note);
  // rotationX lifts the bottom edge towards the viewer while the top edge stays put.
  const base = { transformOrigin: "50% 0%", transformPerspective: 900 };
  return frames(note, [
    { ...base, opacity: 1, y: -22, scale: 1.05, rotationX: 30 }, // in the air
    { y: -8, scale: 1.025, rotationX: 24 },
    { y: 0, scale: 1, rotationX: 18 }, // the top edge sticks
    { rotationX: -2 }, // the bottom slaps down
    { rotationX: 9 }, // flaps up, once
    { rotationX: 0, clearProps: "transform,transformOrigin,transformPerspective,opacity" }, // flat, and stays stuck
  ]).add(() => {}, 6 / FPS); // hold the last pose for its frame, so it lasts 6/12s
}

/** Sticks a pile of notes one after another, so the pile builds up. */
export function stickPile(notes: Element[], gap = 0.25): gsap.core.Timeline {
  const tl = gsap.timeline();
  // Every note is hidden until its turn, so they don't all show and then jump.
  tl.set(notes, { opacity: 0 }, 0);
  notes.forEach((note, i) => tl.add(stick(note), i * gap));
  return tl;
}

/** An ease held to stop-motion frames: the curve is only sampled `frames` times. */
const held = (ease: (p: number) => number, frames: number) => (p: number) => ease(Math.round(p * frames) / frames);
const sine = (p: number) => -(Math.cos(Math.PI * p) - 1) / 2;

/**
 * A card hanging from the red string sways from its pin, like a card pegged on a line:
 * about ±1.5°, at its own pace (seeded), in 12fps steps. `pivot` is the pin's position in
 * the card, in px, so the pin stays put; `tilt` is the card's own crooked angle (its CSS
 * `rotate`, which GSAP folds into its transform), so it swings round that. Nothing with
 * reduced motion. Returns the tween,
 * so the caller can kill it.
 */
export function sway(card: Element, pivot: [number, number], tilt: number, seed: number): gsap.core.Tween | null {
  if (prefersReducedMotion()) return null;
  const r = (n: number) => ((Math.sin(seed * 12.9898 + n * 78.233) * 43758.5453) % 1 + 1) % 1;
  const swing = 2.5 + r(1) * 1; // seconds from one side to the other
  const amount = 1.1 + r(2) * 0.6; // degrees
  // fromTo, so revert() puts the card back exactly as it was.
  const tween = gsap.fromTo(card, { transformOrigin: `${pivot[0]}px ${pivot[1]}px`, rotation: tilt - amount }, {
    rotation: tilt + amount,
    duration: swing,
    ease: held(sine, Math.round(swing * FPS)),
    yoyo: true,
    repeat: -1,
  });
  return tween.seek(r(3) * swing); // each card starts at a different point in its swing
}
