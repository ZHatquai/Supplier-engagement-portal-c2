# PROGRESS — The Corporate Supplier Sustainability Portal 2026

> Claude Code: read this file at the start of every session, before touching anything. Update it at every save point. Replace content — do not append. History lives in git.

**Session:** 0 — v2.0 build not started
**Last updated:** 31 August 2026 — by Project Governor, pre-build
**Live URL:** v1.0 is already live in production (URL not on file here); the v2.0 URL is confirmed after the first successful deploy of this rebuild.

## Current state
v1.0 (supplier_onboarding.html) is live in production — a static HTML page routing suppliers to EcoVadis or an Excel download returned by email. This is the first Project Governor run for this tool; no v2.0 React code has been written yet. Repo contains CLAUDE.md, PROGRESS.md, product-spec.md (v2.0), the the-corporate-brand skill file, the v1.0 HTML file, and The_Corporate_Supplier_Questionnaire_2026.xlsx.

## Last session
None — the first v2.0 build session has not happened yet.

## Remaining work
- [ ] First Session Setup: create docs/, move product-spec.md into it, install the-corporate-brand skill to .claude/skills/, commit (see CLAUDE.md Session Protocol)
- [ ] Verify the Netlify site is linked to this GitHub repo/branch — v1.0 was deployed by manual drag-and-drop, not git; confirm before relying on push-to-main autodeploy
- [ ] Build Landing Page — port all v1.0 content verbatim; amend the Route 2 card (CTA "Complete the Questionnaire", remove email-return copy)
- [ ] Build Door Selection — two option cards (fill in the portal / download and upload) plus a back link to the landing page
- [ ] Build Door 1 — guided S1–S7 wizard with per-section validation, fields derived from the workbook
- [ ] Build Door 2 — Download and Upload (download button, .xlsx/.csv upload control)
- [ ] Build Door 2 — Review (parsed answers by section, blanks shown as empty) and Rejection (naming what didn't match)
- [ ] Build Confirmation — summary by section, states clearly that nothing is stored and no email is sent
- [ ] Wire Export arm: workbook download as a static asset from Door 2
- [ ] Local test pass — full walkthrough of every view before deploying
- [ ] Acceptance criteria pass — verify all 16 criteria in spec Section 13 before deploy
- [ ] Deploy to Netlify — confirm push to main triggers the live build (Netlify MCP not active)

## Build decisions
None yet.

## Known issues
- "View Document" / "View Policy" real URLs not yet provided — leave as `#` until supplied
- Deployed URL for v2.0 confirmed after first deploy

## Notes for next session
None.
