import { compareAttemptsChronologically } from "./mastery";
import type { EvaluationOutcome, QuestionAttempt, QuestionProgress } from "./model";

export const REVIEW_SCHEDULER_POLICY_VERSION = "review-v1" as const;

export const REVIEW_SCHEDULER_POLICY = Object.freeze({
	version: REVIEW_SCHEDULER_POLICY_VERSION,
	/** Fixed-step calendar-day intervals for consecutive on-time/overdue correct reviews. */
	successIntervalsDays: Object.freeze([1, 3, 7, 14, 30] as const),
	/** Calendar-day interval after an incorrect or partial answer. */
	failureIntervalDays: 1,
	/** Upper bound in calendar days for any scheduled interval. */
	maxIntervalDays: 30,
	/** Due dates are stored as floating local calendar dates (YYYY-MM-DD), immune to DST hour shifts. */
	dueDateTimezone: "floating-local" as const,
});

export interface ReviewClock {
	timeZone?: string;

	now(): number;
}

export const SYSTEM_REVIEW_CLOCK: ReviewClock = {
	now: () => Date.now(),
};

export interface QuestionReviewSchedule {
	policyVersion: typeof REVIEW_SCHEDULER_POLICY_VERSION;
	revision: string;
	intervalDays: number;
	stepIndex: number;
	consecutiveCorrect: number;
	lastOutcome: EvaluationOutcome;
	lastEvaluatedAt: number;
	lastAttemptSessionId: string;
	/** Floating local calendar date (YYYY-MM-DD) when the next review becomes due. */
	dueDate: string;
	dueDateTimezone: "floating-local";
	/** Time zone used when deriving dueDate from lastEvaluatedAt for deterministic rebuilds. */
	scheduledInTimeZone?: string;
}

export type ReviewDueStatus = "overdue" | "due" | "revision-changed" | "upcoming" | "unscheduled";

export interface ReviewQuestionRef {
	certificationId: string;
	certificationSubtitle: string;
	questionId: string;
	domainId: string;
	domainName: string;
	revision?: string;
}

export interface ReviewQueueItem {
	certificationId: string;
	certificationSubtitle: string;
	questionId: string;
	domainId: string;
	domainName: string;
	status: ReviewDueStatus;
	isDue: boolean;
	daysOverdue: number;
	daysUntilDue: number;
	dueDate?: string;
	intervalDays?: number;
	lastOutcome?: EvaluationOutcome;
	lastEvaluatedAt?: number;
	revisionChanged: boolean;
	reason: string;
}

export interface ReviewQueueCounts {
	overdue: number;
	dueToday: number;
	revisionChanged: number;
	dueNow: number;
	upcoming: number;
	unscheduled: number;
	legacyOnly: number;
	total: number;
}

export interface CertificationReviewQueue {
	certificationId: string;
	certificationSubtitle: string;
	counts: ReviewQueueCounts;
	dueItems: ReviewQueueItem[];
	nextDueDate?: string;
}

export interface ReviewQueueSummary {
	policy: typeof REVIEW_SCHEDULER_POLICY;
	today: string;
	counts: ReviewQueueCounts;
	dueItems: ReviewQueueItem[];
	byCertification: CertificationReviewQueue[];
	nextDueDate?: string;
}

const CALENDAR_DATE_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;
const MS_PER_DAY = 86_400_000;

export function getSystemTimeZone(): string {
	try {
		return Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
	} catch {
		return "UTC";
	}
}

export function isValidCalendarDate(value: string): boolean {
	const match = CALENDAR_DATE_PATTERN.exec(value);
	if (!match) return false;
	const year = Number(match[1]);
	const month = Number(match[2]);
	const day = Number(match[3]);
	const date = new Date(Date.UTC(year, month - 1, day));
	return (
		date.getUTCFullYear() === year && date.getUTCMonth() + 1 === month && date.getUTCDate() === day
	);
}

