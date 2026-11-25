import { mkdirSync } from "node:fs";
import { join } from "node:path";
import { expect, test } from "@playwright/test";

const BASE_PATH = "/practice-lab";
const CERTIFICATION = `${BASE_PATH}/certifications/ccdv-f/`;
const VERCEL_BASE_URL = process.env.VERCEL_SMOKE_BASE_URL;
const EVIDENCE_DIRECTORY = join(process.cwd(), "tmp", "issue-62-visual-evidence");

test("captures representative screens in both themes at desktop, tablet, and mobile sizes", async ({
	page,
}, testInfo) => {
	test.setTimeout(180_000);
	const viewports = [
		{ name: "desktop", width: 1440, height: 900 },
		{ name: "tablet", width: 768, height: 1024 },
		{ name: "mobile", width: 390, height: 844 },
	] as const;
	const themes = ["light", "dark"] as const;
	mkdirSync(EVIDENCE_DIRECTORY, { recursive: true });
	await page.addInitScript(() => {
		localStorage.clear();
		Math.random = () => 0.42;
	});

	for (const viewport of viewports) {
		await page.setViewportSize({ width: viewport.width, height: viewport.height });
		for (const theme of themes) {
			await page.emulateMedia({ colorScheme: theme });
			const capture = async (screen: string) => {
				const filename = `after-${theme}-${viewport.name}-${screen}.png`;
				const path = join(EVIDENCE_DIRECTORY, filename);
				await page.screenshot({
					path,
					fullPage: true,
				});
				await testInfo.attach(filename, { path, contentType: "image/png" });
			};

			await page.goto(`${BASE_PATH}/`);
			await expect(page.getByRole("main")).toBeVisible();
			await capture("home");

			await page.goto(`${BASE_PATH}/study/ccdv-f/agent-architecture-design-workshop/`);
			await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
			await capture("study-note");

			await page.goto(CERTIFICATION);
			await expect(page.locator("#amount")).toBeVisible();
			await capture("practice-setup");

			await page.selectOption("#amount", { label: "10" });
			await page.getByRole("button", { name: "Practice mode" }).click();
			await expect(page.locator("button.option").first()).toBeVisible();
			await capture("practice-session");

			await page.goto(`${CERTIFICATION}?mode=assess#session`);
			await page.getByRole("button", { name: "Start mock exam" }).click();
			await expect(page.locator(".pl-shell")).toHaveAttribute("data-exam-focus", "true");
			await capture("mock-exam-focus");
			await page.locator("details.examNavigator summary").click();
			await capture("mock-exam-navigator");

			await page.goto(CERTIFICATION);
			await page.selectOption("#amount", { label: "10" });
			await page.getByRole("button", { name: "Practice mode" }).click();
			for (let questionIndex = 0; questionIndex < 10; questionIndex++) {
				const hint = await page.locator(".hint").first().textContent();
				const answerCount = Number(hint?.match(/Select exactly (\d+) answers/)?.[1] ?? 1);
				for (let answerIndex = 0; answerIndex < answerCount; answerIndex++) {
					await page.locator("button.option").nth(answerIndex).click();
				}
				await page.getByRole("button", { name: "Check answer" }).click();
				if (questionIndex < 9) {
					await page.getByRole("button", { name: "Next question →", exact: true }).click();
				}
			}
			await page
				.getByRole("button", { name: /Finish/i })
				.first()
				.click();
			await expect(page.locator(".results")).toBeVisible();
			await capture("results");

			await page.goto(`${BASE_PATH}/`);
			await page.getByRole("button", { name: /Search/ }).click();
			await expect(page.getByRole("dialog", { name: "Search Practice Lab" })).toBeVisible();
			await capture("search-dialog");
		}
	}
});

test("captures before screenshots of the deployed question navigator", async ({
	page,
}, testInfo) => {
	test.skip(!VERCEL_BASE_URL, "Set VERCEL_SMOKE_BASE_URL to capture the deployed baseline.");
	if (!VERCEL_BASE_URL) return;
	mkdirSync(EVIDENCE_DIRECTORY, { recursive: true });

	for (const theme of ["light", "dark"] as const) {
		await page.setViewportSize({ width: 390, height: 844 });
		await page.emulateMedia({ colorScheme: theme });
		const url = new URL("/certifications/ccdv-f/?mode=assess#session", VERCEL_BASE_URL);
		await page.goto(url.toString());
		await page.evaluate(() => localStorage.clear());
		await page.reload();
		await page.getByRole("button", { name: "Start mock exam" }).click();
		await page.locator("details.examNavigator summary").click();

		const firstQuestion = page.locator(".qchip").first();
		await expect(firstQuestion).not.toHaveAttribute("aria-label", /answered|flagged/i);
		const filename = `before-${theme}-mobile-question-navigator.png`;
		const path = join(EVIDENCE_DIRECTORY, filename);
		await page.screenshot({
			path,
			fullPage: true,
		});
		await testInfo.attach(filename, { path, contentType: "image/png" });
	}
});
