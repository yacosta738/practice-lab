/**
 * Pure helpers to detect and repair drift between a release branch and its
 * base branch.
 *
 * Release Please reads the target branch contents at the start of its run but
 * resolves the commit base at the end. When the base branch advances in
 * between, the changeset is computed against one commit and applied on top of
 * another. The result silently reverts dependency specifiers in package.json
 * while pnpm-lock.yaml keeps the newer ones.
 *
 * The invariant these helpers enforce is the one Release Please itself
 * intends: the release branch manifest equals the base branch manifest, with
 * the single exception of the version field, which Release Please owns.
 */

export const DEPENDENCY_FIELDS = [
	"dependencies",
	"devDependencies",
	"peerDependencies",
	"optionalDependencies",
];

/**
 * Extract the dependency specifiers of a manifest.
 *
 * @param {Record<string, unknown>} manifest
 * @returns {Record<string, Record<string, string>>}
 */
export function extractSpecifiers(manifest) {
	const result = {};
	for (const field of DEPENDENCY_FIELDS) {
		const value = manifest?.[field];
		result[field] = value && typeof value === "object" ? { ...value } : {};
	}
	return result;
}

/**
 * Return the dependency fields whose specifiers differ between two manifests.
 *
 * @param {Record<string, unknown>} base
 * @param {Record<string, unknown>} current
 * @returns {string[]}
 */
export function findDriftedFields(base, current) {
	const baseSpecifiers = extractSpecifiers(base);
	const currentSpecifiers = extractSpecifiers(current);
	return DEPENDENCY_FIELDS.filter(
		(field) => JSON.stringify(baseSpecifiers[field]) !== JSON.stringify(currentSpecifiers[field]),
	);
}

/**
 * Describe every dependency difference between two manifests.
 *
 * @param {Record<string, unknown>} base
 * @param {Record<string, unknown>} current
 * @returns {Array<{field: string, name: string, base: string|undefined, current: string|undefined}>}
 */
export function describeDiffs(base, current) {
	const baseSpecifiers = extractSpecifiers(base);
	const currentSpecifiers = extractSpecifiers(current);
	const diffs = [];

	for (const field of DEPENDENCY_FIELDS) {
		const baseField = baseSpecifiers[field];
		const currentField = currentSpecifiers[field];
		const names = [...new Set([...Object.keys(baseField), ...Object.keys(currentField)])].sort();

		for (const name of names) {
			if (baseField[name] !== currentField[name]) {
				diffs.push({
					field,
					name,
					base: baseField[name],
					current: currentField[name],
				});
			}
		}
	}

	return diffs;
}

/**
 * Build the manifest the release branch should carry: the base branch
 * manifest, with the version the release branch already holds.
 *
 * The inputs are never mutated.
 *
 * @param {Record<string, unknown>} base
 * @param {Record<string, unknown>} current
 * @returns {Record<string, unknown>}
 */
export function buildRepairedManifest(base, current) {
	const repaired = structuredClone(base);
	if (typeof current?.version === "string") {
		repaired.version = current.version;
	}
	return repaired;
}
