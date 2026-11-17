import { describe, expect, it } from "vitest";
import {
	convertCallouts,
	convertTaskLists,
	convertWikilinks,
	destPathForNote,
	ensureTitle,
	extractLeadingH1,
	findSlugCollisions,
	humanizeSlug,
	parseWikilink,
	prepareNote,
	slugify,
	splitFrontmatter,
	urlSlug,
} from "../../scripts/lib/study-sync.mjs";

// ---------------------------------------------------------------------------
// slugify
// ---------------------------------------------------------------------------

describe("slugify", () => {
	const cases: Array<[string, string]> = [
		["Workflows versus Agents", "workflows-versus-agents"],
		["CCDV-F - Índice de certificación", "ccdv-f-indice-de-certificacion"],
		["D1 - Agents and Workflows MOC", "d1-agents-and-workflows-moc"],
		[
			"How a developer reaches Claude - SDK versus raw REST",
			"how-a-developer-reaches-claude-sdk-versus-raw-rest",
		],
		[
			"Claude-Developer-Verified-Course-Notes-2026-11-13",
			"claude-developer-verified-course-notes-2026-11-13",
		],
		["CCDV-F - Mecánica de Messages API", "ccdv-f-mecanica-de-messages-api"],
		["MSO Foundations", "mso-foundations"],
		["temperature", "temperature"],
		["Claude Certified Developer – Foundations", "claude-certified-developer-foundations"],
		["01 - Agents and Workflows", "01-agents-and-workflows"],
	];

	it.each(cases)("slugify(%q) === %q", (input, expected) => {
		expect(slugify(input)).toBe(expected);
	});
});

// ---------------------------------------------------------------------------
// parseWikilink
// ---------------------------------------------------------------------------

describe("parseWikilink", () => {
	it("parses a plain target", () => {
		expect(parseWikilink("Agent Loop and Termination")).toEqual({
			target: "Agent Loop and Termination",
			alias: null,
			heading: null,
		});
	});

	it("parses target with alias", () => {
		expect(parseWikilink("Agent Loop and Termination|the loop")).toEqual({
			target: "Agent Loop and Termination",
			alias: "the loop",
			heading: null,
		});
	});

	it("parses target with heading (A#B)", () => {
		expect(parseWikilink("A#B")).toEqual({
			target: "A",
			alias: null,
			heading: "B",
		});
	});

	it("parses target with heading and alias (A#B|Alias)", () => {
		expect(parseWikilink("A#B|Alias")).toEqual({
			target: "A",
			alias: "Alias",
			heading: "B",
		});
	});

	it("parses escaped pipe in target and alias", () => {
		expect(
			parseWikilink("CCDV-F - Tokens, muestreo y razonamiento\\|Tokens, muestreo y razonamiento"),
		).toEqual({
			target: "CCDV-F - Tokens, muestreo y razonamiento",
			alias: "Tokens, muestreo y razonamiento",
			heading: null,
		});
	});
});

// ---------------------------------------------------------------------------
// convertWikilinks
// ---------------------------------------------------------------------------

describe("convertWikilinks", () => {
	const knownSlugs = new Set([
		"agent-loop-and-termination",
		"tokens-muestreo-y-razonamiento",
		"a",
		"b",
	]);

	it("converts a simple wikilink", () => {
		const { converted, unresolved } = convertWikilinks(
			"See [[Agent Loop and Termination]] for details.",
			knownSlugs,
		);
		expect(converted).toBe(
			"See [Agent Loop and Termination](../agent-loop-and-termination/) for details.",
		);
		expect(unresolved).toHaveLength(0);
	});

	it("converts a wikilink with alias", () => {
		const { converted } = convertWikilinks(
			"Check [[Agent Loop and Termination|the loop]].",
			knownSlugs,
		);
		expect(converted).toBe("Check [the loop](../agent-loop-and-termination/).");
	});

	it("converts a wikilink with heading", () => {
		const { converted } = convertWikilinks("Go to [[A#B]].", knownSlugs);
		expect(converted).toBe("Go to [A](../a/#b).");
	});

	it("converts a wikilink with heading and alias", () => {
		const { converted } = convertWikilinks("Go to [[A#B|Section B]].", knownSlugs);
		expect(converted).toBe("Go to [Section B](../a/#b).");
	});

	it("handles exclamation-mark image syntax", () => {
		const { converted } = convertWikilinks("Image: ![[Agent Loop and Termination]].", knownSlugs);
		expect(converted).toBe("Image: [Agent Loop and Termination](../agent-loop-and-termination/).");
	});

	it("leaves unknown targets as plain text", () => {
		const { converted, unresolved } = convertWikilinks(
			"[[Unknown Note]] and [[Unknown Note|alias]].",
			knownSlugs,
		);
		expect(converted).toBe("Unknown Note and alias.");
		expect(unresolved).toContain("Unknown Note");
	});

	it("does not convert wikilinks inside fenced code blocks", () => {
		const { converted } = convertWikilinks(
			"```text\n[[Agent Loop and Termination]]\n```",
			knownSlugs,
		);
		expect(converted).toBe("```text\n[[Agent Loop and Termination]]\n```");
	});

	it("does not convert wikilinks inside inline code", () => {
		const { converted } = convertWikilinks(
			"Use `[[Agent Loop and Termination]]` in code.",
			knownSlugs,
		);
		expect(converted).toBe("Use `[[Agent Loop and Termination]]` in code.");
	});
});

