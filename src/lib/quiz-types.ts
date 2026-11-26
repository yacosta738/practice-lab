// Question, domain, session, and stats types for the generic quiz engine

export interface Question {
	id: string;
	domain: string;
	topic?: string;
	question: string;
	options: string[];
	correctAnswers: number[]; // 0-based indices
	explanation: string;
	source: {
		label: string;
		url: string;
	};
	/** Explanation of why the other options are incorrect. */
	whyNot?: string;
	/** Number of options the user must select (for multi-select questions). */
	selectCount?: number;
}

export interface DomainInfo {
	id: string;
	name: string;
	weight: number; // exam weight percentage
}

export interface CertificationConfig {
	slug: string;
	title: string;
	subtitle: string;
	description: string;
	theme: {
		brand: string;
		brand2: string;
		brandSoft: string;
	};
	domains: Record<string, DomainInfo>;
	examBlueprint: Record<string, number>; // domain -> question count in mock exam
	passingScore?: number;
	totalQuestions: number;
	/** Exam duration in minutes (default 120). */
	examMinutes?: number;
	/** Optional note about the official exam guide, e.g. for CCDV-F. */
	examGuideNote?: string;
	/** Source of the exam blueprint: "official" (published by the vendor) or "derived" (computed from the imported bank). */
	blueprintSource?: "official" | "derived";
}

export interface QuestionStats {
	attempts: number;
	correct: number;
	lastWrong: boolean;
}

/** Per-question shuffled option permutation stored in the session so saved answers remain valid. */
export interface ShuffledQuestionOptions {
	options: string[];
	correctAnswers: number[];
	optionIds?: string[];
}

export interface QuizSession {
	progressId?: string;
	mode: "practice" | "exam" | "weak";
	ids: string[];
	currentIndex: number;
	answers: Record<string, number[]>; // questionId -> selected option indices
	checked: Record<string, boolean>;
	flags: string[];
	created: number;
	deadline: number | null; // for exam mode
	submitted: boolean;
	timedOut?: boolean;
	finished?: number;
	/** Per-question shuffled option order; when present, answers reference these indices. */
	shuffledOptions?: Record<string, ShuffledQuestionOptions>;
}

export interface StorageData {
	stats: Record<string, QuestionStats>;
	session: QuizSession | null;
}
