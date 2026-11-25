---
title: "Prompt Injection and Data Trust Boundaries"
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
> Prompt injection happens when lower-trust content tries to instruct the agent to cross a trust boundary or misuse capabilities.

**Blueprint area:** [D7 - Security and Safety MOC](../d7-security-and-safety-moc/) (official domain weight 8.1%).

## Engineering principles

- Explicitly separate trusted policy, user intent and untrusted web/file/tool data; do not promote retrieved text to system rules.
- Apply least privilege and tool-side authorization; a model must never be the only control guarding secrets or writes.
- Require explicit confirmation for sensitive external actions and log the original user authorization.
- Use defense in depth: scoped credentials, allowlists, safe parsing, approvals, monitoring and adversarial tests.

## Failure modes

- “Ignore malicious instructions” alone is not a sufficient technical safeguard.
- A stronger model does not eliminate prompt-injection risk.

## Check your understanding

- ☐ Plant a synthetic injected instruction in a retrieved email and verify no sensitive call occurs.
- ☐ Can a tool result change the intended recipient or authorization scope?

## Related knowledge

[Instruction Trust and Grounding](../instruction-trust-and-grounding/) · [Human Approval for Irreversible Actions](../human-approval-for-irreversible-actions/) · [Exam Blueprint and Coverage](../exam-blueprint-and-coverage/)

## Evidence and verification

- **Provenance:** author-written engineering synthesis aligned to exam guide objectives; this is **not** a transcript or hidden Skilljar lesson.
- **Primary references:**
  - [guide](https://drive.google.com/file/d/1aWhE373XnbPEcYbzXV6VjRfjHpUQdM9s/view)
  - [Anthropic Research: How we contain Claude](https://www.anthropic.com/research/how-we-contain-claude) — selected public search excerpts only; see [Source Register](../source-register/) for access limits.
- **Check currency:** model options, pricing, API flags, release-specific behavior and runtime permissions can change after the source was read. See [Source Register](../source-register/).
