#!/usr/bin/env node

/**
 * CLI script to sync Obsidian study notes to Astro content.
 *
 * Usage:
 *   node scripts/sync-study.mjs
 *
 * Environment:
 *   STUDY_SOURCE  - Path to the Obsidian vault (defaults to iCloud path).
 */

import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import {
	destPathForNote,
	findSlugCollisions,
	humanizeSlug,
	prepareNote,
	urlSlug,
} from "./lib/study-sync.mjs";

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------

const SOURCE =
	process.env.STUDY_SOURCE ||
	path.join(
		os.homedir(),
		"Library/Mobile Documents/iCloud~md~obsidian/Documents/🧠/Efforts/On/Claude Certified Developer",
	);

const DEST_BASE = path.resolve("src/content/study/ccdv-f");
const PUBLIC_BASE = path.resolve("public/study/ccdv-f");

const KNOWLEDGE_DIR = "CCDV-F - Base de conocimiento";
const MSO_DIR = "MSO Foundations";

const PDF_SOURCE_NAME =
	"instructor_6nizmqk8tpzpfjvt6qmmav7rh_public_1783542875_Claude+Certified+Developer+–+Foundations+Exam+Guide.pdf";
const PDF_DEST_NAME = "ccdv-f-exam-guide.pdf";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Recursively collect .md files from a directory.
 *
 * @param {string} dirPath
 * @returns {string[]} Absolute paths to .md files
 */
function collectMarkdownFiles(dirPath) {
	if (!fs.existsSync(dirPath)) return [];

	/** @type {string[]} */
	const results = [];

	function walk(current) {
		const entries = fs.readdirSync(current, { withFileTypes: true });
		for (const entry of entries) {
			const fullPath = path.join(current, entry.name);
			if (entry.isDirectory()) {
				walk(fullPath);
			} else if (entry.isFile() && entry.name.endsWith(".md")) {
				results.push(fullPath);
			}
		}
	}

	walk(dirPath);
	return results;
}

/**
 * Collect .md files from the SOURCE top level (non-recursive).
 *
 * @param {string} sourcePath
 * @returns {string[]}
 */
function collectTopLevelMarkdown(sourcePath) {
	if (!fs.existsSync(sourcePath)) return [];

	return fs
		.readdirSync(sourcePath, { withFileTypes: true })
		.filter((e) => e.isFile() && e.name.endsWith(".md"))
		.map((e) => path.join(sourcePath, e.name));
}

/**
 * Remove a directory recursively.
 *
 * @param {string} dirPath
 */
function removeDir(dirPath) {
	if (fs.existsSync(dirPath)) {
		fs.rmSync(dirPath, { recursive: true, force: true });
	}
}

/**
 * Ensure a directory exists.
 *
 * @param {string} dirPath
 */
