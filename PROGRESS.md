# PROGRESS — The Corporate Supplier Sustainability Portal 2026

> Claude Code: read this file at the start of every session, before touching anything. Update it at every save point. Replace content — do not append. History lives in git.

**Session:** 3 — live submissions confirmed
**Last updated:** 30 September 2026 — by Claude Code, end of session 3
**Live URL:** Not yet confirmed for v3.0. Netlify autodeploys from main; the deploy will not work until the two Supabase environment variables are set (see Remaining work).

## Current state
v3.0 is built end-to-end and passes a full local walkthrough in a real browser: 46 checks covering both routes, both doors, all four status rules, consent gating, the duplicate warning, Door 2 rejection, and a 375px mobile pass.

Both routes now open with a company/contact capture step. The EcoVadis route (`src/components/EcoVadisCapture.jsx`) takes the six identity fields plus a URL-validated scorecard link and consent, writes the row, and opens ecovadis.com in a new tab while the portal tab stays open. The Questionnaire route (`src/components/QuestionnaireCapture.jsx`) holds identity in session state through Door Selection and both doors into a shared Review screen (`src/components/ReviewSubmit.jsx`), where the consent checkbox sits and final submit writes the row. Door 1 and Door 2 now share that screen; `Door2Review.jsx` was replaced by it.

The database is live: project **The corporate live build (New)** (eu-central-1; ref and URL are deliberately not recorded in this public repo — they live in the Supabase dashboard and the Netlify environment variables). `submissions` has RLS enabled and forced with zero policies, and grants revoked from `anon`/`authenticated` — the browser has no path to it at all. Everything goes through `netlify/functions/submissions.js` with the service role key. The duplicate check, the status computation, the update of superseded rows, and the insert all happen in one Postgres function (`submit_submission`) inside a single transaction, under an advisory lock on the company name. The four status rules were tested against the live database directly; test rows were deleted. Full detail in `docs/supabase-setup.md`.

S1 is gone everywhere: the shipped workbook is S2–S7 only, `questionnaireSchema.js` has no `s1_` fields and no conditional-field logic left, the wizard starts at S2, and the function rejects any `s1_` answer key.

## Last session
Session 3. Builder set the Netlify env vars and tested the live site. Read-only check of `submissions` in Supabase confirmed three new rows on 30 Sept 2026 (08:55 to 08:56 UTC): two `questionnaire` and one `ecovadis`, all `active`, all six identity fields populated, the EcoVadis row carries a link and the questionnaire rows carry answers. Three distinct companies, so `active` on each is the correct status. This confirms the env vars, the PostgREST call (previously untestable from the sandbox) and both routes end to end. Still open: Excel download on the deployed site, real "View Document" / "View Policy" URLs (`Landing.jsx:174`, `:181`), manual mobile pass, and the 32 pre-existing rows. No code changed.

## Remaining work
- [x] `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` set in Netlify (confirmed by live rows, 30 Sept 2026)
- [x] Live v3.0 deploy confirmed: one EcoVadis and two questionnaire submissions landed in Supabase on 30 Sept 2026
- [ ] Confirm the Excel download works on the deployed site and returns the S1-free workbook (S2–S7 only)
- [ ] Builder to provide real URLs for "View Document" (Supplier Code of Conduct) and "View Policy" (Global Environmental Policy) — still `#`, see Known Issues
- [ ] Manual mobile-viewport pass on the deployed site (automated 375px pass is green locally)
- [ ] Builder to decide what to do with the 32 pre-existing rows in `submissions` (see Known issues) before real use

## Build decisions
- Plain Tailwind utility classes + shared `.tc-*` primitives in `src/index.css` instead of shadcn/ui — shadcn's rounded/shadowed defaults would need overriding on every primitive to match the brand.
- View routing is plain React state in `App.jsx` (no react-router) — one linear flow, no shareable per-view URLs.
- The status logic lives in a Postgres function, not in the Netlify Function. It is the only way to make the check and the write genuinely atomic; an advisory lock on the normalised company name serialises concurrent submissions for the same company.
- The Netlify Function talks to PostgREST with `fetch` rather than `@supabase/supabase-js` — two RPC calls do not justify a dependency in the function bundle.
- `anon`/`authenticated` grants on `submissions` are revoked in addition to the deny-all RLS. Belt and braces: a future policy added by mistake still would not open the table.
- Door 1 and Door 2 share one Review/consent screen. Door 1's answers are lifted into `App.jsx` so "Back to the form" returns to the last wizard section with everything intact.
- The EcoVadis hand-off opens the new tab synchronously on click and navigates it only after the row is written, so a failed write never sends the supplier to EcoVadis. If the browser blocks the popup, the success panel shows a manual link.
- Answer keys are validated against `^s[2-7]_...` server-side rather than importing the schema into the function — keeps the function free of a build-time dependency on `src/`.
- The duplicate check returns "no duplicate" if it fails. It is advisory; a service hiccup must not stop a supplier submitting, and the authoritative check runs server-side at submit anyway.
- `scripts/` holds three verification tools, run with a small loader shim because Node does not resolve the extensionless imports Vite accepts. `npm run verify` runs the two non-browser suites.

## Known issues
- `submissions` holds 32 rows dated 5 June to 9 July 2026, all at 07:20 UTC, all created before the project itself (7 Sept 2026). Session 2 deleted its own test rows, so these came from elsewhere and look like seed data. They contain personal-data fields and will mix with real submissions and affect duplicate matching by company name. Not touched this session; the builder should delete them via the Supabase table editor if they are not real.
- "View Document" / "View Policy" links are `#` — real URLs not yet provided.
- The workbook's STATUS column dropdown still offers "EcoVadis Bypass" as a value. Cosmetic only; the parser reads column E, never column G. Worth removing in Excel at the next workbook edit.
- The landing page uses Acid Lime three times (headline underline, EcoVadis card badge, active timeline numeral) against a brand limit of two per page. Pre-existing from v2.0 and left alone because v3.0 scoped landing changes to the EcoVadis button and the two inaccurate storage claims. One of the three should be dropped in a future pass.
- The landing page's "Why We Are Asking" and "What happens next" sections sit on `bg-white`, where the brand calls for Chalk or Linen. Pre-existing from v2.0, same reasoning.
- Vite warns the JS bundle exceeds the 500 kB chunk-size guideline (dominated by `xlsx`, needed for Door 2). Not functional; worth a code-split if load time becomes a concern.
- The Supabase security advisor reports `rls_enabled_no_policy` on `submissions`. Intended — deny-all is the design.

## Notes for next session
- Builder to supply: the two real URLs for "View Document" and "View Policy", then replace `#` in `Landing.jsx`.
- Builder to confirm the Excel download and mobile pass on the deployed site.
- Decide whether the 32 pre-existing `submissions` rows, and today's 3 test rows, are to be deleted before real use.
