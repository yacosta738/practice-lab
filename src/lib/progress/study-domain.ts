import type { LearningGoalRecord, StudyProgressRecord, StudyProgressStatus } from "./model";

export const MAX_STUDY_ANCHOR_LENGTH = 160;
export const MAX_STUDY_GOAL_COUNT = 1_000_000;

export interface StudyNoteReference {
	certificationId: string;
	noteId: string;
	aliases: readonly string[];
	revision: string;
}

export interface StudyProgressSummary {
	eligible: number;
	completed: number;
	inProgress: number;
	bookmarked: number;
	archived: StudyProgressRecord[];
}

export function getStudyStatus(
	record: StudyProgressRecord | undefined,
	noteRevision: string,
): StudyProgressStatus {
	if (!record) return "not_started";
	if (
		record.status === "completed" &&
		record.completedRevision !== undefined &&
		record.completedRevision !== noteRevision
	) {
		return "in_progress";
	}
	return record.status;
}

export function resolveStudyRecord(
	note: StudyNoteReference,
	records: readonly StudyProgressRecord[],
): StudyProgressRecord | undefined {
	const ids = [note.noteId, ...note.aliases];
	for (const id of ids) {
		const match = records.find(
			(record) => record.certificationId === note.certificationId && record.noteId === id,
		);
		if (match) return match;
	}
	return undefined;
}

export function summarizeStudyProgress(
	notes: readonly StudyNoteReference[],
	records: readonly StudyProgressRecord[],
): StudyProgressSummary {
	let completed = 0;
	let inProgress = 0;
	let bookmarked = 0;
	const currentIds = new Set<string>();

	for (const note of notes) {
		currentIds.add(note.noteId);
		for (const alias of note.aliases) currentIds.add(alias);
		const record = resolveStudyRecord(note, records);
		const status = getStudyStatus(record, note.revision);
		if (status === "completed") completed += 1;
		if (status === "in_progress") inProgress += 1;
		if (record?.bookmarked) bookmarked += 1;
	}

	return {
		eligible: notes.length,
		completed,
		inProgress,
		bookmarked,
		archived: records
			.filter((record) => !currentIds.has(record.noteId))
			.toSorted((a, b) => b.updatedAt - a.updatedAt || a.noteId.localeCompare(b.noteId)),
	};
}

export function isValidReadingAnchor(value: unknown): value is string {
	return (
		typeof value === "string" &&
		value.length > 0 &&
		value.length <= MAX_STUDY_ANCHOR_LENGTH &&
		!/\p{Cc}/u.test(value)
	);
}

export function isValidLocalCalendarDate(value: unknown): value is string {
	if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
	const [year, month, day] = value.split("-").map(Number);
	if (year < 1 || month < 1 || month > 12 || day < 1) return false;
	const leapYear = year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
	const daysInMonth = [31, leapYear ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
	return day <= daysInMonth[month - 1];
}

export function isValidStudyProgressRecord(value: StudyProgressRecord): boolean {
	return (
		typeof value.certificationId === "string" &&
		value.certificationId.length > 0 &&
		typeof value.noteId === "string" &&
		value.noteId.length > 0 &&
		(value.status === "not_started" ||
			value.status === "in_progress" ||
			value.status === "completed") &&
		typeof value.bookmarked === "boolean" &&
		isTimestamp(value.updatedAt) &&
		(value.completedAt === undefined || isTimestamp(value.completedAt)) &&
		(value.lastOpenedAt === undefined || isTimestamp(value.lastOpenedAt)) &&
		(value.readingPositionAnchor === undefined ||
			isValidReadingAnchor(value.readingPositionAnchor)) &&
		validRevision(value.contentRevision) &&
		validRevision(value.completedRevision)
	);
}

export function isValidLearningGoalRecord(value: LearningGoalRecord): boolean {
	return (
		typeof value.certificationId === "string" &&
		value.certificationId.length > 0 &&
		isValidGoalCount(value.dailyQuestionTarget) &&
		isValidGoalCount(value.targetQuestionCount) &&
		isValidGoalCount(value.targetNoteCount) &&
		(value.targetDate === null || isValidLocalCalendarDate(value.targetDate)) &&
		value.targetDateTimezone === "floating-local" &&
		(value.legacyTargetDate === undefined || isTimestamp(value.legacyTargetDate)) &&
		isTimestamp(value.updatedAt)
	);
}

export function isValidGoalCount(value: unknown): value is number | null {
	return (
		value === null ||
		(Number.isSafeInteger(value) &&
			(value as number) >= 0 &&
			(value as number) <= MAX_STUDY_GOAL_COUNT)
	);
}

function validRevision(value: unknown): boolean {
	return (
		value === undefined || (typeof value === "string" && value.length > 0 && value.length <= 160)
	);
}

function isTimestamp(value: unknown): value is number {
	return Number.isSafeInteger(value) && (value as number) >= 0;
}
