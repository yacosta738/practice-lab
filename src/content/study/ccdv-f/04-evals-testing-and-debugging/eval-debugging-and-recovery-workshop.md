---
title: "Eval, Debugging, and Recovery Workshop"
type: study-guide
certification: CCDV-F
domain: D4
status: study-synthesis
source_kind: original-study-synthesis
updated: '2026-11-24'
tags:
- certification/ccdv-f
- domain/eval-testing-debugging
- type/workshop
---

This original workshop connects traces, error classification, evaluation, and release decisions.
Diagnose the first failing boundary before changing a prompt or model.

## Scenario

A canary release of a support agent produces duplicate case notices. A trace shows a valid model
response requesting one `create_notice` tool call. The service times out while waiting for the
downstream result; the downstream audit later shows the first notice was accepted. The retry sends a
new operation identifier and creates a second notice. The release also changed the prompt and tool
schema in the same deployment.

## Isolate the failure

Reconstruct one request using correlated request, model-call, tool-call, and downstream operation
IDs. Record the model and prompt versions, tool schema, stop reason, timestamps, retry attempt,
sanitized error class, and downstream outcome. Do not log credentials or unnecessary personal data.

The first failure is an ambiguous timeout at the side-effect boundary, not evidence that the model
should call the tool again. Changing the prompt, tool schema, and retry policy together prevents
attribution. Separate those changes and preserve a replayable fixture.

## Select a safe recovery and evaluator

| Question                                                | Decision                                                                                                                                              |
|---------------------------------------------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------|
| Did the downstream operation commit before the timeout? | Reconcile by a stable operation/idempotency key before retrying; if state is uncertain, stop and escalate rather than creating another notice         |
| Which failures are retryable?                           | Retry only eligible transient failures within a deadline; repair validation/schema failures and honor authorization denials instead of replaying them |
| Which outputs can be graded deterministically?          | Use code checks for required fields, valid identifiers, allowed recipients, and schema invariants                                                     |
| Which outputs need judgment?                            | Use a human or rubric-based model grader for evidence quality or clarity, calibrated against labeled examples and disagreement review                 |
| Is the release safe?                                    | Hold the canary until the duplicate-side-effect regression is fixed and critical slices pass; retain rollback and monitor post-release behavior       |

## Build the regression evidence

1. Create a deterministic fixture where the downstream write succeeds but the response is lost.
2. Assert that reconciliation returns the existing operation and that a replay cannot create a
   second notice.
3. Compare the old and new prompt/schema separately on a frozen set plus a holdout set; include
   timeouts, malformed output, authorization denial, ambiguous inputs, and high-impact slices.
4. Report per-slice quality, duplicate side effects, latency, cost, and recovery rate. A passing
   average does not override a critical safety failure.
5. Release only when the critical gate passes; use a staged rollout with an owner, alert, and
   rollback criterion.

## Review checklist

- Can you trace the first failure to the provider, parser, tool, or downstream boundary?
- Does the retry policy distinguish transient errors from uncertain side effects and terminal
  authorization failures?
- Is every grader matched to a measurable criterion and calibrated where judgment is involved?
- Can the release decision be reproduced from versioned prompts, schemas, traces, and test fixtures?

## Sources and related material

- [Define success criteria and build evaluations](https://platform.claude.com/docs/en/test-and-evaluate/develop-tests) —
  task-specific cases, grader selection, and evaluation design.
- [Claude API errors](https://platform.claude.com/docs/en/api/errors) — verify current provider
  error categories and recovery guidance.
- [Tracing and Failure Isolation](../tracing-and-failure-isolation/), [Error Taxonomy and Recovery Matrix](../error-taxonomy-and-recovery-matrix/), [Evaluation Criteria and Grader Design](../evaluation-criteria-and-grader-design/),
  and [Regression Testing and Release Gates](../regression-testing-and-release-gates/).
- [D4 - Eval, Testing, and Debugging MOC](../d4-eval-testing-and-debugging-moc/) · [Source Register](../source-register/).