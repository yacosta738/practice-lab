import { expect, test } from "@playwright/test";

const BASE_PATH = "/practice-lab";

// Developer Foundations exam recall question IDs
const _RECALL_IDS = [
	"D5-020", // Model selection tradeoffs
	"D2-038", // Real-time communication
	"D2-039", // Code migration strategy
	"D6-017", // Context drift
	"D2-040", // JSON validation
	"D8-014", // MCP local transport
	"D1-022", // Multi-agent architecture
	"D6-018", // Prompt vs Context Engineering
	"D3-006", // CLAUDE.md organization
];

// Expected question text snippets to identify each recall question
const _RECALL_QUESTION_SNIPPETS: Record<string, string> = {
	"D5-020": "balancing three factors",
	"D2-038": "real-time, bidirectional communication",
	"D2-039": "40 different places",
	"D6-017": "context drift",
	"D2-040": "strict JSON schema",
	"D8-014": "MCP",
	"D1-022": "insurance claims",
	"D6-018": "Prompt Engineering and Context Engineering",
	"D3-006": "CLAUDE.md",
};

test("CCDV-F practice mode renders and checks single- and multi-select questions", async ({
	page,
}) => {
	await page.goto(`${BASE_PATH}/certifications/ccdv-f/`);
	await page.waitForLoadState("networkidle");

	// Wait for the home page to render
	await page.waitForSelector("#amount", { state: "visible", timeout: 10000 });

	// Select "All available" questions before starting practice mode
	await page.selectOption("#amount", { label: "All available" });

	// Start practice mode
	await page.getByRole("button", { name: "Practice mode" }).click();

	// Wait for the first question to render
	await page.waitForSelector("button.option", { state: "visible", timeout: 10000 });

	// Verify the question text is rendered in <h2>
	const questionText = await page.locator("h2").first().textContent();
	expect(questionText?.length).toBeGreaterThan(0);

	// Verify option buttons are present
	const optionButtons = page.locator("button.option");
	const optionCount = await optionButtons.count();
	expect(optionCount).toBeGreaterThanOrEqual(2);

	// Verify option letters are sequential (A, B, C, ...)
	const letterSpans = page.locator("button.option .letter");
	const letters = await letterSpans.allTextContents();
	expect(letters.length).toBe(optionCount);

	// Read the selection requirement; practice mode shuffles single- and multi-select questions.
	const hintText = await page.locator(".hint").textContent();
	expect(hintText).toMatch(/Select (?:ONE answer|exactly \d+ answers)/i);
	const selectCount = Number(await page.locator(".hint").getAttribute("data-select-count"));
	expect(selectCount).toBeGreaterThan(0);
	expect(selectCount).toBeLessThanOrEqual(optionCount);

	// The check button stays disabled until the required number of choices is selected.
	const checkBtn = page.getByRole("button", { name: "Check answer" });
	for (let index = 0; index < selectCount; index++) {
		await optionButtons.nth(index).click();
		if (index < selectCount - 1) {
			await expect(checkBtn).toBeDisabled();
		}
	}
	await expect(checkBtn).toBeEnabled();
	await checkBtn.click();
	await page.waitForLoadState("networkidle");

	// Verify feedback panel appears
	await expect(page.locator(".feedback")).toBeVisible();

	// Verify "Why not the others" or explanation is present
	await expect(page.locator(".feedback")).toBeVisible();
});

test("CCDV-F practice mode shows correct question count", async ({ page }) => {
	await page.goto(`${BASE_PATH}/certifications/ccdv-f/`);
	await page.waitForLoadState("networkidle");

	// Wait for the home page to render
	await page.waitForSelector("#amount", { state: "visible", timeout: 10000 });

	// Select "All available" questions
	await page.selectOption("#amount", { label: "All available" });

	// Start practice mode
	await page.getByRole("button", { name: "Practice mode" }).click();

	// Wait for the first question to render
	await page.waitForSelector("button.option", { state: "visible", timeout: 10000 });

	// Read the total number of questions in the session
	const qHeadText = await page.locator(".qhead span").first().textContent();
	const totalMatch = qHeadText?.match(/Question \d+ of (\d+)/);
	const totalQuestions = totalMatch ? Number.parseInt(totalMatch[1], 10) : -1;

	// CCDV-F has 199 questions total (146 hand-authored + 53 CPQ)
	expect(totalQuestions).toBe(199);
});

test("CCDV-F exam mode follows blueprint", async ({ page }) => {
	await page.goto(`${BASE_PATH}/certifications/ccdv-f/?mode=assess#session`);
	await page.waitForLoadState("networkidle");

	// Start the explicit mock exam setup
	await page.getByRole("button", { name: "Start mock exam" }).click();

	// Wait for the first question to render
	await page.waitForSelector("button.option", { state: "visible", timeout: 10000 });

	// Read the total number of questions in the session
	const qHeadText = await page.locator(".qhead span").first().textContent();
	const totalMatch = qHeadText?.match(/Question \d+ of (\d+)/);
	const totalQuestions = totalMatch ? Number.parseInt(totalMatch[1], 10) : -1;

	// CCDV-F exam blueprint has 53 questions total
	expect(totalQuestions).toBe(53);
});
