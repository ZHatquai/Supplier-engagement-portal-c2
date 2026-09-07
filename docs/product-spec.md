# Product Spec — The Corporate Supplier Sustainability Portal 2026

**Version:** 3.0
**Date:** 7 September 2026
**Author:** Zyad Hatquai
**Status:** Confirmed

---

## Section 1 — Tool Summary

**Tool name:** The Corporate Supplier Sustainability Portal 2026

**What it does:** A public portal that onboards Tier 1 suppliers into The Corporate's ESRS-aligned sustainability assessment. Suppliers choose one of two routes from the landing page — Submit an EcoVadis Scorecard, or Complete the Questionnaire (inside the portal via a guided wizard, or by downloading, completing offline, and uploading the workbook). Each route now opens with its own company and contact capture step before anything else, and every completed submission is written to a database so The Corporate can retrieve and review it.

**Who uses it:** Tier 1 supplier contacts (sustainability managers, EHS leads, and procurement representatives at supplier organisations) who receive the URL directly from The Corporate's procurement or EHS team.

**Why it exists:** v2.0 proved the in-portal submission mechanics (guided entry, file upload, parsing, review, confirmation) but was session-only — nothing was retained, and neither route captured who the supplier actually was. This version adds persistence so The Corporate can retain and review submissions, and adds identity capture (company and contact details) to both routes so a stored submission is actually attributable.

**Build status:** Iteration. v2.0 (10 July 2026) was Tier 1 — React, session-only (D2), public (A1), no company/contact capture on either route. This build (v3.0) adds a Supabase database (moving to Tier 2 / D3), a company-and-contact capture step as the opening step of each route, an EcoVadis scorecard link field on the EcoVadis route, removes Section 1 (S1) from the questionnaire workbook entirely (edited directly by the builder before this build), and introduces submission status logic (`active` / `superseded` / `needs_review`) to handle duplicate and cross-route submissions.

---

## Section 2 — Classification

### Data Model

**Decision:** D3

| Label | What it means | This tool? |
|-------|--------------|-----------|
| D1 — Hardcoded | All data is written into the code by the developer. Users cannot input anything that persists. | No |
| D2 — Session | Data enters during use and disappears when the tab closes. No database. | No |
| D3 — Persisted | Data is written to a database and survives after the session ends. Supabase is required. | Yes |

**Reason:** Submissions must be retrievable by The Corporate after the supplier's session ends, and the same company's submissions across both routes and over time must be comparable against each other (duplicate detection, EcoVadis-supersedes-Questionnaire logic).

