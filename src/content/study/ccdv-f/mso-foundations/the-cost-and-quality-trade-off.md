---
title: "The cost and quality trade-off"
type: concept
certification: CCDV-F
status: draft
dominio: D6
tags:
- certification/ccdv-f
- domain/d6-prompt-context-engineering
- concept/cost-quality-tradeoff
- concept/few-shot
- mso-foundations
aliases:
- Cost vs quality
- Prompt cost trade-off
updated: '2026-11-15'
---
Each example you add costs tokens on every call and consumes context budget, so the choice trades quality against cost. Reach for zero-shot when the task is simple and the output shape is obvious. Move to one-shot or multi-shot when the output has a specific structure, casing, or edge case that a description keeps missing. Often one or two correct examples usually fix the issue faster than another paragraph of instructions. The general discipline, which Module 2 reinforces, is to add the smallest amount of prompt that produces a reliable result.

## Connections

- [The three modes](../the-three-modes/)
- [Mode choice interacts with model choice](../mode-choice-interacts-with-model-choice/)

## Sources

- [CCDV-F - Apuntes de Skilljar](../ccdv-f-apuntes-de-skilljar/)