import type {
	CertificationConfig,
	Question,
	QuizSession,
	ShuffledQuestionOptions,
} from "../quiz-types";
import type {
	ContentProvenance,
	CreateSessionInput,
	LegacyProgressMigrationInput,
	LegacySessionImport,
	QuestionProvenance,
	RecordEvaluationInput,
	ScoringProvenance,
} from "./model";

export interface LegacyMigrationContext {
	certificationId: string;
	legacyStorageKey: string;
	rawValue: string;
	config: CertificationConfig;
	questions: readonly Question[];
	now: number;
	idFactory?: () => string;
}

export type LegacyMigrationPlan = Omit<LegacyProgressMigrationInput, "migratedAt">;

export function buildLegacyMigrationPlan(context: LegacyMigrationContext): LegacyMigrationPlan {
	const warnings: string[] = [];
	let legacy: unknown;
	try {
		legacy = JSON.parse(context.rawValue);
	} catch {
		return emptyPlan(context, [
			"The legacy record is not valid JSON; its raw value is preserved in the backup.",
		]);
	}
	if (!isRecord(legacy)) {
		return emptyPlan(context, [
			"The legacy record is not an object; its raw value is preserved in the backup.",
		]);
	}

	const baselines = readLegacyStats(legacy.stats, warnings);
	let session: LegacySessionImport | undefined;
	if (!("session" in legacy)) {
		warnings.push(
			"The legacy session field is missing; the raw record remains available in the backup.",
		);
	} else if (legacy.session !== null && legacy.session !== undefined) {
		const result = readLegacySession(legacy.session, context, warnings);
		session = result;
	}

	return {
		certificationId: context.certificationId,
		legacyStorageKey: context.legacyStorageKey,
		rawValue: context.rawValue,
		baselines,
		...(session ? { session } : {}),
		warnings,
	};
}

function emptyPlan(context: LegacyMigrationContext, warnings: string[]): LegacyMigrationPlan {
	return {
		certificationId: context.certificationId,
		legacyStorageKey: context.legacyStorageKey,
		rawValue: context.rawValue,
		baselines: [],
		warnings,
	};
}

function readLegacyStats(value: unknown, warnings: string[]): LegacyMigrationPlan["baselines"] {
	if (!isRecord(value)) {
		warnings.push("Legacy stats were missing or invalid; no aggregate counts were imported.");
		return [];
	}
	const baselines: LegacyMigrationPlan["baselines"][number][] = [];
	for (const [questionId, stats] of Object.entries(value)) {
		if (!isStableId(questionId) || !isRecord(stats)) {
			warnings.push("A legacy aggregate with an invalid question ID or shape was skipped.");
			continue;
		}
		const { attempts, correct, lastWrong } = stats;
		if (
			!isCounter(attempts) ||
			!isCounter(correct) ||
			correct > attempts ||
			typeof lastWrong !== "boolean"
		) {
			warnings.push(`Legacy aggregate for ${questionId} had invalid counters and was skipped.`);
			continue;
		}
		baselines.push({ questionId, baseline: { attempts, correct, lastWrong } });
	}
	return baselines;
}

