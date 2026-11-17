---
title: "Guardrails y despliegue seguro"
tipo: concepto
tags:
  - claude
  - certification
  - ccdv-f/seguridad
aliases:
  - "Guardrails and Safe Deployment"
dominio: D7
---
[Índice](../ccdv-f-indice-de-certificacion/) · [Dominio D7](../ccdv-f-indice-de-certificacion/#d7-seguridad-y-controles)

Combina minimización de capacidades, permisos mínimos, validación de entrada y salida, controles de contenido, revisión humana en acciones sensibles y monitorización. Diseña un estado seguro si falta identidad, contexto o aprobación. Registra el motivo y expón el estado al operador.

Evalúa controles con casos sintéticos de cruce de tenant, falta de aprobación, datos sensibles y llamadas duplicadas. Vigila falsos positivos y eficacia por caso de uso. Revisa cambios de permisos junto con cualquier nuevo plugin o herramienta.

**Caso.** Para un asistente interno con capacidad de escritura, exige que el operador vea recurso, cambio exacto e identidad ejecutora antes de confirmar. El backend vuelve a validar esos datos en el momento de ejecutar.

> [!question]- ¿Por qué combinar filtros, permisos y confirmaciones?
> Cada control cubre una capa distinta de decisión, ejecución y supervisión.

## Conexiones

[Arquitectura de agentes](../ccdv-f-arquitectura-de-agentes/) · [Entradas no confiables y protección de datos](../ccdv-f-entradas-no-confiables-y-proteccion-de-datos/) · [Hooks como controles deterministas](../ccdv-f-hooks-como-controles-deterministas/) · [Identidad, secretos y claves API](../ccdv-f-identidad-secretos-y-claves-api/)

## Fuentes

- [Claude Platform · Mitigar prompt injection](https://platform.claude.com/docs/en/test-and-evaluate/strengthen-guardrails/mitigate-jailbreaks)
- [Claude Code · Permisos](https://code.claude.com/docs/en/permissions)
- [Claude Code · Hooks](https://code.claude.com/docs/en/hooks)
- [Claude Platform · Evals](https://platform.claude.com/docs/en/test-and-evaluate/develop-tests)
