import { ProgressConflictError, ProgressValidationError } from "./errors";

export type SessionMode = "practice" | "exam" | "weak";
export type SessionStatus = "in_progress" | "completed" | "expired" | "abandoned";
export type FinalSessionStatus = Exclude<SessionStatus, "in_progress">;
export type EvaluationOutcome = "correct" | "incorrect" | "partial";

export interface ScoringProvenance {
	revision: string;
	passingScore: number | null;
	totalQuestions: number;
	domainWeights: Readonly<Record<string, number>>;
}

export interface QuestionProvenance {
	questionId: string;
	revision: string;
	contentHash: string;
	domainId: string;
	optionIds: readonly string[];
	optionTexts: readonly string[];
	displayOptionIds: readonly string[];
	correctOptionIds: readonly string[];
	questionText: string;
	domainName: string;
	topic?: string;
	explanation: string;
	whyNot?: string;
	sourceLabel: string;
	sourceUrl: string;
	selectCount: number;
	snapshot?: FrozenQuestionSnapshot;
}

export interface FrozenQuestionSnapshot {
	question: string;
	topic?: string;
	domainName: string;
	options: readonly { id: string; text: string }[];
	correctOptionIds: readonly string[];
	explanation: string;
	whyNot?: string;
	source: { label: string; url: string };
}

export interface ContentProvenance {
	bankRevision: string;
	questions: readonly QuestionProvenance[];
}

export interface SessionCheckpoint {
	currentQuestionId: string | null;
	deadlineAt: number | null;
	selectedOptionIdsByQuestion: Readonly<Record<string, readonly string[]>>;
	checkedQuestionIds: readonly string[];
	flaggedQuestionIds: readonly string[];
}

export interface LegacySessionProvenance {
	sourceStorageKey: string;
	version: 2;
	limitations: readonly string[];
	evaluatedQuestionIds: readonly string[];
}

export interface ProgressSession {
	id: string;
	certificationId: string;
	mode: SessionMode;
	status: SessionStatus;
	revision: number;
	startedAt: number;
	updatedAt: number;
	finishedAt?: number;
	scoring: ScoringProvenance;
	content: ContentProvenance;
	checkpoint: SessionCheckpoint;
	legacy?: LegacySessionProvenance;
}

export interface CreateSessionInput {
	id: string;
	certificationId: string;
	mode: SessionMode;
	startedAt: number;
	scoring: ScoringProvenance;
	content: ContentProvenance;
	checkpoint?: SessionCheckpoint;
	legacy?: LegacySessionProvenance;
	expectedGenerationToken?: string;
}

export interface CheckpointSessionInput {
	sessionId: string;
	expectedRevision: number;
	checkpoint: SessionCheckpoint;
	updatedAt: number;
	expectedGenerationToken?: string;
}

export interface RecordEvaluationInput {
	sessionId: string;
	questionId: string;
	selectedOptionIds: readonly string[];
	outcome: EvaluationOutcome;
	scoreEarned: number;
	scorePossible: number;
	evaluatedAt: number;
	expectedRevision?: number;
	expectedGenerationToken?: string;
}

export interface LegacyProgressBaselineInput {
	questionId: string;
	baseline: QuestionProgressBaseline;
}

export interface LegacySessionImport {
	input: CreateSessionInput;
	status?: FinalSessionStatus;
	finishedAt?: number;
	evaluations?: readonly RecordEvaluationInput[];
}

export interface LegacyProgressMigrationInput {
	certificationId: string;
	legacyStorageKey: string;
	rawValue: string | null;
	migratedAt: number;
	baselines: readonly LegacyProgressBaselineInput[];
	session?: LegacySessionImport;
	warnings: readonly string[];
}

export interface LegacyProgressMigrationResult {
	certificationId: string;
	legacyStorageKey: string;
	importedAt: number;
	importedQuestionCount: number;
	importedSessionId: string | null;
	warnings: readonly string[];
	generationToken: string;
}

export interface LegacyProgressBackup {
	format: "practice-lab-progress-backup";
	version: 1;
	certificationId: string;
	legacyStorageKey: string;
	capturedAt: number;
	rawValue: string | null;
	warnings: readonly string[];
}

export interface LegacyStorageRecord {
	certificationId: string;
	storageKey: string;
	rawValue: string | null;
	snapshot?: "pre-migration-observed";
	readError?: string;
}

export interface LegacyRecordsBackup {
	format: "practice-lab-legacy-export";
	version: 1;
	exportedAt: number;
	records: readonly LegacyStorageRecord[];
}

