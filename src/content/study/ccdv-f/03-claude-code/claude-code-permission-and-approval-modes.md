---
title: "Claude Code Permission and Approval Modes"
aliases: []
type: atomic-note
certification: CCDV-F
domain: D3
domain_name: Claude Code
status: study-synthesis
source_kind: official-blueprint-and-documentation
updated: '2026-11-15'
tags:
- certification/ccdv-f
- domain/claude-code
- type/concept
---

> Agent productivity and safety depend on permission scope. Approval should be enforced by the
> runtime at the boundary of an action, not left as a polite prompt.

**Blueprint area:** [D3 - Claude Code MOC](../d3-claude-code-moc/) (official domain weight 3.1%).

## Engineering principles

- Distinguish read-only exploration and planning from edits and privileged operations.
- Choose a mode matching risk; do not grant blanket permission for unrelated tool calls to
  accelerate one task.
- For destructive shell, publication, or production writes, use explicit approvals or deterministic
  hooks according to policy.
- Combine permissions with version control, branch isolation, review and automated tests.

## Failure modes

- An instruction in CLAUDE.md cannot guarantee a destructive command is blocked.
- A PostToolUse review happens too late to prevent an already executed mutation.

## Check your understanding

- ☐ Try an unauthorized action and ensure it is denied before execution.
- ☐ Document which actor authorized sensitive tool calls.

## Related knowledge

[PreToolUse Hooks and Deterministic Controls](../pretooluse-hooks-and-deterministic-controls/) · [Human Approval for Irreversible Actions](../human-approval-for-irreversible-actions/) · [Exam Blueprint and Coverage](../exam-blueprint-and-coverage/)

## Evidence and verification

- **Provenance:** author-written engineering synthesis aligned to exam guide objectives; this is
  **not** a transcript or hidden Skilljar lesson.
- **Primary references:**
    - [guide](https://drive.google.com/file/d/1aWhE373XnbPEcYbzXV6VjRfjHpUQdM9s/view)
    - [code-settings](https://code.claude.com/docs/en/settings)
    - [code-hooks](https://code.claude.com/docs/en/hooks)
- **Check currency:** model options, pricing, API flags, release-specific behavior and runtime
  permissions can change after the source was read. See [Source Register](../source-register/).
