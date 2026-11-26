import { expect, test } from "@playwright/test";

const BASE_PATH = "/practice-lab";

// Test each certification page loads correctly
const CERTIFICATIONS = [
	{ slug: "ccdv-f", heading: /Know the platform/i },
	{ slug: "ccao-f", heading: /Know the platform/i },
	{ slug: "ccar-p", heading: /Know the platform/i },
	{ slug: "ccar-f", heading: /Know the platform/i },
];

for (const { slug, heading } of CERTIFICATIONS) {
	test(`${slug} certification page loads and shows heading`, async ({ page }) => {
		await page.goto(`${BASE_PATH}/certifications/${slug}/`);
		await page.waitForLoadState("networkidle");

		// Verify the heading is visible
		await expect(page.getByRole("heading", { name: heading })).toBeVisible();

		// Verify the amount selector is present
		await expect(page.locator("#amount")).toBeVisible();

		// Verify Practice mode button is present
		await expect(page.getByRole("button", { name: "Practice mode" })).toBeVisible();

		// Assess opens a distinct, explicit mock exam setup
		const assessLink = page.locator('.pl-sidebar [data-workspace-mode="assess"]');
		await expect(assessLink).toHaveAttribute("href", /mode=assess/);
		await assessLink.click();
		await expect(page.getByRole("heading", { name: "Mock exam setup" })).toBeVisible();
		await expect(page.getByRole("button", { name: "Start mock exam" })).toBeVisible();
	});
}

test("exam guide note renders as text with native and fallback HTML renderers", async ({
	browser,
}) => {
	const note = '<img data-injected src="/not-an-image"> & "quoted" \'single\'';

	for (const renderer of ["setHTML", "innerHTML"] as const) {
		const context = await browser.newContext();
		const page = await context.newPage();

		await page.addInitScript(
			({ renderer, note }) => {
				const originalParse = JSON.parse;
				JSON.parse = function (text, reviver) {
					const parsed = originalParse.call(this, text, reviver);
					if (parsed?.cfg?.slug === "ccdv-f") parsed.cfg.examGuideNote = note;
					return parsed;
				};

				Object.defineProperty(globalThis, "__setHTMLCalled", {
					configurable: true,
					value: false,
					writable: true,
				});
				if (renderer === "setHTML") {
					Object.defineProperty(Element.prototype, "setHTML", {
						configurable: true,
						value(html: string) {
							(globalThis as typeof globalThis & { __setHTMLCalled: boolean }).__setHTMLCalled =
								true;
							this.innerHTML = html;
						},
					});
					Object.defineProperty(globalThis, "Sanitizer", {
						configurable: true,
						value: class {},
					});
				} else {
					Reflect.deleteProperty(Element.prototype, "setHTML");
					Reflect.deleteProperty(globalThis, "Sanitizer");
				}
			},
			{ renderer, note },
		);

		await page.goto(`${BASE_PATH}/certifications/ccdv-f/`);
		await page.waitForLoadState("networkidle");

		const lead = page.locator(".hero .lead");
		await expect(lead).toContainText(note);
		await expect(lead.locator("img[data-injected]")).toHaveCount(0);
		await expect(lead.locator("strong")).toContainText("Claude Developer Foundations");
		if (renderer === "setHTML") {
			expect(
				await page.evaluate(
					() => (globalThis as typeof globalThis & { __setHTMLCalled: boolean }).__setHTMLCalled,
				),
			).toBe(true);
		}

		await page.selectOption("#amount", { label: "10" });
		await page.getByRole("button", { name: "Practice mode" }).click();
		const firstOption = page.locator("button.option").first();
		await expect(firstOption).toBeVisible();
		await expect(firstOption).toHaveAttribute("aria-pressed", "false");
		await context.close();
	}
});

test("shared document head loads the font stylesheet and preconnects", async ({ page }) => {
	await page.goto(`${BASE_PATH}/`);

	await expect(
		page.locator(
			'head link[rel="stylesheet"][href*="fonts.googleapis.com/css2?family=IBM+Plex+Sans"]',
		),
	).toHaveCount(1);
	await expect(
		page.locator('head link[rel="preconnect"][href="https://fonts.googleapis.com"]'),
	).toHaveCount(1);
	await expect(
		page.locator('head link[rel="preconnect"][href="https://fonts.gstatic.com"]'),
	).toHaveAttribute("crossorigin", "");
});

