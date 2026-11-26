import type { EvaluationOutcome, QuestionAttempt, QuestionProgress } from "./model";

export const MASTERY_POLICY_VERSION = "mastery-v1" as const;

export const MASTERY_POLICY = Object.freeze({
	version: MASTERY_POLICY_VERSION,
	/** Consecutive correct evaluations across distinct sessions required for Proficient. */
	proficientMinSessions: 2,
	/** Consecutive correct evaluations across distinct sessions required for Mastered. */
	masteredMinSessions: 3,
	/** Minimum elapsed time between the first and latest correct evaluation in a streak for Mastered (24 hours). */
	masteredMinSpacingMs: 24 * 60 * 60 * 1000,
	/** Elapsed time after the latest correct evaluation when a Proficient/Mastered question becomes stale (14 days). */
	staleAfterMs: 14 * 24 * 60 * 60 * 1000,
	/** Number of latest timestamped evaluations used for recent accuracy. */
	recentWindowSize: 10,
	/** Minimum evaluated attempts in a domain before ranking it as a weak domain. */
	weakDomainMinAttempts: 3,
	/** Accuracy percentage below which a sufficiently sampled domain is flagged as weak. */
	weakDomainAccuracyThresholdPercent: 75,
});

export type MasteryState = "new" | "learning" | "proficient" | "mastered";

export type MasteryDemotionReason = "wrong-answer" | "revision-changed";

export type MasteryEvidenceSource = "none" | "legacy-only" | "recorded" | "mixed";

export interface QuestionMasteryEvidence {
	policyVersion: typeof MASTERY_POLICY_VERSION;
	revision: string;
	consecutiveCorrectSessions: number;
	countedSessionIds: readonly string[];
	streakStartedAt?: number;
	lastCorrectAt?: number;
	lastCorrectSessionId?: string;
	lastIncorrectAt?: number;
	lastDemotionReason?: MasteryDemotionReason;
}

export interface MasteryQuestionRef {
	certificationId: string;
	certificationSubtitle: string;
	questionId: string;
	domainId: string;
	domainName: string;
	revision?: string;
	domainWeight?: number;
	blueprintSource?: "official" | "derived";
}

export interface QuestionMasteryAssessment {
	certificationId: string;
	questionId: string;
	domainId: string;
	state: MasteryState;
	evidenceSource: MasteryEvidenceSource;
	consecutiveCorrectSessions: number;
	spacingMs: number;
	isStale: boolean;
	needsReview: boolean;
	revisionChanged: boolean;
	demotionReason?: MasteryDemotionReason;
	lastEvaluatedAt?: number;
	lastCorrectAt?: number;
	lastOutcome?: EvaluationOutcome;
	explanation: string;
}

export interface MasteryCounts {
	new: number;
	learning: number;
	proficient: number;
	mastered: number;
	stale: number;
	revisionChanged: number;
	legacyOnly: number;
	total: number;
}

export type RecommendationCategory =
	| "recently-missed"
	| "revision-changed"
	| "weak-domain"
	| "stale-knowledge"
	| "unseen-questions";

export interface ReviewRecommendation {
	id: string;
	category: RecommendationCategory;
	priority: number;
	certificationId: string;
	certificationSubtitle: string;
	domainId?: string;
	domainName?: string;
	title: string;
	reason: string;
	sampleSize: number;
	practiceHref: string;
	practiceLabel: string;
	studyHref?: string;
	studyLabel?: string;
}

export interface DomainMasterySnapshot {
	certificationId: string;
	certificationSubtitle: string;
	domainId: string;
	domainName: string;
	examWeight?: number;
	blueprintSource?: "official" | "derived";
	coverage: { evaluated: number; eligible: number };
	accuracy: { correct: number; attempts: number };
	recentAccuracy: { correct: number; attempts: number };
	mastery: MasteryCounts;
	hasSufficientEvidence: boolean;
}

export function compareAttemptsChronologically(a: QuestionAttempt, b: QuestionAttempt): number {
	return (
		a.evaluatedAt - b.evaluatedAt ||
		a.sessionId.localeCompare(b.sessionId) ||
		a.questionId.localeCompare(b.questionId)
	);
}

