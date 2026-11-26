---
title: "Presupuesto de tokens y caché de prompts"
tipo: concepto
tags:
  - claude
  - certification
  - ccdv-f/optimizacion
aliases:
  - "Cost and Token Management"
dominio: D5
---

[Índice](../ccdv-f-indice-de-certificacion/) · [Dominio D5](../ccdv-f-indice-de-certificacion/#d5-seleccion-y-optimizacion-de-modelos)

Mide entrada, escritura y lectura de caché, salida, cantidad de llamadas y herramientas facturables.
Estima coste por tarea terminada, con intentos y llamadas de evaluación si forman parte del flujo.
Cuenta el request real y controla el crecimiento de contexto y salida.

Prompt caching reutiliza un prefijo elegible. Mantén referencias e instrucciones estables antes de
los datos variables y coloca puntos de caché según el patrón de reutilización. La identidad exacta
del prefijo, el mínimo elegible y la expiración influyen en el hit rate. Comprueba métricas de
escritura y lectura en vez de inferir éxitos por latencia.

**Caso.** Un catálogo de reglas compartido precede a la solicitud del usuario. Una regla que cambia
con cada usuario reduce la reutilización de todo lo que aparece detrás.

> [!question]- ¿Cómo sabes si cachear compensa?
> Compara el coste total de escrituras, lecturas y misses con el escenario equivalente sin caché.

## Conexiones

[Mecánica de Messages API](../ccdv-f-mecanica-de-messages-api/) · [Tokens, muestreo y razonamiento](../ccdv-f-tokens-muestreo-y-razonamiento/) · [Selección y migración de modelos Claude](../ccdv-f-seleccion-y-migracion-de-modelos-claude/) · [Contexto, compactación y memoria](../ccdv-f-contexto-compactacion-y-memoria/)

Material previo · [Tu nota de Message Batches](../message-batches-api/)

## Fuentes

- [Claude Platform · Prompt caching](https://platform.claude.com/docs/en/build-with-claude/prompt-caching)
- [Claude Platform · Ventana de contexto](https://platform.claude.com/docs/en/build-with-claude/context-windows)
- [Claude Platform · Message Batches](https://platform.claude.com/docs/en/build-with-claude/batch-processing)
- [Claude Platform · Límites de API](https://platform.claude.com/docs/en/api/rate-limits)
