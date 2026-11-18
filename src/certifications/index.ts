// Certification registry — auto-discovers certifications via import.meta.glob

import type { CertificationConfig, Question } from "../lib/quiz-types";

interface CertificationEntry {
	config: CertificationConfig;
	questions: Question[];
}

const certifications: Record<string, CertificationEntry> = {};

// Deterministic order: ccdv-f, ccao-f, ccar-p, ccar-f
const slugOrder = ["ccdv-f", "ccao-f", "ccar-p", "ccar-f"];

// Auto-discover config and questions modules
const configModules = import.meta.glob("../certifications/*/config.ts", { eager: true });
const questionsModules = import.meta.glob("../certifications/*/questions.ts", { eager: true });

/** Extract the certification slug from a glob key (segment immediately before config.ts / questions.ts) */
function extractSlug(path: string): string {
	const match = path.match(/(?:^|\/)([^/]+)\/(?:config|questions)\.ts$/);
	return match ? match[1] : "";
}

// Build maps keyed by slug from the glob results
const configMap: Record<string, { config: CertificationConfig }> = {};
const questionsMap: Record<string, { questions: Question[] }> = {};
for (const [path, mod] of Object.entries(configModules)) {
	const slug = extractSlug(path);
	if (slug) configMap[slug] = mod as { config: CertificationConfig };
}
for (const [path, mod] of Object.entries(questionsModules)) {
	const slug = extractSlug(path);
	if (slug) questionsMap[slug] = mod as { questions: Question[] };
}

// Lazy-load certifications to avoid bundling all questions at once
async function loadCertification(slug: string): Promise<CertificationEntry | null> {
	// Check cache first
	if (certifications[slug]) {
		return certifications[slug];
	}

	try {
		const configMod = configMap[slug];
		const questionsMod = questionsMap[slug];

		if (!configMod || !questionsMod) {
			return null;
		}

		const entry: CertificationEntry = {
			config: configMod.config,
			questions: questionsMod.questions,
		};
		certifications[slug] = entry;
		return entry;
	} catch {
		return null;
	}
}

// Get list of available certifications in deterministic order
async function getCertificationList(): Promise<CertificationConfig[]> {
	const discoveredSlugs = Object.keys(configModules)
		.map(extractSlug)
		.filter((s) => s.length > 0);

	// Merge discovered slugs with the order list, keeping deterministic order
	const orderedSlugs = slugOrder.filter((s) => discoveredSlugs.includes(s));
	// Add any discovered slugs not in the order list (future-proofing)
	for (const s of discoveredSlugs) {
		if (!orderedSlugs.includes(s)) {
			orderedSlugs.push(s);
		}
	}

	const results = await Promise.all(orderedSlugs.map((s) => loadCertification(s)));
	return results.filter((r): r is CertificationEntry => r !== null).map((r) => r.config);
}

export { getCertificationList, loadCertification };
