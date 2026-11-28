import { expect, test } from "@playwright/test";

const ROUTES = [
	"/practice-lab/",
	"/practice-lab/certifications/ccdv-f/",
	"/practice-lab/study/",
	"/practice-lab/study/ccdv-f/",
	"/practice-lab/study/ccdv-f/asyncanthropic/",
	"/practice-lab/study/ccdv-f/agent-loop-and-termination/",
	"/practice-lab/study/ccdv-f/claude-certified-developer-foundations-prep-course/",
	"/practice-lab/study/ccdv-f/context-window/",
	"/practice-lab/study/ccdv-f/exam-glossary/",
	"/practice-lab/study/ccdv-f/study-roadmap/",
	"/practice-lab/study/ccdv-f/temperature/",
	"/practice-lab/study/ccdv-f/tokens/",
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
			openGraphImageType: document.querySelector<HTMLMetaElement>('meta[property="og:image:type"]')
				?.content,
		}));

		expect(metadata.title.length).toBeLessThanOrEqual(55);
		expect(metadata.title.length).toBeGreaterThanOrEqual(30);
		expect(metadata.description?.length).toBeGreaterThanOrEqual(120);
		expect(metadata.description?.length).toBeLessThanOrEqual(140);
		expect(metadata.openGraphTitle).toBe(metadata.title);
		expect(metadata.openGraphImageType).toBe("image/jpeg");
		expect(metadata.openGraphUrl).toBe(metadata.canonical);
		expect(metadata.canonical).toBe(new URL(route, "https://yacosta738.github.io").href);
		expect(metadata.openGraphImage).toBeTruthy();
		if (!metadata.canonical || !metadata.openGraphImage) return;

		expect(new URL(metadata.openGraphImage).origin).toBe(new URL(metadata.canonical).origin);
	});
}

test("certification quiz includes a useful heading before JavaScript runs", async ({ request }) => {
	const response = await request.get("/practice-lab/certifications/ccdv-f/");
	const html = await response.text();

	expect(response.ok()).toBe(true);
	expect(html).toContain("<h1>Know the platform.<br>Ship with confidence.</h1>");
	expect(html).toContain("Claude Developer Foundations");
	expect(html).toContain("Enable JavaScript to start the interactive practice session.");
});

test("course thumbnails declare their intrinsic dimensions", async ({ page }) => {
	await page.goto("/practice-lab/study/ccdv-f/claude-certified-developer-foundations-prep-course/");

	const images = page.locator("#study-reading-content img");
	await expect(images).toHaveCount(5);

	const dimensions = await images.evaluateAll((elements) =>
		elements.map((element) => ({
			width: element.getAttribute("width"),
			height: element.getAttribute("height"),
		})),
	);

	expect(dimensions).toEqual([
		{ width: "418", height: "374" },
		{ width: "460", height: "460" },
		{ width: "405", height: "422" },
		{ width: "346", height: "449" },
		{ width: "410", height: "410" },
	]);
});

test("all sitemap URLs have self-canonicals and pass the audit thresholds", async ({
	page,
	request,
}, testInfo) => {
	test.skip(
		testInfo.project.name !== "chromium",
		"Canvas metrics are checked once per browser suite",
	);

	const locations = (xml: string): string[] => {
		const result: string[] = [];
		let cursor = 0;

		while (true) {
			const start = xml.indexOf("<loc>", cursor);
			if (start < 0) break;
			const contentStart = start + "<loc>".length;
			const end = xml.indexOf("</loc>", contentStart);
			if (end < 0) break;
			result.push(xml.slice(contentStart, end));
			cursor = end + "</loc>".length;
		}

		return result;
	};

	const indexResponse = await request.get("/practice-lab/sitemap-index.xml");
	expect(indexResponse.ok()).toBe(true);
	const sitemapPaths = locations(await indexResponse.text()).map(
		(location) => new URL(location).pathname,
	);
	const pagePaths: string[] = [];

	for (const sitemapPath of sitemapPaths) {
		const response = await request.get(sitemapPath);
		expect(response.ok()).toBe(true);
		pagePaths.push(
			...locations(await response.text()).map((location) => new URL(location).pathname),
		);
	}

	const pages: {
		path: string;
		title: string;
		heading: string;
		canonical: string;
		description: string;
	}[] = [];
	for (let index = 0; index < pagePaths.length; index += 20) {
		const batch = pagePaths.slice(index, index + 20);
		const batchPages = await Promise.all(
			batch.map(async (path) => {
				const response = await request.get(path);
				expect(response.ok(), `Expected ${path} to load`).toBe(true);
				const html = await response.text();
				const tagStart = html.indexOf('<meta name="description"');
				const contentStart = tagStart >= 0 ? html.indexOf('content="', tagStart) : -1;
				const contentEnd = html.indexOf('"', contentStart + 'content="'.length);
				const canonicalStart = html.indexOf('<link rel="canonical"');
				const canonicalHrefStart =
					canonicalStart >= 0 ? html.indexOf('href="', canonicalStart) : -1;
				const canonicalHrefEnd = html.indexOf('"', canonicalHrefStart + 'href="'.length);
				const titleStart = html.indexOf("<title>");
				const titleEnd = html.indexOf("</title>", titleStart);
				const headingStart = html.indexOf("<h1");
				const headingContentStart = html.indexOf(">", headingStart);
				const headingEnd = html.indexOf("</h1>", headingContentStart);

				return {
					path,
					title:
						titleStart < 0 || titleEnd < 0
							? ""
							: html.slice(titleStart + "<title>".length, titleEnd),
					heading:
						headingStart < 0 || headingContentStart < 0 || headingEnd < 0
							? ""
							: html.slice(headingContentStart + 1, headingEnd),
					canonical:
						canonicalStart < 0 || canonicalHrefStart < 0 || canonicalHrefEnd < 0
							? ""
							: html.slice(canonicalHrefStart + 'href="'.length, canonicalHrefEnd),
					description:
						tagStart < 0 || contentStart < 0 || contentEnd < 0
							? ""
							: html.slice(contentStart + 'content="'.length, contentEnd),
				};
			}),
		);
		pages.push(...batchPages);
	}

	const findings = await page.evaluate((pages) => {
		const context = document.createElement("canvas").getContext("2d");
		if (!context) throw new Error("Canvas 2D context is unavailable");
		context.font = "14px Arial";
		const decoder = document.createElement("textarea");
		const textContent = document.createElement("div");
		return pages.flatMap(({ path, title, heading, canonical, description }) => {
			decoder.innerHTML = title;
			const decodedTitle = decoder.value;
			textContent.innerHTML = heading;
			const decodedHeading = textContent.textContent?.trim() ?? "";
			decoder.innerHTML = description;
			const decodedDescription = decoder.value;
			const width = context.measureText(decodedDescription).width;
			const pageFindings = [];
			if (decodedTitle.length < 30 || decodedTitle.length > 55) {
				pageFindings.push({ path, type: "title", length: decodedTitle.length });
			}
			if (decodedHeading.length > 70) {
				pageFindings.push({ path, type: "heading", length: decodedHeading.length });
			}
			if (!decodedHeading) {
				pageFindings.push({ path, type: "missing-heading" });
			}
			if (canonical !== new URL(path, "https://yacosta738.github.io").href) {
				pageFindings.push({ path, type: "canonical", canonical });
			}
			if (!decodedDescription.trim()) {
				pageFindings.push({ path, type: "missing-description" });
			} else if (width > 985) {
				pageFindings.push({ path, type: "description", width });
			}
			return pageFindings;
		});
	}, pages);

	expect(findings).toEqual([]);
});

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
