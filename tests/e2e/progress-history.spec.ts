import { expect, test } from "@playwright/test";
import { readCertificationProgress } from "./progress-helpers";

const CERTIFICATION = "/practice-lab/certifications/ccdv-f/";

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
	await expect(page.locator("h2")).toHaveText(
		activeQuestions[overlappingQuestionIndex].questionText,
	);

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
