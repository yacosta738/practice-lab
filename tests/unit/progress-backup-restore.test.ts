import { describe, expect, it } from "vitest";
import { parseProgressBackup } from "../../src/lib/progress/backup-restore";

const SESSION_ID = "00000000-0000-4000-8000-000000000001";

const SESSION = {
	id: SESSION_ID,
	certificationId: "ccdv-f",
	mode: "practice",
	status: "completed",
	revision: 3,
	startedAt: 100,
	updatedAt: 150,
	finishedAt: 150,
	scoring: {
		revision: "scoring-v1",
		passingScore: 70,
		totalQuestions: 1,
		domainWeights: { "domain-a": 100 },
	},
	content: {
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
	},
	checkpoint: {
		currentQuestionId: "question-stable-id",
		deadlineAt: null,
		selectedOptionIdsByQuestion: { "question-stable-id": ["option-a"] },
		checkedQuestionIds: ["question-stable-id"],
		flaggedQuestionIds: [],
	},
};

const ATTEMPT = {
	sessionId: SESSION_ID,
	questionId: "question-stable-id",
	certificationId: "ccdv-f",
	domainId: "domain-a",
	questionRevision: "question-v1",
	selectedOptionIds: ["option-a"],
	outcome: "correct",
	scoreEarned: 1,
	scorePossible: 1,
	evaluatedAt: 150,
};

function progressBackup() {
	return {
		format: "practice-lab-progress-export",
		version: 1,
		exportedAt: 200,
		certifications: [
			{
				certificationId: "ccdv-f",
				sessionHistory: [
					{ session: structuredClone(SESSION), attempts: [structuredClone(ATTEMPT)] },
				],
				questionProgress: [
					{
						certificationId: "ccdv-f",
						questionId: "question-stable-id",
						attemptCount: 1,
						correctCount: 1,
						lastOutcome: "correct",
						lastEvaluatedAt: 150,
						lastAttemptSessionId: SESSION_ID,
						legacyBaseline: null,
					},
				],
			},
		],
	};
}

describe("progress backup restore", () => {
	it("validates and normalizes exported certification snapshots", () => {
		const imported = parseProgressBackup(JSON.stringify(progressBackup()), ["ccdv-f"]);

		expect(imported).toHaveLength(1);
		expect(imported[0]).toMatchObject({
			certificationId: "ccdv-f",
			sessionHistory: [{ session: { id: SESSION_ID }, attempts: [ATTEMPT] }],
			questionProgress: [{ questionId: "question-stable-id", attemptCount: 1 }],
		});
	});

	it("accepts recovery exports and rejects unsupported versions or certifications", () => {
		const recovery = {
			...progressBackup(),
			format: "practice-lab-progress-recovery",
			legacyRecords: {
				format: "practice-lab-legacy-export",
				version: 1,
				exportedAt: 200,
				records: [],
			},
		};
		expect(parseProgressBackup(JSON.stringify(recovery), ["ccdv-f"])).toHaveLength(1);
		expect(() =>
			parseProgressBackup(JSON.stringify({ ...progressBackup(), version: 2 }), ["ccdv-f"]),
		).toThrow(/version/i);
		expect(() => parseProgressBackup(JSON.stringify(progressBackup()), ["ccar-f"])).toThrow(
			/certification/i,
		);
	});

	it("rejects snapshots whose attempts or projections do not match their source records", () => {
		const badAttempt = progressBackup();
		badAttempt.certifications[0].sessionHistory[0].attempts[0].certificationId = "ccar-f";
		expect(() => parseProgressBackup(JSON.stringify(badAttempt), ["ccdv-f"])).toThrow(
			/attempt|certification/i,
		);

		const badProjection = progressBackup();
		badProjection.certifications[0].questionProgress[0].correctCount = 0;
		expect(() => parseProgressBackup(JSON.stringify(badProjection), ["ccdv-f"])).toThrow(
			/projection|progress|aggregate/i,
		);
	});
});
