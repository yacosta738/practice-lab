---
title: "Exam Decision Guide"
type: study-guide
certification: CCDV-F
status: study-synthesis
source_kind: original-study-synthesis
updated: '2026-11-24'
tags:
- certification/ccdv-f
- type/exam-strategy
- method/decision-making
---

This is an original study aid for reasoning through developer scenarios. It summarizes decision
patterns already covered by the [official objective map](../exam-blueprint-and-coverage/) and linked
notes; it is not an official Anthropic answer key or a transcript of any external course.

## A repeatable elimination method

1. Read the final sentence first: identify whether the question asks for the *best*, *first*,
   *safest*, or *lowest-latency* choice, and note how many answers it requests.
2. Extract the constraints that change the design: predictable versus open-ended work, latency,
   scale, data sensitivity, reversibility, and operational ownership.
3. Remove options that violate a hard constraint. A prompt cannot replace an authorization check, a
   test cannot be skipped for an irreversible production change, and a batch interface cannot
   satisfy an immediate-response requirement.
4. Among the remaining options, choose the simplest approach that meets the stated requirements. Do
   not add agents, services, or model capability without a reason in the scenario.
5. For every practice question, explain both why the chosen answer works and why each distractor
   fails. If two choices still seem plausible, compare them against the exact requirement rather
   than guessing an unstated vendor preference.
6. Follow the item instructions exactly. The official guide can include different item formats; a
   learner's experience of seeing only single-select questions is useful anecdotal feedback, not a
   guarantee about another exam form.

## Match the design to the requirement

### Known, repeatable steps

- **Prefer:** a deterministic workflow with explicit transitions; call the model only where language
  understanding or generation adds value.
- **Avoid:** an autonomous agent for a fixed sequence when autonomy adds no useful decision-making.
- **Review:** [Workflows versus Agents](../workflows-versus-agents/)
  and [Agent Loop and Termination](../agent-loop-and-termination/).

### Uncertain work that needs decisions as it runs

- **Prefer:** a bounded agent loop when the next action depends on observations; define permitted
  tools, stop conditions, budgets, and logging.
- **Avoid:** an unbounded loop or a fixed chain that cannot respond to newly discovered information.
- **Review:** [Agent SDK and Deployment Choices](../agent-sdk-and-deployment-choices/)
  and [Orchestrator Worker and Parallelization](../orchestrator-worker-and-parallelization/).

### Strictly structured output

- **Prefer:** a supported schema or structured-output mode, followed by parsing and validation of
  both schema and business invariants.
- **Avoid:** assuming a prompt alone makes generated JSON valid or safe to use.
-
**Review:** [Structured Output and Defensive Parsing](../structured-output-and-defensive-parsing/).

### High-volume work versus an interactive response

- **Prefer:** a batch interface when work is asynchronous and the latency contract permits it; use
  streaming or a synchronous request when the user needs a live response.
- **Avoid:** choosing an API only because it is called “faster” or “cheaper” without matching its
  completion, retrieval, and failure semantics to the task.
- **Review:** [Batch Processing and High-Volume Work](../batch-processing-and-high-volume-work/)
  and [Streaming SSE and Recovery](../streaming-sse-and-recovery/).

### Irreversible or privileged actions

- **Prefer:** authorization and validation in trusted application code, least-privilege tool access,
  and an approval step when policy or impact requires it.
- **Avoid:** letting a model's textual confirmation serve as the security boundary for a payment,
  deletion, publication, or production write.
- **Review:** [Human Approval for Irreversible Actions](../human-approval-for-irreversible-actions/)
  and [Security Boundaries and Least Privilege](../security-boundaries-and-least-privilege/).

### Untrusted documents, tool results, or user instructions

- **Prefer:** explicit trust boundaries, narrow capabilities, and validation outside the model;
  treat retrieved text as data rather than privileged instructions.
