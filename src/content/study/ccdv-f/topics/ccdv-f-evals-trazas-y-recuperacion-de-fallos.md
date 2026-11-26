---
title: "Evals, trazas y recuperación de fallos"
tipo: concepto
tags:
  - claude
  - certification
  - ccdv-f/evaluacion
aliases:
  - "Debugging and Error Handling"
dominio: D4
---

[Índice](../ccdv-f-indice-de-certificacion/) · [Dominio D4](../ccdv-f-indice-de-certificacion/#d4-evals-pruebas-y-depuracion)

Clasifica el origen antes de intervenir. Una solicitud inválida requiere corregir forma o
parámetros, un fallo de autenticación requiere credenciales válidas, un 429 pide respetar límites y
espera indicada, y un 5xx transitorio puede admitir reintentos acotados. Usa backoff con jitter y un
presupuesto total. Revisa la idempotencia antes de repetir una acción con efectos.

Con un ejemplo reproducible, inspecciona entrada redaccionada, ID de solicitud, tiempos, código,
motivo de parada, estado de herramientas y resultado del parser. Aísla el fallo por capa. Prueba
lógica pura, contratos de integración y recorridos completos. Incluye casos límite en un eval
estable. Aplica checks de código a reglas observables y calibra el juez semántico con ejemplos
humanos.

**Caso.** JSON válido con fecha equivocada requiere un caso etiquetado y una corrección del
comportamiento. JSON truncado durante streaming requiere resolver la interrupción y su recuperación.

> [!question]- ¿Qué señal distingue una salida semánticamente incorrecta de un error de transporte?
> Un resultado completo que pasa el contrato pero falla la expectativa etiquetada apunta a
> comportamiento. Errores de red o eventos incompletos apuntan a entrega.

## Conexiones

[Mecánica de Messages API](../ccdv-f-mecanica-de-messages-api/) · [Ingeniería de software para integraciones Claude](../ccdv-f-ingenieria-de-software-para-integraciones-claude/) · [Selección y migración de modelos Claude](../ccdv-f-seleccion-y-migracion-de-modelos-claude/) · [Salidas estructuradas y validación defensiva](../ccdv-f-salidas-estructuradas-y-validacion-defensiva/)

## Fuentes

- [Claude Platform · Errores de API](https://platform.claude.com/docs/en/api/errors)
- [Claude Platform · Límites de API](https://platform.claude.com/docs/en/api/rate-limits)
- [Claude Platform · Evals](https://platform.claude.com/docs/en/test-and-evaluate/develop-tests)
- [Claude Platform · Streaming](https://platform.claude.com/docs/en/build-with-claude/streaming)
