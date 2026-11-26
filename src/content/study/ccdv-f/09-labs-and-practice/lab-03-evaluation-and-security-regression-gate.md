---
title: "Lab 03 - Evaluation and Security Regression Gate"
type: lab
certification: CCDV-F
status: to-do
source_kind: author-proposed-exercise
updated: '2026-11-15'
tags:
- certification/ccdv-f
- type/lab
- method/hands-on
---

**Goal:** demonstrate promotion of an agent change only after measurable quality, safety and
operational evidence.

## Deliverables

- Dataset: representative normal requests, ambiguous inputs, tool failure, prompt injection,
  long-context history and unauthorized write attempt.
- Rule-based validators for required JSON fields and business invariants; LLM/human rubric for
  nuanced responses.
- Golden trace per test with prompt version, model ID, tool calls, stop reason, cost and final
  disposition.
- Change one prompt/tool/model variable; compare paired results with baseline and decide pass/fail
  thresholds.
- Document rollback criteria and exercise at least one induced security regression.

## Acceptance tests

- ☐ Invalid values can fail even if schema is valid.
- ☐ Security test enforces no write under prompt injection.
- ☐ Reviewer can inspect a failing trace and identify first failing boundary.
- ☐ CI blocks promotion when a critical test regresses.

**Related:** [Evaluation Criteria and Grader Design](../evaluation-criteria-and-grader-design/) · [Tracing and Failure Isolation](../tracing-and-failure-isolation/) · [Regression Testing and Release Gates](../regression-testing-and-release-gates/) · [Prompt Injection and Data Trust Boundaries](../prompt-injection-and-data-trust-boundaries/).
