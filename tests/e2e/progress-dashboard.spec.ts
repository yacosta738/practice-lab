import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

const BASE_PATH = "/practice-lab";

test("does not load every session and attempt to refresh dashboard aggregates", async ({
	page,
}) => {
	await page.addInitScript(() => {
		const state = window as unknown as Window & { fullProgressReads: string[] };
		state.fullProgressReads = [];
		const getAll = IDBIndex.prototype.getAll;
		IDBIndex.prototype.getAll = function (...args) {
			const request = getAll.apply(this, args);
			if (this.name === "by-certification") {
				request.addEventListener("success", () => {
					const records = request.result as Record<string, unknown>[];
					if (records.some((record) => "mode" in record || "outcome" in record)) {
						state.fullProgressReads.push(this.name);
					}
				});
			}
			return request;
		};
	});

	await page.goto(`${BASE_PATH}/certifications/ccdv-f/`);
	await page.getByRole("button", { name: "Practice mode" }).click();
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
	await page.evaluate(() => {
		(window as unknown as Window & { fullProgressReads: string[] }).fullProgressReads.length = 0;
	});

	await page.goto(`${BASE_PATH}/progress/`);
	await page.selectOption("#filter-certification", "ccdv-f");
	await expect(page.getByText("Saved progress is up to date.")).toBeVisible();
	await expect
		.poll(() =>
			page.evaluate(
				() =>
					(
						window as unknown as Window & {
							fullProgressReads: string[];
						}
					).fullProgressReads,
			),
		)
		.toEqual([]);
});

test("links seeded domain accuracy to certification-specific study and practice routes", async ({
	page,
}) => {
	const seededDomains: Array<{ certificationId: string; subtitle: string; domainId: string }> = [];
	for (const certification of [
		{ certificationId: "ccdv-f", subtitle: "CCDV-F" },
		{ certificationId: "ccao-f", subtitle: "CCAO-F" },
	]) {
		await page.goto(`${BASE_PATH}/certifications/${certification.certificationId}/`);
		await page.getByRole("button", { name: "Practice mode" }).click();
		const domainLabel = await page.locator(".question .badge").textContent();
		const domainId = domainLabel?.split(" · ")[0];
		expect(domainId).toBeTruthy();
		const hint = await page.locator(".hint").first().textContent();
		const answerCount = Number(hint?.match(/Select exactly (\d+) answers/i)?.[1] ?? 1);
		for (let answer = 0; answer < answerCount; answer += 1) {
			await page.locator("button.option").nth(answer).click();
		}
		await page.getByRole("button", { name: "Check answer" }).click();
		await expect(page.locator(".feedback")).toBeVisible();
		seededDomains.push({ ...certification, domainId: domainId as string });
	}

	await page.goto(`${BASE_PATH}/progress/`);
	await expect(page.getByText("Saved progress is up to date.")).toBeVisible();
	for (const { certificationId, subtitle, domainId } of seededDomains) {
		const domain = page
			.locator("#domain-chart li")
			.filter({ hasText: `${subtitle} · ${domainId}` });
		await expect(domain).toHaveCount(1);
		const studyHref = `${BASE_PATH}/study/${certificationId}/#${domainId}`;
		await expect(
			domain.getByRole("link", { name: `Study section for ${subtitle} ${domainId}` }),
		).toHaveAttribute("href", studyHref);
		const studyTab = await page.context().newPage();
		await studyTab.goto(studyHref);
		await expect(studyTab.locator(`#${domainId}`)).toBeVisible();
		await studyTab.close();

		const practiceHref = `${BASE_PATH}/certifications/${certificationId}/?mode=practice&domain=${encodeURIComponent(domainId)}#session`;
		const practiceLink = domain.getByRole("link", {
			name: `Practice domain for ${subtitle} ${domainId}`,
		});
		await expect(practiceLink).toHaveAttribute("href", practiceHref);
		const practiceTab = await page.context().newPage();
		await practiceTab.goto(practiceHref);
		await expect(practiceTab.locator("#domain")).toHaveValue(domainId);
		await practiceTab.close();
	}
});

