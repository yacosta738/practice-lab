---
title: "Salidas estructuradas y validación defensiva"
tipo: concepto
tags:
  - claude
  - certification
  - ccdv-f/contexto
aliases:
  - "Output Handling"
dominio: D6
---

[Índice](../ccdv-f-indice-de-certificacion/) · [Dominio D6](../ccdv-f-indice-de-certificacion/#d6-ingenieria-de-prompts-y-contexto)

Cuando el consumidor requiere datos, usa un esquema explícito y salida estructurada si la
combinación de modelo y API lo permite. Distingue el esquema de la respuesta del esquema de entrada
de cada herramienta. Trata stop reasons, truncamientos, rechazos y errores antes de consumir el
objeto.

Valida tipos, rangos, pertenencia a catálogos, permisos y reglas entre campos. Distingue formato de
veracidad. Una respuesta convincente puede contener datos erróneos. Si falla, devuelve un estado
explícito y evita efectos parciales. Registra el fallo con redacción de datos.

**Caso.** El JSON puede contener un ID correcto en sintaxis pero perteneciente a otro cliente. El
consumidor comprueba tenant y autorización antes de acceder al registro.

> [!question]- ¿Qué garantiza un esquema?
> Estructura dentro de su contrato. Exactitud, reglas de negocio y autorización necesitan
> comprobaciones propias.

## Conexiones

[Mecánica de Messages API](../ccdv-f-mecanica-de-messages-api/) · [Evals, trazas y recuperación de fallos](../ccdv-f-evals-trazas-y-recuperacion-de-fallos/) · [Ingeniería de prompts y ejemplos](../ccdv-f-ingenieria-de-prompts-y-ejemplos/) · [Implementación de herramientas y tool-use loop](../ccdv-f-implementacion-de-herramientas-y-tool-use-loop/)

## Fuentes

- [Claude Platform · Structured outputs](https://platform.claude.com/docs/en/build-with-claude/structured-outputs)
- [Claude Platform · Messages](https://platform.claude.com/docs/en/build-with-claude/working-with-messages)
- [Claude Platform · Evals](https://platform.claude.com/docs/en/test-and-evaluate/develop-tests)
