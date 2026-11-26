---
title: "Organize Instructions, Knowledge, and Skills"
aliases: []
type: atomic-note
certification: CCAO-F
domain: D5
domain_name: Configuration and Knowledge Management
status: study-synthesis
source_kind: official-blueprint-and-documentation
updated: '2026-11-26'
tags:
- certification/ccao-f
- domain/configuration-knowledge-management
- type/concept
---

> Put each instruction, knowledge source, and external connection at the scope where it belongs;
> review it when the workflow or its owner changes.

**Blueprint area:** D5 - Configuration and Knowledge Management (official domain weight 12%).

## Choose the right configuration

These features solve related but different problems:

- **Account instructions** carry general preferences across interactions.
- **Project instructions** guide work within a particular Project. **Project knowledge** holds
  reference material for work in that Project.
- **Connectors** let Claude work with an external service. Access depends on the connected account's
  permissions, and organization settings may control whether members can use the connector.
- **Skills** provide reusable procedures or specialized behavior that Claude can load when relevant.
  They are not a substitute for a Project's reference documents or a connector's access to live
  service data.

Use the narrowest suitable scope. Put stable, general preferences in account instructions. Keep
project-specific rules and reference files with the Project. Use connectors only for needed services
and permitted actions. Use a Skill for a repeatable procedure that benefits from being reusable.

## Keep configuration useful

Assign an owner to important instructions, knowledge files, and connectors. Remove stale or
contradictory material. Make the source and review date clear for reference files. After a meaningful
change, test the configuration with a normal task and a case that checks a boundary or exception.

Enhanced Project knowledge with retrieval-augmented generation (RAG) is listed for eligible paid
plans. It can retrieve relevant material from Project files instead of placing all of the material
in the active context at once. The feature and its plan eligibility can change; confirm current
availability before depending on it.

Skills require Cloud code execution to be enabled. Organization-wide Skills are available for Team
and Enterprise plans; organization policy must enable both Cloud code execution and file creation,
and Skills. A connector enabled for an organization may still require each member to authenticate.

## Scenario

A department reuses a policy summary and response procedure. The owner keeps general tone guidance
in account instructions, puts current department rules and reference files in a Project, and
packages a repeatable review procedure as a Skill. The department uses a connector only for a
service it needs and is authorized to access. When the policy changes, the owner updates the source
file and tests a typical request plus one exception before sharing the configuration.

## Decision guidance

- Ask whether the information should apply to every conversation, one Project, or only a specific
  procedure.
- Store facts in a maintained source file; store process steps in instructions or a Skill.
- Use a connector for external data or actions only when the user and organization have approved
  that access.
- Check current plan and administrator prerequisites. A visible feature name does not prove the
  setting is enabled for the user.
- Revisit owners, source dates, access, and behavior after a policy or workflow change.

## Misconceptions

- Account instructions, Project instructions, Project knowledge, connectors, and Skills do not have
  the same scope or purpose.
- A Skill describes a procedure; it is not automatically the authoritative copy of changing policy
  or live service data.
- Enabling a connector at the organization level does not necessarily authenticate each user's
  account or authorize every action.
- More knowledge files do not guarantee that the needed passage will be retrieved or applied.

## Self-check

- Where should a general preference, a Project-specific source file, and a reusable procedure live?
- Which plan, organization policy, or account authorization must be checked before using the
  feature?

## References

- [CCAO-F Version 1.1 exam guide](https://cc.sj-cdn.net/instructor/6nizmqk8tpzpfjvt6qmmav7rh/public/1794946524/Claude_Certified_Associate_-_Foundations_Exam_Guide.pdf)
- [What are Claude Projects?](https://support.claude.com/en/articles/9517075-what-are-projects)
- [Retrieval-augmented generation for Projects](https://support.anthropic.com/en/articles/11473015-retrieval-augmented-generation-rag-for-projects)
- [Understanding Claude personalization features](https://support.anthropic.com/en/articles/10185728-understanding-claude-s-personalization-features)
- [What are Claude Skills?](https://support.claude.com/en/articles/12512176-what-are-skills)
- [Provisioning Skills for an organization](https://support.anthropic.com/en/articles/13119606-provisioning-and-managing-skills-for-your-organization)
- [Using connectors with Claude](https://support.claude.com/en/articles/11176164-pre-built-integrations-using-remote-mcp)

## Evidence and currency

This is original study synthesis. The current Projects article and personalization article differ on
whether Project instructions are available on free plans; see the [CCAO-F source
register](../source-register/). Verify access and organization settings instead of
assuming a feature is available.