# The Corporate Supplier Sustainability Portal 2026

## Identity
A public portal that onboards Tier 1 suppliers into The Corporate's ESRS-aligned sustainability assessment, either via EcoVadis or an in-browser questionnaire, with company/contact identity capture on both routes and submissions persisted to a database for The Corporate's review.
Tier: 2 — public submission form, data persists to Supabase, no login required (D3+A1)
Spec version governed: v3.0
Position: Standalone — dedicated Supabase project, not shared with any other build (a future internal review dashboard is planned to join this project as a stack member; out of scope now)

## Session Protocol
At the start of every session: (1) pull latest from main first; (2) check docs/product-spec.md — if its version is newer than "Spec version governed" above, STOP and tell the builder to re-run the Project Governor before building; (3) read PROGRESS.md as current state, recreating it from the structure below if missing; (4) increment the session number and date in PROGRESS.md; (5) if "Notes for next session" has content, repeat it back, treat it as this session's priorities, then clear it; (6) if this is session 1, run First Session Setup first.

Save point — after any module, feature, fix, or schema change: update PROGRESS.md (current state, remaining work, build decisions, known issues); if the database was touched, update docs/supabase-setup.md in the same save point; commit and push to main; tell the builder "Save point committed: [what changed]." Never end a session without one.

First Session Setup (session 1 only): create docs/ and move product-spec.md into it; install the brand skill at .claude/skills/the-corporate-brand/SKILL.md from the provided file; announce what moved, then commit and push before building anything.

PROGRESS.md structure (recreate rule): status header (Session / Last updated / Live URL), Current state, Last session (3–5 lines), Remaining work (shrinking checklist), Build decisions, Known issues, Notes for next session.

## Commands
```
npm install
npm run dev
npm run build
```

## Tech Stack
React · Vite · Tailwind CSS · Netlify · Supabase
Deployment: GitHub → Netlify, auto-deploys from main. Netlify MCP is not active — the existing GitHub↔Netlify connection from v2.0 handles deploys; no new setup needed.

## Arms
Export — browser only, no server function — The_Corporate_Supplier_Questionnaire_2026.xlsx (Section 1 removed) served as a static asset from /public/assets, downloaded via the Door 2 button.

## Environment Variables
SUPABASE_URL — Supabase: Project Settings → API → Project URL — Netlify env var, server-side only
SUPABASE_SERVICE_ROLE_KEY — Supabase: Project Settings → API → service_role key (created with the new project) — Netlify env var, server-side only
No anon key is used — the frontend never talks to Supabase directly. Both are read only inside the submission Netlify Function, never in code or any committed file.

## Supabase
Project: "The corporate live build (New)" — does not exist yet. At the start of the next session, confirm this exact name with the builder, then create it via Supabase MCP before building anything. Region: EU (Frankfurt) — GDPR applies. Plan: Free — pauses after ~1 week without traffic; revisit if the tool goes into steady live use.

Schema — authoritative until docs/supabase-setup.md exists:
submissions: company_name, contact_name, contact_email, contact_phone, job_title, department, route (enum: ecovadis / questionnaire), ecovadis_link, questionnaire_answers (JSON), status (enum: active / superseded / needs_review), created_at

RLS — never skip: submissions — anon has no read/insert/update/delete. All reads and writes go exclusively through the submission Netlify Function using the service role key.

After setup, write docs/supabase-setup.md and update it at every save point touching the database: project name/ID/URL, plan, tables with fields/types, RLS per table, a note on the planned future internal-dashboard stack member, last-updated line. From then on it is the schema source of truth.