function readLegacySession(
	value: unknown,
	context: LegacyMigrationContext,
	warnings: string[],
): LegacySessionImport | undefined {
	const reject = (reason: string): undefined => {
		warnings.push(
			`The legacy session was not imported: ${reason} Its raw record remains available in the backup.`,
		);
		return undefined;
	};
	if (!isRecord(value)) return reject("the session was not an object.");
	if (!isSessionMode(value.mode)) return reject("the session mode is invalid.");
	if (!Array.isArray(value.ids) || value.ids.length === 0 || !value.ids.every(isStableId)) {
		return reject("question IDs are missing or invalid.");
	}
	const ids = value.ids as string[];
	if (new Set(ids).size !== ids.length) return reject("question IDs are duplicated.");
	if (!isRecord(value.answers) || !isRecord(value.checked)) {
		return reject("answers or checked state are missing or invalid.");
	}
	if (typeof value.submitted !== "boolean") return reject("submitted state is missing or invalid.");
	if (!isTimestamp(value.created)) return reject("the original creation timestamp is invalid.");
	if (
		!Number.isSafeInteger(value.currentIndex) ||
		(value.currentIndex as number) < 0 ||
		(value.currentIndex as number) > ids.length
	) {
		return reject("the current question index is invalid.");
	}
	if (value.deadline !== null && !isTimestamp(value.deadline)) {
		return reject("the timer deadline is invalid.");
	}
	if (value.mode === "exam" && !value.submitted && value.deadline === null) {
		return reject("an active exam has no absolute timer deadline.");
	}
	if (value.submitted && !isTimestamp(value.finished)) {
		return reject("the submitted session has no valid finish timestamp.");
	}
	if (value.timedOut !== undefined && typeof value.timedOut !== "boolean") {
		return reject("the timeout state is invalid.");
	}

	const byId = new Map<string, Question>();
	for (const question of context.questions) {
		if (byId.has(question.id)) return reject("the current question bank contains duplicate IDs.");
		byId.set(question.id, question);
	}
	if (ids.some((id) => !byId.has(id))) {
		return reject("one or more questions are no longer in the bank and cannot be safely resumed.");
	}

	const checked = value.checked;
	const flags = value.flags;
	if (!Object.values(checked).every((item) => typeof item === "boolean")) {
		return reject("checked values are invalid.");
	}
	if (!Object.keys(checked).every((id) => ids.includes(id))) {
		return reject("checked state references a question outside this session.");
	}
	if (!Array.isArray(flags) || !flags.every(isStableId) || new Set(flags).size !== flags.length) {
		return reject("flagged question IDs are invalid.");
	}
	if (!flags.every((id) => ids.includes(id)))
		return reject("a flag references a question outside this session.");
	if (value.shuffledOptions !== undefined && !isRecord(value.shuffledOptions)) {
		return reject("the shuffled option map is invalid.");
	}

	const savedShuffledOptions = isRecord(value.shuffledOptions) ? value.shuffledOptions : undefined;
	const contentQuestions: QuestionProvenance[] = [];
	for (const id of ids) {
		const question = byId.get(id);
		if (!question) return reject(`question ${id} is no longer available.`);
		if (savedShuffledOptions && !(id in savedShuffledOptions)) {
			return reject(`the saved option order for ${id} is missing.`);
		}
		const rawOptions = savedShuffledOptions?.[id];
		const effective = readOptions(question, rawOptions);
		if (!effective)
			return reject(`the saved option order for ${id} does not match the answer key.`);
		contentQuestions.push(createQuestionProvenance(question, context.config, effective));
	}
	if (savedShuffledOptions && Object.keys(savedShuffledOptions).some((id) => !ids.includes(id))) {
		return reject("the shuffled option map references a question outside this session.");
	}

	const answers: Record<string, number[]> = {};
	const selectedOptionIdsByQuestion: Record<string, string[]> = {};
	for (const [id, rawSelection] of Object.entries(value.answers)) {
		if (!ids.includes(id) || !Array.isArray(rawSelection)) {
			return reject("an answer references an unknown question or has an invalid shape.");
		}
		const optionMap = contentQuestions.find((question) => question.questionId === id);
		if (!optionMap || !rawSelection.every(isOptionIndex)) {
			return reject(`the saved answer for ${id} contains invalid option indices.`);
		}
		const indexes = rawSelection as number[];
		if (
			new Set(indexes).size !== indexes.length ||
			indexes.some((index) => index >= optionMap.displayOptionIds.length)
		) {
			return reject(`the saved answer for ${id} is not a valid permutation selection.`);
		}
		answers[id] = [...indexes];
		if (indexes.length > 0)
			selectedOptionIdsByQuestion[id] = indexes.map((index) => optionMap.displayOptionIds[index]);
	}

	for (const id of ids) {
		if (checked[id] === true) {
			const answer = answers[id] ?? [];
			const expected = contentQuestions.find((question) => question.questionId === id)?.selectCount;
			if (answer.length !== expected)
				return reject(`checked question ${id} has no complete saved answer.`);
		}
	}

	const scoring = createScoringProvenance(context.config, ids.length);
	const content = createContentProvenance(contentQuestions);
	const checkedQuestionIds = ids.filter((id) => checked[id] === true);
	const limitations = [
		"The v2 record did not capture question wording or rationale; these fields are from the current bank.",
		"The original question-bank and scoring revisions were not stored.",
	];
	const checkpoint = {
		currentQuestionId: ids[value.currentIndex as number] ?? null,
		deadlineAt: value.deadline as number | null,
		selectedOptionIdsByQuestion,
		checkedQuestionIds,
		flaggedQuestionIds: [...flags],
	};
	const legacy = {
		sourceStorageKey: context.legacyStorageKey,
		version: 2 as const,
		limitations,
		evaluatedQuestionIds: checkedQuestionIds,
	};
	const input: CreateSessionInput = {
		id: (context.idFactory ?? (() => globalThis.crypto.randomUUID()))(),
		certificationId: context.certificationId,
		mode: value.mode,
		startedAt: value.created,
		scoring,
		content,
		checkpoint,
		legacy,
	};

	let status: LegacySessionImport["status"];
	let finishedAt: number | undefined;
	let evaluations: RecordEvaluationInput[] = [];
	if (value.submitted) {
		status = value.timedOut === true ? "expired" : "completed";
		finishedAt = value.finished as number;
	} else if (value.mode === "exam" && (value.deadline as number) <= context.now) {
		status = "expired";
		finishedAt = context.now;
		evaluations = createExpiredExamEvaluations(
			ids,
			answers,
			checkedQuestionIds,
			contentQuestions,
			input.id,
			context.now,
		);
	}

	warnings.push(
		...limitations.map((limitation) => `Imported legacy session limitation: ${limitation}`),
	);
	return {
		input,
		...(status ? { status, finishedAt, evaluations } : {}),
	};
}

