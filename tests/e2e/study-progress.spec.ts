import { expect, test } from "@playwright/test";

const BASE_PATH = "/practice-lab";
const NOTE_TITLE = "Subagents and Context Isolation";
const NOTE_URL = `${BASE_PATH}/study/ccdv-f/subagents-and-context-isolation/`;
const DATA_MANAGEMENT_URL = `${BASE_PATH}/data-management/`;

declare global {
	interface Window {
		__studyCheckpointTimerCount?: () => number;
		__runStudyCheckpointTimers?: () => void;
	}
}

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

test("reopens study progress resources and reloads after BFCache restoration", async ({
	page,
	context,
}) => {
	await page.goto(`${BASE_PATH}/progress/`);
	await page.selectOption("#study-certification", "ccdv-f");
	await expect(page.locator("#study-progress-status")).toContainText("up to date");
	await expect(page.locator("#study-target-questions")).toHaveValue("");

	await page.evaluate(() => {
		window.dispatchEvent(new PageTransitionEvent("pagehide", { persisted: true }));
	});

	const updatePage = await context.newPage();
	await updatePage.goto(`${BASE_PATH}/progress/`);
	await updatePage.selectOption("#study-certification", "ccdv-f");
	await updatePage.locator("#study-target-questions").fill("17");
	await updatePage.getByRole("button", { name: "Save goals" }).click();
	await expect(updatePage.locator("#study-goals-status")).toContainText("Goals saved");

	await page.evaluate(() => {
		window.dispatchEvent(new PageTransitionEvent("pageshow", { persisted: true }));
	});
	await expect(page.locator("#study-progress-status")).toContainText("up to date");
	await expect(page.locator("#study-target-questions")).toHaveValue("17");

	await updatePage.close();
});

test("cancels a deferred reading checkpoint when another tab resets learning data", async ({
	page,
	context,
}) => {
	await page.addInitScript(() => {
		let nextTimerId = 1_000_000;
		const callbacks = new Map<number, () => void>();
		const nativeSetTimeout = window.setTimeout.bind(window);
		const nativeClearTimeout = window.clearTimeout.bind(window);
		const interceptedSetTimeout = (handler: TimerHandler, timeout?: number): number => {
			if (timeout === 1_500 && typeof handler === "function") {
				const timerId = nextTimerId++;
				callbacks.set(timerId, handler as () => void);
				return timerId;
			}
			return nativeSetTimeout(handler, timeout);
		};
		Object.defineProperty(window, "setTimeout", {
			configurable: true,
			value: interceptedSetTimeout,
		});
		Object.defineProperty(window, "clearTimeout", {
			configurable: true,
			value: (timerId?: number) => {
				if (timerId !== undefined && callbacks.delete(timerId)) return;
				nativeClearTimeout(timerId);
			},
		});
		window.__studyCheckpointTimerCount = () => callbacks.size;
		window.__runStudyCheckpointTimers = () => {
			for (const callback of callbacks.values()) callback();
			callbacks.clear();
		};
	});
	await page.goto(NOTE_URL);
	await expect(page.locator("#note-progress-status")).toContainText("In progress");
	await page.locator("#study-reading-content h2[id]").first().scrollIntoViewIfNeeded();
	await expect
		.poll(() => page.evaluate(() => window.__studyCheckpointTimerCount?.() ?? 0))
		.toBeGreaterThan(0);

	const resetPage = await context.newPage();
	await resetPage.goto(DATA_MANAGEMENT_URL);
	await expect(resetPage.getByRole("status")).toContainText("ready");
	await resetPage.locator("#reset-certification").selectOption("ccdv-f");
	await resetPage.getByRole("button", { name: "Reset selected certification" }).click();
	const resetDialog = resetPage.getByRole("dialog", { name: "Confirm reset" });
	await resetDialog.getByRole("button", { name: "Reset learning data" }).click();
	await expect(resetPage.getByRole("status")).toContainText("Learning data was reset.");
	await expect(page.locator("#note-progress-status")).toContainText("Not started");

	await page.evaluate(() => window.__runStudyCheckpointTimers?.());
	await expect(page.locator("#note-progress-error")).toBeHidden();
	const records = await page.evaluate(async () => {
		const database = await new Promise<IDBDatabase>((resolve, reject) => {
			const request = indexedDB.open("practice-lab");
			request.onsuccess = () => resolve(request.result);
			request.onerror = () => reject(request.error);
		});
		const transaction = database.transaction("studyProgress", "readonly");
		const result = await new Promise<unknown[]>((resolve, reject) => {
			const request = transaction.objectStore("studyProgress").getAll();
			request.onsuccess = () => resolve(request.result as unknown[]);
			request.onerror = () => reject(request.error);
		});
		database.close();
		return result;
	});
	expect(records).toEqual([]);
});
