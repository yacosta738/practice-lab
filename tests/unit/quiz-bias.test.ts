import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

import { questions as ccaoFQuestions } from "../../src/certifications/ccao-f/questions";
import { questions as ccarFQuestions } from "../../src/certifications/ccar-f/questions";
import { questions as ccarPQuestions } from "../../src/certifications/ccar-p/questions";
// Import all question banks to check for bias
import { questions as ccdvFQuestions } from "../../src/certifications/ccdv-f/questions";
import type { Question } from "../../src/lib/quiz-types";

const allBanks: Record<string, Question[]> = {
	"ccdv-f": ccdvFQuestions,
	"ccao-f": ccaoFQuestions,
	"ccar-f": ccarFQuestions,
	"ccar-p": ccarPQuestions,
};

// When true, bias violations fail the CI check. When false, they only print
// warnings so the report is visible without blocking merges while questions
// are being improved. Flip to true once the banks are shuffled / balanced.
const failOnBias = false;

const markdownPracticeFiles = [
	"../../src/content/study/ccdv-f/00-navigation/exam-decision-guide.md",
	"../../src/content/study/ccdv-f/01-agents-and-workflows/agent-architecture-design-workshop.md",
	"../../src/content/study/ccdv-f/02-applications-and-integration/application-integration-design-workshop.md",
	"../../src/content/study/ccdv-f/05-model-selection-and-optimization/model-selection-and-optimization-workshop.md",
];

const markdownPracticeQuestions = markdownPracticeFiles.map((file) => {
	const content = readFileSync(new URL(file, import.meta.url), "utf8");
	const answer = content.match(/\*\*Best answer:\s*([A-D])\./)?.[1];
	const options = [...content.matchAll(/^- ([A-D])\.\s+(.+)$/gm)].map(([, letter, text]) => ({
		letter,
		text,
	}));

	if (!answer || options.length !== 4) {
		throw new Error(`Expected one four-option practice question in ${file}`);
	}

	return { file, answer, options };
});

/**
 * Check position bias: the correct answer should be evenly distributed
 * across all positions (A, B, C, D…). With random distribution across N
 * options, each position should get roughly 1/N of the answers.
 *
 * Flag if any single position holds more than the threshold of answers.
 */
function checkPositionBias(questions: Question[]) {
	const singleSelect = questions.filter(
		(q) => q.correctAnswers.length === 1 && q.options.length >= 4,
	);
	if (singleSelect.length < 10) {
		return { total: singleSelect.length, warning: "too few questions to analyze" };
	}

	const positionCounts: Record<number, number> = {};
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
function checkLengthBias(questions: Question[]) {
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
	it("balances answer positions and option lengths in new study questions", () => {
		expect(markdownPracticeQuestions).toHaveLength(4);
		expect(
			markdownPracticeQuestions.reduce<Record<string, number>>((counts, question) => {
				counts[question.answer] = (counts[question.answer] ?? 0) + 1;
				return counts;
			}, {}),
		).toEqual({ A: 1, B: 1, C: 1, D: 1 });

		for (const question of markdownPracticeQuestions) {
			const lengths = question.options.map((option) => option.text.length);
			const longestLength = Math.max(...lengths);
			const correctOption = question.options.find((option) => option.letter === question.answer);
			expect(correctOption, question.file).toBeDefined();
			expect(
				lengths.filter((length) => length === longestLength).length > 1 ||
					correctOption?.text.length !== longestLength,
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
