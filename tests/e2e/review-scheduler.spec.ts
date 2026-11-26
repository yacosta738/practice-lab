import AxeBuilder from "@axe-core/playwright";
import { expect, type Page, test } from "@playwright/test";
import { readCertificationProgress } from "./progress-helpers";

const BASE_PATH = "/practice-lab";

async function answerAndCheckCurrentQuestion(page: Page): Promise<void> {
	await expect(page.locator("button.option").first()).toBeVisible();
	const checkAnswer = page.getByRole("button", { name: "Check answer" });
	const optionCount = await page.locator("button.option").count();
	for (let answer = 0; answer < optionCount; answer += 1) {
		if (await checkAnswer.isEnabled()) break;
		await page.locator('button.option[aria-pressed="false"]').first().click();
	}
	await expect(checkAnswer).toBeEnabled();
	await checkAnswer.click();
	await expect(page.locator(".feedback")).toBeVisible();
}

async function shiftDueDatesInIndexedDb(
	page: Page,
	certificationId: string,
	dueDates: string[],
): Promise<void> {
	await page.evaluate(
		async ({ id, dates }) => {
			const db = await new Promise<IDBDatabase>((resolve, reject) => {
				const req = indexedDB.open("practice-lab");
				req.onsuccess = () => resolve(req.result);
				req.onerror = () => reject(req.error);
			});
			const tx = db.transaction(["questionProgress"], "readwrite");
			const store = tx.objectStore("questionProgress");
			const records = await new Promise<Record<string, unknown>[]>((resolve, reject) => {
				const req = store.index("by-certification").getAll(id);
				req.onsuccess = () => resolve(req.result as Record<string, unknown>[]);
				req.onerror = () => reject(req.error);
			});
			for (let i = 0; i < records.length && i < dates.length; i += 1) {
				const record = records[i];
				const schedule = record.reviewSchedule as Record<string, unknown> | undefined;
				if (schedule) {
					schedule.dueDate = dates[i];
					store.put(record);
				}
			}
			await new Promise<void>((resolve, reject) => {
				tx.oncomplete = () => resolve();
				tx.onerror = () => reject(tx.error);
				tx.onabort = () => reject(tx.error);
			});
			db.close();
		},
		{ id: certificationId, dates: dueDates },
	);
}

test("shows accessible empty review queue states on My Progress and certification pages", async ({
	page,
}) => {
	await page.setViewportSize({ width: 1280, height: 900 });
	await page.goto(`${BASE_PATH}/progress/`);
	await expect(page.getByText("Saved progress is up to date.")).toBeVisible();
	await expect(page.getByRole("heading", { level: 2, name: "Due review queue" })).toBeVisible();
	await expect(page.locator("#review-queue")).toContainText(
		"No questions are due for review right now.",
	);

	const progressA11y = await new AxeBuilder({ page }).include("#review-queue").analyze();
	expect(
		progressA11y.violations.filter((v) => v.impact === "critical" || v.impact === "serious"),
	).toEqual([]);

	await page.goto(`${BASE_PATH}/certifications/ccdv-f/`);
	await expect(page.getByRole("heading", { level: 3, name: "Due review queue" })).toBeVisible();
	await expect(page.locator("#review-queue")).toContainText(
		"No questions are due for review right now.",
	);
	await expect(page.getByRole("button", { name: "Start review" })).toBeDisabled();

	const certA11y = await new AxeBuilder({ page }).include("#review-queue").analyze();
	expect(
		certA11y.violations.filter((v) => v.impact === "critical" || v.impact === "serious"),
	).toEqual([]);
});

