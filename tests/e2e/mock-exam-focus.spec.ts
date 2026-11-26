import { mkdirSync } from "node:fs";
import { join } from "node:path";
import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import { readCertificationProgress } from "./progress-helpers";

const BASE_PATH = "/practice-lab";
const CERTIFICATION = `${BASE_PATH}/certifications/ccdv-f/`;
const EVIDENCE_DIRECTORY = join(process.cwd(), "tmp", "issue-62-visual-evidence");

test("active mock exams enter Focus Mode, retain the deadline, and keep the mobile navigator accessible", async ({
	page,
}) => {
	await page.setViewportSize({ width: 390, height: 844 });
	await page.goto(`${CERTIFICATION}?mode=assess#session`);
	await page.getByRole("button", { name: "Start mock exam" }).click();
	await expect(page.locator(".pl-shell")).toHaveAttribute("data-exam-focus", "true");
	await expect(page.locator(".pl-sidebar")).toBeHidden();
	await expect(page.locator(".pl-bottom-nav")).toBeHidden();
	await expect(page.locator(".pl-search-trigger")).toBeHidden();
	const mobileProgressLink = page.locator('.pl-bottom-nav a[href="/practice-lab/progress/"]');
	await expect(mobileProgressLink).toBeHidden();
	await page.setViewportSize({ width: 1280, height: 900 });
	const desktopProgressLink = page.locator('.pl-sidebar a[href="/practice-lab/progress/"]');
	await expect(desktopProgressLink).toBeHidden();
	await page.setViewportSize({ width: 390, height: 844 });

	const clock = page.locator("#clock");
	await expect(clock).toBeVisible();
	const initialClock = await clock.textContent();
	await expect.poll(() => clock.textContent()).not.toBe(initialClock);

	const initialProgress = await readCertificationProgress(page, "ccdv-f");
	const activeSession = initialProgress.sessions.find((item) => item.status === "in_progress");
	if (!activeSession) throw new Error("Expected the active mock exam in IndexedDB.");
	const deadline = (activeSession.checkpoint as { deadlineAt: number | null }).deadlineAt;
	expect(deadline).not.toBeNull();
	const navigator = page.locator("details.examNavigator");
	await expect(navigator.locator("summary")).toBeVisible();
	await expect(navigator).not.toHaveAttribute("open", "");
	await expect(page.locator("button.option").first()).toBeVisible();
	await navigator.locator("summary").click();
	await expect(navigator).toHaveAttribute("open", "");
	await expect(page.locator(".qchip").first()).toBeVisible();

	const shortcutPrevented = await page.evaluate(() => {
		const event = new KeyboardEvent("keydown", {
			key: "k",
			ctrlKey: true,
			bubbles: true,
			cancelable: true,
		});
		document.dispatchEvent(event);
		return event.defaultPrevented;
	});
	expect(shortcutPrevented).toBe(true);
	await expect(page.locator("#pl-search-dialog")).not.toHaveAttribute("open", "");
	const answerCount = Number(
		(await page.locator(".hint").textContent())?.match(/exactly (\d+) answers/)?.[1] ?? 1,
	);
	for (let index = 0; index < answerCount; index += 1) {
		await page.locator("button.option").nth(index).click();
	}
	await page.getByRole("button", { name: "Flag for review" }).click();
	await expect(page.getByRole("button", { name: "Flagged", exact: true })).toBeVisible();
	const beforeReload = await readCertificationProgress(page, "ccdv-f");
	const examBeforeReload = beforeReload.sessions.find((item) => item.status === "in_progress");
	if (!examBeforeReload) throw new Error("Expected the active exam before reload.");
	const questionId = (examBeforeReload.content as { questions: { questionId: string }[] })
		.questions[0].questionId;
	const checkpointBeforeReload = examBeforeReload.checkpoint as {
		deadlineAt: number | null;
		selectedOptionIdsByQuestion: Record<string, string[]>;
		flaggedQuestionIds: string[];
	};
	expect(checkpointBeforeReload.selectedOptionIdsByQuestion[questionId]).toHaveLength(answerCount);
	expect(checkpointBeforeReload.flaggedQuestionIds).toContain(questionId);
	await page.reload();
	await expect(page.locator("button.option").first()).toBeVisible();
	await expect(page.locator(".pl-shell")).toHaveAttribute("data-exam-focus", "true");
	const restoredProgress = await readCertificationProgress(page, "ccdv-f");
	const restoredSession = restoredProgress.sessions.find((item) => item.status === "in_progress");
	const restoredCheckpoint = restoredSession?.checkpoint as
		| {
				deadlineAt: number | null;
				selectedOptionIdsByQuestion: Record<string, string[]>;
				flaggedQuestionIds: string[];
		  }
		| undefined;
	expect(restoredCheckpoint?.deadlineAt).toBe(deadline);
	expect(restoredCheckpoint?.selectedOptionIdsByQuestion[questionId]).toEqual(
		checkpointBeforeReload.selectedOptionIdsByQuestion[questionId],
	);
	expect(restoredCheckpoint?.flaggedQuestionIds).toContain(questionId);
	await expect(page.locator("button.option.selected")).toHaveCount(answerCount);
	await expect(page.getByRole("button", { name: "Flagged", exact: true })).toBeVisible();

	await page.getByRole("button", { name: "Exit exam" }).click();
	const exitDialog = page.getByRole("dialog", { name: "Exit mock exam?" });
	await expect(exitDialog).toBeVisible();
	await exitDialog.getByRole("button", { name: "Cancel" }).click();
	await expect(page.locator(".pl-shell")).toHaveAttribute("data-exam-focus", "true");
	await page.getByRole("button", { name: "Exit exam" }).click();
	await page
		.getByRole("dialog", { name: "Exit mock exam?" })
		.getByRole("button", { name: "Exit exam" })
		.click();
	await expect(page.locator(".pl-shell")).toHaveAttribute("data-exam-focus", "false");
	await page.getByRole("button", { name: /Resume mock exam/ }).click();
	await expect(page.locator(".pl-shell")).toHaveAttribute("data-exam-focus", "true");
	const scoringProgress = await readCertificationProgress(page, "ccdv-f");
	const sessionToScore = scoringProgress.sessions.find((item) => item.status === "in_progress");
	if (!sessionToScore) throw new Error("Expected the active exam before scoring.");
	const scoringQuestions = (
		sessionToScore.content as {
			questions: { questionId: string; correctOptionIds: string[] }[];
		}
	).questions;
	const checkpoint = sessionToScore.checkpoint as {
		selectedOptionIdsByQuestion: Record<string, string[]>;
	};
	const expectedCorrect = scoringQuestions.filter(({ questionId, correctOptionIds }) => {
		const selectedOptionIds = checkpoint.selectedOptionIdsByQuestion[questionId] ?? [];
		return (
			selectedOptionIds.length === correctOptionIds.length &&
			selectedOptionIds.every((id) => correctOptionIds.includes(id))
		);
	}).length;
	await page.locator('.examBar [data-action="finish"]').click();
	const submitDialog = page.getByRole("dialog", { name: "Submit mock exam?" });
	await expect(submitDialog).toBeVisible();
	await submitDialog.getByRole("button", { name: "Submit and score" }).click();
	await expect(page.locator(".results")).toBeVisible();
	await expect(
		page.getByText(`${expectedCorrect} / ${scoringQuestions.length} correct`),
	).toBeVisible();
});

