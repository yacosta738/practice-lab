import type {
	CertificationConfig,
	Question,
	QuizSession,
	ShuffledQuestionOptions,
} from "../quiz-types";
import { parseProgressBackup } from "./backup-restore";
import { ProgressConflictError } from "./errors";
import { createProgressRepository } from "./indexeddb-repository";
import {
	buildLegacyMigrationPlan,
	createContentProvenance,
	createQuestionSnapshot,
	createScoringProvenance,
	type LegacyMigrationPlan,
} from "./legacy-migration";
import type {
	LegacyProgressBackup,
	LegacyProgressMigrationResult,
	LegacyRecordsBackup,
	ProgressSession,
	QuestionAttempt,
	QuestionProgress,
	SessionHistoryEntry,
} from "./model";
import {
	type CheckpointSessionCommand,
	type CreateSessionCommand,
	createProgressUseCases,
	type RecordEvaluationCommand,
} from "./use-cases";

const GLOBAL_BACKUP_FORMAT = "practice-lab-legacy-export";

declare global {
	interface Window {
		practiceLabProgressService?: BrowserProgressService;
	}
}

export interface BrowserProgressOptions {
	certificationId: string;
	config: CertificationConfig;
	questions: readonly Question[];
	knownCertificationIds: readonly string[];
}

export interface BrowserProgressState {
	generationToken: string;
	stats: Record<string, { attempts: number; correct: number; lastWrong: boolean }>;
	history: SessionHistoryEntry[];
	currentSession?: ProgressSession;
	migrationPending: boolean;
	migrationWarnings: readonly string[];
	backupReady: boolean;
	legacyWriteDetected: boolean;
	reconciliationBackupReady: boolean;
}

type InvalidationListener = (message: string) => void;

export function createBrowserProgressService(
	options: BrowserProgressOptions,
): BrowserProgressService {
	return new BrowserProgressService(options);
}

export class BrowserProgressService {
	private readonly repository = createProgressRepository();
	private readonly useCases = createProgressUseCases(this.repository);
	private readonly storageKey: string;
	private readonly questionsById = new Map<string, Question>();
	private observedSessionRevisions = new Map<string, number>();
	private generationToken = "";
	private originalLegacyValue: string | null = null;
	private pendingMigrationPlan?: LegacyMigrationPlan;
	private migrationWarnings: readonly string[] = [];
	private channel?: BroadcastChannel;
	private stateListeners = new Set<InvalidationListener>();
	private initialized = false;
	private backupReady = false;
	private legacyWriteDetected = false;
	private reconciliationBackupReady = false;

	constructor(private readonly options: BrowserProgressOptions) {
		this.storageKey = legacyStorageKey(options.certificationId);
		for (const question of options.questions) this.questionsById.set(question.id, question);
	}

	async initialize(): Promise<BrowserProgressState> {
		if (typeof window === "undefined")
			throw new Error("Quiz progress is only available in a browser.");
		this.openBroadcastChannel();
		this.generationToken = await this.useCases.getDataGenerationToken(this.options.certificationId);
		const legacyValues = readKnownLegacyValues(this.options.knownCertificationIds);
		const currentLegacy = legacyValues.find(({ storageKey }) => storageKey === this.storageKey);
		if (currentLegacy?.readError) throw new Error(currentLegacy.readError);
		this.originalLegacyValue = currentLegacy?.rawValue ?? null;

		const marker = await this.useCases.getMetadata(
			migrationMarkerKey(this.options.certificationId),
		);
		const legacyImportSuppressed =
			(await this.useCases.getMetadata(suppressedLegacyImportKey(this.options.certificationId))) ===
			true;
		if (marker && !isMigrationMarker(marker)) {
			throw new Error(
				"The saved migration marker is invalid. Download the legacy backup before recovery.",
			);
		}

		if (marker) {
			if (isMigrationMarker(marker)) this.migrationWarnings = marker.warnings;
			const storedBackup = await this.useCases.getMetadata(
				legacyBackupKey(this.options.certificationId),
			);
			if (!isLegacyProgressBackup(storedBackup)) {
				throw new Error(
					"The migration backup is unavailable. Progress remains in IndexedDB; download a current export.",
				);
			}
			if (!legacyImportSuppressed && currentLegacy?.rawValue !== storedBackup.rawValue) {
				this.legacyWriteDetected = true;
			}
		} else if (
			!legacyImportSuppressed &&
			currentLegacy?.rawValue !== null &&
			currentLegacy?.rawValue !== undefined
		) {
			this.pendingMigrationPlan = buildLegacyMigrationPlan({
				certificationId: this.options.certificationId,
				legacyStorageKey: this.storageKey,
				rawValue: currentLegacy.rawValue,
				config: this.options.config,
				questions: this.options.questions,
				now: Date.now(),
			});
			this.migrationWarnings = this.pendingMigrationPlan.warnings;
		}
		this.initialized = true;
		window.addEventListener("storage", this.onStorageChange);
		await this.expireOverdueSession();
		return this.readState();
	}

