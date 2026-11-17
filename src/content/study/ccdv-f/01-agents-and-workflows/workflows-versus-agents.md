---
title: "Workflows versus Agents"
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
> A workflow follows developer-defined branches; an agent uses the model to decide intermediate steps and tool calls. Prefer the simplest control structure that solves the requirement.

**Blueprint area:** [D1 - Agents and Workflows MOC](../d1-agents-and-workflows-moc/) (official domain weight 14.7%).

## Engineering principles

- Choose **prompt chaining** when the sequence is known (extract → validate → summarize); add deterministic gates between stages.
- Choose **routing** when the request can be classified into separate paths; each path may use a different prompt, model, or toolset.
- Choose an **agent loop** when the next step cannot be known in advance, such as exploring an unfamiliar repository or investigating a changing environment.
- Write explicit stop criteria, budgets and owner of side effects. An agent is not automatically more accurate than a well-defined workflow.

## Failure modes

- Autonomy without a termination condition produces cost overruns or repetitive calls.
- Using an agent for predictable ETL obscures correctness and makes troubleshooting unnecessarily complex.

## Check your understanding

- ☐ Can you express this as a static state machine first?
- ☐ What must remain deterministic, and which decisions require a model?

## Related knowledge

[Agent Loop and Termination](../agent-loop-and-termination/) · [Orchestrator Worker and Parallelization](../orchestrator-worker-and-parallelization/) · [Exam Blueprint and Coverage](../exam-blueprint-and-coverage/)

## Evidence and verification

- **Provenance:** author-written engineering synthesis aligned to exam guide objectives; this is **not** a transcript or hidden Skilljar lesson.
- **Primary references:**
  - [guide](https://drive.google.com/file/d/1aWhE373XnbPEcYbzXV6VjRfjHpUQdM9s/view)
  - [building-agents](https://www.anthropic.com/engineering/building-effective-agents)
- **Check currency:** model options, pricing, API flags, release-specific behavior and runtime permissions can change after the source was read. See [Source Register](../source-register/).
