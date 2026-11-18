// Exact source corrections for fields that concatenate neighbouring material.
// Match both record identity and the complete original text; inline references
// and future source edits must pass through unchanged.
const WHY_NOT_CORRECTIONS = {
	"ccdvf:1.8": [
		"B is impossible — LLM sampling remains non-deterministic regardless of framework; D is false — framework agents need evals like any other; E confuses orchestration tooling with model training. ## Domain 2: Applications and Integration",
		"B is impossible — LLM sampling remains non-deterministic regardless of framework; D is false — framework agents need evals like any other; E confuses orchestration tooling with model training.",
	],
	"ccdvf:2.17": [
		"B puts secrets in source control, a security failure; D guarantees drift between what developers test and what ships; E removes review from the changes most likely to alter behaviour. ## Domain 3: Claude Code",
		"B puts secrets in source control, a security failure; D guarantees drift between what developers test and what ships; E removes review from the changes most likely to alter behaviour.",
	],
	"ccdvf:3.2": [
		"A governs permission prompting, not non-interactive invocation; B has no human to type or supervise; D is false — headless operation is a core Claude Code feature. ## Domain 4: Eval, Testing, and Debugging",
		"A governs permission prompting, not non-interactive invocation; B has no human to type or supervise; D is false — headless operation is a core Claude Code feature.",
	],
	"ccdvf:4.1": [
		"B guesses at a cause that may not exist — no prompt fixes bad retrieval; C spends money to mask an undiagnosed problem; D communicates around the failure instead of finding it. ## Domain 5: Model Selection and Optimization",
		"B guesses at a cause that may not exist — no prompt fixes bad retrieval; C spends money to mask an undiagnosed problem; D communicates around the failure instead of finding it.",
	],
	"ccdvf:5.9": [
		"A, the Batch API targets latency-tolerant workloads with results returned asynchronously; it is the opposite of what an interactive session needs (and fast mode is not available with it); B, extended thinking adds reasoning tokens before the answer, increasing time-to-answer rather than reducing it; D, model tiers trade capability for speed and cost; the scenario explicitly rules out sacrificing reasoning quality, and cost is stated as secondary ## Domain 6: Prompt and Context Engineering",
		"A, the Batch API targets latency-tolerant workloads with results returned asynchronously; it is the opposite of what an interactive session needs (and fast mode is not available with it); B, extended thinking adds reasoning tokens before the answer, increasing time-to-answer rather than reducing it; D, model tiers trade capability for speed and cost; the scenario explicitly rules out sacrificing reasoning quality, and cost is stated as secondary",
	],
	"ccdvf:6.6": [
		"A is exactly the assumption that causes production incidents; B replaces strict parsing with fragile pattern-matching; D increases variability, making structured output less reliable. ## Domain 7: Security and Safety",
		"A is exactly the assumption that causes production incidents; B replaces strict parsing with fragile pattern-matching; D increases variability, making structured output less reliable.",
	],
	"ccdvf:7.4": [
		"A is probabilistic where a guarantee is needed; C maximises blast radius — the opposite of least privilege; E misunderstands temperature, which adds randomness, not caution. ## Domain 8: Tools and MCPs",
		"A is probabilistic where a guarantee is needed; C maximises blast radius — the opposite of least privilege; E misunderstands temperature, which adds randomness, not caution.",
	],
	"ccarp:1.10": [
		"A is a scaling concern solvable within any pattern; B is a budget fact, not an architectural driver; D is prestige, not an architectural driver. 1.11 — 1 → single augmented LLM call; 2 → fixed workflow; 3 → autonomous agent; 4 → multi-agent system; 5 → single augmented LLM call 1 and 5 are single transformations with supplied context — one augmented call each. 2 is a stable, repeating sequence — a workflow. 3’s path depends on what each step reveals — an autonomous agent. 4 needs distinct specialists coordinated into one output — multi-agent. Domain 2: Claude Models, Prompting & Context Engineering",
		"A is a scaling concern solvable within any pattern; B is a budget fact, not an architectural driver; D is prestige, not an architectural driver.",
	],
	"ccarp:2.8": [
		"A adds variance; C places rules at the position of weakest attention; D removes the structure that aids adherence. # Domain 3: Integration",
		"A adds variance; C places rules at the position of weakest attention; D removes the structure that aids adherence.",
	],
	"ccarp:3.11": [
		"A describes a case where monolithic context is simpler and fine; C rules out the intermediate steps discovery requires; E describes a case where monolithic context is fine. 3.12 — 1 → MCP server; 2 → direct API integration; 3 → agent-to-agent protocol; 4 → MCP server; 5 → direct API integration 1 and 4 need standardised, reusable, discoverable access for many present and future consumers — MCP. 2 and 5 are deterministic, tightly scoped calls inside owned pipelines — direct integration, with no discovery layer needed. 3 crosses an organisational trust boundary between autonomous agents — agent-to-agent. ## Domain 4: Evaluation, Testing & Optimization",
		"A describes a case where monolithic context is simpler and fine; C rules out the intermediate steps discovery requires; E describes a case where monolithic context is fine.",
	],
	"ccarp:4.9": [
		"B is volume — it doesn’t explain a quality change; C is spend, not quality; E is availability, not quality. 4.10 — 1 → model mismatch; 2 → prompt failure; 3 → hallucination; 4 → model mismatch; 5 → hallucination 1 and 4 are capability gaps between the chosen model and the task — mismatch. 2 is conflicting instructions — the prompt is the defect. 3 and 5 are confident fabrications ungrounded in source data or tool results — hallucination. ## Domain 5: Governance, Safety & Risk Management",
		"B is volume — it doesn’t explain a quality change; C is spend, not quality; E is availability, not quality.",
	],
	"ccarp:5.8": [
		"A is false — capability doesn’t confer immunity; C doesn’t affect instruction-following; E is detective, not preventative. ## 5.9 — 1 → preventative guardrail; 2 → human-in-the-loop validation; 3 → monitoring and audit; 4 → preventative guardrail; 5 → monitoring and audit 1 and 4 are absolute “never before display” requirements — they must be prevented, not caught. 2 is a consequential judgement per decision — a human gate. 3 and 5 are about reconstruction and trend detection — the audit trail and fleet monitoring. ## Domain 6: Stakeholder Communication & Lifecycle Management",
		"A is false — capability doesn’t confer immunity; C doesn’t affect instruction-following; E is detective, not preventative.",
	],
	"ccarp:6.8": [
		"A erodes the project invisibly; C erodes the relationship; D trades quality for schedule in the dark. ### 6.9 — 1 → discovery; 2 → design; 3 → handoff; 4 → monitoring and iteration; 5 → discovery 1 and 5 establish the problem and its success definition — discovery. 2 makes architectural choices against agreed requirements — design. 3 transfers operational ownership — handoff. 4 uses production evidence to drive the next improvement cycle — monitoring and iteration. ### Domain 7: Developer Productivity & Operational Enablement",
		"A erodes the project invisibly; C erodes the relationship; D trades quality for schedule in the dark.",
	],
};

