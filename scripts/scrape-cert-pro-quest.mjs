#!/usr/bin/env node
/**
 * scrape-cert-pro-quest.mjs
 *
 * Resilient scraper for https://cert-pro-quest.lovable.app/
 *
 * 1. Fetches the portal HTML and discovers the current hashed JS data asset
 *    (does NOT hardcode the asset hash).
 * 2. Imports the bundle and extracts the exam catalog by object shape rather
 *    than minified export name.
 * 3. Validates all 4 banks and question fields.
 * 4. Writes a deterministic raw snapshot to tmp/cpq-raw-snapshot.json.
 *
 * Usage:
 *   node scripts/scrape-cert-pro-quest.mjs [--output tmp/cpq-raw-snapshot.json]
 */

import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { buildDomainMap, deriveBlueprint, normalizeQuestion } from "./lib/cpq-normalize.mjs";

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

const PORTAL_URL = "https://cert-pro-quest.lovable.app/";
const DEFAULT_OUTPUT = resolve("tmp", "cpq-raw-snapshot.json");

// Parse CLI args
const args = process.argv.slice(2);
const outputFlagIdx = args.indexOf("--output");
const OUTPUT = outputFlagIdx >= 0 ? args[outputFlagIdx + 1] : DEFAULT_OUTPUT;

// ---------------------------------------------------------------------------
// Step 1: Fetch HTML and discover the exams JS asset
// ---------------------------------------------------------------------------

console.log("Fetching portal HTML…");
const htmlRes = await fetch(PORTAL_URL);
if (!htmlRes.ok) {
	throw new Error(`Portal returned ${htmlRes.status}: ${htmlRes.statusText}`);
}
const html = await htmlRes.text();

// Find all JS asset references in the HTML (both src= and href= for modulepreload)
const assetRegex = /(?:src|href)="\/assets\/([^"]+\.js)"/g;
const assets = [];
let match;
/* biome-ignore lint/suspicious/noAssignInExpressions: assignment in while condition is the standard pattern for regex exec */
while ((match = assetRegex.exec(html)) !== null) {
	assets.push(match[1]);
}

// The exams asset contains "exams" in the name
const examsAsset = assets.find((a) => a.startsWith("exams-"));
if (!examsAsset) {
	throw new Error(`Could not find exams JS asset. Found assets: ${JSON.stringify(assets)}`);
}
console.log(`Discovered exams asset: ${examsAsset}`);

// ---------------------------------------------------------------------------
// Step 2: Fetch and import the exams bundle
// ---------------------------------------------------------------------------

console.log("Fetching exams bundle…");
const bundleUrl = `${PORTAL_URL}assets/${examsAsset}`;
const bundleRes = await fetch(bundleUrl);
if (!bundleRes.ok) {
	throw new Error(`Bundle returned ${bundleRes.status}: ${bundleRes.statusText}`);
}
const bundleText = await bundleRes.text();
console.log(`Bundle size: ${bundleText.length} bytes`);

// Write bundle to a temp file for dynamic import
const tmpBundle = resolve("tmp", `.cpq-bundle-${Date.now()}.js`);
mkdirSync(dirname(tmpBundle), { recursive: true });
writeFileSync(tmpBundle, bundleText, "utf-8");

