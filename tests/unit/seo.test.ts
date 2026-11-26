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

		expect(description.length).toBeLessThanOrEqual(160);
		expect(description).toMatch(/…$/);
		expect(description).not.toMatch(/\s…$/);
	});
});
