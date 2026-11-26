---
title: "Sampling: why the same prompt can give different answers"
type: concept
certification: CCDV-F
status: draft
dominio: D5
tags:
- certification/ccdv-f
- domain/d5-model-selection-optimization
- concept/sampling
- concept/temperature
- concept/llm-behavior
- mso-foundations
aliases:
- Token sampling
- Sampling and temperature
updated: '2026-11-15'
---

A language model does not pick one fixed next token. At each step it produces a probability
distribution over possible next tokens and then **samples** from it. Settings, such
as [temperature](../temperature/), shape that distribution: a lower temperature concentrates
probability on the most likely tokens and makes output more repeatable, while a higher temperature
spreads it out and makes output more varied. Because the choice is sampled rather than fixed, the
same prompt run twice can return different wording even when both answers are correct. This is a
property of how the model generates. Note that sampling controls are model-dependent: the newest
Claude models do not accept non-default sampling parameters. Setting temperature, top_p, or top_k
returns a 400 error, and behavior on those models is steered through prompting instead. Even where
temperature is accepted, temperature 0 makes outputs more repeatable but does not guarantee
identical outputs across calls. Confirm current parameter support in the API reference at build
time.

## Connections

- [temperature](../temperature/)
- [Non-determinism](../non-determinism/)
- [eval with a model-graded judge](../eval-with-a-model-graded-judge/)

## Sources

- [CCDV-F - Apuntes de Skilljar](../ccdv-f-apuntes-de-skilljar/)