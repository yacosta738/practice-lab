---
title: "Laboratorio de integración"
tipo: practica
tags:
  - claude
  - certification
  - ccdv-f/practica
aliases:
  - "Práctica CCDV-F"
---

[Índice](../ccdv-f-indice-de-certificacion/)

Construye un asistente de inventario con datos sintéticos. Recibe SKU y almacén, consulta
existencias con permiso de lectura y devuelve cantidad, procedencia y fecha de observación. Si el
SKU es ambiguo o el almacén está fuera del ámbito, devuelve un estado que el consumidor pueda
manejar.

- ☐ Escribe criterios funcionales, latencia objetivo y presupuesto por
  operación. [Requisitos y criterios de aceptación](../ccdv-f-requisitos-y-criterios-de-aceptacion/)
- ☐ Implementa un flujo fijo con Messages y una función de consulta de solo lectura. Estudia un
  agente únicamente si el flujo necesita elegir pasos en
  ejecución. [Arquitectura de agentes](../ccdv-f-arquitectura-de-agentes/) · [Implementación de herramientas y tool-use loop](../ccdv-f-implementacion-de-herramientas-y-tool-use-loop/)
- ☐ Valida esquema y pertenencia al almacén antes de consumir respuestas. Aísla datos por usuario y
  conserva un identificador de
  traza. [Salidas estructuradas y validación defensiva](../ccdv-f-salidas-estructuradas-y-validacion-defensiva/) · [Entradas no confiables y protección de datos](../ccdv-f-entradas-no-confiables-y-proteccion-de-datos/)
- ☐ Cubre SKU válido, desconocido y ambiguo, almacén fuera del ámbito, 429, interrupción y respuesta
  con formato válido pero valor incorrecto. Comprueba que los reintentos tienen un
  límite. [Evals, trazas y recuperación de fallos](../ccdv-f-evals-trazas-y-recuperacion-de-fallos/)
- ☐ Mide calidad, p95 y tokens con un conjunto fijo. Compara dos modelos o dos configuraciones de
  esfuerzo con las demás variables
  estables. [Selección y migración de modelos Claude](../ccdv-f-seleccion-y-migracion-de-modelos-claude/) · [Presupuesto de tokens y caché de prompts](../ccdv-f-presupuesto-de-tokens-y-cache-de-prompts/)
- ☐ Expón la consulta como MCP si un segundo cliente necesita el mismo contrato. Configura
  credenciales con alcance reducido y una prueba de integración para ambos
  clientes. [Servidores, transportes y autorización MCP](../ccdv-f-servidores-transportes-y-autorizacion-mcp/) · [Identidad, secretos y claves API](../ccdv-f-identidad-secretos-y-claves-api/)
- ☐ Versiona esquema, prompt, modelo y eval. Documenta configuración, auditoría y reversión para
  otro
  equipo. [Ciclo de vida y despliegue de soluciones Claude](../ccdv-f-ciclo-de-vida-y-despliegue-de-soluciones-claude/) · [Gestión de configuración y versiones](../ccdv-f-gestion-de-configuracion-y-versiones/)

## Evidencia de dominio

Para cada caso guarda entrada sintética, resultado esperado, resultado observado, versión y razón de
la decisión. Espera poder explicar qué detiene una llamada indebida y qué evidencia distingue una
regresión del modelo de un fallo de integración.
