import type { DBSchema } from "idb";
import type {
	LearningGoalRecord,
	ProgressSession,
	QuestionAttempt,
	QuestionProgress,
	SessionMode,
	SessionStatus,
	StudyProgressRecord,
} from "./model";

export const PROGRESS_DATABASE_NAME = "practice-lab";
export const PROGRESS_DATABASE_VERSION = 3;

export interface MetadataRecord {
	key: string;
	value: unknown;
}

export interface ProgressDatabaseSchema extends DBSchema {
	sessions: {
		key: string;
		value: ProgressSession;
		indexes: {
			"by-certification": string;
			"by-certification-finished-at-id": [string, number, string];
			"by-certification-mode-started-at-id": [string, SessionMode, number, string];
			"by-certification-mode-status-finished-at-id": [
				string,
				SessionMode,
				SessionStatus,
				number,
				string,
			];
			"by-certification-mode-status-started-at-id": [
				string,
				SessionMode,
				SessionStatus,
				number,
				string,
			];
			"by-certification-started-at-id": [string, number, string];
			"by-certification-status-started-at-id": [string, SessionStatus, number, string];
			"by-status": SessionStatus;
			"by-started-at": number;
			"by-started-at-id": [number, string];
			"by-finished-at": number;
			"by-mode-started-at-id": [SessionMode, number, string];
			"by-mode-status-started-at-id": [SessionMode, SessionStatus, number, string];
			"by-status-started-at-id": [SessionStatus, number, string];
		};
	};
	questionAttempts: {
		key: [string, string];
		value: QuestionAttempt;
		indexes: {
			"by-certification": string;
			"by-certification-evaluated-at": [string, number];
			"by-domain": string;
			"by-evaluated-at": number;
			"by-session": string;
		};
	};
	questionProgress: {
		key: [string, string];
		value: QuestionProgress;
		indexes: { "by-certification": string };
	};
	studyProgress: {
		key: [string, string];
		value: StudyProgressRecord;
		indexes: { "by-certification": string };
	};
	learningGoals: {
		key: string;
		value: LearningGoalRecord;
	};
	metadata: {
		key: string;
		value: MetadataRecord;
	};
}

export type ProgressStoreName =
	| "sessions"
	| "questionAttempts"
	| "questionProgress"
	| "studyProgress"
	| "learningGoals"
	| "metadata";
