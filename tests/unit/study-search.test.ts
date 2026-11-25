import { describe, expect, it } from "vitest";
import { normalizeSearchText, rankSearchItems, type SearchItem } from "../../src/lib/study-search";

describe("normalizeSearchText", () => {
	it("keeps readable Markdown text and removes formatting", () => {
		expect(normalizeSearchText("## Agents\nUse **bounded tasks** with `tools`.")).toBe(
			"Agents Use bounded tasks with tools.",
		);
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

	it("does not return items that do not match", () => {
		expect(rankSearchItems("no matching concept", items)).toEqual([]);
	});
});
