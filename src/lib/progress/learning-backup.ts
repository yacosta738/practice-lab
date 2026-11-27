import { parseProgressBackup } from "./backup-restore";
import { ProgressValidationError } from "./errors";
import type {
	LearningDataRestoreData,
	LearningDataSnapshot,
	LearningGoalRecord,
	LegacyProgressBackup,
	LegacyProgressMigrationResult,
	LegacyRecordsBackup,
	LegacyStorageRecord,
	ProgressSession,
	QuestionAttempt,
	QuestionProgress,
	StudyProgressRecord,
} from "./model";
import { UUID_PATTERN } from "./model";
import { REVIEW_SCHEDULER_POLICY_VERSION } from "./review-scheduler";
import { isValidLearningGoalRecord, isValidStudyProgressRecord } from "./study-domain";

export const LEARNING_BACKUP_FORMAT = "practice-lab-learning-backup";
export const MAX_LEARNING_BACKUP_SIZE = 50 * 1024 * 1024;
export const MAX_LEARNING_BACKUP_RECORDS = 250_000;

export interface LearningBackup {
	format: typeof LEARNING_BACKUP_FORMAT;
	schemaVersion: 2;
	schedulerPolicyVersion?: string;
	exportedAt: number;
	sourceOrigin: string;
	data: LearningDataRestoreData;
	integrity: { algorithm: "SHA-256"; digest: string };
}

export async function createLearningBackup(
	snapshot: LearningDataSnapshot,
	legacyRecords: readonly LegacyStorageRecord[],
	sourceOrigin: string,
	exportedAt = Date.now(),
): Promise<LearningBackup> {
	const data: LearningDataRestoreData = {
		sessions: snapshot.sessions.toSorted((a, b) => a.id.localeCompare(b.id)),
		questionAttempts: snapshot.questionAttempts.toSorted(
			(a, b) => a.sessionId.localeCompare(b.sessionId) || a.questionId.localeCompare(b.questionId),
		),
		questionProgress: snapshot.questionProgress.toSorted(
			(a, b) =>
				a.certificationId.localeCompare(b.certificationId) ||
				a.questionId.localeCompare(b.questionId),
		),
		studyProgress: snapshot.studyProgress.toSorted(
			(a, b) =>
				a.certificationId.localeCompare(b.certificationId) || a.noteId.localeCompare(b.noteId),
		),
		learningGoals: snapshot.learningGoals.toSorted((a, b) =>
			a.certificationId.localeCompare(b.certificationId),
		),
		legacyProvenance: snapshot.legacyProvenance.toSorted((a, b) => a.key.localeCompare(b.key)),
		legacyRecords: legacyRecords.toSorted((a, b) =>
			a.certificationId.localeCompare(b.certificationId),
		),
	};
	const payload: Omit<LearningBackup, "integrity"> = {
		format: LEARNING_BACKUP_FORMAT,
		schemaVersion: 2,
		schedulerPolicyVersion: REVIEW_SCHEDULER_POLICY_VERSION,
		exportedAt,
		sourceOrigin,
		data,
	};
	const recordCount = countLearningRecordsForRestoreExport(data, legacyRecords.length);
	if (recordCount > MAX_LEARNING_BACKUP_RECORDS) {
		throw new ProgressValidationError("The learning backup contains too many records to export.");
	}
	const encoder = new TextEncoder();
	const envelope: LearningBackup = {
		...payload,
		integrity: { algorithm: "SHA-256", digest: "0".repeat(64) },
	};
	if (encoder.encode(JSON.stringify(envelope)).byteLength > MAX_LEARNING_BACKUP_SIZE) {
		throw new ProgressValidationError(
			"The learning backup is too large to export (50 MB maximum).",
		);
	}
	return {
		...envelope,
		integrity: { algorithm: "SHA-256", digest: await digest(payload) },
	};
}

