#!/usr/bin/env node
/**
 * generate-cpq-banks.mjs
 *
 * Reads the CPQ raw snapshot and generates TypeScript question bank files
 * for each certification. Also generates the combined CCDV-F bank.
 *
 * Uses JSON.stringify for all string emission to guarantee valid TS output.
 * Output is deterministic — no timestamps in generated files.
 * After writing, formats all generated files with the project's Biome so the
 * output already satisfies `pnpm exec biome check .`.
 *
 * Usage:
 *   node scripts/generate-cpq-banks.mjs
 */

import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const projectRoot = resolve(__dirname, "..");
const SNAPSHOT_PATH = resolve(projectRoot, "tmp", "cpq-raw-snapshot.json");
const SRC_DIR = resolve(projectRoot, "src", "certifications");

// Resolve Biome binary relative to the project (no dependency on shell PATH)
const biomeBin = resolve(projectRoot, "node_modules", ".bin", "biome");

/**
 * Format the provided file paths with the project's Biome.
 * Fails loudly if Biome cannot run so unformatted output is never left behind.
 */
function formatWithBiome(paths) {
	if (!paths.length) {
		return;
	}
	if (!existsSync(biomeBin)) {
		console.warn(
			"⚠ Biome not found at node_modules/.bin/biome — generated files were NOT formatted.",
		);
		console.warn(`  Please run: pnpm exec biome format --write ${paths.join(" ")}`);
		return;
	}
	try {
		execFileSync(biomeBin, ["format", "--write", ...paths], {
			cwd: projectRoot,
			stdio: "inherit",
		});
	} catch (_e) {
		console.error(
			"✗ Biome formatting failed — generated files may not pass `pnpm exec biome check .`.",
		);
		console.error("  Fix the formatting issue and re-run the generator.");
		process.exit(1);
	}
}

// Read snapshot
console.log("Reading snapshot…");
const snapshot = JSON.parse(readFileSync(SNAPSHOT_PATH, "utf-8"));
const banks = snapshot.banks;

// Certification metadata — slugs match the existing ccdv-f convention
const certMeta = {
	ccaof: {
		slug: "ccao-f",
		title: "Claude Certified Associate — Foundations",
		subtitle: "CCAO-F",
		description:
			"Practice questions covering business-user fundamentals: prompting, output evaluation, product selection, governance, and troubleshooting.",
		brand: "#4a90d9",
		brand2: "#3a7bc8",
		brandSoft: "rgba(74, 144, 217, 0.08)",
		minutesPerQuestion: 2,
	},
	ccdvf: {
		slug: "ccdv-f",
		title: "Claude Certified Developer — Foundations (CPQ additions)",
		subtitle: "CCDV-F",
		description:
			"Additional practice questions from Cert Pro Quest for the CCDV-F exam. Combined with 122 hand-authored questions.",
		brand: "#e76f51",
		brand2: "#d45a3d",
		brandSoft: "rgba(231, 111, 81, 0.08)",
		minutesPerQuestion: 2,
	},
	ccarp: {
		slug: "ccar-p",
		title: "Claude Certified Architect — Professional",
		subtitle: "CCAR-P",
		description:
			"Practice questions covering solution design, integration, evaluation, governance, stakeholder communication, and operational enablement.",
		brand: "#7b68ee",
		brand2: "#6a5acd",
		brandSoft: "rgba(123, 104, 238, 0.08)",
		minutesPerQuestion: 2,
	},
	ccarf: {
		slug: "ccar-f",
		title: "Claude Certified Architect — Foundations",
		subtitle: "CCAR-F",
		description:
			"Practice questions covering agentic architecture, tool design and MCP integration, Claude Code workflows, prompt engineering, and context reliability.",
		brand: "#20b2aa",
		brand2: "#1a9e97",
		brandSoft: "rgba(32, 178, 170, 0.08)",
		minutesPerQuestion: 2,
	},
};

