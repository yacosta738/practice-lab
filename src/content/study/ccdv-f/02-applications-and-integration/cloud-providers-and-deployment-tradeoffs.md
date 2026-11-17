---
title: "Cloud Providers and Deployment Tradeoffs"
aliases: []
type: atomic-note
certification: CCDV-F
domain: D2
domain_name: Applications and Integration
status: study-synthesis
source_kind: official-blueprint-and-documentation
updated: '2026-11-15'
tags:
- certification/ccdv-f
- domain/applications-integration
- type/concept
---
> Claude workloads may use a first-party API or supported cloud provider integrations, with differences in identity, region, APIs, billing and observability.

**Blueprint area:** [D2 - Applications and Integration MOC](../d2-applications-and-integration-moc/) (official domain weight 33.1%).

## Engineering principles

- Compare Anthropic first-party, Amazon Bedrock and Google Vertex AI using current platform documentation and contractual requirements.
- Identify where secrets live, which service principal performs a call, and the boundaries for logs, model data and retention.
- Test tool-use, streaming, model selection and support of each feature for the specific platform rather than assuming parity.
- Isolate platform-specific request mapping and error taxonomy in adapters; document migration and fallback behavior.

## Failure modes

- Different providers may not expose the same model revision or options on the same date.
- Do not assume a provider brand automatically satisfies a regulatory residency requirement.

## Check your understanding

- ☐ Create a decision record with compliance, cost, latency and operational risk.
- ☐ Exercise a failover in staging to verify real capability compatibility.

## Related knowledge

[Agent SDK and Deployment Choices](../agent-sdk-and-deployment-choices/) · [Application Design and Configuration Management](../application-design-and-configuration-management/) · [Exam Blueprint and Coverage](../exam-blueprint-and-coverage/)

## Evidence and verification

- **Provenance:** author-written engineering synthesis aligned to exam guide objectives; this is **not** a transcript or hidden Skilljar lesson.
- **Primary references:**
  - [guide](https://drive.google.com/file/d/1aWhE373XnbPEcYbzXV6VjRfjHpUQdM9s/view)
  - [skilljar](https://anthropic-partners.skilljar.com/path/claude-certified-developer-foundations)
- **Check currency:** model options, pricing, API flags, release-specific behavior and runtime permissions can change after the source was read. See [Source Register](../source-register/).
