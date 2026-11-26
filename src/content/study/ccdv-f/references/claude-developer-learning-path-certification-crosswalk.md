---
title: Claude Developer — Learning Path Extract & Certification Crosswalk
source: https://anthropic-partners.skilljar.com/path/claude-developer
captured: 2026-11-13
exam: Claude Certified Developer — Foundations (CCDV-F)
tags:
  - anthropic
  - claude
  - certification
  - learning-path
---

> **Source scope:** This document summarizes the publicly accessible learning-path index. It does
> **not** contain authenticated lesson text, videos, transcripts, quizzes, or interactive exercises.

**Primary
source:** [Claude Developer learning path](https://anthropic-partners.skilljar.com/path/claude-developer)  
**Captured:** 2026-11-13  
**Purpose:** Preparation for the **Claude Certified Developer — Foundations (CCDV-F)**
certification.

## 1. Verified Claude Developer learning path

The public learning path lists the following **nine courses**, in displayed order:

| # | Course                                     | Public description / scope                                                                                             |
|---|--------------------------------------------|------------------------------------------------------------------------------------------------------------------------|
| 1 | **AI Capabilities and Limitations**        | Introductory course on how AI works.                                                                                   |
| 2 | **AI Fluency for Builders**                | AI fluency for builders, from identifying a problem through shipping a solution.                                       |
| 3 | **Claude Platform & Model Foundations**    | Four foundational decisions: entry point, capability features, model, and context. **Published duration: 59 minutes.** |
| 4 | **Claude Platform 101**                    | Building on Claude Platform, including first API integrations.                                                         |
| 5 | **Claude Code 101**                        | Using Claude Code in day-to-day development workflows.                                                                 |
| 6 | **Claude Code in Action**                  | Steering, configuring, automating, and verifying longer hands-off Claude Code sessions.                                |
| 7 | **Introduction to Model Context Protocol** | Implementing MCP servers and clients with Python; tools, resources, and prompts.                                       |
| 8 | **Introduction to agent skills**           | Creating, configuring, sharing, and troubleshooting reusable Markdown-based Skills for Claude Code.                    |
| 9 | **Introduction to subagents**              | Building subagents for delegation, specialist workflows, and context isolation.                                        |

These are course-level descriptions from the public catalogue, **not extracted lesson bodies**.

## 2. Separate Foundations certification preparation course

The [Claude Certified Developer — Foundations Prep Course](https://anthropic-partners.skilljar.com/path/claude-certified-developer-foundations)
is **a separate learning path**. Its index lists five modules:

| Module                                        | Listed duration |
|-----------------------------------------------|----------------:|
| MSO Foundations                               |      57 minutes |
| Production-Grade Prompting, Agents & Tool Use |     209 minutes |
| Claude Code, MCP & Integration                |     142 minutes |
| Production Engineering, Evals & Security      |     211 minutes |
| Accelerators & IP Contribution                |     155 minutes |

An existing archive of this course's overview is
in [Google Drive](https://drive.google.com/file/d/1NhGc_u7Fah_pbs2MUVdaZXcDv3yxA0YP/view).

**Important:** Do not substitute the nine courses listed in section 1 for the complete examination
blueprint.

## 3. Mapping to the CCDV-F examination blueprint

The weights below come from the
official [Exam Guide v1.0 (July 2026)](https://drive.google.com/file/d/1aWhE373XnbPEcYbzXV6VjRfjHpUQdM9s/view).
Course relevance and gaps are **study-planning analysis**, not a claim that every objective is
taught by those courses.

| Exam domain                             |    Weight | Relevant learning-path courses                                                 | Additional areas to cover                                                                      |
|-----------------------------------------|----------:|--------------------------------------------------------------------------------|------------------------------------------------------------------------------------------------|
| **1. Agents and Workflows**             | **14.7%** | Introduction to subagents; Claude Code in Action; Introduction to agent skills | Agent SDK, agent loops, supervisor patterns, memory and orchestration                          |
| **2. Applications and Integration**     | **33.1%** | Claude Platform 101; Claude Platform & Model Foundations                       | Messages API, streaming, batches, error recovery, schemas, third-party integrations            |
| **3. Claude Code**                      |  **3.1%** | Claude Code 101; Claude Code in Action; Introduction to agent skills           | `CLAUDE.md` hierarchy, `settings.json`, headless mode, session and plugin management           |
| **4. Eval, Testing, and Debugging**     |  **2.6%** | Claude Code in Action (verification-related introduction)                      | Eval design, trace analysis, failure isolation and regression testing                          |
| **5. Model Selection and Optimization** | **16.8%** | Claude Platform & Model Foundations                                            | Model-tier tradeoffs, token/cost accounting, caching, batch economics and latency              |
| **6. Prompt and Context Engineering**   | **11.0%** | Claude Platform & Model Foundations; Introduction to subagents                 | Few-shot prompting, context pruning and compaction, structured output and defensive validation |
| **7. Security and Safety**              |  **8.1%** | Claude Code workflows and permissions (related topics)                         | Prompt-injection mitigation, hooks, least privilege, PII and secrets management                |
| **8. Tools and MCPs**                   | **10.6%** | Introduction to Model Context Protocol; Introduction to agent skills           | Client-side vs server-side execution, tool schemas, MCP deployment, approvals and failures     |

### Study allocation

The official blueprint gives the greatest weight to **Applications and Integration (33.1%)**,
followed by **Model Selection and Optimization (16.8%)** and **Agents and Workflows (14.7%)**.
Prioritize preparation accordingly, while retaining coverage across all eight domains.

## 4. Suggested study sequence

The following sequence is a **recommendation**, not an official course order beyond the catalogue
order above.

### Priority A — Core implementation and architecture

1. Claude Platform & Model Foundations
2. Claude Platform 101
3. Claude Code in Action
4. Introduction to subagents

**Focus:** Claude API mechanics, model/context decisions, orchestration, and production tradeoffs.

### Priority B — Context, tools, and reuse

1. Introduction to Model Context Protocol
2. Introduction to agent skills

**Focus:** tool schemas and boundaries, MCP tools/resources/prompts, reusable instructions, context
isolation, and controlled delegation.

### Priority C — Security, evaluation, and configuration details

Use the separate Foundations Prep Course and official documentation to fill gaps in security,
evaluators, tracing, errors, cost controls, Claude Code configuration, and hooks.

### Suggested practice exercise

Build a small Claude-powered service with:

- A bounded agent/tool-use loop and a documented tool schema.
- Streaming plus timeout and retry handling.
- One MCP integration.
- An evaluation suite with structural and behavioral assertions.
- Token/cost tracking and a defined budget.
- Explicit approvals and security guardrails for sensitive actions.

*This exercise is proposed for certification preparation; it is not presented as extracted Skilljar
course content.*

## 5. Access limitations and provenance

**Verified from the public course index:** nine course titles, their short descriptions, their
display order, and the listed 59-minute duration for *Claude Platform & Model Foundations*.

**Not retrieved:** full authenticated lesson content, embedded video transcripts, interactive
activities, assessments, or member-only assets. The public index does not establish what those
materials contain.

**Authoritative exam source:** The official CCDV-F Exam Guide provides domain weights and test
objectives. The catalogue provides learning resources but does not guarantee full coverage or a
passing score.

## Sources

- [Claude Developer — Skilljar](https://anthropic-partners.skilljar.com/path/claude-developer)
- [Claude Certified Developer — Foundations Prep Course](https://anthropic-partners.skilljar.com/path/claude-certified-developer-foundations)
- [Claude Certified Developer — Foundations Exam Guide (Google Drive)](https://drive.google.com/file/d/1aWhE373XnbPEcYbzXV6VjRfjHpUQdM9s/view)
- [Previously archived Foundations Prep Course overview](https://drive.google.com/file/d/1NhGc_u7Fah_pbs2MUVdaZXcDv3yxA0YP/view)
