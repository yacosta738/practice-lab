import { expect, test } from "@playwright/test";

const BASE_PATH = "/practice-lab";
const CERTIFICATION = `${BASE_PATH}/certifications/ccdv-f/`;

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
