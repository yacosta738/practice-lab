---
title: "Tools and MCP Integration Workshop"
type: study-guide
certification: CCDV-F
domain: D8
status: study-synthesis
source_kind: original-study-synthesis
updated: '2026-11-24'
tags:
- certification/ccdv-f
- domain/tools-mcp
- type/workshop
---

This original workshop follows an integration from capability discovery through execution and
verification. MCP standardizes communication; it does not make a server, tool, or returned value
trusted by itself.

## Scenario

A support product needs a read-only catalog lookup and a separate operation that can place a
shipment hold. The capabilities must be usable from a local developer host and a shared remote host.
The remote service is tenant-aware; an incorrect hold has an external business impact. The model may
request tool calls, but the application owns identity, authorization, validation, and side effects.

## Select and map the boundary

| Need                                                 | Design choice                                                                     | Verify                                                                                                                            |
|------------------------------------------------------|-----------------------------------------------------------------------------------|-----------------------------------------------------------------------------------------------------------------------------------|
| One application owns a narrow operation              | A native application tool may be simpler than a separate protocol server          | The host validates schema, caller, tenant, permissions, and result                                                                |
| Multiple compatible hosts need the same capabilities | An MCP server can expose declared tools and other supported capabilities          | Initialization and capability negotiation; do not assume every server supports resources or prompts                               |
| A developer runs an isolated local server            | `stdio` can connect the client to a launched process                              | Protocol messages stay on stdout; diagnostics go to stderr; credentials remain scoped                                             |
| A shared remote service is required                  | Use the current versioned HTTP transport and its documented authorization profile | Validate `Origin`; reject invalid origins; authenticate each protected request and authorize the caller at the operation boundary |

## Trace one tool call

1. The host initializes an MCP client and records the server's negotiated capabilities.
2. The client discovers the available tool schema. The application allows only the intended catalog
   lookup or hold operation for this user and tenant.
3. The model's requested operation is untrusted input. Validate the tool name, schema, resource
   scope, and business authorization before dispatch.
4. The server executes the operation and returns a result correlated to the request. Preserve
   structured output and distinguish a protocol/request failure from a tool-execution failure; do
   not turn an error result into success.
5. A shipment hold requires a separate application approval bound to the exact shipment and action.
   The model's request or an MCP capability does not grant that approval.

## Verify the remote boundary

- Follow the
  versioned [MCP authorization specification](https://modelcontextprotocol.io/specification/2026-07-28/basic/authorization)
  for HTTP authorization; bind tokens to the intended resource, do not place access tokens in URLs,
  and do not pass an inbound token through to an upstream service.
- Validate the `Origin` header as required by
  the [Streamable HTTP transport](https://modelcontextprotocol.io/specification/2026-07-28/basic/transports);
  test that an invalid origin is rejected before a tool executes.
- Test capability negotiation, malformed arguments, unauthorized tenants, invalid/expired
  credentials, structured and error results, cancellation, and duplicate calls.
- Keep authentication, authorization, rate limits, output validation, and audit records at trusted
  service boundaries; tool descriptions and model instructions are not enforcement.

The authorization page was rate-limited during direct review; its requirements were cross-checked
with public indexed excerpts. Treat the [Source Register](../source-register/) as the access-status
record and re-check the versioned specification before deployment.

## Review checklist

- Can you explain which component chooses a tool, which component executes it, and which component
  enforces permission?
- Is each exposed capability narrow, schema-validated, tenant-scoped, and tested for both success
  and failure?
- Does the transport and authorization choice match the local or remote deployment boundary?

## Sources and related material

- [MCP Specification 2026-07-28: transports](https://modelcontextprotocol.io/specification/2026-07-28/basic/transports), [tools](https://modelcontextprotocol.io/specification/2026-07-28/server/tools),
  and [authorization](https://modelcontextprotocol.io/specification/2026-07-28/basic/authorization).
- [Tool Schema and Tool Result Lifecycle](../tool-schema-and-tool-result-lifecycle/), [MCP Server Design and Verification](../mcp-server-design-and-verification/),
  and [MCP Transport and Authorization](../mcp-transport-and-authorization/).
- [D8 - Tools and MCPs MOC](../d8-tools-and-mcps-moc/) · [D7 - Security and Safety MOC](../d7-security-and-safety-moc/) · [Source Register](../source-register/).