---
title: "Synchronous, streaming, and real-time responses"
type: concept
certification: CCDV-F
status: draft
dominio: D2
tags:
- certification/ccdv-f
- domain/d2-applications-integration
- concept/streaming
- concept/sync
- concept/responses
aliases:
- Sync vs streaming
- Response delivery modes
updated: '2026-11-15'
---
A **synchronous** request is the simplest pattern: you send the request and wait for the complete response to come back in one piece, then act on it. That is fine for short responses and backend jobs where no one is waiting. When a response is long or a user is watching, **streaming** sends the response in pieces as the model generates it. Output appears immediately rather than after a blank-screen wait, and your code reassembles the pieces into the final message. Claude exposes streaming over the same HTTP connection using server-sent events. Module 2 teaches how to consume a stream safely and recover when it is interrupted.

## Connections

- [Asynchronous patterns for high-volume work](../asynchronous-patterns-for-high-volume-work/)
- [How a developer reaches Claude - SDK versus raw REST](../how-a-developer-reaches-claude-sdk-versus-raw-rest/)
- [AsyncAnthropic](../asyncanthropic/)

## Sources

- [CCDV-F - Apuntes de Skilljar](../ccdv-f-apuntes-de-skilljar/)