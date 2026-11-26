---
title: "Diseño de aplicaciones e interfaces Claude"
tipo: concepto
tags:
  - claude
  - certification
  - ccdv-f/integracion
aliases:
  - "Claude Application Design"
dominio: D2
---

[Índice](../ccdv-f-indice-de-certificacion/) · [Dominio D2](../ccdv-f-indice-de-certificacion/#d2-aplicaciones-e-integracion)

Elige interfaz según operador y control requerido. Claude Code se integra con el repositorio y el
entorno de trabajo. Claude.ai y Claude Desktop sirven flujos interactivos con sus superficies
disponibles. La API y los SDK permiten diseñar el historial, la autorización, los formatos y la
observación dentro de tu aplicación.

Delimita instrucciones, entrada, ejemplos y salida. Esquematiza los datos que ingiere el consumidor
y valida reglas de negocio. Separa sesiones por usuario o tarea y transmite el estado mínimo. Revisa
plugins y dependencias por versión, permisos y comportamiento antes de distribuirlos.

**Caso.** Para una aplicación multiusuario, vincula cada conversación con su identidad y tenant y
autoriza cada acceso en el backend. Exige campos estructurados para las respuestas que alimenten
otros servicios.

> [!question]- ¿Qué componente debe impedir que un usuario lea datos de otro tenant?
> El backend o la herramienta que autoriza el recurso con identidad verificada.

## Conexiones

[Requisitos y criterios de aceptación](../ccdv-f-requisitos-y-criterios-de-aceptacion/) · [Mecánica de Messages API](../ccdv-f-mecanica-de-messages-api/) · [Gestión de configuración y versiones](../ccdv-f-gestion-de-configuracion-y-versiones/) · [Ingeniería de prompts y ejemplos](../ccdv-f-ingenieria-de-prompts-y-ejemplos/) · [Entradas no confiables y protección de datos](../ccdv-f-entradas-no-confiables-y-proteccion-de-datos/)

## Fuentes

- [Claude Platform · Capacidades](https://platform.claude.com/docs/en/build-with-claude/overview)
- [Claude Code · Extensiones](https://code.claude.com/docs/en/features-overview)
- [Claude Platform · Structured outputs](https://platform.claude.com/docs/en/build-with-claude/structured-outputs)
