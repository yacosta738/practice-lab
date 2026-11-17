---
title: "MCP Architecture Tools Resources and Prompts"
aliases: []
type: atomic-note
certification: CCDV-F
domain: D8
domain_name: Tools and MCPs
status: study-synthesis
source_kind: official-blueprint-and-documentation
updated: '2026-11-15'
tags:
- certification/ccdv-f
- domain/tools-mcp
- type/concept
---
> Model Context Protocol separates a host, clients and servers that expose capabilities through a standard protocol.

**Blueprint area:** [D8 - Tools and MCPs MOC](../d8-tools-and-mcps-moc/) (official domain weight 10.6%).

## Engineering principles

- **Tools** are callable operations generally selected by the model in suitable hosts; their security and confirmation are host responsibilities.
- **Resources** expose data and context for host/application selection; **prompts** expose reusable prompting templates.
- The host owns user interaction, model orchestration and policy; a server exposes declared capabilities and serves requests.
- Understand initialization and capability negotiation rather than assuming every MCP server supports the same features.

## Failure modes

- A resource is not inherently an executable operation.
- Exposing a write-capable tool with a vague description can cause accidental calls.

## Check your understanding

- ☐ Explain which component initiates a tool invocation and who executes it.
- ☐ Verify a client detects a server without optional resource support.

## Related knowledge

[MCP Transport and Authorization](../mcp-transport-and-authorization/) · [Tool Schema and Tool Result Lifecycle](../tool-schema-and-tool-result-lifecycle/) · [Exam Blueprint and Coverage](../exam-blueprint-and-coverage/)

## Evidence and verification

- **Provenance:** author-written engineering synthesis aligned to exam guide objectives; this is **not** a transcript or hidden Skilljar lesson.
- **Primary references:**
  - [guide](https://drive.google.com/file/d/1aWhE373XnbPEcYbzXV6VjRfjHpUQdM9s/view)
  - [mcp-overview](https://modelcontextprotocol.io/specification/2025-11-25)
  - [mcp-tools](https://modelcontextprotocol.io/specification/2025-11-25/server/tools)
- **Check currency:** model options, pricing, API flags, release-specific behavior and runtime permissions can change after the source was read. See [Source Register](../source-register/).
