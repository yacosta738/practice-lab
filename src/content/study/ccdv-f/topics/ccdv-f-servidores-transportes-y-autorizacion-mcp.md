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

El host usa un cliente MCP para comunicarse con cada servidor. Las herramientas representan operaciones, los recursos ofrecen datos contextualizables y los prompts empaquetan interacciones reutilizables. La inicialización negocia versión y capacidades. Diseña nombres, esquemas y errores como un contrato con clientes independientes.

En el estándar consultado, stdio conecta cliente y proceso mediante sus flujos estándar, y Streamable HTTP sirve conexiones HTTP. Un socket u otro transporte personalizado requiere que cliente y servidor compartan el contrato. HTTP+SSE histórico y Streamable HTTP tienen diferencias de compatibilidad. Para un servidor remoto, planifica autenticación y autorización conforme al transporte y al cliente.

**Caso.** Un servidor local de lectura puede correr por stdio con permisos limitados. Un servidor compartido necesita autenticación, aislamiento entre usuarios, validación de operaciones y trazas.

> [!question]- ¿Qué justifica MCP frente a implementar una herramienta directamente?
> Reutilizar el contrato entre varios clientes o administrar la integración como un componente independiente.

## Conexiones

[Identidad, secretos y claves API](../ccdv-f-identidad-secretos-y-claves-api/) · [Implementación de herramientas y tool-use loop](../ccdv-f-implementacion-de-herramientas-y-tool-use-loop/) · [Elegir herramientas, skills, plugins o MCP](../ccdv-f-elegir-herramientas-skills-plugins-o-mcp/)

## Fuentes

- [MCP · Especificación 2025-11-25](https://modelcontextprotocol.io/specification/2025-11-25)
- [MCP · Autorización](https://modelcontextprotocol.io/specification/2025-11-25/basic/authorization)
- [Claude Code · MCP](https://code.claude.com/docs/en/mcp)
