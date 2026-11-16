import { expect, test } from "@playwright/test";

const BASE_PATH = "/practice-lab";

test("homepage certification link navigates under the GitHub Pages base path", async ({ page }) => {
	await page.goto(`${BASE_PATH}/`);
	await page.getByRole("link", { name: "Start practicing" }).click();

	await expect(page).toHaveURL(new RegExp(`${BASE_PATH}/certifications/ccdv-f/?$`));
	await expect(page.getByRole("heading", { name: /Know the platform/i })).toBeVisible();
});
