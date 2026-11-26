import { readFile } from "node:fs/promises";
import { expect, type Page, test } from "@playwright/test";

const DATA_MANAGEMENT_URL = "/practice-lab/data-management/";

declare global {
	interface Window {
		__releaseBackupFileText?: () => void;
	}
}

async function downloadText(page: Page) {
	const downloadPromise = page.waitForEvent("download");
	await page.getByRole("button", { name: "Download full backup" }).click();
	const download = await downloadPromise;
	const path = await download.path();
	if (!path) throw new Error("Expected the learning backup download to be available.");
	return readFile(path, "utf8");
}

async function seedTwoCertifications(page: Page) {
	await page.evaluate(async () => {
		const database = await new Promise<IDBDatabase>((resolve, reject) => {
			const request = indexedDB.open("practice-lab");
			request.onsuccess = () => resolve(request.result);
			request.onerror = () => reject(request.error);
		});
		const transaction = database.transaction(
			["sessions", "questionAttempts", "questionProgress", "studyProgress", "learningGoals"],
			"readwrite",
		);
		for (const certificationId of ["ccdv-f", "ccao-f"]) {
			const sessionId = `session-${certificationId}`;
			transaction.objectStore("sessions").put({
				id: sessionId,
				certificationId,
				mode: "practice",
				status: "in_progress",
				revision: 1,
				startedAt: 1,
				updatedAt: 1,
				scoring: { revision: "test", passingScore: 70, totalQuestions: 1, domainWeights: {} },
				content: { bankRevision: "test", questions: [] },
				checkpoint: {
					currentQuestionId: null,
					deadlineAt: null,
					selectedOptionIdsByQuestion: {},
					checkedQuestionIds: [],
					flaggedQuestionIds: [],
				},
			});
			transaction.objectStore("questionAttempts").put({
				sessionId,
				questionId: "question-one",
				certificationId,
				domainId: "domain-one",
				questionRevision: "test",
				selectedOptionIds: [],
				outcome: "incorrect",
				scoreEarned: 0,
				scorePossible: 1,
				evaluatedAt: 2,
			});
			transaction.objectStore("questionProgress").put({
				certificationId,
				questionId: "question-one",
				attemptCount: 1,
				correctCount: 0,
				legacyBaseline: null,
			});
			transaction.objectStore("studyProgress").put({
				certificationId,
				noteId: `${certificationId}/intro`,
				status: "completed",
				bookmarked: false,
				updatedAt: 2,
			});
			transaction.objectStore("learningGoals").put({
				certificationId,
				dailyQuestionTarget: 5,
				targetQuestionCount: null,
				targetNoteCount: null,
				targetDate: null,
				targetDateTimezone: "floating-local",
				updatedAt: 2,
			});
		}
		await new Promise<void>((resolve, reject) => {
			transaction.oncomplete = () => resolve();
			transaction.onerror = () => reject(transaction.error);
			transaction.onabort = () => reject(transaction.error);
		});
		database.close();
	});
}

async function addStudyProgress(page: Page, noteId: string) {
	await page.evaluate(async (id) => {
		const database = await new Promise<IDBDatabase>((resolve, reject) => {
			const request = indexedDB.open("practice-lab");
			request.onsuccess = () => resolve(request.result);
			request.onerror = () => reject(request.error);
		});
		const transaction = database.transaction("studyProgress", "readwrite");
		transaction.objectStore("studyProgress").put({
			certificationId: "ccdv-f",
			noteId: id,
			status: "completed",
			bookmarked: false,
			updatedAt: Date.now(),
		});
		await new Promise<void>((resolve, reject) => {
			transaction.oncomplete = () => resolve();
			transaction.onerror = () => reject(transaction.error);
			transaction.onabort = () => reject(transaction.error);
		});
		database.close();
	}, noteId);
}

async function readStudyProgress(page: Page) {
	return page.evaluate(async () => {
		const database = await new Promise<IDBDatabase>((resolve, reject) => {
			const request = indexedDB.open("practice-lab");
			request.onsuccess = () => resolve(request.result);
			request.onerror = () => reject(request.error);
		});
		const transaction = database.transaction("studyProgress", "readonly");
		const records = await new Promise<Record<string, unknown>[]>((resolve, reject) => {
			const request = transaction.objectStore("studyProgress").getAll();
			request.onsuccess = () => resolve(request.result as Record<string, unknown>[]);
			request.onerror = () => reject(request.error);
		});
		database.close();
		return records;
	});
}

