/**
 * Pure utility functions for syncing Obsidian study notes to Astro content.
 *
 * @module study-sync
 */

// ---------------------------------------------------------------------------
// Slugify
// ---------------------------------------------------------------------------

/**
 * Convert arbitrary text to a URL-safe slug.
 *
 * - NFD normalize and strip diacritics (Í→i, á→a, ñ→n).
 * - Lowercase.
 * - Replace any sequence of non `[a-z0-9]` with `-`.
 * - Trim leading/trailing hyphens.
 *
 * @param {string} text
 * @returns {string}
 */
export function slugify(text) {
	return text
		.normalize("NFD")
		.replace(/[\u0300-\u036f]/g, "")
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, "-")
		.replace(/^-+|-+$/g, "");
}

/**
 * Compute the URL slug for a note basename.
 *
 * @param {string} basename - File basename without extension.
 * @returns {string}
 */
export function urlSlug(basename) {
	return slugify(basename);
}

// ---------------------------------------------------------------------------
// Wikilink parser
// ---------------------------------------------------------------------------

/**
 * Parse the raw content between `[[` and `]]` of an Obsidian wikilink.
 *
 * Rules:
 * - Split by `|` (unescaped).
 * - On each part, remove a trailing `\` and unescape `\|` → `|`.
 * - Trim whitespace on `target`.
 * - If `target` is empty after trimming → `null`.
 *
 * @param {string} raw - Text between `[[` and `]]`.
 * @returns {{ target: string | null, alias: string | null, heading: string | null }}
 */
export function parseWikilink(raw) {
	/** @type {{ target: string | null, alias: string | null, heading: string | null }} */
	const result = { target: null, alias: null, heading: null };

	// Split by `|` (all occurrences)
	const parts = raw.split("|");

	// Unescape each part: remove trailing `\` and replace `\|` → `|`
	function unescapePart(part) {
		return part.replace(/\\\|/g, "|").replace(/\\$/, "");
	}

	if (parts.length === 0) return result;

	const targetPart = unescapePart(parts[0]).trim();

	// Check for heading in target (A#B pattern)
	if (targetPart.includes("#")) {
		const hashIdx = targetPart.indexOf("#");
		result.target = targetPart.substring(0, hashIdx).trim() || null;
		result.heading = targetPart.substring(hashIdx + 1).trim() || null;
	} else {
		result.target = targetPart || null;
	}

	if (parts.length >= 2) {
		result.alias = unescapePart(parts[1]).trim() || null;
	}

	return result;
}

// ---------------------------------------------------------------------------
// Wikilinks converter
// ---------------------------------------------------------------------------

/**
 * Convert Obsidian wikilinks in markdown to relative Markdown links.
 *
 * - `[[X]]` → `[X](../<slugify(X)>/)`
 * - `[[X|A]]` → `[A](../<slugify(X)>/)`
 * - `[[X#H|A]]` → `[A](../<slugify(X)>/#<slugify(H)>)`
 * - `![[X]]` → same as `[[X]]` (no `!` prefix).
 * - If slug not in `knownSlugs` → plain text (alias or target), no broken link.
 * - Skips code blocks (``` ... ```) and inline code (` ... `).
 *
 * @param {string} markdown
 * @param {Set<string>} knownSlugs
 * @returns {{ converted: string, unresolved: string[] }}
 */
export function convertWikilinks(markdown, knownSlugs) {
	const unresolved = [];

	// Split markdown into segments: code blocks and normal text.
	// We process only non-code segments.
	const segments = splitCodeSegments(markdown);

	const processed = segments.map((seg) => {
		if (seg.type === "code") return seg.content;
		return convertWikilinksInText(seg.content, knownSlugs, unresolved);
	});

	return { converted: processed.join(""), unresolved };
}

/**
 * Split markdown into alternating code and non-code segments.
 * Code blocks are fenced with ``` (possibly with language tag).
 * Inline code is wrapped in backticks.
 *
 * @param {string} text
 * @returns {{ type: 'code' | 'text', content: string }[]}
 */