	async readState(): Promise<BrowserProgressState> {
		this.assertInitialized();
		const [history, progress] = await Promise.all([
			this.useCases.getSessionHistory(this.options.certificationId),
			this.useCases.getQuestionProgressForCertification(this.options.certificationId),
		]);
		const stats = progressToStats(progress);
		this.observedSessionRevisions = new Map(
			history.map(({ session }) => [session.id, session.revision]),
		);
		const currentSession =
			history.find(({ session }) => session.status === "in_progress") ??
			history.find(({ session }) => session.status === "completed" || session.status === "expired");
		return {
			generationToken: this.generationToken,
			stats,
			history,
			...(currentSession ? { currentSession: currentSession.session } : {}),
			migrationPending: this.pendingMigrationPlan !== undefined,
			migrationWarnings: this.migrationWarnings,
			backupReady: this.backupReady,
			legacyWriteDetected: this.legacyWriteDetected,
			reconciliationBackupReady: this.reconciliationBackupReady,
		};
	}

	async downloadDataBackup(): Promise<void> {
		this.assertInitialized();
		const records = [...readKnownLegacyValues(this.options.knownCertificationIds)];
		const currentLegacy = records.find(({ storageKey }) => storageKey === this.storageKey);
		if (this.pendingMigrationPlan && currentLegacy?.rawValue !== this.originalLegacyValue) {
			if (currentLegacy?.readError) throw new Error(currentLegacy.readError);
			if (this.originalLegacyValue !== null) {
				records.push({
					certificationId: this.options.certificationId,
					storageKey: this.storageKey,
					rawValue: this.originalLegacyValue,
					snapshot: "pre-migration-observed",
				});
			}
			this.originalLegacyValue = currentLegacy?.rawValue ?? null;
			this.pendingMigrationPlan = currentLegacy?.rawValue
				? buildLegacyMigrationPlan({
						certificationId: this.options.certificationId,
						legacyStorageKey: this.storageKey,
						rawValue: currentLegacy.rawValue,
						config: this.options.config,
						questions: this.options.questions,
						now: Date.now(),
					})
				: undefined;
			this.migrationWarnings = this.pendingMigrationPlan?.warnings ?? [];
			this.backupReady = false;
			this.legacyWriteDetected = false;
		}
		const archive: LegacyRecordsBackup = {
			format: GLOBAL_BACKUP_FORMAT,
			version: 1,
			exportedAt: Date.now(),
			records,
		};
		if (this.pendingMigrationPlan) {
			if (records.some(({ readError }) => readError)) {
				downloadJson(archive, `practice-lab-${this.options.certificationId}-legacy-backup-v1.json`);
				throw new Error(
					"The backup file was downloaded, but some legacy records could not be read. Import is paused.",
				);
			}
			const [certifications, previousMigrationBackups] = await Promise.all([
				this.exportCertificationData(),
				this.readPreviousMigrationBackups(),
			]);
			downloadJson(
				{
					format: "practice-lab-progress-export",
					version: 1,
					exportedAt: archive.exportedAt,
					legacyRecords: archive,
					previousMigrationBackups,
					certifications,
				},
				`practice-lab-${this.options.certificationId}-backup-v1.json`,
			);
			await this.useCases.saveLegacyBackup(archive);
			this.backupReady = true;
			return;
		}
		if (records.some(({ readError }) => readError)) {
			downloadJson(archive, `practice-lab-${this.options.certificationId}-legacy-backup-v1.json`);
			throw new Error(
				"The backup file was downloaded, but some legacy records could not be read completely.",
			);
		}
		const backupKey = await this.useCases.saveLegacyBackup(archive);
		const [certifications, previousMigrationBackups] = await Promise.all([
			this.exportCertificationData(),
			this.readPreviousMigrationBackups(),
		]);
		const exported = {
			format: "practice-lab-progress-export",
			version: 1,
			exportedAt: archive.exportedAt,
			legacyBackupKey: backupKey,
			legacyRecords: archive,
			previousMigrationBackups,
			certifications,
		};
		downloadJson(exported, `practice-lab-${this.options.certificationId}-backup-v1.json`);
		if (this.legacyWriteDetected) this.reconciliationBackupReady = true;
	}