function readOptions(
	question: Question,
	value: unknown,
): { options: ShuffledQuestionOptions; originalIndices: number[] } | undefined {
	let options: string[];
	let correctAnswers: number[];
	let savedOptionIds: string[] | undefined;
	if (value === undefined) {
		options = [...question.options];
		correctAnswers = [...question.correctAnswers];
	} else {
		if (!isRecord(value) || !Array.isArray(value.options) || !Array.isArray(value.correctAnswers)) {
			return undefined;
		}
		if (
			!value.options.every((item) => typeof item === "string") ||
			!value.correctAnswers.every(isOptionIndex)
		) {
			return undefined;
		}
		options = value.options as string[];
		correctAnswers = value.correctAnswers as number[];
		if (value.optionIds !== undefined) {
			if (
				!Array.isArray(value.optionIds) ||
				!value.optionIds.every((item) => typeof item === "string")
			) {
				return undefined;
			}
			savedOptionIds = value.optionIds as string[];
		}
	}
	if (
		options.length !== question.options.length ||
		!sameMultiset(options, question.options) ||
		correctAnswers.length !== question.correctAnswers.length ||
		new Set(correctAnswers).size !== correctAnswers.length ||
		correctAnswers.some((index) => index >= options.length)
	) {
		return undefined;
	}
	const expectedOptionIds = question.options.map((_, index) => optionId(question.id, index));
	const originalIndices = savedOptionIds
		? savedOptionIds.length === options.length &&
			savedOptionIds.every((id) => expectedOptionIds.includes(id)) &&
			new Set(savedOptionIds).size === savedOptionIds.length
			? savedOptionIds.map((id) => expectedOptionIds.indexOf(id))
			: undefined
		: matchOptionOrder(question.options, options);
	if (!originalIndices) return undefined;
	if (options.some((label, index) => label !== question.options[originalIndices[index]]))
		return undefined;
	const correctTexts = correctAnswers.map((index) => options[index]);
	const expectedTexts = question.correctAnswers.map((index) => question.options[index]);
	if (!sameMultiset(correctTexts, expectedTexts)) return undefined;
	return {
		options: { options, correctAnswers, ...(savedOptionIds ? { optionIds: savedOptionIds } : {}) },
		originalIndices,
	};
}

export function computeQuestionRevision(question: Question): string {
	return fingerprint({
		questionText: question.question,
		options: question.options,
		correctAnswers: [...question.correctAnswers].sort((a, b) => a - b),
		selectCount: question.selectCount ?? question.correctAnswers.length,
		...(question.contentVersion ? { contentVersion: question.contentVersion } : {}),
	});
}

function createQuestionProvenance(
	question: Question,
	config: CertificationConfig,
	effective: { options: ShuffledQuestionOptions; originalIndices: number[] },
): QuestionProvenance {
	const optionIds = question.options.map((_, index) => optionId(question.id, index));
	const displayOptionIds = effective.originalIndices.map((index) => optionIds[index]);
	const correctOptionIds = effective.options.correctAnswers.map((index) => displayOptionIds[index]);
	const content = {
		questionText: question.question,
		options: effective.options.options,
		correctAnswers: effective.options.correctAnswers,
		explanation: question.explanation,
		source: question.source,
	};
	const hash = fingerprint(content);
	return {
		questionId: question.id,
		revision: computeQuestionRevision(question),
		contentHash: hash,
		domainId: question.domain,
		optionIds,
		optionTexts: [...question.options],
		displayOptionIds,
		correctOptionIds,
		questionText: question.question,
		domainName: config.domains[question.domain]?.name ?? question.domain,
		...(question.topic ? { topic: question.topic } : {}),
		explanation: question.explanation,
		...(question.whyNot ? { whyNot: question.whyNot } : {}),
		sourceLabel: question.source.label,
		sourceUrl: question.source.url,
		selectCount: question.selectCount ?? question.correctAnswers.length,
	};
}

export function createQuestionSnapshot(
	question: Question,
	config: CertificationConfig,
	displayedOptions?: ShuffledQuestionOptions,
): QuestionProvenance {
	const effective = readOptions(question, displayedOptions);
	if (!effective)
		throw new Error(`Could not create a stable snapshot for question ${question.id}.`);
	return createQuestionProvenance(question, config, effective);
}

