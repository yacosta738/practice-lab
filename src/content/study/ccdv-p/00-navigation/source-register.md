---
title: "CCDV-P Source Register"
aliases: []
type: atomic-note
certification: CCDV-P
status: study-synthesis
source_kind: official-blueprint-and-documentation
updated: '2026-11-26'
tags:
- certification/ccdv-p
- type/source-register
---

> This register records what was accessed and examined for the original CCDV-P study synthesis. A
> listed URL is not evidence that its full contents were reviewed.

## Exam and practice interpretation

The [CCDV-P Exam Guide, Version 1.0, effective November 2026](https://cc.sj-cdn.net/instructor/6nizmqk8tpzpfjvt6qmmav7rh/public/1794947325/Claude_Certified_Developer-Professional_Exam_Guide.pdf)
describes **70 live items**: **60 scored and 10 unscored**, with a **120-minute** limit. The passing
cut score is **720** on a scaled range of **100–1,000**. The domain weights sum to 100%; they are
not exact item counts.

The Practice Lab's **70-question mock marks all 70 questions as scored** for its own raw diagnostic.
That raw percentage is not a prediction or conversion to the live exam's scaled score. The live
exam's 10 unscored items are mixed with scored items and are not identified to the candidate.

| Domain | Official title                                               | Weight |
|--------|--------------------------------------------------------------|-------:|
| D1     | Advanced Agent Architecture and Orchestration                |    17% |
| D2     | Production Integration, Reliability, and Knowledge Grounding |    20% |
| D3     | Observability and Production Monitoring                      |    12% |
| D4     | Advanced Debugging and Incident Response                     |    10% |
| D5     | Evaluation Engineering and Quality Assurance                 |    12% |
| D6     | Cost and Latency Optimization at Scale                       |     8% |
| D7     | Runtime Guardrails and Production Security                   |    11% |
| D8     | Agent Fleet Operations for Software Delivery                 |    10% |

## Scope and gap analysis

The existing [CCDV-F coverage matrix](../../ccdv-f/exam-blueprint-and-coverage/) maps its 25
competencies to existing Practice Lab material. It was consulted to avoid duplicating its
foundational syntheses; it is not evidence of CCDV-P objective coverage. The additions below focus
on production operations that need their own integrated scenarios:

| CCDV-P area         | Existing baseline or overlap                                                                             | Gap addressed by this note                                                                                                                        |
|---------------------|----------------------------------------------------------------------------------------------------------|---------------------------------------------------------------------------------------------------------------------------------------------------|
| D1 architecture     | CCDV-F notes cover workflow/agent choices, subagents, memory, and basic orchestration.                   | Durable trusted state, safe resume after side effects, task contracts, allocation, and approval binding at scale.                                 |
| D2 integration      | CCDV-F notes cover Messages API mechanics, streaming, retries, batches, structured output, and tool use. | Production lifecycle decisions combined with retrieval quality, index provenance, rate-limit handling, and provider-specific embedding contracts. |
| D3 observability    | CCDV-F tracing and debugging material provides a diagnostic baseline.                                    | Service-level latency distributions, usage/cost and quality signals, privacy-aware telemetry, cardinality, and quality drift.                     |
| D4 response         | CCDV-F has error taxonomies, traces, recovery, and a debugging workshop.                                 | Incident containment, safe replay boundaries, production drift, and retained post-incident evidence.                                              |
| D5 evaluation       | CCDV-F covers criteria, graders, regression checks, and release gates.                                   | Representative slices, human calibration of judges, repeated/pairwise trials, uncertainty, and limits of human review.                            |
| D6 optimization     | CCDV-F covers token accounting, model selection, and prompt caching.                                     | Cost per completed outcome, throughput constraints, tail latency, and batch-versus-interactive choices.                                           |
| D7 security         | CCDV-F covers trust boundaries, permissions, secrets, hooks, and MCP fundamentals.                       | Runtime enforcement as separate from model instructions, production identity, MCP client/server controls, and explicit protocol limits.           |
| D8 fleet operations | CCDV-F covers Claude Code settings, hooks, subagents, sessions, and tools.                               | Staged fleet rollout, managed configuration, per-run identity, isolated worktrees, authoritative merge gates, and fleet rollback telemetry.       |

The current 70-question bank is original Practice Lab content. It was written from the study notes
and the public technical sources recorded below; the previously reviewed third-party candidate set
was not used to write these questions. The bank uses stable local IDs and derived Practice Lab
domain counts, not official live-exam item allocations. No third-party question text, IDs, options,
answers, or rationales are included in the active bank.

## Review method and limits

Retrieval date for the records below: **2026-11-26**. Public documentation pages were extracted with
the Defuddle CLI and relevant returned sections were examined. This was targeted review, not
exhaustive line-by-line verification of every page. The exam-guide PDF itself was **not directly
extracted**; public search-index excerpts confirmed its basic exam facts, all eight domain titles
and weights, and selected domain descriptions. Detailed objectives remain partially unverified. No
source was accessed through authentication, a paywall, or another access control.

**Review summary:** No source below received an end-to-end audit of every page or objective. The
official guide was **indexed excerpts only**. Public documentation sources received **targeted
extraction and review**. The current question set is original synthesis, not a reproduction or
adaptation of a candidate bank. Version-sensitive details and exact prices or limits must be checked
again before use.

### Supplementary public verification for the question rewrite

On 2026-11-26, public search excerpts were reviewed
for [rate limits](https://platform.claude.com/docs/en/api/rate-limits), [Voyage embeddings](https://docs.voyageai.com/docs/embeddings), [OpenTelemetry traces](https://opentelemetry.io/docs/concepts/signals/traces/), [evaluation design](https://platform.claude.com/docs/en/test-and-evaluate/develop-tests), [stop reasons](https://platform.claude.com/docs/en/build-with-claude/handling-stop-reasons), [prompt caching](https://platform.claude.com/docs/en/build-with-claude/prompt-caching),
and [batch processing](https://platform.claude.com/docs/en/build-with-claude/batch-processing). The
excerpts covered retry timing, query/document input modes, span relationships and context
propagation, task-specific evaluation, tool-use/truncation states, stable cache prefixes, and
asynchronous independent batch items. These were search-result excerpts, not a full-page review;
direct fetch attempts returned `429` or response-metadata parse errors. A current search for
the [MCP security practices](https://modelcontextprotocol.io/specification/2026-07-28/basic/security_best_practices)
returned no specific result; its use in this bank relies on the earlier targeted review recorded
below, and that limitation remains.

## Source records

| Source                                  | URL                                                                                                                                        | Retrieval date and method                                     | Review status; evidence examined                                                                                                                          | Limitations                                                                                                                                |
|-----------------------------------------|--------------------------------------------------------------------------------------------------------------------------------------------|---------------------------------------------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------|--------------------------------------------------------------------------------------------------------------------------------------------|
| CCDV-P Exam Guide v1.0                  | [PDF](https://cc.sj-cdn.net/instructor/6nizmqk8tpzpfjvt6qmmav7rh/public/1794947325/Claude_Certified_Developer-Professional_Exam_Guide.pdf) | 2026-11-26; public search-index excerpts for the supplied URL | **Partial, indexed only.** Exam format, scored/unscored totals, time limit, scaled cut score, domain title/weight table, and selected D1/D2 descriptions. | PDF not directly extracted. Detailed blueprint and all objective text not verified; no domain item counts inferred.                        |
| Building effective agents               | [Anthropic Engineering](https://www.anthropic.com/engineering/building-effective-agents)                                                   | 2026-11-26; Defuddle public-page extraction                   | **Targeted review.** Workflow/agent distinction, simple composable patterns, orchestration choices, and trade-offs.                                       | Article notes that product/tool details have changed since December 2024; used for architectural principles, not current product behavior. |
| Tool use overview                       | [Claude Platform](https://platform.claude.com/docs/en/agents-and-tools/tool-use/overview)                                                  | 2026-11-26; Defuddle public-page extraction                   | **Targeted review.** Client/server tool distinction, tool-use round trip, and tool-choice behavior.                                                       | Feature availability and implementation details can vary by model and API version.                                                         |
| Programmatic tool calling               | [Claude Platform](https://platform.claude.com/docs/en/agents-and-tools/tool-use/programmatic-tool-calling)                                 | 2026-11-26; Defuddle public-page extraction                   | **Targeted review.** Programmatic tool execution, batching/filtering, caller configuration, and constraints.                                              | Model support, tool versions, and limits are version-sensitive; no implementation guarantee inferred.                                      |
| Agent SDK overview/index                | [Claude Platform](https://platform.claude.com/docs/en/cli-sdks-libraries/overview)                                                         | 2026-11-26; Defuddle public-page extraction                   | **Targeted review.** API client SDKs versus higher-level agent runtimes; SDK support areas.                                                               | The page is an overview, not a complete SDK behavior or durable-execution specification.                                                   |
| Messages streaming                      | [Claude Platform](https://platform.claude.com/docs/en/build-with-claude/streaming)                                                         | 2026-11-26; Defuddle public-page extraction                   | **Targeted review.** SSE lifecycle, deltas, SDK stream handling, and interrupted-stream recovery concepts.                                                | Some recovery guidance varies by model generation; exact behavior must be checked against current docs.                                    |
| Stop reasons                            | [Claude Platform](https://platform.claude.com/docs/en/build-with-claude/handling-stop-reasons)                                             | 2026-11-26; Defuddle public-page extraction                   | **Targeted review.** Completion, truncation, tool use, refusal, pause, and context-limit states.                                                          | Returned stop values and recommended handling can evolve with API features.                                                                |
| Structured outputs                      | [Claude Platform](https://platform.claude.com/docs/en/build-with-claude/structured-outputs)                                                | 2026-11-26; Defuddle public-page extraction                   | **Targeted review.** JSON schema constraints, strict tool use, compatibility and refusal/truncation caveats.                                              | Schema conformance does not validate truth or authorization; feature support is version-sensitive.                                         |
| Citations                               | [Claude Platform](https://platform.claude.com/docs/en/build-with-claude/citations)                                                         | 2026-11-26; Defuddle public-page extraction                   | **Targeted review.** Citation structures, source types, streaming, and limitations.                                                                       | Citation presence is not a guarantee that every claim is supported; format depends on source type.                                         |
| Prompt caching                          | [Claude Platform](https://platform.claude.com/docs/en/build-with-claude/prompt-caching)                                                    | 2026-11-26; Defuddle public-page extraction                   | **Targeted review.** Stable prefixes, breakpoints, TTL choices, cache usage evidence, and eligibility constraints.                                        | Prices, model thresholds, and caching behavior are volatile; no price values were carried into notes.                                      |
| Batch processing                        | [Claude Platform](https://platform.claude.com/docs/en/build-with-claude/batch-processing)                                                  | 2026-11-26; Defuddle public-page extraction                   | **Targeted review.** Asynchronous workflow, independent results, expiration, and suitability for delay-tolerant jobs.                                     | Capacity, terms, pricing, and completion times can change; not treated as an interactive guarantee.                                        |
| Rate limits                             | [Claude Platform](https://platform.claude.com/docs/en/api/rate-limits)                                                                     | 2026-11-26; Defuddle public-page extraction                   | **Targeted review.** Organization/tier limits, burst behavior, retry headers, spend-limit distinctions, and ramp-up.                                      | Actual limits depend on organization, tier, and platform; no fixed values copied into notes.                                               |
| API errors                              | [Claude Platform](https://platform.claude.com/docs/en/api/errors)                                                                          | 2026-11-26; Defuddle public-page extraction                   | **Targeted review.** HTTP/error distinctions, SDK retries, streaming errors, request IDs, and retry signals.                                              | SDK defaults and error classifications can change; applications must still classify operation safety.                                      |
| Develop tests                           | [Claude Platform](https://platform.claude.com/docs/en/test-and-evaluate/develop-tests)                                                     | 2026-11-26; Defuddle public-page extraction                   | **Targeted review.** Success criteria, task-specific evaluation sets, and grader trade-offs.                                                              | Page guidance is not a complete statistical evaluation standard; synthesis adds original operational recommendations.                      |
| MCP security best practices, 2026-07-28 | [MCP specification](https://modelcontextprotocol.io/specification/2026-07-28/basic/security_best_practices)                                | 2026-11-26; Defuddle public-page extraction                   | **Targeted review.** Confused deputy, token handling, SSRF, redirect/state checks, and scope minimization.                                                | Guidance complements protocol authorization requirements; client/product controls remain implementation-specific.                          |
| MCP transports, 2026-07-28              | [MCP specification](https://modelcontextprotocol.io/specification/2026-07-28/basic/transports)                                             | 2026-11-26; Defuddle public-page extraction                   | **Targeted review.** Transport bindings, message direction, metadata, cancellation, and compatibility.                                                    | Reviewed transport overview only; not a full review of every binding or authorization section.                                             |
| Claude Code settings                    | [Claude Code](https://code.claude.com/docs/en/settings)                                                                                    | 2026-11-26; Defuddle public-page extraction                   | **Targeted review.** Settings scopes and precedence, managed settings, and runtime differences.                                                           | Settings keys and behavior change; cloud and local sessions can differ.                                                                    |
| Claude Code managed settings            | [Claude Code](https://code.claude.com/docs/en/managed-settings)                                                                            | 2026-11-26; Defuddle public-page extraction                   | **Targeted review.** Managed policy sources, precedence, merge behavior, and validation.                                                                  | Specific controls depend on delivery method and product version; configuration presence is not proof of enforcement.                       |
| Claude Code hooks                       | [Claude Code](https://code.claude.com/docs/en/hooks)                                                                                       | 2026-11-26; Defuddle public-page extraction                   | **Targeted review.** Hook lifecycle/events, handler types, matching, decision behavior, and security.                                                     | Hooks are event-specific and runtime-dependent; no claim that hooks block every action or event.                                           |
| Claude Code subagents                   | [Claude Code](https://code.claude.com/docs/en/sub-agents)                                                                                  | 2026-11-26; Defuddle public-page extraction                   | **Targeted review.** Context isolation, tools, permissions, configuration scopes, and worktree options.                                                   | Product-specific behavior can change; isolated execution is not equivalent to authorization or code safety.                                |
| Claude Code Skills                      | [Claude Code](https://code.claude.com/docs/en/skills)                                                                                      | 2026-11-26; Defuddle public-page extraction                   | **Targeted review.** Skill loading, invocation, frontmatter, and distinction from mandatory runtime controls.                                             | Skill discovery and invocation controls are version-sensitive; a skill is not a security boundary.                                         |
| Voyage embeddings                       | [Voyage AI](https://docs.voyageai.com/docs/embeddings)                                                                                     | 2026-11-26; Defuddle public-page extraction                   | **Targeted review.** Provider-specific query/document `input_type`, embedding model interface, and dimensions.                                            | Models and parameters change; Voyage conventions must not be generalized to Claude or other providers.                                     |
| Voyage FAQ                              | [Voyage AI](https://docs.voyageai.com/docs/faq)                                                                                            | 2026-11-26; Defuddle public-page extraction                   | **Targeted review.** Provider recommendations, query/document use, and similarity guidance.                                                               | Provider-specific recommendations are not universal; model rankings and API details can change.                                            |
| OpenTelemetry traces                    | [OpenTelemetry](https://opentelemetry.io/docs/concepts/signals/traces/)                                                                    | 2026-11-26; Defuddle public-page extraction                   | **Targeted review.** Trace/span relationships, context propagation, span events, and kinds.                                                               | Concept page only; no vendor backend or specific application instrumentation was validated.                                                |
| OpenTelemetry metrics                   | [OpenTelemetry](https://opentelemetry.io/docs/concepts/signals/metrics/)                                                                   | 2026-11-26; Defuddle public-page extraction                   | **Targeted review.** Metric instruments, aggregation, cardinality, and overflow behavior.                                                                 | SDK and backend details vary; cardinality guidance is not an Anthropic product guarantee.                                                  |
| Monitoring distributed systems          | [Google SRE Book](https://sre.google/sre-book/monitoring-distributed-systems/)                                                             | 2026-11-26; Defuddle public-page extraction                   | **Targeted review.** Golden signals, black-box/white-box monitoring, actionable alerts, and alert fatigue.                                                | General SRE guidance; thresholds must be derived for the actual service and risk.                                                          |
| Effective troubleshooting               | [Google SRE Book](https://sre.google/sre-book/effective-troubleshooting/)                                                                  | 2026-11-26; Defuddle public-page extraction                   | **Targeted review.** Hypothesis-driven fault isolation, mitigation, evidence, and postmortems.                                                            | General distributed-systems guidance; examples are not product-specific operational guarantees.                                            |

## Domain notes

- [D1 — Advanced Agent Architecture and Orchestration](../architecture-and-orchestration/)
- [D2 — Production Integration, Reliability, and Knowledge Grounding](../production-integration-and-grounding/)
- [D3 — Observability and Production Monitoring](../observability-and-production-monitoring/)
- [D4 — Advanced Debugging and Incident Response](../debugging-and-incident-response/)
- [D5 — Evaluation Engineering and Quality Assurance](../evaluation-engineering/)
- [D6 — Cost and Latency Optimization at Scale](../cost-and-latency-optimization/)
- [D7 — Runtime Guardrails and Production Security](../runtime-guardrails-and-security/)
- [D8 — Agent Fleet Operations for Software Delivery](../agent-fleet-operations/)