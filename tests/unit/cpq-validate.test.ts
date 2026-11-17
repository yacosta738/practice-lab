import { describe, expect, it } from "vitest";
import { validateExamQuestions } from "../../scripts/lib/cpq-validate.mjs";

// ---------------------------------------------------------------------------
// validateExamQuestions
// ---------------------------------------------------------------------------

const baseExam = {
	code: "CCAR-P",
	domains: ["Solution Design & Architecture"],
	questions: [
		{
			id: "1.1",
			domain: "Solution Design & Architecture",
			text: "Which option is correct?",
			options: [
				{ id: "A", text: "First" },
				{ id: "B", text: "Second" },
			],
			answer: ["A"],
			rationale: "Because…",
			whyNot: "B is wrong because…",
			selectCount: 1,
		},
	],
};

describe("validateExamQuestions", () => {
	it("accepts a well-formed exam", () => {
		expect(validateExamQuestions(baseExam)).toEqual([]);
	});

	it("rejects a question whose domain is not declared by the exam", () => {
		// An undeclared domain used to reach normalization, which invented a
		// domain id absent from the certification config and broke the quiz UI.
		const errors = validateExamQuestions({
			...baseExam,
			questions: [{ ...baseExam.questions[0], domain: "Brand New Domain" }],
		});
		expect(errors.join(" ")).toMatch(/domain "Brand New Domain" is not declared/i);
	});

	it("rejects an empty answer letter", () => {
		const errors = validateExamQuestions({
			...baseExam,
			questions: [{ ...baseExam.questions[0], answer: [""] }],
		});
		expect(errors.join(" ")).toMatch(/answer letter ""/i);
	});

	it("rejects an answer letter outside A–E", () => {
		const errors = validateExamQuestions({
			...baseExam,
			questions: [{ ...baseExam.questions[0], answer: ["Z"] }],
		});
		expect(errors.join(" ")).toMatch(/answer letter "Z"/i);
	});

	it("rejects an answer letter outside the option range", () => {
		const errors = validateExamQuestions({
			...baseExam,
			questions: [{ ...baseExam.questions[0], answer: ["C"] }],
		});
		expect(errors.join(" ")).toMatch(/out of range/i);
	});

	it("reports a missing answer", () => {
		const errors = validateExamQuestions({
			...baseExam,
			questions: [{ ...baseExam.questions[0], answer: [] }],
		});
		expect(errors.join(" ")).toMatch(/missing answer/i);
	});

	it("reports a missing selectCount", () => {
		const errors = validateExamQuestions({
			...baseExam,
			questions: [{ ...baseExam.questions[0], selectCount: 0 }],
		});
		expect(errors.join(" ")).toMatch(/missing selectCount/i);
	});
	it.each([
		{ answer: ["A"], selectCount: 2 },
		{ answer: ["A", "B"], selectCount: 1 },
	])("rejects an answer count mismatch: %o", (change) => {
		expect(
			validateExamQuestions({ ...baseExam, questions: [{ ...baseExam.questions[0], ...change }] }),
		).toEqual([
			`CCAR-P[0]: answer length ${change.answer.length} differs from selectCount ${change.selectCount}`,
		]);
	});

	it("accepts matching multi-select counts", () => {
		expect(
			validateExamQuestions({
				...baseExam,
				questions: [{ ...baseExam.questions[0], answer: ["A", "B"], selectCount: 2 }],
			}),
		).toEqual([]);
	});
});
