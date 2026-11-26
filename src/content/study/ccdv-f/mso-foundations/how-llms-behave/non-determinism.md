---
title: "Non-determinism: what it means for testing and evals"
type: concept
certification: CCDV-F
status: draft
dominio: D4
tags:
- certification/ccdv-f
- domain/d4-eval-testing-debugging
- concept/non-determinism
- concept/sampling
- concept/evals
- concept/llm-behavior
- mso-foundations
aliases:
- LLM non-determinism
- Non-deterministic output
updated: '2026-11-15'
---

**Non-determinism** is the primary consequence of sampling: identical inputs do not guarantee
identical outputs. That changes how you test a Claude feature. A test that asserts the exact text of
a response will be inconsistent, because the model can express the same correct answer many ways.
Instead, assert on the property that must hold: a required field is present, a value is in range,
the structure parses. When you need to judge meaning rather than structure, use
an [eval with a model-graded judge](../eval-with-a-model-graded-judge/). This is why the course
treats evals as the standard for knowing a feature is correct, and why Module 3 builds that
capability.

## Connections

- [Sampling](../sampling/)
- [eval with a model-graded judge](../eval-with-a-model-graded-judge/)
- [temperature](../temperature/)

## Sources

- [CCDV-F - Apuntes de Skilljar](../ccdv-f-apuntes-de-skilljar/)