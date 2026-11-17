---
title: "Memory Scopes and Persistence"
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
> The context window is temporary working memory; durable knowledge belongs in external storage selected by scope and retention policy.

**Blueprint area:** [D1 - Agents and Workflows MOC](../d1-agents-and-workflows-moc/) (official domain weight 14.7%).

## Engineering principles

- Use per-turn context for immediate instructions, per-session summaries for in-flight decisions, and explicit durable stores for facts needed across sessions.
- Persist structured state (task IDs, checkpoints, outcomes) separately from narrative memories; support TTL and deletion.
- Store the minimal facts needed for future steps and a provenance link, not unbounded transcripts.
- Always enforce tenant/user boundaries during reads and writes, including retrieval from vector or relational memory systems.

## Failure modes

- A summarization can silently drop an invariant; preserve key constraints as structured fields.
- Shared memory can leak one user’s data into another user’s execution context.

## Check your understanding

- ☐ Restart the run and verify it can resume from saved state.
- ☐ Audit what personal or confidential data each memory record contains.

## Related knowledge

[Context Compaction and Tool Output Pruning](../context-compaction-and-tool-output-pruning/) · [Security Boundaries and Least Privilege](../security-boundaries-and-least-privilege/) · [Exam Blueprint and Coverage](../exam-blueprint-and-coverage/)

## Evidence and verification

- **Provenance:** author-written engineering synthesis aligned to exam guide objectives; this is **not** a transcript or hidden Skilljar lesson.
- **Primary references:**
  - [guide](https://drive.google.com/file/d/1aWhE373XnbPEcYbzXV6VjRfjHpUQdM9s/view)
  - [context-tools](https://platform.claude.com/docs/en/agents-and-tools/tool-use/manage-tool-context)
- **Check currency:** model options, pricing, API flags, release-specific behavior and runtime permissions can change after the source was read. See [Source Register](../source-register/).
