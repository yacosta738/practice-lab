import type { IDBPTransaction } from "idb";
import { openProgressDatabase, type ProgressDatabase } from "./database";
import { ProgressConflictError, ProgressError, toProgressStorageError } from "./errors";
import {
	applyAttemptToProgress,
	checkpointSession as applySessionCheckpoint,
	finalizeSession as applySessionFinalization,
	baselinesEqual,
	type CheckpointSessionInput,
	type CreateSessionInput,
	createInitialSession,
	createQuestionAttempt,
	evaluationMatches,
	type FinalSessionStatus,
	type ProgressSession,
	projectQuestionAttempts,
	type QuestionAttempt,
	type QuestionProgress,
	type QuestionProgressBaseline,
	type RecordEvaluationInput,
	type SessionHistoryEntry,
	validateLegacyBaseline,
} from "./model";
import type { ProgressRepository } from "./repository-port";
import type { ProgressDatabaseSchema, ProgressStoreName } from "./schema";

type StoreNames = ProgressStoreName[];

export function createProgressRepository(): ProgressRepository {
	return new IndexedDbProgressRepository();
}

class IndexedDbProgressRepository implements ProgressRepository {
	private databasePromise?: Promise<ProgressDatabase>;

	createSession(input: CreateSessionInput): Promise<ProgressSession> {
		return withTransaction(this.getDatabase, ["sessions"], "readwrite", async (transaction) => {
			const store = transaction.objectStore("sessions");
			const existing = await store.get(input.id);
			if (existing) {
				if (sameSessionIdentity(existing, input)) return existing;
				throw new ProgressConflictError(
					"This session ID already belongs to different session data.",
				);
			}

			const certificationSessions = await store
				.index("by-certification")
				.getAll(input.certificationId);
			if (certificationSessions.some((session) => session.status === "in_progress")) {
				throw new ProgressConflictError(
					`Certification ${input.certificationId} already has a resumable session.`,
				);
			}

			const session = createInitialSession(input);
			await store.add(session);
			return session;
		});
	}

	checkpointSession(input: CheckpointSessionInput): Promise<ProgressSession> {
		return withTransaction(this.getDatabase, ["sessions"], "readwrite", async (transaction) => {
			const store = transaction.objectStore("sessions");
			const session = await store.get(input.sessionId);
			if (!session) throw new ProgressConflictError("The session no longer exists.");

			const updated = applySessionCheckpoint(
				session,
				input.expectedRevision,
				input.checkpoint,
				input.updatedAt,
			);
			if (updated !== session) await store.put(updated);
			return updated;
		});
	}

	recordEvaluation(input: RecordEvaluationInput): Promise<QuestionAttempt> {
		return withTransaction(
			this.getDatabase,
			["sessions", "questionAttempts", "questionProgress"],
			"readwrite",
			async (transaction) => {
				const session = await transaction.objectStore("sessions").get(input.sessionId);
				if (!session) throw new ProgressConflictError("The session no longer exists.");

				const attempt = createQuestionAttempt(session, input);
				const attempts = transaction.objectStore("questionAttempts");
				const existing = await attempts.get([input.sessionId, input.questionId]);
				if (existing) {
					if (evaluationMatches(existing, attempt)) return existing;
					throw new ProgressConflictError(
						"A different evaluation was already recorded for this question.",
					);
				}
				if (session.status !== "in_progress") {
					throw new ProgressConflictError("Evaluations cannot be added to a finalized session.");
				}

				await attempts.add(attempt);
				const progressStore = transaction.objectStore("questionProgress");
				const key: [string, string] = [attempt.certificationId, attempt.questionId];
				const current = await progressStore.get(key);
				await progressStore.put(applyAttemptToProgress(current, attempt));
				return attempt;
			},
		);
	}

	finalizeSession(
		sessionId: string,
		expectedRevision: number,
		status: FinalSessionStatus,
		finishedAt: number,
	): Promise<ProgressSession> {
		return withTransaction(this.getDatabase, ["sessions"], "readwrite", async (transaction) => {
			const store = transaction.objectStore("sessions");
			const session = await store.get(sessionId);
			if (!session) throw new ProgressConflictError("The session no longer exists.");

			const finalized = applySessionFinalization(session, expectedRevision, status, finishedAt);
			if (finalized !== session) await store.put(finalized);
			return finalized;
		});
	}

	getSessionHistory(certificationId: string): Promise<SessionHistoryEntry[]> {
		return withTransaction(
			this.getDatabase,
			["sessions", "questionAttempts"],
			"readonly",
			async (transaction) => {
				const [sessions, attempts] = await Promise.all([
					transaction.objectStore("sessions").index("by-certification").getAll(certificationId),
					transaction
						.objectStore("questionAttempts")
						.index("by-certification")
						.getAll(certificationId),
				]);
				const attemptsBySession = new Map<string, QuestionAttempt[]>();
				for (const attempt of attempts) {
					const group = attemptsBySession.get(attempt.sessionId) ?? [];
					group.push(attempt);
					attemptsBySession.set(attempt.sessionId, group);
				}

				return sessions
					.sort((a, b) => b.startedAt - a.startedAt || a.id.localeCompare(b.id))
					.map((session) => ({
						session,
						attempts: (attemptsBySession.get(session.id) ?? []).sort(
							(a, b) => a.evaluatedAt - b.evaluatedAt || a.questionId.localeCompare(b.questionId),
						),
					}));
			},
		);
	}

