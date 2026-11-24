import { expect, test } from "@playwright/test";

const BASE_PATH = "/practice-lab";

for (const route of ["/", "/certifications/ccdv-f/", "/study/"]) {
	test(`theme toggles once and restores the selected scheme on ${route}`, async ({ page }) => {
		await page.goto(`${BASE_PATH}${route}`);
		const scheme = page.locator('meta[name="color-scheme"]');
		const toggle = page.getByRole("button", { name: /theme: toggle/i });
		await expect(scheme).toHaveAttribute("content", "light dark");

		for (const theme of ["dark", "light"]) {
			await toggle.click();
			await expect(scheme).toHaveAttribute("content", theme);
			await page.reload();
			await expect(scheme).toHaveAttribute("content", theme);
		}
	});
}
