---
title: "MCP Transport and Authorization"
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
> MCP standard transports include stdio for local process communication and Streamable HTTP for networked servers; identity and trust remain separate design decisions.

**Blueprint area:** [D8 - Tools and MCPs MOC](../d8-tools-and-mcps-moc/) (official domain weight 10.6%).

## Engineering principles

- With **stdio**, the client launches a subprocess, JSON-RPC messages use stdin/stdout, and logs must go to stderr rather than corrupting protocol output.
- With **Streamable HTTP**, address endpoint authorization, session handling, origin validation and transport threats according to the current specification.
- Never assume using HTTP implies OAuth is automatically enforced; implement the authorization model appropriate to your client/server deployment.
- Use scoped service identities, rate limits and input validation independent of transport.

## Failure modes

- Printing debug logs to stdout can break stdio protocol framing.
- Treating remotely supplied arguments as trusted can expose internal networks or secrets.

## Check your understanding

- ☐ Test JSON-RPC message exchange over both transports in an isolated lab.
- ☐ Verify an unauthenticated remote client cannot call a privileged tool.

## Related knowledge

[MCP Architecture Tools Resources and Prompts](../mcp-architecture-tools-resources-and-prompts/) · [Security Boundaries and Least Privilege](../security-boundaries-and-least-privilege/) · [Exam Blueprint and Coverage](../exam-blueprint-and-coverage/)

## Evidence and verification

- **Provenance:** author-written engineering synthesis aligned to exam guide objectives; this is **not** a transcript or hidden Skilljar lesson.
- **Primary references:**
  - [guide](https://drive.google.com/file/d/1aWhE373XnbPEcYbzXV6VjRfjHpUQdM9s/view)
  - [mcp-transport](https://modelcontextprotocol.io/specification/2025-11-25/basic/transports)
- **Check currency:** model options, pricing, API flags, release-specific behavior and runtime permissions can change after the source was read. See [Source Register](../source-register/).