/**
 * Returns true when a JSON-stringified value contains the literal text `${`.
 * Biome's `noTemplateCurlyInString` fires on these because they look like
 * forgotten template expressions, but the content is verbatim from the source
 * bank and must not be turned into a template literal.
 */
function hasDollarCurly(s) {
	return typeof s === "string" && s.includes("${");
}

/**
 * Generate a questions.ts file from a normalized bank.
 * Uses JSON.stringify for every string value to guarantee valid TS.
 */
function generateQuestionsFile(_certId, bank, importPath) {
	const lines = [
		`// ${bank.code} question bank — generated from Cert Pro Quest snapshot`,
		`// Source: ${snapshot.source.label}`,
		"",
		`import type { Question } from "${importPath}";`,
		"",
		"export const questions: Question[] = [",
	];

	for (const q of bank.questions) {
		lines.push("\t{");
		lines.push(`\t\tid: ${JSON.stringify(q.id)},`);
		lines.push(`\t\tdomain: ${JSON.stringify(q.domain)},`);
		// Omit topic for imported records (CPQ has no topic field)
		if (hasDollarCurly(q.question)) {
			lines.push(
				"\t\t// biome-ignore lint/suspicious/noTemplateCurlyInString: literal content from source bank",
			);
		}
		lines.push(`\t\tquestion: ${JSON.stringify(q.question)},`);
		lines.push("\t\toptions: [");
		for (const opt of q.options) {
			if (hasDollarCurly(opt)) {
				lines.push(
					"\t\t\t// biome-ignore lint/suspicious/noTemplateCurlyInString: literal content from source bank",
				);
			}
			lines.push(`\t\t\t${JSON.stringify(opt)},`);
		}
		lines.push("\t\t],");
		lines.push(`\t\tcorrectAnswers: ${JSON.stringify(q.correctAnswers)},`);
		if (hasDollarCurly(q.explanation)) {
			lines.push("\t\texplanation:");
			lines.push(
				"\t\t// biome-ignore lint/suspicious/noTemplateCurlyInString: literal content from source bank",
			);
			lines.push(`\t\t${JSON.stringify(q.explanation)},`);
		} else {
			lines.push(`\t\texplanation: ${JSON.stringify(q.explanation)},`);
		}
		lines.push("\t\tsource: {");
		lines.push(`\t\t\tlabel: ${JSON.stringify(q.source.label)},`);
		lines.push(`\t\t\turl: ${JSON.stringify(q.source.url)},`);
		lines.push("\t\t},");
		if (q.whyNot) {
			if (hasDollarCurly(q.whyNot)) {
				lines.push(
					"\t\t// biome-ignore lint/suspicious/noTemplateCurlyInString: literal content from source bank",
				);
			}
			lines.push(`\t\twhyNot: ${JSON.stringify(q.whyNot)},`);
		}
		if (q.selectCount && q.selectCount > 1) {
			lines.push(`\t\tselectCount: ${q.selectCount},`);
		}
		lines.push("\t},");
	}

	lines.push("];");
	lines.push("");

	return lines.join("\n");
}

/**
 * Generate a config.ts file for a new certification.
 */
