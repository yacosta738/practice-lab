# Issue #62 / review follow-up PR #66 verification

Date: 2026-11-25

## Scope and provenance

- Issue: [#62 — accessible question navigator and study-answer exclusion](https://github.com/yacosta738/practice-lab/issues/62).
- Review follow-up to [PR #63](https://github.com/yacosta738/practice-lab/pull/63), which is merged into `main` as `5e65b49`; published in successor [PR #66](https://github.com/yacosta738/practice-lab/pull/66) from `fix/issue-62-review-followup` at `cfb8ca3`. The separate `/Users/acosta/Dev/certificate` checkout was not modified.
- Pinned visual baseline: [Vercel deployment](https://project-lab-git-fix-issue-62-accessible-se-7e7127-yuniel-acosta.vercel.app), revision `aa32145650899d33992e94f4d368c4eb62f69ad6`. This is the pre-follow-up PR deployment and is protected by Vercel authentication.
- The [CI workflow](https://github.com/yacosta738/practice-lab/actions/workflows/ci.yml) pins that baseline URL/revision, seeds the exam order, and uploads `tmp/issue-62-visual-evidence/` after a successful accessibility job. [Run 45644970654](https://github.com/yacosta738/practice-lab/actions/runs/45644970654) passed all required checks and published artifact `issue-62-visual-evidence-45644970654-b79db394453fc23fb4cc0b6ffde72a3dcce9a427`, retained through 2026-12-02. Baseline capture requires `VERCEL_AUTOMATION_BYPASS_SECRET`; without it, that capture is explicitly skipped so protected deployment access does not time out the full suite.
- Screenshot files remain under the Git-ignored `tmp/issue-62-visual-evidence/`; no PNGs are committed.

## Implementation and source policy

- Quiz rerenders restore focus to the selected answer or flag control after state changes and move it to the new question heading after navigation. Practice feedback receives focus after answer checking. Keyboard `Enter` continues to work with focus on an answer option.
- Flagged status uses an inset error-color mark; keyboard focus uses a separate outer ring. Playwright checks the focused/unfocused flagged appearance in light and dark themes.
- Search omits explicit answer-key/combined answer-rationale sections and structurally marked assessment rationales, including continuation paragraphs until a heading, recognized question prompt, or new options block. Generic technical headings `Solutions`, `Answers`, and `Rationales` remain indexed. Fenced-code closing markers accept only trailing spaces or tabs; see the policy in `README.md`.

## Automated verification

- `pnpm check`: passed; Biome checked 112 files and Astro reported 0 errors, 0 warnings, and 19 non-blocking hints.
- `pnpm test`: 334 tests passed across 18 files.
- `pnpm test:a11y`: 82 Playwright tests passed; the pinned-deployment screenshot test was skipped because the Vercel baseline requires an unavailable bypass credential. The suite built and previewed the Astro site.
- `pnpm check:study-links`: all 125 generated study pages under `/practice-lab/` passed.
- Targeted focus/navigation tests: 9 passed, including focus after answer selection, flag toggling, question navigation, feedback, and both-theme focus distinction.
- `VERCEL_SMOKE_BASE_URL=<pinned-preview> pnpm test:vercel-smoke`: attempted against the original PR #63 deployment, 0/5 passed. The protected preview returned the Vercel sign-in page instead of application content; this was not a smoke test of PR #66's implementation preview.
- The same 5 smoke tests were attempted against [PR #66's Vercel preview](https://project-lab-git-fix-issue-62-review-followup-yuniel-acosta.vercel.app), 0/5 passed because it returned “Log in to Vercel”. The deployment's application routes could not be verified without access.
- The successful local visual-evidence run captured after-state screens in light/dark themes at 1440×900, 768×1024, and 390×844. The before-state could not be captured locally due to preview protection; CI can access it when `VERCEL_AUTOMATION_BYPASS_SECRET` is configured.

## Manual accessibility checks and remaining limitations

- **Keyboard focus:** Automated Playwright checks pass for answer selection, flag toggling, previous/next navigation, and jumping between questions. No separate physical-keyboard session was performed.
- **Focus and navigator states:** Automated checks confirm the flagged focus indicator differs from its unfocused state in both themes; the question buttons meet the existing 44×44 CSS-pixel target assertion.
- **Axe:** The full Playwright suite reported no tested WCAG A/AA violations. Automated checks do not establish full WCAG conformance.
- **200% zoom/reflow:** **Not manually verified.** Responsive viewport screenshots are not a substitute for browser zoom at 200%.
- **Screen reader:** **Not manually verified.** No VoiceOver/NVDA/TalkBack session was performed; accessible names and ARIA states are automated evidence only.

## Remaining verification

- Configure Vercel preview access, then rerun the smoke suite against PR #66's preview.
- Configure the Vercel bypass secret to capture the pinned before-state in CI; until then, only after-state screenshots are available in the artifact.
- Complete and record manual 200% zoom/reflow and screen-reader verification (for example, VoiceOver on macOS).
