---
title: "Claude Certified Developer – Foundations"
type: study-notes
certification: CCDV-F
status: verified
source_kind: skilljar-authenticated
updated: '2026-11-15'
tags:
- certification/ccdv-f
- type/study-notes
- source/skilljar
aliases:
- Apuntes Skilljar
- CCDV-F Skilljar notes
---
Apuntes de estudio en español a partir de las pantallas consultadas en Anthropic Academy el 14 de noviembre de 2026. Los ejemplos son propios. La numeración corresponde al contador del reproductor de cada módulo. [Itinerario de Skilljar](https://anthropic-partners.skilljar.com/path/claude-certified-developer-foundations)

## 1. MSO Foundations

**Tokens, contexto y variabilidad · Pantalla 2.** Los tokens son la unidad que mide la API. Las instrucciones, el historial, los documentos, las definiciones y respuestas de herramientas y la generación compiten por el presupuesto de contexto. Estima el tamaño con el tokenizador o el contador de la API y reserva margen para la salida. Una entrada demasiado larga puede rechazarse antes de generar. Si la generación alcanza el límite, comprueba el motivo de parada y trata el resultado como potencialmente incompleto. Por ejemplo, en un lector de contratos, conserva las cláusulas pertinentes y resume el historial antes de añadir otro documento.

Una respuesta válida puede tener varias redacciones. Para una extracción, comprueba que el resultado se pueda parsear y que los campos y valores respeten el contrato. Si necesitas evaluar si un resumen preserva el significado, define una rúbrica. El soporte de parámetros de muestreo varía por modelo. [Skilljar · MSO Foundations](https://anthropic-partners.skilljar.com/path/claude-certified-developer-foundations/mso-foundations)

**Modelo y razonamiento · Pantalla 3.** Evalúa por separado la capacidad del modelo y el esfuerzo de razonamiento que necesita la tarea. Un clasificador sencillo y una síntesis con dependencias pueden requerir configuraciones distintas. Usa los mismos casos y umbrales de calidad, latencia y coste al comparar. Los modos, valores por defecto y parámetros de razonamiento dependen del modelo. [Skilljar · MSO Foundations](https://anthropic-partners.skilljar.com/path/claude-certified-developer-foundations/mso-foundations)

**Ejemplos · Pantalla 4.** Zero-shot usa la instrucción sola, one-shot añade un ejemplo de entrada y salida y few-shot añade varios. Un caso representativo puede aclarar cómo normalizar una etiqueta ambigua. Añade variantes cuando la evaluación muestre que el primer ejemplo cubre demasiado poco. Cada ejemplo consume contexto y tokens de entrada. [Skilljar · MSO Foundations](https://anthropic-partners.skilljar.com/path/claude-certified-developer-foundations/mso-foundations)

**SDK, REST y formas de entrega · Pantalla 5.** El SDK envuelve la API HTTP y simplifica operaciones como construir solicitudes y leer respuestas. Una llamada síncrona entrega la respuesta completa. El streaming usa eventos SSE para mostrar avances mientras llega el resultado y requiere ensamblarlo. Un cliente asíncrono permite que la aplicación atienda otras tareas mientras espera una respuesta en tiempo real. Message Batches encaja con trabajos offline que pueden esperar y favorecen el coste por volumen. Por ejemplo, usa streaming para una explicación larga frente al usuario y considera lotes para clasificar un archivo histórico. [Skilljar · MSO Foundations](https://anthropic-partners.skilljar.com/path/claude-certified-developer-foundations/mso-foundations) · [Claude Platform · Batch processing](https://platform.claude.com/docs/en/build-with-claude/batch-processing)

## 2. Production-Grade Prompting, Agents & Tool Use

**Diagnóstico de prompts · Pantallas 2–3.** Reproduce el fallo con una entrada concreta. Si el agente cambia el alcance de una tarea entre conversaciones, aclara sus reglas persistentes en el mensaje de sistema. Si se mezclan instrucciones, ejemplos y datos de entrada, delimita sus funciones con etiquetas descriptivas. Si deriva el formato, expresa el contrato de salida con campos, tipos y el comportamiento para valores ausentes. Si una convención se entiende mal, añade pares representativos de entrada y salida. Cambia una cosa por iteración y vuelve a ejecutar los casos representativos.

Ejemplo propio. Un conversor de formularios devuelve una explicación en prosa y omite la clave de fecha cuando el campo viene vacío. Prueba un contrato que exija la clave y represente la ausencia con `null`, acompañado de un ejemplo con ese caso y una comprobación del resultado en el consumidor. La delimitación XML aclara las funciones de cada bloque del prompt. La autorización para ejecutar acciones sigue correspondiendo a la aplicación. [Skilljar · Production-Grade Prompting](https://anthropic-partners.skilljar.com/path/claude-certified-developer-foundations/production-grade-prompting-agents-tool-use) · [Claude Platform · Prompting best practices](https://platform.claude.com/docs/claude/use-xml-tags)

## 3. Claude Code, MCP & Integration

**Flujo y permisos · Pantallas 2–3.** En un repositorio desconocido, empieza por explorar el código y sus dependencias, revisa un plan con alcance y pruebas y pasa a la implementación con los permisos apropiados. Elige el modo según el riesgo y la reversibilidad. Un cambio rutinario en archivos de prueba y una acción destructiva en un entorno compartido requieren controles distintos. Conserva una revisión humana justo antes de la acción cuyo efecto sea costoso de revertir.

**Ámbito de configuración · Pantalla 2.** Una preferencia personal puede vivir en la configuración de usuario. Una regla que el equipo debe compartir requiere el ámbito del proyecto. Para una restricción obligatoria de toda la organización, usa la configuración administrada que corresponda. Por ejemplo, un equipo puede compartir los permisos de edición de sus pruebas y exigir aprobación para cambiar la infraestructura de producción. Consulta la documentación para confirmar precedencia y comportamiento de cada modo. [Skilljar · Claude Code, MCP & Integration](https://anthropic-partners.skilljar.com/path/claude-certified-developer-foundations/claude-code-mcp-integration) · [Claude Code · Settings files and precedence](https://code.claude.com/docs/en/settings)

## 4. Production Engineering, Evals & Security

**Criterios de lanzamiento · Pantalla 2.** Antes de implementar, define qué resultados deben cumplir los casos, qué errores debe soportar el sistema, los límites de coste y latencia y quién puede acceder a qué datos o acciones. Construye la evaluación con un conjunto repetible de entradas, el comportamiento esperado y una forma de puntuar. Cambia un componente por vez para poder atribuir las diferencias.

**Elección y calibración del evaluador · Pantallas 2–3.** Comprueba con código los tipos, el esquema y las reglas observables. Si el orden es irrelevante, compara el contenido como conjunto y valida las restricciones necesarias. Para valorar fidelidad o pertinencia, define una rúbrica y calibra el juez con casos etiquetados por personas. Una extracción puede devolver un identificador perfectamente válido y asignarlo al objeto equivocado. Incluye casos ambiguos y reserva ejemplos etiquetados para verificar generalización. [Skilljar · Production Engineering, Evals & Security](https://anthropic-partners.skilljar.com/path/claude-certified-developer-foundations/production-engineering-evals-security) · [Claude Platform · Define success criteria and build evaluations](https://platform.claude.com/docs/en/test-and-evaluate/develop-tests)

## 5. Accelerators & IP Contribution

**Empaquetar para otro equipo · Pantallas 2–3.** Identifica lo que se conserva y lo que cambia entre despliegues. En una plantilla de agente, deja configurables los valores propios de cada instalación, como el repositorio y los umbrales de revisión. En un servidor MCP configurable, documenta entradas, identidad y dependencias de servicio. Una evaluación portable incluye casos adecuados, criterios y una forma de ejecutar la prueba de regresión fuera del entorno original.

Documenta los supuestos operativos, las entradas esperadas y los fallos que cubre el activo. Incluye el registro de auditoría en el diseño para poder explicar qué identidad actuó y qué datos tocó. Ejemplo propio. Para llevar un extractor de inventario a otra región, prepara configuración para el origen de datos, credenciales propias de ese entorno y casos sintéticos que comprueben formatos y permisos. [Skilljar · Accelerators & IP Contribution](https://anthropic-partners.skilljar.com/path/claude-certified-developer-foundations/accelerators-ip-contribution)

## Cobertura verificada y pendiente

Abrí el itinerario y las cinco lecciones interactivas con la sesión autenticada disponible. En cada módulo llegué a la primera pantalla que exigía responder para seguir. El botón de avance se desactivó allí y el índice no permitió saltar a material posterior. Las pantallas de evaluación se cuentan como abiertas. Los apuntes proceden de las pantallas de orientación y enseñanza consultadas, incluidos los casos de fallo previos al primer checkpoint cuando aparecían. El contador del módulo 4 mostraba 23 pantallas aunque su portada anunciaba 21.

| Módulo | Pantallas abiertas | Bloqueo observado | Contenido posterior pendiente según el índice |
| --- | --- | --- | --- |
| 1 | 1–6 de 9 | Pantalla 6, cuestionario del módulo | 7–9. Ejercicio, recapitulación y cierre |
| 2 | 1–4 de 29 | Pantalla 4, primer checkpoint de prompting | 5–29. Razonamiento, herramientas y esquemas, streaming, contexto, construcción de agentes, memoria, depuración, ingesta multimodal y por lotes, cierre |
| 3 | 1–4 de 22 | Pantalla 4, primer checkpoint de permisos | 5–22. Contexto persistente, empaquetado de flujos, servidores MCP, integración empresarial, tarea y cierre |
| 4 | 1–4 de 23 | Pantalla 4, primer checkpoint de evaluación | 5–23. Pruebas y trazas, fallos y selección de modelo, coste, orquestación, seguridad, tarea y cierre |
| 5 | 1–4 de 25 | Pantalla 4, primer checkpoint de empaquetado | 5–25. Contribuciones, requisitos y ciclo de vida, despliegue y versionado, plataformas, límites de confianza, tarea y cierre |

El índice permite identificar los temas pendientes. Los detalles de esas pantallas y el comportamiento de las actividades después de responder siguen sin verificar. El banco ampliado usa escenarios originales vinculados a las pantallas de enseñanza consultadas.
