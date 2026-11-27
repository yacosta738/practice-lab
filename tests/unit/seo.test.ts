import { readFileSync, statSync } from "node:fs";
import { describe, expect, it } from "vitest";

import { limitMetaDescription, limitSeoTitle } from "../../src/lib/seo";

describe("SEO metadata limits", () => {
	it("shortens long titles without dropping their page-specific suffix", () => {
		const title = limitSeoTitle(
			"Claude Certified Developer – Foundations: study companion and 100 practice questions | CCDV-F",
		);

		expect(title.length).toBeLessThanOrEqual(55);
		expect(title).toMatch(/… \| CCDV-F$/);
	});

	it("normalizes and shortens long meta descriptions at a word boundary", () => {
		const description = limitMetaDescription(
			"A detailed description for a certification study resource with several exam domains, curated notes, and practical examples. Review all key material, test your knowledge, and track your progress over time.",
		);

		expect(description.length).toBeLessThanOrEqual(140);
		expect(description).toMatch(/…$/);
		expect(description).not.toMatch(/\s…$/);
	});

	it("keeps the social preview image below the reported size threshold", () => {
		const image = new URL("../../public/assets/practice-lab-confidence-og.jpg", import.meta.url);

		expect(statSync(image).size).toBeLessThan(100_000);
	});

	it("renders Vercel Analytics in the body instead of the document head", () => {
		const layout = readFileSync(new URL("../../src/layouts/Layout.astro", import.meta.url), "utf8");
		const headStart = layout.indexOf("<head>");
		const headEnd = layout.indexOf("</head>");
		const bodyStart = layout.indexOf("<body>");
		const analytics = layout.indexOf("<Analytics />");

		expect(headStart).toBeGreaterThanOrEqual(0);
		expect(headEnd).toBeGreaterThan(headStart);
		expect(layout.slice(headStart, headEnd)).not.toContain("<Analytics />");
		expect(analytics).toBeGreaterThan(bodyStart);
	});
});
