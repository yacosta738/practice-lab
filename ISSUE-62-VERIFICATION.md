# Issue #62 verification

Date: 2026-11-25

## Base and scope

- Issue: [#62 — accessible question navigator, search answer exclusion, and visual verification](https://github.com/yacosta738/practice-lab/issues/62).
- The implementation worktree is on `main` at `4241ba0`; `origin/main` was fetched and `git pull --ff-only origin main` reported `Already up to date`.
- The separate `/Users/acosta/Dev/certificate` checkout remains on `fix/quality-reliability` with pre-existing local changes; it was not modified.
- No implementation PR or deployment was created. `tests/e2e/issue-62-visual-evidence.spec.ts` preserves the screenshots under `tmp/issue-62-visual-evidence/` (ignored by Git); test-run attachments are also produced but cleaned up by Playwright.

## Markdown format inventory

- Original CCDV-F exercises use a question heading or scenario, a blank-separated list of `- A.` through `- D.` options, and a following `Best answer:` paragraph with the rationale. This format appears in the exam decision guide and the agent, application-integration, and model-selection workshops.
- The imported `src/content/study/ccdv-f/references/ccdv-f-developer-study-guide-100-questions.md` has 100 question headings with `- **A.**`–`- **D.**` options, followed by `## Answer key, rationales and primary references`, nested domain headings, and bullet answer/rationale entries such as `**D1.01 — B.**`.
- Search filtering removes recognized answer-key heading subtrees and a marked answer/rationale paragraph directly following a block with at least two labeled A–D options. It retains prompts, ordinary technical explanations, and subsequent sibling sections. See the policy and limitations in `README.md`.

## Automated verification

- `pnpm check`: passed; Biome checked 112 files and Astro reported 0 errors, 0 warnings, and 19 non-blocking hints in existing project files.
- `pnpm test`: 330 tests passed across 18 files.
- `pnpm test:a11y`: 81 Playwright tests passed, including WCAG A/AA checks on the active mock exam with the navigator expanded; the suite built and previewed the Astro site.
- `pnpm check:study-links`: 125 generated study pages checked under `/practice-lab/`; all internal links resolve.
- `VERCEL_SMOKE_BASE_URL=https://certificate-nine-phi.vercel.app pnpm test:vercel-smoke`: 5/5 smoke tests passed against the [currently available Vercel deployment](https://certificate-nine-phi.vercel.app). This is not a deployment of the uncommitted implementation; a post-PR/deployment smoke run and GitHub Actions link remain outstanding.
- Playwright exercises the `/practice-lab/` base path. The 52 PNGs in `tmp/issue-62-visual-evidence/` show home, study note, practice setup/session, mock-exam Focus Mode/navigator, results, and search dialog in light/dark themes at 1440×900, 768×1024, and 390×844, plus before/after mobile navigator screenshots and answered+flagged+current states.
- Examples: `before-light-mobile-question-navigator.png`, `after-light-mobile-question-navigator-with-states.png`, and `after-dark-mobile-question-navigator-with-states.png` in that evidence directory. Git ignores `tmp/`; attach these PNGs to the PR when one is opened.

## Manual accessibility checks and limitations

- **Keyboard-only navigator:** Automated pass: Tab reaches question buttons and Enter jumps to the selected question. Playwright Chromium keyboard events were used; no separate physical-keyboard session was performed.
- **Visible focus:** Automated pass: the focused question matches `:focus-visible` and has a visible outline in Playwright Chromium at 390×844.
- **Target size:** Automated pass: the tested question button is at least 44×44 CSS pixels at 390×844.
- **Timer/session persistence and scoring flow:** Existing Playwright coverage passed with the full suite; no separate manual session was performed.
- **Light/dark and responsive layout:** Screenshots were captured for all six viewport/theme combinations. Chromium emulated the color schemes and viewport sizes; the images are evidence, not a human review of every screen.
- **200% browser zoom / reflow:** **Not manually verified.** The 390×844 mobile viewport is not a substitute for testing browser zoom at 200%; verify in a real browser before claiming this check.
- **Screen-reader announcements:** **Not manually verified.** No screen-reader session was available. Accessible names, `aria-current`, `aria-pressed`, and Axe checks are automated evidence only; they do not establish full WCAG conformance.

## Follow-up before implementation release

- Attach the generated screenshot artifacts to the implementation PR when one is opened.
- Run the Vercel smoke suite against the deployed PR/implementation and link that run; the passing smoke result above is for the currently deployed baseline only.
- Perform and record a real 200% zoom/reflow check and a screen-reader session (for example, VoiceOver on macOS) before closing those manual verification items.
