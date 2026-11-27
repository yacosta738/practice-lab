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

function canonicalJson(value: unknown): string {
	if (Array.isArray(value)) return `[${value.map(canonicalJson).join(",")}]`;
	if (value !== null && typeof value === "object") {
		const entries = Object.entries(value).toSorted(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0));
		return `{${entries.map(([key, item]) => `${JSON.stringify(key)}:${canonicalJson(item)}`).join(",")}}`;
	}
	return JSON.stringify(value) ?? "null";
}

async function digest(value: unknown): Promise<string> {
	const result = await crypto.subtle.digest(
		"SHA-256",
		new TextEncoder().encode(canonicalJson(value)),
	);
	return [...new Uint8Array(result)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
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
			legacy: {
				sourceStorageKey: `${CERTIFICATION_ID}-practice-lab-v2`,
				version: 2,
				limitations: [],
				evaluatedQuestionIds: ["question-one"],
				scoreEvidence: "validated-saved-options",
			},
		});
		const selectedOptionIds = ["option-b", "option-a"];
		const attempt = createQuestionAttempt(session, {
			sessionId: session.id,
			questionId: "question-one",
			selectedOptionIds,
			outcome: "correct",
			scoreEarned: 1,
			scorePossible: 1,
			evaluatedAt: 200,
		});
		expect(attempt.selectedOptionIds).toEqual(["option-a", "option-b"]);
		expect(selectedOptionIds).toEqual(["option-b", "option-a"]);
		const snapshot: LearningDataSnapshot = {
			...emptySnapshot(),
			sessions: [session],
			questionAttempts: [{ ...attempt, selectedOptionIds: ["option-b", "option-a"] }],
			questionProgress: projectQuestionAttempts([attempt], []),
			studyProgress: [
				{
					certificationId: CERTIFICATION_ID,
					noteId: "ccdv-f/introduction",
					status: "completed",
					completedAt: 220,
					completedRevision: "body-revision-1",
					bookmarked: false,
					updatedAt: 220,
				},
			],
			learningGoals: [
				{
					certificationId: CERTIFICATION_ID,
					dailyQuestionTarget: 10,
					targetQuestionCount: null,
					targetNoteCount: null,
					targetDate: null,
					targetDateTimezone: "floating-local",
					legacyTargetDate: 300,
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
		expect(restored.data.sessions[0]?.legacy?.scoreEvidence).toBe("validated-saved-options");
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

	it("serializes backup arrays deterministically without mutating the snapshot", async () => {
		const snapshot: LearningDataSnapshot = {
			...emptySnapshot(),
			studyProgress: [
				{
					certificationId: CERTIFICATION_ID,
					noteId: "ccdv-f/z",
					status: "completed",
					completedAt: 200,
					completedRevision: "body-revision-1",
					bookmarked: false,
					updatedAt: 200,
				},
				{
					certificationId: CERTIFICATION_ID,
					noteId: "ccdv-f/a",
					status: "completed",
					completedAt: 100,
					completedRevision: "body-revision-1",
					bookmarked: true,
					updatedAt: 100,
				},
			],
		};
		Object.freeze(snapshot.studyProgress);

		const backup = await createLearningBackup(snapshot, [], "https://practice.example", 250);
		const reversedBackup = await createLearningBackup(
			{ ...snapshot, studyProgress: [...snapshot.studyProgress].reverse() },
			[],
			"https://practice.example",
			250,
		);

		expect(backup.data.studyProgress.map(({ noteId }) => noteId)).toEqual(["ccdv-f/a", "ccdv-f/z"]);
		expect(snapshot.studyProgress.map(({ noteId }) => noteId)).toEqual(["ccdv-f/z", "ccdv-f/a"]);
		expect(JSON.stringify(backup)).toBe(JSON.stringify(reversedBackup));
	});

	it("normalizes version 1 study records without guessing the timezone of a legacy target", async () => {
		const current = await createLearningBackup(
			emptySnapshot(),
			[],
			"https://practice.example",
			250,
		);
		const legacyPayload = {
			format: current.format,
			schemaVersion: 1,
			exportedAt: current.exportedAt,
			sourceOrigin: current.sourceOrigin,
			data: {
				...current.data,
				studyProgress: [
					{
						certificationId: CERTIFICATION_ID,
						noteId: "ccdv-f/old-note",
						completed: true,
						completedAt: 200,
						bookmarked: true,
						updatedAt: 200,
					},
				],
				learningGoals: [
					{
						certificationId: CERTIFICATION_ID,
						dailyQuestionTarget: 5,
						targetDate: 1_800_000_000_000,
						updatedAt: 200,
					},
				],
			},
		};
		const legacyBackup = {
			...legacyPayload,
			integrity: { algorithm: "SHA-256" as const, digest: await digest(legacyPayload) },
		};

		const restored = await parseLearningBackup(JSON.stringify(legacyBackup), [CERTIFICATION_ID]);

		expect(restored.schemaVersion).toBe(2);
		expect(restored.data.studyProgress[0]).toMatchObject({
			status: "completed",
			completedAt: 200,
			bookmarked: true,
		});
		expect(restored.data.studyProgress[0]).not.toHaveProperty("completed");
		expect(restored.data.learningGoals[0]).toMatchObject({
			targetDate: null,
			targetDateTimezone: "floating-local",
			legacyTargetDate: 1_800_000_000_000,
			targetQuestionCount: null,
			targetNoteCount: null,
		});
	});

	it("projects attempts chronologically without mutating their input order", () => {
		const attempts = [createAttempt("session-b"), createAttempt("session-a")];
		const projected = projectQuestionAttempts(attempts, []);

		expect(attempts.map(({ sessionId }) => sessionId)).toEqual(["session-b", "session-a"]);
		expect(projected).toMatchObject([
			{
				attemptCount: 2,
				lastAttemptSessionId: "session-b",
				lastEvaluatedAt: 200,
			},
		]);
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
						status: "completed",
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
			parseLearningBackup(JSON.stringify({ ...backup, schemaVersion: 3 }), [CERTIFICATION_ID]),
		).rejects.toThrow(/version is not supported/i);
	});

	it("keeps the complete compact backup envelope within the size limit", async () => {
		const snapshot = emptySnapshot();
		const payloadWithEmptyOrigin = {
			format: "practice-lab-learning-backup",
			schemaVersion: 2,
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
