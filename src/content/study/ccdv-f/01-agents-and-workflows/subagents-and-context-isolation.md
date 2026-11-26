---
title: "Subagents and Context Isolation"
aliases: []
type: atomic-note
certification: CCDV-F
domain: D1
domain_name: Agents and Workflows
status: study-synthesis
source_kind: official-blueprint-and-documentation
updated: '2026-11-15'
tags:
- certification/ccdv-f
- domain/agents-workflows
- type/concept
---

> A subagent executes a bounded task in an isolated context, using a restricted toolset and
> returning a compact result to its caller.

**Blueprint area:** [D1 - Agents and Workflows MOC](../d1-agents-and-workflows-moc/) (official
domain weight 14.7%).

## Engineering principles

- Use isolation for specialized research, code search, or verification that otherwise pollutes the
  main context with raw tool output.
- Define purpose, authority, allowed tools, expected output format, and failure/blocked protocol in
  its configuration.
- Pass only necessary input and avoid copying entire histories into each worker; synthesize results
  into durable decisions.
- Compare subagents with tasks inside a single agent: subagents bring independence but increase
  orchestration cost.

## Failure modes

- Delegating without evidence and a structured response creates opaque conclusions.
- Subagents should not inherit unrestricted authority just because the parent has it.

## Check your understanding

- ☐ Can the parent verify findings without reading the entire child transcript?
- ☐ Can the child modify a resource it was only supposed to inspect?

## Related knowledge

[Memory Scopes and Persistence](../memory-scopes-and-persistence/) · [Context Compaction and Tool Output Pruning](../context-compaction-and-tool-output-pruning/) · [Exam Blueprint and Coverage](../exam-blueprint-and-coverage/)

## Evidence and verification

- **Provenance:** author-written engineering synthesis aligned to exam guide objectives; this is
  **not** a transcript or hidden Skilljar lesson.
- **Primary references:**
    - [guide](https://drive.google.com/file/d/1aWhE373XnbPEcYbzXV6VjRfjHpUQdM9s/view)
    - [code-agents](https://code.claude.com/docs/en/sub-agents)
- **Check currency:** model options, pricing, API flags, release-specific behavior and runtime
  permissions can change after the source was read. See [Source Register](../source-register/).
