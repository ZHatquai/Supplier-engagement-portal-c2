# Product Spec — The Corporate Supplier Sustainability Portal 2026

**Version:** 2.0
**Date:** 10 July 2026
**Author:** Zyad Hatquai
**Status:** Confirmed

---

## Section 1 — Tool Summary

**Tool name:** The Corporate Supplier Sustainability Portal 2026

**What it does:** A public single-page portal that onboards Tier 1 suppliers into The Corporate's ESRS-aligned sustainability assessment and now lets them complete the questionnaire inside the browser. EcoVadis remains the first route. The questionnaire route opens into two doors: a guided section-by-section form (S1 to S7) filled in the tool, or a download, complete, and upload flow where the supplier fills the Excel offline and uploads it back for parsing and review. Either door ends on an on-screen confirmation. Nothing is stored and nothing is sent.

**Who uses it:** Tier 1 supplier contacts (sustainability managers, EHS leads, and procurement representatives at supplier organisations) who receive the URL directly from The Corporate's procurement or EHS team.

**Why it exists:** v1.0 routed suppliers to download the Excel and return it by email. This version removes the email round-trip from the supplier's experience and proves the in-portal submission mechanics: guided entry, file upload, parsing, review, and confirmation. It is an MVP built to validate the full submission flow and the questionnaire logic before any backend is added.

**Build status:** Iteration. The previous version (v1.0, 12 June 2026) was a static single-page HTML landing page that routed suppliers to EcoVadis or to an Excel download returned by email. This build rebuilds the tool in React and adds the two-door in-browser submission flow behind the questionnaire route. All v1.0 landing content is preserved and reimplemented in the new structure. No data is persisted. The tool remains Tier 1.

---

## Section 2 — Classification

This section defines the architecture of the tool. Every downstream decision follows from this.

### Data Model

**Decision:** D2

| Label | What it means | This tool? |
|-------|--------------|-----------|
| D1 — Hardcoded | All data is written into the code by the developer. Users cannot input anything that persists. The tool displays what the developer put in. | No |
| D2 — Session | Data enters the tool during use and disappears when the tab closes. No database. Covers both uploaded files and form inputs. | Yes |
| D3 — Persisted | Data is written to a database and survives after the session ends. Supabase is required. | No |

**Reason:** Supplier answers enter the tool during the session, by filling the guided form or by uploading a completed file, and are held in browser memory only. Nothing is written to a database and nothing survives the tab closing. This is an MVP built to test the submission logic before persistence is added.

**D3 is triggered if any of the following are true — check all that apply:**
- [ ] Data must be retrievable after the session ends
- [ ] Multiple sessions contribute to the same dataset
- [ ] An audit trail or history is needed
- [ ] Data submitted by one person must be visible to another
- [ ] Results must be accessible via a URL after the session ends
- [ ] Files uploaded by users must be stored and retrievable later

None apply. Data is session-only.

---

### Access Model

**Decision:** A1

| Label | What it means | This tool? |
|-------|--------------|-----------|
| A1 — Public | Anyone with the URL can use it. No login, no account required. | Yes |
| A2 — Authentication | Users must log in. All logged-in users see the same thing and have the same permissions. | No |
| A3 — Authorization | Users must log in and have different roles. Different roles see different data or have different permissions. | No |

**Reason:** The portal is distributed to Tier 1 suppliers as a direct link. Anyone with the URL can use it immediately. No account or login is required.

> **Promotion rule:** Auth requires a database. If the access model is A2 or A3, the data model is D3 — even when all displayed content is fixed. D1/D2 combined with A2/A3 are not valid classifications; they resolve to D3. Not applicable here: this tool is A1.

---

### Tier

**Tier:** 1

| Tier | D+A combination | Stack | Deployment |
|------|----------------|-------|------------|
| 1 | D1+A1 or D2+A1 | Netlify only | Netlify |
| 2 | D3+A1 | Netlify + Supabase (no auth) | Netlify |
| 3 | D3+A2 or D3+A3 | Netlify + Supabase (auth + RLS) | Netlify |

D2 + A1 resolves to Tier 1. Netlify only. No Supabase.

---

### Standalone or Stack

**This tool is:** Standalone. It does not share a database with any other tool. There is no database in this version.

