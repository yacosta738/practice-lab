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

		// Clear localStorage for a fresh experience
		await page.evaluate(() => localStorage.clear());
		await page.reload();
		await page.waitForLoadState("networkidle");

		// Verify the heading is visible
		await expect(page.getByRole("heading", { name: heading })).toBeVisible();

		// Verify the amount selector is present
		await expect(page.locator("#amount")).toBeVisible();

		// Verify Practice mode button is present
		await expect(page.getByRole("button", { name: "Practice mode" })).toBeVisible();

		// Verify Mock exam button is present
		await expect(page.getByRole("button", { name: "Mock exam" })).toBeVisible();
	});
}

test("CCAO-F practice mode starts and renders questions", async ({ page }) => {
	await page.goto(`${BASE_PATH}/certifications/ccao-f/`);
	await page.waitForLoadState("networkidle");
	await page.evaluate(() => localStorage.clear());
	await page.reload();
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
	await page.evaluate(() => localStorage.clear());
	await page.reload();
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
	await page.evaluate(() => localStorage.clear());
	await page.reload();
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
