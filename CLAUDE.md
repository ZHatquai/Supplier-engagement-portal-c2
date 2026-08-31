# The Corporate Supplier Sustainability Portal 2026

## Identity
A public portal that onboards Tier 1 suppliers into The Corporate's ESRS-aligned sustainability assessment, either via EcoVadis or an in-browser questionnaire (a guided wizard, or a download/upload/parse flow), accessed via a direct URL from The Corporate's procurement or EHS team.
Tier: 1 — public submission tool, session-only data that clears when the tab closes, no login required (D2+A1)
Spec version governed: v2.0
Position: Standalone

## Session Protocol
At the start of every session:
1. Pull the latest from main before reading anything else.
2. Check docs/product-spec.md: if its version is newer than the "Spec version governed" line in this file, STOP. Tell the builder: "The spec has changed since this CLAUDE.md was written — re-run the Project Governor on the revised spec before building, or these rules may contradict it." Do not build against a stale CLAUDE.md.
3. Read PROGRESS.md in the project root — it is the current state of this build. If it is missing, recreate it with the structure at the end of this section, then continue.
4. Increment the session number and update the date in PROGRESS.md.
5. If "Notes for next session" has content: repeat the notes back to the builder, treat them as this session's priorities, then clear the section.
6. If this is session 1, run First Session Setup below before any build work.

Save point — after completing any module, feature, or fix:
1. Update PROGRESS.md: current state, remaining work, build decisions, known issues.
2. Commit and push to main.
3. Tell the builder in one line: "Save point committed: [what changed]."
Do not start the next piece of work before the save point is pushed. Never end a session without one — an ending session is a save point.

First Session Setup (session 1 only):
1. Create docs/ and move product-spec.md into it.
2. Install the brand skill: create .claude/skills/the-corporate-brand/ and place the provided brand file there as SKILL.md.
3. Announce what moved, then commit and push before building anything.

PROGRESS.md structure (for the recreate rule): status header (Session / Last updated / Live URL), Current state, Last session (3–5 lines, replace each session), Remaining work (shrinking checklist), Build decisions (one line each), Known issues, Notes for next session.

## Commands
```
npm install
npm run dev
npm run build
```

## Tech Stack
React · Vite · Tailwind CSS · shadcn/ui · Netlify
Deployment: GitHub → Netlify, auto-deploys from main. Netlify MCP is not active — Netlify is connected to the GitHub repo for git-based autodeploy (see Hard Rules before the first deploy).

## Arms
Export — browser only, no server function — The_Corporate_Supplier_Questionnaire_2026.xlsx served as a static asset from /public/assets, downloaded via the Door 2 button.

## Hard Rules
- No submission data may leave the browser. No network call may carry Door 1 answers, Door 2's uploaded file, or parsed Door 2 answers. Verify with browser dev tools before every deploy (Acceptance Criteria #14).
- This tool has no external services and no API keys. If a change seems to need one, stop — that is a scope change, not a Tier 1 decision (persistence, email, and database calls are explicitly out of scope, see below).
- No uploaded file is retained after parsing. Discard it from state once Review or Rejection is shown.
- Verify the Netlify site is linked to this GitHub repo/branch before the first deploy — v1.0 was deployed by manual drag-and-drop, so autodeploy on push to main is unconfirmed until checked.

## Project Structure
Root holds CLAUDE.md and PROGRESS.md only. /src for components. /docs for product-spec.md. /.claude/skills/the-corporate-brand/ for the brand skill. /public/assets for The_Corporate_Supplier_Questionnaire_2026.xlsx.

## Brand
Brand is governed by the the-corporate-brand skill at .claude/skills/the-corporate-brand/SKILL.md (installed in First Session Setup). Invoke it for any UI or visual work.
Hard rules that hold even if the skill is not loaded:
- Background: #F2F2F2 (Chalk, page) / #EAE4D5 (Linen, surfaces) — never white or Tailwind gray defaults
- Accent: #C8F135 (Acid Lime) — max 2 uses per page, always against #000000, never directly on a light background
- Font: Playfair Display for headlines, DM Sans 300 for body — for all text
- No border-radius (square corners only), no drop shadows — 0.5px Stone hairline borders instead

## Business Rules
- Door 1's form and Door 2's parser both derive their field structure directly from The_Corporate_Supplier_Questionnaire_2026.xlsx. Neither is hand-authored independently. If the workbook changes, regenerate both together.
- Door 1: a section cannot advance, and the form cannot submit, while a required field is missing or invalid. Dropdowns accept only listed values. Number fields accept only numbers, with the workbook's specified units.
- Door 2: strict on structure — reject with a specific reason naming what didn't match (missing/renamed section, altered sheet layout, changed headers). Lenient on completeness — blank cells in a matching file pass through to Review, shown as empty.
- EcoVadis button is a hardcoded external link (opens ecovadis.com in a new tab); the portal tab stays open.
- "View Document" / "View Policy" links: real URLs not yet provided. Leave as `#` and flag to the builder (see PROGRESS.md Known Issues).

Out of scope — do not build:
- Persistence, a Supabase database, and the GDPR consent flow that comes with it
- Internal review dashboard, submission tracker, supplier login and saved progress
- Retaining the uploaded file after parsing; automated email notification; automated EcoVadis scorecard validation

## Reference Docs
- docs/product-spec.md — full module specs, UI sections, logic, arm detail
- .claude/skills/the-corporate-brand/SKILL.md — full brand system
PROGRESS.md in the root is read at every session start per the Session Protocol.
