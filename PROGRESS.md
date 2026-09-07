# PROGRESS — The Corporate Supplier Sustainability Portal 2026

> Claude Code: read this file at the start of every session, before touching anything. Update it at every save point. Replace content — do not append. History lives in git.

**Session:** 2 — v2.0 build complete, contrast pass applied
**Last updated:** 7 September 2026 — by Claude Code, end of session 2
**Live URL:** Confirmed after the first Netlify deploy of this branch — not yet on file here.

## Current state
v2.0 is built end-to-end in React + Vite + Tailwind and passes a full local walkthrough of every view. Landing page ports all v1.0 content with the Route 2 card amended (CTA "Complete the Questionnaire", email-return copy removed) and the EcoVadis button pointed at https://ecovadis.com. Door Selection, the Door 1 guided wizard (S1–S7, validation derived from the workbook), Door 2 (download, upload, client-side parse, Review, Rejection), and Confirmation are all implemented and wired together in `src/App.jsx`. The_Corporate_Supplier_Questionnaire_2026.xlsx is the single source of truth for both `src/data/questionnaireSchema.js` (Door 1's fields) and `src/lib/parseUpload.js` (Door 2's parser) — verified by round-tripping the real workbook through the parser with a script, and in-browser via a download → re-upload → Review → Submit → Confirmation pass.

## Last session
Session 2 (this session). Text-contrast pass across every view, on builder feedback that the hero headline was invisible and muted text was unreadable. Root cause of the black hero headline: the `.tc-*` primitives were emitted after `@tailwind utilities` in `src/index.css`, so `.tc-h1`'s `color: #000` beat the `text-chalk` utility on the same element. Moved the custom block above the utilities directive so utilities win. Second issue: Stone (#B6B09F) was used as body-text colour on Chalk, Linen, and White surfaces at roughly 2:1 contrast. Added a Graphite token (#4A453B) for muted text on light surfaces and a Slate token (#8C8674) for large decorative numerals and input borders; Stone now only carries borders, icons, and muted text on Ink backgrounds, where it reads at ~9.7:1. Verified every view in a real browser at 1200px.

### Session 1 Found and fixed a leftover bug from First Session Setup: the-corporate-brand SKILL.md had been committed as a raw zip archive instead of its extracted contents — re-extracted and committed correctly. Built the full v2.0 React app: Landing, Door Selection, Door 1 wizard, Door 2 upload/review/rejection, Confirmation. Derived the S1–S7 field schema directly from the xlsx (labels, ESRS refs, types, dropdown option lists, units). Wrote the Door 2 parser (strict on header row + section/question presence, lenient on blank cells). Verified via Playwright: full Door 1 submit flow, full Door 2 download→upload→review→submit flow, a rejection case with a non-matching file, and confirmed zero non-local network requests fire at any point in either flow. Fixed an Acid Lime overuse violation caught during build (was 7+ uses on the landing page; brand hard rule caps it at 2) before it shipped.

## Remaining work
- [ ] Confirm Netlify is linked to this GitHub repo/branch and that push-to-main triggers a live build (Netlify MCP not active this session — could not verify or deploy from here)
- [ ] Builder to provide real URLs for "View Document" (Supplier Code of Conduct) and "View Policy" (Global Environmental Policy) — currently `#`, see Known Issues
- [ ] Manual mobile-viewport pass on the deployed site (built responsive throughout; not yet checked on a live phone/deployed URL)
- [ ] Confirm live deploy: Excel downloads correctly, no 404s (Acceptance Criteria #16)

## Build decisions
- Plain Tailwind utility classes + shared `.tc-*` primitives in `src/index.css` were used instead of scaffolding shadcn/ui — shadcn's default rounded/shadowed components would need overriding on every primitive to match the brand's square-corner, no-shadow system, so hand-built primitives were more direct for this brand.
- View routing uses plain React state in `App.jsx` (no react-router) — the tool is a single small session-only flow with no shareable URLs per view (D2, no persistence), so a router added complexity without benefit.
- Landing page's "Two Routes" section is presented as two static cards rather than porting v1.0's interactive Yes/No qualifier gate — the spec's acceptance criteria only require the two route actions and copy, not the gating interaction; this is simpler to maintain and equally clear.
- All S2–S7 fields are treated as required (matching the workbook's row A4 instruction that non-bypassed suppliers complete every section); only the S1 EcoVadis scorecard link is conditionally required, tied to the bypass dropdown.
- Door 2 matching keys each expected question to its row by normalized label text within the correct section, rather than fixed row numbers — tolerates blank spacer rows while still catching a renamed/moved/missing question.
- Muted text on light surfaces is Graphite #4A453B, not Stone — Stone reads at ~2:1 on Chalk/Linen/White, which fails WCAG AA. Graphite is the same warm hue family, at ~5.9:1 on Linen and ~8.5:1 on Chalk. Stone stays the brand's border/icon colour and its muted text colour on Ink backgrounds.
- Slate #8C8674 covers the middle case: large decorative numerals (timeline 02–04, previously Linen on White and effectively invisible) and input borders, where full-strength Graphite would compete with the content.
- Custom `.tc-*` primitives sit between `@tailwind components` and `@tailwind utilities` in `src/index.css` — placing them after the utilities layer let their hardcoded colours override Tailwind text utilities, which is what hid the hero headline.
- Reference PDFs and the v1.0 static HTML moved to `docs/reference/` to keep the repo root to CLAUDE.md and PROGRESS.md per Project Structure.

## Known issues
- "View Document" / "View Policy" links are `#` — real URLs not yet provided (flagged to builder above).
- Deployed URL not yet confirmed — Netlify MCP is not active in this session; push to main should trigger autodeploy per the existing GitHub↔Netlify connection, but this session could not directly verify the link is live.
- Vite's build warns the JS bundle exceeds the 500 kB chunk-size guideline (dominated by the `xlsx` parsing library, needed for Door 2). Not a functional issue; noted for a future pass if load time becomes a concern.

## Notes for next session
None.
