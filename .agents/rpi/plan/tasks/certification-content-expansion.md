# Practice Lab Certification Content Expansion

**Route:** Delegated direct  
**Baseline:** `main` / `origin/main` at `0edef68` (2026-11-26); no divergence.  
**Scope:** Expand certification question banks and study notes using existing formats. Do not add ingestion infrastructure, redesign the quiz or persistence systems, or change unrelated progress-tracking work.

## Tasks

- [x] **RPI-001 — Source review and baseline inventory**
  - Acceptance: Review available source provenance and rights; record source URLs, retrieval date/method, review state, evidence, and limitations; establish exact current bank counts; classify candidate questions against existing and candidate banks. Hold anything with unresolved rights or technical evidence.
  - Evidence: Current branch matches `origin/main`; baseline counts are CCDV-F 199, CCAO-F 60, CCAR-P 58, CCAR-F 60. The 70 CCDV-P candidates now reconcile to 42 Accept and 28 Correct; the provider-specific embedding item was corrected against Voyage documentation. The CCAO-F material contains 100 generated questions (38 Accept, 11 Correct, 1 Merge, 49 Reject—Duplicate, 1 Reject—Incorrect) and 680 SkillCertPro-derived questions held pending written redistribution permission. The 38-section TestApp cheat sheet is identified as transcribed from SkillCertPro and will not be reproduced.

- [x] **RPI-002 — CCDV-P bank and registration**
  - Acceptance: Verify the official exam guide and objective blueprint; review all 70 candidates for correctness, duplication, licensing, and educational value; add only verified, authorized items using existing types and registry discovery; preserve source attribution and IDs; test availability and compatibility.
  - Evidence: The 70 questions reconcile to 42 Accept and 28 Correct; `PDF-3.5` was corrected against Voyage documentation. The bank retains source IDs, credits Matthew Purcell under CC BY-NC 4.0, and separates official weights from the derived all-scored mock. The guide's detailed objective text was only partially retrievable; limits are recorded in the source register.

- [x] **RPI-003 — CCAO-F bank and study material**
  - Acceptance: Review all 45 selected and 663 remaining candidates, including the 72 prior duplicate exclusions; independently validate retained content and map domains; review the TestApp cheat sheet by section; publish only content with verified redistribution rights and add modular, referenced study notes.
  - Evidence: The 20 generated IDs in the prior-exclusion table are confirmed semantic duplicates; 52 excluded and 628 remaining SkillCertPro items are held because redistribution permission is unverified. A public SkillCertPro FAQ claims its questions are previous official exam questions; a similarly branded `.tech` terms page says personal use only, but its relationship to the `.com` source is unverified. The `.com` terms page could not be reviewed, so no broader legal claim is made. TestApp-author reuse permission applies to the distinct generated set. Added 49 generated questions, corrected CCAO-F weights to the November 2026 guide, and created seven modular domain notes plus a source register. The guide states 60 items and 120 minutes; the existing 50/100 Practice Lab mock remains derived.

- [x] **RPI-004 — CCDV-P study library**
  - Acceptance: Create or extend existing study content across the eight requested domains, based on the verified guide and authoritative references; document source coverage and remaining blueprint gaps; expose it through the existing study registry.
  - Evidence: Eight original domain notes and one source register are available through the existing study registry and D1–D8 section map. The practice CTA and source links pass the generated-page check; guide objective-level limits and remaining gaps are documented.

- [x] **RPI-005 — CCDV-F enrichment**
  - Acceptance: Compare the verified knowledge against existing notes and the 25-objective coverage matrix; enrich existing notes only for demonstrated gaps and preserve Foundations-level scope.
  - Evidence: The 25-competency matrix was cross-checked against the shared topics. Existing CCDV-F notes cover the Foundations-level material; Professional-only RAG/embedding details were not promoted. No CCDV-F questions were added or existing question IDs changed. The coverage matrix records this outcome.

- [x] **RPI-006 — Attribution, documentation, and verification**
  - Acceptance: Update accurate counts, attribution, study navigation, and relevant tests; verify question banks, study links, formatting/lint, type checks, relevant end-to-end flows, and production build as feasible; report source decisions, inventories, blockers, and gaps.
  - Evidence: Updated README counts and `NOTICE`; added `docs/certification-content-review.md`; final `pnpm check`, `pnpm test` (512/512), `pnpm build` (156 pages), `pnpm check:study-links` (146 pages/654 links), and targeted Chromium E2E (16/16) passed.

## Progress

- Baseline and repository instructions reviewed. The working tree also contains pre-existing staged deletions and progress-storage, migration, quiz, and page changes across `docs/`, `src/lib/progress/`, `src/pages/`, and related tests. Those changes are unrelated to this task and remain untouched; only the explicitly scoped content files will be committed.
- CCDV-P official guide Version 1.0 is effective November 2026: 70 items (60 scored, 10 unscored), 120 minutes, scaled passing score 720, and the eight requested domain weights. The CCAO-F Version 1.1 guide effective November 2026 confirms 60 items, 120 minutes, and the seven-domain blueprint. Guide excerpts were reviewed through public search indexing; direct PDF extraction was unavailable (`pdftotext` is not installed).
- The source decision reports cover all 70 CCDV-P candidates, all 100 generated CCAO-F questions, and the rights-only Hold for all 680 SkillCertPro-derived candidates. The 38 TestApp cheat-sheet sections were reviewed for gaps and current claims; no source wording will be reused.
- The final question inventory is CCDV-F 199, CCDV-P 70, CCAO-F 109, CCAR-P 58, and CCAR-F 60. The two additions total 119; no existing question IDs were changed or removed.
- The final unit suite passed 512 tests across 39 files; the static build generated 156 pages; study-link validation passed for 146 generated pages and 654 external Markdown links; targeted Chromium E2E passed 16/16.
- `pnpm check` passed. Astro check emitted 183 hints from the generated `playwright-report/trace/sw.bundle.js`; these are generated artifacts and were not modified.
- A reviewer exceeded the requested archive boundary while identifying the CCAO-F record; it did not inspect saved states or report non-target question content. Subsequent archive review was restricted to the named CCAO-F generated-question path.
- Engram mirroring is unavailable in the configured tools; this filesystem task document remains the RPI record.
- **Next:** none for the authorized content scope. Follow up only if the maintainer obtains redistribution permission for SkillCertPro material, the official guide becomes directly accessible for full objective review, or the CPQ regeneration workflow is updated to preserve the new CCAO-F additions.