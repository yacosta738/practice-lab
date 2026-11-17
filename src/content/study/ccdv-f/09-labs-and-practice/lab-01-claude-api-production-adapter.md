---
title: "Lab 01 - Claude API Production Adapter"
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
**Goal:** build a reliable provider adapter behind a clean application port, with a fake client for tests.

**Scope:** TypeScript or Python SDK; custom API client optional. No real credentials in Git.

## Deliverables

- A `generate()` port and a provider adapter mapping typed request/response blocks.
- A tool dispatcher that pairs `tool_use` to `tool_result`, including parallel requests and `is_error` responses.
- An SSE consumer that handles `message_start`, content deltas, stop reasons, late error events and disconnects.
- A bounded retry policy with max attempts, timeouts, jitter and a test confirming no retry of invalid requests.
- A fixture demonstrating that partial generated JSON is rejected; usage/cost telemetry.

## Acceptance tests

- ☐ Client tool is invoked once and answered using matching ID.
- ☐ Two parallel tools return in one valid result turn.
- ☐ A malformed tool input triggers an error without side effects.
- ☐ An SSE stream failing after HTTP 200 is marked incomplete.
- ☐ Idempotent retries terminate within the budget.

**Related:** [Messages API Contract](../messages-api-contract/) · [Tool Schema and Tool Result Lifecycle](../tool-schema-and-tool-result-lifecycle/) · [Streaming SSE and Recovery](../streaming-sse-and-recovery/) · [Retries Timeouts and Idempotency](../retries-timeouts-and-idempotency/).
