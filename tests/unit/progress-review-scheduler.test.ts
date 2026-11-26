import "fake-indexeddb/auto";
import { deleteDB } from "idb";
import { afterEach, describe, expect, it } from "vitest";
import { parseProgressBackup } from "../../src/lib/progress/backup-restore";
import { openProgressDatabase } from "../../src/lib/progress/database";
import { createProgressRepository } from "../../src/lib/progress/indexeddb-repository";
import { createLearningBackup, parseLearningBackup } from "../../src/lib/progress/learning-backup";
import {
	createInitialSession,
	createQuestionAttempt,
	type EvaluationOutcome,
	type LearningDataSnapshot,
	projectQuestionAttempts,
	type QuestionAttempt,
	type QuestionProgress,
} from "../../src/lib/progress/model";
import {
	addCalendarDays,
	applyAttemptToReviewSchedule,
	assessQuestionReviewStatus,
	buildReviewQueue,
	deriveReviewScheduleFromAttempts,
	diffCalendarDays,
	isValidCalendarDate,
	needsReviewScheduleUpgrade,
	type QuestionReviewSchedule,
	REVIEW_SCHEDULER_POLICY,
	REVIEW_SCHEDULER_POLICY_VERSION,
	type ReviewClock,
	type ReviewQuestionRef,
	toLocalCalendarDate,
} from "../../src/lib/progress/review-scheduler";
import { PROGRESS_DATABASE_NAME } from "../../src/lib/progress/schema";

const CERT_ID = "ccdv-f";
const SESSION_1 = "00000000-0000-4000-8000-000000000001";
const SESSION_2 = "00000000-0000-4000-8000-000000000002";
const SESSION_3 = "00000000-0000-4000-8000-000000000003";
const SESSION_4 = "00000000-0000-4000-8000-000000000004";
const SESSION_5 = "00000000-0000-4000-8000-000000000005";
const SESSION_6 = "00000000-0000-4000-8000-000000000006";

function utcMs(iso: string): number {
	return Date.parse(iso);
}

function makeClock(iso: string, timeZone = "UTC"): ReviewClock {
	return { now: () => utcMs(iso), timeZone };
}

function makeAttempt(
	sessionId: string,
	outcome: EvaluationOutcome,
	evaluatedAt: number,
	overrides: Partial<QuestionAttempt> = {},
): QuestionAttempt {
	return {
		sessionId,
		questionId: "q-1",
		certificationId: CERT_ID,
		domainId: "D1",
		questionRevision: "rev-1",
		selectedOptionIds: ["opt-a"],
		outcome,
		scoreEarned: outcome === "correct" ? 1 : 0,
		scorePossible: 1,
		evaluatedAt,
		...overrides,
	};
}

function makeQuestionRef(overrides: Partial<ReviewQuestionRef> = {}): ReviewQuestionRef {
	return {
		certificationId: CERT_ID,
		certificationSubtitle: "CCDV-F",
		questionId: "q-1",
		domainId: "D1",
		domainName: "Domain 1",
		revision: "rev-1",
		...overrides,
	};
}

function makeSession(
	id: string,
	mode: "practice" | "exam" | "weak" | "review",
	startedAt: number,
	questionIds: string[] = ["q-1", "q-2"],
) {
	return createInitialSession({
		id,
		certificationId: CERT_ID,
		mode,
		startedAt,
		scoring: {
			revision: "scoring-v1",
			passingScore: 700,
			totalQuestions: questionIds.length,
			domainWeights: { D1: 100 },
		},
		checkpoint: {
			currentQuestionId: questionIds[0] ?? null,
			deadlineAt: null,
			selectedOptionIdsByQuestion: Object.fromEntries(questionIds.map((qId) => [qId, ["opt-a"]])),
			checkedQuestionIds: [],
			flaggedQuestionIds: [],
		},
		content: {
			bankRevision: "bank-v1",
			questions: questionIds.map((questionId) => ({
				questionId,
				revision: "rev-1",
				contentHash: `sha256:${questionId}`,
				domainId: "D1",
				optionIds: ["opt-a", "opt-b"],
				optionTexts: ["Correct", "Incorrect"],
				displayOptionIds: ["opt-a", "opt-b"],
				correctOptionIds: ["opt-a"],
				questionText: `Question ${questionId}`,
				domainName: "Domain 1",
				explanation: "Explanation",
				sourceLabel: "Guide",
				sourceUrl: "https://example.test/guide",
				selectCount: 1,
			})),
		},
	});
}

