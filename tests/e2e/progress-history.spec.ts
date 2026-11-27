import { expect, test } from "@playwright/test";
import { readCertificationProgress } from "./progress-helpers";

const CERTIFICATION = "/practice-lab/certifications/ccdv-f/";

declare global {
	interface Window {
		__questionAttemptReadCount?: () => number;
	}
}

test("routine quiz state refreshes do not load question attempt history", async ({ page }) => {
	await page.addInitScript(() => {
		let questionAttemptReads = 0;
		const originalIndexGetAll = IDBIndex.prototype.getAll;
		IDBIndex.prototype.getAll = function (
			query?: IDBValidKey | IDBKeyRange | null,
			count?: number,
		) {
			if (this.objectStore.name === "questionAttempts") questionAttemptReads += 1;
			return originalIndexGetAll.call(this, query, count);
		};
		window.__questionAttemptReadCount = () => questionAttemptReads;
	});

	await page.goto(`${CERTIFICATION}?mode=practice`);
	await expect(page.getByRole("button", { name: /Practice mode/ })).toBeVisible();
	const readsBefore = await page.evaluate(() => window.__questionAttemptReadCount?.() ?? -1);
	await page.evaluate(async () => {
		const service = window.practiceLabProgressService;
		if (!service) throw new Error("The browser progress service is unavailable.");
		await service.readState();
	});
	const readsAfter = await page.evaluate(() => window.__questionAttemptReadCount?.() ?? -1);

	expect(readsBefore).toBeGreaterThanOrEqual(0);
	expect(readsAfter).toBe(readsBefore);
});

test("reviewing an older result keeps the active mock exam available to resume", async ({
	page,
}) => {
	await page.goto(`${CERTIFICATION}?mode=practice`);
	await expect(page.getByRole("button", { name: /Practice mode/ })).toBeVisible();
	const completedSessionId = await page.evaluate(async () => {
		const bootstrap = JSON.parse(
			document.querySelector<HTMLElement>("#quiz-bootstrap")?.dataset.bootstrap || "{}",
		);
		const [domainId] = Object.entries(bootstrap.cfg.examBlueprint).find(
			([, count]) => Number(count) > 0,
		) as [string, number];
		const questions = bootstrap.qs.filter(
			(question: { domain: string }) => question.domain === domainId,
		);
		const service = window.practiceLabProgressService;
		if (!service) throw new Error("The browser progress service is unavailable.");
		const optionIdsByQuestion = Object.fromEntries(
			questions.map((question: { id: string; options: string[] }) => [
				question.id,
				question.options.map((_, index) => `${question.id}:option:${index}`),
			]),
		);
		const contentQuestions = questions.map(
			(question: {
				id: string;
				domain: string;
				topic?: string;
				question: string;
				options: string[];
				correctAnswers: number[];
				explanation: string;
				whyNot?: string;
				source: { label: string; url: string };
				selectCount?: number;
			}) => {
				const optionIds = optionIdsByQuestion[question.id];
				return {
					questionId: question.id,
					revision: "archived-question-v1",
					contentHash: "archived-content-v1",
					domainId: question.domain,
					optionIds,
					optionTexts: [...question.options],
					displayOptionIds: [...optionIds].reverse(),
					correctOptionIds: question.correctAnswers.map((index) => optionIds[index]),
					questionText: `Prior wording: ${question.question}`,
					domainName: "Prior domain label",
					...(question.topic ? { topic: question.topic } : {}),
					explanation: `Prior explanation: ${question.explanation}`,
					...(question.whyNot ? { whyNot: question.whyNot } : {}),
					sourceLabel: "Prior source",
					sourceUrl: question.source.url,
					selectCount: question.selectCount ?? question.correctAnswers.length,
				};
			},
		);
		const started = await service.createSession({
			id: globalThis.crypto.randomUUID(),
			certificationId: bootstrap.cfg.slug,
			mode: "practice",
			scoring: {
				revision: "archived-scoring-v1",
				passingScore: bootstrap.cfg.passingScore ?? null,
				totalQuestions: questions.length,
				domainWeights: { [domainId]: bootstrap.cfg.domains[domainId].weight },
			},
			content: {
				bankRevision: "archived-bank-v1",
				questions: contentQuestions,
			},
			checkpoint: {
				currentQuestionId: questions[0].id,
				deadlineAt: null,
				selectedOptionIdsByQuestion: {},
				checkedQuestionIds: [],
				flaggedQuestionIds: [],
			},
		});
		await service.finalizeSession(started.id, started.revision, "completed");
		return started.id;
	});
	await page.goto(`${CERTIFICATION}?mode=assess#session`);
	await page.getByRole("button", { name: "Start mock exam" }).click();
	const activeBeforeReview = await readCertificationProgress(page, "ccdv-f");
	const activeSession = activeBeforeReview.sessions.find(
		(session) => session.status === "in_progress",
	);
	if (!activeSession) throw new Error("Expected the active mock exam to be saved.");
	const activeQuestions = (
		activeSession.content as {
			questions: { questionId: string; questionText: string }[];
		}
	).questions;
	const historicalSession = activeBeforeReview.sessions.find(
		(session) => session.id === completedSessionId,
	);
	if (!historicalSession) throw new Error("Expected the older result to remain in history.");
	const historicalQuestionIds = new Set(
		(historicalSession.content as { questions: { questionId: string }[] }).questions.map(
			(question) => question.questionId,
		),
	);
	const overlappingQuestionIndex = activeQuestions.findIndex((question) =>
		historicalQuestionIds.has(question.questionId),
	);
	if (overlappingQuestionIndex < 0) {
		throw new Error("The active exam should share questions with the older session's domain.");
	}
	const timerBeforeReview = (activeSession.checkpoint as { deadlineAt: number | null }).deadlineAt;
	await page.goto(`${CERTIFICATION}?mode=assess#session`);
	await expect(page.getByRole("button", { name: /Resume mock exam/ })).toBeVisible();
	await page.getByRole("button", { name: /practice.*completed/i }).click();
	await expect(page.locator(".results")).toBeVisible();
	await page.getByRole("button", { name: "Back to dashboard" }).click();
	await expect(page.getByRole("button", { name: /Resume mock exam/ })).toBeVisible();
	await page.getByRole("button", { name: /Resume mock exam/ }).click();
	await expect(page.locator(".pl-shell")).toHaveAttribute("data-exam-focus", "true");
	const navigator = page.locator("details.examNavigator");
	if (!(await navigator.evaluate((element) => (element as HTMLDetailsElement).open))) {
		await navigator.locator("summary").click();
	}
	await page.locator(`.qchip[data-value="${overlappingQuestionIndex}"]`).click();
	await expect(
		page.getByRole("heading", {
			name: activeQuestions[overlappingQuestionIndex].questionText,
			level: 2,
		}),
	).toHaveText(activeQuestions[overlappingQuestionIndex].questionText);

	const stateAfterResume = await readCertificationProgress(page, "ccdv-f");
	const resumed = stateAfterResume.sessions.find((session) => session.id === activeSession.id);
	expect(resumed).toMatchObject({ status: "in_progress" });
	expect((resumed?.checkpoint as { deadlineAt: number | null } | undefined)?.deadlineAt).toBe(
		timerBeforeReview,
	);
	expect(
		stateAfterResume.sessions.find((session) => session.id === completedSessionId)?.status,
	).toBe("completed");
});

