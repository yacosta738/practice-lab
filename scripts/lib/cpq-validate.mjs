// Validation of the raw Cert Pro Quest exam objects.
//
// The scraper consumes data from a third-party bundle, so every assumption
// the generator relies on is checked here before anything is normalized:
// a question must reference a declared domain and its answer letters must
// be real option letters.

/**
 * @typedef {object} RawQuestion
 * @property {string} id
 * @property {string} domain
 * @property {string} text
 * @property {{id: string, text: string}[]} options
 * @property {string[]} answer
 * @property {string} rationale
 * @property {string} whyNot
 * @property {number} selectCount
 */

/**
 * @typedef {object} RawExam
 * @property {string} code
 * @property {string[]} domains
 * @property {RawQuestion[]} questions
 */

const OPTION_LETTER_PATTERN = /^[A-E]$/;

/**
 * Validate every question of an exam.
 *
 * @param {RawExam} exam - raw exam object from the portal bundle
 * @returns {string[]} list of human-readable validation errors (empty when valid)
 */
export function validateExamQuestions(exam) {
	/** @type {string[]} */
	const errors = [];
	const declaredDomains = new Set(exam.domains ?? []);

	for (let i = 0; i < exam.questions.length; i++) {
		const q = exam.questions[i];
		const prefix = `${exam.code}[${i}]`;

		if (!q.id) errors.push(`${prefix}: missing id`);
		if (!q.domain) {
			errors.push(`${prefix}: missing domain`);
		} else if (!declaredDomains.has(q.domain)) {
			// An undeclared domain cannot be mapped to a config domain id, so
			// the generated bank would reference a domain the quiz UI lacks.
			errors.push(`${prefix}: domain "${q.domain}" is not declared by ${exam.code}`);
		}
		if (!q.text) errors.push(`${prefix}: missing text`);
		if (!Array.isArray(q.options) || q.options.length < 2) {
			errors.push(`${prefix}: invalid options`);
		}
		if (!Array.isArray(q.answer) || q.answer.length === 0) {
			errors.push(`${prefix}: missing answer`);
		}
		if (!q.rationale) errors.push(`${prefix}: missing rationale`);
		if (!q.whyNot) errors.push(`${prefix}: missing whyNot`);
		if (!q.selectCount) errors.push(`${prefix}: missing selectCount`);
		else if (Array.isArray(q.answer) && q.answer.length !== q.selectCount)
			errors.push(
				`${prefix}: answer length ${q.answer.length} differs from selectCount ${q.selectCount}`,
			);

		for (const letter of Array.isArray(q.answer) ? q.answer : []) {
			if (!OPTION_LETTER_PATTERN.test(letter)) {
				// An empty or multi-character token would otherwise become NaN
				// and serialize to null in the generated bank.
				errors.push(`${prefix}: answer letter "${letter}" is not a valid option letter`);
				continue;
			}
			const optionCount = Array.isArray(q.options) ? q.options.length : 0;
			const idx = letter.charCodeAt(0) - 65;
			if (idx < 0 || idx >= optionCount) {
				errors.push(
					`${prefix}: answer letter "${letter}" is out of range for ${optionCount} options`,
				);
			}
		}
	}

	return errors;
}
