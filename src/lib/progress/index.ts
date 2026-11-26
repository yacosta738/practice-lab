export {
	type DomainAccuracy,
	deriveProgressSummary,
	type ExamTrendPoint,
	type ProgressBank,
	type ProgressBankQuestion,
	type ProgressSummary,
	type SessionResult,
} from "./analytics";
export { parseProgressBackup } from "./backup-restore";
export type { ProgressStorageErrorCode } from "./errors";
export {
	ProgressConflictError,
	ProgressError,
	ProgressStorageError,
	ProgressValidationError,
} from "./errors";
export { createProgressRepository } from "./indexeddb-repository";
export {
	createLearningBackup,
	LEARNING_BACKUP_FORMAT,
	type LearningBackup,
	MAX_LEARNING_BACKUP_RECORDS,
	MAX_LEARNING_BACKUP_SIZE,
	parseLearningBackup,
} from "./learning-backup";
export type {
	CertificationProgressRestoreSnapshot,
	CheckpointSessionInput,
	ContentProvenance,
	CreateSessionInput,
	EvaluationOutcome,
	FinalSessionStatus,
	FrozenQuestionSnapshot,
	LearningDataRestoreData,
	LearningDataSnapshot,
	LearningGoalRecord,
	ProgressSession,
	QuestionAttempt,
	QuestionProgress,
	QuestionProgressBaseline,
	QuestionProvenance,
	RecordEvaluationInput,
	ScoringProvenance,
	SessionCheckpoint,
	SessionHistoryEntry,
	SessionMode,
	SessionStatus,
	StudyProgressRecord,
} from "./model";
export type {
	ProgressRepository,
	SessionHistoryPage,
	SessionHistoryQuery,
} from "./repository-port";
export {
	type MetadataRecord,
	PROGRESS_DATABASE_NAME,
	PROGRESS_DATABASE_VERSION,
	type ProgressDatabaseSchema,
} from "./schema";
export {
	type CheckpointSessionCommand,
	type CreateSessionCommand,
	createProgressUseCases,
	type ProgressUseCases,
	type RecordEvaluationCommand,
} from "./use-cases";
