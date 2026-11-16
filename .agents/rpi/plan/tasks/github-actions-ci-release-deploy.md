# Plan RPI: CI, Release Please y despliegue a GitHub Pages

## Ruta

Direct inline. No se solicitan artefactos SDD.

## Objetivo

Dejar el repo `yacosta738/practice-lab` con una cadena de entrega completa: checks de Astro y TypeScript, lint, build, accesibilidad real, versionado automático con Release Please y despliegue a GitHub Pages disparado por release.

## Contexto verificado

- Repo: `yacosta738/practice-lab` (público, rama `main`). Carpeta local `certificate`.
- Stack: Astro 7.4.12, pnpm 12 (lockfile v9), Node >=22.23.4.
- Antes de este plan el repo no tenía `.github/`, ni `@astrojs/check`, ni `typescript`, ni Biome, ni runner de tests.
- GitHub Pages ya habilitado por API con `build_type=workflow` (`html_url: https://yacosta738.github.io/practice-lab/`).

## Decisiones del usuario

1. URL: project page `https://yacosta738.github.io/practice-lab` → `base: '/practice-lab'`.
2. Deploy: solo cuando existe release. Nunca en cada push a `main`.
3. Accesibilidad: Playwright + `@axe-core/playwright` sobre el build real.

## Tareas

1. `astro.config.mjs`: fijar `site`, `base` y `output: 'static'`.
2. Corregir los enlaces internos absolutos (`/`, `/certifications/ccdv-f`, `/favicon.svg`) para que respeten `base`.
3. Tooling: añadir `@astrojs/check`, `typescript@^6` (TS 7 no lo soporta `astro check`), `@biomejs/biome`, `@playwright/test`, `@axe-core/playwright`, `vitest`; añadir scripts `check`, `lint`, `format`, `test`, `test:a11y`.
4. `biome.json` en la línea de la casa (`dallay/astro-icon`).
5. Tests unitarios de caracterización para `src/lib/quiz-engine.ts` (lógica pura, hoy sin cobertura).
6. Test de accesibilidad con axe sobre el build, en `/` y `/certifications/ccdv-f`.
7. Dejar `astro check` en verde corrigiendo los errores de tipo preexistentes, sin cambiar el comportamiento del quiz en vivo.
8. `.github/workflows/ci.yml`: lint, typecheck, unit tests, build, a11y.
9. `.github/workflows/release-please.yml`: Release Please con manifest y `release-type: node`.
10. `.github/workflows/deploy.yml`: build + `deploy-pages` a GitHub Pages, disparado por release publicado.
11. `.github/workflows/semantic-pull-request.yml`: validación de títulos Conventional Commits.
12. `.github/dependabot.yml`: actualizaciones de `github-actions` y `npm`.

## Límites

- No modificar la lógica de sesión, respuestas, progreso, persistencia ni el toggle de tema del quiz en vivo.
- No borrar código muerto en esta iteración: `quiz-engine.ts`, `QuizApp.astro` y `Welcome.astro` se reportan como hallazgo, no se elimina ninguno.
- Ajustes permitidos sobre ese código muerto, siempre sin cambiar comportamiento observable:
  - `quiz-engine.ts`: formato de Biome y narrowing de tipos (`Map` + type guard) en lugar de la aserción `!`, que lanzaría si un id no existiera. Misma salida, sin excepción.
  - `QuizApp.astro`: `declare global` para `window.__quizData` y `define:vars` para inyectar ladata sin interpolación manual.
  - `Welcome.astro`: no se tocó.
- `src/pages/certifications/[slug].astro` conserva su lógica inline duplicada: no se unifica con `quiz-engine.ts` en esta iteración.
- No publicar en npm: el paquete es un sitio estático.
- No agregar atribución de IA a commits.

## Evidencia

Verificado con el estado actual del árbol de trabajo (2026-11-16):

- `pnpm install --frozen-lockfile` → lockfile vigente, sin cambios.
- `pnpm run lint` (Biome) → `Checked 39 files. No fixes applied.` Sin errores.
- `pnpm run check` (astro check) → 0 errores, 0 warnings, 1 hint (`certQuestions` sin uso en `[slug].astro`).
- `pnpm run test` (Vitest) → 27 tests en verde.
- `pnpm run build` → 2 páginas generadas en `dist/`.
- `pnpm run test:a11y` (Playwright + axe) → 3 tests en verde sobre `/practice-lab/` y `/practice-lab/certifications/ccdv-f`.
- `actionlint` sobre `.github/workflows/` → sin hallazgos.
- `git diff --check` → sin errores de whitespace.
- `dist/index.html` contiene solo URLs con el prefijo `/practice-lab/` (`/practice-lab/_astro/quiz.*.css`, `/practice-lab/favicon.svg`, `/practice-lab/certifications/ccdv-f`).

Notas de diseño verificadas:

- La estrategia `node` de Release Please actualiza `package.json` y `CHANGELOG.md`, pero no `pnpm-lock.yaml`. El lockfile v9 no guarda la versión del paquete raíz en `importers`, así que un bump de versión no invalida `pnpm install --frozen-lockfile`.
- El deploy se encadena como job `uses: ./.github/workflows/deploy.yml` dentro de `release-please.yml`, condicionado a `release_created == 'true'`. Así el trigger es determinista y no depende de un release creado por `GITHUB_TOKEN`.
- `release-please.yml` conserva `contents: write` para crear el release y el PR de release; el job `deploy` pide `pages: write` e `id-token: write` solo para el deploy.

## Hallazgos reportados (no corregidos)

- `src/lib/quiz-engine.ts`, `src/components/QuizApp.astro` y `src/components/Welcome.astro` no los importa ningún archivo; la página activa `src/pages/certifications/[slug].astro` tiene la lógica del quiz duplicada en línea. Candidato a consolidación futura.
- Hint de `astro check`: `certQuestions` declarado y sin leer en `[slug].astro`.

## Estado

Ready — implementación y verificaciones completas. Sin commit ni push: los cambios quedan en el árbol de trabajo para revisión.