test("mobile question navigator exposes combined states and supports keyboard navigation", async ({
	page,
}, testInfo) => {
	await page.setViewportSize({ width: 390, height: 844 });
	mkdirSync(EVIDENCE_DIRECTORY, { recursive: true });
	await page.emulateMedia({ colorScheme: "light" });
	await page.goto(`${CERTIFICATION}?mode=assess#session`);
	await page.getByRole("button", { name: "Start mock exam" }).click();

	const navigator = page.locator("details.examNavigator");
	await navigator.locator("summary").click();
	const firstQuestion = page.locator('.qchip[data-value="0"]');
	await expect(firstQuestion).toHaveAttribute(
		"aria-label",
		"Question 1, unanswered, not flagged for review, current question",
	);
	await expect(firstQuestion.locator(".qchipMarks")).toHaveText("— ●");
	await expect(page.locator(".qchipLegend")).toContainText("Answered");

	const flagButton = page.getByRole("button", { name: "Flag for review" });
	await expect(flagButton).toHaveAttribute("aria-pressed", "false");
	await flagButton.click();
	await expect(page.getByRole("button", { name: "Flagged", exact: true })).toHaveAttribute(
		"aria-pressed",
		"true",
	);

	const answerCount = Number(
		(await page.locator(".hint").textContent())?.match(/exactly (\d+) answers/)?.[1] ?? 1,
	);
	for (let index = 0; index < answerCount; index++) {
		await page.locator("button.option").nth(index).click();
	}
	await expect(firstQuestion).toHaveAttribute(
		"aria-label",
		"Question 1, answered, flagged for review, current question",
	);
	await expect(firstQuestion.locator(".qchipMarks")).toHaveText("✓ ⚑ ●");

	const accessibility = await new AxeBuilder({ page })
		.withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
		.analyze();
	expect(accessibility.violations).toEqual([]);

	const targetSize = await firstQuestion.boundingBox();
	expect(targetSize?.width).toBeGreaterThanOrEqual(44);
	expect(targetSize?.height).toBeGreaterThanOrEqual(44);
	const lightCurrentRing = await firstQuestion.evaluate(
		(button) => getComputedStyle(button).boxShadow,
	);
	expect(lightCurrentRing).not.toBe("none");
	const lightFilename = "after-light-mobile-question-navigator-with-states.png";
	const lightPath = join(EVIDENCE_DIRECTORY, lightFilename);
	await page.screenshot({
		path: lightPath,
		fullPage: true,
	});
	await testInfo.attach(lightFilename, { path: lightPath, contentType: "image/png" });

	await page.emulateMedia({ colorScheme: "dark" });
	await page.waitForTimeout(200);
	const darkCurrentRing = await firstQuestion.evaluate(
		(button) => getComputedStyle(button).boxShadow,
	);
	expect(darkCurrentRing).not.toBe("none");
	const darkFilename = "after-dark-mobile-question-navigator-with-states.png";
	const darkPath = join(EVIDENCE_DIRECTORY, darkFilename);
	await page.screenshot({
		path: darkPath,
		fullPage: true,
	});
	await testInfo.attach(darkFilename, { path: darkPath, contentType: "image/png" });

	const questionGrid = navigator.locator(".qgrid");
	await navigator.locator("summary").focus();
	await page.keyboard.press("Tab");
	await expect(questionGrid).toBeFocused();
	await expect(questionGrid).toHaveAttribute("role", "region");
	await expect(questionGrid).toHaveAttribute("aria-label", "Question list");
	await expect(questionGrid).toHaveAttribute("tabindex", "0");
	expect(
		await questionGrid.evaluate(
			(grid) => grid.matches(":focus-visible") && getComputedStyle(grid).outlineStyle !== "none",
		),
	).toBe(true);
	await page.keyboard.press("Tab");
	await expect(firstQuestion).toBeFocused();
	expect(
		await firstQuestion.evaluate(
			(button) =>
				button.matches(":focus-visible") && getComputedStyle(button).outlineStyle !== "none",
		),
	).toBe(true);
	await page.keyboard.press("Tab");
	const secondQuestion = page.locator('.qchip[data-value="1"]');
	await expect(secondQuestion).toBeFocused();
	await page.keyboard.press("Enter");
	await expect(page.locator(".qhead")).toContainText("Question 2 of");
	await expect(firstQuestion).toHaveAttribute(
		"aria-label",
		"Question 1, answered, flagged for review",
	);
});

