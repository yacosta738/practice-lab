---
title: "Thinking Blocks and Tool Turns"
aliases: []
type: atomic-note
certification: CCDV-F
domain: D5
domain_name: Model Selection and Optimization
status: study-synthesis
source_kind: official-blueprint-and-documentation
updated: '2026-11-15'
tags:
- certification/ccdv-f
- domain/model-selection-optimization
- type/concept
---

> Thinking configuration, thinking content blocks and tool-use message continuity have
> model-dependent constraints.

**Blueprint
area:** [D5 - Model Selection and Optimization MOC](../d5-model-selection-and-optimization-moc/)
(official domain weight 16.8%).

## Engineering principles

- Inspect current support for `thinking` modes and `output_config.effort` before sending a
  parameter; different model generations differ.
- Budget generated reasoning as output tokens; account for its interaction with response limits.
- Use the SDK when possible for complex streaming and block continuity; preserve protocol-required
  thinking blocks across tool turns where documented.
- Test compatibility on the exact pinned model rather than assuming any reasoning parameter is
  universally supported.

## Failure modes

- Combining unsupported thinking and generation parameters causes request failures.
- Cache hit rates can change after reasoning configuration edits.

## Check your understanding

- ☐ Test one-turn, multi-turn and tool-use with each selected model.
- ☐ Record the resolved thinking configuration in metrics.

## Related knowledge

[Model Routing and Thinking Effort](../model-routing-and-thinking-effort/) · [Messages API Contract](../messages-api-contract/) · [Exam Blueprint and Coverage](../exam-blueprint-and-coverage/)

## Evidence and verification

- **Provenance:** author-written engineering synthesis aligned to exam guide objectives; this is
  **not** a transcript or hidden Skilljar lesson.
- **Primary references:**
    - [guide](https://drive.google.com/file/d/1aWhE373XnbPEcYbzXV6VjRfjHpUQdM9s/view)
    - [thinking](https://platform.claude.com/docs/en/build-with-claude/thinking)
- **Check currency:** model options, pricing, API flags, release-specific behavior and runtime
  permissions can change after the source was read. See [Source Register](../source-register/).
