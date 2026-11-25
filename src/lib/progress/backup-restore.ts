import { ProgressValidationError } from "./errors";
import {
	type CertificationProgressRestoreSnapshot,
	createQuestionAttempt,
	type EvaluationOutcome,
	type ProgressSession,
	projectQuestionAttempts,
	type QuestionAttempt,
	type QuestionProgress,
	type SessionHistoryEntry,
	UUID_PATTERN,
	validateLegacyBaseline,
	validateSession,
} from "./model";

const MAX_BACKUP_SIZE = 50 * 1024 * 1024;
const EXPORT_FORMATS = new Set(["practice-lab-progress-export", "practice-lab-progress-recovery"]);
const OUTCOMES = new Set<EvaluationOutcome>(["correct", "incorrect", "partial"]);

type UnknownRecord = Record<string, unknown>;

export function parseProgressBackup(
	rawJson: string,
	knownCertificationIds: readonly string[],
): CertificationProgressRestoreSnapshot[] {
	if (rawJson.length > MAX_BACKUP_SIZE) {
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
	const backup = asRecord(parsed, "The selected file must contain a progress backup object.");
	if (!EXPORT_FORMATS.has(String(backup.format))) {
		throw new ProgressValidationError(
			"This JSON file is not a supported Practice Lab progress export.",
		);
	}
	if (backup.version !== 1) {
		throw new ProgressValidationError("This progress backup version is not supported.");
	}
	if (!isTimestamp(backup.exportedAt)) {
		throw new ProgressValidationError("The progress backup has an invalid export timestamp.");
	}
	if (backup.databaseReadError !== undefined) {
		throw new ProgressValidationError(
			"This recovery file reports an incomplete database export and cannot be restored.",
		);
	}
	if (!Array.isArray(backup.certifications) || backup.certifications.length === 0) {
		throw new ProgressValidationError("The progress backup contains no certification snapshots.");
	}

	const knownIds = new Set(knownCertificationIds);
	const seenCertifications = new Set<string>();
	const seenSessionIds = new Set<string>();
	return backup.certifications.map((rawSnapshot, index) => {
		const snapshot = asRecord(rawSnapshot, `Certification snapshot ${index + 1} is invalid.`);
		if (typeof snapshot.certificationId !== "string" || !knownIds.has(snapshot.certificationId)) {
			throw new ProgressValidationError(
				`Certification snapshot ${index + 1} is not part of this Practice Lab installation.`,
			);
		}
		if (seenCertifications.has(snapshot.certificationId)) {
			throw new ProgressValidationError(
				`The backup contains duplicate snapshots for ${snapshot.certificationId}.`,
			);
		}
		seenCertifications.add(snapshot.certificationId);
		return validateCertificationSnapshot(snapshot, snapshot.certificationId, seenSessionIds);
	});
}

function validateCertificationSnapshot(
	value: UnknownRecord,
	certificationId: string,
	seenSessionIds: Set<string>,
): CertificationProgressRestoreSnapshot {
	if (!Array.isArray(value.sessionHistory) || !Array.isArray(value.questionProgress)) {
		throw new ProgressValidationError(
			`The ${certificationId} snapshot is missing session history or question progress.`,
		);
	}

	const sessions: SessionHistoryEntry[] = [];
	const attempts: QuestionAttempt[] = [];
	let activeSessionCount = 0;
	for (const rawEntry of value.sessionHistory) {
		const entry = asRecord(rawEntry, `A session entry in ${certificationId} is invalid.`);
		const session = entry.session as ProgressSession;
		try {
			validateSession(session);
		} catch (error) {
			throw validationError(`A saved session in ${certificationId} is invalid`, error);
		}
		if (session.certificationId !== certificationId) {
			throw new ProgressValidationError(
				`Session ${session.id} belongs to a different certification than its backup snapshot.`,
			);
		}
		if (seenSessionIds.has(session.id)) {
			throw new ProgressValidationError(
				`The backup contains a duplicate session ID: ${session.id}.`,
			);
		}
		seenSessionIds.add(session.id);
		if (session.status === "in_progress") activeSessionCount += 1;
		if (!Array.isArray(entry.attempts)) {
			throw new ProgressValidationError(`Session ${session.id} has an invalid attempt list.`);
		}

		const sessionAttempts: QuestionAttempt[] = [];
		const seenQuestionIds = new Set<string>();
		for (const rawAttempt of entry.attempts) {
			const attempt = normalizeAttempt(rawAttempt, session);
			if (seenQuestionIds.has(attempt.questionId)) {
				throw new ProgressValidationError(
					`Session ${session.id} contains duplicate attempts for ${attempt.questionId}.`,
				);
			}
			seenQuestionIds.add(attempt.questionId);
			if (!session.checkpoint.checkedQuestionIds.includes(attempt.questionId)) {
				throw new ProgressValidationError(
					`Attempt ${attempt.questionId} is not marked as checked in session ${session.id}.`,
				);
			}
			const savedSelection =
				session.checkpoint.selectedOptionIdsByQuestion[attempt.questionId] ?? [];
			if (!sameStringSet(savedSelection, attempt.selectedOptionIds)) {
				throw new ProgressValidationError(
					`Attempt ${attempt.questionId} does not match the saved answer in session ${session.id}.`,
				);
			}
			sessionAttempts.push(attempt);
			attempts.push(attempt);
		}
		sessions.push({ session, attempts: sessionAttempts });
	}
	if (activeSessionCount > 1) {
		throw new ProgressValidationError(
			`The ${certificationId} snapshot contains multiple active sessions.`,
		);
	}

	const questionProgress = value.questionProgress.map((rawProgress) =>
		normalizeQuestionProgress(rawProgress, certificationId),
	);
	const seenQuestionIds = new Set<string>();
	for (const progress of questionProgress) {
		if (seenQuestionIds.has(progress.questionId)) {
			throw new ProgressValidationError(
				`The ${certificationId} snapshot contains duplicate progress for ${progress.questionId}.`,
			);
		}
		seenQuestionIds.add(progress.questionId);
	}

	const projected = projectQuestionAttempts(attempts, questionProgress);
	if (projected.length !== questionProgress.length) {
		throw new ProgressValidationError(
			`The ${certificationId} question progress projection is inconsistent.`,
		);
	}
	const progressById = new Map(questionProgress.map((progress) => [progress.questionId, progress]));
	for (const expected of projected) {
		const supplied = progressById.get(expected.questionId);
		if (!supplied || !sameQuestionProgress(supplied, expected)) {
			throw new ProgressValidationError(
				`The ${certificationId} progress aggregate for ${expected.questionId} does not match its saved attempts.`,
			);
		}
	}

	return { certificationId, sessionHistory: sessions, questionProgress: projected };
}

function normalizeAttempt(value: unknown, session: ProgressSession): QuestionAttempt {
	const attempt = asRecord(value, `Session ${session.id} contains an invalid attempt.`);
	if (
		attempt.sessionId !== session.id ||
		attempt.certificationId !== session.certificationId ||
		typeof attempt.questionId !== "string" ||
		typeof attempt.domainId !== "string" ||
		typeof attempt.questionRevision !== "string" ||
		!Array.isArray(attempt.selectedOptionIds) ||
		!attempt.selectedOptionIds.every((id) => typeof id === "string") ||
		!isOutcome(attempt.outcome) ||
		!isNonNegativeNumber(attempt.scoreEarned) ||
		!isNonNegativeNumber(attempt.scorePossible) ||
		!isTimestamp(attempt.evaluatedAt)
	) {
		throw new ProgressValidationError(`Session ${session.id} contains an invalid attempt record.`);
	}
	try {
		const normalized = createQuestionAttempt(session, {
			sessionId: session.id,
			questionId: attempt.questionId,
			selectedOptionIds: attempt.selectedOptionIds as string[],
			outcome: attempt.outcome,
			scoreEarned: attempt.scoreEarned,
			scorePossible: attempt.scorePossible,
			evaluatedAt: attempt.evaluatedAt,
		});
		if (
			normalized.domainId !== attempt.domainId ||
			normalized.questionRevision !== attempt.questionRevision
		) {
			throw new ProgressValidationError(
				`Attempt ${attempt.questionId} does not match the frozen content of session ${session.id}.`,
			);
		}
		return normalized;
	} catch (error) {
		throw validationError(`An attempt in session ${session.id} is invalid`, error);
	}
}

function normalizeQuestionProgress(value: unknown, certificationId: string): QuestionProgress {
	const progress = asRecord(value, `The ${certificationId} question progress record is invalid.`);
	if (
		progress.certificationId !== certificationId ||
		typeof progress.questionId !== "string" ||
		progress.questionId.length === 0 ||
		!isCounter(progress.attemptCount) ||
		!isCounter(progress.correctCount) ||
		progress.correctCount > progress.attemptCount ||
		!(progress.legacyBaseline === null || isRecord(progress.legacyBaseline))
	) {
		throw new ProgressValidationError(
			`The ${certificationId} question progress record has invalid fields.`,
		);
	}
	if (progress.lastOutcome !== undefined && !isOutcome(progress.lastOutcome)) {
		throw new ProgressValidationError(
			`The ${certificationId} question progress outcome is invalid.`,
		);
	}
	if (progress.lastEvaluatedAt !== undefined && !isTimestamp(progress.lastEvaluatedAt)) {
		throw new ProgressValidationError(
			`The ${certificationId} question progress timestamp is invalid.`,
		);
	}
	if (progress.lastAttemptSessionId !== undefined && !isUuid(progress.lastAttemptSessionId)) {
		throw new ProgressValidationError(
			`The ${certificationId} question progress session ID is invalid.`,
		);
	}
	if (progress.legacyBaseline !== null) {
		try {
			validateLegacyBaseline(
				certificationId,
				progress.questionId,
				progress.legacyBaseline as QuestionProgress["legacyBaseline"] & object,
			);
		} catch (error) {
			throw validationError(`A legacy baseline in ${certificationId} is invalid`, error);
		}
	}
	return progress as unknown as QuestionProgress;
}

function sameQuestionProgress(a: QuestionProgress, b: QuestionProgress): boolean {
	return (
		a.certificationId === b.certificationId &&
		a.questionId === b.questionId &&
		a.attemptCount === b.attemptCount &&
		a.correctCount === b.correctCount &&
		a.lastOutcome === b.lastOutcome &&
		a.lastEvaluatedAt === b.lastEvaluatedAt &&
		a.lastAttemptSessionId === b.lastAttemptSessionId &&
		(a.legacyBaseline === null
			? b.legacyBaseline === null
			: b.legacyBaseline !== null &&
				a.legacyBaseline.attempts === b.legacyBaseline.attempts &&
				a.legacyBaseline.correct === b.legacyBaseline.correct &&
				a.legacyBaseline.lastWrong === b.legacyBaseline.lastWrong)
	);
}

function sameStringSet(a: readonly string[], b: readonly string[]): boolean {
	if (a.length !== b.length) return false;
	const sortedA = [...a].sort();
	const sortedB = [...b].sort();
	return sortedA.every((value, index) => value === sortedB[index]);
}

function asRecord(value: unknown, message: string): UnknownRecord {
	if (!isRecord(value)) {
		throw new ProgressValidationError(message);
	}
	return value;
}

function isRecord(value: unknown): value is UnknownRecord {
	return value !== null && typeof value === "object" && !Array.isArray(value);
}

function validationError(prefix: string, error: unknown): ProgressValidationError {
	return new ProgressValidationError(
		`${prefix}: ${error instanceof Error ? error.message : String(error)}`,
	);
}

function isCounter(value: unknown): value is number {
	return Number.isSafeInteger(value) && (value as number) >= 0;
}

function isNonNegativeNumber(value: unknown): value is number {
	return typeof value === "number" && Number.isFinite(value) && value >= 0;
}

function isTimestamp(value: unknown): value is number {
	return isCounter(value);
}

function isOutcome(value: unknown): value is EvaluationOutcome {
	return typeof value === "string" && OUTCOMES.has(value as EvaluationOutcome);
}

function isUuid(value: unknown): value is string {
	return typeof value === "string" && UUID_PATTERN.test(value);
}