test("preserves keyboard focus through quiz updates and question transitions", async ({ page }) => {
	await page.setViewportSize({ width: 390, height: 844 });
	await page.goto(`${CERTIFICATION}?mode=assess#session`);
	await page.getByRole("button", { name: "Start mock exam" }).click();

	const questionHeading = page.locator(".question h2");
	await expect(questionHeading).toBeFocused();

	const flagButton = page.locator('[data-action="flag"]');
	await flagButton.focus();
	await page.keyboard.press("Enter");
	await expect(page.locator('[data-action="flag"]')).toBeFocused();
	await expect(page.locator('[data-action="flag"]')).toHaveAttribute("aria-pressed", "true");

	const answer = page.locator('.question [data-action="pick"]').first();
	await answer.focus();
	await page.keyboard.press("Space");
	await expect(page.locator('.question [data-action="pick"]').first()).toBeFocused();
	await expect(page.locator('.question [data-action="pick"]').first()).toHaveAttribute(
		"aria-pressed",
		"true",
	);

	const next = page.locator('[data-action="next"]');
	await next.focus();
	await page.keyboard.press("Enter");
	await expect(questionHeading).toBeFocused();
	await expect(page.locator(".qhead")).toContainText("Question 2 of");

	const previous = page.locator('[data-action="prev"]');
	await previous.focus();
	await page.keyboard.press("Enter");
	await expect(questionHeading).toBeFocused();
	await expect(page.locator(".qhead")).toContainText("Question 1 of");

	const navigator = page.locator("details.examNavigator");
	await navigator.locator("summary").click();
	const thirdQuestion = page.locator('.qchip[data-value="2"]');
	await thirdQuestion.focus();
	await page.keyboard.press("Enter");
	await expect(questionHeading).toBeFocused();
	await expect(page.locator(".qhead")).toContainText("Question 3 of");
});

