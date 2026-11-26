---
title: "Evaluation Engineering and Quality Assurance"
aliases: []
type: atomic-note
certification: CCDV-P
domain: D5
domain_name: Evaluation Engineering and Quality Assurance
status: study-synthesis
source_kind: official-blueprint-and-documentation
updated: '2026-11-26'
tags:
- certification/ccdv-p
- domain/evaluation-engineering-quality-assurance
- type/concept
---

> An evaluation is a measurement system, not a single score. It must represent production work, expose uncertainty, and be calibrated before it gates a release.

**Blueprint area:** D5 — Evaluation Engineering and Quality Assurance (official domain weight **12%**).

## Build a representative, versioned set

Define success criteria around the user task and its risk. Sample realistic cases across common paths, difficult inputs, languages, permissions, long-tail failures, and known safety boundaries. Remove or protect personal data, and keep a holdout set that is not used to tune prompts or graders. When production traffic changes, review whether the sample still represents it.

Store each evaluation case with its expected outcome or rubric, source/provenance, input version, and any relevant tool, model, prompt, and index versions. Track missing, excluded, or ambiguous cases rather than silently dropping them. Use deterministic graders for exact contracts and code-checkable invariants; reserve model judges for judgments that need semantic interpretation.

## Calibrate model judges against people

Write a rubric with observable criteria, examples of boundary cases, and explicit unacceptable outcomes. Compare the judge with blinded human ratings on a representative calibration sample. Measure agreement and inspect false positives, false negatives, subgroup differences, and systematic preference for longer or more confident answers. Revise the rubric or judge when disagreements cluster; do not assume a judge is reliable because its explanations sound persuasive.

Have humans adjudicate ambiguous or high-impact cases, but account for reviewer disagreement, fatigue, and limited sample size. Use more than one reviewer where the consequence warrants it, and record the adjudication rule. Human review is a valuable signal, not proof that the unseen tail is safe.

## Measure uncertainty and change

Use repeated trials when model output is stochastic or a small difference could change a release decision. Pairwise comparisons can help assess two versions, but randomize presentation order and check for position or verbosity bias. Report sample size, score distribution, confidence intervals or another uncertainty estimate, and per-slice results. A small average gain does not establish a reliable improvement if the uncertainty is large or a critical slice regresses.

Set release gates before looking at results: minimum sample coverage, required quality floors, safety blockers, acceptable regression limits, and a rollback or human-review path. Use a staged canary after offline tests. Keep evaluation execution, grader version, and decision evidence reproducible. A passing gate is bounded evidence about the tested distribution, not a guarantee of production behavior.

## Failure modes

- Tuning against the same examples used to report quality overstates generalization.
- One overall score hides regressions in safety, citations, language, or a small tenant group.
- A judge that agrees with itself can still disagree systematically with trained human reviewers.
- A single trial confuses random variation with a real version effect.
- Human review of a convenient sample misses rare, high-consequence failures.
- Changing a model, tool, prompt, or index without recording its version makes a result irreproducible.

## Check your understanding

- ☐ Which production slices are represented, and which are not covered by the current set?
- ☐ How was the judge calibrated against human ratings, including disagreement cases?
- ☐ What uncertainty and safety evidence must be present before the release gate passes?

## Related knowledge

[Observability and Production Monitoring](../observability-and-production-monitoring/) · [Debugging and Incident Response](../debugging-and-incident-response/) · [Cost and Latency Optimization](../cost-and-latency-optimization/)

## Evidence and verification

- **Provenance:** Original evaluation-engineering synthesis. Public guide excerpts establish the domain title and weight; objective-level coverage remains partially verified.
- **Primary references:** [Anthropic: Develop tests](https://platform.claude.com/docs/en/test-and-evaluate/develop-tests); [Structured outputs](https://platform.claude.com/docs/en/build-with-claude/structured-outputs); [Google SRE monitoring distributed systems](https://sre.google/sre-book/monitoring-distributed-systems/).
- **Check currency:** Evaluation features and model behavior can change. See the [Source Register](../source-register/).