export interface QuestionAttempt {
	sessionId: string;
	questionId: string;
	certificationId: string;
	domainId: string;
	questionRevision: string;
	selectedOptionIds: readonly string[];
	outcome: EvaluationOutcome;
	scoreEarned: number;
	scorePossible: number;
	evaluatedAt: number;
}

export interface QuestionProgressBaseline {
	attempts: number;
	correct: number;
	lastWrong: boolean;
}

export interface QuestionProgress {
	certificationId: string;
	questionId: string;
	attemptCount: number;
	correctCount: number;
	lastOutcome?: EvaluationOutcome;
	lastEvaluatedAt?: number;
	lastAttemptSessionId?: string;
	legacyBaseline: QuestionProgressBaseline | null;
}

export interface StudyProgressRecord {
	certificationId: string;
	noteId: string;
	status: StudyProgressStatus;
	completedAt?: number;
	completedRevision?: string;
	bookmarked: boolean;
	lastOpenedAt?: number;
	readingPositionAnchor?: string;
	contentRevision?: string;
	updatedAt: number;
}

export type StudyProgressStatus = "not_started" | "in_progress" | "completed";

export interface LearningGoalRecord {
	certificationId: string;
	dailyQuestionTarget: number | null;
	targetQuestionCount: number | null;
	targetNoteCount: number | null;
	/** A floating local calendar date, not a UTC timestamp or an instant. */
	targetDate: string | null;
	targetDateTimezone: "floating-local";
	/** Preserves a timestamp from pre-calendar-date records without guessing its timezone. */
	legacyTargetDate?: number;
	updatedAt: number;
}

export interface SessionHistoryEntry {
	session: ProgressSession;
	attempts: QuestionAttempt[];
}

export interface ProgressSummaryData {
	history: SessionHistoryEntry[];
	questionProgress: QuestionProgress[];
	recentAttempts: QuestionAttempt[];
	completedMockExams: number;
	hasSessions: boolean;
}

export interface CertificationProgressSnapshot {
	sessionHistory: SessionHistoryEntry[];
	questionProgress: QuestionProgress[];
}

export interface CertificationProgressRestoreSnapshot extends CertificationProgressSnapshot {
	certificationId: string;
}

export interface LearningDataSnapshot {
	sessions: ProgressSession[];
	questionAttempts: QuestionAttempt[];
	questionProgress: QuestionProgress[];
	studyProgress: StudyProgressRecord[];
	learningGoals: LearningGoalRecord[];
	legacyProvenance: { key: string; value: unknown }[];
	lastBackupAt?: number;
	fingerprint: string;
}

export interface LearningDataRestoreData {
	sessions: ProgressSession[];
	questionAttempts: QuestionAttempt[];
	questionProgress: QuestionProgress[];
	studyProgress: StudyProgressRecord[];
	learningGoals: LearningGoalRecord[];
	legacyProvenance: { key: string; value: unknown }[];
	legacyRecords: LegacyStorageRecord[];
}

export const UUID_PATTERN =
	/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function createInitialSession(input: CreateSessionInput): ProgressSession {
	const session: ProgressSession = {
		id: input.id,
		certificationId: input.certificationId,
		mode: input.mode,
		status: "in_progress",
		revision: 1,
		startedAt: input.startedAt,
		updatedAt: input.startedAt,
		scoring: cloneScoring(input.scoring),
		content: cloneContent(input.content),
		checkpoint: cloneCheckpoint(
			input.checkpoint ?? {
				currentQuestionId: null,
				deadlineAt: null,
				selectedOptionIdsByQuestion: {},
				checkedQuestionIds: [],
				flaggedQuestionIds: [],
			},
		),
		...(input.legacy ? { legacy: cloneLegacyProvenance(input.legacy) } : {}),
	};

	validateSession(session);
	return session;
}

export function checkpointSession(
	session: ProgressSession,
	expectedRevision: number,
	checkpoint: SessionCheckpoint,
	updatedAt: number,
): ProgressSession {
	validateCheckpoint(session.content, checkpoint);
	assertTimestamp(updatedAt, "updatedAt");
	assertRevision(expectedRevision);

	if (session.revision !== expectedRevision) {
		if (
			session.revision === expectedRevision + 1 &&
			session.status === "in_progress" &&
			checkpointsEqual(session.checkpoint, checkpoint)
		) {
			return session;
		}
		throw new ProgressConflictError("The session changed since this checkpoint was read.");
	}
	if (session.status !== "in_progress") {
		throw new ProgressConflictError("A finalized session cannot be checkpointed.");
	}

	return {
		...session,
		revision: session.revision + 1,
		updatedAt,
		checkpoint: cloneCheckpoint(checkpoint),
	};
}

