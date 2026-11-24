import { describe, expect, it } from "vitest";
import {
	assertUniqueNoteSlugs,
	groupNotes,
	noteSlug,
	type StudyEntry,
	type StudyNoteMeta,
	sectionIdForId,
	toNoteMeta,
} from "../../src/lib/study-groups";

/* ------------------------------------------------------------------ */
/* noteSlug                                                             */
/* ------------------------------------------------------------------ */

describe("noteSlug", () => {
	it("returns the last segment for a flat id", () => {
		expect(noteSlug("ccdv-f/topics/some-note")).toBe("some-note");
	});

	it("returns the last segment for a deeply nested id", () => {
		expect(noteSlug("ccdv-f/mso-foundations/how-llms-behave/non-determinism")).toBe(
			"non-determinism",
		);
	});

	it("returns the only segment for a single-segment id", () => {
		expect(noteSlug("only")).toBe("only");
	});
});

describe("assertUniqueNoteSlugs", () => {
	it("accepts notes with distinct public slugs", () => {
		expect(() =>
			assertUniqueNoteSlugs([
				{ slug: "first", id: "ccdv-f/topics/first", title: "First", sectionId: "topics" },
				{
					slug: "second",
					id: "ccdv-f/references/second",
					title: "Second",
					sectionId: "references",
				},
			]),
		).not.toThrow();
	});

	it("rejects duplicate public slugs even when source ids differ", () => {
		expect(() =>
			assertUniqueNoteSlugs([
				{ slug: "shared", id: "ccdv-f/topics/shared", title: "Topic", sectionId: "topics" },
				{
					slug: "shared",
					id: "ccdv-f/references/nested/shared",
					title: "Reference",
					sectionId: "references",
				},
			]),
		).toThrow(/Duplicate study-note slug "shared"/);
	});
});

/* ------------------------------------------------------------------ */
/* sectionIdForId                                                       */
/* ------------------------------------------------------------------ */

describe("sectionIdForId", () => {
	it("returns the section for ccdv-f/topics/x", () => {
		expect(sectionIdForId("ccdv-f/topics/x")).toBe("topics");
	});

	it("returns the section for ccdv-f/mso-foundations/how-llms-behave/x", () => {
		expect(sectionIdForId("ccdv-f/mso-foundations/how-llms-behave/x")).toBe("mso-foundations");
	});

	it("returns empty string when there are fewer than 3 segments", () => {
		expect(sectionIdForId("ccdv-f/x")).toBe("");
		expect(sectionIdForId("ccdv-f")).toBe("");
	});

	it("maps folder segment '01-agents-and-workflows' to 'D1'", () => {
		expect(sectionIdForId("ccdv-f/01-agents-and-workflows/agent-loop-and-termination")).toBe("D1");
	});

	it("maps folder segment '08-tools-and-mcps' to 'D8'", () => {
		expect(sectionIdForId("ccdv-f/08-tools-and-mcps/tool-schema-and-tool-result-lifecycle")).toBe(
			"D8",
		);
	});

	it("returns 'mso-foundations' for nested mso-foundations id", () => {
		expect(sectionIdForId("ccdv-f/mso-foundations/how-llms-behave/tokens")).toBe("mso-foundations");
	});

	it("returns empty string for an unknown folder segment", () => {
		expect(sectionIdForId("ccdv-f/unknown-folder/some-note")).toBe("");
	});
});

/* ------------------------------------------------------------------ */
/* toNoteMeta                                                           */
/* ------------------------------------------------------------------ */

describe("toNoteMeta", () => {
	it("builds meta from an entry with string updated", () => {
		const entry: StudyEntry = {
			id: "ccdv-f/01-agents-and-workflows/agent-loop",
			data: { title: "Agent Loop", updated: "2026-11-15", type: "atomic-note" },
		};
		const meta = toNoteMeta(entry);

		expect(meta.slug).toBe("agent-loop");
		expect(meta.sectionId).toBe("D1");
		expect(meta.title).toBe("Agent Loop");
		expect(meta.kind).toBe("atomic-note");
		expect(meta.updated).toBe("2026-11-15");
	});

	it("builds meta from an entry with Date updated", () => {
		const entry: StudyEntry = {
			id: "ccdv-f/references/temperature",
			data: { title: "Temperature", updated: new Date(2026, 5, 1) },
		};
		const meta = toNoteMeta(entry);

		expect(meta.updated).toBe("2026-06-01");
	});

	it("falls back to tipo when type is missing", () => {
		const entry: StudyEntry = {
			id: "ccdv-f/topics/ccdv-f-arquitectura",
			data: { title: "Arquitectura", tipo: "concepto" },
		};
		const meta = toNoteMeta(entry);

		expect(meta.kind).toBe("concepto");
	});

	it("leaves updated undefined when not provided", () => {
		const entry: StudyEntry = {
			id: "ccdv-f/02-applications-and-integration/integration",
			data: { title: "Integration" },
		};
		const meta = toNoteMeta(entry);

		expect(meta.updated).toBeUndefined();
	});
});

