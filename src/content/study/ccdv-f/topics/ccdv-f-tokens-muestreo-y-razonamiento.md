---
title: "Tokens, muestreo y razonamiento"
tipo: concepto
tags:
  - claude
  - certification
  - ccdv-f/optimizacion
aliases:
  - "LLM Fundamentals"
dominio: D5
---

[Índice](../ccdv-f-indice-de-certificacion/) · [Dominio D5](../ccdv-f-indice-de-certificacion/#d5-seleccion-y-optimizacion-de-modelos)

Un modelo genera tokens sucesivos condicionados al contexto. La tokenización depende del modelo y el
texto. Cuenta instrucciones, historial, entradas, esquemas y resultados, y reserva margen de
generación. Las salidas pueden variar entre peticiones equivalentes. Comprueba soporte de parámetros
de muestreo para la versión elegida.

Zero-shot añade instrucciones, one-shot añade un ejemplo y few-shot añade varios. Elige casos que
aclaren un borde medible. La elección de modelo, el modo rápido cuando esté soportado y el esfuerzo
de razonamiento controlan aspectos diferentes. Distingue el thinking adaptativo de configuraciones
anteriores con presupuesto fijo y consulta el soporte antes de migrar.

**Caso.** Para normalizar nombres, compara el modelo base con uno o dos ejemplos específicos y mide
coste, validez y precisión de casos límite.

> [!question]- ¿Cómo comprobarías una respuesta que puede redactarse de varias maneras?
> Evalúa estructura y propiedades del contenido con reglas o una rúbrica.

## Conexiones

[REST, SDK, SSE y WebSockets](../ccdv-f-rest-sdk-sse-y-websockets/) · [Selección y migración de modelos Claude](../ccdv-f-seleccion-y-migracion-de-modelos-claude/) · [Presupuesto de tokens y caché de prompts](../ccdv-f-presupuesto-de-tokens-y-cache-de-prompts/) · [Ingeniería de prompts y ejemplos](../ccdv-f-ingenieria-de-prompts-y-ejemplos/)

Material
previo · [Tu nota de temperature](../temperature/) · [Ejemplos y elección de modelo](../mode-choice-interacts-with-model-choice/)

## Fuentes

- [Claude Platform · Ventana de contexto](https://platform.claude.com/docs/en/build-with-claude/context-windows)
- [Claude Platform · Modelos](https://platform.claude.com/docs/en/models/overview)
- [Claude Platform · Thinking](https://platform.claude.com/docs/en/build-with-claude/thinking-steering-and-cost)
- [Claude Platform · Effort](https://platform.claude.com/docs/en/build-with-claude/effort)
- [Claude Platform · Prompting](https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/overview)
- [Claude Platform · Capacidades](https://platform.claude.com/docs/en/build-with-claude/overview)