	async downloadLocalLegacyBackup(): Promise<void> {
		const archive: LegacyRecordsBackup = {
			format: GLOBAL_BACKUP_FORMAT,
			version: 1,
			exportedAt: Date.now(),
			records: readKnownLegacyValues(this.options.knownCertificationIds),
		};
		let certifications: unknown = null;
		let previousMigrationBackups: unknown = null;
		let databaseReadError: string | undefined;
		try {
			[certifications, previousMigrationBackups] = await Promise.all([
				this.exportCertificationData(),
				this.readPreviousMigrationBackups(),
			]);
		} catch (error) {
			databaseReadError = error instanceof Error ? error.message : String(error);
		}
		downloadJson(
			{
				format: "practice-lab-progress-recovery",
				version: 1,
				exportedAt: archive.exportedAt,
				legacyRecords: archive,
				previousMigrationBackups,
				certifications,
				...(databaseReadError ? { databaseReadError } : {}),
			},
			`practice-lab-${this.options.certificationId}-recovery-v1.json`,
		);
	}

	async migrateLegacyProgress(): Promise<BrowserProgressState> {
		this.assertInitialized();
		if (!this.pendingMigrationPlan) return this.readState();
		if (!this.backupReady) {
			throw new ProgressConflictError("Download a data backup before importing legacy progress.");
		}
		const currentValue = readLegacyValue(this.storageKey);
		if (currentValue !== this.originalLegacyValue) {
			this.legacyWriteDetected = true;
			throw new ProgressConflictError(
				"Legacy progress changed after backup. Download a new backup before importing.",
			);
		}
		const plan = buildLegacyMigrationPlan({
			certificationId: this.options.certificationId,
			legacyStorageKey: this.storageKey,
			rawValue: currentValue ?? "",
			config: this.options.config,
			questions: this.options.questions,
			now: Date.now(),
		});
		const result = await this.useCases.migrateLegacyData(plan);
		this.generationToken = result.generationToken;
		this.migrationWarnings = result.warnings;
		this.pendingMigrationPlan = undefined;
		this.backupReady = false;
		this.broadcastInvalidation();
		return this.readState();
	}

	async createSession(command: CreateSessionCommand): Promise<ProgressSession> {
		this.assertWritable();
		const session = await this.useCases.createSession({
			...command,
			expectedGenerationToken: this.generationToken,
		});
		this.observedSessionRevisions.set(session.id, session.revision);
		this.broadcastInvalidation();
		return session;
	}

