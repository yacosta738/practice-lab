---
title: "Design Integrated Workflows"
aliases: []
type: atomic-note
certification: CCAO-F
domain: D4
domain_name: Workflow Integration and Solution Design
status: study-synthesis
source_kind: official-blueprint-and-documentation
updated: '2026-11-26'
tags:
- certification/ccao-f
- domain/workflow-integration-solution-design
- type/concept
---

> Design from the work outcome backward: identify the user, inputs, decision points, review owner,
> and handoff before adding a Claude feature to the process.

**Blueprint area:** D4 - Workflow Integration and Solution Design (official domain weight 16%).

## Map the workflow before choosing a feature

Describe the current work in plain terms: who needs the result, what information is available, where
the work begins and ends, which decisions require human judgment, and what happens when information
is missing. Define the useful output and the person responsible for reviewing and acting on it.

Then select only the features that serve the workflow. Research can help explore a question across
web sources and, when available, connected services. Connectors can provide access to external
services within granted permissions. An Artifact can package a substantial result for later editing
or sharing. These features do not remove the need to check sources, permissions, and the final
handoff.

## Scenario

A program lead needs a quarterly partner brief based on internal notes and public announcements. The
lead confirms which internal files and public sources are in scope, checks that the account is
authorized to use the connector, and asks Claude to organize findings by topic and identify
uncertainties. A reviewer verifies important claims against the source material, approves the brief,
and communicates its limits to stakeholders before it is shared.

## Decision guidance

1. Define the user's outcome and the work that must remain under human control.
2. List the required sources, access permissions, and any sensitive information.
3. Choose a simple feature path that fits those needs; do not add a connector or reusable artifact
   unless it helps the task.
4. Set a review point for important claims and a fallback for missing, conflicting, or inaccessible
   information.
5. Tell stakeholders what the workflow does, what it does not establish, who reviews the result,
   and who owns the final action.
6. Measure any claimed improvement using the organization's own baseline and criteria. Do not
   promise a numeric productivity gain without evidence.

Claude Research currently requires web search to be enabled and is limited to eligible paid plans.
Research may also use connected services available to that conversation. Artifact features may
require Cloud code execution and file creation to be enabled. Plan and feature availability can
change; verify the current requirements before planning around them.

## Misconceptions

- A feature demonstration is not a complete workflow design. Ownership, review, and exception
  handling still matter.
- A connector does not grant access beyond the connected account's permissions, but that access
  still needs to be appropriate for the task.
- Research across multiple sources does not prove that every relevant source was found or that every
  summary claim is correct.
- A numerical time or productivity claim is not evidence unless it was measured for the relevant
  workflow.

## Self-check

- Who reviews the result, handles an exception, and makes the final decision?
- What evidence would support a claim that the redesigned workflow is better than the current one?

## References

- [CCAO-F Version 1.1 exam guide](https://cc.sj-cdn.net/instructor/6nizmqk8tpzpfjvt6qmmav7rh/public/1794946524/Claude_Certified_Associate_-_Foundations_Exam_Guide.pdf)
- [Use Research in Claude](https://support.claude.com/en/articles/11088861-use-research-on-claude)
- [Claude connectors and remote MCP integrations](https://support.claude.com/en/articles/11176164-pre-built-integrations-using-remote-mcp)
- [Create and use Claude Artifacts](https://support.anthropic.com/en/articles/17153992-what-are-artifacts-and-how-do-i-use-them)

## Evidence and currency

This is original study synthesis, not a claim that Claude will produce a specific business outcome.
See the [CCAO-F source register](../source-register/) for source review limits,
permissions, and changing feature prerequisites.