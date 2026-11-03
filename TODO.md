# To do

## Now
- [ ] Phase 2: Turn the script into content (docs/BUILD.md section 5)

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

## Notes for next sessions
- **docs/ and CLAUDE.md are gitignored on purpose (privacy).** Don't commit them. docs/references/ (copies of Material/Inspiration) is local only too.
- **The paper texture is a placeholder.** It's computer-made by `npm run textures` (scripts/make-paper-texture.mjs). To swap in a real scan, replace public/textures/paper.webp under the same name (about 1024px, seamless, under 150KB).
- **Next.js 16 differs from older versions.** AGENTS.md says to read node_modules/next/dist/docs/ before using unfamiliar APIs. `next dev` rewrites AGENTS.md, so commit it as is. The default next.config.ts has `cacheComponents` and `partialPrefetching` on.
- **Page metadata (title, description) is still empty.** Wire it to src/content/site.ts in Phase 2, without inventing copy.
- **Run `npx tsc` only after `npm run build` or `npm run dev`.** `LayoutProps` comes from Next's generated types.
- **Supertitle "small" size and line height aren't in design.md.** Decide them in Phase 3 from the storyboard.

## Open questions
- docs/session_summary.md (BUILD.md section 0) isn't in docs/ yet. Copy it in from the Wispr Portfolio folder when convenient.
