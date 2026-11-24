import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

const BASE_PATH = "/practice-lab";
const ROUTE = `${BASE_PATH}/demo-tooltip`;

const WCAG_TAGS = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"];

// ---------------------------------------------------------------------------
// Page structure
// ---------------------------------------------------------------------------

test("demo page loads without errors", async ({ page }) => {
	const consoleErrors: string[] = [];
	page.on("console", (msg) => {
		if (msg.type() === "error") consoleErrors.push(msg.text());
	});

	await page.goto(ROUTE);
	await page.waitForLoadState("networkidle");

	expect(consoleErrors).toEqual([]);
});

test("page has the expected title and heading", async ({ page }) => {
	await page.goto(ROUTE);
	await page.waitForLoadState("networkidle");

	expect(await page.title()).toContain("Popover Tooltip Demo");
	await expect(page.locator("h1")).toContainText("Popover Tooltip Demo");
});

// ---------------------------------------------------------------------------
// PopoverTooltip component structure
// ---------------------------------------------------------------------------

test("renders trigger buttons with correct attributes", async ({ page }) => {
	await page.goto(ROUTE);
	await page.waitForLoadState("networkidle");

	// Find all PopoverTooltip trigger buttons (class "tooltip-trigger")
	// We expect at least 4: tooltip-shipping, tooltip-above, tooltip-below, tooltip-right
	const triggers = page.locator("button.tooltip-trigger");
	await expect(triggers).toHaveCount(4);

	const triggerIds = ["tooltip-shipping", "tooltip-above", "tooltip-below", "tooltip-right"];

	for (const id of triggerIds) {
		const trigger = page.locator(`button[interestfor="${id}"]`);
		await expect(trigger).toBeVisible();
		await expect(trigger).toHaveAttribute("popovertarget", id);
		await expect(trigger).toHaveAttribute("popovertargetaction", "show");
		await expect(trigger).toHaveAttribute("aria-describedby", id);
	}
});

test("renders popover elements with correct attributes", async ({ page }) => {
	await page.goto(ROUTE);
	await page.waitForLoadState("networkidle");

	const tooltipIds = ["tooltip-shipping", "tooltip-above", "tooltip-below", "tooltip-right"];

	for (const id of tooltipIds) {
		const popover = page.locator(`[id="${id}"]`);
		await expect(popover).toHaveAttribute("popover", "hint");
		await expect(popover).toHaveAttribute("role", "tooltip");
		await expect(popover).toHaveClass(/popover-tooltip/);
	}
});

test("trigger buttons have accessible labels", async ({ page }) => {
	await page.goto(ROUTE);
	await page.waitForLoadState("networkidle");

	// Each PopoverTooltip trigger should have an aria-label
	const triggers = page.locator("button.tooltip-trigger");
	const count = await triggers.count();

	for (let i = 0; i < count; i++) {
		const trigger = triggers.nth(i);
		const ariaLabel = await trigger.getAttribute("aria-label");
		expect(ariaLabel).not.toBeNull();
		expect(ariaLabel?.length).toBeGreaterThan(0);
	}
});

// ---------------------------------------------------------------------------
// Position variants
// ---------------------------------------------------------------------------

test("position variants render with correct data-position", async ({ page }) => {
	await page.goto(ROUTE);
	await page.waitForLoadState("networkidle");

	await expect(page.locator('[id="tooltip-above"]')).toHaveAttribute(
		"data-position",
		"block-start",
	);
	await expect(page.locator('[id="tooltip-below"]')).toHaveAttribute("data-position", "block-end");
	await expect(page.locator('[id="tooltip-right"]')).toHaveAttribute("data-position", "inline-end");
});

// ---------------------------------------------------------------------------
// Content rendering
// ---------------------------------------------------------------------------

test("tooltip content is rendered inside the popover", async ({ page }) => {
	await page.goto(ROUTE);
	await page.waitForLoadState("networkidle");

	// Check that content is present in the popover (even though hidden until opened)
	const shippingPopover = page.locator('[id="tooltip-shipping"]');
	await expect(shippingPopover.locator(".popover-tooltip__content")).toContainText("Free shipping");

	const abovePopover = page.locator('[id="tooltip-above"]');
	await expect(abovePopover.locator(".popover-tooltip__content")).toContainText(
		"above the trigger",
	);
});

// ---------------------------------------------------------------------------
// Toggletip behavior
// ---------------------------------------------------------------------------

test("toggletip opens on click", async ({ page }) => {
	await page.goto(ROUTE);
	await page.waitForLoadState("networkidle");

	// Click the shipping toggletip trigger
	const trigger = page.locator('button[interestfor="tooltip-shipping"]');
	await trigger.click();

	// Wait for the popover to open
	const popover = page.locator('[id="tooltip-shipping"]');
	await expect(popover).toBeVisible();
});

test("popover closes on Escape key", async ({ page }) => {
	await page.goto(ROUTE);
	await page.waitForLoadState("networkidle");

	// Open the popover
	const trigger = page.locator('button[interestfor="tooltip-shipping"]');
	await trigger.click();

	const popover = page.locator('[id="tooltip-shipping"]');
	await expect(popover).toBeVisible();

	// Press Escape to dismiss
	await page.keyboard.press("Escape");

	// Give the browser a moment to close the popover
	await page.waitForTimeout(100);
	await expect(popover).not.toBeVisible();
});

