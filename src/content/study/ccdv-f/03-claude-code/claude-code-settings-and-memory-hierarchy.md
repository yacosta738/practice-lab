---
title: "Claude Code Settings and Memory Hierarchy"
aliases: []
type: atomic-note
certification: CCDV-F
domain: D3
domain_name: Claude Code
status: study-synthesis
source_kind: official-blueprint-and-documentation
updated: '2026-11-24'
tags:
- certification/ccdv-f
- domain/claude-code
- type/concept
---
> Claude Code separates durable instructions (CLAUDE.md, rules), user/project settings, executable skills and agent configuration; each has a distinct scope.

**Blueprint area:** [D3 - Claude Code MOC](../d3-claude-code-moc/) (official domain weight 3.1%).

## Engineering principles

- User settings apply to a person across local projects; shared project settings are versioned with the repo; project-local settings are user-specific; managed policy is organization-controlled.
- Keep stable project architecture and operational expectations in CLAUDE.md or rules rather than pasting them every turn.
- Use Skills for repeatable, task-triggered procedures and subagents for specialized contexts, not as a substitute for the permission system.
- Check precedence and cloud-vs-local behavior in the current Claude Code docs before depending on a specific path.

## Configuration and skill precedence

- Settings have managed, user, project, and local scopes. Managed policy and command-line settings have documented interactions, including security-sensitive exceptions; resolve precedence for the specific key in the current reference instead of assuming one universal file-order rule.
- For same-named skills, the documented order is enterprise over personal over project. Plugin skills are namespaced; a skill does not silently become a permission rule.
- Confirm the effective configuration in a clean session and test a harmless operation. Enforce sensitive permissions through the runtime or trusted service, not through a skill description.

## Failure modes

- Conflicting CLAUDE.md instructions can cause unpredictable agent behavior.
- A user-local override cannot be relied on as an organization-wide security guardrail.

## Check your understanding

- ☐ Can a new teammate reproduce the configuration from version control?
- ☐ Does the managed policy override an unsafe project preference?

## Related knowledge

[Skills vs Tools vs MCP vs Subagents](../skills-vs-tools-vs-mcp-vs-subagents/) · [Claude Code Permission and Approval Modes](../claude-code-permission-and-approval-modes/) · [Exam Blueprint and Coverage](../exam-blueprint-and-coverage/)

## Evidence and verification

- **Provenance:** author-written engineering synthesis aligned to exam guide objectives; this is **not** a transcript or hidden Skilljar lesson.
- **Primary references:**
  - [guide](https://drive.google.com/file/d/1aWhE373XnbPEcYbzXV6VjRfjHpUQdM9s/view)
  - [code-settings](https://code.claude.com/docs/en/settings)
- **Check currency:** model options, pricing, API flags, release-specific behavior and runtime permissions can change after the source was read. See [Source Register](../source-register/).
