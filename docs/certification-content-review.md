# Certification Content Review

**Review date:** 2026-11-26  
**Repository baseline:** `main` and `origin/main` at `0edef68`  
**Purpose:** Record source provenance, candidate decisions, licensing boundaries, and source-driven study gaps. This file contains original review notes and metadata only; it does not reproduce source question text or cheat-sheet prose.

## Source review record

| Source                                                                                                                                                         | Scope reviewed                                                                                                        | Date and method                                                                                                      | Status, evidence, and limitation                                                                                                                                                                                                                                                                                                                                                                               |
| -------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `ccdv-p-questions-to-add.md`                                                                                                                                   | All 70 candidate IDs, supplied answers, explanations, scenarios, and editorial notes                                  | 2026-11-26; local Markdown inspected and compared with current bank and public official-guide/documentation excerpts | Candidate text reviewed. The attached `1795240956097.pdf` was not reopened; its provided Markdown transcription was used. Source metadata identifies Matthew Purcell and CC BY-NC 4.0. The author post was discovered; access to its attached source material was not independently verified.                                                                                                                  |
| [CCDV-P Exam Guide v1.0](https://cc.sj-cdn.net/instructor/6nizmqk8tpzpfjvt6qmmav7rh/public/1794947325/Claude_Certified_Developer-Professional_Exam_Guide.pdf)  | Exam duration, item/scored counts, scaled passing score, domain titles and weights                                    | 2026-11-26; public search-index excerpts                                                                             | Partial. Excerpts support recorded facts; direct PDF extraction was unavailable. Detailed objective text remains unverified.                                                                                                                                                                                                                                                                                   |
| `ccao-f-testapp-questions-to-add.md`                                                                                                                           | All 45 generated candidates and source permission/provenance notes                                                    | 2026-11-26; local Markdown; compared with current CCAO-F bank and November guide excerpts                            | Content reviewed. The linked [generated question PDF](https://drive.google.com/file/d/1v0ZBWPXIIMSE9u48_WdZ7hg7mFCuFufh/view) returned HTTP 400. Maintainer confirms reuse permission from the TestApp author, whose name was not supplied.                                                                                                                                                                    |
| `ccao-f-testapp-remaining-candidates.md`                                                                                                                       | All 35 generated candidate texts, 20 generated IDs from prior exclusions, and rights/provenance for the remaining set | 2026-11-26; local Markdown; generated questions compared with current bank and guide excerpts                        | Generated items reviewed. SkillCertPro question text was not used. The file identifies 628 remaining and 52 excluded SkillCertPro items; all 680 are held because redistribution rights are unverified and the publisher claims its questions are previous official exam questions.                                                                                                                            |
| `TestApp-v0.0.3.zip`                                                                                                                                           | `START-HERE.txt` provenance/counts and the 38-section CCAO-F Master Cheat Sheet                                       | 2026-11-26; archive metadata read and delegated section/topic review                                                 | Package metadata distinguishes 680 SkillCertPro questions, 100 generated questions, and one Google Cloud item. No saved progress or answer history was read. A reviewer exceeded the requested catalog boundary by enumerating other catalog entries while locating CCAO-F; no non-CCAO content was reported or used. Treat the cheat-sheet review as partial for provenance assurance. No wording was reused. |
| [CCAO-F Exam Guide v1.1](https://cc.sj-cdn.net/instructor/6nizmqk8tpzpfjvt6qmmav7rh/public/1794946524/Claude_Certified_Associate_-_Foundations_Exam_Guide.pdf) | Seven domain names/weights, 60 items, 120 minutes, scaled passing score                                               | 2026-11-26; public search-index excerpts                                                                             | Partial. This November version applies; the December 7, 2026 revision is future-dated and was not used. Direct PDF extraction failed at response metadata; detailed objective text beyond excerpts remains unverified.                                                                                                                                                                                         |
| [SkillCertPro terms](https://skillcertpro.com/terms-conditions) and [FAQ](https://skillcertpro.com/faq)                                                        | Publicly indexed rights and source claims                                                                             | 2026-11-26; search snippets and direct-page fetch attempt                                                            | FAQ snippet claims the questions are from prior official exams. The `.com` terms page could not be reviewed, so no permission or license grant was confirmed. A separate [`.tech` terms page](https://skillcertpro.tech/terms-conditions) says personal use only, but its relationship to the `.com` source is unverified. All 680 SkillCertPro items remain unpublished.                                      |
| Anthropic, Claude Code, MCP, Voyage, and general engineering documentation                                                                                     | Targeted facts used to validate items and plan original study synthesis                                               | 2026-11-24 to 2026-11-26; public official documentation, indexed excerpts, and the existing CCDV-F source register   | Partial, targeted review; no exhaustive crawl. Dynamic model, plan, product, rate-limit, and API details need rechecking before operational use. See [Technical references](#technical-references).                                                                                                                                                                                                            |

Candidate input filenames above refer to maintainer-provided local files, not public distribution links. The original source documents remain outside the application bundle.

## Non-overlapping candidate inventory

The table partitions 70 CCDV-P items and 780 CCAO-F items. The TestApp ZIP, generated PDF, and cheat sheet overlap these question sets and are not double-counted.

| Candidate segment                                | Reviewed | Accept | Correct | Merge | Reject — Duplicate | Reject — Incorrect | Hold — Unverified |
| ------------------------------------------------ | -------: | -----: | ------: | ----: | -----------------: | -----------------: | ----------------: |
| CCDV-P Markdown candidates                       |       70 |     42 |      28 |     0 |                  0 |                  0 |                 0 |
| CCAO-F selected generated questions              |       45 |     27 |       4 |     1 |                 13 |                  0 |                 0 |
| CCAO-F remaining generated questions             |       35 |     11 |       7 |     0 |                 16 |                  1 |                 0 |
| CCAO-F remaining SkillCertPro questions          |      628 |      0 |       0 |     0 |                  0 |                  0 |               628 |
| CCAO-F previously excluded generated variants    |       20 |      0 |       0 |     0 |                 20 |                  0 |                 0 |
| CCAO-F previously excluded SkillCertPro variants |       52 |      0 |       0 |     0 |                  0 |                  0 |                52 |
| **Total**                                        |  **850** | **80** |  **39** | **1** |             **49** |              **1** |           **680** |

The first CCDV-P summary said 41 Accept and 28 Correct. Its per-ID table reconciled to 42 Accept, 27 Correct, and 1 Hold—Unverified. After verifying and correcting the provider-specific Voyage embedding item, final outcomes are 42 Accept and 28 Correct; all 70 IDs appear below. CCAO-F outcomes are 38 Accept, 11 Correct, 1 Merge, 49 Reject—Duplicate, and 1 Reject—Incorrect. The other 680 CCAO-F candidates are held for rights/provenance and are not technically endorsed.

## CCDV-P per-question decisions

The 70 retained items preserve source IDs. `Correct` items are included with the correction shown; no item was rejected as a duplicate or out of scope.

| Source ID  | Decision | Rationale or correction                                                                                                       |
| ---------- | -------- | ----------------------------------------------------------------------------------------------------------------------------- |
| `PDF-1.1`  | Correct  | Pass identity as trusted, harness-validated state, not model-generated text.                                                  |
| `PDF-1.2`  | Accept   | Deterministic known-incident lookup fits the predictable high-volume path.                                                    |
| `PDF-1.3`  | Accept   | Durable external state plus re-reading mutable balances addresses restarts/stale context.                                     |
| `PDF-1.4`  | Accept   | Programmatic tool calling and deterministic code suit exact aggregation.                                                      |
| `PDF-1.5`  | Accept   | Reviewer reasoning and bounded retry preserve human authority.                                                                |
| `PDF-1.6`  | Correct  | Streaming prevents idle timeout only if events arrive before proxy deadlines; handle partial streams/timeouts.                |
| `PDF-1.7`  | Accept   | Aggregate intent anomalies provide timely signals without transcript review.                                                  |
| `PDF-1.8`  | Accept   | Short output targets generation latency; batching is not interactive.                                                         |
| `PDF-2.1`  | Correct  | Central seat allocation must be atomic and handle offer expiry.                                                               |
| `PDF-2.2`  | Accept   | One owner for passenger-facing messages can reconcile specialist updates.                                                     |
| `PDF-2.3`  | Accept   | Recheck availability after resume because holds/offers can expire.                                                            |
| `PDF-2.4`  | Correct  | Group approval applies only if policy permits bounded group authorization.                                                    |
| `PDF-2.5`  | Correct  | Compensation depends on provider support; add idempotency and reconcile uncertain outcomes.                                   |
| `PDF-2.6`  | Correct  | Share limiter/cache state, but revalidate inventory before booking.                                                           |
| `PDF-2.7`  | Accept   | Event invalidation plus validation at booking addresses stale availability.                                                   |
| `PDF-2.8`  | Accept   | Tools enforce entitlements against the system of record, not user claims.                                                     |
| `PDF-3.1`  | Accept   | Query rewriting supplies the missing subject needed for retrieval.                                                            |
| `PDF-3.2`  | Accept   | Small retrieval chunks can be expanded with enclosing sections to preserve exceptions.                                        |
| `PDF-3.3`  | Accept   | Thresholds/abstention are useful when calibrated against labeled retrieval evaluations.                                       |
| `PDF-3.4`  | Correct  | Verify each citation supports its claim; a citation alone is insufficient.                                                    |
| `PDF-3.5`  | Correct  | Name Voyage; use `input_type=query` for member questions and `document` for indexed passages. This mode is provider-specific. |
| `PDF-3.6`  | Accept   | Evaluate a replacement index before an atomic switch to retain consistency and rollback.                                      |
| `PDF-3.7`  | Accept   | Retrieval scores and declines can reveal content gaps by topic.                                                               |
| `PDF-3.8`  | Accept   | Stale answers without retrieval/model calls suggest a harness cache that needs index versioning.                              |
| `PDF-4.1`  | Accept   | Canary repositories and staged waves reduce blast radius/reviewer load.                                                       |
| `PDF-4.2`  | Accept   | Dedicated bot identity and run attribution improve auditability.                                                              |
| `PDF-4.3`  | Correct  | Enforce provider/region restrictions outside user-overridable settings where required.                                        |
| `PDF-4.4`  | Accept   | Release notes use merged/reverted records and release-time feature-flag state.                                                |
| `PDF-4.5`  | Correct  | Auto-merge only eligible changes after CI/security checks and with rollback.                                                  |
| `PDF-4.6`  | Accept   | Verified build/test instructions reduce repeated command discovery.                                                           |
| `PDF-4.7`  | Correct  | Sampling cannot replace required per-PR human review without policy approval.                                                 |
| `PDF-4.8`  | Accept   | Separate untrusted-input agent work from signing/publishing credentials.                                                      |
| `PDF-4.9`  | Correct  | Cover shell/all mutation paths; enforce code-owner approval through branch protection.                                        |
| `PDF-5.1`  | Accept   | Cache stable prompt prefixes when reuse supports it.                                                                          |
| `PDF-5.2`  | Correct  | Hash every output-affecting input, including prompt, model version, and relevant configuration.                               |
| `PDF-5.3`  | Correct  | Parallelism reduces elapsed time only when capacity exists; estimates are approximate.                                        |
| `PDF-5.4`  | Correct  | Structured output may refuse/truncate; inspect stop reason and preserve valid prior output.                                   |
| `PDF-5.5`  | Correct  | Use validated conflict detection and fail closed; do not rely on an LLM flag alone.                                           |
| `PDF-5.6`  | Correct  | One small result difference does not establish noise; use repeated paired data or state insufficient evidence.                |
| `PDF-5.7`  | Accept   | Per-conversation tail latency can reveal expensive sessions hidden by averages.                                               |
| `PDF-6.1`  | Correct  | Compare the same weighted agreement statistic; human agreement is a benchmark, not a hard ceiling.                            |
| `PDF-6.2`  | Accept   | Poor examples and human-rated samples test judge discrimination/calibration.                                                  |
| `PDF-6.3`  | Accept   | Repeated paired runs distinguish prompt effects from run-to-run variation.                                                    |
| `PDF-6.4`  | Accept   | Cluster-aware assignment/analysis accounts for class-level interference.                                                      |
| `PDF-6.5`  | Accept   | Repeated scoring measures self-consistency separately from accuracy.                                                          |
| `PDF-6.6`  | Accept   | Per-change regression plus release gate balances feedback and coverage.                                                       |
| `PDF-6.7`  | Accept   | Sampling judgments and comparing a smaller judge against teachers can reduce cost.                                            |
| `PDF-7.1`  | Correct  | Treat uploader labels as untrusted; default in-house and use external service only after trusted classification.              |
| `PDF-7.2`  | Accept   | Pin reviewed tool definitions; this is a client control, not an MCP protocol guarantee.                                       |
| `PDF-7.3`  | Accept   | Recipient controls plus code-enforced source-data scanning constrain destination/content.                                     |
| `PDF-7.4`  | Correct  | Canary markers test known leak paths but cannot prove every path is covered.                                                  |
| `PDF-7.5`  | Correct  | A tool-less reader's summary remains untrusted; enforce downstream authorization/data-flow checks.                            |
| `PDF-7.6`  | Accept   | Repeated trials estimate stochastic attack success better than one clean run.                                                 |
| `PDF-8.1`  | Accept   | Groundedness/rephrasing/expert samples are timely proxies while outcomes are delayed/confounded.                              |
| `PDF-8.2`  | Accept   | Seasonal error rates are more informative than absolute counts when workload changes.                                         |
| `PDF-8.3`  | Correct  | Cap and redact payload capture to control privacy and cost.                                                                   |
| `PDF-8.4`  | Correct  | Pseudonymization is not anonymization; protect mapping and retention.                                                         |
| `PDF-8.5`  | Correct  | Name an Anthropic Skills-capable runtime or describe equivalent progressive retrieval.                                        |
| `PDF-8.6`  | Correct  | Replay restores captured inputs/tool results, not identical model output; redact traces and record versions.                  |
| `PDF-9.1`  | Correct  | Hold role-requirement snapshots constant and repeat because outputs are stochastic.                                           |
| `PDF-9.2`  | Accept   | Gradual changes in one-record-at-a-time requirements data fit the observed decline.                                           |
| `PDF-9.3`  | Accept   | Separate mandatory and preferred fields in the tool schema.                                                                   |
| `PDF-9.4`  | Accept   | Log-scoped reassessment targets likely harm without reprocessing unrelated cases.                                             |
| `PDF-9.5`  | Accept   | Monitor recommendation and input distributions to reveal behavior/upstream shifts.                                            |
| `PDF-9.6`  | Correct  | Counterfactual pairs test only examined conditions; do not claim universal fairness proof.                                    |
| `PDF-10.1` | Accept   | Feature inventory, platform evaluation, and gradual rollout address parity/migration risks.                                   |
| `PDF-10.2` | Accept   | Bound optional MCP connection attempts and degrade gracefully.                                                                |
| `PDF-10.3` | Accept   | Measure peak demand and confirm target capacity; quotas vary by account/platform.                                             |
| `PDF-10.4` | Correct  | Test paraphrases/false negatives and provide a safe human fallback.                                                           |
| `PDF-10.5` | Accept   | Measure cost per completed outcome; fewer tool round trips can lower overhead.                                                |

## CCAO-F generated-question decisions

The 100-item generated set is separate from the 680 SkillCertPro items. `claude-generated-023` is merged into `-014`, not added separately.

### Accept — 38 IDs

`claude-generated-002`, `005`, `009`, `010`, `011`, `024`, `025`, `026`, `027`, `029`, `030`, `032`, `033`, `034`, `035`, `037`, `038`, `041`, `044`, `046`, `048`, `052`, `058`, `061`, `062`, `063`, `067`, `069`, `073`, `080`, `081`, `083`, `087`, `090`, `094`, `097`, `098`, `099`.

These add distinct coverage for prompt/context construction, evidence checks, source-grounded answers, formula testing, qualified review, Project/connector behavior, privacy, and iterative workflow improvement. Current product constraints were checked where applicable.

### Correct — 11 IDs

| ID                     | Correction                                                                                                            |
| ---------------------- | --------------------------------------------------------------------------------------------------------------------- |
| `claude-generated-013` | Request concise criterion-by-criterion comparison, evidence, and uncertainty; do not request hidden chain-of-thought. |
| `claude-generated-014` | Reclassify to D2; merge useful structured-output detail from `-023`.                                                  |
| `claude-generated-042` | Qualify extended/adaptive thinking as model-dependent; it does not expand context or retrieve current sources.        |
| `claude-generated-045` | Reclassify to D5; use account-wide Instructions for stable preferences, with memory optional.                         |
| `claude-generated-060` | Reclassify to D6 and validate residency constraints before design.                                                    |
| `claude-generated-071` | Separate Projects and disable account memory when required; do not treat Projects as access control.                  |
| `claude-generated-072` | Replace stale custom-Styles answer with an organization-provisioned Team Skill; include policy prerequisites.         |
| `claude-generated-082` | Removing protected fields does not remove proxy bias; controlled demographic data may be needed for audits.           |
| `claude-generated-085` | U.S. fair use has no fixed percentage threshold; outcomes depend on circumstances.                                    |
| `claude-generated-095` | Public web search does not grant intranet access; use approved connectors for private sources.                        |
| `claude-generated-100` | Project/context organization can reduce repeated costs but does not guarantee savings or full reprocessing behavior.  |

### Merge and reject decisions

| ID                     | Decision           | Representative or rationale                                               |
| ---------------------- | ------------------ | ------------------------------------------------------------------------- |
| `claude-generated-023` | Merge              | Add its structured-output detail to `-014`; no separate item.             |
| `claude-generated-001` | Reject — Duplicate | `CPQ-ccaof-1.1`; prompt context/output constraints.                       |
| `claude-generated-003` | Reject — Duplicate | `CPQ-ccaof-1.2`; decompose multipart work.                                |
| `claude-generated-004` | Reject — Duplicate | `CPQ-ccaof-1.4`; divergent brainstorming.                                 |
| `claude-generated-006` | Reject — Duplicate | `CPQ-ccaof-1.6`; audience/purpose adaptation.                             |
| `claude-generated-007` | Reject — Duplicate | `CPQ-ccaof-1.3`; iterative refinement.                                    |
| `claude-generated-008` | Reject — Duplicate | `CPQ-ccaof-1.1` / `-1.5`; prompt ingredients.                             |
| `claude-generated-012` | Reject — Duplicate | `CPQ-ccaof-3.2`; current-information research.                            |
| `claude-generated-015` | Reject — Duplicate | `CPQ-ccaof-2.1`; verify precise figures.                                  |
| `claude-generated-016` | Reject — Duplicate | `CPQ-ccaof-2.5`; verify cited claims.                                     |
| `claude-generated-017` | Reject — Duplicate | `CPQ-ccaof-2.6`; source-grounded completeness.                            |
| `claude-generated-018` | Reject — Duplicate | `CPQ-ccaof-2.2`; resolve contradictions from sources.                     |
| `claude-generated-019` | Reject — Duplicate | `CPQ-ccaof-2.3`; bias in hiring language.                                 |
| `claude-generated-020` | Reject — Duplicate | `CPQ-ccaof-2.13`; qualified high-stakes review.                           |
| `claude-generated-021` | Reject — Duplicate | `CPQ-ccaof-2.7`; adapt technical content.                                 |
| `claude-generated-022` | Reject — Duplicate | `CPQ-ccaof-3.3`; select an output artifact.                               |
| `claude-generated-028` | Reject — Duplicate | `CPQ-ccaof-2.5`; validate citations.                                      |
| `claude-generated-031` | Reject — Duplicate | `CPQ-ccaof-2.12` / `-2.2`; unsupported detail/contradictions.             |
| `claude-generated-036` | Reject — Duplicate | `CPQ-ccaof-3.1`; choose a Project for shared recurring work.              |
| `claude-generated-039` | Reject — Duplicate | `CPQ-ccaof-3.5`; model fit for high-volume tasks.                         |
| `claude-generated-040` | Reject — Incorrect | Key relies on stale model-capability claims; overlaps model-fit coverage. |
| `claude-generated-043` | Reject — Duplicate | `CPQ-ccaof-7.4`; restart after long-context degradation.                  |
| `claude-generated-047` | Reject — Duplicate | `CPQ-ccaof-3.2` / `-012`; current information.                            |
| `claude-generated-049` | Reject — Duplicate | `CPQ-ccaof-4.9`; risk-based pilot.                                        |
| `claude-generated-050` | Reject — Duplicate | `CPQ-ccaof-4.9`; pilot success measures.                                  |
| `claude-generated-051` | Reject — Duplicate | `CPQ-ccaof-4.9`; pilot metrics.                                           |
| `claude-generated-053` | Reject — Duplicate | `CPQ-ccaof-4.7`; evidence and limitations.                                |
| `claude-generated-054` | Reject — Duplicate | `CPQ-ccaof-4.8`; technical integration escalation.                        |
| `claude-generated-055` | Reject — Duplicate | `CPQ-ccaof-4.2`; office-move planning.                                    |
| `claude-generated-056` | Reject — Duplicate | `CPQ-ccaof-5.3`; approved Drive connector.                                |
| `claude-generated-057` | Reject — Duplicate | `CPQ-ccaof-6.9`; human hiring decisions.                                  |
| `claude-generated-059` | Reject — Duplicate | `CPQ-ccaof-4.5` / `-4.9`; pilot baseline and outcome measures.            |
| `claude-generated-064` | Reject — Duplicate | `CPQ-ccaof-5.5`; instructions versus reference knowledge.                 |
| `claude-generated-065` | Reject — Duplicate | `CPQ-ccaof-5.6`; stale knowledge review.                                  |
| `claude-generated-066` | Reject — Duplicate | `CPQ-ccaof-5.6`; conflicting Project knowledge.                           |
| `claude-generated-068` | Reject — Duplicate | `CPQ-ccaof-5.3`; connector over stale file copies.                        |
| `claude-generated-070` | Reject — Duplicate | `CPQ-ccaof-5.4`; actionable Project instructions.                         |
| `claude-generated-074` | Reject — Duplicate | `CPQ-ccaof-5.2`; curate Project knowledge.                                |
| `claude-generated-075` | Reject — Duplicate | `CPQ-ccaof-5.5`; instructions versus documents.                           |
| `claude-generated-076` | Reject — Duplicate | `CPQ-ccaof-6.3` / `-6.2`; permitted health-data handling.                 |
| `claude-generated-077` | Reject — Duplicate | `CPQ-ccaof-6.4`; avoid unsanctioned personal accounts for company data.   |
| `claude-generated-078` | Reject — Duplicate | `CPQ-ccaof-6.1` / `-6.9`; human review for consequential use.             |
| `claude-generated-079` | Reject — Duplicate | `CPQ-ccaof-6.6`; human accountability.                                    |
| `claude-generated-084` | Reject — Duplicate | `CPQ-ccaof-6.4`; unapproved tools and confidential data.                  |
| `claude-generated-086` | Reject — Duplicate | `CPQ-ccaof-6.7`; professional legal advice.                               |
| `claude-generated-088` | Reject — Duplicate | `CPQ-ccaof-6.5`; no fabricated endorsements.                              |
| `claude-generated-089` | Reject — Duplicate | `CPQ-ccaof-6.9`; approved tools/accountability.                           |
| `claude-generated-091` | Reject — Duplicate | `CPQ-ccaof-7.1`; missing prompt specifics.                                |
| `claude-generated-092` | Reject — Duplicate | `CPQ-ccaof-7.6`; controlled prompt comparisons.                           |
| `claude-generated-093` | Reject — Duplicate | `CPQ-ccaof-7.3`; Project troubleshooting.                                 |
| `claude-generated-096` | Reject — Duplicate | `CPQ-ccaof-7.5`; reusable setup requirements.                             |

The 20 generated IDs from the prior 72-exclusion table are checked against the named current-bank representatives above. The other 52 excluded items are SkillCertPro-derived and remain Hold—Unverified for rights; their text was not used.

## TestApp Master Cheat Sheet: 38-section gap review

The sheet consists of one introduction, seven domain headings, and 30 objective sections. Topics mapped to the November 2026 blueprint as follows; no source wording was copied.

| Section range        | Official domain                                    | Gap/disposition                                                                                                                                                                                                       |
| -------------------- | -------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Introduction         | No domain                                          | Provenance, not exam scope.                                                                                                                                                                                           |
| Domain 1 and 1.1–1.4 | D1 — Prompting and Task Execution, 14%             | Source heading mislabels it “Agents and Workflows” at 14.7%. Topics are prompt structure, task decomposition, iteration, and task-specific prompting. Qualify numeric claims; do not request hidden chain-of-thought. |
| Domain 2 and 2.1–2.6 | D2 — Output Evaluation and Validation, 21%         | Accuracy/completeness, hallucinations/bias, fact-checking, human review, editing, curation, and formats. Citations must support claims; self-checks are not independent verification.                                 |
| Domain 3 and 3.1–3.4 | D3 — Product and Model Selection, 12%              | Product/model/context/memory claims age quickly. Distinguish product memory, API context, Project knowledge, and Claude Code context.                                                                                 |
| Domain 4 and 4.1–4.5 | D4 — Workflow Integration and Solution Design, 16% | Use-case analysis, research/planning, design, integration, and stakeholder communication. Keep the Associate role clear and treat unsupported productivity figures as unverified.                                     |
| Domain 5 and 5.1–5.4 | D5 — Configuration and Knowledge Management, 12%   | Projects, knowledge/connectors, instructions, and configuration maintenance. Distinguish account Instructions, Project settings, connectors, and Skills.                                                              |
| Domain 6 and 6.1–6.4 | D6 — Governance, Risk, and Responsible Use, 15%    | Use boundaries, privacy, governance, and ethics are context-specific. Removing protected fields alone does not remove proxy bias.                                                                                     |
| Domain 7 and 7.1–7.3 | D7 — Troubleshooting and Optimization, 10%         | Retain a repeatable diagnosis/test/refine loop; qualify Claude Code specifics and unsupported productivity claims.                                                                                                    |

## CCDV-P coverage and gaps

The 70 retained questions span all eight domains but are not an exhaustive blueprint. The official guide's detailed objective text was only partially retrievable, so per-domain bank counts below describe the Practice Lab set, not official exam item counts.

| Domain                                                            | Official weight | Practice questions | Coverage focus                                                                                                  |
| ----------------------------------------------------------------- | --------------: | -----------------: | --------------------------------------------------------------------------------------------------------------- |
| D1 — Advanced Agent Architecture and Orchestration                |             17% |                 12 | Trusted handoffs, durable state, deterministic paths, concurrency, and approval boundaries.                     |
| D2 — Production Integration, Reliability, and Knowledge Grounding |             20% |                 14 | Streaming/recovery, rate limits, retrieval, citations, index versioning, and provider-specific embedding modes. |
| D3 — Observability and Production Monitoring                      |             12% |                  8 | Traces, cost/latency/quality signals, privacy-aware telemetry, and monitoring limits.                           |
| D4 — Advanced Debugging and Incident Response                     |             10% |                  7 | Trace diagnosis, drift, incident scope, safe recovery, and controlled rollout.                                  |
| D5 — Evaluation Engineering and Quality Assurance                 |             12% |                  8 | Judge calibration, human agreement, repeated runs, statistical uncertainty, and regression gates.               |
| D6 — Cost and Latency Optimization at Scale                       |              8% |                  6 | Caching, model/task fit, batching, capacity, and cost per completed outcome.                                    |
| D7 — Runtime Guardrails and Production Security                   |             11% |                  8 | Data classification, tool boundaries, prompt injection, MCP client controls, and safe defaults.                 |
| D8 — Agent Fleet Operations for Software Delivery                 |             10% |                  7 | Staged rollout, identity/audit, repository controls, fleet configuration, and bounded automation.               |

The D2 Voyage mode is explicitly provider-specific. Detailed official sub-objectives not visible in indexed excerpts remain an open coverage limit; do not infer that the question bank exhausts the live exam.

## CCDV-F enrichment decision

The existing CCDV-F matrix assesses 25 competencies and links each to study material. Review found Foundations-level notes for orchestration, context engineering, tools, streaming/recovery, structured output, prompt caching, human approval, security, MCP, evaluation, debugging, Claude Code, reliability, and observability. No new CCDV-F question is justified by the reviewed sources. Retrieval rewriting, reranking, index versioning, and provider-specific embeddings remain in Professional-level synthesis because the current CCDV-F matrix does not identify a Foundations gap. The matrix records this decision; existing CCDV-F IDs remain unchanged.

## Technical references

Retrieval date is 2026-11-26 unless noted. Public search excerpts are not equivalent to reviewing an entire page; version-sensitive product facts require rechecking.

| Topic                           | Reference and evidence status                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| ------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Agent architecture              | [Anthropic Engineering: Building effective agents](https://www.anthropic.com/engineering/building-effective-agents) — selected public content; general patterns, not current product guarantees.                                                                                                                                                                                                                                                                               |
| Claude Messages and tools       | [Tool use overview](https://platform.claude.com/docs/en/agents-and-tools/tool-use/overview) and [programmatic tool calling](https://platform.claude.com/docs/en/agents-and-tools/tool-use/programmatic-tool-calling) — targeted public review.                                                                                                                                                                                                                                 |
| Streaming and structured output | [Messages streaming](https://platform.claude.com/docs/en/build-with-claude/streaming), [stop reasons](https://platform.claude.com/docs/en/build-with-claude/handling-stop-reasons), [structured outputs](https://platform.claude.com/docs/en/build-with-claude/structured-outputs), and [citations](https://platform.claude.com/docs/en/build-with-claude/citations) — targeted public review; verify model/API applicability.                                                 |
| Prompt caching and batches      | [Prompt caching](https://platform.claude.com/docs/en/build-with-claude/prompt-caching) and [batch processing](https://platform.claude.com/docs/en/build-with-claude/batch-processing) — targeted public review; prices/TTL can change.                                                                                                                                                                                                                                         |
| Rate limits and errors          | [Rate limits](https://platform.claude.com/docs/en/api/rate-limits) and [API errors](https://platform.claude.com/docs/en/api/errors) — targeted public review; account/model quotas vary.                                                                                                                                                                                                                                                                                       |
| Models and context              | [Models](https://docs.anthropic.com/en/docs/about-claude/models), [model selection](https://docs.anthropic.com/en/docs/about-claude/models/choosing-a-model), and [context windows](https://docs.anthropic.com/en/docs/build-with-claude/context-windows) — dynamic product facts.                                                                                                                                                                                             |
| Voyage embeddings               | [Voyage text embeddings](https://docs.voyageai.com/docs/embeddings) and [FAQ](https://docs.voyageai.com/docs/faq) — provider-specific `query` and `document` modes; not a Claude API or universal guarantee.                                                                                                                                                                                                                                                                   |
| MCP                             | [MCP 2026-07-28 security practices](https://modelcontextprotocol.io/specification/2026-07-28/basic/security_best_practices) and [transports](https://modelcontextprotocol.io/specification/2026-07-28/basic/transports) — selected versioned specification sections.                                                                                                                                                                                                           |
| Claude Code                     | [Settings](https://code.claude.com/docs/en/settings), [managed settings](https://code.claude.com/docs/en/managed-settings), [hooks](https://code.claude.com/docs/en/hooks), [subagents](https://code.claude.com/docs/en/sub-agents), and [Skills](https://code.claude.com/docs/en/skills) — targeted review; controls evolve.                                                                                                                                                  |
| Observability and evaluation    | [OpenTelemetry traces](https://opentelemetry.io/docs/concepts/signals/traces/), [metrics](https://opentelemetry.io/docs/concepts/signals/metrics/), [Google SRE monitoring](https://sre.google/sre-book/monitoring-distributed-systems/), [incident troubleshooting](https://sre.google/sre-book/effective-troubleshooting/), and [Anthropic evaluation guidance](https://platform.claude.com/docs/en/test-and-evaluate/develop-tests) — targeted review of general practices. |
| Rights and use                  | [CC BY-NC 4.0](https://creativecommons.org/licenses/by-nc/4.0/) — license reference; source grant not independently audited. The TestApp maintainer confirmed reuse permission; the author's name was not supplied.                                                                                                                                                                                                                                                            |

## Publication boundaries

- The repository's MIT license covers application code only, not third-party question content.
- CCDV-P practice questions are now original, source-linked Practice Lab scenarios. The historical candidate review above documents prior editorial research; it is not the active question bank, and no candidate question text or answer key is shipped in the application.
- CCAO-F TestApp additions carry maintainer-confirmed reuse permission; no broader license is claimed, and the author name was not provided.
- No SkillCertPro question or cheat-sheet text is included. All 680 SkillCertPro candidates remain on hold pending rights confirmation and resolution of the publisher's previous-exam-question claim.
