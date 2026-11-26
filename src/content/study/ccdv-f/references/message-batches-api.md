---
title: "Message Batches API"
type: concept
certification: CCDV-F
status: draft
dominio: D5
tags:
- certification/ccdv-f
- domain/d5-model-selection-optimization
- concept/batch-processing
- concept/async
aliases:
- Message Batches
- Batch API
- Claude batch processing
updated: '2026-11-15'
---

A separate pattern for bulk offline workloads: submit a large set of requests in one call, receive
an identifier, and poll for completion. Can take up to 24 hours and runs at a lower per-token cost.

## Connections

- [Asynchronous patterns for high-volume work](../asynchronous-patterns-for-high-volume-work/)
- [AsyncAnthropic](../asyncanthropic/)
- [Synchronous, streaming, and real-time responses](../synchronous-streaming-and-real-time-responses/)

## Sources

- [CCDV-F - Apuntes de Skilljar](../ccdv-f-apuntes-de-skilljar/)
- [Claude Platform · Batch processing](https://platform.claude.com/docs/en/build-with-claude/batch-processing)