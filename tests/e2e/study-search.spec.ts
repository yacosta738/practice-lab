import { expect, test } from "@playwright/test";

const BASE_PATH = "/practice-lab";

test("generated study search index excludes assessment answers but keeps prompts and instruction", async ({
	page,
}) => {
	const response = await page.request.get(`${BASE_PATH}/search-index.json`);
	expect(response.ok()).toBe(true);

	const items = (await response.json()) as { text?: string }[];
	const indexedText = items.map((item) => item.text ?? "").join(" ");

	expect(indexedText).toContain("An agent checks a support case using permitted read-only tools");
	expect(indexedText).toContain(
		"Choose based on operational requirements, not framework familiarity alone.",
	);
	expect(indexedText).not.toContain(
		"The harness owns termination and must stop on a terminal outcome",
	);
	expect(indexedText).not.toContain("D1.01 — B. Open-ended work with an unknown number");
});

test("study search finds note-body text, supports keyboard navigation, and announces empty results", async ({
	page,
}) => {
	await page.goto(`${BASE_PATH}/`);
	const trigger = page.getByRole("button", { name: /Search/ });
	await trigger.click();
	const dialog = page.getByRole("dialog", { name: "Search Practice Lab" });
	const input = dialog.getByRole("searchbox", {
		name: "Search certifications, domains, and study notes",
	});
	await input.fill("restricted toolset");

	const result = dialog.getByRole("link", { name: /Subagents and Context Isolation/ });
	await expect(result).toBeVisible();
	await expect(result).toContainText("restricted toolset");
	await input.press("ArrowDown");
	await expect(result).toBeFocused();
	await page.keyboard.press("Enter");
	await expect(page).toHaveURL(/study\/ccdv-f\/subagents-and-context-isolation/);

	await page.goto(`${BASE_PATH}/`);
	await trigger.click();
	await input.fill("not-a-real-study-term");
	await expect(dialog.getByRole("status")).toContainText("No results for");
	await expect(dialog.getByRole("link")).toHaveCount(0);
	await page.keyboard.press("Escape");
	await expect(page.locator("#pl-search-dialog")).toBeVisible();
	await expect(input).toHaveValue("");
	await page.keyboard.press("Escape");
	await expect(page.locator("#pl-search-dialog")).toBeHidden();
	await expect(trigger).toBeFocused();
});