test("exports a full backup and cancellation after preview changes nothing", async ({ page }) => {
	await page.goto(DATA_MANAGEMENT_URL);
	await expect(page.getByRole("status")).toContainText("ready");
	const backupJson = await downloadText(page);
	const backup = JSON.parse(backupJson) as {
		format: string;
		data: Record<string, unknown[]>;
	};
	expect(backup.format).toBe("practice-lab-learning-backup");
	expect(backup.data).toHaveProperty("sessions");
	expect(backup.data).toHaveProperty("studyProgress");
	expect(backup.data).toHaveProperty("learningGoals");

	await page.locator("#backup-file").setInputFiles({
		name: "practice-lab-learning-backup.json",
		mimeType: "application/json",
		buffer: Buffer.from(backupJson),
	});
	await expect(page.getByText("Backup validated.")).toBeVisible();
	await page.getByRole("button", { name: "Review replacement" }).click();
	const dialog = page.getByRole("dialog", { name: "Replace current learning data?" });
	await expect(dialog).toBeVisible();
	await dialog.getByRole("button", { name: "Cancel" }).click();
	await expect(dialog).toBeHidden();
	await expect(page.locator("#backup-summary")).toContainText("Current data: 0 sessions");
});

test("binds an open restore review to the selected backup", async ({ page }) => {
	await page.goto(DATA_MANAGEMENT_URL);
	await expect(page.getByRole("status")).toContainText("ready");
	const earlierBackup = await downloadText(page);
	await addStudyProgress(page, "ccdv-f/reviewed-backup");
	const laterBackup = await downloadText(page);

	await page.locator("#backup-file").setInputFiles({
		name: "earlier-learning-backup.json",
		mimeType: "application/json",
		buffer: Buffer.from(earlierBackup),
	});
	await expect(page.locator("#restore-summary")).toContainText("0 study records");
	await page.getByRole("button", { name: "Review replacement" }).click();
	const dialog = page.getByRole("dialog", { name: "Replace current learning data?" });
	await expect(dialog).toBeVisible();

	await page.locator("#backup-file").setInputFiles({
		name: "later-learning-backup.json",
		mimeType: "application/json",
		buffer: Buffer.from(laterBackup),
	});
	await expect(dialog).toBeHidden();
	await expect(page.locator("#restore-summary")).toContainText("1 study records");
	await page.getByRole("button", { name: "Review replacement" }).click();
	await expect(dialog).toBeVisible();
	await dialog.locator("#confirm-restore-check").check();
	await dialog.getByRole("button", { name: "Replace learning data" }).click();

	expect((await readStudyProgress(page)).map(({ noteId }) => noteId)).toEqual([
		"ccdv-f/reviewed-backup",
	]);
});

test("rejects an invalid backup without changing stored data", async ({ page }) => {
	await page.goto(DATA_MANAGEMENT_URL);
	await expect(page.getByRole("status")).toContainText("ready");
	const backup = JSON.parse(await downloadText(page)) as Record<string, unknown>;
	backup.sourceOrigin = "https://edited.example";
	await page.locator("#backup-file").setInputFiles({
		name: "tampered-learning-backup.json",
		mimeType: "application/json",
		buffer: Buffer.from(JSON.stringify(backup)),
	});
	await expect(page.getByRole("status")).toContainText(/integrity check failed/i);
	await expect(page.locator("#backup-summary")).toContainText("Current data: 0 sessions");
});

test("restores a valid full backup as a replacement across all learning stores", async ({
	page,
}) => {
	await page.goto(DATA_MANAGEMENT_URL);
	await expect(page.getByRole("status")).toContainText("ready");
	const backupJson = await downloadText(page);
	await addStudyProgress(page, "ccdv-f/restore-target");
	await page.reload();
	await expect(page.locator("#backup-summary")).toContainText("1 study records");

	await page.locator("#backup-file").setInputFiles({
		name: "valid-learning-backup.json",
		mimeType: "application/json",
		buffer: Buffer.from(backupJson),
	});
	await expect(page.getByRole("status")).toContainText("Backup validated.");
	await page.getByRole("button", { name: "Review replacement" }).click();
	const dialog = page.getByRole("dialog", { name: "Replace current learning data?" });
	await dialog.locator("#confirm-restore-check").check();
	await dialog.getByRole("button", { name: "Replace learning data" }).click();
	await expect(page.locator("#backup-summary")).toContainText("Current data: 0 sessions");
	await expect(page.locator("#backup-summary")).toContainText("0 study records");
	expect(await readStudyProgress(page)).toEqual([]);
	const reexported = JSON.parse(await downloadText(page)) as {
		data: { legacyRecords: Array<{ rawValue: string | null }> };
	};
	const certificationCount = await page.locator(".dataManager").evaluate((element) => {
		const data = (element as HTMLElement).dataset.certificationIds ?? "[]";
		return (JSON.parse(data) as string[]).length;
	});
	expect(reexported.data.legacyRecords).toHaveLength(certificationCount);
	expect(reexported.data.legacyRecords.every(({ rawValue }) => rawValue === null)).toBe(true);
});

