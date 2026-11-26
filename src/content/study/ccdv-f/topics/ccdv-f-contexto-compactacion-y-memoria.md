---
title: "Contexto, compactación y memoria"
tipo: concepto
tags:
  - claude
  - certification
  - ccdv-f/contexto
aliases:
  - "Context Engineering"
dominio: D6
---

[Índice](../ccdv-f-indice-de-certificacion/) · [Dominio D6](../ccdv-f-indice-de-certificacion/#d6-ingenieria-de-prompts-y-contexto)

Distingue el contexto de una llamada de la memoria persistente. El contexto incluye lo que el modelo
necesita en este turno. La memoria persiste hechos o estado que seguirán siendo útiles y puede
recuperarse de forma selectiva. Filtra resultados largos, pagina y conserva referencias a la fuente
en vez de repetir todo el documento.

Ante crecimiento, compacta con un resumen estructurado de hechos, decisiones, identificadores,
pendientes y restricciones. Conserva resultados críticos verificables y mide pérdida de información.
Aísla subagentes por subtarea y devuelve solo resultados necesarios, con fuentes y nivel de
incertidumbre.

**Caso.** Una investigación con veinte documentos puede procesarlos por lotes y conservar evidencia
por tema. En la síntesis final recupera los fragmentos pertinentes.

> [!question]- ¿Qué riesgo introduce resumir indiscriminadamente?
> Perder excepciones, evidencias o límites de autoridad necesarios para decisiones posteriores.

## Conexiones

[Patrones de agentes, memoria y frameworks](../ccdv-f-patrones-de-agentes-memoria-y-frameworks/) · [Operación de Claude Code](../ccdv-f-operacion-de-claude-code/) · [Presupuesto de tokens y caché de prompts](../ccdv-f-presupuesto-de-tokens-y-cache-de-prompts/) · [Ingeniería de prompts y ejemplos](../ccdv-f-ingenieria-de-prompts-y-ejemplos/)

## Fuentes

- [Claude Platform · Ventana de contexto](https://platform.claude.com/docs/en/build-with-claude/context-windows)
- [Agent SDK · Sesiones](https://code.claude.com/docs/en/agent-sdk/sessions)
- [Anthropic · Building effective agents](https://www.anthropic.com/research/building-effective-agents)
