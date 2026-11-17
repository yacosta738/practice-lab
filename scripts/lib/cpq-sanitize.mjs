// Boundary sanitization for the imported Cert Pro Quest content.
//
// The source bundle concatenates neighbouring material into some fields:
// a whyNot can carry the next question (and its answer) plus the next domain
// heading, and an option can carry the introduction of the next scenario.
// Those fragments belong to other items, so the importer cuts them at the
// first boundary marker instead of rendering foreign text to the learner.
//
// The rules are deliberately literal and deterministic: they remove text that
// provably belongs to another question, and never rewrite the answer itself.

/** Start of the next question, e.g. " 1.11 — 1 → single augmented LLM call" */
const QUESTION_BOUNDARY = /\s\d+\.\d+\s+—/;

/** Start of the next domain heading, e.g. " ## Domain 6: Prompt and Context" */
const DOMAIN_BOUNDARY = /\s*#*\s*Domain\s+\d+\s*:/;

/**
 * Start of the next scenario introduction, e.g. " Scenario 3: Multi-Agent…".
 * The marker requires a capital letter after the colon so that a legitimate
 * reference such as "Scenario 2: the agent retries once" is preserved.
 */
const SCENARIO_BOUNDARY = /\sScenario\s+\d+:\s+[A-Z]/;

function indexOfBoundary(text, pattern) {
	const match = pattern.exec(text);
	return match ? match.index : -1;
}

/**
 * Remove the trailing fragment that belongs to the next question or domain.
 *
 * @param {string} [text] - raw whyNot text
 * @returns {string} text limited to the current question
 */
export function sanitizeWhyNot(text) {
	if (typeof text !== "string" || text.length === 0) return text;

	let cut = text.length;
	for (const pattern of [QUESTION_BOUNDARY, DOMAIN_BOUNDARY]) {
		const index = indexOfBoundary(text, pattern);
		if (index !== -1 && index < cut) cut = index;
	}
	if (cut === text.length) return text;

	return text.slice(0, cut).replace(/[\s#]+$/u, "");
}

/**
 * Remove the trailing fragment that belongs to the next scenario.
 *
 * @param {string} text - raw option text
 * @returns {string} text limited to the current scenario
 */
export function sanitizeOptionText(text) {
	if (typeof text !== "string" || text.length === 0) return text;

	const cut = indexOfBoundary(text, SCENARIO_BOUNDARY);
	if (cut === -1) return text;

	return text.slice(0, cut).replace(/[\s#]+$/u, "");
}
