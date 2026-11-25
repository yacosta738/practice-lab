import { describe, expect, it } from "vitest";
import { normalizeSearchText, rankSearchItems, type SearchItem } from "../../src/lib/study-search";

describe("normalizeSearchText", () => {
	it("keeps readable Markdown text and removes formatting", () => {
		expect(normalizeSearchText("## Agents\nUse **bounded tasks** with `tools`.")).toBe(
			"Agents Use bounded tasks with tools.",
		);
	});

	it("excludes answer sections and rationales attached to multiple-choice blocks", () => {
		const markdown = `
## Scenario
Retain this ordinary technical explanation marker.

## Solution architecture
Retain this technical heading marker.

## Original practice question
Retain this question prompt marker.

- **A.** First option
- **B.** Second option
- **C.** Third option
- **D.** Fourth option

**Best answer: B.** Exclude this inline rationale marker.

## Review checklist
Retain this checklist prompt marker.

## Answer key and rationales
### D1 · Agents and Workflows
#### D1.01 · Architecture
- **D1.01 — B.** Exclude this imported answer-key marker.

## Sources
Retain this later section marker.
`;
		const normalized = normalizeSearchText(markdown);

		expect(normalized).toContain("ordinary technical explanation marker");
		expect(normalized).toContain("technical heading marker");
		expect(normalized).toContain("question prompt marker");
		expect(normalized).toContain("checklist prompt marker");
		expect(normalized).toContain("later section marker");
		expect(normalized).not.toContain("inline rationale marker");
		expect(normalized).not.toContain("imported answer-key marker");
	});

	it("keeps answer terminology in ordinary technical prose", () => {
		expect(
			normalizeSearchText("The best answer: describe this API as a stateless interface."),
		).toContain("best answer: describe this API as a stateless interface");
	});

	it("keeps technical sections titled Solutions, Answers, or Rationales searchable", () => {
		const normalized = normalizeSearchText(`
## Solutions
Use exponential backoff with jitter to recover from transient failures.

## Answers
Return a structured answer payload from the API endpoint.

## Rationales
Include the rationale for each retry decision in the audit log.
`);

		expect(normalized).toContain("exponential backoff with jitter");
		expect(normalized).toContain("structured answer payload");
		expect(normalized).toContain("rationale for each retry decision");
	});

	it("excludes all paragraphs in a structurally marked multi-paragraph rationale", () => {
		const normalized = normalizeSearchText(`
## Practice question
Retain this instructional question prompt.

- **A.** First option
- **B.** Second option

**Best answer: B.** Exclude the first assessment rationale paragraph.

Exclude the continuation paragraph from the same rationale.

Question: Retain the next question prompt without a heading.

- **A.** Third option
- **B.** Fourth option

**Answer: B.** Exclude this next answer rationale.

## Next topic
Retain this instructional section after the rationale boundary.
`);

		expect(normalized).toContain("instructional question prompt");
		expect(normalized).toContain("next question prompt without a heading");
		expect(normalized).toContain("instructional section after the rationale boundary");
		expect(normalized).not.toContain("first assessment rationale paragraph");
		expect(normalized).not.toContain("continuation paragraph");
		expect(normalized).not.toContain("next answer rationale");
	});

	it("does not mistake a fenced code line with trailing text for a closing fence", () => {
		const normalized = normalizeSearchText(`
\`\`\`markdown
\`\`\` not a closing fence
## Answer key
Keep this technical example searchable.
\`\`\`\`
`);

		expect(normalized).toContain("Keep this technical example searchable");
	});

	it("requires only spaces or tabs after a closing fence marker", () => {
		const normalized = normalizeSearchText(`
\`\`\`markdown
\`\`\`\u00a0
## Answer key
Preserve content after a non-breaking space fence marker.
\`\`\`
`);

		expect(normalized).toContain("Preserve content after a non-breaking space fence marker");
	});
});

describe("rankSearchItems", () => {
	const items: SearchItem[] = [
		{
			title: "Subagents and Context Isolation",
			href: "/study/subagents/",
			category: "Study Note",
			badge: "D1 · Agents and Workflows",
			text: "A subagent uses a restricted toolset and returns a compact result.",
		},
		{
			title: "Restricted toolset overview",
			href: "/study/tools/",
			category: "Study Note",
			badge: "D8 · Tools and MCPs",
			text: "Learn about tool permissions.",
		},
	];

	it("ranks title matches before body-only matches", () => {
		expect(rankSearchItems("restricted toolset", items).map((item) => item.title)).toEqual([
			"Restricted toolset overview",
			"Subagents and Context Isolation",
		]);
	});

	it("returns a contextual excerpt for body matches", () => {
		const result = rankSearchItems("restricted toolset", items)[1];

		expect(result.excerpt).toContain("restricted toolset");
	});

	it("ranks retained workshop content without matching its excluded rationale", () => {
		const item: SearchItem = {
			title: "Agent Architecture Workshop",
			href: "/study/agent-architecture-workshop/",
			category: "Study Note",
			text: normalizeSearchText(`
## Original practice question
A bounded workflow is easier to test and operate.

- **A.** Add unbounded autonomy
- **B.** Keep explicit transitions

**Best answer: B.** Exclude this private rationale phrase.
`),
		};

		const results = rankSearchItems("bounded workflow", [item]);
		expect(results).toHaveLength(1);
		expect(results[0].excerpt).toContain("bounded workflow");
		expect(rankSearchItems("private rationale phrase", [item])).toEqual([]);
	});

	it("does not return items that do not match", () => {
		expect(rankSearchItems("no matching concept", items)).toEqual([]);
	});
});
