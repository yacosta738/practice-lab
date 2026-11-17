---
title: "System Prompts XML and Few Shot"
aliases: []
type: atomic-note
certification: CCDV-F
domain: D6
domain_name: Prompt and Context Engineering
status: study-synthesis
source_kind: official-blueprint-and-documentation
updated: '2026-11-15'
tags:
- certification/ccdv-f
- domain/prompt-context-engineering
- type/concept
---
> Explicit task descriptions, content delimiters, representative examples and output contracts improve controllability without making untrusted input authoritative.

**Blueprint area:** [D6 - Prompt and Context Engineering MOC](../d6-prompt-and-context-engineering-moc/) (official domain weight 11.0%).

## Engineering principles

- Put durable behavior rules in the appropriate system/developer context supported by the API; keep user request and retrieved data separate.
- XML-style tags can delimit `<policy>`, `<user_input>` and `<examples>`; tags clarify structure but do not independently enforce security.
- Use zero-shot for clear tasks; add one or more examples when edge cases or formatting are repeatedly misread.
- Optimize prompts empirically against a curated eval set and version every production change.

## Failure modes

- Adding verbose style adjectives does not replace missing task data.
- Too many examples consume context and can overfit the few visible cases.

## Check your understanding

- ☐ Can the consumer verify its output contract without reading prose?
- ☐ Do examples include missing/ambiguous fields and representative failures?

## Related knowledge

[Structured Output and Defensive Parsing](../structured-output-and-defensive-parsing/) · [Evaluation Criteria and Grader Design](../evaluation-criteria-and-grader-design/) · [Exam Blueprint and Coverage](../exam-blueprint-and-coverage/)

## Evidence and verification

- **Provenance:** author-written engineering synthesis aligned to exam guide objectives; this is **not** a transcript or hidden Skilljar lesson.
- **Primary references:**
  - [guide](https://drive.google.com/file/d/1aWhE373XnbPEcYbzXV6VjRfjHpUQdM9s/view)
  - [evals](https://platform.claude.com/docs/en/test-and-evaluate/develop-tests)
- **Check currency:** model options, pricing, API flags, release-specific behavior and runtime permissions can change after the source was read. See [Source Register](../source-register/).