export async function parseLearningBackup(
	rawJson: string,
	knownCertificationIds: readonly string[],
): Promise<LearningBackup> {
	if (new TextEncoder().encode(rawJson).byteLength > MAX_LEARNING_BACKUP_SIZE) {
		throw new ProgressValidationError(
			"The selected backup is too large to restore (50 MB maximum).",
		);
	}
	let parsed: unknown;
	try {
		parsed = JSON.parse(rawJson);
	} catch {
		throw new ProgressValidationError("The selected file is not valid JSON.");
	}
	const backup = asRecord(parsed, "The selected file must contain a learning backup object.");
	assertExactKeys(
		backup,
		["format", "schemaVersion", "exportedAt", "sourceOrigin", "data", "integrity"],
		["schedulerPolicyVersion"],
	);
	if (backup.format !== LEARNING_BACKUP_FORMAT) {
		throw new ProgressValidationError("This file is not a Practice Lab learning data backup.");
	}
	if (backup.schemaVersion !== 1 && backup.schemaVersion !== 2) {
		throw new ProgressValidationError("This learning backup version is not supported.");
	}
	if (
		backup.schedulerPolicyVersion !== undefined &&
		(typeof backup.schedulerPolicyVersion !== "string" ||
			backup.schedulerPolicyVersion.trim().length === 0 ||
			backup.schedulerPolicyVersion.length > 64)
	) {
		throw new ProgressValidationError(
			"The learning backup has an invalid scheduler policy version.",
		);
	}
	if (!isTimestamp(backup.exportedAt)) {
		throw new ProgressValidationError("The learning backup has an invalid export timestamp.");
	}
	if (typeof backup.sourceOrigin !== "string" || backup.sourceOrigin.length > 2_048) {
		throw new ProgressValidationError("The learning backup has an invalid source origin.");
	}
	const dataRecord = asRecord(backup.data, "The learning backup is missing its data records.");
	assertExactKeys(dataRecord, [
		"sessions",
		"questionAttempts",
		"questionProgress",
		"studyProgress",
		"learningGoals",
		"legacyProvenance",
		"legacyRecords",
	]);
	const sourceStudyProgress = validateArray<Record<string, unknown>>(
		dataRecord.studyProgress,
		"study progress",
		backup.schemaVersion === 1 ? validateLegacyStudyProgressShape : validateStudyProgressShape,
	);
	const sourceLearningGoals = validateArray<Record<string, unknown>>(
		dataRecord.learningGoals,
		"learning goals",
		backup.schemaVersion === 1 ? validateLegacyLearningGoalShape : validateLearningGoalShape,
	);
	const data: LearningDataRestoreData = {
		sessions: validateArray<ProgressSession>(dataRecord.sessions, "sessions", validateSessionShape),
		questionAttempts: validateArray<QuestionAttempt>(
			dataRecord.questionAttempts,
			"question attempts",
			validateAttemptShape,
		),
		questionProgress: validateArray<QuestionProgress>(
			dataRecord.questionProgress,
			"question progress",
			validateQuestionProgressShape,
		),
		studyProgress: sourceStudyProgress.map((record) =>
			backup.schemaVersion === 1
				? normalizeLegacyStudyProgress(record)
				: (record as unknown as StudyProgressRecord),
		),
		learningGoals: sourceLearningGoals.map((record) =>
			backup.schemaVersion === 1
				? normalizeLegacyLearningGoal(record)
				: (record as unknown as LearningGoalRecord),
		),
		legacyProvenance: validateArray<{ key: string; value: unknown }>(
			dataRecord.legacyProvenance,
			"legacy provenance",
			validateLegacyProvenance,
		),
		legacyRecords: validateArray<LegacyStorageRecord>(
			dataRecord.legacyRecords,
			"legacy records",
			validateLegacyStorageRecord,
		),
	};
	const recordCount = countLearningRecordsForRestoreExport(data, knownCertificationIds.length);
	if (recordCount > MAX_LEARNING_BACKUP_RECORDS) {
		throw new ProgressValidationError("The learning backup contains too many records to restore.");
	}
	const integrity = asRecord(
		backup.integrity,
		"The learning backup is missing integrity metadata.",
	);
	assertExactKeys(integrity, ["algorithm", "digest"]);
	if (
		integrity.algorithm !== "SHA-256" ||
		typeof integrity.digest !== "string" ||
		!/^[0-9a-f]{64}$/.test(integrity.digest)
	) {
		throw new ProgressValidationError("The learning backup integrity metadata is invalid.");
	}
	const sourcePayload = {
		format: LEARNING_BACKUP_FORMAT,
		schemaVersion: backup.schemaVersion,
		...(backup.schedulerPolicyVersion === undefined
			? {}
			: { schedulerPolicyVersion: backup.schedulerPolicyVersion as string }),
		exportedAt: backup.exportedAt as number,
		sourceOrigin: backup.sourceOrigin as string,
		data: dataRecord,
	};
	if ((await digest(sourcePayload)) !== integrity.digest) {
		throw new ProgressValidationError(
			"The learning backup integrity check failed; no data was changed.",
		);
	}
	validateCertificationData(data, knownCertificationIds, backup.exportedAt);
	const payload: Omit<LearningBackup, "integrity"> = {
		format: LEARNING_BACKUP_FORMAT,
		schemaVersion: 2,
		schedulerPolicyVersion: REVIEW_SCHEDULER_POLICY_VERSION,
		exportedAt: backup.exportedAt as number,
		sourceOrigin: backup.sourceOrigin as string,
		data,
	};
	return {
		...payload,
		integrity: { algorithm: "SHA-256", digest: await digest(payload) },
	};
}

