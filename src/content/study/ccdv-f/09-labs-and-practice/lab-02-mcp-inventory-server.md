---
title: "Lab 02 - MCP Inventory Server"
type: lab
certification: CCDV-F
status: to-do
source_kind: author-proposed-exercise
updated: '2026-11-15'
tags:
- certification/ccdv-f
- type/lab
- method/hands-on
---

**Goal:** implement a small MCP service for querying an inventory source, then harden the
authorization boundary.

## Deliverables

- Local stdio server with `list_inventory` (read-only) and `adjust_stock` (write) tool schemas;
  optionally a resource and a prompt.
- Test client/inspector confirming initialization, capabilities, tool discovery, expected input and
  structured output.
- Explicit tenant identity and per-action authorization; the model cannot authorize itself.
- Human approval policy for `adjust_stock`, audit event and idempotency key.
- Design note comparing stdio against Streamable HTTP remote deployment and security implications.

## Acceptance tests

- ☐ Stdio writes JSON-RPC only to stdout; logs go to stderr.
- ☐ Unauthorized tenant receives denial before backend mutation.
- ☐ Duplicate write request does not double-adjust stock.
- ☐ Untrusted `notes` field attempting to override instructions cannot change granted authority.

**Related:** [MCP Architecture Tools Resources and Prompts](../mcp-architecture-tools-resources-and-prompts/) · [MCP Transport and Authorization](../mcp-transport-and-authorization/) · [MCP Server Design and Verification](../mcp-server-design-and-verification/) · [Security Boundaries and Least Privilege](../security-boundaries-and-least-privilege/).
