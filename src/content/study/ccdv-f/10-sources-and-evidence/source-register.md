---
title: "Source Register"
type: moc
certification: CCDV-F
status: study-synthesis
source_kind: official-blueprint-and-documentation
updated: '2026-11-25'
tags:
- certification/ccdv-f
- type/source-register
- method/provenance
---

> **Source of truth:** The certification exam blueprint is the official PDF (v1.0, July 2026).
> API/Claude Code/MCP behavior should be validated against live documentation. The notes are original
> study synthesis.

## Evidence status convention

These labels describe the evidence collected for an individual resource; they do not imply that a
link will remain available or that every technical claim is correct. The resource index itself is a
study synthesis, not a global verification claim.

| Status               | Meaning                                                                                            |
|----------------------|----------------------------------------------------------------------------------------------------|
| `discovered`         | Resource identified and linked; its content was not retrieved.                                     |
| `accessible`         | Access was checked, but the content has not been reviewed.                                         |
| `partially-reviewed` | A limited part, metadata, or excerpts were reviewed; state the subset and what remains unreviewed. |
| `content-reviewed`   | The relevant resource content was inspected; this alone is not technical cross-validation.         |
| `cross-validated`    | Relevant claims were compared with an authoritative source.                                        |
| `access-restricted`  | Content requires an account, enrollment, or other access permission.                               |

## Certification and course sources