function ensureDir(dirPath) {
	fs.mkdirSync(dirPath, { recursive: true });
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

function main() {
	// 1. Check source exists
	if (!fs.existsSync(SOURCE)) {
		console.error(`Error: Source directory does not exist: ${SOURCE}`);
		process.exit(1);
	}

	console.log(`Source: ${SOURCE}`);

	// 2. Collect notes
	const knowledgeFiles = collectMarkdownFiles(path.join(SOURCE, KNOWLEDGE_DIR));
	const msoFiles = collectMarkdownFiles(path.join(SOURCE, MSO_DIR));
	const topFiles = collectTopLevelMarkdown(SOURCE);

	/**
	 * @typedef {Object} NoteInfo
	 * @property {string} sourcePath - Absolute path to the source .md file
	 * @property {string} group - 'knowledge', 'mso', or 'root'
	 * @property {string} relativeDir - Relative directory from the collection root (empty for top-level)
	 * @property {string} basename - File basename without .md
	 */
	/** @type {NoteInfo[]} */
	const notes = [];

	for (const fp of knowledgeFiles) {
		const rel = path.relative(path.join(SOURCE, KNOWLEDGE_DIR), fp);
		const dir = path.dirname(rel);
		const base = path.basename(fp, ".md");
		notes.push({ sourcePath: fp, group: "knowledge", relativeDir: dir, basename: base });
	}

	for (const fp of msoFiles) {
		const rel = path.relative(path.join(SOURCE, MSO_DIR), fp);
		const dir = path.dirname(rel);
		const base = path.basename(fp, ".md");
		notes.push({ sourcePath: fp, group: "mso", relativeDir: dir, basename: base });
	}

	for (const fp of topFiles) {
		const base = path.basename(fp, ".md");
		notes.push({ sourcePath: fp, group: "root", relativeDir: "", basename: base });
	}

	console.log(`Collected ${notes.length} notes.`);

	// 3. Detect slug collisions on urlSlug(basename)
	const slugEntries = notes.map((n) => ({
		slug: urlSlug(n.basename),
		source: n.sourcePath,
	}));
	const collisions = findSlugCollisions(slugEntries);
	if (collisions.length > 0) {
		console.error("Slug collision detected:");
		for (const c of collisions) {
			console.error(`  Slug "${c.slug}" → ${c.sources.join(", ")}`);
		}
		process.exit(1);
	}

	// 4. Build knownSlugs as the Set of urlSlug(basename) for every note
	const knownSlugs = new Set(slugEntries.map((e) => e.slug));

	// 5. Clean destination directories
	removeDir(DEST_BASE);
	removeDir(PUBLIC_BASE);
	ensureDir(DEST_BASE);
	ensureDir(PUBLIC_BASE);

	// 6. Process and write notes
	let notesWritten = 0;
	let totalLinksConverted = 0;
	/** @type {string[]} */
	const allUnresolved = [];
	/** @type {Map<string, number>} */
	const folderCounts = new Map();

	for (const note of notes) {
		const markdown = fs.readFileSync(note.sourcePath, "utf-8");

		// Compute destination path using destPathForNote
		const destRel = destPathForNote({
			group: note.group,
			relativeDir: note.relativeDir,
			basename: note.basename,
		});

		// Count wikilinks before conversion
		const wikilinkMatches = markdown.match(/(!?)\[\[[^\]]*\]\]/g);
		const noteWikilinkCount = wikilinkMatches ? wikilinkMatches.length : 0;

		// Prepare the note (frontmatter, title, H1, callouts, wikilinks)
		const fallbackTitle = humanizeSlug(urlSlug(note.basename));
		const { markdown: prepared, unresolved } = prepareNote(markdown, { knownSlugs, fallbackTitle });

		// Track links converted and unresolved
		totalLinksConverted += noteWikilinkCount - unresolved.length;
		allUnresolved.push(...unresolved);

		// Write the file
		const destPath = path.join(DEST_BASE, `${destRel}.md`);
		ensureDir(path.dirname(destPath));
		fs.writeFileSync(destPath, prepared, "utf-8");
		notesWritten++;

		// Track folder counts
		const topFolder = destRel.split("/")[0];
		folderCounts.set(topFolder, (folderCounts.get(topFolder) || 0) + 1);
	}

	// 7. Copy PDF if it exists
	let assetsCopied = 0;
	const pdfSource = path.join(SOURCE, PDF_SOURCE_NAME);
	if (fs.existsSync(pdfSource)) {
		fs.copyFileSync(pdfSource, path.join(PUBLIC_BASE, PDF_DEST_NAME));
		assetsCopied++;
		console.log(`Copied PDF → ${PDF_DEST_NAME}`);
	}

	// 8. Print summary
	console.log("");
	console.log("=== Sync Summary ===");
	console.log(`Notes written: ${notesWritten}`);
	console.log(`Links converted: ${totalLinksConverted}`);
	const unresolvedPreview =
		allUnresolved.length > 0
			? " (" +
				allUnresolved.slice(0, 10).join(", ") +
				(allUnresolved.length > 10 ? ", ..." : "") +
				")"
			: "";
	console.log(`Unresolved links: ${allUnresolved.length}${unresolvedPreview}`);
	console.log(`Assets copied: ${assetsCopied}`);
	console.log("Notes per folder:");
	for (const [folder, count] of [...folderCounts.entries()].sort()) {
		console.log(`  ${folder}: ${count}`);
	}
	console.log("====================");
}

main();
