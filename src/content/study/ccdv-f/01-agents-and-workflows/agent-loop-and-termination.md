---
title: "Agent Loop and Termination"
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

> An agent harness owns the message history, tool dispatcher, policy checks, result handling, and
> the decision to terminate; the model suggests actions but does not grant itself authority.

**Blueprint area:** [D1 - Agents and Workflows MOC](../d1-agents-and-workflows-moc/) (official
domain weight 14.7%).

## Engineering principles

- Construct a bounded loop: submit messages and available tools; inspect response blocks and
  `stop_reason`; dispatch permitted client tool calls; append matching results; repeat until
  `end_turn` or a terminal condition.
- Keep separate budgets for turns, tool calls, elapsed time, output tokens and monetary cost; log
  which budget ended the run.
- Return each client tool result using its associated `tool_use_id`; record failures as explicit
  error results rather than dropping calls.
- Put authorization, idempotency, transactions, timeouts, and human approval **outside** the model,
  in the harness or backend.

## Working model

State: `MODEL -> TOOL_REQUEST -> POLICY -> EXECUTE -> TOOL_RESULT -> MODEL`, with terminal
`COMPLETE`, `DENIED`, and `BUDGET_EXHAUSTED` transitions.

## Failure modes

- Treating `tool_use` as a final answer leaves the operation unexecuted.
- Executing unvalidated tool arguments or silently retrying mutations can duplicate side effects.

## Check your understanding

- ☐ Exercise the loop with two independent tool calls and a failed third call.
- ☐ Verify max-turns stops even if the model keeps asking for work.

## Related knowledge

[Tool Schema and Tool Result Lifecycle](../tool-schema-and-tool-result-lifecycle/) · [Human Approval for Irreversible Actions](../human-approval-for-irreversible-actions/) · [Tracing and Failure Isolation](../tracing-and-failure-isolation/) · [Exam Blueprint and Coverage](../exam-blueprint-and-coverage/)

## Evidence and verification

- **Provenance:** author-written engineering synthesis aligned to exam guide objectives; this is
  **not** a transcript or hidden Skilljar lesson.
- **Primary references:**
    - [guide](https://drive.google.com/file/d/1aWhE373XnbPEcYbzXV6VjRfjHpUQdM9s/view)
    - [client-tools](https://platform.claude.com/docs/en/agents-and-tools/tool-use/overview)
- **Check currency:** model options, pricing, API flags, release-specific behavior and runtime
  permissions can change after the source was read. See [Source Register](../source-register/).