export function applyAttemptToMasteryEvidence(
	current: QuestionMasteryEvidence | undefined,
	attempt: QuestionAttempt,
): QuestionMasteryEvidence {
	const revisionChanged = current !== undefined && current.revision !== attempt.questionRevision;

	if (attempt.outcome !== "correct") {
		return {
			policyVersion: MASTERY_POLICY_VERSION,
			revision: attempt.questionRevision,
			consecutiveCorrectSessions: 0,
			countedSessionIds: [],
			lastIncorrectAt: attempt.evaluatedAt,
			lastDemotionReason: "wrong-answer",
		};
	}

	if (revisionChanged) {
		return {
			policyVersion: MASTERY_POLICY_VERSION,
			revision: attempt.questionRevision,
			consecutiveCorrectSessions: 1,
			countedSessionIds: [attempt.sessionId],
			streakStartedAt: attempt.evaluatedAt,
			lastCorrectAt: attempt.evaluatedAt,
			lastCorrectSessionId: attempt.sessionId,
			...(current.lastIncorrectAt !== undefined
				? { lastIncorrectAt: current.lastIncorrectAt }
				: {}),
			...(current.consecutiveCorrectSessions > 0
				? { lastDemotionReason: "revision-changed" as const }
				: {}),
		};
	}

	if (!current || current.consecutiveCorrectSessions === 0) {
		return {
			policyVersion: MASTERY_POLICY_VERSION,
			revision: attempt.questionRevision,
			consecutiveCorrectSessions: 1,
			countedSessionIds: [attempt.sessionId],
			streakStartedAt: attempt.evaluatedAt,
			lastCorrectAt: attempt.evaluatedAt,
			lastCorrectSessionId: attempt.sessionId,
			...(current?.lastIncorrectAt !== undefined
				? { lastIncorrectAt: current.lastIncorrectAt }
				: {}),
		};
	}

	const alreadyCountedSession =
		current.lastCorrectSessionId === attempt.sessionId ||
		current.countedSessionIds.includes(attempt.sessionId);

	if (alreadyCountedSession) {
		return {
			...current,
			countedSessionIds: [...current.countedSessionIds],
			lastCorrectAt: Math.max(current.lastCorrectAt ?? attempt.evaluatedAt, attempt.evaluatedAt),
		};
	}

	const nextCount = current.consecutiveCorrectSessions + 1;
	const nextSessionIds =
		current.countedSessionIds.length < MASTERY_POLICY.masteredMinSessions
			? [...current.countedSessionIds, attempt.sessionId]
			: [...current.countedSessionIds];

	return {
		policyVersion: MASTERY_POLICY_VERSION,
		revision: attempt.questionRevision,
		consecutiveCorrectSessions: nextCount,
		countedSessionIds: nextSessionIds,
		streakStartedAt: current.streakStartedAt ?? attempt.evaluatedAt,
		lastCorrectAt: Math.max(current.lastCorrectAt ?? attempt.evaluatedAt, attempt.evaluatedAt),
		lastCorrectSessionId: attempt.sessionId,
		...(current.lastIncorrectAt !== undefined ? { lastIncorrectAt: current.lastIncorrectAt } : {}),
	};
}

export function deriveMasteryEvidenceFromAttempts(
	attempts: readonly QuestionAttempt[],
): QuestionMasteryEvidence | undefined {
	if (attempts.length === 0) return undefined;
	const sorted = [...attempts].sort(compareAttemptsChronologically);
	let evidence: QuestionMasteryEvidence | undefined;
	for (const attempt of sorted) {
		evidence = applyAttemptToMasteryEvidence(evidence, attempt);
	}
	return evidence;
}

