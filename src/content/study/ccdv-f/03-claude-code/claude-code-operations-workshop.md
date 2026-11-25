---
title: "Claude Code Operations Workshop"
type: study-guide
certification: CCDV-F
domain: D3
status: study-synthesis
source_kind: original-study-synthesis
updated: '2026-11-24'
tags:
- certification/ccdv-f
- domain/claude-code
- type/workshop
---
This original workshop practices configuration, skills, and hook decisions in a shared repository. Verify the effective configuration for the current Claude Code version; do not assume that instructions or a skill enforce permissions.

## Scenario

A team is onboarding a repository with organization-managed policy, shared project settings, a developer's personal settings, and a project-local override. Two skills named `release` exist at different scopes. A release helper may publish an artifact, and a hook is expected to stop a forbidden command before it runs.

## Resolve configuration and capability scope

1. Inventory managed, user, project, and local settings. For each disputed key, consult the current settings reference; managed sources and command-line settings have documented interactions and security-sensitive exceptions, so do not infer one universal merge rule from file order.
2. Start a clean session and inspect the applied settings. Verify the effective permission with a harmless test rather than a production write.
3. For same-named skills, apply the documented enterprise-over-personal-over-project precedence. Plugin skills are namespaced; check the actual name and source rather than assuming a plugin skill silently shadows a project skill.
4. Treat the skill as a procedure, not a permission grant. Keep release credentials and publish authorization at the trusted service boundary.

## Check the hook at the correct lifecycle point

| Requirement | Hook choice | Expected verification |
|---|---|---|
| Prevent a disallowed tool call before execution | A matching `PreToolUse` command hook with a documented blocking result | A harmless synthetic call is blocked and the intended reason is visible |
| Observe or audit a completed tool call | A post-tool event | The action is already executed; this is not a preventive control |
| Continue through normal permission handling | A successful hook exit | Exit 0 does not itself approve the operation |
| Block an event | Use the event's documented block semantics | Exit code 2 blocks `PreToolUse`; other events have event-specific behavior |

Test both allow and deny paths in an isolated checkout. If a security-critical hook fails, prove the intended failure mode; do not assume every hook event or asynchronous hook blocks in the same way.

## Review checklist

- Can you distinguish who owns each settings scope and verify which value is active for the key in question?
- Can you identify which same-named skill runs and why, without treating skill text as a security boundary?
- Does the hook run before the sensitive action, and have you tested the documented event-specific failure behavior?
- Are permissions, approvals, and credentials still enforced independently of the prompt and skill?

## Sources and related material

- [Claude Code settings](https://code.claude.com/docs/en/settings) and [managed settings](https://code.claude.com/docs/en/managed-settings) — inspect current scope and key-specific precedence.
- [Claude Code hooks](https://code.claude.com/docs/en/hooks) — event-specific blocking and exit behavior.
- [Claude Code skills](https://code.claude.com/docs/en/skills) — locations and same-name resolution.
- [Claude Code Settings and Memory Hierarchy](../claude-code-settings-and-memory-hierarchy/), [PreToolUse Hooks and Deterministic Controls](../pretooluse-hooks-and-deterministic-controls/), and [Claude Code Permission and Approval Modes](../claude-code-permission-and-approval-modes/).
- [D3 - Claude Code MOC](../d3-claude-code-moc/) · [Source Register](../source-register/).