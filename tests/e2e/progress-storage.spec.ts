import { expect, test } from "@playwright/test";
import { build } from "esbuild";

let progressBundle = "";

test.beforeAll(async () => {
	const result = await build({
		entryPoints: ["src/lib/progress/index.ts"],
		bundle: true,
		write: false,
		platform: "browser",
		format: "iife",
		globalName: "ProgressLab",
		target: ["es2022"],
	});
	progressBundle = result.outputFiles[0].text;
});

test.beforeEach(async ({ page }) => {
	await page.goto("/practice-lab/");
	await page.addScriptTag({ content: progressBundle });
});

test("persists typed progress through the browser adapter and keeps aborted transactions atomic", async ({
	page,
}) => {
	const persisted = await page.evaluate(async () => {
		const api = (
			window as unknown as Window & {
				ProgressLab: typeof import("../../src/lib/progress");
			}
		).ProgressLab;
		const repository = api.createProgressRepository();
		const useCases = api.createProgressUseCases(repository, { now: () => 1_000 });
		const session = await useCases.createSession({
			id: "00000000-0000-4000-8000-000000000001",
			certificationId: "ccdv-f",
			mode: "practice",
			scoring: {
				revision: "scoring-v1",
				passingScore: 70,
				totalQuestions: 1,
				domainWeights: { "domain-a": 100 },
			},
			content: {
				bankRevision: "bank-v1",
				questions: [
					{
						questionId: "question-stable-id",
						revision: "question-v1",
						contentHash: "sha256:question-v1",
						domainId: "domain-a",
						optionIds: ["option-a", "option-b"],
						optionTexts: ["Correct", "Incorrect"],
						displayOptionIds: ["option-a", "option-b"],
						correctOptionIds: ["option-a"],
						questionText: "Question text",
						domainName: "Domain A",
						explanation: "Explanation",
						sourceLabel: "Guide",
						sourceUrl: "https://example.test/guide",
						selectCount: 1,
					},
				],
			},
		});
		const checkpointed = await useCases.checkpointSession({
			sessionId: session.id,
			expectedRevision: session.revision,
			checkpoint: {
				currentQuestionId: "question-stable-id",
				deadlineAt: null,
				selectedOptionIdsByQuestion: { "question-stable-id": ["option-a"] },
				checkedQuestionIds: [],
				flaggedQuestionIds: [],
			},
		});
		await useCases.recordEvaluation({
			sessionId: session.id,
			questionId: "question-stable-id",
			selectedOptionIds: ["option-a"],
			outcome: "correct",
			scoreEarned: 1,
			scorePossible: 1,
			expectedRevision: checkpointed.revision,
		});
		const evaluatedSession = await useCases.getSession(session.id);
		if (!evaluatedSession) throw new Error("Expected the evaluated session to remain available.");
		await useCases.finalizeSession(session.id, evaluatedSession.revision, "completed");
		await repository.close();

		const reopenedRepository = api.createProgressRepository();
		const history = await reopenedRepository.getSessionHistory("ccdv-f");
		const questionProgress = await reopenedRepository.getQuestionProgress(
			"ccdv-f",
			"question-stable-id",
		);
		await reopenedRepository.close();
		return { history, questionProgress };
	});

	expect(persisted.history).toHaveLength(1);
	expect(persisted.history[0]).toMatchObject({
		session: { status: "completed", revision: 4 },
		attempts: [{ outcome: "correct", questionRevision: "question-v1" }],
	});
	expect(persisted.questionProgress).toMatchObject({ attemptCount: 1, correctCount: 1 });

	const transactionResult = await page.evaluate(async () => {
		function requestResult<T>(request: IDBRequest<T>): Promise<T> {
			return new Promise((resolve, reject) => {
				request.onsuccess = () => resolve(request.result);
				request.onerror = () => reject(request.error);
			});
		}

		const database = await new Promise<IDBDatabase>((resolve, reject) => {
			const request = indexedDB.open("practice-lab");
			request.onsuccess = () => resolve(request.result);
			request.onerror = () => reject(request.error);
		});
		const sessionId = "00000000-0000-4000-8000-000000000001";
		const session = await requestResult(
			database.transaction("sessions").objectStore("sessions").get(sessionId) as IDBRequest<
				{ id: string; revision: number } | undefined
			>,
		);
		if (!session) throw new Error("Expected the saved session in IndexedDB.");

		const transaction = database.transaction(["sessions", "metadata"], "readwrite");
		const aborted = new Promise<boolean>((resolve) => {
			transaction.oncomplete = () => resolve(false);
			transaction.onabort = () => resolve(true);
		});
		const sessionRequest = transaction.objectStore("sessions").get(sessionId);
		sessionRequest.onsuccess = () => {
			const stored = sessionRequest.result as { id: string; revision: number };
			transaction.objectStore("sessions").put({ ...stored, revision: 99 });
			transaction.objectStore("metadata").add({
				key: "schema-version",
				value: { version: 99 },
			});
		};
		const didAbort = await aborted;
		const after = await requestResult(
			database.transaction("sessions").objectStore("sessions").get(sessionId) as IDBRequest<
				{ id: string; revision: number } | undefined
			>,
		);
		database.close();
		return { didAbort, revision: after?.revision };
	});

	expect(transactionResult).toEqual({ didAbort: true, revision: 4 });
});