export function finalizeSession(
	session: ProgressSession,
	expectedRevision: number,
	status: FinalSessionStatus,
	finishedAt: number,
): ProgressSession {
	assertTimestamp(finishedAt, "finishedAt");
	assertRevision(expectedRevision);

	if (session.revision !== expectedRevision) {
		if (session.revision === expectedRevision + 1 && session.status === status) {
			return session;
		}
		throw new ProgressConflictError("The session changed before it could be finalized.");
	}
	if (session.status !== "in_progress") {
		throw new ProgressConflictError("A session can only be finalized once.");
	}

	return {
		...session,
		status,
		revision: session.revision + 1,
		updatedAt: finishedAt,
		finishedAt,
	};
}

export function createQuestionAttempt(
	session: ProgressSession,
	input: RecordEvaluationInput,
): QuestionAttempt {
	const question = session.content.questions.find(
		({ questionId }) => questionId === input.questionId,
	);
	if (!question) {
		throw new ProgressValidationError("The question is not part of this session's frozen content.");
	}
	assertUniqueIds(input.selectedOptionIds, "selectedOptionIds");
	if (input.selectedOptionIds.some((id) => !question.optionIds.includes(id))) {
		throw new ProgressValidationError("An evaluated option is not part of the frozen question.");
	}
	assertTimestamp(input.evaluatedAt, "evaluatedAt");
	assertFiniteNonNegative(input.scoreEarned, "scoreEarned");
	assertFiniteNonNegative(input.scorePossible, "scorePossible");
	if (input.scoreEarned > input.scorePossible) {
		throw new ProgressValidationError("scoreEarned cannot exceed scorePossible.");
	}

	return {
		sessionId: session.id,
		questionId: question.questionId,
		certificationId: session.certificationId,
		domainId: question.domainId,
		questionRevision: question.revision,
		selectedOptionIds: [...input.selectedOptionIds].sort(),
		outcome: input.outcome,
		scoreEarned: input.scoreEarned,
		scorePossible: input.scorePossible,
		evaluatedAt: input.evaluatedAt,
	};
}

export function evaluationMatches(a: QuestionAttempt, b: QuestionAttempt): boolean {
	return (
		a.sessionId === b.sessionId &&
		a.questionId === b.questionId &&
		a.certificationId === b.certificationId &&
		a.domainId === b.domainId &&
		a.questionRevision === b.questionRevision &&
		a.outcome === b.outcome &&
		a.scoreEarned === b.scoreEarned &&
		a.scorePossible === b.scorePossible &&
		stringArraysEqual(a.selectedOptionIds, b.selectedOptionIds)
	);
}

export function applyAttemptToProgress(
	current: QuestionProgress | undefined,
	attempt: QuestionAttempt,
): QuestionProgress {
	const isLatest =
		current?.lastEvaluatedAt === undefined ||
		attempt.evaluatedAt > current.lastEvaluatedAt ||
		(attempt.evaluatedAt === current.lastEvaluatedAt &&
			attempt.sessionId.localeCompare(current.lastAttemptSessionId ?? "") >= 0);

	return {
		certificationId: attempt.certificationId,
		questionId: attempt.questionId,
		attemptCount: (current?.attemptCount ?? 0) + 1,
		correctCount: (current?.correctCount ?? 0) + (attempt.outcome === "correct" ? 1 : 0),
		...(isLatest
			? {
					lastOutcome: attempt.outcome,
					lastEvaluatedAt: attempt.evaluatedAt,
					lastAttemptSessionId: attempt.sessionId,
				}
			: {
					lastOutcome: current?.lastOutcome,
					lastEvaluatedAt: current?.lastEvaluatedAt,
					lastAttemptSessionId: current?.lastAttemptSessionId,
				}),
		legacyBaseline: current?.legacyBaseline ?? null,
	};
}

