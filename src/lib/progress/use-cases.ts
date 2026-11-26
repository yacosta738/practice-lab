import type {
	CertificationProgressRestoreSnapshot,
	CertificationProgressSnapshot,
	CheckpointSessionInput,
	CreateSessionInput,
	FinalSessionStatus,
	LegacyProgressBackup,
	LegacyProgressMigrationInput,
	LegacyProgressMigrationResult,
	LegacyRecordsBackup,
	ProgressSession,
	ProgressSummaryData,
	QuestionAttempt,
	QuestionProgress,
	QuestionProgressBaseline,
	RecordEvaluationInput,
	SessionHistoryEntry,
} from "./model";
import type {
	ProgressRepository,
	SessionHistoryPage,
	SessionHistoryQuery,
} from "./repository-port";

export type CreateSessionCommand = Omit<CreateSessionInput, "startedAt"> & { startedAt?: number };
export type CheckpointSessionCommand = Omit<CheckpointSessionInput, "updatedAt">;
export type RecordEvaluationCommand = Omit<RecordEvaluationInput, "evaluatedAt">;

export interface ProgressUseCases {
	createSession(command: CreateSessionCommand): Promise<ProgressSession>;

	replaceSession(
		command: CreateSessionCommand,
		previousSessionId: string,
		previousExpectedRevision: number,
	): Promise<ProgressSession>;

	checkpointSession(command: CheckpointSessionCommand): Promise<ProgressSession>;

	recordEvaluation(command: RecordEvaluationCommand): Promise<QuestionAttempt>;

	finalizeSession(
		sessionId: string,
		expectedRevision: number,
		status: FinalSessionStatus,
		expectedGenerationToken?: string,
		evaluations?: readonly RecordEvaluationCommand[],
	): Promise<ProgressSession>;

	migrateLegacyData(
		command: Omit<LegacyProgressMigrationInput, "migratedAt">,
	): Promise<LegacyProgressMigrationResult>;

	reconcileLegacyWrite(
		certificationId: string,
		backup: LegacyProgressBackup,
		expectedGenerationToken: string,
	): Promise<LegacyProgressMigrationResult>;

	saveLegacyBackup(backup: LegacyRecordsBackup): Promise<string>;

	resetCertificationProgress(certificationId: string): Promise<string>;

	getSessionHistory(certificationId: string): Promise<SessionHistoryEntry[]>;

	getProgressSummaryData(certificationIds: readonly string[]): Promise<ProgressSummaryData>;

	getCertificationProgressSnapshot(certificationId: string): Promise<CertificationProgressSnapshot>;

	restoreCertificationProgress(
		snapshots: readonly CertificationProgressRestoreSnapshot[],
		expectedGenerationTokens: Readonly<Record<string, string>>,
	): Promise<Record<string, string>>;

	getSession(sessionId: string): Promise<ProgressSession | undefined>;

	getQuestionProgressForCertification(certificationId: string): Promise<QuestionProgress[]>;

	getMetadata(key: string): Promise<unknown>;

	getDataGenerationToken(certificationId: string): Promise<string>;

	getSessionHistoryPage(query: SessionHistoryQuery): Promise<SessionHistoryPage>;

	getSessionById(sessionId: string): Promise<SessionHistoryEntry | undefined>;

	getQuestionProgress(
		certificationId: string,
		questionId: string,
	): Promise<QuestionProgress | undefined>;

	setLegacyBaseline(
		certificationId: string,
		questionId: string,
		baseline: QuestionProgressBaseline,
	): Promise<QuestionProgress>;

	rebuildQuestionProgress(certificationId: string): Promise<QuestionProgress[]>;
}

export function createProgressUseCases(
	repository: ProgressRepository,
	options: { now?: () => number } = {},
): ProgressUseCases {
	const now = options.now ?? Date.now;

	return {
		createSession(command) {
			return repository.createSession({ ...command, startedAt: command.startedAt ?? now() });
		},
		replaceSession(command, previousSessionId, previousExpectedRevision) {
			return repository.replaceSession(
				{ ...command, startedAt: now() },
				previousSessionId,
				previousExpectedRevision,
			);
		},
		checkpointSession(command) {
			return repository.checkpointSession({ ...command, updatedAt: now() });
		},
		recordEvaluation(command) {
			return repository.recordEvaluation({ ...command, evaluatedAt: now() });
		},
		finalizeSession(
			sessionId,
			expectedRevision,
			status,
			expectedGenerationToken,
			evaluations = [],
		) {
			const evaluatedAt = now();
			return repository.finalizeSession(
				sessionId,
				expectedRevision,
				status,
				evaluatedAt,
				expectedGenerationToken,
				evaluations.map((evaluation) => ({ ...evaluation, evaluatedAt })),
			);
		},
		migrateLegacyData(command) {
			return repository.migrateLegacyData({ ...command, migratedAt: now() });
		},
		reconcileLegacyWrite(certificationId, backup, expectedGenerationToken) {
			return repository.reconcileLegacyWrite(certificationId, backup, expectedGenerationToken);
		},
		saveLegacyBackup(backup) {
			return repository.saveLegacyBackup(backup);
		},
		resetCertificationProgress(certificationId) {
			return repository.resetCertificationProgress(certificationId);
		},
		getSessionHistory(certificationId) {
			return repository.getSessionHistory(certificationId);
		},
		getProgressSummaryData(certificationIds) {
			return repository.getProgressSummaryData(certificationIds);
		},
		getCertificationProgressSnapshot(certificationId) {
			return repository.getCertificationProgressSnapshot(certificationId);
		},
		restoreCertificationProgress(snapshots, expectedGenerationTokens) {
			return repository.restoreCertificationProgress(snapshots, expectedGenerationTokens);
		},
		getSession(sessionId) {
			return repository.getSession(sessionId);
		},
		getQuestionProgressForCertification(certificationId) {
			return repository.getQuestionProgressForCertification(certificationId);
		},
		getMetadata(key) {
			return repository.getMetadata(key);
		},
		getDataGenerationToken(certificationId) {
			return repository.getDataGenerationToken(certificationId);
		},
		getSessionHistoryPage(query) {
			return repository.getSessionHistoryPage(query);
		},
		getSessionById(sessionId) {
			return repository.getSessionById(sessionId);
		},
		getQuestionProgress(certificationId, questionId) {
			return repository.getQuestionProgress(certificationId, questionId);
		},
		setLegacyBaseline(certificationId, questionId, baseline) {
			return repository.setLegacyBaseline(certificationId, questionId, baseline);
		},
		rebuildQuestionProgress(certificationId) {
			return repository.rebuildQuestionProgress(certificationId);
		},
	};
}
