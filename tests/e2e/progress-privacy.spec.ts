import { expect, test } from "@playwright/test";
import type { ProgressSession, QuestionAttempt } from "../../src/lib/progress";
import { readCertificationProgress } from "./progress-helpers";

const CERTIFICATION = "/practice-lab/certifications/ccdv-f/";
const ANALYTICS_PROVIDERS = [
	"https://analytics.ahrefs.com/**",
	"https://va.vercel-scripts.com/**",
	"https://vitals.vercel-insights.com/**",
	"**/_vercel/insights/**",
];

interface CapturedRequest {
	url: string;
	body: string | null;
}

function decodedVariants(value: string): string[] {
	const variants = [value];
	let current = value;

	for (let depth = 0; depth < 3; depth += 1) {
		try {
			const decoded = decodeURIComponent(current);
			if (decoded === current) break;
			variants.push(decoded);
			current = decoded;
		} catch {
			break;
		}
	}

	return variants;
}

function normalizeCapturedRequests(requests: readonly CapturedRequest[]): string {
	const values: string[] = [];

	for (const { url, body } of requests) {
		values.push(...decodedVariants(url));
		const parsedUrl = new URL(url);
		values.push(...decodedVariants(parsedUrl.pathname));
		for (const [key, value] of parsedUrl.searchParams) {
			values.push(key, ...decodedVariants(value));
		}

		if (body === null) continue;
		values.push(...decodedVariants(body));
		for (const [key, value] of new URLSearchParams(body)) {
			values.push(key, ...decodedVariants(value));
		}
	}

	return values.join("\n");
}

test("keeps saved learning records out of outbound requests", async ({ page }) => {
	const capturedRequests: CapturedRequest[] = [];
	page.on("request", (request) => {
		capturedRequests.push({ url: request.url(), body: request.postData() });
	});

	for (const providerPattern of ANALYTICS_PROVIDERS) {
		await page.route(providerPattern, (route) => route.fulfill({ status: 204, body: "" }));
	}

	await page.goto(`${CERTIFICATION}?mode=practice#session`);
	await expect(page.getByRole("heading", { name: "Practice setup" })).toBeVisible();
	await page.selectOption("#amount", "10");
	await page.getByRole("button", { name: "Practice mode" }).click();
	await expect(page.getByRole("button", { name: "Check answer" })).toBeVisible();

	const selectCountValue = await page
		.locator(".hint[data-select-count]")
		.getAttribute("data-select-count");
	if (!selectCountValue) throw new Error("Expected the question to declare its selection count.");
	const selectCount = Number(selectCountValue);
	if (!Number.isSafeInteger(selectCount) || selectCount < 1) {
		throw new Error(`Expected a positive selection count, received ${selectCountValue}.`);
	}

	const options = page.locator("button.option");
	const optionCount = await options.count();
	expect(optionCount).toBeGreaterThanOrEqual(selectCount);
	const visibleSelectedValues: string[] = [];
	for (let index = 0; index < selectCount; index += 1) {
		const option = options.nth(index);
		const optionValue = await option.locator("span").nth(1).textContent();
		if (optionValue === null) throw new Error("Expected a visible answer option value.");
		visibleSelectedValues.push(optionValue.trim());
		await option.click();
	}
	await page.getByRole("button", { name: "Check answer" }).click();
	await expect(page.locator(".feedback")).toBeVisible();

	const progress = await readCertificationProgress(page, "ccdv-f");
	const sessionRecord = progress.sessions.find(
		(record) => record.mode === "practice" && record.status === "in_progress",
	);
	if (!sessionRecord) throw new Error("Expected the practice session to be saved in IndexedDB.");
	const savedSession = sessionRecord as unknown as ProgressSession;
	const attemptRecord = progress.attempts.find((record) => record.sessionId === savedSession.id);
	if (!attemptRecord) throw new Error("Expected the checked answer to be saved as an attempt.");
	const savedAttempt = attemptRecord as unknown as QuestionAttempt;
	const savedQuestion = savedSession.content.questions.find(
		(question) => question.questionId === savedAttempt.questionId,
	);
	if (!savedQuestion) throw new Error("Expected the evaluated question in the saved session.");

	expect(savedSession.id).toBeTruthy();
	expect(savedAttempt).toMatchObject({
		sessionId: savedSession.id,
		questionId: savedQuestion.questionId,
	});
	expect(savedAttempt.selectedOptionIds).toHaveLength(selectCount);
	expect(savedAttempt.outcome).toMatch(/^(correct|incorrect)$/);
	expect(savedAttempt.scorePossible).toBeGreaterThan(0);

	const selectedOptionValues = savedAttempt.selectedOptionIds.map((optionId) => {
		const optionIndex = savedQuestion.optionIds.indexOf(optionId);
		if (optionIndex < 0) throw new Error(`Expected ${optionId} in the saved question options.`);
		return savedQuestion.optionTexts[optionIndex];
	});
	expect([...selectedOptionValues].sort()).toEqual([...visibleSelectedValues].sort());

	expect(capturedRequests.length).toBeGreaterThan(0);
	expect(capturedRequests.some(({ url }) => new URL(url).pathname === CERTIFICATION)).toBe(true);

	const normalizedRequests = normalizeCapturedRequests(capturedRequests);
	for (const privateValue of [
		savedSession.id,
		savedQuestion.questionId,
		savedQuestion.contentHash,
		savedQuestion.questionText,
		...savedAttempt.selectedOptionIds,
		...selectedOptionValues,
	]) {
		expect(normalizedRequests).not.toContain(privateValue);
	}
	for (const resultField of ["outcome", "scoreEarned", "scorePossible", "evaluatedAt"]) {
		expect(normalizedRequests).not.toContain(resultField);
	}
	for (const resultSignature of [
		`"outcome":"${savedAttempt.outcome}"`,
		`"scoreEarned":${savedAttempt.scoreEarned}`,
		`"scorePossible":${savedAttempt.scorePossible}`,
	]) {
		expect(normalizedRequests).not.toContain(resultSignature);
	}
});
