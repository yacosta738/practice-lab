---
title: "Runtime Guardrails and Production Security"
aliases: []
type: atomic-note
certification: CCDV-P
domain: D7
domain_name: Runtime Guardrails and Production Security
status: study-synthesis
source_kind: official-blueprint-and-documentation
updated: '2026-11-26'
tags:
- certification/ccdv-p
- domain/runtime-guardrails-production-security
- type/concept
---

> The model can propose an action; application policy must decide whether the action is allowed.
> Treat user input, retrieved passages, and tool output as untrusted data.

**Blueprint area:** D7 — Runtime Guardrails and Production Security (official domain weight
**11%**).

## Enforce policy outside model instructions

Prompt rules can guide behavior, but they are not an authorization boundary. Enforce policy in the
application or tool service: identify the calling user or workload, check the requested action
against the resource and current state, validate arguments, and deny by default when identity or
policy cannot be established. Recheck authorization when a long-running task resumes; a prior model
decision or approval does not grant lasting access.

Treat indirect instructions in retrieved documents and tool results as untrusted. Keep data separate
from trusted system policy, constrain what a tool can do, validate its input and result, and require
explicit approval for sensitive or irreversible operations. Bind approval to the exact action and
target so a later tool call cannot broaden it.

## Use least privilege for tools and secrets

Give each user, agent, and tool only the permissions needed for its task. Prefer short-lived
workload credentials scoped to a specific service, repository, or resource. Keep secrets in a
managed secret store, pass them only to the component that needs them, rotate and revoke them, and
redact them from prompts, tool output, traces, and error messages. Review outbound network access
and audit high-impact operations.

For an MCP integration, assess both client and server responsibilities. Select and verify approved
servers; ask for user consent where appropriate; limit tool availability and data access; validate
inputs and outputs; and enforce authentication and authorization on the server. Review transport,
OAuth audience, redirect, and network-egress behavior. MCP's 2026-07-28 security guidance describes
important risks and mitigations, but it does not make every client control a protocol guarantee or
replace application policy.

## Make safe behavior the default

Use bounded timeouts, output-size limits, schema checks, safe fallbacks, and explicit deny behavior.
Separate read-only tools from write-capable tools. Require a human decision for high-impact actions
and make it possible to stop or revoke a run. Keep an audit trail of identity, policy decision,
tool/action, resource, approval, and result, while excluding secrets and unnecessary user content.

## Failure modes

- Trusting prompt wording to block an unauthorized tool call leaves the real permission boundary in
  the model.
- Treating a retrieved page or tool response as trusted instructions enables indirect prompt
  injection.
- Sharing one broad credential across agents makes compromise and attribution harder to contain.
- Forwarding a token to a different audience or accepting arbitrary server-provided OAuth URLs can
  expose credentials.
- Assuming an MCP client or protocol automatically enforces a product's consent, authorization, or
  safe-default policy overstates the guarantee.
- Logging entire tool payloads to simplify incident analysis creates avoidable sensitive-data
  exposure.

## Check your understanding

- ☐ Which component independently authorizes each tool call, and what is its fail-closed behavior?
- ☐ Can an untrusted tool result change policy, permissions, or the approved target?
- ☐ What credentials, approvals, and audit evidence exist for one high-impact action?

## Related knowledge

[Production Integration and Grounding](../production-integration-and-grounding/) · [Debugging and Incident Response](../debugging-and-incident-response/) · [Agent Fleet Operations](../agent-fleet-operations/)

## Evidence and verification

- **Provenance:** Original security synthesis. The domain title and weight are supported by public
  guide excerpts; detailed objectives remain partially verified.
- **Primary
  references:** [MCP security best practices, 2026-07-28](https://modelcontextprotocol.io/specification/2026-07-28/basic/security_best_practices); [MCP transports, 2026-07-28](https://modelcontextprotocol.io/specification/2026-07-28/basic/transports); [Claude tool use](https://platform.claude.com/docs/en/agents-and-tools/tool-use/overview); [Claude Code hooks](https://code.claude.com/docs/en/hooks); [Claude Code managed settings](https://code.claude.com/docs/en/managed-settings).
- **Check currency:** Security guidance and product-specific controls evolve. Verify the protocol
  version and implementation behavior. See the [Source Register](../source-register/).