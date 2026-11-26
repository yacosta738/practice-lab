import { expect, test } from "@playwright/test";

const BASE_PATH = "/practice-lab";

test("CCAO-F study note exposes its domain-filtered practice quiz", async ({ page }) => {
	await page.goto(`${BASE_PATH}/study/ccao-f/prompt-design-and-task-decomposition/`);

	await expect(
		page.getByRole("heading", { name: "Prompt Design and Task Decomposition" }),
	).toBeVisible();
	await expect(page.locator(".studyPracticeCta a")).toHaveAttribute(
		"href",
		/\/certifications\/ccao-f\/\?mode=practice&domain=D1#session/,
	);
});

test("CCDV-P study note exposes its domain-filtered practice quiz", async ({ page }) => {
	await page.goto(`${BASE_PATH}/study/ccdv-p/architecture-and-orchestration/`);

	await expect(
		page.getByRole("heading", { name: "Advanced Agent Architecture and Orchestration" }),
	).toBeVisible();
	await expect(page.locator(".studyPracticeCta a")).toHaveAttribute(
		"href",
		/\/certifications\/ccdv-p\/\?mode=practice&domain=D1#session/,
	);
});