test("rejects a stale restore after preview without partially replacing learning data", async ({
	page,
}) => {
	await page.goto(DATA_MANAGEMENT_URL);
	await expect(page.getByRole("status")).toContainText("ready");
	const backupJson = await downloadText(page);
	await addStudyProgress(page, "ccdv-f/initial");
	await page.reload();
	await page.locator("#backup-file").setInputFiles({
		name: "stale-learning-backup.json",
		mimeType: "application/json",
		buffer: Buffer.from(backupJson),
	});
	await expect(page.getByRole("status")).toContainText("Backup validated.");
	await addStudyProgress(page, "ccdv-f/changed-after-preview");
	await page.getByRole("button", { name: "Review replacement" }).click();
	const dialog = page.getByRole("dialog", { name: "Replace current learning data?" });
	const preRestoreDownload = page.waitForEvent("download");
	await dialog.getByRole("button", { name: "Download a backup of current data first" }).click();
	await preRestoreDownload;
	await expect(dialog.locator("#confirm-restore-check")).toBeChecked();
	await dialog.locator("#confirm-restore-check").check();
	await dialog.getByRole("button", { name: "Replace learning data" }).click();
	await expect(page.locator("#restore-dialog-status")).toContainText(
		/changed while the restore was being reviewed/i,
	);
	expect((await readStudyProgress(page)).map(({ noteId }) => noteId).sort()).toEqual([
		"ccdv-f/changed-after-preview",
		"ccdv-f/initial",
	]);
});

test("keeps the reviewed fingerprint when downloading current data before restore", async ({
	page,
}) => {
	await page.goto(DATA_MANAGEMENT_URL);
	await expect(page.getByRole("status")).toContainText("ready");
	const emptyBackup = await downloadText(page);
	await addStudyProgress(page, "ccdv-f/initial");
	await page.reload();

	await page.locator("#backup-file").setInputFiles({
		name: "empty-learning-backup.json",
		mimeType: "application/json",
		buffer: Buffer.from(emptyBackup),
	});
	await expect(page.getByRole("status")).toContainText("Backup validated.");
	await addStudyProgress(page, "ccdv-f/changed-after-review");
	await page.getByRole("button", { name: "Review replacement" }).click();
	const dialog = page.getByRole("dialog", { name: "Replace current learning data?" });
	const downloadPromise = page.waitForEvent("download");
	await dialog.locator("#download-before-restore").click();
	await downloadPromise;
	await dialog.locator("#confirm-restore-check").check();
	await dialog.getByRole("button", { name: "Replace learning data" }).click();

	await expect(page.locator("#restore-dialog-status")).toContainText(
		/changed while the restore was being reviewed/i,
	);
	expect((await readStudyProgress(page)).map(({ noteId }) => noteId).sort()).toEqual([
		"ccdv-f/changed-after-review",
		"ccdv-f/initial",
	]);
});

test("clears the previous preview and disables review while a new file is checked", async ({
	page,
}) => {
	await page.goto(DATA_MANAGEMENT_URL);
	await expect(page.getByRole("status")).toContainText("ready");
	const currentBackup = await downloadText(page);
	await addStudyProgress(page, "ccdv-f/kept");
	await page.reload();
	await page.locator("#backup-file").setInputFiles({
		name: "valid-learning-backup.json",
		mimeType: "application/json",
		buffer: Buffer.from(currentBackup),
	});
	await expect(page.getByRole("status")).toContainText("Backup validated.");
	await page.getByRole("button", { name: "Review replacement" }).click();
	const dialog = page.getByRole("dialog", { name: "Replace current learning data?" });
	await expect(dialog).toBeVisible();

	await page.evaluate(() => {
		const nativeText = File.prototype.text;
		let release: (() => void) | undefined;
		window.__releaseBackupFileText = () => release?.();
		File.prototype.text = function (): Promise<string> {
			return new Promise<string>((resolve, reject) => {
				release = () => {
					void nativeText.call(this).then(resolve, reject);
				};
			});
		};
	});
	await page.locator("#backup-file").setInputFiles({
		name: "invalid-learning-backup.json",
		mimeType: "application/json",
		buffer: Buffer.from("{"),
	});
	await expect(dialog).toBeHidden();
	await expect(page.locator("#restore-preview")).toBeHidden();
	await expect(page.locator("#review-restore")).toBeDisabled();
	await page.evaluate(() => window.__releaseBackupFileText?.());
	await expect(page.getByRole("status")).toContainText(/not valid JSON/i);
	expect((await readStudyProgress(page)).map(({ noteId }) => noteId)).toEqual(["ccdv-f/kept"]);
});

