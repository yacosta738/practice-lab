---
title: "Asynchronous patterns for high-volume work"
type: concept
certification: CCDV-F
status: draft
dominio: D5
tags:
- certification/ccdv-f
- domain/d5-model-selection-optimization
- concept/async
- concept/batch-processing
aliases:
- Async patterns
- High-volume async
updated: '2026-11-15'
---

Two patterns address high-volume work, and they solve different problems.

The Python SDK exposes an async client ([AsyncAnthropic](../asyncanthropic/)) that uses non-blocking
async/await to make API calls without tying up your application thread. In the TypeScript SDK the
standard Anthropic client is Promise-based, so you await calls directly. There is no separate async
client class. Either way the request still returns in real time, but your application can handle
other work while it waits. This is the right pattern when you need concurrency without blocking.

The [Message Batches API](../message-batches-api/) is a separate pattern for bulk offline workloads.
You submit a large set of requests in one call, receive an identifier, and poll for completion.
Batch jobs can take up to 24 hours to complete and run at a lower per-token cost in exchange for
that latency. This suits offline pipelines, evaluation runs, and bulk jobs where no user is waiting
on each result and cost matters more than turnaround time.

## Connections

- [AsyncAnthropic](../asyncanthropic/)
- [Message Batches API](../message-batches-api/)
- [Synchronous, streaming, and real-time responses](../synchronous-streaming-and-real-time-responses/)

## Sources

- [CCDV-F - Apuntes de Skilljar](../ccdv-f-apuntes-de-skilljar/)