import {
	addAssessmentToMasteryCounts,
	assessQuestionMastery,
	createEmptyMasteryCounts,
	type DomainMasterySnapshot,
	generateReviewRecommendations,
	MASTERY_POLICY,
	type MasteryCounts,
	type QuestionMasteryAssessment,
	type ReviewRecommendation,
} from "./mastery";
import {
	type ProgressSession,
	type ProgressSummaryData,
	projectQuestionAttempts,
	type QuestionAttempt,
	type QuestionProgress,
	type SessionHistoryEntry,
} from "./model";
import { buildReviewQueue, type ReviewQueueSummary } from "./review-scheduler";

export interface ProgressBankQuestion {
	certificationId: string;
	certificationSubtitle: string;
	questionId: string;
	domainId: string;
	domainName: string;
	revision?: string;
	domainWeight?: number;
	blueprintSource?: "official" | "derived";
}

export interface ProgressBank {
	certificationId: string;
	certificationSubtitle: string;
	questions: readonly ProgressBankQuestion[];
	blueprintSource?: "official" | "derived";
}

export interface ProgressSummary {
	coverage: { evaluated: number; eligible: number };
	accuracy: { correct: number; attempts: number };
	recentAccuracy: { correct: number; attempts: number };
	completedMockExams: number;
	lastResult?: SessionResult;
	domains: DomainAccuracy[];
	domainBreakdown: DomainMasterySnapshot[];
	mastery: MasteryCounts;
	recommendations: ReviewRecommendation[];
	reviewQueue: ReviewQueueSummary;
	policy: typeof MASTERY_POLICY;
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
	coverage: { evaluated: number; eligible: number };
	recentAccuracy: { correct: number; attempts: number };
	mastery: MasteryCounts;
	examWeight?: number;
	blueprintSource?: "official" | "derived";
	hasSufficientEvidence: boolean;
}

export interface ExamTrendPoint {
	sessionId: string;
	certificationId: string;
	finishedAt: number;
	correct: number;
	questions: number;
	bankRevision: string;
}

export interface DeriveProgressSummaryOptions {
	now?: number;
	basePath?: string;
	timeZone?: string;
}

const RECENT_ATTEMPT_LIMIT = MASTERY_POLICY.recentWindowSize;
const EXAM_TREND_LIMIT = 24;

