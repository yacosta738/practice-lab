import { expect, test } from "@playwright/test";

const BASE_PATH = "/practice-lab";

test("imported multi-select questions render five options and honor selectCount", async ({
	page,
}) => {
	// Clear any persisted session so we start fresh
	await page.goto(`${BASE_PATH}/certifications/ccao-f/`);
	await page.waitForLoadState("networkidle");
	await page.evaluate(() => localStorage.clear());
	await page.reload();
	await page.waitForLoadState("networkidle");

	// Wait for the home page to render (the #amount select is only present there)
	await page.waitForSelector("#amount", { state: "visible", timeout: 10000 });

	// Select "All available" questions before starting practice mode
	await page.selectOption("#amount", { label: "All available" });

	// Start practice mode — this reads #amount and begins the session
	await page.getByRole("button", { name: "Practice mode" }).click();

	// Walk through questions with a bounded loop until we find one with 5 options
	const maxQuestions = 60;
	for (let i = 0; i < maxQuestions; i++) {
		await page.waitForLoadState("networkidle");

		// Option buttons use class "option" — count them
		const optionButtons = page.locator("button.option");
		const optionCount = await optionButtons.count();

		if (optionCount === 5) {
			// Found a five-option question — run assertions

			// Assert option letters are A, B, C, D, E
			const letterSpans = page.locator("button.option .letter");
			const letters = await letterSpans.allTextContents();
			expect(letters).toEqual(["A", "B", "C", "D", "E"]);

			// Read the hint for the select count
			const hintText = await page.locator(".hint").first().textContent();
			expect(hintText).toMatch(/Select exactly \d+ answers/i);
			const match = hintText?.match(/Select exactly (\d+) answers/i);
			const selectCount = match ? Number.parseInt(match[1], 10) : -1;
			expect(selectCount).toBeGreaterThan(0);

			// Select options up to selectCount
			for (let j = 0; j < selectCount; j++) {
				await optionButtons.nth(j).click();
			}

			// Assert "Check answer" is enabled once selectCount options are selected
			const checkBtn = page.getByRole("button", { name: "Check answer" });
			await expect(checkBtn).toBeEnabled();

			// Try to select one more option — it should not increase selected count
			const selectedBefore = page.locator("button.option.selected");
			const selectedCountBefore = await selectedBefore.count();
			await optionButtons.nth(selectCount).click();
			const selectedCountAfter = await page.locator("button.option.selected").count();
			expect(selectedCountAfter).toBe(selectedCountBefore);

			// Check the answer
			await checkBtn.click();
			await page.waitForLoadState("networkidle");

			// Assert feedback panel contains the explanation
			await expect(page.locator(".feedback")).toBeVisible();

			// Assert "Why not the others" block is present
			await expect(page.getByText(/Why not the others/i)).toBeVisible();

			// Test passed — exit the loop
			return;
		}

		// Not a 5-option question — answer it and move on
		const checkBtn = page.getByRole("button", { name: "Check answer" });

		// Read hint to know how many to select
		const hintText = await page.locator(".hint").first().textContent();
		const exactMatch = hintText?.match(/Select exactly (\d+) answers/i);
		const oneMatch = hintText?.match(/Select ONE answer/i);
		const needed = exactMatch ? Number.parseInt(exactMatch[1], 10) : oneMatch ? 1 : 1;

		// Select the required number of options
		for (let j = 0; j < needed; j++) {
			await optionButtons.nth(j).click();
		}

		// Check answer
		await checkBtn.click();

		// Move to next question
		const nextBtn = page.getByRole("button", { name: /Next|Finish/i });
		if (await nextBtn.isVisible().catch(() => false)) {
			await nextBtn.click();
		} else {
			// Session may have ended
			break;
		}
	}

	// If we reach here, no 5-option question was found
	throw new Error(
		`No question with 5 options found after walking through ${maxQuestions} questions in CCAO-F practice session`,
	);
});
