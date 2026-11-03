// The Head Journey, 0:30 to 1:23. Copied word for word from docs/script.md.
//
// Each picture appears once, except the camera and music-note cutouts, which are also
// their scenes' objects. Media named in the action lines or under "ON ONE SIDE"
// is the scene's card cluster (cards). Media named only inside THE DETAILS goes
// in the sticky note it follows (notes[].media).
//
// Alt text and embed titles come from the user (docs/media-review.html). Until
// they're filled in, alt is left out and embed titles are empty.

import type { HeadMoment, MediaSet, Scene } from "./types";

const image = (src: string, treatment?: "halftone" | "colour" | "as-is") =>
  ({ kind: "image", src: `/media/${src}`, treatment }) as const;
const video = (src: string) => ({ kind: "video", src: `/media/${src}.mp4`, poster: `/media/${src}.jpg` }) as const;
const post = (src: string) => ({ kind: "post", src: `/media/${src}` }) as const;
// alt describes the whole set (the user's words, from docs/media-review.html).
const set = (label: string, items: MediaSet["items"], alt?: string): MediaSet => ({ label, items, ...(alt ? { alt } : {}) });
const youtube = (id: string, title = "") => ({ kind: "youtube", id, title }) as const;
// A reel shown by its cover (from the user's screenshot) until it's tapped. Reels in a set
// share the set's alt as their one title (the user's call), so they have no title of their own.
const reel = (id: string) => ({ kind: "instagram", id, title: "", poster: `/media/reels/covers/${id}.jpg` }) as const;

export const yearBar = { from: "2017", to: "2026" };

export const head: HeadMoment = {
  id: "head",
  slug: "INT. SELVA'S HEAD – 0:30",
  timecode: 30,
  holdFor: 6,
  supertitles: [
    { text: "Oh hello, didn't see you there." },
    { text: "One life, tons of stories to tell." },
    { text: "Storyteller by heart.", face: "heart" },
  ],
  visual: [
    "The kid settles in the middle of the screen. (PHOTO: Childhood cutout, B&W)",
    "(Scroll mode starts here. No intro. The photo is just on screen when the page opens.)",
    "His head opens up, and all the work comes spilling out as cards. A camera. A music note, with a guitar, a piano, a pair of headphones and the cover of the “Currents” album tumbling out right behind it. A video thumbnail. A script. An orange ball. A pile of posters. A Σ gear. A notebook. A T-shirt. A hoodie. A stack of stickers.",
    "Lots of cards. They fan out around his head, and a single red string runs from one to the next, joining them all up.",
    "A thin year bar fades in at the bottom of the screen, 2017 to 2026. The dot sits on it, right at the start. It moves along with every card from here on.",
    "The camera follows the red string and zooms into the first card, and into the timeline-",
  ].join("\n"),
  cards: [
    set("The childhood cutout", [image("cutouts/childhood.png", "halftone")]),
    // One set, in the script's order: the camera, the music note with its guitar, piano,
    // headphones and Currents cover, then the rest (the user put them together, 3 Nov 2026).
    set("The objects that burst out", [
      image("cutouts/camera.png", "as-is"),
      image("cutouts/music-note.png", "as-is"),
      image("cutouts/guitar.png"),
      image("cutouts/piano.png"),
      image("cutouts/headphones.png"),
      image("music/currents-cover.jpg", "as-is"),
      image("cutouts/writing.png", "as-is"),
      image("cutouts/idea.png", "as-is"),
      image("cutouts/megaphone.png", "as-is"),
      image("cutouts/music-staff.png", "as-is"),
    ]),
  ],
};

