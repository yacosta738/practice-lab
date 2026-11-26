---
title: "How a developer reaches Claude: SDK versus raw REST"
type: concept
certification: CCDV-F
status: draft
dominio: D2
tags:
- certification/ccdv-f
- domain/d2-applications-integration
- concept/sdk
- concept/rest-api
aliases:
- SDK vs REST
- SDK versus raw REST
updated: '2026-11-15'
---

At its core, Claude is reached over an HTTP REST API: your code sends a request to an endpoint with
your API key and a JSON body, and reads a JSON response back. You can call that endpoint directly
with any HTTP client. More commonly you use an official SDK, available for Python and TypeScript
among others, which is a thin convenience layer over the same REST API. It handles authentication,
request construction, retries, and response parsing so you write less boilerplate. The SDK and raw
REST reach the same API and the same model. The SDK saves you from assembling requests by hand.
Module 2 builds against the SDK and the Messages API, which sits on this same foundation.

## Connections

- [AsyncAnthropic](../asyncanthropic/)
- [Asynchronous patterns for high-volume work](../asynchronous-patterns-for-high-volume-work/)
- [Synchronous, streaming, and real-time responses](../synchronous-streaming-and-real-time-responses/)

## Sources

- [CCDV-F - Apuntes de Skilljar](../ccdv-f-apuntes-de-skilljar/)