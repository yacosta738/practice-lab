import { describe, expect, it } from "vitest";
import { deriveProgressSummary, type ProgressBank } from "../../src/lib/progress/analytics";
import type {
	ProgressSession,
	QuestionAttempt,
	QuestionProgress,
	SessionHistoryEntry,
} from "../../src/lib/progress/model";

const BANKS: ProgressBank[] = [
	{
		certificationId: "ccdv-f",
		certificationSubtitle: "CCDV-F",
		questions: [
			{
				certificationId: "ccdv-f",
				certificationSubtitle: "CCDV-F",
				questionId: "shared-question",
				domainId: "D1",
				domainName: "Agents",
			},
			{
				certificationId: "ccdv-f",
				certificationSubtitle: "CCDV-F",
				questionId: "question-b",
				domainId: "D1",
				domainName: "Agents",
			},
		],
	},
	{
		certificationId: "ccao-f",
		certificationSubtitle: "CCAO-F",
		questions: [
			{
				certificationId: "ccao-f",
				certificationSubtitle: "CCAO-F",
				questionId: "shared-question",
				domainId: "D1",
				domainName: "Agents",
			},
		],
	},
];

function makeSession(
	id: string,
	certificationId: string,
	mode: ProgressSession["mode"],
	status: ProgressSession["status"],
	startedAt: number,
	questionIds: string[],
): ProgressSession {
	return {
		id,
		certificationId,
		mode,
		status,
		revision: 1,
		startedAt,
		updatedAt: startedAt + 1,
		finishedAt: status === "in_progress" ? undefined : startedAt + 1,
		scoring: {
			revision: "s1",
			passingScore: null,
			totalQuestions: questionIds.length,
			domainWeights: {},
		},
		content: {
			bankRevision: "bank-v1",
			questions: questionIds.map((questionId) => ({
				questionId,
				revision: "q-v1",
				contentHash: "hash-v1",
				domainId: "D1",
				optionIds: ["a", "b"],
				optionTexts: ["Option A", "Option B"],
				displayOptionIds: ["a", "b"],
				correctOptionIds: ["a"],
				questionText: `${questionId}?`,
				domainName: "Agents",
				explanation: "The first option is correct.",
				sourceLabel: "Official guide",
				sourceUrl: "https://example.test/guide",
				selectCount: 1,
			})),
		},
		checkpoint: {
			currentQuestionId: null,
			deadlineAt: null,
			selectedOptionIdsByQuestion: {},
			checkedQuestionIds: [],
			flaggedQuestionIds: [],
		},
	};
}

function makeAttempt(
	sessionId: string,
	certificationId: string,
	questionId: string,
	outcome: QuestionAttempt["outcome"],
	evaluatedAt: number,
): QuestionAttempt {
	return {
		sessionId,
		certificationId,
		questionId,
		domainId: "D1",
		questionRevision: "q-v1",
		selectedOptionIds: ["a"],
		outcome,
		scoreEarned: outcome === "correct" ? 1 : 0,
		scorePossible: 1,
		evaluatedAt,
	};
}

function entry(session: ProgressSession, attempts: QuestionAttempt[] = []): SessionHistoryEntry {
	return { session, attempts };
}

describe("progress analytics", () => {
	it("keeps certification IDs separate, counts eligible coverage, and includes legacy baselines", () => {
		const olderExam = makeSession("exam-1", "ccdv-f", "exam", "completed", 100, [
			"shared-question",
			"question-b",
		]);
		const laterPractice = makeSession("practice-1", "ccdv-f", "practice", "completed", 300, [
			"shared-question",
		]);
		const expiredExam = makeSession("exam-2", "ccao-f", "exam", "expired", 400, [
			"shared-question",
			"not-in-current-bank",
		]);
		const history = [
			entry(olderExam, [
				makeAttempt(olderExam.id, "ccdv-f", "shared-question", "correct", 110),
				makeAttempt(olderExam.id, "ccdv-f", "question-b", "incorrect", 120),
			]),
			entry(laterPractice, [
				makeAttempt(laterPractice.id, "ccdv-f", "shared-question", "correct", 310),
			]),
			entry(expiredExam, [
				makeAttempt(expiredExam.id, "ccao-f", "shared-question", "incorrect", 410),
			]),
		];
		const legacy: QuestionProgress[] = [
			{
				certificationId: "ccdv-f",
				questionId: "question-b",
				attemptCount: 1,
				correctCount: 0,
				legacyBaseline: { attempts: 4, correct: 2, lastWrong: true },
			},
		];

		const summary = deriveProgressSummary(BANKS, history, legacy);

		expect(summary.coverage).toEqual({ evaluated: 3, eligible: 3 });
		expect(summary.accuracy).toEqual({ correct: 4, attempts: 8 });
		expect(summary.recentAccuracy).toEqual({ correct: 2, attempts: 4 });
		expect(summary.completedMockExams).toBe(1);
		expect(summary.lastResult).toMatchObject({ sessionId: "exam-2", correct: 0, questions: 2 });
		expect(summary.domains).toHaveLength(2);
		expect(summary.domains.map(({ certificationId }) => certificationId)).toEqual([
			"ccao-f",
			"ccdv-f",
		]);
		expect(summary.examTrend).toEqual([
			expect.objectContaining({ sessionId: "exam-1", correct: 1, questions: 2 }),
			expect.objectContaining({ sessionId: "exam-2", correct: 0, questions: 2 }),
		]);
	});

	it("returns explicit empty denominators and excludes active sessions from completed results", () => {
		const active = makeSession("active-1", "ccdv-f", "exam", "in_progress", 100, [
			"shared-question",
		]);
		const summary = deriveProgressSummary(BANKS, [entry(active)], []);

		expect(summary.coverage).toEqual({ evaluated: 0, eligible: 3 });
		expect(summary.accuracy).toEqual({ correct: 0, attempts: 0 });
		expect(summary.recentAccuracy).toEqual({ correct: 0, attempts: 0 });
		expect(summary.lastResult).toBeUndefined();
		expect(summary.examTrend).toEqual([]);
	});

	it("derives dashboard totals from the incremental projection and keeps frozen result denominators", () => {
		const session = makeSession("practice-latest", "ccdv-f", "practice", "completed", 500, [
			"shared-question",
		]);
		const latestAttempt = makeAttempt(session.id, "ccdv-f", "shared-question", "correct", 510);
		const questionProgress: QuestionProgress[] = [
			{
				certificationId: "ccdv-f",
				questionId: "shared-question",
				attemptCount: 2,
				correctCount: 1,
				legacyBaseline: null,
			},
			{
				certificationId: "ccdv-f",
				questionId: "question-b",
				attemptCount: 1,
				correctCount: 1,
				legacyBaseline: { attempts: 4, correct: 2, lastWrong: true },
			},
		];
		const summary = deriveProgressSummary(
			BANKS,
			[entry(session, [latestAttempt])],
			questionProgress,
			{
				recentAttempts: [latestAttempt],
				completedMockExams: 6,
			},
		);

		expect(summary.accuracy).toEqual({ correct: 4, attempts: 7 });
		expect(summary.recentAccuracy).toEqual({ correct: 1, attempts: 1 });
		expect(summary.completedMockExams).toBe(6);
		expect(summary.lastResult).toMatchObject({ correct: 1, questions: 1 });
		expect(
			summary.domains.find(({ certificationId }) => certificationId === "ccdv-f"),
		).toMatchObject({
			correct: 4,
			attempts: 7,
		});
	});
});
