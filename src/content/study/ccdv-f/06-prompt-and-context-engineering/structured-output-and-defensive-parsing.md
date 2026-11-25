---
title: "Structured Output and Defensive Parsing"
aliases: []
type: atomic-note
certification: CCDV-F
domain: D6
domain_name: Prompt and Context Engineering
status: study-synthesis
source_kind: official-blueprint-and-documentation
updated: '2026-11-25'
tags:
- certification/ccdv-f
- domain/prompt-context-engineering
- type/concept
---
> Use constrained structured outputs or schema validation when downstream software requires typed data, and still validate semantic correctness.

**Blueprint area:** [D6 - Prompt and Context Engineering MOC](../d6-prompt-and-context-engineering-moc/) (official domain weight 11.0%).

## Engineering principles

- When supported, `output_config.format` with JSON schema constrains output shape; strict tool use can constrain tool inputs.
- Schema compliance guarantees types/shape within supported constraints, **not** that extracted values refer to the right entity or are true.
- Handle refusal, truncation, interrupted streaming, tool error and unsupported-schema cases separately.
- A refusal may return with HTTP 200 and `stop_reason: refusal` while taking precedence over the requested schema; branch on refusal before parsing.
- Validate business invariants, referential integrity, field provenance and authorization after parsing.

## Failure modes

- `JSON.parse` success is not a data-quality metric.
- Changing the schema or tool set can change caching and first-request latency.

## Check your understanding

- ☐ Test valid JSON with deliberately wrong customer-to-order mapping.
- ☐ Reject output that violates domain constraints despite a successful parse.

## Related knowledge

[System Prompts XML and Few Shot](../system-prompts-xml-and-few-shot/) · [Messages API Contract](../messages-api-contract/) · [Exam Blueprint and Coverage](../exam-blueprint-and-coverage/)

## Evidence and verification

- **Provenance:** author-written engineering synthesis aligned to exam guide objectives; this is **not** a transcript or hidden Skilljar lesson.
- **Primary references:**
  - [guide](https://drive.google.com/file/d/1aWhE373XnbPEcYbzXV6VjRfjHpUQdM9s/view)
  - [json](https://platform.claude.com/docs/en/build-with-claude/structured-outputs)
  - [stop-reasons](https://platform.claude.com/docs/en/build-with-claude/handling-stop-reasons)
- **Check currency:** model options, pricing, API flags, release-specific behavior and runtime permissions can change after the source was read. See [Source Register](../source-register/).
