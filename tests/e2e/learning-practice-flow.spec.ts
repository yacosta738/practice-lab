import { expect, test } from "@playwright/test";
import { readCertificationProgress } from "./progress-helpers";

const BASE_PATH = "/practice-lab";
const CERTIFICATION = `${BASE_PATH}/certifications/ccdv-f/`;

test("Practice and Assess use distinct shareable setup modes", async ({ page }) => {
	await page.goto(`${CERTIFICATION}?mode=practice#session`);
	await expect(page.getByRole("heading", { name: "Practice setup" })).toBeVisible();
	await expect(page.locator(".pl-topbar-crumb strong")).toHaveText("Practice · Questions");
	await expect(page.locator('.pl-sidebar [data-workspace-mode="practice"]')).toHaveAttribute(
		"aria-current",
		"page",
	);

	await page.goto(`${CERTIFICATION}?mode=assess#session`);
	await expect(page.getByRole("heading", { name: "Mock exam setup" })).toBeVisible();
	await expect(page.locator(".pl-topbar-crumb strong")).toHaveText("Assess · Mock exam");
	await expect(page.getByRole("button", { name: "Start mock exam" })).toBeVisible();
	await expect(page.locator('.pl-sidebar [data-workspace-mode="assess"]')).toHaveAttribute(
		"aria-current",
		"page",
	);
	await expect(page.locator('.pl-bottom-nav [data-workspace-mode="assess"]')).toHaveAttribute(
		"aria-current",
		"page",
	);
});

test("workspace navigation follows runtime mode changes", async ({ page }) => {
	await page.goto(`${CERTIFICATION}?mode=assess#session`);
	await page.evaluate(() => {
		const url = new URL(window.location.href);
		url.searchParams.set("mode", "practice");
		history.replaceState(null, "", url);
		window.dispatchEvent(new Event("practice-lab:workspace-mode-change"));
	});

	await expect(page.locator(".pl-topbar-crumb strong")).toHaveText("Practice · Questions");
	await expect(page.locator('.pl-sidebar [data-workspace-mode="practice"]')).toHaveAttribute(
		"aria-current",
		"page",
	);
	await expect(page.locator('.pl-sidebar [data-workspace-mode="assess"]')).not.toHaveAttribute(
		"aria-current",
		"page",
	);
});

test("practice setup label follows a runtime mode change", async ({ page }) => {
	await page.goto(`${CERTIFICATION}?mode=practice#session`);
	await page.getByRole("button", { name: "Practice mode" }).click();
	await page.getByRole("button", { name: "Pause & go home" }).click();

	await page.goto(`${CERTIFICATION}?mode=assess#session`);
	await expect(page.getByRole("heading", { name: "Mock exam setup" })).toBeVisible();
	await page.getByRole("button", { name: /Resume practice/ }).click();
	await expect(page).toHaveURL(/mode=practice.*resume=1/);
	await page.getByRole("button", { name: "Pause & go home" }).click();

	await expect(page).not.toHaveURL(/resume=1/);
	await expect(page.getByRole("heading", { name: "Practice setup" })).toBeVisible();
});

test("domain study notes preselect practice and invalid domains fall back safely", async ({
	page,
}) => {
	await page.goto(`${BASE_PATH}/study/ccdv-f/subagents-and-context-isolation/`);
	const practiceLink = page.getByRole("link", { name: "Practice D1" });
	await expect(practiceLink).toHaveAttribute("href", /mode=practice.*domain=D1/);
	await expect(practiceLink).toHaveCSS("color", "rgb(255, 255, 255)");
	await practiceLink.click();
	await expect(page).toHaveURL(/mode=practice.*domain=D1/);
	await expect(page.locator("#domain")).toHaveValue("D1");

	await page.goto(`${CERTIFICATION}?mode=practice&domain=invalid#session`);
	await expect(page.locator("#domain")).toHaveValue("all");
});

test("starting a different session requires confirmation and preserves canceled progress", async ({
	page,
}) => {
	await page.goto(`${CERTIFICATION}?mode=practice#session`);
	await page.selectOption("#amount", "10");
	await page.getByRole("button", { name: "Practice mode" }).click();
	await page.locator("button.option").first().click();

	const getProgress = () => readCertificationProgress(page, "ccdv-f");
	const practiceState = await getProgress();
	const originalSession = practiceState.sessions.find((item) => item.status === "in_progress");
	if (!originalSession) throw new Error("Expected the active practice session in IndexedDB.");
	await page.locator('.pl-sidebar [data-workspace-mode="assess"]').click();
	await page.getByRole("button", { name: "Start mock exam" }).click();

	const confirmation = page.getByRole("dialog", { name: "Replace active session?" });
	await expect(confirmation).toBeVisible();
	await confirmation.getByRole("button", { name: "Cancel" }).click();
	const afterCancel = await getProgress();
	const unchangedSession = afterCancel.sessions.find((item) => item.status === "in_progress");
	if (!unchangedSession)
		throw new Error("Expected the active session to remain after canceling replacement.");
	expect(unchangedSession).toMatchObject({
		id: originalSession.id,
		mode: originalSession.mode,
		checkpoint: originalSession.checkpoint,
	});
	expect(
		(unchangedSession.content as { questions: { questionId: string }[] }).questions.map(
			(question) => question.questionId,
		),
	).toEqual(
		(originalSession.content as { questions: { questionId: string }[] }).questions.map(
			(question) => question.questionId,
		),
	);
	expect(afterCancel.questionProgress).toEqual(practiceState.questionProgress);

	await page.getByRole("button", { name: "Start mock exam" }).click();
	await page
		.getByRole("dialog", { name: "Replace active session?" })
		.getByRole("button", { name: "Replace session" })
		.click();
	await expect(page.locator("button.option").first()).toBeVisible();
	const replaced = await getProgress();
	expect(replaced.sessions.find((item) => item.status === "in_progress")?.mode).toBe("exam");
	expect(replaced.sessions.find((item) => item.id === originalSession.id)?.status).toBe(
		"abandoned",
	);
});

test("homepage accurately describes local progress storage", async ({ page }) => {
	await page.goto(`${BASE_PATH}/`);
	await expect
		.soft(page)
		.toHaveTitle("Practice Lab | Certification Practice Quizzes & Study Notes");
	await expect
		.soft(page.locator('meta[property="og:site_name"]'))
		.toHaveAttribute("content", "Practice Lab");
	await expect
		.soft(page.locator('meta[property="og:image:width"]'))
		.toHaveAttribute("content", "1200");
	await expect
		.soft(page.locator('meta[property="og:image:height"]'))
		.toHaveAttribute("content", "630");

	const brand = page.locator(".pl-sidebar-brand");
	await expect(brand).toHaveText("PRACTICE LAB");
	await expect(brand.locator("img")).toHaveAttribute("src", /brand\/practice-lab-mark\.png$/);
	await expect(brand.locator("img")).toHaveJSProperty("naturalWidth", 32);
	await expect(page.getByText(/Progress stays in this browser\./)).toBeVisible();
	await expect(
		page.getByText(
			/Install Practice Lab to reopen cached pages offline; pages you haven't visited still need a connection\./,
		),
	).toBeVisible();
	await expect(page.getByText(/all offline in your browser/i)).toHaveCount(0);
	await expect(page.getByRole("link", { name: /Launch mock exam/ })).toHaveAttribute(
		"href",
		/mode=assess/,
	);
});
