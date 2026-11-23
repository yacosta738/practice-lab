import { describe, expect, it } from "vitest";
import {
	buildRepairedManifest,
	describeDiffs,
	extractSpecifiers,
	findDriftedFields,
} from "../../scripts/lib/release-branch.mjs";

// ---------------------------------------------------------------------------
// extractSpecifiers
// ---------------------------------------------------------------------------

describe("extractSpecifiers", () => {
	it("returns the four dependency fields of a manifest", () => {
		const manifest = {
			name: "practice-lab",
			version: "0.5.0",
			dependencies: { astro: "^5.0.0" },
			devDependencies: { vitest: "^4.0.0" },
		};

		expect(extractSpecifiers(manifest)).toEqual({
			dependencies: { astro: "^5.0.0" },
			devDependencies: { vitest: "^4.0.0" },
			peerDependencies: {},
			optionalDependencies: {},
		});
	});

	it("treats a missing dependency field as an empty set", () => {
		expect(extractSpecifiers({ name: "practice-lab" })).toEqual({
			dependencies: {},
			devDependencies: {},
			peerDependencies: {},
			optionalDependencies: {},
		});
	});
});

// ---------------------------------------------------------------------------
// findDriftedFields
// ---------------------------------------------------------------------------

describe("findDriftedFields", () => {
	it("reports no drift when the specifiers match", () => {
		const base = { dependencies: { astro: "^5.0.0" } };
		const current = {
			dependencies: { astro: "^5.0.0" },
			version: "0.5.0",
		};

		expect(findDriftedFields(base, current)).toEqual([]);
	});

	it("ignores the version field", () => {
		const base = { version: "0.4.0", dependencies: { astro: "^5.0.0" } };
		const current = { version: "0.5.0", dependencies: { astro: "^5.0.0" } };

		expect(findDriftedFields(base, current)).toEqual([]);
	});

	it("detects a specifier that moved backwards", () => {
		const base = { dependencies: { "@astrojs/sitemap": "^3.7.6" } };
		const current = { dependencies: { "@astrojs/sitemap": "^3.7.5" } };

		expect(findDriftedFields(base, current)).toEqual(["dependencies"]);
	});

	it("detects a dependency the base has and the branch lacks", () => {
		const base = { dependencies: { astro: "^5.0.0", zod: "^4.0.0" } };
		const current = { dependencies: { astro: "^5.0.0" } };

		expect(findDriftedFields(base, current)).toEqual(["dependencies"]);
	});

	it("detects a dependency the branch has and the base lacks", () => {
		const base = { dependencies: { astro: "^5.0.0" } };
		const current = { dependencies: { astro: "^5.0.0", zod: "^4.0.0" } };

		expect(findDriftedFields(base, current)).toEqual(["dependencies"]);
	});

	it("keeps the fields separate", () => {
		const base = { devDependencies: { vitest: "^4.0.0" } };
		const current = { dependencies: { astro: "^5.0.0" } };

		expect(findDriftedFields(base, current)).toEqual(["dependencies", "devDependencies"]);
	});
});

// ---------------------------------------------------------------------------
// describeDiffs
// ---------------------------------------------------------------------------

describe("describeDiffs", () => {
	it("names the dependency, the field and both specifiers", () => {
		const base = { dependencies: { "@astrojs/sitemap": "^3.7.6" } };
		const current = { dependencies: { "@astrojs/sitemap": "^3.7.5" } };

		expect(describeDiffs(base, current)).toEqual([
			{
				field: "dependencies",
				name: "@astrojs/sitemap",
				base: "^3.7.6",
				current: "^3.7.5",
			},
		]);
	});

	it("reports a missing dependency with an undefined current specifier", () => {
		const base = { dependencies: { zod: "^4.0.0" } };
		const current = { dependencies: {} };

		expect(describeDiffs(base, current)).toEqual([
			{ field: "dependencies", name: "zod", base: "^4.0.0", current: undefined },
		]);
	});

	it("sorts the report by field and dependency name", () => {
		const base = { dependencies: { b: "2.0.0", a: "1.0.0" } };
		const current = { dependencies: { b: "1.0.0", a: "1.0.0" } };

		expect(describeDiffs(base, current).map((diff) => diff.name)).toEqual(["b"]);
	});
});

// ---------------------------------------------------------------------------
// buildRepairedManifest
// ---------------------------------------------------------------------------

describe("buildRepairedManifest", () => {
	it("takes the base content and keeps the branch version", () => {
		const base = {
			name: "practice-lab",
			version: "0.4.0",
			dependencies: { "@astrojs/sitemap": "^3.7.6" },
		};
		const current = {
			name: "practice-lab",
			version: "0.5.0",
			dependencies: { "@astrojs/sitemap": "^3.7.5" },
		};

		const repaired = buildRepairedManifest(base, current);

		expect(repaired.version).toBe("0.5.0");
		expect(repaired.dependencies).toEqual({ "@astrojs/sitemap": "^3.7.6" });
	});

	it("restores dependencies the branch lost", () => {
		const base = {
			version: "0.4.0",
			dependencies: { astro: "^5.0.0", zod: "^4.0.0" },
		};
		const current = { version: "0.5.0", dependencies: { astro: "^5.0.0" } };

		expect(buildRepairedManifest(base, current).dependencies).toEqual({
			astro: "^5.0.0",
			zod: "^4.0.0",
		});
	});

	it("removes dependencies the base dropped", () => {
		const base = { version: "0.4.0", dependencies: { astro: "^5.0.0" } };
		const current = {
			version: "0.5.0",
			dependencies: { astro: "^5.0.0", zod: "^4.0.0" },
		};

		expect(buildRepairedManifest(base, current).dependencies).toEqual({
			astro: "^5.0.0",
		});
	});

	it("keeps every other field of the base manifest", () => {
		const base = {
			name: "practice-lab",
			version: "0.4.0",
			scripts: { build: "astro build" },
			engines: { node: ">=22" },
		};
		const current = { name: "practice-lab", version: "0.5.0" };

		const repaired = buildRepairedManifest(base, current);

		expect(repaired.scripts).toEqual({ build: "astro build" });
		expect(repaired.engines).toEqual({ node: ">=22" });
	});

	it("does not mutate the manifests it receives", () => {
		const base = { version: "0.4.0", dependencies: { astro: "^5.0.0" } };
		const current = { version: "0.5.0", dependencies: { astro: "^4.0.0" } };

		buildRepairedManifest(base, current);

		expect(base.version).toBe("0.4.0");
		expect(current.version).toBe("0.5.0");
		expect(current.dependencies).toEqual({ astro: "^4.0.0" });
	});

	it("keeps the base version when the branch has none", () => {
		const base = { version: "0.4.0" };
		const current = { name: "practice-lab" };

		expect(buildRepairedManifest(base, current).version).toBe("0.4.0");
	});
});
