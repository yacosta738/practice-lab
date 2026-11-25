import { expect, test } from "@playwright/test";

const CERTIFICATION = "/practice-lab/certifications/ccdv-f/";
const LEGACY_KEY = "ccdv-f-practice-lab-v2";

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

	const migrationPanel = page
		.getByRole("status")
		.filter({ hasText: "Legacy progress is ready to import" });
	const downloadButton = migrationPanel.getByRole("button", { name: "Download data backup" });
	await expect(downloadButton).toBeVisible();
	const download = page.waitForEvent("download");
	await downloadButton.click();
	await download;
	const importButton = migrationPanel.getByRole("button", { name: "Import saved progress" });
	await expect(importButton).toBeEnabled();
	await importButton.click();
	await expect(migrationPanel).toHaveCount(0);

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
	const migrationPanel = page
		.getByRole("status")
		.filter({ hasText: "Legacy progress is ready to import" });
	const backupDownload = page.waitForEvent("download");
	await migrationPanel.getByRole("button", { name: "Download data backup" }).click();
	await backupDownload;
	await migrationPanel.getByRole("button", { name: "Import saved progress" }).click();
	await expect(migrationPanel).toHaveCount(0);

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
