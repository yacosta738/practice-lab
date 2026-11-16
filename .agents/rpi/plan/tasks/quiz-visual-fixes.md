# Plan RPI: Correcciones visuales del quiz

## Ruta
Delegated direct. No se solicitan artefactos SDD.

## Objetivo
Resolver los problemas observados en la auditoría visual del flujo de práctica, conservando el estilo `framed-sheet`, los textos del producto y el comportamiento existente.

## Tareas
1. Ajustar la distribución de acciones en resultados para móvil: los botones deben caber dentro del panel, conservar etiquetas legibles y no solaparse.
2. Unificar la tipografía activa en el flujo del quiz: el cuerpo, controles y contenido generado por JavaScript deben heredar IBM Plex Sans, con tamaños secundarios legibles y jerarquía coherente.
3. Mejorar la jerarquía y el balance del inicio sin añadir contenido factual ni cambiar las acciones de inicio; respetar el marco y los tokens actuales.
4. Revisar pregunta, resultados e inicio a 1440, 768 y 390 px; capturar evidencia visual y comprobar que el estado funcional se mantiene.

## Límites
- No modificar lógica de sesiones, respuestas, progreso, persistencia ni toggle de tema.
- No rediseñar fuera de las pantallas activas del quiz.
- No instalar dependencias.
- No editar capturas ni artefactos previos no relacionados.

## Evidencia
- Capturas antes/después con `inspect.mjs --app` y revisión visual humana.
- `npm run build` como validación de Astro.
- `git status` para confirmar archivos tocados.

## Estado
Working — plan creado antes de los cambios de código.