// ---------------------------------------------------------------------------
// convertTaskLists
// ---------------------------------------------------------------------------

describe("convertTaskLists", () => {
	it("converts unchecked [ ] to ☐", () => {
		expect(convertTaskLists("- [ ] todo item")).toBe("- ☐ todo item");
	});

	it("converts lowercase [x] to ☑", () => {
		expect(convertTaskLists("- [x] done item")).toBe("- ☑ done item");
	});

	it("converts uppercase [X] to ☑", () => {
		expect(convertTaskLists("- [X] done item")).toBe("- ☑ done item");
	});

	it("preserves indentation and marker", () => {
		expect(convertTaskLists("  - [ ] indented item")).toBe("  - ☐ indented item");
	});

	it("preserves * marker", () => {
		expect(convertTaskLists("* [ ] star item")).toBe("* ☐ star item");
	});

	it("preserves + marker", () => {
		expect(convertTaskLists("+ [x] plus item")).toBe("+ ☑ plus item");
	});

	it("leaves fenced code blocks untouched", () => {
		const input = "```\n- [ ] code task\n```";
		expect(convertTaskLists(input)).toBe(input);
	});

	it("leaves inline code untouched", () => {
		expect(convertTaskLists("Use `[ ]` in code.")).toBe("Use `[ ]` in code.");
	});

	it("leaves [ ] not at line start untouched", () => {
		expect(convertTaskLists("Some text [ ] not a task")).toBe("Some text [ ] not a task");
	});
});

// ---------------------------------------------------------------------------
// convertCallouts
// ---------------------------------------------------------------------------

describe("convertCallouts", () => {
	it("converts callout with title", () => {
		expect(convertCallouts("> [!question] What is an agent?")).toBe("> **What is an agent?**");
	});

	it("converts callout without title", () => {
		expect(convertCallouts("> [!tip]")).toBe(">");
	});

	it("preserves regular blockquotes", () => {
		expect(convertCallouts("> This is a quote")).toBe("> This is a quote");
	});

	it("handles multiple callouts", () => {
		const input = ["> [!note] Reminder", "> [!warning] Be careful"].join("\n");
		const output = ["> **Reminder**", "> **Be careful**"].join("\n");
		expect(convertCallouts(input)).toBe(output);
	});
});

// ---------------------------------------------------------------------------
// splitFrontmatter
// ---------------------------------------------------------------------------

describe("splitFrontmatter", () => {
	it("splits frontmatter and body", () => {
		const md = "---\ntags: [test]\n---\n# Hello\n\nBody text.";
		const { frontmatter, body } = splitFrontmatter(md);
		expect(frontmatter).toBe("---\ntags: [test]\n---\n");
		expect(body).toBe("# Hello\n\nBody text.");
	});

	it("returns null frontmatter when absent", () => {
		const md = "# Hello\n\nNo frontmatter here.";
		const { frontmatter, body } = splitFrontmatter(md);
		expect(frontmatter).toBeNull();
		expect(body).toBe(md);
	});
});

// ---------------------------------------------------------------------------
// extractLeadingH1
// ---------------------------------------------------------------------------

describe("extractLeadingH1", () => {
	it("extracts the leading H1", () => {
		const { heading, rest } = extractLeadingH1("# My Title\n\nSome content.");
		expect(heading).toBe("My Title");
		expect(rest).toBe("Some content.");
	});

	it("returns null when no H1", () => {
		const { heading, rest } = extractLeadingH1("## H2 only\n\nContent.");
		expect(heading).toBeNull();
		expect(rest).toBe("## H2 only\n\nContent.");
	});

	it("skips leading blank lines before H1", () => {
		const { heading, rest } = extractLeadingH1("\n\n# Title\n\nBody.");
		expect(heading).toBe("Title");
		expect(rest).toBe("Body.");
	});
});

