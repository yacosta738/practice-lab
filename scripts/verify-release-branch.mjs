#!/usr/bin/env node

/**
 * Verify that a release branch stays consistent with its base branch.
 *
 * Release Please reads the target branch contents at the start of its run but
 * resolves the commit base at the end. When the base branch advances in
 * between, the changeset is computed against one commit and applied on top of
 * another. The result silently reverts dependency specifiers in package.json
 * while pnpm-lock.yaml keeps the newer ones. Two things break:
 *
 *   * the Vercel build fails with ERR_PNPM_OUTDATED_LOCKFILE, because the
 *     deploy installs with --frozen-lockfile;
 *   * merging the release pull request into the base branch conflicts on
 *     package.json.
 *
 * The CI workflow cannot catch this on the release branch itself: GitHub marks
 * pull_request runs from the release-please bot as action_required, so they
 * never execute without a manual approval. This script runs inside the
 * Release Please workflow instead, where it always has write access.
 *
 * Two invariants are enforced on the branch:
 *
 *   1. the dependency specifiers in package.json match the base branch;
 *   2. pnpm-lock.yaml matches package.json.
 *
 * Usage:
 *   node scripts/verify-release-branch.mjs [--base <ref>] [--manifest <path>]
 *                                            [--no-fix]
 *
 * Exit codes:
 *   0  the branch is consistent, or was repaired successfully
 *   1  the branch is inconsistent and could not be repaired
 *   2  the script could not run (bad arguments, missing files, ...)
 */

import { execFileSync, spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { buildRepairedManifest, describeDiffs, findDriftedFields } from "./lib/release-branch.mjs";

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------

const DEFAULT_BASE = "main";
const DEFAULT_MANIFEST = "package.json";

// ---------------------------------------------------------------------------
// Reporting
// ---------------------------------------------------------------------------

const notice = (message) => console.log(`::notice::${message}`);
const warning = (message) => console.log(`::warning::${message}`);
const failure = (message) => console.log(`::error::${message}`);

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function run(command, args, options = {}) {
	return spawnSync(command, args, {
		encoding: "utf8",
		stdio: options.capture ? "pipe" : "inherit",
		...options,
	});
}

function readManifest(manifestPath) {
	return JSON.parse(fs.readFileSync(manifestPath, "utf8"));
}

/**
 * Write a manifest back preserving the indentation and the trailing newline
 * of the original file.
 */
function writeManifest(manifestPath, manifest) {
	const original = fs.readFileSync(manifestPath, "utf8");
	const indent = original.includes("\n\t") ? "\t" : 2;
	const trailingNewline = original.endsWith("\n") ? "\n" : "";
	fs.writeFileSync(manifestPath, `${JSON.stringify(manifest, null, indent)}${trailingNewline}`);
}

/** Return true when the lockfile matches the manifest. */
function lockfileIsCurrent(cwd) {
	const result = run("pnpm", ["install", "--frozen-lockfile", "--lockfile-only"], {
		cwd,
		capture: true,
	});
	if (result.status === 0) {
		return true;
	}
	notice("The lockfile does not match package.json:");
	console.log(result.stdout);
	return false;
}

/** Regenerate the lockfile so that it matches the manifest. */
function refreshLockfile(cwd) {
	const result = run(
		"pnpm",
		["install", "--lockfile-only", "--no-frozen-lockfile", "--ignore-scripts"],
		{ cwd, capture: true },
	);
	if (result.status !== 0) {
		failure("Could not regenerate the lockfile:");
		console.log(result.stdout);
		return false;
	}
	return true;
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

function parseArgs(argv) {
	const options = {
		base: DEFAULT_BASE,
		manifest: DEFAULT_MANIFEST,
		fix: true,
	};
	for (let index = 0; index < argv.length; index += 1) {
		const arg = argv[index];
		if (arg === "--base") {
			options.base = argv[index + 1];
			index += 1;
		} else if (arg === "--manifest") {
			options.manifest = argv[index + 1];
			index += 1;
		} else if (arg === "--no-fix") {
			options.fix = false;
		} else {
			console.error(`Unknown argument: ${arg}`);
			process.exit(2);
		}
	}
	return options;
}

function main() {
	const options = parseArgs(process.argv.slice(2));
	const cwd = process.cwd();
	const manifestPath = path.join(cwd, options.manifest);

	if (!fs.existsSync(manifestPath)) {
		failure(`${options.manifest} not found in ${cwd}`);
		return 2;
	}

	let baseRaw;
	try {
		baseRaw = execFileSync("git", ["show", `${options.base}:${options.manifest}`], {
			cwd,
			encoding: "utf8",
		});
	} catch {
		failure(`Could not read ${options.manifest} from ${options.base}`);
		return 2;
	}

	const base = JSON.parse(baseRaw);
	const current = readManifest(manifestPath);
	let changed = false;

	// Invariant 1: the dependency specifiers match the base branch.
	const drifted = findDriftedFields(base, current);
	if (drifted.length > 0) {
		warning(
			`The release branch drifted from ${options.base} in ${drifted.join(", ")}. ` +
				"This is the signature of a Release Please run that raced with a merge " +
				"into the base branch.",
		);
		for (const diff of describeDiffs(base, current)) {
			notice(
				`${diff.field}.${diff.name}: the branch has ${JSON.stringify(diff.current)}, ` +
					`${options.base} has ${JSON.stringify(diff.base)}`,
			);
		}
		if (!options.fix) {
			return 1;
		}
		writeManifest(manifestPath, buildRepairedManifest(base, current));
		notice("Rewrote the manifest from the base branch, keeping the version.");
		changed = true;
	} else {
		notice("The dependency specifiers match the base branch.");
	}

	// Invariant 2: the lockfile matches the manifest.
	if (!lockfileIsCurrent(cwd)) {
		if (!options.fix) {
			return 1;
		}
		if (!refreshLockfile(cwd)) {
			return 1;
		}
		notice("Regenerated the lockfile.");
		changed = true;
	} else {
		notice("The lockfile matches package.json.");
	}

	if (changed) {
		notice("The release branch was repaired and needs to be committed.");
		return 0;
	}

	notice("The release branch is consistent with the base branch.");
	return 0;
}

process.exit(main());
