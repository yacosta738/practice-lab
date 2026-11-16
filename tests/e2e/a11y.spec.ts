import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

// The site is deployed as a GitHub Pages project site, so every route is
// prefixed with the `base` value from astro.config.mjs.
const ROUTES = ["/practice-lab/", "/practice-lab/certifications/ccdv-f"];

const WCAG_TAGS = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"];

for (const route of ROUTES) {
	test(`has no WCAG A/AA violations on ${route}`, async ({ page }) => {
		await page.goto(route);
		await page.waitForLoadState("networkidle");

		const results = await new AxeBuilder({ page }).withTags(WCAG_TAGS).analyze();

		expect(
			results.violations.map((violation) => ({
				id: violation.id,
				impact: violation.impact,
				help: violation.help,
				nodes: violation.nodes.map((node) => node.target),
			})),
		).toEqual([]);
	});
}
