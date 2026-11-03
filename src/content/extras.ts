// The few small words on the site that aren't in the script. Claude made these up,
// with the user's OK (3 Nov 2026): pointer labels, label strips, the reel sticker and
// the handwritten note. Change them freely. Everything else comes from the script.
//
// tests/content.check.mjs doesn't check this file against the script, on purpose.

export const extras = {
  // The "watch the original" sticker on every reel frame (design.md section 8)
  reelSticker: "watch the original",

  // Pointer labels: thin lines from parts of an object to a few small words (design.md section 5)
  pointerLabels: {
    "camera-2017": ["Point", "Shoot", "Upload"],
  },

  // Label strips: a few typed words on a narrow strip of paper, slightly crooked
  labelStrips: {
    "camera-2017": "VID_2017_0001.MP4",
    "youtube-2024": "draft_v3_final_FINAL.fdx",
  },

  // The one handwritten marker note (design.md section 4: "the hand")
  markerNote: {
    head: "(yep, that kid)",
  },
} as const;