function validateCertificationData(
	data: LearningDataRestoreData,
	knownCertificationIds: readonly string[],
	exportedAt: number,
): void {
	const knownIds = new Set(knownCertificationIds);
	if (knownIds.size === 0 || knownIds.size !== knownCertificationIds.length) {
		throw new ProgressValidationError("The available certification list is invalid.");
	}
	const sessionById = new Map<string, ProgressSession>();
	for (const session of data.sessions) {
		if (sessionById.has(session.id) || !knownIds.has(session.certificationId)) {
			throw new ProgressValidationError(
				"The backup contains a duplicate session or unknown certification.",
			);
		}
		sessionById.set(session.id, session);
	}
	const attemptsBySession = new Map<string, QuestionAttempt[]>();
	for (const attempt of data.questionAttempts) {
		const session = sessionById.get(attempt.sessionId);
		if (!session || attempt.certificationId !== session.certificationId) {
			throw new ProgressValidationError(
				"An attempt refers to a missing session or different certification.",
			);
		}
		const attempts = attemptsBySession.get(attempt.sessionId) ?? [];
		attempts.push(attempt);
		attemptsBySession.set(attempt.sessionId, attempts);
	}
	for (const progress of data.questionProgress) {
		if (!knownIds.has(progress.certificationId)) {
			throw new ProgressValidationError("Question progress refers to an unknown certification.");
		}
	}
	const snapshots = knownCertificationIds.map((certificationId) => ({
		certificationId,
		sessionHistory: data.sessions
			.filter((session) => session.certificationId === certificationId)
			.map((session) => ({ session, attempts: attemptsBySession.get(session.id) ?? [] })),
		questionProgress: data.questionProgress.filter(
			(progress) => progress.certificationId === certificationId,
		),
	}));
	const normalized = parseProgressBackup(
		JSON.stringify({
			format: "practice-lab-progress-export",
			version: 1,
			exportedAt,
			certifications: snapshots,
		}),
		knownCertificationIds,
	);
	const normalizedSessions = normalized.flatMap((snapshot) => snapshot.sessionHistory);
	data.sessions = normalizedSessions.map(({ session }) => session);
	data.questionAttempts = normalizedSessions.flatMap(({ attempts }) => attempts);
	data.questionProgress = normalized.flatMap((snapshot) => snapshot.questionProgress);

	for (const progress of data.studyProgress) {
		if (!knownIds.has(progress.certificationId)) {
			throw new ProgressValidationError("Study progress refers to an unknown certification.");
		}
	}
	const studyKeys = new Set<string>();
	for (const progress of data.studyProgress) {
		const key = `${progress.certificationId}\u0000${progress.noteId}`;
		if (studyKeys.has(key))
			throw new ProgressValidationError("The backup contains duplicate study records.");
		studyKeys.add(key);
	}
	const goalIds = new Set<string>();
	for (const goal of data.learningGoals) {
		if (!knownIds.has(goal.certificationId) || goalIds.has(goal.certificationId)) {
			throw new ProgressValidationError("A learning goal refers to an unknown certification.");
		}
		goalIds.add(goal.certificationId);
	}
	const provenanceKeys = new Set<string>();
	for (const provenance of data.legacyProvenance) {
		if (provenanceKeys.has(provenance.key)) {
			throw new ProgressValidationError("The backup contains duplicate legacy provenance records.");
		}
		provenanceKeys.add(provenance.key);
		validateLegacyMetadata(provenance.key, provenance.value, knownIds);
	}
	const provenanceByKey = new Map(data.legacyProvenance.map(({ key, value }) => [key, value]));
	for (const provenance of data.legacyProvenance) {
		if (!provenance.key.startsWith("migration:legacy-v2:")) continue;
		const certificationId = provenance.key.slice("migration:legacy-v2:".length);
		if (!provenanceByKey.has(`legacy-backup:${certificationId}`)) {
			throw new ProgressValidationError(
				"A legacy migration marker is missing its matching per-certification backup.",
			);
		}
	}
	const latestArchive = data.legacyProvenance.find(
		({ key }) => key === "legacy-backup:latest",
	)?.value;
	if (latestArchive !== undefined && !provenanceKeys.has(String(latestArchive))) {
		throw new ProgressValidationError("The legacy backup index refers to a missing archive.");
	}
	const legacyIds = new Set<string>();
	for (const record of data.legacyRecords) {
		if (!knownIds.has(record.certificationId) || legacyIds.has(record.certificationId)) {
			throw new ProgressValidationError("The backup contains duplicate or unknown legacy records.");
		}
		legacyIds.add(record.certificationId);
	}
}