export function projectQuestionAttempts(
	attempts: readonly QuestionAttempt[],
	existing: readonly QuestionProgress[],
): QuestionProgress[] {
	const existingById = new Map(
		existing.map((progress) => [
			progressKey(progress.certificationId, progress.questionId),
			progress,
		]),
	);
	const projected = new Map<string, QuestionProgress>();

	for (const progress of existing) {
		projected.set(progressKey(progress.certificationId, progress.questionId), {
			certificationId: progress.certificationId,
			questionId: progress.questionId,
			attemptCount: 0,
			correctCount: 0,
			legacyBaseline: progress.legacyBaseline,
		});
	}

	const sortedAttempts = [...attempts].sort(
		(a, b) => a.evaluatedAt - b.evaluatedAt || a.sessionId.localeCompare(b.sessionId),
	);
	for (const attempt of sortedAttempts) {
		const key = progressKey(attempt.certificationId, attempt.questionId);
		projected.set(
			key,
			applyAttemptToProgress(projected.get(key) ?? existingById.get(key), attempt),
		);
	}

	return [...projected.values()].sort(
		(a, b) =>
			a.certificationId.localeCompare(b.certificationId) ||
			a.questionId.localeCompare(b.questionId),
	);
}

export function baselinesEqual(
	a: QuestionProgressBaseline | null,
	b: QuestionProgressBaseline | null,
): boolean {
	return (
		a === b ||
		(a !== null &&
			b !== null &&
			a.attempts === b.attempts &&
			a.correct === b.correct &&
			a.lastWrong === b.lastWrong)
	);
}

export function validateLegacyBaseline(
	certificationId: string,
	questionId: string,
	baseline: QuestionProgressBaseline,
): void {
	assertId(certificationId, "certificationId");
	assertId(questionId, "questionId");
	if (
		!Number.isSafeInteger(baseline.attempts) ||
		baseline.attempts < 0 ||
		!Number.isSafeInteger(baseline.correct) ||
		baseline.correct < 0 ||
		baseline.correct > baseline.attempts ||
		typeof baseline.lastWrong !== "boolean"
	) {
		throw new ProgressValidationError("The legacy progress baseline is invalid.");
	}
}

export function validateSession(session: ProgressSession): void {
	if (!UUID_PATTERN.test(session.id)) {
		throw new ProgressValidationError("Session IDs must be UUIDs.");
	}
	assertId(session.certificationId, "certificationId");
	assertTimestamp(session.startedAt, "startedAt");
	assertTimestamp(session.updatedAt, "updatedAt");
	assertRevision(session.revision);
	if (!["practice", "exam", "weak"].includes(session.mode)) {
		throw new ProgressValidationError("The session mode is invalid.");
	}
	if (!["in_progress", "completed", "expired", "abandoned"].includes(session.status)) {
		throw new ProgressValidationError("The session status is invalid.");
	}
	validateScoring(session.scoring);
	validateContent(session.content);
	validateCheckpoint(session.content, session.checkpoint);
	if (session.legacy) {
		assertId(session.legacy.sourceStorageKey, "legacy.sourceStorageKey");
		assertUniqueIds(session.legacy.evaluatedQuestionIds, "legacy.evaluatedQuestionIds");
		for (const limitation of session.legacy.limitations)
			assertId(limitation, "legacy.limitations item");
	}
	if (session.status === "in_progress" && session.finishedAt !== undefined) {
		throw new ProgressValidationError("An in-progress session cannot have finishedAt.");
	}
	if (session.status !== "in_progress") {
		if (session.finishedAt === undefined) {
			throw new ProgressValidationError("A finalized session must have finishedAt.");
		}
		assertTimestamp(session.finishedAt, "finishedAt");
	}
}

function validateScoring(scoring: ScoringProvenance): void {
	assertId(scoring.revision, "scoring.revision");
	if (
		scoring.passingScore !== null &&
		(!Number.isFinite(scoring.passingScore) ||
			scoring.passingScore < 0 ||
			scoring.passingScore > 1_000)
	) {
		throw new ProgressValidationError("scoring.passingScore must be between 0 and 1,000.");
	}
	if (!Number.isInteger(scoring.totalQuestions) || scoring.totalQuestions < 1) {
		throw new ProgressValidationError("scoring.totalQuestions must be a positive integer.");
	}
	for (const [domainId, weight] of Object.entries(scoring.domainWeights)) {
		assertId(domainId, "scoring.domainWeights key");
		if (!Number.isFinite(weight) || weight < 0 || weight > 100) {
			throw new ProgressValidationError("Domain weights must be between 0 and 100.");
		}
	}
}

