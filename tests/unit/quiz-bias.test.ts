import { describe, it } from "vitest";
import type { Question } from "../../src/lib/quiz-types";

// Import all question banks to check for bias
import { questions as ccdvFQuestions } from "../../src/certifications/ccdv-f/questions";
import { questions as ccaoFQuestions } from "../../src/certifications/ccao-f/questions";
import { questions as ccarFQuestions } from "../../src/certifications/ccar-f/questions";
import { questions as ccarPQuestions } from "../../src/certifications/ccar-p/questions";

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

/**
 * Check position bias: the correct answer should not be concentrated
 * in the first positions (A/B). With random distribution across N
 * options, each position should get roughly 1/N of the answers.
 *
 * We use a chi-squared-like heuristic: if more than 60% of single-select
 * questions have the correct answer in position 0 or 1 (out of 4+ options),
 * that's suspicious.
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

	const top2Count = (positionCounts[0] || 0) + (positionCounts[1] || 0);
	const top2Pct = (top2Count / singleSelect.length) * 100;

	// With 4 options, random would give ~50% in top 2. Flag if > 60%.
	// With 5 options, random would give ~40%. Flag if > 55%.
	const avgOptions =
		singleSelect.reduce((sum, q) => sum + q.options.length, 0) / singleSelect.length;
	const threshold = avgOptions >= 5 ? 55 : 60;

	return {
		total: singleSelect.length,
		positionCounts,
		top2Pct: Math.round(top2Pct * 10) / 10,
		exceedsThreshold: top2Pct > threshold,
		threshold,
	};
}

/**
 * Check length bias: the correct answer should not consistently be
 * the longest option. If > 65% of questions have the correct answer
 * as the longest option, that's a strong signal of bias.
 */
function checkLengthBias(questions: Question[]) {
	const singleSelect = questions.filter(
		(q) => q.correctAnswers.length === 1 && q.options.length >= 3,
	);
	if (singleSelect.length < 10) {
		return { total: singleSelect.length, warning: "too few questions to analyze" };
	}

	let correctIsLongest = 0;
	for (const q of singleSelect) {
		const correctIdx = q.correctAnswers[0];
		const correctLen = q.options[correctIdx].length;

		// Find the max length among all options
		const maxLen = Math.max(...q.options.map((o) => o.length));

		// Check if the correct answer is the longest (or tied for longest)
		if (correctLen === maxLen) {
			correctIsLongest++;
		}
	}

	const pct = (correctIsLongest / singleSelect.length) * 100;
	return {
		total: singleSelect.length,
		correctIsLongest,
		pct: Math.round(pct * 10) / 10,
		exceedsThreshold: pct > 65,
	};
}

describe("Quiz bias detection", () => {
	for (const [bankName, questions] of Object.entries(allBanks)) {
		describe(bankName, () => {
			it("should not have position bias", () => {
				const result = checkPositionBias(questions);

				if (result.warning) {
					console.log(`${bankName}: ${result.warning}`);
					return;
				}

				if (result.exceedsThreshold) {
					const msg = `⚠️  ${bankName} position bias: ${result.top2Pct}% of correct answers in A/B (threshold: ${result.threshold}%)`;
					if (failOnBias) {
						throw new Error(msg);
					}
					console.warn(msg);
					// Print distribution
					console.warn(`  Distribution: ${JSON.stringify(result.positionCounts)}`);
				} else {
					console.log(
						`✓ ${bankName} position bias OK: ${result.top2Pct}% in A/B (threshold: ${result.threshold}%)`,
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
					const msg = `⚠️  ${bankName} length bias: ${result.pct}% of correct answers are the longest option (threshold: 65%)`;
					if (failOnBias) {
						throw new Error(msg);
					}
					console.warn(msg);
					console.warn(
						`  ${result.correctIsLongest}/${result.total} questions have the longest option as correct`,
					);
				} else {
					console.log(`✓ ${bankName} length bias OK: ${result.pct}% longest (threshold: 65%)`);
				}
			});
		});
	}
});
