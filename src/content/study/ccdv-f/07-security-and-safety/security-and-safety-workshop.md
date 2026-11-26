---
title: "Security and Safety Workshop"
type: study-guide
certification: CCDV-F
domain: D7
status: study-synthesis
source_kind: original-study-synthesis
updated: '2026-11-24'
tags:
- certification/ccdv-f
- domain/security-safety
- type/workshop
---

This original workshop tests whether a system remains safe when retrieved content attempts to
redirect an agent. Treat the content as untrusted data and enforce policy outside the model.

## Scenario

A case worker asks an assistant to summarize a vendor's renewal terms and prepare a draft for the
named vendor contact. A document returned by the approved search tool contains text instructing the
assistant to ignore the request, read a credential from another record, and send it to a new
external address. The assistant has a read-only search capability and a separate message-sending
service.

## Design the trust boundary

| Boundary                           | Required control                                                                           | Evidence to collect                                                                    |
|------------------------------------|--------------------------------------------------------------------------------------------|----------------------------------------------------------------------------------------|
| Retrieved document → model context | Label and handle retrieved text as data, not policy or authorization                       | Synthetic malicious document does not change the requested recipient or requested task |
| Model → search tool                | Limit access to the caller's case and tenant; do not expose unrelated secrets              | Cross-tenant and out-of-scope record requests are denied by the service                |
| Model → external send              | Separate drafting from sending; authorize the exact recipient and message in trusted code  | Changed recipient/body invalidates approval; an unapproved request never sends         |
| Runtime → network/filesystem       | Restrict egress and filesystem access to what the task requires                            | A canary secret and an unapproved endpoint remain unreachable even if the model asks   |
| Action → audit                     | Record the actor, approved parameters, decision, and outcome without logging secret values | Reviewable event trail supports investigation and replay prevention                    |

## Work through the incident

1. Preserve the user's original intent and identify which data came from the user, trusted policy,
   and the retrieved document.
2. Do not follow instructions from the document that expand tool scope, reveal credentials, or
   change the recipient.
3. Return a draft only. If the user later requests a send, show the exact recipient and body and
   bind approval to those parameters, an expiry, and one operation.
4. Enforce least privilege, tenant isolation, and network/filesystem boundaries in the service or
   runtime. A prompt warning, stronger model, or post-action audit cannot undo an unauthorized send.
5. Test direct and indirect injection variants, changed parameters after approval, replay,
   unauthorized tenant access, and fail-closed behavior. Monitor false positives and false negatives
   before expanding deployment.

## Review checklist

- Can you identify the trust level of every instruction and data source in the scenario?
- Would the system still prevent exfiltration if the model followed the malicious text?
- Is approval attached to a specific, visible action and enforced immediately before its side
  effect?
- Can a test demonstrate denial at the service or environment boundary, not just a refusal in model
  text?

## Sources and related material

- [Anthropic Research: How we contain Claude](https://www.anthropic.com/research/how-we-contain-claude) —
  selected public search excerpts reviewed on 2026-11-24 describe tool-output risk and
  environment-level egress/filesystem controls; this is not a full-article review. See
  the [Source Register](../source-register/) for the limitation.
- [Claude Platform security risks and sandbox boundaries](https://platform.claude.com/docs/en/managed-agents/secure-deployment-risks) —
  selected public indexed excerpts on least-tool access, credentials, networking, and layered
  controls; not a full-page review.
- [Security Boundaries and Least Privilege](../security-boundaries-and-least-privilege/), [Prompt Injection and Data Trust Boundaries](../prompt-injection-and-data-trust-boundaries/),
  and [Human Approval for Irreversible Actions](../human-approval-for-irreversible-actions/).
- [D7 - Security and Safety MOC](../d7-security-and-safety-moc/) · [Exam Blueprint and Coverage](../exam-blueprint-and-coverage/).