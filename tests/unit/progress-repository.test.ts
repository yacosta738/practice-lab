import "fake-indexeddb/auto";
import { deleteDB, openDB } from "idb";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
	type ContentProvenance,
	type CreateSessionInput,
	createProgressRepository,
	PROGRESS_DATABASE_NAME,
	PROGRESS_DATABASE_VERSION,
	type ProgressDatabaseSchema,
	type ProgressRepository,
	type ProgressSession,
	type ScoringProvenance,
} from "../../src/lib/progress";
import { ProgressConflictError } from "../../src/lib/progress/errors";

const CONTENT: ContentProvenance = {
	bankRevision: "bank-v1",
	questions: [
		{
			questionId: "question-stable-id",
			revision: "question-v1",
			contentHash: "sha256:question-v1",
			domainId: "domain-a",
			optionIds: ["option-a", "option-b"],
		},
	],
};

const SCORING: ScoringProvenance = {
	revision: "scoring-v1",
	passingScore: 70,
	totalQuestions: 1,
	domainWeights: { "domain-a": 100 },
};

let repository: ProgressRepository;

function sessionInput(id: string, certificationId = "ccdv-f", startedAt = 100): CreateSessionInput {
	return {
		id,
		certificationId,
		mode: "practice",
		startedAt,
		scoring: SCORING,
		content: CONTENT,
	};
}

beforeEach(async () => {
	await deleteDB(PROGRESS_DATABASE_NAME);
	repository = createProgressRepository();
});

afterEach(async () => {
	await repository.close();
	await deleteDB(PROGRESS_DATABASE_NAME);
});