export function createContentProvenance(
	questions: readonly QuestionProvenance[],
): ContentProvenance {
	return {
		bankRevision: fingerprint(questions.map(({ questionId, revision }) => [questionId, revision])),
		questions: [...questions],
	};
}

export function createScoringProvenance(
	config: CertificationConfig,
	totalQuestions: number,
): ScoringProvenance {
	const domainWeights = Object.fromEntries(
		Object.entries(config.domains).map(([domainId, domain]) => [domainId, domain.weight]),
	);
	const scoring = {
		passingScore: config.passingScore ?? null,
		totalQuestions,
		domainWeights,
	};
	return { revision: fingerprint(scoring), ...scoring };
}

function createExpiredExamEvaluations(
	ids: readonly string[],
	answers: Readonly<Record<string, readonly number[]>>,
	evaluatedQuestionIds: readonly string[],
	questions: readonly QuestionProvenance[],
	sessionId: string,
	evaluatedAt: number,
): RecordEvaluationInput[] {
	const byId = new Map(questions.map((question) => [question.questionId, question]));
	const evaluations: RecordEvaluationInput[] = [];
	for (const questionId of ids) {
		if (evaluatedQuestionIds.includes(questionId)) continue;
		const answer = answers[questionId];
		if (!answer?.length) continue;
		const snapshot = byId.get(questionId);
		if (!snapshot) continue;
		const selectedOptionIds = answer.map((index) => snapshot.displayOptionIds[index]);
		const correct =
			selectedOptionIds.length === snapshot.correctOptionIds.length &&
			selectedOptionIds.every((id) => snapshot.correctOptionIds.includes(id));
		evaluations.push({
			sessionId,
			questionId,
			selectedOptionIds,
			outcome: correct ? "correct" : "incorrect",
			scoreEarned: correct ? 1 : 0,
			scorePossible: 1,
			evaluatedAt,
		});
	}
	return evaluations;
}

function optionId(questionId: string, index: number): string {
	return `${questionId}:option:${index}`;
}

function matchOptionOrder(
	original: readonly string[],
	displayed: readonly string[],
): number[] | undefined {
	const indicesByLabel = new Map<string, number[]>();
	original.forEach((label, index) => {
		const indices = indicesByLabel.get(label) ?? [];
		indices.push(index);
		indicesByLabel.set(label, indices);
	});
	const indices: number[] = [];
	for (const label of displayed) {
		const next = indicesByLabel.get(label)?.shift();
		if (next === undefined) return undefined;
		indices.push(next);
	}
	return indicesByLabel.size === 0 ||
		[...indicesByLabel.values()].every((rest) => rest.length === 0)
		? indices
		: undefined;
}

function sameMultiset(a: readonly string[], b: readonly string[]): boolean {
	if (a.length !== b.length) return false;
	const counts = new Map<string, number>();
	for (const value of a) counts.set(value, (counts.get(value) ?? 0) + 1);
	for (const value of b) {
		const count = counts.get(value);
		if (!count) return false;
		if (count === 1) counts.delete(value);
		else counts.set(value, count - 1);
	}
	return counts.size === 0;
}

function fingerprint(value: unknown): string {
	const text = stableStringify(value);
	let hash = 2166136261;
	for (let index = 0; index < text.length; index += 1) {
		hash = Math.imul(hash ^ text.charCodeAt(index), 16777619);
	}
	return `fnv1a-${(hash >>> 0).toString(16).padStart(8, "0")}`;
}

function stableStringify(value: unknown): string {
	if (Array.isArray(value)) return `[${value.map(stableStringify).join(",")}]`;
	if (isRecord(value)) {
		return `{${Object.entries(value)
			.sort(([a], [b]) => a.localeCompare(b))
			.map(([key, item]) => `${JSON.stringify(key)}:${stableStringify(item)}`)
			.join(",")}}`;
	}
	return JSON.stringify(value);
}

function isRecord(value: unknown): value is Record<string, unknown> {
	return value !== null && typeof value === "object" && !Array.isArray(value);
}

function isSessionMode(value: unknown): value is QuizSession["mode"] {
	return value === "practice" || value === "exam" || value === "weak";
}

function isStableId(value: unknown): value is string {
	return typeof value === "string" && value.trim().length > 0 && value.length <= 512;
}

function isCounter(value: unknown): value is number {
	return Number.isSafeInteger(value) && (value as number) >= 0;
}

function isTimestamp(value: unknown): value is number {
	return typeof value === "number" && Number.isFinite(value) && value >= 0;
}

function isOptionIndex(value: unknown): value is number {
	return Number.isSafeInteger(value) && (value as number) >= 0;
}