**D3 is triggered by:**
- [x] Data must be retrievable after the session ends
- [x] Multiple sessions contribute to the same dataset (repeat/duplicate submissions per company)
- [ ] An audit trail or history is needed
- [x] Data submitted by one person must be visible to another (EHS manager reviewing supplier submissions)
- [ ] Results must be accessible via a URL after the session ends
- [ ] Files uploaded by users must be stored and retrievable later (Door 2's uploaded file is still discarded after parsing — unchanged from v2.0)

---

### Access Model

**Decision:** A1

| Label | What it means | This tool? |
|-------|--------------|-----------|
| A1 — Public | Anyone with the URL can use it. No login, no account required. | Yes |
| A2 — Authentication | Users must log in, all logged-in users see the same thing. | No |
| A3 — Authorization | Users must log in with different roles and permissions. | No |

**Reason:** The portal remains a public link distributed directly to Tier 1 suppliers. No login exists in this build. Login is planned for a later build (to support the internal review dashboard) but is explicitly out of scope here — this version proves the persistence layer first.

> **Promotion rule:** Not applicable — this tool is A1, no promotion to D3 via auth is occurring. D3 here is triggered directly by the persistence requirements above, independent of access model.

---

### Tier

**Tier:** 2

| Tier | D+A combination | Stack | Deployment |
|------|----------------|-------|------------|
| 1 | D1+A1 or D2+A1 | Netlify only | Netlify |
| 2 | D3+A1 | Netlify + Supabase (no auth) | Netlify |
| 3 | D3+A2 or D3+A3 | Netlify + Supabase (auth + RLS) | Netlify |

---

### Standalone or Stack

**This tool is:** Standalone. It gets its own dedicated Supabase project, not shared with any other build.

> When the internal review dashboard is built (planned, not scheduled), it will need login/auth for the EHS manager and will form a stack with this tool, sharing this same Supabase project. That is out of scope here (see Section 12).

---

## Section 3 — Arms

> Document search and AI knowledge bases are outside this framework version. Not applicable to this tool.

### AI API Arm
**Active:** No — no AI processing anywhere in this tool.

### Export Arm
**Active:** Yes

| Detail | Answer |
|--------|--------|
| Format | XLSX |
| What is exported | The_Corporate_Supplier_Questionnaire_2026.xlsx, served as a static asset, unchanged from v2.0 except that Section 1 (S1) has been removed from the workbook itself by the builder before this build. Door 2 suppliers download it, complete it offline, and upload it back for parsing. |
| PDF design intent | N/A — XLSX only |

### Email Arm
**Active:** No — no automated emails in this build. Confirmed unchanged from v2.0: on-screen confirmation only.

### Scheduled Automation Arm
**Active:** No

---

## Section 4 — Stack and Deployment

### All Tiers

| Detail | Answer |
|--------|--------|
| Frontend framework | React + Vite + Tailwind (existing v2.0 stack, unchanged) |
| Deployment target | Netlify |
| Netlify MCP | Not active — deployment is manual/automatic via the existing GitHub → Netlify connection (push to main triggers autodeploy, same as v2.0) |

**GitHub:** Existing repo from v2.0 continues to be used. product-spec.md (this v3.0), CLAUDE.md, and PROGRESS.md must be updated/uploaded to the repo root before this build session opens.

---

### Supabase project — Tier 2

**Supabase project status:** New — Claude Code creates it via MCP at the start of this build session.

**Supabase plan:** Free (pauses after roughly a week of no traffic — acceptable for now; revisit if the tool goes into steady live use).

| Detail | Answer |
|--------|--------|
| Confirmed project name | **The corporate live build (New)** — builder has confirmed this exact name, do not alter it |

> Claude Code pauses at the start of the session, confirms this project name with the builder, and creates the Supabase project via MCP before building anything. The project ID is recorded in `docs/supabase-setup.md` once created.

**supabase-setup.md:** Created by Claude Code at the end of this build session. Records the project name, project ID, all tables and fields, RLS policies, and the submission Netlify Function. This becomes the schema source of truth for the future internal-dashboard build (Section 2, Standalone or Stack).

---

## Section 5 — Data Architecture

**What data is collected or stored in this tool:**

| Field name | Plain language label | Data type | Who provides it | Required? |
|-----------|---------------------|-----------|----------------|-----------|
| company_name | Company name | Text | Supplier, both routes | Yes |
| contact_name | Contact full name | Text | Supplier, both routes | Yes |
| contact_email | Contact email | Text (email format validated) | Supplier, both routes | Yes |
| contact_phone | Contact phone | Text (no format validation) | Supplier, both routes | Yes |
| job_title | Job title | Text | Supplier, both routes | Yes |
| department | Department | Text (free text) | Supplier, both routes | Yes |
| ecovadis_link | EcoVadis scorecard link | Text (URL format validated) | Supplier, EcoVadis route only | Yes, EcoVadis route only |
| route | Submission route | Enum: `ecovadis` / `questionnaire` | System, set automatically | Yes |
| questionnaire_answers | Questionnaire answers (S2–S7) | JSON | Supplier, Questionnaire route only (via Door 1 wizard or Door 2 upload) | Yes, Questionnaire route only |
| status | Submission status | Enum: `active` / `superseded` / `needs_review` | System, computed at final submit | Yes |
| created_at | Submission timestamp | Timestamp | Automatic | Yes |

**Tables needed:**

| Table name | What it stores | Key fields |
|-----------|---------------|-----------|
| submissions | One row per completed submission (either route) | company_name, contact_name, contact_email, contact_phone, job_title, department, route, ecovadis_link, questionnaire_answers, status, created_at |

**File storage:** No. The uploaded Door 2 file continues to be parsed client-side and discarded after parsing — unchanged from v2.0. Nothing about the file itself is stored, only the parsed answers.

**Derived or calculated data:** Yes — the `status` field is computed at final submit based on duplicate-detection logic. See Section 9.

---

## Section 6 — Access and Permissions

### Not applicable — Access Model is A1

No user accounts exist in this build. The RLS section below still applies to the `submissions` table even without auth, since the table holds personal data and must not be openly readable or writable by anonymous clients.

**RLS rules — who can read and write what:**

| Table | User type | Can read | Can insert | Can update | Can delete |
|-------|----------|----------|------------|------------|------------|
| submissions | Unauthenticated (anon) | No | No | No | No |

> **Design decision — confirm before build (see Section 15, Open Questions):** All reads and writes to `submissions` happen through a server-side Netlify Function using the Supabase service role key, which bypasses RLS entirely. The anon (browser) client never talks to the `submissions` table directly. This is necessary because the duplicate check at final submit requires reading existing rows by company name, and giving the public anon role SELECT access to `submissions` would let any supplier query and see every other supplier's company and contact data. This is the recommended default; flag before build if a different approach is preferred.

---

## Section 7 — GDPR

**GDPR outcome:** Applies — personal data is collected through the tool's forms on both routes.

**Personal data collected:** company_name, contact_name, contact_email, contact_phone, job_title, department.

**Consent checkpoint on the form:** Yes.
- EcoVadis route: consent checkbox sits on the single capture screen, directly above the "Submit and Go to EcoVadis" button.
- Questionnaire route: consent checkbox sits on the existing review/confirmation screen, immediately before final submit (unchanged position from where consent already lived in the Door 1 / Door 2 flow).

**Data statement text shown to users at the point of collection:**
> "Your data will be stored securely and used only to process and review your company's sustainability assessment submission for The Corporate's supplier program. You can request deletion at any time by contacting [EHS contact email — the existing Contact EHS mailto address from the landing page]."

**Deletion mechanism:** Supplier emails the existing Contact EHS address (already present on the landing page in v2.0). The Corporate manually locates and deletes the row(s) via the Supabase table editor — no automated deletion flow exists in this build.

> Data is retained indefinitely unless deletion is specifically requested.

---

## Section 8 — Screen and UI Structure

### Landing Page
- **Purpose:** Entry point, unchanged from v2.0.
- **What is visible:** Hero, stats, "Why We Are Asking," Two Routes cards (EcoVadis / Questionnaire), "What Happens Next," Key Resources, footer.
- **User actions:** Click "Submit EcoVadis Scorecard" or "Complete the Questionnaire."
- **What happens next:** EcoVadis → EcoVadis Capture screen. Questionnaire → Questionnaire Capture screen.

### EcoVadis Capture Screen (new)
- **Purpose:** Collect company/contact identity and the EcoVadis scorecard link, then hand off to EcoVadis.
- **What is visible:** Company name, contact name, email, phone, job title, department fields (all required); EcoVadis scorecard link field (required, URL-validated); consent checkbox and data statement; single "Submit and Go to EcoVadis" button.
- **User actions:** Fill all fields, check consent, click submit.
- **What happens next:** On click — duplicate check runs, the row is written to `submissions` with `route = ecovadis` and the computed status (see Section 9), and the browser redirects to ecovadis.com in a new tab. The portal tab stays open. No separate confirmation screen — the redirect to EcoVadis is the confirmation.

### Questionnaire Capture Screen (new)
- **Purpose:** Collect company/contact identity before the supplier chooses how to complete the questionnaire.
- **What is visible:** Company name, contact name, email, phone, job title, department fields (all required). No consent checkbox here — consent lives later, at final submit.
- **User actions:** Fill all fields, click continue.
- **What happens next:** Values are held in session state (not yet written to Supabase) and carried forward through Door Selection, whichever door is chosen, and into the final review/confirmation screen.

### Door Selection
- **Purpose:** Unchanged from v2.0 — choose between Door 1 (guided wizard) and Door 2 (download/upload).
- **What is visible:** Two option cards, back path to Landing.
- **User actions:** Choose a door.
- **What happens next:** Door 1 wizard or Door 2 upload flow.

### Door 1 — Guided Wizard
- **Purpose:** Section-by-section questionnaire entry, now starting at S2 (S1 no longer exists in the workbook or the wizard).
- **What is visible:** S2 through S7, fields/types/dropdowns/units/required markers derived from the S1-free workbook.
- **User actions:** Fill each section, advance, cannot advance with invalid/missing required fields.
- **What happens next:** Review/Confirmation screen.

### Door 2 — Download / Upload
- **Purpose:** Offline completion and upload, now against the S1-free workbook.
- **What is visible:** Download button, upload control, Review screen (parsed answers by section) or Rejection screen (structural mismatch).
- **User actions:** Download, complete offline, upload, review.
- **What happens next:** Review → Confirmation on submit; a structurally non-matching file → Rejection, does not proceed.

### Review / Confirmation Screen (Door 1 and Door 2 shared)
- **Purpose:** Final review and submit for the Questionnaire route.
- **What is visible:** Summarised answers by section (S2–S7), consent checkbox and data statement, submit button. If a duplicate is detected, a warning is shown here (see Section 9) with the option to proceed anyway.
- **User actions:** Review, check consent, submit (or proceed past the duplicate warning).
- **What happens next:** On submit — duplicate check runs, the row is written to `submissions` with `route = questionnaire` and the computed status, on-screen confirmation is shown. States clearly that no email is sent; closing the tab clears the session (nothing left client-side, since the record is already written).

---

## Section 9 — Logic and Calculations

**What is calculated:** Submission status, assigned at the moment of final submit on either route.

**Inputs:** The new submission's `company_name` and `route`, plus the set of existing rows in `submissions` for the same `company_name` (case-insensitive match) with `status = active`.

**Rules:**
1. **No existing active submission for this company** → new row is written with `status = active`. No warning shown.
2. **Existing active submission for this company, different route (cross-rank):** EcoVadis always outranks Questionnaire, regardless of which came first.
   - If the existing active row is `ecovadis` and the new submission is `questionnaire` → new row written as `superseded` immediately. Existing `ecovadis` row stays `active`.
   - If the existing active row is `questionnaire` and the new submission is `ecovadis` → new row written as `active`. Existing `questionnaire` row is updated to `superseded`.
   - In both cases, the supplier sees a warning before submitting ("a submission already exists for this company") but can proceed regardless — this is "warn but allow," not a hard block.
3. **Existing active submission for this company, same route (same-rank):** e.g. two Questionnaire submissions, or two EcoVadis submissions, for the same company. Both the existing row and the new row are set to `status = needs_review`. Neither is treated as authoritative. The supplier sees the same warning and can proceed.
4. **Duplicate check and status write happen server-side, atomically**, in the same Netlify Function call that performs the insert (see Section 6) — the check and the write cannot be separated into two round-trips from the browser, to avoid a race condition between two suppliers submitting for the same company at nearly the same time.

**Output:** The written row's `status` field (`active`, `superseded`, or `needs_review`), and any existing row's status updated to `superseded` where rule 2 applies.

**Edge cases:**
- A company's very first submission, either route: always `active`, no check needed beyond confirming no prior active row exists.
- `needs_review` rows are not automatically resolved anywhere in this build. Resolving them means the EHS manager opens the Supabase table editor directly and manually changes the status to `active` or `superseded`. This is explicit and temporary — it will be replaced by the internal review dashboard in a future build (Section 12).

---

## Section 10 — Brand and Visual Direction

**Brand reference:** the-corporate-brand skill, already installed at `.claude/skills/the-corporate-brand/SKILL.md` from v2.0. Unchanged. Apply to all new screens (both capture screens) exactly as it applies to the existing ones.

**Visual feel:** Professional and corporate, unchanged from v2.0.

**Reference or inspiration:** The existing v2.0 build (same site).

---

## Section 11 — API and Credentials

| Service | What it does in this tool | Key required | Where key is stored |
|---------|--------------------------|-------------|-------------------|
| Supabase | Database for `submissions` | Service role key (server-side only, used by the Netlify Function); anon key not used by this tool since the frontend never talks to Supabase directly | Netlify environment variable |

> **Security rule:** No API key, token, or credential may appear in any HTML, JavaScript, or file committed to GitHub. The Supabase service role key is stored as a Netlify environment variable and used only inside the server-side submission Netlify Function — never exposed to the browser.

**Credentials readiness:**

| Credential | Status | Where to get it |
|-----------|--------|----------------|
| Supabase service role key | Created by Claude Code with the new project | Supabase dashboard → Project Settings → API, after project creation |

Nothing else to prepare before the build session — no other external services.

---

## Section 12 — Out of Scope — Phase 2

| Deferred feature | Reason it is deferred |
|-----------------|----------------------|
| Supplier login and saved progress | Would move the tool to Tier 3. Not needed to validate persistence first. |
| Internal review dashboard for EHS/procurement | Needs its own login/auth and forms a stack with this tool once built. Planned separately. |
| Automated resolution of `needs_review` rows | Requires the internal dashboard. For now, resolved manually via the Supabase table editor. |
| Submission tracker / non-responder tracking / supplier roster | Needs a pre-loaded roster table, not currently planned. |
| Automated email notification or confirmation | Explicitly not built — on-screen confirmation (Questionnaire route) or redirect to EcoVadis (EcoVadis route) only. |
| Automated EcoVadis scorecard validation | Requires EcoVadis API access; the link is captured but not verified. |
| The original S1 EcoVadis-bypass dropdown and its logic | Fully retired — the workbook has been edited to remove S1 entirely; the landing-page route split now covers what the bypass used to handle. |
| Retaining the uploaded Door 2 file itself | Still parsed and discarded, unchanged from v2.0. |

---

## Section 13 — Acceptance Criteria

| # | What to verify | Expected result | Done? |
|---|---------------|-----------------|-------|
| 1 | Landing page unchanged | Renders identically to v2.0, both route cards present | [ ] |
| 2 | EcoVadis Capture screen renders and validates | All six identity fields plus scorecard link required; email and link fields format-validated; phone has no format check; consent checkbox required before submit | [ ] |
| 3 | EcoVadis submit writes and redirects in one action | Clicking "Submit and Go to EcoVadis" writes a row to `submissions` (route=ecovadis) and opens ecovadis.com in a new tab; portal tab stays open | [ ] |
| 4 | Questionnaire Capture screen appears before Door Selection | Clicking "Complete the Questionnaire" shows the six-field capture screen first, then Door Selection | [ ] |
| 5 | Questionnaire Capture fields carry through both doors | Values entered on the capture screen appear correctly in the final Review/Confirmation regardless of Door 1 or Door 2 | [ ] |
| 6 | Door 1 wizard starts at S2 | No S1 section appears anywhere in the guided wizard | [ ] |
| 7 | Door 2 parser matches the S1-free workbook | Download produces the S1-free file; a matching upload parses correctly with no S1 references anywhere | [ ] |
| 8 | Questionnaire consent checkbox blocks submission | Final submit is blocked until the consent checkbox is checked | [ ] |
| 9 | First-time submission per company is always `active` | A company with no prior active submission gets `status = active` on first submit, either route | [ ] |
| 10 | Cross-route duplicate resolves per rank | EcoVadis-after-Questionnaire: new row active, old row flips to superseded. Questionnaire-after-EcoVadis: new row superseded, old row stays active | [ ] |
| 11 | Same-route duplicate sets both rows to needs_review | Two Questionnaire (or two EcoVadis) submissions for the same company both end up `needs_review` | [ ] |
| 12 | Duplicate warning is "warn but allow" | Supplier sees a warning when a duplicate is detected but can still proceed and submit | [ ] |
| 13 | No direct anon access to `submissions` | RLS denies all read/write to the anon role; all writes go through the Netlify Function using the service role key; verified via browser dev tools that no client-side Supabase call touches `submissions` directly | [ ] |
| 14 | Supabase project created correctly | Project named exactly "The corporate live build (New)" on the Free plan, created via MCP at build session start | [ ] |
| 15 | Brand applied to new screens | Both capture screens match the-corporate-brand skill — fonts, palette, square corners, Acid Lime rule | [ ] |
| 16 | Fully responsive on mobile | Both new capture screens usable below 768px, no horizontal overflow | [ ] |
| 17 | Tool deploys to Netlify | Live URL loads on desktop and mobile via the existing GitHub → Netlify autodeploy connection | [ ] |

---

## Section 14 — Build Path

**This tool's tier:** Tier 2

### Pre-build steps — complete before opening Claude Code

- [ ] Tool Architect skill — interview complete, this spec written and confirmed
- [ ] Project Governor skill — CLAUDE.md and PROGRESS.md produced from this spec
- [ ] Existing GitHub repo used (same repo as v2.0)
- [ ] product-spec.md (this v3.0) uploaded to the repo root, replacing v2.0
- [ ] CLAUDE.md and PROGRESS.md updated and uploaded to the repo root
- [ ] the-corporate-brand skill file already present — no change needed
- [ ] **The_Corporate_Supplier_Questionnaire_2026.xlsx edited by the builder to remove Section 1 (S1) entirely, and placed in the repo's static assets folder, before this build session begins**
- [ ] Netlify connected to the GitHub repo (already true from v2.0)
- [ ] No credentials to prepare — Claude Code creates the Supabase service role key with the new project

### Tier 2 — build session

- [ ] Open Claude Code in the project folder
- [ ] Claude Code runs Session Protocol: pulls latest, reads product-spec.md/CLAUDE.md/PROGRESS.md
- [ ] Claude Code proposes the Supabase project name "The corporate live build (New)", waits for confirmation, creates it via Supabase MCP
- [ ] Claude Code builds the `submissions` table and RLS policies (deny-all to anon) via Supabase MCP
- [ ] Claude Code creates `docs/supabase-setup.md`
- [ ] Claude Code builds the server-side Netlify Function (duplicate check + status logic + insert, using the service role key)
- [ ] Claude Code builds the two new capture screens and wires them into the existing flow ahead of Door Selection / EcoVadis redirect
- [ ] Claude Code removes S1 from Door 1's wizard and re-derives the field schema and Door 2's parser from the now-S1-free workbook
- [ ] Claude Code adds the GDPR consent checkbox and data statement to both routes at their respective points
- [ ] Test locally, including the duplicate/status scenarios in Section 13, before deploying
- [ ] Push to main → Netlify autodeploys (Netlify MCP not active)
- [ ] Add the Supabase service role key as a Netlify environment variable manually

---

## Section 15 — Open Questions

| Question | Who answers it | Blocking? |
|----------|---------------|-----------|
| Confirm the RLS/Netlify-Function design in Section 6 — anon role has zero direct access to `submissions`, all reads/writes go through a server-side Netlify Function using the service role key. This is the Tool Architect's recommended default for a public form storing personal data, not something explicitly specified in the interview. | Builder | No — Claude Code can proceed with this default unless told otherwise before the build session |
| Confirm The_Corporate_Supplier_Questionnaire_2026.xlsx has been edited to remove S1 and is in its final form | Builder | Yes — must be done before the build session begins |
| Deployed URL for this version | Builder | No — confirmed after deployment |

---

## Section 16 — Tool Version History

| Version | Date | What changed in the tool |
|---------|------|--------------------------|
| v1.0 | 12 June 2026 | Retroactive spec of the original static landing page routing suppliers to EcoVadis or an Excel download returned by email. |
| v2.0 | 10 July 2026 | Added in-browser questionnaire submission: Door 1 guided wizard, Door 2 download/upload/parse/review. Rebuilt in React + Vite + Tailwind. Remained session-only (D2), Tier 1, no database. |
| v3.0 | 7 September 2026 | Added Supabase persistence (D2 → D3, Tier 1 → Tier 2, new dedicated project "The corporate live build (New)"). Added a company/contact capture step as the opening step of each route (EcoVadis and Questionnaire). Added an EcoVadis scorecard link field to the EcoVadis route. Removed Section 1 (S1) from the questionnaire workbook entirely, including its EcoVadis-bypass dropdown, now retired. Added submission status logic (`active` / `superseded` / `needs_review`) governing cross-route and same-route duplicate submissions. Added GDPR consent checkpoints and data statement to both routes. RLS locks the `submissions` table to a server-side Netlify Function only — no direct anon access. |

---

*This spec is written for Claude Code. It assumes zero prior context. Every decision, rule, and requirement must be explicit enough that the builder can hand this document to Claude Code without a single verbal explanation.*
