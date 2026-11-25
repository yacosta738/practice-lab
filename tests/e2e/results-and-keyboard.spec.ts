import { expect, test } from "@playwright/test";
import { readCertificationProgress } from "./progress-helpers";

const BASE_PATH = "/practice-lab";

test("quiz shortcuts pause while the submit dialog is open", async ({ page }) => {
	await page.goto(`${BASE_PATH}/certifications/ccdv-f/?mode=assess#session`);
	await page.getByRole("button", { name: "Start mock exam" }).click();
	const submit = page.getByRole("button", { name: "Submit exam", exact: true });
	await submit.click();

	const dialog = page.getByRole("dialog", { name: "Submit mock exam?" });
	const cancel = dialog.getByRole("button", { name: "Cancel" });
	await expect(cancel).toBeFocused();
	const getActiveSession = async () => {
		const state = await readCertificationProgress(page, "ccdv-f");
		return state.sessions.find((item) => item.status === "in_progress");
	};
	const before = await getActiveSession();
	await page.keyboard.press("1");
	expect(await getActiveSession()).toEqual(before);

	await cancel.press("Enter");
	await expect(dialog).toBeHidden();
	await expect(page.locator("button.option.selected")).toHaveCount(0);
	await page.keyboard.press("1");
	await expect(page.locator("button.option.selected .letter")).toHaveText("A");
	expect((await getActiveSession())?.revision).toBe((before?.revision as number) + 1);
});

