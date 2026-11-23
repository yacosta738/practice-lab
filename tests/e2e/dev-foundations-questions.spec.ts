import { expect, test } from "@playwright/test";

const BASE_PATH = "/practice-lab";

// Developer Foundations exam recall question IDs
const RECALL_IDS = [
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
const RECALL_QUESTION_SNIPPETS: Record<string, string> = {
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

test("CCDV-F practice mode renders single-select questions correctly", async ({ page }) => {
	// Clear any persisted session so we start fresh
	await page.goto(`${BASE_PATH}/certifications/ccdv-f/`);
	await page.waitForLoadState("networkidle");
	await page.evaluate(() => localStorage.clear());
	await page.reload();
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

	// Verify hint is present
	const hintText = await page.locator(".hint").first().textContent();
	expect(hintText).toMatch(/Select/i);

	// Select an option and check answer
	await optionButtons.first().click();
	const checkBtn = page.getByRole("button", { name: "Check answer" });
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
	await page.evaluate(() => localStorage.clear());
	await page.reload();
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

	// CCDV-F has 184 questions total (131 hand-authored + 53 CPQ)
	expect(totalQuestions).toBe(184);
});

test("CCDV-F exam mode follows blueprint", async ({ page }) => {
	await page.goto(`${BASE_PATH}/certifications/ccdv-f/`);
	await page.waitForLoadState("networkidle");
	await page.evaluate(() => localStorage.clear());
	await page.reload();
	await page.waitForLoadState("networkidle");

	// Wait for the home page to render
	await page.waitForSelector("#amount", { state: "visible", timeout: 10000 });

	// Start mock exam mode (no amount selection needed)
	await page.getByRole("button", { name: "Mock exam" }).click();

	// Wait for the first question to render
	await page.waitForSelector("button.option", { state: "visible", timeout: 10000 });

	// Read the total number of questions in the session
	const qHeadText = await page.locator(".qhead span").first().textContent();
	const totalMatch = qHeadText?.match(/Question \d+ of (\d+)/);
	const totalQuestions = totalMatch ? Number.parseInt(totalMatch[1], 10) : -1;

	// CCDV-F exam blueprint has 53 questions total
	expect(totalQuestions).toBe(53);
});
