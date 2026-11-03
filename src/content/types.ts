// The content types (docs/BUILD.md section 4). Every word on the site lives in
// site.ts, intro.ts and scenes.ts, in these shapes.

export type Supertitle = {
  text: string;
  size?: "main" | "small";
  face?: "serif" | "heart"; // "heart" only for "Storyteller by heart."
  cornerTag?: string; // the (CORNER) tag that goes with this line
};

export type Link = {
  label: string; // exactly as the script shows it
  href: string;
  style?: "link" | "button"; // "button" for the script's BUTTON: lines
  group?: string; // the script's label for a run of links, like "REELS – ROTARACT"
  tag?: string; // a small tag next to the link
};

// alt is optional everywhere: no alt means decorative, or covered by its set's alt.
export type Media =
  | { kind: "image"; src: string; alt?: string; treatment?: "halftone" | "colour" | "as-is" }
  | { kind: "video"; src: string; poster: string; alt?: string }
  | { kind: "post"; src: string; alt?: string; views?: string }
  | { kind: "youtube"; id: string; title: string }
  | { kind: "instagram"; id: string; title: string };

// One card cluster. Its alt describes the whole set for screen readers,
// and pictures inside it without their own alt are skipped.
export type MediaSet = {
  label: string; // for builders only, never shown
  alt?: string;
  items: Media[];
};

export type StickyNote = {
  heading?: string;
  body: string[]; // can be empty: a heading over media
  media?: MediaSet[];
  links?: Link[];
};

// One timeline entry: a card cluster on one side, the supertitles and notes on the other.
export type Scene = {
  id: string;
  object: string; // the card that comes out of the head
  side: "left" | "right";
  timecode: number; // seconds into story mode
  holdFor: number; // seconds until the next timecode
  supertitles: Supertitle[];
  visual: string; // the script's action lines, kept as a note for builders
  cards: MediaSet[];
  notes: StickyNote[];
  stat?: string; // the StatCallout: a word-for-word piece of the script, like "120K+"
};

// The head (0:30) and the zoom out to the present day (1:19). Not timeline entries.
export type HeadMoment = {
  id: string;
  timecode: number;
  holdFor: number;
  supertitles: Supertitle[];
  visual: string;
  cards: MediaSet[];
};

export type IntroBeat = {
  id: string;
  timecode: number;
  holdFor: number;
  supertitles: Supertitle[];
  visual: string;
  music?: "lift";
};

// The end (1:23): the present-day cutout with the social links around it.
export type EndMoment = {
  timecode: number;
  holdFor: number; // until "Hit me up!" lands
  links: Link[];
  signoff: Supertitle;
  visual: string;
  music: "fade";
};

export type Site = {
  title: string;
  description: string;
  landing: {
    visual: string;
    story: { button: string; line: Supertitle };
    scroll: { button: string; line: Supertitle };
  };
  controls: { pause: string; replay: string };
  music: { src: string; title: string; artist: string };
  end: EndMoment;
};
