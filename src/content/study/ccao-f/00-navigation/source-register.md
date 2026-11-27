---
title: "CCAO-F Source Register"
type: moc
certification: CCAO-F
status: study-synthesis
source_kind: official-blueprint-and-documentation
updated: '2026-11-26'
tags:
- certification/ccao-f
- type/source-register
- method/provenance
---

> This register records the official evidence reviewed for the original CCAO-F study notes. A listed
> URL is not a claim that every part of its page was reviewed.

## Guide of record and exam boundary

The applicable guide is **Claude Certified Associate - Foundations Exam Guide, Version 1.1,
effective November 2026**. The official PDF search result was inspected on 2026-11-26. A revision
effective December 7, 2026 is outside this review and is later than the retrieval date.

| Domain | Official content domain | Weight |
|---|---|---:|
| D1 | Prompting and Task Execution | 14% |
| D2 | Output Evaluation and Validation | 21% |
| D3 | Product and Model Selection | 12% |
| D4 | Workflow Integration and Solution Design | 16% |
| D5 | Configuration and Knowledge Management | 12% |
| D6 | Governance, Risk, and Responsible Use | 15% |
| D7 | Troubleshooting and Optimization | 10% |

The guide states **60 items**, **120 minutes**, and a passing **scaled score of 720 on a 100-1,000
scale**. The custom Practice Lab mock has 50 questions and a 100-minute limit. It is a separate
practice activity, not a match for the official exam. A raw practice percentage is not an official
scaled score and does not predict it.

## Evidence status

- **Content-reviewed:** the relevant full page or article text was retrieved and inspected. This
  describes the reviewed text, not ongoing accuracy or completeness of the entire site.
- **Partially reviewed:** only relevant excerpts or a bounded portion of the page were retrieved.
- **Indexed excerpt:** a public search result exposed relevant text, but the source itself was not
  fully retrieved for review.
- **Not reviewed:** a link or mention was present, but no source content was inspected.

Retrieval date for all sources below: **2026-11-26**. Official web pages were accessed through
public HTTPS retrieval and text extraction, except where noted. Product, plan, model, privacy, and
policy details may change after retrieval.

## Source-driven gap analysis

The project-wide CCDV-F competency matrix
(`src/content/study/ccdv-f/00-navigation/exam-blueprint-and-coverage.md`) assesses all 25 official
CCDV-F competencies against existing Practice Lab material. It records
foundational coverage and limits; it does not establish CCAO-F coverage. The CCAO-F notes below were
compared with those existing syntheses and with the current seven-domain CCAO-F guide. The additions
focus on Associate-level product use and workflow judgment rather than duplicating Developer-level
implementation notes.

