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
	QuestionAttempt,
	QuestionProgress,
	QuestionProgressBaseline,
	RecordEvaluationInput,
	SessionHistoryEntry,
} from "./model";

export interface ProgressRepository {
	createSession(input: CreateSessionInput): Promise<ProgressSession>;
	replaceSession(
		input: CreateSessionInput,
		previousSessionId: string,
		previousExpectedRevision: number,
	): Promise<ProgressSession>;
	checkpointSession(input: CheckpointSessionInput): Promise<ProgressSession>;
	recordEvaluation(input: RecordEvaluationInput): Promise<QuestionAttempt>;
	finalizeSession(
		sessionId: string,
		expectedRevision: number,
		status: FinalSessionStatus,
		finishedAt: number,
		expectedGenerationToken?: string,
		evaluations?: readonly RecordEvaluationInput[],
	): Promise<ProgressSession>;
	migrateLegacyData(input: LegacyProgressMigrationInput): Promise<LegacyProgressMigrationResult>;
	reconcileLegacyWrite(
		certificationId: string,
		backup: LegacyProgressBackup,
		expectedGenerationToken: string,
	): Promise<LegacyProgressMigrationResult>;
	saveLegacyBackup(backup: LegacyRecordsBackup): Promise<string>;
	resetCertificationProgress(certificationId: string): Promise<string>;
	getSessionHistory(certificationId: string): Promise<SessionHistoryEntry[]>;
	getCertificationProgressSnapshot(certificationId: string): Promise<CertificationProgressSnapshot>;
	restoreCertificationProgress(
		snapshots: readonly CertificationProgressRestoreSnapshot[],
		expectedGenerationTokens: Readonly<Record<string, string>>,
	): Promise<Record<string, string>>;
	getSession(sessionId: string): Promise<ProgressSession | undefined>;
	getQuestionProgressForCertification(certificationId: string): Promise<QuestionProgress[]>;
	getQuestionProgress(
		certificationId: string,
		questionId: string,
	): Promise<QuestionProgress | undefined>;
	getMetadata(key: string): Promise<unknown>;
	getDataGenerationToken(certificationId: string): Promise<string>;
	setLegacyBaseline(
		certificationId: string,
		questionId: string,
		baseline: QuestionProgressBaseline,
	): Promise<QuestionProgress>;
	rebuildQuestionProgress(certificationId: string): Promise<QuestionProgress[]>;
	close(): Promise<void>;
}
