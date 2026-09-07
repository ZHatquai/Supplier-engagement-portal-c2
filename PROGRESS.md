# PROGRESS — The Corporate Supplier Sustainability Portal 2026

> Claude Code: read this file at the start of every session, before touching anything. Update it at every save point. Replace content — do not append. History lives in git.

**Session:** 2 — v3.0 build complete
**Last updated:** 7 September 2026 — by Claude Code, end of session 2
**Live URL:** Not yet confirmed for v3.0. Netlify autodeploys from main; the deploy will not work until the two Supabase environment variables are set (see Remaining work).

## Current state
v3.0 is built end-to-end and passes a full local walkthrough in a real browser: 46 checks covering both routes, both doors, all four status rules, consent gating, the duplicate warning, Door 2 rejection, and a 375px mobile pass.

Both routes now open with a company/contact capture step. The EcoVadis route (`src/components/EcoVadisCapture.jsx`) takes the six identity fields plus a URL-validated scorecard link and consent, writes the row, and opens ecovadis.com in a new tab while the portal tab stays open. The Questionnaire route (`src/components/QuestionnaireCapture.jsx`) holds identity in session state through Door Selection and both doors into a shared Review screen (`src/components/ReviewSubmit.jsx`), where the consent checkbox sits and final submit writes the row. Door 1 and Door 2 now share that screen; `Door2Review.jsx` was replaced by it.

The database is live: project **The corporate live build (New)** (eu-central-1; ref and URL are deliberately not recorded in this public repo — they live in the Supabase dashboard and the Netlify environment variables). `submissions` has RLS enabled and forced with zero policies, and grants revoked from `anon`/`authenticated` — the browser has no path to it at all. Everything goes through `netlify/functions/submissions.js` with the service role key. The duplicate check, the status computation, the update of superseded rows, and the insert all happen in one Postgres function (`submit_submission`) inside a single transaction, under an advisory lock on the company name. The four status rules were tested against the live database directly; test rows were deleted. Full detail in `docs/supabase-setup.md`.

S1 is gone everywhere: the shipped workbook is S2–S7 only, `questionnaireSchema.js` has no `s1_` fields and no conditional-field logic left, the wizard starts at S2, and the function rejects any `s1_` answer key.

## Last session
Session 2 (v3.0 build). Installed the v3.0 spec, CLAUDE.md and PROGRESS.md; applied the schema, the two RPC functions and the RLS lockdown to the live Supabase project via MCP and verified all four status rules against it. Patched the row-4 workbook instructions that still referenced the retired S1 bypass, then shipped the workbook and re-derived Door 1's schema and Door 2's parser from it. Built both capture screens, the shared Review/consent screen, the duplicate warning, and the submission Netlify Function. Wrote three verification scripts (`npm run verify` plus a browser walkthrough) — all passing. Confirmed no Supabase reference reaches the client bundle and no browser request reaches Supabase.

## Remaining work
- [ ] **Builder: add `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` as Netlify environment variables.** Until this is done every submission fails with "The submission service is not configured." Both values come from Supabase → Project Settings → API. Do not paste either into this file, any doc, or any commit — this repo is public.
- [ ] Confirm the live v3.0 deploy: submit once on each route against the real database, then check the rows in the Supabase table editor
- [ ] Confirm the Excel download works on the deployed site and returns the S1-free workbook
- [ ] Builder to provide real URLs for "View Document" (Supplier Code of Conduct) and "View Policy" (Global Environmental Policy) — still `#`, see Known Issues
- [ ] Manual mobile-viewport pass on the deployed site (automated 375px pass is green locally)

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
- "View Document" / "View Policy" links are `#` — real URLs not yet provided.
- The workbook's STATUS column dropdown still offers "EcoVadis Bypass" as a value. Cosmetic only; the parser reads column E, never column G. Worth removing in Excel at the next workbook edit.
- The landing page uses Acid Lime three times (headline underline, EcoVadis card badge, active timeline numeral) against a brand limit of two per page. Pre-existing from v2.0 and left alone because v3.0 scoped landing changes to the EcoVadis button and the two inaccurate storage claims. One of the three should be dropped in a future pass.
- The landing page's "Why We Are Asking" and "What happens next" sections sit on `bg-white`, where the brand calls for Chalk or Linen. Pre-existing from v2.0, same reasoning.
- The PostgREST HTTP call itself could not be exercised from the build sandbox — its network policy blocks `*.supabase.co`, and the Supabase MCP does not go through PostgREST. The request shape follows Supabase's documented RPC convention and the handler is unit-tested against a stub; the first live submission after the env vars are set is the real confirmation.
- Vite warns the JS bundle exceeds the 500 kB chunk-size guideline (dominated by `xlsx`, needed for Door 2). Not functional; worth a code-split if load time becomes a concern.
- The Supabase security advisor reports `rls_enabled_no_policy` on `submissions`. Intended — deny-all is the design.

## Notes for next session
None.
