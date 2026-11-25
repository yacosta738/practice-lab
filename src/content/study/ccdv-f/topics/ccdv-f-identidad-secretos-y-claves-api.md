---
title: "Identidad, secretos y claves API"
tipo: concepto
tags:
  - claude
  - certification
  - ccdv-f/seguridad
aliases:
  - "Identity, Secrets, and Key Management"
dominio: D7
---
[Índice](../ccdv-f-indice-de-certificacion/) · [Dominio D7](../ccdv-f-indice-de-certificacion/#d7-seguridad-y-controles)

Separa identidades humanas y de servicio. Usa credenciales por entorno con permisos mínimos. Guarda secretos en un gestor y entrégalos al componente que los requiere. Verifica identidad, audiencia y alcance antes de actuar. Rota y revoca claves según su ciclo de vida, y monitoriza uso y acceso autorizado.

**Caso.** Un agente que consulta inventario puede usar una identidad de lectura restringida al catálogo del tenant y delegar acciones sensibles mediante un flujo aprobado. Evita enviar la credencial al modelo o guardarla en trazas.

> [!question]- ¿Qué comprobarías al cambiar de proveedor o de entorno?
> Autenticación, alcance efectivo, destino de las credenciales, registro auditable y revocación.

## Conexiones

[Gestión de configuración y versiones](../ccdv-f-gestion-de-configuracion-y-versiones/) · [Entradas no confiables y protección de datos](../ccdv-f-entradas-no-confiables-y-proteccion-de-datos/) · [Guardrails y despliegue seguro](../ccdv-f-guardrails-y-despliegue-seguro/) · [Servidores, transportes y autorización MCP](../ccdv-f-servidores-transportes-y-autorizacion-mcp/)

## Fuentes

- [Claude Platform · API overview](https://platform.claude.com/docs/en/api/overview)
- [Claude Code · Permisos](https://code.claude.com/docs/en/permissions)
- [MCP · Autorización 2026-07-28](https://modelcontextprotocol.io/specification/2026-07-28/basic/authorization) — revisar el [registro de fuentes](../source-register/) para el límite de consulta directa.