- **Official CCDV-F Exam
  Guide:** [PDF](https://drive.google.com/file/d/1aWhE373XnbPEcYbzXV6VjRfjHpUQdM9s/view) —
  **Evidence: content-reviewed.** It specifies 53 items, 120 minutes, a 720 scaled cut score, eight
  domains, and detailed objectives. Also available as the existing PDF in the parent folder; do not
  duplicate its bytes.
- **Foundations prep
  route:** [Anthropic Partner Academy](https://anthropic-partners.skilljar.com/path/claude-certified-developer-foundations) —
  **Evidence: access-restricted** for gated lesson bodies; five official modules are listed.
- **Claude Developer
  route:** [Developer catalogue](https://anthropic-partners.skilljar.com/path/claude-developer) —
  **Evidence: discovered**; distinct nine-course learning path.
- **Authenticated-screen summary:** [CCDV-F - Apuntes de Skilljar](../ccdv-f-apuntes-de-skilljar/)
  ([Drive](https://drive.google.com/file/d/1XgK6dAdt4YOsjzmoIRHEg4xPWt4G5v9f/view)) — **Evidence:
  content-reviewed** for the recorded screens only; limited coverage with exact checkpoint blockers,
  not complete course transcription.
- **Public course
  summaries:** [Claude-Developer-Verified-Course-Notes-2026-11-13](../claude-developer-verified-course-notes-2026-11-13/), [Claude-Developer-Learning-Path-Certification-Crosswalk](../claude-developer-learning-path-certification-crosswalk/), [Claude Certified Developer - Foundations Prep Course](../claude-certified-developer-foundations-prep-course/) —
  **Evidence: content-reviewed** as local study notes, not a complete course transcript.
- **Existing user
  notes:** [Claude Certified Developer](../claude-certified-developer/), [Asynchronous patterns for high-volume work](../asynchronous-patterns-for-high-volume-work/), [Synchronous, streaming, and real-time responses](../synchronous-streaming-and-real-time-responses/), [How a developer reaches Claude - SDK versus raw REST](../how-a-developer-reaches-claude-sdk-versus-raw-rest/), [Mode choice interacts with model choice](../mode-choice-interacts-with-model-choice/), [Message Batches API](../message-batches-api/), [AsyncAnthropic](../asyncanthropic/), [temperature](../temperature/), [Tokens](../tokens/), [Sampling](../sampling/), [Non-determinism](../non-determinism/), [context window](../context-window/) —
  **Evidence: content-reviewed** as original notes. Link these originals rather than cloning.
- **Unofficial practice
  bank:** [CCDV-F-Developer-Study-Guide-100-Questions](../ccdv-f-developer-study-guide-100-questions/)
  and its [Drive copy](https://drive.google.com/file/d/1jG9vCpCUpkmSTlY4_y-wzDfAUieYiGkr/view) —
  **Evidence: discovered** for the external copy; check its provenance and access before using it.
- **Expanded practice
  quiz:** [122-question quiz in Drive](https://drive.google.com/file/d/10u7R2kSfiA6F2tQx-fB68gUAGrU73KTU/view) —
  **Evidence: discovered**; content and access were not verified in this review.
- **Interactive quiz
  HTML:** [Open in Google Drive](https://drive.google.com/file/d/1ZEnvO9nZSFz61k3exGBMf1MMEISgzbHs/view) —
  **Evidence: discovered**; external HTML artifact, not a Markdown note, and content was not
  retrieved in this review.
- **External independent study and
  practice:** [AI Cert Guides — free lessons](https://aicertguides.com/ccdv-f/learn), [free diagnostic](https://aicertguides.com/ccdv-f/diagnostic), [terms](https://aicertguides.com/terms), [12-hour CCDV-F prep course on YouTube](https://www.youtube.com/watch?v=qaupWs_DcAI),
  and [CCDV All-in-One public practice artifact](https://claude.ai/public/artifacts/83eee27a-0509-45c1-be08-cc3e8b4cbfc8).
  **Evidence (2026-11-24):** AI Cert Guides index and all 25 lesson URLs were checked over public
  HTTP (HTTP 200); targeted body excerpts were reviewed for D1, D2, D5, D6, and lessons 7.1–7.2
  only. The other lesson bodies and diagnostic were not reviewed. The YouTube title, description,
  and visible chapters were reviewed; its transcript control was not accessible for review. The
  public artifact loaded, but its questions were not inspected. AI Cert Guides terms were reviewed
  separately; they permit reading/linking free lessons but restrict wholesale republication, and
  paid mocks are excluded. This does not claim complete extraction. These are independent resources,
  not official Anthropic material; retain only permitted provenance and original synthesis, never
  lesson dumps or third-party questions.
- **Study workflow:** [Learning Resources](../learning-resources/)
  and [Exam Decision Guide](../exam-decision-guide/) — **Evidence: content-reviewed**; original
  Practice Lab organization and reasoning guidance, not external course content.

## Phase 0 source acquisition record (2026-11-24)

This is a bounded public-source review, not a claim that every page, video, or artifact was
exhaustively extracted. URLs were checked separately from content review. No gated material was
accessed by bypassing controls, no full dumps were retained, and no third-party questions were
inspected or copied.

| Source family and URL                                                                                                                                                                                                                                                                                                                                                                                                                                              | Method, date, and access/review status                                                                                                                                                                 | Evidence examined and limitation                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| [AI Cert Guides lessons](https://aicertguides.com/ccdv-f/learn) and [Terms](https://aicertguides.com/terms)                                                                                                                                                                                                                                                                                                                                                        | 2026-11-24; public HTTPS requests to the index and 25 linked lesson URLs; all returned HTTP 200. **partially-reviewed**                                                                                | Index and targeted lesson excerpts for D1, D2, D5, D6, 7.1, and 7.2; terms page last updated 2026-10-28. The free lessons may be read, linked, and briefly quoted with attribution; wholesale republication is prohibited. Paid mock/drill questions may not be scraped, copied, or used to generate banks and were not accessed. Other lesson bodies and the diagnostic were not reviewed. Independent, non-Anthropic source.                                                   |
| [YouTube CCDV-F course](https://www.youtube.com/watch?v=qaupWs_DcAI)                                                                                                                                                                                                                                                                                                                                                                                               | 2026-11-24; public watch-page inspection. **partially-reviewed**                                                                                                                                       | Title, description, and visible chapters only. The transcript control was present but not accessible for review; no lesson video or transcript content is claimed as reviewed or retained.                                                                                                                                                                                                                                                                                       |
| [Claude public practice artifact](https://claude.ai/public/artifacts/83eee27a-0509-45c1-be08-cc3e8b4cbfc8)                                                                                                                                                                                                                                                                                                                                                         | 2026-11-24; public artifact load. **accessible**                                                                                                                                                       | Availability was confirmed, but the artifact's questions and explanations were not inspected. It is not evidence for the competency matrix and was not used to author questions.                                                                                                                                                                                                                                                                                                 |
| [Claude Platform documentation](https://platform.claude.com/docs/en/home)                                                                                                                                                                                                                                                                                                                                                                                          | 2026-11-24; selected public documentation pages and indexed excerpts. **partially-reviewed**                                                                                                           | Messages API, streaming/stop reasons, errors, batches, prompt caching, context management, structured outputs, thinking, tool use, evaluation guidance, and security/sandbox boundaries were reviewed selectively. The [prompt-caching page](https://platform.claude.com/docs/en/build-with-claude/prompt-caching) currently describes 5-minute and 1-hour TTLs and model-dependent pricing; recheck dynamic values before publication. This was not a full documentation crawl. |
| [Claude Code `llms.txt`](https://code.claude.com/docs/llms.txt)                                                                                                                                                                                                                                                                                                                                                                                                    | 2026-11-24; direct public HTTPS retrieval (HTTP 200; 53,393 bytes), plus selected documentation pages. **content-reviewed** for the index and **partially-reviewed** for the docs                      | The index maps current settings, managed settings, hooks, skills, subagents, MCP, and other docs; settings, managed-settings, hooks, and skills pages were consulted selectively for the matrix and workshops. The index is a discovery map, not evidence that every linked page was reviewed.                                                                                                                                                                                   |
| [MCP Specification 2026-07-28](https://modelcontextprotocol.io/specification/2026-07-28)                                                                                                                                                                                                                                                                                                                                                                           | 2026-11-24; selected versioned specification pages and public search excerpts. **partially-reviewed**                                                                                                  | Transports and tools pages were reviewed; authorization and security requirements were checked using indexed excerpts. A direct authorization-page request was rate-limited (HTTP 429), so that section was not treated as a full-page review. No rate limit or access control was bypassed.                                                                                                                                                                                     |
| [Anthropic Engineering](https://www.anthropic.com/engineering)                                                                                                                                                                                                                                                                                                                                                                                                     | 2026-11-24; public index and selected article review. **partially-reviewed**                                                                                                                           | The engineering index and [Building effective agents](https://www.anthropic.com/engineering/building-effective-agents) were used for architecture/pattern cross-checks. The full article corpus was not reviewed.                                                                                                                                                                                                                                                                |
| [Managed Agents overview](https://platform.claude.com/docs/en/managed-agents/overview), [SDKs, CLI, and libraries](https://platform.claude.com/docs/en/cli-sdks-libraries/overview), [streaming](https://platform.claude.com/docs/en/build-with-claude/streaming), [stop reasons](https://platform.claude.com/docs/en/build-with-claude/handling-stop-reasons), and [structured outputs](https://platform.claude.com/docs/en/build-with-claude/structured-outputs) | 2026-11-25; public web-search excerpts from official documentation. Direct page extraction was attempted but the extractor failed to parse response metadata (`favicon: null`). **partially-reviewed** | Excerpts covered the managed-agent versus Messages API distinction, Agent SDK runtime, streaming stop reasons and recovery, refusal behavior, and structured-output limitations. Full pages and model-specific recovery details were not reviewed. Public access was available; no authentication or access control was bypassed, and no question-bank content was copied.                                                                                                       |

### Supplementary security cross-check (2026-11-24)

[Anthropic Research — How we contain Claude](https://www.anthropic.com/research/how-we-contain-claude)
was **partially-reviewed** through public indexed excerpts describing tool-output risk and
environment-level egress/filesystem controls. A direct fetch could not be parsed by the available
extractor, so the article body is not claimed as reviewed. The excerpts support only high-level
defense-in-depth synthesis in the D7 workshop; no article text was retained. The
official [Claude Platform security risks and sandbox boundaries](https://platform.claude.com/docs/en/managed-agents/secure-deployment-risks)
page was also checked through public indexed excerpts for least-tool access, credential/network
boundaries, and layered controls; this was not a full-page review.

The associated [competency matrix](../exam-blueprint-and-coverage/) assesses all 25 blueprint
objectives. “Covered”, “Partial”, “Refresh”, and “Gap” describe Practice Lab material against the
evidence actually reviewed; they are not claims of mastery or of complete access to any third-party
course. See [Course Access Coverage](../course-access-coverage/) for the separately gated Anthropic
course.

## Official technical references (re-check before exam)

| Topic                  | Authoritative page                                                                                                                                     |
|------------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------|
| api                    | [Documentation](https://platform.claude.com/docs/en/api/messages)                                                                                      |
| client-tools           | [Documentation](https://platform.claude.com/docs/en/agents-and-tools/tool-use/overview)                                                                |
| streaming              | [Documentation](https://platform.claude.com/docs/en/build-with-claude/streaming)                                                                       |
| batches                | [Documentation](https://platform.claude.com/docs/en/build-with-claude/batch-processing)                                                                |
| caching                | [Documentation](https://platform.claude.com/docs/en/build-with-claude/prompt-caching)                                                                  |
| context-tools          | [Documentation](https://platform.claude.com/docs/en/agents-and-tools/tool-use/manage-tool-context)                                                     |
| json                   | [Documentation](https://platform.claude.com/docs/en/build-with-claude/structured-outputs)                                                              |
| evals                  | [Documentation](https://platform.claude.com/docs/en/test-and-evaluate/develop-tests)                                                                   |
| managed-agent-security | [Documentation](https://platform.claude.com/docs/en/managed-agents/secure-deployment-risks) — selected indexed excerpts; not a full-page review        |
| managed-agents         | [Documentation](https://platform.claude.com/docs/en/managed-agents/overview) — selected public search excerpts; not a full-page review                 |
| agent-sdk              | [Documentation](https://platform.claude.com/docs/en/cli-sdks-libraries/overview) — selected public search excerpts; not a full-page review             |
| thinking               | [Documentation](https://platform.claude.com/docs/en/build-with-claude/thinking)                                                                        |
| stop-reasons           | [Documentation](https://platform.claude.com/docs/en/build-with-claude/handling-stop-reasons) — selected public search excerpts; not a full-page review |
| code-settings          | [Documentation](https://code.claude.com/docs/en/settings)                                                                                              |
| code-hooks             | [Documentation](https://code.claude.com/docs/en/hooks)                                                                                                 |
| code-agents            | [Documentation](https://code.claude.com/docs/en/sub-agents)                                                                                            |
| code-skills            | [Documentation](https://code.claude.com/docs/en/skills)                                                                                                |
| mcp-transport          | [Documentation](https://modelcontextprotocol.io/specification/2026-07-28/basic/transports)                                                             |
| mcp-tools              | [Documentation](https://modelcontextprotocol.io/specification/2026-07-28/server/tools)                                                                 |
| mcp-authorization      | [Documentation](https://modelcontextprotocol.io/specification/2026-07-28/basic/authorization) — direct review was rate-limited; indexed excerpts only  |
| mcp-overview           | [Documentation](https://modelcontextprotocol.io/specification/2026-07-28)                                                                              |
| building-agents        | [Documentation](https://www.anthropic.com/engineering/building-effective-agents)                                                                       |

## Source confidence convention

- **Official blueprint:** domain objective / weight / exam format confirmed in Exam Guide v1.0.
- **Technical official docs:** behavior directly supported by vendor/specification documentation;
  check page version and model applicability.
- **Authenticated course note:** supported only by the specific screens recorded in the existing
  Skilljar notes. Do not infer unviewed lessons.
- **Study synthesis:** our derived architecture advice, exercises and memory aids, NOT verbatim
  course statements.
- **Pending:** course checkpoints, screens not reached, or any unverified dynamic API detail.
