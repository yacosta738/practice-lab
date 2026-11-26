import { describe, expect, it } from "vitest";
import { ProgressConflictError, ProgressValidationError } from "../../src/lib/progress/errors";
import {
	checkpointSession,
	type ContentProvenance,
	createInitialSession,
	createQuestionAttempt,
	evaluationMatches,
	finalizeSession,
	type ProgressSession,
	projectQuestionAttempts,
	type QuestionAttempt,
	type QuestionProgress,
	type ScoringProvenance,
	validateLegacyBaseline,
} from "../../src/lib/progress/model";

const SCORING: ScoringProvenance = {
	revision: "scoring-v1",
	passingScore: 70,
	totalQuestions: 1,
	domainWeights: { "domain-a": 100 },
};

const CONTENT: ContentProvenance = {
	bankRevision: "bank-v1",
	questions: [
		{
			questionId: "question-stable-id",
			revision: "question-v1",
			contentHash: "sha256:question-v1",
			domainId: "domain-a",
			optionIds: ["option-a", "option-b"],
			optionTexts: ["Correct", "Incorrect"],
			displayOptionIds: ["option-a", "option-b"],
			correctOptionIds: ["option-a"],
			questionText: "Question text",
			domainName: "Domain A",
			explanation: "Explanation",
			sourceLabel: "Guide",
			sourceUrl: "https://example.test/guide",
			selectCount: 1,
		},
	],
};

function session(id = "00000000-0000-4000-8000-000000000001"): ProgressSession {
	return createInitialSession({
		id,
		certificationId: "ccdv-f",
		mode: "practice",
		startedAt: 1,
		scoring: SCORING,
		content: CONTENT,
	});
}

function attempt(
	sessionId: string,
	outcome: QuestionAttempt["outcome"],
	evaluatedAt: number,
): QuestionAttempt {
	return {
		sessionId,
		questionId: "question-stable-id",
		certificationId: "ccdv-f",
		domainId: "domain-a",
		questionRevision: "question-v1",
		selectedOptionIds: [outcome === "correct" ? "option-a" : "option-b"],
		outcome,
		scoreEarned: outcome === "correct" ? 1 : 0,
		scorePossible: 1,
		evaluatedAt,
	};
}

