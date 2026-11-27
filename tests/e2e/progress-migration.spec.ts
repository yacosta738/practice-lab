import { devices, expect, type Locator, type Page, test } from "@playwright/test";
import { readCertificationProgress } from "./progress-helpers";

const CERTIFICATION = "/practice-lab/certifications/ccdv-f/";
const DATA_MANAGEMENT = "/practice-lab/data-management/";
const LEGACY_KEY = "ccdv-f-practice-lab-v2";

async function tapElement(page: Page, target: Locator): Promise<void> {
	await target.scrollIntoViewIfNeeded();
	const bounds = await target.boundingBox();
	if (!bounds) throw new Error("Expected the touch target to have a bounding box.");
	await page.touchscreen.tap(bounds.x + bounds.width / 2, bounds.y + bounds.height / 2);
}

async function readLegacyBackup(page: Page, certificationId: string) {
	return page.evaluate(async (id) => {
		const database = await new Promise<IDBDatabase>((resolve, reject) => {
			const request = indexedDB.open("practice-lab");
			request.onsuccess = () => resolve(request.result);
			request.onerror = () => reject(request.error);
		});
		const transaction = database.transaction("metadata", "readonly");
		const records = await new Promise<Record<string, unknown>[]>((resolve, reject) => {
			const request = transaction.objectStore("metadata").getAll();
			request.onsuccess = () => resolve(request.result);
			request.onerror = () => reject(request.error);
		});
		database.close();
		const latestKey = records.find(({ key }) => key === "legacy-backup:latest")?.value;
		return {
			latestKey,
			backup: records.find(({ key }) => key === latestKey),
			legacyStorageKey: `${id}-practice-lab-v2`,
		};
	}, certificationId);
}

