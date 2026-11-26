---
title: "Mecánica de Messages API"
tipo: concepto
tags:
  - claude
  - certification
  - ccdv-f/integracion
aliases:
  - "Claude API Mechanics"
dominio: D2
---

[Índice](../ccdv-f-indice-de-certificacion/) · [Dominio D2](../ccdv-f-indice-de-certificacion/#d2-aplicaciones-e-integracion)

Messages usa bloques tipados para texto, imágenes y otros contenidos según la capacidad. Envía la
instrucción de sistema en el parámetro previsto y conserva los mensajes necesarios para cada turno
de una integración stateless. Los datos externos entran al incluirlos en el contexto o mediante una
herramienta autorizada. Una imagen o PDF requiere formato y límites compatibles. Usa thinking cuando
el salto de calidad justifique el tiempo y coste.

En streaming SSE, reconstruye bloques por índice y tipo. Una respuesta interrumpida es parcial. Un
fragmento de entrada de herramienta puede ser JSON incompleto. Espera el bloque completo y vuelve a
validar antes de actuar. En una llamada normal esperas el objeto completo. Un cliente asíncrono
libera la aplicación mientras espera. Message Batches difiere el trabajo de volumen y los resultados
se correlacionan por identificador.

**Caso.** Usa streaming para redactar frente al usuario y lotes para recatalogar un archivo
histórico. Si cambias de proveedor, prueba autenticación, formatos y capacidades en ese entorno.

> [!question]- ¿Qué haces cuando el stream cae después de mostrar texto?
> Marca la respuesta como incompleta, conserva evidencia operativa y aplica una estrategia de
> recuperación que evite repetir acciones con efectos.

## Conexiones

[Ingeniería de software para integraciones Claude](../ccdv-f-ingenieria-de-software-para-integraciones-claude/) · [Evals, trazas y recuperación de fallos](../ccdv-f-evals-trazas-y-recuperacion-de-fallos/) · [Presupuesto de tokens y caché de prompts](../ccdv-f-presupuesto-de-tokens-y-cache-de-prompts/) · [Implementación de herramientas y tool-use loop](../ccdv-f-implementacion-de-herramientas-y-tool-use-loop/)

Material
previo · [Tu nota de Message Batches](../message-batches-api/) · [Tu nota de AsyncAnthropic](../asyncanthropic/) · [Modos de respuesta](../synchronous-streaming-and-real-time-responses/)

## Fuentes

- [Claude Platform · Messages](https://platform.claude.com/docs/en/build-with-claude/working-with-messages)
- [Claude Platform · Streaming](https://platform.claude.com/docs/en/build-with-claude/streaming)
- [Claude Platform · Message Batches](https://platform.claude.com/docs/en/build-with-claude/batch-processing)
- [Claude Platform · Capacidades](https://platform.claude.com/docs/en/build-with-claude/overview)
- [Claude Platform · Prompt caching](https://platform.claude.com/docs/en/build-with-claude/prompt-caching)
- [Claude Platform · Tool use](https://platform.claude.com/docs/en/agents-and-tools/tool-use/overview)
