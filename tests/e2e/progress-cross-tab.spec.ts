import { expect, type Page, test } from "@playwright/test";
import type { RecordEvaluationCommand, SessionCheckpoint } from "../../src/lib/progress";
import { readCertificationProgress } from "./progress-helpers";

const CERTIFICATION = "/practice-lab/certifications/ccdv-f/";

async function readActiveSession(page: Page) {
	return page.evaluate(async () => {
		const service = window.practiceLabProgressService;
		if (!service) throw new Error("The browser progress service is unavailable.");
		const state = await service.readState();
		const session = state.currentSession;
		if (!session) throw new Error("Expected the active practice session to be saved.");
		return {
			id: session.id,
			revision: session.revision,
			checkpoint: session.checkpoint,
			questions: session.content.questions.map(
				({ questionId, optionIds, correctOptionIds, selectCount }) => ({
					questionId,
					optionIds,
					correctOptionIds,
					selectCount,
				}),
			),
		};
	});
}

async function checkpointSessionInBrowser(input: {
	sessionId: string;
	expectedRevision: number;
	checkpoint: SessionCheckpoint;
}): Promise<number> {
	const service = window.practiceLabProgressService;
	if (!service) throw new Error("The browser progress service is unavailable.");
	const updated = await service.checkpointSession(input);
	return updated.revision;
}

async function recordEvaluationInBrowser(input: RecordEvaluationCommand): Promise<void> {
	const service = window.practiceLabProgressService;
	if (!service) throw new Error("The browser progress service is unavailable.");
	await service.recordEvaluation(input);
}

test("two tabs reject a stale checkpoint and record one evaluation", async ({ page, context }) => {
	await page.goto(`${CERTIFICATION}?mode=practice#session`);
	await page.getByLabel("Questions", { exact: true }).selectOption("10");
	await page.getByRole("button", { name: "Practice mode" }).click();
	await expect(page.getByRole("button", { name: "Pause & go home" })).toBeVisible();

	const secondPage = await context.newPage();
	await secondPage.goto(page.url());
	await expect(secondPage.getByRole("button", { name: "Pause & go home" })).toBeVisible();

	const [firstSession, secondSession] = await Promise.all([
		readActiveSession(page),
		readActiveSession(secondPage),
	]);
	expect(secondSession.id).toBe(firstSession.id);
	expect(secondSession.revision).toBe(firstSession.revision);

	const [question, firstFlagQuestion, secondFlagQuestion] = firstSession.questions;
	if (!question || !firstFlagQuestion || !secondFlagQuestion) {
		throw new Error("The practice session must contain at least three questions.");
	}
	const selectedOptionIds = question.optionIds.slice(0, question.selectCount);
	if (selectedOptionIds.length !== question.selectCount) {
		throw new Error("The practice question does not contain enough valid options.");
	}
	const savedCheckpoint: SessionCheckpoint = {
		...firstSession.checkpoint,
		currentQuestionId: question.questionId,
		selectedOptionIdsByQuestion: {
			...firstSession.checkpoint.selectedOptionIdsByQuestion,
			[question.questionId]: selectedOptionIds,
		},
	};
	await page.evaluate(checkpointSessionInBrowser, {
		sessionId: firstSession.id,
		expectedRevision: firstSession.revision,
		checkpoint: savedCheckpoint,
	});

	await Promise.all([page.reload(), secondPage.reload()]);
	await Promise.all([
		expect(page.getByRole("button", { name: "Pause & go home" })).toBeVisible(),
		expect(secondPage.getByRole("button", { name: "Pause & go home" })).toBeVisible(),
	]);
	const [firstReady, secondReady] = await Promise.all([
		readActiveSession(page),
		readActiveSession(secondPage),
	]);
	expect(firstReady.id).toBe(firstSession.id);
	expect(secondReady.id).toBe(firstSession.id);
	expect(secondReady.revision).toBe(firstReady.revision);
	expect(firstReady.checkpoint.selectedOptionIdsByQuestion[question.questionId]).toEqual(
		selectedOptionIds,
	);

	const firstCheckpoint: SessionCheckpoint = {
		...firstReady.checkpoint,
		flaggedQuestionIds: [firstFlagQuestion.questionId],
	};
	const secondCheckpoint: SessionCheckpoint = {
		...secondReady.checkpoint,
		flaggedQuestionIds: [secondFlagQuestion.questionId],
	};
	const checkpointResults = await Promise.allSettled([
		page.evaluate(checkpointSessionInBrowser, {
			sessionId: firstReady.id,
			expectedRevision: firstReady.revision,
			checkpoint: firstCheckpoint,
		}),
		secondPage.evaluate(checkpointSessionInBrowser, {
			sessionId: secondReady.id,
			expectedRevision: secondReady.revision,
			checkpoint: secondCheckpoint,
		}),
	]);
	expect(checkpointResults[0].status).not.toBe(checkpointResults[1].status);

	const winnerIndex = checkpointResults.findIndex((result) => result.status === "fulfilled");
	if (winnerIndex < 0) throw new Error("Expected one checkpoint write to succeed.");
	const winner = checkpointResults[winnerIndex];
	const loser = checkpointResults[1 - winnerIndex];
	if (winner.status !== "fulfilled" || loser.status !== "rejected") {
		throw new Error("Expected the stale checkpoint write to be rejected.");
	}
	expect(winner.value).toBe(firstReady.revision + 1);
	expect(String(loser.reason)).toContain("The session changed since this checkpoint was read.");

	const losingPage = winnerIndex === 0 ? secondPage : page;
	const conflictAlert = losingPage
		.getByRole("alert")
		.filter({ hasText: "Progress changed elsewhere." });
	await expect(conflictAlert).toBeVisible();
	await expect(conflictAlert.getByRole("button", { name: "Reload progress" })).toBeVisible();

	const isCorrect =
		selectedOptionIds.length === question.correctOptionIds.length &&
		selectedOptionIds.every((optionId) => question.correctOptionIds.includes(optionId));
	const evaluation: RecordEvaluationCommand = {
		sessionId: firstReady.id,
		questionId: question.questionId,
		selectedOptionIds,
		outcome: isCorrect ? "correct" : "incorrect",
		scoreEarned: isCorrect ? 1 : 0,
		scorePossible: 1,
		expectedRevision: winner.value,
	};
	await Promise.all([
		page.evaluate(recordEvaluationInBrowser, evaluation),
		secondPage.evaluate(recordEvaluationInBrowser, evaluation),
	]);

	const persisted = await readCertificationProgress(page, "ccdv-f");
	const winningCheckpoint = winnerIndex === 0 ? firstCheckpoint : secondCheckpoint;
	expect(persisted.sessions.find(({ id }) => id === firstReady.id)).toMatchObject({
		revision: winner.value + 1,
		checkpoint: {
			flaggedQuestionIds: winningCheckpoint.flaggedQuestionIds,
			selectedOptionIdsByQuestion: winningCheckpoint.selectedOptionIdsByQuestion,
		},
	});
	const matchingAttempts = persisted.attempts.filter(
		(attempt) => attempt.sessionId === firstReady.id && attempt.questionId === question.questionId,
	);
	expect(matchingAttempts).toHaveLength(1);
	expect(
		persisted.questionProgress.find((progress) => progress.questionId === question.questionId),
	).toMatchObject({ attemptCount: 1, correctCount: isCorrect ? 1 : 0 });
});
