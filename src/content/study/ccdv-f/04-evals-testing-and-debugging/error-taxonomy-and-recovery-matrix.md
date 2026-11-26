---
title: "Error Taxonomy and Recovery Matrix"
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

> Recovery must be selected by failure origin and safety, with explicit terminal versus transient
> states.

**Blueprint area:** [D4 - Eval, Testing, and Debugging MOC](../d4-eval-testing-and-debugging-moc/)
(official domain weight 2.6%).

## Engineering principles

- Partition failures into invalid input, auth/authz denial, rate limiting, provider overload,
  network timeout, parsing failure, tool error, context overflow and policy violation.
- Retry transient infrastructure cases within a deadline; repair invalid requests and schema
  mismatches rather than replaying blindly.
- Use fallback or human escalation for low-confidence content, policy ambiguity and irreversible
  failures.
- Record root cause plus remediation outcome so operators can distinguish an app regression from a
  model issue.

## Failure modes

- Retries can hide a deterministic logic bug while burning budget.
- A terminal authorization denial must not be converted into a lower-privilege workaround.

## Check your understanding

- ☐ For each failure class, define retry? alert? rollback? owner?
- ☐ Validate a recovery path with an injected fault.

## Related knowledge

[Tracing and Failure Isolation](../tracing-and-failure-isolation/) · [Retries Timeouts and Idempotency](../retries-timeouts-and-idempotency/) · [Exam Blueprint and Coverage](../exam-blueprint-and-coverage/)

## Evidence and verification

- **Provenance:** author-written engineering synthesis aligned to exam guide objectives; this is
  **not** a transcript or hidden Skilljar lesson.
- **Primary references:**
    - [guide](https://drive.google.com/file/d/1aWhE373XnbPEcYbzXV6VjRfjHpUQdM9s/view)
    - [api](https://platform.claude.com/docs/en/api/messages)
- **Check currency:** model options, pricing, API flags, release-specific behavior and runtime
  permissions can change after the source was read. See [Source Register](../source-register/).
