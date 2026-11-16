# Practice Lab

Plataforma de práctica interactiva para preparación de certificaciones. Estudia por dominio, realiza exámenes simulados con tiempo y sigue tu progreso — todo offline en tu navegador.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Certificaciones disponibles

| Certificación | Descripción | Preguntas | Dominios |
|---|---|---|---|
| **CCDV-F** | Claude Developer Foundations (Anthropic) | 122 | 8 |

## Características

- **Modo práctica** — estudia pregunta por pregunta con explicaciones y fuentes.
- **Modo examen** — simulacro cronometrado con 53 preguntas distribuidas por dominio.
- **Modo debilidades** — enfócate en las preguntas que fallaste.
- **Seguimiento de progreso** — estadísticas persistentes en `localStorage`.
- **100% offline** — sin servidor, sin dependencias externas.

## Stack

- [Astro](https://astro.build) — framework estático.
- TypeScript — tipado completo.
- CSS nativo — sin preprocesadores ni frameworks de UI.
- `localStorage` — persistencia de progreso y sesiones.

## Estructura del proyecto

```
/
├── public/                  # Assets estáticos
├── src/
│   ├── certifications/      # Configuración y preguntas por certificación
│   │   ├── ccdv-f/
│   │   │   ├── config.ts    # Blueprint del examen, dominios, tema
│   │   │   └── questions.ts # Banco de preguntas
│   │   └── index.ts         # Registro de certificaciones
│   ├── components/          # Componentes Astro
│   ├── layouts/             # Layouts reutilizables
│   ├── lib/                 # Motor de quizzes y tipos
│   ├── pages/               # Rutas de la aplicación
│   └── styles/              # Estilos globales
├── astro.config.mjs
└── package.json
```

## Agregar una nueva certificación

1. Crea un directorio en `src/certifications/<slug>/`.
2. Agrega `config.ts` con el blueprint del examen y los dominios.
3. Agrega `questions.ts` con el banco de preguntas.
4. Registra la certificación en `src/certifications/index.ts`.

Cada pregunta sigue esta estructura:

```ts
{
  id: "q001",
  domain: "D1",
  topic: "Topic name",
  question: "¿Pregunta?",
  options: ["Opción A", "Opción B", "Opción C", "Opción D"],
  correctAnswers: [0],
  explanation: "Explicación de la respuesta correcta.",
  source: { label: "Fuente", url: "https://..." }
}
```

## Comandos

| Comando | Acción |
|---|---|
| `pnpm install` | Instala dependencias |
| `pnpm dev` | Inicia servidor de desarrollo en `localhost:4321` |
| `pnpm build` | Genera build de producción en `./dist/` |
| `pnpm preview` | Previsualiza el build localmente |

## Requisitos

- Node.js >= 22.23.4
- pnpm

## Licencia

MIT
