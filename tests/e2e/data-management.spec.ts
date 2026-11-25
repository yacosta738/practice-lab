import { readFile } from "node:fs/promises";
import { expect, type Page, test } from "@playwright/test";

const DATA_MANAGEMENT_URL = "/practice-lab/data-management/";

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
				completed: true,
				bookmarked: false,
				updatedAt: 2,
			});
			transaction.objectStore("learningGoals").put({
				certificationId,
				dailyQuestionTarget: 5,
				targetDate: null,
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
			completed: true,
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
