// Certification registry — add new certifications here

import type { CertificationConfig } from "../lib/quiz-types";
import type { Question } from "../lib/quiz-types";

interface CertificationEntry {
	config: CertificationConfig;
	questions: Question[];
}

const certifications: Record<string, CertificationEntry> = {};

// Lazy-load certifications to avoid bundling all questions at once
async function loadCertification(slug: string): Promise<CertificationEntry | null> {
	// Check cache first
	if (certifications[slug]) {
		return certifications[slug];
	}

	try {
		const mod = await import(`../certifications/${slug}/config.ts`);
		const questionsMod = await import(`../certifications/${slug}/questions.ts`);
		const entry: CertificationEntry = {
			config: mod.config,
			questions: questionsMod.questions,
		};
		certifications[slug] = entry;
		return entry;
	} catch {
		return null;
	}
}

// Get list of available slugs (for landing page)
async function getCertificationList(): Promise<CertificationConfig[]> {
	// For now, manually list available certifications
	// In the future, could use import.meta.glob for auto-discovery
	const slugs = ["ccdv-f"];
	const results = await Promise.all(slugs.map((s) => loadCertification(s)));
	return results.filter((r): r is CertificationEntry => r !== null).map((r) => r.config);
}

export { loadCertification, getCertificationList };
