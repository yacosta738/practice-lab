---
title: "Implementación de herramientas y tool-use loop"
tipo: concepto
tags:
  - claude
  - certification
  - ccdv-f/herramientas
aliases:
  - "Tool Implementation"
dominio: D8
---

[Índice](../ccdv-f-indice-de-certificacion/) · [Dominio D8](../ccdv-f-indice-de-certificacion/#d8-herramientas-y-mcp)

Una herramienta necesita nombre claro, descripción que indique cuándo usarla, esquema restringido y
un contrato de éxito y error. Evita herramientas con operaciones solapadas o acceso implícito. En
tools del cliente, recibe el bloque tool_use, valida argumentos y permisos, ejecuta y devuelve
tool_result con el identificador correspondiente. Una herramienta alojada por el proveedor se
ejecuta en su superficie y usa el protocolo que indique.

Si varias llamadas son independientes, puedes ejecutarlas en paralelo y correlacionar todas sus
salidas. Si una necesita el resultado de otra, secuencia. Devuelve errores legibles y distingue si
permiten un nuevo intento. Para escrituras, usa aprobación e idempotencia según el riesgo.

**Caso.** Dos consultas de inventario independientes se pueden paralelizar. La creación de una
reserva depende de que la consulta y la validación de permisos hayan concluido.

> [!question]- ¿Qué debe suceder antes de despachar el JSON sugerido por el modelo?
> Completar y validar el bloque, autorizar operación y recurso, y aplicar los controles necesarios.

## Conexiones

[Construcción y alojamiento de agentes](../ccdv-f-construccion-y-alojamiento-de-agentes/) · [Mecánica de Messages API](../ccdv-f-mecanica-de-messages-api/) · [Salidas estructuradas y validación defensiva](../ccdv-f-salidas-estructuradas-y-validacion-defensiva/) · [Hooks como controles deterministas](../ccdv-f-hooks-como-controles-deterministas/) · [Servidores, transportes y autorización MCP](../ccdv-f-servidores-transportes-y-autorizacion-mcp/)

## Fuentes

- [Claude Platform · Tool use](https://platform.claude.com/docs/en/agents-and-tools/tool-use/overview)
- [Claude Platform · Messages](https://platform.claude.com/docs/en/build-with-claude/working-with-messages)
- [Claude Platform · Structured outputs](https://platform.claude.com/docs/en/build-with-claude/structured-outputs)
