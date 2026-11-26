---
title: "REST, SDK, SSE y WebSockets"
tipo: concepto
tags:
  - claude
  - certification
  - ccdv-f/optimizacion
aliases:
  - "Technical Fundamentals"
dominio: D5
---

[Índice](../ccdv-f-indice-de-certificacion/) · [Dominio D5](../ccdv-f-indice-de-certificacion/#d5-seleccion-y-optimizacion-de-modelos)

REST intercambia solicitudes y respuestas sobre HTTP. El SDK proporciona tipos, utilidades y manejo
de errores sobre la API disponible. SSE permite que el servidor envíe una secuencia al cliente sobre
HTTP. WebSocket establece un canal bidireccional para que ambas partes envíen mensajes durante la
conexión. Async es un modelo de concurrencia de la aplicación.

**Caso.** Usa SSE de Messages para mostrar la generación. Si tu aplicación necesita comunicación
bidireccional entre navegador y backend, evalúa WebSocket en ese tramo y usa la API compatible de
Claude en el tramo del proveedor.

> [!question]- ¿Necesitas WebSocket para recibir tokens progresivamente desde Messages?
> SSE sirve para ese flujo descendente. Usa WebSocket si el producto requiere un canal bidireccional
> propio.

## Conexiones

[Mecánica de Messages API](../ccdv-f-mecanica-de-messages-api/) · [Ingeniería de software para integraciones Claude](../ccdv-f-ingenieria-de-software-para-integraciones-claude/) · [Presupuesto de tokens y caché de prompts](../ccdv-f-presupuesto-de-tokens-y-cache-de-prompts/)

Material
previo · [SDK frente a REST](../how-a-developer-reaches-claude-sdk-versus-raw-rest/) · [Asincronía para volumen](../asynchronous-patterns-for-high-volume-work/)

## Fuentes

- [Claude Platform · Messages](https://platform.claude.com/docs/en/build-with-claude/working-with-messages)
- [Claude Agent SDK](https://code.claude.com/docs/en/agent-sdk/overview)
- [Claude Platform · Streaming](https://platform.claude.com/docs/en/build-with-claude/streaming)
- [IETF · WebSocket Protocol](https://www.rfc-editor.org/info/rfc6455/)