/* ------------------------------------------------------------------ */
/* groupNotes                                                           */
/* ------------------------------------------------------------------ */

const domains = {
	D1: { id: "D1", name: "Agents & Workflows", weight: 14.7 },
	D2: { id: "D2", name: "Applications & Integration", weight: 33.1 },
};

function note(
	sectionId: string,
	title: string,
	slug = title.toLowerCase().replace(/\s+/g, "-"),
): StudyNoteMeta {
	return { slug, id: `ccdv-f/${sectionId}/${slug}`, title, sectionId };
}

describe("groupNotes", () => {
	it("orders navigation before D1", () => {
		const notes = [note("D1", "Beta"), note("00-navigation", "Alpha")];
		const sections = groupNotes(notes, domains);

		expect(sections.map((s) => s.id)).toEqual(["00-navigation", "D1"]);
	});

	it("orders D1..D8 before labs", () => {
		const notes = [note("09-labs-and-practice", "Lab"), note("D1", "Alpha"), note("D2", "Beta")];
		const sections = groupNotes(notes, domains);

		expect(sections.map((s) => s.id)).toEqual(["D1", "D2", "09-labs-and-practice"]);
	});

	it("ignores notes with an unknown sectionId", () => {
		const notes = [note("unknown-section", "Ghost"), note("D1", "Real")];
		const sections = groupNotes(notes, domains);

		expect(sections.length).toBe(1);
		expect(sections[0].id).toBe("D1");
	});

	it("drops sections with no notes", () => {
		const notes = [note("D1", "Only")];
		const sections = groupNotes(notes, domains);

		expect(sections.map((s) => s.id)).toEqual(["D1"]);
		expect(sections).not.toHaveLength(2);
	});

	it("sorts notes alphabetically by title within each section", () => {
		const notes = [note("D1", "Zebra"), note("D1", "Apple"), note("D1", "Mango")];
		const sections = groupNotes(notes, domains);

		expect(sections[0].notes.map((n) => n.title)).toEqual(["Apple", "Mango", "Zebra"]);
	});

	it("sets domain title, domain and weight for domain sections", () => {
		const notes = [note("D1", "Agents")];
		const sections = groupNotes(notes, domains);

		expect(sections[0].title).toBe("D1 Agents & Workflows");
		expect(sections[0].domain).toBe("D1");
		expect(sections[0].weight).toBe(14.7);
	});

	it("uses SECTION_TITLES for non-domain sections", () => {
		const notes = [note("00-navigation", "Start")];
		const sections = groupNotes(notes, domains);

		expect(sections[0].title).toBe("Start & Navigation");
		expect(sections[0].domain).toBeUndefined();
	});

	it("places a D1 note in a section with correct id, domain, and weight", () => {
		const notes: StudyNoteMeta[] = [
			{
				slug: "agent-loop",
				id: "ccdv-f/01-agents-and-workflows/agent-loop",
				title: "Agent Loop",
				sectionId: "D1",
			},
		];
		const sections = groupNotes(notes, domains);

		expect(sections.length).toBe(1);
		expect(sections[0].id).toBe("D1");
		expect(sections[0].domain).toBe("D1");
		expect(sections[0].weight).toBe(14.7);
	});

	it("returns one section per valid note and drops invalid notes", () => {
		const notes: StudyNoteMeta[] = [
			{ slug: "a", id: "ccdv-f/01-agents-and-workflows/a", title: "A", sectionId: "D1" },
			{ slug: "b", id: "ccdv-f/02-applications-and-integration/b", title: "B", sectionId: "D2" },
			{ slug: "ghost", id: "ccdv-f/unknown/ghost", title: "Ghost", sectionId: "unknown" },
		];
		const sections = groupNotes(notes, domains);

		expect(sections.length).toBe(2);
	});
});
