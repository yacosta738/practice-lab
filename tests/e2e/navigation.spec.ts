import { expect, test } from "@playwright/test";

const BASE_PATH = "/practice-lab";

test("mobile drawer closes for same-page navigation and stays open for a canceled click", async ({
	page,
}) => {
	await page.setViewportSize({ width: 390, height: 844 });
	const path = `${BASE_PATH}/certifications/ccdv-f/`;
	await page.goto(path);
	await page.getByRole("button", { name: "Open workspace navigation" }).click();

	const drawer = page.getByRole("dialog", { name: "practice lab" });
	const assess = drawer.getByRole("link", { name: "Assess · Mock exam" });
	await assess.evaluate((link) =>
		link.addEventListener("click", (event) => event.preventDefault(), { once: true }),
	);
	await assess.click();
	await expect(drawer).toBeVisible();
	await expect(page).toHaveURL(path);

	await assess.press("Enter");
	await expect(drawer).toBeHidden();
	await expect(page).toHaveURL(`${path}?mode=assess#session`);
});

test("homepage certification link navigates under the GitHub Pages base path", async ({ page }) => {
	await page.goto(`${BASE_PATH}/`);
	await page.getByRole("link", { name: "Start practicing" }).click();

	await expect(page).toHaveURL(new RegExp(`${BASE_PATH}/certifications/ccdv-f/?$`));
	await expect(page.getByRole("heading", { name: /Know the platform/i })).toBeVisible();
});

test("certification card navigates to a new certification page", async ({ page }) => {
	await page.goto(`${BASE_PATH}/`);
	await page.getByRole("link", { name: /Claude Certified Associate.*Foundations/i }).click();
	await expect(page).toHaveURL(new RegExp(`${BASE_PATH}/certifications/ccao-f/?$`));
	await expect(page.getByRole("heading", { name: /Know the platform/i })).toBeVisible();
});

test("study library navigation reaches a note from the home page", async ({ page }) => {
	await page.goto(`${BASE_PATH}/`);
	await page.getByRole("link", { name: "Study the notes" }).click();
	await expect(page).toHaveURL(new RegExp(`${BASE_PATH}/study/?$`));
	await expect(
		page.getByRole("heading", { name: /Study notes, organised by certification/i }),
	).toBeVisible();
	await page.getByRole("link", { name: "Open the study library" }).click();
	await expect(page).toHaveURL(new RegExp(`${BASE_PATH}/study/ccdv-f/?$`));
	await expect(page.getByRole("heading", { name: "Claude Developer Foundations" })).toBeVisible();
	await page.getByRole("link", { name: "Workflows versus Agents" }).click();
	await expect(page).toHaveURL(new RegExp(`${BASE_PATH}/study/ccdv-f/workflows-versus-agents/?$`));
	await expect(
		page.getByRole("heading", { level: 1, name: "Workflows versus Agents" }),
	).toBeVisible();
	await page
		.getByRole("link", { name: /D1 - Agents and Workflows MOC/ })
		.first()
		.click();
	await expect(page).toHaveURL(
		new RegExp(`${BASE_PATH}/study/ccdv-f/d1-agents-and-workflows-moc/?$`),
	);
});

test("CCDV-F study page exposes curated resources and exam decision guidance", async ({ page }) => {
	await page.goto(`${BASE_PATH}/study/ccdv-f/`);
	await page.getByRole("link", { name: "Learning resources", exact: true }).click();

	await expect(page).toHaveURL(new RegExp(`${BASE_PATH}/study/ccdv-f/learning-resources/?$`));
	await expect(page.getByRole("heading", { level: 1, name: /Learning resources/i })).toBeVisible();
	await expect(
		page.getByRole("link", { name: "AI Cert Guides — free CCDV-F lessons", exact: true }),
	).toHaveAttribute("href", "https://aicertguides.com/ccdv-f/learn");
	await expect(page.getByRole("link", { name: /12-hour.*YouTube/i })).toHaveAttribute(
		"href",
		"https://www.youtube.com/watch?v=qaupWs_DcAI",
	);
	await expect(page.getByText(/rather than republishing their lessons/i)).toBeVisible();

	await page.goto(`${BASE_PATH}/study/ccdv-f/`);
	await page.getByRole("link", { name: "Exam decision guide", exact: true }).click();
	await expect(page).toHaveURL(new RegExp(`${BASE_PATH}/study/ccdv-f/exam-decision-guide/?$`));
	await expect(page.getByRole("heading", { level: 1, name: /Exam decision guide/i })).toBeVisible();
	await expect(
		page.getByRole("heading", { name: /Match the design to the requirement/i }),
	).toBeVisible();
});

test("priority-domain maps expose their applied study workshops", async ({ page }) => {
	await page.goto(`${BASE_PATH}/study/ccdv-f/d2-applications-and-integration-moc/`);
	await page.getByRole("link", { name: "Application Integration Design Workshop" }).first().click();
	await expect(page).toHaveURL(
		new RegExp(`${BASE_PATH}/study/ccdv-f/application-integration-design-workshop/?$`),
	);
	await expect(
		page.getByRole("heading", { level: 1, name: "Application Integration Design Workshop" }),
	).toBeVisible();
	await expect(
		page.getByRole("heading", { name: /Convert constraints into design decisions/i }),
	).toBeVisible();

	await page.goto(`${BASE_PATH}/study/ccdv-f/d5-model-selection-and-optimization-moc/`);
	await page
		.getByRole("link", { name: "Model Selection and Optimization Workshop" })
		.first()
		.click();
	await expect(page).toHaveURL(
		new RegExp(`${BASE_PATH}/study/ccdv-f/model-selection-and-optimization-workshop/?$`),
	);
	await expect(
		page.getByRole("heading", { level: 1, name: "Model Selection and Optimization Workshop" }),
	).toBeVisible();
	await expect(
		page.getByText(/cost per successful task = total measured API spend/i),
	).toBeVisible();

	await page.goto(`${BASE_PATH}/study/ccdv-f/d1-agents-and-workflows-moc/`);
	await page.getByRole("link", { name: "Agent Architecture Design Workshop" }).first().click();
	await expect(page).toHaveURL(
		new RegExp(`${BASE_PATH}/study/ccdv-f/agent-architecture-design-workshop/?$`),
	);
	await expect(
		page.getByRole("heading", { level: 1, name: "Agent Architecture Design Workshop" }),
	).toBeVisible();
	await expect(
		page.getByRole("heading", { name: /Define the harness before enabling autonomy/i }),
	).toBeVisible();
});
