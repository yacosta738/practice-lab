---
title: "The three modes"
type: concept
certification: CCDV-F
status: draft
dominio: D6
tags:
- certification/ccdv-f
- domain/d6-prompt-context-engineering
- concept/zero-shot
- concept/one-shot
- concept/few-shot
- mso-foundations
aliases:
- Zero-shot, one-shot, multi-shot
- Prompting modes
- Few-shot prompting
updated: '2026-11-15'
---

Separate from how you word a prompt is how many worked examples you give the model inside it.
**Zero-shot** gives the instruction and no examples: you describe the task and ask for the result.
**One-shot** adds one example of the input paired with the desired output. **Multi-shot**, also
called few-shot, includes several such examples. The examples are not training data; they sit in the
prompt and show the model the exact shape of the answer you want, which a description alone often
fails to pin down.

## Connections

- [Mode choice interacts with model choice](../mode-choice-interacts-with-model-choice/)
- [The cost and quality trade-off](../the-cost-and-quality-trade-off/)

## Sources

- [CCDV-F - Apuntes de Skilljar](../ccdv-f-apuntes-de-skilljar/)