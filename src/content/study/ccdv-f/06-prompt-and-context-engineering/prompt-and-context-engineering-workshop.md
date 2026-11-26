---
title: "Prompt and Context Engineering Workshop"
type: study-guide
certification: CCDV-F
domain: D6
status: study-synthesis
source_kind: original-study-synthesis
updated: '2026-11-24'
tags:
- certification/ccdv-f
- domain/prompt-context-engineering
- type/workshop
---

This original workshop turns context pressure into a diagnosis problem. Choose a control for the
source of the pressure; do not treat every token problem as a reason to raise the context limit or
change models.

## Scenario

A case-resolution agent receives a long conversation, can access a catalog of 36 tools, and
repeatedly searches, reads, and filters records. The same policy and tool definitions are sent on
every turn. After many turns, early tool results become irrelevant, but the approved customer,
unresolved decision, and source references must remain available. Latency and input cost are
increasing, and some tasks lose a required fact after a long run.

## Diagnose the source before choosing a strategy

Measure the request by segment: stable instructions, tool definitions, retrieved data, recent
conversation, and accumulated tool results. Record context size, cache behavior, task completion,
required-fact recall, latency, and cost for a representative baseline.

| Observed pressure                                                                       | Candidate strategy                     | What it changes                                                                  | Important limit                                                               |
|-----------------------------------------------------------------------------------------|----------------------------------------|----------------------------------------------------------------------------------|-------------------------------------------------------------------------------|
| A large catalog is loaded although most tools are irrelevant to a turn                  | Tool search / on-demand tool discovery | Loads selected tool definitions instead of the full catalog up front             | Adds discovery work; it does not remove old conversation results              |
| Old tool results no longer affect the current task                                      | Context editing / tool-result pruning  | Removes eligible earlier `tool_result` blocks                                    | Preserve facts still needed for a later decision; pruning is not a summary    |
| A long conversation must retain decisions and unresolved work                           | Compaction                             | Replaces older context with a summary                                            | Summaries are lossy; test retention of required state and citations           |
| A repeated chain of small, predictable tool operations returns mostly intermediate data | Programmatic tool calling              | Runs a bounded sequence and returns selected results, reducing model round trips | Keep authorization, validation, and side-effect policy outside generated code |
| A stable prefix is resent and cost is the main issue                                    | Prompt caching                         | Reduces the cost of repeated input tokens                                        | Cached tokens still occupy context; TTL and pricing are model-dependent       |

## Apply a decision sequence

1. If unused definitions dominate the initial request, load only relevant tools and measure
   selection accuracy.
2. If obsolete results dominate later turns, prune only results proven no longer necessary; compact
   when the agent must retain a concise state across a long task.
3. If repeated deterministic tool chains dominate latency and context, test programmatic execution
   with bounded inputs and outputs. Keep the model in the loop where intermediate results require
   judgment.
4. If the context fits but the same stable prefix drives cost, test caching separately; do not
   report a cache hit as reduced context usage.
5. Before and after each change, compare completion, required-fact recall, citation/source
   retention, safety, latency, and cost on the same held-out cases.

## Decision exercise

For the scenario, create a short plan with one primary intervention for each measured pressure.
State which data can be removed, which state must survive, where authorization remains enforced, and
which metric would show that the intervention helped. Then design one regression case where an
aggressive optimization would lose the approved customer, an unresolved decision, or the evidence
supporting the answer.

## Review checklist

- Can you distinguish reducing tool definitions, removing old results, summarizing history, batching
  tool work, and reducing repeated-input cost?
- Does the proposed change preserve task-critical state without trusting a lossy summary blindly?
- Is each optimization measured against quality and safety as well as tokens, latency, and cost?

## Sources and related material

- [Manage tool context](https://platform.claude.com/docs/en/agents-and-tools/tool-use/manage-tool-context) —
  current strategies and their distinct effects; recheck model-specific behavior before
  implementation.
- [Context, Compaction, and Memory](../context-compaction-and-tool-output-pruning/)
  and [Evaluation Criteria and Grader Design](../evaluation-criteria-and-grader-design/).
- [D6 - Prompt and Context Engineering MOC](../d6-prompt-and-context-engineering-moc/) · [Exam Blueprint and Coverage](../exam-blueprint-and-coverage/) · [Source Register](../source-register/).