function validateLegacyMetadata(key: string, value: unknown, knownIds: ReadonlySet<string>): void {
	if (key.startsWith("migration:legacy-v2:")) {
		const certificationId = key.slice("migration:legacy-v2:".length);
		if (!knownIds.has(certificationId) || !isLegacyMigrationResult(value, certificationId)) {
			throw new ProgressValidationError("The backup contains an invalid legacy migration marker.");
		}
		return;
	}
	if (key === "legacy-backup:latest") {
		if (typeof value !== "string" || !value.startsWith("legacy-backup:archive:")) {
			throw new ProgressValidationError("The legacy backup index is invalid.");
		}
		return;
	}
	if (key.startsWith("legacy-backup:archive:")) {
		if (!UUID_PATTERN.test(key.slice("legacy-backup:archive:".length))) {
			throw new ProgressValidationError("A legacy archive ID is invalid.");
		}
		if (isLegacyRecordsBackup(value)) {
			for (const record of value.records) {
				validateLegacyStorageRecord(record);
				if (!knownIds.has(record.certificationId)) {
					throw new ProgressValidationError("A legacy archive contains an unknown certification.");
				}
			}
			return;
		}
		if (isLegacyProgressBackup(value, knownIds)) return;
		throw new ProgressValidationError("A legacy archive has an unsupported format.");
	}
	const certificationId = key.slice("legacy-backup:".length);
	if (!knownIds.has(certificationId) || !isLegacyProgressBackup(value, knownIds, certificationId)) {
		throw new ProgressValidationError("A per-certification legacy backup is invalid.");
	}
}

function countLearningRecords(data: LearningDataRestoreData): number {
	const directCount = Object.values(data).reduce((total, records) => total + records.length, 0);
	const archivedLegacyCount = data.legacyProvenance.reduce((total, provenance) => {
		return total + (isLegacyRecordsBackup(provenance.value) ? provenance.value.records.length : 0);
	}, 0);
	return directCount + archivedLegacyCount;
}

