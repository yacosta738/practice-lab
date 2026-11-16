// Question, domain, session, and stats types for the generic quiz engine

export interface Question {
	id: string;
	domain: string;
	topic: string;
	question: string;
	options: string[];
	correctAnswers: number[]; // 0-based indices
	explanation: string;
	source: {
		label: string;
		url: string;
	};
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
}

export interface QuestionStats {
	attempts: number;
	correct: number;
	lastWrong: boolean;
}

export interface QuizSession {
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
}

export interface StorageData {
	stats: Record<string, QuestionStats>;
	session: QuizSession | null;
}
