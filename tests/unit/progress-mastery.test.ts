import "fake-indexeddb/auto";
import { deleteDB } from "idb";
import { afterEach, describe, expect, it } from "vitest";
import { deriveProgressSummary, type ProgressBank } from "../../src/lib/progress/analytics";
import { createProgressRepository } from "../../src/lib/progress/indexeddb-repository";
import { computeQuestionRevision } from "../../src/lib/progress/legacy-migration";
import {
	assessQuestionMastery,
	deriveMasteryEvidenceFromAttempts,
	MASTERY_POLICY,
	MASTERY_POLICY_VERSION,
} from "../../src/lib/progress/mastery";
import {
	applyAttemptToProgress,
	type ProgressSession,
	projectQuestionAttempts,
	type QuestionAttempt,
	type QuestionProgress,
	type SessionHistoryEntry,
} from "../../src/lib/progress/model";
import { PROGRESS_DATABASE_NAME } from "../../src/lib/progress/schema";
import type { Question } from "../../src/lib/quiz-types";

const HOUR = 60 * 60 * 1000;
const DAY = 24 * HOUR;
const BASE_TIME = Date.UTC(2026, 0, 1, 12, 0, 0);

function makeAttempt(overrides: Partial<QuestionAttempt> = {}): QuestionAttempt {
	const outcome = overrides.outcome ?? "correct";
	return {
		sessionId: overrides.sessionId ?? "00000000-0000-4000-8000-000000000001",
		questionId: overrides.questionId ?? "q1",
		certificationId: overrides.certificationId ?? "ccdv-f",
		domainId: overrides.domainId ?? "D1",
		questionRevision: overrides.questionRevision ?? "rev-1",
		selectedOptionIds: overrides.selectedOptionIds ?? ["a"],
		outcome,
		scoreEarned: overrides.scoreEarned ?? (outcome === "correct" ? 1 : 0),
		scorePossible: overrides.scorePossible ?? 1,
		evaluatedAt: overrides.evaluatedAt ?? BASE_TIME,
	};
}

function makeProgressFromAttempts(
	attempts: readonly QuestionAttempt[],
	legacyBaseline: QuestionProgress["legacyBaseline"] = null,
): QuestionProgress {
	let progress: QuestionProgress = {
		certificationId: attempts[0]?.certificationId ?? "ccdv-f",
		questionId: attempts[0]?.questionId ?? "q1",
		attemptCount: 0,
		correctCount: 0,
		legacyBaseline,
	};
	for (const attempt of attempts) {
		progress = applyAttemptToProgress(progress, attempt);
	}
	return progress;
}

function makeSession(
	id: string,
	certificationId: string,
	startedAt: number,
	questionIds: string[],
	revision = "rev-1",
): ProgressSession {
	return {
		id,
		certificationId,
		mode: "practice",
		status: "completed",
		revision: 1,
		startedAt,
		updatedAt: startedAt + 1_000,
		finishedAt: startedAt + 1_000,
		scoring: {
			revision: "s1",
			passingScore: null,
			totalQuestions: questionIds.length,
			domainWeights: { D1: 60, D2: 40 },
		},
		content: {
			bankRevision: `bank-${revision}`,
			questions: questionIds.map((questionId) => ({
				questionId,
				revision,
				contentHash: `hash-${revision}`,
				domainId: "D1",
				optionIds: ["a", "b"],
				optionTexts: ["Option A", "Option B"],
				displayOptionIds: ["a", "b"],
				correctOptionIds: ["a"],
				questionText: `${questionId}?`,
				domainName: "Agents",
				explanation: "A is correct.",
				sourceLabel: "Guide",
				sourceUrl: "https://example.test/guide",
				selectCount: 1,
			})),
		},
		checkpoint: {
			currentQuestionId: null,
			deadlineAt: null,
			selectedOptionIdsByQuestion: Object.fromEntries(questionIds.map((id) => [id, ["a"]])),
			checkedQuestionIds: questionIds,
			flaggedQuestionIds: [],
		},
	};
}

