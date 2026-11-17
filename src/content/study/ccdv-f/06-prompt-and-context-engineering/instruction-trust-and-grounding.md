---
title: "Instruction Trust and Grounding"
aliases: []
type: atomic-note
certification: CCDV-F
domain: D6
domain_name: Prompt and Context Engineering
status: study-synthesis
source_kind: official-blueprint-and-documentation
updated: '2026-11-15'
tags:
- certification/ccdv-f
- domain/prompt-context-engineering
- type/concept
---
> Trust boundaries distinguish instructions issued by the application from content merely retrieved, uploaded or encountered by an agent.

**Blueprint area:** [D6 - Prompt and Context Engineering MOC](../d6-prompt-and-context-engineering-moc/) (official domain weight 11.0%).

## Engineering principles

- Treat tool responses, webpages and documents as data, even if they contain imperative prose or fake role markers.
- Label sources, quote or reference evidence, and state what the source does not establish.
- Use policy checks and runtime permissions for side effects; prompts are advisory guardrails, not authorization.
- Prefer retrieval from primary sources with stable citations for knowledge-sensitive tasks.

## Failure modes

- Hidden instructions embedded in a document are prompt injection, not a new user authorization.
- Plausible references can be wrong or outdated; verify high-stakes source claims.

## Check your understanding

- ☐ Include malicious-tool-output cases in evals.
- ☐ Check that retrieved documents cannot expand tool permissions.

## Related knowledge

[Prompt Injection and Data Trust Boundaries](../prompt-injection-and-data-trust-boundaries/) · [Structured Output and Defensive Parsing](../structured-output-and-defensive-parsing/) · [Exam Blueprint and Coverage](../exam-blueprint-and-coverage/)

## Evidence and verification

- **Provenance:** author-written engineering synthesis aligned to exam guide objectives; this is **not** a transcript or hidden Skilljar lesson.
- **Primary references:**
  - [guide](https://drive.google.com/file/d/1aWhE373XnbPEcYbzXV6VjRfjHpUQdM9s/view)
  - [client-tools](https://platform.claude.com/docs/en/agents-and-tools/tool-use/overview)
- **Check currency:** model options, pricing, API flags, release-specific behavior and runtime permissions can change after the source was read. See [Source Register](../source-register/).
