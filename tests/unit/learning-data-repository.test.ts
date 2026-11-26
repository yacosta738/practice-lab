import "fake-indexeddb/auto";
import { deleteDB } from "idb";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
	type BrowserProgressOptions,
	BrowserProgressService,
} from "../../src/lib/progress/browser-service";
import { openProgressDatabase } from "../../src/lib/progress/database";
import { createProgressRepository } from "../../src/lib/progress/indexeddb-repository";
import {
	createInitialSession,
	createQuestionAttempt,
	type LearningDataRestoreData,
	type LegacyProgressMigrationInput,
	type ProgressSession,
} from "../../src/lib/progress/model";
import type { ProgressRepository } from "../../src/lib/progress/repository-port";
import { PROGRESS_DATABASE_NAME } from "../../src/lib/progress/schema";

const CERTIFICATION_IDS = ["ccdv-f", "ccao-f"];
let repository: ProgressRepository;

function makeSession(id: string, certificationId: string): ProgressSession {
	return createInitialSession({
		id,
		certificationId,
		mode: "practice",
		startedAt: 100,
		scoring: {
			revision: "scoring-v1",
			passingScore: 70,
			totalQuestions: 1,
			domainWeights: { "domain-one": 100 },
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
}

async function seedAdditionalRecords(certificationIds: readonly string[]): Promise<void> {
	const database = await openProgressDatabase(() => undefined);
	const transaction = database.transaction(
		["questionAttempts", "questionProgress", "studyProgress", "learningGoals", "metadata"],
		"readwrite",
	);
	for (const certificationId of certificationIds) {
		const sessionId = `00000000-0000-4000-8000-${certificationId === "ccdv-f" ? "000000000001" : "000000000002"}`;
		await transaction.objectStore("questionProgress").put({
			certificationId,
			questionId: "question-one",
			attemptCount: 0,
			correctCount: 0,
			legacyBaseline: null,
		});
		await transaction.objectStore("studyProgress").put({
			certificationId,
			noteId: `${certificationId}/introduction`,
			status: "completed",
			completedAt: 120,
			completedRevision: "body-revision-1",
			bookmarked: false,
			updatedAt: 120,
		});
		await transaction.objectStore("learningGoals").put({
			certificationId,
			dailyQuestionTarget: 10,
			targetQuestionCount: null,
			targetNoteCount: null,
			targetDate: null,
			targetDateTimezone: "floating-local",
			legacyTargetDate: 300,
			updatedAt: 120,
		});
		const session = makeSession(sessionId, certificationId);
		await transaction.objectStore("questionAttempts").put(
			createQuestionAttempt(session, {
				sessionId,
				questionId: "question-one",
				selectedOptionIds: ["option-a"],
				outcome: "correct",
				scoreEarned: 1,
				scorePossible: 1,
				evaluatedAt: 150,
			}),
		);
	}
	await transaction.objectStore("metadata").put({
		key: "legacy-backup:ccdv-f",
		value: { format: "practice-lab-progress-backup", rawValue: "legacy" },
	});
	await transaction.done;
	database.close();
}

function emptyRestoreData(): LearningDataRestoreData {
	return {
		sessions: [],
		questionAttempts: [],
		questionProgress: [],
		studyProgress: [],
		learningGoals: [],
		legacyProvenance: [],
		legacyRecords: [],
	};
}

beforeEach(async () => {
	await deleteDB(PROGRESS_DATABASE_NAME);
	repository = createProgressRepository();
});

afterEach(async () => {
	await repository.close();
	await deleteDB(PROGRESS_DATABASE_NAME);
});

describe("global learning data repository operations", () => {
	it("resets quiz, study, goals, and active sessions by certification while preserving recovery archives", async () => {
		for (const certificationId of CERTIFICATION_IDS) {
			await repository.createSession(
				makeSession(
					`00000000-0000-4000-8000-${certificationId === "ccdv-f" ? "000000000001" : "000000000002"}`,
					certificationId,
				),
			);
		}
		await seedAdditionalRecords(CERTIFICATION_IDS);
		const previousToken = await repository.getDataGenerationToken("ccdv-f");

		await repository.resetLearningData("ccdv-f", CERTIFICATION_IDS);

		const snapshot = await repository.getLearningDataSnapshot();
		expect(snapshot.sessions.map(({ certificationId }) => certificationId)).toEqual(["ccao-f"]);
		expect(snapshot.questionAttempts.map(({ certificationId }) => certificationId)).toEqual([
			"ccao-f",
		]);
		expect(snapshot.questionProgress.map(({ certificationId }) => certificationId)).toEqual([
			"ccao-f",
		]);
		expect(snapshot.studyProgress.map(({ certificationId }) => certificationId)).toEqual([
			"ccao-f",
		]);
		expect(snapshot.learningGoals.map(({ certificationId }) => certificationId)).toEqual([
			"ccao-f",
		]);
		expect(await repository.getDataGenerationToken("ccdv-f")).not.toBe(previousToken);
		expect(await repository.getMetadata("legacy-import-suppressed:ccdv-f")).toBe(true);
		expect(await repository.getMetadata("legacy-backup:ccdv-f")).toEqual({
			format: "practice-lab-progress-backup",
			rawValue: "legacy",
		});
	});

	it("replaces all learning stores atomically and suppresses future legacy import", async () => {
		for (const certificationId of CERTIFICATION_IDS) {
			const sessionId = `00000000-0000-4000-8000-${certificationId === "ccdv-f" ? "000000000001" : "000000000002"}`;
			await repository.createSession(makeSession(sessionId, certificationId));
		}
		await seedAdditionalRecords(CERTIFICATION_IDS);
		const previousTokens = Object.fromEntries(
			await Promise.all(
				CERTIFICATION_IDS.map(async (certificationId) => [
					certificationId,
					await repository.getDataGenerationToken(certificationId),
				]),
			),
		);
		const before = await repository.getLearningDataSnapshot();
		const importedSession = makeSession("00000000-0000-4000-8000-000000000003", "ccdv-f");
		const data: LearningDataRestoreData = {
			...emptyRestoreData(),
			sessions: [importedSession],
			studyProgress: [
				{
					certificationId: "ccdv-f",
					noteId: "ccdv-f/introduction",
					status: "completed",
					completedAt: 150,
					completedRevision: "body-revision-1",
					bookmarked: true,
					updatedAt: 150,
				},
			],
			learningGoals: [
				{
					certificationId: "ccdv-f",
					dailyQuestionTarget: 5,
					targetQuestionCount: null,
					targetNoteCount: null,
					targetDate: null,
					targetDateTimezone: "floating-local",
					legacyTargetDate: 300,
					updatedAt: 150,
				},
			],
			legacyProvenance: [{ key: "legacy-backup:ccdv-f", value: { rawValue: "archived" } }],
			legacyRecords: CERTIFICATION_IDS.map((certificationId) => ({
				certificationId,
				storageKey: `${certificationId}-practice-lab-v2`,
				rawValue: null,
			})),
		};
		const invalidData = {
			...data,
			studyProgress: [...data.studyProgress, ...data.studyProgress],
		};

		await expect(
			repository.replaceLearningData(invalidData, CERTIFICATION_IDS, before.fingerprint),
		).rejects.toThrow();
		expect(await repository.getLearningDataSnapshot()).toEqual(before);
		for (const certificationId of CERTIFICATION_IDS) {
			expect(await repository.getDataGenerationToken(certificationId)).toBe(
				previousTokens[certificationId],
			);
		}

		const tokens = await repository.replaceLearningData(
			data,
			CERTIFICATION_IDS,
			before.fingerprint,
		);

		const after = await repository.getLearningDataSnapshot();
		expect(after.sessions).toEqual([importedSession]);
		expect(after.studyProgress).toEqual(data.studyProgress);
		expect(after.learningGoals).toEqual(data.learningGoals);
		const archivedLegacy = after.legacyProvenance.find(({ key }) =>
			key.startsWith("legacy-backup:archive:"),
		);
		expect(archivedLegacy?.value).toMatchObject({ records: data.legacyRecords });
		expect(after.legacyProvenance).toEqual(
			expect.arrayContaining([
				{ key: "legacy-backup:ccdv-f", value: { rawValue: "archived" } },
				{ key: "legacy-backup:latest", value: expect.stringMatching(/^legacy-backup:archive:/) },
			]),
		);
		expect(tokens).toHaveProperty("ccdv-f");
		expect(tokens).toHaveProperty("ccao-f");
		expect(await repository.getMetadata("legacy-import-suppressed:ccdv-f")).toBe(true);
		expect(await repository.getMetadata("legacy-import-suppressed:ccao-f")).toBe(true);
	});

	it("changes the restore fingerprint when a reset changes generation state", async () => {
		await repository.getDataGenerationToken("ccdv-f");
		const reviewed = await repository.getLearningDataSnapshot();

		await repository.resetLearningData("ccdv-f", CERTIFICATION_IDS);

		const afterReset = await repository.getLearningDataSnapshot();
		expect(afterReset.fingerprint).not.toBe(reviewed.fingerprint);
		await expect(
			repository.replaceLearningData(emptyRestoreData(), CERTIFICATION_IDS, reviewed.fingerprint),
		).rejects.toThrow(/changed while the restore was being reviewed/i);
	});

	it("does not change the restore fingerprint when only the backup timestamp changes", async () => {
		const reviewed = await repository.getLearningDataSnapshot();

		await repository.markSuccessfulBackup(300);

		const afterBackup = await repository.getLearningDataSnapshot();
		expect(afterBackup.lastBackupAt).toBe(300);
		expect(afterBackup.fingerprint).toBe(reviewed.fingerprint);
	});

	it("rejects an oversized legacy archive before clearing current learning data", async () => {
		const existingSession = makeSession("00000000-0000-4000-8000-000000000004", "ccdv-f");
		await repository.createSession(existingSession);
		const generationToken = await repository.getDataGenerationToken("ccdv-f");
		const before = await repository.getLearningDataSnapshot();
		const archivedRecord = {
			certificationId: "ccdv-f",
			storageKey: "ccdv-f-practice-lab-v2",
			rawValue: null,
		};
		const oversizedData: LearningDataRestoreData = {
			...emptyRestoreData(),
			legacyProvenance: [
				{
					key: "legacy-backup:archive:00000000-0000-4000-8000-000000000001",
					value: {
						format: "practice-lab-legacy-export",
						version: 1,
						exportedAt: 300,
						records: new Array(249_995).fill(archivedRecord),
					},
				},
			],
			legacyRecords: CERTIFICATION_IDS.map((certificationId) => ({
				certificationId,
				storageKey: `${certificationId}-practice-lab-v2`,
				rawValue: null,
			})),
		};

		await expect(
			repository.replaceLearningData(oversizedData, CERTIFICATION_IDS, before.fingerprint),
		).rejects.toThrow(/too many records to restore/i);
		expect(await repository.getLearningDataSnapshot()).toEqual(before);
		expect(await repository.getDataGenerationToken("ccdv-f")).toBe(generationToken);
	});

	it("does not migrate legacy progress after a reset suppresses future imports", async () => {
		await repository.resetLearningData("ccdv-f", CERTIFICATION_IDS);
		const migration: LegacyProgressMigrationInput = {
			certificationId: "ccdv-f",
			legacyStorageKey: "ccdv-f-practice-lab-v2",
			rawValue: '{"stats":{"question-one":{"attempts":1,"correct":1,"lastWrong":false}}}',
			migratedAt: 300,
			baselines: [
				{
					questionId: "question-one",
					baseline: { attempts: 1, correct: 1, lastWrong: false },
				},
			],
			warnings: [],
		};

		await expect(repository.migrateLegacyData(migration)).rejects.toThrow(/suppressed/i);
		expect(await repository.getQuestionProgress("ccdv-f", "question-one")).toBeUndefined();
		expect(await repository.getMetadata("migration:legacy-v2:ccdv-f")).toBeUndefined();
		expect(await repository.getMetadata("legacy-backup:ccdv-f")).toBeUndefined();
	});

	it("ignores legacy storage events only for certifications with import suppression", async () => {
		await repository.resetLearningData("ccdv-f", CERTIFICATION_IDS);
		const options = (certificationId: string): BrowserProgressOptions => ({
			certificationId,
			config: {} as BrowserProgressOptions["config"],
			questions: [],
			knownCertificationIds: CERTIFICATION_IDS,
		});
		const changedStorage = {
			key: "ccdv-f-practice-lab-v2",
			newValue: "changed-by-legacy-tab",
		} as StorageEvent;
		const suppressedService = new BrowserProgressService(options("ccdv-f"));
		await (
			suppressedService as unknown as {
				onStorageChange(event: StorageEvent): Promise<void>;
			}
		).onStorageChange(changedStorage);
		expect(
			(suppressedService as unknown as { legacyWriteDetected: boolean }).legacyWriteDetected,
		).toBe(false);

		const unsuppressedService = new BrowserProgressService(options("ccao-f"));
		await (
			unsuppressedService as unknown as {
				onStorageChange(event: StorageEvent): Promise<void>;
			}
		).onStorageChange({
			...changedStorage,
			key: "ccao-f-practice-lab-v2",
		} as StorageEvent);
		expect(
			(unsuppressedService as unknown as { legacyWriteDetected: boolean }).legacyWriteDetected,
		).toBe(true);
	});

	it("rejects a stale restore fingerprint without replacing current records", async () => {
		const before = await repository.getLearningDataSnapshot();
		const activeSession = makeSession("00000000-0000-4000-8000-000000000004", "ccdv-f");
		await repository.createSession(activeSession);

		await expect(
			repository.replaceLearningData(emptyRestoreData(), CERTIFICATION_IDS, before.fingerprint),
		).rejects.toThrow(/changed while the restore was being reviewed/i);
		expect(await repository.getSession(activeSession.id)).toEqual(activeSession);
	});

	it("resets all learning stores in one operation", async () => {
		for (const certificationId of CERTIFICATION_IDS) {
			await repository.createSession(
				makeSession(
					`00000000-0000-4000-8000-${certificationId === "ccdv-f" ? "000000000001" : "000000000002"}`,
					certificationId,
				),
			);
		}
		await seedAdditionalRecords(CERTIFICATION_IDS);

		await repository.resetLearningData(null, CERTIFICATION_IDS);

		const snapshot = await repository.getLearningDataSnapshot();
		expect(snapshot.sessions).toEqual([]);
		expect(snapshot.questionAttempts).toEqual([]);
		expect(snapshot.questionProgress).toEqual([]);
		expect(snapshot.studyProgress).toEqual([]);
		expect(snapshot.learningGoals).toEqual([]);
		expect(await repository.getMetadata("legacy-import-suppressed:ccdv-f")).toBe(true);
		expect(await repository.getMetadata("legacy-import-suppressed:ccao-f")).toBe(true);
	});
});