const OPTION_CORRECTIONS = {
	"ccarf:1.10:E": [
		"Instruct the model to quote amounts and order numbers only from the most recent summary, never from earlier raw history Scenario 2: Code Generation with Claude Code Your team uses Claude Code for code generation, refactoring, debugging, and documentation, integrated into daily development with custom slash commands and CLAUDE.md configuration — and you must judge when plan mode beats direct execution.",
		"Instruct the model to quote amounts and order numbers only from the most recent summary, never from earlier raw history",
	],
	"ccarf:2.10:E": [
		"Delegate verbose investigation to subagents that return summaries, keeping the main session’s context for coordination Scenario 3: Multi-Agent Research System A coordinator agent built on the Claude Agent SDK delegates to specialized subagents — web search, document analysis, synthesis, and report generation — to research topics and produce comprehensive, cited reports.",
		"Delegate verbose investigation to subagents that return summaries, keeping the main session’s context for coordination",
	],
	"ccarf:3.10:E": [
		"Distinguish access failures (timeouts, service errors) from valid empty results (successful queries with no matches) Scenario 4: Developer Productivity with Claude You are building developer productivity tooling on the Claude Agent SDK: helping engineers explore unfamiliar codebases, understand legacy systems, generate boilerplate, and automate repetitive tasks — using the built-in tools (Read, Write, Edit, Bash, Grep, Glob) plus MCP servers.",
		"Distinguish access failures (timeouts, service errors) from valid empty results (successful queries with no matches)",
	],
	"ccarf:4.10:E": [
		"Subagent tool restrictions apply only to MCP-provided tools, not to built-in tools such as Bash or Write Scenario 5: Claude Code for Continuous Integration You are integrating Claude Code into a CI/CD pipeline for automated code review, test generation, and pull-request feedback — designing prompts that produce actionable findings while minimizing false positives.",
		"Subagent tool restrictions apply only to MCP-provided tools, not to built-in tools such as Bash or Write",
	],
	"ccarf:5.10:E": [
		"Include examples demonstrating the exact desired output format — location, issue, severity, fix Scenario 6: Structured Data Extraction You are building a structured data extraction system: pulling information from unstructured documents, validating output against JSON schemas, handling edge cases gracefully, and integrating with downstream systems.",
		"Include examples demonstrating the exact desired output format — location, issue, severity, fix",
	],
};

function correct(text, key, corrections) {
	const correction = corrections[key];
	return correction && text === correction[0] ? correction[1] : text;
}

export function sanitizeWhyNot(text, certId, questionId) {
	return correct(text, `${certId}:${questionId}`, WHY_NOT_CORRECTIONS);
}

export function sanitizeOptionText(text, certId, questionId, optionId) {
	return correct(text, `${certId}:${questionId}:${optionId}`, OPTION_CORRECTIONS);
}