| CCAO-F domain and note | Existing Practice Lab overlap | Gap that justifies this note | Evidence and limit |
|---|---|---|---|
| D1 — `src/content/study/ccao-f/11-prompting-and-task-execution/prompt-design-and-task-decomposition.md` | CCDV-F prompt-engineering and requirements material covers prompt structure and software acceptance criteria. | A concise user-facing task brief, when to decompose a request, and how to revise one instruction from an observed gap are needed for Associate-level prompting tasks. | Prompting best-practice excerpt and CCAO-F guide excerpts; the complete guide was not extracted. |
| D2 — `src/content/study/ccao-f/12-output-evaluation-and-validation/validate-claims-and-curate-outputs.md` | CCDV-F structured-output and source-validation notes cover schema and technical evidence. | The CCAO-F objective needs a decision process for checking completeness, exact claim support, uncertainty, bias, and human review before using a result. | Anthropic prompting guidance and source-review material; product examples are partial and not a complete evaluation standard. |
| D3 — `src/content/study/ccao-f/13-product-and-model-selection/select-products-models-and-context.md` | CCDV-F model-selection and context notes cover API/model trade-offs and engineering context. | The Associate guide needs a product-surface comparison that separates account instructions, Project knowledge, API context, and Claude Code context without relying on volatile model rankings. | Models, context, and personalization pages were partially reviewed; capabilities and plan access change. |
| D4 — `src/content/study/ccao-f/14-workflow-integration-and-solution-design/design-integrated-workflows.md` | CCDV-F application-design and lifecycle notes cover integrations and deployment. | The note adds a user/workflow-first choice among Research, connectors, and Artifacts, with permissions, review ownership, and evidence-based outcome claims. | Research article was content-reviewed; connector and Artifact pages were partial. No productivity figure is asserted. |
| D5 — `src/content/study/ccao-f/15-configuration-and-knowledge-management/organize-instructions-knowledge-and-skills.md` | CCDV-F Claude Code notes cover developer settings, hooks, and Skills. | Associate users need to choose the correct account, Project, connector, or Skill scope and maintain source ownership, freshness, and plan prerequisites. | Projects, personalization, Skills, and connector sources have mixed partial/full review; the Project-instruction plan availability discrepancy remains unresolved. |
| D6 — `src/content/study/ccao-f/16-governance-risk-and-responsible-use/apply-governance-privacy-and-fairness.md` | CCDV-F security notes cover trust boundaries, credentials, and technical safeguards. | CCAO-F requires separate checks for permitted use, access authorization, product-specific privacy, and possible proxy bias in a consequential workflow. | Anthropic privacy and Usage Policy sources are partial or product-specific; this note is study guidance, not legal advice. |
| D7 — `src/content/study/ccao-f/17-troubleshooting-and-optimization/diagnose-output-and-improve-workflows.md` | CCDV-F debugging notes cover API errors, traces, and technical recovery. | The note gives Associate users a repeatable way to distinguish prompt, source, context, feature-access, and workflow causes, then test one bounded change. | Prompting and model-selection pages were partially reviewed; current product behavior and performance claims require rechecking. |

The table identifies overlap rather than treating a linked CCDV-F note as a duplicate CCAO-F deliverable. The additions were retained because they address product-level decisions and user workflows that the existing Developer-focused notes do not cover as a single Associate-facing synthesis.

## Official sources inspected

### Exam guide

