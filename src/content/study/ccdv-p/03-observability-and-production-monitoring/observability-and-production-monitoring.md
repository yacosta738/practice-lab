---
title: "Observability and Production Monitoring"
aliases: []
type: atomic-note
certification: CCDV-P
domain: D3
domain_name: Observability and Production Monitoring
status: study-synthesis
source_kind: official-blueprint-and-documentation
updated: '2026-11-26'
tags:
- certification/ccdv-p
- domain/observability-production-monitoring
- type/concept
---

> Observe the complete user outcome, not only the model request. Correlate traces, bounded metrics,
> and privacy-aware events so operators can find failures without collecting unnecessary user content.

**Blueprint area:** D3 — Observability and Production Monitoring (official domain weight **12%**).

## Instrument the path from request to outcome

Create a trace for the user operation and child spans for queue wait, model request, retrieval,
reranking, each tool call, policy decision, and final delivery. Propagate trace context across
service boundaries and record stable correlation IDs. Capture useful dimensions such as model and
prompt version, tool name, index version, outcome class, and deployment cohort. Do not use prompt
text, user IDs, or arbitrary request IDs as metric labels.

Use metrics for aggregate health and capacity:

- **Latency:** queue time, model time, tool time, total time, and p50/p95/p99 distributions. Tail
  latency matters when a request fans out to multiple tools.
- **Traffic and saturation:** request volume, in-flight work, queue depth, rate-limit responses, and
  dependency capacity.
- **Reliability:** timeouts, retries, cancellations, failures by stage, incomplete streams, and
  fallback use.
- **Usage and cost:** input and output tokens, cache reads and writes where available,
  tool/retrieval volume, and estimated cost per completed task. Keep price calculations versioned
  and separate from raw usage.
- **Quality:** task completion, retrieval recall samples, citation support, user corrections,
  refusal outcomes, and safety incidents.

Pair these with black-box checks of user-visible behavior and white-box telemetry for diagnosis.
Alerts should identify actionable user impact or imminent capacity risk, not every internal
fluctuation.

## Keep telemetry safe and useful

Define what data may enter traces, logs, and evaluation stores. Prefer allowlisted event fields,
redact secrets and personal data at ingestion, restrict access, set retention limits, and document
sampling. If operators need a content sample to diagnose a specific incident, use a controlled
workflow with authorization and audit rather than logging all prompts by default.

Bound metric dimensions. High-cardinality labels increase cost and can overflow metric aggregation;
keep per-run identifiers in traces or protected logs and use low-cardinality categories in metrics.
Verify that sampling does not systematically hide long-tail failures or a particular tenant cohort.

## Detect quality drift

Track quality by task type, language, tenant class, and deployment cohort where privacy and sample
size permit. A change in model, prompt, tool schema, retrieval index, or user mix can shift quality
even when availability and latency remain stable. Compare production signals with a stable
evaluation set, inspect disagreement samples, and stage a rollback when a release crosses an agreed
quality or safety threshold.

These are engineering recommendations, not guarantees supplied by Anthropic, OpenTelemetry, or any
telemetry backend. Select thresholds from the service's risk and user-impact objectives.

## Failure modes

- Recording full prompts and tool results by default exposes sensitive content and makes retention
  hard to control.
- Using unique request IDs as metric labels drives cardinality while still failing to provide a
  useful trace.
- Reporting average latency hides the slow tail and fan-out amplification.
- Treating token usage as quality, or request success as task success, misses user-visible failures.
- Alerting on noisy internal signals without a clear action trains responders to ignore alerts.

## Check your understanding

- ☐ Can one trace identify whether delay came from queueing, retrieval, model generation, or a tool?
- ☐ Which identifiers belong in traces, and which aggregate dimensions are safe for metrics?
- ☐ What signal would reveal quality drift if API availability and p95 latency stayed unchanged?

## Related knowledge

[Debugging and Incident Response](../debugging-and-incident-response/) · [Evaluation Engineering](../evaluation-engineering/) · [Cost and Latency Optimization](../cost-and-latency-optimization/)

## Evidence and verification

- **Provenance:** Original production-monitoring synthesis. The official domain title and weight are
  confirmed by public search excerpts; detailed objectives remain partially verified.
- **Primary
  references:** [OpenTelemetry traces](https://opentelemetry.io/docs/concepts/signals/traces/); [OpenTelemetry metrics](https://opentelemetry.io/docs/concepts/signals/metrics/); [Google SRE monitoring distributed systems](https://sre.google/sre-book/monitoring-distributed-systems/); [Claude SDK overview](https://platform.claude.com/docs/en/cli-sdks-libraries/overview).
- **Check currency:** Instrumentation APIs, data handling controls, and provider usage fields can
  change. See the [Source Register](../source-register/).