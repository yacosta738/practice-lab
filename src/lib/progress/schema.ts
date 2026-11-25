import type { DBSchema } from "idb";
import type {
	LearningGoalRecord,
	ProgressSession,
	QuestionAttempt,
	QuestionProgress,
	SessionStatus,
	StudyProgressRecord,
} from "./model";

export const PROGRESS_DATABASE_NAME = "practice-lab";
export const PROGRESS_DATABASE_VERSION = 1;

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
			"by-status": SessionStatus;
			"by-started-at": number;
			"by-finished-at": number;
		};
	};
	questionAttempts: {
		key: [string, string];
		value: QuestionAttempt;
		indexes: {
			"by-certification": string;
			"by-domain": string;
			"by-evaluated-at": number;
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