describe("explainable mastery policy and transitions", () => {
	it("exposes explicit versioned thresholds", () => {
		expect(MASTERY_POLICY.version).toBe(MASTERY_POLICY_VERSION);
		expect(MASTERY_POLICY.proficientMinSessions).toBe(2);
		expect(MASTERY_POLICY.masteredMinSessions).toBe(3);
		expect(MASTERY_POLICY.masteredMinSpacingMs).toBe(DAY);
		expect(MASTERY_POLICY.staleAfterMs).toBe(14 * DAY);
		expect(MASTERY_POLICY.weakDomainMinAttempts).toBe(3);
	});

	it("transitions deterministically through New -> Learning -> Proficient -> Mastered with spacing", () => {
		const qRef = {
			certificationId: "ccdv-f",
			questionId: "q1",
			domainId: "D1",
			revision: "rev-1",
		};

		// New: no evidence
		const newState = assessQuestionMastery(qRef, undefined, BASE_TIME);
		expect(newState.state).toBe("new");
		expect(newState.evidenceSource).toBe("none");

		// 1 correct session -> Learning
		const a1 = makeAttempt({
			sessionId: "00000000-0000-4000-8000-000000000001",
			evaluatedAt: BASE_TIME,
		});
		const learningState = assessQuestionMastery(qRef, makeProgressFromAttempts([a1]), BASE_TIME);
		expect(learningState.state).toBe("learning");
		expect(learningState.consecutiveCorrectSessions).toBe(1);

		// Same session repeated -> still Learning (distinct sessions required)
		const a1Dup = makeAttempt({
			sessionId: "00000000-0000-4000-8000-000000000001",
			evaluatedAt: BASE_TIME + 2 * DAY,
		});
		const sameSessionState = assessQuestionMastery(
			qRef,
			makeProgressFromAttempts([a1, a1Dup]),
			BASE_TIME + 2 * DAY,
		);
		expect(sameSessionState.state).toBe("learning");
		expect(sameSessionState.consecutiveCorrectSessions).toBe(1);

		// 2 distinct sessions -> Proficient
		const a2 = makeAttempt({
			sessionId: "00000000-0000-4000-8000-000000000002",
			evaluatedAt: BASE_TIME + 2 * HOUR,
		});
		const proficientState = assessQuestionMastery(
			qRef,
			makeProgressFromAttempts([a1, a2]),
			BASE_TIME + 2 * HOUR,
		);
		expect(proficientState.state).toBe("proficient");
		expect(proficientState.consecutiveCorrectSessions).toBe(2);

		// 3 distinct sessions with insufficient spacing (< 24h) -> still Proficient
		const a3TooSoon = makeAttempt({
			sessionId: "00000000-0000-4000-8000-000000000003",
			evaluatedAt: BASE_TIME + 23 * HOUR,
		});
		const notYetMastered = assessQuestionMastery(
			qRef,
			makeProgressFromAttempts([a1, a2, a3TooSoon]),
			BASE_TIME + 23 * HOUR,
		);
		expect(notYetMastered.state).toBe("proficient");
		expect(notYetMastered.consecutiveCorrectSessions).toBe(3);
		expect(notYetMastered.spacingMs).toBe(23 * HOUR);

		// 3 distinct sessions with >= 24h spacing -> Mastered
		const a3Spaced = makeAttempt({
			sessionId: "00000000-0000-4000-8000-000000000003",
			evaluatedAt: BASE_TIME + 24 * HOUR,
		});
		const mastered = assessQuestionMastery(
			qRef,
			makeProgressFromAttempts([a1, a2, a3Spaced]),
			BASE_TIME + 24 * HOUR,
		);
		expect(mastered.state).toBe("mastered");
		expect(mastered.consecutiveCorrectSessions).toBe(3);
		expect(mastered.spacingMs).toBe(24 * HOUR);
		expect(mastered.isStale).toBe(false);
	});

	it("demotes on incorrect or partial answers and uses deterministic tie-breaking", () => {
		const qRef = {
			certificationId: "ccdv-f",
			questionId: "q1",
			domainId: "D1",
			revision: "rev-1",
		};
		const s1 = makeAttempt({
			sessionId: "00000000-0000-4000-8000-000000000001",
			evaluatedAt: BASE_TIME,
		});
		const s2 = makeAttempt({
			sessionId: "00000000-0000-4000-8000-000000000002",
			evaluatedAt: BASE_TIME + 12 * HOUR,
		});
		const s3 = makeAttempt({
			sessionId: "00000000-0000-4000-8000-000000000003",
			evaluatedAt: BASE_TIME + 26 * HOUR,
		});
		const s4Wrong = makeAttempt({
			sessionId: "00000000-0000-4000-8000-000000000004",
			outcome: "incorrect",
			evaluatedAt: BASE_TIME + 30 * HOUR,
		});

		const demoted = assessQuestionMastery(
			qRef,
			makeProgressFromAttempts([s1, s2, s3, s4Wrong]),
			BASE_TIME + 30 * HOUR,
		);
		expect(demoted.state).toBe("learning");
		expect(demoted.consecutiveCorrectSessions).toBe(0);
		expect(demoted.needsReview).toBe(true);
		expect(demoted.demotionReason).toBe("wrong-answer");

		// Partial outcome also demotes
		const s4Partial = makeAttempt({
			sessionId: "00000000-0000-4000-8000-000000000005",
			outcome: "partial",
			evaluatedAt: BASE_TIME + 30 * HOUR,
		});
		const demotedPartial = assessQuestionMastery(
			qRef,
			makeProgressFromAttempts([s1, s2, s3, s4Partial]),
			BASE_TIME + 30 * HOUR,
		);
		expect(demotedPartial.state).toBe("learning");
		expect(demotedPartial.demotionReason).toBe("wrong-answer");

		// Deterministic tie-breaking when timestamps are identical: sorted by sessionId ascending
		const tieA = makeAttempt({
			sessionId: "00000000-0000-4000-8000-00000000000a",
			outcome: "incorrect",
			evaluatedAt: BASE_TIME + 50 * HOUR,
		});
		const tieB = makeAttempt({
			sessionId: "00000000-0000-4000-8000-00000000000b",
			outcome: "correct",
			evaluatedAt: BASE_TIME + 50 * HOUR,
		});
		const forward = deriveMasteryEvidenceFromAttempts([tieA, tieB]);
		const reversed = deriveMasteryEvidenceFromAttempts([tieB, tieA]);
		expect(forward).toEqual(reversed);
		expect(forward?.consecutiveCorrectSessions).toBe(1);
		expect(forward?.lastCorrectSessionId).toBe(tieB.sessionId);
	});

	it("demotes mastery on meaningful revision changes while preserving historical scores", () => {
		const s1 = makeSession(
			"00000000-0000-4000-8000-000000000001",
			"ccdv-f",
			BASE_TIME,
			["q1"],
			"rev-1",
		);
		const s2 = makeSession(
			"00000000-0000-4000-8000-000000000002",
			"ccdv-f",
			BASE_TIME + 12 * HOUR,
			["q1"],
			"rev-1",
		);
		const s3 = makeSession(
			"00000000-0000-4000-8000-000000000003",
			"ccdv-f",
			BASE_TIME + 26 * HOUR,
			["q1"],
			"rev-1",
		);
		const history: SessionHistoryEntry[] = [
			{
				session: s1,
				attempts: [
					makeAttempt({ sessionId: s1.id, evaluatedAt: BASE_TIME, questionRevision: "rev-1" }),
				],
			},
			{
				session: s2,
				attempts: [
					makeAttempt({
						sessionId: s2.id,
						evaluatedAt: BASE_TIME + 12 * HOUR,
						questionRevision: "rev-1",
					}),
				],
			},
			{
				session: s3,
				attempts: [
					makeAttempt({
						sessionId: s3.id,
						evaluatedAt: BASE_TIME + 26 * HOUR,
						questionRevision: "rev-1",
					}),
				],
			},
		];

		// Current bank has materially revised q1 -> rev-2
		const revisedBank: ProgressBank[] = [
			{
				certificationId: "ccdv-f",
				certificationSubtitle: "CCDV-F",
				blueprintSource: "official",
				questions: [
					{
						certificationId: "ccdv-f",
						certificationSubtitle: "CCDV-F",
						questionId: "q1",
						domainId: "D1",
						domainName: "Agents",
						revision: "rev-2",
						domainWeight: 60,
					},
				],
			},
		];

		const summary = deriveProgressSummary(revisedBank, history, [], undefined, {
			now: BASE_TIME + 30 * HOUR,
		});

		// Historical accuracy & lastResult remain unchanged!
		expect(summary.accuracy).toEqual({ correct: 3, attempts: 3 });
		expect(summary.lastResult).toMatchObject({ correct: 1, questions: 1 });
		// Mastery is demoted to learning and flagged as revisionChanged
		expect(summary.mastery.mastered).toBe(0);
		expect(summary.mastery.proficient).toBe(0);
		expect(summary.mastery.learning).toBe(1);
		expect(summary.mastery.revisionChanged).toBe(1);
		expect(summary.recommendations.some((rec) => rec.category === "revision-changed")).toBe(true);

		// A single new correct attempt on rev-2 starts a fresh streak (Learning, not Mastered)
		const progressAfterRev2 = makeProgressFromAttempts([
			...history.flatMap((entry) => entry.attempts),
			makeAttempt({
				sessionId: "00000000-0000-4000-8000-000000000004",
				evaluatedAt: BASE_TIME + 40 * HOUR,
				questionRevision: "rev-2",
			}),
		]);
		const assessmentAfterRev2 = assessQuestionMastery(
			{ certificationId: "ccdv-f", questionId: "q1", domainId: "D1", revision: "rev-2" },
			progressAfterRev2,
			BASE_TIME + 40 * HOUR,
		);
		expect(assessmentAfterRev2.state).toBe("learning");
		expect(assessmentAfterRev2.consecutiveCorrectSessions).toBe(1);
		expect(assessmentAfterRev2.revisionChanged).toBe(false);
	});

	it("keeps canonical question revision stable across option shuffles and sensitive to content edits", () => {
		const question: Question = {
			id: "q1",
			domain: "D1",
			question: "What does MCP stand for?",
			options: ["Model Context Protocol", "Managed Cloud Proxy"],
			correctAnswers: [0],
			explanation: "MCP is Model Context Protocol.",
			source: { label: "Docs", url: "https://example.test" },
		};
		const rev1 = computeQuestionRevision(question);
		const revSame = computeQuestionRevision({
			...question,
			explanation: "Slightly reworded explanation.",
		});
		const revEditedStem = computeQuestionRevision({
			...question,
			question: "What does MCP stand for in Claude?",
		});
		const revBumpedVersion = computeQuestionRevision({
			...question,
			contentVersion: "2",
		});

		expect(rev1).toBe(revSame);
		expect(revEditedStem).not.toBe(rev1);
		expect(revBumpedVersion).not.toBe(rev1);
	});

	it("treats legacy-only and missing mastery evidence as limited evidence without fabricating mastery", () => {
		const qRef = {
			certificationId: "ccdv-f",
			questionId: "q1",
			domainId: "D1",
			revision: "rev-1",
		};
		const legacyCorrect: QuestionProgress = {
			certificationId: "ccdv-f",
			questionId: "q1",
			attemptCount: 0,
			correctCount: 0,
			legacyBaseline: { attempts: 10, correct: 10, lastWrong: false },
		};
		const legacyAssessment = assessQuestionMastery(qRef, legacyCorrect, BASE_TIME);
		expect(legacyAssessment.state).toBe("learning");
		expect(legacyAssessment.evidenceSource).toBe("legacy-only");
		expect(legacyAssessment.consecutiveCorrectSessions).toBe(0);
		expect(legacyAssessment.spacingMs).toBe(0);
		expect(legacyAssessment.needsReview).toBe(false);

		const legacyWrong: QuestionProgress = {
			...legacyCorrect,
			legacyBaseline: { attempts: 5, correct: 4, lastWrong: true },
		};
		const legacyWrongAssessment = assessQuestionMastery(qRef, legacyWrong, BASE_TIME);
		expect(legacyWrongAssessment.state).toBe("learning");
		expect(legacyWrongAssessment.needsReview).toBe(true);
		expect(legacyWrongAssessment.demotionReason).toBe("wrong-answer");

		// Pre-feature recorded QuestionProgress without mastery evidence
		const missingMastery: QuestionProgress = {
			certificationId: "ccdv-f",
			questionId: "q1",
			attemptCount: 4,
			correctCount: 4,
			lastOutcome: "correct",
			lastEvaluatedAt: BASE_TIME,
			legacyBaseline: null,
		};
		const missingAssessment = assessQuestionMastery(qRef, missingMastery, BASE_TIME);
		expect(missingAssessment.state).toBe("learning");
		expect(missingAssessment.evidenceSource).toBe("recorded");
	});

	it("flags stale knowledge with an injected clock and produces deterministic recommendations without ranking zero-sample domains as worst", () => {
		const banks: ProgressBank[] = [
			{
				certificationId: "ccdv-f",
				certificationSubtitle: "CCDV-F",
				blueprintSource: "official",
				questions: [
					{
						certificationId: "ccdv-f",
						certificationSubtitle: "CCDV-F",
						questionId: "d1-q1",
						domainId: "D1",
						domainName: "Agents",
						revision: "rev-1",
						domainWeight: 30,
					},
					{
						certificationId: "ccdv-f",
						certificationSubtitle: "CCDV-F",
						questionId: "d2-q1",
						domainId: "D2",
						domainName: "Integrations",
						revision: "rev-1",
						domainWeight: 40,
					},
					{
						certificationId: "ccdv-f",
						certificationSubtitle: "CCDV-F",
						questionId: "d3-q1",
						domainId: "D3",
						domainName: "Security",
						revision: "rev-1",
						domainWeight: 20,
					},
				],
			},
		];

		// d1-q1 mastered at BASE_TIME + 24h; d2-q1 has 3 attempts (1/3 = 33% -> weak domain); d3-q1 has 0 attempts (unseen!)
		const d1Attempts = [
			makeAttempt({
				sessionId: "00000000-0000-4000-8000-000000000001",
				questionId: "d1-q1",
				domainId: "D1",
				evaluatedAt: BASE_TIME,
			}),
			makeAttempt({
				sessionId: "00000000-0000-4000-8000-000000000002",
				questionId: "d1-q1",
				domainId: "D1",
				evaluatedAt: BASE_TIME + 12 * HOUR,
			}),
			makeAttempt({
				sessionId: "00000000-0000-4000-8000-000000000003",
				questionId: "d1-q1",
				domainId: "D1",
				evaluatedAt: BASE_TIME + 24 * HOUR,
			}),
		];
		const d2Attempts = [
			makeAttempt({
				sessionId: "00000000-0000-4000-8000-000000000001",
				questionId: "d2-q1",
				domainId: "D2",
				outcome: "incorrect",
				evaluatedAt: BASE_TIME + 1_000,
			}),
			makeAttempt({
				sessionId: "00000000-0000-4000-8000-000000000002",
				questionId: "d2-q1",
				domainId: "D2",
				outcome: "correct",
				evaluatedAt: BASE_TIME + 12 * HOUR + 1_000,
			}),
			makeAttempt({
				sessionId: "00000000-0000-4000-8000-000000000003",
				questionId: "d2-q1",
				domainId: "D2",
				outcome: "incorrect",
				evaluatedAt: BASE_TIME + 24 * HOUR + 1_000,
			}),
		];
		const allAttempts = [...d1Attempts, ...d2Attempts];
		const projected = projectQuestionAttempts(allAttempts, []);

		// At 13 days after last correct: NOT stale yet
		const freshSummary = deriveProgressSummary(
			banks,
			[],
			projected,
			{ recentAttempts: allAttempts, completedMockExams: 0 },
			{ now: BASE_TIME + 24 * HOUR + 13 * DAY, basePath: "/practice-lab/" },
		);
		expect(freshSummary.mastery.mastered).toBe(1);
		expect(freshSummary.mastery.stale).toBe(0);
		expect(freshSummary.recommendations.some((rec) => rec.category === "stale-knowledge")).toBe(
			false,
		);

		// At 14 days after last correct: stale!
		const staleSummary = deriveProgressSummary(
			banks,
			[],
			projected,
			{ recentAttempts: allAttempts, completedMockExams: 0 },
			{ now: BASE_TIME + 24 * HOUR + 14 * DAY, basePath: "/practice-lab/" },
		);
		expect(staleSummary.mastery.stale).toBe(1);

		// Verify D3 (0 attempts) is marked insufficient evidence and NOT ranked as a weak domain
		const d3 = staleSummary.domainBreakdown.find((d) => d.domainId === "D3");
		expect(d3?.hasSufficientEvidence).toBe(false);
		expect(d3?.coverage).toEqual({ evaluated: 0, eligible: 1 });
		expect(d3?.mastery.new).toBe(1);

		const categories = staleSummary.recommendations.map((rec) => rec.category);
		expect(categories).toEqual([
			"recently-missed",
			"weak-domain",
			"stale-knowledge",
			"unseen-questions",
		]);
		expect(
			staleSummary.recommendations.find((rec) => rec.category === "weak-domain")?.domainId,
		).toBe("D2");
		expect(
			staleSummary.recommendations.find((rec) => rec.category === "unseen-questions")?.domainId,
		).toBe("D3");
		expect(
			staleSummary.recommendations.find((rec) => rec.category === "weak-domain")?.practiceHref,
		).toBe("/practice-lab/certifications/ccdv-f/?mode=practice&domain=D2#session");
		expect(
			staleSummary.recommendations.find((rec) => rec.category === "weak-domain")?.studyHref,
		).toBe("/practice-lab/study/ccdv-f/#D2");
	});
});