describe("review scheduling policy (review-v1)", () => {
	afterEach(async () => {
		await deleteDB(PROGRESS_DATABASE_NAME);
	});

	it("advances through the fixed-step interval ladder and caps at maxIntervalDays", () => {
		const attempts = [
			makeAttempt(SESSION_1, "correct", utcMs("2026-03-01T10:00:00Z")), // -> +1d = 2026-03-02
			makeAttempt(SESSION_2, "correct", utcMs("2026-03-02T10:00:00Z")), // -> +3d = 2026-03-05
			makeAttempt(SESSION_3, "correct", utcMs("2026-03-05T10:00:00Z")), // -> +7d = 2026-03-12
			makeAttempt(SESSION_4, "correct", utcMs("2026-03-12T10:00:00Z")), // -> +14d = 2026-03-26
			makeAttempt(SESSION_5, "correct", utcMs("2026-03-26T10:00:00Z")), // -> +30d = 2026-04-25
			makeAttempt(SESSION_6, "correct", utcMs("2026-04-25T10:00:00Z")), // -> capped at +30d = 2026-05-25
		];

		let schedule: QuestionReviewSchedule | undefined;
		const expected = [
			{ intervalDays: 1, stepIndex: 0, dueDate: "2026-03-02" },
			{ intervalDays: 3, stepIndex: 1, dueDate: "2026-03-05" },
			{ intervalDays: 7, stepIndex: 2, dueDate: "2026-03-12" },
			{ intervalDays: 14, stepIndex: 3, dueDate: "2026-03-26" },
			{ intervalDays: 30, stepIndex: 4, dueDate: "2026-04-25" },
			{ intervalDays: 30, stepIndex: 4, dueDate: "2026-05-25" },
		];

		for (let i = 0; i < attempts.length; i += 1) {
			schedule = applyAttemptToReviewSchedule(schedule, attempts[i], { timeZone: "UTC" });
			expect(schedule.policyVersion).toBe(REVIEW_SCHEDULER_POLICY_VERSION);
			expect(schedule.intervalDays).toBe(expected[i].intervalDays);
			expect(schedule.stepIndex).toBe(expected[i].stepIndex);
			expect(schedule.dueDate).toBe(expected[i].dueDate);
			expect(schedule.intervalDays).toBeLessThanOrEqual(REVIEW_SCHEDULER_POLICY.maxIntervalDays);
		}
	});

	it("resets streak and interval to 1 day on incorrect or partial answers", () => {
		let schedule = deriveReviewScheduleFromAttempts(
			[
				makeAttempt(SESSION_1, "correct", utcMs("2026-03-01T10:00:00Z")),
				makeAttempt(SESSION_2, "correct", utcMs("2026-03-02T10:00:00Z")),
				makeAttempt(SESSION_3, "correct", utcMs("2026-03-05T10:00:00Z")),
			],
			{ timeZone: "UTC" },
		);
		expect(schedule?.intervalDays).toBe(7);

		schedule = applyAttemptToReviewSchedule(
			schedule,
			makeAttempt(SESSION_4, "incorrect", utcMs("2026-03-12T12:00:00Z")),
			{ timeZone: "UTC" },
		);
		expect(schedule).toMatchObject({
			intervalDays: 1,
			stepIndex: 0,
			consecutiveCorrect: 0,
			lastOutcome: "incorrect",
			dueDate: "2026-03-13",
		});

		const partial = applyAttemptToReviewSchedule(
			schedule,
			makeAttempt(SESSION_5, "partial", utcMs("2026-03-13T12:00:00Z")),
			{ timeZone: "UTC" },
		);
		expect(partial).toMatchObject({
			intervalDays: 1,
			stepIndex: 0,
			consecutiveCorrect: 0,
			lastOutcome: "partial",
			dueDate: "2026-03-14",
		});
	});

	it("does not inflate intervals on early same-day repetition and stays idempotent on retries", () => {
		const first = applyAttemptToReviewSchedule(
			undefined,
			makeAttempt(SESSION_1, "correct", utcMs("2026-03-01T09:00:00Z")),
			{ timeZone: "UTC" },
		);
		// Retry of exact same session is strictly idempotent
		const retry = applyAttemptToReviewSchedule(
			first,
			makeAttempt(SESSION_1, "correct", utcMs("2026-03-01T09:00:00Z")),
			{ timeZone: "UTC" },
		);
		expect(retry).toEqual(first);

		// Different session later the same afternoon (before dueDate 2026-03-02) does not advance step
		const earlyRepeat = applyAttemptToReviewSchedule(
			first,
			makeAttempt(SESSION_2, "correct", utcMs("2026-03-01T16:00:00Z")),
			{ timeZone: "UTC" },
		);
		expect(earlyRepeat.stepIndex).toBe(0);
		expect(earlyRepeat.intervalDays).toBe(1);
		expect(earlyRepeat.dueDate).toBe("2026-03-02");
	});

	it("handles overdue reviews accurately and advances from the actual evaluation date", () => {
		const [progress] = projectQuestionAttempts(
			[
				makeAttempt(SESSION_1, "correct", utcMs("2026-03-01T10:00:00Z")),
				makeAttempt(SESSION_2, "correct", utcMs("2026-03-02T10:00:00Z")), // due 2026-03-05
			],
			[],
			{ timeZone: "UTC" },
		);

		const overdueStatus = assessQuestionReviewStatus(
			makeQuestionRef(),
			progress,
			makeClock("2026-03-20T09:00:00Z", "UTC"),
		);
		expect(overdueStatus).toMatchObject({
			status: "overdue",
			isDue: true,
			daysOverdue: 15,
			dueDate: "2026-03-05",
		});
		expect(overdueStatus.reason).toContain("Overdue by 15 days");

		// Answering correctly 15 days overdue advances step (3d -> 7d) anchored to 2026-03-20
		const next = applyAttemptToReviewSchedule(
			progress.reviewSchedule,
			makeAttempt(SESSION_3, "correct", utcMs("2026-03-20T09:00:00Z")),
			{ timeZone: "UTC" },
		);
		expect(next.intervalDays).toBe(7);
		expect(next.dueDate).toBe("2026-03-27");
	});

	it("is immune to DST spring-forward/fall-back hour shifts and handles timezone travel cleanly", () => {
		// US DST spring-forward: 2026-03-08 (23-hour local day in America/New_York)
		const springAttempt = makeAttempt(SESSION_1, "correct", utcMs("2026-03-08T05:30:00Z")); // 00:30 EST on Mar 8
		const springSchedule = applyAttemptToReviewSchedule(undefined, springAttempt, {
			timeZone: "America/New_York",
		});
		expect(toLocalCalendarDate(springAttempt.evaluatedAt, "America/New_York")).toBe("2026-03-08");
		expect(springSchedule.dueDate).toBe("2026-03-09");
		expect(addCalendarDays("2026-03-08", 1)).toBe("2026-03-09");

		// US DST fall-back: 2026-11-01 (25-hour local day in America/New_York)
		const fallAttempt = makeAttempt(SESSION_2, "correct", utcMs("2026-11-01T06:30:00Z")); // 01:30 EST on Nov 1
		const fallSchedule = applyAttemptToReviewSchedule(undefined, fallAttempt, {
			timeZone: "America/New_York",
		});
		expect(toLocalCalendarDate(fallAttempt.evaluatedAt, "America/New_York")).toBe("2026-11-01");
		expect(fallSchedule.dueDate).toBe("2026-11-02");

		// Timezone travel: user flies from America/New_York to Pacific/Auckland
		const progress: QuestionProgress = {
			certificationId: CERT_ID,
			questionId: "q-1",
			attemptCount: 1,
			correctCount: 1,
			lastOutcome: "correct",
			lastEvaluatedAt: springAttempt.evaluatedAt,
			lastAttemptSessionId: SESSION_1,
			reviewSchedule: springSchedule,
			legacyBaseline: null,
		};
		// At 2026-03-08T15:00:00Z it is still Mar 8 in New York (upcoming), but already Mar 9 in Auckland (due!)
		const inNewYork = assessQuestionReviewStatus(
			makeQuestionRef(),
			progress,
			makeClock("2026-03-08T15:00:00Z", "America/New_York"),
		);
		const inAuckland = assessQuestionReviewStatus(
			makeQuestionRef(),
			progress,
			makeClock("2026-03-08T15:00:00Z", "Pacific/Auckland"),
		);
		expect(inNewYork.status).toBe("upcoming");
		expect(inNewYork.daysUntilDue).toBe(1);
		expect(inAuckland.status).toBe("due");
		expect(inAuckland.isDue).toBe(true);

		expect(isValidCalendarDate("2026-02-28")).toBe(true);
		expect(isValidCalendarDate("2026-02-30")).toBe(false);
		expect(diffCalendarDays("2026-03-08", "2026-03-09")).toBe(1);
	});

	it("never fabricates review dates from legacy-only baselines and handles revision changes", () => {
		const legacyOnly: QuestionProgress = {
			certificationId: CERT_ID,
			questionId: "q-legacy",
			attemptCount: 0,
			correctCount: 0,
			legacyBaseline: { attempts: 5, correct: 2, lastWrong: true },
		};
		const [rebuiltLegacy] = projectQuestionAttempts([], [legacyOnly], { timeZone: "UTC" });
		expect(rebuiltLegacy.reviewSchedule).toBeUndefined();

		const [recorded] = projectQuestionAttempts(
			[
				makeAttempt(SESSION_1, "correct", utcMs("2026-03-01T10:00:00Z"), {
					questionId: "q-revised",
					questionRevision: "rev-1",
				}),
				makeAttempt(SESSION_2, "correct", utcMs("2026-03-02T10:00:00Z"), {
					questionId: "q-revised",
					questionRevision: "rev-1",
				}),
			],
			[],
			{ timeZone: "UTC" },
		);

		const queue = buildReviewQueue(
			[
				makeQuestionRef({ questionId: "q-legacy", revision: "rev-1" }),
				makeQuestionRef({ questionId: "q-revised", revision: "rev-2" }),
			],
			new Map([
				[`${CERT_ID}\u0000q-legacy`, rebuiltLegacy],
				[`${CERT_ID}\u0000q-revised`, recorded],
			]),
			makeClock("2026-03-03T10:00:00Z", "UTC"),
		);

		expect(queue.counts.legacyOnly).toBe(1);
		expect(queue.counts.unscheduled).toBe(1);
		expect(queue.counts.revisionChanged).toBe(1);
		expect(queue.counts.dueNow).toBe(1);
		expect(queue.dueItems[0]).toMatchObject({
			questionId: "q-revised",
			status: "revision-changed",
			revisionChanged: true,
		});

		// Re-evaluating on rev-2 resets the schedule to step 0 (1 day)
		const reEvaluated = applyAttemptToReviewSchedule(
			recorded.reviewSchedule,
			makeAttempt(SESSION_3, "correct", utcMs("2026-03-03T10:00:00Z"), {
				questionId: "q-revised",
				questionRevision: "rev-2",
			}),
			{ timeZone: "UTC" },
		);
		expect(reEvaluated).toMatchObject({
			revision: "rev-2",
			stepIndex: 0,
			intervalDays: 1,
			consecutiveCorrect: 1,
			dueDate: "2026-03-04",
		});
	});

	it("keeps skipped/unanswered questions unchanged and records review sessions atomically", async () => {
		const repository = createProgressRepository();
		try {
			const session = makeSession(SESSION_1, "review", utcMs("2026-03-01T10:00:00Z"), [
				"q-1",
				"q-2",
			]);
			await repository.createSession({
				id: session.id,
				certificationId: session.certificationId,
				mode: session.mode,
				startedAt: session.startedAt,
				scoring: session.scoring,
				content: session.content,
				checkpoint: session.checkpoint,
			});

			// Evaluate q-1, skip q-2
			const evalInput = {
				sessionId: SESSION_1,
				questionId: "q-1",
				selectedOptionIds: ["opt-a"],
				outcome: "correct" as const,
				scoreEarned: 1,
				scorePossible: 1,
				evaluatedAt: utcMs("2026-03-01T10:05:00Z"),
			};
			const first = await repository.recordEvaluation(evalInput);
			// Retrying the exact evaluation is idempotent and never duplicates attempts or advances schedule
			const retry = await repository.recordEvaluation(evalInput);
			expect(retry).toEqual(first);

			// Finalize without evaluating q-2 (skipped)
			const loaded = await repository.getSession(SESSION_1);
			await repository.finalizeSession(
				SESSION_1,
				loaded?.revision ?? 2,
				"completed",
				utcMs("2026-03-01T10:10:00Z"),
				undefined,
				[],
			);

			const progress1 = await repository.getQuestionProgress(CERT_ID, "q-1");
			const progress2 = await repository.getQuestionProgress(CERT_ID, "q-2");
			expect(progress1?.attemptCount).toBe(1);
			expect(progress1?.reviewSchedule?.policyVersion).toBe(REVIEW_SCHEDULER_POLICY_VERSION);
			expect(progress2).toBeUndefined();

			// Rebuild is deterministic
			const rebuilt = await repository.rebuildQuestionProgress(CERT_ID);
			expect(rebuilt).toHaveLength(1);
			expect(rebuilt[0].reviewSchedule).toEqual(progress1?.reviewSchedule);
		} finally {
			await repository.close();
		}
	});

	it("preserves review schedules and upgrades older policy versions on backup/restore", async () => {
		const session = makeSession(SESSION_1, "practice", utcMs("2026-03-11T03:30:00Z"), ["q-1"]);
		session.checkpoint = {
			...session.checkpoint,
			checkedQuestionIds: ["q-1"],
		};
		const attempt = createQuestionAttempt(session, {
			sessionId: SESSION_1,
			questionId: "q-1",
			selectedOptionIds: ["opt-a"],
			outcome: "correct",
			scoreEarned: 1,
			scorePossible: 1,
			evaluatedAt: utcMs("2026-03-11T03:30:00Z"), // Mar 10 23:30 EDT in America/New_York -> due 2026-03-11
		});
		const [projectedNY] = projectQuestionAttempts([attempt], [], {
			timeZone: "America/New_York",
		});
		expect(projectedNY.reviewSchedule?.dueDate).toBe("2026-03-11");
		expect(projectedNY.reviewSchedule?.scheduledInTimeZone).toBe("America/New_York");

		// Round-trip through LearningBackup preserves schedulerPolicyVersion and exact NY dueDate
		const snapshot: LearningDataSnapshot = {
			sessions: [session],
			questionAttempts: [attempt],
			questionProgress: [projectedNY],
			studyProgress: [],
			learningGoals: [],
			legacyProvenance: [],
			fingerprint: "test-fp",
		};
		const backup = await createLearningBackup(snapshot, [], "https://practice.example", 1000);
		expect(backup.schedulerPolicyVersion).toBe(REVIEW_SCHEDULER_POLICY_VERSION);

		const parsed = await parseLearningBackup(JSON.stringify(backup), [CERT_ID]);
		expect(parsed.schedulerPolicyVersion).toBe(REVIEW_SCHEDULER_POLICY_VERSION);
		expect(parsed.data.questionProgress[0].reviewSchedule).toEqual(projectedNY.reviewSchedule);

		// Policy upgrade: backup with older review-v0 schedule upgrades cleanly to review-v1
		const oldPolicyProgress = {
			...projectedNY,
			reviewSchedule: {
				...projectedNY.reviewSchedule,
				policyVersion: "review-v0",
				intervalDays: 99,
				dueDate: "2026-06-01",
			},
		};
		expect(needsReviewScheduleUpgrade(oldPolicyProgress.reviewSchedule)).toBe(true);
		const upgraded = parseProgressBackup(
			JSON.stringify({
				format: "practice-lab-progress-export",
				version: 1,
				exportedAt: 2000,
				certifications: [
					{
						certificationId: CERT_ID,
						sessionHistory: [{ session, attempts: [attempt] }],
						questionProgress: [oldPolicyProgress],
					},
				],
			}),
			[CERT_ID],
		);
		expect(upgraded[0].questionProgress[0].reviewSchedule).toEqual(projectedNY.reviewSchedule);
	});

	it("migrates IndexedDB v4 progress to v5, rebuilding review schedules without fabricating legacy dates", async () => {
		const v4Db = await new Promise<IDBDatabase>((resolve, reject) => {
			const req = indexedDB.open(PROGRESS_DATABASE_NAME, 4);
			req.onupgradeneeded = () => {
				const db = req.result;
				const attempts = db.createObjectStore("questionAttempts", {
					keyPath: ["sessionId", "questionId"],
				});
				attempts.createIndex("by-certification", "certificationId");
				const qp = db.createObjectStore("questionProgress", {
					keyPath: ["certificationId", "questionId"],
				});
				qp.createIndex("by-certification", "certificationId");
				db.createObjectStore("metadata", { keyPath: "key" });
			};
			req.onsuccess = () => resolve(req.result);
			req.onerror = () => reject(req.error);
		});

		const tx = v4Db.transaction(["questionAttempts", "questionProgress"], "readwrite");
		tx.objectStore("questionAttempts").put(
			makeAttempt(SESSION_1, "correct", utcMs("2026-03-01T10:00:00Z"), {
				questionId: "q-recorded",
			}),
		);
		tx.objectStore("questionProgress").put({
			certificationId: CERT_ID,
			questionId: "q-recorded",
			attemptCount: 1,
			correctCount: 1,
			lastOutcome: "correct",
			lastEvaluatedAt: utcMs("2026-03-01T10:00:00Z"),
			lastAttemptSessionId: SESSION_1,
			legacyBaseline: null,
		});
		tx.objectStore("questionProgress").put({
			certificationId: CERT_ID,
			questionId: "q-legacy-only",
			attemptCount: 0,
			correctCount: 0,
			legacyBaseline: { attempts: 3, correct: 1, lastWrong: true },
		});
		await new Promise<void>((resolve, reject) => {
			tx.oncomplete = () => resolve();
			tx.onerror = () => reject(tx.error);
			tx.onabort = () => reject(tx.error);
		});
		v4Db.close();

		const db = await openProgressDatabase(() => undefined);
		try {
			const recorded = await db.get("questionProgress", [CERT_ID, "q-recorded"]);
			const legacyOnly = await db.get("questionProgress", [CERT_ID, "q-legacy-only"]);
			const policyMeta = await db.get("metadata", "review-scheduler:policy-version");
			const migrationMeta = await db.get("metadata", "migration:4-5");

			expect(recorded?.reviewSchedule?.policyVersion).toBe(REVIEW_SCHEDULER_POLICY_VERSION);
			expect(legacyOnly?.reviewSchedule).toBeUndefined();
			expect(legacyOnly?.legacyBaseline).toEqual({ attempts: 3, correct: 1, lastWrong: true });
			expect(policyMeta?.value).toBe(REVIEW_SCHEDULER_POLICY_VERSION);
			expect(migrationMeta?.value).toMatchObject({
				fromVersion: 4,
				toVersion: 5,
				schedulerPolicyVersion: REVIEW_SCHEDULER_POLICY_VERSION,
			});
		} finally {
			db.close();
		}
	});
});