export function countLearningRecordsForRestoreExport(
	data: LearningDataRestoreData,
	certificationCount: number,
): number {
	const archiveRecords = data.legacyRecords.length > 0 ? 1 : 0;
	const latestArchiveRecord =
		archiveRecords > 0 && !data.legacyProvenance.some(({ key }) => key === "legacy-backup:latest")
			? 1
			: 0;
	return countLearningRecords(data) + certificationCount + archiveRecords + latestArchiveRecord;
}

function isLegacyMigrationResult(
	value: unknown,
	certificationId: string,
): value is LegacyProgressMigrationResult {
	if (value === null || typeof value !== "object" || Array.isArray(value)) return false;
	const marker = value as Record<string, unknown>;
	return (
		hasExactKeys(marker, [
			"certificationId",
			"legacyStorageKey",
			"importedAt",
			"importedQuestionCount",
			"importedSessionId",
			"warnings",
			"generationToken",
		]) &&
		marker.certificationId === certificationId &&
		marker.legacyStorageKey === `${certificationId}-practice-lab-v2` &&
		isTimestamp(marker.importedAt) &&
		isCounter(marker.importedQuestionCount) &&
		(marker.importedSessionId === null || typeof marker.importedSessionId === "string") &&
		Array.isArray(marker.warnings) &&
		marker.warnings.every((warning) => typeof warning === "string") &&
		typeof marker.generationToken === "string"
	);
}

function isLegacyProgressBackup(
	value: unknown,
	knownIds: ReadonlySet<string>,
	expectedCertificationId?: string,
): value is LegacyProgressBackup {
	if (value === null || typeof value !== "object" || Array.isArray(value)) return false;
	const backup = value as Record<string, unknown>;
	return (
		hasExactKeys(backup, [
			"format",
			"version",
			"certificationId",
			"legacyStorageKey",
			"capturedAt",
			"rawValue",
			"warnings",
		]) &&
		backup.format === "practice-lab-progress-backup" &&
		backup.version === 1 &&
		typeof backup.certificationId === "string" &&
		knownIds.has(backup.certificationId) &&
		(expectedCertificationId === undefined || backup.certificationId === expectedCertificationId) &&
		backup.legacyStorageKey === `${backup.certificationId}-practice-lab-v2` &&
		isTimestamp(backup.capturedAt) &&
		(backup.rawValue === null || typeof backup.rawValue === "string") &&
		Array.isArray(backup.warnings) &&
		backup.warnings.every((warning) => typeof warning === "string")
	);
}

function isLegacyRecordsBackup(value: unknown): value is LegacyRecordsBackup {
	if (value === null || typeof value !== "object" || Array.isArray(value)) return false;
	const backup = value as Record<string, unknown>;
	return (
		hasExactKeys(backup, ["format", "version", "exportedAt", "records"]) &&
		backup.format === "practice-lab-legacy-export" &&
		backup.version === 1 &&
		isTimestamp(backup.exportedAt) &&
		Array.isArray(backup.records)
	);
}

function validateSessionShape(value: unknown): asserts value is ProgressSession {
	const session = asRecord(value, "A session record is invalid.");
	if (typeof session.id !== "string") {
		throw new ProgressValidationError("A session ID must be a string.");
	}
	assertExactKeys(
		session,
		[
			"id",
			"certificationId",
			"mode",
			"status",
			"revision",
			"startedAt",
			"updatedAt",
			"scoring",
			"content",
			"checkpoint",
		],
		["finishedAt", "legacy"],
	);
	const scoring = asRecord(session.scoring, "A session scoring snapshot is invalid.");
	assertExactKeys(scoring, ["revision", "passingScore", "totalQuestions", "domainWeights"]);
	const content = asRecord(session.content, "A session content snapshot is invalid.");
	assertExactKeys(content, ["bankRevision", "questions"]);
	if (!Array.isArray(content.questions))
		throw new ProgressValidationError("A session content snapshot is invalid.");
	for (const rawQuestion of content.questions) {
		const question = asRecord(rawQuestion, "A frozen question snapshot is invalid.");
		assertExactKeys(
			question,
			[
				"questionId",
				"revision",
				"contentHash",
				"domainId",
				"optionIds",
				"optionTexts",
				"displayOptionIds",
				"correctOptionIds",
				"questionText",
				"domainName",
				"explanation",
				"sourceLabel",
				"sourceUrl",
				"selectCount",
			],
			["topic", "whyNot", "snapshot"],
		);
		if (question.snapshot !== undefined) validateFrozenQuestionSnapshotShape(question.snapshot);
	}
	const checkpoint = asRecord(session.checkpoint, "A session checkpoint is invalid.");
	assertExactKeys(checkpoint, [
		"currentQuestionId",
		"deadlineAt",
		"selectedOptionIdsByQuestion",
		"checkedQuestionIds",
		"flaggedQuestionIds",
	]);
	if (session.legacy !== undefined) {
		const legacy = asRecord(session.legacy, "Legacy session provenance is invalid.");
		assertExactKeys(
			legacy,
			["sourceStorageKey", "version", "limitations", "evaluatedQuestionIds"],
			["scoreEvidence"],
		);
	}
}

