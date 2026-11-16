# Plan RPI: Rediseño visual de Practice Lab

## Ruta
Delegated direct. Diseño temporal colaborativo; no se solicitan artefactos SDD.

## Objetivo
Rediseñar la identidad visual y la jerarquía de toda la experiencia web de Practice Lab, desde la página de inicio y el índice disponible de certificaciones hasta las pantallas de inicio de práctica, pregunta y resultados.

## Dirección aprobada
Preparación premium con azul noche, blanco cálido y coral. El usuario aprobó la paleta, revisó la especificación detallada en `tmp/plans/2026-11-16-rediseño-visual-design.md` y autorizó implementarla.

## Tareas
1. Definir tokens y estados de color accesibles para tema claro y oscuro.
2. Rediseñar la página de inicio para explicar el producto con rapidez y destacar la acción para empezar.
3. Presentar la certificación existente como una opción editorial clara con datos reales.
4. Aplicar la identidad a inicio de quiz, pregunta, feedback, navegación, resultados y revisión de respuestas.
5. Adaptar layouts a móvil, tablet y escritorio sin perder funciones ni contenido.
6. Verificar visualmente rutas y estados a 1440, 768, 390 y 320 px; validar build y controles existentes.

## Límites
- No agregar certificaciones, métricas, promesas de aprobación, afiliaciones ni pruebas sociales no verificadas.
- No cambiar lógica del quiz, respuestas, persistencia, navegación ni reglas de puntuación, salvo autorización posterior explícita.
- Mantener las rutas y funciones actuales.
- No modificar componentes de starter que no formen parte de las rutas activas.
- La especificación visual ya fue revisada y aprobada; mantener este límite como evidencia del gate de diseño completado.

## Evidencia
- `npm run build` compiló las dos rutas estáticas.
- Inspector visual de portada a 1440/768/390 px: cero desbordamientos horizontales y ningún hallazgo de bajo contraste; heurísticas no aplicables: paleta editorial etiquetada genéricamente como paleta de asistente y H1 mayor que el recomendado para una app.
- Comprobación manual de portada a 320 px: H1 en dos líneas, sin desbordamiento; tema oscuro: texto del botón primario sobre coral con contraste medido por la combinación de tokens.
- En el flujo del quiz se inició una sesión y se comprobó resultados a 320 px: cero desbordamiento, acciones completas, separación de 12 px entre dominios y puntajes.
- `git diff --check` pasó.

## Estado
Ready — build, responsive y flujo principal verificados; cambios limitados a la presentación visual.
