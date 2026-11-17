---
title: "Mode choice interacts with model choice"
type: concept
certification: CCDV-F
status: draft
dominio: D5
tags:
- certification/ccdv-f
- domain/d5-model-selection-optimization
- concept/prompting-mode
- concept/model-selection
aliases:
- Mode and model choice
- Prompting mode vs model
updated: '2026-11-15'
---
Prompting mode and model choice are related levers. A more capable model often succeeds zero-shot on a task where a smaller model needs a few examples to match the structure, so adding examples can let a cheaper model do the job. The two decisions are worth making together: try the simplest model and the fewest examples that meet your eval, and add capability or examples only where the eval says you need them.

## Connections

- [The three modes](../the-three-modes/)
- [The cost and quality trade-off](../the-cost-and-quality-trade-off/)
- [Reasoning modes are a separate setting from model choice](../reasoning-modes-are-a-separate-setting-from-model-choice/)

## Sources

- [CCDV-F - Apuntes de Skilljar](../ccdv-f-apuntes-de-skilljar/)