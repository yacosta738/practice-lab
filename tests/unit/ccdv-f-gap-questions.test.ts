import { describe, expect, it } from "vitest";

import { questions } from "../../src/certifications/ccdv-f/questions";

const questionIds = [
	"D1-023",
	"D1-024",
	"D2-041",
	"D6-021",
	"D6-022",
	"D6-019",
	"D6-020",
	"D8-015",
	"D8-016",
	"D7-011",
	"D7-012",
	"D3-007",
	"D3-008",
	"D4-010",
	"D4-011",
];

const objectiveQuestionCounts = {
	"1.2 Agent Construction with Claude": 2,
	"2.3 Claude API Mechanics": 1,
	"6.3 Output Handling": 2,
	"6.1 Context Engineering": 2,
	"8.2 MCP Server Development": 2,
	"7.1 AI Application Security": 2,
	"3.1 Claude Code Operation": 2,
	"4.1 Debugging and Error Handling": 2,
};
const domainByObjective: Record<string, string> = {
	"1.2 Agent Construction with Claude": "D1",
	"2.3 Claude API Mechanics": "D2",
	"6.3 Output Handling": "D6",
	"6.1 Context Engineering": "D6",
	"8.2 MCP Server Development": "D8",
	"7.1 AI Application Security": "D7",
	"3.1 Claude Code Operation": "D3",
	"4.1 Debugging and Error Handling": "D4",
};

const gapQuestions = questions.filter((question) => questionIds.includes(question.id));

describe("CCDV-F validated-gap questions", () => {
	it("adds original scenario questions for each validated objective gap", () => {
		expect(gapQuestions).toHaveLength(questionIds.length);

		for (const [objective, expectedCount] of Object.entries(objectiveQuestionCounts)) {
			expect(gapQuestions.filter((question) => question.topic === objective)).toHaveLength(
				expectedCount,
			);
		}
	});

	it("links every question to authoritative evidence and explains its distractors", () => {
		for (const question of gapQuestions) {
			expect(question.domain).toBe(domainByObjective[question.topic ?? ""]);
			expect(question.question).toMatch(/\?/);
			expect(question.options).toHaveLength(4);
			expect(question.correctAnswers).toHaveLength(1);
			expect(question.explanation.trim()).not.toBe("");
			expect(question.whyNot?.trim()).not.toBe("");

			const source = new URL(question.source.url);
			expect(source.protocol).toBe("https:");
			expect(["platform.claude.com", "modelcontextprotocol.io", "code.claude.com"]).toContain(
				source.hostname,
			);
			expect(question.source.label.trim()).not.toBe("");
		}
	});

	it("distributes correct answers across all four option positions", () => {
		const counts = [0, 1, 2, 3].map(
			(position) =>
				gapQuestions.filter((question) => question.correctAnswers[0] === position).length,
		);

		expect(counts.every((count) => count > 0)).toBe(true);
		expect(Math.max(...counts) / gapQuestions.length).toBeLessThanOrEqual(0.4);
	});

	it("does not make the correct option the unique longest choice too often", () => {
		const uniquelyLongestCorrect = gapQuestions.filter((question) => {
			const lengths = question.options.map((option) => option.length);
			const correctLength = lengths[question.correctAnswers[0]];
			const longestLength = Math.max(...lengths);
			return (
				correctLength === longestLength &&
				lengths.filter((length) => length === longestLength).length === 1
			);
		});

		expect(
			uniquelyLongestCorrect.length / gapQuestions.length,
			`Unique-longest correct options: ${uniquelyLongestCorrect.map((question) => question.id).join(", ")}`,
		).toBeLessThanOrEqual(0.4);
	});
});
