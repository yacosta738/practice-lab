import { expect, test } from "@playwright/test";

const BASE_PATH = "/practice-lab";

test("serves a base-relative installable manifest and its icons", async ({ page }) => {
	await page.goto(`${BASE_PATH}/`);

	const manifestHref = await page.locator('link[rel="manifest"]').getAttribute("href");
	if (!manifestHref) throw new Error("The page does not link to a web app manifest.");
	expect(manifestHref).toBe(`${BASE_PATH}/manifest.json`);

	const manifestResponse = await page.request.get(manifestHref);
	expect(manifestResponse.ok()).toBe(true);
	const manifest = await manifestResponse.json();
	const manifestUrl = manifestResponse.url();

	expect(new URL(manifest.start_url, manifestUrl).pathname).toBe(`${BASE_PATH}/`);
	expect(new URL(manifest.scope, manifestUrl).pathname).toBe(`${BASE_PATH}/`);
	expect(manifest.display).toBe("standalone");
	expect(
		manifest.icons.some(
			(icon: { sizes: string; purpose: string }) =>
				icon.sizes === "192x192" && icon.purpose === "any",
		),
	).toBe(true);
	expect(
		manifest.icons.some(
			(icon: { sizes: string; purpose: string }) =>
				icon.sizes === "512x512" && icon.purpose === "any",
		),
	).toBe(true);

	for (const icon of manifest.icons) {
		const iconResponse = await page.request.get(new URL(icon.src, manifestUrl).href);
		expect(iconResponse.ok()).toBe(true);
	}

	for (const shortcut of manifest.shortcuts) {
		const shortcutUrl = new URL(shortcut.url, manifestUrl);
		expect(shortcutUrl.pathname.startsWith(`${BASE_PATH}/`)).toBe(true);
		expect((await page.request.get(shortcutUrl.href)).ok()).toBe(true);
	}
});

test("opens the cached home page when offline", async ({ page, context }) => {
	await page.goto(`${BASE_PATH}/`);
	await page.evaluate(() => navigator.serviceWorker.ready);
	await page.waitForFunction(() => Boolean(navigator.serviceWorker.controller));
	await page.reload({ waitUntil: "domcontentloaded" });

	try {
		await context.setOffline(true);
		await page.reload({ waitUntil: "domcontentloaded" });
		await expect(page.getByRole("heading", { name: "Practice with confidence." })).toBeVisible();
	} finally {
		await context.setOffline(false);
	}
});