describe("progress domain rules", () => {
	it("requires stable UUID session keys and freezes scoring/content provenance", () => {
		const inputScoring = { ...SCORING, domainWeights: { "domain-a": 100 } };
		const inputContent = {
			...CONTENT,
			questions: CONTENT.questions.map((question) => ({
				...question,
				optionIds: [...question.optionIds],
			})),
		};
		const input = {
			id: "00000000-0000-4000-8000-000000000001",
			certificationId: "ccdv-f",
			mode: "practice" as const,
			startedAt: 1,
			scoring: inputScoring,
			content: inputContent,
		};
		const created = createInitialSession(input);

		inputScoring.domainWeights["domain-a"] = 1;
		inputContent.questions[0].optionIds[0] = "mutated-option";

		expect(created.scoring.domainWeights["domain-a"]).toBe(100);
		expect(created.content.questions[0].optionIds[0]).toBe("option-a");
		expect(() => createInitialSession({ ...input, id: "session-1" })).toThrow(
			ProgressValidationError,
		);
	});

	it("requires frozen snapshot answers to match the question answer IDs regardless of order", () => {
		const question = CONTENT.questions[0];
		if (!question) throw new Error("Expected a frozen question fixture.");
		const snapshot = {
			question: question.questionText,
			domainName: question.domainName,
			options: question.optionIds.map((id, index) => ({
				id,
				text: question.optionTexts[index] ?? "",
			})),
			correctOptionIds: ["option-b"],
			explanation: question.explanation,
			source: { label: question.sourceLabel, url: question.sourceUrl },
		};
		const input = {
			id: "00000000-0000-4000-8000-000000000001",
			certificationId: "ccdv-f",
			mode: "practice" as const,
			startedAt: 1,
			scoring: SCORING,
			content: {
				...CONTENT,
				questions: [{ ...question, snapshot }],
			},
		};

		for (const correctOptionIds of [[], ["option-b"], ["option-a", "option-b"]]) {
			expect(() =>
				createInitialSession({
					...input,
					content: {
						...CONTENT,
						questions: [{ ...question, snapshot: { ...snapshot, correctOptionIds } }],
					},
				}),
			).toThrow(ProgressValidationError);
		}

		const multiAnswerQuestion = {
			...question,
			correctOptionIds: ["option-a", "option-b"],
			selectCount: 2,
			snapshot: { ...snapshot, correctOptionIds: ["option-b", "option-a"] },
		};
		const valid = createInitialSession({
			...input,
			content: { ...CONTENT, questions: [multiAnswerQuestion] },
		});
		expect(valid.content.questions[0]?.snapshot?.correctOptionIds).toEqual([
			"option-b",
			"option-a",
		]);
	});

	it("checks optimistic revisions and makes an identical checkpoint retry a no-op", () => {
		const initial = session();
		const checkpoint = {
			currentQuestionId: "question-stable-id",
			deadlineAt: null,
			selectedOptionIdsByQuestion: { "question-stable-id": ["option-b"] },
			checkedQuestionIds: [],
			flaggedQuestionIds: [],
		};
		const saved = checkpointSession(initial, 1, checkpoint, 2);

		expect(saved.revision).toBe(2);
		expect(checkpointSession(saved, 1, checkpoint, 3)).toBe(saved);
		expect(() =>
			checkpointSession(
				saved,
				1,
				{ ...checkpoint, selectedOptionIdsByQuestion: { "question-stable-id": ["option-a"] } },
				3,
			),
		).toThrow(ProgressConflictError);
	});

	it("allows only one terminal transition and makes finalization retries idempotent", () => {
		const initial = session();
		const finalized = finalizeSession(initial, 1, "completed", 2);

		expect(finalized.revision).toBe(2);
		expect(finalizeSession(finalized, 1, "completed", 3)).toBe(finalized);
		expect(() => finalizeSession(finalized, 2, "expired", 4)).toThrow(ProgressConflictError);
	});

	it("records evaluations against frozen option IDs and matches retried evaluations", () => {
		const input = {
			sessionId: "00000000-0000-4000-8000-000000000001",
			questionId: "question-stable-id",
			selectedOptionIds: ["option-b"],
			outcome: "incorrect" as const,
			scoreEarned: 0,
			scorePossible: 1,
			evaluatedAt: 10,
		};
		const original = createQuestionAttempt(session(), input);
		const retry = createQuestionAttempt(session(), { ...input, evaluatedAt: 11 });

		expect(evaluationMatches(original, retry)).toBe(true);
		expect(() =>
			createQuestionAttempt(session(), { ...input, selectedOptionIds: ["unknown-option"] }),
		).toThrow(ProgressValidationError);
	});

	it("rebuilds attempt statistics without folding in or losing legacy baselines", () => {
		const legacy: QuestionProgress = {
			certificationId: "ccdv-f",
			questionId: "question-stable-id",
			attemptCount: 0,
			correctCount: 0,
			legacyBaseline: { attempts: 4, correct: 2, lastWrong: true },
		};
		const projected = projectQuestionAttempts(
			[
				attempt("00000000-0000-4000-8000-000000000002", "incorrect", 10),
				attempt("00000000-0000-4000-8000-000000000003", "correct", 20),
			],
			[legacy],
		);

		expect(projected).toEqual([
			{
				certificationId: "ccdv-f",
				questionId: "question-stable-id",
				attemptCount: 2,
				correctCount: 1,
				lastOutcome: "correct",
				lastEvaluatedAt: 20,
				lastAttemptSessionId: "00000000-0000-4000-8000-000000000003",
				legacyBaseline: { attempts: 4, correct: 2, lastWrong: true },
			},
		]);
		expect(() =>
			validateLegacyBaseline("ccdv-f", "question-stable-id", {
				attempts: 1,
				correct: 2,
				lastWrong: false,
			}),
		).toThrow(ProgressValidationError);
	});
});