test("distinguishes keyboard focus from flagged state in both themes", async ({ page }) => {
	await page.setViewportSize({ width: 390, height: 844 });
	await page.goto(`${CERTIFICATION}?mode=assess#session`);
	await page.getByRole("button", { name: "Start mock exam" }).click();

	const navigator = page.locator("details.examNavigator");
	const questionGrid = navigator.locator(".qgrid");
	await navigator.locator("summary").click();
	await page.locator('[data-action="flag"]').click();
	await page.locator('.qchip[data-value="1"]').click();
	const flaggedQuestion = page.locator('.qchip[data-value="0"]');
	await expect(flaggedQuestion).toHaveClass(/flagged/);
	await expect(flaggedQuestion).not.toHaveClass(/current/);

	for (const theme of ["light", "dark"] as const) {
		await page.emulateMedia({ colorScheme: theme });
		await page.locator("body").evaluate(() => {
			if (document.activeElement instanceof HTMLElement) document.activeElement.blur();
		});
		const unfocusedIndicator = await flaggedQuestion.evaluate((button) => {
			const style = getComputedStyle(button);
			return `${style.outlineWidth} ${style.outlineStyle} ${style.outlineColor} ${style.outlineOffset} ${style.boxShadow}`;
		});

		await navigator.locator("summary").focus();
		await page.keyboard.press("Tab");
		await expect(questionGrid).toBeFocused();
		await page.keyboard.press("Tab");
		await expect(flaggedQuestion).toBeFocused();
		const focusedIndicator = await flaggedQuestion.evaluate((button) => {
			const style = getComputedStyle(button);
			return {
				visible: button.matches(":focus-visible"),
				outline: `${style.outlineWidth} ${style.outlineStyle} ${style.outlineColor} ${style.outlineOffset} ${style.boxShadow}`,
			};
		});

		expect(focusedIndicator.visible).toBe(true);
		expect(focusedIndicator.outline).not.toBe(unfocusedIndicator);
	}
});
