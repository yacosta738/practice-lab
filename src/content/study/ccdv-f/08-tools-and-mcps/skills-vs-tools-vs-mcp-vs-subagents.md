---
title: "Skills vs Tools vs MCP vs Subagents"
aliases: []
type: atomic-note
certification: CCDV-F
domain: D8
domain_name: Tools and MCPs
status: study-synthesis
source_kind: official-blueprint-and-documentation
updated: '2026-11-24'
tags:
- certification/ccdv-f
- domain/tools-mcp
- type/concept
---

> These extension mechanisms address different problems: procedures, capabilities, portability and
> delegated context.

**Blueprint area:** [D8 - Tools and MCPs MOC](../d8-tools-and-mcps-moc/) (official domain weight
10.6%).

## Engineering principles

- **Skill:** a reusable documented procedure/instruction package, often activated from intent and
  backed by local files/scripts.
- **Tool:** an executable capability available to the model through an API/schema and controlled by
  the host.
- **MCP server:** a standard way to expose multiple tools/resources/prompts to multiple compatible
  hosts.
- **Subagent:** a specialized delegated execution context with its own instructions and bounded
  tools.

## Failure modes

- A skill cannot replace runtime permission checks for an external write.
- A subagent is not a new transport protocol and does not inherently make a tool portable.

## Check your understanding

- ☐ Given a reusable internal inventory API, choose MCP if multiple hosts must share it.
- ☐ Given a repeatable code-review checklist, choose a skill; for isolated investigation, choose a
  subagent.

## Related knowledge

[MCP Architecture Tools Resources and Prompts](../mcp-architecture-tools-resources-and-prompts/) · [Claude Code Settings and Memory Hierarchy](../claude-code-settings-and-memory-hierarchy/) · [Exam Blueprint and Coverage](../exam-blueprint-and-coverage/)

## Evidence and verification

- **Provenance:** author-written engineering synthesis aligned to exam guide objectives; this is
  **not** a transcript or hidden Skilljar lesson.
- **Primary references:**
    - [guide](https://drive.google.com/file/d/1aWhE373XnbPEcYbzXV6VjRfjHpUQdM9s/view)
    - [code-skills](https://code.claude.com/docs/en/skills)
    - [code-agents](https://code.claude.com/docs/en/sub-agents)
    - [mcp-tools](https://modelcontextprotocol.io/specification/2026-07-28/server/tools)
- **Check currency:** model options, pricing, API flags, release-specific behavior and runtime
  permissions can change after the source was read. See [Source Register](../source-register/).
