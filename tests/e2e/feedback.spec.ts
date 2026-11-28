import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

const WCAG_TAGS = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"];

test.describe("community feedback flow", () => {
	test.use({ serviceWorkers: "block" });

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

	test("keeps the form unavailable and allows closing when controller initialization fails", async ({
		page,
	}) => {
		await page.addInitScript(() => {
			const originalGetElementById = Document.prototype.getElementById;
			let failInitialization = true;
			Document.prototype.getElementById = function (id) {
				if (failInitialization && id === "pl-feedback-title") {
					failInitialization = false;
					throw new Error("Simulated feedback controller initialization failure");
				}
				return originalGetElementById.call(this, id);
			};
		});

		await page.goto("/practice-lab/");
		await page.waitForLoadState("networkidle");
		await page.getByRole("button", { name: "Send feedback" }).click();

		const dialog = page.locator("#pl-feedback-dialog");
		await expect(dialog).toBeVisible();
		await expect(page.locator("#pl-feedback-error")).toContainText(/Unable to load/i);
		await expect.soft(page.locator("#pl-feedback-form")).toBeHidden();
		await expect(dialog.locator(".pl-feedback-close")).toBeVisible();
		await dialog.locator(".pl-feedback-close").click();
		await expect(dialog).not.toBeVisible();
	});

	test("retries controller initialization and restores the form after success", async ({
		page,
	}) => {
		await page.addInitScript(() => {
			const originalGetElementById = Document.prototype.getElementById;
			let failInitialization = true;
			Document.prototype.getElementById = function (id) {
				if (failInitialization && id === "pl-feedback-title") {
					failInitialization = false;
					throw new Error("Simulated feedback controller initialization failure");
				}
				return originalGetElementById.call(this, id);
			};
		});

		await page.goto("/practice-lab/");
		await page.waitForLoadState("networkidle");
		await page.getByRole("button", { name: "Send feedback" }).click();

		const dialog = page.locator("#pl-feedback-dialog");
		await expect(dialog).toBeVisible();
		await expect(page.locator("#pl-feedback-error")).toContainText(/Unable to load/i);
		await page.getByRole("button", { name: /retry loading feedback form/i }).click();

		await expect(page.locator("#pl-feedback-form")).toBeVisible();
		await expect(page.locator("#pl-feedback-error")).toBeHidden();
	});

	test("closing the dialog cancels a pending controller retry", async ({ page }) => {
		let retryRequestStartedResolve = () => {};
		const retryRequestStarted = new Promise<void>((resolve) => {
			retryRequestStartedResolve = resolve;
		});
		let releaseRetryRequest = () => {};
		const retryRequestGate = new Promise<void>((resolve) => {
			releaseRetryRequest = resolve;
		});
		let controllerRequests = 0;

		await page.route("**/*.js", async (route) => {
			if (!route.request().url().includes("dialog-controller.")) {
				await route.continue();
				return;
			}
			controllerRequests += 1;
			if (controllerRequests === 1) {
				await route.abort();
				return;
			}
			if (controllerRequests === 2) {
				retryRequestStartedResolve();
				await retryRequestGate;
			}
			await route.continue();
		});
		await page.addInitScript(() => {
			const originalGetElementById = Document.prototype.getElementById;
			Document.prototype.getElementById = function (id) {
				if (id === "pl-feedback-description") {
					document.documentElement.dataset.feedbackControllerInitialized = "true";
				}
				return originalGetElementById.call(this, id);
			};
		});

		await page.goto("/practice-lab/");
		await page.waitForLoadState("networkidle");
		await page.getByRole("button", { name: "Send feedback" }).click();

		const dialog = page.locator("#pl-feedback-dialog");
		await expect(dialog).toBeVisible();
		await expect(page.locator("#pl-feedback-error")).toContainText(/Unable to load/i);
		await page.getByRole("button", { name: /retry loading feedback form/i }).click();
		await retryRequestStarted;
		await dialog.locator(".pl-feedback-close").click();
		releaseRetryRequest();

		await page.waitForFunction(
			() => document.documentElement.dataset.feedbackControllerInitialized === "true",
		);
		await expect(dialog).not.toBeVisible();
		await expect(page.locator("#pl-feedback-form")).toBeHidden();
	});

	test("keeps the dialog closed when the controller finishes before the close event", async ({
		page,
	}) => {
		await page.addInitScript(() => {
			const originalGetElementById = Document.prototype.getElementById;
			let initializationAttempts = 0;
			Document.prototype.getElementById = function (id) {
				if (id === "pl-feedback-title") {
					initializationAttempts += 1;
					if (initializationAttempts === 1) {
						throw new Error("Simulated feedback controller initialization failure");
					}
					if (initializationAttempts === 2) {
						const dialog = originalGetElementById.call(
							this,
							"pl-feedback-dialog",
						) as HTMLDialogElement;
						dialog.addEventListener(
							"close",
							() => {
								dialog.dataset.closeDispatched = "true";
							},
							{ once: true },
						);
						dialog.close();
					}
				}
				return originalGetElementById.call(this, id);
			};
		});

		await page.goto("/practice-lab/");
		await page.getByRole("button", { name: "Send feedback" }).click();
		await page.getByRole("button", { name: /retry loading feedback form/i }).click();

		const dialog = page.locator("#pl-feedback-dialog");
		await expect(dialog).toHaveAttribute("data-close-dispatched", "true");
		await expect(dialog).toBeHidden();
		await expect(page.locator("#pl-feedback-form")).toBeHidden();
	});

	test("associates validation errors with their fields and removes associations when corrected", async ({
		page,
	}) => {
		await page.goto("/practice-lab/");
		await page.waitForLoadState("networkidle");
		await page.getByRole("button", { name: "Send feedback" }).click();

		await expect(page.locator("#pl-feedback-form")).toBeVisible();
		const category = page.locator("#pl-feedback-category");
		const description = page.locator("#pl-feedback-description");
		const referenceUrl = page.locator("#pl-feedback-reference");
		const error = page.locator("#pl-feedback-error");
		const errorReference = "pl-feedback-error";

		await category.evaluate((element) => {
			const select = element as HTMLSelectElement;
			select.value = "";
			select.dispatchEvent(new Event("change", { bubbles: true }));
		});
		await page.locator('#pl-feedback-form button[type="submit"]').click();
		await expect(error).toBeVisible();
		await expect(category).toHaveAttribute("aria-invalid", "true");
		await expect(category).toHaveAttribute("aria-describedby", errorReference);
		await expect(category).toBeFocused();
		await category.selectOption({ index: 0 });
		await expect(category).not.toHaveAttribute("aria-invalid");
		await expect(category).not.toHaveAttribute("aria-describedby");

		await description.fill("Short");
		await page.locator('#pl-feedback-form button[type="submit"]').click();
		await expect(error).toBeVisible();
		await expect(description).toHaveAttribute("aria-invalid", "true");
		await expect(description).toHaveAttribute("aria-describedby", errorReference);
		await expect(description).toBeFocused();
		await description.fill("  Brief  ");
		await expect(description).toHaveAttribute("aria-invalid", "true");
		await expect(description).toHaveAttribute("aria-describedby", errorReference);
		await description.fill("The feedback description is long enough to submit.");
		await expect(description).not.toHaveAttribute("aria-invalid");
		await expect(description).not.toHaveAttribute("aria-describedby");

		await referenceUrl.fill("ftp://example.com");
		await page.locator('#pl-feedback-form button[type="submit"]').click();
		await expect(error).toBeVisible();
		await expect(referenceUrl).toHaveAttribute("aria-invalid", "true");
		await expect(referenceUrl).toHaveAttribute("aria-describedby", errorReference);
		await expect(referenceUrl).toBeFocused();
		await referenceUrl.fill("sftp://example.com");
		await expect(referenceUrl).toHaveAttribute("aria-invalid", "true");
		await expect(referenceUrl).toHaveAttribute("aria-describedby", errorReference);
		await referenceUrl.fill("https://example.com");
		await expect(referenceUrl).not.toHaveAttribute("aria-invalid");
		await expect(referenceUrl).not.toHaveAttribute("aria-describedby");
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
		await expect(page.locator("#pl-feedback-form")).toBeHidden();
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
