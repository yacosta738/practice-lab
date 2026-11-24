import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

// The site is deployed as a GitHub Pages project site, so every route is
// prefixed with the `base` value from astro.config.mjs.
const ROUTES = [
	"/practice-lab/",
	"/practice-lab/certifications/ccdv-f",
	"/practice-lab/certifications/ccao-f",
	"/practice-lab/certifications/ccar-p",
	"/practice-lab/certifications/ccar-f",
	"/practice-lab/study/",
	"/practice-lab/study/ccdv-f/",
	"/practice-lab/study/ccdv-f/learning-resources/",
	"/practice-lab/study/ccdv-f/exam-decision-guide/",
	"/practice-lab/study/ccdv-f/application-integration-design-workshop/",
	"/practice-lab/study/ccdv-f/model-selection-and-optimization-workshop/",
	"/practice-lab/study/ccdv-f/agent-architecture-design-workshop/",
	"/practice-lab/study/ccdv-f/workflows-versus-agents/",
];

const WCAG_TAGS = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"];

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

test("has no WCAG A/AA violations during active practice quiz and feedback", async ({ page }) => {
	await page.goto("/practice-lab/certifications/ccdv-f");
	await page.waitForLoadState("networkidle");
	await page.selectOption("#amount", "10");
	await page.click('[data-action="start-practice"]');
	await page.waitForSelector("button.option");

	const activeResults = await new AxeBuilder({ page }).withTags(WCAG_TAGS).analyze();
	expect(activeResults.violations).toEqual([]);

	const options = page.locator("button.option");
	const checkBtn = page.locator('[data-action="check"]');
	for (let i = 0; i < 3; i++) {
		if (await checkBtn.isEnabled()) break;
		await options.nth(i).click();
	}
	await checkBtn.click();
	await page.waitForSelector(".feedback");

	const feedbackResults = await new AxeBuilder({ page }).withTags(WCAG_TAGS).analyze();
	expect(feedbackResults.violations).toEqual([]);
});
