import { expect, test } from "@playwright/test";

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
	await page.evaluate(() => localStorage.clear());
	await page.reload();
	await page.selectOption("#amount", "10");
	await page.getByRole("button", { name: "Practice mode" }).click();
	await page.locator("button.option").first().click();

	const getSession = () =>
		page.evaluate(() => JSON.parse(localStorage.getItem("ccdv-f-practice-lab-v2") || "{}"));
	const practiceState = await getSession();
	const originalSession = practiceState.session;
	await page.locator('.pl-sidebar [data-workspace-mode="assess"]').click();
	await page.getByRole("button", { name: "Start mock exam" }).click();

	const confirmation = page.getByRole("dialog", { name: "Replace active session?" });
	await expect(confirmation).toBeVisible();
	await confirmation.getByRole("button", { name: "Cancel" }).click();
	const afterCancel = await getSession();
	expect(afterCancel.session).toMatchObject({
		mode: originalSession.mode,
		ids: originalSession.ids,
		currentIndex: originalSession.currentIndex,
		answers: originalSession.answers,
		checked: originalSession.checked,
		flags: originalSession.flags,
		created: originalSession.created,
		deadline: originalSession.deadline,
	});
	expect(afterCancel.stats).toEqual(practiceState.stats);

	await page.getByRole("button", { name: "Start mock exam" }).click();
	await page
		.getByRole("dialog", { name: "Replace active session?" })
		.getByRole("button", { name: "Replace session" })
		.click();
	await expect(page.locator("button.option").first()).toBeVisible();
	expect((await getSession()).session.mode).toBe("exam");
});

test("homepage accurately describes local progress storage", async ({ page }) => {
	await page.goto(`${BASE_PATH}/`);
	const brand = page.locator(".pl-sidebar-brand");
	await expect(brand).toHaveText("PRACTICE LAB");
	await expect(brand.locator("img")).toHaveAttribute("src", /brand\/practice-lab-mark\.png$/);
	await expect(brand.locator("img")).toHaveJSProperty("naturalWidth", 32);
	await expect(page.getByText("Practice progress is saved locally in your browser.")).toBeVisible();
	await expect(
		page.getByText("The site itself needs an internet connection to load."),
	).toBeVisible();
	await expect(page.getByText(/all offline in your browser/i)).toHaveCount(0);
	await expect(page.getByRole("link", { name: /Launch mock exam/ })).toHaveAttribute(
		"href",
		/mode=assess/,
	);
});
