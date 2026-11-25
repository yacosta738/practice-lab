---
title: "Human Approval for Irreversible Actions"
aliases: []
type: atomic-note
certification: CCDV-F
domain: D7
domain_name: Security and Safety
status: study-synthesis
source_kind: official-blueprint-and-documentation
updated: '2026-11-24'
tags:
- certification/ccdv-f
- domain/security-safety
- type/concept
---
> Human-in-the-loop control belongs immediately before consequential external state change, after the intended action and its parameters are known.

**Blueprint area:** [D7 - Security and Safety MOC](../d7-security-and-safety-moc/) (official domain weight 8.1%).

## Engineering principles

- Gate deletions, external emails, payments, production deploys, permission changes and other irreversible writes by explicit approval policy.
- Present a clear diff/preview, affected identities and target resources to the approving actor.
- Bind approval to a specific operation and parameters so the agent cannot alter the payload after approval.
- Combine approval with idempotency, expiration, audit logging and post-action verification.

## Failure modes

- Approval for a vague plan is not approval for any future action derived from it.
- Review after execution cannot undo every irreversible consequence.

## Check your understanding

- ☐ Test changed-parameters-after-approval and replay attempts.
- ☐ Verify actor, scope, timestamp and outcome in the audit log.

## Related knowledge

[Agent Loop and Termination](../agent-loop-and-termination/) · [PreToolUse Hooks and Deterministic Controls](../pretooluse-hooks-and-deterministic-controls/) · [Exam Blueprint and Coverage](../exam-blueprint-and-coverage/)

## Evidence and verification

- **Provenance:** author-written engineering synthesis aligned to exam guide objectives; this is **not** a transcript or hidden Skilljar lesson.
- **Primary references:**
  - [guide](https://drive.google.com/file/d/1aWhE373XnbPEcYbzXV6VjRfjHpUQdM9s/view)
  - [mcp-tools](https://modelcontextprotocol.io/specification/2026-07-28/server/tools)
- **Check currency:** model options, pricing, API flags, release-specific behavior and runtime permissions can change after the source was read. See [Source Register](../source-register/).
