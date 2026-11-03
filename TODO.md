# To do

## Now
- [x] Phase 2: Turn the script into content. **Done 3 Nov 2026:** all copy and all the user's words for media are in src/content/; `npm run test:content` shows nothing pending. (Details below, kept for the merge rules.)
  - [x] **The user's answers are merged (3 Nov 2026):** 24 of 26 (group alts, item alts, the two embed titles, and the viral reel's tag "My most viral reel yet!", shown as a label strip on its reel). `set()` takes an optional third argument (the set's alt), `youtube()` takes a title, and item alts are `{ ...image(...), alt }`. No view counts were given, so the Bengaluru Systems posts show none. The pasted answers are in the session scratchpad (temporary).
  - [x] **Scene-level answers (user's call, 3 Nov 2026):** new optional `Scene.cardsAlt`, one description for the whole card cluster. do-bengaluru-2026 = "do.blr", indiafoss-2026 = "Made stickers and an advert for IndiaFOSS 2026". Rule: blank alt = covered by the set's alt or the scene's cardsAlt, else decorative. The present-day cutout has no alt, so "Hit me up!" is said once (user: no description like "me today in the hoodie"). Merge rule for later answers: `group:<scene>` (no set) → that scene's `cardsAlt`.
  - [x] **Last titles in (3 Nov 2026):** the club reels share "Humble Beginnings" (the set's alt); the latest video is "How My Love for Advertising Began!".
  - [x] Done. How the user's words come in (keep for later changes): via docs/media-review.html (local only). They paste back JSON with only the filled-in entries, keyed by `group:<scene>/<set>`, `alt:<web path>`, `embed:…`, `tag:…` and `views:…`. Merge them in:
    - `group:` → that MediaSet's `alt`
    - `alt:/media/<path>` → the item's `alt`
    - `embed:youtube:XSlzEhfF9PI` / `embed:instagram:Dc8rTjYTWry` → the embed's `title`
    - `tag:viral-reel` → the `tag` on instagram.com/reel/DN8dYkhCac1
    - `views:post-N` → `views` on the Bengaluru Systems posts

    **Sheet updated 3 Nov 2026:** the head's music objects and "The objects that burst out" are now one set of 10 (user's call; scenes.ts too). The cutout thumbnails show the Photoroom files. Six new embed title rows (the latest video and the five club reels).

    Blank means decorative: the cluster gets `role="group"` plus `aria-label`, and pictures without their own alt get `alt=""`. `npm run test:content` lists what's still pending (64 right now).

- [x] Phase 3: Build the design kit. **Done 3 Nov 2026** (3a and 3b; the user reviewed /kit and OK'd it). Running alongside Phase 2's wait for alt text (user's OK).
  - [x] **3b: done 3 Nov 2026.** The user reviewed /kit; asked for the arrow to be aimed at the head and the string to sag less with swaying cards (both done).
    1. [x] **Dot** (breathing via CSS, still under reduced motion; `tone="dark"` glows white), **CrayonScribble** (loop, zigzag, star, underline, burst; crayon colours only; the waxy filter is now shared as CrayonFilter, StatCallout uses it too), **DottedLine** (px coords in its positioned parent), **RedBurst** (torn-paper rays as clip-path polygons, red paper grain `.texture-red`, white torn rim), **PointerLabel** (object as children, `at`/`label` in %, dot at each tip), **NewsprintBand** (SVG textPath on waves, `aria-hidden`, constant text size via `slice`). Helpers in src/lib/rough.ts: `zigzag`, `star`, `burstStrokes`, `curve`, `sagPath`, `burstRays`, `wave`.
    2. [x] **Marker note (user's call):** the arrow is the user's own scan, `Material/point.pdf` → `npm run assets` (PDF → its JPEG → `trace` with potrace) → public/media/marks/arrow.svg, drawn as a CSS mask in `--ink`. The words are Permanent Marker (`--face-marker`, next/font/google) as a stand-in until the user scans "(yep, that kid)" handwritten; then trace it the same way and drop the font. design.md section 4 records this. New component `MarkerNote`.
    3. [x] **The stick:** `stick()` / `stickPile()` in src/motion/presets.ts: six held poses at 12fps (~500ms), starts 5% big and 22px up, top sticks, bottom slaps, flaps once, settles, then GSAP clears its props. `fadeIn()` + `prefersReducedMotion()` in reducedMotion.ts. Timelines only, so Phase 7 can seek them from the audio clock. /kit has "Replay the stick" (src/app/kit/StickReplay.tsx).
    4. [x] **Red string sample:** `RedString` (src/components/head/) ties every `[data-string-pin]` in its parent in page order, re-measured on resize: a cubic sagging about 5% of each run (user: "not too much, to some extent"), a fuzzy halo and a faint twist. Routing is Phase 4.
       - **The cards hanging from it sway (user's call, design.md section 10):** `sway()` in presets.ts swings each card ±1.1–1.7° round its pin, at its own pace (2.5–3.5s), in 12fps steps; the pin stays put, so the string never moves. GSAP folds a card's CSS `rotate` tilt into its transform, so `sway()` takes the tilt and swings round it. The pin's `translate: -50%` is resolved against its own size for the pivot. Off with reduced motion. Tests: the cards move and the pins stay within 1px; with reduced motion, no transform.
    5. [x] Reviewed /kit with the user, committed.
  - **Also done in 3b:**
    - **Scene headings (user's call, option A):** every moment has `slug`, the script's INT./EXT. line word for word (landing, 8 intro beats, head, 10 scenes, zoom out, end). BUILD.md section 4 documents it; a new test checks both ways and was proven to catch a changed heading. NewsprintBand prints slugs + action lines.
    - **Tokens (design.md first):** `--face-marker`, `--marker-size`, `--dot-size`, `--dot-breath`, `--newsprint-opacity` (0.3).
    - **MarkerLink** draws one marker line per line of text (client component, measures `getClientRects()`); a plain underline shows until it's measured.
    - **Asset pipeline:** PDF sources (reads the scan's JPEG), `trace` (→ .svg), `uncheck` (removes a baked-in checkerboard by flood-filling from the edges up to the sticker border), and an optional per-entry `quality`. **The camera is cut out** (public/media/cutouts/camera.png); Writing.jpg, idea.jpg, music.jpg should work the same way with `uncheck`. rotaract-poster.jpg is now 1200px at quality 78: 633KB, down from 1.1MB (next/image re-encodes it per screen anyway).
    - **Tests:** the stick (records every pose: at least 4 tilted ones, then flat and opaque), reduced motion (never a transform; proven to fail when the check is skipped), decorations hidden from screen readers, wrapped links underlined per line, five faces load. 18/18 Playwright, 13/13 content. Fixed an old unused-variable lint warning in content.check.mjs.
    - New devDependency: `potrace` (tracing scans).
  - **For Phase 4:**
    - **The red string on a phone:** with cards stacked, a string tied at the top of each card runs straight across the upper card's photo. Phase 4: run it behind the cards on phones, or tie it at a side?
    - **Clip sideways overflow on the page:** the stick (notes start 5% big) and the head's burst and scribbles reach past the edges on a phone. The page needs `overflow-x: clip` on its main column. The kit test waits for notes to settle before checking width.
    - **Newsprint** is printed lines only. The reference's bands look like strips of paper with the print on them. Add a paper strip behind each band if the user wants.
    - **The marker arrow is aimed (user's request):** the MarkerNote sits inside the cutout's box (absolute, px offsets), the words on clean paper above the burst, the arrow hung from the start of the words (tip about 8px in, 124px below their top) landing on the top of the head, not the face. At 390px the yellow crayon stroke just touches the "(". Phase 4 should place it the same way: anchored to the cutout.
  - [x] **Embeds (3 Nov 2026, user's go-ahead).** The script now says "EMBED + LINK" on both club REELS lines, and has a new `EMBED + LINK: youtube.com/watch?v=7C35Sxp9B3g` above the channel link in THE CAMERA. The .docx was edited directly; the backup is in the session scratchpad (C:/Users/vk360/AppData/Local/Temp/claude/804e280d29e6ffdc/ce60cbfb-2452-437a-915c-5d9f19b2a1c9/scratchpad/backup/Storyteller_by_Heart_Script.before-embeds.docx, temporary). Built:
    - **Content:** the five club reels in the clubs note's media, each with a cover, and the latest video in the camera-2017 note. `instagram` media gained `poster`.
    - **Covers:** the user's screenshots in Material/ (`Rotaract - <id>.png`, `EClub_DOQ17fzD_vg.png`, `EClub - 2nd reel.png` = DHm_NzOCoT2), cropped 6% off the bottom to drop Instagram's mute icon (new `crop` step), into public/media/reels/covers/<id>.jpg. All five are 3:5, and so is the frame.
    - **ReelEmbed:** handles Instagram (InstagramEmbed: cover, then Instagram's embed iframe on tap). A white sticker button sits under every embed: "Watch the original", or "Watch this to know more about me" for 7C35Sxp9B3g (extras.embedButton, the user's words). It's white, not red, so a row of reels doesn't break "one red shape per screen" (user OK'd the style). StickyNote leaves out links that are already an embed's button.
    - **Tests:** tapping a cover loads the player, and nothing loads before.
    - **Phase 4:** lay the five reels out beside the clubs notes as a fanned row, with each group's label ("REELS – ROTARACT") over its run. The viral reel's tag still comes from the user. Instagram's player brings its own header and footer, and Instagram decides whether a reel plays inline or opens Instagram. If that feels off, the alternative is hosting muted loops from the reel video files, like Shunya.
  - **Small things seen in the 3a review:** all handled in 3b (wrapped MarkerLink, the poster's size; ReelEmbed already handled `instagram`).
- [x] Phase 4: Scroll mode, without fancy motion. **Done 3 Nov 2026** (user's go-ahead on all 8 recommendations; deadline: site live by 22:30 IST tonight).
  - **The page** (src/app/page.tsx): HeadStage → 10 × Scene → TheEnd in one positioned column, `overflow-x: clip` on main, one `RedString layer="behind"` from the kid's head through one pin per cluster to the present-day head (12 pins). The string runs under the cards and notes and shows in the gaps; supertitles sit on their paper `strip` so it passes under the letters. Phone: cards on top, notes below, everything centred, so the string runs straight down the middle.
  - **CardCluster** (journey/): a seeded pile per scene; the first card is the lead (bigger, the only pin; WorkCard got `attach="none"`). Corner tags go on cards (Phase 3a rule). Cutouts/stickers stand alone; everything else is mounted. Videos are left out until their file and poster exist. Anthpo (no pictures) gets a pink crayon loop holding the pin. Camera gets the pointer labels, its label strip top-left.
  - **Polaroid captions (user's call, design.md section 8 first):** a mounted card with alt text gets a wide bottom edge (`--polaroid-gap`) and its alt as a Geist Mono caption (`--caption-size`), shown on hover/focus, always on touch screens. `aria-hidden` (the img alt says it already). Cards without alt have no caption. The user's alt text is final as of 3 Nov ("given wherever required").
  - **Content:** the camera and music-note cutouts are reused as their scenes' objects (decorative). Homebrew_HSP_event.jpg removed (not a Homebrew photo, user).
  - **Note media** (Scene.tsx): embeds via ReelEmbed with their link as the button; the five club reels as rows under their group labels (phone: swipe row, next reel peeking; laptop: fanned); pictures as captioned cards.
  - **TheEnd:** zoom-out supertitle, present-day cutout on newsprint (printed lines only, for now), the four socials as paper cards, "Hit me up!" with the Dot over the "!"'s dot.
  - **Media (4a):** 45 new manifest entries from BUILD.md's asset map, all built. Piano/headphones were already transparent; megaphone's white is removed by `uncheck`. The pipeline now handles `.mp4` (ffmpeg-static's binary or ffmpeg on PATH; muted H.264, faststart, poster at `posterAt`).
  - **Tests:** tests/journey.spec.ts (no errors / missing media / sideways scroll; scenes in order; every content link present and external ones `_blank noopener`; one pin per cluster; reduced motion = no sway). smoke.spec.ts now allows more textures. Playwright: 90s timeout, 2 workers (the dev server builds each image size on first request). 32/32, content 13/13, lint and `npm run build` clean. Link check: all 200, LinkedIn 999 (bot block, check by hand).
  - **Still open from Phase 4:**
    - ~~Videos~~ done (user ran the ffmpeg-static approval, 3 Nov). ~~Ad embed cover~~ done: it uses the ad's poster frame.
    - Anthpo still has no picture (orange ball / shoe / statue).
    - Captions show on hover, but cards aren't keyboard-focusable, so a sighted keyboard user won't see them (screen readers get the alt).
    - The landing (STORY / SCROLL) isn't built: the site opens straight on the head, which is scroll mode's start anyway.
  - **After the review (user, 3 Nov):** supertitle strips are drawn in a hidden layer under the words (they covered descenders); a stat that's in its supertitle (120K+) is circled in place, with no separate callout; the clubs scene's second part (Shunya reel + its 4 notes) sits under the cards on a laptop (`SECOND_PART` in Scene.tsx); later sets' photos/videos are bigger and a set's only video plays wide.
  - **Instagram reels are screenshots now (user, 3 Nov):** no play mark, no player; the "Watch the original" button is the way through. InstagramEmbed.tsx was removed. YouTube embeds still load on tap.
  - **Next:** push to GitHub (waiting for the user's OK), import the repo on Vercel, check the live link on a phone.
- [ ] Phase 5: Scroll mode, with the real motion
- [ ] Phase 6: The intro (story mode only)
- [ ] Phase 7: Story mode
- [ ] Phase 8: Media and speed
- [ ] Phase 9: Polish, check, ship

## Done
- [x] Script, storyboard, design.md and BUILD.md written
- [x] All assets in Material/
- [x] Phase 1: Set up the project (3 Nov 2026)
  - Next.js 16.4 (App Router, TypeScript, Tailwind 4, ESLint). Installed geist, gsap, lenis, lite-youtube-embed, plus Playwright and sharp for development.
  - Fonts load in src/app/layout.tsx: Geist Serif Regular + Heart (separate files from `geist/font/serif/regular` and `/heart`), Geist Sans, Geist Mono.
  - Tokens are in src/styles/tokens.css. Faces are named `--face-*` so they don't clash with Tailwind's `--font-*`. src/app/globals.css maps the tokens into Tailwind and turns off Tailwind's default colours and fonts, so only the tokens exist (`bg-paper`, `text-ink`, `font-serif`, `font-heart`, `text-supertitle`, `text-details`, ...).
  - Paper: body colour plus two pseudo-element layers (grain at 12%, tone at 5%, both multiplied). They scroll with the page and turn off for prefers-reduced-data.
  - Folder structure from BUILD.md section 3: empty components return null, modules are empty, `/kit` is empty.
  - `npm test` runs Playwright at 1440px and 390px: the paper colour, both textures loading, and all four faces loading. Screenshots go to test-results/.
- [x] Phase 2 so far (3 Nov 2026)
  - **The script.** The user approved these edits to the .docx, which were made by moving the existing paragraphs. The original is backed up at C:\Users\vk360\AppData\Local\Temp\claude\c--Users-vk360-Desktop-WritingNMore-Portfolio-thisisselva-portfolio\d16323f9-184d-41ba-b109-44ad630b0ca1\scratchpad\backup\Storyteller_by_Heart_Script.before-homebrew-move.docx (temp folder: copy it somewhere safe if it matters).
    - "Spotted in the wild." and its PHOTO line moved from THE T-SHIRT to the Homebrew scene, before "Homebrew was also behind the IndiaFOSS ad...", which now opens its own SELVA (ON SCREEN) note.
    - The duplicate "United by FOSS" PHOTO line was removed.
    - THE HOODIE was renamed to MY TIME AT HOMEBREW BY HSP. That's the scene's name only; the card object is still the hoodie.
  - **Pandoc 3.13 is installed** (winget). docs/script.md was re-exported and keeps its header comment. The text is identical to the .docx (252 paragraphs). Pandoc writes hard line breaks as `\` now.
  - **The types.** BUILD.md section 4 was updated first, then src/content/types.ts: a corner tag on each Supertitle, `MediaSet` card clusters with an optional group alt, notes that can carry media, links and buttons, and `HeadMoment`, `IntroBeat`, `EndMoment` and `Site`. Link gained `group` (for "REELS – ROTARACT").
  - **The content.** site.ts (landing, controls, music, the end), intro.ts (8 beats), and scenes.ts (head, 10 timeline scenes, zoomOut, yearBar). Rule: each picture appears once. Media named in action lines or "ON ONE SIDE" goes in `cards`; media named only in THE DETAILS goes in `notes[].media`.
  - **Title and description, from the user** (not in the script): "ThisIsSelva." (changed from "This is Selva!" on 3 Nov) / "Sidequestmaxxing my way through life :D". They're wired into layout.tsx metadata.
  - **`npm run test:content`** (tests/content.check.mjs, Node's test runner, skips when docs/ is missing) checks both ways:
    - every word in src/content/ is in the script, and every supertitle, button, detail paragraph, link and timecode in the script is in src/content/
    - the holdFor chain runs from 0:00 to 1:30, the sides alternate, and Heart is used once

    It was proven to catch a changed word, a dropped paragraph and a shifted timecode.
  - **The six new burst images** from the user (camera.jpg, Writing.jpg, idea.jpg, music.jpg, music2.jpg, megaphone.png) are in the head's "The objects that burst out" set, and in the review sheet. The user confirmed that the light bulb, megaphone and sheet-music strip belong to the head, where all the cards come together, along with the guitar, keyboard and Currents cover. The script's head PHOTOS line doesn't list them yet.

- [x] Phase 3a (3 Nov 2026)
  - **Decided, in design.md first:** Supertitle (small) is half the main size, never under 20px, line height 1.15, and set in Geist Sans when over 32 characters; main line height 1.05. New colour `--white` for sticker borders, label strips and torn rims. tokens.css gained those plus mono size, controls opacity, note/kraft grain, tape opacity, sticker and mount borders, `--lift-shadow` and `--curl-shadow`.
  - **Textures:** `npm run textures` now also makes note.webp, kraft.webp and tape.webp. paper.webp is unchanged. Torn edges are seeded clip-paths (src/lib/rough.ts), so torn-edge.svg wasn't needed.
  - **Asset pipeline (images):** assets.manifest.json + scripts/prepare-assets.mjs, with treatments `trim`, `bw-halftone`, `colour-print` and `sticker-border`. Ink and paper colours are read from tokens.css. It writes src/generated/media-sizes.json; next/image serves AVIF/WebP (next.config `images`). Only the kit's 10 samples are in the manifest so far. `npm run assets -- <text>` runs a subset.
  - **The user cut out both photos in Photoroom:** Material/BeginningPic-Photoroom.png → cutouts/childhood.png (B&W halftone) and Material/EndPicture_Photoroom.png → cutouts/present-day.png (colour print). Both look clean. The present-day export is 2000px (subject about 900px), so a full-size export would be sharper. He wears the HSP hoodie in it, which could become the Homebrew hoodie card.
  - **Content:** an optional `Scene.stat` ("120K+", "3K", "40 people"), plus a test that it's word for word in the script. src/content/extras.ts holds the made-up words (user's OK: pointer labels, label strips, reel sticker, marker note). Not checked against the script.
  - **Built:** Supertitle, CornerTag (bottom-right of a card, like a date stamp, never above a headline), LabelStrip, StickyNote, StickerButton, StatCallout, WorkCard (`data-string-pin` for the string), TapedFrame (polaroid/phone), PostCard, ReelEmbed, plus Tape, MarkerLink, MediaImage, InViewVideo (plays only on screen, never by itself with reduced motion) and YouTubeEmbed. /kit shows them with real content and 404s in production.
  - **Checks:** tests/kit.spec.ts (no errors, no missing media, no overflow past the asked-for width, full-page screenshots in test-results/). tests/tokens.check.mjs (no hard-coded colours or fonts) runs with `npm run test:content`. ESLint `react/jsx-no-literals` on src/components/. All three were proven to catch a violation.

## Notes for next sessions
- **docs/ and CLAUDE.md are gitignored on purpose (privacy).** Don't commit them. docs/references/ and docs/media-review.html are local only too.
- **The paper texture is a placeholder.** It's computer-made by `npm run textures` (scripts/make-paper-texture.mjs). To swap in a real scan, replace public/textures/paper.webp under the same name (about 1024px, seamless, under 150KB).
- **Next.js 16 differs from older versions.** AGENTS.md says to read node_modules/next/dist/docs/ before using unfamiliar APIs. `next dev` rewrites AGENTS.md, so commit it as is. The default next.config.ts has `cacheComponents` and `partialPrefetching` on.
- **Run `npx tsc` only after `npm run build` or `npm run dev`.** `LayoutProps` comes from Next's generated types. Untyped packages get a declaration in src/types/ (lite-youtube-embed has one).
- **The E-Cell poster photo is colour, not B&W** (user, 3 Nov 2026). Only the childhood cutout is B&W so far.
- **`npm run assets` clears next/image's cache** (.next/dev/cache/images), otherwise a changed file keeps showing its old version.
- **The made-up words are in src/content/extras.ts.** Show the user any new ones when they first appear.
- **pandoc isn't on Git Bash's PATH.** Use `/c/Users/vk360/AppData/Local/Pandoc/pandoc.exe`, and write to a new file before replacing script.md (a failed pandoc once emptied it).
- **Re-export the script with** `pandoc -t gfm --wrap=none docs/Storyteller_by_Heart_Script.docx`, keep line 1 (the header comment) plus a blank line, and strip the `\r` characters.

## Open questions
- docs/session_summary.md (BUILD.md section 0) isn't in docs/ yet. Copy it in from the Wispr Portfolio folder when convenient.
- **New burst images, Material/ originals:** camera.jpg, Writing.jpg, idea.jpg and music.jpg have a fake checkerboard "transparency" baked in, and megaphone.png has a white background. The `uncheck` step handles the checkerboard (camera done); megaphone.png still needs a white-background cut.
- **Scenes with no card pictures:** the music note (0:38; the guitar/piano/headphones/Currents set sits in the head) and Anthpo (0:45). Decide in Phase 4: reuse the burst objects as their cards?
- **Cards with no file in Material/:** orange ball / tiny shoe / statue (Anthpo), Σ gear, notebook doodle, HSP hoodie, code-bracket grid, clapperboard. Draw them, or source them? (The hoodie could be cropped from EndPicture_Photoroom.png. Material/Bengaluru_System_Sigma.png may be the Σ gear.)
- **FFmpeg isn't installed.** The asset pipeline needs it for the reels and vlog clips. Until then, /kit shows the phone frame with a stand-in photo.
- **Story mode:** the thumbnail scene has 3 supertitles in 5s (0:40–0:45). Check readability in Phase 7.