function validateContent(content: ContentProvenance): void {
	assertId(content.bankRevision, "content.bankRevision");
	if (content.questions.length === 0) {
		throw new ProgressValidationError("A session must freeze at least one question.");
	}
	assertUniqueIds(
		content.questions.map(({ questionId }) => questionId),
		"content.questions questionId",
	);
	for (const question of content.questions) {
		assertId(question.questionId, "question.questionId");
		assertId(question.revision, "question.revision");
		assertId(question.contentHash, "question.contentHash");
		assertId(question.domainId, "question.domainId");
		assertUniqueIds(question.optionIds, `options for ${question.questionId}`);
		if (
			question.optionIds.length === 0 ||
			question.optionTexts.length !== question.optionIds.length
		) {
			throw new ProgressValidationError(
				"A frozen question must include stable IDs and labels for every option.",
			);
		}
		if (!question.optionTexts.every((text) => typeof text === "string")) {
			throw new ProgressValidationError("Frozen option labels must be strings.");
		}
		assertUniqueIds(question.displayOptionIds, `displayed options for ${question.questionId}`);
		assertUniqueIds(question.correctOptionIds, `correct options for ${question.questionId}`);
		if (
			question.displayOptionIds.length !== question.optionIds.length ||
			question.displayOptionIds.some((id) => !question.optionIds.includes(id)) ||
			question.correctOptionIds.some((id) => !question.optionIds.includes(id)) ||
			question.correctOptionIds.length === 0
		) {
			throw new ProgressValidationError("Frozen option permutations or answers are invalid.");
		}
		assertId(question.questionText, "question.questionText");
		assertId(question.domainName, "question.domainName");
		assertId(question.explanation, "question.explanation");
		assertId(question.sourceLabel, "question.sourceLabel");
		if (typeof question.sourceUrl !== "string") {
			throw new ProgressValidationError("question.sourceUrl must be a string.");
		}
		if (!Number.isSafeInteger(question.selectCount) || question.selectCount < 1) {
			throw new ProgressValidationError("question.selectCount must be a positive integer.");
		}
		if (
			question.selectCount > question.optionIds.length ||
			question.correctOptionIds.length !== question.selectCount
		) {
			throw new ProgressValidationError("Frozen answer counts do not match the question.");
		}
		if (question.snapshot) {
			assertUniqueIds(
				question.snapshot.options.map(({ id }) => id),
				`snapshot options for ${question.questionId}`,
			);
			if (
				question.snapshot.options.length !== question.optionIds.length ||
				question.snapshot.options.some(({ id }) => !question.optionIds.includes(id))
			) {
				throw new ProgressValidationError("A frozen question snapshot must match its option IDs.");
			}
			assertUniqueIds(
				question.snapshot.correctOptionIds,
				`correct options for ${question.questionId}`,
			);
			if (
				question.snapshot.correctOptionIds.some((id) => !question.optionIds.includes(id)) ||
				!stringArraysEqual(
					[...question.snapshot.correctOptionIds].sort(),
					[...question.correctOptionIds].sort(),
				)
			) {
				throw new ProgressValidationError(
					"Frozen snapshot answers must match the question's correct option IDs.",
				);
			}
		}
	}
}

function validateCheckpoint(content: ContentProvenance, checkpoint: SessionCheckpoint): void {
	if (
		checkpoint.currentQuestionId !== null &&
		!hasQuestion(content, checkpoint.currentQuestionId)
	) {
		throw new ProgressValidationError(
			"The current question must belong to the frozen session content.",
		);
	}
	assertUniqueIds(checkpoint.checkedQuestionIds, "checkedQuestionIds");
	assertUniqueIds(checkpoint.flaggedQuestionIds, "flaggedQuestionIds");
	if (
		checkpoint.checkedQuestionIds.some((id) => !hasQuestion(content, id)) ||
		checkpoint.flaggedQuestionIds.some((id) => !hasQuestion(content, id))
	) {
		throw new ProgressValidationError("Checked and flagged questions must belong to the session.");
	}
	if (checkpoint.deadlineAt !== null) assertTimestamp(checkpoint.deadlineAt, "deadlineAt");
	for (const [questionId, optionIds] of Object.entries(checkpoint.selectedOptionIdsByQuestion)) {
		const question = content.questions.find((item) => item.questionId === questionId);
		if (!question) {
			throw new ProgressValidationError(
				"A checkpoint question must belong to the frozen session content.",
			);
		}
		assertUniqueIds(optionIds, `selected options for ${questionId}`);
		if (optionIds.some((id) => !question.optionIds.includes(id))) {
			throw new ProgressValidationError("A checkpoint option must belong to its frozen question.");
		}
	}
	for (const questionId of checkpoint.flaggedQuestionIds ?? []) {
		if (!hasQuestion(content, questionId)) {
			throw new ProgressValidationError(
				"A flagged question must belong to the frozen session content.",
			);
		}
	}
}