// ---------------------------------------------------------------------------
// ensureTitle
// ---------------------------------------------------------------------------

describe("ensureTitle", () => {
	it("creates frontmatter when none exists", () => {
		const result = ensureTitle(null, "New Title");
		expect(result).toBe('---\ntitle: "New Title"\n---\n');
	});

	it("inserts title when frontmatter lacks it", () => {
		const fm = "---\ntags: [test]\n---\n";
		const result = ensureTitle(fm, "Inserted Title");
		expect(result).toBe('---\ntitle: "Inserted Title"\ntags: [test]\n---\n');
	});

	it("leaves frontmatter unchanged when title exists", () => {
		const fm = '---\ntitle: "Existing"\ntags: [test]\n---\n';
		const result = ensureTitle(fm, "Should Not Appear");
		expect(result).toBe(fm);
	});
});

// ---------------------------------------------------------------------------
// prepareNote
// ---------------------------------------------------------------------------

describe("prepareNote", () => {
	const knownSlugs = new Set(["agent-loop-and-termination"]);

	it("uses existing frontmatter title", () => {
		const md =
			'---\ntitle: "Existing Title"\n---\n# H1 Heading\n\nBody with [[Agent Loop and Termination]].';
		const { markdown, unresolved } = prepareNote(md, { knownSlugs, fallbackTitle: "Fallback" });
		expect(markdown).toContain('title: "Existing Title"');
		expect(markdown).not.toContain("# H1 Heading");
		expect(markdown).toContain("[Agent Loop and Termination](../agent-loop-and-termination/)");
		expect(unresolved).toHaveLength(0);
	});

	it("uses H1 as title when frontmatter has no title", () => {
		const md = "---\ntags: [test]\n---\n# From H1\n\nBody.";
		const { markdown } = prepareNote(md, { knownSlugs, fallbackTitle: "Fallback" });
		expect(markdown).toContain('title: "From H1"');
		expect(markdown).not.toContain("# From H1");
	});

	it("uses fallbackTitle when no title or H1", () => {
		const md = "---\ntags: [test]\n---\n## H2\n\nBody.";
		const { markdown } = prepareNote(md, { knownSlugs, fallbackTitle: "Fallback" });
		expect(markdown).toContain('title: "Fallback"');
	});

	it("normalizes CRLF line endings", () => {
		const md = "---\r\ntags: [test]\r\n---\r\n# Title\r\n\r\nBody.";
		const { markdown } = prepareNote(md, { knownSlugs, fallbackTitle: "Fallback" });
		expect(markdown).not.toContain("\r");
	});

	it("converts callouts in the body", () => {
		const md = "# Note\n\n> [!tip] Remember this";
		const { markdown } = prepareNote(md, { knownSlugs, fallbackTitle: "Fallback" });
		expect(markdown).toContain("> **Remember this**");
		expect(markdown).not.toContain("[!tip]");
	});

	it("reports unresolved wikilinks", () => {
		const md = "# Note\n\nBody with [[Unknown Target]].";
		const { markdown, unresolved } = prepareNote(md, { knownSlugs, fallbackTitle: "Fallback" });
		expect(markdown).toContain("Unknown Target");
		expect(markdown).not.toContain("[[Unknown Target]]");
		expect(unresolved).toContain("Unknown Target");
	});
});

// ---------------------------------------------------------------------------
// urlSlug
// ---------------------------------------------------------------------------

describe("urlSlug", () => {
	it("delegates to slugify", () => {
		expect(urlSlug("Workflows versus Agents")).toBe("workflows-versus-agents");
	});

	it("handles already-slugified input", () => {
		expect(urlSlug("temperature")).toBe("temperature");
	});
});

// ---------------------------------------------------------------------------
// findSlugCollisions
// ---------------------------------------------------------------------------