describe("IndexedDB progress repository", () => {
	it("creates the complete versioned schema and its metadata in the upgrade transaction", async () => {
		await repository.createSession(sessionInput("00000000-0000-4000-8000-000000000001"));
		const database = await openDB<ProgressDatabaseSchema>(PROGRESS_DATABASE_NAME);

		expect(database.version).toBe(PROGRESS_DATABASE_VERSION);
		expect(Array.from(database.objectStoreNames).sort()).toEqual([
			"learningGoals",
			"metadata",
			"questionAttempts",
			"questionProgress",
			"sessions",
			"studyProgress",
		]);
		expect(Array.from(database.transaction("sessions").store.indexNames).sort()).toEqual([
			"by-certification",
			"by-finished-at",
			"by-started-at",
			"by-status",
		]);
		expect(Array.from(database.transaction("questionAttempts").store.indexNames).sort()).toEqual([
			"by-certification",
			"by-domain",
			"by-evaluated-at",
		]);
		expect(await database.get("metadata", "schema-version")).toMatchObject({
			value: { version: PROGRESS_DATABASE_VERSION },
		});
		expect(await database.get("metadata", "migration:0-1")).toBeDefined();
		expect(await database.get("metadata", "data-generation-token")).toMatchObject({
			value: expect.stringMatching(/^[0-9a-f-]{36}$/i),
		});
		database.close();
	});

	it("closes its connection when a newer schema version requests an upgrade", async () => {
		await repository.createSession(sessionInput("00000000-0000-4000-8000-000000000001"));
		const upgraded = await openDB<ProgressDatabaseSchema>(PROGRESS_DATABASE_NAME, 2, {
			upgrade() {},
		});

		expect(upgraded.version).toBe(2);
		upgraded.close();
	});

	it("reports unavailable and denied storage as typed errors", async () => {
		await withIndexedDb(undefined, async () => {
			await expect(repository.getSessionHistory("ccdv-f")).rejects.toMatchObject({
				name: "ProgressStorageError",
				code: "unavailable",
			});
		});

		const deniedFactory = {
			open() {
				throw new DOMException("Storage access denied", "SecurityError");
			},
		} as unknown as IDBFactory;
		await withIndexedDb(deniedFactory, async () => {
			await expect(repository.getSessionHistory("ccdv-f")).rejects.toMatchObject({
				name: "ProgressStorageError",
				code: "access-denied",
			});
		});
	});

	it("serializes concurrent session creation and enforces one resumable session per certification", async () => {
		const results = await Promise.allSettled([
			repository.createSession(sessionInput("00000000-0000-4000-8000-000000000001")),
			repository.createSession(sessionInput("00000000-0000-4000-8000-000000000002")),
		]);
		const successful = results.find(
			(result): result is PromiseFulfilledResult<ProgressSession> => result.status === "fulfilled",
		);
		const rejected = results.find((result) => result.status === "rejected");

		expect(successful).toBeDefined();
		expect(rejected?.reason).toBeInstanceOf(ProgressConflictError);
		expect(await repository.getSessionHistory("ccdv-f")).toHaveLength(1);
		await expect(
			repository.createSession(sessionInput("00000000-0000-4000-8000-000000000003")),
		).rejects.toBeInstanceOf(ProgressConflictError);
		await expect(
			repository.createSession(sessionInput("00000000-0000-4000-8000-000000000004", "ccar-f")),
		).resolves.toMatchObject({ certificationId: "ccar-f", status: "in_progress" });
	});

	it("rejects stale checkpoints without overwriting the winner and accepts an identical retry", async () => {
		const created = await repository.createSession(
			sessionInput("00000000-0000-4000-8000-000000000001"),
		);
		const checkpoints = [
			{
				currentQuestionId: "question-stable-id",
				deadlineAt: null,
				selectedOptionIdsByQuestion: { "question-stable-id": ["option-a"] },
			},
			{
				currentQuestionId: "question-stable-id",
				deadlineAt: null,
				selectedOptionIdsByQuestion: { "question-stable-id": ["option-b"] },
			},
		];
		const results = await Promise.allSettled(
			checkpoints.map((checkpoint) =>
				repository.checkpointSession({
					sessionId: created.id,
					expectedRevision: 1,
					checkpoint,
					updatedAt: 200,
				}),
			),
		);
		const successful = results.find(
			(result): result is PromiseFulfilledResult<ProgressSession> => result.status === "fulfilled",
		);
		const rejected = results.find((result) => result.status === "rejected");

		expect(successful).toBeDefined();
		expect(rejected?.reason).toBeInstanceOf(ProgressConflictError);
		if (!successful) throw new Error("Expected exactly one checkpoint to commit.");
		expect(successful.value.revision).toBe(2);
		expect(
			await repository.checkpointSession({
				sessionId: created.id,
				expectedRevision: 1,
				checkpoint: successful.value.checkpoint,
				updatedAt: 999,
			}),
		).toEqual(successful.value);
	});

	it("records evaluations once with their projection, baseline, and certification-scoped history", async () => {
		const session = await repository.createSession(
			sessionInput("00000000-0000-4000-8000-000000000001"),
		);
		await repository.setLegacyBaseline("ccdv-f", "question-stable-id", {
			attempts: 4,
			correct: 2,
			lastWrong: true,
		});
		const evaluation = {
			sessionId: session.id,
			questionId: "question-stable-id",
			selectedOptionIds: ["option-a"],
			outcome: "correct" as const,
			scoreEarned: 1,
			scorePossible: 1,
			evaluatedAt: 200,
		};
		const first = await repository.recordEvaluation(evaluation);
		const retry = await repository.recordEvaluation({ ...evaluation, evaluatedAt: 201 });

		expect(retry).toEqual(first);
		expect(await repository.getQuestionProgress("ccdv-f", "question-stable-id")).toMatchObject({
			attemptCount: 1,
			correctCount: 1,
			legacyBaseline: { attempts: 4, correct: 2, lastWrong: true },
		});
		await expect(
			repository.recordEvaluation({ ...evaluation, selectedOptionIds: ["option-b"] }),
		).rejects.toBeInstanceOf(ProgressConflictError);

		await repository.finalizeSession(session.id, 1, "completed", 300);
		const history = await repository.getSessionHistory("ccdv-f");
		expect(history).toHaveLength(1);
		expect(history[0]).toMatchObject({
			session: { status: "completed", revision: 2 },
			attempts: [first],
		});
		expect(await repository.getSessionHistory("ccar-f")).toEqual([]);

		const rebuilt = await repository.rebuildQuestionProgress("ccdv-f");
		expect(rebuilt).toHaveLength(1);
		expect(rebuilt[0]).toMatchObject({
			attemptCount: 1,
			correctCount: 1,
			legacyBaseline: { attempts: 4, correct: 2, lastWrong: true },
		});
		expect(await repository.rebuildQuestionProgress("ccdv-f")).toEqual(rebuilt);
	});

	it("leaves committed data unchanged when a multi-store IndexedDB transaction aborts", async () => {
		const created = await repository.createSession(
			sessionInput("00000000-0000-4000-8000-000000000001"),
		);
		const database = await openDB<ProgressDatabaseSchema>(PROGRESS_DATABASE_NAME);
		const transaction = database.transaction(["sessions", "metadata"], "readwrite");
		const updatedSession = transaction.objectStore("sessions").put({ ...created, revision: 99 });
		void updatedSession.catch(() => undefined);
		const duplicateMetadata = transaction.objectStore("metadata").add({
			key: "schema-version",
			value: { version: 99 },
		});

		await expect(duplicateMetadata).rejects.toBeDefined();
		await expect(transaction.done).rejects.toBeDefined();
		expect(await database.get("sessions", created.id)).toMatchObject({ revision: 1 });
		database.close();
	});
});

async function withIndexedDb<T>(
	factory: IDBFactory | undefined,
	callback: () => Promise<T>,
): Promise<T> {
	const descriptor = Object.getOwnPropertyDescriptor(globalThis, "indexedDB");
	try {
		Object.defineProperty(globalThis, "indexedDB", {
			configurable: true,
			writable: true,
			value: factory,
		});
		return await callback();
	} finally {
		if (descriptor) {
			Object.defineProperty(globalThis, "indexedDB", descriptor);
		} else {
			delete (globalThis as { indexedDB?: IDBFactory }).indexedDB;
		}
	}
}
