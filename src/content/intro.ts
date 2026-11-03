// The story-only opening, 0:00 to 0:30. Copied word for word from docs/script.md.

import type { IntroBeat } from "./types";

export const intro: IntroBeat[] = [
  {
    id: "spark",
    timecode: 0,
    holdFor: 4,
    supertitles: [{ text: "Marketing. Advertising.\nIt’s a neat thing, right?" }],
    visual: [
      "The music starts. Both buttons fade away, and only the glowing dot is left, right in the centre, like a spark-",
      "(The line curves around the dot, in an arc.)",
      "The line holds. The dot pulses once. Then again, a little brighter. Then-",
    ].join("\n"),
  },
  {
    id: "big-bang",
    timecode: 4,
    holdFor: 2,
    supertitles: [],
    visual: [
      "BANG. The spark bursts open and light floods everything. The Big Bang, basically.",
      "The whole screen goes white. No text here. Just let it breathe.",
      "Then we start to zoom out-",
    ].join("\n"),
  },
  {
    id: "cave",
    timecode: 6,
    holdFor: 4,
    supertitles: [{ text: "Before anyone was selling anything, we were telling stories." }],
    visual:
      "...and the white turns warm and starts to flicker. It's a fire. As we keep pulling back, the cave around it comes into view, and simple figures appear on the wall. People, animals, a hunt-",
  },
  {
    id: "town-square",
    timecode: 10,
    holdFor: 4,
    supertitles: [
      { text: "Then someone figured a good story could sell things too." },
      { text: "Usually by yelling it in a town square.", size: "small" },
    ],
    visual:
      "The ground shakes, like an earthquake. The fire's glow wobbles and turns into a ripple, spreading out across a town square full of people, with buildings on either side-",
  },
  {
    id: "printing-press",
    timecode: 14,
    holdFor: 4,
    supertitles: [{ text: "The printing press let those stories travel.", cornerTag: "1450s" }],
    visual:
      "The whole frame rotates. A single drop of ink falls into the middle of the screen. Then pages start piling up around it, page after page, each one packed with dense old blackletter text, like the first books off a Gutenberg press-",
  },
  {
    id: "radio-tv",
    timecode: 18,
    holdFor: 4,
    supertitles: [
      { text: "Then came radio and TV, and those stories started reaching millions.", cornerTag: "1922 – 1941" },
    ],
    visual:
      "The drop of ink sends out radio waves, rippling from the centre. They crackle into static on an old TV. We zoom out, and the TV starts flicking through random clips, starting in black and white and turning to colour-",
  },
  {
    id: "internet",
    timecode: 22,
    holdFor: 4,
    supertitles: [{ text: "Then came the internet. Every story, every ad, a click away.", cornerTag: "1994" }],
    visual: [
      "The TV goes black. SWOOSH. We dive straight into it and come out at a blinking cursor on a computer screen.",
      "Then we zoom out. It's one computer in a whole crowd of people at their computers, their faces lit up by the screens-",
      "The line holds, and then everything fades out. The screens, the people, all of it.",
      "FADE TO BLACK.",
    ].join("\n"),
  },
  {
    id: "year-2006",
    timecode: 26,
    holdFor: 4,
    supertitles: [{ text: "2006" }, { text: "And then came Selva (Me!)." }],
    visual: [
      "Silence on screen for a moment. Then, right in the centre-",
      "It fades out, and the next line fades in-",
      "The page starts moving down. From the bottom of the screen, a black-and-white photo of a kid rises into view. The dot rides up with it, sitting just above his head, like the dot on an i-",
    ].join("\n"),
    music: "lift",
  },
];