> When persistence is added in a future build, the internal review side (EHS and procurement reviewing submissions) becomes buildable and would form a stack with the persisted version of this tool, sharing one Supabase project. That is out of scope here (see Section 12).

---

## Section 3 — Arms

Arms are capabilities added to the tool. They do not change the tier. Mark each arm active or not, and complete the detail only for active arms.

> **Document search and AI knowledge bases are outside this framework version.** Not applicable to this tool.

---

### AI API Arm

**Active:** No

The Door 2 upload is read and mapped by plain client-side file parsing, not AI. No classification, explanation, summarisation, or generation happens in this tool.

---

### Export Arm

**Active:** Yes

| Detail | Answer |
|--------|--------|
| Format | XLSX |
| What is exported | The pre-formatted Excel workbook, The_Corporate_Supplier_Questionnaire_2026.xlsx, served as a static asset. It contains 7 sections mapped to ESRS: S1 General Information and EcoVadis Bypass, S2 Climate and Decarbonisation (E1), S3 Pollution and PFAS (E2), S4 Water and Marine Resources (E3), S5 Circular Economy and Waste (E5), S6 Biodiversity and Ecosystems (E4), S7 Social, Labour and Governance (S2, G1). In v2.0 the download button belongs to Door 2 of the questionnaire route: the supplier downloads the workbook, completes it offline, and uploads it back into the portal. The file is served as a static asset with no data populated server-side. |
| PDF design intent | N/A — format is XLSX only |

---

### Email Arm

**Active:** No

No email is sent anywhere. After either door the supplier receives an on-screen confirmation instead of any email. The v1.0 mailto instruction to return the completed Excel by email is removed from the questionnaire route.

---

### Scheduled Automation Arm

**Active:** No

---

## Section 4 — Stack and Deployment

### All Tiers

| Detail | Answer |
|--------|--------|
| Frontend framework | React + Vite + Tailwind. The tool now carries real interactive state (a seven-section wizard, live file parsing, a review screen, and a confirmation) that does not fit vanilla JS cleanly and matches the other Corporate tools. This replaces the v1.0 HTML/CSS/JS base. |
| Deployment target | Netlify |
| Netlify MCP | See Open Questions (Section 15) — confirm before the build session. |

**File parsing:** Door 2 reads uploaded .xlsx and .csv files entirely client-side using a browser parsing library (SheetJS / xlsx). There is no server, no backend function, and no network call carrying questionnaire data.

**GitHub — pre-build requirement for all Tier 1, 2, and 3 tools:**
The existing project repo is used (the v1.0 project repo). The product-spec.md (this v2.0), CLAUDE.md, and PROGRESS.md must be uploaded to the repo root before Claude Code opens. Claude Code assumes the repo exists, commits changes regularly, and pushes to main. It does not create or configure the repo.

---

### CONDITIONAL: Supabase project — only complete if Tier 2 or Tier 3

N/A — this tool is Tier 1. No database, no Supabase project.

---

### CONDITIONAL: Only complete if this tool is part of a stack

N/A — standalone.

---

## Section 5 — Data Architecture

N/A — Data Model is D2. No database.

All questionnaire answers, whether typed into Door 1 or parsed from a Door 2 upload, live in browser session state for the duration of the visit and are cleared when the tab closes. The shape of the data (the S1 to S7 fields, their types, dropdown options, units, and required flags) is defined by The_Corporate_Supplier_Questionnaire_2026.xlsx and is described in Sections 8 and 9. No uploaded file is retained after it is parsed.

---

## Section 6 — Access and Permissions

N/A — Access Model is A1. No authentication, no roles, no RLS.

---

## Section 7 — GDPR

**GDPR outcome:** Not applicable for this version, confirmed during the interview. This tool is D2 and collects no data that is stored or transmitted. Supplier answers and any uploaded file are processed entirely in the supplier's browser and discarded when the tab closes. Nothing reaches a server, a database, or an inbox.

> This changes the moment persistence is added. When supplier submissions are stored so The Corporate can retrieve them, the tool will be collecting supplier company and contact data in the EU, and the full consent framework (a consent checkbox, a data statement at the point of collection, and a deletion mechanism) becomes mandatory. This is recorded in Section 12 so it is not lost.

---

