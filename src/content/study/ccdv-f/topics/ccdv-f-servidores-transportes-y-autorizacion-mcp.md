---
title: "Servidores, transportes y autorización MCP"
tipo: concepto
tags:
  - claude
  - certification
  - ccdv-f/herramientas
aliases:
  - "MCP Server Development"
dominio: D8
---

[Índice](../ccdv-f-indice-de-certificacion/) · [Dominio D8](../ccdv-f-indice-de-certificacion/#d8-herramientas-y-mcp)

El host usa un cliente MCP para comunicarse con cada servidor. Las herramientas representan
operaciones, los recursos ofrecen datos contextualizables y los prompts empaquetan interacciones
reutilizables. La inicialización negocia versión y capacidades. Diseña nombres, esquemas y errores
como un contrato con clientes independientes.

La especificación MCP `2026-07-28` define stdio y Streamable HTTP con requisitos propios; el cliente
y el servidor deben seguir la misma versión y tratar la compatibilidad HTTP+SSE histórica por
separado. Para Streamable HTTP, valida `Origin`; para autorización HTTP, vincula el token al recurso
MCP previsto, no lo incluyas en una URL y valida su audiencia. La autorización del protocolo es
opcional, por lo que la aplicación debe definir y aplicar su política real.

**Caso.** Un servidor local de lectura puede correr por stdio con permisos limitados. Un servidor
compartido necesita autenticación, aislamiento entre usuarios, validación de operaciones y trazas.

> [!question]- ¿Qué justifica MCP frente a implementar una herramienta directamente?
> Reutilizar el contrato entre varios clientes o administrar la integración como un componente
> independiente.

## Conexiones

[Identidad, secretos y claves API](../ccdv-f-identidad-secretos-y-claves-api/) · [Implementación de herramientas y tool-use loop](../ccdv-f-implementacion-de-herramientas-y-tool-use-loop/) · [Elegir herramientas, skills, plugins o MCP](../ccdv-f-elegir-herramientas-skills-plugins-o-mcp/)

## Fuentes

- [MCP · Especificación 2026-07-28](https://modelcontextprotocol.io/specification/2026-07-28)
- [MCP · Transportes](https://modelcontextprotocol.io/specification/2026-07-28/basic/transports)
- [MCP · Autorización](https://modelcontextprotocol.io/specification/2026-07-28/basic/authorization) —
  la consulta directa recibió HTTP 429; véase el [registro de fuentes](../source-register/) para el
  límite de evidencia.
- [Claude Code · MCP](https://code.claude.com/docs/en/mcp)
