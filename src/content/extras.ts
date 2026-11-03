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

  // Label strips: a few typed words on a narrow strip of paper, slightly crooked
  labelStrips: {
    "camera-2017": "VID_2017_0001.MP4",
  },

  // The one handwritten marker note (design.md section 4: "the hand")
  markerNote: {
    head: "(yep, that kid)",
  },
} as const;
