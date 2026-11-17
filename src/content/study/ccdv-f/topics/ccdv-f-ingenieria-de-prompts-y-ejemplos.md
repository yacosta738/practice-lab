---
title: "Ingeniería de prompts y ejemplos"
tipo: concepto
tags:
  - claude
  - certification
  - ccdv-f/contexto
aliases:
  - "Prompt Engineering"
dominio: D6
---
[Índice](../ccdv-f-indice-de-certificacion/) · [Dominio D6](../ccdv-f-indice-de-certificacion/#d6-ingenieria-de-prompts-y-contexto)

Expresa objetivo, criterios y comportamiento ante datos ausentes. Coloca reglas estables en la instrucción de sistema de la superficie apropiada y la tarea variable en la entrada del usuario. Separa datos, ejemplos e instrucciones con etiquetas descriptivas. Sanea o normaliza entradas según el contrato y trata el texto recuperado como datos.

Depura un fallo repetible antes de cambiar el prompt. Corrige el formato con un contrato de salida, el alcance con una regla clara y una convención ambigua con un ejemplo representativo. Cambia una cosa a la vez y repite el eval.

**Caso.** Para extraer un campo opcional, define cómo expresar ausencia, añade una entrada que omita el dato y comprueba que el consumidor acepte el resultado.

> [!question]- ¿Para qué sirven las etiquetas XML?
> Ayudan a distinguir funciones dentro del prompt. Los permisos y validaciones se aplican fuera del modelo.

## Conexiones

[Diseño de aplicaciones e interfaces Claude](../ccdv-f-diseno-de-aplicaciones-e-interfaces-claude/) · [Tokens, muestreo y razonamiento](../ccdv-f-tokens-muestreo-y-razonamiento/) · [Contexto, compactación y memoria](../ccdv-f-contexto-compactacion-y-memoria/) · [Salidas estructuradas y validación defensiva](../ccdv-f-salidas-estructuradas-y-validacion-defensiva/) · [Entradas no confiables y protección de datos](../ccdv-f-entradas-no-confiables-y-proteccion-de-datos/)

## Fuentes

- [Claude Platform · Prompting](https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/overview)