test("popover closes on light dismiss (click outside)", async ({ page }) => {
	await page.goto(ROUTE);
	await page.waitForLoadState("networkidle");

	// Open the popover
	const trigger = page.locator('button[interestfor="tooltip-above"]');
	await trigger.click();

	const popover = page.locator('[id="tooltip-above"]');
	await expect(popover).toBeVisible();

	// Click outside the popover (on the page background)
	await page.click("main >> text=Popover Tooltip Demo");
	await page.waitForTimeout(100);

	await expect(popover).not.toBeVisible();
});

// ---------------------------------------------------------------------------
// Inline tooltip (manual markup)
// ---------------------------------------------------------------------------

test("inline tooltip has correct structure", async ({ page }) => {
	await page.goto(ROUTE);
	await page.waitForLoadState("networkidle");

	const inlinePopover = page.locator('[id="tooltip-term"]');
	await expect(inlinePopover).toHaveAttribute("popover", "hint");
	await expect(inlinePopover).toHaveAttribute("role", "tooltip");
	await expect(inlinePopover).toHaveAttribute("data-position", "block-start");
	await expect(inlinePopover.locator(".popover-tooltip__content")).toContainText(
		"critical for understanding",
	);
});

test("inline trigger has correct attributes", async ({ page }) => {
	await page.goto(ROUTE);
	await page.waitForLoadState("networkidle");

	const inlineTrigger = page.locator('[interestfor="tooltip-term"]');
	await expect(inlineTrigger).toHaveAttribute("aria-label", "Definition of important term");
	await expect(inlineTrigger).toHaveAttribute("aria-describedby", "tooltip-term");
});

// ---------------------------------------------------------------------------
// Icon button tooltip
// ---------------------------------------------------------------------------

test("icon button tooltip has correct structure", async ({ page }) => {
	await page.goto(ROUTE);
	await page.waitForLoadState("networkidle");

	const actionPopover = page.locator('[id="tooltip-action"]');
	await expect(actionPopover).toHaveAttribute("popover", "hint");
	await expect(actionPopover).toHaveAttribute("role", "tooltip");
	await expect(actionPopover.locator(".popover-tooltip__content")).toContainText(
		"Submit your answers",
	);

	const actionTrigger = page.locator('[interestfor="tooltip-action"]');
	await expect(actionTrigger).toHaveAttribute("aria-label", "Submit form");
});

// ---------------------------------------------------------------------------
// Accessibility
// ---------------------------------------------------------------------------

test("has no WCAG A/AA violations", async ({ page }) => {
	await page.goto(ROUTE);
	await page.waitForLoadState("networkidle");

	const results = await new AxeBuilder({ page }).withTags(WCAG_TAGS).analyze();

	expect(
		results.violations.map((violation) => ({
			id: violation.id,
			impact: violation.impact,
			help: violation.help,
			nodes: violation.nodes.map((node) => node.target),
		})),
	).toEqual([]);
});

test("all triggers are keyboard focusable", async ({ page }) => {
	await page.goto(ROUTE);
	await page.waitForLoadState("networkidle");

	const triggers = page.locator("button.tooltip-trigger");
	const count = await triggers.count();

	for (let i = 0; i < count; i++) {
		const trigger = triggers.nth(i);
		await trigger.focus();
		await expect(trigger).toBeFocused();
	}
});

test("trigger has focus-visible outline style", async ({ page }) => {
	await page.goto(ROUTE);
	await page.waitForLoadState("networkidle");

	const trigger = page.locator("button.tooltip-trigger").first();
	await trigger.focus();

	// Force :focus-visible by tabbing (programmatic focus doesn't always trigger it)
	await page.keyboard.press("Tab");
	await page.keyboard.press("Tab");

	// Check that the focused element has outline styles
	const focusedTrigger = page.locator(":focus");
	const outline = await focusedTrigger.evaluate((el) => window.getComputedStyle(el).outlineStyle);
	// The CSS defines outline: 2px solid for :focus-visible
	expect(outline).toBe("solid");
});

// ---------------------------------------------------------------------------
// Section headings
// ---------------------------------------------------------------------------

test("all demo sections are present", async ({ page }) => {
	await page.goto(ROUTE);
	await page.waitForLoadState("networkidle");

	const sectionHeadings = page.locator("section h2");
	const headings = await sectionHeadings.allTextContents();

	expect(headings).toContain("1. Basic Tooltip");
	expect(headings).toContain("2. Toggletip (Hover + Click)");
	expect(headings).toContain("3. Position Variants");
	expect(headings).toContain("4. Icon Button Tooltip");
});

// ---------------------------------------------------------------------------
// Browser support note
// ---------------------------------------------------------------------------

test("browser support information is displayed", async ({ page }) => {
	await page.goto(ROUTE);
	await page.waitForLoadState("networkidle");

	const supportSection = page.locator("text=Browser Support");
	await expect(supportSection).toBeVisible();

	// Check that key browser support terms are mentioned
	const pageContent = await page.textContent("main");
	expect(pageContent).toContain("Popover API");
	expect(pageContent).toContain("CSS Anchor Positioning");
	expect(pageContent).toContain("Interest Invokers");
});