async function openLegacyImport(page: Page): Promise<Locator> {
	const migrationNotice = page.getByText("Legacy progress is ready to import", { exact: false });
	await expect(migrationNotice).toBeVisible();
	await expect(page.getByRole("button", { name: "Import saved progress" })).toHaveCount(0);
	await page.getByRole("link", { name: "Back up and import progress" }).click();
	await expect(page).toHaveURL(/\/data-management\/\?migration=ccdv-f#legacy-progress/);
	const migrationPanel = page.getByRole("region", { name: "Legacy progress import" });
	await expect(migrationPanel).toBeVisible();
	return migrationPanel;
}

async function downloadLegacyBackup(
	page: Page,
	migrationPanel: Locator,
	expectBrowserDownload = true,
): Promise<void> {
	if (expectBrowserDownload) {
		const download = page.waitForEvent("download");
		await migrationPanel.getByRole("button", { name: "Download legacy progress backup" }).click();
		await download;
		return;
	}
	const button = migrationPanel.getByRole("button", { name: "Download legacy progress backup" });
	await button.evaluate((element) => {
		element.setAttribute("data-test-clicked", "false");
		element.addEventListener("click", () => element.setAttribute("data-test-clicked", "true"), {
			once: true,
		});
	});
	await button.click();
	await expect(button).toHaveAttribute("data-test-clicked", "true");
	const rawValue = await page.evaluate((key) => localStorage.getItem(key), LEGACY_KEY);
	await expect
		.poll(() => readLegacyBackup(page, "ccdv-f"))
		.toMatchObject({
			latestKey: expect.stringMatching(/^legacy-backup:archive:/),
			legacyStorageKey: LEGACY_KEY,
			backup: {
				value: {
					records: expect.arrayContaining([
						expect.objectContaining({ storageKey: LEGACY_KEY, rawValue }),
					]),
				},
			},
		});
	await expect(page.getByRole("status")).toContainText(
		"A versioned legacy progress backup was downloaded",
	);
}

test.describe("iPhone mock exam with legacy progress", () => {
	test.use({
		viewport: devices["iPhone 13"].viewport,
		deviceScaleFactor: devices["iPhone 13"].deviceScaleFactor,
		isMobile: devices["iPhone 13"].isMobile,
		hasTouch: devices["iPhone 13"].hasTouch,
		userAgent: devices["iPhone 13"].userAgent,
	});

	test("starts, saves, resumes, and completes by touch before importing legacy progress", async ({
		page,
	}) => {
		const legacy = {
			stats: {
				"removed-question-id": { attempts: 5, correct: 3, lastWrong: true },
			},
			session: null,
		};

		await page.goto(`${CERTIFICATION}?mode=assess#session`);
		await page.evaluate(({ key, value }) => localStorage.setItem(key, JSON.stringify(value)), {
			key: LEGACY_KEY,
			value: legacy,
		});
		await page.reload();
		await expect(
			page.getByText("Legacy progress is ready to import", { exact: false }),
		).toBeVisible();
		await page.goto(CERTIFICATION);
		await expect(page.getByRole("button", { name: "Practice mode" })).toBeDisabled();
		await expect(page.getByRole("button", { name: /Review mistakes/ })).toBeDisabled();
		await page.goto(`${CERTIFICATION}?mode=assess#session`);

		const startButton = page.getByRole("button", { name: "Start mock exam" });
		await expect(startButton).toBeEnabled();
		await tapElement(page, startButton);
		await expect(page.locator("button.option").first()).toBeVisible();

		const answerCount = Number(
			(await page.locator(".hint").textContent())?.match(/exactly (\d+) answers/)?.[1] ?? 1,
		);
		for (let index = 0; index < answerCount; index += 1) {
			await tapElement(page, page.locator("button.option").nth(index));
			await expect(page.locator("button.option.selected")).toHaveCount(index + 1);
		}
		await expect(page.locator("button.option.selected")).toHaveCount(answerCount);

		const progressBeforeReload = await readCertificationProgress(page, "ccdv-f");
		const activeBeforeReload = progressBeforeReload.sessions.find(
			({ status }) => status === "in_progress",
		);
		if (!activeBeforeReload) throw new Error("Expected the new exam to be saved in IndexedDB.");
		const examQuestions = (activeBeforeReload.content as { questions: { questionId: string }[] })
			.questions;
		const firstQuestionId = examQuestions[0]?.questionId;
		if (!firstQuestionId) throw new Error("Expected the mock exam to contain a question.");
		const savedAnswers = (
			activeBeforeReload.checkpoint as {
				selectedOptionIdsByQuestion: Record<string, string[]>;
			}
		).selectedOptionIdsByQuestion[firstQuestionId];
		expect(savedAnswers).toHaveLength(answerCount);

		const migrationPanel = await openLegacyImport(page);
		await downloadLegacyBackup(page, migrationPanel, false);
		const blockedImport = migrationPanel.getByRole("button", { name: "Import saved progress" });
		await expect(blockedImport).toBeDisabled();
		await expect(migrationPanel).toContainText(
			"Finish or exit the active session before importing.",
		);

		await page.goto(`${CERTIFICATION}?mode=assess&resume=1#session`);
		await expect(page.locator("button.option.selected")).toHaveCount(answerCount);
		await expect(page.locator(".pl-shell")).toHaveAttribute("data-exam-focus", "true");

		const navigator = page.locator("details.examNavigator");
		await tapElement(page, navigator.locator("summary"));
		await expect(navigator).toHaveAttribute("open", "");
		await tapElement(page, page.getByRole("button", { name: "Submit mock exam" }));
		const submitDialog = page.getByRole("dialog", { name: "Submit mock exam?" });
		await expect(submitDialog).toBeVisible();
		await tapElement(page, submitDialog.getByRole("button", { name: "Submit and score" }));
		await expect(page.locator(".results")).toBeVisible();

		const readyToImport = await openLegacyImport(page);
		await downloadLegacyBackup(page, readyToImport, false);
		const importButton = readyToImport.getByRole("button", { name: "Import saved progress" });
		await expect(importButton).toBeEnabled();
		await importButton.click();
		await expect(readyToImport).toContainText("Legacy progress was imported for CCDV-F.");

		const completedProgress = await readCertificationProgress(page, "ccdv-f");
		expect(completedProgress.sessions).toContainEqual(
			expect.objectContaining({ id: activeBeforeReload.id, mode: "exam", status: "completed" }),
		);
		expect(completedProgress.attempts).toHaveLength(1);
		expect(completedProgress.questionProgress).toContainEqual(
			expect.objectContaining({ questionId: firstQuestionId, attemptCount: 1 }),
		);
		await expect
			.poll(() => page.evaluate((key) => localStorage.getItem(key), LEGACY_KEY))
			.toBe(JSON.stringify(legacy));
	});
});

test("migrates legacy aggregates atomically and keeps a downloadable backup", async ({ page }) => {
	const legacy = {
		stats: {
			"removed-question-id": { attempts: 5, correct: 3, lastWrong: true },
		},
		session: null,
	};

	await page.goto(CERTIFICATION);
	await page.evaluate(({ key, value }) => localStorage.setItem(key, JSON.stringify(value)), {
		key: LEGACY_KEY,
		value: legacy,
	});
	await page.reload();

	const migrationPanel = await openLegacyImport(page);
	const downloadButton = migrationPanel.getByRole("button", {
		name: "Download legacy progress backup",
	});
	await expect(downloadButton).toBeVisible();
	await expect(
		migrationPanel.getByRole("button", { name: "Import saved progress" }),
	).toBeDisabled();
	await downloadLegacyBackup(page, migrationPanel);
	const importButton = migrationPanel.getByRole("button", { name: "Import saved progress" });
	await expect(importButton).toBeEnabled();
	await importButton.click();
	await expect(migrationPanel).toContainText("Legacy progress was imported for CCDV-F.");

	const imported = await page.evaluate(async () => {
		const database = await new Promise<IDBDatabase>((resolve, reject) => {
			const request = indexedDB.open("practice-lab");
			request.onsuccess = () => resolve(request.result);
			request.onerror = () => reject(request.error);
		});
		const transaction = database.transaction(["questionProgress", "metadata"], "readonly");
		const [progress, marker, backup] = await Promise.all([
			new Promise<unknown>((resolve, reject) => {
				const request = transaction
					.objectStore("questionProgress")
					.get(["ccdv-f", "removed-question-id"]);
				request.onsuccess = () => resolve(request.result);
				request.onerror = () => reject(request.error);
			}),
			new Promise<unknown>((resolve, reject) => {
				const request = transaction.objectStore("metadata").get("migration:legacy-v2:ccdv-f");
				request.onsuccess = () => resolve(request.result);
				request.onerror = () => reject(request.error);
			}),
			new Promise<unknown>((resolve, reject) => {
				const request = transaction.objectStore("metadata").get("legacy-backup:ccdv-f");
				request.onsuccess = () => resolve(request.result);
				request.onerror = () => reject(request.error);
			}),
		]);
		database.close();
		return { progress, marker, backup };
	});

	expect(imported.progress).toMatchObject({
		certificationId: "ccdv-f",
		questionId: "removed-question-id",
		legacyBaseline: { attempts: 5, correct: 3, lastWrong: true },
	});
	expect(imported.marker).toBeDefined();
	expect(imported.backup).toMatchObject({
		key: "legacy-backup:ccdv-f",
		value: {
			format: "practice-lab-progress-backup",
			version: 1,
			legacyStorageKey: LEGACY_KEY,
		},
	});
	await expect
		.poll(() => page.evaluate((key) => localStorage.getItem(key), LEGACY_KEY))
		.toBe(JSON.stringify(legacy));
});

test("finds pending legacy progress from Data management", async ({ page }) => {
	const legacy = {
		stats: {
			"removed-question-id": { attempts: 5, correct: 3, lastWrong: true },
		},
		session: null,
	};

	await page.goto(CERTIFICATION);
	await page.evaluate(({ key, value }) => localStorage.setItem(key, JSON.stringify(value)), {
		key: LEGACY_KEY,
		value: legacy,
	});
	await page.goto(DATA_MANAGEMENT);

	const migrationPanel = page.getByRole("region", { name: "Legacy progress import" });
	await migrationPanel.getByLabel("Certification to check").selectOption("ccdv-f");
	await migrationPanel.getByRole("button", { name: "Check for legacy progress" }).click();
	await expect(migrationPanel).toContainText("Legacy progress is ready to import");
	const pageErrors: string[] = [];
	page.on("pageerror", (error) => pageErrors.push(error.message));
	await page.evaluate(() => {
		const select = document.getElementById("legacy-migration-certification") as HTMLSelectElement;
		const check = document.getElementById("check-legacy-progress") as HTMLButtonElement;
		check.click();
		select.value = "ccdv-p";
		check.click();
	});
	await expect(migrationPanel).toContainText("No legacy progress is waiting to import for CCDV-P.");
	expect(pageErrors).toEqual([]);
	await migrationPanel.getByLabel("Certification to check").selectOption("ccdv-f");
	await migrationPanel.getByRole("button", { name: "Check for legacy progress" }).click();
	await expect(migrationPanel).toContainText("Legacy progress is ready to import for CCDV-F.");
	await expect(
		migrationPanel.getByRole("button", { name: "Import saved progress" }),
	).toBeDisabled();
});

test("pauses legacy import after an old tab changes and restores the saved record", async ({
	page,
	context,
}) => {
	const legacy = {
		stats: {
			"removed-question-id": { attempts: 5, correct: 3, lastWrong: true },
		},
		session: null,
	};
	const rawValue = JSON.stringify(legacy);

	await page.goto(CERTIFICATION);
	await page.evaluate(({ key, value }) => localStorage.setItem(key, JSON.stringify(value)), {
		key: LEGACY_KEY,
		value: legacy,
	});
	await page.reload();
	const migrationPanel = await openLegacyImport(page);
	await downloadLegacyBackup(page, migrationPanel, false);
	const importButton = migrationPanel.getByRole("button", { name: "Import saved progress" });
	await expect(importButton).toBeEnabled();

	const legacyTab = await context.newPage();
	await legacyTab.goto(CERTIFICATION);
	await expect(
		legacyTab.getByText("Legacy progress is ready to import", { exact: false }),
	).toBeVisible();
	await legacyTab.evaluate(
		({ key, originalValue }) => {
			localStorage.setItem(
				key,
				JSON.stringify({
					stats: { "removed-question-id": { attempts: 7, correct: 4, lastWrong: true } },
					session: null,
				}),
			);
			localStorage.setItem(key, originalValue);
		},
		{ key: LEGACY_KEY, originalValue: rawValue },
	);

	await expect(page.getByRole("status")).toContainText(
		"Legacy progress changed in an older tab. Import is paused.",
	);
	await expect(importButton).toBeDisabled();

	await downloadLegacyBackup(page, migrationPanel, false);
	await expect(importButton).toBeEnabled();
	await importButton.click();
	await expect(migrationPanel).toContainText("Legacy progress was imported for CCDV-F.");
	await expect
		.poll(() => page.evaluate((key) => localStorage.getItem(key), LEGACY_KEY))
		.toBe(rawValue);
	await legacyTab.close();
});

test("archives writes from an old tab without merging or losing the migrated baseline", async ({
	page,
}) => {
	const legacy = {
		stats: {
			"removed-question-id": { attempts: 5, correct: 3, lastWrong: true },
		},
		session: null,
	};
	const originalRawValue = JSON.stringify(legacy);
	await page.goto(CERTIFICATION);
	await page.evaluate(({ key, value }) => localStorage.setItem(key, JSON.stringify(value)), {
		key: LEGACY_KEY,
		value: legacy,
	});
	await page.reload();
	const migrationPanel = await openLegacyImport(page);
	await downloadLegacyBackup(page, migrationPanel, false);
	const importButton = migrationPanel.getByRole("button", { name: "Import saved progress" });
	await expect(importButton).toBeEnabled();
	await importButton.click();
	await expect(migrationPanel).toContainText("Legacy progress was imported for CCDV-F.");

	await page.goto(CERTIFICATION);

	const legacyTab = await page.context().newPage();
	await legacyTab.goto(CERTIFICATION);
	const staleLegacy = {
		stats: {
			"removed-question-id": { attempts: 99, correct: 80, lastWrong: false },
		},
		session: null,
	};
	await legacyTab.evaluate(({ key, value }) => localStorage.setItem(key, JSON.stringify(value)), {
		key: LEGACY_KEY,
		value: staleLegacy,
	});
	await expect(page.getByText("Its counts will not be merged automatically.")).toBeVisible();

	const stalePanel = page
		.getByRole("alert")
		.filter({ hasText: "Its counts will not be merged automatically." });
	const refreshedBackup = page.waitForEvent("download");
	await stalePanel.getByRole("button", { name: "Download data backup" }).click();
	await refreshedBackup;
	const reconcileButton = stalePanel.getByRole("button", {
		name: "Keep IndexedDB and archive legacy copy",
	});
	await expect(reconcileButton).toBeEnabled();
	await reconcileButton.click();
	await expect(stalePanel).toHaveCount(0);

	const reconciled = await page.evaluate(async () => {
		const database = await new Promise<IDBDatabase>((resolve, reject) => {
			const request = indexedDB.open("practice-lab");
			request.onsuccess = () => resolve(request.result);
			request.onerror = () => reject(request.error);
		});
		const transaction = database.transaction(["questionProgress", "metadata"], "readonly");
		const [progress, backup, marker, metadata] = await Promise.all([
			new Promise<unknown>((resolve, reject) => {
				const request = transaction
					.objectStore("questionProgress")
					.get(["ccdv-f", "removed-question-id"]);
				request.onsuccess = () => resolve(request.result);
				request.onerror = () => reject(request.error);
			}),
			new Promise<unknown>((resolve, reject) => {
				const request = transaction.objectStore("metadata").get("legacy-backup:ccdv-f");
				request.onsuccess = () => resolve(request.result);
				request.onerror = () => reject(request.error);
			}),
			new Promise<unknown>((resolve, reject) => {
				const request = transaction.objectStore("metadata").get("migration:legacy-v2:ccdv-f");
				request.onsuccess = () => resolve(request.result);
				request.onerror = () => reject(request.error);
			}),
			new Promise<Record<string, unknown>[]>((resolve, reject) => {
				const request = transaction.objectStore("metadata").getAll();
				request.onsuccess = () => resolve(request.result as Record<string, unknown>[]);
				request.onerror = () => reject(request.error);
			}),
		]);
		const latestBackupKey = metadata.find(({ key }) => key === "legacy-backup:latest")?.value;
		const globalBackup = metadata.find(({ key }) => key === latestBackupKey)?.value;
		database.close();
		return { progress, backup, marker, globalBackup };
	});

	expect(reconciled.progress).toMatchObject({
		legacyBaseline: { attempts: 5, correct: 3, lastWrong: true },
	});
	expect(reconciled.backup).toMatchObject({
		value: { rawValue: JSON.stringify(staleLegacy) },
	});
	expect(reconciled.marker).toMatchObject({
		value: { warnings: expect.arrayContaining([expect.stringContaining("without merging")]) },
	});
	expect(reconciled.globalBackup).toMatchObject({
		records: expect.arrayContaining([
			expect.objectContaining({ storageKey: LEGACY_KEY, rawValue: JSON.stringify(staleLegacy) }),
		]),
	});
	await expect
		.poll(() => page.evaluate((key) => localStorage.getItem(key), LEGACY_KEY))
		.toBe(JSON.stringify(staleLegacy));
	await expect
		.poll(() => page.evaluate(() => localStorage.getItem("ccdv-f-practice-lab-v2")))
		.not.toBe(originalRawValue);
	await legacyTab.close();
});

test("ignores legacy storage events after another tab resets the certification", async ({
	page,
	context,
}) => {
	await page.goto(CERTIFICATION);
	await expect(page.getByRole("button", { name: "Practice mode" })).toBeVisible();

	const managementTab = await context.newPage();
	await managementTab.goto("/practice-lab/data-management/");
	await expect(managementTab.getByRole("status")).toContainText("ready");
	await managementTab.locator("#reset-certification").selectOption("ccdv-f");
	await managementTab.getByRole("button", { name: "Reset selected certification" }).click();
	const resetDialog = managementTab.getByRole("dialog", { name: "Confirm reset" });
	await resetDialog.getByRole("button", { name: "Reset learning data" }).click();
	await expect(managementTab.getByRole("status")).toContainText("Learning data was reset");

	await managementTab.evaluate(
		(key) => localStorage.setItem(key, "write from an older tab"),
		LEGACY_KEY,
	);
	await expect(
		page.getByRole("alert").filter({ hasText: "Legacy progress changed in an older tab." }),
	).toHaveCount(0);
	await expect(page.getByRole("button", { name: "Practice mode" })).toBeEnabled();
	await managementTab.close();
});
