import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";
import { discoverMarkdownPracticeQuestions } from "../../scripts/lib/markdown-practice.mjs";
import { questions as ccaoFQuestions } from "../../src/certifications/ccao-f/questions";
import { questions as ccarFQuestions } from "../../src/certifications/ccar-f/questions";
import { questions as ccarPQuestions } from "../../src/certifications/ccar-p/questions";
// Import all question banks to check for bias
import { questions as ccdvFQuestions } from "../../src/certifications/ccdv-f/questions";
import type { Question } from "../../src/lib/quiz-types";

type BiasQuestion = Pick<Question, "correctAnswers" | "options">;

const markdownPracticeQuestions = discoverMarkdownPracticeQuestions(
	fileURLToPath(new URL("../../src/content/study", import.meta.url)),
);
const markdownStudyQuestions: BiasQuestion[] = markdownPracticeQuestions.map((question) => ({
	correctAnswers: question.answers.map((answer) => answer.charCodeAt(0) - "A".charCodeAt(0)),
	options: question.options,
}));

const allBanks: Record<string, BiasQuestion[]> = {
	"ccdv-f": ccdvFQuestions,
	"ccao-f": ccaoFQuestions,
	"ccar-f": ccarFQuestions,
	"ccar-p": ccarPQuestions,
	"study-markdown": markdownStudyQuestions,
};

// When true, bias violations fail the CI check. When false, they only print
// warnings so the report is visible without blocking merges while questions
// are being improved. Flip to true once the banks are shuffled / balanced.
const failOnBias = false;

/**
 * Check position bias: the correct answer should be evenly distributed
 * across all positions (A, B, C, D…). With random distribution across N
 * options, each position should get roughly 1/N of the answers.
 *
 * Flag if any single position holds more than the threshold of answers.
 */
function checkPositionBias(questions: BiasQuestion[]) {
	const singleSelect = questions.filter(
		(q) => q.correctAnswers.length === 1 && q.options.length >= 4,
	);
	if (singleSelect.length < 10) {
		return { total: singleSelect.length, warning: "too few questions to analyze" };
	}

	const positionCounts: Record<string, number> = {};
	for (const q of singleSelect) {
		const pos = q.correctAnswers[0];
		positionCounts[pos] = (positionCounts[pos] || 0) + 1;
	}

	// Find the maximum concentration in any single position
	const maxCount = Math.max(...Object.values(positionCounts));
	const maxPct = (maxCount / singleSelect.length) * 100;

	// With 4 options, random would give ~25% per position. Flag if > 40%.
	// With 5 options, random would give ~20%. Flag if > 35%.
	const avgOptions =
		singleSelect.reduce((sum, q) => sum + q.options.length, 0) / singleSelect.length;
	const threshold = avgOptions >= 5 ? 35 : 40;

	return {
		total: singleSelect.length,
		positionCounts,
		maxPct: Math.round(maxPct * 10) / 10,
		exceedsThreshold: maxPct > threshold,
		threshold,
	};
}

/**
 * Check length bias: the correct answer should not consistently be
 * the uniquely longest option. If > 65% of questions have the correct
 * answer as the only longest option, that's a strong signal of bias.
 * Questions where multiple options tie for longest are not counted.
 */
function checkLengthBias(questions: BiasQuestion[]) {
	const singleSelect = questions.filter(
		(q) => q.correctAnswers.length === 1 && q.options.length >= 3,
	);
	if (singleSelect.length < 10) {
		return { total: singleSelect.length, warning: "too few questions to analyze" };
	}

	let correctIsUniquelyLongest = 0;
	for (const q of singleSelect) {
		const correctIdx = q.correctAnswers[0];
		const correctLen = q.options[correctIdx].length;

		// Find the max length and how many options share it
		const lengths = q.options.map((o) => o.length);
		const maxLen = Math.max(...lengths);
		const tiesForLongest = lengths.filter((l) => l === maxLen).length;

		// Only count as bias when the correct answer is strictly the unique
		// longest option. When all options tie for longest, there is no
		// length signal to exploit.
		if (correctLen === maxLen && tiesForLongest === 1) {
			correctIsUniquelyLongest++;
		}
	}

	const pct = (correctIsUniquelyLongest / singleSelect.length) * 100;
	return {
		total: singleSelect.length,
		correctIsLongest: correctIsUniquelyLongest,
		pct: Math.round(pct * 10) / 10,
		exceedsThreshold: pct > 65,
	};
}

describe("Quiz bias detection", () => {
	it("automatically discovers Markdown questions, including the answer-key question bank", () => {
		expect(markdownPracticeQuestions.length).toBeGreaterThan(100);
		expect(
			markdownPracticeQuestions.some((question) =>
				question.file.endsWith("ccdv-f-developer-study-guide-100-questions.md"),
			),
		).toBe(true);
	});

	it("balances answer positions and option lengths in inline study questions", () => {
		const inlineQuestions = markdownPracticeQuestions.filter(
			(question) => question.answerSource === "inline" && question.answers.length === 1,
		);
		expect(inlineQuestions.length).toBeGreaterThan(0);

		const positionCounts = inlineQuestions.reduce<Record<string, number>>((counts, question) => {
			const answer = question.answers[0];
			counts[answer] = (counts[answer] ?? 0) + 1;
			return counts;
		}, {});
		const maxPositionShare = Math.max(...Object.values(positionCounts)) / inlineQuestions.length;
		expect(maxPositionShare).toBeLessThanOrEqual(0.4);

		for (const question of inlineQuestions) {
			const lengths = question.options.map((option) => option.length);
			const longestLength = Math.max(...lengths);
			const correctOption = question.options[question.answers[0].charCodeAt(0) - "A".charCodeAt(0)];
			expect(
				lengths.filter((length) => length === longestLength).length > 1 ||
					correctOption.length !== longestLength,
				question.file,
			).toBe(true);
			expect(longestLength - Math.min(...lengths), question.file).toBeLessThanOrEqual(
				Math.ceil(longestLength * 0.3),
			);
		}
	});

	for (const [bankName, questions] of Object.entries(allBanks)) {
		describe(bankName, () => {
			it("should not have position bias", () => {
				const result = checkPositionBias(questions);

				if (result.warning) {
					console.log(`${bankName}: ${result.warning}`);
					return;
				}

				if (result.exceedsThreshold) {
					const msg = `⚠️  ${bankName} position bias: ${result.maxPct}% of correct answers in one position (threshold: ${result.threshold}%)`;
					if (failOnBias) {
						throw new Error(msg);
					}
					console.warn(msg);
					// Print distribution
					console.warn(`  Distribution: ${JSON.stringify(result.positionCounts)}`);
				} else {
					console.log(
						`✓ ${bankName} position bias OK: ${result.maxPct}% max concentration (threshold: ${result.threshold}%)`,
					);
				}
			});

			it("should not have length bias", () => {
				const result = checkLengthBias(questions);

				if (result.warning) {
					console.log(`${bankName}: ${result.warning}`);
					return;
				}

				if (result.exceedsThreshold) {
					const msg = `⚠️  ${bankName} length bias: ${result.pct}% of correct answers are the uniquely longest option (threshold: 65%)`;
					if (failOnBias) {
						throw new Error(msg);
					}
					console.warn(msg);
					console.warn(
						`  ${result.correctIsLongest}/${result.total} questions have the uniquely longest option as correct`,
					);
				} else {
					console.log(
						`✓ ${bankName} length bias OK: ${result.pct}% uniquely longest (threshold: 65%)`,
					);
				}
			});
		});
	}
});
