# Practice Lab

Interactive practice platform for certification preparation. Study by domain, take timed mock exams, and track your progress. Practice progress is saved locally in your browser; the site itself needs an internet connection to load.

![Practice Lab — Prepare with confidence](public/assets/practice-lab-confidence.png)

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Available Certifications

| Certification | Description                               | Bank | Domains | Mock exam |
| ------------- | ----------------------------------------- | ---- | ------- | --------- |
| **CCDV-F**    | Claude Developer Foundations              | 184  | 8       | 53        |
| **CCAO-F**    | Claude Certified Associate — Foundations  | 60   | 7       | 50        |
| **CCAR-P**    | Claude Certified Architect — Professional | 58   | 7       | 50        |
| **CCAR-F**    | Claude Certified Architect — Foundations  | 60   | 5       | 50        |

## Features

- **Practice mode** — study question by question with explanations and sources.
- **Exam mode** — timed mock exam with 53 questions distributed by domain.
- **Weaknesses mode** — focus on the questions you got wrong.
- **Progress tracking** — statistics and active sessions persist in browser `localStorage`; the site itself needs an internet connection to load.
- **Search** — the accessible search dialog matches result metadata and full-text study-note content; structurally identified assessment answers are omitted from its generated index.
- **Study library** — per-certification study notes rendered from Markdown, organised by exam domain with a table of contents and cross-links.

## Content Sources and Attribution

The imported practice questions for CCAO-F, CCAR-P, CCAR-F, and 53 items in CCDV-F come from [Cert Pro Quest](https://cert-pro-quest.lovable.app/) by Matthew Purcell. These are community-created practice questions and are not official exam content. See the [`NOTICE`](NOTICE) file for full attribution details.

## Stack

- [Astro](https://astro.build) — static site framework.
- TypeScript — full type safety.
- Native CSS — no preprocessors or UI frameworks.
- `localStorage` — progress and session persistence.

## Project Structure

```
/
├── public/                  # Static assets
├── scripts/
│   ├── scrape-cert-pro-quest.mjs  # Scraper for Cert Pro Quest
│   ├── generate-cpq-banks.mjs     # Generator for imported question banks
│   └── lib/
│       └── cpq-normalize.mjs      # Normalization utilities
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

### Regenerating the imported banks

The question banks for CCAO-F, CCAR-P, CCAR-F, and the CPQ additions for CCDV-F are generated from a snapshot of Cert Pro Quest. To regenerate them:

1. Update the snapshot: `node scripts/scrape-cert-pro-quest.mjs`
2. Regenerate banks: `node scripts/generate-cpq-banks.mjs`

The generator automatically formats its output with the project's Biome, so no manual formatting step is required.

## Adding a New Certification

The registry auto-discovers certifications from `src/certifications/<slug>/`. Create a directory with two files:

1. `config.ts` — export a `config` constant of type `CertificationConfig` with the exam blueprint, domains, and theme.
2. `questions.ts` — export a `questions` array of type `Question[]` with the question bank.

No manual registration is required; both files are loaded at build time via `import.meta.glob`.

## Study Notes

Study notes live in `src/content/study/<slug>/` as Markdown files. They are generated from an Obsidian vault by running:

```
pnpm sync:study
```

The default vault path is the Claude Certified Developer folder in iCloud and can be overridden with the `STUDY_SOURCE` environment variable. The script copies CCDV-F - Base de conocimiento, MSO Foundations, and the vault root notes, converts wikilinks to relative links, strips the leading H1, injects a title when missing, converts Obsidian callouts, and copies the exam guide PDF to `public/study/ccdv-f/`.

The `src/content/study` directory is excluded from Biome formatting because it mirrors an external source. The study routes are `/study/`, `/study/<cert>/`, and `/study/<cert>/<slug>/`.

### Search indexing policy

Study-note search indexes readable Markdown body text while omitting answer sections with an explicit `Answer key` heading or a combined heading such as `Answers and rationales`, including nested subsections. Generic technical headings named `Answers`, `Rationales`, or `Solutions` remain searchable. It also omits a marked answer or rationale paragraph directly after a Markdown block containing at least two labeled A–D options, plus continuation paragraphs through the next Markdown heading, recognizable question-prompt marker, or multiple-choice options block. Question prompts, `Check your understanding` tasks, ordinary technical explanations, and content outside those structural boundaries remain searchable.

The current CCDV-F inventory includes original practice questions with `- A.` through `- D.` options followed by a `Best answer:` rationale, plus the imported `ccdv-f-developer-study-guide-100-questions.md`, whose nested answer section is headed `Answer key, rationales and primary references` and contains domain-level bullet keys. These formats are excluded structurally without removing question prompts or content in later headings. After a marked rationale, unheaded paragraphs are treated as part of that rationale until the documented boundary; put instructional material intended for search under a new heading or after another options block.

This is a learning-experience control, not an anti-cheating or security boundary: study notes remain publicly accessible on their pages. Only the documented heading and multiple-choice formats are recognized, so differently formatted answer material may still appear in search results.

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

| Command           | Action                                   |
| ----------------- | ---------------------------------------- |
| `pnpm install`    | Install dependencies                     |
| `pnpm dev`        | Start dev server at `localhost:4321`     |
| `pnpm build`      | Generate production build in `./dist/`   |
| `pnpm preview`    | Preview the build locally                |
| `pnpm sync:study` | Sync study notes from the Obsidian vault |

## Requirements

- Node.js >= 22.23.4
- pnpm

## License

MIT
