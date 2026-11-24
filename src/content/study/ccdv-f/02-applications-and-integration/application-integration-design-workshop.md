---
title: "Application Integration Design Workshop"
type: study-guide
certification: CCDV-F
domain: D2
status: study-synthesis
source_kind: original-study-synthesis
updated: '2026-11-24'
tags:
- certification/ccdv-f
- domain/applications-integration
- type/workshop
---
This original workshop connects the six D2 blueprint areas in one production-design exercise. It is a study synthesis, not an official answer key or a transcript of gated course material. Start from the requirements; do not select an API pattern or model before identifying the constraints.

## Scenario

A support team wants an assistant that answers policy questions using approved documents, summarizes an attached invoice, and can prepare a support ticket. Users expect an interactive response. A ticket must not be duplicated after a timeout, and the assistant must never issue a refund; a support lead makes that decision. Requests and documents may contain personal data.

Before implementation, write acceptance criteria that can be tested:

- Answers cite or identify the approved evidence used; unsupported questions are handed off rather than answered with invented policy.
- The service meets a measured response-time target for interactive use and reports when it cannot complete a request.
- Ticket creation is authorized, auditable, and safe to retry; refund execution is outside the assistant's permissions.
- Personal data is sent only to approved services and retained according to the product's policy.
- Quality, latency, failure rate, and cost are measured on representative cases, including ambiguous and adversarial inputs.

## Convert constraints into design decisions

| Constraint | Design choice | Evidence to collect |
|---|---|---|
| User is waiting for an answer | Use a real-time request; stream if progressive output improves the experience and the client can handle partial output | End-to-end and time-to-first-token latency, disconnect behavior |
| Work can finish later and has no interactive deadline | Consider asynchronous or batch processing; do not present it as an interactive response | Completion time, reconciliation and error handling |
| Output drives an application action | Parse typed response blocks, validate the expected structure and business rules, then call the application service | Valid/invalid output tests and action audit trail |
| Ticket creation may be retried after an uncertain timeout | Use an application-level idempotency strategy and reconcile by operation ID before repeating a side effect | Duplicate-operation tests under timeout and replay |
| Policy decisions involve restricted actions | Give the assistant only the tools needed to prepare or read a case; enforce role checks and approval in trusted services | Denial and unauthorized-caller tests |
| API behavior or prompt changes | Version the model choice, prompt, tool schema, and configuration; run regression evaluations before rollout | Reproducible request traces and release comparison |

## Follow the request through the system

1. **Define the contract.** Specify accepted inputs, supported document types, required output fields, refusal/handoff conditions, latency target, and ownership of each side effect.
2. **Build the request at a server-side boundary.** Keep credentials out of the browser. Version the prompt, tool definitions, API/client dependency, and selected model configuration so an observed result can be reproduced.
3. **Handle the response as structured data.** A Messages API response may contain multiple content blocks. Inspect the documented stop reason; a tool-use request is not evidence that the tool ran, and a token-limit stop is not a complete answer. Validate any machine-consumed output before using it.
4. **Choose the delivery mode to match the latency contract.** Streaming supports progressive delivery, while a batch interface suits work whose caller can wait for asynchronous completion. Async concurrency alone does not turn real-time requests into batch processing.
5. **Make failure behavior explicit.** Apply bounded retries only to eligible transient failures, respect server hints when available, and do not retry validation or authorization failures blindly. A lost response after a mutation is ambiguous: reconcile or use a stable idempotency key before attempting it again.
6. **Release against evidence.** Test normal, boundary, malformed, unauthorized, timeout, provider-error, and duplicate-request cases. Roll out gradually, monitor quality and operational metrics, and retain a rollback path for prompt, model, or dependency changes.

See [Messages API Contract](../messages-api-contract/), [SDK versus REST and Async Client](../sdk-versus-rest-and-async-client/), [Streaming SSE and Recovery](../streaming-sse-and-recovery/), [Retries Timeouts and Idempotency](../retries-timeouts-and-idempotency/), and [Requirements and AI System Lifecycle](../requirements-and-ai-system-lifecycle/) for the individual concepts.

## Original practice question

The service sends a ticket-creation request, times out before receiving a response, and cannot tell whether the ticket was created. What is the safest next design action?

- A. Retry immediately with a new operation ID; handle duplicates after the fact.
- B. Reconcile by operation ID, then retry idempotently if needed.
- C. Ask the model whether the ticket has already been saved.
- D. Raise the token limit and send a fresh ticket request.

**Best answer: B.** A timeout does not establish whether the side effect occurred. Reconciliation or an idempotent retry prevents creating a second ticket. A makes duplicates more likely; C delegates a transport fact to a model that cannot observe it; D does not address the uncertain mutation.

## Review checklist

- Can you distinguish a real-time request, a streamed response, async concurrency, and a batch job by their completion contract?
- Can you explain which failures are retryable and how an uncertain side effect is reconciled?
- Can you trace a user request through configuration, typed response handling, authorization, evaluation, and rollout?

## Sources and related material

- [CCDV-F Exam Blueprint and Coverage](../exam-blueprint-and-coverage/) — objective names and weights.
- [Messages API](https://platform.claude.com/docs/en/api/messages), [Streaming](https://platform.claude.com/docs/en/build-with-claude/streaming), and [Message Batches](https://platform.claude.com/docs/en/build-with-claude/batch-processing) — verify current API behavior and constraints.
- [Define success criteria and build evaluations](https://platform.claude.com/docs/en/test-and-evaluate/develop-tests) — establish measurable quality and operational criteria.
- [D2 - Applications and Integration MOC](../d2-applications-and-integration-moc/) · [D7 - Security and Safety MOC](../d7-security-and-safety-moc/) · [Source Register](../source-register/).