	async startQuizSession(
		mode: QuizSession["mode"],
		ids: readonly string[],
		shuffledOptions: Readonly<Record<string, ShuffledQuestionOptions>>,
		deadlineAt: number | null,
		previousSession?: { id: string; revision: number },
	): Promise<ProgressSession> {
		this.assertWritable();
		const questions = ids.map((id) => {
			const question = this.questionsById.get(id);
			if (!question) throw new Error(`Question ${id} is no longer available.`);
			return createQuestionSnapshot(question, this.options.config, shuffledOptions[id]);
		});
		const command: CreateSessionCommand = {
			id: globalThis.crypto.randomUUID(),
			certificationId: this.options.certificationId,
			mode,
			scoring: createScoringProvenance(this.options.config, ids.length),
			content: createContentProvenance(questions),
			checkpoint: {
				currentQuestionId: ids[0] ?? null,
				deadlineAt,
				selectedOptionIdsByQuestion: {},
				checkedQuestionIds: [],
				flaggedQuestionIds: [],
			},
			expectedGenerationToken: this.generationToken,
		};
		return previousSession
			? this.replaceSession(command, previousSession.id, previousSession.revision)
			: this.createSession(command);
	}

	hydrateSession(progressSession: ProgressSession): {
		session: QuizSession & {
			progress: {
				id: string;
				revision: number;
				status: ProgressSession["status"];
				scoring: ProgressSession["scoring"];
			};
		};
		questionsById: Record<string, Question>;
	} {
		const questionsById: Record<string, Question> = {};
		const shuffledOptions: Record<string, ShuffledQuestionOptions> = {};
		const answers: Record<string, number[]> = {};
		const checked: Record<string, boolean> = {};
		const contentQuestions = progressSession.content.questions;
		for (const question of contentQuestions) {
			const correctAnswers = question.displayOptionIds.flatMap((id, index) =>
				question.correctOptionIds.includes(id) ? [index] : [],
			);
			const originalCorrectAnswers = question.optionIds.flatMap((id, index) =>
				question.correctOptionIds.includes(id) ? [index] : [],
			);
			questionsById[question.questionId] = {
				id: question.questionId,
				domain: question.domainId,
				...(question.topic ? { topic: question.topic } : {}),
				question: question.questionText,
				options: [...question.optionTexts],
				correctAnswers: originalCorrectAnswers,
				explanation: question.explanation,
				source: { label: question.sourceLabel, url: question.sourceUrl },
				...(question.whyNot ? { whyNot: question.whyNot } : {}),
				selectCount: question.selectCount,
			};
			const optionTextById = new Map(
				question.optionIds.map((id, index) => [id, question.optionTexts[index]]),
			);
			shuffledOptions[question.questionId] = {
				options: question.displayOptionIds.map((id) => optionTextById.get(id) ?? ""),
				correctAnswers,
				optionIds: [...question.displayOptionIds],
			};
			const selected = new Set(
				progressSession.checkpoint.selectedOptionIdsByQuestion[question.questionId] ?? [],
			);
			answers[question.questionId] = question.displayOptionIds.flatMap((id, index) =>
				selected.has(id) ? [index] : [],
			);
			checked[question.questionId] = progressSession.checkpoint.checkedQuestionIds.includes(
				question.questionId,
			);
		}
		const ids = contentQuestions.map(({ questionId }) => questionId);
		const requestedIndex =
			progressSession.checkpoint.currentQuestionId === null
				? ids.length
				: ids.indexOf(progressSession.checkpoint.currentQuestionId);
		const session: QuizSession & {
			progress: {
				id: string;
				revision: number;
				status: ProgressSession["status"];
				scoring: ProgressSession["scoring"];
			};
		} = {
			mode: progressSession.mode,
			ids,
			currentIndex: Math.max(requestedIndex, 0),
			answers,
			checked,
			flags: [...progressSession.checkpoint.flaggedQuestionIds],
			created: progressSession.startedAt,
			deadline: progressSession.checkpoint.deadlineAt,
			submitted: progressSession.status !== "in_progress",
			timedOut: progressSession.status === "expired",
			...(progressSession.finishedAt === undefined ? {} : { finished: progressSession.finishedAt }),
			shuffledOptions,
			progress: {
				id: progressSession.id,
				revision: progressSession.revision,
				status: progressSession.status,
				scoring: progressSession.scoring,
			},
		};
		return { session, questionsById };
	}

	async replaceSession(
		command: CreateSessionCommand,
		previousSessionId: string,
		previousExpectedRevision: number,
	): Promise<ProgressSession> {
		this.assertWritable();
		const session = await this.useCases.replaceSession(
			{ ...command, expectedGenerationToken: this.generationToken },
			previousSessionId,
			previousExpectedRevision,
		);
		this.observedSessionRevisions.set(previousSessionId, previousExpectedRevision + 1);
		this.observedSessionRevisions.set(session.id, session.revision);
		this.broadcastInvalidation();
		return session;
	}

