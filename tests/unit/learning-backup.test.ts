import { describe, expect, it } from "vitest";
import { createLearningBackup, parseLearningBackup } from "../../src/lib/progress/learning-backup";
import {
	createInitialSession,
	createQuestionAttempt,
	type LearningDataSnapshot,
	projectQuestionAttempts,
	type QuestionAttempt,
} from "../../src/lib/progress/model";

const CERTIFICATION_ID = "ccdv-f";

function emptySnapshot(): LearningDataSnapshot {
	return {
		sessions: [],
		questionAttempts: [],
		questionProgress: [],
		studyProgress: [],
		learningGoals: [],
		legacyProvenance: [],
		fingerprint: "test-only",
	};
}

function createAttempt(sessionId: string): QuestionAttempt {
	return {
		sessionId,
		questionId: "question-one",
		certificationId: CERTIFICATION_ID,
		domainId: "domain-one",
		questionRevision: "question-v1",
		selectedOptionIds: ["option-a"],
		outcome: "correct",
		scoreEarned: 1,
		scorePossible: 1,
		evaluatedAt: 200,
	};
}

describe("portable learning backups", () => {
	it("round-trips consistent quiz, study, and goal records with an integrity digest", async () => {
		const session = createInitialSession({
			id: "00000000-0000-4000-8000-000000000001",
			certificationId: CERTIFICATION_ID,
			mode: "practice",
			startedAt: 100,
			scoring: {
				revision: "scoring-v1",
				passingScore: 70,
				totalQuestions: 1,
				domainWeights: { "domain-one": 100 },
			},
			checkpoint: {
				currentQuestionId: "question-one",
				deadlineAt: null,
				selectedOptionIdsByQuestion: { "question-one": ["option-a"] },
				checkedQuestionIds: ["question-one"],
				flaggedQuestionIds: [],
			},
			content: {
				bankRevision: "bank-v1",
				questions: [
					{
						questionId: "question-one",
						revision: "question-v1",
						contentHash: "sha256:question-v1",
						domainId: "domain-one",
						optionIds: ["option-a", "option-b"],
						optionTexts: ["Correct", "Incorrect"],
						displayOptionIds: ["option-a", "option-b"],
						correctOptionIds: ["option-a"],
						questionText: "Question text",
						domainName: "Domain One",
						explanation: "Explanation",
						sourceLabel: "Guide",
						sourceUrl: "https://example.test/guide",
						selectCount: 1,
					},
				],
			},
		});
		const attempt = createQuestionAttempt(session, {
			sessionId: session.id,
			questionId: "question-one",
			selectedOptionIds: ["option-a"],
			outcome: "correct",
			scoreEarned: 1,
			scorePossible: 1,
			evaluatedAt: 200,
		});
		const snapshot = {
			...emptySnapshot(),
			sessions: [session],
			questionAttempts: [attempt],
			questionProgress: projectQuestionAttempts([attempt], []),
			studyProgress: [
				{
					certificationId: CERTIFICATION_ID,
					noteId: "ccdv-f/introduction",
					completed: true,
					completedAt: 220,
					bookmarked: false,
					updatedAt: 220,
				},
			],
			learningGoals: [
				{
					certificationId: CERTIFICATION_ID,
					dailyQuestionTarget: 10,
					targetDate: 300,
					updatedAt: 220,
				},
			],
		};
		const backup = await createLearningBackup(snapshot, [], "https://practice.example", 250);

		const restored = await parseLearningBackup(JSON.stringify(backup), [CERTIFICATION_ID]);

		expect(restored.data.sessions).toEqual([session]);
		expect(restored.data.questionAttempts).toEqual([attempt]);
		expect(restored.data.questionProgress).toEqual(snapshot.questionProgress);
		expect(restored.data.studyProgress).toEqual(snapshot.studyProgress);
		expect(restored.data.learningGoals).toEqual(snapshot.learningGoals);
		expect(restored.integrity.algorithm).toBe("SHA-256");
	});

	it("rejects tampered payloads and unsupported future schema versions", async () => {
		const backup = await createLearningBackup(emptySnapshot(), [], "https://practice.example", 250);
		const tampered = {
			...backup,
			data: {
				...backup.data,
				studyProgress: [
					{
						certificationId: CERTIFICATION_ID,
						noteId: "ccdv-f/introduction",
						completed: true,
						bookmarked: false,
						updatedAt: 1,
					},
				],
			},
		};
		await expect(parseLearningBackup(JSON.stringify(tampered), [CERTIFICATION_ID])).rejects.toThrow(
			/integrity check failed/i,
		);
		await expect(
			parseLearningBackup(JSON.stringify({ ...backup, schemaVersion: 2 }), [CERTIFICATION_ID]),
		).rejects.toThrow(/version is not supported/i);
	});

	it("rejects attempts with no owning session and malformed JSON", async () => {
		const snapshot = {
			...emptySnapshot(),
			questionAttempts: [createAttempt("00000000-0000-4000-8000-000000000001")],
		};
		const backup = await createLearningBackup(snapshot, [], "https://practice.example", 250);

		await expect(parseLearningBackup(JSON.stringify(backup), [CERTIFICATION_ID])).rejects.toThrow(
			/missing session/i,
		);
		await expect(parseLearningBackup("{not json", [CERTIFICATION_ID])).rejects.toThrow(
			/valid json/i,
		);
	});
});
