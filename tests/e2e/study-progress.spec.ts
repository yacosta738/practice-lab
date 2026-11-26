import { expect, test } from "@playwright/test";

const BASE_PATH = "/practice-lab";
const NOTE_TITLE = "Subagents and Context Isolation";
const NOTE_URL = `${BASE_PATH}/study/ccdv-f/subagents-and-context-isolation/`;

test("keeps explicit study state, resume links, and goals in sync across views", async ({
	page,
}) => {
	await page.setViewportSize({ width: 390, height: 844 });
	await page.goto(NOTE_URL);
	await expect(page.locator('meta[name="referrer"]')).toHaveAttribute("content", "no-referrer");
	await expect(page.locator("#note-progress-status")).toContainText("In progress");
	expect(await page.evaluate(() => window.scrollY)).toBe(0);
	await page.context().setOffline(true);

	await page.getByRole("button", { name: "Mark as complete" }).click();
	await expect(page.getByRole("button", { name: "Mark unread" })).toBeVisible();
	await page.getByRole("button", { name: "Mark unread" }).click();
	await expect(page.locator("#note-progress-status")).toContainText("Not started");
	await page.getByRole("button", { name: "Mark as complete" }).click();
	await page.getByRole("button", { name: "Bookmark note" }).click();
	await expect(page.locator("[data-study-bookmark]")).toHaveAttribute("aria-pressed", "true");

	await page.locator("#study-reading-content h2[id]").first().scrollIntoViewIfNeeded();
	await expect(page.getByRole("link", { name: "Resume reading" })).toBeVisible({ timeout: 5_000 });
	await expect(page.getByRole("link", { name: "Resume reading" })).toHaveAttribute("href", /#/);

	await page.context().setOffline(false);
	await page.goto(`${BASE_PATH}/study/ccdv-f/`);
	await expect(page.locator('meta[name="referrer"]')).toHaveAttribute("content", "no-referrer");
	await expect(page.locator("#study-library-summary")).toContainText(/1 of \d+ notes completed/);
	const noteRow = page.locator("[data-study-note-row]").filter({ hasText: NOTE_TITLE });
	await expect(noteRow.getByRole("link", { name: "Resume reading" })).toHaveAttribute("href", /#/);
	await expect(
		noteRow.getByRole("button", { name: `Remove ${NOTE_TITLE} bookmark` }),
	).toHaveAttribute("aria-pressed", "true");

	await page.goto(`${BASE_PATH}/progress/`);
	await expect(page.locator('meta[name="referrer"]')).toHaveAttribute("content", "no-referrer");
	await expect(page.locator("#study-progress-status")).toContainText("up to date");
	await page.selectOption("#study-certification", "ccdv-f");
	await expect(page.locator("#study-progress-overview")).toContainText(/1 of \d+ notes completed/);
	await expect(page.locator("#study-progress-overview")).toContainText(NOTE_TITLE);

	await page.context().setOffline(true);
	await page.locator("#study-target-date").fill("2026-12-15");
	await page.locator("#study-target-questions").fill("12");
	await page.locator("#study-target-notes").fill("5");
	await expect(page.locator("#study-target-date")).toHaveValue("2026-12-15");
	expect(
		await page
			.locator("#study-goals-form")
			.evaluate((form) => (form as HTMLFormElement).checkValidity()),
	).toBe(true);
	await page.getByRole("button", { name: "Save goals" }).click();
	await expect(page.locator("#study-goals-status")).toContainText("Goals saved");
	await page.context().setOffline(false);
	await page.reload();
	await page.selectOption("#study-certification", "ccdv-f");
	await expect(page.locator("#study-target-date")).toHaveValue("2026-12-15");
	await expect(page.locator("#study-target-questions")).toHaveValue("12");
	await expect(page.locator("#study-target-notes")).toHaveValue("5");
	await expect(page.locator("#study-progress-overview")).toContainText(
		"floating local calendar date",
	);
});
