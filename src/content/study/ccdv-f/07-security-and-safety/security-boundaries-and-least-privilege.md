---
title: "Security Boundaries and Least Privilege"
aliases: []
type: atomic-note
certification: CCDV-F
domain: D7
domain_name: Security and Safety
status: study-synthesis
source_kind: official-blueprint-and-documentation
updated: '2026-11-24'
tags:
- certification/ccdv-f
- domain/security-safety
- type/concept
---

> Credentials and data access must be scoped to the caller and task rather than the agent’s
> convenience.

**Blueprint area:** [D7 - Security and Safety MOC](../d7-security-and-safety-moc/) (official domain
weight 8.1%).

## Engineering principles

- Use per-user or workload identity, least-privilege roles, permission checks on each tool request
  and tenant-aware data filtering.
- Separate read-only analysis tools from write-capable operations; approval is mandatory where
  policy or risk demands it.
- Keep credentials out of prompts, markdown files, logs and tool outputs; use a secret manager and
  rotation policy.
- Check data retention, privacy, encryption, auditability and provider boundary before connecting
  regulated data.

## Failure modes

- A shared service account can bypass user-level authorization.
- Embedding API keys in an MCP server command or repository is not safe secret management.

## Check your understanding

- ☐ Audit a tool call from an unauthorized tenant.
- ☐ Verify that read-only permissions genuinely prevent writes.

## Related knowledge

[MCP Transport and Authorization](../mcp-transport-and-authorization/) · [Prompt Injection and Data Trust Boundaries](../prompt-injection-and-data-trust-boundaries/) · [Exam Blueprint and Coverage](../exam-blueprint-and-coverage/)

## Evidence and verification

- **Provenance:** author-written engineering synthesis aligned to exam guide objectives; this is
  **not** a transcript or hidden Skilljar lesson.
- **Primary references:**
    - [guide](https://drive.google.com/file/d/1aWhE373XnbPEcYbzXV6VjRfjHpUQdM9s/view)
    - [mcp-authorization](https://modelcontextprotocol.io/specification/2026-07-28/basic/authorization) —
      direct review was rate-limited; see [Source Register](../source-register/) for the
      indexed-evidence limitation.
- **Check currency:** model options, pricing, API flags, release-specific behavior and runtime
  permissions can change after the source was read. See [Source Register](../source-register/).
