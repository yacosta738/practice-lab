---
title: "Agent Fleet Operations for Software Delivery"
aliases: []
type: atomic-note
certification: CCDV-P
domain: D8
domain_name: Agent Fleet Operations for Software Delivery
status: study-synthesis
source_kind: official-blueprint-and-documentation
updated: '2026-11-26'
tags:
- certification/ccdv-p
- domain/agent-fleet-operations
- type/concept
---

> Operate coding agents like production workers: assign scoped identities and isolated workspaces, roll out changes in stages, require review at merge boundaries, and keep a tested rollback path.

**Blueprint area:** D8 — Agent Fleet Operations for Software Delivery (official domain weight **10%**).

## Roll out in stages

Begin with a small pilot on low-risk repositories and tasks. Expand only when completion quality, review burden, security outcomes, cost per accepted change, and operational load meet explicit gates. Separate canary and broad cohorts so one bad configuration or model change cannot affect every run. Keep a fast kill switch for new assignments and a clear procedure to stop active runs.

Manage agent configuration as a versioned release: tools, permissions, model choices, prompts, skills, hooks, and environment settings should have an owner, reviewed changes, and a known-good rollback version. Test policy changes before broad distribution and verify which managed settings actually reached each execution environment. Configuration visibility is not the same as proof that a control executed.

Measure run completion, required-test pass rate, review acceptance and rework, escaped defects, security events, cost per accepted change, and time to merge. Compare these signals by rollout cohort and task type. Expand or roll back based on predefined quality and safety gates, not on the number of generated branches or pull requests.

## Give each run a narrow identity and workspace

Assign a work identity to a run or bounded workload, not a shared long-lived credential for an entire fleet. Scope repository and deployment access, set expiration and revocation paths, and attribute audit records to the initiating user, task, agent build, repository, and commit. Keep a record of tool decisions, human approvals, test results, and merge outcome without retaining unnecessary prompt or secret content.

Use an isolated worktree or equivalent workspace per concurrent task. Pin the source revision, avoid shared mutable build outputs, and define ownership of branches and generated artifacts. Before integration, review the diff, run required checks, and resolve conflicts through a controlled merge path. Isolation reduces collisions but does not itself make code safe.

## Separate local hooks from authoritative gates

Claude Code hooks can automate selected lifecycle checks, but they are event-specific and are not guaranteed to run or block every action in every environment. Treat them as useful local feedback and defense in depth. Enforce required tests, approvals, signed review rules, and protected-branch policies in the source-control or CI system that owns the merge decision. Verify the configured behavior for the actual hook event and runtime rather than assuming all hooks have the same blocking semantics.

For rollback, stop new work, revoke affected credentials if needed, restore the previous managed configuration or release, quarantine suspect changes, and preserve audit evidence. Then confirm that active tasks, queued work, and already-merged changes are handled; reverting the fleet configuration alone does not undo external side effects or code already merged.

## Failure modes

- Rolling out an untested permission or prompt change to every agent removes a safe comparison cohort.
- Shared credentials and workspaces make runs hard to attribute and allow concurrent changes to collide.
- Treating a pre-commit hook as the authoritative merge gate allows bypasses in other clients or event paths.
- Counting generated pull requests as success ignores review rejection, defects, and rework.
- Rolling back configuration without stopping active runs or revoking compromised credentials leaves exposure in place.

## Check your understanding

- ☐ Which metrics and quality gates must pass before moving from pilot to broader rollout?
- ☐ Can every run be traced to a user, identity, repository revision, configuration, and review result?
- ☐ Which controls are advisory hooks, and which are enforced by the merge authority?

## Related knowledge

[Advanced Agent Architecture and Orchestration](../architecture-and-orchestration/) · [Observability and Production Monitoring](../observability-and-production-monitoring/) · [Runtime Guardrails and Security](../runtime-guardrails-and-security/)

## Evidence and verification

- **Provenance:** Original fleet-operations synthesis. The official domain title and weight were checked against public search excerpts; detailed objective text remains only partially verified.
- **Primary references:** [Claude Code settings](https://code.claude.com/docs/en/settings); [Managed settings](https://code.claude.com/docs/en/managed-settings); [Hooks](https://code.claude.com/docs/en/hooks); [Subagents](https://code.claude.com/docs/en/sub-agents); [Skills](https://code.claude.com/docs/en/skills).
- **Check currency:** Claude Code settings, hook events, and runtime controls change. Recheck the relevant event and policy behavior before relying on it. See the [Source Register](../source-register/).