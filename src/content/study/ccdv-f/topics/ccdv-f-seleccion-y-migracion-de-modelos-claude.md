---
title: "Selección y migración de modelos Claude"
tipo: concepto
tags:
  - claude
  - certification
  - ccdv-f/optimizacion
aliases:
  - "Model Selection and Tradeoffs"
dominio: D5
---
[Índice](../ccdv-f-indice-de-certificacion/) · [Dominio D5](../ccdv-f-indice-de-certificacion/#d5-seleccion-y-optimizacion-de-modelos)

La guía pide distinguir los perfiles de Haiku, Sonnet y Opus. Usa las familias como punto de partida y confirma modelos actuales, capacidades, ventanas, límites y precios en la documentación del proveedor. Escoge la configuración que cumple el umbral de calidad al menor coste y latencia aceptables. Un routing por dificultad añade complejidad que debe justificar el eval.

Evalúa una migración con la misma muestra representativa. Compara calidad, p95, coste por resultado útil, formato de respuestas, stop reasons y soporte de thinking y herramientas. Registra el identificador y despliega de forma gradual.

**Caso.** Usa un modelo económico para clasificación clara y considera escalar casos ambiguos cuando la ganancia medida cubra la latencia adicional.

> [!question]- ¿Qué mantienes fijo al comparar esfuerzo de razonamiento?
> Datos, grader, instrucciones y configuración ajena al esfuerzo.

## Conexiones

[Gestión de configuración y versiones](../ccdv-f-gestion-de-configuracion-y-versiones/) · [Evals, trazas y recuperación de fallos](../ccdv-f-evals-trazas-y-recuperacion-de-fallos/) · [Tokens, muestreo y razonamiento](../ccdv-f-tokens-muestreo-y-razonamiento/) · [Presupuesto de tokens y caché de prompts](../ccdv-f-presupuesto-de-tokens-y-cache-de-prompts/)

## Fuentes

- [Claude Platform · Modelos](https://platform.claude.com/docs/en/models/overview)
- [Claude Platform · Effort](https://platform.claude.com/docs/en/build-with-claude/effort)
- [Claude Platform · Thinking](https://platform.claude.com/docs/en/build-with-claude/thinking-steering-and-cost)
- [Claude Platform · Evals](https://platform.claude.com/docs/en/test-and-evaluate/develop-tests)
