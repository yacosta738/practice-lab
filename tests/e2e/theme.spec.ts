import { expect, test } from "@playwright/test";

const BASE_PATH = "/practice-lab";

for (const route of ["/", "/certifications/ccdv-f/", "/study/"]) {
	test(`theme follows light OS, overrides to dark, and reverts to system on ${route}`, async ({
		page,
	}) => {
		await page.emulateMedia({ colorScheme: "light" });
		await page.goto(`${BASE_PATH}${route}`);
		const scheme = page.locator('meta[name="color-scheme"]');
		const toggle = page.getByRole("button", { name: /theme: toggle/i });
		await expect(scheme).toHaveAttribute("content", "light dark");

		// First click overrides to dark and persists across reload
		await toggle.click();
		await expect(scheme).toHaveAttribute("content", "dark");
		await page.reload();
		await expect(scheme).toHaveAttribute("content", "dark");

		// Second click matches light OS, so it reverts to following system ("light dark")
		await toggle.click();
		await expect(scheme).toHaveAttribute("content", "light dark");
		await page.reload();
		await expect(scheme).toHaveAttribute("content", "light dark");
	});
}

test("theme follows dark OS and switches to light on first click", async ({ page }) => {
	await page.emulateMedia({ colorScheme: "dark" });
	await page.goto(`${BASE_PATH}/`);
	const scheme = page.locator('meta[name="color-scheme"]');
	const toggle = page.getByRole("button", { name: /theme: toggle/i });

	await expect(scheme).toHaveAttribute("content", "light dark");

	// First click on dark OS immediately overrides to light
	await toggle.click();
	await expect(scheme).toHaveAttribute("content", "light");
	await page.reload();
	await expect(scheme).toHaveAttribute("content", "light");

	// Second click matches dark OS and reverts to system
	await toggle.click();
	await expect(scheme).toHaveAttribute("content", "light dark");
});
