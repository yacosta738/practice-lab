import { expect, test } from "@playwright/test";

const BASE_PATH = "/practice-lab";

test("homepage certification link navigates under the GitHub Pages base path", async ({ page }) => {
	await page.goto(`${BASE_PATH}/`);
	await page.getByRole("link", { name: "Start practicing" }).click();

	await expect(page).toHaveURL(new RegExp(`${BASE_PATH}/certifications/ccdv-f/?$`));
	await expect(page.getByRole("heading", { name: /Know the platform/i })).toBeVisible();
});

test("study library navigation reaches a note from the home page", async ({ page }) => {
	await page.goto(`${BASE_PATH}/`);
	await page.getByRole("link", { name: "Study the notes" }).click();
	await expect(page).toHaveURL(new RegExp(`${BASE_PATH}/study/?$`));
	await expect(
		page.getByRole("heading", { name: /Study notes, organised by certification/i }),
	).toBeVisible();
	await page.getByRole("link", { name: "Open the study library" }).click();
	await expect(page).toHaveURL(new RegExp(`${BASE_PATH}/study/ccdv-f/?$`));
	await expect(page.getByRole("heading", { name: "Claude Developer Foundations" })).toBeVisible();
	await page.getByRole("link", { name: "Workflows versus Agents" }).click();
	await expect(page).toHaveURL(new RegExp(`${BASE_PATH}/study/ccdv-f/workflows-versus-agents/?$`));
	await expect(
		page.getByRole("heading", { level: 1, name: "Workflows versus Agents" }),
	).toBeVisible();
	await page
		.getByRole("link", { name: /D1 - Agents and Workflows MOC/ })
		.first()
		.click();
	await expect(page).toHaveURL(
		new RegExp(`${BASE_PATH}/study/ccdv-f/d1-agents-and-workflows-moc/?$`),
	);
});
