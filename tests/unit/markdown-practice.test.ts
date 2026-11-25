import path from "node:path";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

import {
	discoverMarkdownPracticeQuestions,
	parseMarkdownPracticeQuestions,
} from "../../scripts/lib/markdown-practice.mjs";

const fixtures = fileURLToPath(new URL("../fixtures/markdown-practice/", import.meta.url));

describe("Markdown practice question discovery", () => {
	it("finds questions in nested Markdown files without counting ordinary notes", () => {
		const questions = discoverMarkdownPracticeQuestions(fixtures);

		expect(questions).toHaveLength(2);
		expect(questions.map((question) => question.answers)).toEqual([["B"], ["D"]]);
		expect(questions.map((question) => path.basename(question.file))).toEqual([
			"first.md",
			"second.md",
		]);
	});

	it("parses an answer key after the question blocks, including multi-select answers", () => {
		const markdown = `
#### D1.01 · Architecture

Which option fits?

- **A.** First option.
- **B.** Second option.
- **C.** Third option.
- **D.** Fourth option.

#### D1.02 · Agent loops

Which two controls apply?

- **A.** First option.
- **B.** Second option.
- **C.** Third option.
- **D.** Fourth option.

## Answer key

- **D1.01 — B.** Explanation.
- **D1.02 — A, D.** Explanation.
`;

		const questions = parseMarkdownPracticeQuestions(markdown, "answer-key-fixture.md");

		expect(questions.map((question) => question.answers)).toEqual([["B"], ["A", "D"]]);
		expect(questions.map((question) => question.options)).toEqual([
			["First option.", "Second option.", "Third option.", "Fourth option."],
			["First option.", "Second option.", "Third option.", "Fourth option."],
		]);
	});

	it("rejects question blocks without a valid answer instead of omitting them", () => {
		const markdown = `
## Original practice question

Choose the best response.

- A. First option.
- B. Second option.
- C. Third option.
- D. Fourth option.
`;

		expect(() => parseMarkdownPracticeQuestions(markdown, "missing-answer.md")).toThrow(
			/missing answer/i,
		);
	});

	it("rejects malformed option sets", () => {
		const markdown = `
## Original practice question

Choose the best response.

- A. First option.
- B. Second option.
- D. Fourth option.

**Best answer: B.** Explanation.
`;

		expect(() => parseMarkdownPracticeQuestions(markdown, "missing-option.md")).toThrow(
			/expected options A, B, C, and D/i,
		);
	});
});