test("CCAO-F practice mode starts and renders questions", async ({ page }) => {
	await page.goto(`${BASE_PATH}/certifications/ccao-f/`);
	await page.waitForLoadState("networkidle");

	// Wait for the home page to render
	await page.waitForSelector("#amount", { state: "visible", timeout: 10000 });

	// Select 10 questions
	await page.selectOption("#amount", { label: "10" });

	// Start practice mode
	await page.getByRole("button", { name: "Practice mode" }).click();

	// Wait for the first question to render
	await page.waitForSelector("button.option", { state: "visible", timeout: 10000 });

	// Verify the question text is rendered
	const questionText = await page.locator("h2").first().textContent();
	expect(questionText?.length).toBeGreaterThan(0);

	// Verify option buttons are present
	const optionButtons = page.locator("button.option");
	const optionCount = await optionButtons.count();
	expect(optionCount).toBeGreaterThanOrEqual(2);
});

test("CCAR-P practice mode starts and renders questions", async ({ page }) => {
	await page.goto(`${BASE_PATH}/certifications/ccar-p/`);
	await page.waitForLoadState("networkidle");

	// Wait for the home page to render
	await page.waitForSelector("#amount", { state: "visible", timeout: 10000 });

	// Select 10 questions
	await page.selectOption("#amount", { label: "10" });

	// Start practice mode
	await page.getByRole("button", { name: "Practice mode" }).click();

	// Wait for the first question to render
	await page.waitForSelector("button.option", { state: "visible", timeout: 10000 });

	// Verify the question text is rendered
	const questionText = await page.locator("h2").first().textContent();
	expect(questionText?.length).toBeGreaterThan(0);
});

test("CCAR-F practice mode starts and renders questions", async ({ page }) => {
	await page.goto(`${BASE_PATH}/certifications/ccar-f/`);
	await page.waitForLoadState("networkidle");

	// Wait for the home page to render
	await page.waitForSelector("#amount", { state: "visible", timeout: 10000 });

	// Select 10 questions
	await page.selectOption("#amount", { label: "10" });

	// Start practice mode
	await page.getByRole("button", { name: "Practice mode" }).click();

	// Wait for the first question to render
	await page.waitForSelector("button.option", { state: "visible", timeout: 10000 });

	// Verify the question text is rendered
	const questionText = await page.locator("h2").first().textContent();
	expect(questionText?.length).toBeGreaterThan(0);
});

test("homepage lists all certifications", async ({ page }) => {
	await page.goto(`${BASE_PATH}/`);
	await page.waitForLoadState("networkidle");

	// Verify all certification cards are present (using config titles)
	await expect(
		page.getByRole("link", { name: /Claude Certified Associate/i }).first(),
	).toBeVisible();
	await expect(
		page.getByRole("link", { name: /Claude Certified Architect/i }).first(),
	).toBeVisible();
	await expect(page.getByRole("link", { name: /Claude Developer Foundations/i })).toBeVisible();
});

test("homepage has Start practicing link", async ({ page }) => {
	await page.goto(`${BASE_PATH}/`);
	await page.waitForLoadState("networkidle");

	// Verify the Start practicing link exists
	const startPracticing = page.getByRole("link", { name: "Start practicing" });
	await expect(startPracticing).toBeVisible();

	// Verify it points to the CCDV-F certification
	await expect(startPracticing).toHaveAttribute(
		"href",
		new RegExp(`${BASE_PATH}/certifications/ccdv-f`),
	);
});

test("study index page lists certifications with study notes", async ({ page }) => {
	await page.goto(`${BASE_PATH}/study/`);
	await page.waitForLoadState("networkidle");

	// Verify the study index heading
	await expect(
		page.getByRole("heading", { name: /Study notes, organised by certification/i }),
	).toBeVisible();
});

test("study certification page shows sections", async ({ page }) => {
	await page.goto(`${BASE_PATH}/study/ccdv-f/`);
	await page.waitForLoadState("networkidle");

	// Verify the certification heading
	await expect(page.getByRole("heading", { name: "Claude Developer Foundations" })).toBeVisible();

	// Verify section headings are visible (D1, D2, etc.)
	const sectionHeadings = page.getByRole("heading", { level: 2 });
	const headingCount = await sectionHeadings.count();
	expect(headingCount).toBeGreaterThan(0);
});
