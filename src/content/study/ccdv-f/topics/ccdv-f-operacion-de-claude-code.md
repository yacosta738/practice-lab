---
title: "Operación de Claude Code"
tipo: concepto
tags:
  - claude
  - certification
  - ccdv-f/claude-code
aliases:
  - "Claude Code Operation"
dominio: D3
---

[Índice](../ccdv-f-indice-de-certificacion/) · [Dominio D3](../ccdv-f-indice-de-certificacion/#d3-claude-code)

Usa CLAUDE.md para contexto durable del repositorio y reglas para instrucciones más específicas, con
su alcance documentado. Los skills empaquetan procedimientos reutilizables y comandos invocables.
Los agentes especializados aíslan tareas y contexto. La memoria automática añade aprendizajes
persistentes según configuración. Revisa lo que se guarda y su ámbito.

En un repo nuevo identifica convenciones, configura permisos y revisa el CLAUDE.md inicial. Explora
y planifica antes de editar. Usa sesión interactiva para revisar decisiones, reanudación para
continuar trabajo vigente, y CLI no interactiva y salida estructurada o streaming cuando un proceso
necesite consumir la respuesta. En modo automático, confirma los controles que siguen en vigor y usa
permisos según riesgo.

**Caso.** Una revisión periódica en CI puede ejecutar un comando no interactivo con acceso de
lectura y consumir eventos. Una operación irreversible exige una autorización explícita en el punto
de efecto.

> [!question]- ¿Dónde vive una regla que el equipo necesita compartir?
> En configuración o instrucciones de proyecto según si la regla se ejecuta como permiso o como
> contexto para Claude.

## Conexiones

[Gestión de configuración y versiones](../ccdv-f-gestion-de-configuracion-y-versiones/) · [Contexto, compactación y memoria](../ccdv-f-contexto-compactacion-y-memoria/) · [Hooks como controles deterministas](../ccdv-f-hooks-como-controles-deterministas/) · [Elegir herramientas, skills, plugins o MCP](../ccdv-f-elegir-herramientas-skills-plugins-o-mcp/)

## Fuentes

- [Claude Code · Extensiones](https://code.claude.com/docs/en/features-overview)
- [Claude Code · Configuración](https://code.claude.com/docs/en/settings)
- [Claude Code · Memoria de proyecto](https://code.claude.com/docs/en/memory)
- [Claude Code · CLI](https://code.claude.com/docs/en/cli-reference)
- [Claude Code · Permisos](https://code.claude.com/docs/en/permissions)