	getQuestionProgress(
		certificationId: string,
		questionId: string,
	): Promise<QuestionProgress | undefined> {
		return withTransaction(this.getDatabase, ["questionProgress"], "readonly", (transaction) =>
			transaction.objectStore("questionProgress").get([certificationId, questionId]),
		);
	}

	setLegacyBaseline(
		certificationId: string,
		questionId: string,
		baseline: QuestionProgressBaseline,
	): Promise<QuestionProgress> {
		validateLegacyBaseline(certificationId, questionId, baseline);
		return withTransaction(
			this.getDatabase,
			["questionProgress"],
			"readwrite",
			async (transaction) => {
				const store = transaction.objectStore("questionProgress");
				const key: [string, string] = [certificationId, questionId];
				const current = await store.get(key);
				if (current?.legacyBaseline) {
					if (baselinesEqual(current.legacyBaseline, baseline)) return current;
					throw new ProgressConflictError("A different legacy baseline is already recorded.");
				}

				const updated: QuestionProgress = {
					certificationId,
					questionId,
					attemptCount: current?.attemptCount ?? 0,
					correctCount: current?.correctCount ?? 0,
					...(current?.lastOutcome === undefined ? {} : { lastOutcome: current.lastOutcome }),
					...(current?.lastEvaluatedAt === undefined
						? {}
						: { lastEvaluatedAt: current.lastEvaluatedAt }),
					...(current?.lastAttemptSessionId === undefined
						? {}
						: { lastAttemptSessionId: current.lastAttemptSessionId }),
					legacyBaseline: { ...baseline },
				};
				await store.put(updated);
				return updated;
			},
		);
	}

	rebuildQuestionProgress(certificationId: string): Promise<QuestionProgress[]> {
		return withTransaction(
			this.getDatabase,
			["questionAttempts", "questionProgress"],
			"readwrite",
			async (transaction) => {
				const attempts = await transaction
					.objectStore("questionAttempts")
					.index("by-certification")
					.getAll(certificationId);
				const progressStore = transaction.objectStore("questionProgress");
				const existing = await progressStore.index("by-certification").getAll(certificationId);
				const rebuilt = projectQuestionAttempts(attempts, existing);

				await Promise.all(
					existing.map(({ certificationId: id, questionId }) =>
						progressStore.delete([id, questionId]),
					),
				);
				await Promise.all(rebuilt.map((progress) => progressStore.put(progress)));
				return rebuilt;
			},
		);
	}

	async close(): Promise<void> {
		const pending = this.databasePromise;
		this.databasePromise = undefined;
		if (pending)
			await pending.then(
				(database) => database.close(),
				() => undefined,
			);
	}

	private getDatabase = (): Promise<ProgressDatabase> => {
		if (!this.databasePromise) {
			let pending!: Promise<ProgressDatabase>;
			pending = openProgressDatabase(() => {
				if (this.databasePromise === pending) this.databasePromise = undefined;
			});
			this.databasePromise = pending;
			void pending.catch(() => {
				if (this.databasePromise === pending) this.databasePromise = undefined;
			});
		}
		return this.databasePromise;
	};
}

async function withTransaction<Result, Stores extends StoreNames, Mode extends IDBTransactionMode>(
	getDatabase: () => Promise<ProgressDatabase>,
	storeNames: Stores,
	mode: Mode,
	action: (
		transaction: IDBPTransaction<ProgressDatabaseSchema, Stores, Mode>,
	) => Promise<Result> | Result,
): Promise<Result> {
	const database = await getDatabase();
	let transaction: IDBPTransaction<ProgressDatabaseSchema, Stores, Mode> | undefined;
	try {
		const activeTransaction = database.transaction(storeNames, mode);
		transaction = activeTransaction;
		const result = await action(activeTransaction);
		await activeTransaction.done;
		return result;
	} catch (error) {
		if (transaction) {
			try {
				transaction.abort();
			} catch {
				// The transaction may already have committed or aborted.
			}
			try {
				await transaction.done;
			} catch {
				// Preserve the original transaction error.
			}
		}
		if (error instanceof ProgressError) throw error;
		throw toProgressStorageError(error, `${mode} transaction`);
	}
}

function sameSessionIdentity(session: ProgressSession, input: CreateSessionInput): boolean {
	return (
		session.id === input.id &&
		session.certificationId === input.certificationId &&
		session.mode === input.mode &&
		stableStringify(session.scoring) === stableStringify(input.scoring) &&
		stableStringify(session.content) === stableStringify(input.content)
	);
}

function stableStringify(value: unknown): string {
	if (Array.isArray(value)) return `[${value.map(stableStringify).join(",")}]`;
	if (value !== null && typeof value === "object") {
		return `{${Object.entries(value)
			.sort(([a], [b]) => a.localeCompare(b))
			.map(([key, item]) => `${JSON.stringify(key)}:${stableStringify(item)}`)
			.join(",")}}`;
	}
	return JSON.stringify(value);
}
