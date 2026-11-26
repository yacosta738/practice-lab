---
title: "Evaluation Criteria and Grader Design"
aliases: []
type: atomic-note
certification: CCDV-F
domain: D4
domain_name: Eval, Testing, and Debugging
status: study-synthesis
source_kind: official-blueprint-and-documentation
updated: '2026-11-15'
tags:
- certification/ccdv-f
- domain/eval-testing-debugging
- type/concept
---

> Define success before tuning prompts. Evaluate task correctness, safety, latency and cost on
> representative cases, not a single polished demo.

**Blueprint area:** [D4 - Eval, Testing, and Debugging MOC](../d4-eval-testing-and-debugging-moc/)
(official domain weight 2.6%).

## Engineering principles

- Use code-based graders for deterministic contracts: parseable JSON, exact labels, bounds, source
  IDs and schema invariants.
- Use human review or rubric-driven model graders for fuzzy criteria such as faithfulness or
  clarity; calibrate model grading against labeled cases.
- Build holdout and adversarial sets containing ambiguous, missing, lengthy, multilingual and
  injection attempts where relevant.
- Report per-slice metrics and failure severity; global average accuracy can hide dangerous
  minorities.

## Failure modes

- An LLM judge with no rubric or calibration can be confidently wrong.
- Using the same fixtures for iterative tuning and final evaluation contaminates the holdout.

## Check your understanding

- ☐ Measure inter-rater agreement or model-human disagreement on a sample.
- ☐ Check both task accuracy and unacceptable failures.

## Related knowledge

[Regression Testing and Release Gates](../regression-testing-and-release-gates/) · [Structured Output and Defensive Parsing](../structured-output-and-defensive-parsing/) · [Exam Blueprint and Coverage](../exam-blueprint-and-coverage/)

## Evidence and verification

- **Provenance:** author-written engineering synthesis aligned to exam guide objectives; this is
  **not** a transcript or hidden Skilljar lesson.
- **Primary references:**
    - [guide](https://drive.google.com/file/d/1aWhE373XnbPEcYbzXV6VjRfjHpUQdM9s/view)
    - [evals](https://platform.claude.com/docs/en/test-and-evaluate/develop-tests)
- **Check currency:** model options, pricing, API flags, release-specific behavior and runtime
  permissions can change after the source was read. See [Source Register](../source-register/).