function checkpointsEqual(a: SessionCheckpoint, b: SessionCheckpoint): boolean {
	if (
		a.currentQuestionId !== b.currentQuestionId ||
		a.deadlineAt !== b.deadlineAt ||
		!stringArraysEqual([...a.checkedQuestionIds].sort(), [...b.checkedQuestionIds].sort()) ||
		!stringArraysEqual(
			[...(a.flaggedQuestionIds ?? [])].sort(),
			[...(b.flaggedQuestionIds ?? [])].sort(),
		)
	) {
		return false;
	}
	const aQuestionIds = Object.keys(a.selectedOptionIdsByQuestion).sort();
	const bQuestionIds = Object.keys(b.selectedOptionIdsByQuestion).sort();
	return (
		stringArraysEqual(aQuestionIds, bQuestionIds) &&
		aQuestionIds.every((questionId) =>
			stringArraysEqual(
				[...a.selectedOptionIdsByQuestion[questionId]].sort(),
				[...b.selectedOptionIdsByQuestion[questionId]].sort(),
			),
		)
	);
}

function cloneScoring(scoring: ScoringProvenance): ScoringProvenance {
	return { ...scoring, domainWeights: { ...scoring.domainWeights } };
}

function cloneContent(content: ContentProvenance): ContentProvenance {
	return {
		bankRevision: content.bankRevision,
		questions: content.questions.map((question) => ({
			...question,
			optionIds: [...question.optionIds],
			optionTexts: [...question.optionTexts],
			displayOptionIds: [...question.displayOptionIds],
			correctOptionIds: [...question.correctOptionIds],
			...(question.snapshot
				? {
						snapshot: {
							...question.snapshot,
							options: question.snapshot.options.map((option) => ({ ...option })),
							correctOptionIds: [...question.snapshot.correctOptionIds],
							source: { ...question.snapshot.source },
						},
					}
				: {}),
		})),
	};
}

function cloneCheckpoint(checkpoint: SessionCheckpoint): SessionCheckpoint {
	return {
		...checkpoint,
		selectedOptionIdsByQuestion: Object.fromEntries(
			Object.entries(checkpoint.selectedOptionIdsByQuestion).map(([id, options]) => [
				id,
				[...options],
			]),
		),
		checkedQuestionIds: [...checkpoint.checkedQuestionIds],
		flaggedQuestionIds: [...checkpoint.flaggedQuestionIds],
	};
}

function cloneLegacyProvenance(legacy: LegacySessionProvenance): LegacySessionProvenance {
	return {
		...legacy,
		limitations: [...legacy.limitations],
		evaluatedQuestionIds: [...legacy.evaluatedQuestionIds],
	};
}

function hasQuestion(content: ContentProvenance, questionId: string): boolean {
	return content.questions.some((question) => question.questionId === questionId);
}

function progressKey(certificationId: string, questionId: string): string {
	return `${certificationId}\u0000${questionId}`;
}

function assertId(value: string, name: string): void {
	if (typeof value !== "string" || value.trim().length === 0) {
		throw new ProgressValidationError(`${name} must be a non-empty stable ID.`);
	}
}

function assertUniqueIds(values: readonly string[], name: string): void {
	for (const value of values) assertId(value, name);
	if (new Set(values).size !== values.length) {
		throw new ProgressValidationError(`${name} must not contain duplicate IDs.`);
	}
}

function assertTimestamp(value: number, name: string): void {
	if (!Number.isFinite(value) || value < 0) {
		throw new ProgressValidationError(`${name} must be a non-negative timestamp.`);
	}
}

function assertRevision(value: number): void {
	if (!Number.isSafeInteger(value) || value < 1) {
		throw new ProgressValidationError("Session revisions must be positive safe integers.");
	}
}

function assertFiniteNonNegative(value: number, name: string): void {
	if (!Number.isFinite(value) || value < 0) {
		throw new ProgressValidationError(`${name} must be a non-negative finite number.`);
	}
}

function stringArraysEqual(a: readonly string[], b: readonly string[]): boolean {
	return a.length === b.length && a.every((value, index) => value === b[index]);
}