test("CCDV-F practice mode shows results page after finishing questions", async ({ page }) => {
	test.setTimeout(180_000);

	// Use 10 questions (smallest option available)
	await page.goto(`${BASE_PATH}/certifications/ccdv-f/`);
	await page.waitForLoadState("domcontentloaded");

	// Wait for the home page to render
	await page.waitForSelector("#amount", { state: "visible", timeout: 10000 });

	// Select 10 questions (smallest available option)
	await page.selectOption("#amount", { label: "10" });

	// Start practice mode
	await page.getByRole("button", { name: "Practice mode" }).click();

	// Wait for the first question to render
	await page.waitForSelector("button.option", { state: "visible", timeout: 10000 });

	// Answer all 10 questions
	for (let i = 0; i < 10; i++) {
		await expect(page.locator(".qhead")).toContainText(`Question ${i + 1} of 10`);
		const questionProgress = await page.locator(".qhead").textContent();
		const needed = Number(await page.locator(".hint").getAttribute("data-select-count"));
		expect(Number.isSafeInteger(needed) && needed > 0).toBe(true);

		// Select the required number of options
		const optionButtons = page.locator("button.option");
		for (let j = 0; j < needed; j++) {
			await optionButtons.nth(j).click({ timeout: 5_000 });
			await expect(page.locator("button.option.selected")).toHaveCount(j + 1);
		}

		// Check answer
		const checkButton = page.getByRole("button", { name: "Check answer" });
		await expect(checkButton).toBeEnabled();
		const progress = await readCertificationProgress(page, "ccdv-f");
		const active = progress.sessions.find((item) => item.status === "in_progress");
		if (!active) throw new Error("Expected the active practice session in IndexedDB.");
		const checkpoint = active.checkpoint as {
			currentQuestionId: string | null;
			selectedOptionIdsByQuestion: Record<string, string[]>;
		};
		if (checkpoint.currentQuestionId) {
			expect(checkpoint.selectedOptionIdsByQuestion[checkpoint.currentQuestionId]).toHaveLength(
				needed,
			);
		}
		await checkButton.click();

		// Verify feedback appears
		await expect(page.locator(".feedback")).toBeVisible({ timeout: 5000 });
		await expect(page.locator(".feedback")).toBeFocused();

		// Move to next question (unless this is the last one)
		if (i < 9) {
			const nextBtn = page.getByRole("button", { name: "Next question →", exact: true });
			await expect(nextBtn).toBeVisible();
			await expect(nextBtn).toBeEnabled();
			await nextBtn.click({ timeout: 5000 });
			await expect(page.locator(".qhead")).not.toHaveText(questionProgress ?? "", {
				timeout: 5000,
			});
			await page.waitForSelector("button.option", { state: "visible", timeout: 10000 });
		}
	}

	// After the last question, the Finish button should appear
	const finishBtn = page.getByRole("button", { name: /Finish/i }).first();
	await finishBtn.waitFor({ state: "visible", timeout: 10000 });
	await finishBtn.click();

	// Verify the results page is visible
	await expect(page.locator(".results")).toBeVisible({ timeout: 10000 });

	// Verify "Practice session results" heading is displayed
	await expect(page.getByText(/Practice session results/i)).toBeVisible({ timeout: 10000 });

	// Verify score is displayed (e.g., "3 / 10 correct")
	await expect(page.getByText(/\d+ \/ \d+ correct/)).toBeVisible({ timeout: 10000 });

	const missed = page.getByRole("button", { name: /^Missed \(/ });
	await missed.press("Enter");
	await expect(missed).toBeFocused();
	await expect(missed).toHaveAttribute("aria-pressed", "true");

	await page.keyboard.press("Tab");
	const flagged = page.getByRole("button", { name: "Flagged (0)" });
	await expect(flagged).toBeFocused();
	await page.keyboard.press("Space");
	await expect(flagged).toBeFocused();
	await expect(flagged).toHaveAttribute("aria-pressed", "true");
	await expect(page.getByText("No questions match this filter.")).toBeVisible();
});

test("CCDV-F keyboard shortcuts select options", async ({ page }) => {
	await page.goto(`${BASE_PATH}/certifications/ccdv-f/`);
	await page.waitForLoadState("networkidle");
	await page.waitForLoadState("networkidle");

	// Wait for the home page to render
	await page.waitForSelector("#amount", { state: "visible", timeout: 10000 });

	// Select 10 questions
	await page.selectOption("#amount", { label: "10" });

	// Start practice mode
	await page.getByRole("button", { name: "Practice mode" }).click();

	// Wait for the first question to render
	await page.waitForSelector("button.option", { state: "visible", timeout: 10000 });

	// Check if this is a single-select question (most common)
	const selectCount = Number(await page.locator(".hint").getAttribute("data-select-count"));
	const isSingleSelect = selectCount === 1;

	// For single-select questions, keyboard toggles between options
	if (isSingleSelect) {
		// Press "2" to select the second option
		await page.keyboard.press("2");

		// Verify the second option is selected
		const selectedOption = page.locator("button.option.selected");
		await expect(selectedOption).toHaveCount(1);
		const letter = selectedOption.locator(".letter").first();
		await expect(letter).toHaveText("B");

		// Press "1" to switch to the first option
		await page.keyboard.press("1");
		await expect(selectedOption).toHaveCount(1);
		await expect(selectedOption.locator(".letter").first()).toHaveText("A");
	} else {
		// For multi-select, keyboard adds/removes options
		await page.keyboard.press("1");
		await expect(page.locator("button.option.selected")).toHaveCount(1);
		await page.keyboard.press("2");
		const selectedOptions = page.locator("button.option.selected");
		await expect(selectedOptions).toHaveCount(2);
	}
});

test("CCDV-F keyboard shortcut Enter checks answer", async ({ page }) => {
	await page.goto(`${BASE_PATH}/certifications/ccdv-f/`);
	await page.waitForLoadState("networkidle");
	await page.waitForLoadState("networkidle");

	// Wait for the home page to render
	await page.waitForSelector("#amount", { state: "visible", timeout: 10000 });

	// Select 10 questions
	await page.selectOption("#amount", { label: "10" });

	// Start practice mode
	await page.getByRole("button", { name: "Practice mode" }).click();

	// Wait for the first question to render
	await page.waitForSelector("button.option", { state: "visible", timeout: 10000 });

	// Read the hint to know how many answers to select
	const needed = Number(await page.locator(".hint").getAttribute("data-select-count"));

	// Select the required number of options using keyboard shortcuts
	for (let i = 0; i < needed; i++) {
		await page.keyboard.press(String(i + 1));
		await expect(page.locator("button.option.selected")).toHaveCount(i + 1);
	}

	// Focus on body so Enter shortcut works (the handler requires activeElement === body)
	await page.evaluate(() => document.body.focus());

	// Press Enter to check answer
	await page.keyboard.press("Enter");

	// Verify feedback appears
	await expect(page.locator(".feedback")).toBeVisible({ timeout: 10000 });
});

test("CCDV-F Next button moves to next question", async ({ page }) => {
	await page.goto(`${BASE_PATH}/certifications/ccdv-f/`);
	await page.waitForLoadState("networkidle");
	await page.waitForLoadState("networkidle");

	// Wait for the home page to render
	await page.waitForSelector("#amount", { state: "visible", timeout: 10000 });

	// Select 10 questions
	await page.selectOption("#amount", { label: "10" });

	// Start practice mode
	await page.getByRole("button", { name: "Practice mode" }).click();

	// Wait for the first question to render
	await page.waitForSelector("button.option", { state: "visible", timeout: 10000 });

	// Get the first question text
	const firstQuestion = await page.locator("h2").first().textContent();

	// Read the hint to know how many answers to select
	const needed = Number(await page.locator(".hint").getAttribute("data-select-count"));

	// Select the required number of options using keyboard shortcuts
	for (let i = 0; i < needed; i++) {
		await page.keyboard.press(String(i + 1));
		await expect(page.locator("button.option.selected")).toHaveCount(i + 1);
	}

	// Focus on body and press Enter to check answer
	await page.evaluate(() => document.body.focus());
	await page.keyboard.press("Enter");

	// Click Next button to move to next question
	const nextBtn = page.getByRole("button", { name: "Next question →", exact: true });
	await expect(nextBtn).toBeVisible();
	await expect(nextBtn).toBeEnabled();
	await nextBtn.click({ timeout: 5000 });
	await page.waitForSelector("button.option", { state: "visible", timeout: 10000 });

	// Verify the question changed
	await expect(page.locator("h2").first()).not.toHaveText(firstQuestion ?? "", { timeout: 5000 });
});
