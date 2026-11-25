// Core quiz engine logic — mode-agnostic, certification-agnostic

import type {
	CertificationConfig,
	Question,
	QuestionStats,
	QuizSession,
	ShuffledQuestionOptions,
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

// --- Option Shuffling ---

/** Shuffle a question's options and remap correctAnswers to the new positions. */
export function shuffleQuestionOptions(question: Question): ShuffledQuestionOptions {
	const indices = question.options.map((_, i) => i);
	const shuffled = shuffle(indices);
	const newOptions = shuffled.map((i) => question.options[i]);
	const newCorrect = question.correctAnswers.map((origIdx) => shuffled.indexOf(origIdx));
	const optionIds = shuffled.map((index) => `${question.id}:option:${index}`);
	return { options: newOptions, correctAnswers: newCorrect, optionIds };
}

/** Return the effective options and correct answers for a question, preferring session shuffled data. */
export function getQuestionOptions(
	question: Question,
	shuffledOptions?: Record<string, ShuffledQuestionOptions>,
	questionId?: string,
): { options: string[]; correctAnswers: number[] } {
	if (questionId && shuffledOptions?.[questionId]) {
		const so = shuffledOptions[questionId];
		return { options: so.options, correctAnswers: so.correctAnswers };
	}
	return { options: question.options, correctAnswers: question.correctAnswers };
}

/** Build a shuffledOptions map for all questions in a session. */
export function buildShuffledOptions(
	ids: string[],
	byId: Record<string, Question>,
): Record<string, ShuffledQuestionOptions> {
	const result: Record<string, ShuffledQuestionOptions> = {};
	for (const id of ids) {
		result[id] = shuffleQuestionOptions(byId[id]);
	}
	return result;
}

// --- Session Creation ---

export function createSession(
	mode: "practice" | "exam" | "weak",
	config: CertificationConfig,
	questions: Question[],
	opts?: {
		domain?: string; // for practice mode
		amount?: number; // for practice mode
		weakStats?: Record<string, QuestionStats>; // for weak mode
	},
): QuizSession | null {
	let pool: Question[];

	if (mode === "exam") {
		// Build from exam blueprint
		const ids: string[] = [];
		for (const [domain, count] of Object.entries(config.examBlueprint)) {
			const domainQuestions = questions.filter((q) => q.domain === domain);
			ids.push(
				...shuffle(domainQuestions)
					.slice(0, count)
					.map((q) => q.id),
			);
		}
		const byId = new Map(questions.map((q) => [q.id, q]));
		pool = shuffle(ids)
			.map((id) => byId.get(id))
			.filter((q): q is Question => q !== undefined);
	} else if (mode === "weak") {
		const weakStats = opts?.weakStats;
		if (!weakStats) return null;
		pool = questions.filter((q) => weakStats[q.id]?.lastWrong === true);
		if (!pool.length) return null;
		pool = shuffle(pool);
	} else {
		// Practice mode
		pool = [...questions];
		if (opts?.domain && opts.domain !== "all") {
			pool = pool.filter((q) => q.domain === opts.domain);
		}
		const amount = opts?.amount ?? pool.length;
		pool = shuffle(pool).slice(0, amount);
	}

	if (!pool.length) return null;

	const sessionIds = pool.map((q) => q.id);
	const byIdRecord = Object.fromEntries(questions.map((q) => [q.id, q]));
	const shuffledOptions = buildShuffledOptions(sessionIds, byIdRecord);

	return {
		mode,
		ids: sessionIds,
		currentIndex: 0,
		answers: {},
		checked: {},
		flags: [],
		created: Date.now(),
		deadline: mode === "exam" ? Date.now() + (config.examMinutes ?? 120) * 60 * 1000 : null,
		submitted: false,
		shuffledOptions,
	};
}

// --- Answer Checking ---

export function isAnswerCorrect(question: Question, selected: number[]): boolean {
	return (
		selected.length === question.correctAnswers.length &&
		selected.every((k) => question.correctAnswers.includes(k))
	);
}

/** Check answer correctness using the effective correct answers (shuffled or original). */
export function isAnswerCorrectWithShuffle(
	question: Question,
	selected: number[],
	shuffledOptions?: Record<string, ShuffledQuestionOptions>,
	questionId?: string,
): boolean {
	const { correctAnswers } = getQuestionOptions(question, shuffledOptions, questionId);
	return (
		selected.length === correctAnswers.length && selected.every((k) => correctAnswers.includes(k))
	);
}

export function hasAnswered(session: QuizSession, questionId: string): boolean {
	return Array.isArray(session.answers[questionId]) && session.answers[questionId].length > 0;
}

// --- Session Restoration ---

/**
 * Validate and restore a saved session from localStorage.
 * Filters out question IDs that no longer exist in the question bank,
 * validates schema fields, and falls back defaults for missing data.
 * Returns null if the session is invalid or has no valid questions.
 */
export function restoreSession(raw: unknown, byId: Record<string, Question>): QuizSession | null {
	if (!raw || typeof raw !== "object") return null;
	const obj = raw as Record<string, unknown>;

	if (!["practice", "exam", "weak"].includes(obj.mode as string)) return null;
	if (!Array.isArray(obj.ids)) return null;

	// Filter to only question IDs that still exist in the bank
	const ids = (obj.ids as string[]).filter((id) => byId[id]);
	if (!ids.length) return null;

	const answers =
		obj.answers && typeof obj.answers === "object" ? (obj.answers as Record<string, number[]>) : {};
	const checked =
		obj.checked && typeof obj.checked === "object" ? (obj.checked as Record<string, boolean>) : {};
	const flags = Array.isArray(obj.flags) ? (obj.flags as string[]).filter((id) => byId[id]) : [];

	const index =
		Number.isInteger(obj.currentIndex) &&
		(obj.currentIndex as number) >= 0 &&
		(obj.currentIndex as number) < ids.length
			? (obj.currentIndex as number)
			: 0;

	// Restore shuffledOptions so saved answer indexes remain meaningful.
	// For legacy sessions without shuffledOptions, answers were recorded
	// against the original option order, so grading falls back to that.
	const shuffledOptions =
		obj.shuffledOptions && typeof obj.shuffledOptions === "object"
			? (obj.shuffledOptions as Record<string, ShuffledQuestionOptions>)
			: undefined;

	return {
		mode: obj.mode as "practice" | "exam" | "weak",
		ids,
		currentIndex: index,
		answers,
		checked,
		flags,
		created: Number.isFinite(obj.created as number) ? (obj.created as number) : Date.now(),
		deadline: Number.isFinite(obj.deadline as number) ? (obj.deadline as number) : null,
		submitted: obj.submitted === true,
		timedOut: obj.timedOut === true,
		finished: Number.isFinite(obj.finished as number) ? (obj.finished as number) : undefined,
		shuffledOptions,
	};
}

// --- Stats Update ---

export function updateStats(
	stats: Record<string, QuestionStats>,
	questionId: string,
	correct: boolean,
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
	domains: Record<string, { name: string }>,
): ResultsData {
	const byId = Object.fromEntries(questions.map((q) => [q.id, q]));
	const correctIds = session.ids.filter((id) => {
		if (!hasAnswered(session, id)) return false;
		const q = byId[id];
		const selected = session.answers[id] || [];
		return isAnswerCorrectWithShuffle(q, selected, session.shuffledOptions, id);
	});
	const correctCount = correctIds.length;
	const totalCount = session.ids.length;
	const scorePercent = percent(correctCount, totalCount);

	const domainBreakdown: ResultsData["domainBreakdown"] = [];
	for (const [domainId, domainInfo] of Object.entries(domains)) {
		const domainQuestionIds = session.ids.filter((id) => byId[id]?.domain === domainId);
		if (!domainQuestionIds.length) continue;
		const domainCorrect = domainQuestionIds.filter((id) => correctIds.includes(id)).length;
		domainBreakdown.push({
			domain: domainId,
			domainName: domainInfo.name,
			correct: domainCorrect,
			total: domainQuestionIds.length,
			percent: percent(domainCorrect, domainQuestionIds.length),
		});
	}

	const missedIds = session.ids.filter((id) => !correctIds.includes(id));

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
	domains: Record<string, { name: string }>,
): HomeStats {
	const values = Object.values(stats);
	const attempted = values.filter((s) => s.attempts > 0).length;
	const mastered = values.filter((s) => s.attempts > 0 && !s.lastWrong).length;
	const weak = values.filter((s) => s.lastWrong).length;

	const domainCoverage: HomeStats["domainCoverage"] = [];
	for (const [domainId] of Object.entries(domains)) {
		const domainQuestions = questions.filter((q) => q.domain === domainId);
		const done = domainQuestions.filter((q) => stats[q.id]?.attempts > 0).length;
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

export function getWeakCount(stats: Record<string, QuestionStats>): number {
	return Object.values(stats).filter((s) => s.lastWrong).length;
}