test("shows an accessible empty progress dashboard and responsive visual evidence", async ({
	page,
}, testInfo) => {
	await page.setViewportSize({ width: 1440, height: 1000 });
	await page.goto(`${BASE_PATH}/progress/`);
	await expect(page.getByRole("heading", { level: 1, name: "My Progress" })).toBeVisible();
	const metricCard = page.locator("#progress-metrics .progressMetric").first();
	await expect(metricCard).toBeVisible();
	await expect
		.poll(() => metricCard.evaluate((element) => getComputedStyle(element).minHeight))
		.toBe("116px");
	await expect(
		page.getByText("No saved sessions yet. Choose a certification and start a practice session."),
	).toBeVisible();
	await expect(page.getByText("How these metrics are calculated")).toBeVisible();
	await expect(page.getByRole("heading", { level: 2, name: "Mastery breakdown" })).toBeVisible();
	await expect(
		page.getByRole("heading", { level: 2, name: "Targeted review recommendations" }),
	).toBeVisible();
	await expect(page.locator("#mastery-breakdown")).toContainText("mastery-v1");
	await expect(page.locator("#mastery-breakdown")).toContainText("not an exam-pass prediction");
	await expect(page.locator("#review-recommendations li").first()).toContainText(
		"Unseen questions",
	);
	await expect(page.getByRole("link", { name: "My Progress" })).toHaveAttribute(
		"aria-current",
		"page",
	);

	const desktopA11y = await new AxeBuilder({ page })
		.withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
		.analyze();
	expect(desktopA11y.violations).toEqual([]);
	await testInfo.attach("my-progress-desktop.png", {
		body: await page.screenshot({ fullPage: true }),
		contentType: "image/png",
	});

	await page.setViewportSize({ width: 390, height: 844 });
	await expect(page.getByRole("heading", { level: 1, name: "My Progress" })).toBeVisible();
	await testInfo.attach("my-progress-mobile.png", {
		body: await page.screenshot({ fullPage: true }),
		contentType: "image/png",
	});
});

test("does not fabricate frozen history from an older submitted local session", async ({
	page,
}) => {
	await page.goto(`${BASE_PATH}/certifications/ccdv-f/`);
	const questionId = await page.locator("#quiz-bootstrap").evaluate((element) => {
		const data = JSON.parse((element as HTMLElement).dataset.bootstrap ?? "{}");
		return data.qs[0].id as string;
	});
	await page.evaluate((id) => {
		localStorage.setItem(
			"ccdv-f-practice-lab-v2",
			JSON.stringify({
				stats: { [id]: { attempts: 1, correct: 1, lastWrong: false } },
				session: {
					mode: "practice",
					ids: [id],
					currentIndex: 0,
					answers: { [id]: [] },
					checked: { [id]: true },
					flags: [],
					created: Date.now() - 60_000,
					deadline: null,
					submitted: true,
					timedOut: false,
					finished: Date.now(),
				},
			}),
		);
	}, questionId);
	await page.reload();
	const migrationPanel = page
		.getByRole("status")
		.filter({ hasText: "Legacy progress is ready to import" });
	await expect(migrationPanel).toBeVisible();
	const backupDownload = page.waitForEvent("download");
	await migrationPanel.getByRole("button", { name: "Download data backup" }).click();
	await backupDownload;
	await migrationPanel.getByRole("button", { name: "Import saved progress" }).click();
	await expect(migrationPanel).toHaveCount(0);
	await page.goto(`${BASE_PATH}/progress/`);
	await expect(page.locator("#history-rows .progressEmpty")).toContainText("No saved sessions yet");
	await expect(
		page.getByRole("status").filter({ hasText: /no dated session history/i }),
	).toBeVisible();
});