- [Claude Certified Associate - Foundations Exam Guide](https://cc.sj-cdn.net/instructor/6nizmqk8tpzpfjvt6qmmav7rh/public/1794946524/Claude_Certified_Associate_-_Foundations_Exam_Guide.pdf)
  - **Method and status:** public search indexing on 2026-11-26; **indexed excerpt / partially
    reviewed**. A direct PDF fetch could not be rendered by the page reader because of a response
    metadata parse error.
  - **Evidence examined:** guide title and Version 1.1 / effective November 2026 label; exam overview
    with item count, time limit, scaled pass score; blueprint table with all seven domains and
    weights; selected D1 and D7 objective text.
  - **Limitations:** the full PDF and every objective were not independently inspected. No later
    revision was used.

### Anthropic platform documentation

- [Claude prompting best practices](https://docs.anthropic.com/en/docs/build-with-claude/prompt-engineering/claude-4-best-practices)
  - **Method and status:** public HTTPS retrieval; bounded opening excerpt; **partially reviewed**.
  - **Evidence examined:** current page structure and general guidance to give clear, direct
    instructions, explain the requested output, and use model-specific guidance carefully.
  - **Limitations:** the whole page and its model-specific examples were not reviewed. Model names
    and API-specific guidance were not reproduced in the notes.
- [Claude models overview](https://docs.anthropic.com/en/docs/about-claude/models)
  - **Method and status:** public HTTPS retrieval; bounded opening excerpt; **partially reviewed**.
  - **Evidence examined:** the page presents model capabilities and selection information that can
    change over time.
  - **Limitations:** no model or price table was copied. The full model catalogue was not reviewed.
- [Choosing a Claude model](https://docs.anthropic.com/en/docs/about-claude/models/choosing-a-model)
  - **Method and status:** public HTTPS retrieval; bounded opening excerpt; **partially reviewed**.
  - **Evidence examined:** selection factors include capabilities, speed, cost, evaluation, and
    task-specific testing.
  - **Limitations:** model-specific recommendations and performance claims are dynamic and were not
    used as universal rules.
- [Claude context windows](https://docs.anthropic.com/en/docs/build-with-claude/context-windows)
  - **Method and status:** public HTTPS retrieval; bounded opening excerpt; **partially reviewed**.
  - **Evidence examined:** context includes the material needed to produce a response, and more
    context is not automatically better; exact capacity depends on model and product.
  - **Limitations:** model-specific capacity values and implementation details were excluded.

### Claude Help Center and privacy sources

- [What are Claude Projects?](https://support.claude.com/en/articles/9517075-what-are-projects)
  - **Method and status:** public HTTPS retrieval; first portion of article; **partially reviewed**.
  - **Evidence examined:** Projects organize chats, instructions, and knowledge; page describes a
    staged beta and plan-dependent behavior.
  - **Limitations:** later sections and every rollout condition were not reviewed. Availability must
    be checked in the current account and plan.
- [Retrieval-augmented generation for Projects](https://support.anthropic.com/en/articles/11473015-retrieval-augmented-generation-rag-for-projects)
  - **Method and status:** public HTTPS retrieval; full article text fit the captured output;
    **content-reviewed**.
  - **Evidence examined:** RAG can retrieve relevant Project knowledge and activates automatically
    as knowledge approaches context limits; the page limits availability to paid plans.
  - **Limitations:** this is a point-in-time product description; plan eligibility and behavior may
    change.
- [Understanding Claude personalization features](https://support.anthropic.com/en/articles/10185728-understanding-claude-s-personalization-features)
  - **Method and status:** public HTTPS retrieval; full article text fit the captured output;
    **content-reviewed**.
  - **Evidence examined:** account-wide instructions, Project instructions, and Skills have
    different purposes and scopes.
  - **Limitations:** this page says Project instructions are available on paid plans, while the
    Projects article describes Projects as available to all users. This is an unresolved source
    discrepancy; the notes advise checking current plan access rather than asserting universal
    availability.
- [What are Claude Skills?](https://support.claude.com/en/articles/12512176-what-are-skills)
  - **Method and status:** public HTTPS retrieval; full article text fit the captured output;
    **content-reviewed**.
  - **Evidence examined:** Skills provide reusable task procedures and require code execution to be
    enabled; the page distinguishes Skills from Project knowledge and connectors.
  - **Limitations:** availability and interface details can change.
- [Provisioning Skills for an organization](https://support.anthropic.com/en/articles/13119606-provisioning-and-managing-skills-for-your-organization)
  - **Method and status:** public HTTPS retrieval; bounded opening excerpt; **partially reviewed**.
  - **Evidence examined:** organization-wide Skills are available for Team and Enterprise plans and
    require policy settings for Cloud code execution and file creation and Skills.
  - **Limitations:** later sections, group-specific behavior, and every administrative option were
    not reviewed.
- [Using connectors with Claude](https://support.claude.com/en/articles/11176164-pre-built-integrations-using-remote-mcp)
  - **Method and status:** public HTTPS retrieval; bounded opening excerpt; **partially reviewed**.
  - **Evidence examined:** connectors inherit the connected service's permissions; Team and
    Enterprise organization enablement and individual authentication can be prerequisites.
  - **Limitations:** later sections and connector-specific permissions were not reviewed. Check the
    current connector directory and administrator policy.
- [Use Research in Claude](https://support.claude.com/en/articles/11088861-use-research-on-claude)
  - **Method and status:** public HTTPS retrieval; full article text fit the captured output;
    **content-reviewed**.
  - **Evidence examined:** Research uses web search, requires web search to be enabled, is limited
    to eligible paid plans, and may use connected services depending on the surface.
  - **Limitations:** model availability and surface-specific behavior can change.
- [What are Claude Artifacts?](https://support.anthropic.com/en/articles/17153992-what-are-artifacts-and-how-do-i-use-them)
  - **Method and status:** public HTTPS retrieval; bounded opening excerpt; **partially reviewed**.
  - **Evidence examined:** Artifacts are reusable outputs, and the page lists Cloud code execution
    and file creation as a prerequisite.
  - **Limitations:** the full feature and plan matrix was not reviewed; do not assume every template
    or capability is enabled for every account.
- [Consumer privacy and model training](https://privacy.anthropic.com/en/articles/10023580-is-my-data-used-for-model-training)
  - **Method and status:** public HTTPS retrieval; full article text fit the captured output;
    **content-reviewed**.
  - **Evidence examined:** the consumer policy describes specific opt-in, safety-review, and
    feedback conditions for possible model improvement use.
  - **Limitations:** policy may change and account settings matter. This page does not describe
    commercial products.
- [Commercial privacy and model training](https://privacy.anthropic.com/en/articles/7996868-how-do-you-use-personal-data-in-model-training)
  - **Method and status:** public HTTPS retrieval; full article text fit the captured output;
    **content-reviewed**.
  - **Evidence examined:** the commercial page states that inputs and outputs are not used to train
    models by default, with stated exceptions such as feedback or explicit permission.
  - **Limitations:** individual agreements and later policy changes may affect a specific use.
- [Anthropic Usage Policy](https://www.anthropic.com/legal/aup)
  - **Method and status:** public HTTPS retrieval; opening policy excerpt; **partially reviewed**.
  - **Evidence examined:** policy scope, its general categories, and its statement that requirements
    can change.
  - **Limitations:** not every high-risk category or policy requirement was reviewed. This register
    does not provide legal interpretation.
- [Claude's Constitution](https://www.anthropic.com/constitution)
  - **Method and status:** public HTTPS retrieval; opening excerpt; **partially reviewed**.
  - **Evidence examined:** the stated intentions include safety, ethics, following applicable
    guidance, helpfulness, and the possibility that model behavior may not always match those aims.
  - **Limitations:** the full document and detailed principles were not reviewed.
- [U.S. Copyright Office fair use FAQ](https://www.copyright.gov/help/faq/faq-fairuse.html)
  - **Method and status:** public HTTPS retrieval; relevant FAQ excerpt; **partially reviewed**.
  - **Evidence examined:** the FAQ says fair use depends on circumstances and does not provide a
    universal word-count or percentage rule.
  - **Limitations:** U.S.-specific general information only; this note gives no legal advice and does
    not assess any individual use.

## Excluded materials and permissions

- No SkillCertPro question or cheat-sheet wording was copied, quoted, closely paraphrased, or used to
  validate a technical claim. The supplied review described the TestApp Master Cheat Sheet as
  transcribed from SkillCertPro; it was not opened for this writing pass. Its section headings and
  reported gaps were not used as study-note prose.
- The maintainer confirms permission to reuse a separate Claude-generated question bank by an
  author whose name was not supplied. The linked generated-question PDF returned HTTP 400 and was
  not reviewed or used. This permission was not treated as permission to use SkillCertPro material.
- This writing pass did not open the source ZIP, any candidate question files, or saved progress. It
  did not use other certification catalog entries or question-bank text. Search results that
  surfaced non-official study pages were ignored as evidence.
- The notes contain original explanations and scenarios only. No question IDs or mock questions
  were added.

## Remaining limitations

- The official guide was only partially reviewed through indexed PDF excerpts because direct
  extraction failed. The supplied domain map and weights match the indexed official blueprint
  excerpt, but this register does not claim a full PDF review.
- Product labels, plan eligibility, account settings, privacy terms, policy text, and model
  capabilities can change. Check the linked official source at the time of use.
- The Projects and personalization pages conflict on Project-instruction plan availability. The
  notes preserve that uncertainty rather than choosing one page as definitive.