---
title: "Entradas no confiables y protección de datos"
tipo: concepto
tags:
  - claude
  - certification
  - ccdv-f/seguridad
aliases:
  - "AI Application Security"
dominio: D7
---
[Índice](../ccdv-f-indice-de-certificacion/) · [Dominio D7](../ccdv-f-indice-de-certificacion/#d7-seguridad-y-controles)

Trata documentos, páginas y resultados de herramientas como datos externos. Mantén separadas las instrucciones confiables y valida permisos, identidad y alcance en el código antes de cualquier efecto. Minimiza datos enviados, redacta PII donde proceda y evita incluir secretos en prompts, logs o respuestas.

La autenticación identifica al actor. La autorización decide si puede actuar sobre este recurso. La confidencialidad limita quién ve los datos y la integridad protege su exactitud. Una reserva importante para cualquier integración es que el origen autorizado del documento no otorga autoridad a las instrucciones contenidas en él.

**Caso.** Un asistente de lectura recibe texto que pide actuar sobre otro servicio. La herramienta de lectura carece de permiso de escritura y el backend verifica qué recursos puede consultar el usuario.

> [!question]- ¿Dónde se aplica el aislamiento entre clientes?
> En la aplicación y las herramientas, con checks sobre identidad, tenant y recurso.

## Conexiones

[Diseño de aplicaciones e interfaces Claude](../ccdv-f-diseno-de-aplicaciones-e-interfaces-claude/) · [Ingeniería de prompts y ejemplos](../ccdv-f-ingenieria-de-prompts-y-ejemplos/) · [Guardrails y despliegue seguro](../ccdv-f-guardrails-y-despliegue-seguro/) · [Identidad, secretos y claves API](../ccdv-f-identidad-secretos-y-claves-api/)

## Fuentes

- [Claude Platform · Mitigar prompt injection](https://platform.claude.com/docs/en/test-and-evaluate/strengthen-guardrails/mitigate-jailbreaks)
- [Claude Code · Permisos](https://code.claude.com/docs/en/permissions)