test("records practice history, filters it, and reviews frozen questions without exposing active exam answers", async ({
	page,
}) => {
	const dashboardTab = await page.context().newPage();
	await dashboardTab.goto(`${BASE_PATH}/progress/`);
	await expect(dashboardTab.getByRole("heading", { level: 1, name: "My Progress" })).toBeVisible();
	await page.goto(`${BASE_PATH}/certifications/ccdv-f/`);
	await page.selectOption("#amount", { label: "10" });
	await page.getByRole("button", { name: "Practice mode" }).click();
	await expect(page.locator("button.option").first()).toBeVisible();

	for (let index = 0; index < 10; index += 1) {
		const checkAnswer = page.getByRole("button", { name: "Check answer" });
		const optionCount = await page.locator("button.option").count();
		for (let answer = 0; answer < optionCount; answer += 1) {
			if (await checkAnswer.isEnabled()) break;
			await page.locator('button.option[aria-pressed="false"]').first().click();
		}
		await expect(checkAnswer).toBeEnabled();
		await checkAnswer.click();
		await expect(page.locator(".feedback")).toBeVisible();
		if (index === 0) {
			await expect(
				dashboardTab.locator("#progress-metrics .progressMetric:nth-child(2) p"),
			).toContainText("of 1 attempts");
		}
		if (index < 9) await page.getByRole("button", { name: "Next question →", exact: true }).click();
	}
	await page.getByRole("button", { name: "Finish session", exact: true }).click();
	await expect(page.locator(".results")).toBeVisible();
	await expect(
		dashboardTab.locator("#history-rows tr").filter({ hasText: "Completed" }),
	).toHaveCount(1);
	await dashboardTab.close();
	await page.goto(`${BASE_PATH}/progress/`);
	await expect(page.locator("#history-rows a[aria-label^='Review saved']")).toHaveCount(1);
	await expect(page.getByText(/10 of \d+ questions evaluated/)).toBeVisible();
	const historyTable = page.getByRole("table", {
		name: "Saved practice and mock-exam sessions",
	});
	await expect(historyTable).toBeVisible();
	await expect(
		historyTable.getByRole("link", { name: /Review saved practice session from/ }),
	).toBeVisible();
	await expect(page.locator("#filter-certification")).toBeVisible();
	await expect(page.locator("#filter-mode")).toBeVisible();
	await expect(page.locator("#filter-status")).toBeVisible();
	await expect(page.locator("#study-progress-status")).toContainText("up to date");

	await page.selectOption("#filter-certification", "ccdv-f");
	await page.selectOption("#filter-mode", "practice");
	await page.selectOption("#filter-status", "completed");
	await expect(page).toHaveURL(/certification=ccdv-f.*mode=practice.*status=completed/);
	await expect(page.locator("#history-rows a[aria-label^='Review saved']")).toHaveCount(1);
	await page.locator("#history-rows a[aria-label^='Review saved']").click();
	await expect(
		page.getByText("Saved review loaded. Its question snapshots are read-only."),
	).toBeVisible();
	await expect(page.locator(".frozenQuestion")).toHaveCount(10);
	await expect
		.poll(() =>
			page
				.locator(".reviewOption")
				.first()
				.evaluate((element) => getComputedStyle(element).display),
		)
		.toBe("grid");
	await expect(page.getByText("Correct answer").first()).toBeVisible();
	const firstQuestion = page.locator(".frozenQuestion").first();
	await expect(firstQuestion.getByRole("heading", { level: 2 })).toBeVisible();
	await expect(firstQuestion.getByRole("list")).toBeVisible();
	await expect(firstQuestion.getByRole("listitem").first()).toBeVisible();

	await page.goto(`${BASE_PATH}/certifications/ccdv-f/`);
	await expect(page.getByRole("button", { name: "Practice mode" })).toBeVisible();
	await page.goto(`${BASE_PATH}/certifications/ccdv-f/?mode=assess#session`);
	await page.getByRole("button", { name: "Start mock exam" }).click();
	await expect(page.locator("button.option").first()).toBeVisible();
	await page.goto(`${BASE_PATH}/progress/`);
	const activeRow = page.locator("#history-rows tr").filter({ hasText: "In progress" });
	await expect(activeRow).toHaveCount(1);
	await expect(activeRow.locator("a")).toHaveText("Resume");
	await expect(activeRow.locator("a")).toHaveAttribute("href", /mode=assess&resume=1/);
	await activeRow.locator("a").click();
	await expect(page.locator("button.option").first()).toBeVisible();
});
