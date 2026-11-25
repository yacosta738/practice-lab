import type { IDBPTransaction } from "idb";
import { openProgressDatabase, type ProgressDatabase } from "./database";
import { ProgressConflictError, ProgressError, toProgressStorageError } from "./errors";
import {
	applyAttemptToProgress,
	checkpointSession as applySessionCheckpoint,
	finalizeSession as applySessionFinalization,
	baselinesEqual,
	type CertificationProgressRestoreSnapshot,
	type CertificationProgressSnapshot,
	type CheckpointSessionInput,
	type CreateSessionInput,
	createInitialSession,
	createQuestionAttempt,
	evaluationMatches,
	type FinalSessionStatus,
	type LegacyProgressBackup,
	type LegacyProgressMigrationInput,
	type LegacyProgressMigrationResult,
	type LegacyRecordsBackup,
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
		return withTransaction(
			this.getDatabase,
			["sessions", "metadata"],
			"readwrite",
			async (transaction) => {
				await assertGeneration(transaction, input.certificationId, input.expectedGenerationToken);
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
			},
		);
	}

	replaceSession(
		input: CreateSessionInput,
		previousSessionId: string,
		previousExpectedRevision: number,
	): Promise<ProgressSession> {
		return withTransaction(
			this.getDatabase,
			["sessions", "metadata"],
			"readwrite",
			async (transaction) => {
				await assertGeneration(transaction, input.certificationId, input.expectedGenerationToken);
				const store = transaction.objectStore("sessions");
				const previous = await store.get(previousSessionId);
				if (!previous) throw new ProgressConflictError("The session to replace no longer exists.");
				const abandoned = applySessionFinalization(
					previous,
					previousExpectedRevision,
					"abandoned",
					input.startedAt,
				);
				if (input.certificationId !== previous.certificationId || input.id === previousSessionId) {
					throw new ProgressConflictError("A replacement must remain within its certification.");
				}
				await store.put(abandoned);
				return createSessionInTransaction(transaction, input);
			},
		);
	}

	checkpointSession(input: CheckpointSessionInput): Promise<ProgressSession> {
		return withTransaction(
			this.getDatabase,
			["sessions", "metadata"],
			"readwrite",
			async (transaction) => {
				const store = transaction.objectStore("sessions");
				const session = await store.get(input.sessionId);
				if (!session) throw new ProgressConflictError("The session no longer exists.");
				await assertGeneration(transaction, session.certificationId, input.expectedGenerationToken);

				const updated = applySessionCheckpoint(
					session,
					input.expectedRevision,
					input.checkpoint,
					input.updatedAt,
				);
				if (updated !== session) await store.put(updated);
				return updated;
			},
		);
	}

	recordEvaluation(input: RecordEvaluationInput): Promise<QuestionAttempt> {
		return withTransaction(
			this.getDatabase,
			["sessions", "questionAttempts", "questionProgress", "metadata"],
			"readwrite",
			async (transaction) => {
				const session = await transaction.objectStore("sessions").get(input.sessionId);
				if (!session) throw new ProgressConflictError("The session no longer exists.");
				await assertGeneration(transaction, session.certificationId, input.expectedGenerationToken);

				const attempt = createQuestionAttempt(session, input);
				const attempts = transaction.objectStore("questionAttempts");
				const existing = await attempts.get([input.sessionId, input.questionId]);
				if (existing) {
					if (evaluationMatches(existing, attempt)) return existing;
					throw new ProgressConflictError(
						"A different evaluation was already recorded for this question.",
					);
				}
				if (input.expectedRevision !== undefined && session.revision !== input.expectedRevision) {
					throw new ProgressConflictError(
						"The session changed before this evaluation could be recorded.",
					);
				}
				if (session.status !== "in_progress") {
					throw new ProgressConflictError("Evaluations cannot be added to a finalized session.");
				}
				if (session.checkpoint.checkedQuestionIds.includes(input.questionId)) {
					throw new ProgressConflictError(
						"This question has already been evaluated in this session.",
					);
				}
				const savedOptionIds =
					session.checkpoint.selectedOptionIdsByQuestion[input.questionId] ?? [];
				if (!stringSequencesEqual(savedOptionIds, input.selectedOptionIds)) {
					throw new ProgressConflictError(
						"The evaluated answer does not match the saved checkpoint.",
					);
				}

				await attempts.add(attempt);
				const checkedQuestionIds = Array.from(
					new Set([...session.checkpoint.checkedQuestionIds, input.questionId]),
				);
				await transaction.objectStore("sessions").put({
					...session,
					revision: session.revision + 1,
					updatedAt: input.evaluatedAt,
					checkpoint: { ...session.checkpoint, checkedQuestionIds },
				});
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
		expectedGenerationToken?: string,
		evaluations: readonly RecordEvaluationInput[] = [],
	): Promise<ProgressSession> {
		return withTransaction(
			this.getDatabase,
			["sessions", "questionAttempts", "questionProgress", "metadata"],
			"readwrite",
			async (transaction) => {
				const sessions = transaction.objectStore("sessions");
				const session = await sessions.get(sessionId);
				if (!session) throw new ProgressConflictError("The session no longer exists.");
				await assertGeneration(transaction, session.certificationId, expectedGenerationToken);
				const finalized = applySessionFinalization(session, expectedRevision, status, finishedAt);
				const wasAlreadyFinalized = session.status !== "in_progress";
				const attemptStore = transaction.objectStore("questionAttempts");
				const progressStore = transaction.objectStore("questionProgress");
				const evaluatedIds = new Set<string>();
				const checkedQuestionIds = new Set(session.checkpoint.checkedQuestionIds);
				const selectedOptionIdsByQuestion = { ...session.checkpoint.selectedOptionIdsByQuestion };

				for (const evaluation of evaluations) {
					if (evaluation.sessionId !== sessionId || evaluatedIds.has(evaluation.questionId)) {
						throw new ProgressConflictError(
							"Finalization evaluations must be unique to this session.",
						);
					}
					evaluatedIds.add(evaluation.questionId);
					const attempt = createQuestionAttempt(session, evaluation);
					const existing = await attemptStore.get([sessionId, evaluation.questionId]);
					if (existing) {
						if (!evaluationMatches(existing, attempt)) {
							throw new ProgressConflictError(
								"A different evaluation was already recorded for this question.",
							);
						}
					} else {
						if (wasAlreadyFinalized) {
							throw new ProgressConflictError(
								"A finalized session is missing an evaluation record.",
							);
						}
						await attemptStore.add(attempt);
						const key: [string, string] = [attempt.certificationId, attempt.questionId];
						const current = await progressStore.get(key);
						await progressStore.put(applyAttemptToProgress(current, attempt));
					}
					checkedQuestionIds.add(evaluation.questionId);
					selectedOptionIdsByQuestion[evaluation.questionId] = [...evaluation.selectedOptionIds];
				}

				const updated = {
					...finalized,
					checkpoint: {
						...finalized.checkpoint,
						checkedQuestionIds: [...checkedQuestionIds],
						selectedOptionIdsByQuestion,
					},
				};
				if (updated !== session) await sessions.put(updated);
				return updated;
			},
		);
	}

	migrateLegacyData(input: LegacyProgressMigrationInput): Promise<LegacyProgressMigrationResult> {
		return withTransaction(
			this.getDatabase,
			["sessions", "questionAttempts", "questionProgress", "metadata"],
			"readwrite",
			async (transaction) => {
				const metadata = transaction.objectStore("metadata");
				const markerKey = `migration:legacy-v2:${input.certificationId}`;
				const existingMarker = await metadata.get(markerKey);
				if (existingMarker) {
					if (isLegacyMigrationResult(existingMarker.value)) return existingMarker.value;
					throw new ProgressConflictError(
						"The legacy migration marker is invalid; recover from the backup.",
					);
				}

				const generationToken = globalThis.crypto.randomUUID();
				if (input.rawValue !== null) {
					const backup: LegacyProgressBackup = {
						format: "practice-lab-progress-backup",
						version: 1,
						certificationId: input.certificationId,
						legacyStorageKey: input.legacyStorageKey,
						capturedAt: input.migratedAt,
						rawValue: input.rawValue,
						warnings: [...input.warnings],
					};
					await metadata.put({ key: `legacy-backup:${input.certificationId}`, value: backup });
				}

				const progressStore = transaction.objectStore("questionProgress");
				for (const { questionId, baseline } of input.baselines) {
					validateLegacyBaseline(input.certificationId, questionId, baseline);
					const key: [string, string] = [input.certificationId, questionId];
					const current = await progressStore.get(key);
					if (current?.legacyBaseline && !baselinesEqual(current.legacyBaseline, baseline)) {
						throw new ProgressConflictError("A different legacy baseline is already recorded.");
					}
					await progressStore.put({
						certificationId: input.certificationId,
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
					});
				}

				let importedSessionId: string | null = null;
				if (input.session) {
					const { input: sessionInput, status, finishedAt, evaluations = [] } = input.session;
					const session = createInitialSession(sessionInput);
					importedSessionId = session.id;
					const sessions = transaction.objectStore("sessions");
					if (await sessions.get(session.id)) {
						throw new ProgressConflictError("A migrated session ID already exists.");
					}
					const certificationSessions = await sessions
						.index("by-certification")
						.getAll(input.certificationId);
					if (!status && certificationSessions.some((item) => item.status === "in_progress")) {
						throw new ProgressConflictError(
							`Certification ${input.certificationId} already has a resumable session.`,
						);
					}

					let imported = session;
					const attemptStore = transaction.objectStore("questionAttempts");
					const checkedQuestionIds = new Set(session.checkpoint.checkedQuestionIds);
					const selectedOptionIdsByQuestion = {
						...session.checkpoint.selectedOptionIdsByQuestion,
					};
					for (const evaluation of evaluations) {
						if (
							evaluation.sessionId !== session.id ||
							checkedQuestionIds.has(evaluation.questionId)
						) {
							throw new ProgressConflictError(
								"Imported evaluations must be unique to the session.",
							);
						}
						const attempt = createQuestionAttempt(imported, evaluation);
						await attemptStore.add(attempt);
						const key: [string, string] = [attempt.certificationId, attempt.questionId];
						const current = await progressStore.get(key);
						await progressStore.put(applyAttemptToProgress(current, attempt));
						checkedQuestionIds.add(evaluation.questionId);
						selectedOptionIdsByQuestion[evaluation.questionId] = [...evaluation.selectedOptionIds];
					}
					imported = {
						...imported,
						checkpoint: {
							...imported.checkpoint,
							checkedQuestionIds: [...checkedQuestionIds],
							selectedOptionIdsByQuestion,
						},
					};
					if (status) {
						if (finishedAt === undefined) {
							throw new ProgressConflictError(
								"A finalized legacy session needs its original finish time.",
							);
						}
						imported = applySessionFinalization(imported, imported.revision, status, finishedAt);
					}
					await sessions.add(imported);
				}

				const result: LegacyProgressMigrationResult = {
					certificationId: input.certificationId,
					legacyStorageKey: input.legacyStorageKey,
					importedAt: input.migratedAt,
					importedQuestionCount: input.baselines.length,
					importedSessionId,
					warnings: [...input.warnings],
					generationToken,
				};
				await metadata.put({ key: markerKey, value: result });
				await metadata.put({
					key: `data-generation-token:${input.certificationId}`,
					value: generationToken,
				});
				return result;
			},
		);
	}

	reconcileLegacyWrite(
		certificationId: string,
		backup: LegacyProgressBackup,
		expectedGenerationToken: string,
	): Promise<LegacyProgressMigrationResult> {
		return withTransaction(this.getDatabase, ["metadata"], "readwrite", async (transaction) => {
			const metadata = transaction.objectStore("metadata");
			const markerKey = `migration:legacy-v2:${certificationId}`;
			const markerRecord = await metadata.get(markerKey);
			if (!markerRecord || !isLegacyMigrationResult(markerRecord.value)) {
				throw new ProgressConflictError(
					"Legacy reconciliation requires a completed migration marker.",
				);
			}
			if (
				backup.certificationId !== certificationId ||
				backup.legacyStorageKey !== `${certificationId}-practice-lab-v2`
			) {
				throw new ProgressConflictError("The legacy backup does not match this certification.");
			}
			const tokenKey = `data-generation-token:${certificationId}`;
			const tokenRecord = await metadata.get(tokenKey);
			if (tokenRecord?.value !== expectedGenerationToken) {
				throw new ProgressConflictError(
					"Progress changed during legacy reconciliation. Reload and retry.",
				);
			}
			const backupKey = `legacy-backup:${certificationId}`;
			const previousBackup = await metadata.get(backupKey);
			if (previousBackup) {
				await metadata.add({
					key: `legacy-backup:archive:${globalThis.crypto.randomUUID()}`,
					value: previousBackup.value,
				});
			}
			const generationToken = globalThis.crypto.randomUUID();
			const result: LegacyProgressMigrationResult = {
				...markerRecord.value,
				warnings: [...markerRecord.value.warnings, ...backup.warnings],
				generationToken,
			};
			await metadata.put({ key: backupKey, value: backup });
			await metadata.put({ key: markerKey, value: result });
			await metadata.put({ key: tokenKey, value: generationToken });
			return result;
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
				return buildSessionHistory(sessions, attempts);
			},
		);
	}

	getCertificationProgressSnapshot(
		certificationId: string,
	): Promise<CertificationProgressSnapshot> {
		return withTransaction(
			this.getDatabase,
			["sessions", "questionAttempts", "questionProgress"],
			"readonly",
			async (transaction) => {
				const [sessions, attempts, questionProgress] = await Promise.all([
					transaction.objectStore("sessions").index("by-certification").getAll(certificationId),
					transaction
						.objectStore("questionAttempts")
						.index("by-certification")
						.getAll(certificationId),
					transaction
						.objectStore("questionProgress")
						.index("by-certification")
						.getAll(certificationId),
				]);
				return {
					sessionHistory: buildSessionHistory(sessions, attempts),
					questionProgress,
				};
			},
		);
	}

	restoreCertificationProgress(
		snapshots: readonly CertificationProgressRestoreSnapshot[],
		expectedGenerationTokens: Readonly<Record<string, string>>,
	): Promise<Record<string, string>> {
		if (snapshots.length === 0) {
			return Promise.reject(
				new ProgressConflictError("The progress backup contains no snapshots."),
			);
		}
		return withTransaction(
			this.getDatabase,
			["sessions", "questionAttempts", "questionProgress", "metadata"],
			"readwrite",
			async (transaction) => {
				const certificationIds = new Set<string>();
				const incomingSessionIds = new Set<string>();
				const sessionStore = transaction.objectStore("sessions");
				for (const snapshot of snapshots) {
					if (!snapshot.certificationId || certificationIds.has(snapshot.certificationId)) {
						throw new ProgressConflictError(
							"The progress backup contains duplicate certification snapshots.",
						);
					}
					certificationIds.add(snapshot.certificationId);
					const expectedToken = expectedGenerationTokens[snapshot.certificationId];
					if (typeof expectedToken !== "string") {
						throw new ProgressConflictError(
							`The current ${snapshot.certificationId} progress could not be verified before restore.`,
						);
					}
					await assertGeneration(transaction, snapshot.certificationId, expectedToken);
					for (const { session } of snapshot.sessionHistory) {
						if (
							session.certificationId !== snapshot.certificationId ||
							incomingSessionIds.has(session.id)
						) {
							throw new ProgressConflictError(
								"The imported session identities are invalid or duplicated.",
							);
						}
						incomingSessionIds.add(session.id);
						const existing = await sessionStore.get(session.id);
						if (existing && existing.certificationId !== snapshot.certificationId) {
							throw new ProgressConflictError(
								`Session ${session.id} already belongs to a different certification.`,
							);
						}
					}
				}

				for (const snapshot of snapshots) {
					for (const storeName of ["sessions", "questionAttempts", "questionProgress"] as const) {
						const index = transaction.objectStore(storeName).index("by-certification");
						let cursor = await index.openCursor(snapshot.certificationId);
						while (cursor) {
							await cursor.delete();
							cursor = await cursor.continue();
						}
					}
				}

				for (const snapshot of snapshots) {
					for (const { session, attempts } of snapshot.sessionHistory) {
						await sessionStore.add(session);
						for (const attempt of attempts) {
							await transaction.objectStore("questionAttempts").add(attempt);
						}
					}
					for (const progress of snapshot.questionProgress) {
						await transaction.objectStore("questionProgress").put(progress);
					}
				}

				const restoredTokens: Record<string, string> = {};
				const metadata = transaction.objectStore("metadata");
				for (const certificationId of certificationIds) {
					const generationToken = globalThis.crypto.randomUUID();
					restoredTokens[certificationId] = generationToken;
					await metadata.put({
						key: `data-generation-token:${certificationId}`,
						value: generationToken,
					});
				}
				return restoredTokens;
			},
		);
	}

	getSession(sessionId: string): Promise<ProgressSession | undefined> {
		return withTransaction(this.getDatabase, ["sessions"], "readonly", (transaction) =>
			transaction.objectStore("sessions").get(sessionId),
		);
	}

	getQuestionProgressForCertification(certificationId: string): Promise<QuestionProgress[]> {
		return withTransaction(this.getDatabase, ["questionProgress"], "readonly", (transaction) =>
			transaction.objectStore("questionProgress").index("by-certification").getAll(certificationId),
		);
	}

	getMetadata(key: string): Promise<unknown> {
		return withTransaction(this.getDatabase, ["metadata"], "readonly", async (transaction) => {
			const record = await transaction.objectStore("metadata").get(key);
			return record?.value;
		});
	}

	getDataGenerationToken(certificationId: string): Promise<string> {
		return withTransaction(this.getDatabase, ["metadata"], "readwrite", async (transaction) => {
			const store = transaction.objectStore("metadata");
			const key = `data-generation-token:${certificationId}`;
			const current = await store.get(key);
			if (typeof current?.value === "string" && current.value.length > 0) return current.value;
			const generationToken = globalThis.crypto.randomUUID();
			await store.put({ key, value: generationToken });
			return generationToken;
		});
	}

	saveLegacyBackup(backup: LegacyRecordsBackup): Promise<string> {
		return withTransaction(this.getDatabase, ["metadata"], "readwrite", async (transaction) => {
			const store = transaction.objectStore("metadata");
			const key = `legacy-backup:archive:${globalThis.crypto.randomUUID()}`;
			await store.add({ key, value: backup });
			await store.put({ key: "legacy-backup:latest", value: key });
			return key;
		});
	}

	resetCertificationProgress(certificationId: string): Promise<string> {
		return withTransaction(
			this.getDatabase,
			["sessions", "questionAttempts", "questionProgress", "metadata"],
			"readwrite",
			async (transaction) => {
				for (const storeName of ["sessions", "questionAttempts", "questionProgress"] as const) {
					const index = transaction.objectStore(storeName).index("by-certification");
					let cursor = await index.openCursor(certificationId);
					while (cursor) {
						await cursor.delete();
						cursor = await cursor.continue();
					}
				}
				const generationToken = globalThis.crypto.randomUUID();
				await transaction.objectStore("metadata").put({
					key: `data-generation-token:${certificationId}`,
					value: generationToken,
				});
				return generationToken;
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
		stableStringify(session.content) === stableStringify(input.content) &&
		stableStringify(session.legacy) === stableStringify(input.legacy)
	);
}

function buildSessionHistory(
	sessions: ProgressSession[],
	attempts: QuestionAttempt[],
): SessionHistoryEntry[] {
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
}

async function createSessionInTransaction(
	transaction: IDBPTransaction<ProgressDatabaseSchema, ["sessions", "metadata"], "readwrite">,
	input: CreateSessionInput,
): Promise<ProgressSession> {
	const store = transaction.objectStore("sessions");
	const existing = await store.get(input.id);
	if (existing) {
		if (sameSessionIdentity(existing, input)) return existing;
		throw new ProgressConflictError("This session ID already belongs to different session data.");
	}
	const sessions = await store.index("by-certification").getAll(input.certificationId);
	if (sessions.some((session) => session.status === "in_progress")) {
		throw new ProgressConflictError(
			`Certification ${input.certificationId} already has a resumable session.`,
		);
	}
	const created = createInitialSession(input);
	await store.add(created);
	return created;
}

async function assertGeneration(
	transaction: IDBPTransaction<ProgressDatabaseSchema, StoreNames, "readwrite">,
	certificationId: string,
	expectedGenerationToken?: string,
): Promise<void> {
	if (expectedGenerationToken === undefined) return;
	const record = await transaction
		.objectStore("metadata")
		.get(`data-generation-token:${certificationId}`);
	if (record?.value !== expectedGenerationToken) {
		throw new ProgressConflictError("Progress changed in another tab. Reload before continuing.");
	}
}

function isLegacyMigrationResult(value: unknown): value is LegacyProgressMigrationResult {
	return (
		value !== null &&
		typeof value === "object" &&
		"certificationId" in value &&
		"generationToken" in value &&
		"importedAt" in value &&
		"warnings" in value
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

function stringSequencesEqual(a: readonly string[], b: readonly string[]): boolean {
	return a.length === b.length && a.every((value, index) => value === b[index]);
}
