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
});