## Section 8 — Screen and UI Structure

The tool is one deployed React site with several views. Navigation between them happens in-app.

### Landing Page

- **Purpose:** Route Tier 1 suppliers to the correct submission path and communicate The Corporate's sustainability expectations.
- **What is visible:** All v1.0 content, preserved: navigation bar with The Corporate logo; hero (overline label, H1, body, 4-item stats row with the Scope 3 reference note); the "Why We Are Asking" section; the "Two Routes. One Destination." section; the "What Happens Next" 4-step timeline; the "Key Resources" 3-card section; and the footer. The exact copy, stats figures, timeline steps, and resource cards are carried over unchanged from the existing v1.0 page (supplier_onboarding.html in the repo); Claude Code ports them verbatim into the React structure. **One change:** the Route 2 card. In v1.0 it triggered a direct Excel download and told suppliers to return the file by email. In v2.0 its CTA reads "Complete the Questionnaire" and opens the in-portal submission flow (the Door Selection view). The email-return instruction copy is removed from this card.
- **User actions:** Click "Submit EcoVadis Scorecard" (opens ecovadis.com in a new tab); click "Complete the Questionnaire" (navigates in-app to Door Selection); click "View Document" and "View Policy" (open the respective documents, URLs carried from v1.0); click "Contact EHS" (mailto). Scroll the single landing view.
- **What happens next:** EcoVadis opens externally. "Complete the Questionnaire" navigates in-app to Door Selection. All other actions behave as in v1.0.

### Door Selection

- **Purpose:** Let the supplier choose how to submit the questionnaire.
- **What is visible:** A short intro line and two option cards. Door 1: "Fill in the portal" (a guided form, section by section). Door 2: "Download and upload" (complete the Excel offline and upload it back). A back link to the landing page.
- **User actions:** Choose Door 1, choose Door 2, or go back to the landing page.
- **What happens next:** Door 1 opens the guided questionnaire wizard. Door 2 opens the Download and Upload view.

### Door 1 — Guided Questionnaire (S1 to S7 wizard)

- **Purpose:** Collect every questionnaire answer in the browser, one section at a time.
- **What is visible:** A section progress indicator across S1 to S7; the current section's fields rendered from the questionnaire xlsx (dropdowns where the xlsx defines a validation list, number and unit inputs where the xlsx specifies them, plain text otherwise, with required markers); inline validation messages; Back and Next controls; and, on the final section, a Submit button.
- **User actions:** Answer the fields in the current section, move Back and Next between sections, and Submit on S7. A section cannot be advanced, and the questionnaire cannot be submitted, while a required field is missing or a value is invalid.
- **What happens next:** Submit leads to the Confirmation view, summarising all entered answers.

### Door 2 — Download and Upload

- **Purpose:** Let the supplier complete the Excel offline and return it through the portal.
- **What is visible:** Instructions; the Download button for The_Corporate_Supplier_Questionnaire_2026.xlsx (served from static assets, the button moved here from v1.0); an upload control accepting .xlsx or .csv; a note on the accepted formats; and a back link.
- **User actions:** Download the workbook, then upload a completed file.
- **What happens next:** On upload the tool parses the file. If the structure matches the 2026 template, the supplier goes to the Review view. If it does not match, a rejection message appears on the same view (see below).

### Door 2 — Review / Rejection

- **Purpose:** Show the supplier what was read from their file before they submit, or explain why the file could not be accepted.
- **What is visible (Review, structure matches):** The parsed answers laid out by section S1 to S7, mirroring the questionnaire; any blank or missing cells shown as empty so the gaps are visible; a Submit button; and an option to go back and re-upload a corrected file.
- **What is visible (Rejection, structure does not match):** A clear message stating that the file does not match the expected 2026 template and naming what specifically did not match (for example a missing or renamed section, an altered sheet layout, or changed headers); the Download button again so the supplier can start from the correct template; and the upload control to try again.
- **User actions:** From Review, submit or re-upload. From Rejection, re-download the template or upload a different file.
- **What happens next:** Submit from Review leads to Confirmation. A matching re-upload proceeds to Review.

### Confirmation

