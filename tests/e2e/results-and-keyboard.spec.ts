import { expect, test } from "@playwright/test";

const BASE_PATH = "/practice-lab";

test("CCDV-F practice mode shows results page after finishing questions", async ({ page }) => {
	test.setTimeout(180_000);

	// Use 10 questions (smallest option available)
	await page.goto(`${BASE_PATH}/certifications/ccdv-f/`);
	await page.waitForLoadState("domcontentloaded");
	await page.evaluate(() => localStorage.clear());
	await page.reload();
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
		// Read the hint to know how many answers to select
		const hintText = await page.locator(".hint").first().textContent();
		const exactMatch = hintText?.match(/Select exactly (\d+) answers/i);
		const needed = exactMatch ? Number.parseInt(exactMatch[1], 10) : 1;

		// Select the required number of options
		const optionButtons = page.locator("button.option");
		for (let j = 0; j < needed; j++) {
			await optionButtons.nth(j).click();
		}

		// Check answer
		await page.getByRole("button", { name: "Check answer" }).click();
		await page.waitForTimeout(500);

		// Verify feedback appears
		await expect(page.locator(".feedback")).toBeVisible({ timeout: 5000 });

		// Move to next question (unless this is the last one)
		if (i < 9) {
			const nextBtn = page.getByRole("button", { name: /Next/i }).first();
			await nextBtn.waitFor({ state: "visible", timeout: 5000 });
			await nextBtn.click();
			await page.waitForSelector("button.option", { state: "visible", timeout: 10000 });
		}
	}

	// After the last question, the Finish button should appear
	const finishBtn = page.getByRole("button", { name: /Finish/i }).first();
	await finishBtn.waitFor({ state: "visible", timeout: 10000 });
	await finishBtn.click();
	await page.waitForTimeout(500);

	// Verify the results page is visible
	await expect(page.locator(".results")).toBeVisible({ timeout: 10000 });

	// Verify "Practice session results" heading is displayed
	await expect(page.getByText(/Practice session results/i)).toBeVisible({ timeout: 10000 });

	// Verify score is displayed (e.g., "3 / 10 correct")
	await expect(page.getByText(/\d+ \/ \d+ correct/)).toBeVisible({ timeout: 10000 });
});

test("CCDV-F keyboard shortcuts select options", async ({ page }) => {
	await page.goto(`${BASE_PATH}/certifications/ccdv-f/`);
	await page.waitForLoadState("networkidle");
	await page.evaluate(() => localStorage.clear());
	await page.reload();
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
	const hintText = await page.locator(".hint").first().textContent();
	const isSingleSelect = hintText?.includes("Select ONE");

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
		await page.keyboard.press("2");
		const selectedOptions = page.locator("button.option.selected");
		await expect(selectedOptions).toHaveCount(2);
	}
});

test("CCDV-F keyboard shortcut Enter checks answer", async ({ page }) => {
	await page.goto(`${BASE_PATH}/certifications/ccdv-f/`);
	await page.waitForLoadState("networkidle");
	await page.evaluate(() => localStorage.clear());
	await page.reload();
	await page.waitForLoadState("networkidle");

	// Wait for the home page to render
	await page.waitForSelector("#amount", { state: "visible", timeout: 10000 });

	// Select 10 questions
	await page.selectOption("#amount", { label: "10" });

	// Start practice mode
	await page.getByRole("button", { name: "Practice mode" }).click();

	// Wait for the first question to render
	await page.waitForSelector("button.option", { state: "visible", timeout: 10000 });

	// Focus on body so Enter shortcut works (the handler requires activeElement === body)
	await page.evaluate(() => document.body.focus());

	// Select an option using keyboard
	await page.keyboard.press("1");

	// Re-focus body after selecting option
	await page.evaluate(() => document.body.focus());

	// Press Enter to check answer
	await page.keyboard.press("Enter");

	// Verify feedback appears
	await expect(page.locator(".feedback")).toBeVisible({ timeout: 10000 });
});

test("CCDV-F Next button moves to next question", async ({ page }) => {
	await page.goto(`${BASE_PATH}/certifications/ccdv-f/`);
	await page.waitForLoadState("networkidle");
	await page.evaluate(() => localStorage.clear());
	await page.reload();
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

	// Select an option and check
	await page.keyboard.press("1");
	await page.keyboard.press("Enter");
	await page.waitForLoadState("networkidle");

	// Click Next button to move to next question
	const nextBtn = page.getByRole("button", { name: /Next/i }).first();
	await nextBtn.waitFor({ state: "visible", timeout: 5000 });
	await nextBtn.click();
	await page.waitForLoadState("networkidle");

	// Verify the question changed
	const secondQuestion = await page.locator("h2").first().textContent();
	expect(secondQuestion).not.toBe(firstQuestion);
});
