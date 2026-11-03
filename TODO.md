# To do

## Now
- [ ] Phase 2: Turn the script into content. Nearly done: all copy is in src/content/. Only the user's words for media are left.
  - [ ] Waiting on the user: alt text, embed titles, the viral-reel tag and the post view counts, via docs/media-review.html (local only). They paste back JSON with only the filled-in entries, keyed by `group:<scene>/<set>`, `alt:<web path>`, `embed:…`, `tag:…` and `views:…`. Merge them in:
    - `group:` → that MediaSet's `alt`
    - `alt:/media/<path>` → the item's `alt`
    - `embed:youtube:XSlzEhfF9PI` / `embed:instagram:Dc8rTjYTWry` → the embed's `title`
    - `tag:viral-reel` → the `tag` on instagram.com/reel/DN8dYkhCac1
    - `views:post-N` → `views` on the Bengaluru Systems posts

    Blank means decorative: the cluster gets `role="group"` plus `aria-label`, and pictures without their own alt get `alt=""`. `npm run test:content` lists what's still pending (64 right now).
  - [ ] Then commit and mark Phase 2 done.

## Next
- [ ] Phase 3: Build the design kit
- [ ] Phase 4: Scroll mode, without fancy motion
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
  - **Title and description, from the user** (not in the script): "This is Selva!" / "Sidequestmaxxing my way through life :D". They're wired into layout.tsx metadata.
  - **`npm run test:content`** (tests/content.check.mjs, Node's test runner, skips when docs/ is missing) checks both ways:
    - every word in src/content/ is in the script, and every supertitle, button, detail paragraph, link and timecode in the script is in src/content/
    - the holdFor chain runs from 0:00 to 1:30, the sides alternate, and Heart is used once

    It was proven to catch a changed word, a dropped paragraph and a shifted timecode.
  - **The six new burst images** from the user (camera.jpg, Writing.jpg, idea.jpg, music.jpg, music2.jpg, megaphone.png) are in the head's "The objects that burst out" set, and in the review sheet.

## Notes for next sessions
- **docs/ and CLAUDE.md are gitignored on purpose (privacy).** Don't commit them. docs/references/ and docs/media-review.html are local only too.
- **The paper texture is a placeholder.** It's computer-made by `npm run textures` (scripts/make-paper-texture.mjs). To swap in a real scan, replace public/textures/paper.webp under the same name (about 1024px, seamless, under 150KB).
- **Next.js 16 differs from older versions.** AGENTS.md says to read node_modules/next/dist/docs/ before using unfamiliar APIs. `next dev` rewrites AGENTS.md, so commit it as is. The default next.config.ts has `cacheComponents` and `partialPrefetching` on.
- **Run `npx tsc` only after `npm run build` or `npm run dev`.** `LayoutProps` comes from Next's generated types.
- **Supertitle "small" size and line height aren't in design.md.** Decide them in Phase 3 from the storyboard.
- **Re-export the script with** `pandoc -t gfm --wrap=none docs/Storyteller_by_Heart_Script.docx`, keep line 1 (the header comment) plus a blank line, and strip the `\r` characters.

## Open questions
- docs/session_summary.md (BUILD.md section 0) isn't in docs/ yet. Copy it in from the Wispr Portfolio folder when convenient.
- **New burst images, Material/ originals:** camera.jpg, Writing.jpg, idea.jpg and music.jpg have a fake checkerboard "transparency" baked in, and megaphone.png has a white background. The asset pipeline has to cut them out.
- **New burst images, the script:** it doesn't name idea, megaphone or music-staff. Which scene's cards are they, if any? Add a PHOTOS line to the .docx.
- **Scenes with no card pictures:** the music note (0:38; the guitar/piano/headphones/Currents set sits in the head) and Anthpo (0:45). Decide in Phase 4: reuse the burst objects as their cards?
- **Cards with no file in Material/:** orange ball / tiny shoe / statue (Anthpo), Σ gear, notebook doodle, HSP hoodie, code-bracket grid, clapperboard. Draw them in Phase 3, or source them?
- **FFmpeg isn't installed.** The asset pipeline needs it for the reels and vlog clips.
- **Story mode:** the thumbnail scene has 3 supertitles in 5s (0:40–0:45). Check readability in Phase 7.
