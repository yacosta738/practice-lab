import type {
	ProgressSession,
	ProgressSummaryData,
	QuestionAttempt,
	QuestionProgress,
	SessionHistoryEntry,
} from "./model";

export interface ProgressBankQuestion {
	certificationId: string;
	certificationSubtitle: string;
	questionId: string;
	domainId: string;
	domainName: string;
}

export interface ProgressBank {
	certificationId: string;
	certificationSubtitle: string;
	questions: readonly ProgressBankQuestion[];
}

export interface ProgressSummary {
	coverage: { evaluated: number; eligible: number };
	accuracy: { correct: number; attempts: number };
	recentAccuracy: { correct: number; attempts: number };
	completedMockExams: number;
	lastResult?: SessionResult;
	domains: DomainAccuracy[];
	examTrend: ExamTrendPoint[];
	legacy: { attempts: number; correct: number };
}

export interface SessionResult {
	sessionId: string;
	certificationId: string;
	mode: ProgressSession["mode"];
	status: ProgressSession["status"];
	finishedAt: number;
	correct: number;
	questions: number;
	bankRevision: string;
}

export interface DomainAccuracy {
	certificationId: string;
	certificationSubtitle: string;
	domainId: string;
	domainName: string;
	correct: number;
	attempts: number;
}

export interface ExamTrendPoint {
	sessionId: string;
	certificationId: string;
	finishedAt: number;
	correct: number;
	questions: number;
	bankRevision: string;
}

const RECENT_ATTEMPT_LIMIT = 10;
const EXAM_TREND_LIMIT = 24;

export function deriveProgressSummary(
	banks: readonly ProgressBank[],
	history: readonly SessionHistoryEntry[],
	questionProgress: readonly QuestionProgress[],
	projection?: Pick<ProgressSummaryData, "recentAttempts" | "completedMockExams">,
): ProgressSummary {
	const eligibleQuestions = new Map<string, ProgressBankQuestion>();
	for (const bank of banks) {
		for (const question of bank.questions) {
			eligibleQuestions.set(questionKey(question.certificationId, question.questionId), question);
		}
	}

	const attemptsBySession = new Map<string, QuestionAttempt[]>();
	const attempts: { session: ProgressSession; attempt: QuestionAttempt }[] = [];
	for (const { session, attempts: sessionAttempts } of history) {
		const matchingAttempts = sessionAttempts.filter(
			(attempt) => attempt.certificationId === session.certificationId,
		);
		attemptsBySession.set(session.id, matchingAttempts);
		for (const attempt of matchingAttempts) attempts.push({ session, attempt });
	}
	const legacyProgress = questionProgress.filter((progress) => progress.legacyBaseline !== null);
	const legacy = legacyProgress.reduce(
		(total, progress) => ({
			attempts: total.attempts + (progress.legacyBaseline?.attempts ?? 0),
			correct: total.correct + (progress.legacyBaseline?.correct ?? 0),
		}),
		{ attempts: 0, correct: 0 },
	);
	const evaluatedQuestions = new Set<string>();
	const domains = new Map<string, DomainAccuracy>();
	let projectedCorrect = 0;
	let projectedAttempts = 0;
	if (projection) {
		for (const progress of questionProgress) {
			const baseline = progress.legacyBaseline;
			projectedCorrect += progress.correctCount + (baseline?.correct ?? 0);
			projectedAttempts += progress.attemptCount + (baseline?.attempts ?? 0);
			const question = eligibleQuestions.get(
				questionKey(progress.certificationId, progress.questionId),
			);
			const questionAttempts = progress.attemptCount + (baseline?.attempts ?? 0);
			if (!question || questionAttempts === 0) continue;
			evaluatedQuestions.add(questionKey(progress.certificationId, progress.questionId));
			addDomainAttempts(
				domains,
				question,
				progress.correctCount + (baseline?.correct ?? 0),
				questionAttempts,
			);
		}
	} else {
		for (const { attempt } of attempts) {
			const question = eligibleQuestions.get(
				questionKey(attempt.certificationId, attempt.questionId),
			);
			if (!question) continue;
			evaluatedQuestions.add(questionKey(attempt.certificationId, attempt.questionId));
			addDomainAttempt(domains, question, attempt.outcome === "correct");
		}
		for (const progress of legacyProgress) {
			const key = questionKey(progress.certificationId, progress.questionId);
			const question = eligibleQuestions.get(key);
			if (!question || !progress.legacyBaseline?.attempts) continue;
			evaluatedQuestions.add(key);
			addDomainAttempts(
				domains,
				question,
				progress.legacyBaseline.correct,
				progress.legacyBaseline.attempts,
			);
		}
	}

	const recentAttempts = projection
		? projection.recentAttempts
		: attempts.map(({ attempt }) => attempt);
	const recent = [...recentAttempts].sort(compareAttemptNewestFirst).slice(0, RECENT_ATTEMPT_LIMIT);
	const recentCorrect = recent.filter((attempt) => attempt.outcome === "correct").length;
	const sessions = history.map(({ session }) => session);
	const completedMockExams =
		projection?.completedMockExams ??
		sessions.filter((session) => session.mode === "exam" && session.status === "completed").length;
	const results = sessions
		.filter((session) => session.status !== "in_progress")
		.map((session) => resultFor(session, attemptsBySession.get(session.id) ?? []))
		.sort((a, b) => b.finishedAt - a.finishedAt || b.sessionId.localeCompare(a.sessionId));
	const examTrend = sessions
		.filter(
			(session) =>
				session.mode === "exam" && (session.status === "completed" || session.status === "expired"),
		)
		.map((session) => {
			const result = resultFor(session, attemptsBySession.get(session.id) ?? []);
			return {
				sessionId: session.id,
				certificationId: session.certificationId,
				finishedAt: result.finishedAt,
				correct: result.correct,
				questions: result.questions,
				bankRevision: session.content.bankRevision,
			};
		})
		.sort((a, b) => a.finishedAt - b.finishedAt || a.sessionId.localeCompare(b.sessionId))
		.slice(-EXAM_TREND_LIMIT);

	return {
		coverage: { evaluated: evaluatedQuestions.size, eligible: eligibleQuestions.size },
		accuracy: {
			correct: projection
				? projectedCorrect
				: attempts.filter(({ attempt }) => attempt.outcome === "correct").length + legacy.correct,
			attempts: projection ? projectedAttempts : attempts.length + legacy.attempts,
		},
		recentAccuracy: { correct: recentCorrect, attempts: recent.length },
		completedMockExams,
		...(results[0] ? { lastResult: results[0] } : {}),
		domains: [...domains.values()].sort(
			(a, b) =>
				a.certificationSubtitle.localeCompare(b.certificationSubtitle) ||
				a.domainId.localeCompare(b.domainId),
		),
		examTrend,
		legacy,
	};
}

