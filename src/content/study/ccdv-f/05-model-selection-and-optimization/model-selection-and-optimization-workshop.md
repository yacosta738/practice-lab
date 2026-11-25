---
title: "Model Selection and Optimization Workshop"
type: study-guide
certification: CCDV-F
domain: D5
status: study-synthesis
source_kind: original-study-synthesis
updated: '2026-11-24'
tags:
- certification/ccdv-f
- domain/model-selection-optimization
- type/workshop
---
This original workshop applies D5 concepts to a model-selection decision. There is no permanently best model or sampling setting: choose a configuration against measured task requirements, and re-check changing model capabilities, context limits, and prices in official documentation.

## Scenario and success criteria

A product classifies incoming support requests, answers common policy questions, and escalates unusual cases. The team is considering multiple model and prompt configurations. Some mistakes are harmless; an incorrect answer about eligibility can cause financial or compliance impact.

Before comparing candidates, agree on:

- **Quality:** task-specific correctness, evidence use, structured-output validity, and a separate measure for high-impact errors.
- **Coverage:** representative common cases plus rare, ambiguous, long-context, and adversarial cases; keep a held-out set for the final comparison.
- **Latency:** a response-time target and percentile, not only an average.
- **Cost:** total spend per request and per successful task, including retries, additional model calls, and escalations.
- **Operational behavior:** availability, refusal/handoff behavior, and whether the model follows the required tool contract.

These are joint constraints. Do not trade away a hard safety or quality threshold merely to reduce latency or token use.

## A repeatable selection loop

1. **Establish a baseline.** Run the current configuration on a fixed, representative evaluation set and record quality, error severity, latency, and cost.
2. **Change one factor at a time.** Compare model capability, prompt/evidence quality, output limits, and supported reasoning settings separately where practical. Pin the configuration for each run.
3. **Inspect failures before scaling up.** Missing evidence suggests a retrieval or context problem; invalid output suggests contract and validation work; difficult reasoning may justify comparing model or reasoning configurations. A parameter change is a hypothesis, not a correctness fix.
4. **Compare the full distribution.** Review aggregate metrics and important slices. A strong average can hide a failure mode concentrated in a sensitive class of inputs.
5. **Route only when it earns its complexity.** A router can reserve a higher-capability configuration for harder requests, but its own errors, latency, and cost count too. Measure false-easy routing and provide a safe escalation path.
6. **Re-evaluate after changes.** Model updates, prompt edits, tool-schema changes, and context changes can alter quality or behavior even when the application code appears unchanged.

| Observation | Investigate first | Avoid assuming |
|---|---|---|
| Quality misses cluster around absent or stale evidence | Retrieval quality, source freshness, and context construction | A larger model will recover evidence it never received |
| Structured results fail validation | Schema, parsing, business invariants, and recovery path | A more confident prompt guarantees valid output |
| A lower-cost candidate increases escalations or retries | Cost per successful task and error severity | Lowest price per token means lowest system cost |
| A router sends difficult cases down the easy path | Routing boundary, false-negative rate, and fallback | A correct average routing accuracy is safe for every class |
| Latency is high despite good quality | Time by stage, input size, streaming need, and request pattern | Changing temperature alone will meet the latency target |

## Cost and context accounting

Use a workload-level measure:

`cost per successful task = total measured API spend for the cohort / tasks that meet the acceptance criteria`

Include input and output tokens, reasoning where billable, cache writes and reads, retries, extra agent/tool turns, and failed attempts. Also track the success rate so a low spend caused by early failures is not mistaken for an improvement.

For a stable prefix reused across requests, a simplified cache comparison is:

`uncached prefix cost = N × P × R`

`cached prefix cost = P × W + (N - 1) × P × H`

Here `N` is the number of requests that actually reuse the prefix before expiry, `P` is its token count, `R` is the current base input price per token, `W` is the applicable cache-write price per token, and `H` is the cache-read price per token. This illustration excludes variable input, output, expiry gaps, and cache eligibility; use current model-specific pricing and observed cache hit/write usage for a real estimate. Cache hits reduce cost for eligible repeated input; cached tokens still occupy context.

Likewise, count the full request against context planning: instructions, messages, tool definitions, tool results, attachments, and generated output all matter. Leave room for the response and any supported reasoning/tool turns rather than filling the window with input.

See [Tokens Context Window and Sampling](../tokens-context-window-and-sampling/), [Model Routing and Thinking Effort](../model-routing-and-thinking-effort/), [Cost and Token Accounting](../cost-and-token-accounting/), and [Prompt Caching Economics](../prompt-caching-economics/).

## Original practice question

A new, less expensive configuration lowers average API spend, but the percentage of requests requiring retries and human escalation rises. What should the team compare before adopting it?

- A. Use token price and average request size only, excluding retries and handoffs.
- B. Compare average accuracy and median latency, without risk-specific checks.
- C. Compare cost per successful task, quality slices, latency, and recovery rates.
- D. Compare input cost and cache hits, ignoring failed or escalated tasks.

**Best answer: C.** The system is valuable when it completes acceptable work, not merely when an individual request is cheap. Compare quality, cost, latency, and recovery on the same test set. A ignores retry and escalation costs; B relies on aggregate accuracy and median latency that can hide high-impact errors; D excludes failed tasks and escalations, understating their impact.

## Review checklist

- Can you describe a held-out evaluation set and the metrics that would block a release?
- Can you explain when routing or prompt caching might help, and what extra measurements they require?
- Can you compute cost per successful task without confusing it with raw token price or a practice-test score?

## Sources and related material

- [CCDV-F Exam Blueprint and Coverage](../exam-blueprint-and-coverage/) — objective names and weights.
- [Define success criteria and build evaluations](https://platform.claude.com/docs/en/test-and-evaluate/develop-tests), [Token Counting](https://platform.claude.com/docs/en/build-with-claude/token-counting), [Context Windows](https://platform.claude.com/docs/en/build-with-claude/context-windows), and [Prompt Caching](https://platform.claude.com/docs/en/build-with-claude/prompt-caching) — check current measurement and pricing details.
- [D5 - Model Selection and Optimization MOC](../d5-model-selection-and-optimization-moc/) · [D4 - Evals, Testing, and Debugging MOC](../d4-eval-testing-and-debugging-moc/) · [Source Register](../source-register/).