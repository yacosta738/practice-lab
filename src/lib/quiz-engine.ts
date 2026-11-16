// Core quiz engine logic — mode-agnostic, certification-agnostic

import type {
	Question,
	CertificationConfig,
	QuizSession,
	QuestionStats,
	StorageData,
} from "./quiz-types";

// --- Utilities ---

export function shuffle<T>(array: T[]): T[] {
	const a = [...array];
	for (let i = a.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[a[i], a[j]] = [a[j], a[i]];
	}
	return a;
}

export function percent(n: number, t: number): number {
	return t ? Math.round((n / t) * 100) : 0;
}

// --- Session Creation ---

export function createSession(
	mode: "practice" | "exam" | "weak",
	config: CertificationConfig,
	questions: Question[],
	options?: {
		domain?: string; // for practice mode
		amount?: number; // for practice mode
		weakStats?: Record<string, QuestionStats>; // for weak mode
	}
): QuizSession | null {
	let pool: Question[];

	if (mode === "exam") {
		// Build from exam blueprint
		const ids: string[] = [];
		for (const [domain, count] of Object.entries(config.examBlueprint)) {
			const domainQuestions = questions.filter((q) => q.domain === domain);
			ids.push(...shuffle(domainQuestions).slice(0, count).map((q) => q.id));
		}
		pool = shuffle(ids).map((id) => questions.find((q) => q.id === id)!);
	} else if (mode === "weak") {
		if (!options?.weakStats) return null;
		pool = questions.filter(
			(q) => options.weakStats[q.id]?.lastWrong === true
		);
		if (!pool.length) return null;
		pool = shuffle(pool);
	} else {
		// Practice mode
		pool = [...questions];
		if (options?.domain && options.domain !== "all") {
			pool = pool.filter((q) => q.domain === options.domain);
		}
		const amount = options?.amount ?? pool.length;
		pool = shuffle(pool).slice(0, amount);
	}

	if (!pool.length) return null;

	return {
		mode,
		ids: pool.map((q) => q.id),
		currentIndex: 0,
		answers: {},
		checked: {},
		flags: [],
		created: Date.now(),
		deadline: mode === "exam" ? Date.now() + 120 * 60 * 1000 : null,
		submitted: false,
	};
}

// --- Answer Checking ---

export function isAnswerCorrect(
	question: Question,
	selected: number[]
): boolean {
	return (
		selected.length === question.correctAnswers.length &&
		selected.every((k) => question.correctAnswers.includes(k))
	);
}

export function hasAnswered(session: QuizSession, questionId: string): boolean {
	return (
		Array.isArray(session.answers[questionId]) &&
		session.answers[questionId].length > 0
	);
}

// --- Stats Update ---

export function updateStats(
	stats: Record<string, QuestionStats>,
	questionId: string,
	correct: boolean
): Record<string, QuestionStats> {
	const existing = stats[questionId] || {
		attempts: 0,
		correct: 0,
		lastWrong: false,
	};
	existing.attempts++;
	if (correct) existing.correct++;
	existing.lastWrong = !correct;
	return { ...stats, [questionId]: existing };
}

// --- Results Calculation ---

export interface ResultsData {
	correctCount: number;
	totalCount: number;
	scorePercent: number;
	domainBreakdown: {
		domain: string;
		domainName: string;
		correct: number;
		total: number;
		percent: number;
	}[];
	missedIds: string[];
}

export function calculateResults(
	session: QuizSession,
	questions: Question[],
	domains: Record<string, { name: string }>
): ResultsData {
	const byId = Object.fromEntries(questions.map((q) => [q.id, q]));
	const correctIds = session.ids.filter(
		(id) => hasAnswered(session, id) && isAnswerCorrect(byId[id], session.answers[id] || [])
	);
	const correctCount = correctIds.length;
	const totalCount = session.ids.length;
	const scorePercent = percent(correctCount, totalCount);

	const domainBreakdown: ResultsData["domainBreakdown"] = [];
	for (const [domainId, domainInfo] of Object.entries(domains)) {
		const domainQuestionIds = session.ids.filter(
			(id) => byId[id]?.domain === domainId
		);
		if (!domainQuestionIds.length) continue;
		const domainCorrect = domainQuestionIds.filter((id) =>
			correctIds.includes(id)
		).length;
		domainBreakdown.push({
			domain: domainId,
			domainName: domainInfo.name,
			correct: domainCorrect,
			total: domainQuestionIds.length,
			percent: percent(domainCorrect, domainQuestionIds.length),
		});
	}

	const missedIds = session.ids.filter(
		(id) => !correctIds.includes(id)
	);

	return {
		correctCount,
		totalCount,
		scorePercent,
		domainBreakdown,
		missedIds,
	};
}

// --- Home Stats ---

export interface HomeStats {
	attempted: number;
	mastered: number;
	weak: number;
	domainCoverage: {
		domain: string;
		done: number;
		total: number;
	}[];
}

export function calculateHomeStats(
	stats: Record<string, QuestionStats>,
	questions: Question[],
	domains: Record<string, { name: string }>
): HomeStats {
	const values = Object.values(stats);
	const attempted = values.filter((s) => s.attempts > 0).length;
	const mastered = values.filter((s) => s.attempts > 0 && !s.lastWrong).length;
	const weak = values.filter((s) => s.lastWrong).length;

	const domainCoverage: HomeStats["domainCoverage"] = [];
	for (const [domainId] of Object.entries(domains)) {
		const domainQuestions = questions.filter((q) => q.domain === domainId);
		const done = domainQuestions.filter(
			(q) => stats[q.id]?.attempts > 0
		).length;
		domainCoverage.push({
			domain: domainId,
			done,
			total: domainQuestions.length,
		});
	}

	return { attempted, mastered, weak, domainCoverage };
}

// --- Exam Timer ---

export function formatTime(ms: number): string {
	const total = Math.max(0, Math.ceil(ms / 1000));
	const hours = String(Math.floor(total / 3600)).padStart(2, "0");
	const minutes = String(Math.floor((total % 3600) / 60)).padStart(2, "0");
	const seconds = String(total % 60).padStart(2, "0");
	return `${hours}:${minutes}:${seconds}`;
}

export function isExamExpired(session: QuizSession): boolean {
	return session.mode === "exam" && session.deadline !== null && Date.now() >= session.deadline;
}

// --- Storage Key ---

export function getStorageKey(slug: string): string {
	return `${slug}-practice-lab-v2`;
}

// --- Get weak question count ---

export function getWeakCount(
	stats: Record<string, QuestionStats>
): number {
	return Object.values(stats).filter((s) => s.lastWrong).length;
}