export const timeline: Scene[] = [
  {
    id: "camera-2017",
    object: "camera",
    side: "left",
    slug: "INT. SELVA'S HEAD – THE CAMERA – 0:36",
    timecode: 36,
    holdFor: 2,
    supertitles: [{ text: "2017. A kid with a camera." }],
    visual:
      "Two short clips from my old vlogs play inside the lens, on mute. A kid, a camera, and absolutely no plan. (VIDEO: ThisIsSelva_Vid1.mp4, ThisIsSelva_Vid2.mp4)",
    // The camera cutout is reused from the head's burst as this scene's object (decorative, user's OK 3 Nov 2026).
    cards: [
      set("The camera", [image("cutouts/camera.png", "as-is")]),
      set("The vlog clips", [video("youtube/vlog-clip-1"), video("youtube/vlog-clip-2")], "Started out young!"),
    ],
    notes: [
      {
        body: ["Started a YouTube channel as a kid. Vlogs, random moments, whatever I felt like filming that day."],
        media: [set("The latest video", [youtube("7C35Sxp9B3g", "How My Love for Advertising Began!")])],
        links: [
          { label: "youtube.com/watch?v=7C35Sxp9B3g", href: "https://www.youtube.com/watch?v=7C35Sxp9B3g" },
          { label: "youtube.com/@thisisselva18", href: "https://www.youtube.com/@thisisselva18" },
        ],
      },
    ],
  },
  {
    id: "music-2020",
    object: "music-note",
    side: "right",
    slug: "INT. SELVA'S HEAD – THE MUSIC NOTE – 0:38",
    timecode: 38,
    holdFor: 2,
    supertitles: [{ text: "2020." }, { text: "SG Records and Productions", size: "small" }],
    visual: "A quick pass. The note pulses, once.",
    // The music-note cutout is reused from the head's burst as this scene's object (decorative, user's OK 3 Nov 2026).
    cards: [set("The music note", [image("cutouts/music-note.png", "as-is")])],
    notes: [
      {
        body: [
          "In 2020, I started SG Records and Productions and made music till 2022. Took a break, then got back into it in 2024.",
        ],
        media: [set("The SoundCloud profile", [{ ...image("music/soundcloud-profile.png"), alt: "Check out my SoundCloud" }])],
        links: [{ label: "LISTEN ON SOUNDCLOUD", href: "https://soundcloud.com/thisisselva18", style: "button" }],
      },
    ],
  },
  {
    id: "youtube-2024",
    object: "video-thumbnail",
    side: "left",
    slug: "INT. SELVA'S HEAD – THE VIDEO THUMBNAIL – 0:40",
    timecode: 40,
    holdFor: 5,
    supertitles: [
      { text: "4 years later. I was back on YouTube.", cornerTag: "2024" },
      { text: "The plan? Filmmaking. Screenwriting." },
      { text: "And then... engineering happened.", cornerTag: "September 2024" },
    ],
    visual: [
      "We glide into the thumbnail of my comeback video. Then more thumbnails slide in behind it, one after another: Chapter 2, Year One, Year Two. He kept going. (THUMBNAILS: Four_Years_Later_1, then Four_Years_Later_2, Year_One_YouTube, Year_Two_YouTube)",
      "Script pages start fluttering in around it. Scene headings, dialogue, a clapperboard snapping shut- (PAGES: Past Life, HB x FOSS Reel, Infy Reel #2)",
      "Before we can settle in, a grid of code brackets slams across the screen and buries the pages. The music thins out to almost nothing-",
      "A beat. Just long enough to feel it.",
    ].join("\n"),
    cards: [
      set("The YouTube thumbnails", [
        image("youtube/four-years-ch1.png"),
        image("youtube/four-years-ch2.png"),
        image("youtube/year-one.png"),
        image("youtube/year-two.png"),
      ], "Back to YouTube"),
      set("The script pages", [
        image("scripts/script-1.png"),
        image("scripts/script-2.png"),
        image("scripts/script-3.png"),
        image("scripts/script-4.png"),
      ], "Screenwriting ftw!"),
    ],
    notes: [
      {
        body: [
          "After four years of nothing, I came back to YouTube in 2024. This time, I actually cared about how the story was told, and not just what was in it.",
          "And I didn't stop there. Chapter 2 came next, then Year One and Year Two.",
          "Around then, I was sure I'd end up in films. I wanted to get into filmmaking and screenwriting, and I'd already written a few scripts and short films back in school.",
          "And then engineering happened. In September 2024, I started Computer Science at PES University.",
          "Honestly? Not how I saw it going. But it turns out tech has plenty of stories too, and somebody has to tell them right.",
        ],
        media: [set("The comeback video", [youtube("XSlzEhfF9PI", "First video after four years!")])],
        links: [{ label: "youtube.com/watch?v=XSlzEhfF9PI", href: "https://www.youtube.com/watch?v=XSlzEhfF9PI" }],
      },
    ],
  },
  {
    id: "anthpo",
    object: "orange-ball",
    side: "right",
    slug: "INT. SELVA'S HEAD – THE ORANGE BALL – 0:45",
    timecode: 45,
    holdFor: 3,
    supertitles: [{ text: "Then I found Anthpo, and marketing got weird." }],
    visual:
      "The brackets crack. An orange ball rolls through the gap, and a tiny shoe drops onto the outline of a statue-",
    cards: [],
    notes: [
      {
        body: [
          "In 2024, a guy in an orange ski mask and a cape put up posters across New York, saying he'd eat a whole jar of cheese balls in Union Square. Then he actually showed up and did it, in front of a huge crowd. That was Cheeseball Man.",
          "A year later, tiny 3D-printed Crocs started showing up on statues in Central Park. An anonymous account called Kid with Crocs kept dropping clues, people went hunting for them, and it turned out to be a Crocs campaign the whole time.",
          "Both of them were Anthpo. That's when it clicked for me. The best marketing is a story people want to be a part of.",
        ],
        links: [
          { label: "Cheeseball Man – youtu.be/hHeV486B5iI", href: "https://youtu.be/hHeV486B5iI" },
          { label: "Kid with Crocs – youtu.be/j1AReFV9ckY", href: "https://youtu.be/j1AReFV9ckY" },
        ],
      },
    ],
  },
  {
    id: "clubs-2025",
    object: "poster-pile",
    side: "left",
    slug: "INT. SELVA'S HEAD – THE POSTER PILE – 0:48",
    timecode: 48,
    holdFor: 6,
    supertitles: [
      { text: "Then came the clubs. Posters, promos, campaigns.", cornerTag: "August 2025" },
      { text: "But one of them started from zero." },
    ],
    visual: [
      "A pile of photos flicking past, one on top of the other. Selva holding up posters and marketing material, packed rooms at club events- (PHOTOS: Me with marketing material, club events)",
      'The last one in the pile is just a zero. The camera dives into it, and the Shunya reel plays on mute, from "It all starts with ZERO." (VIDEO: Shunya_Reveal.mp4)',
      "The reel lands on ZERO, and the zero shrinks back into the dot. (Yep, it was the dot all along.)",
    ].join("\n"),
    cards: [
      set("The club photos", [
        image("photos/clubs/ecell-poster.jpg"),
        image("photos/clubs/rotaract-poster.jpg"),
        image("photos/clubs/rotaract-event.jpg"),
        image("photos/clubs/acm-badge.jpg"),
        image("photos/clubs/acm-hacknight.jpg"),
        // Moved here from do.bengaluru by the user (3 Nov 2026), to fill the clubs pile.
        image("photos/do-blr/filming.jpg"),
      ], "Origins of my love for campaigning..."),
      set("The Shunya reel", [video("reels/shunya-reveal")]),
    ],
    notes: [
      {
        heading: "The clubs",
        body: [
          "Around August 2025 is when I started taking marketing seriously. I got involved with a bunch of clubs in college, making promo content for their events, coming up with campaigns, and sticking posters all over campus.",
          "I was the Vice President at Rotaract, where I helped our socials team pull in 90K+ views. I made promo content for the Entrepreneurship Club, and led a design team of 15 for an 18-hour ACM hackathon.",
          "But out of all of them, Shunya is the one I still think about.",
        ],
        media: [
          set("The club reels", [
            reel("DN5-OuRiWIJ"),
            reel("DNvPryR0kqc"),
            reel("DN8dYkhCac1"),
            reel("DOQ17fzD_vg"),
            reel("DHm_NzOCoT2"),
          ], "Humble Beginnings"),
        ],
        links: [
          { group: "REELS – ROTARACT", label: "instagram.com/reel/DN5-OuRiWIJ", href: "https://www.instagram.com/reel/DN5-OuRiWIJ" },
          { group: "REELS – ROTARACT", label: "instagram.com/reel/DNvPryR0kqc", href: "https://www.instagram.com/reel/DNvPryR0kqc" },
          // The script gives this one a small tag. Its wording is the user's.
          { group: "REELS – ROTARACT", label: "instagram.com/reel/DN8dYkhCac1", href: "https://www.instagram.com/reel/DN8dYkhCac1", tag: "My most viral reel yet!" },
          { group: "REELS – ENTREPRENEURSHIP CLUB", label: "instagram.com/p/DOQ17fzD_vg", href: "https://www.instagram.com/p/DOQ17fzD_vg" },
          { group: "REELS – ENTREPRENEURSHIP CLUB", label: "instagram.com/reel/DHm_NzOCoT2", href: "https://www.instagram.com/reel/DHm_NzOCoT2" },
        ],
      },
      {
        heading: "Shunya",
        body: [
          "Shunya, our maths club, had been dead for a year. Recruitments were opening in four days, and we had to start from zero.",
          "So we did. Literally.",
        ],
      },
      {
        heading: "Day 4 to Day 1",
        body: [
          "Every day, we put up a story. A black background, a number on top, and a maths symbol under it. 4. Then 3. Then 2. Then 1. No caption, no logo, no explanation.",
          "I got over 20 clubs from both our campuses, Electronic City and Outer Ring Road, to repost it. Nobody knew what was coming, and that's exactly what kept them watching.",
        ],
      },
      {
        heading: "Day 0",
        body: [
          "On the last day, we stuck QR codes all over campus, all leading to our Instagram page. At around 6 PM, the reel dropped.",
        ],
      },
      {
        heading: "What happened",
        body: [
          "100+ followers in under a week. 5K+ accounts reached.",
          "And the best part? Shunya means zero. The whole campaign was a countdown to the club's own name.",
        ],
        links: [{ label: "instagram.com/p/DOD8L9ykh-q", href: "https://www.instagram.com/p/DOD8L9ykh-q" }],
      },
    ],
  },
  {
    id: "bengaluru-systems-2026",
    stat: "120K+",
    object: "sigma-gear",
    side: "right",
    slug: "INT. SELVA'S HEAD – THE Σ GEAR – 0:54",
    timecode: 54,
    holdFor: 5,
    supertitles: [
      { text: "Ten months of socials for Bengaluru Systems. 120K+ impressions.", cornerTag: "January 2026" },
    ],
    visual:
      "A few of our posts slide in, one after the other, their view counts ticking up. Meetup photos flash behind them. (SCREENSHOTS: BlrSys_Post1, BlrSys_Post2, BlrSys_Post3)",
    cards: [
      set("The posts", [
        post("posts/bengaluru-systems/post-1.png"),
        post("posts/bengaluru-systems/post-2.png"),
        post("posts/bengaluru-systems/post-3.png"),
      ], "Posting posting..."),
      set("The meetup photos", [
        image("photos/bengaluru-systems/meetup-1.jpg"),
        image("photos/bengaluru-systems/meetup-2.jpg"),
        image("photos/bengaluru-systems/meetup-3.jpg"),
      ], "Snaps from the meetups"),
    ],
    notes: [
      {
        body: [
          "In January 2026, I joined Bengaluru Systems as a volunteer to run their social media and outreach. It's a community of people who love systems engineering, which meant a lot of very technical stuff that had to sound like something you'd actually want to show up for.",
          "From January to October, that came to 120K+ impressions and 1.2K+ followers across X and LinkedIn.",
        ],
      },
      {
        heading: "The meetups",
        body: ["I also took ownership of two of our meetups, in July and October, and hosted them."],
      },
    ],
  },
  {
    id: "do-bengaluru-2026",
    stat: "3K",
    cardsAlt: "do.blr",
    object: "notebook",
    side: "left",
    slug: "INT. SELVA'S HEAD – THE NOTEBOOK – 0:59",
    timecode: 59,
    holdFor: 4,
    supertitles: [{ text: "Got bored in class. Started do.bengaluru.", cornerTag: "March 2026" }],
    visual:
      "A doodle in the margin of a class notebook. It turns into a grid of builders from all over Bengaluru, with a photo of Selva filming on his phone tucked in among them- (FEATURE POSTS: do blr 1 to do blr 5) (PHOTO: March_2026_Pic)",
    cards: [
      set("The do.bengaluru posts", [
        post("posts/do-blr/do-blr-1.png"),
        post("posts/do-blr/do-blr-2.png"),
        post("posts/do-blr/do-blr-3.png"),
        post("posts/do-blr/do-blr-4.png"),
        post("posts/do-blr/do-blr-5.png"),
      ], "A step outside my comfort zone"),
    ],
    notes: [
      {
        body: [
          "In March 2026, I was sitting in class, bored out of my mind, and I started an Instagram page. That's it. That's the origin story.",
          "do.bengaluru features builders and entrepreneurs from all over Bengaluru. People who've started something and want the world to know about it. We ran a series called P!TCH PLEASE, and at one point the page was reaching around 3K accounts.",
          "Doing it all on my own taught me a lot about making content and designing posters.",
        ],
      },
      {
        heading: "Where we amplify voices, one step at a time.",
        body: [],
        links: [{ label: "instagram.com/do.bengaluru", href: "https://www.instagram.com/do.bengaluru" }],
      },
    ],
  },
  {
    id: "xeneva-2026",
    object: "t-shirt",
    side: "right",
    slug: "INT. SELVA'S HEAD – THE T-SHIRT – 1:03",
    timecode: 63,
    holdFor: 4,
    supertitles: [{ text: "Gave a deep-tech startup a voice. (And a T-shirt.)", cornerTag: "July 2026" }],
    visual:
      'The T-shirt spins. "the future is spatial." on the front, Xeneva in four Indian scripts on the back. A few Xeneva stickers slap down around it. Then a quick cut to the whole team wearing it at IndiaFOSS- (DESIGNS: FINAL T-SHIRT 2, Sticker1 to Sticker4)',
    cards: [
      set("The designs: T-shirt and stickers", [
        { ...image("xeneva/tshirt.png", "as-is"), alt: "The T-shirt" },
        image("xeneva/sticker-1.png", "as-is"),
        image("xeneva/sticker-2.png", "as-is"),
        image("xeneva/sticker-3.png", "as-is"),
        image("xeneva/sticker-4.png", "as-is"),
      ], "Merchandise, by yours truly!"),
      set("The team at IndiaFOSS", [
        image("photos/xeneva/team.jpg"),
        image("photos/xeneva/booth-1.jpg"),
        image("photos/xeneva/booth-2.jpg"),
      ], "Xeneva at IndiaFOSS '26"),
    ],
    notes: [
      {
        body: [
          "In July 2026, I joined Xeneva as their Creative Lead. They're a deep-tech startup building an operating system for XR.",
          "My job was to figure out what Xeneva stands for, how it should talk, and how it should show up online. Basically, a brand voice and a promotional cadence, which took about two months to get right.",
          'I also designed their T-shirt. "the future is spatial." on the front, and Xeneva in Malayalam, Hindi, Bengali and Kannada on the back.',
          "For IndiaFOSS 2026, I made their stickers too. We wore the T-shirts there, and I handled their marketing at the event.",
        ],
      },
    ],
  },
  {
    id: "homebrew-2026",
    stat: "40 people",
    object: "hoodie",
    side: "left",
    slug: "INT. SELVA'S HEAD – MY TIME AT HOMEBREW BY HSP – 1:07",
    timecode: 67,
    holdFor: 3,
    supertitles: [{ text: "Ran socials and marketing for Homebrew.", cornerTag: "August 2026" }],
    visual: "An HSP hoodie. Behind it, a room full of people on Church Street. (PHOTO: Homebrew events, Church Street)",
    cards: [
      set("The Homebrew events", [
        { ...image("photos/homebrew/church-street-1.jpg"), alt: "FOSS Talks 3.0" },
        { ...image("photos/homebrew/church-street-2.jpg"), alt: "FOSS Talks 4.0" },
        image("photos/homebrew/stall.jpg"),
        { ...image("photos/homebrew/marketing.jpg"), alt: "Whacky marketing be like ;p" },
      ], "Leading Social Media & Marketing for HSP"),
    ],
    notes: [
      {
        body: [
          "Homebrew by HSP is our student developer community, mostly into free and open source software. Since August 2026, I've been leading its social media and marketing.",
          "We've hosted two events on Church Street so far, with around 40 people at each. Both were a huge success.",
        ],
      },
      {
        heading: "Spotted in the wild.",
        body: [],
        media: [
          set("Spotted in the wild", [{ ...image("photos/homebrew/poster.jpg"), alt: "Homebrew @ IndiaFOSS '26" }, { ...image("photos/homebrew/united-by-foss.jpg"), alt: "Homebrew" }], "Our feature at IndiaFOSS!"),
        ],
      },
      {
        body: ["Homebrew was also behind the IndiaFOSS ad. Which brings us to..."],
      },
    ],
  },
  {
    id: "indiafoss-2026",
    cardsAlt: "Made stickers and an advert for IndiaFOSS 2026",
    object: "sticker-stack",
    side: "right",
    slug: "INT. SELVA'S HEAD – THE STICKER STACK – 1:10",
    timecode: 70,
    holdFor: 9,
    supertitles: [{ text: "And the one I'm proudest of so far.", cornerTag: "September 2026" }],
    visual: [
      "Stickers flick past, fast. PROTECT THE LITTLE GUY. I CAME. I SAW. I MERGED. just fork it.",
      'The screen opens up wide and the IndiaFOSS ad plays on mute, a little longer than everything else. The definition of "Sharing". An old engraving. Ships, caravans, crowds. Then the classroom, everyone in HSP hoodies- (VIDEO: HBxIndiaFOSS.mp4)',
      "It holds on the last frame. SEE YOU @ INDIA FOSS 2026.",
    ].join("\n"),
    cards: [
      set("The IndiaFOSS stickers", [
        image("stickers/devroom-security.png", "as-is"),
        image("stickers/indiafoss-wild.png", "as-is"),
        image("stickers/indiafoss.png", "as-is"),
        image("stickers/julius.png", "as-is"),
        image("stickers/fork-it.png", "as-is"),
      ], "Made these cool stickers for IndiaFOSS '26"),
      set("The ad", [{ ...video("reels/hb-x-indiafoss"), alt: "My best advert yet..." }]),
    ],
    notes: [
      {
        body: [
          "I joined the IndiaFOSS 2026 volunteers in July. IndiaFOSS is one of the biggest gatherings for India's free and open source communities, and I ended up doing three things there.",
        ],
      },
      {
        heading: "The ad",
        body: ["This is the one I'm proudest of so far. A Homebrew x FOSS United reel, revealed in September 2026."],
        // Its cover is a frame of the ad itself (the same reel, compressed for the cards).
        media: [set("The ad embed", [{ kind: "instagram", id: "Dc8rTjYTWry", title: "Written, edited, directed and voiced by yours truly...", poster: "/media/reels/hb-x-indiafoss.jpg" }])],
        links: [{ label: "instagram.com/reel/Dc8rTjYTWry", href: "https://www.instagram.com/reel/Dc8rTjYTWry" }],
      },
      {
        heading: "The stickers",
        body: ["For the design team, I made stickers and promo material."],
      },
      {
        heading: "Live from Day 1",
        body: ["On Day 1 of the event, I handled live posting on X and Instagram."],
      },
    ],
  },
];

export const zoomOut: HeadMoment = {
  id: "zoom-out",
  slug: "INT. SELVA'S HEAD – 1:19",
  timecode: 79,
  holdFor: 4,
  supertitles: [{ text: "So much more to come, so many more to write!" }],
  visual: [
    "The camera pulls all the way back out of the timeline. Every card is floating around the head again, still joined by the red string. The year bar is full, and the dot sits at the very end of it.",
    "Except it isn't the kid's head anymore. As we keep zooming out, it's Selva now, present day, in a new cutout. Same head. A lot more smiley. (PHOTO: Present day, HSP hoodie)",
    "The cards drift back in, one by one, pulling the red string in with them. The head closes.",
  ].join("\n"),
  cards: [set("The present-day cutout", [image("cutouts/present-day.png")])],
};