function validateFrozenQuestionSnapshotShape(value: unknown): void {
	const snapshot = asRecord(value, "A frozen question content snapshot is invalid.");
	assertExactKeys(
		snapshot,
		["question", "domainName", "options", "correctOptionIds", "explanation", "source"],
		["topic", "whyNot"],
	);
	if (
		typeof snapshot.question !== "string" ||
		typeof snapshot.domainName !== "string" ||
		typeof snapshot.explanation !== "string" ||
		!Array.isArray(snapshot.options) ||
		!Array.isArray(snapshot.correctOptionIds) ||
		!snapshot.correctOptionIds.every((id) => typeof id === "string")
	) {
		throw new ProgressValidationError("A frozen question content snapshot is invalid.");
	}
	for (const rawOption of snapshot.options) {
		const option = asRecord(rawOption, "A frozen question option is invalid.");
		assertExactKeys(option, ["id", "text"]);
		if (typeof option.id !== "string" || typeof option.text !== "string") {
			throw new ProgressValidationError("A frozen question option is invalid.");
		}
	}
	const source = asRecord(snapshot.source, "A frozen question source is invalid.");
	assertExactKeys(source, ["label", "url"]);
	if (typeof source.label !== "string" || typeof source.url !== "string") {
		throw new ProgressValidationError("A frozen question source is invalid.");
	}
}

function validateAttemptShape(value: unknown): asserts value is QuestionAttempt {
	const attempt = asRecord(value, "A question attempt record is invalid.");
	assertExactKeys(attempt, [
		"sessionId",
		"questionId",
		"certificationId",
		"domainId",
		"questionRevision",
		"selectedOptionIds",
		"outcome",
		"scoreEarned",
		"scorePossible",
		"evaluatedAt",
	]);
}

function validateQuestionProgressShape(value: unknown): asserts value is QuestionProgress {
	const progress = asRecord(value, "A question progress record is invalid.");
	assertExactKeys(
		progress,
		["certificationId", "questionId", "attemptCount", "correctCount", "legacyBaseline"],
		["lastOutcome", "lastEvaluatedAt", "lastAttemptSessionId", "mastery", "reviewSchedule"],
	);
	if (progress.mastery !== undefined) {
		const mastery = asRecord(progress.mastery, "A question mastery evidence record is invalid.");
		assertExactKeys(
			mastery,
			["policyVersion", "revision", "consecutiveCorrectSessions", "countedSessionIds"],
			[
				"streakStartedAt",
				"lastCorrectAt",
				"lastCorrectSessionId",
				"lastIncorrectAt",
				"lastDemotionReason",
			],
		);
	}
	if (progress.reviewSchedule !== undefined) {
		const schedule = asRecord(
			progress.reviewSchedule,
			"A question review schedule record is invalid.",
		);
		assertExactKeys(
			schedule,
			[
				"policyVersion",
				"revision",
				"intervalDays",
				"stepIndex",
				"consecutiveCorrect",
				"lastOutcome",
				"lastEvaluatedAt",
				"lastAttemptSessionId",
				"dueDate",
				"dueDateTimezone",
			],
			["scheduledInTimeZone"],
		);
	}
	if (progress.legacyBaseline !== null) {
		const baseline = asRecord(progress.legacyBaseline, "A legacy progress baseline is invalid.");
		assertExactKeys(baseline, ["attempts", "correct", "lastWrong"]);
	}
}

