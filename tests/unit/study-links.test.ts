import { describe, expect, it } from "vitest";

import { hasHtmlFragment } from "../../scripts/lib/study-links.mjs";

describe("generated HTML fragments", () => {
	it("matches exact id and named anchor targets", () => {
		const html = '<h2 id="retry-policy">Retry policy</h2><a name="legacy-section"></a>';

		expect(hasHtmlFragment(html, "#retry-policy")).toBe(true);
		expect(hasHtmlFragment(html, "#legacy-section")).toBe(true);
		expect(hasHtmlFragment(html, "#retry")).toBe(false);
	});

	it("decodes URL-encoded fragments and rejects malformed encodings", () => {
		const html = '<h2 id="mixed case">Mixed case</h2>';

		expect(hasHtmlFragment(html, "#mixed%20case")).toBe(true);
		expect(hasHtmlFragment(html, "#%ZZ")).toBe(false);
	});

	it("does not mistake data attributes or partial ids for anchors", () => {
		const html = '<div data-id="retry-policy"></div><h2 id="retry-policy-extra">Retry policy</h2>';

		expect(hasHtmlFragment(html, "#retry-policy")).toBe(false);
	});

	it("accepts named targets only on anchors and ignores commented-out markup", () => {
		expect(hasHtmlFragment('<input name="phantom">', "#phantom")).toBe(false);
		expect(hasHtmlFragment('<div name="legacy-section"></div>', "#legacy-section")).toBe(false);
		expect(hasHtmlFragment('<!-- <div id="comment-only"></div> -->', "#comment-only")).toBe(false);
		expect(hasHtmlFragment('<!-- <a name="comment-name"></a> -->', "#comment-name")).toBe(false);
	});

	it("does not find ids inside another attribute's quoted value", () => {
		expect(hasHtmlFragment("<a title=\"example id='ghost'\"></a>", "#ghost")).toBe(false);
	});

	it("ignores markup-like text in scripts regardless of script type", () => {
		const html = '<script type="application/json">{"example":"<h2 id=\'script-only\'>"}</script>';

		expect(hasHtmlFragment(html, "#script-only")).toBe(false);
	});

	it("decodes named and numeric HTML references in target attributes", () => {
		const html = '<h2 id="fish &amp; chips"></h2><h2 id="tea &#38; coffee"></h2>';

		expect(hasHtmlFragment(html, "#fish%20%26%20chips")).toBe(true);
		expect(hasHtmlFragment(html, "#tea%20%26%20coffee")).toBe(true);
		expect(hasHtmlFragment(html, "#fish%20%26%20chips-extra")).toBe(false);
	});

	it("recognizes ids after a greater-than sign inside a quoted attribute", () => {
		expect(
			hasHtmlFragment('<h2 title="retry > policy" id="retry-policy">Retry</h2>', "#retry-policy"),
		).toBe(true);
	});
});
