/**
 * Pure utility functions for normalizing Cert Pro Quest (CPQ) exam data
 * into the Practice Lab Question type.
 *
 * @module cpq-normalize
 */

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const CPQ_SOURCE_URL = "https://cert-pro-quest.lovable.app/";
const CPQ_SOURCE_LABEL =
	"Cert Pro Quest — practice bank by Matthew Purcell (not official exam content)";

/**
 * Canonical mapping from CPQ CCDV-F domain names to the existing D1–D8
 * domain IDs used in this site.  Order matches the site's domain list.
 */
const CCDVF_DOMAIN_MAP = {
	"Agents and Workflows": "D1",
	"Applications and Integration": "D2",
	"Claude Code": "D3",
	"Eval, Testing, and Debugging": "D4",
	"Model Selection and Optimization": "D5",
	"Prompt and Context Engineering": "D6",
	"Security and Safety": "D7",
	"Tools and MCPs": "D8",
};

// ---------------------------------------------------------------------------
// Answer letter → zero-based index
// ---------------------------------------------------------------------------

/**
 * Convert answer letters (A, B, C, …) to zero-based option indices.
 *
 * @param {string[]} letters - e.g. ["B"] or ["A","C"]
 * @returns {number[]}
 */
export function mapAnswerLettersToIndices(letters) {
	return letters.map((letter) => {
		const idx = letter.charCodeAt(0) - 65; // 'A' = 65
		if (idx < 0 || idx > 4) {
			throw new Error(`Invalid answer letter: "${letter}" (expected A–E)`);
		}
		return idx;
	});
}

// ---------------------------------------------------------------------------
// Domain slugifier
// ---------------------------------------------------------------------------

/**
 * Convert a domain name to a URL-safe slug for use as domain ID
 * in non-CCDV-F certifications.
 *
 * @param {string} name
 * @returns {string}
 */
export function slugifyDomain(name) {
	return name
		.normalize("NFD")
		.replace(/[\u0300-\u036f]/g, "")
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, "-")
		.replace(/^-+|-+$/g, "");
}

// ---------------------------------------------------------------------------
// CCDV-F domain mapper
// ---------------------------------------------------------------------------

/**
 * Map a CPQ CCDV-F domain name to the existing D1–D8 domain ID.
 *
 * @param {string} domainName
 * @returns {string}
 */
export function mapCcdvfDomain(domainName) {
	const mapped = CCDVF_DOMAIN_MAP[domainName];
	if (mapped === undefined) {
		throw new Error(`Unknown CCDV-F domain: "${domainName}"`);
	}
	return mapped;
}

// ---------------------------------------------------------------------------
// Question normalizer
// ---------------------------------------------------------------------------

/**
 * A normalized question in the Practice Lab Question shape.
 * @typedef {Object} NormalizedQuestion
 * @property {string} id - unique question identifier (e.g. "CPQ-ccaof-1.1")
 * @property {string} domain - domain ID (e.g. "D1")
 * @property {string} question - the question text
 * @property {string[]} options - array of option texts
 * @property {number[]} correctAnswers - zero-based indices of correct options
 * @property {string} explanation - rationale for the correct answer
 * @property {{ label: string, url: string }} source - citation information
 * @property {string} [topic] - optional topic string
 * @property {string} [whyNot] - optional explanation of why other options are incorrect
 * @property {number} [selectCount] - optional count of selections for multi-select questions
 */

/**
 * Normalize a single CPQ question into the Practice Lab Question shape.
 *
 * @param {string} certId - e.g. "ccaof", "ccdvf", "ccarp", "ccarf"
 * @param {object} cpqQ - raw CPQ question object
 * @param {Record<string, string>} [domainMap] - domain name → domain ID map
 *   (only needed for non-CCDV-F certs; CCDV-F uses built-in mapping)
 * @returns {NormalizedQuestion} normalized question
 */
export function normalizeQuestion(certId, cpqQ, domainMap = {}) {
	// Domain mapping
	let domain;
	if (certId === "ccdvf") {
		domain = mapCcdvfDomain(cpqQ.domain);
	} else if (domainMap[cpqQ.domain]) {
		domain = domainMap[cpqQ.domain];
	} else {
		// Fallback: derive D1, D2, … from the order domains appear on the site
		domain = slugifyDomain(cpqQ.domain);
	}

	// Answer indices
	const correctAnswers = mapAnswerLettersToIndices(cpqQ.answer);

	// Options as plain text array
	const options = cpqQ.options.map((o) => o.text);

	// Build the question object (omit topic — CPQ source has no topic field)
	const question = {
		id: `CPQ-${certId}-${cpqQ.id}`,
		domain,
		question: cpqQ.text,
		options,
		correctAnswers,
		explanation: cpqQ.rationale,
		source: {
			label: CPQ_SOURCE_LABEL,
			url: CPQ_SOURCE_URL,
		},
	};

	// Preserve whyNot as an optional extension
	if (cpqQ.whyNot) {
		question.whyNot = cpqQ.whyNot;
	}

	// Preserve selectCount for multi-select questions
	if (cpqQ.selectCount && cpqQ.selectCount > 1) {
		question.selectCount = cpqQ.selectCount;
	}

	return question;
}

// ---------------------------------------------------------------------------
// Blueprint derivation (Largest Remainder Method)
// ---------------------------------------------------------------------------

/**
 * Derive an exam blueprint from domain question counts using the
 * Largest Remainder Method (Hamilton's method).
 *
 * Ensures every domain gets at least 1 question.
 * If target exceeds total available questions, uses total instead.
 *
 * @param {Record<string, number>} domainCounts - domain name → question count
 * @param {number} target - desired total questions (e.g. 50)
 * @returns {Record<string, number>} domain name → blueprint count
 */
export function deriveBlueprint(domainCounts, target) {
	const domains = Object.keys(domainCounts);
	const total = Object.values(domainCounts).reduce((s, v) => s + v, 0);

	// If target exceeds total, just use the actual counts
	if (target >= total) {
		/** @type {Record<string, number>} */
		const result = {};
		for (const [domain, count] of Object.entries(domainCounts)) {
			result[domain] = count;
		}
		return result;
	}

	// Quota for each domain
	const quota = {};
	for (const [domain, count] of Object.entries(domainCounts)) {
		quota[domain] = (count / total) * target;
	}

	// Initial allocation: floor of quota, minimum 1
	/** @type {Record<string, number>} */
	const allocation = {};
	let allocated = 0;
	for (const domain of domains) {
		allocation[domain] = Math.max(1, Math.floor(quota[domain]));
		allocated += allocation[domain];
	}

	// Distribute remaining seats by largest remainder
	const remaining = target - allocated;
	if (remaining > 0) {
		// Sort domains by fractional remainder (descending)
		const remainders = domains.map((domain) => ({
			domain,
			remainder: quota[domain] - Math.floor(quota[domain]),
		}));
		remainders.sort((a, b) => b.remainder - a.remainder);

		for (let i = 0; i < remaining && i < remainders.length; i++) {
			allocation[remainders[i].domain] += 1;
		}
	}

	return allocation;
}

// ---------------------------------------------------------------------------
// Domain map builder (assigns D1, D2, … in site order)
// ---------------------------------------------------------------------------

/**
 * Build a domain name → D{n} mapping from an ordered list of domain names.
 *
 * @param {string[]} domainNames - ordered list of domain names as they appear on the site
 * @returns {Record<string, string>}
 */
export function buildDomainMap(domainNames) {
	/** @type {Record<string, string>} */
	const map = {};
	domainNames.forEach((name, idx) => {
		map[name] = `D${idx + 1}`;
	});
	return map;
}