function generateConfigFile(certId, bank, importPath) {
	const meta = certMeta[certId];

	// Build domains object from domainMap
	const domainsObj = {};
	bank.domains.forEach((name, idx) => {
		const domainId = bank.domainMap[name] || `D${idx + 1}`;
		domainsObj[domainId] = {
			id: domainId,
			name: name,
			weight:
				Math.round(
					(bank.questions.filter((q) => q.domain === domainId).length / bank.totalQuestions) * 1000,
				) / 10,
		};
	});

	// Build examBlueprint from derived blueprint, mapped to domain IDs
	const examBlueprint = {};
	for (const [domainName, count] of Object.entries(bank.blueprint)) {
		const domainId = bank.domainMap[domainName] || "D1";
		examBlueprint[domainId] = count;
	}

	const lines = [
		`// ${bank.code} certification configuration — generated from Cert Pro Quest`,
		`// Source: ${snapshot.source.label}`,
		"",
		`import type { CertificationConfig } from "${importPath}";`,
		"",
		"export const config: CertificationConfig = {",
		`\tslug: ${JSON.stringify(meta.slug)},`,
		`\ttitle: ${JSON.stringify(meta.title)},`,
		`\tsubtitle: ${JSON.stringify(meta.subtitle)},`,
		`\tdescription: ${JSON.stringify(meta.description)},`,
		"\ttheme: {",
		`\t\tbrand: ${JSON.stringify(meta.brand)},`,
		`\t\tbrand2: ${JSON.stringify(meta.brand2)},`,
		`\t\tbrandSoft: ${JSON.stringify(meta.brandSoft)},`,
		"\t},",
		"\tdomains: {",
	];

	for (const [id, domain] of Object.entries(domainsObj)) {
		lines.push(
			`\t\t${id}: { id: ${JSON.stringify(id)}, name: ${JSON.stringify(domain.name)}, weight: ${domain.weight} },`,
		);
	}

	lines.push("\t},");
	lines.push("\texamBlueprint: {");
	for (const [id, count] of Object.entries(examBlueprint)) {
		lines.push(`\t\t${id}: ${count},`);
	}
	lines.push("\t},");
	lines.push(`\ttotalQuestions: ${Math.min(50, bank.totalQuestions)},`);
	lines.push(`\texamMinutes: ${meta.minutesPerQuestion * Math.min(50, bank.totalQuestions)},`);
	lines.push('\tblueprintSource: "derived",');
	lines.push("};");
	lines.push("");

	return lines.join("\n");
}

// Collect generated file paths so we can format them with Biome at the end
const generatedPaths = [];

// Generate files for each new cert (not CCDV-F which has special handling)
const nonCcdvfCerts = ["ccaof", "ccarp", "ccarf"];

for (const certId of nonCcdvfCerts) {
	const bank = banks[certId];
	if (!bank) {
		console.error(`Warning: No bank found for ${certId}`);
		continue;
	}

	const meta = certMeta[certId];
	const dir = resolve(SRC_DIR, meta.slug);
	mkdirSync(dir, { recursive: true });

	// Generate questions.ts directly in the cert directory
	const questionsPath = resolve(dir, "questions.ts");
	const questionsFile = generateQuestionsFile(certId, bank, "../../lib/quiz-types");
	writeFileSync(questionsPath, questionsFile, "utf-8");
	generatedPaths.push(questionsPath);
	console.log(`Generated ${questionsPath} (${bank.totalQuestions} questions)`);

	// Generate config.ts directly in the cert directory
	const configPath = resolve(dir, "config.ts");
	const configFile = generateConfigFile(certId, bank, "../../lib/quiz-types");
	writeFileSync(configPath, configFile, "utf-8");
	generatedPaths.push(configPath);
	console.log(`Generated ${configPath}`);
}

// Generate CCDV-F CPQ additions (separate module, not overwriting existing)
{
	const bank = banks.ccdvf;
	if (bank) {
		const dir = resolve(SRC_DIR, "ccdv-f", "cpq");
		mkdirSync(dir, { recursive: true });

		const questionsPath = resolve(dir, "questions.ts");
		const questionsFile = generateQuestionsFile("ccdvf", bank, "../../../lib/quiz-types");
		writeFileSync(questionsPath, questionsFile, "utf-8");
		generatedPaths.push(questionsPath);
		console.log(`Generated ${questionsPath} (${bank.totalQuestions} CPQ additions)`);
	}
}

// Format all generated files with Biome so they pass `pnpm exec biome check .`
console.log("\nFormatting generated files with Biome…");
formatWithBiome(generatedPaths);

console.log("\n✓ Generation complete");
