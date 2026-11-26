---
title: "Model Routing and Thinking Effort"
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

> Pick model capability independently from thinking/effort. Evaluate the smallest configuration that
> satisfies the task’s measured quality and latency needs.

**Blueprint
area:** [D5 - Model Selection and Optimization MOC](../d5-model-selection-and-optimization-moc/)
(official domain weight 16.8%).

## Engineering principles

- Haiku suits bounded high-volume tasks; Sonnet balances capability and efficiency; Opus addresses
  harder reasoning. Current families, features and availability can change.
- Adjust prompt and evidence quality before paying for extra reasoning; compare effort
  configurations using the same fixtures.
- Routing can classify easy/complex requests and send them to different models, but the router
  itself needs accuracy evals.
- Reasoning tokens can affect output-token billing and latency; cache interactions depend on the
  current model and settings.

## Failure modes

- Switching models can change answer format or tool behavior even when API fields are unchanged.
- Do not memorize numeric budgets or a particular model as permanently optimal.

## Check your understanding

- ☐ Evaluate quality, cost per pass, P95 latency and failure severity for each route.
- ☐ Test the routing boundary on adversarial borderline cases.

## Related knowledge

[Tokens Context Window and Sampling](../tokens-context-window-and-sampling/) · [Prompt Caching Economics](../prompt-caching-economics/) · [Exam Blueprint and Coverage](../exam-blueprint-and-coverage/)

## Evidence and verification

- **Provenance:** author-written engineering synthesis aligned to exam guide objectives; this is
  **not** a transcript or hidden Skilljar lesson.
- **Primary references:**
    - [guide](https://drive.google.com/file/d/1aWhE373XnbPEcYbzXV6VjRfjHpUQdM9s/view)
    - [thinking](https://platform.claude.com/docs/en/build-with-claude/thinking)
- **Check currency:** model options, pricing, API flags, release-specific behavior and runtime
  permissions can change after the source was read. See [Source Register](../source-register/).