export function masteryEvidenceEquals(
	a: QuestionMasteryEvidence | undefined,
	b: QuestionMasteryEvidence | undefined,
): boolean {
	if (a === b) return true;
	if (!a || !b) return false;
	return (
		a.policyVersion === b.policyVersion &&
		a.revision === b.revision &&
		a.consecutiveCorrectSessions === b.consecutiveCorrectSessions &&
		a.streakStartedAt === b.streakStartedAt &&
		a.lastCorrectAt === b.lastCorrectAt &&
		a.lastCorrectSessionId === b.lastCorrectSessionId &&
		a.lastIncorrectAt === b.lastIncorrectAt &&
		a.lastDemotionReason === b.lastDemotionReason &&
		a.countedSessionIds.length === b.countedSessionIds.length &&
		a.countedSessionIds.every((id, index) => id === b.countedSessionIds[index])
	);
}

export function assessQuestionMastery(
	question: Pick<MasteryQuestionRef, "certificationId" | "questionId" | "domainId" | "revision">,
	progress: QuestionProgress | undefined,
	now: number,
): QuestionMasteryAssessment {
	const hasRecorded = (progress?.attemptCount ?? 0) > 0;
	const hasLegacy = (progress?.legacyBaseline?.attempts ?? 0) > 0;
	const evidenceSource: MasteryEvidenceSource =
		hasRecorded && hasLegacy
			? "mixed"
			: hasRecorded
				? "recorded"
				: hasLegacy
					? "legacy-only"
					: "none";

	if (evidenceSource === "none") {
		return {
			certificationId: question.certificationId,
			questionId: question.questionId,
			domainId: question.domainId,
			state: "new",
			evidenceSource,
			consecutiveCorrectSessions: 0,
			spacingMs: 0,
			isStale: false,
			needsReview: false,
			revisionChanged: false,
			explanation: "No evaluated attempts yet.",
		};
	}

	if (evidenceSource === "legacy-only") {
		const lastWrong = progress?.legacyBaseline?.lastWrong ?? false;
		return {
			certificationId: question.certificationId,
			questionId: question.questionId,
			domainId: question.domainId,
			state: "learning",
			evidenceSource,
			consecutiveCorrectSessions: 0,
			spacingMs: 0,
			isStale: false,
			needsReview: lastWrong,
			revisionChanged: false,
			...(lastWrong ? { demotionReason: "wrong-answer" as const } : {}),
			explanation: lastWrong
				? "Imported legacy totals indicate a missed answer, without timestamps or session spacing."
				: "Imported legacy totals provide undated evidence only; answer across new sessions to earn mastery.",
		};
	}

	const evidence = progress?.mastery;
	if (!evidence) {
		const lastWrong = progress?.lastOutcome !== undefined && progress.lastOutcome !== "correct";
		return {
			certificationId: question.certificationId,
			questionId: question.questionId,
			domainId: question.domainId,
			state: "learning",
			evidenceSource,
			consecutiveCorrectSessions: 0,
			spacingMs: 0,
			isStale: false,
			needsReview: lastWrong,
			revisionChanged: false,
			...(progress?.lastEvaluatedAt !== undefined
				? { lastEvaluatedAt: progress.lastEvaluatedAt }
				: {}),
			...(progress?.lastOutcome !== undefined ? { lastOutcome: progress.lastOutcome } : {}),
			...(lastWrong ? { demotionReason: "wrong-answer" as const } : {}),
			explanation:
				"Recorded attempts exist without session-level mastery evidence; practice again to establish mastery.",
		};
	}

	const revisionChanged =
		question.revision !== undefined && evidence.revision !== question.revision;
	if (revisionChanged) {
		return {
			certificationId: question.certificationId,
			questionId: question.questionId,
			domainId: question.domainId,
			state: "learning",
			evidenceSource,
			consecutiveCorrectSessions: 0,
			spacingMs: 0,
			isStale: false,
			needsReview: true,
			revisionChanged: true,
			demotionReason: "revision-changed",
			...(progress?.lastEvaluatedAt !== undefined
				? { lastEvaluatedAt: progress.lastEvaluatedAt }
				: {}),
			...(progress?.lastOutcome !== undefined ? { lastOutcome: progress.lastOutcome } : {}),
			explanation:
				"Question content changed materially since your last attempt; re-verify on the current revision.",
		};
	}

	if (evidence.consecutiveCorrectSessions === 0) {
		return {
			certificationId: question.certificationId,
			questionId: question.questionId,
			domainId: question.domainId,
			state: "learning",
			evidenceSource,
			consecutiveCorrectSessions: 0,
			spacingMs: 0,
			isStale: false,
			needsReview: true,
			revisionChanged: false,
			demotionReason: evidence.lastDemotionReason ?? "wrong-answer",
			...(progress?.lastEvaluatedAt !== undefined
				? { lastEvaluatedAt: progress.lastEvaluatedAt }
				: {}),
			...(progress?.lastOutcome !== undefined ? { lastOutcome: progress.lastOutcome } : {}),
			explanation:
				"Latest evaluation was not fully correct; review and answer correctly across distinct sessions.",
		};
	}

	const spacingMs =
		evidence.streakStartedAt !== undefined && evidence.lastCorrectAt !== undefined
			? Math.max(0, evidence.lastCorrectAt - evidence.streakStartedAt)
			: 0;

	let state: MasteryState = "learning";
	let explanation = `Correct in ${evidence.consecutiveCorrectSessions} of ${MASTERY_POLICY.proficientMinSessions} distinct sessions needed for Proficient.`;

	if (
		evidence.consecutiveCorrectSessions >= MASTERY_POLICY.masteredMinSessions &&
		spacingMs >= MASTERY_POLICY.masteredMinSpacingMs
	) {
		state = "mastered";
		explanation = `Correct across ${evidence.consecutiveCorrectSessions} distinct sessions with at least 24 hours of spacing.`;
	} else if (evidence.consecutiveCorrectSessions >= MASTERY_POLICY.proficientMinSessions) {
		state = "proficient";
		explanation =
			evidence.consecutiveCorrectSessions >= MASTERY_POLICY.masteredMinSessions
				? `Correct across ${evidence.consecutiveCorrectSessions} distinct sessions; needs at least 24 hours between first and latest streak attempts for Mastered.`
				: `Correct across ${evidence.consecutiveCorrectSessions} distinct sessions; needs ${MASTERY_POLICY.masteredMinSessions} sessions with 24-hour spacing for Mastered.`;
	}

	const isStale =
		(state === "proficient" || state === "mastered") &&
		evidence.lastCorrectAt !== undefined &&
		now - evidence.lastCorrectAt >= MASTERY_POLICY.staleAfterMs;

	if (isStale) {
		const days = Math.floor((now - (evidence.lastCorrectAt ?? now)) / (24 * 60 * 60 * 1000));
		explanation = `${state === "mastered" ? "Mastered" : "Proficient"}, but last verified ${days} days ago (stale after ${MASTERY_POLICY.staleAfterMs / (24 * 60 * 60 * 1000)} days).`;
	}

	return {
		certificationId: question.certificationId,
		questionId: question.questionId,
		domainId: question.domainId,
		state,
		evidenceSource,
		consecutiveCorrectSessions: evidence.consecutiveCorrectSessions,
		spacingMs,
		isStale,
		needsReview: isStale,
		revisionChanged: false,
		...(evidence.lastDemotionReason ? { demotionReason: evidence.lastDemotionReason } : {}),
		...(progress?.lastEvaluatedAt !== undefined
			? { lastEvaluatedAt: progress.lastEvaluatedAt }
			: {}),
		...(evidence.lastCorrectAt !== undefined ? { lastCorrectAt: evidence.lastCorrectAt } : {}),
		...(progress?.lastOutcome !== undefined ? { lastOutcome: progress.lastOutcome } : {}),
		explanation,
	};
}