try {
	// Dynamic import the bundle
	const mod = await import(`file://${tmpBundle}`);

	// ---------------------------------------------------------------------------
	// Step 3: Extract exam catalog by object shape
	// ---------------------------------------------------------------------------

	// The bundle exports many minified single-letter names. We need to find
	// the export that is an array of exam objects with the expected shape:
	// { id, code, title, blurb, domains: string[], questions: [...] }
	console.log("Searching for exam catalog by object shape…");

	const exports = mod;
	let exams = null;

	for (const [key, value] of Object.entries(exports)) {
		if (
			Array.isArray(value) &&
			value.length === 4 &&
			value.every(
				(item) =>
					item &&
					typeof item === "object" &&
					"id" in item &&
					"code" in item &&
					"title" in item &&
					"domains" in item &&
					"questions" in item &&
					Array.isArray(item.questions),
			)
		) {
			exams = value;
			console.log(`Found exam catalog in export "${key}"`);
			break;
		}
	}

	if (!exams) {
		throw new Error(
			"Could not find exam catalog in bundle exports. The bundle structure may have changed.",
		);
	}

	// ---------------------------------------------------------------------------
	// Step 4: Validate all 4 banks
	// ---------------------------------------------------------------------------

	console.log("\nValidating exam banks…");
	const expectedCodes = ["CCAO-F", "CCDV-F", "CCAR-P", "CCAR-F"];
	const foundCodes = exams.map((e) => e.code);

	for (const code of expectedCodes) {
		if (!foundCodes.includes(code)) {
			throw new Error(`Missing expected certification: ${code}`);
		}
	}

	const validationErrors = [];
	for (const exam of exams) {
		console.log(
			`  ${exam.code}: ${exam.questions.length} questions, ${exam.domains.length} domains`,
		);

		for (let i = 0; i < exam.questions.length; i++) {
			const q = exam.questions[i];
			const prefix = `${exam.code}[${i}]`;

			if (!q.id) validationErrors.push(`${prefix}: missing id`);
			if (!q.domain) validationErrors.push(`${prefix}: missing domain`);
			if (!q.text) validationErrors.push(`${prefix}: missing text`);
			if (!Array.isArray(q.options) || q.options.length < 2)
				validationErrors.push(`${prefix}: invalid options`);
			if (!Array.isArray(q.answer) || q.answer.length === 0)
				validationErrors.push(`${prefix}: missing answer`);
			if (!q.rationale) validationErrors.push(`${prefix}: missing rationale`);
			if (!q.whyNot) validationErrors.push(`${prefix}: missing whyNot`);
			if (!q.selectCount) validationErrors.push(`${prefix}: missing selectCount`);

			// Validate answer letters are valid
			for (const letter of q.answer) {
				const idx = letter.charCodeAt(0) - 65;
				if (idx < 0 || idx >= q.options.length) {
					validationErrors.push(
						`${prefix}: answer letter "${letter}" out of range for ${q.options.length} options`,
					);
				}
			}
		}
	}

	if (validationErrors.length > 0) {
		console.error("\nValidation errors:");
		for (const e of validationErrors.slice(0, 20)) {
			console.error(`  ${e}`);
		}
		if (validationErrors.length > 20) {
			console.error(`  … and ${validationErrors.length - 20} more`);
		}
		throw new Error(`${validationErrors.length} validation error(s)`);
	}

	console.log("  ✓ All validations passed");

	// ---------------------------------------------------------------------------
	// Step 5: Build normalized data
	// ---------------------------------------------------------------------------

	console.log("\nNormalizing question banks…");

	// Build domain maps for each cert (D1, D2, … in site order)
	const certDomainMaps = {};
	const certDomainNames = {};
	for (const exam of exams) {
		certDomainNames[exam.id] = exam.domains;
		certDomainMaps[exam.id] = buildDomainMap(exam.domains);

		// For CCDV-F, override with the canonical mapping
		if (exam.id === "ccdvf") {
			// Use the built-in CCDV-F mapping from cpq-normalize
			const ccdvfMap = {
				"Agents and Workflows": "D1",
				"Applications and Integration": "D2",
				"Claude Code": "D3",
				"Eval, Testing, and Debugging": "D4",
				"Model Selection and Optimization": "D5",
				"Prompt and Context Engineering": "D6",
				"Security and Safety": "D7",
				"Tools and MCPs": "D8",
			};
			certDomainMaps[exam.id] = ccdvfMap;
		}
	}

	const normalizedBanks = {};
	for (const exam of exams) {
		const domainMap = certDomainMaps[exam.id];
		const questions = exam.questions.map((q) => normalizeQuestion(exam.id, q, domainMap));

		// Derive blueprint
		const domainCounts = {};
		for (const q of exam.questions) {
			domainCounts[q.domain] = (domainCounts[q.domain] || 0) + 1;
		}
		const blueprint = deriveBlueprint(domainCounts, Math.min(50, exam.questions.length));

		normalizedBanks[exam.id] = {
			code: exam.code,
			title: exam.title,
			blurb: exam.blurb,
			domains: exam.domains,
			domainMap,
			blueprint,
			questions,
			totalQuestions: questions.length,
		};

		console.log(`  ${exam.code}: ${questions.length} normalized questions`);
	}

	// ---------------------------------------------------------------------------
	// Step 6: Write snapshot
	// ---------------------------------------------------------------------------

	const snapshot = {
		version: 1,
		source: {
			url: PORTAL_URL,
			label: "Cert Pro Quest — practice bank by Matthew Purcell (not official exam content)",
			scrapedAt: new Date().toISOString(),
			asset: examsAsset,
		},
		banks: normalizedBanks,
	};

	mkdirSync(dirname(OUTPUT), { recursive: true });
	writeFileSync(OUTPUT, JSON.stringify(snapshot, null, 2), "utf-8");
	console.log(`\n✓ Snapshot written to ${OUTPUT}`);

	// Print summary
	console.log("\n--- Summary ---");
	for (const [id, bank] of Object.entries(normalizedBanks)) {
		console.log(`${bank.code} (${id}):`);
		console.log(`  Questions: ${bank.totalQuestions}`);
		console.log(`  Domains: ${bank.domains.length}`);
		console.log(`  Blueprint: ${JSON.stringify(bank.blueprint)}`);
	}
	console.log(
		`\nTotal questions: ${Object.values(normalizedBanks).reduce((s, b) => s + b.totalQuestions, 0)}`,
	);
} finally {
	// Clean up temp bundle
	import("node:fs").then(({ unlinkSync }) => {
		try {
			unlinkSync(tmpBundle);
		} catch {
			// ignore
		}
	});
}
