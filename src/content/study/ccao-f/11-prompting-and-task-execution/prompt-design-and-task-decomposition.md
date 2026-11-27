---
title: "Prompt Design and Task Decomposition"
aliases: []
type: atomic-note
certification: CCAO-F
domain: D1
domain_name: Prompting and Task Execution
status: study-synthesis
source_kind: official-blueprint-and-documentation
updated: '2026-11-26'
tags:
- certification/ccao-f
- domain/prompting-task-execution
- type/concept
---

> Treat a prompt as a short task brief: state the outcome, context, constraints, and form of the
> response, then check whether the result meets the goal.

**Blueprint area:** D1 - Prompting and Task Execution (official domain weight 14%).

## Build a usable task brief

A clear prompt gives Claude the information needed to do the requested work without asking it to
guess at important details. Include the parts that matter for the task:

- **Goal:** what the person needs to accomplish.
- **Context:** who will use the result and what background matters.
- **Inputs:** which notes, files, or facts Claude should use.
- **Constraints:** boundaries such as scope, tone, exclusions, or how to handle missing information.
- **Output:** the requested structure, level of detail, and audience.
- **Success check:** how the person will decide whether the result is useful.

Not every task needs every item. Use more detail when the cost of a wrong assumption is high.

## Decompose and iterate

Break work into steps when a request has distinct decisions or outputs. Give each step a clear
result
to review before continuing. For example, an analysis can first list evidence, then compare options,
then draft a recommendation. Decomposition makes omissions easier to spot; it does not make the
intermediate result correct by itself.

When a response misses the goal, name the gap and change the instruction most likely to cause it.
Keep the useful parts of the prompt. If the task or audience changes, update the brief rather than
adding repeated reminders that point in different directions.

## Scenario

A project coordinator has meeting notes and needs a follow-up list. The prompt asks Claude to
extract
decisions, action owners, and dates; keep each category separate; mark any missing owner or date as
unknown; and return a concise table for the team. The coordinator checks the table against the notes
before sending it. If Claude merges a suggestion with an agreed decision, the next prompt clarifies
that only explicit decisions belong in the decisions section.

## Decision guidance

- If a task is straightforward, ask for the result directly with enough context and a clear output
  format.
- If the task contains multiple judgments, divide it into reviewable steps.
- If the task depends on supplied material, name that material and say how to handle unsupported
  claims.
- If the result is weak, identify whether the problem is missing context, unclear instructions, or
  an unsuitable output format before rewriting the whole prompt.
- For research, analysis, drafting, and brainstorming, state the kind of work and the evidence or
  exploration expected from that task.

## Misconceptions

- A longer prompt is not automatically a clearer prompt. Irrelevant context can distract from the
  requested task.
- Repeating an instruction does not resolve a conflict between two instructions.
- Decomposing a task helps with review, but each step still needs an appropriate check.
- A polished response is not proof that the prompt gave enough evidence or constraints.

## Self-check

- Can you state the goal, essential context, constraints, and expected output in your own words?
- If the first response fails, can you name one specific prompt change and explain why it addresses
  the gap?

## References

- [CCAO-F Version 1.1 exam guide](https://cc.sj-cdn.net/instructor/6nizmqk8tpzpfjvt6qmmav7rh/public/1794946524/Claude_Certified_Associate_-_Foundations_Exam_Guide.pdf)
- [Claude prompting best practices](https://docs.anthropic.com/en/docs/build-with-claude/prompt-engineering/claude-4-best-practices)

## Evidence and currency

This is original study synthesis, not an exam question or answer key. See the [CCAO-F source
register](../source-register/) for retrieval dates, review limits, and current
feature caveats. Model-specific prompting examples can change; use the current documentation for
the product and model in use.