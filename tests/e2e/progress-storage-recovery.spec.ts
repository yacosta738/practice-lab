import { expect, test } from "@playwright/test";
import { readCertificationProgress } from "./progress-helpers";

declare global {
	interface Window {
		__progressTestTransaction?: typeof IDBDatabase.prototype.transaction;
	}
}

test("shows quota failures and retries a checkpoint without losing the selection", async ({
	page,
}) => {
	await page.goto("/practice-lab/certifications/ccdv-f/?mode=practice#session");
	await page.selectOption("#amount", "10");
	await page.getByRole("button", { name: "Practice mode" }).click();
	await expect(page.locator("button.option").first()).toBeVisible();

	await page.evaluate(() => {
		const original = IDBDatabase.prototype.transaction;
		window.__progressTestTransaction = original;
		let failNextWrite = true;
		IDBDatabase.prototype.transaction = function (...args) {
			if (failNextWrite && args[1] === "readwrite") {
				failNextWrite = false;
				throw new DOMException("Quota exceeded", "QuotaExceededError");
			}
			return Reflect.apply(original, this, args) as IDBTransaction;
		};
	});

	await page.locator("button.option").first().click();
	const errorPanel = page.getByRole("alert").filter({ hasText: "Progress could not be saved." });
	await expect(errorPanel).toBeVisible();
	await expect(errorPanel).toContainText(/quota/i);
	const recoveryDownload = page.waitForEvent("download");
	await errorPanel.getByRole("button", { name: "Download recovery backup" }).click();
	expect((await recoveryDownload).suggestedFilename()).toContain("recovery-v1.json");

	const beforeRetry = await readCertificationProgress(page, "ccdv-f");
	const activeBeforeRetry = beforeRetry.sessions.find(
		(session) => session.status === "in_progress",
	);
	if (!activeBeforeRetry) throw new Error("Expected the active session to remain saved.");
	expect(
		(activeBeforeRetry.checkpoint as { selectedOptionIdsByQuestion: Record<string, string[]> })
			.selectedOptionIdsByQuestion,
	).toEqual({});

	await page.evaluate(() => {
		if (window.__progressTestTransaction) {
			IDBDatabase.prototype.transaction = window.__progressTestTransaction;
			delete window.__progressTestTransaction;
		}
	});
	await errorPanel.getByRole("button", { name: "Retry save" }).click();
	await expect(errorPanel).toHaveCount(0);

	const afterRetry = await readCertificationProgress(page, "ccdv-f");
	const activeAfterRetry = afterRetry.sessions.find((session) => session.status === "in_progress");
	if (!activeAfterRetry) throw new Error("Expected the retried session to remain active.");
	const checkpoint = activeAfterRetry.checkpoint as {
		currentQuestionId: string;
		selectedOptionIdsByQuestion: Record<string, string[]>;
	};
	expect(checkpoint.selectedOptionIdsByQuestion[checkpoint.currentQuestionId]).toHaveLength(1);
	await expect(page.locator("button.option.selected")).toHaveCount(1);
});