test("schedules due/overdue reviews, runs spaced review atomically, and updates cross-tab", async ({
	page,
	context,
}, testInfo) => {
	await page.setViewportSize({ width: 1280, height: 900 });

	// 1. Seed two evaluated questions in a normal practice session
	await page.goto(`${BASE_PATH}/certifications/ccdv-f/`);
	await page.selectOption("#amount", "10");
	await page.getByRole("button", { name: "Practice mode" }).click();
	await answerAndCheckCurrentQuestion(page);
	await page.getByRole("button", { name: "Next question →" }).click();
	await answerAndCheckCurrentQuestion(page);
	await page.getByRole("button", { name: "Pause & go home" }).click();
	await expect(page.getByRole("heading", { level: 3, name: "Due review queue" })).toBeVisible();

	// 2. Shift due dates deterministically: 1 overdue (5 days ago), 1 due today
	const today = await page.evaluate(() => {
		const parts = new Intl.DateTimeFormat("en-CA", {
			year: "numeric",
			month: "2-digit",
			day: "2-digit",
		}).formatToParts(new Date());
		const y = parts.find((p) => p.type === "year")?.value ?? "2026";
		const m = parts.find((p) => p.type === "month")?.value ?? "01";
		const d = parts.find((p) => p.type === "day")?.value ?? "01";
		return `${y}-${m}-${d}`;
	});
	const overdueDate = await page.evaluate((baseDate) => {
		const [y, m, d] = baseDate.split("-").map(Number);
		const shifted = new Date(Date.UTC(y, m - 1, d - 5));
		return `${shifted.getUTCFullYear()}-${String(shifted.getUTCMonth() + 1).padStart(2, "0")}-${String(shifted.getUTCDate()).padStart(2, "0")}`;
	}, today);
	await shiftDueDatesInIndexedDb(page, "ccdv-f", [overdueDate, today]);

	// 3. Verify due/overdue counts, reasons, and accessibility on My Progress dashboard
	await page.goto(`${BASE_PATH}/progress/`);
	await page.waitForLoadState("networkidle");
	await expect(page.getByText("Saved progress is up to date.")).toBeVisible();
	await expect(page.locator("#review-queue")).toContainText("2 due");
	await expect(page.locator("#review-queue")).toContainText("1 overdue");
	await expect(page.locator("#review-queue")).toContainText("1 due today");
	await expect(page.locator("#review-queue")).toContainText("Overdue by 5 days");

	if (testInfo.project.name !== "firefox") {
		const dueA11y = await new AxeBuilder({ page })
			.withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
			.analyze();
		expect(
			dueA11y.violations.filter((v) => v.impact === "critical" || v.impact === "serious"),
		).toEqual([]);
	}

	if (testInfo.project.name === "chromium") {
		await page.locator(".progressReviewQueue").screenshot({
			path: "test-results/evidence-issue-82-progress-review-queue.png",
		});
	}

	// 4. Open certification page in a second tab via Start review href so cross-tab sync is verified
	const startHref = await page.locator('a[data-review-start="ccdv-f"]').getAttribute("href");
	expect(startHref).toBeTruthy();
	const reviewTab = await context.newPage();
	await reviewTab.setViewportSize({ width: 1280, height: 900 });
	await reviewTab.goto(startHref as string);
	await expect(
		reviewTab.getByRole("heading", { level: 3, name: "Due review queue" }),
	).toBeVisible();
	await expect(reviewTab.locator("#review-queue")).toContainText("2 due now");
	await expect(reviewTab.getByRole("button", { name: "Start review" })).toBeEnabled();
	if (testInfo.project.name === "chromium") {
		await reviewTab.locator("#review-queue").screenshot({
			path: "test-results/evidence-issue-82-cert-review-queue.png",
		});
	}

	// 5. Start a spaced review session (confirming replacement of paused practice session)
	await reviewTab.getByRole("button", { name: "Start review" }).click();
	const confirmDialog = reviewTab.locator("#pl-confirm-dialog");
	if (await confirmDialog.isVisible()) {
		await confirmDialog.getByRole("button", { name: "Replace session" }).click();
	}
	await expect(reviewTab.locator(".qhead")).toContainText("REVIEW");

	// Evaluate first due question and finish the second
	await answerAndCheckCurrentQuestion(reviewTab);
	await reviewTab.getByRole("button", { name: "Next question →" }).click();
	await answerAndCheckCurrentQuestion(reviewTab);
	await reviewTab.getByRole("button", { name: "Finish session" }).click();
	await expect(
		reviewTab.getByRole("heading", { level: 1, name: /Spaced review results/i }),
	).toBeVisible();
	if (testInfo.project.name === "chromium") {
		await reviewTab.locator(".results .panel").first().screenshot({
			path: "test-results/evidence-issue-82-review-results.png",
		});
	}

	// 6. Verify atomic recording & schedule advancement (0 due now, no duplicate attempts)
	const afterReview = await readCertificationProgress(reviewTab, "ccdv-f");
	const reviewSessions = afterReview.sessions.filter((s) => s.mode === "review");
	expect(reviewSessions).toHaveLength(1);
	expect(reviewSessions[0].status).toBe("completed");
	const reviewAttempts = afterReview.attempts.filter((a) => a.sessionId === reviewSessions[0].id);
	expect(reviewAttempts).toHaveLength(2);

	// 7. Verify My Progress tab refreshes cross-tab to 0 due now and lists the Spaced review session
	await expect(page.locator("#review-queue")).toContainText(
		"No questions are due for review today.",
	);
	await expect(page.locator("#history-rows")).toContainText("Spaced review");

	// 8. Verify reset clears review schedules cleanly
	await reviewTab.getByRole("button", { name: "Back to dashboard" }).click();
	await reviewTab.getByRole("button", { name: "Reset progress" }).click();
	await reviewTab
		.locator("#pl-confirm-dialog")
		.getByRole("button", { name: "Reset history" })
		.click();
	await expect(reviewTab.locator("#review-queue")).toContainText(
		"No questions are due for review right now.",
	);
	await reviewTab.close();
});
