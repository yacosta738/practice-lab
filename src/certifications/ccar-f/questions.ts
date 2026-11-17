// CCAR-F question bank — generated from Cert Pro Quest snapshot
// Source: Cert Pro Quest — practice bank by Matthew Purcell (not official exam content)

import type { Question } from "../../lib/quiz-types";

export const questions: Question[] = [
	{
		id: "CPQ-ccarf-1.1",
		domain: "D1",
		question:
			"[Scenario 1: Customer Support Resolution Agent] You are implementing the agent's core loop. Which control flow correctly determines when to keep executing tools and when to present the final response?",
		options: [
			"Continue looping until the assistant’s text contains a completion phrase such as “I have resolved the issue”, then treat the message containing that phrase as the final response to present",
			"Inspect stop_reason on each response: while it is “tool_use”, run the requested tools and return the results; when it is “end_turn”, present the final response",
			"Cap the loop at a fixed maximum iteration count and treat reaching the cap as the signal that the response is complete",
			"Stop the loop whenever a response contains a text block, since the model only produces text once it has finished calling tools",
		],
		correctAnswers: [1],
		explanation:
			"The agentic loop keys off stop_reason: “tool_use” means the model has requested tools and expects their results back; “end_turn” means it has finished reasoning and produced its answer. That signal is the designed termination mechanism.",
		source: {
			label: "Cert Pro Quest — practice bank by Matthew Purcell (not official exam content)",
			url: "https://cert-pro-quest.lovable.app/",
		},
		whyNot:
			"A parses natural language for a completion signal — a documented anti-pattern; C makes an arbitrary iteration cap the primary stopping mechanism when it should only be a safety valve; D fails because responses can contain both text and tool_use blocks mid-task.",
	},
	{
		id: "CPQ-ccarf-1.2",
		domain: "D1",
		question:
			"[Scenario 1: Customer Support Resolution Agent] The agent calls lookup_order and your code executes it successfully. How does the model actually receive the order data so it can reason about the next action?",
		options: [
			"The MCP server holds the open connection and streams the result straight back into the model’s active context as soon as execution completes",
			"The result is attached to the tool’s definition, which the model re-reads on its next inference pass",
			"Nothing is required — the API executes tools and incorporates results automatically",
			"Your code appends a tool result block referencing the tool call’s ID and sends the updated message history back in the next request",
		],
		correctAnswers: [3],
		explanation:
			"Tool execution is the harness's job: the loop appends the tool result to the conversation and re-invokes the model. That growing history is the only channel through which the model sees what tools returned.",
		source: {
			label: "Cert Pro Quest — practice bank by Matthew Purcell (not official exam content)",
			url: "https://cert-pro-quest.lovable.app/",
		},
		whyNot:
			"A and C describe automatic delivery mechanisms that do not exist — the API does not execute your tools or push results; B confuses static tool definitions with runtime results.",
	},
	{
		id: "CPQ-ccarf-1.3",
		domain: "D1",
		question:
			"[Scenario 1: Customer Support Resolution Agent] Company policy caps autonomous refunds at $500; larger refunds must go to a human. In testing, prompt instructions alone still let an occasional $650 refund through. What is the correct enforcement design?",
		options: [
			"Implement a hook that intercepts outgoing process_refund calls, blocking any amount above $500 and redirecting to the escalate_to_human workflow",
			"Move the $500 limit to the top of the system prompt, restate it in every user turn, and bold the amount so the model cannot miss it",
			"Lower the sampling temperature to zero so the agent applies the refund policy deterministically",
			"Add the limit to the process_refund tool description and its input schema so the model sees it both during selection and when constructing the call",
		],
		correctAnswers: [0],
		explanation:
			"Business rules with financial consequences need deterministic guarantees. A tool-call interception hook enforces the threshold in code — the violating call can never execute — while prompt-based approaches remain probabilistic.",
		source: {
			label: "Cert Pro Quest — practice bank by Matthew Purcell (not official exam content)",
			url: "https://cert-pro-quest.lovable.app/",
		},
		whyNot:
			"B and D improve the odds but retain a non-zero failure rate, which the scenario shows is unacceptable here; C makes token selection deterministic without making the policy binding — a compliance problem is not a sampling problem.",
	},
	{
		id: "CPQ-ccarf-1.4",
		domain: "D1",
		question:
			"[Scenario 1: Customer Support Resolution Agent] A customer writes one message containing three concerns: a refund for a damaged item, a shipping address change, and a missing loyalty credit. How should the agent handle this?",
		options: [
			"Resolve the refund first since it was raised first, then ask the customer whether they would like help with the remaining items",
			"Escalate to a human agent, since resolving several issues in one autonomous session risks partially completed work if any single item fails midway",
			"Decompose the message into three distinct items, investigate each against the shared customer context, then respond with one unified resolution",
			"Ask the customer which issue matters most and resolve only that one in this session",
		],
		correctAnswers: [2],
		explanation:
			"Multi-concern decomposition is the designed pattern: split the request into distinct items, investigate each against shared context, and respond once with a complete resolution — protecting first-contact resolution.",
		source: {
			label: "Cert Pro Quest — practice bank by Matthew Purcell (not official exam content)",
			url: "https://cert-pro-quest.lovable.app/",
		},
		whyNot:
			"A and D defer concerns the customer already stated, adding turns and harming FCR; B escalates work that is well within capability — partial-failure handling is the agent’s job, not a reason to avoid it.",
	},
	{
		id: "CPQ-ccarf-1.5",
		domain: "D1",
		question:
			"[Scenario 1: Customer Support Resolution Agent] The agent must escalate a complex billing dispute mid-process. The human agents receiving escalations do not have access to the conversation transcript. What should the escalation include?",
		options: [
			"The customer’s identity and issue category only, so the receiving human forms an independent view of the dispute without anchoring on the agent’s prior analysis",
			"A structured handoff summary: customer ID, the root cause analysis so far, relevant amounts and order numbers, and the agent's recommended action",
			"A conversation sentiment summary and an urgency rating, so the human can prioritize the case appropriately",
			"The complete raw tool results from the session, so the human has every piece of evidence the agent gathered",
		],
		correctAnswers: [1],
		explanation:
			"Structured handoff protocols exist precisely because the receiving human lacks the transcript: the summary transfers the case state — identity, findings, figures, and a recommendation — so the customer never has to start over.",
		source: {
			label: "Cert Pro Quest — practice bank by Matthew Purcell (not official exam content)",
			url: "https://cert-pro-quest.lovable.app/",
		},
		whyNot:
			"A discards the completed investigation in the name of fresh eyes and forces the customer to start over; C conveys mood and priority, not case state; D transfers unprocessed noise and leaves the analysis to be redone.",
	},
	{
		id: "CPQ-ccarf-1.6",
		domain: "D2",
		question:
			"[Scenario 1: Customer Support Resolution Agent] When process_refund fails for any reason, it currently returns the string “Operation failed.” The agent responds by retrying policy-blocked refunds and giving up on temporary outages — the opposite of correct. What is the fix?",
		options: [
			"Add a system prompt rule to retry any failed tool call twice with exponential backoff before escalating",
			"Catch failures inside the harness and retry them there, so the agent only ever sees successful results",
			"Log every failure with its category and cause to the decision store so recovery behavior can be analyzed and tuned from the analytics later",
			"Return structured error metadata: an errorCategory (transient / validation / business), an isRetryable boolean, and a short description",
		],
		correctAnswers: [3],
		explanation:
			"Uniform error strings deny the agent the information recovery decisions require. Structured metadata — category, retryability, description — lets it retry transient failures, explain business refusals, and stop wasting attempts on non-retryable errors.",
		source: {
			label: "Cert Pro Quest — practice bank by Matthew Purcell (not official exam content)",
			url: "https://cert-pro-quest.lovable.app/",
		},
		whyNot:
			"A hard-codes one recovery strategy for error types that need different ones; B hides business refusals the agent must explain to the customer — and retrying them is wrong anyway; C improves observability without giving the agent any signal at decision time.",
	},
	{
		id: "CPQ-ccarf-1.7",
		domain: "D2",
		question:
			"[Scenario 1: Customer Support Resolution Agent] A refund request violates the returns window policy. The tool rejects it. Which error response enables the agent to handle this correctly with the customer?",
		options: [
			"errorCategory: “business”, retriable: false, plus a customer-friendly explanation of the policy",
			"errorCategory: “validation”, prompting the agent to correct the request parameters and try again",
			"A success result with an empty refund object, letting the agent infer from the missing data that no refund was issued",
			"The policy engine’s full rejection payload, including internal rule identifiers, so no information is lost",
		],
		correctAnswers: [0],
		explanation:
			"Policy violations are business errors: non-retryable by definition, and best paired with an explanation the agent can relay. The retriable: false flag prevents wasted attempts; the friendly description powers the customer conversation.",
		source: {
			label: "Cert Pro Quest — practice bank by Matthew Purcell (not official exam content)",
			url: "https://cert-pro-quest.lovable.app/",
		},
		whyNot:
			"B mislabels a policy refusal as a fixable input problem, inviting futile reformulation of a request that policy will always reject; C is silent error suppression — an anti-pattern that turns failure into misinformation; D exposes internals the agent cannot use and should not repeat.",
	},
	{
		id: "CPQ-ccarf-1.8",
		domain: "D2",
		question:
			"[Scenario 1: Customer Support Resolution Agent] The agent frequently confuses get_customer and lookup_order; both currently carry one-line descriptions. Which TWO description changes most directly fix the misrouting? (Select TWO.)",
		options: [
			"Merge the two tools into a single customer_lookup tool that takes a mode parameter, so the model never has to choose between them",
			"Document each tool's expected input formats and add example queries it should handle",
			"Move the selection guidance into the system prompt instead, keeping the tool descriptions minimal",
			"Add boundary language — e.g., “use lookup_order when an order number is present; use get_customer to verify identity”",
			"Reorder the tool list so the most frequently needed tool appears first, since models weight earlier tools more heavily",
		],
		correctAnswers: [1, 3],
		explanation:
			"Descriptions are the primary selection mechanism. Input formats plus example queries show each tool's territory; explicit boundary language resolves precisely the overlap causing the misrouting.",
		source: {
			label: "Cert Pro Quest — practice bank by Matthew Purcell (not official exam content)",
			url: "https://cert-pro-quest.lovable.app/",
		},
		whyNot:
			"A trades a visible selection problem for a hidden mode-selection problem inside one overloaded tool; C moves the signal away from where selection happens — descriptions are what the model reads at selection time; E relies on ordering effects that are not a dependable selection mechanism.",
		selectCount: 2,
	},
	{
		id: "CPQ-ccarf-1.9",
		domain: "D5",
		question:
			"[Scenario 1: Customer Support Resolution Agent] A customer's first message is: “I want to speak to a human. Do not try to fix this yourself.” The issue looks like a routine replacement the agent could resolve. What should the agent do?",
		options: [
			"Attempt resolution first, escalating only if the attempt fails",
			"Run sentiment analysis and escalate only if frustration exceeds a threshold",
			"Escalate immediately, honoring the explicit request without first attempting investigation",
			"Acknowledge the request, but first gather the order details so the human receives a complete handoff package",
		],
		correctAnswers: [2],
		explanation:
			"Explicit customer demands for a human are a first-class escalation trigger, honored immediately. Overriding a stated preference to demonstrate capability damages trust regardless of how resolvable the issue looks.",
		source: {
			label: "Cert Pro Quest — practice bank by Matthew Purcell (not official exam content)",
			url: "https://cert-pro-quest.lovable.app/",
		},
		whyNot:
			"A and D both continue working a case the customer explicitly closed to the agent — even investigation “for the handoff” overrides the instruction; B substitutes an unreliable proxy (sentiment) for a signal that could not be clearer — the customer already said the words.",
	},
	{
		id: "CPQ-ccarf-1.10",
		domain: "D5",
		question:
			"[Scenario 1: Customer Support Resolution Agent] In long multi-issue sessions, the agent's later responses misquote refund amounts and order numbers because earlier details were condensed into vague summaries, while each lookup_order result dumps 40+ fields into context. Which TWO changes address this? (Select TWO.)",
		options: [
			"Extract transactional facts — amounts, dates, order numbers — into a persistent case-facts block outside the summarized history",
			"Increase max_tokens on each request so the model has room to restate all case details in every response",
			"Summarize after every turn rather than only at the context threshold, so the summaries stay continuously fresh",
			"Trim each tool result to only the fields relevant to the current issue before it enters context",
			"Instruct the model to quote amounts and order numbers only from the most recent summary, never from earlier raw history",
		],
		correctAnswers: [0, 3],
		explanation:
			"The paired fix: protect precise transactional facts from lossy summarization by persisting them in a dedicated block, and stop the bloat at its source by trimming verbose tool outputs to relevant fields before they accumulate.",
		source: {
			label: "Cert Pro Quest — practice bank by Matthew Purcell (not official exam content)",
			url: "https://cert-pro-quest.lovable.app/",
		},
		whyNot:
			"B lengthens outputs without protecting what enters context; C compresses more often — intensifying the exact failure mode; E anchors the agent to the lossy summaries that caused the misquotes.",
		selectCount: 2,
	},
	{
		id: "CPQ-ccarf-2.1",
		domain: "D3",
		question:
			"[Scenario 2: Code Generation with Claude Code] You have a personal /scratch-notes slash command you use constantly, but it reflects your own workflow and should not appear for teammates when they pull the repository. Where does the command file belong?",
		options: [
			"In .claude/commands/ in the repository, with a naming prefix so teammates know to ignore it",
			"In the root CLAUDE.md under a # Commands heading",
			"In ~/.claude/commands/ in your home directory",
			"In .claude/rules/ with a paths glob matching your username",
		],
		correctAnswers: [2],
		explanation:
			"Command scoping mirrors intent: ~/.claude/commands/ holds personal commands visible only to you, while .claude/commands/ in the repo is shared with everyone via version control. A personal workflow tool belongs in the former.",
		source: {
			label: "Cert Pro Quest — practice bank by Matthew Purcell (not official exam content)",
			url: "https://cert-pro-quest.lovable.app/",
		},
		whyNot:
			"A still ships the command to every clone — a naming convention does not scope visibility; B is project context, not a command definition mechanism; D misuses path-scoped rules, which condition on edited file paths, not identity.",
	},
	{
		id: "CPQ-ccarf-2.2",
		domain: "D3",
		question:
			"[Scenario 2: Code Generation with Claude Code] Your /analyze-architecture skill produces thousands of lines of exploration output that pollute the main conversation, crowding out the task you actually wanted help with. Which SKILL.md frontmatter option fixes this?",
		options: [
			"argument-hint, so invocations are scoped to a narrower analysis target that produces less output",
			"context: fork, which runs the skill in an isolated sub-agent context and returns only its result",
			"allowed-tools, restricting the skill to read-only operations so it generates less output",
			"paths, so the skill loads only for architecture files and skips the rest of the tree",
		],
		correctAnswers: [1],
		explanation:
			"context: fork exists for exactly this: verbose or exploratory skills run in their own isolated context, and the main session receives the distilled result rather than the full exploration transcript.",
		source: {
			label: "Cert Pro Quest — practice bank by Matthew Purcell (not official exam content)",
			url: "https://cert-pro-quest.lovable.app/",
		},
		whyNot:
			"A and D narrow what the skill examines, not where its output accumulates; C governs which tools the skill may use — read-only exploration is exactly what is flooding the context.",
	},
	{
		id: "CPQ-ccarf-2.3",
		domain: "D3",
		question:
			"[Scenario 2: Code Generation with Claude Code] You are writing a /scaffold-component skill that generates boilerplate files. You want a guarantee it can create files but can never run shell commands, no matter what its instructions are asked to do. How do you enforce this?",
		options: [
			"State “never run Bash” prominently in the SKILL.md instructions",
			"Add a pre-execution validation hook that scans the skill’s rendered instructions for shell commands before every run",
			"Run the skill only in plan mode, where commands are proposed but not executed",
			"Set allowed-tools in the SKILL.md frontmatter to the file-write tools the skill needs, omitting Bash",
		],
		correctAnswers: [3],
		explanation:
			"allowed-tools is the enforcement mechanism: frontmatter-declared tool restrictions bound what the skill can invoke during execution — a configuration guarantee rather than an instruction the model might not follow.",
		source: {
			label: "Cert Pro Quest — practice bank by Matthew Purcell (not official exam content)",
			url: "https://cert-pro-quest.lovable.app/",
		},
		whyNot:
			"A is prompt-level guidance with a non-zero failure rate; B inspects instructions when the risk is what the skill invokes at runtime; C changes the execution workflow but is not a per-skill tool restriction.",
	},
	{
		id: "CPQ-ccarf-2.4",
		domain: "D3",
		question:
			"[Scenario 2: Code Generation with Claude Code] A new teammate's Claude Code sessions ignore the team's coding standards. You discover the standards live in your own ~/.claude/CLAUDE.md. What is the correct fix, and how do you verify it?",
		options: [
			"Move the standards into the project-level CLAUDE.md checked into the repository, and use the /memory command to verify what a session loaded",
			"Have the teammate copy your ~/.claude/CLAUDE.md into their own home directory on their machine, then verify with /memory that the file loaded",
			"Add the standards to .claude/settings.json, which is checked in and applied to every teammate’s sessions",
			"Publish the standards as a /standards slash command teammates run at the start of each session",
		],
		correctAnswers: [0],
		explanation:
			"User-level configuration applies only to that user — it never travels via version control. Team standards belong at project level, and /memory is the diagnostic that shows exactly which memory files a session loaded.",
		source: {
			label: "Cert Pro Quest — practice bank by Matthew Purcell (not official exam content)",
			url: "https://cert-pro-quest.lovable.app/",
		},
		whyNot:
			"B works once, then drifts with every future edit — hand-copied configuration is unshared configuration; C misuses settings.json, which carries permissions and tool settings, not standards prose; D makes always-relevant standards opt-in and forgettable.",
	},
	{
		id: "CPQ-ccarf-2.5",
		domain: "D3",
		question:
			"[Scenario 2: Code Generation with Claude Code] The project's CLAUDE.md has grown to 2,000 lines covering testing, API conventions, deployment, and styling; sessions load it all regardless of task. What is the recommended reorganization?",
		options: [
			"Trim the file to a concise 200-line summary of the most important conventions and rely on the model to infer the details",
			"Move everything to each developer's user-level CLAUDE.md",
			"Split it into topic-specific files in .claude/rules/ (e.g., testing.md, api-conventions.md, deployment.md), path-scoped where relevant",
			"Convert the entire file into a set of slash commands that developers run manually when a topic becomes relevant",
		],
		correctAnswers: [2],
		explanation:
			"The .claude/rules/ directory is the modular alternative to a monolithic CLAUDE.md: focused topic files, with YAML path scoping where rules should load only for matching files — less irrelevant context, easier maintenance.",
		source: {
			label: "Cert Pro Quest — practice bank by Matthew Purcell (not official exam content)",
			url: "https://cert-pro-quest.lovable.app/",
		},
		whyNot:
			"A discards the specifics that make conventions enforceable; B unshares team configuration and guarantees divergence; D makes always-relevant standards opt-in and forgettable.",
	},
	{
		id: "CPQ-ccarf-2.6",
		domain: "D1",
		question:
			"[Scenario 2: Code Generation with Claude Code] Yesterday you ran a long investigation into a memory leak in a session you named leak-hunt. Today you want to continue exactly where that investigation left off. What do you run?",
		options: [
			"claude --continue, which reopens the most recent session in the current directory",
			"claude --resume leak-hunt, resuming the named session with its context",
			"claude -p “continue the leak investigation”",
			"A new session in the same directory, relying on CLAUDE.md to restore the investigation’s context",
		],
		correctAnswers: [1],
		explanation:
			"Named session resumption is the mechanism for continuing specific prior work: --resume <session-name> restores that conversation's context so the investigation picks up where it stopped.",
		source: {
			label: "Cert Pro Quest — practice bank by Matthew Purcell (not official exam content)",
			url: "https://cert-pro-quest.lovable.app/",
		},
		whyNot:
			"A reopens whichever session is most recent — only the investigation if nothing else has run since; C starts a fresh non-interactive run with no memory of yesterday; D restores project conventions, not the investigation’s discovered context.",
	},
	{
		id: "CPQ-ccarf-2.7",
		domain: "D1",
		question:
			"[Scenario 2: Code Generation with Claude Code] You have completed a thorough analysis of a module and now want to compare two competing refactoring strategies — developing each independently from that same analysis baseline without the explorations contaminating each other. Which capability fits?",
		options: [
			"Run both strategies sequentially in the same session, asking Claude to forget the first before starting the second",
			"Open two brand-new sessions and paste the analysis conclusions into each as the first message",
			"Use /compact between the two strategies",
			"Use fork_session to create two independent branches from the shared analysis baseline",
		],
		correctAnswers: [3],
		explanation:
			"fork_session exists for divergent exploration: both branches inherit the completed analysis, then evolve independently — clean comparison without re-paying the analysis cost or cross-contaminating approaches.",
		source: {
			label: "Cert Pro Quest — practice bank by Matthew Purcell (not official exam content)",
			url: "https://cert-pro-quest.lovable.app/",
		},
		whyNot:
			"A is impossible — context cannot be selectively forgotten on request; B approximates the baseline with a lossy manual summary and sets it up twice — forking carries the full analysis into both branches; C compresses context within one session, it does not branch it.",
	},
	{
		id: "CPQ-ccarf-2.8",
		domain: "D1",
		question:
			"[Scenario 2: Code Generation with Claude Code] You want to resume last week's refactoring session, but since then the team has merged substantial changes across the files it analyzed, so most of its tool results now describe code that no longer exists. What is the reliable approach?",
		options: [
			"Start a new session seeded with a structured summary of the prior conclusions, since the stale tool results make resumption unreliable",
			"Resume the session as-is; Claude automatically detects file changes",
			"Resume the session and run /compact first, so the stale tool results are compressed before any new work begins",
			"Resume the session and ask Claude to re-read each changed file, correcting its stale understanding incrementally as it goes",
		],
		correctAnswers: [0],
		explanation:
			"The resumption tradeoff: resume when prior context is mostly valid; start fresh with an injected summary when tool results have gone stale. Heavily changed files put this squarely in the second case — keep the conclusions, discard the outdated evidence.",
		source: {
			label: "Cert Pro Quest — practice bank by Matthew Purcell (not official exam content)",
			url: "https://cert-pro-quest.lovable.app/",
		},
		whyNot:
			"B assumes an automatic re-verification that does not happen — stale results sit in context as if true; C compresses the stale evidence, but a compacted falsehood is still false; D leaves contradictory old and new file states in one context and invites the model to blend them — workable for minor drift, not substantial change.",
	},
	{
		id: "CPQ-ccarf-2.9",
		domain: "D5",
		question:
			"[Scenario 2: Code Generation with Claude Code] Mid-way through an extended exploration session, context is filling with verbose discovery output and responses are noticeably degrading, but you are not ready to end the session. Which built-in command helps immediately?",
		options: [
			"/memory, which reloads the memory files into the session and refreshes context",
			"/rewind, which rolls the session back to a checkpoint before the verbose exploration began",
			"/compact, which compacts the conversation into a summary so the session can continue",
			"/rules, which reloads the rule files",
		],
		correctAnswers: [2],
		explanation:
			"/compact is the in-session relief valve for exactly this situation: it compacts accumulated context — typically bloated with verbose discovery output — so an extended session can continue without degradation.",
		source: {
			label: "Cert Pro Quest — practice bank by Matthew Purcell (not official exam content)",
			url: "https://cert-pro-quest.lovable.app/",
		},
		whyNot:
			"A manages memory files — diagnostic and loading, not cleanup; B discards the discoveries made since that point along with the noise; D does not address conversation bloat.",
	},
	{
		id: "CPQ-ccarf-2.10",
		domain: "D5",
		question:
			"[Scenario 2: Code Generation with Claude Code] During multi-hour codebase exploration sessions, the agent starts answering from “typical patterns” instead of the specific classes it discovered earlier. Which TWO practices counteract this context degradation? (Select TWO.)",
		options: [
			"Switch to a model with a larger context window and continue accumulating",
			"Maintain a scratchpad file recording key findings as they are discovered, and have the agent reference it for subsequent questions",
			"Periodically paste the full list of discovered classes and their relationships back into the conversation to refresh them",
			"Add a system prompt instruction to always answer from discovered code rather than general knowledge",
			"Delegate verbose investigation to subagents that return summaries, keeping the main session’s context for coordination",
		],
		correctAnswers: [1, 4],
		explanation:
			"Both practices manage what occupies the context: a scratchpad persists precise findings outside the degrading conversation, and subagent delegation keeps verbose exploration out of the main window entirely, returning only distilled summaries.",
		source: {
			label: "Cert Pro Quest — practice bank by Matthew Purcell (not official exam content)",
			url: "https://cert-pro-quest.lovable.app/",
		},
		whyNot:
			"A postpones the same degradation at higher cost; C re-adds bulk to an already saturated context instead of externalizing it; D instructs the behavior without restoring the degraded signal the instruction depends on.",
		selectCount: 2,
	},
	{
		id: "CPQ-ccarf-3.1",
		domain: "D1",
		question:
			"[Scenario 3: Multi-Agent Research System] Your coordinator's system prompt tells it to delegate research to subagents, but at runtime it never spawns any — it attempts all the research itself. Its configuration restricts it to research-planning tools. What is the most likely cause?",
		options: [
			"The coordinator’s model tier lacks the reasoning depth that multi-agent delegation requires",
			"The subagents’ AgentDefinition descriptions are too vague for the coordinator to match tasks against them",
			"The system prompt describes delegation in general terms but never names the specific subagents to use",
			"The coordinator's allowedTools does not include “Task”",
		],
		correctAnswers: [3],
		explanation:
			"Subagent spawning happens through the Task tool. A coordinator whose allowedTools omits “Task” has no mechanism to delegate, no matter how clearly its prompt describes the intention — capability configuration trumps instruction.",
		source: {
			label: "Cert Pro Quest — practice bank by Matthew Purcell (not official exam content)",
			url: "https://cert-pro-quest.lovable.app/",
		},
		whyNot:
			"A, B, and C look for the failure in capability, matching, or prompt specificity — but with no Task tool available, delegation is impossible no matter how well those are tuned.",
	},
	{
		id: "CPQ-ccarf-3.2",
		domain: "D1",
		question:
			"[Scenario 3: Multi-Agent Research System] The web search subagent gathers excellent findings, but the synthesis subagent's reports are generic and reference none of them. The coordinator invokes synthesis with the prompt “Synthesize the research findings.” What is wrong?",
		options: [
			"The synthesis agent's model needs extended thinking enabled",
			"Subagents do not inherit the coordinator’s conversation history — the findings must be passed explicitly in the synthesis prompt",
			"The synthesis agent needs web search tools to gather its own findings",
			"The synthesis subagent’s output schema is too loose, allowing it to produce generic prose instead of sections grounded in the findings",
		],
		correctAnswers: [1],
		explanation:
			"Subagent context isolation is the rule: each subagent sees only what its prompt contains. “The research findings” refers to material the synthesis agent has never seen — the coordinator must pass the findings explicitly.",
		source: {
			label: "Cert Pro Quest — practice bank by Matthew Purcell (not official exam content)",
			url: "https://cert-pro-quest.lovable.app/",
		},
		whyNot:
			"A adds reasoning capacity over an empty input; C duplicates the search agent’s role instead of fixing the handoff; D constrains the shape of the output when the problem is an empty input.",
	},
	{
		id: "CPQ-ccarf-3.3",
		domain: "D1",
		question:
			"[Scenario 3: Multi-Agent Research System] The coordinator currently invokes the web search subagent, waits for completion, then invokes the document analysis subagent — doubling research latency even though the two tasks are independent. How do you run them in parallel?",
		options: [
			"Have the coordinator emit both Task tool calls in a single response",
			"Enable streaming on both subagent invocations so their outputs interleave as they are produced",
			"Move both subagents to a faster model tier, cutting each task’s individual latency",
			"Have the search subagent spawn the document analysis subagent itself once its own work completes",
		],
		correctAnswers: [0],
		explanation:
			"Parallel spawning is achieved by emitting multiple Task tool calls in one coordinator response rather than across separate turns — independent workstreams then execute concurrently.",
		source: {
			label: "Cert Pro Quest — practice bank by Matthew Purcell (not official exam content)",
			url: "https://cert-pro-quest.lovable.app/",
		},
		whyNot:
			"B changes delivery, not scheduling; C shortens each task but still runs them end to end; D re-creates the sequential dependency one level down — the second Task still waits for the first.",
	},
	{
		id: "CPQ-ccarf-3.4",
		domain: "D1",
		question:
			"[Scenario 3: Multi-Agent Research System] Your coordinator gives subagents rigid step-by-step procedures (“run these exact five queries in this order”). Subagents fail whenever a topic doesn't fit the script. How should coordinator prompts be designed instead?",
		options: [
			"Make the procedures longer, covering more contingencies explicitly",
			"Give subagents the research goal only, omitting quality criteria so nothing unnecessarily constrains the approach they take",
			"Specify research goals and quality criteria — what a complete answer looks like — and let the subagent adapt its approach",
			"Route off-script topics back to the coordinator, which issues a revised procedure for each one",
		],
		correctAnswers: [2],
		explanation:
			"Goal-and-criteria prompts preserve subagent adaptability: the coordinator defines success, the subagent chooses the path — which is why the agent (not a fixed script) is there at all.",
		source: {
			label: "Cert Pro Quest — practice bank by Matthew Purcell (not official exam content)",
			url: "https://cert-pro-quest.lovable.app/",
		},
		whyNot:
			"A is an arms race against topic variety that scripts always lose; B removes the definition of success along with the script; D turns every novel topic into a coordinator round trip — the adaptability belongs in the subagent.",
	},
	{
		id: "CPQ-ccarf-3.5",
		domain: "D1",
		question:
			"[Scenario 3: Multi-Agent Research System] Completed reports are coherent but shallow on some subtopics. You want the system to notice and repair its own coverage gaps before finalizing. Which orchestration pattern achieves this?",
		options: [
			"Add a final review subagent that scores each report’s quality and appends its assessment and identified weaknesses to the output",
			"An iterative loop: evaluate the synthesis for coverage gaps, re-delegate targeted research, and re-synthesize until coverage is sufficient",
			"Ask the report generation agent to pad thin sections with general knowledge",
			"Always run every subagent exactly twice regardless of output quality",
		],
		correctAnswers: [1],
		explanation:
			"Iterative refinement closes the quality loop: evaluate coverage, dispatch targeted follow-up research where gaps exist, re-synthesize — repeating until the report meets criteria rather than hoping the first pass suffices.",
		source: {
			label: "Cert Pro Quest — practice bank by Matthew Purcell (not official exam content)",
			url: "https://cert-pro-quest.lovable.app/",
		},
		whyNot:
			"A measures the defect and ships it anyway — detection without a repair loop changes nothing; C fills gaps with uncited generalities — the opposite of a cited research product; D doubles cost blindly with no gap detection to aim the second pass.",
	},
	{
		id: "CPQ-ccarf-3.6",
		domain: "D2",
		question:
			"[Scenario 3: Multi-Agent Research System] Every subagent currently receives the full 18-tool catalog. Logs show the synthesis agent attempting web searches and the search agent trying document parsing — with frequent wrong-tool selections everywhere. What is the correct redesign?",
		options: [
			"Add a routing tool the agents call first, which returns the name of the correct tool to use",
			"Group the catalog by category, adding a category header to each tool’s description",
			"Write longer system prompts warning each agent about the tools it should ignore",
			"Scope each subagent’s tool set to its role — a handful of relevant tools each",
		],
		correctAnswers: [3],
		explanation:
			"Tool distribution is an architectural control: agents choose more reliably among 4–5 role-relevant tools than among 18, and tools outside an agent's specialization are misused precisely because they are available.",
		source: {
			label: "Cert Pro Quest — practice bank by Matthew Purcell (not official exam content)",
			url: "https://cert-pro-quest.lovable.app/",
		},
		whyNot:
			"A adds a selection step to solve a selection problem — and the router itself must now be chosen correctly; B reorganizes the same oversized inventory; C asks prompts to fight an inventory problem configuration should fix.",
	},
	{
		id: "CPQ-ccarf-3.7",
		domain: "D2",
		question:
			"[Scenario 3: Multi-Agent Research System] Subagents burn many tool calls just discovering what data exists — listing available document collections, probing for issue summaries, checking what schemas are present — before real work begins. Which MCP capability reduces this?",
		options: [
			"Expose content catalogs (document hierarchies, issue summaries, schema listings) as MCP resources",
			"Increase the tool-call budget so exploration is affordable",
			"Hard-code the current data inventory into every system prompt",
			"Add a describe_available_data tool that every agent calls once at startup to fetch the current inventory",
		],
		correctAnswers: [0],
		explanation:
			"MCP resources exist for exactly this: exposing catalogs of available content so agents start informed. Discovery becomes a lookup instead of a spelunking expedition of exploratory calls.",
		source: {
			label: "Cert Pro Quest — practice bank by Matthew Purcell (not official exam content)",
			url: "https://cert-pro-quest.lovable.app/",
		},
		whyNot:
			"B pays for the inefficiency rather than removing it; C goes stale the moment the data changes; D rebuilds the same capability as a bespoke tool — resources are the protocol’s designed primitive for exposing content catalogs.",
	},
	{
		id: "CPQ-ccarf-3.8",
		domain: "D5",
		question:
			"[Scenario 3: Multi-Agent Research System] Final reports state findings but cite nothing. Investigation shows each summarization step compresses source attribution away, so by synthesis time nobody knows which claim came from where. What is the structural fix?",
		options: [
			"Have the report generator add plausible citations at the end",
			"Instruct each summarizer to append a bibliography of every source it consulted to the end of its summary output",
			"Require subagents to output structured claim-source mappings that every downstream agent preserves through synthesis",
			"Reduce the number of summarization steps to one",
		],
		correctAnswers: [2],
		explanation:
			"Provenance survives only if it is structural: claim-source mappings travel as data through every hop, so synthesis merges attributed claims instead of anonymous assertions. Attribution is preserved, never reconstructed.",
		source: {
			label: "Cert Pro Quest — practice bank by Matthew Purcell (not official exam content)",
			url: "https://cert-pro-quest.lovable.app/",
		},
		whyNot:
			"A invents citations — worse than none in a research product; B lists what was read without binding sources to claims — attribution still cannot be reconstructed; D reduces compression events but the remaining one still strips attribution.",
	},
	{
		id: "CPQ-ccarf-3.9",
		domain: "D5",
		question:
			"[Scenario 3: Multi-Agent Research System] Two credible sources report different figures for the same market's size, and one subagent's summary simply picked the larger number. Which TWO practices produce correct handling of conflicting source data? (Select TWO.)",
		options: [
			"Annotate the conflict explicitly — both values with their sources — and let the coordinator reconcile before synthesis",
			"Average the two figures into a single compromise value",
			"Always adopt the more recent source and discard the other",
			"Require publication or data-collection dates in subagents’ structured outputs",
			"Have the subagent rank the two sources by credibility and report only the figure from the higher-ranked source",
		],
		correctAnswers: [0, 3],
		explanation:
			"Conflicts are information: preserve both values with attribution and surface the disagreement for deliberate reconciliation — and carry dates in structured output, since “conflicting” figures often just measure different moments.",
		source: {
			label: "Cert Pro Quest — practice bank by Matthew Purcell (not official exam content)",
			url: "https://cert-pro-quest.lovable.app/",
		},
		whyNot:
			"B invents a number no source reported; C automates a reconciliation that needs judgment — recency is context, not an override rule; E performs the same silent selection with a credibility veneer — the conflict itself is the information to surface.",
		selectCount: 2,
	},
	{
		id: "CPQ-ccarf-3.10",
		domain: "D5",
		question:
			"[Scenario 3: Multi-Agent Research System] You are designing how the web search subagent behaves when its searches fail or return nothing. Which TWO behaviors are correct? (Select TWO.)",
		options: [
			"On any failure, halt the workflow and surface the error to the operator, since partial research risks a misleading report",
			"Attempt local recovery for transient failures, and propagate unresolvable errors to the coordinator with any partial results",
			"Return empty results marked as success when a search fails, so downstream agents degrade gracefully instead of halting",
			"Standardize all failures to a single “search unavailable” status so the coordinator’s error handling stays simple",
			"Distinguish access failures (timeouts, service errors) from valid empty results (successful queries with no matches)",
		],
		correctAnswers: [1, 4],
		explanation:
			"Resilient error propagation is layered and honest: handle locally what is locally fixable, escalate the rest with context the coordinator can act on, and never conflate “the search broke” with “the search found nothing.”",
		source: {
			label: "Cert Pro Quest — practice bank by Matthew Purcell (not official exam content)",
			url: "https://cert-pro-quest.lovable.app/",
		},
		whyNot:
			"A makes any single failure fatal when partial-result strategies exist; C is silent suppression — failure dressed as fact; D simplifies away the very context recovery decisions need.",
		selectCount: 2,
	},
	{
		id: "CPQ-ccarf-4.1",
		domain: "D2",
		question:
			"[Scenario 4: Developer Productivity with Claude] The agent must (a) locate every file matching the test naming convention anywhere in the repo, and (b) find every place the string “PaymentDeclinedError” appears in code. Which TWO tool selections are correct? (Select TWO.)",
		options: [
			"Glob with a pattern like **/*.test.tsx for the test files",
			"Grep with a filename pattern to find the test files",
			"Grep for “PaymentDeclinedError” in file contents",
			"Glob for “PaymentDeclinedError” across file contents",
			"Bash running grep -r for both tasks, since shell tools cover paths and contents alike",
		],
		correctAnswers: [0, 2],
		explanation:
			"The division of labor is clean: Glob matches file paths against patterns (names, extensions, directories); Grep searches file contents for patterns (identifiers, error strings, imports). Each task maps to exactly one of them.",
		source: {
			label: "Cert Pro Quest — practice bank by Matthew Purcell (not official exam content)",
			url: "https://cert-pro-quest.lovable.app/",
		},
		whyNot:
			"B and D swap the tools into each other’s territory; E works mechanically but bypasses the purpose-built tools whose structured output the agent consumes — and expresses the path-pattern match poorly.",
		selectCount: 2,
	},
	{
		id: "CPQ-ccarf-4.2",
		domain: "D2",
		question:
			"[Scenario 4: Developer Productivity with Claude] The agent attempts an Edit on a legacy file and fails: the anchor text it targeted appears in six places, so the unique-match requirement cannot be satisfied. What is the standard fallback?",
		options: [
			"Delete five of the six occurrences so the match becomes unique",
			"Run the Edit with a replace-all option so all six occurrences are updated together",
			"Switch to Bash and modify the file with sed",
			"Use Read to load the full file, then Write the complete modified content",
		],
		correctAnswers: [3],
		explanation:
			"Edit depends on unique text matching; when a file's repetitive structure defeats that, Read + Write performs the modification reliably on the whole file. It is the documented fallback for exactly this failure.",
		source: {
			label: "Cert Pro Quest — practice bank by Matthew Purcell (not official exam content)",
			url: "https://cert-pro-quest.lovable.app/",
		},
		whyNot:
			"A mutilates code to satisfy the tool; B changes all six sites when only one should change; C swaps a controlled file operation for fragile stream editing.",
	},
	{
		id: "CPQ-ccarf-4.3",
		domain: "D2",
		question:
			"[Scenario 4: Developer Productivity with Claude] Asked how the billing module works, the agent Reads dozens of files upfront and exhausts its context before answering. What is the correct exploration strategy for building codebase understanding?",
		options: [
			"Read files in alphabetical order and stop at the context limit",
			"Work incrementally: Grep to find entry points, then Read selectively to trace flows from those anchors",
			"Read the module’s entry-point file in full and answer from that single file’s contents",
			"Read only the README and inline docstrings, reasoning from the documentation rather than the implementation",
		],
		correctAnswers: [1],
		explanation:
			"Incremental exploration is the pattern: search first to find where the relevant code lives, then read narrowly along the traced paths. Context is spent on the files that matter rather than on everything alphabetically prior to them.",
		source: {
			label: "Cert Pro Quest — practice bank by Matthew Purcell (not official exam content)",
			url: "https://cert-pro-quest.lovable.app/",
		},
		whyNot:
			"A spends the budget by filename accident; C stops at the front door — billing logic rarely lives in one file; D trusts documentation to describe code accurately — in a legacy system, a famous last assumption.",
	},
	{
		id: "CPQ-ccarf-4.4",
		domain: "D2",
		question:
			"[Scenario 4: Developer Productivity with Claude] The team shares a GitHub MCP server that needs an auth token, and you also run a personal, experimental MCP server you don't want to impose on anyone. How should these be configured?",
		options: [
			// biome-ignore lint/suspicious/noTemplateCurlyInString: literal content from source bank
			"The shared server in project-scoped .mcp.json with env-var expansion (${GITHUB_TOKEN}) keeping the secret out; the personal one in ~/.claude.json",
			"Both servers in .mcp.json, with the token pasted in so teammates don't have to set variables",
			"Both servers in ~/.claude.json, with the shared server’s full setup and token handling documented in the team wiki for everyone to replicate",
			"The shared server in CLAUDE.md and the personal one in .claude/commands/",
		],
		correctAnswers: [0],
		explanation:
			// biome-ignore lint/suspicious/noTemplateCurlyInString: literal content from source bank
			"Scoping follows audience: project .mcp.json distributes team tooling via version control, with ${VAR} expansion keeping credentials out of the repo; ~/.claude.json holds personal and experimental servers that stay yours.",
		source: {
			label: "Cert Pro Quest — practice bank by Matthew Purcell (not official exam content)",
			url: "https://cert-pro-quest.lovable.app/",
		},
		whyNot:
			"B commits a live secret to version control; C makes shared infrastructure a manual wiki chore that drifts; D puts server configuration in files that don't configure servers.",
	},
	{
		id: "CPQ-ccarf-4.5",
		domain: "D3",
		question:
			"[Scenario 4: Developer Productivity with Claude] Two tasks arrive: fixing an off-by-one bug in one function with a clear stack trace, and migrating the codebase's HTTP library — touching 45+ files with several viable approaches. How should plan mode and direct execution be assigned?",
		options: [
			"Plan mode for both, since reviewing a plan before execution reduces risk on any change",
			"Direct execution for both, since plan mode adds a review step without changing anything about what ultimately gets written",
			"Direct execution for the well-scoped single-file bug fix; plan mode for the 45-file migration with several viable approaches",
			"Plan mode for the bug fix and direct execution for the migration",
		],
		correctAnswers: [2],
		explanation:
			"The assignment rule: direct execution for simple, well-scoped changes; plan mode where scale, architectural implications, or competing approaches make design-before-commitment valuable — like a 45-file migration.",
		source: {
			label: "Cert Pro Quest — practice bank by Matthew Purcell (not official exam content)",
			url: "https://cert-pro-quest.lovable.app/",
		},
		whyNot:
			"A taxes a trivial fix with ceremony; B invites costly rework by executing a large migration unplanned; D inverts the rule on both tasks.",
	},
	{
		id: "CPQ-ccarf-4.6",
		domain: "D3",
		question:
			"[Scenario 4: Developer Productivity with Claude] Developers keep invoking your /generate-fixture skill bare, without the entity type and record count it needs, then get confused by the results. Which frontmatter option addresses this?",
		options: [
			"context: fork, isolating the confusion in a subagent",
			"allowed-tools, restricting what the skill can touch",
			"A more detailed description block documenting the required parameters and their defaults",
			"argument-hint, which prompts for the required parameters when the skill is invoked bare",
		],
		correctAnswers: [3],
		explanation:
			"argument-hint is the frontmatter mechanism for exactly this: skills that need parameters can prompt for them on bare invocation instead of running underspecified.",
		source: {
			label: "Cert Pro Quest — practice bank by Matthew Purcell (not official exam content)",
			url: "https://cert-pro-quest.lovable.app/",
		},
		whyNot:
			"A isolates output, not input requirements; B constrains tools, not arguments; C documents the parameters for whoever reads the docs — the invocation still runs bare.",
	},
	{
		id: "CPQ-ccarf-4.7",
		domain: "D3",
		question:
			"[Scenario 4: Developer Productivity with Claude] You must decide where two things live: (1) the team's universal coding standards that should shape every session, and (2) a multi-step release-notes workflow used a few times per month. What is the correct placement?",
		options: [
			"Both as skills in .claude/skills/, so each loads only when its context is relevant to the session at hand",
			"Standards in CLAUDE.md, always loaded; the release-notes workflow as a skill in .claude/skills/, invoked on demand",
			"Both in CLAUDE.md so nothing is ever missed",
			"Standards as a skill; the release workflow in CLAUDE.md",
		],
		correctAnswers: [1],
		explanation:
			"The dividing line: CLAUDE.md for universal, always-relevant standards; skills for on-demand, task-specific workflows. Each mechanism carries the load it was designed for.",
		source: {
			label: "Cert Pro Quest — practice bank by Matthew Purcell (not official exam content)",
			url: "https://cert-pro-quest.lovable.app/",
		},
		whyNot:
			"A makes universal standards opt-in — sessions that never invoke the skill never see them; C loads a monthly workflow into every session’s context forever; D inverts both placements.",
	},
	{
		id: "CPQ-ccarf-4.8",
		domain: "D1",
		question:
			"[Scenario 4: Developer Productivity with Claude] The task is open-ended: “add comprehensive tests to this legacy codebase.” Nobody knows yet where the risk concentrates or what depends on what. Which decomposition approach fits?",
		options: [
			"First map the codebase structure, identify high-impact areas, then create a prioritized plan that adapts as surprises emerge",
			"Write tests file-by-file in directory order, guaranteeing complete coverage by the end",
			"Generate the full test suite in one comprehensive request so coverage decisions are made with the whole codebase in view",
			"Prioritize the code with the most recent commits, since active code is where regressions surface",
		],
		correctAnswers: [0],
		explanation:
			"Open-ended tasks call for adaptive decomposition: understand the terrain, prioritize by impact, and let the plan evolve with what each step reveals — the opposite of a fixed pipeline chosen before anything is known.",
		source: {
			label: "Cert Pro Quest — practice bank by Matthew Purcell (not official exam content)",
			url: "https://cert-pro-quest.lovable.app/",
		},
		whyNot:
			"B spends effort by directory-listing order rather than risk; C asks one pass to do what requires discovery; D uses recency as a proxy for importance — legacy risk often lives in old, untouched code.",
	},
	{
		id: "CPQ-ccarf-4.9",
		domain: "D1",
		question:
			"[Scenario 4: Developer Productivity with Claude] You are choosing decomposition strategies for two workflows: a code review that always checks the same five aspects, and a production-incident investigation whose next step depends on what each finding reveals. Which pairing is right?",
		options: [
			"Dynamic decomposition for both — adaptive plans subsume fixed ones, so the flexibility costs nothing in practice",
			"Prompt chaining for both — fixed steps are reproducible and easier to regression-test",
			"Prompt chaining for the predictable five-aspect review; dynamic adaptive decomposition for the investigation",
			"Dynamic decomposition for the review; prompt chaining for the investigation",
		],
		correctAnswers: [2],
		explanation:
			"The selection rule: fixed sequential pipelines for predictable multi-aspect work, adaptive decomposition where the path emerges from intermediate findings. Each workflow gets the structure its uncertainty profile demands.",
		source: {
			label: "Cert Pro Quest — practice bank by Matthew Purcell (not official exam content)",
			url: "https://cert-pro-quest.lovable.app/",
		},
		whyNot:
			"A pays adaptivity overhead on a task with no uncertainty; B forces an investigation to follow steps written before the evidence existed; D assigns each strategy to the workflow that defeats it.",
	},
	{
		id: "CPQ-ccarf-4.10",
		domain: "D1",
		question:
			"[Scenario 4: Developer Productivity with Claude] You are writing AgentDefinition configurations for the productivity system's subagents. Which TWO statements about subagents are accurate? (Select TWO.)",
		options: [
			"Subagents automatically inherit the parent agent's full conversation history",
			"Each subagent's AgentDefinition carries its own description, system prompt, and tool restrictions for its role",
			"Subagents can inherit the parent’s context by setting an inherit flag in their configuration",
			"Subagents do not share memory between invocations — needed context must be provided explicitly in the prompt",
			"Subagent tool restrictions apply only to MCP-provided tools, not to built-in tools such as Bash or Write",
		],
		correctAnswers: [1, 3],
		explanation:
			"Two load-bearing facts: subagents are configured individually (description, system prompt, tool restrictions), and they are isolated — no inherited history, no memory across invocations, so context passing is always explicit.",
		source: {
			label: "Cert Pro Quest — practice bank by Matthew Purcell (not official exam content)",
			url: "https://cert-pro-quest.lovable.app/",
		},
		whyNot:
			"A and C invert the isolation model — context never flows automatically and no inherit flag exists; E is false — restrictions bind built-in and MCP tools alike, as configuration rather than suggestion.",
		selectCount: 2,
	},
	{
		id: "CPQ-ccarf-5.1",
		domain: "D3",
		question:
			"[Scenario 5: Claude Code for Continuous Integration] Your CI job must run Claude Code non-interactively and produce review findings your pipeline can parse and post as inline PR comments. Which invocation is correct?",
		options: [
			"claude “review this PR” piped through grep to extract findings from prose",
			"claude -p “review this PR” with --output-format json and --json-schema",
			"claude --headless “review this PR” --format json",
			"claude -p “review this PR” alone, then regex-parsing the prose output",
		],
		correctAnswers: [1],
		explanation:
			"The CI trio: -p (--print) for non-interactive execution, --output-format json for machine-readable output, and --json-schema to enforce the findings structure your pipeline consumes — no prose parsing, no input hangs.",
		source: {
			label: "Cert Pro Quest — practice bank by Matthew Purcell (not official exam content)",
			url: "https://cert-pro-quest.lovable.app/",
		},
		whyNot:
			"A hangs waiting for interactive input and then scrapes prose; C invents flags that do not exist; D solves the hang but leaves the pipeline regex-parsing unstructured text.",
	},
	{
		id: "CPQ-ccarf-5.2",
		domain: "D3",
		question:
			"[Scenario 5: Claude Code for Continuous Integration] CI-generated tests ignore your team's fixture library, duplicate helper setup, and test trivialities. Developers reject most of them. What is the configuration-level fix?",
		options: [
			"Generate three times as many tests so some survive review",
			"Have developers rewrite the generated tests as a standing chore",
			"Lower the generation temperature so the produced tests track common testing conventions more closely",
			"Document testing standards, what makes a test valuable, and the available fixtures in CLAUDE.md",
		],
		correctAnswers: [3],
		explanation:
			"CI invocations get their project context from CLAUDE.md. Standards, value criteria, and fixture documentation there directly raise generation quality — the model can only follow conventions it has been shown.",
		source: {
			label: "Cert Pro Quest — practice bank by Matthew Purcell (not official exam content)",
			url: "https://cert-pro-quest.lovable.app/",
		},
		whyNot:
			"A scales the reject pile; B institutionalizes rework instead of fixing its cause; C reduces variability of output that is uninformed either way.",
	},
	{
		id: "CPQ-ccarf-5.3",
		domain: "D3",
		question:
			"[Scenario 5: Claude Code for Continuous Integration] Reviews re-run after each new commit to a PR, and the bot re-posts the same findings every time — developers now mute it. How should re-reviews be designed?",
		options: [
			"Include the prior review’s findings in context and instruct Claude to report only new or still-unaddressed issues",
			"Review only the newest commit's diff in isolation",
			"Limit reviews to one per PR regardless of subsequent commits",
			"Deduplicate findings in the pipeline by hashing each finding’s file path and line number before posting",
		],
		correctAnswers: [0],
		explanation:
			"Duplicate suppression is a context design problem: give the reviewer its own prior findings and the explicit instruction to report deltas — new issues plus unresolved carryovers — and the noise stops while coverage remains complete.",
		source: {
			label: "Cert Pro Quest — practice bank by Matthew Purcell (not official exam content)",
			url: "https://cert-pro-quest.lovable.app/",
		},
		whyNot:
			"B misses issues that emerge from interaction with earlier commits; C leaves everything after the first push unreviewed; D breaks the moment a diff shifts line numbers — and cannot tell a resolved finding from a re-detected one.",
	},
	{
		id: "CPQ-ccarf-5.4",
		domain: "D3",
		question:
			"[Scenario 5: Claude Code for Continuous Integration] You notice that when the same Claude Code session that generated a change also reviews it, the review is conspicuously gentle — missing issues an independent reviewer catches. Why, and what is the design implication?",
		options: [
			"The model is being polite; instruct it to be harsher",
			"Reviews should always be performed by a larger model tier than the one that generated the change",
			"A session keeps the reasoning that produced the code, biasing it toward its own decisions — review independently",
			"Reviews should run at temperature zero so the reviewer applies its standards consistently across findings",
		],
		correctAnswers: [2],
		explanation:
			"Session context isolation matters for review integrity: the generating session carries the rationale that produced the code, biasing it toward its own choices. An independent instance evaluates the code on its own terms.",
		source: {
			label: "Cert Pro Quest — practice bank by Matthew Purcell (not official exam content)",
			url: "https://cert-pro-quest.lovable.app/",
		},
		whyNot:
			"A misreads a context effect as a personality setting; B changes capability when the problem is contaminated context — the same model reviews well when independent; D confuses sampling variance with context bias — a deterministic reviewer is still anchored to its own reasoning.",
	},
	{
		id: "CPQ-ccarf-5.5",
		domain: "D4",
		question:
			"[Scenario 5: Claude Code for Continuous Integration] Your review prompt says “be conservative and only report high-confidence findings,” yet false positives remain high. What does effective precision engineering look like instead?",
		options: [
			"Add “be very, very conservative” for stronger emphasis",
			"Report all findings but sort them by the model's stated confidence",
			"Reduce the number of files reviewed in each run so the model can examine every remaining file more carefully",
			"Swap confidence wording for explicit criteria: which issue types to report, which to skip, and the boundaries between",
		],
		correctAnswers: [3],
		explanation:
			"Vague conservatism doesn't transfer — specific criteria do. Defining reportable versus skippable categories with concrete boundaries gives the model an operable decision rule, which is what actually moves precision.",
		source: {
			label: "Cert Pro Quest — practice bank by Matthew Purcell (not official exam content)",
			url: "https://cert-pro-quest.lovable.app/",
		},
		whyNot:
			"A intensifies an instruction that has no operational content; B reorders noise instead of reducing it — self-stated confidence is poorly calibrated; C reviews less code with the same faulty judgment.",
	},
	{
		id: "CPQ-ccarf-5.6",
		domain: "D4",
		question:
			"[Scenario 5: Claude Code for Continuous Integration] Findings in the “code style” category are 70% false positives, and developers have begun dismissing security findings too — trust in the whole reviewer is collapsing. What is the right operational move?",
		options: [
			"Ship more style findings to demonstrate the category's importance",
			"Temporarily disable the style category to protect trust in the accurate categories while its prompts are improved",
			"Rename “code style” to “code quality”",
			"Keep every category live but add a banner note asking developers for patience while precision is being tuned",
		],
		correctAnswers: [1],
		explanation:
			"High false-positive categories are contagious: they teach developers to dismiss everything. Disabling the offender protects the credibility of accurate categories while its prompts are fixed offline — trust is the system's real asset.",
		source: {
			label: "Cert Pro Quest — practice bank by Matthew Purcell (not official exam content)",
			url: "https://cert-pro-quest.lovable.app/",
		},
		whyNot:
			"A doubles down on the noise destroying trust; C relabels the same false positives; D asks humans to absorb a cost the configuration should eliminate.",
	},
	{
		id: "CPQ-ccarf-5.7",
		domain: "D4",
		question:
			"[Scenario 5: Claude Code for Continuous Integration] The reviewer labels near-identical issues “critical” one day and “minor” the next. Severity-based merge gates are therefore unreliable. How do you get consistent severity classification?",
		options: [
			"Define explicit severity criteria with concrete code examples for each level",
			"Remove severity levels and treat all findings equally",
			"Sample the severity three times for each finding and adopt the majority vote",
			"Map severity to line count of the affected code",
		],
		correctAnswers: [0],
		explanation:
			"Consistency comes from operational definitions: severity levels anchored by concrete examples give the classifier something to match, turning a vibe into a rubric. That is what makes severity gates dependable.",
		source: {
			label: "Cert Pro Quest — practice bank by Matthew Purcell (not official exam content)",
			url: "https://cert-pro-quest.lovable.app/",
		},
		whyNot:
			"B discards the signal the merge gate needs; C reduces run-to-run noise but leaves the judgment unanchored — majority votes over a vibe are still a vibe; D measures size, not impact — a one-line auth bypass outranks a fifty-line comment tweak.",
	},
	{
		id: "CPQ-ccarf-5.8",
		domain: "D4",
		question:
			"[Scenario 5: Claude Code for Continuous Integration] The reviewer keeps flagging your codebase's accepted idiomatic patterns (e.g., intentional fall-throughs with comments) as bugs, while your detailed prose instructions haven't fixed it. What is the most effective addition?",
		options: [
			"A rule that anything containing a comment is acceptable",
			"An instruction to defer to the codebase’s existing conventions when judging whether a pattern is a bug",
			"Few-shot examples contrasting the accepted patterns with genuine issues, showing why each is or isn’t reportable",
			"A ban on reviewing files containing any idiomatic pattern",
		],
		correctAnswers: [2],
		explanation:
			"When prose fails to convey a judgment boundary, examples carry it: contrasted acceptable-versus-genuine cases with reasoning teach a distinction the model can generalize — the documented strength of few-shot prompting for false-positive reduction.",
		source: {
			label: "Cert Pro Quest — practice bank by Matthew Purcell (not official exam content)",
			url: "https://cert-pro-quest.lovable.app/",
		},
		whyNot:
			"A creates a trivially wrong rule any commented bug defeats; B names the goal without transferring the judgment — the model still cannot tell convention from defect; D exempts exactly the code that most needs reviewing.",
	},
	{
		id: "CPQ-ccarf-5.9",
		domain: "D4",
		question:
			"[Scenario 5: Claude Code for Continuous Integration] Your team is deciding which CI workloads to move to the Message Batches API for its 50% cost savings. Which TWO statements are accurate? (Select TWO.)",
		options: [
			"Batch processing suits latency-tolerant, non-blocking workloads like nightly test generation and weekly audit reports",
			"Batches are guaranteed to complete within one hour during off-peak windows, making them viable for pre-merge checks",
			"The batch API supports multi-turn tool calling within a single request",
			"Blocking workflows such as pre-merge checks should stay on the synchronous API rather than moving to batches",
			"Batch results are returned in submission order, so responses are matched back positionally",
		],
		correctAnswers: [0, 3],
		explanation:
			"The batch decision rule in both directions: overnight and weekly jobs are the ideal profile for the discount; anything a developer waits on cannot tolerate a 24-hour, no-SLA window and stays synchronous.",
		source: {
			label: "Cert Pro Quest — practice bank by Matthew Purcell (not official exam content)",
			url: "https://cert-pro-quest.lovable.app/",
		},
		whyNot:
			"B and C are false — there is no completion-time guarantee at any hour, and mid-request tool execution is unsupported; E is false — results are correlated by custom_id, not by position or order.",
		selectCount: 2,
	},
	{
		id: "CPQ-ccarf-5.10",
		domain: "D4",
		question:
			"[Scenario 5: Claude Code for Continuous Integration] You are adding few-shot examples to the review prompt. Which TWO practices reflect how few-shot prompting works best? (Select TWO.)",
		options: [
			"Include as many examples as possible — twenty or more — to cover every case",
			"Use 2–4 targeted examples aimed at the ambiguous scenarios, showing why one action beats plausible alternatives",
			"Once examples are added, explicit criteria become unnecessary",
			"Prefer abstract placeholder examples over real project code so the model doesn’t overfit to specifics",
			"Include examples demonstrating the exact desired output format — location, issue, severity, fix",
		],
		correctAnswers: [1, 4],
		explanation:
			"Effective few-shot work is targeted and demonstrative: a handful of examples aimed at genuine ambiguity, with reasoning shown, plus format demonstrations that lock output structure — quality of targeting over quantity.",
		source: {
			label: "Cert Pro Quest — practice bank by Matthew Purcell (not official exam content)",
			url: "https://cert-pro-quest.lovable.app/",
		},
		whyNot:
			"A bloats context and dilutes the signal of the examples that matter; C is false — examples complement explicit criteria rather than replace them; D discards the concreteness that makes examples transfer — realistic cases are the point.",
		selectCount: 2,
	},
	{
		id: "CPQ-ccarf-6.1",
		domain: "D4",
		question:
			"[Scenario 6: Structured Data Extraction] Your current pipeline asks Claude to “respond with JSON” in plain text; downstream parsing breaks on markdown fences, trailing commentary, and occasional malformed syntax. What is the most reliable structural fix?",
		options: [
			"Strengthen the prompt: “respond ONLY with valid JSON, no exceptions”",
			"Post-process the text with regexes that strip fences and repair syntax",
			"Define the extraction as a tool whose input schema is your JSON schema, and read the data from the tool_use block",
			"Switch the output format to YAML, whose forgiving syntax avoids JSON’s brittle commas and quoting rules",
		],
		correctAnswers: [2],
		explanation:
			"Tool use with JSON schemas is the reliability mechanism for structured output: the model's extraction arrives as schema-conformant tool input, not as prose that happens to contain JSON — syntax errors are eliminated by construction.",
		source: {
			label: "Cert Pro Quest — practice bank by Matthew Purcell (not official exam content)",
			url: "https://cert-pro-quest.lovable.app/",
		},
		whyNot:
			"A improves the odds within a fundamentally text-shaped channel; B patches symptoms with fragile repairs; D relocates the same free-text problem to a different syntax.",
	},
	{
		id: "CPQ-ccarf-6.2",
		domain: "D4",
		question:
			"[Scenario 6: Structured Data Extraction] You have several extraction tools — one per document type — and incoming documents of unknown type. The model must always produce a structured extraction, choosing the appropriate schema itself, and never reply with conversational text. Which tool_choice setting is correct?",
		options: [
			"tool_choice: “any” — the model must call a tool but may choose which",
			"tool_choice: “auto” — the model decides whether to call a tool at all",
			"tool_choice forced to one named extraction tool, applied uniformly to every incoming document",
			"Omit tool_choice, relying on strongly worded prompt instructions to always call a tool",
		],
		correctAnswers: [0],
		explanation:
			"The three modes map to intent: “any” compels a tool call while preserving the model's choice among schemas — exactly right for unknown document types that must always yield structured output.",
		source: {
			label: "Cert Pro Quest — practice bank by Matthew Purcell (not official exam content)",
			url: "https://cert-pro-quest.lovable.app/",
		},
		whyNot:
			"B and D permit conversational text instead of a tool call — “auto” is the default, and prompt emphasis cannot guarantee invocation; C welds every document to one schema when types vary.",
	},
	{
		id: "CPQ-ccarf-6.3",
		domain: "D4",
		question:
			"[Scenario 6: Structured Data Extraction] Your invoice schema marks vendor_tax_id as required. On invoices that genuinely lack a tax ID, the model fabricates plausible-looking values to satisfy the schema. What is the schema-level fix?",
		options: [
			"Add a prompt instruction: “never fabricate tax IDs”",
			"Post-validate extracted tax IDs against the official checksum and discard any values that fail",
			"Lower the temperature so the model stops inventing values it cannot find in the document",
			"Make the field optional/nullable so the model can legitimately return null when the value is absent",
		],
		correctAnswers: [3],
		explanation:
			"Required fields on possibly-absent information force fabrication — the schema leaves no honest answer. Nullable/optional fields give the model a legitimate way to say “not present,” which is the designed prevention for this failure.",
		source: {
			label: "Cert Pro Quest — practice bank by Matthew Purcell (not official exam content)",
			url: "https://cert-pro-quest.lovable.app/",
		},
		whyNot:
			"A pits an instruction against a structural requirement that demands a value; B catches well-formed fabrications only by luck; C makes invented values more conservative-looking, not less invented.",
	},
	{
		id: "CPQ-ccarf-6.4",
		domain: "D4",
		question:
			"[Scenario 6: Structured Data Extraction] Since adopting tool use, extractions are always syntactically valid — yet invoices arrive where line items don't sum to the stated total, and values occasionally land in the wrong fields. What should you understand and do?",
		options: [
			"Schema compliance was falsely advertised; file a bug",
			"Schemas ensure structure, not semantics — add validation: extract calculated_total vs stated_total and flag mismatches with a conflict_detected flag",
			"Relax every numeric field to an unconstrained string type so schema validation can never reject an extraction",
			"Re-run each affected extraction with the numeric discrepancy described in the retry prompt so the model can correct it",
		],
		correctAnswers: [1],
		explanation:
			"The boundary of the guarantee: tool use ensures structure, not truth. Semantic errors — sums that don't reconcile, transposed fields — need a semantic validation layer, with self-check fields like calculated_total making discrepancies machine-visible.",
		source: {
			label: "Cert Pro Quest — practice bank by Matthew Purcell (not official exam content)",
			url: "https://cert-pro-quest.lovable.app/",
		},
		whyNot:
			"A misunderstands what was promised: shape, not semantics; C destroys the structure downstream systems depend on; D presupposes the discrepancy has already been detected — which is exactly the validation layer being added.",
	},
	{
		id: "CPQ-ccarf-6.5",
		domain: "D4",
		question:
			"[Scenario 6: Structured Data Extraction] An extraction fails Pydantic validation with two specific field errors. You will retry. What should the retry request contain — and when would you skip retrying altogether?",
		options: [
			"The validation errors plus a stricter instruction; skip retrying after any second consecutive failure",
			"The failed extraction plus the validation errors, keeping the retry cheap; retry up to a fixed attempt budget each time",
			"The original document, the failed extraction, and the validation errors; skip retrying when the information is absent from the source",
			"The original document with a fresh prompt and no reference to the failure; skip retrying only on API errors",
		],
		correctAnswers: [2],
		explanation:
			"Retry-with-error-feedback works because the model sees what it produced, what was wrong, and the source to correct against. And the boundary matters: format and structural errors are retryable; information absent from the document is not.",
		source: {
			label: "Cert Pro Quest — practice bank by Matthew Purcell (not official exam content)",
			url: "https://cert-pro-quest.lovable.app/",
		},
		whyNot:
			"A and B omit the source document the correction must reference — the model cannot re-ground fields it cannot see; D withholds the error feedback that makes retries targeted, and API errors are precisely the retryable kind.",
	},
	{
		id: "CPQ-ccarf-6.6",
		domain: "D4",
		question:
			"[Scenario 6: Structured Data Extraction] An overnight batch of 10,000 documents completes with 200 failures: most are oversized documents that blew past context limits, plus some transient errors. What is the correct failure-handling workflow?",
		options: [
			"Identify the failed requests by custom_id and resubmit only those, chunking the oversized documents first",
			"Resubmit the entire 10,000-document batch and keep whichever results arrive first",
			"Log the 200 failures for weekly manual review and accept the batch as operationally complete",
			"Switch the 200 failed documents to the synchronous API unchanged, where the batch context limits don’t apply",
		],
		correctAnswers: [0],
		explanation:
			"custom_id exists for exactly this: correlate failures to their source documents, fix what caused each failure (chunk the oversized ones), and resubmit only the fixed subset — paying again for 200 documents, not 10,000.",
		source: {
			label: "Cert Pro Quest — practice bank by Matthew Purcell (not official exam content)",
			url: "https://cert-pro-quest.lovable.app/",
		},
		whyNot:
			"B reprocesses 9,800 successes to retry 200 failures; C defers and quietly drops 2% of the corpus; D misunderstands context limits, which belong to the model, not the API path — unchunked oversized documents fail synchronously too.",
	},
	{
		id: "CPQ-ccarf-6.7",
		domain: "D2",
		question:
			"[Scenario 6: Structured Data Extraction] A single analyze_document tool handles extraction, summarization, and claim verification, chosen by a mode parameter. The agent regularly picks the wrong mode and results are inconsistent. What is the recommended redesign?",
		options: [
			"Add a fourth mode that automatically detects the right mode",
			"Document each mode’s selection criteria far more thoroughly inside the single tool’s description",
			"Reduce to two modes by merging extraction into summarization",
			"Split it into purpose-specific tools — extract_data_points, summarize_content, verify_claim_against_source",
		],
		correctAnswers: [3],
		explanation:
			"Purpose-specific tools turn a hidden mode decision into a visible selection decision — the thing tool descriptions are good at guiding. Each tool's contract is explicit, and misrouting drops accordingly.",
		source: {
			label: "Cert Pro Quest — practice bank by Matthew Purcell (not official exam content)",
			url: "https://cert-pro-quest.lovable.app/",
		},
		whyNot:
			"A buries the selection problem one layer deeper; B improves documentation of a structure that remains ambiguous; C reduces options while keeping the overloaded design.",
	},
	{
		id: "CPQ-ccarf-6.8",
		domain: "D2",
		question:
			"[Scenario 6: Structured Data Extraction] When your MCP extraction tool hits a parsing failure, it returns the message “Error: could not parse document” as an ordinary successful text result. The agent then treats that sentence as document content. What is the correct MCP pattern?",
		options: [
			"Prefix error text with “SYSTEM ERROR:” so the agent notices",
			"Return the failure with the MCP isError flag set",
			"Return a structured JSON body containing an error field the agent can check within the result text",
			"Throw an unhandled exception and let the connection drop",
		],
		correctAnswers: [1],
		explanation:
			"isError is MCP's channel for communicating tool failure: it makes the error a machine-recognizable condition the agent can reason about, rather than text masquerading as a successful result.",
		source: {
			label: "Cert Pro Quest — practice bank by Matthew Purcell (not official exam content)",
			url: "https://cert-pro-quest.lovable.app/",
		},
		whyNot:
			"A still relies on the model inferring failure from prose conventions; C improves the error’s shape but still delivers it as a successful result — the protocol-level flag is the recognizable signal; D turns a recoverable tool error into a transport-level breakdown.",
	},
	{
		id: "CPQ-ccarf-6.9",
		domain: "D5",
		question:
			"[Scenario 6: Structured Data Extraction] Your extraction system reports 97% aggregate accuracy, and leadership wants to cut human review of high-confidence extractions. Which TWO practices must precede that decision? (Select TWO.)",
		options: [
			"Segment accuracy by document type and field, verifying consistent performance across every segment",
			"Accept the aggregate as sufficient, since 97% exceeds the measured accuracy of the human reviewers themselves",
			"Implement stratified random sampling of high-confidence extractions for ongoing error-rate measurement",
			"Sunset the accuracy dashboard once review is reduced, since the metric no longer drives decisions",
			"Review only extractions the model itself flags as uncertain",
		],
		correctAnswers: [0, 2],
		explanation:
			"Two safeguards make automation defensible: segmentation proves the average isn't hiding a failing document type or field, and stratified sampling of the “safe” population keeps measuring after the humans step back — catching drift and novel errors.",
		source: {
			label: "Cert Pro Quest — practice bank by Matthew Purcell (not official exam content)",
			url: "https://cert-pro-quest.lovable.app/",
		},
		whyNot:
			"B trusts exactly the number that masks segment failures — beating human accuracy on average says nothing about the failing segments; D removes the instrumentation precisely when risk increases; E trusts self-flagged uncertainty, which misses the errors the model is confidently wrong about.",
		selectCount: 2,
	},
	{
		id: "CPQ-ccarf-6.10",
		domain: "D5",
		question:
			"[Scenario 6: Structured Data Extraction] Reviewer capacity covers only a fraction of extractions, so review attention must be routed where errors are likeliest. Which TWO practices form a sound routing design? (Select TWO.)",
		options: [
			"Trust the model's raw self-reported confidence scores without validation",
			"Have the model output field-level confidence scores, then calibrate review thresholds against a labeled validation set",
			"Review a fixed random 5% of all extractions, keeping the sample unbiased",
			"Route to human review the extractions with low calibrated confidence or ambiguous source documents",
			"Prioritize the longest and most complex documents for review, since extraction difficulty rises steeply with length",
		],
		correctAnswers: [1, 3],
		explanation:
			"Calibration then routing: field-level confidence scores become meaningful once thresholds are tuned on labeled data, and review capacity flows to the calibrated-low-confidence and ambiguous-source cases where errors actually cluster.",
		source: {
			label: "Cert Pro Quest — practice bank by Matthew Purcell (not official exam content)",
			url: "https://cert-pro-quest.lovable.app/",
		},
		whyNot:
			"A uses uncalibrated confidence — the known-unreliable version of the right signal; C spreads scarce capacity uniformly when errors concentrate — random samples measure error rates, they don’t route reviewers; E leans on a length proxy that correlates only loosely with error risk.",
		selectCount: 2,
	},
];
