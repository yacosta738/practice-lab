import { describe, expect, it } from "vitest";

import { externalLinkAttributes } from "../../src/hast/external-links.mjs";

const site = "https://yacosta738.github.io";

describe("Markdown external links", () => {
	it("opens external HTTP links in a new tab with safe rel attributes", () => {
		const attributes = externalLinkAttributes({ href: "https://example.com/docs" }, site);

		expect(attributes).toEqual({
			target: "_blank",
			rel: ["noopener", "noreferrer"],
		});
	});

	it("preserves existing rel values and avoids duplicate security tokens", () => {
		const attributes = externalLinkAttributes(
			{
				href: "https://example.com/docs",
				rel: ["nofollow", "noopener"],
			},
			site,
		);

		expect(attributes).toEqual({
			target: "_blank",
			rel: ["nofollow", "noopener", "noreferrer"],
		});
	});

	it("leaves relative, same-origin, and non-web links unchanged", () => {
		const propertiesList = [
			{ href: "../concept/" },
			{ href: "https://yacosta738.github.io/practice-lab/study/" },
			{ href: "mailto:hello@example.com" },
		];

		for (const properties of propertiesList) {
			expect(externalLinkAttributes(properties, site)).toBeNull();
		}
	});

	it("handles protocol-relative external URLs and ignores malformed values", () => {
		expect(externalLinkAttributes({ href: "//example.com/docs" }, site)).toEqual({
			target: "_blank",
			rel: ["noopener", "noreferrer"],
		});
		expect(externalLinkAttributes({ href: "http://[invalid" }, site)).toBeNull();
	});
});
