import { describe, expect, it } from "vitest";
import {
	createLearningBackup,
	MAX_LEARNING_BACKUP_SIZE,
	parseLearningBackup,
} from "../../src/lib/progress/learning-backup";
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
				selectedOptionIdsByQuestion: { "question-one": ["option-a", "option-b"] },
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
						correctOptionIds: ["option-a", "option-b"],
						questionText: "Question text",
						domainName: "Domain One",
						explanation: "Explanation",
						sourceLabel: "Guide",
						sourceUrl: "https://example.test/guide",
						selectCount: 2,
					},
				],
			},
		});
		const attempt = createQuestionAttempt(session, {
			sessionId: session.id,
			questionId: "question-one",
			selectedOptionIds: ["option-b", "option-a"],
			outcome: "correct",
			scoreEarned: 1,
			scorePossible: 1,
			evaluatedAt: 200,
		});
		const snapshot = {
			...emptySnapshot(),
			sessions: [session],
			questionAttempts: [{ ...attempt, selectedOptionIds: ["option-b", "option-a"] }],
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
		const legacyRecords = [
			{
				certificationId: CERTIFICATION_ID,
				storageKey: `${CERTIFICATION_ID}-practice-lab-v2`,
				rawValue: null,
			},
		];
		const backup = await createLearningBackup(
			snapshot,
			legacyRecords,
			"https://practice.example",
			250,
		);

		const restored = await parseLearningBackup(JSON.stringify(backup), [CERTIFICATION_ID]);
		const reparsed = await parseLearningBackup(JSON.stringify(restored), [CERTIFICATION_ID]);

		expect(restored.data.sessions).toEqual([session]);
		expect(restored.data.questionAttempts).toEqual([attempt]);
		expect(reparsed.data.questionAttempts).toEqual(restored.data.questionAttempts);
		expect(restored.data.legacyRecords).toEqual(legacyRecords);
		expect(restored.data.questionProgress).toEqual(snapshot.questionProgress);
		expect(restored.data.studyProgress).toEqual(snapshot.studyProgress);
		expect(restored.data.learningGoals).toEqual(snapshot.learningGoals);
		expect(restored.integrity.algorithm).toBe("SHA-256");

		const invalidSession = { ...session, id: 1 as unknown as string };
		const invalidIdBackup = await createLearningBackup(
			{ ...snapshot, sessions: [invalidSession] },
			[],
			"https://practice.example",
			250,
		);
		await expect(
			parseLearningBackup(JSON.stringify(invalidIdBackup), [CERTIFICATION_ID]),
		).rejects.toThrow(/session ID must be a string/i);
	});

	it("rejects question progress from unknown certifications before grouping", async () => {
		const backup = await createLearningBackup(
			{
				...emptySnapshot(),
				questionProgress: [
					{
						certificationId: "unknown-certification",
						questionId: "question-one",
						attemptCount: 0,
						correctCount: 0,
						legacyBaseline: null,
					},
				],
			},
			[],
			"https://practice.example",
			250,
		);

		await expect(parseLearningBackup(JSON.stringify(backup), [CERTIFICATION_ID])).rejects.toThrow(
			/unknown certification/i,
		);
	});

	it("requires a per-certification backup for each legacy migration marker", async () => {
		const backup = await createLearningBackup(
			{
				...emptySnapshot(),
				legacyProvenance: [
					{
						key: `migration:legacy-v2:${CERTIFICATION_ID}`,
						value: {
							certificationId: CERTIFICATION_ID,
							legacyStorageKey: `${CERTIFICATION_ID}-practice-lab-v2`,
							importedAt: 250,
							importedQuestionCount: 0,
							importedSessionId: null,
							warnings: [],
							generationToken: "generation-token",
						},
					},
				],
			},
			[],
			"https://practice.example",
			250,
		);

		await expect(parseLearningBackup(JSON.stringify(backup), [CERTIFICATION_ID])).rejects.toThrow(
			/matching per-certification backup/i,
		);

		const pairedBackup = await createLearningBackup(
			{
				...emptySnapshot(),
				legacyProvenance: [
					{
						key: `legacy-backup:${CERTIFICATION_ID}`,
						value: {
							format: "practice-lab-progress-backup",
							version: 1,
							certificationId: CERTIFICATION_ID,
							legacyStorageKey: `${CERTIFICATION_ID}-practice-lab-v2`,
							capturedAt: 250,
							rawValue: null,
							warnings: [],
						},
					},
					...backup.data.legacyProvenance,
				],
			},
			[],
			"https://practice.example",
			250,
		);
		await expect(
			parseLearningBackup(JSON.stringify(pairedBackup), [CERTIFICATION_ID]),
		).resolves.toMatchObject({ data: { legacyProvenance: expect.any(Array) } });
	});

	it("keeps normalized backups parseable and preserves array order in the digest", async () => {
		const certifications = ["ccdv-f", "ccao-f"];
		const snapshot = {
			...emptySnapshot(),
			questionProgress: certifications.map((certificationId) => ({
				certificationId,
				questionId: "question-one",
				attemptCount: 0,
				correctCount: 0,
				legacyBaseline: null,
			})),
		};
		const backup = await createLearningBackup(snapshot, [], "https://practice.example", 250);
		const normalized = await parseLearningBackup(JSON.stringify(backup), certifications);

		await expect(
			parseLearningBackup(JSON.stringify(normalized), certifications),
		).resolves.toMatchObject({
			data: {
				questionProgress: [
					expect.objectContaining({ certificationId: "ccdv-f" }),
					expect.objectContaining({ certificationId: "ccao-f" }),
				],
			},
		});

		const first = await createLearningBackup(
			{
				...emptySnapshot(),
				legacyProvenance: [
					{
						key: "legacy-backup:ccdv-f",
						value: { nested: { z: 1, a: 2 }, items: ["first", "second"] },
					},
				],
			},
			[],
			"https://practice.example",
			250,
		);
		const reorderedKeys = await createLearningBackup(
			{
				...emptySnapshot(),
				legacyProvenance: [
					{
						key: "legacy-backup:ccdv-f",
						value: { nested: { a: 2, z: 1 }, items: ["first", "second"] },
					},
				],
			},
			[],
			"https://practice.example",
			250,
		);
		const reorderedArray = await createLearningBackup(
			{
				...emptySnapshot(),
				legacyProvenance: [
					{
						key: "legacy-backup:ccdv-f",
						value: { nested: { z: 1, a: 2 }, items: ["second", "first"] },
					},
				],
			},
			[],
			"https://practice.example",
			250,
		);
		expect(reorderedKeys.integrity.digest).toBe(first.integrity.digest);
		expect(reorderedArray.integrity.digest).not.toBe(first.integrity.digest);
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

	it("keeps the complete compact backup envelope within the size limit", async () => {
		const snapshot = emptySnapshot();
		const payloadWithEmptyOrigin = {
			format: "practice-lab-learning-backup",
			schemaVersion: 1,
			exportedAt: 250,
			sourceOrigin: "",
			data: {
				sessions: [],
				questionAttempts: [],
				questionProgress: [],
				studyProgress: [],
				learningGoals: [],
				legacyProvenance: [],
				legacyRecords: [],
			},
		};
		const originLength =
			MAX_LEARNING_BACKUP_SIZE -
			new TextEncoder().encode(JSON.stringify(payloadWithEmptyOrigin)).byteLength;

		await expect(createLearningBackup(snapshot, [], "x".repeat(originLength), 250)).rejects.toThrow(
			/too large to export/i,
		);
	});

	it("reserves legacy archive records that restoration adds to the next export", async () => {
		const snapshot = {
			...emptySnapshot(),
			legacyProvenance: [
				{
					key: "legacy-backup:archive:00000000-0000-4000-8000-000000000001",
					value: {
						format: "practice-lab-legacy-export",
						version: 1,
						exportedAt: 250,
						records: new Array(249_997),
					},
				},
			],
		};

		await expect(
			createLearningBackup(
				snapshot,
				[
					{
						certificationId: CERTIFICATION_ID,
						storageKey: `${CERTIFICATION_ID}-practice-lab-v2`,
						rawValue: null,
					},
				],
				"https://practice.example",
				250,
			),
		).rejects.toThrow(/too many records to export/i);
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