## Hard Rules
- API keys never in any frontend file or GitHub commit. Always called through the server-side submission Netlify Function.
- Netlify Identity: never. Supabase Auth is the only auth system in this stack (not used in this build).
- RLS: never disabled on any table. Fix the policy or the query, never the RLS setting.
- Supabase service role key required for the atomic duplicate-check-and-insert on `submissions` — anon has zero direct access, so this is the only path in or out of the table. Stored as SUPABASE_SERVICE_ROLE_KEY, Netlify env var, used only inside the submission Netlify Function — never in code, never exposed to the browser. It bypasses all RLS.
- The duplicate check and the status write happen atomically, server-side, in the same Netlify Function call as the insert — never split into two round-trips from the browser, to avoid a race condition between two suppliers submitting for the same company at once.
- No uploaded Door 2 file is retained after parsing — discard it once Review or Rejection is shown (unchanged from v2.0).
- GDPR: consent checkbox and confirmed data statement required before submission on both routes (EcoVadis: capture screen; Questionnaire: Review/Confirmation screen). Personal data: company_name, contact_name, contact_email, contact_phone, job_title, department. Deletion requests go to the existing Contact EHS email on the landing page — deleted manually via the Supabase table editor. Region: EU (Frankfurt).

## Project Structure
Root: CLAUDE.md, PROGRESS.md only. /src for components (/src/lib for the Supabase client and utilities). /netlify/functions for the submission function. /docs for product-spec.md and supabase-setup.md. /.claude/skills/the-corporate-brand/ for the brand skill. /public/assets for the questionnaire xlsx.

## Brand
Brand is governed by the the-corporate-brand skill at .claude/skills/the-corporate-brand/SKILL.md (already installed from v2.0). Invoke it for any UI or visual work, including both new capture screens.
Hard rules that hold even if the skill is not loaded:
- Background: #F2F2F2 (Chalk, page) / #EAE4D5 (Linen, surfaces) — never white or Tailwind gray defaults
- Accent: #C8F135 (Acid Lime) — max 2 uses per page, always against #000000, never directly on a light background
- Font: Playfair Display for headlines, DM Sans 300 for body
- No border-radius (square corners only), no drop shadows — 0.5px Stone hairline borders instead

## Business Rules
- Company/contact capture (company_name, contact_name, contact_email, contact_phone, job_title, department) opens both routes, all six required. Email format-validated; phone has no format check.
- EcoVadis route: capture screen also requires ecovadis_link (URL-validated) and consent. One "Submit and Go to EcoVadis" button writes the row and redirects to ecovadis.com in a new tab — portal tab stays open, no separate confirmation screen.
- Questionnaire route: capture values are held in session state (not yet written to Supabase) and carried through Door Selection and whichever door is chosen, into the shared Review/Confirmation screen, where consent lives and final submit writes the row.
- Door 1 starts at S2 — S1 no longer exists in the workbook or wizard. Door 1's fields and Door 2's parser are both re-derived from the S1-free workbook.
- route is set automatically by the system (ecovadis or questionnaire) — never user-entered.
- Submission status is computed server-side at final submit, matched by company_name (case-insensitive) against existing `active` rows:
  - No existing active row → new row is `active`, no warning.
  - Existing active row, different route (cross-rank) — EcoVadis always outranks Questionnaire: EcoVadis-after-Questionnaire sets new row `active`, flips old row `superseded`; Questionnaire-after-EcoVadis sets new row `superseded`, old row stays `active`. Warn but allow either way.
  - Existing active row, same route (same-rank) — both rows set to `needs_review`. Warn but allow.
  - `needs_review` rows are resolved manually via the Supabase table editor — no automated resolution in this build.

Out of scope — do not build:
- Supplier login and saved progress
- Internal review dashboard for EHS/procurement
- Automated resolution of `needs_review` rows
- Submission tracker / non-responder tracking / supplier roster
- Automated email notification or confirmation
- Automated EcoVadis scorecard validation
- The retired S1 EcoVadis-bypass dropdown and its logic
- Retaining the uploaded Door 2 file itself

## Reference Docs
- docs/product-spec.md — full module specs, UI sections, logic, arm detail
- docs/supabase-setup.md — schema source of truth (created next session)
- .claude/skills/the-corporate-brand/SKILL.md — full brand system
PROGRESS.md in the root is read at every session start per the Session Protocol.
