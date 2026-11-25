import type {
	CheckpointSessionInput,
	CreateSessionInput,
	FinalSessionStatus,
	ProgressSession,
	QuestionAttempt,
	QuestionProgress,
	QuestionProgressBaseline,
	RecordEvaluationInput,
	SessionHistoryEntry,
} from "./model";

export interface ProgressRepository {
	createSession(input: CreateSessionInput): Promise<ProgressSession>;
	checkpointSession(input: CheckpointSessionInput): Promise<ProgressSession>;
	recordEvaluation(input: RecordEvaluationInput): Promise<QuestionAttempt>;
	finalizeSession(
		sessionId: string,
		expectedRevision: number,
		status: FinalSessionStatus,
		finishedAt: number,
	): Promise<ProgressSession>;
	getSessionHistory(certificationId: string): Promise<SessionHistoryEntry[]>;
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
	close(): Promise<void>;
}
