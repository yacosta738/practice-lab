---
title: "Context Compaction and Tool Output Pruning"
aliases: []
type: atomic-note
certification: CCDV-F
domain: D6
domain_name: Prompt and Context Engineering
status: study-synthesis
source_kind: official-blueprint-and-documentation
updated: '2026-11-15'
tags:
- certification/ccdv-f
- domain/prompt-context-engineering
- type/concept
---
> Context engineering is selecting the useful evidence and state, not accumulating as many tokens as possible.

**Blueprint area:** [D6 - Prompt and Context Engineering MOC](../d6-prompt-and-context-engineering-moc/) (official domain weight 11.0%).

## Engineering principles

- Trim consumed tool output, compact old turns and move durable decisions into explicit notes or state.
- Preserve invariants, unresolved tasks, constraints and source references through compaction; do not assume summaries are lossless.
- Use subagents or scoped retrieval to isolate verbose investigations and return concise evidence.
- Compare manual vs automatic context compaction with regression tests for critical fact retention.

## Failure modes

- Context rot can cause missed requirements even before the hard token limit.
- Pruning evidence too aggressively can make an otherwise correct answer ungrounded.

## Check your understanding

- ☐ Can the agent still cite which source supports its decision after compaction?
- ☐ Measure task completion and recall on long sessions.

## Related knowledge

[Subagents and Context Isolation](../subagents-and-context-isolation/) · [Memory Scopes and Persistence](../memory-scopes-and-persistence/) · [Exam Blueprint and Coverage](../exam-blueprint-and-coverage/)

## Evidence and verification

- **Provenance:** author-written engineering synthesis aligned to exam guide objectives; this is **not** a transcript or hidden Skilljar lesson.
- **Primary references:**
  - [guide](https://drive.google.com/file/d/1aWhE373XnbPEcYbzXV6VjRfjHpUQdM9s/view)
  - [context-tools](https://platform.claude.com/docs/en/agents-and-tools/tool-use/manage-tool-context)
- **Check currency:** model options, pricing, API flags, release-specific behavior and runtime permissions can change after the source was read. See [Source Register](../source-register/).