function splitCodeSegments(text) {
	/** @type {{ type: 'code' | 'text', content: string }[] } */
	const segments = [];
	// Match fenced code blocks first, then inline code
	const regex = /(```[\s\S]*?```)|(`[^`]+`)/g;
	let lastIdx = 0;
	let match;

	/* biome-ignore lint/suspicious/noAssignInExpressions: standard regex loop pattern */
	while ((match = regex.exec(text)) !== null) {
		// Text before this match
		if (match.index > lastIdx) {
			segments.push({ type: "text", content: text.slice(lastIdx, match.index) });
		}
		segments.push({ type: "code", content: match[0] });
		lastIdx = regex.lastIndex;
	}

	// Remaining text
	if (lastIdx < text.length) {
		segments.push({ type: "text", content: text.slice(lastIdx) });
	}

	return segments.length > 0 ? segments : [{ type: "text", content: text }];
}

/**
 * Convert wikilinks within a text segment (no code).
 *
 * @param {string} text
 * @param {Set<string>} knownSlugs
 * @param {string[]} unresolved - Accumulator for unresolved targets
 * @returns {string}
 */
function convertWikilinksInText(text, knownSlugs, unresolved) {
	// Match ![[...]] or [[...]]
	// The content inside can contain escaped pipes and hashes
	return text.replace(/(!?)\[\[([^\]]*)\]\]/g, (_full, _bang, raw) => {
		const parsed = parseWikilink(raw);

		if (!parsed.target) {
			// Empty target: just return the alias or raw text
			return parsed.alias || raw;
		}

		const targetSlug = slugify(parsed.target);
		const display = parsed.alias || parsed.target;

		if (!knownSlugs.has(targetSlug)) {
			unresolved.push(parsed.target);
			return display;
		}

		let link = `../${targetSlug}/`;
		if (parsed.heading) {
			link += `#${slugify(parsed.heading)}`;
		}

		return `[${display}](${link})`;
	});
}

// ---------------------------------------------------------------------------
// Callouts converter
// ---------------------------------------------------------------------------

/**
 * Convert Obsidian callout syntax to plain blockquote text.
 *
 * `> [!question] Title` → `> **Title**`
 * `> [!question]` (no title) → `>`
 *
 * Only applies at the start of a line within blockquotes.
 *
 * @param {string} markdown
 * @returns {string}
 */
export function convertCallouts(markdown) {
	return markdown.replace(/^(>\s*)\[![\w-]+\](?:\s+(.+))?$/gm, (_match, prefix, title) => {
		if (title) {
			return `${prefix}**${title}**`;
		}
		return ">";
	});
}

// ---------------------------------------------------------------------------
// Task lists converter
// ---------------------------------------------------------------------------

/**
 * Convert GFM task list markers to Unicode ballot boxes.
 *
 * - `[ ]` at the start of a list item becomes `☐`
 * - `[x]` / `[X]` at the start of a list item becomes `☑`
 * - Preserves leading indentation and list marker (`-`, `*`, `+`).
 * - Skips fenced code blocks and inline code.
 *
 * @param {string} markdown
 * @returns {string}
 */
export function convertTaskLists(markdown) {
	const segments = splitCodeSegments(markdown);

	const processed = segments.map((seg) => {
		if (seg.type === "code") return seg.content;
		return seg.content.replace(/^(\s*[-*+]\s+)\[([ xX])\]\s/gm, (_match, prefix, check) => {
			const box = check === " " ? "☐" : "☑";
			return `${prefix}${box} `;
		});
	});

	return processed.join("");
}

// ---------------------------------------------------------------------------
// Frontmatter helpers
// ---------------------------------------------------------------------------

/**
 * Split markdown into frontmatter and body.
 *
 * @param {string} markdown
 * @returns {{ frontmatter: string | null, body: string }}
 */
export function splitFrontmatter(markdown) {
	const match = markdown.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
	if (match) {
		return {
			frontmatter: `---\n${match[1]}\n---\n`,
			body: match[2],
		};
	}
	return { frontmatter: null, body: markdown };
}

// ---------------------------------------------------------------------------
// Leading H1 extractor
// ---------------------------------------------------------------------------

/**
 * Extract the leading H1 heading from the body.
 *
 * Only matches if the first non-empty block starts with `# `.
 * Removes that line and one following newline.
 *
 * @param {string} body
 * @returns {{ heading: string | null, rest: string }}
 */
export function extractLeadingH1(body) {
	// Find the first non-empty line
	const lines = body.split("\n");
	let h1LineIdx = -1;

	for (let i = 0; i < lines.length; i++) {
		if (lines[i].trim().length > 0) {
			h1LineIdx = i;
			break;
		}
	}

	if (h1LineIdx === -1) return { heading: null, rest: body };

	const h1Line = lines[h1LineIdx];
	if (!h1Line.startsWith("# ")) {
		return { heading: null, rest: body };
	}

	const heading = h1Line.substring(2).trim();
	// Remove the H1 line and one following newline if present
	const remaining = lines.slice(h1LineIdx + 1);
	let rest = remaining.join("\n");
	// Remove leading blank line after H1
	if (rest.startsWith("\n")) {
		rest = rest.substring(1);
	}

	return { heading, rest };
}

// ---------------------------------------------------------------------------
// Title ensure
// ---------------------------------------------------------------------------

/**
 * Ensure the frontmatter contains a `title` field.
 *
 * If frontmatter exists but has no `title`, insert one.
 * If no frontmatter exists, create a minimal block.
 * Title is serialized with JSON.stringify (YAML double-quoted).
 *
 * @param {string | null} frontmatter
 * @param {string} title
 * @returns {string}
 */
