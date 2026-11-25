---
title: "Streaming SSE and Recovery"
aliases: []
type: atomic-note
certification: CCDV-F
domain: D2
domain_name: Applications and Integration
status: study-synthesis
source_kind: official-blueprint-and-documentation
updated: '2026-11-25'
tags:
- certification/ccdv-f
- domain/applications-integration
- type/concept
---
> Claude streaming emits named server-sent events. Render incrementally while assembling each typed content block by index, and never treat a partial stream as a validated final response.

**Blueprint area:** [D2 - Applications and Integration MOC](../d2-applications-and-integration-moc/) (official domain weight 33.1%).

## Engineering principles

- Expect `message_start`, zero or more `content_block_start/delta/stop`, `message_delta`, and finally `message_stop`; `ping` can appear throughout.
- Concatenate text deltas and partial tool-input JSON; parse a complete tool input once the relevant block is complete (or use SDK helpers).
- An error may arrive **after HTTP 200** as an SSE event. Maintain explicit stream-failed vs stream-complete states.
- Inspect the final `stop_reason` from `message_delta`; classify normal completion, truncation, tool use, refusal, and transport failure separately.
- If the transport breaks, preserve partial output only as incomplete and decide whether the operation is safe to retry.
- Recovery steps can vary by model generation; follow the current streaming guidance rather than assuming every partial response can be replayed identically.

## Failure modes

- Retrying after an action may duplicate an external side effect.
- Assuming each event holds a complete JSON value fails on partial deltas.

## Check your understanding

- ☐ Simulate a disconnect mid-tool-input and verify no tool runs with incomplete JSON.
- ☐ Ensure UI receives a completion/error signal rather than hanging.

## Related knowledge

[Messages API Contract](../messages-api-contract/) · [Retries Timeouts and Idempotency](../retries-timeouts-and-idempotency/) · [Exam Blueprint and Coverage](../exam-blueprint-and-coverage/)

## Evidence and verification

- **Provenance:** author-written engineering synthesis aligned to exam guide objectives; this is **not** a transcript or hidden Skilljar lesson.
- **Primary references:**
  - [guide](https://drive.google.com/file/d/1aWhE373XnbPEcYbzXV6VjRfjHpUQdM9s/view)
  - [streaming](https://platform.claude.com/docs/en/build-with-claude/streaming)
  - [stop-reasons](https://platform.claude.com/docs/en/build-with-claude/handling-stop-reasons)
- **Check currency:** model options, pricing, API flags, release-specific behavior and runtime permissions can change after the source was read. See [Source Register](../source-register/).