export function createEmptyMasteryCounts(): MasteryCounts {
	return {
		new: 0,
		learning: 0,
		proficient: 0,
		mastered: 0,
		stale: 0,
		revisionChanged: 0,
		legacyOnly: 0,
		total: 0,
	};
}

export function addAssessmentToMasteryCounts(
	counts: MasteryCounts,
	assessment: QuestionMasteryAssessment,
): void {
	counts[assessment.state] += 1;
	counts.total += 1;
	if (assessment.isStale) counts.stale += 1;
	if (assessment.revisionChanged) counts.revisionChanged += 1;
	if (assessment.evidenceSource === "legacy-only") counts.legacyOnly += 1;
}

export function generateReviewRecommendations(input: {
	assessments: readonly QuestionMasteryAssessment[];
	questionsByKey: ReadonlyMap<string, MasteryQuestionRef>;
	progressByKey: ReadonlyMap<string, QuestionProgress>;
	domains: readonly DomainMasterySnapshot[];
	basePath?: string;
	maxRecommendations?: number;
}): ReviewRecommendation[] {
	const basePath = input.basePath ?? "";
	const maxRecommendations = input.maxRecommendations ?? 6;
	const recommendations: ReviewRecommendation[] = [];

	// 1. Recently missed questions per certification (preserves weak-mode compatibility)
	const missedByCert = new Map<string, { subtitle: string; count: number; latestAt: number }>();
	for (const assessment of input.assessments) {
		const key = `${assessment.certificationId}\u0000${assessment.questionId}`;
		const progress = input.progressByKey.get(key);
		const isLastWrong =
			progress?.lastOutcome !== undefined
				? progress.lastOutcome !== "correct"
				: (progress?.legacyBaseline?.lastWrong ?? false);
		if (!isLastWrong) continue;
		const question = input.questionsByKey.get(key);
		if (!question) continue;
		const current = missedByCert.get(assessment.certificationId) ?? {
			subtitle: question.certificationSubtitle,
			count: 0,
			latestAt: -1,
		};
		current.count += 1;
		current.latestAt = Math.max(current.latestAt, progress?.lastEvaluatedAt ?? -1);
		missedByCert.set(assessment.certificationId, current);
	}

	const sortedMissed = [...missedByCert.entries()].sort(
		([idA, a], [idB, b]) => b.count - a.count || b.latestAt - a.latestAt || idA.localeCompare(idB),
	);
	for (const [certificationId, info] of sortedMissed) {
		const certSlug = encodeURIComponent(certificationId);
		recommendations.push({
			id: `recently-missed:${certificationId}`,
			category: "recently-missed",
			priority: 1,
			certificationId,
			certificationSubtitle: info.subtitle,
			title: `Review ${info.count} missed ${pluralize(info.count, "question")} (${info.subtitle})`,
			reason: `${info.count} ${pluralize(info.count, "question was", "questions were")} missed on the latest attempt. Retesting missed questions strengthens recall before expanding scope.`,
			sampleSize: info.count,
			practiceHref: `${basePath}certifications/${certSlug}/?mode=practice#session`,
			practiceLabel: "Review missed questions",
			studyHref: `${basePath}study/${certSlug}/`,
			studyLabel: "Open study notes",
		});
	}

	// 2. Materially revised questions needing re-verification
	const revisedDomains = input.domains
		.filter((domain) => domain.mastery.revisionChanged > 0)
		.sort(
			(a, b) =>
				b.mastery.revisionChanged - a.mastery.revisionChanged ||
				a.certificationId.localeCompare(b.certificationId) ||
				a.domainId.localeCompare(b.domainId),
		)
		.slice(0, 2);
	for (const domain of revisedDomains) {
		const certSlug = encodeURIComponent(domain.certificationId);
		const domSlug = encodeURIComponent(domain.domainId);
		const count = domain.mastery.revisionChanged;
		recommendations.push({
			id: `revision-changed:${domain.certificationId}:${domain.domainId}`,
			category: "revision-changed",
			priority: 2,
			certificationId: domain.certificationId,
			certificationSubtitle: domain.certificationSubtitle,
			domainId: domain.domainId,
			domainName: domain.domainName,
			title: `Re-verify ${count} updated ${pluralize(count, "question")} in ${domain.domainId} (${domain.certificationSubtitle})`,
			reason: `${count} previously practiced ${pluralize(count, "question has", "questions have")} been materially revised. Historical scores remain intact, but new attempts are needed for mastery.`,
			sampleSize: count,
			practiceHref: `${basePath}certifications/${certSlug}/?mode=practice&domain=${domSlug}#session`,
			practiceLabel: `Practice ${domain.domainId}`,
			studyHref: `${basePath}study/${certSlug}/#${domSlug}`,
			studyLabel: `Study ${domain.domainId}`,
		});
	}

	// 3. Weak domains (ONLY domains with sufficient evidence — never rank 0-sample or low-sample domains as worst accuracy)
	const weakDomains = input.domains
		.filter((domain) => {
			if (!domain.hasSufficientEvidence || domain.accuracy.attempts === 0) return false;
			const accuracyPercent = (domain.accuracy.correct / domain.accuracy.attempts) * 100;
			return accuracyPercent < MASTERY_POLICY.weakDomainAccuracyThresholdPercent;
		})
		.sort((a, b) => {
			const rateA = a.accuracy.correct / a.accuracy.attempts;
			const rateB = b.accuracy.correct / b.accuracy.attempts;
			const weightA = a.blueprintSource === "official" ? (a.examWeight ?? 0) : 0;
			const weightB = b.blueprintSource === "official" ? (b.examWeight ?? 0) : 0;
			return (
				rateA - rateB ||
				weightB - weightA ||
				b.accuracy.attempts - a.accuracy.attempts ||
				a.certificationId.localeCompare(b.certificationId) ||
				a.domainId.localeCompare(b.domainId)
			);
		})
		.slice(0, 2);

	for (const domain of weakDomains) {
		const certSlug = encodeURIComponent(domain.certificationId);
		const domSlug = encodeURIComponent(domain.domainId);
		const rate = Math.round((domain.accuracy.correct / domain.accuracy.attempts) * 100);
		const weightSuffix =
			domain.blueprintSource === "official" && domain.examWeight !== undefined
				? ` · ${domain.examWeight}% official exam blueprint weight`
				: "";
		recommendations.push({
			id: `weak-domain:${domain.certificationId}:${domain.domainId}`,
			category: "weak-domain",
			priority: 3,
			certificationId: domain.certificationId,
			certificationSubtitle: domain.certificationSubtitle,
			domainId: domain.domainId,
			domainName: domain.domainName,
			title: `Strengthen ${domain.domainId} ${domain.domainName} (${domain.certificationSubtitle})`,
			reason: `${rate}% accuracy across ${domain.accuracy.attempts} attempts (${domain.accuracy.correct}/${domain.accuracy.attempts})${weightSuffix}. Below the ${MASTERY_POLICY.weakDomainAccuracyThresholdPercent}% review threshold.`,
			sampleSize: domain.accuracy.attempts,
			practiceHref: `${basePath}certifications/${certSlug}/?mode=practice&domain=${domSlug}#session`,
			practiceLabel: `Practice ${domain.domainId}`,
			studyHref: `${basePath}study/${certSlug}/#${domSlug}`,
			studyLabel: `Study ${domain.domainId}`,
		});
	}

	// 4. Stale knowledge (proficient or mastered questions not verified within staleAfterMs)
	const oldestStaleByDomain = new Map<string, number>();
	for (const assessment of input.assessments) {
		if (!assessment.isStale) continue;
		const domainKey = `${assessment.certificationId}\u0000${assessment.domainId}`;
		const ts = assessment.lastCorrectAt ?? Number.MAX_SAFE_INTEGER;
		oldestStaleByDomain.set(domainKey, Math.min(oldestStaleByDomain.get(domainKey) ?? ts, ts));
	}
	const staleDomains = input.domains
		.filter((domain) => domain.mastery.stale > 0)
		.sort((a, b) => {
			const keyA = `${a.certificationId}\u0000${a.domainId}`;
			const keyB = `${b.certificationId}\u0000${b.domainId}`;
			return (
				b.mastery.stale - a.mastery.stale ||
				(oldestStaleByDomain.get(keyA) ?? 0) - (oldestStaleByDomain.get(keyB) ?? 0) ||
				a.certificationId.localeCompare(b.certificationId) ||
				a.domainId.localeCompare(b.domainId)
			);
		})
		.slice(0, 2);

	const staleDays = Math.round(MASTERY_POLICY.staleAfterMs / (24 * 60 * 60 * 1000));
	for (const domain of staleDomains) {
		const certSlug = encodeURIComponent(domain.certificationId);
		const domSlug = encodeURIComponent(domain.domainId);
		const count = domain.mastery.stale;
		recommendations.push({
			id: `stale-knowledge:${domain.certificationId}:${domain.domainId}`,
			category: "stale-knowledge",
			priority: 4,
			certificationId: domain.certificationId,
			certificationSubtitle: domain.certificationSubtitle,
			domainId: domain.domainId,
			domainName: domain.domainName,
			title: `Refresh ${count} stale ${pluralize(count, "question")} in ${domain.domainId} (${domain.certificationSubtitle})`,
			reason: `${count} proficient or mastered ${pluralize(count, "question has", "questions have")} not been verified in at least ${staleDays} days.`,
			sampleSize: count,
			practiceHref: `${basePath}certifications/${certSlug}/?mode=practice&domain=${domSlug}#session`,
			practiceLabel: `Practice ${domain.domainId}`,
			studyHref: `${basePath}study/${certSlug}/#${domSlug}`,
			studyLabel: `Study ${domain.domainId}`,
		});
	}

	// 5. Unseen questions (prioritizing zero-coverage domains and official exam blueprint weights where labeled)
	const unseenDomains = input.domains
		.filter((domain) => domain.mastery.new > 0)
		.sort((a, b) => {
			const zeroA = a.coverage.evaluated === 0 ? 0 : 1;
			const zeroB = b.coverage.evaluated === 0 ? 0 : 1;
			const weightA = a.blueprintSource === "official" ? (a.examWeight ?? 0) : 0;
			const weightB = b.blueprintSource === "official" ? (b.examWeight ?? 0) : 0;
			return (
				zeroA - zeroB ||
				weightB - weightA ||
				b.mastery.new - a.mastery.new ||
				a.certificationId.localeCompare(b.certificationId) ||
				a.domainId.localeCompare(b.domainId)
			);
		})
		.slice(0, 2);

	for (const domain of unseenDomains) {
		const certSlug = encodeURIComponent(domain.certificationId);
		const domSlug = encodeURIComponent(domain.domainId);
		const weightSuffix =
			domain.blueprintSource === "official" && domain.examWeight !== undefined
				? ` · ${domain.examWeight}% official exam blueprint weight`
				: "";
		recommendations.push({
			id: `unseen-questions:${domain.certificationId}:${domain.domainId}`,
			category: "unseen-questions",
			priority: 5,
			certificationId: domain.certificationId,
			certificationSubtitle: domain.certificationSubtitle,
			domainId: domain.domainId,
			domainName: domain.domainName,
			title: `Explore ${domain.mastery.new} unseen ${pluralize(domain.mastery.new, "question")} in ${domain.domainId} (${domain.certificationSubtitle})`,
			reason: `${domain.coverage.evaluated}/${domain.coverage.eligible} questions evaluated in ${domain.domainName}${domain.coverage.evaluated === 0 ? " (insufficient evidence — not yet started)" : ""}${weightSuffix}.`,
			sampleSize: domain.mastery.new,
			practiceHref: `${basePath}certifications/${certSlug}/?mode=practice&domain=${domSlug}#session`,
			practiceLabel: `Practice ${domain.domainId}`,
			studyHref: `${basePath}study/${certSlug}/#${domSlug}`,
			studyLabel: `Study ${domain.domainId}`,
		});
	}

	return recommendations
		.sort(
			(a, b) =>
				a.priority - b.priority ||
				a.certificationId.localeCompare(b.certificationId) ||
				(a.domainId ?? "").localeCompare(b.domainId ?? "") ||
				a.id.localeCompare(b.id),
		)
		.slice(0, maxRecommendations);
}

function pluralize(count: number, singular: string, plural = `${singular}s`): string {
	return count === 1 ? singular : plural;
}
