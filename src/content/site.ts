// Title, landing, controls, music and the end. Copied word for word from
// docs/script.md, except the title and description, which came from the user.

import type { Site } from "./types";

export const site: Site = {
  title: "ThisIsSelva.",
  description: "Sidequestmaxxing my way through life :D",

  landing: {
    slug: "INT. THE LANDING PAGE – BEFORE ANYTHING",
    visual:
      "Black screen. A small white dot glows in the middle, breathing slowly. There's a button on each side of it-",
    story: { button: "STORY", line: { text: "Got 90 seconds?", size: "small" } },
    scroll: { button: "SCROLL", line: { text: "Or take your time.", size: "small" } },
  },

  controls: { pause: "PAUSE", replay: "REPLAY" },

  music: { src: "/audio/weird-fishes.mp3", title: "Weird Fishes/Arpeggi", artist: "Radiohead" },

  end: {
    slug: "INT. THE END – 1:23",
    timecode: 83,
    holdFor: 7,
    links: [
      { label: "LinkedIn – linkedin.com/in/selvaganesh-arun", href: "https://www.linkedin.com/in/selvaganesh-arun" },
      { label: "Instagram – instagram.com/thisisselva18", href: "https://www.instagram.com/thisisselva18" },
      { label: "X – x.com/ThisIsSelva_18", href: "https://x.com/ThisIsSelva_18" },
      { label: "YouTube – youtube.com/@thisisselva18", href: "https://www.youtube.com/@thisisselva18" },
    ],
    signoff: { text: "Hit me up!" },
    visual: [
      "The present-day cutout stays in the middle of the screen. The social links pop up around him, like cards-",
      "A beat.",
      "The dot rolls in one last time and becomes the dot of the exclamation mark.",
      "Story mode ends here and the music fades out. The page stays put, so anyone can scroll back up through it.",
    ].join("\n"),
    music: "fade",
  },
};
