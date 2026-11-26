---
title: "Knowledge Gap Backlog"
type: moc
certification: CCDV-F
status: open
source_kind: coverage-audit
updated: '2026-11-24'
tags:
- certification/ccdv-f
- type/backlog
- status/incomplete
---

> This backlog records **knowledge gaps**, not evidence of hidden course content. The Phase 0
> assessment uses the evidence limits in the [Source Register](../source-register/)
> and [Competency Matrix](../exam-blueprint-and-coverage/). Prioritize by official weight and by
> missing authenticated screens.

## Gated-course completion

- ☐ MSO Foundations: capture screens 7–9 after permitted checkpoint completion
- ☐ Production-Grade Prompting, Agents & Tool Use: capture screens 5–29 and relevant exercises
- ☐ Claude Code, MCP & Integration: capture screens 5–22
- ☐ Production Engineering, Evals & Security: capture screens 5–23
- ☐ Accelerators & IP Contribution: capture screens 5–25

## Validated enrichment deliveries (2026-11-24)

Completed in the agreed order D6, D8, D7, D3, D4. Each workshop addresses a matrix gap and links to
existing concept notes; access and evidence limitations remain explicit.

1. ☒ **D6 — Prompt & Context Engineering (11%; highest
   priority).** [Context, Compaction, and Memory](../ccdv-f-contexto-compactacion-y-memoria/) now
   compares context editing/compaction, tool search, programmatic tool calling, and prompt caching;
   see the [D6 workshop](../prompt-and-context-engineering-workshop/). Evidence: AICG 6.1 excerpt
   and [official context-management docs](https://platform.claude.com/docs/en/agents-and-tools/tool-use/manage-tool-context);
   AICG lesson review is partial.
2. ☒ **D8 — Tools & MCPs (
   10.6%).** [MCP transport and authorization](../ccdv-f-servidores-transportes-y-autorizacion-mcp/)
   and active MCP references now use spec `2026-07-28`;
   the [D8 workshop](../tools-and-mcp-integration-workshop/) exercises capability lifecycle,
   transport, Origin, token audience, and server verification. Authorization-page review remains
   limited to indexed excerpts after HTTP 429.
3. ☒ **D7 — Security & Safety (8.1%).** The [D7 workshop](../security-and-safety-workshop/) applies
   existing trust-boundary and guardrail notes to indirect injection, least privilege, exfiltration,
   exact-action approval, and fail-safe tests. Evidence includes partial AICG excerpts and selected
   Anthropic Research excerpts; limits are recorded in the [Source Register](../source-register/).
4. ☒ **D3 — Claude Code (3.1%).** The [D3 workshop](../claude-code-operations-workshop/) exercises
   setting scopes, same-name skill precedence, and event-specific hook outcomes using current
   official [settings](https://code.claude.com/docs/en/settings), [hooks](https://code.claude.com/docs/en/hooks),
   and [skills](https://code.claude.com/docs/en/skills) references. The AICG lesson body was not
   reviewed.
5. ☒ **D4 — Evals, Testing & Debugging (2.6%).**
   The [D4 workshop](../eval-debugging-and-recovery-workshop/) follows an ambiguous side-effect
   timeout through trace diagnosis, recovery, grader choice, and a release gate using
   official [eval](https://platform.claude.com/docs/en/test-and-evaluate/develop-tests)
   and [API error](https://platform.claude.com/docs/en/api/errors) guidance. The AICG lesson body
   was not reviewed.

**Secondary maintenance:** refresh the D2 configuration note with current managed-settings
precedence; keep D5 prompt-caching price/TTL claims versioned and recheck them before publication.
The 2026-11-24 audit reviewed current cache guidance but exact pricing is dynamic.

## Technical change watch

- ☐ Recheck current model family, thinking modes, model aliases and deprecated parameters against
  production model docs
- ☐ Verify active prompt caching pricing / TTL / cache invalidation rules before exam practice
- ☐ Verify Message Batches pricing and limits (can change without blueprint updates)
- ☒ Verify Claude Code settings scopes/precedence, hook events, and blocking behavior against
  current documentation; details remain version-sensitive
- ☒ Identify and review MCP specification `2026-07-28` transport/tool requirements; apply the
  findings to the existing notes and recheck before publication

## Completeness gates for new notes

- ☒ Every original claim has a specific source/lesson pointer or is marked as synthesis
- ☒ Every note links at least one related concept and its domain MOC
- ☒ No title collisions or broken Obsidian wikilinks
- ☒ All practice scenarios are original, not copied from private exams

Related: [Course Access Coverage](../course-access-coverage/) · [Source Register](../source-register/) · [Study Roadmap](../study-roadmap/).
