---
title: "Arquitectura de agentes"
tipo: concepto
tags:
  - claude
  - certification
  - ccdv-f/arquitectura
aliases:
  - "Agent Architecture"
dominio: D1
---
[Índice](../ccdv-f-indice-de-certificacion/) · [Dominio D1](../ccdv-f-indice-de-certificacion/#d1-agentes-y-flujos-de-trabajo)

Un flujo codifica de antemano la secuencia y puede usar Claude dentro de pasos concretos. Un agente elige la siguiente acción según sus observaciones. Empieza con un flujo si puedes enumerar los pasos de manera fiable. Introduce autonomía cuando el camino depende de resultados que solo conoces durante la ejecución.

En un patrón supervisor–trabajadores, el supervisor reparte objetivos acotados, recibe resultados con contrato y decide cómo combinarlos. Paraleliza subtareas independientes. Mantén en serie las que consumen la salida de una anterior. Acota iteraciones, coste y efectos permitidos. El supervisor debe manejar resultados incompletos y discrepancias.

**Caso.** Para revisar facturas, usa pasos fijos para parseo, validación y registro. Delega solo el análisis de discrepancias que requieren consultar fuentes diferentes.

> [!question]- ¿Qué justificaría pasar de un flujo a un agente?
> Que la elección de herramientas o pasos dependa de hallazgos de ejecución y que el beneficio medido cubra la complejidad adicional.

## Conexiones

[Construcción y alojamiento de agentes](../ccdv-f-construccion-y-alojamiento-de-agentes/) · [Patrones de agentes, memoria y frameworks](../ccdv-f-patrones-de-agentes-memoria-y-frameworks/) · [Requisitos y criterios de aceptación](../ccdv-f-requisitos-y-criterios-de-aceptacion/) · [Guardrails y despliegue seguro](../ccdv-f-guardrails-y-despliegue-seguro/)

## Fuentes

- [Anthropic · Building effective agents](https://www.anthropic.com/research/building-effective-agents)
