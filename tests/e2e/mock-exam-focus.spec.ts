import { mkdirSync } from "node:fs";
import { join } from "node:path";
import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

const BASE_PATH = "/practice-lab";
const CERTIFICATION = `${BASE_PATH}/certifications/ccdv-f/`;
const EVIDENCE_DIRECTORY = join(process.cwd(), "tmp", "issue-62-visual-evidence");

test("active mock exams enter Focus Mode, retain the deadline, and keep the mobile navigator accessible", async ({
	page,
}) => {
	await page.setViewportSize({ width: 390, height: 844 });
	await page.goto(`${CERTIFICATION}?mode=assess#session`);
	await page.evaluate(() => localStorage.clear());
	await page.reload();
	await page.getByRole("button", { name: "Start mock exam" }).click();
	await expect(page.locator(".pl-shell")).toHaveAttribute("data-exam-focus", "true");
	await expect(page.locator(".pl-sidebar")).toBeHidden();
	await expect(page.locator(".pl-bottom-nav")).toBeHidden();
	await expect(page.locator(".pl-search-trigger")).toBeHidden();

	const deadline = await page.evaluate(() => {
		const saved = JSON.parse(localStorage.getItem("ccdv-f-practice-lab-v2") || "{}");
		return saved.session.deadline;
	});
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
	await page.reload();
	await expect(page.locator("button.option").first()).toBeVisible();
	await expect(page.locator(".pl-shell")).toHaveAttribute("data-exam-focus", "true");
	expect(
		await page.evaluate(() => {
			const saved = JSON.parse(localStorage.getItem("ccdv-f-practice-lab-v2") || "{}");
			return saved.session.deadline;
		}),
	).toBe(deadline);

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
});

test("mobile question navigator exposes combined states and supports keyboard navigation", async ({
	page,
}, testInfo) => {
	await page.setViewportSize({ width: 390, height: 844 });
	mkdirSync(EVIDENCE_DIRECTORY, { recursive: true });
	await page.emulateMedia({ colorScheme: "light" });
	await page.goto(`${CERTIFICATION}?mode=assess#session`);
	await page.evaluate(() => localStorage.clear());
	await page.reload();
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

	await navigator.locator("summary").focus();
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