test("labels migrated score provenance and omits unavailable scores from the exam trend", async ({
	page,
}) => {
	await page.goto(`${CERTIFICATION}?mode=practice`);
	await expect(page.getByRole("button", { name: /Practice mode/ })).toBeVisible();
	const sessionIds = await page.evaluate(async () => {
		const service = window.practiceLabProgressService;
		if (!service) throw new Error("The browser progress service is unavailable.");
		await service.initialize();
		const createLegacyExam = async (
			scoreEvidence: "validated-saved-options" | "insufficient",
			startedAt: number,
		) => {
			const optionIds = ["option-a", "option-b"];
			const session = await service.createSession({
				id: globalThis.crypto.randomUUID(),
				certificationId: "ccdv-f",
				mode: "exam",
				startedAt,
				scoring: {
					revision: "score-provenance-test",
					passingScore: 70,
					totalQuestions: 2,
					domainWeights: { D1: 100 },
				},
				content: {
					bankRevision: "score-provenance-test",
					questions: ["question-a", "question-b"].map((questionId) => ({
						questionId,
						revision: "score-provenance-test",
						contentHash: "score-provenance-test",
						domainId: "D1",
						optionIds,
						optionTexts: ["Correct", "Incorrect"],
						displayOptionIds: optionIds,
						correctOptionIds: ["option-a"],
						questionText: `${questionId}?`,
						domainName: "Domain 1",
						explanation: "The first option is correct.",
						sourceLabel: "Guide",
						sourceUrl: "https://example.test/guide",
						selectCount: 1,
					})),
				},
				checkpoint: {
					currentQuestionId: null,
					deadlineAt: null,
					selectedOptionIdsByQuestion: {
						"question-a": ["option-a"],
						"question-b": ["option-b"],
					},
					checkedQuestionIds: ["question-a"],
					flaggedQuestionIds: [],
				},
				legacy: {
					sourceStorageKey: "ccdv-f-practice-lab-v2",
					version: 2,
					limitations: [],
					evaluatedQuestionIds: ["question-a"],
					scoreEvidence,
				},
			});
			const completed = await service.finalizeSession(session.id, session.revision, "completed");
			if (completed.finishedAt === undefined) {
				throw new Error("Expected a finished timestamp for the legacy score fixture.");
			}
			return { id: session.id, finishedAt: completed.finishedAt };
		};

		const reconstructed = await createLegacyExam("validated-saved-options", 100);
		await new Promise<void>((resolve) => {
			const waitForNextTimestamp = () => {
				if (Date.now() > reconstructed.finishedAt) {
					resolve();
					return;
				}
				window.setTimeout(waitForNextTimestamp, 0);
			};
			waitForNextTimestamp();
		});
		const unavailable = await createLegacyExam("insufficient", 200);
		return {
			reconstructed: reconstructed.id,
			unavailable: unavailable.id,
		};
	});

	await page.goto("/practice-lab/progress/");
	await expect(page.locator("#history-rows")).toContainText("1/2 · reconstructed");
	await expect(page.locator("#history-rows")).toContainText("Score unavailable");
	await expect(
		page.locator("#progress-metrics article").filter({ hasText: "Last result" }),
	).toHaveText(/Score unavailable/);
	await expect(page.locator("#exam-trend")).toContainText("reconstructed");
	await expect(page.locator("#exam-trend")).not.toContainText("unavailable");

	await page.goto(`/practice-lab/progress/session/?session=${sessionIds.reconstructed}`);
	await expect(page.locator("#review-summary")).toContainText(
		"1 of 2 questions correct · reconstructed",
	);
	await page.goto(`/practice-lab/progress/session/?session=${sessionIds.unavailable}`);
	await expect(page.locator("#review-summary")).toContainText("Score unavailable");
});
