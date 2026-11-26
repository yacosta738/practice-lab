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
import type {
	LegacyProgressBackup,
	LegacyProgressMigrationInput,
} from "../../src/lib/progress/model";

const CONTENT: ContentProvenance = {
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
	it("restores an exported snapshot atomically and rejects stale generation tokens", async () => {
		const sessionId = "00000000-0000-4000-8000-000000000001";
		const session = await repository.createSession(sessionInput(sessionId));
		const checkpoint = await repository.checkpointSession({
			sessionId,
			expectedRevision: session.revision,
			checkpoint: {
				currentQuestionId: "question-stable-id",
				deadlineAt: null,
				selectedOptionIdsByQuestion: { "question-stable-id": ["option-a"] },
				checkedQuestionIds: [],
				flaggedQuestionIds: [],
			},
			updatedAt: 150,
		});
		await repository.recordEvaluation({
			sessionId,
			questionId: "question-stable-id",
			selectedOptionIds: ["option-a"],
			outcome: "correct",
			scoreEarned: 1,
			scorePossible: 1,
			evaluatedAt: 200,
			expectedRevision: checkpoint.revision,
		});
		const snapshot = await repository.getCertificationProgressSnapshot("ccdv-f");
		const staleToken = await repository.getDataGenerationToken("ccdv-f");

		await repository.resetCertificationProgress("ccdv-f");
		const currentToken = await repository.getDataGenerationToken("ccdv-f");
		const restoredTokens = await repository.restoreCertificationProgress(
			[{ certificationId: "ccdv-f", ...snapshot }],
			{ "ccdv-f": currentToken },
		);
		expect(await repository.getCertificationProgressSnapshot("ccdv-f")).toEqual(snapshot);
		expect(restoredTokens["ccdv-f"]).not.toBe(currentToken);

		await repository.resetCertificationProgress("ccdv-f");
		await repository.createSession(sessionInput("00000000-0000-4000-8000-000000000002"));
		await expect(
			repository.restoreCertificationProgress([{ certificationId: "ccdv-f", ...snapshot }], {
				"ccdv-f": staleToken,
			}),
		).rejects.toThrow(/changed in another tab/i);
		expect(await repository.getSession(sessionId)).toBeUndefined();
		expect(await repository.getSession("00000000-0000-4000-8000-000000000002")).toBeDefined();
	});

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
			"by-started-at-id",
			"by-status",
		]);
		expect(Array.from(database.transaction("questionAttempts").store.indexNames).sort()).toEqual([
			"by-certification",
			"by-domain",
			"by-evaluated-at",
			"by-session",
		]);
		expect(await database.get("metadata", "schema-version")).toMatchObject({
			value: { version: PROGRESS_DATABASE_VERSION },
		});
		expect(await database.get("metadata", "migration:0-1")).toBeDefined();
		expect(await database.get("metadata", "migration:1-2")).toBeDefined();
		expect(await database.get("metadata", "data-generation-token")).toMatchObject({
			value: expect.stringMatching(/^[0-9a-f-]{36}$/i),
		});
		database.close();
	});

	it("upgrades version 1 history indexes without dropping its saved sessions", async () => {
		const legacy = await openDB<ProgressDatabaseSchema>(PROGRESS_DATABASE_NAME, 1, {
			upgrade(database) {
				const sessions = database.createObjectStore("sessions", { keyPath: "id" });
				sessions.createIndex("by-certification", "certificationId");
				sessions.createIndex("by-status", "status");
				sessions.createIndex("by-started-at", "startedAt");
				sessions.createIndex("by-finished-at", "finishedAt");
				const attempts = database.createObjectStore("questionAttempts", {
					keyPath: ["sessionId", "questionId"],
				});
				attempts.createIndex("by-certification", "certificationId");
				attempts.createIndex("by-domain", "domainId");
				attempts.createIndex("by-evaluated-at", "evaluatedAt");
				database.createObjectStore("metadata", { keyPath: "key" });
			},
		});
		const oldSession: ProgressSession = {
			...sessionInput("00000000-0000-4000-8000-000000000001", "ccdv-f", 100),
			status: "completed" as const,
			revision: 2,
			updatedAt: 150,
			finishedAt: 150,
			checkpoint: {
				currentQuestionId: null,
				deadlineAt: null,
				selectedOptionIdsByQuestion: {},
				checkedQuestionIds: [],
				flaggedQuestionIds: [],
			},
		};
		await legacy.put("sessions", oldSession);
		await legacy.put("metadata", {
			key: "schema-version",
			value: { version: 1 },
		});
		legacy.close();

		await expect(repository.getSessionById(oldSession.id)).resolves.toMatchObject({
			session: { id: oldSession.id, status: "completed" },
			attempts: [],
		});
		await repository.close();
		const upgraded = await openDB<ProgressDatabaseSchema>(PROGRESS_DATABASE_NAME);
		expect(upgraded.version).toBe(PROGRESS_DATABASE_VERSION);
		expect(upgraded.transaction("sessions").store.indexNames).toContain("by-started-at-id");
		expect(upgraded.transaction("questionAttempts").store.indexNames).toContain("by-session");
		expect(await upgraded.get("metadata", "migration:1-2")).toMatchObject({
			value: { fromVersion: 1, toVersion: 2 },
		});
		upgraded.close();
	});

	it("returns a newest-first, filtered history page and resolves an immutable review entry", async () => {
		const first = await repository.createSession(
			sessionInput("00000000-0000-4000-8000-000000000001", "ccdv-f", 100),
		);
		await expect(
			repository.createSession(sessionInput("00000000-0000-4000-8000-000000000001", "ccdv-f", 100)),
		).resolves.toMatchObject({ id: first.id, revision: first.revision });
		await repository.finalizeSession(first.id, first.revision, "completed", 150);
		const second = await repository.createSession(
			sessionInput("00000000-0000-4000-8000-000000000002", "ccdv-f", 200),
		);
		await repository.checkpointSession({
			sessionId: second.id,
			expectedRevision: second.revision,
			checkpoint: {
				...second.checkpoint,
				selectedOptionIdsByQuestion: { "question-stable-id": ["option-a"] },
			},
			updatedAt: 210,
		});
		await repository.recordEvaluation({
			sessionId: second.id,
			questionId: "question-stable-id",
			selectedOptionIds: ["option-a"],
			outcome: "correct",
			scoreEarned: 1,
			scorePossible: 1,
			evaluatedAt: 220,
		});
		const evaluatedSecond = await repository.getSession(second.id);
		if (!evaluatedSecond) throw new Error("Expected the evaluated session to remain available.");
		await repository.finalizeSession(second.id, evaluatedSecond.revision, "completed", 250);
		const third = await repository.createSession(
			sessionInput("00000000-0000-4000-8000-000000000003", "ccdv-f", 300),
		);

		const page = await repository.getSessionHistoryPage({ page: 1, pageSize: 2 });
		expect(page.total).toBe(3);
		expect(page.entries.map(({ session }) => session.id)).toEqual([third.id, second.id]);
		const completed = await repository.getSessionHistoryPage({
			certificationId: "ccdv-f",
			status: "completed",
			from: 150,
			page: 1,
			pageSize: 10,
		});
		expect(completed.total).toBe(1);
		expect(completed.entries[0]?.session.id).toBe(second.id);
		await expect(repository.getSessionById(second.id)).resolves.toMatchObject({
			session: { id: second.id },
			attempts: [{ questionId: "question-stable-id" }],
		});
		expect(await repository.getQuestionProgressForCertification("ccdv-f")).toHaveLength(1);
	});

	it("closes its connection when a newer schema version requests an upgrade", async () => {
		await repository.createSession(sessionInput("00000000-0000-4000-8000-000000000001"));
		const upgraded = await openDB<ProgressDatabaseSchema>(PROGRESS_DATABASE_NAME, 3, {
			upgrade() {},
		});

		expect(upgraded.version).toBe(3);
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

	it("replaces an active session atomically while retaining its abandoned history", async () => {
		const previous = await repository.createSession(
			sessionInput("00000000-0000-4000-8000-000000000001"),
		);
		const replacement = await repository.replaceSession(
			sessionInput("00000000-0000-4000-8000-000000000002", "ccdv-f", 200),
			previous.id,
			previous.revision,
		);

		expect(replacement.status).toBe("in_progress");
		expect(await repository.getSession(previous.id)).toMatchObject({
			status: "abandoned",
			finishedAt: 200,
		});
		expect(await repository.getSessionHistory("ccdv-f")).toHaveLength(2);
	});

	it("imports legacy baselines, a raw backup, and a session once in a single migration", async () => {
		const migration: LegacyProgressMigrationInput = {
			certificationId: "ccdv-f",
			legacyStorageKey: "ccdv-f-practice-lab-v2",
			rawValue: '{"stats":{"removed-question":{"attempts":2,"correct":1,"lastWrong":true}}}',
			migratedAt: 300,
			baselines: [
				{
					questionId: "removed-question",
					baseline: { attempts: 2, correct: 1, lastWrong: true },
				},
			],
			session: {
				input: {
					id: "00000000-0000-4000-8000-000000000001",
					certificationId: "ccdv-f",
					mode: "exam",
					startedAt: 100,
					scoring: SCORING,
					content: CONTENT,
					checkpoint: {
						currentQuestionId: "question-stable-id",
						deadlineAt: 1_000,
						selectedOptionIdsByQuestion: { "question-stable-id": ["option-a"] },
						checkedQuestionIds: [],
						flaggedQuestionIds: ["question-stable-id"],
					},
					legacy: {
						sourceStorageKey: "ccdv-f-practice-lab-v2",
						version: 2,
						limitations: ["The original wording was not captured."],
						evaluatedQuestionIds: [],
					},
				},
			},
			warnings: ["Some historical data was not recoverable."],
		};

		const [first, retried] = await Promise.all([
			repository.migrateLegacyData(migration),
			repository.migrateLegacyData({ ...migration, migratedAt: 999 }),
		]);

		expect(retried).toEqual(first);
		expect(await repository.getQuestionProgress("ccdv-f", "removed-question")).toMatchObject({
			legacyBaseline: { attempts: 2, correct: 1, lastWrong: true },
		});
		expect(await repository.getMetadata("legacy-backup:ccdv-f")).toMatchObject({
			format: "practice-lab-progress-backup",
			version: 1,
			rawValue: migration.rawValue,
		});
		expect(await repository.getMetadata("migration:legacy-v2:ccdv-f")).toEqual(first);
		expect(await repository.getSessionHistory("ccdv-f")).toHaveLength(1);
	});

	it("archives old-tab writes without merging them into the migrated baseline", async () => {
		const migration: LegacyProgressMigrationInput = {
			certificationId: "ccdv-f",
			legacyStorageKey: "ccdv-f-practice-lab-v2",
			rawValue: "original legacy value",
			migratedAt: 300,
			baselines: [
				{
					questionId: "removed-question",
					baseline: { attempts: 2, correct: 1, lastWrong: true },
				},
			],
			warnings: [],
		};
		const original = await repository.migrateLegacyData(migration);
		const backup: LegacyProgressBackup = {
			format: "practice-lab-progress-backup",
			version: 1,
			certificationId: "ccdv-f",
			legacyStorageKey: "ccdv-f-practice-lab-v2",
			capturedAt: 500,
			rawValue: "updated by an old application tab",
			warnings: ["Archived old-tab progress without importing or merging it."],
		};

		const reconciled = await repository.reconcileLegacyWrite(
			"ccdv-f",
			backup,
			original.generationToken,
		);

		expect(reconciled.generationToken).not.toBe(original.generationToken);
		expect(reconciled.warnings).toContain(backup.warnings[0]);
		expect(await repository.getMetadata("legacy-backup:ccdv-f")).toMatchObject(backup);
		expect(await repository.getQuestionProgress("ccdv-f", "removed-question")).toMatchObject({
			legacyBaseline: { attempts: 2, correct: 1, lastWrong: true },
		});
	});

	it("aborts an invalid legacy import without leaving its marker or backup", async () => {
		const migration: LegacyProgressMigrationInput = {
			certificationId: "ccdv-f",
			legacyStorageKey: "ccdv-f-practice-lab-v2",
			rawValue: "legacy",
			migratedAt: 300,
			baselines: [
				{
					questionId: "question-stable-id",
					baseline: { attempts: 1, correct: 2, lastWrong: false },
				},
			],
			warnings: [],
		};

		await expect(repository.migrateLegacyData(migration)).rejects.toBeInstanceOf(Error);
		expect(await repository.getMetadata("legacy-backup:ccdv-f")).toBeUndefined();
		expect(await repository.getMetadata("migration:legacy-v2:ccdv-f")).toBeUndefined();
	});

	it("invalidates stale generation tokens when resetting only one certification", async () => {
		const token = await repository.getDataGenerationToken("ccdv-f");
		const session = await repository.createSession({
			...sessionInput("00000000-0000-4000-8000-000000000001"),
			expectedGenerationToken: token,
		});
		await repository.createSession(sessionInput("00000000-0000-4000-8000-000000000002", "ccar-f"));

		await repository.resetCertificationProgress("ccdv-f");
		await expect(
			repository.createSession({
				...sessionInput("00000000-0000-4000-8000-000000000003"),
				expectedGenerationToken: token,
			}),
		).rejects.toBeInstanceOf(ProgressConflictError);
		expect(await repository.getSession(session.id)).toBeUndefined();
		expect(await repository.getSessionHistory("ccdv-f")).toEqual([]);
		expect(await repository.getSessionHistory("ccar-f")).toHaveLength(1);
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
				checkedQuestionIds: [],
				flaggedQuestionIds: [],
			},
			{
				currentQuestionId: "question-stable-id",
				deadlineAt: null,
				selectedOptionIdsByQuestion: { "question-stable-id": ["option-b"] },
				checkedQuestionIds: [],
				flaggedQuestionIds: [],
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
		const checkpointed = await repository.checkpointSession({
			sessionId: session.id,
			expectedRevision: session.revision,
			checkpoint: {
				currentQuestionId: "question-stable-id",
				deadlineAt: null,
				selectedOptionIdsByQuestion: { "question-stable-id": ["option-a"] },
				checkedQuestionIds: [],
				flaggedQuestionIds: [],
			},
			updatedAt: 150,
		});
		const evaluation = {
			sessionId: session.id,
			questionId: "question-stable-id",
			selectedOptionIds: ["option-a"],
			outcome: "correct" as const,
			scoreEarned: 1,
			scorePossible: 1,
			evaluatedAt: 200,
			expectedRevision: checkpointed.revision,
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

		const evaluatedSession = await repository.getSession(session.id);
		if (!evaluatedSession) throw new Error("Expected the evaluated session to remain available.");
		await repository.finalizeSession(session.id, evaluatedSession.revision, "completed", 300);
		const history = await repository.getSessionHistory("ccdv-f");
		expect(history).toHaveLength(1);
		expect(history[0]).toMatchObject({
			session: {
				status: "completed",
				revision: 4,
				checkpoint: { checkedQuestionIds: ["question-stable-id"] },
			},
			attempts: [first],
		});
		expect(await repository.getSessionHistory("ccar-f")).toEqual([]);
		const exportSnapshot = await repository.getCertificationProgressSnapshot("ccdv-f");
		expect(exportSnapshot.sessionHistory).toEqual(history);
		expect(exportSnapshot.questionProgress).toMatchObject([
			{
				questionId: "question-stable-id",
				attemptCount: 1,
				correctCount: 1,
				legacyBaseline: { attempts: 4, correct: 2, lastWrong: true },
			},
		]);

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
