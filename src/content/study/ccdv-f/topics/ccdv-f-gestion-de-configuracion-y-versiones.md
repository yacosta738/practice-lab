---
title: "Gestión de configuración y versiones"
tipo: concepto
tags:
  - claude
  - certification
  - ccdv-f/integracion
aliases:
  - "Configuration Management"
dominio: D2
---

[Índice](../ccdv-f-indice-de-certificacion/) · [Dominio D2](../ccdv-f-indice-de-certificacion/#d2-aplicaciones-e-integracion)

Mantén instrucciones de proyecto en CLAUDE.md y configura permisos y opciones en el ámbito de
settings apropiado. Versiona de forma explícita el modelo, el prompt, el esquema y las dependencias
del plugin. Guarda las credenciales separadas de la configuración revisable. Registra qué
combinación generó un resultado y qué evaluación aprobó el cambio.

**Caso.** Si un alias de modelo se actualiza y cambia el output, reproduce con la combinación
anterior y nueva, ejecuta la suite de regresión y publica gradualmente. Conserva una configuración
conocida para volver atrás.

> [!question]- ¿Qué necesitas para reproducir un fallo seis semanas después?
> Identidad de modelo, prompt y herramientas, condiciones de entrada y ejecución, estadísticas y
> trazas con datos sensibles excluidos.

## Conexiones

[Ciclo de vida y despliegue de soluciones Claude](../ccdv-f-ciclo-de-vida-y-despliegue-de-soluciones-claude/) · [Operación de Claude Code](../ccdv-f-operacion-de-claude-code/) · [Selección y migración de modelos Claude](../ccdv-f-seleccion-y-migracion-de-modelos-claude/) · [Identidad, secretos y claves API](../ccdv-f-identidad-secretos-y-claves-api/)

## Fuentes

- [Claude Code · Configuración](https://code.claude.com/docs/en/settings)
- [Claude Code · Memoria de proyecto](https://code.claude.com/docs/en/memory)
- [Claude Platform · Modelos](https://platform.claude.com/docs/en/models/overview)
- [Claude Code · Extensiones](https://code.claude.com/docs/en/features-overview)
