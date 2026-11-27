import { expect, test } from "@playwright/test";

const ROUTES = [
	"/practice-lab/",
	"/practice-lab/certifications/ccdv-f/",
	"/practice-lab/study/",
	"/practice-lab/study/ccdv-f/",
	"/practice-lab/study/ccdv-f/agent-loop-and-termination/",
	"/practice-lab/data-management/",
	"/practice-lab/progress/",
	"/practice-lab/progress/session/",
];

for (const route of ROUTES) {
	test(`has consistent SEO metadata and one page heading on ${route}`, async ({ page }) => {
		await page.goto(route);

		await expect(page.locator("h1")).toHaveCount(1);

		const metadata = await page.evaluate(() => ({
			title: document.title,
			description: document.querySelector<HTMLMetaElement>('meta[name="description"]')?.content,
			canonical: document.querySelector<HTMLLinkElement>('link[rel="canonical"]')?.href,
			openGraphUrl: document.querySelector<HTMLMetaElement>('meta[property="og:url"]')?.content,
			openGraphTitle: document.querySelector<HTMLMetaElement>('meta[property="og:title"]')?.content,
			openGraphImage: document.querySelector<HTMLMetaElement>('meta[property="og:image"]')?.content,
		}));

		expect(metadata.title.length).toBeLessThanOrEqual(55);
		expect(metadata.description?.length).toBeGreaterThanOrEqual(120);
		expect(metadata.description?.length).toBeLessThanOrEqual(160);
		expect(metadata.openGraphTitle).toBe(metadata.title);
		expect(metadata.openGraphUrl).toBe(metadata.canonical);
		expect(metadata.canonical).toBe(new URL(route, "https://yacosta738.github.io").href);
		expect(metadata.openGraphImage).toBeTruthy();
		if (!metadata.canonical || !metadata.openGraphImage) return;

		expect(new URL(metadata.openGraphImage).origin).toBe(new URL(metadata.canonical).origin);
	});
}

test("study library links to every certification study page", async ({ page }) => {
	await page.goto("/practice-lab/study/");

	for (const slug of ["ccdv-f", "ccao-f", "ccar-p", "ccar-f"]) {
		await expect(page.locator(`.certCard[href="/practice-lab/study/${slug}/"]`)).toHaveCount(1);
	}
});

test("certification quiz and study pages have distinct titles", async ({ page }) => {
	for (const slug of ["ccdv-f", "ccao-f", "ccar-p", "ccar-f"]) {
		await page.goto(`/practice-lab/certifications/${slug}/`);
		const quizTitle = await page.title();

		await page.goto(`/practice-lab/study/${slug}/`);
		expect(await page.title()).not.toBe(quizTitle);
	}
});

test("robots.txt points to the deployment sitemap", async ({ request }) => {
	const response = await request.get("/practice-lab/robots.txt");

	expect(response.ok()).toBe(true);
	expect(await response.text()).toContain(
		"Sitemap: https://yacosta738.github.io/practice-lab/sitemap-index.xml",
	);
});
