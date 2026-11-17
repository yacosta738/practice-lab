# Practice Lab

Interactive practice platform for certification preparation. Study by domain, take timed mock exams, and track your progress — all offline in your browser.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Available Certifications

| Certification | Description                              | Questions | Domains |
| ------------- | ---------------------------------------- | --------- | ------- |
| **CCDV-F**    | Claude Developer Foundations (Anthropic) | 122       | 8       |

## Features

- **Practice mode** — study question by question with explanations and sources.
- **Exam mode** — timed mock exam with 53 questions distributed by domain.
- **Weaknesses mode** — focus on the questions you got wrong.
- **Progress tracking** — persistent statistics in `localStorage`.
- **100% offline** — no server, no external dependencies.

## Stack

- [Astro](https://astro.build) — static site framework.
- TypeScript — full type safety.
- Native CSS — no preprocessors or UI frameworks.
- `localStorage` — progress and session persistence.

## Project Structure

```
/
├── public/                  # Static assets
├── src/
│   ├── certifications/      # Config and questions per certification
│   │   ├── ccdv-f/
│   │   │   ├── config.ts    # Exam blueprint, domains, theme
│   │   │   └── questions.ts # Question bank
│   │   └── index.ts         # Certification registry
│   ├── components/          # Astro components
│   ├── layouts/             # Reusable layouts
│   ├── lib/                 # Quiz engine and types
│   ├── pages/               # Application routes
│   └── styles/              # Global styles
├── astro.config.mjs
└── package.json
```

## Adding a New Certification

1. Create a directory at `src/certifications/<slug>/`.
2. Add `config.ts` with the exam blueprint and domains.
3. Add `questions.ts` with the question bank.
4. Register the certification in `src/certifications/index.ts`.

Each question follows this structure:

```ts
{
  id: "q001",
  domain: "D1",
  topic: "Topic name",
  question: "¿Pregunta?",
  options: ["Option A", "Option B", "Option C", "Option D"],
  correctAnswers: [0],
  explanation: "Explanation of the correct answer.",
  source: { label: "Source", url: "https://..." }
}
```

## Commands

| Command        | Action                                 |
| -------------- | -------------------------------------- |
| `pnpm install` | Install dependencies                   |
| `pnpm dev`     | Start dev server at `localhost:4321`   |
| `pnpm build`   | Generate production build in `./dist/` |
| `pnpm preview` | Preview the build locally              |

## Requirements

- Node.js >= 22.23.4
- pnpm

## License

MIT