function validateStudyProgressShape(value: unknown): asserts value is StudyProgressRecord {
	const progress = asRecord(value, "A study progress record is invalid.");
	assertExactKeys(
		progress,
		["certificationId", "noteId", "status", "bookmarked", "updatedAt"],
		[
			"completedAt",
			"completedRevision",
			"lastOpenedAt",
			"readingPositionAnchor",
			"contentRevision",
		],
	);
	if (!isValidStudyProgressRecord(progress as unknown as StudyProgressRecord)) {
		throw new ProgressValidationError("A study progress record has invalid field values.");
	}
}

function validateLearningGoalShape(value: unknown): asserts value is LearningGoalRecord {
	const goal = asRecord(value, "A learning goal record is invalid.");
	assertExactKeys(
		goal,
		[
			"certificationId",
			"dailyQuestionTarget",
			"targetQuestionCount",
			"targetNoteCount",
			"targetDate",
			"targetDateTimezone",
			"updatedAt",
		],
		["legacyTargetDate"],
	);
	if (!isValidLearningGoalRecord(goal as unknown as LearningGoalRecord)) {
		throw new ProgressValidationError("A learning goal record has invalid field values.");
	}
}

function validateLegacyStudyProgressShape(
	value: unknown,
): asserts value is Record<string, unknown> {
	const progress = asRecord(value, "A legacy study progress record is invalid.");
	assertExactKeys(
		progress,
		["certificationId", "noteId", "completed", "bookmarked", "updatedAt"],
		["completedAt"],
	);
	if (
		typeof progress.certificationId !== "string" ||
		progress.certificationId.length === 0 ||
		typeof progress.noteId !== "string" ||
		progress.noteId.length === 0 ||
		typeof progress.completed !== "boolean" ||
		typeof progress.bookmarked !== "boolean" ||
		!isTimestamp(progress.updatedAt) ||
		(progress.completedAt !== undefined && !isTimestamp(progress.completedAt))
	) {
		throw new ProgressValidationError("A legacy study progress record has invalid field values.");
	}
}

function validateLegacyLearningGoalShape(value: unknown): asserts value is Record<string, unknown> {
	const goal = asRecord(value, "A legacy learning goal record is invalid.");
	assertExactKeys(goal, ["certificationId", "dailyQuestionTarget", "targetDate", "updatedAt"]);
	if (
		typeof goal.certificationId !== "string" ||
		goal.certificationId.length === 0 ||
		!(goal.dailyQuestionTarget === null || isCounter(goal.dailyQuestionTarget)) ||
		!(goal.targetDate === null || isTimestamp(goal.targetDate)) ||
		!isTimestamp(goal.updatedAt)
	) {
		throw new ProgressValidationError("A legacy learning goal record has invalid field values.");
	}
}

function normalizeLegacyStudyProgress(record: Record<string, unknown>): StudyProgressRecord {
	return {
		certificationId: record.certificationId as string,
		noteId: record.noteId as string,
		status: record.completed ? "completed" : "not_started",
		...(record.completedAt === undefined ? {} : { completedAt: record.completedAt as number }),
		bookmarked: record.bookmarked as boolean,
		updatedAt: record.updatedAt as number,
	};
}

function normalizeLegacyLearningGoal(record: Record<string, unknown>): LearningGoalRecord {
	return {
		certificationId: record.certificationId as string,
		dailyQuestionTarget: record.dailyQuestionTarget as number | null,
		targetQuestionCount: null,
		targetNoteCount: null,
		targetDate: null,
		targetDateTimezone: "floating-local",
		...(record.targetDate === null ? {} : { legacyTargetDate: record.targetDate as number }),
		updatedAt: record.updatedAt as number,
	};
}

