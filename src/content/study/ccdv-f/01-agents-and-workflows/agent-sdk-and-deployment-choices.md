---
title: "Agent SDK and Deployment Choices"
aliases: []
type: atomic-note
certification: CCDV-F
domain: D1
domain_name: Agents and Workflows
status: study-synthesis
source_kind: official-blueprint-and-documentation
updated: '2026-11-25'
tags:
- certification/ccdv-f
- domain/agents-workflows
- type/concept
---

> Use a custom loop for maximum control, an Agent SDK for higher-level session/tool orchestration,
> or a managed execution service when operational ownership changes.

**Blueprint area:** [D1 - Agents and Workflows MOC](../d1-agents-and-workflows-moc/) (official
domain weight 14.7%).

## Engineering principles

- Compare alternatives on required observability, persistence, cost controls, network access, tool
  execution, identity, and approval policy.
- Self-hosting provides direct control of runtime and secrets but creates responsibility for
  scheduling, retries, scaling, maintenance and recovery.
- Managed hosting may reduce infrastructure work but must be evaluated for data location, tenancy,
  tool access, and vendor-specific behavior.
- Frameworks such as LangGraph, Strands, or PydanticAI are abstractions; their value depends on
  workflow needs, not certification buzzwords.

## Failure modes

- Overfitting to one framework hides critical tool and memory semantics.
- Cloud convenience is not evidence of compliance or workload portability.

## Check your understanding

- ☐ Document what happens if the agent process terminates midway through a tool call.
- ☐ List operational obligations for each hosting option.

## Related knowledge

[Agent Loop and Termination](../agent-loop-and-termination/) · [Cloud Providers and Deployment Tradeoffs](../cloud-providers-and-deployment-tradeoffs/) · [Exam Blueprint and Coverage](../exam-blueprint-and-coverage/)

## Evidence and verification

- **Provenance:** author-written engineering synthesis aligned to exam guide objectives; this is
  **not** a transcript or hidden Skilljar lesson.
- **Primary references:**
    - [guide](https://drive.google.com/file/d/1aWhE373XnbPEcYbzXV6VjRfjHpUQdM9s/view)
    - [building-agents](https://www.anthropic.com/engineering/building-effective-agents)
    - [Claude Managed Agents overview](https://platform.claude.com/docs/en/managed-agents/overview)
    - [SDKs, CLI, and libraries](https://platform.claude.com/docs/en/cli-sdks-libraries/overview)
- **Check currency:** model options, pricing, API flags, release-specific behavior and runtime
  permissions can change after the source was read. See [Source Register](../source-register/).