- **Purpose:** Confirm to the supplier what they submitted.
- **What is visible:** A confirmation heading; a summary of the submitted answers (from whichever door), organised by section; a clear note that this is an on-screen confirmation and no email is sent; and the brand footer.
- **User actions:** None required. An optional link returns to the landing page.
- **What happens next:** Nothing is stored or transmitted. Closing the tab clears the session. In this MVP the confirmation is the end of the flow.

---

## Section 9 — Logic and Calculations

This tool applies decision rules (field validation and file matching). It performs no scoring or calculation.

**What is calculated or scored:** Nothing is scored or calculated. The tool applies two sets of decision rules: Door 1 field validation and Door 2 file matching.

**Inputs:** Door 1 takes the supplier's typed and selected answers. Door 2 takes the uploaded .xlsx or .csv file. Both are validated against the structure defined by The_Corporate_Supplier_Questionnaire_2026.xlsx.

**Formula or rules:**

- **Field structure, single source of truth:** The_Corporate_Supplier_Questionnaire_2026.xlsx, placed in the repo before the build. Claude Code inspects it and derives, per cell: the field label, the section (S1 to S7), the input type, any dropdown or data-validation list, the unit where present, and whether the field is required. Door 1's form and Door 2's parser both mirror this exactly. Neither is hand-authored independently of the workbook.
- **Door 1 validation:** Required fields must be filled. Dropdown fields accept only listed values. Number fields accept only numbers, with units where the xlsx specifies them. A section cannot be advanced, and the questionnaire cannot be submitted, while a required field is missing or a value is invalid. Validation messages appear inline.
- **Door 2 matching (strict on structure, lenient on completeness):** On upload, the parser checks that the file's structure matches the 2026 template: the correct sections S1 to S7 are present, with the expected sheet layout and headers. If the structure matches, the parsed answers go to the Review screen with blank cells included and shown as empty. If the structure does not match, the file is rejected with a message naming what did not match. Silent guessing, or partial mapping of a non-matching file, is not allowed.
- **Blank cells in a structurally matching file** are accepted and surfaced in Review, because the supplier reviews before submitting. Only a structural mismatch blocks a file.

**Output:** A validated set of answers ready for the on-screen confirmation. No score, grade, or persisted record.

**Edge cases:**
- Door 1, required field left blank or an invalid value entered: block advance or submit, show an inline message.
- Door 2, wrong file type (not .xlsx or .csv): reject and ask for the correct format.
- Door 2, correct file type but altered structure (missing or renamed section, changed headers, extra sheets): reject with specifics.
- Door 2, correct structure with blank cells: accept, show the gaps in Review.
- Door 2, empty or corrupt file: reject with a clear message.
- Supplier closes the tab mid-flow: all in-progress answers are lost by design (no persistence). Acceptable for this MVP and communicated to the supplier.

---

## Section 10 — Brand and Visual Direction

**Brand reference:** the-corporate-brand skill file. Upload it flat to the repo root; Claude Code installs it to .claude/skills/ in First Session Setup.

**Visual feel:** Corporate minimalism, unchanged from v1.0. Restraint over decoration. Precise, direct, composed, authoritative. No gradients, no shadows, no rounded corners. The new views (Door Selection, the wizard, upload, review, and confirmation) use the same brand tokens as the landing page.