function resultFor(session: ProgressSession, attempts: readonly QuestionAttempt[]): SessionResult {
	return {
		sessionId: session.id,
		certificationId: session.certificationId,
		mode: session.mode,
		status: session.status,
		finishedAt: session.finishedAt ?? session.updatedAt,
		correct: attempts.filter((attempt) => attempt.outcome === "correct").length,
		questions: session.content.questions.length,
		bankRevision: session.content.bankRevision,
	};
}

function addDomainAttempt(
	domains: Map<string, DomainAccuracy>,
	question: ProgressBankQuestion,
	isCorrect: boolean,
): void {
	const key = domainKey(question);
	const current = domains.get(key) ?? {
		certificationId: question.certificationId,
		certificationSubtitle: question.certificationSubtitle,
		domainId: question.domainId,
		domainName: question.domainName,
		correct: 0,
		attempts: 0,
	};
	current.attempts += 1;
	if (isCorrect) current.correct += 1;
	domains.set(key, current);
}

function addDomainAttempts(
	domains: Map<string, DomainAccuracy>,
	question: ProgressBankQuestion,
	correct: number,
	attempts: number,
): void {
	const key = domainKey(question);
	const current = domains.get(key) ?? {
		certificationId: question.certificationId,
		certificationSubtitle: question.certificationSubtitle,
		domainId: question.domainId,
		domainName: question.domainName,
		correct: 0,
		attempts: 0,
	};
	current.correct += correct;
	current.attempts += attempts;
	domains.set(key, current);
}

function compareAttemptNewestFirst(a: QuestionAttempt, b: QuestionAttempt): number {
	return (
		b.evaluatedAt - a.evaluatedAt ||
		b.sessionId.localeCompare(a.sessionId) ||
		b.questionId.localeCompare(a.questionId)
	);
}

function domainKey(question: ProgressBankQuestion): string {
	return `${question.certificationId}\u0000${question.domainId}`;
}

function questionKey(certificationId: string, questionId: string): string {
	return `${certificationId}\u0000${questionId}`;
}
