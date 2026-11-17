---
title: "Construcción y alojamiento de agentes"
tipo: concepto
tags:
  - claude
  - certification
  - ccdv-f/arquitectura
aliases:
  - "Agent Construction with Claude"
dominio: D1
---
[Índice](../ccdv-f-indice-de-certificacion/) · [Dominio D1](../ccdv-f-indice-de-certificacion/#d1-agentes-y-flujos-de-trabajo)

El harness implementa el ciclo de ejecución que rodea al modelo, con herramientas, estado, permisos y observación. Un bucle propio da control sobre esas decisiones. Claude Agent SDK aporta primitivas y una ejecución estilo Claude Code. Claude Managed Agents ofrece una vía alojada por Anthropic para delegar parte de la infraestructura de ejecución.

Compara quién opera el entorno, dónde residen estado y credenciales, cómo se conectan herramientas privadas y qué controles de auditoría existen. Incluso con un entorno gestionado, define permisos, criterios de evaluación y límites de gasto. Usa hooks cuando una comprobación deba ejecutarse ante un evento concreto.

**Caso.** Un asistente que consulta una red privada puede necesitar un entorno propio o una conexión aprobada. Valida conectividad e identidad antes de elegir el alojamiento.

> [!question]- ¿Qué cambia al pasar de un loop propio a un servicio gestionado?
> Cambia la parte de infraestructura que operas. Debes seguir verificando el comportamiento, los permisos y la gestión de datos.

## Conexiones

[Arquitectura de agentes](../ccdv-f-arquitectura-de-agentes/) · [Patrones de agentes, memoria y frameworks](../ccdv-f-patrones-de-agentes-memoria-y-frameworks/) · [Hooks como controles deterministas](../ccdv-f-hooks-como-controles-deterministas/) · [Implementación de herramientas y tool-use loop](../ccdv-f-implementacion-de-herramientas-y-tool-use-loop/)

## Fuentes

- [Claude Agent SDK](https://code.claude.com/docs/en/agent-sdk/overview)
- [Claude Managed Agents](https://platform.claude.com/docs/en/managed-agents/overview)
- [Claude Code · Hooks](https://code.claude.com/docs/en/hooks)
