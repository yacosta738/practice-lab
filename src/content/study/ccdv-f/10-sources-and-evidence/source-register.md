---
title: "Source Register"
type: moc
certification: CCDV-F
status: verified
source_kind: official-blueprint-and-documentation
updated: '2026-11-15'
tags:
- certification/ccdv-f
- type/source-register
- method/provenance
---
> **Source of truth:** The certification exam blueprint is the official PDF (v1.0, July 2026). API/Claude Code/MCP behavior should be validated against live documentation. The notes are original study synthesis.

## Certification and course sources

- **Official CCDV-F Exam Guide:** [PDF](https://drive.google.com/file/d/1aWhE373XnbPEcYbzXV6VjRfjHpUQdM9s/view) — 53 items, 120 minutes, 720 scaled cut score, eight domains and detailed objectives. Also available as the existing PDF in the parent folder; do not duplicate its bytes.
- **Foundations prep route:** [Anthropic Partner Academy](https://anthropic-partners.skilljar.com/path/claude-certified-developer-foundations) — five official modules, gated lesson bodies.
- **Claude Developer route:** [Developer catalogue](https://anthropic-partners.skilljar.com/path/claude-developer) — distinct nine-course learning path.
- **Authenticated-screen summary:** [CCDV-F - Apuntes de Skilljar](../ccdv-f-apuntes-de-skilljar/) ([Drive](https://drive.google.com/file/d/1XgK6dAdt4YOsjzmoIRHEg4xPWt4G5v9f/view)) — limited screen coverage with exact checkpoint blockers, not complete course transcription.
- **Public course summaries:** [Claude-Developer-Verified-Course-Notes-2026-11-13](../claude-developer-verified-course-notes-2026-11-13/), [Claude-Developer-Learning-Path-Certification-Crosswalk](../claude-developer-learning-path-certification-crosswalk/), [Claude Certified Developer - Foundations Prep Course](../claude-certified-developer-foundations-prep-course/).
- **Existing user notes:** [Claude Certified Developer](../claude-certified-developer/), [Asynchronous patterns for high-volume work](../asynchronous-patterns-for-high-volume-work/), [Synchronous, streaming, and real-time responses](../synchronous-streaming-and-real-time-responses/), [How a developer reaches Claude - SDK versus raw REST](../how-a-developer-reaches-claude-sdk-versus-raw-rest/), [Mode choice interacts with model choice](../mode-choice-interacts-with-model-choice/), [Message Batches API](../message-batches-api/), [AsyncAnthropic](../asyncanthropic/), [temperature](../temperature/), [Tokens](../tokens/), [Sampling](../sampling/), [Non-determinism](../non-determinism/), [context window](../context-window/). Link these originals rather than cloning.
- **Unofficial practice bank:** [CCDV-F-Developer-Study-Guide-100-Questions](../ccdv-f-developer-study-guide-100-questions/) ([Drive](https://drive.google.com/file/d/1jG9vCpCUpkmSTlY4_y-wzDfAUieYiGkr/view)).
- **Interactive quiz HTML:** [Open in Google Drive](https://drive.google.com/file/d/1ZEnvO9nZSFz61k3exGBMf1MMEISgzbHs/view) — external HTML artifact, not a Markdown note.

## Official technical references (re-check before exam)

| Topic | Authoritative page |
|---|---|
| api | [Documentation](https://platform.claude.com/docs/en/api/messages) |
| client-tools | [Documentation](https://platform.claude.com/docs/en/agents-and-tools/tool-use/overview) |
| streaming | [Documentation](https://platform.claude.com/docs/en/build-with-claude/streaming) |
| batches | [Documentation](https://platform.claude.com/docs/en/build-with-claude/batch-processing) |
| caching | [Documentation](https://platform.claude.com/docs/en/build-with-claude/prompt-caching) |
| context-tools | [Documentation](https://platform.claude.com/docs/en/agents-and-tools/tool-use/manage-tool-context) |
| json | [Documentation](https://platform.claude.com/docs/en/build-with-claude/structured-outputs) |
| evals | [Documentation](https://platform.claude.com/docs/en/test-and-evaluate/develop-tests) |
| thinking | [Documentation](https://platform.claude.com/docs/en/build-with-claude/thinking) |
| code-settings | [Documentation](https://code.claude.com/docs/en/settings) |
| code-hooks | [Documentation](https://code.claude.com/docs/en/hooks) |
| code-agents | [Documentation](https://code.claude.com/docs/en/sub-agents) |
| code-skills | [Documentation](https://code.claude.com/docs/en/skills) |
| mcp-transport | [Documentation](https://modelcontextprotocol.io/specification/2025-11-25/basic/transports) |
| mcp-tools | [Documentation](https://modelcontextprotocol.io/specification/2025-11-25/server/tools) |
| mcp-overview | [Documentation](https://modelcontextprotocol.io/specification/2025-11-25) |
| building-agents | [Documentation](https://www.anthropic.com/engineering/building-effective-agents) |

## Source confidence convention

- **Official blueprint:** domain objective / weight / exam format confirmed in Exam Guide v1.0.
- **Technical official docs:** behavior directly supported by vendor/specification documentation; check page version and model applicability.
- **Authenticated course note:** supported only by the specific screens recorded in the existing Skilljar notes. Do not infer unviewed lessons.
- **Study synthesis:** our derived architecture advice, exercises and memory aids, NOT verbatim course statements.
- **Pending:** course checkpoints, screens not reached, or any unverified dynamic API detail.
