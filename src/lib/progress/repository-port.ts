import type {
	CertificationProgressRestoreSnapshot,
	CertificationProgressSnapshot,
	CheckpointSessionInput,
	CreateSessionInput,
	FinalSessionStatus,
	LearningDataRestoreData,
	LearningDataSnapshot,
	LearningGoalRecord,
	LegacyProgressBackup,
	LegacyProgressMigrationInput,
	LegacyProgressMigrationResult,
	LegacyRecordsBackup,
	ProgressSession,
	ProgressSessionSummary,
	ProgressSummaryData,
	QuestionAttempt,
	QuestionProgress,
	QuestionProgressBaseline,
	RecordEvaluationInput,
	SessionHistoryEntry,
	SessionMode,
	SessionStatus,
	StudyProgressRecord,
} from "./model";

export interface SessionHistoryQuery {
	certificationId?: string;
	mode?: SessionMode;
	status?: SessionStatus;
	from?: number;
	through?: number;
	page: number;
	pageSize: number;
}

export interface SessionHistoryPage {
	entries: SessionHistoryEntry[];
	total: number;
	page: number;
	pageSize: number;
}

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

	getProgressSummaryData(certificationIds: readonly string[]): Promise<ProgressSummaryData>;

	getCertificationProgressSnapshot(certificationId: string): Promise<CertificationProgressSnapshot>;

	restoreCertificationProgress(
		snapshots: readonly CertificationProgressRestoreSnapshot[],
		expectedGenerationTokens: Readonly<Record<string, string>>,
	): Promise<Record<string, string>>;

	getLearningDataSnapshot(): Promise<LearningDataSnapshot>;

	replaceLearningData(
		data: LearningDataRestoreData,
		certificationIds: readonly string[],
		expectedFingerprint: string,
	): Promise<Record<string, string>>;

	resetLearningData(
		certificationId: string | null,
		certificationIds: readonly string[],
	): Promise<Record<string, string>>;

	markSuccessfulBackup(timestamp: number): Promise<void>;

	getSession(sessionId: string): Promise<ProgressSession | undefined>;

	getActiveSession(certificationId: string): Promise<ProgressSession | undefined>;

	getRecentSessionSummaries(
		certificationId: string,
		limit: number,
	): Promise<ProgressSessionSummary[]>;

	getQuestionProgressForCertification(certificationId: string): Promise<QuestionProgress[]>;

	getSessionHistoryPage(query: SessionHistoryQuery): Promise<SessionHistoryPage>;

	getSessionById(sessionId: string): Promise<SessionHistoryEntry | undefined>;

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

export interface StudyProgressRepository {
	getDataGenerationToken(certificationId: string): Promise<string>;

	getStudyProgressForCertification(certificationId: string): Promise<StudyProgressRecord[]>;

	getLearningGoalForCertification(certificationId: string): Promise<LearningGoalRecord | undefined>;

	updateStudyProgress(
		certificationId: string,
		noteIds: readonly string[],
		expectedGenerationToken: string,
		update: (existing: StudyProgressRecord | undefined) => StudyProgressRecord,
	): Promise<StudyProgressRecord>;

	saveLearningGoal(record: LearningGoalRecord, expectedGenerationToken: string): Promise<void>;
}
