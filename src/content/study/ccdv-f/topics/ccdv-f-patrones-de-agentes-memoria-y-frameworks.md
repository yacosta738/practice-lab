---
title: "Patrones de agentes, memoria y frameworks"
tipo: concepto
tags:
  - claude
  - certification
  - ccdv-f/arquitectura
aliases:
  - "Agent Patterns and Frameworks"
dominio: D1
---
[Índice](../ccdv-f-indice-de-certificacion/) · [Dominio D1](../ccdv-f-indice-de-certificacion/#d1-agentes-y-flujos-de-trabajo)

Encadenamiento divide una tarea con dependencias conocidas. Routing elige una rama según una señal. Paralelización ejecuta ramas independientes y requiere una estrategia de agregación. Evaluador–optimizador itera con criterios y un límite. Un subagente recibe un objetivo y contexto acotados y devuelve un artefacto que el coordinador puede revisar.

Guarda memoria durable solo cuando una decisión deba sobrevivir a la sesión. Registra origen, alcance y política de actualización. Al reanudar, verifica estado y versiones antes de confiar en un resumen persistido. Strands, LangGraph y PydanticAI ofrecen abstracciones distintas. Al compararlos, verifica persistencia, control de flujo, visibilidad del estado y las facilidades para probar fallos.

**Caso.** Para resumir cinco informes, procesa cada uno con contexto aislado y combina resultados con referencias. Si un informe falta, devuelve cobertura parcial.

> [!question]- ¿Qué añade un framework a un bucle de herramientas?
> Abstracciones de ejecución y estado. Los límites de confianza y los criterios de parada siguen siendo decisiones de diseño.

## Conexiones

[Arquitectura de agentes](../ccdv-f-arquitectura-de-agentes/) · [Construcción y alojamiento de agentes](../ccdv-f-construccion-y-alojamiento-de-agentes/) · [Contexto, compactación y memoria](../ccdv-f-contexto-compactacion-y-memoria/) · [Implementación de herramientas y tool-use loop](../ccdv-f-implementacion-de-herramientas-y-tool-use-loop/)

## Fuentes

- [Anthropic · Building effective agents](https://www.anthropic.com/research/building-effective-agents)
- [Claude Agent SDK](https://code.claude.com/docs/en/agent-sdk/overview)
- [Strands Agents · Primeros pasos](https://strandsagents.com/docs/user-guide/sdk/quickstart/overview/)
- [LangGraph · Descripción general](https://docs.langchain.com/oss/python/langgraph/overview)
- [Pydantic AI · Descripción general](https://pydantic.dev/docs/ai/overview/)