	async checkpointSession(command: CheckpointSessionCommand): Promise<ProgressSession> {
		this.assertWritable();
		const session = await this.useCases.checkpointSession({
			...command,
			expectedGenerationToken: this.generationToken,
		});
		this.observedSessionRevisions.set(session.id, session.revision);
		this.broadcastInvalidation();
		return session;
	}

	async recordEvaluation(
		command: RecordEvaluationCommand,
	): Promise<{ attempt: QuestionAttempt; session?: ProgressSession }> {
		this.assertWritable();
		const attempt = await this.useCases.recordEvaluation({
			...command,
			expectedGenerationToken: this.generationToken,
		});
		const session = await this.useCases.getSession(command.sessionId);
		if (session) this.observedSessionRevisions.set(session.id, session.revision);
		this.broadcastInvalidation();
		return { attempt, ...(session ? { session } : {}) };
	}

	async finalizeSession(
		sessionId: string,
		expectedRevision: number,
		status: "completed" | "expired" | "abandoned",
		evaluations: readonly RecordEvaluationCommand[] = [],
	): Promise<ProgressSession> {
		this.assertWritable();
		const session = await this.useCases.finalizeSession(
			sessionId,
			expectedRevision,
			status,
			this.generationToken,
			evaluations,
		);
		this.observedSessionRevisions.set(session.id, session.revision);
		this.broadcastInvalidation();
		return session;
	}

	async resetProgress(): Promise<BrowserProgressState> {
		this.assertWritable();
		this.generationToken = await this.useCases.resetCertificationProgress(
			this.options.certificationId,
		);
		this.broadcastInvalidation();
		return this.readState();
	}

	async restoreProgressBackup(rawJson: string): Promise<BrowserProgressState> {
		this.assertWritable();
		const snapshots = parseProgressBackup(rawJson, this.options.knownCertificationIds);
		const snapshot = snapshots.find(
			({ certificationId }) => certificationId === this.options.certificationId,
		);
		if (!snapshot) {
			throw new ProgressConflictError(
				`The selected backup does not contain ${this.options.certificationId} progress.`,
			);
		}
		const restoredTokens = await this.useCases.restoreCertificationProgress([snapshot], {
			[this.options.certificationId]: this.generationToken,
		});
		this.generationToken = restoredTokens[this.options.certificationId];
		this.broadcastInvalidation();
		return this.readState();
	}

	async reconcileLegacyWrite(): Promise<BrowserProgressState> {
		this.assertInitialized();
		if (!this.legacyWriteDetected || !this.reconciliationBackupReady) {
			throw new ProgressConflictError("Download the changed legacy record before reconciling it.");
		}
		const rawValue = readLegacyValue(this.storageKey);
		const backup: LegacyProgressBackup = {
			format: "practice-lab-progress-backup",
			version: 1,
			certificationId: this.options.certificationId,
			legacyStorageKey: this.storageKey,
			capturedAt: Date.now(),
			rawValue,
			warnings: [
				"A legacy record changed after migration and was archived without merging its counts.",
			],
		};
		const result = await this.useCases.reconcileLegacyWrite(
			this.options.certificationId,
			backup,
			this.generationToken,
		);
		const latestValue = readLegacyValue(this.storageKey);
		this.generationToken = result.generationToken;
		this.migrationWarnings = result.warnings;
		this.originalLegacyValue = rawValue;
		this.legacyWriteDetected = latestValue !== rawValue;
		this.reconciliationBackupReady = false;
		this.broadcastInvalidation();
		return this.readState();
	}

	async getSession(sessionId: string): Promise<ProgressSession | undefined> {
		this.assertInitialized();
		return this.useCases.getSession(sessionId);
	}

	private async exportCertificationData() {
		return Promise.all(
			this.options.knownCertificationIds.map(async (certificationId) => ({
				certificationId,
				...(await this.useCases.getCertificationProgressSnapshot(certificationId)),
			})),
		);
	}