describe("findSlugCollisions", () => {
	it("returns empty array when no collisions", () => {
		const collisions = findSlugCollisions([
			{ slug: "note-a", source: "/path/to/note-a.md" },
			{ slug: "note-b", source: "/path/to/note-b.md" },
			{ slug: "note-c", source: "/path/to/note-c.md" },
		]);
		expect(collisions).toEqual([]);
	});

	it("detects collisions", () => {
		const collisions = findSlugCollisions([
			{ slug: "workflows-versus-agents", source: "/vault/Workflows versus Agents.md" },
			{ slug: "workflows-versus-agents", source: "/vault/workflows-versus-agents.md" },
		]);
		expect(collisions).toHaveLength(1);
		expect(collisions[0].slug).toBe("workflows-versus-agents");
		expect(collisions[0].sources).toHaveLength(2);
		expect(collisions[0].sources).toContain("/vault/Workflows versus Agents.md");
		expect(collisions[0].sources).toContain("/vault/workflows-versus-agents.md");
	});

	it("does not slugify — uses the passed slug as-is", () => {
		const collisions = findSlugCollisions([
			{ slug: "already-slugified", source: "A.md" },
			{ slug: "already-slugified", source: "B.md" },
		]);
		expect(collisions).toHaveLength(1);
		expect(collisions[0].slug).toBe("already-slugified");
	});
});

// ---------------------------------------------------------------------------
// destPathForNote
// ---------------------------------------------------------------------------

describe("destPathForNote", () => {
	// --- knowledge group ---
	it("maps knowledge subdirectory notes to slugified dir + slug", () => {
		// Row: CCDV-F - Base de conocimiento/<carpeta>/… → <carpeta-slug>/…
		expect(
			destPathForNote({
				group: "knowledge",
				relativeDir: "01 - Agents and Workflows",
				basename: "Agent Loop and Termination",
			}),
		).toBe("01-agents-and-workflows/agent-loop-and-termination");
	});

	it("maps knowledge subdirectory notes with nested dirs", () => {
		expect(
			destPathForNote({
				group: "knowledge",
				relativeDir: "02 - Applications and Integration/Sub Folder",
				basename: "Some Note",
			}),
		).toBe("02-applications-and-integration/sub-folder/some-note");
	});

	it("maps knowledge top-level notes to topics/", () => {
		// Row: CCDV-F - Base de conocimiento/*.md (resto) → topics/<slug>.md
		expect(
			destPathForNote({
				group: "knowledge",
				relativeDir: "",
				basename: "Temperature Sampling",
			}),
		).toBe("topics/temperature-sampling");
	});

	it("maps knowledge top-level notes (dot dir) to topics/", () => {
		expect(
			destPathForNote({
				group: "knowledge",
				relativeDir: ".",
				basename: "Temperature Sampling",
			}),
		).toBe("topics/temperature-sampling");
	});

	it("maps '00 - START HERE' to 00-navigation/start-here", () => {
		// Row: CCDV-F - Base de conocimiento/00 - START HERE.md → 00-navigation/start-here.md
		expect(
			destPathForNote({
				group: "knowledge",
				relativeDir: "",
				basename: "00 - START HERE",
			}),
		).toBe("00-navigation/start-here");
	});

	// --- mso group ---
	it("maps mso notes to mso-foundations/ + slug", () => {
		// Row: MSO Foundations/… → mso-foundations/…
		expect(
			destPathForNote({
				group: "mso",
				relativeDir: "",
				basename: "MSO Overview",
			}),
		).toBe("mso-foundations/mso-overview");
	});

	it("maps mso subdirectory notes preserving structure", () => {
		expect(
			destPathForNote({
				group: "mso",
				relativeDir: "Sub Folder",
				basename: "MSO Detail",
			}),
		).toBe("mso-foundations/sub-folder/mso-detail");
	});

	it("maps mso notes with empty relativeDir", () => {
		expect(
			destPathForNote({
				group: "mso",
				relativeDir: ".",
				basename: "Another MSO Note",
			}),
		).toBe("mso-foundations/another-mso-note");
	});

	// --- root group ---
	it("maps root notes to references/ + slug", () => {
		// Row: *.md en la raíz de la bóveda → references/<slug>.md
		expect(
			destPathForNote({
				group: "root",
				relativeDir: "",
				basename: "Claude Developer Verified Course Notes",
			}),
		).toBe("references/claude-developer-verified-course-notes");
	});
});

// ---------------------------------------------------------------------------
// humanizeSlug
// ---------------------------------------------------------------------------

describe("humanizeSlug", () => {
	it("capitalizes each word", () => {
		expect(humanizeSlug("agent-loop-and-termination")).toBe("Agent Loop And Termination");
	});

	it("handles single-word slugs", () => {
		expect(humanizeSlug("temperature")).toBe("Temperature");
	});
});
