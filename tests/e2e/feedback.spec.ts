import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

const WCAG_TAGS = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"];

test.describe("community feedback flow", () => {
	test("opens from the footer with application context and passes WCAG A/AA", async ({ page }) => {
		await page.goto("/practice-lab/");
		await page.waitForLoadState("networkidle");

		await page.getByRole("button", { name: "Send feedback" }).click();
		const dialog = page.locator("#pl-feedback-dialog");
		await expect(dialog).toBeVisible();
		await expect(page.locator("#pl-feedback-context")).toHaveText("Practice Lab · Application");

		const a11y = await new AxeBuilder({ page }).withTags(WCAG_TAGS).analyze();
		expect(a11y.violations).toEqual([]);

		await page.keyboard.press("Escape");
		await expect(dialog).not.toBeVisible();
	});

	test("reports a practice question and explanation without losing active session progress", async ({
		page,
	}) => {
		await page.goto("/practice-lab/certifications/ccdv-f");
		await page.waitForLoadState("networkidle");
		await page.selectOption("#amount", "10");
		await page.click('[data-action="start-practice"]');
		await page.waitForSelector("button.option");

		const questionHeading = (await page.locator(".panel.question h2").textContent())?.trim();
		expect(questionHeading).toBeTruthy();

		// Open contextual report dialog from the question card
		await page.getByRole("button", { name: "Report an issue" }).click();
		const dialog = page.locator("#pl-feedback-dialog");
		await expect(dialog).toBeVisible();
		await expect(page.locator("#pl-feedback-context")).toContainText("Question · CCDV-F");

		// Validation error for too-short description
		await page.fill("#pl-feedback-description", "Short");
		await page.click('#pl-feedback-form button[type="submit"]');
		await expect(page.locator("#pl-feedback-error")).toBeVisible();

		// Prevent opening a real external tab during test; verify primary Tally handoff link
		await page.evaluate(() => {
			window.open = () => null;
		});
		await page.fill(
			"#pl-feedback-description",
			"The phrasing of this question could be clearer about batch latency trade-offs.",
		);
		await page.click('#pl-feedback-form button[type="submit"]');

		await expect(page.locator("#pl-feedback-handoff")).toBeVisible();
		const tallyHref = await page.locator("#pl-feedback-handoff-link").getAttribute("href");
		expect(tallyHref).toContain("https://tally.so/r/GeleeQ");
		expect(tallyHref).toContain("targetType=question");
		expect(tallyHref).toContain("certificationId=ccdv-f");

		// Go back to form and verify secondary GitHub Issue handoff also works
		await page.click("#pl-feedback-edit-again");
		await page.click('#pl-feedback-form button[data-feedback-channel="github-issue"]');
		await expect(page.locator("#pl-feedback-handoff")).toBeVisible();
		const githubHref = await page.locator("#pl-feedback-handoff-link").getAttribute("href");
		expect(githubHref).toContain("https://github.com/yacosta738/practice-lab/issues/new");
		expect(githubHref).toContain("community-feedback");

		// Return to practice and verify the exact same question is still active
		await page.click("#pl-feedback-done");
		await expect(dialog).not.toBeVisible();
		await expect(page.locator(".panel.question h2")).toHaveText(questionHeading ?? "");

		// Answer the question and verify the explanation trigger pre-selects incorrect-explanation
		const options = page.locator("button.option");
		const checkBtn = page.locator('[data-action="check"]');
		for (let i = 0; i < 3; i++) {
			if (await checkBtn.isEnabled()) break;
			await options.nth(i).click();
		}
		await checkBtn.click();
		await page.waitForSelector(".feedback");

		await page.getByRole("button", { name: "Question this explanation" }).click();
		await expect(dialog).toBeVisible();
		await expect(page.locator("#pl-feedback-category")).toHaveValue("incorrect-explanation");
	});

	test("opens from a study note with lesson context", async ({ page }) => {
		await page.goto("/practice-lab/study/ccdv-f/workflows-versus-agents/");
		await page.waitForLoadState("networkidle");

		await page.getByRole("button", { name: "Report an issue" }).click();
		const dialog = page.locator("#pl-feedback-dialog");
		await expect(dialog).toBeVisible();
		await expect(page.locator("#pl-feedback-context")).toContainText("Study note · CCDV-F");
		await expect(page.locator("#pl-feedback-context")).toContainText("workflows-versus-agents");
	});
});