function validateLegacyProvenance(value: unknown): { key: string; value: unknown } {
	const provenance = asRecord(value, "A legacy provenance record is invalid.");
	assertExactKeys(provenance, ["key", "value"]);
	if (
		typeof provenance.key !== "string" ||
		!(
			provenance.key.startsWith("legacy-backup:") ||
			provenance.key.startsWith("migration:legacy-v2:")
		)
	) {
		throw new ProgressValidationError("The backup contains unsupported legacy provenance.");
	}
	assertJsonValue(provenance.value);
	return provenance as { key: string; value: unknown };
}

function validateLegacyStorageRecord(value: unknown): LegacyStorageRecord {
	const record = asRecord(value, "A legacy storage record is invalid.");
	assertExactKeys(record, ["certificationId", "storageKey", "rawValue"], ["snapshot", "readError"]);
	if (
		typeof record.certificationId !== "string" ||
		record.storageKey !== `${record.certificationId}-practice-lab-v2` ||
		!(record.rawValue === null || typeof record.rawValue === "string") ||
		(record.snapshot !== undefined && record.snapshot !== "pre-migration-observed") ||
		(record.readError !== undefined &&
			(typeof record.readError !== "string" || record.readError.length > 4_096))
	) {
		throw new ProgressValidationError("A legacy storage record has invalid field values.");
	}
	return record as unknown as LegacyStorageRecord;
}

function validateArray<T>(
	value: unknown,
	label: string,
	validate: (item: unknown) => asserts item is T,
): T[] {
	if (!Array.isArray(value))
		throw new ProgressValidationError(`The backup ${label} list is invalid.`);
	for (const item of value) validate(item);
	return value;
}

function asRecord(value: unknown, message: string): Record<string, unknown> {
	if (value === null || typeof value !== "object" || Array.isArray(value)) {
		throw new ProgressValidationError(message);
	}
	return value as Record<string, unknown>;
}

function assertExactKeys(
	value: Record<string, unknown>,
	required: readonly string[],
	optional: readonly string[] = [],
): void {
	const allowed = new Set([...required, ...optional]);
	if (
		required.some((key) => !Object.hasOwn(value, key)) ||
		Object.keys(value).some((key) => !allowed.has(key))
	) {
		throw new ProgressValidationError("The backup contains missing or unsupported record fields.");
	}
}

function hasExactKeys(value: Record<string, unknown>, expected: readonly string[]): boolean {
	return (
		Object.keys(value).length === expected.length &&
		expected.every((key) => Object.hasOwn(value, key))
	);
}

function assertJsonValue(value: unknown, depth = 0): void {
	if (depth > 50) throw new ProgressValidationError("Legacy provenance is nested too deeply.");
	if (
		value === null ||
		typeof value === "string" ||
		typeof value === "boolean" ||
		(typeof value === "number" && Number.isFinite(value))
	) {
		return;
	}
	if (Array.isArray(value)) {
		for (const item of value) assertJsonValue(item, depth + 1);
		return;
	}
	if (value !== null && typeof value === "object") {
		for (const item of Object.values(value)) assertJsonValue(item, depth + 1);
		return;
	}
	throw new ProgressValidationError("Legacy provenance contains an unsupported value.");
}

async function digest(value: unknown): Promise<string> {
	if (!globalThis.crypto?.subtle) {
		throw new ProgressValidationError(
			"This browser cannot verify backup integrity; no data was changed.",
		);
	}
	const bytes = new TextEncoder().encode(stableStringify(value));
	const hash = await globalThis.crypto.subtle.digest("SHA-256", bytes);
	return [...new Uint8Array(hash)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

function stableStringify(value: unknown): string {
	if (Array.isArray(value)) return `[${value.map(stableStringify).join(",")}]`;
	if (value !== null && typeof value === "object") {
		return `{${Object.entries(value)
			.toSorted(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))
			.map(([key, item]) => `${JSON.stringify(key)}:${stableStringify(item)}`)
			.join(",")}}`;
	}
	return JSON.stringify(value);
}

function isCounter(value: unknown): value is number {
	return Number.isSafeInteger(value) && (value as number) >= 0;
}

function isTimestamp(value: unknown): value is number {
	return isCounter(value);
}
