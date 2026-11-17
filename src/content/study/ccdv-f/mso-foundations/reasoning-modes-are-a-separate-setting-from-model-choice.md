---
title: "Reasoning modes are a separate setting from model choice"
type: concept
certification: CCDV-F
status: draft
dominio: D5
tags:
- certification/ccdv-f
- domain/d5-model-selection-optimization
- concept/reasoning-mode
- concept/model-selection
- mso-foundations
aliases:
- Reasoning vs model choice
- Adaptive thinking
- Reasoning modes
updated: '2026-11-15'
---
Choosing which model to run is one decision. Whether the model reasons before answering is a separate decision you make per call. On current models the reasoning mode is adaptive thinking: the model decides when and how much to think, and you tune depth with an effort setting rather than a fixed token budget (the older budget_tokens control is deprecated and, on the newest model generations, returns a 400 error). Thinking content is omitted from responses by default on the newest models. Request summarized display when you need to show it. Reasoning earns its cost on hard, multi-step problems and is wasted on lookups and classification. The key point for this module is that the two levers compose: model choice picks the family member, while the reasoning mode is configured per request. Per-model defaults differ (some of the newest models think adaptively by default or always), so confirm the current thinking defaults for your model at build time.

## Connections

- [How the two work together](../how-the-two-work-together/)
- [Mode choice interacts with model choice](../mode-choice-interacts-with-model-choice/)

## Sources

- [CCDV-F - Apuntes de Skilljar](../ccdv-f-apuntes-de-skilljar/)