/**
 * Pure utility functions for normalizing Cert Pro Quest (CPQ) exam data
 * into the Practice Lab Question type.
 *
 * @module cpq-normalize
 */

import { sanitizeOptionText, sanitizeWhyNot } from "./cpq-sanitize.mjs";

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
		// Validate the whole token: "" and "AB" both pass a charCodeAt(0)
		// check (NaN or the first character) and would corrupt the bank.
		if (!/^[A-E]$/.test(letter)) {
			throw new Error(`Invalid answer letter: "${letter}" (expected A–E)`);
		}
		return letter.charCodeAt(0) - 65; // 'A' = 65
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
	} else {
		const mapped = domainMap[cpqQ.domain];
		if (!mapped) {
			// Inventing an id here would produce a question whose domain is
			// absent from the certification config, which breaks the quiz UI.
			// Fail loudly so the mapping is updated instead.
			throw new Error(
				`Unmapped CPQ domain "${cpqQ.domain}" for certification "${certId}". ` +
					"Add it to the certification domain map.",
			);
		}
		domain = mapped;
	}

	// Answer indices
	const correctAnswers = mapAnswerLettersToIndices(cpqQ.answer);

	// Options as plain text array
	const options = cpqQ.options.map((o) => sanitizeOptionText(o.text, certId, cpqQ.id, o.id));

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
		question.whyNot = sanitizeWhyNot(cpqQ.whyNot, certId, cpqQ.id);
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
	const domains = Object.keys(domainCounts).filter((d) => domainCounts[d] > 0);
	if (!domains.length) return {};

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

	// Every domain with questions keeps at least one seat when the target has
	// room for all domains. Apportion the remaining seats across the residual
	// capacity using the Largest Remainder Method.
	const reserveOne = domains.length <= target;
	/** @type {Record<string, number>} */
	const allocation = {};
	let reserved = 0;
	for (const domain of domains) {
		allocation[domain] = reserveOne ? 1 : 0;
		reserved += allocation[domain];
	}

	const remaining = target - reserved;
	const residualCapacity = domains.reduce(
		(sum, domain) => sum + domainCounts[domain] - allocation[domain],
		0,
	);
	/** @type {{domain: string, remainder: number}[]} */
	const remainders = [];
	let apportioned = 0;

	for (const domain of domains) {
		const capacity = domainCounts[domain] - allocation[domain];
		const quota = residualCapacity > 0 ? (capacity / residualCapacity) * remaining : 0;
		const base = Math.min(capacity, Math.floor(quota));
		allocation[domain] += base;
		apportioned += base;
		remainders.push({ domain, remainder: quota - Math.floor(quota) });
	}

	remainders.sort((a, b) => b.remainder - a.remainder || a.domain.localeCompare(b.domain));
	for (const { domain } of remainders) {
		if (apportioned >= remaining) break;
		if (allocation[domain] < domainCounts[domain]) {
			allocation[domain] += 1;
			apportioned += 1;
		}
	}

	const allocated = Object.values(allocation).reduce((s, v) => s + v, 0);
	if (allocated !== target) {
		throw new Error(
			`deriveBlueprint: allocated ${allocated} of ${target} questions (domain counts: ${JSON.stringify(domainCounts)})`,
		);
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