- **Avoid:** relying on wording or delimiters alone to stop prompt injection.
-
**Review:** [Prompt Injection and Data Trust Boundaries](../prompt-injection-and-data-trust-boundaries/)
and [Defense in Depth for AI Tools](../defense-in-depth-for-ai-tools/).

### A quality regression or unexpected answer

- **Prefer:** reproduce the case, inspect traces and inputs, isolate the failing layer, and run
  representative evals and regression tests before release.
- **Avoid:** changing temperature or swapping models as a substitute for diagnosing the failure.
-
**Review:** [Tracing and Failure Isolation](../tracing-and-failure-isolation/), [Evaluation Criteria and Grader Design](../evaluation-criteria-and-grader-design/),
and [Regression Testing and Release Gates](../regression-testing-and-release-gates/).

### Model, cost, and latency tradeoffs

- **Prefer:** select against representative quality, latency, and cost measurements, then use the
  least costly option that meets the required quality and reliability.
- **Avoid:** assuming the strongest model is always best or that the cheapest model is adequate
  without evaluation.
- **Review:** [Model Routing and Thinking Effort](../model-routing-and-thinking-effort/)
  and [Cost and Token Accounting](../cost-and-token-accounting/).

### Reusable integrations

- **Prefer:** MCP when a standardized integration needs to be reused across compatible clients; a
  direct tool/API integration may be simpler for one application with no interoperability
  requirement.
- **Avoid:** adopting MCP as a default label or duplicating a protocol layer without a concrete
  reuse or interoperability need.
-
**Review:** [MCP Architecture: Tools, Resources, and Prompts](../mcp-architecture-tools-resources-and-prompts/)
and [Skills vs Tools vs MCP vs Subagents](../skills-vs-tools-vs-mcp-vs-subagents/).

### Repeated context or a saturated context window

- **Prefer:** measure repeated stable prefixes before using prompt caching; prune irrelevant tool
  output or compact history while retaining task-critical state.
- **Avoid:** accumulating the full conversation forever or summarizing away facts needed to continue
  safely.
- **Review:** [Prompt Caching Economics](../prompt-caching-economics/)
  and [Context Compaction and Tool Output Pruning](../context-compaction-and-tool-output-pruning/).

### A suggestion to change temperature

- **Prefer:** check whether the parameter applies to the selected model and task, then compare the
  change with a representative evaluation set.
- **Avoid:** treating lower temperature as a universal fix for correctness, reasoning, or prompt
  quality.
- **Review:** [Temperature](../temperature/) and the
  current [official API documentation](../source-register/).

## Worked example

**Scenario:** A report-generation task always validates a fixed schema, retrieves one record, and
renders a summary; no decision changes the sequence. Which starting design best matches the
requirement?

- A. Use a deterministic workflow with explicit, testable transitions.
- B. Start an agent loop that chooses every step, then add a turn limit.
- C. Run several agents in parallel and reconcile their separate reports.
- D. Let a model decide whether to skip validation based on its confidence.

**Best answer: A.** The steps and transitions are fixed, so a deterministic workflow is simpler to
test and operate. B adds autonomy without a useful decision; C parallelizes dependent steps; D makes
a required validation conditional on model confidence.

## Readiness check

- Can you state the requirement and the decisive constraint before picking an option?
- Can you explain why each alternative fails, not just recognize a memorized phrase?
- Can you apply the reasoning across all eight domains and verify changing API details against
  primary documentation?

Use the [Practice Lab quiz](../../../certifications/ccdv-f/)
and [timed exam lab](../lab-04-timed-exam-and-review-protocol/) to practice. Results are diagnostic
only: the official scaled passing score does not translate directly into a raw practice percentage
or guarantee an exam outcome.

## Related study material

[Learning Resources](../learning-resources/) · [Exam Blueprint and Coverage](../exam-blueprint-and-coverage/) · [25-competency index](../ccdv-f-indice-de-certificacion/) · [Source Register](../source-register/).