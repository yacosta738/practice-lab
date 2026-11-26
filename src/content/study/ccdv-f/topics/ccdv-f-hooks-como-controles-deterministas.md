---
title: "Hooks como controles deterministas"
tipo: concepto
tags:
  - claude
  - certification
  - ccdv-f/seguridad
aliases:
  - "Claude Hooks"
dominio: D7
---

[Índice](../ccdv-f-indice-de-certificacion/) · [Dominio D7](../ccdv-f-indice-de-certificacion/#d7-seguridad-y-controles)

Un hook corre al producirse un evento de Claude Code o en el harness que lo soporte. Un hook previo
a una herramienta puede revisar argumentos y detener la operación según reglas verificables. Un hook
posterior sirve para observar o validar el resultado cuando el efecto ya ocurrió. Comprueba los
eventos, formatos y comportamiento de fallo en la documentación de la versión.

**Caso.** Bloquea ediciones en una ruta protegida antes de ejecutar una herramienta, con validación
de la ruta normalizada. Registra la decisión sin incluir el contenido del archivo y prueba tanto una
acción permitida como una denegada.

> [!question]- ¿Qué evento usarías para impedir una operación?
> Un evento previo a la acción con capacidad de denegar y comprobación adicional en la herramienta
> cuando aplique.

## Conexiones

[Construcción y alojamiento de agentes](../ccdv-f-construccion-y-alojamiento-de-agentes/) · [Operación de Claude Code](../ccdv-f-operacion-de-claude-code/) · [Guardrails y despliegue seguro](../ccdv-f-guardrails-y-despliegue-seguro/) · [Implementación de herramientas y tool-use loop](../ccdv-f-implementacion-de-herramientas-y-tool-use-loop/)

## Fuentes

- [Claude Code · Hooks](https://code.claude.com/docs/en/hooks)
- [Claude Code · Permisos](https://code.claude.com/docs/en/permissions)