**Key brand rules Claude Code must enforce throughout:**
- Fonts: Playfair Display (headlines), DM Sans 300 (body), DM Sans 500 (labels and emphasis), imported from Google Fonts CDN.
- Colours: Ink (#000000), Stone (#B6B09F), Linen (#EAE4D5), Chalk (#F2F2F2), White (#FFFFFF), Acid Lime (#C8F135).
- Acid Lime: maximum 2 uses per page, always against #000000, never directly on light backgrounds.
- Buttons and cards: square corners (border-radius: 0), no shadows; cards use a 0.5px Stone border on Linen or White.
- No blue links: underline plus Ink colour only.
- Voice: short declarative sentences, active voice, no exclamation points, no emoji.
- Form fields, dropdowns, progress indicators, and buttons follow the same restraint: square corners, Ink text, Stone borders, no decorative colour.
- Validation and rejection messages stay inside the palette. Do not introduce red or any colour outside the brand tokens; follow the-corporate-brand skill for error and empty states.

**Reference or inspiration:** The existing v1.0 landing page (same site).

---

## Section 11 — API and Credentials

This tool requires no external services and no API keys.

| Service | What it does in this tool | Key required | Where key is stored |
|---------|--------------------------|-------------|-------------------|
| None | — | — | — |

The Excel file is served as a static asset in the project's assets folder. File parsing (SheetJS / xlsx) runs entirely in the browser. The EcoVadis button is a hardcoded URL. The Contact EHS button is a mailto link. No server-side function, no API call, and no environment variable is required for this tool.

**Credentials readiness:** Nothing to prepare before the build session.

---

## Section 12 — Out of Scope — Phase 2

| Deferred feature | Reason it is deferred |
|-----------------|----------------------|
| Persistence and a Supabase database | This MVP is session-only. Storing submissions so The Corporate can retrieve them moves the tool to Tier 2. Validate the submission flow first. |
| GDPR consent flow on the form | Activates with persistence: storing supplier company and contact data in the EU requires a consent checkbox, a data statement, and a deletion mechanism. |
| Internal review dashboard for EHS and procurement | Needs stored data to review. Forms a stack with the persisted version of this tool. |
| Submission tracker (percent of Tier 1 suppliers responded) | Needs persistence and a supplier roster. |
| Supplier login and saved progress | Would move the tool to Tier 3. |
| Keeping the original uploaded file | This version parses in-session and retains nothing. |
| Automated email notification or confirmation | Explicitly not built. On-screen confirmation only, no email anywhere. |
| Automated EcoVadis scorecard validation | Requires EcoVadis API access. |

---

## Section 13 — Acceptance Criteria

| # | What to verify | Expected result | Done? |
|---|---------------|-----------------|-------|
| 1 | Landing page renders with all v1.0 content and the amended Route 2 card | Hero, stats, Why We Are Asking, Two Routes, What Happens Next, Key Resources, footer all render as v1.0; Route 2 CTA reads "Complete the Questionnaire" and the email-return copy is gone | [ ] |
| 2 | EcoVadis button unchanged | Clicking "Submit EcoVadis Scorecard" opens https://ecovadis.com in a new tab; the portal tab remains open | [ ] |
| 3 | Door Selection offers both doors | Two option cards (Fill in the portal / Download and upload) plus a back path to the landing page | [ ] |
| 4 | Door 1 renders S1 to S7 as a section-by-section wizard | Fields, types, dropdowns, units, and required markers match The_Corporate_Supplier_Questionnaire_2026.xlsx across all seven sections | [ ] |
| 5 | Door 1 validation blocks invalid progress | A section cannot advance or submit while a required field is missing or a value is invalid; inline messages shown | [ ] |
| 6 | Door 1 submit leads to Confirmation | Confirmation summarises all entered answers by section | [ ] |
| 7 | Door 2 download works | The Download button downloads the correct, complete The_Corporate_Supplier_Questionnaire_2026.xlsx | [ ] |
| 8 | Door 2 accepts the right formats | Both .xlsx and .csv uploads are accepted | [ ] |
| 9 | Door 2 parses a matching file | A structurally matching upload parses and shows all answers in Review, organised by section, with blank cells shown as empty | [ ] |
| 10 | Door 2 rejects a non-matching file | A file whose structure does not match is rejected with a message naming what did not match; it does not proceed to Review | [ ] |
| 11 | Door 2 submit leads to Confirmation | Submit from Review summarises the parsed answers by section | [ ] |
| 12 | Confirmation states no email and no storage | Confirmation makes clear no email is sent and nothing is stored; closing the tab clears the session | [ ] |
| 13 | Brand identity applied across all new views | Fonts, palette, square corners, Acid Lime rule, and voice match v1.0 on Door Selection, wizard, upload, review, and confirmation | [ ] |
| 14 | No submission data leaves the browser | Parsing and validation run entirely client-side; browser dev tools show no network request carrying questionnaire answers or the uploaded file | [ ] |
| 15 | Fully responsive on mobile | Wizard, upload, review, and confirmation are usable below 768px with no horizontal overflow; buttons are tappable | [ ] |
| 16 | Tool deploys to Netlify | Live URL loads on desktop and mobile; no 404s; the Excel downloads correctly from the deployed site | [ ] |

---

## Section 14 — Build Path

**This tool's tier:** Tier 1

---

### Pre-build steps — complete these before opening Claude Code

- [ ] Tool Architect skill — interview complete, this spec is written and confirmed
- [ ] Project Governor skill — CLAUDE.md and PROGRESS.md produced from this spec
- [ ] Existing project GitHub repo used (the v1.0 project repo)
- [ ] product-spec.md (this v2.0) uploaded to the repo root
- [ ] CLAUDE.md uploaded to the repo root
- [ ] PROGRESS.md uploaded to the repo root
- [ ] the-corporate-brand skill file uploaded to the repo root
- [ ] **The_Corporate_Supplier_Questionnaire_2026.xlsx present in the repo (static assets folder). This workbook is the single source of truth for both Door 1's form and Door 2's parser. Required before the build.**
- [ ] Netlify connected to the GitHub repo (skip if Netlify MCP is active)
- [ ] No credentials to prepare for this tool

> Claude Code organizes these files into the correct folder structure (docs/, .claude/skills/) automatically at the start of the first session.

---

### Tier 1 — build session

- [ ] Open Claude Code in the project folder (GitHub repo connected to Netlify)
- [ ] Claude Code runs First Session Setup: creates docs/, moves reference files, installs the-corporate-brand skill to .claude/skills/
- [ ] Claude Code reads product-spec.md, CLAUDE.md, and PROGRESS.md
- [ ] Claude Code reads The_Corporate_Supplier_Questionnaire_2026.xlsx and derives the S1 to S7 field structure (labels, sections, input types, dropdown lists, units, required flags) used by both Door 1 and the Door 2 parser
- [ ] Claude Code ports the v1.0 landing content into the React app and amends the Route 2 card (CTA "Complete the Questionnaire", email-return copy removed)
- [ ] Claude Code builds Door Selection, the Door 1 wizard, Door 2 (download, upload, parse, review, rejection), and the Confirmation view
- [ ] Claude Code confirms document URLs for "View Document" and "View Policy" with the builder, or leaves them as # (carried from v1.0)
- [ ] Test locally before deploying
- [ ] **If Netlify MCP active:** Claude Code deploys automatically
- [ ] **If Netlify MCP not active:** push to main → Netlify deploys automatically

---

## Section 15 — Open Questions

| Question | Who answers it | Blocking? |
|----------|---------------|-----------|
| Is the questionnaire workbook (The_Corporate_Supplier_Questionnaire_2026.xlsx) final, or will its structure change before the build? Both doors mirror it, so any structural change after the build requires updating the form and the parser together. | Builder — confirm and place the final file in the repo before the build | Yes — the file must be in the repo before the build session begins |
| Rebuild in the existing repo, or create a fresh repo for the React version? React replaces the v1.0 vanilla HTML; Claude Code can restructure the existing repo in place. | Builder | No — same repo is fine; Claude Code restructures |
| Is Netlify MCP active for this project (Netlify connected via Claude Desktop Connectors)? | Builder — confirm before opening Claude Code | No — can deploy manually if not active |
| Real URLs for the Supplier Code of Conduct and the Global Environmental Policy | Builder — provide before or during the build session | No — Claude Code leaves as # and flags for the builder |
| Deployed URL for this tool | Builder | No — confirmed after first deployment |

---

## Section 16 — Tool Version History

| Version | Date | What changed in the tool |
|---------|------|--------------------------|
| v1.0 | 12 June 2026 | Retroactive spec of the existing supplier onboarding landing page (supplier_onboarding.html). Static single-page HTML routing suppliers to EcoVadis or to an Excel download returned by email. |
| v2.0 | 10 July 2026 | Added in-browser questionnaire submission behind the questionnaire route. Two doors: Door 1, a guided S1 to S7 form with dropdowns and validation derived from the questionnaire workbook; Door 2, download, complete, and upload with client-side parsing, strict structural matching with a clear rejection message, and a review screen before submit. On-screen confirmation after either door. Rebuilt in React + Vite + Tailwind. Remains session-only (D2) and Tier 1: no database, no email, no persistence. EcoVadis route unchanged and still first. |

---

*This spec is written for Claude Code. It assumes zero prior context. Every decision, rule, and requirement must be explicit enough that the builder can hand this document to Claude Code without a single verbal explanation.*