export function deriveProgressSummary(
	banks: readonly ProgressBank[],
	history: readonly SessionHistoryEntry[],
	questionProgress: readonly QuestionProgress[],
	projection?: Pick<ProgressSummaryData, "recentAttempts" | "completedMockExams">,
	options: DeriveProgressSummaryOptions = {},
): ProgressSummary {
	const now = options.now ?? Date.now();
	const basePath = options.basePath ?? "";

	const eligibleQuestions = new Map<string, ProgressBankQuestion>();
	const domainEligibleCounts = new Map<string, { meta: ProgressBankQuestion; eligible: number }>();

	for (const bank of banks) {
		for (const rawQuestion of bank.questions) {
			const question: ProgressBankQuestion = {
				...rawQuestion,
				...(rawQuestion.blueprintSource === undefined && bank.blueprintSource !== undefined
					? { blueprintSource: bank.blueprintSource }
					: {}),
			};
			eligibleQuestions.set(questionKey(question.certificationId, question.questionId), question);
			const dKey = domainKey(question);
			const existingDomain = domainEligibleCounts.get(dKey);
			if (existingDomain) {
				existingDomain.eligible += 1;
			} else {
				domainEligibleCounts.set(dKey, { meta: question, eligible: 1 });
			}
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

	const effectiveProgress = projection
		? questionProgress
		: projectQuestionAttempts(
				attempts.map(({ attempt }) => attempt),
				questionProgress,
			);
	const progressByKey = new Map(
		effectiveProgress.map((progress) => [
			questionKey(progress.certificationId, progress.questionId),
			progress,
		]),
	);

	const legacyProgress = questionProgress.filter((progress) => progress.legacyBaseline !== null);
	const legacy = legacyProgress.reduce(
		(total, progress) => ({
			attempts: total.attempts + (progress.legacyBaseline?.attempts ?? 0),
			correct: total.correct + (progress.legacyBaseline?.correct ?? 0),
		}),
		{ attempts: 0, correct: 0 },
	);

	const evaluatedQuestions = new Set<string>();
	const domainTotals = new Map<string, { correct: number; attempts: number; evaluated: number }>();
	let projectedCorrect = 0;
	let projectedAttempts = 0;

	if (projection) {
		for (const progress of questionProgress) {
			const baseline = progress.legacyBaseline;
			projectedCorrect += progress.correctCount + (baseline?.correct ?? 0);
			projectedAttempts += progress.attemptCount + (baseline?.attempts ?? 0);
			const qKey = questionKey(progress.certificationId, progress.questionId);
			const question = eligibleQuestions.get(qKey);
			const questionAttempts = progress.attemptCount + (baseline?.attempts ?? 0);
			if (!question || questionAttempts === 0) continue;
			const isNewlyEvaluated = !evaluatedQuestions.has(qKey);
			evaluatedQuestions.add(qKey);
			addDomainTotals(
				domainTotals,
				question,
				progress.correctCount + (baseline?.correct ?? 0),
				questionAttempts,
				isNewlyEvaluated ? 1 : 0,
			);
		}
	} else {
		for (const { attempt } of attempts) {
			const qKey = questionKey(attempt.certificationId, attempt.questionId);
			const question = eligibleQuestions.get(qKey);
			if (!question) continue;
			const isNewlyEvaluated = !evaluatedQuestions.has(qKey);
			evaluatedQuestions.add(qKey);
			addDomainTotals(
				domainTotals,
				question,
				attempt.outcome === "correct" ? 1 : 0,
				1,
				isNewlyEvaluated ? 1 : 0,
			);
		}
		for (const progress of legacyProgress) {
			const qKey = questionKey(progress.certificationId, progress.questionId);
			const question = eligibleQuestions.get(qKey);
			if (!question || !progress.legacyBaseline?.attempts) continue;
			const isNewlyEvaluated = !evaluatedQuestions.has(qKey);
			evaluatedQuestions.add(qKey);
			addDomainTotals(
				domainTotals,
				question,
				progress.legacyBaseline.correct,
				progress.legacyBaseline.attempts,
				isNewlyEvaluated ? 1 : 0,
			);
		}
	}

	const recentAttemptsSource = projection
		? projection.recentAttempts
		: attempts.map(({ attempt }) => attempt);
	const recent = [...recentAttemptsSource]
		.sort(compareAttemptNewestFirst)
		.slice(0, RECENT_ATTEMPT_LIMIT);
	const recentCorrect = recent.filter((attempt) => attempt.outcome === "correct").length;

	const recentByDomain = new Map<string, { correct: number; attempts: number }>();
	for (const attempt of recent) {
		const question = eligibleQuestions.get(
			questionKey(attempt.certificationId, attempt.questionId),
		);
		if (!question) continue;
		const dKey = domainKey(question);
		const current = recentByDomain.get(dKey) ?? { correct: 0, attempts: 0 };
		current.attempts += 1;
		if (attempt.outcome === "correct") current.correct += 1;
		recentByDomain.set(dKey, current);
	}

	const overallMastery = createEmptyMasteryCounts();
	const masteryByDomain = new Map<string, MasteryCounts>();
	const assessments: QuestionMasteryAssessment[] = [];

	for (const [qKey, question] of eligibleQuestions.entries()) {
		const progress = progressByKey.get(qKey);
		const assessment = assessQuestionMastery(question, progress, now);
		assessments.push(assessment);
		addAssessmentToMasteryCounts(overallMastery, assessment);

		const dKey = domainKey(question);
		const domainMastery = masteryByDomain.get(dKey) ?? createEmptyMasteryCounts();
		addAssessmentToMasteryCounts(domainMastery, assessment);
		masteryByDomain.set(dKey, domainMastery);
	}

	const domainBreakdown: DomainMasterySnapshot[] = [...domainEligibleCounts.entries()]
		.map(([dKey, { meta, eligible }]) => {
			const totals = domainTotals.get(dKey) ?? { correct: 0, attempts: 0, evaluated: 0 };
			const domainRecent = recentByDomain.get(dKey) ?? { correct: 0, attempts: 0 };
			const mastery = masteryByDomain.get(dKey) ?? createEmptyMasteryCounts();
			return {
				certificationId: meta.certificationId,
				certificationSubtitle: meta.certificationSubtitle,
				domainId: meta.domainId,
				domainName: meta.domainName,
				...(meta.domainWeight !== undefined ? { examWeight: meta.domainWeight } : {}),
				...(meta.blueprintSource !== undefined ? { blueprintSource: meta.blueprintSource } : {}),
				coverage: { evaluated: totals.evaluated, eligible },
				accuracy: { correct: totals.correct, attempts: totals.attempts },
				recentAccuracy: domainRecent,
				mastery,
				hasSufficientEvidence: totals.attempts >= MASTERY_POLICY.weakDomainMinAttempts,
			};
		})
		.sort(
			(a, b) =>
				a.certificationSubtitle.localeCompare(b.certificationSubtitle) ||
				a.domainId.localeCompare(b.domainId),
		);

	const domains: DomainAccuracy[] = domainBreakdown
		.filter((domain) => domain.accuracy.attempts > 0)
		.map((domain) => ({
			certificationId: domain.certificationId,
			certificationSubtitle: domain.certificationSubtitle,
			domainId: domain.domainId,
			domainName: domain.domainName,
			correct: domain.accuracy.correct,
			attempts: domain.accuracy.attempts,
			coverage: domain.coverage,
			recentAccuracy: domain.recentAccuracy,
			mastery: domain.mastery,
			...(domain.examWeight !== undefined ? { examWeight: domain.examWeight } : {}),
			...(domain.blueprintSource !== undefined ? { blueprintSource: domain.blueprintSource } : {}),
			hasSufficientEvidence: domain.hasSufficientEvidence,
		}));

	const recommendations = generateReviewRecommendations({
		assessments,
		questionsByKey: eligibleQuestions,
		progressByKey,
		domains: domainBreakdown,
		basePath,
	});

	const reviewQueue = buildReviewQueue([...eligibleQuestions.values()], progressByKey, {
		now: () => now,
		...(options.timeZone ? { timeZone: options.timeZone } : {}),
	});

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
		domains,
		domainBreakdown,
		mastery: overallMastery,
		recommendations,
		reviewQueue,
		policy: MASTERY_POLICY,
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

function addDomainTotals(
	totals: Map<string, { correct: number; attempts: number; evaluated: number }>,
	question: ProgressBankQuestion,
	correct: number,
	attempts: number,
	evaluatedIncrement: number,
): void {
	const key = domainKey(question);
	const current = totals.get(key) ?? { correct: 0, attempts: 0, evaluated: 0 };
	current.correct += correct;
	current.attempts += attempts;
	current.evaluated += evaluatedIncrement;
	totals.set(key, current);
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