test("resets only the selected certification, including its active session", async ({ page }) => {
	await page.goto(DATA_MANAGEMENT_URL);
	await expect(page.getByRole("status")).toContainText("ready");
	await seedTwoCertifications(page);
	const retainedLegacy = {
		stats: { "removed-question-id": { attempts: 2, correct: 1, lastWrong: false } },
		session: null,
	};
	await page.evaluate(({ key, value }) => localStorage.setItem(key, JSON.stringify(value)), {
		key: "ccdv-f-practice-lab-v2",
		value: retainedLegacy,
	});
	await page.reload();
	await expect(page.locator("#backup-summary")).toContainText("Current data: 2 sessions");
	await page.locator("#reset-certification").selectOption("ccdv-f");
	await page.getByRole("button", { name: "Reset selected certification" }).click();
	const dialog = page.getByRole("dialog", { name: "Confirm reset" });
	await expect(dialog).toContainText(/active sessions for ccdv-f/i);
	await dialog.getByRole("button", { name: "Cancel" }).click();
	await expect(page.locator("#backup-summary")).toContainText("Current data: 2 sessions");

	await page.getByRole("button", { name: "Reset selected certification" }).click();
	await page
		.getByRole("dialog", { name: "Confirm reset" })
		.getByRole("button", { name: "Reset learning data" })
		.click();
	await expect(page.locator("#backup-summary")).toContainText("Current data: 1 sessions");
	const remaining = await page.evaluate(async () => {
		const database = await new Promise<IDBDatabase>((resolve, reject) => {
			const request = indexedDB.open("practice-lab");
			request.onsuccess = () => resolve(request.result);
			request.onerror = () => reject(request.error);
		});
		const transaction = database.transaction(
			["sessions", "questionAttempts", "questionProgress", "studyProgress", "learningGoals"],
			"readonly",
		);
		const read = (store: string) =>
			new Promise<Record<string, unknown>[]>((resolve, reject) => {
				const request = transaction.objectStore(store).getAll();
				request.onsuccess = () => resolve(request.result as Record<string, unknown>[]);
				request.onerror = () => reject(request.error);
			});
		const [sessions, attempts, questionProgress, studyProgress, learningGoals] = await Promise.all([
			read("sessions"),
			read("questionAttempts"),
			read("questionProgress"),
			read("studyProgress"),
			read("learningGoals"),
		]);
		database.close();
		return { sessions, attempts, questionProgress, studyProgress, learningGoals };
	});
	for (const records of Object.values(remaining)) {
		expect(records.map(({ certificationId }) => certificationId)).toEqual(["ccao-f"]);
	}
	await page.goto("/practice-lab/certifications/ccdv-f/");
	await expect(
		page.getByRole("status").filter({ hasText: "Legacy progress is ready to import" }),
	).toHaveCount(0);
	expect(await page.evaluate(() => localStorage.getItem("ccdv-f-practice-lab-v2"))).toBe(
		JSON.stringify(retainedLegacy),
	);
});

test("reports denied and unavailable persistence requests accessibly", async ({ page }) => {
	await page.addInitScript(() => {
		Object.defineProperty(navigator, "storage", {
			configurable: true,
			value: {
				estimate: async () => ({ usage: 1_024, quota: 10 * 1_024 * 1_024 }),
				persisted: async () => false,
				persist: async () => false,
			},
		});
	});
	await page.goto(DATA_MANAGEMENT_URL);
	await expect(page.getByRole("button", { name: "Request persistent storage" })).toBeEnabled();
	await page.getByRole("button", { name: "Request persistent storage" }).click();
	await expect(page.getByRole("status")).toContainText(/declined persistent storage/i);

	await page.addInitScript(() => {
		Object.defineProperty(navigator, "storage", { configurable: true, value: undefined });
	});
	await page.reload();
	await expect(page.locator("#storage-summary")).toContainText(/not available/i);
	await expect(page.getByRole("button", { name: "Request persistent storage" })).toBeDisabled();
});
