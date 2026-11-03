// The few small words on the site that aren't in the script: pointer labels, label strips
// and the handwritten note (made up by Claude, with the user's OK, 3 Nov 2026), and the
// button under each embed (the user's words). Change them freely. Everything else comes
// from the script.
//
// tests/content.check.mjs doesn't check this file against the script, on purpose.

export const extras = {
  // The button under every embed, linking to the original. Keyed by video ID where it differs.
  embedButton: {
    default: "Watch here", // the user's words (3 Nov 2026), was "Watch the original"
    "7C35Sxp9B3g": "Watch this to know more about me",
  } as Record<string, string>,

  // Pointer labels: thin lines from parts of an object to a few small words (design.md section 5)
  pointerLabels: {
    "camera-2017": ["Point", "Shoot", "Upload"],
  },

  // Label strips: a few typed words on a narrow strip of paper, slightly crooked, keyed by scene.
  // None right now: the user removed both (3 Nov 2026).
  labelStrips: {} as Record<string, string>,

  // A link shown with the user's words instead of the script's, keyed by the script's label.
  // Only that one link changes (the end's "YouTube – ..." link keeps its own words).
  linkLabels: {
    "youtube.com/@thisisselva18": "Check out my channel",
  } as Record<string, string>,

  // A supertitle shown in the user's words instead of the script's, keyed by the script's line.
  lineOverrides: {
    "Oh hello, didn't see you there.": "Hello there. This is Selva!",
  } as Record<string, string>,

  // Cards whose caption always shows, not only on hover (the user's picks, 3 Nov 2026).
  shownCaptions: [
    "/media/photos/homebrew/marketing.jpg",
    "/media/photos/homebrew/poster.jpg",
    "/media/photos/homebrew/united-by-foss.jpg",
  ] as string[],

  // Note links shown instead as a button under the scene's cards, with the user's words
  // (keyed by href). The Shunya reel: the button sits under the video (3 Nov 2026).
  linkButtons: {
    "https://www.instagram.com/p/DOD8L9ykh-q": "Watch the reel here",
  } as Record<string, string>,

  // Script paragraphs the user took off the site (the script keeps them).
  hiddenParagraphs: ["But out of all of them, Shunya is the one I still think about."] as string[],

  // Extra supertitle lines under a scene's first one, in the user's words (not in the script).
  // `circle` is the bit circled in red crayon.
  extraLines: {
    "bengaluru-systems-2026": [{ text: "1.2K+ followers", circle: "1.2K+" }],
  } as Record<string, { text: string; circle?: string }[]>,

  // The one handwritten marker note (design.md section 4: "the hand")
  markerNote: {
    head: "(yep, that kid)",
  },
} as const;
