---
title: "PKM Conventions"
type: convention
certification: CCDV-F
status: verified
source_kind: methodology
updated: '2026-11-15'
tags:
- certification/ccdv-f
- pkm/metadata
---
## Naming, metadata and linking

- Each note is an atomic concept, domain MOC, lab, source record or navigation page. No double-copy of legacy source notes.
- YAML frontmatter: `type`, `certification`, `domain`, `status`, `source_kind`, `updated`, and hierarchical `tags`.
- **Stable unique basenames** enable standard Obsidian wikilink resolution across folders within one vault.
- Domain tags: `domain/agents-workflows`, `domain/applications-integration`, `domain/claude-code`, `domain/eval-testing-debugging`, `domain/model-selection-optimization`, `domain/prompt-context-engineering`, `domain/security-safety`, `domain/tools-mcp`.
- Prefer sources on the note, and always distinguish official facts from synthesized architecture guidance.

## Evidence statuses

| `status` | Meaning |
|---|---|
| `verified` | Source or objective directly grounded in official PDF/documentation |
| `study-synthesis` | Original explanatory content; aligned to official objectives, not a course transcript |
| `partial` | Course material available only for explicitly documented first screens |
| `to-do` | Proposed exercise awaiting learner verification |
| `open` | Known source gap, or a verification task |

## Editing workflow

1. Check [Source Register](../source-register/) before recording changing API mechanics.
2. Put one actionable idea in one note, with implementation decision and common failure mode.
3. Link both a domain MOC and adjacent concepts; do not introduce an unverified link.
4. For an observed issue, add a replayable regression case and link the result to [Evaluation Criteria and Grader Design](../evaluation-criteria-and-grader-design/).
5. When a Skilljar checkpoint unlocks, update [Course Access Coverage](../course-access-coverage/) and [Knowledge Gap Backlog](../knowledge-gap-backlog/) before claiming full coverage.

## Usage caveat

Google Drive does not implement Obsidian wikilink navigation in its viewer; download/sync the folder into the **same vault as the existing certification parent folder**. See [Existing Materials and Import Guide](../existing-materials-and-import-guide/).
