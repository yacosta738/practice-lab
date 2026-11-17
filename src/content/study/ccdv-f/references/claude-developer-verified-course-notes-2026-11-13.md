---
title: "Claude Developer — verified public course notes"
source: https://anthropic-partners.skilljar.com/path/claude-developer
retrieved: 2026-11-13
status: public-curricula-extracted; authenticated-lesson-bodies-unavailable
language: es
---
> **Alcance:** síntesis de los temarios públicos de Skilljar. No son transcripciones ni reproducciones de vídeos o evaluaciones. Los módulos privados y sus cuestionarios no se han extraído.

## Ruta principal

La [ruta Claude Developer](https://anthropic-partners.skilljar.com/path/claude-developer) indica aproximadamente 8 horas de estudio y el objetivo de construir un agente funcional con una herramienta conectada a datos reales y un pequeño conjunto de pruebas que sustenten sus resultados. El listado de la ruta presenta **nueve cursos** y además una **lección externa de elección de modelos** (diez elementos de aprendizaje).

| # | Curso | Fuente | Contenido público verificado |
|---|---|---|---|
| 1 | AI Capabilities and Limitations | [Skilljar](https://anthropic-partners.skilljar.com/path/claude-developer/ai-capabilities-and-limitations) | Predicción de tokens, conocimiento, memoria de trabajo y steerability. |
| 2 | AI Fluency for Builders | [Skilljar](https://anthropic-partners.skilljar.com/path/claude-developer/ai-fluency-for-builders) | Framework 4D: Delegation, Description, Discernment, Diligence. |
| 3 | Claude Platform & Model Foundations | [Skilljar](https://anthropic-partners.skilljar.com/path/claude-developer/claude-platform-model-foundations) | Entrada, funcionalidades, modelo y contexto. |
| extra | Choosing the right Claude model | [Claude Academy](https://academy.claude.com/tutorials/choosing-the-right-claude-model) | Comparación de modelos y niveles de esfuerzo. |
| 4 | Claude Platform 101 | [Skilljar](https://anthropic-partners.skilljar.com/path/claude-developer/claude-platform-101) | API, agent loop, herramientas, thinking, skills, MCP, contexto, agentes gestionados. |
| 5 | Claude Code 101 | [Skilljar](https://anthropic-partners.skilljar.com/path/claude-developer/claude-code-101) | Explore–Plan–Code–Commit, permisos, CLAUDE.md, skills, subagents, hooks. |
| 6 | Claude Code in Action | [Skilljar](https://anthropic-partners.skilljar.com/path/claude-developer/claude-code-in-action) | Sesiones largas, planificación, compaction, worktrees, headless, CI, verificación. |
| 7 | Introduction to Model Context Protocol | [Skilljar](https://anthropic-partners.skilljar.com/path/claude-developer/introduction-to-model-context-protocol) | Servidor y cliente MCP en Python; tools, resources y prompts. |
| 8 | Introduction to agent skills | [Skilljar](https://anthropic-partners.skilljar.com/path/claude-developer/introduction-to-agent-skills) | SKILL.md, frontmatter, activación, progressive disclosure, distribución. |
| 9 | Introduction to subagents | [Skilljar](https://anthropic-partners.skilljar.com/path/claude-developer/introduction-to-subagents) | Delegación, contextos aislados, herramientas limitadas, informes estructurados. |

## Detalle de los cursos (resumen redactado desde el temario público)

### 1. AI Capabilities and Limitations

El curso presenta seis bloques y 13 lecciones, más una evaluación según la ficha pública. Parte de la distinción entre pretraining y fine-tuning, después estudia cómo el modelo predice tokens, por qué puede producir respuestas plausibles pero incorrectas, cómo la rareza o actualidad de los hechos afecta la confiabilidad, la limitación de la ventana de contexto y la dificultad de seguir instrucciones ambiguas o complejas. El último bloque combina las cuatro propiedades para diagnosticar errores y aplicar correcciones específicas en vez de reintentar sin cambios.

**Bloques:** Getting started (3); Next Token Prediction (2); Knowledge (2); Working Memory (2); Steerability (2); Putting it all together and next steps (2).

### 2. AI Fluency for Builders

Curso articulado alrededor de los **4D**: delegar únicamente aquello que corresponde, describir resultados y restricciones con claridad, evaluar críticamente la salida y asumir responsabilidad sobre lo que se entrega. Incluye elaboración de un brief reutilizable, paso de necesidad de usuario a instrucciones verificables, evaluación de código y experiencia de usuario y decisiones de enviar, corregir o detener un producto.

**Bloques:** Introduction and AI Fluency framework (2); How AI works (1); The 4D framework for builders (2); Discernment for builders (2); Tying it all together (3). La ficha pública presenta 10 lecciones.

### 3. Claude Platform & Model Foundations

Enseña cuatro decisiones previas al prompt: seleccionar el punto de entrada, activar las funcionalidades adecuadas, elegir capacidad del modelo según calidad/latencia/volumen y gestionar el contexto entre sesiones. Distingue modelos Haiku, Sonnet y Opus en el temario visible. **Nota de actualización:** el tutorial externo de Claude Academy consultado describe también Fable; las familias disponibles y condiciones de uso cambian con el tiempo, por lo que no deben memorizarse como invariantes.

### Extra. Choosing the right Claude model

El tutorial externo consultado enumera Fable, Opus, Sonnet y Haiku: Fable para retos especialmente largos y abiertos; Opus para trabajo complejo con juicio; Sonnet como equilibrio entre coste, velocidad y capacidades; Haiku para procesos rápidos y repetitivos. Se recomienda empezar con el modelo apropiado al producto, diagnosticar prompt/contexto, cambiar esfuerzo primero y luego familia si siguen existiendo brechas de calidad. **Fuente:** [Claude Academy](https://academy.claude.com/tutorials/choosing-the-right-claude-model); consejo específico del tutorial, no regla universal de todas las API o planes.

### 4. Claude Platform 101

Programa que va de la primera llamada API a un agente funcional: estructura de solicitudes y respuestas, coste de modelo, bucle de herramientas manual y `Tool Runner` del SDK, thinking, herramientas integradas operadas por Anthropic, Skills, MCP y gestión de contexto. También aborda **managed agents** y su flujo de eventos. Las demostraciones se hacen con el SDK TypeScript `@anthropic-ai/sdk`.

**Currículo público:** What is the Claude Platform?; Your first API call; Choosing the right model; Teaching your Agent; The agent loop explained; What is tool use?; What is thinking?; Extending your Agent; Built-in tools; Skills; MCP; Context management; Managed Agents; What are managed agents?; Building your first managed agent; Building with Claude Code; Quiz.

### 5. Claude Code 101

Los fundamentos del agente de programación: herramientas y permisos, instalación en terminal e IDE, elección entre modos supervisados y Plan Mode, iteración Explore → Plan → Code → Commit, revisión de código y control del contexto con `/compact`, `/clear` y `/context`. Personalización mediante `CLAUDE.md`, subagents, Skills, MCP y hooks.

**Bloques:** What is Claude Code? (2); Your first prompt (2); Daily workflows (3); Customizing Claude Code (5).

### 6. Claude Code in Action

Su objetivo es operar sesiones largas de forma segura: delimitar trabajo con Plan Mode, guiar compaction, revertir decisiones, usar objetivos y bucles de ejecución, dividir agentes en worktrees; diferenciar instrucciones estables en `CLAUDE.md` de procedimientos en Skills y controles deterministas en hooks; aplicar modos de permiso, ejecuciones headless, programación de tareas y GitHub Actions; y verificar los resultados de sesiones autónomas mediante pruebas y revisión.

**Bloques:** Steer the Work (1); Configure Claude (4); Automate Repeat Work (2); Verify and Share (2).

### 7. Introduction to Model Context Protocol

Describe la arquitectura MCP cliente-servidor, implementa servidor con SDK Python, explora tools, resources y prompts, desarrolla el cliente, ejecuta pruebas con MCP Inspector y maneja comunicación asíncrona y limpieza de recursos. Incluye un ejercicio de sistema de gestión documental. **Bloques:** MCP fundamentals & server development (8); MCP client implementation & advanced features (8).

### 8. Introduction to agent skills

Enseña la estructura `SKILL.md` y frontmatter, descripciones que permitan activar la skill, multi-file skills, progressive disclosure para conservar tokens, restricción `allowed-tools`, scripts auxiliares, entrega por repositorio/plugins/configuración de organización, integración en subagents y diagnóstico de problemas de activación o prioridad.

**Currículo público:** What are skills?; Creating your first skill; Configuration and multi-file skills; Skills vs. other Claude Code features; Sharing skills; Troubleshooting skills.

### 9. Introduction to subagents

Explica cómo un subagente trabaja en una ventana de contexto aislada, con instrucciones y acceso a herramientas definidos, y devuelve resultados acotados al orquestador. Enseña el comando `/agents`, el diseño de informes estructurados y de errores/bloqueos, decisiones sobre el uso de paralelismo y casos donde delegar añade complejidad innecesaria.

**Currículo público:** What are subagents?; Creating a subagent; Designing effective subagents; Using subagents effectively.

## Curso de preparación específico: Claude Certified Developer — Foundations

La ruta de preparación para el examen es **distinta** de la ruta introductoria anterior y contiene cinco módulos públicos. La información siguiente es una síntesis de objetivos públicos, no el contenido de cada clase:

1. [MSO Foundations](https://anthropic-partners.skilljar.com/path/claude-certified-developer-foundations/mso-foundations) (57 min): tokens, context window, sampling, no determinismo, familias de modelos, razonamiento, zero/one/few-shot, REST/SDK, streaming, async y batch.
2. [Production-Grade Prompting, Agents & Tool Use](https://anthropic-partners.skilljar.com/path/claude-certified-developer-foundations/production-grade-prompting-agents-tool-use) (209 min): instrucciones, etiquetas XML, few-shot, schemas, tool-use loop, múltiples tools, streaming, gestión del contexto, memoria persistente, HITL, PDFs/imágenes, Files API, Message Batches.
3. [Claude Code, MCP & Integration](https://anthropic-partners.skilljar.com/path/claude-certified-developer-foundations/claude-code-mcp-integration) (142 min): modos de permiso, CLAUDE.md, rules, hooks, agentes, Skills/plugins, MCP, transportes, sistemas empresariales y autenticación.
4. [Production Engineering, Evals & Security](https://anthropic-partners.skilljar.com/path/claude-certified-developer-foundations/production-engineering-evals-security) (211 min): suites de evaluación, jueces LLM calibrados con humanos, pruebas y tracing, errores reintentables/no reintentables, límites de coste, prompt injection, secretos y control de acceso.
5. [Accelerators & IP Contribution](https://anthropic-partners.skilljar.com/path/claude-certified-developer-foundations/accelerators-ip-contribution) (155 min): componentes reutilizables, contribuciones, comparación de API directa, Bedrock y Vertex, versionado y límites de datos/identidad.

## Peso oficial del examen CCDV-F

La [guía de examen v1.0, julio 2026](https://drive.google.com/file/d/1aWhE373XnbPEcYbzXV6VjRfjHpUQdM9s/view) especifica **53 preguntas, 120 minutos y aprobado escalado 720/1000**, con estos dominios:

| Dominio | Peso |
|---|---:|
| Applications and Integration | 33.1% |
| Model Selection and Optimization | 16.8% |
| Agents and Workflows | 14.7% |
| Prompt and Context Engineering | 11.0% |
| Tools and MCPs | 10.6% |
| Security and Safety | 8.1% |
| Claude Code | 3.1% |
| Eval, Testing, and Debugging | 2.6% |

**Recomendación propia:** estudiar primero el bloque API e integración, seguido de optimización y construcción de agentes. Crear una app mínima con SDK, tool loop, streaming, timeouts, retry condicionado, MCP, control de permisos, trazas y evals. No asumir que la experiencia genérica con LLM compensa conocer la semántica exacta de las interfaces de Anthropic.

## Inventario de acceso y limitaciones

- **Confirmado:** índice de la ruta principal, nueve fichas de cursos con su temario público, lección externa pública y cinco fichas de la ruta de preparación específica.
- **No disponible mediante extracción anónima:** vídeos completos, transcripciones, contenido de las clases tras la inscripción, cuestionarios, respuestas y archivos adjuntos privados.
- **No se han inventado** lecciones ni se ha simulado completar el aprendizaje en Skilljar.
- La documentación oficial sobre parámetros y disponibilidad debe verificarse en el momento de practicar, ya que el material puede cambiar.

## Fuentes

- https://anthropic-partners.skilljar.com/path/claude-developer
- https://anthropic-partners.skilljar.com/path/claude-certified-developer-foundations
- https://academy.claude.com/tutorials/choosing-the-right-claude-model
- https://drive.google.com/file/d/1aWhE373XnbPEcYbzXV6VjRfjHpUQdM9s/view
