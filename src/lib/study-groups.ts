import { createHash } from "node:crypto";

/** Types and helpers for grouping study notes into certification sections. */

export interface StudyNoteMeta {
	slug: string;
	id: string;
	entryId: string;
	aliases: string[];
	title: string;
	sectionId: string;
	revision: string;
	updated?: string;
	kind?: string;
}

export interface StudySection {
	id: string;
	title: string;
	domain?: string;
	weight?: number;
	notes: StudyNoteMeta[];
}

export interface StudyEntry {
	id: string;
	body?: string;
	data: {
		title: string;
		noteId?: string;
		aliases?: string[];
		updated?: string | Date;
		type?: string;
		tipo?: string;
	};
}

/** Return the last '/'-separated segment of an entry id. */
export function noteSlug(id: string): string {
	const segments = id.split("/");
	return segments[segments.length - 1] ?? "";
}

/** Fail route generation when two notes in one certification share a public slug. */
export function assertUniqueNoteSlugs<T extends Pick<StudyNoteMeta, "slug" | "id">>(
	notes: readonly T[],
): void {
	const idBySlug = new Map<string, string>();
	for (const note of notes) {
		const previousId = idBySlug.get(note.slug);
		if (previousId) {
			throw new Error(
				`Duplicate study-note slug "${note.slug}" for ids "${previousId}" and "${note.id}"`,
			);
		}
		idBySlug.set(note.slug, note.id);
	}
}

/**
 * Return the section id for a given entry id.
 *
 * The id format is `ccdv-f/<section>/<slug>` or `ccdv-f/<section>/<sub>/<slug>`.
 * The section id is the segment at index 1 (after the certification segment).
 * Returns '' when the id has fewer than 3 segments.
 */
export function sectionIdForId(id: string): string {
	const segments = id.split("/");
	if (segments.length < 3) {
		return "";
	}
	const folderSegment = segments[1];
	return SECTION_FOLDER_TO_ID[folderSegment] ?? "";
}

/** Convert a content entry to a StudyNoteMeta. */
export function toNoteMeta(entry: StudyEntry): StudyNoteMeta {
	const slug = noteSlug(entry.id);
	const sectionId = sectionIdForId(entry.id);
	const id = entry.data.noteId?.trim() || entry.id;
	const aliases = [
		...new Set([...(entry.data.aliases ?? []), ...(id === entry.id ? [] : [entry.id])]),
	];
	const rawUpdated = entry.data.updated;
	const updated =
		rawUpdated instanceof Date
			? `${rawUpdated.getFullYear()}-${String(rawUpdated.getMonth() + 1).padStart(2, "0")}-${String(rawUpdated.getDate()).padStart(2, "0")}`
			: rawUpdated !== undefined
				? String(rawUpdated)
				: undefined;

	return {
		slug,
		id,
		entryId: entry.id,
		aliases,
		title: entry.data.title,
		sectionId,
		revision: noteRevision(entry.data.title, entry.body ?? ""),
		kind: entry.data.type ?? entry.data.tipo,
		updated,
	};
}

function noteRevision(title: string, body: string): string {
	return `sha256-${createHash("sha256")
		.update(JSON.stringify([title, body]))
		.digest("hex")}`;
}

/** Map from folder segment to the canonical section id. */
export const SECTION_FOLDER_TO_ID: Record<string, string> = {
	"00-navigation": "00-navigation",
	"01-agents-and-workflows": "D1",
	"02-applications-and-integration": "D2",
	"03-claude-code": "D3",
	"04-evals-testing-and-debugging": "D4",
	"05-model-selection-and-optimization": "D5",
	"06-prompt-and-context-engineering": "D6",
	"07-security-and-safety": "D7",
	"08-tools-and-mcps": "D8",
	"09-labs-and-practice": "09-labs-and-practice",
	"10-sources-and-evidence": "10-sources-and-evidence",
	"01-agent-architecture-and-orchestration": "D1",
	"02-production-integration-and-grounding": "D2",
	"03-observability-and-production-monitoring": "D3",
	"04-debugging-and-incident-response": "D4",
	"05-evaluation-engineering-and-quality-assurance": "D5",
	"06-cost-and-latency-optimization": "D6",
	"07-runtime-guardrails-and-production-security": "D7",
	"08-agent-fleet-operations": "D8",
	"11-prompting-and-task-execution": "D1",
	"12-output-evaluation-and-validation": "D2",
	"13-product-and-model-selection": "D3",
	"14-workflow-integration-and-solution-design": "D4",
	"15-configuration-and-knowledge-management": "D5",
	"16-governance-risk-and-responsible-use": "D6",
	"17-troubleshooting-and-optimization": "D7",
	topics: "topics",
	"mso-foundations": "mso-foundations",
	references: "references",
};

/** Canonical section ordering. */
export const SECTION_ORDER: readonly string[] = [
	"00-navigation",
	"D1",
	"D2",
	"D3",
	"D4",
	"D5",
	"D6",
	"D7",
	"D8",
	"09-labs-and-practice",
	"10-sources-and-evidence",
	"topics",
	"mso-foundations",
	"references",
];

/** Human-readable titles for non-domain sections. */
export const SECTION_TITLES: Record<string, string> = {
	"00-navigation": "Start & Navigation",
	"09-labs-and-practice": "Labs & Practice",
	"10-sources-and-evidence": "Sources & Evidence",
	topics: "Topic Briefs",
	"mso-foundations": "MSO Foundations",
	references: "References & Course Notes",
};

/**
 * Group an array of notes into sections ordered by SECTION_ORDER.
 *
 * - Sections with no notes are skipped.
 * - Notes whose sectionId is not in SECTION_ORDER are ignored.
 * - Domain section titles are `"<id> <name>"` with domain and weight set.
 * - Notes inside each section are sorted alphabetically by title.
 */
export function groupNotes(
	notes: StudyNoteMeta[],
	domains: Record<string, { id: string; name: string; weight: number }>,
): StudySection[] {
	const orderSet = new Set(SECTION_ORDER);

	// Bucket notes by section id, filtering out unknown sections.
	const buckets = new Map<string, StudyNoteMeta[]>();
	for (const note of notes) {
		if (!orderSet.has(note.sectionId)) {
			continue;
		}
		const bucket = buckets.get(note.sectionId);
		if (bucket) {
			bucket.push(note);
		} else {
			buckets.set(note.sectionId, [note]);
		}
	}

	// Build sections in canonical order, skipping empty buckets.
	const sections: StudySection[] = [];
	for (const sectionId of SECTION_ORDER) {
		const bucket = buckets.get(sectionId);
		if (!bucket || bucket.length === 0) {
			continue;
		}

		const sorted = [...bucket].sort((a, b) => a.title.localeCompare(b.title, "en"));

		// Check if this is a domain section.
		const domainInfo = domains[sectionId];
		if (domainInfo) {
			sections.push({
				id: sectionId,
				title: `${domainInfo.id} ${domainInfo.name}`,
				domain: domainInfo.id,
				weight: domainInfo.weight,
				notes: sorted,
			});
		} else {
			const title = SECTION_TITLES[sectionId] ?? sectionId;
			sections.push({
				id: sectionId,
				title,
				notes: sorted,
			});
		}
	}

	return sections;
}
