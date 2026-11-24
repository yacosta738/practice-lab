---
title: "Agent Architecture Design Workshop"
type: study-guide
certification: CCDV-F
domain: D1
status: study-synthesis
source_kind: original-study-synthesis
updated: '2026-11-24'
tags:
- certification/ccdv-f
- domain/agents-workflows
- type/workshop
---
This original workshop connects agent architecture, construction, and patterns to one support scenario. The core design question is not whether an agent is possible; it is whether model-directed steps add value beyond a simpler, more deterministic workflow.

## Scenario

A support assistant receives a return request, retrieves the relevant policy and order status, summarizes the case, and drafts a recommendation. A support lead must approve any refund. Some requests need one lookup; others require gathering several pieces of information before a recommendation is possible.

## Choose the control structure

| Work characteristic | Starting pattern | Reason |
|---|---|---|
| Same known steps for every request | Deterministic workflow | The application owns the sequence and can test each transition directly |
| A known set of paths selected from explicit inputs | Router plus bounded workflows | Branches are explicit; each path can have its own tools and checks |
| Next step depends on retrieved information or tool results | Bounded agent loop | The model can choose among permitted next actions based on observations |
| Independent read-only subtasks can run concurrently | Orchestrator-worker pattern, if measured benefit exceeds coordination cost | Workers can reduce elapsed time, but add calls, merge work, and failure modes |

Begin with the simplest pattern that meets the requirement. An agent is not a substitute for application authorization, validation, or a fixed business process.

## Define the harness before enabling autonomy

For this scenario, the application—not the model—owns the loop, state transitions, and permission checks:

1. Provide only the required tools, such as a read-only policy search and order lookup, plus a ticket-draft operation if needed.
2. Receive the model response and inspect its typed content blocks and documented stop reason.
3. For each requested tool call, validate the tool name, input schema, caller identity, and authorization policy before execution. A model-generated argument is untrusted input.
4. Execute an allowed operation with bounded timeouts and side-effect protections. Return each tool result against its corresponding `tool_use_id`; make errors explicit.
5. Continue only while the request remains within the turn, tool-call, time, and cost budgets. Stop on completion, denial, cancellation, or budget exhaustion and explain the handoff where appropriate.
6. Before a refund, require the support lead's approval in trusted application code. The assistant may draft the request, but model text cannot grant the permission or execute the financial action.

The loop can be represented as `MODEL → POLICY CHECK → TOOL → RESULT → MODEL`, with terminal outcomes such as `COMPLETE`, `DENIED`, `HANDOFF`, and `BUDGET_EXHAUSTED`. Log the outcome and relevant request/configuration identifiers without logging sensitive content unnecessarily.

## State, memory, and parallel work

- Keep session context separate from durable business state. Store orders, approvals, and audit records in the application's authorized systems, not in an implicit conversational memory.
- Persist only what a later step needs; define retention, access control, and deletion for any saved summary or memory.
- Use context isolation when a subtask benefits from a focused input or must not see unrelated data. Isolation is not itself a security boundary; enforce permissions at the tool/service layer.
- Parallelize only independent work. Do not run dependent steps concurrently, and account for partial failures, merge quality, added model calls, and cost.
- If a task is fully predictable, a fixed workflow is easier to recover and test than an agent loop that can make no useful decisions.

## Select an implementation and deployment boundary

| Option | Useful when | Questions to resolve |
|---|---|---|
| Application-owned loop | The product needs explicit control over tools, authorization, budgets, or state transitions | Who owns retries, persistence, observability, and recovery? |
| Agent SDK or framework | Its session, tool, or runtime primitives fit the use case | Can required security checks, limits, and traces be enforced and tested? |
| Managed execution | Reducing runtime operations is valuable and the managed boundary meets requirements | Where do data, identity, network access, logs, and tool execution reside? |

Choose based on operational requirements, not framework familiarity alone. In every option, keep irreversible side effects behind application-controlled authorization and approval.

## Original practice question

An agent checks a support case using permitted read-only tools. Which rule should terminate its loop?

- A. Continue until the model repeats the same tool request twice.
- B. Stop only when the model emits a final answer to the user after checks.
- C. Allow the model to declare when its own run-time budget ends.
- D. Stop on completion, denial, cancellation, or exhausted budgets.

**Best answer: D.** The harness owns termination and must stop on a terminal outcome or when a bounded resource limit is reached. A can loop indefinitely, B can keep a failed or denied run alive, and C lets the model set its own limit rather than enforcing an application budget.

## Review checklist

- Can you explain why an agent is needed instead of a fixed workflow for the scenario?
- Can you name the loop's allowed tools, authorization boundary, stop conditions, and resource budgets?
- Can you distinguish session context from durable memory and parallelize only independent work?

## Sources and related material

- [CCDV-F Exam Blueprint and Coverage](../exam-blueprint-and-coverage/) — objective names and weights.
- [Tool Use Overview](https://platform.claude.com/docs/en/agents-and-tools/tool-use/overview) — current Messages API tool-use behavior.
- [Building agents with the Claude Agent SDK](https://www.anthropic.com/engineering/building-agents-with-the-claude-agent-sdk) and [Building effective agents](https://www.anthropic.com/engineering/building-effective-agents) — agent loop and design patterns.
- [D1 - Agents and Workflows MOC](../d1-agents-and-workflows-moc/) · [D7 - Security and Safety MOC](../d7-security-and-safety-moc/) · [D8 - Tools and MCPs MOC](../d8-tools-and-mcps-moc/) · [Source Register](../source-register/).