export function ensureTitle(frontmatter, title) {
	const quoted = JSON.stringify(title);

	if (!frontmatter) {
		return `---\ntitle: ${quoted}\n---\n`;
	}

	// Check if title already exists
	if (/^title\s*:/m.test(frontmatter)) {
		return frontmatter;
	}

	// Insert title after the opening `---`
	const lines = frontmatter.split("\n");
	// Find the first `---` line
	const idx = lines.findIndex((l) => l.trim() === "---");
	if (idx >= 0) {
		lines.splice(idx + 1, 0, `title: ${quoted}`);
		return lines.join("\n");
	}

	// Fallback: prepend title line
	return frontmatter.replace(/^---\n/, `---\ntitle: ${quoted}\n`);
}

// ---------------------------------------------------------------------------
// Prepare note
// ---------------------------------------------------------------------------

/**
 * Prepare an Obsidian note for publishing.
 *
 * Steps:
 * 1. Normalize CRLF → LF.
 * 2. Split frontmatter.
 * 3. Extract leading H1 (if present).
 * 4. Determine title: existing frontmatter title > H1 heading > fallbackTitle.
 * 5. Ensure title in frontmatter.
 * 6. Convert callouts.
 * 7. Convert task lists.
 * 8. Convert wikilinks.
 * 9. Remove the H1 line from body.
 *
 * @param {string} markdown
 * @param {{ knownSlugs: Set<string>, fallbackTitle: string }} opts
 * @returns {{ markdown: string, unresolved: string[] }}
 */
export function prepareNote(markdown, { knownSlugs, fallbackTitle }) {
	// 1. Normalize line endings
	const text = markdown.replace(/\r\n/g, "\n");

	// 2. Split frontmatter
	const { frontmatter, body } = splitFrontmatter(text);

	// 3. Extract leading H1
	const { heading, rest } = extractLeadingH1(body);

	// 4. Determine title
	// Check if frontmatter already has a title
	let existingTitle = null;
	if (frontmatter) {
		const titleMatch = frontmatter.match(/^title\s*:\s*["']?([^"'\n]+)["']?/m);
		if (titleMatch) {
			existingTitle = titleMatch[1].trim();
		}
	}

	const title = existingTitle || heading || fallbackTitle;

	// 5. Ensure title in frontmatter
	const updatedFrontmatter = ensureTitle(frontmatter, title);

	// 6. Convert callouts on the body (rest, without H1)
	let processedBody = convertCallouts(rest);

	// 7. Convert task lists
	processedBody = convertTaskLists(processedBody);

	// 8. Convert wikilinks
	const { converted, unresolved } = convertWikilinks(processedBody, knownSlugs);
	processedBody = converted;

	// Combine
	return { markdown: updatedFrontmatter + processedBody, unresolved };
}

// ---------------------------------------------------------------------------
// Slug collision detection
// ---------------------------------------------------------------------------

/**
 * Find slug collisions among a list of note slug entries.
 *
 * The caller passes already-computed URL slugs; this function does NOT slugify.
 *
 * @param {{ slug: string, source: string }[]} entries - Array of { slug, source } objects.
 * @returns {{ slug: string, sources: string[] }[]} Collisions (only slugs with >1 source).
 */
export function findSlugCollisions(entries) {
	/** @type {Map<string, string[]>} */
	const map = new Map();

	for (const entry of entries) {
		const existing = map.get(entry.slug) || [];
		existing.push(entry.source);
		map.set(entry.slug, existing);
	}

	return [...map.entries()]
		.filter(([, sources]) => sources.length > 1)
		.map(([slug, sources]) => ({ slug, sources }));
}

// ---------------------------------------------------------------------------
// Destination path computation
// ---------------------------------------------------------------------------

/**
 * Compute the destination path (without .md extension) for a note based on its
 * group, relative directory, and basename.
 *
 * @param {{ group: string, relativeDir: string, basename: string }} params
 * @returns {string} Destination path without .md extension.
 */
export function destPathForNote({ group, relativeDir, basename }) {
	const slug = urlSlug(basename);

	if (group === "knowledge") {
		// Special case: "00 - START HERE"
		if (basename === "00 - START HERE") {
			return "00-navigation/start-here";
		}
		// Top-level knowledge notes go to topics/
		if (relativeDir === "" || relativeDir === ".") {
			return `topics/${slug}`;
		}
		// Subdirectory knowledge notes: slugified dir segments + slug
		const dirSegments = relativeDir
			.split("/")
			.map((seg) => slugify(seg))
			.filter(Boolean);
		return [...dirSegments, slug].join("/");
	}

	if (group === "mso") {
		const dirSegments = relativeDir
			.split("/")
			.map((seg) => slugify(seg))
			.filter(Boolean);
		return ["mso-foundations", ...dirSegments, slug].join("/");
	}

	// group === "root"
	return `references/${slug}`;
}

// ---------------------------------------------------------------------------
// Humanize slug
// ---------------------------------------------------------------------------

/**
 * Convert a slug back to a human-readable title.
 *
 * - Replace `-` with spaces.
 * - Capitalize first letter of each word.
 *
 * @param {string} slug
 * @returns {string}
 */
export function humanizeSlug(slug) {
	return slug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}
