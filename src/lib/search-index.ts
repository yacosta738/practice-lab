import { getCollection } from "astro:content";
import { getCertificationList } from "../certifications/index";
import { studyCerts } from "../study/registry";
import { base } from "./base";
import { toNoteMeta } from "./study-groups";
import { normalizeSearchText, type SearchItem } from "./study-search";

/** Build a lightweight static search index for the ⌘K palette (certifications + study notes). */
export async function getSearchIndex(): Promise<SearchItem[]> {
	const items: SearchItem[] = [];
	const certs = await getCertificationList();

	for (const cert of certs) {
		items.push({
			title: cert.title,
			href: `${base}certifications/${cert.slug}/`,
			category: "Certification",
			badge: cert.subtitle,
		});
	}

	const studyEntries = await getCollection("study");
	const studyEntryById = new Map(studyEntries.map((entry) => [entry.id, entry]));
	for (const cert of studyCerts) {
		items.push({
			title: `${cert.title} — Study Library`,
			href: `${base}study/${cert.slug}/`,
			category: "Study Library",
			badge: cert.subtitle,
		});
		const notes = studyEntries
			.filter((entry) => entry.id.startsWith(`${cert.slug}/`))
			.map(toNoteMeta);
		for (const note of notes) {
			const domain = cert.certification.domains[note.sectionId];
			items.push({
				title: note.title,
				href: `${base}study/${cert.slug}/${note.slug}/`,
				category: "Study Note",
				badge: domain ? `${note.sectionId} · ${domain.name}` : cert.subtitle,
				text: normalizeSearchText(studyEntryById.get(note.entryId)?.body ?? ""),
			});
		}
	}

	return items;
}
