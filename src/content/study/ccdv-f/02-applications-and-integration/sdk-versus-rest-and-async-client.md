---
title: "SDK versus REST and Async Client"
aliases: []
type: atomic-note
certification: CCDV-F
domain: D2
domain_name: Applications and Integration
status: study-synthesis
source_kind: official-blueprint-and-documentation
updated: '2026-11-15'
tags:
- certification/ccdv-f
- domain/applications-integration
- type/concept
---

> Official SDKs wrap REST transport, serialization and some retry/error behavior. Raw HTTP gives
> explicit protocol control but increases integration work.

**Blueprint area:** [D2 - Applications and Integration MOC](../d2-applications-and-integration-moc/)
(official domain weight 33.1%).

## Engineering principles

- Prefer a supported SDK when its features, instrumentation and platform constraints match the
  service; verify SDK compatibility with needed API features.
- Choose synchronous waiting for straightforward low-concurrency workflows, async clients for many
  concurrent I/O-bound requests, and streaming for progressive user output.
- Concurrency is not the same as batch processing: async requests still use real-time request
  semantics and limits.
- Wrap client use in an application adapter so the domain remains independent of vendor request DTOs
  and status details.

## Failure modes

- An unbounded task pool can overwhelm rate limits despite async I/O.
- Version upgrades can change defaults; pin and test SDK and model behavior.

## Check your understanding

- ☐ Which request-specific and global timeouts are enforced?
- ☐ Can an adapter be swapped for a deterministic test fake?

## Related knowledge

[Batch Processing and High-Volume Work](../batch-processing-and-high-volume-work/) · [Retries Timeouts and Idempotency](../retries-timeouts-and-idempotency/) · [Exam Blueprint and Coverage](../exam-blueprint-and-coverage/)

## Evidence and verification

- **Provenance:** author-written engineering synthesis aligned to exam guide objectives; this is
  **not** a transcript or hidden Skilljar lesson.
- **Primary references:**
    - [guide](https://drive.google.com/file/d/1aWhE373XnbPEcYbzXV6VjRfjHpUQdM9s/view)
    - [api](https://platform.claude.com/docs/en/api/messages)
- **Check currency:** model options, pricing, API flags, release-specific behavior and runtime
  permissions can change after the source was read. See [Source Register](../source-register/).
