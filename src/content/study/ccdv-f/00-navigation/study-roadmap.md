---
title: "Study Roadmap"
type: moc
certification: CCDV-F
status: verified
source_kind: study-plan
updated: '2026-11-15'
tags:
- certification/ccdv-f
- type/roadmap
- method/active-recall
---

> A four-stage **proposed study workflow**, not official Anthropic coursework. Use the
> weighted [Exam Blueprint and Coverage](../exam-blueprint-and-coverage/) and require evidence of
> competency rather than reading progress alone.

## Stage 1 — API and integration (foundation)

Read [D2 - Applications and Integration MOC](../d2-applications-and-integration-moc/)
and [D5 - Model Selection and Optimization MOC](../d5-model-selection-and-optimization-moc/).
Implement [Lab 01 - Claude API Production Adapter](../lab-01-claude-api-production-adapter/) with
strict input/output contracts, streaming and retry policy. Measure cost and error classes.

**Exit criterion:** explain the complete tool_result round trip, distinguish streaming from async
and batch, and diagnose a partial stream.

## Stage 2 — Agents, context and tooling

Read [D1 - Agents and Workflows MOC](../d1-agents-and-workflows-moc/), [D6 - Prompt and Context Engineering MOC](../d6-prompt-and-context-engineering-moc/)
and [D8 - Tools and MCPs MOC](../d8-tools-and-mcps-moc/).
Implement [Lab 02 - MCP Inventory Server](../lab-02-mcp-inventory-server/); add an agent runtime
with clear stop criteria and least-privilege access.

**Exit criterion:** defend a workflow-vs-agent architecture decision, correct a prompt-injection
attempt and trace a multi-tool run.

## Stage 3 — Reliability, Claude Code and security

Read [D7 - Security and Safety MOC](../d7-security-and-safety-moc/), [D4 - Eval, Testing, and Debugging MOC](../d4-eval-testing-and-debugging-moc/)
and [D3 - Claude Code MOC](../d3-claude-code-moc/).
Complete [Lab 03 - Evaluation and Security Regression Gate](../lab-03-evaluation-and-security-regression-gate/).

**Exit criterion:** reproduce a failure with a trace, fix it with a test, and demonstrate approval
before an irreversible side effect.

## Stage 4 — Exam practice and gap closure

Use [Lab 04 - Timed Exam and Review Protocol](../lab-04-timed-exam-and-review-protocol/), then
review weak domains. Read [Knowledge Gap Backlog](../knowledge-gap-backlog/) and don't mistake
public course outline for complete private lessons.

**Exit criterion:** repeated practice performance by domain and an actual implementation portfolio;
the unofficial practice score is not an exam pass guarantee.

## Active recall loop

For each note: read definition -> close note -> explain from memory -> draw boundaries -> implement
a tiny test -> record one failure mode -> link it to the related concept. Repeat weak concepts after
1, 3 and 7 days.
