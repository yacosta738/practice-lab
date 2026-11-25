import { expect, test } from "@playwright/test";
import { vercelSmokeRequestHeaders } from "../../scripts/lib/vercel-smoke-headers.mjs";

const routes = [
	{ path: "/", heading: "Practice with confidence." },
	{ path: "/study/", heading: "Study notes, organised by certification." },
	{ path: "/study/ccdv-f/", heading: "Claude Developer Foundations" },
	{
		path: "/study/ccdv-f/model-selection-and-optimization-workshop/",
		heading: "Model Selection and Optimization Workshop",
	},
];

test.beforeEach(async ({ page }, testInfo) => {
	const bypassSecret = process.env.VERCEL_AUTOMATION_BYPASS_SECRET;
	if (!bypassSecret) {
		return;
	}

	const baseUrl = testInfo.project.use.baseURL;
	if (typeof baseUrl !== "string") {
		throw new Error("Vercel smoke tests require a configured deployment base URL");
	}
	const deploymentOrigin = new URL(baseUrl).origin;

	await page.route("**/*", async (route) => {
		const headers = vercelSmokeRequestHeaders(
			route.request().url(),
			await route.request().allHeaders(),
			deploymentOrigin,
			bypassSecret,
		);
		await route.continue({ headers });
	});
});

for (const route of routes) {
	test(`Vercel renders ${route.path}`, async ({ page }) => {
		const response = await page.goto(route.path);

		expect(response?.status(), `${route.path} should return HTTP 200`).toBe(200);
		await expect(page.getByRole("main")).toBeVisible();
		await expect(page.getByRole("heading", { level: 1, name: route.heading })).toBeVisible();
		await expect(page.getByRole("navigation", { name: "Workspace" })).toBeVisible();
	});
}

test("the homepage study action reaches the study library navigation", async ({ page }) => {
	await page.goto("/");
	await page.getByRole("link", { name: "Study the notes" }).click();

	await expect(page).toHaveURL(/\/study\/$/);
	await expect(
		page.getByRole("heading", { level: 1, name: "Study notes, organised by certification." }),
	).toBeVisible();
	await expect(
		page
			.getByRole("navigation", { name: "Workspace" })
			.getByRole("link", { name: "Learn · Study library" }),
	).toHaveAttribute("aria-current", "page");
});
