---
title: "Advanced Agent Architecture and Orchestration"
aliases: []
type: atomic-note
certification: CCDV-P
domain: D1
domain_name: Advanced Agent Architecture and Orchestration
status: study-synthesis
source_kind: official-blueprint-and-documentation
updated: '2026-11-26'
tags:
- certification/ccdv-p
- domain/agent-architecture-orchestration
- type/concept
---

> A production agent is a controlled state machine around a model, not a transcript that happens to call tools. Make every handoff, checkpoint, and approval explicit.

**Blueprint area:** D1 — Advanced Agent Architecture and Orchestration (official domain weight **17%**).

## Choose the smallest useful architecture

Use a deterministic workflow when the decision path is known and the actions are bounded. Add model judgment for genuinely ambiguous classification or synthesis. Use multiple agents only when independent context, parallel work, or distinct permissions provide a measurable benefit over one agent or a simple workflow.

| Shape | Good fit | Main trade-off |
| --- | --- | --- |
| Deterministic workflow | Fixed validation, routing, and approval steps | Predictable and auditable, but less flexible for ambiguous work |
| Single agent with tools | One goal that needs bounded, adaptive tool selection | Flexible, but requires runtime limits and observable termination |
| Supervisor and workers | Work can be split into independent tasks with verifiable outputs | More throughput or context isolation, at the cost of coordination, duplicate work, and partial failures |

For example, route a clearly formatted invoice by deterministic rules. Use an agent to resolve an ambiguous vendor description. Only fan out invoice line checks when the checks are independent and the supervisor can validate and reconcile each result.

## Treat handoffs as contracts

Pass the minimum task envelope needed by the next worker:

- Stable task and parent-run identifiers, goal, deadline, and expected result schema.
- Allowed tools and data scope, read/write boundary, and any human-approval requirement.
- Versioned checkpoint reference and relevant evidence, not an unrestricted copy of the conversation.
- A return contract that distinguishes completed work, partial work, refusal, timeout, and failure.

The receiver should verify the envelope and the returned evidence. A worker's natural-language claim that an action was approved is not authorization; the application must bind approval to the actor, exact action, target, and current state.

## Persist trusted state, not just conversation

For a long-running case, store an application-owned checkpoint containing the task status, verified facts, pending actions, schema/version identifiers, and idempotency keys. On restart, reload that checkpoint and revalidate permissions and dependency state before continuing. Treat model-produced summaries and tool output as untrusted inputs until checked.

At an external side effect, persist intent before calling the service and record the result afterward. If the process crashes between those steps, reconcile by idempotency key or query the external system; do not infer success from the last assistant message. A model or prompt version change can alter the next decision, so resume from validated state and route material changes through evaluation or approval.

## Allocate concurrency deliberately

Bound parallel workers by provider limits, tool capacity, per-tenant quotas, and the cost of unfinished work. Use queues, deadlines, cancellation, and backpressure rather than allowing every request to fan out without limit. Partition locks or leases around shared mutable resources; make retries safe and cap duplicate work. Define a fair allocation policy so one large task cannot starve smaller users.

Human approval belongs at consequential or irreversible boundaries. Present the reviewer with the proposed action, target, evidence, and expected impact. Expire the approval if the underlying state changes, and require a new decision rather than carrying a stale approval forward.

## Failure modes

- Passing the full prompt history between workers leaks irrelevant or sensitive context and makes the handoff hard to audit.
- Treating a generated summary as durable truth loses provenance and can compound an earlier error after resume.
- Unbounded fan-out causes rate-limit bursts, excess cost, duplicate actions, and difficult partial-result handling.
- Retrying a worker after an external action without a deduplication strategy can repeat that action.
- Building a multi-agent system for a deterministic decision adds failure paths without improving the outcome.

## Check your understanding

- ☐ Which steps in your example are deterministic, and what measured benefit justifies any agent delegation?
- ☐ Can a restarted run prove which facts are trusted and whether an external action already occurred?
- ☐ Does each approval apply to one identified action and current state, or can it be reused too broadly?

## Related knowledge

[Production Integration and Grounding](../production-integration-and-grounding/) · [Debugging and Incident Response](../debugging-and-incident-response/) · [Agent Fleet Operations](../agent-fleet-operations/)

## Evidence and verification

- **Provenance:** Original production-engineering synthesis. The domain title and weight are supported by public indexed excerpts of the exam guide; detailed objectives remain only partially verified.
- **Primary references:** [Building effective agents](https://www.anthropic.com/engineering/building-effective-agents) (use architectural patterns, not its dated product details); [Tool use overview](https://platform.claude.com/docs/en/agents-and-tools/tool-use/overview); [Programmatic tool calling](https://platform.claude.com/docs/en/agents-and-tools/tool-use/programmatic-tool-calling); [Agent SDK overview](https://platform.claude.com/docs/en/cli-sdks-libraries/overview); [Claude Code subagents](https://code.claude.com/docs/en/sub-agents).
- **Check currency:** Runtime capabilities, model support, and SDK behavior can change. See the [Source Register](../source-register/).