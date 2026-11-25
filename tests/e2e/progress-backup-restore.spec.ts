import { readFile } from "node:fs/promises";
import { expect, test } from "@playwright/test";

test("restores the current certification session from an exported JSON backup", async ({
	page,
}) => {
	const certificationUrl = "/practice-lab/certifications/ccdv-f/?mode=practice#session";
	await page.goto(certificationUrl);
	await page.selectOption("#amount", "10");
	await page.getByRole("button", { name: "Practice mode" }).click();
	await expect(page.locator("button.option").first()).toBeVisible();
	await page.locator("button.option").first().click();
	await expect(page.locator("button.option.selected")).toHaveCount(1);

	await page.goto(certificationUrl);
	await expect(page.getByRole("button", { name: /Resume practice/ })).toBeVisible();
	const backupDownload = page.waitForEvent("download");
	await page.getByRole("button", { name: "Download data backup" }).click();
	const backupPath = await (await backupDownload).path();
	if (!backupPath) throw new Error("Expected the progress backup download to be available.");
	const backupJson = await readFile(backupPath, "utf8");

	await page.getByRole("button", { name: "Reset progress" }).click();
	const resetDialog = page.getByRole("dialog");
	await expect(resetDialog).toBeVisible();
	await resetDialog.getByRole("button", { name: "Reset history" }).click();
	await expect(page.getByRole("button", { name: "Resume practice" })).toHaveCount(0);

	await page.locator("#progress-restore-file").setInputFiles({
		name: "practice-lab-progress.json",
		mimeType: "application/json",
		buffer: Buffer.from(backupJson),
	});
	const restoreDialog = page.getByRole("dialog");
	await expect(restoreDialog).toBeVisible();
	await expect(restoreDialog).toContainText(/replaces quiz progress and session history/i);
	await restoreDialog.getByRole("button", { name: "Restore progress" }).click();

	await expect(page.getByRole("button", { name: /Resume practice/ })).toBeVisible();
	await page.getByRole("button", { name: /Resume practice/ }).click();
	await expect(page.locator("button.option.selected")).toHaveCount(1);
});