	private async readPreviousMigrationBackups() {
		return Promise.all(
			this.options.knownCertificationIds.map(async (certificationId) => ({
				certificationId,
				backup: await this.useCases.getMetadata(legacyBackupKey(certificationId)),
			})),
		);
	}

	async checkForExternalChanges(sessionId?: string, revision?: number): Promise<boolean> {
		this.assertInitialized();
		const [token, history] = await Promise.all([
			this.useCases.getDataGenerationToken(this.options.certificationId),
			this.useCases.getSessionHistory(this.options.certificationId),
		]);
		if (token !== this.generationToken) {
			this.notifyInvalidation("Progress was reset or imported in another tab. Reload to continue.");
			return true;
		}
		const sessionsChanged =
			history.length !== this.observedSessionRevisions.size ||
			history.some(
				({ session }) => this.observedSessionRevisions.get(session.id) !== session.revision,
			);
		if (sessionsChanged) {
			this.notifyInvalidation("Quiz history changed in another tab. Reload to continue.");
			return true;
		}
		if (sessionId) {
			const current = history.find(({ session }) => session.id === sessionId)?.session;
			if (!current || current.revision !== revision) {
				this.notifyInvalidation("This session changed in another tab. Reload to continue.");
				return true;
			}
		}
		return this.legacyWriteDetected;
	}

	onInvalidation(listener: InvalidationListener): () => void {
		this.stateListeners.add(listener);
		return () => this.stateListeners.delete(listener);
	}

	close(): void {
		window.removeEventListener("storage", this.onStorageChange);
		this.channel?.close();
		this.channel = undefined;
	}

	private assertInitialized(): void {
		if (!this.initialized) throw new Error("The progress service has not been initialized.");
	}

	private assertWritable(): void {
		this.assertInitialized();
		if (this.pendingMigrationPlan) {
			throw new ProgressConflictError(
				"Import or preserve the legacy progress before starting a new session.",
			);
		}
		if (this.legacyWriteDetected) {
			throw new ProgressConflictError(
				"Legacy progress changed in an older tab. Reload before continuing.",
			);
		}
	}

	private async expireOverdueSession(): Promise<void> {
		if (this.pendingMigrationPlan || this.legacyWriteDetected) return;
		const state = await this.readState();
		const session = state.currentSession;
		if (
			session?.status !== "in_progress" ||
			session.mode !== "exam" ||
			session.checkpoint.deadlineAt === null ||
			session.checkpoint.deadlineAt > Date.now()
		) {
			return;
		}
		const alreadyEvaluated = new Set(session.checkpoint.checkedQuestionIds);
		const evaluations: RecordEvaluationCommand[] = [];
		for (const snapshot of session.content.questions) {
			if (alreadyEvaluated.has(snapshot.questionId)) continue;
			const selectedOptionIds =
				session.checkpoint.selectedOptionIdsByQuestion[snapshot.questionId] ?? [];
			if (selectedOptionIds.length === 0) continue;
			const correct =
				selectedOptionIds.length === snapshot.correctOptionIds.length &&
				selectedOptionIds.every((id) => snapshot.correctOptionIds.includes(id));
			evaluations.push({
				sessionId: session.id,
				questionId: snapshot.questionId,
				selectedOptionIds,
				outcome: correct ? "correct" : "incorrect",
				scoreEarned: correct ? 1 : 0,
				scorePossible: 1,
			});
		}
		await this.finalizeSession(session.id, session.revision, "expired", evaluations);
	}

	private openBroadcastChannel(): void {
		if (typeof BroadcastChannel === "undefined") return;
		this.channel = new BroadcastChannel("practice-lab-progress");
		this.channel.addEventListener("message", (event: MessageEvent<unknown>) => {
			if (!isProgressInvalidation(event.data)) return;
			if (event.data.certificationId === this.options.certificationId) {
				this.notifyInvalidation("Progress changed in another tab. Reload to continue.");
			}
		});
	}

