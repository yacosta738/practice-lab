---
title: "Elegir herramientas, skills, plugins o MCP"
tipo: concepto
tags:
  - claude
  - certification
  - ccdv-f/herramientas
aliases:
  - "Agentic Customization"
dominio: D8
---
[Índice](../ccdv-f-indice-de-certificacion/) · [Dominio D8](../ccdv-f-indice-de-certificacion/#d8-herramientas-y-mcp)

Usa una herramienta incorporada cuando su alcance y permisos cubran la tarea. Implementa una herramienta propia para una operación específica bajo control de la aplicación. Un skill describe una forma reutilizable de realizar el trabajo y puede aportar referencias y scripts. MCP normaliza la conexión a capacidades externas. Un plugin distribuye componentes y dependencias como unidad.

**Caso.** Para estandarizar una revisión de PR, empaqueta la metodología como skill. Para consultar un servicio interno desde varios clientes, expón una interfaz MCP. Si ambos se distribuyen juntos, versiona su configuración, permisos y contratos.

> [!question]- ¿Qué escogerías si solo quieres enseñar un procedimiento repetible?
> Un skill. Si además hace falta acceso a un sistema, añade una herramienta con permisos explícitos.

## Conexiones

[Gestión de configuración y versiones](../ccdv-f-gestion-de-configuracion-y-versiones/) · [Operación de Claude Code](../ccdv-f-operacion-de-claude-code/) · [Implementación de herramientas y tool-use loop](../ccdv-f-implementacion-de-herramientas-y-tool-use-loop/) · [Servidores, transportes y autorización MCP](../ccdv-f-servidores-transportes-y-autorizacion-mcp/)

## Fuentes

- [Claude Code · Extensiones](https://code.claude.com/docs/en/features-overview)
- [Claude Platform · Tool use](https://platform.claude.com/docs/en/agents-and-tools/tool-use/overview)
- [MCP · Especificación 2026-07-28](https://modelcontextprotocol.io/specification/2026-07-28)