describe("rebuildable mastery projections in repository", () => {
	afterEach(async () => {
		await deleteDB(PROGRESS_DATABASE_NAME);
	});

	it("rebuilds mastery identically from baseline and immutable attempts without double-counting", async () => {
		const repository = createProgressRepository();
		try {
			await repository.setLegacyBaseline("ccdv-f", "q1", {
				attempts: 3,
				correct: 2,
				lastWrong: true,
			});

			const timestamps = [BASE_TIME, BASE_TIME + 12 * HOUR, BASE_TIME + 25 * HOUR];
			for (let i = 0; i < timestamps.length; i += 1) {
				const sessionId = `00000000-0000-4000-8000-00000000000${i + 1}`;
				const session = await repository.createSession({
					id: sessionId,
					certificationId: "ccdv-f",
					mode: "practice",
					startedAt: timestamps[i],
					scoring: {
						revision: "s1",
						passingScore: null,
						totalQuestions: 1,
						domainWeights: { D1: 100 },
					},
					content: {
						bankRevision: "bank-v1",
						questions: [
							{
								questionId: "q1",
								revision: "rev-1",
								contentHash: "hash-1",
								domainId: "D1",
								optionIds: ["a", "b"],
								optionTexts: ["A", "B"],
								displayOptionIds: ["a", "b"],
								correctOptionIds: ["a"],
								questionText: "Q1?",
								domainName: "Agents",
								explanation: "A",
								sourceLabel: "Guide",
								sourceUrl: "https://example.test",
								selectCount: 1,
							},
						],
					},
					checkpoint: {
						currentQuestionId: "q1",
						deadlineAt: null,
						selectedOptionIdsByQuestion: { q1: ["a"] },
						checkedQuestionIds: [],
						flaggedQuestionIds: [],
					},
				});
				await repository.recordEvaluation({
					sessionId: session.id,
					questionId: "q1",
					selectedOptionIds: ["a"],
					outcome: "correct",
					scoreEarned: 1,
					scorePossible: 1,
					evaluatedAt: timestamps[i] + 100,
				});
				await repository.finalizeSession(
					session.id,
					session.revision + 1,
					"completed",
					timestamps[i] + 200,
				);
			}

			const beforeRebuild = await repository.getQuestionProgress("ccdv-f", "q1");
			const rebuiltOnce = await repository.rebuildQuestionProgress("ccdv-f");
			const rebuiltTwice = await repository.rebuildQuestionProgress("ccdv-f");

			expect(rebuiltOnce).toEqual([beforeRebuild]);
			expect(rebuiltTwice).toEqual(rebuiltOnce);
			expect(beforeRebuild?.attemptCount).toBe(3);
			expect(beforeRebuild?.correctCount).toBe(3);
			expect(beforeRebuild?.legacyBaseline).toEqual({ attempts: 3, correct: 2, lastWrong: true });
			expect(beforeRebuild?.mastery?.consecutiveCorrectSessions).toBe(3);

			const assessment = assessQuestionMastery(
				{ certificationId: "ccdv-f", questionId: "q1", domainId: "D1", revision: "rev-1" },
				rebuiltTwice[0],
				BASE_TIME + 26 * HOUR,
			);
			expect(assessment.state).toBe("mastered");
			expect(assessment.evidenceSource).toBe("mixed");
		} finally {
			await repository.close();
		}
	});
});
