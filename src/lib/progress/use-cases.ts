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
import type { ProgressRepository } from "./repository-port";

export type CreateSessionCommand = Omit<CreateSessionInput, "startedAt">;
export type CheckpointSessionCommand = Omit<CheckpointSessionInput, "updatedAt">;
export type RecordEvaluationCommand = Omit<RecordEvaluationInput, "evaluatedAt">;

export interface ProgressUseCases {
	createSession(command: CreateSessionCommand): Promise<ProgressSession>;
	checkpointSession(command: CheckpointSessionCommand): Promise<ProgressSession>;
	recordEvaluation(command: RecordEvaluationCommand): Promise<QuestionAttempt>;
	finalizeSession(
		sessionId: string,
		expectedRevision: number,
		status: FinalSessionStatus,
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
}

export function createProgressUseCases(
	repository: ProgressRepository,
	options: { now?: () => number } = {},
): ProgressUseCases {
	const now = options.now ?? Date.now;

	return {
		createSession(command) {
			return repository.createSession({ ...command, startedAt: now() });
		},
		checkpointSession(command) {
			return repository.checkpointSession({ ...command, updatedAt: now() });
		},
		recordEvaluation(command) {
			return repository.recordEvaluation({ ...command, evaluatedAt: now() });
		},
		finalizeSession(sessionId, expectedRevision, status) {
			return repository.finalizeSession(sessionId, expectedRevision, status, now());
		},
		getSessionHistory(certificationId) {
			return repository.getSessionHistory(certificationId);
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