	private broadcastInvalidation(): void {
		this.channel?.postMessage({
			type: "progress-changed",
			certificationId: this.options.certificationId,
			generationToken: this.generationToken,
		});
	}

	private notifyInvalidation(message: string): void {
		for (const listener of this.stateListeners) listener(message);
	}

	private onStorageChange = async (event: StorageEvent): Promise<void> => {
		if (event.key !== this.storageKey || event.newValue === this.originalLegacyValue) return;
		try {
			const importSuppressed = await this.useCases.getMetadata(
				suppressedLegacyImportKey(this.options.certificationId),
			);
			if (importSuppressed === true) return;
		} catch {
			// If suppression cannot be verified, preserve the legacy reconciliation safeguard.
		}
		this.legacyWriteDetected = true;
		this.notifyInvalidation(
			"A legacy tab changed saved progress. Reload and download a new backup to reconcile it.",
		);
	};
}

export function progressToStats(
	progress: readonly QuestionProgress[],
): BrowserProgressState["stats"] {
	return Object.fromEntries(
		progress.map((item) => {
			const legacy = item.legacyBaseline;
			const attempts = item.attemptCount + (legacy?.attempts ?? 0);
			const correct = item.correctCount + (legacy?.correct ?? 0);
			const lastWrong =
				item.lastOutcome !== undefined
					? item.lastOutcome !== "correct"
					: (legacy?.lastWrong ?? false);
			return [item.questionId, { attempts, correct, lastWrong }];
		}),
	);
}

export function legacyStorageKey(certificationId: string): string {
	return `${certificationId}-practice-lab-v2`;
}

function readKnownLegacyValues(
	knownCertificationIds: readonly string[],
): LegacyRecordsBackup["records"] {
	return knownCertificationIds.map((certificationId) => {
		const storageKey = legacyStorageKey(certificationId);
		try {
			return { certificationId, storageKey, rawValue: window.localStorage.getItem(storageKey) };
		} catch {
			return {
				certificationId,
				storageKey,
				rawValue: null,
				readError:
					"Browser storage is unavailable; the legacy progress could not be read for backup.",
			};
		}
	});
}

function readLegacyValue(storageKey: string): string | null {
	try {
		return window.localStorage.getItem(storageKey);
	} catch {
		throw new Error(
			"Browser storage is unavailable; retry after restoring access to saved progress.",
		);
	}
}

function migrationMarkerKey(certificationId: string): string {
	return `migration:legacy-v2:${certificationId}`;
}

function suppressedLegacyImportKey(certificationId: string): string {
	return `legacy-import-suppressed:${certificationId}`;
}

function legacyBackupKey(certificationId: string): string {
	return `legacy-backup:${certificationId}`;
}

function isLegacyProgressBackup(value: unknown): value is LegacyProgressBackup {
	return (
		value !== null &&
		typeof value === "object" &&
		"format" in value &&
		value.format === "practice-lab-progress-backup" &&
		"rawValue" in value &&
		(value.rawValue === null || typeof value.rawValue === "string")
	);
}

function isMigrationMarker(value: unknown): value is LegacyProgressMigrationResult {
	return (
		value !== null &&
		typeof value === "object" &&
		"certificationId" in value &&
		typeof value.certificationId === "string" &&
		"generationToken" in value &&
		typeof value.generationToken === "string" &&
		"warnings" in value &&
		Array.isArray(value.warnings)
	);
}

function isProgressInvalidation(value: unknown): value is {
	type: "progress-changed";
	certificationId: string;
	generationToken: string;
} {
	return (
		value !== null &&
		typeof value === "object" &&
		"type" in value &&
		value.type === "progress-changed" &&
		"certificationId" in value &&
		typeof value.certificationId === "string" &&
		"generationToken" in value &&
		typeof value.generationToken === "string"
	);
}

function downloadJson(value: unknown, fileName: string): void {
	const blob = new Blob([JSON.stringify(value, null, 2)], { type: "application/json" });
	const url = URL.createObjectURL(blob);
	const link = document.createElement("a");
	link.href = url;
	link.download = fileName;
	link.click();
	window.setTimeout(() => URL.revokeObjectURL(url), 1_000);
}