export function toLocalCalendarDate(timestampMs: number, timeZone?: string): string {
	const resolvedTimeZone = normalizeTimeZone(timeZone);
	const parts = new Intl.DateTimeFormat("en-CA", {
		timeZone: resolvedTimeZone,
		year: "numeric",
		month: "2-digit",
		day: "2-digit",
	}).formatToParts(new Date(timestampMs));
	const year = parts.find((part) => part.type === "year")?.value;
	const month = parts.find((part) => part.type === "month")?.value;
	const day = parts.find((part) => part.type === "day")?.value;
	if (!year || !month || !day) {
		const fallback = new Date(timestampMs);
		return formatUtcCalendarDate(
			fallback.getUTCFullYear(),
			fallback.getUTCMonth() + 1,
			fallback.getUTCDate(),
		);
	}
	return `${year.padStart(4, "0")}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
}

export function addCalendarDays(calendarDate: string, days: number): string {
	const parsed = parseCalendarDate(calendarDate);
	const shifted = new Date(Date.UTC(parsed.year, parsed.month - 1, parsed.day + days));
	return formatUtcCalendarDate(
		shifted.getUTCFullYear(),
		shifted.getUTCMonth() + 1,
		shifted.getUTCDate(),
	);
}

export function diffCalendarDays(fromDate: string, toDate: string): number {
	const from = parseCalendarDate(fromDate);
	const to = parseCalendarDate(toDate);
	const fromUtc = Date.UTC(from.year, from.month - 1, from.day);
	const toUtc = Date.UTC(to.year, to.month - 1, to.day);
	return Math.round((toUtc - fromUtc) / MS_PER_DAY);
}

export function applyAttemptToReviewSchedule(
	current: QuestionReviewSchedule | undefined,
	attempt: QuestionAttempt,
	options: { timeZone?: string } = {},
): QuestionReviewSchedule {
	if (
		current &&
		current.policyVersion === REVIEW_SCHEDULER_POLICY_VERSION &&
		current.lastAttemptSessionId === attempt.sessionId
	) {
		return { ...current };
	}

	const timeZone = normalizeTimeZone(
		options.timeZone ?? current?.scheduledInTimeZone ?? getSystemTimeZone(),
	);
	const evaluatedDate = toLocalCalendarDate(attempt.evaluatedAt, timeZone);
	const revisionChanged = current !== undefined && current.revision !== attempt.questionRevision;
	const policyChanged =
		current !== undefined && current.policyVersion !== REVIEW_SCHEDULER_POLICY_VERSION;

	if (attempt.outcome !== "correct") {
		const intervalDays = REVIEW_SCHEDULER_POLICY.failureIntervalDays;
		return {
			policyVersion: REVIEW_SCHEDULER_POLICY_VERSION,
			revision: attempt.questionRevision,
			intervalDays,
			stepIndex: 0,
			consecutiveCorrect: 0,
			lastOutcome: attempt.outcome,
			lastEvaluatedAt: attempt.evaluatedAt,
			lastAttemptSessionId: attempt.sessionId,
			dueDate: addCalendarDays(evaluatedDate, intervalDays),
			dueDateTimezone: REVIEW_SCHEDULER_POLICY.dueDateTimezone,
			scheduledInTimeZone: timeZone,
		};
	}

	const steps = REVIEW_SCHEDULER_POLICY.successIntervalsDays;
	if (!current || revisionChanged || policyChanged || current.consecutiveCorrect === 0) {
		const intervalDays = Math.min(steps[0], REVIEW_SCHEDULER_POLICY.maxIntervalDays);
		return {
			policyVersion: REVIEW_SCHEDULER_POLICY_VERSION,
			revision: attempt.questionRevision,
			intervalDays,
			stepIndex: 0,
			consecutiveCorrect: 1,
			lastOutcome: attempt.outcome,
			lastEvaluatedAt: attempt.evaluatedAt,
			lastAttemptSessionId: attempt.sessionId,
			dueDate: addCalendarDays(evaluatedDate, intervalDays),
			dueDateTimezone: REVIEW_SCHEDULER_POLICY.dueDateTimezone,
			scheduledInTimeZone: timeZone,
		};
	}

	const isDueOrOverdue = diffCalendarDays(current.dueDate, evaluatedDate) >= 0;
	if (isDueOrOverdue) {
		const nextStep = Math.min(current.stepIndex + 1, steps.length - 1);
		const intervalDays = Math.min(steps[nextStep], REVIEW_SCHEDULER_POLICY.maxIntervalDays);
		return {
			policyVersion: REVIEW_SCHEDULER_POLICY_VERSION,
			revision: attempt.questionRevision,
			intervalDays,
			stepIndex: nextStep,
			consecutiveCorrect: current.consecutiveCorrect + 1,
			lastOutcome: attempt.outcome,
			lastEvaluatedAt: attempt.evaluatedAt,
			lastAttemptSessionId: attempt.sessionId,
			dueDate: addCalendarDays(evaluatedDate, intervalDays),
			dueDateTimezone: REVIEW_SCHEDULER_POLICY.dueDateTimezone,
			scheduledInTimeZone: timeZone,
		};
	}

	const candidateDueDate = addCalendarDays(evaluatedDate, current.intervalDays);
	const dueDate =
		diffCalendarDays(current.dueDate, candidateDueDate) >= 0 ? candidateDueDate : current.dueDate;
	return {
		policyVersion: REVIEW_SCHEDULER_POLICY_VERSION,
		revision: attempt.questionRevision,
		intervalDays: current.intervalDays,
		stepIndex: current.stepIndex,
		consecutiveCorrect: current.consecutiveCorrect + 1,
		lastOutcome: attempt.outcome,
		lastEvaluatedAt: attempt.evaluatedAt,
		lastAttemptSessionId: attempt.sessionId,
		dueDate,
		dueDateTimezone: REVIEW_SCHEDULER_POLICY.dueDateTimezone,
		scheduledInTimeZone: timeZone,
	};
}

export function deriveReviewScheduleFromAttempts(
	attempts: readonly QuestionAttempt[],
	options: { timeZone?: string } = {},
): QuestionReviewSchedule | undefined {
	if (attempts.length === 0) return undefined;
	const sorted = [...attempts].sort(compareAttemptsChronologically);
	let schedule: QuestionReviewSchedule | undefined;
	for (const attempt of sorted) {
		schedule = applyAttemptToReviewSchedule(schedule, attempt, options);
	}
	return schedule;
}

export function needsReviewScheduleUpgrade(
	schedule: { policyVersion?: unknown } | undefined,
): boolean {
	return schedule !== undefined && schedule.policyVersion !== REVIEW_SCHEDULER_POLICY_VERSION;
}

export function reviewScheduleEquals(
	a: QuestionReviewSchedule | undefined,
	b: QuestionReviewSchedule | undefined,
): boolean {
	if (a === b) return true;
	if (!a || !b) return false;
	return (
		a.policyVersion === b.policyVersion &&
		a.revision === b.revision &&
		a.intervalDays === b.intervalDays &&
		a.stepIndex === b.stepIndex &&
		a.consecutiveCorrect === b.consecutiveCorrect &&
		a.lastOutcome === b.lastOutcome &&
		a.lastEvaluatedAt === b.lastEvaluatedAt &&
		a.lastAttemptSessionId === b.lastAttemptSessionId &&
		a.dueDate === b.dueDate &&
		a.dueDateTimezone === b.dueDateTimezone &&
		a.scheduledInTimeZone === b.scheduledInTimeZone
	);
}

export function assessQuestionReviewStatus(
	question: ReviewQuestionRef,
	progress: QuestionProgress | undefined,
	clock: ReviewClock = SYSTEM_REVIEW_CLOCK,
): ReviewQueueItem {
	const hasRecorded = (progress?.attemptCount ?? 0) > 0;
	const schedule = progress?.reviewSchedule;

	if (!hasRecorded || !schedule) {
		const hasLegacy = (progress?.legacyBaseline?.attempts ?? 0) > 0;
		return {
			certificationId: question.certificationId,
			certificationSubtitle: question.certificationSubtitle,
			questionId: question.questionId,
			domainId: question.domainId,
			domainName: question.domainName,
			status: "unscheduled",
			isDue: false,
			daysOverdue: 0,
			daysUntilDue: 0,
			revisionChanged: false,
			reason: hasLegacy
				? "Imported legacy totals have no evaluation dates; answer once to schedule reviews."
				: "No evaluated attempts yet.",
		};
	}

	const revisionChanged =
		question.revision !== undefined && schedule.revision !== question.revision;
	if (revisionChanged) {
		return {
			certificationId: question.certificationId,
			certificationSubtitle: question.certificationSubtitle,
			questionId: question.questionId,
			domainId: question.domainId,
			domainName: question.domainName,
			status: "revision-changed",
			isDue: true,
			daysOverdue: 0,
			daysUntilDue: 0,
			dueDate: schedule.dueDate,
			intervalDays: schedule.intervalDays,
			lastOutcome: schedule.lastOutcome,
			lastEvaluatedAt: schedule.lastEvaluatedAt,
			revisionChanged: true,
			reason:
				"Question content changed materially since your last attempt; re-verify on the current revision.",
		};
	}

	const today = toLocalCalendarDate(clock.now(), clock.timeZone);
	const delta = diffCalendarDays(schedule.dueDate, today);

	if (delta > 0) {
		return {
			certificationId: question.certificationId,
			certificationSubtitle: question.certificationSubtitle,
			questionId: question.questionId,
			domainId: question.domainId,
			domainName: question.domainName,
			status: "overdue",
			isDue: true,
			daysOverdue: delta,
			daysUntilDue: 0,
			dueDate: schedule.dueDate,
			intervalDays: schedule.intervalDays,
			lastOutcome: schedule.lastOutcome,
			lastEvaluatedAt: schedule.lastEvaluatedAt,
			revisionChanged: false,
			reason: `Overdue by ${delta} ${delta === 1 ? "day" : "days"} (due ${schedule.dueDate}).`,
		};
	}

	if (delta === 0) {
		const reason =
			schedule.lastOutcome !== "correct"
				? `Due today after a missed answer (${schedule.intervalDays}-day review interval).`
				: `Due today (${schedule.intervalDays}-day review interval).`;
		return {
			certificationId: question.certificationId,
			certificationSubtitle: question.certificationSubtitle,
			questionId: question.questionId,
			domainId: question.domainId,
			domainName: question.domainName,
			status: "due",
			isDue: true,
			daysOverdue: 0,
			daysUntilDue: 0,
			dueDate: schedule.dueDate,
			intervalDays: schedule.intervalDays,
			lastOutcome: schedule.lastOutcome,
			lastEvaluatedAt: schedule.lastEvaluatedAt,
			revisionChanged: false,
			reason,
		};
	}

	const daysUntilDue = Math.abs(delta);
	return {
		certificationId: question.certificationId,
		certificationSubtitle: question.certificationSubtitle,
		questionId: question.questionId,
		domainId: question.domainId,
		domainName: question.domainName,
		status: "upcoming",
		isDue: false,
		daysOverdue: 0,
		daysUntilDue,
		dueDate: schedule.dueDate,
		intervalDays: schedule.intervalDays,
		lastOutcome: schedule.lastOutcome,
		lastEvaluatedAt: schedule.lastEvaluatedAt,
		revisionChanged: false,
		reason: `Scheduled for ${schedule.dueDate} (${daysUntilDue} ${daysUntilDue === 1 ? "day" : "days"} remaining).`,
	};
}

export function createEmptyReviewQueueCounts(): ReviewQueueCounts {
	return {
		overdue: 0,
		dueToday: 0,
		revisionChanged: 0,
		dueNow: 0,
		upcoming: 0,
		unscheduled: 0,
		legacyOnly: 0,
		total: 0,
	};
}

export function buildReviewQueue(
	questions: readonly ReviewQuestionRef[],
	progressByKey: ReadonlyMap<string, QuestionProgress>,
	clock: ReviewClock = SYSTEM_REVIEW_CLOCK,
): ReviewQueueSummary {
	const today = toLocalCalendarDate(clock.now(), clock.timeZone);
	const counts = createEmptyReviewQueueCounts();
	const dueItems: ReviewQueueItem[] = [];
	let nextDueDate: string | undefined;

	const certBuckets = new Map<
		string,
		{
			subtitle: string;
			counts: ReviewQueueCounts;
			dueItems: ReviewQueueItem[];
			nextDueDate?: string;
		}
	>();

	for (const question of questions) {
		const key = `${question.certificationId}\u0000${question.questionId}`;
		const progress = progressByKey.get(key);
		const item = assessQuestionReviewStatus(question, progress, clock);
		const isLegacyOnly =
			(progress?.attemptCount ?? 0) === 0 && (progress?.legacyBaseline?.attempts ?? 0) > 0;

		const bucket = certBuckets.get(question.certificationId) ?? {
			subtitle: question.certificationSubtitle,
			counts: createEmptyReviewQueueCounts(),
			dueItems: [],
		};

		addItemToCounts(counts, item, isLegacyOnly);
		addItemToCounts(bucket.counts, item, isLegacyOnly);

		if (item.isDue) {
			dueItems.push(item);
			bucket.dueItems.push(item);
		} else if (item.status === "upcoming" && item.dueDate) {
			nextDueDate = minCalendarDate(nextDueDate, item.dueDate);
			bucket.nextDueDate = minCalendarDate(bucket.nextDueDate, item.dueDate);
		}

		certBuckets.set(question.certificationId, bucket);
	}

	dueItems.sort(compareDueQueueItems);
	const byCertification: CertificationReviewQueue[] = [...certBuckets.entries()]
		.map(([certificationId, bucket]) => ({
			certificationId,
			certificationSubtitle: bucket.subtitle,
			counts: bucket.counts,
			dueItems: bucket.dueItems.sort(compareDueQueueItems),
			...(bucket.nextDueDate ? { nextDueDate: bucket.nextDueDate } : {}),
		}))
		.sort(
			(a, b) =>
				b.counts.overdue - a.counts.overdue ||
				b.counts.dueNow - a.counts.dueNow ||
				a.certificationSubtitle.localeCompare(b.certificationSubtitle),
		);

	return {
		policy: REVIEW_SCHEDULER_POLICY,
		today,
		counts,
		dueItems,
		byCertification,
		...(nextDueDate ? { nextDueDate } : {}),
	};
}

function addItemToCounts(
	counts: ReviewQueueCounts,
	item: ReviewQueueItem,
	isLegacyOnly: boolean,
): void {
	counts.total += 1;
	if (isLegacyOnly) counts.legacyOnly += 1;
	if (item.status === "overdue") {
		counts.overdue += 1;
		counts.dueNow += 1;
	} else if (item.status === "due") {
		counts.dueToday += 1;
		counts.dueNow += 1;
	} else if (item.status === "revision-changed") {
		counts.revisionChanged += 1;
		counts.dueNow += 1;
	} else if (item.status === "upcoming") {
		counts.upcoming += 1;
	} else {
		counts.unscheduled += 1;
	}
}

function compareDueQueueItems(a: ReviewQueueItem, b: ReviewQueueItem): number {
	const rankA = dueStatusRank(a.status);
	const rankB = dueStatusRank(b.status);
	if (rankA !== rankB) return rankA - rankB;
	if (a.daysOverdue !== b.daysOverdue) return b.daysOverdue - a.daysOverdue;
	const missA = a.lastOutcome !== undefined && a.lastOutcome !== "correct" ? 0 : 1;
	const missB = b.lastOutcome !== undefined && b.lastOutcome !== "correct" ? 0 : 1;
	if (missA !== missB) return missA - missB;
	const evalA = a.lastEvaluatedAt ?? 0;
	const evalB = b.lastEvaluatedAt ?? 0;
	if (evalA !== evalB) return evalA - evalB;
	return (
		a.certificationId.localeCompare(b.certificationId) || a.questionId.localeCompare(b.questionId)
	);
}

function dueStatusRank(status: ReviewDueStatus): number {
	if (status === "overdue") return 0;
	if (status === "revision-changed") return 1;
	if (status === "due") return 2;
	if (status === "upcoming") return 3;
	return 4;
}

function minCalendarDate(current: string | undefined, candidate: string): string {
	if (!current) return candidate;
	return candidate < current ? candidate : current;
}

function parseCalendarDate(value: string): { year: number; month: number; day: number } {
	const match = CALENDAR_DATE_PATTERN.exec(value);
	if (!match) throw new RangeError(`Invalid calendar date: ${value}`);
	return { year: Number(match[1]), month: Number(match[2]), day: Number(match[3]) };
}

function formatUtcCalendarDate(year: number, month: number, day: number): string {
	return `${String(year).padStart(4, "0")}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

function normalizeTimeZone(timeZone: string | undefined): string {
	if (!timeZone || timeZone.trim().length === 0) return getSystemTimeZone();
	try {
		new Intl.DateTimeFormat("en-CA", { timeZone });
		return timeZone;
	} catch {
		return "UTC";
	}
}
