import { ProgressConflictError } from "./errors";
import { createProgressRepository } from "./indexeddb-repository";
import type { LearningGoalRecord, StudyProgressRecord, StudyProgressStatus } from "./model";
import type { StudyProgressRepository } from "./repository-port";
import {
	getStudyStatus,
	isValidLearningGoalRecord,
	isValidLocalCalendarDate,
	isValidReadingAnchor,
	isValidStudyProgressRecord,
	MAX_STUDY_GOAL_COUNT,
	resolveStudyRecord,
	type StudyNoteReference,
} from "./study-domain";

export type StudyProgressChangeKind = "study" | "practice" | "reset";
export type StudyProgressChangeListener = (kind: StudyProgressChangeKind) => void;

export interface StudyGoalsInput {
	targetDate: string | null;
	targetQuestionCount: number | null;
	targetNoteCount: number | null;
}

export class StudyProgressService {
	private readonly listeners = new Set<StudyProgressChangeListener>();
	private readonly channel?: BroadcastChannel;
	private generationToken = "";
	private certificationId = "";

	constructor(
		private readonly repository: StudyProgressRepository = createProgressRepository(),
		private readonly now: () => number = Date.now,
	) {
		if (typeof BroadcastChannel !== "undefined") {
			this.channel = new BroadcastChannel("practice-lab-progress");
			this.channel.addEventListener("message", this.onMessage);
		}
	}

	async initialize(certificationId: string): Promise<void> {
		if (this.certificationId === certificationId && this.generationToken.length > 0) return;
		this.certificationId = certificationId;
		const generationToken = await this.repository.getDataGenerationToken(certificationId);
		if (this.certificationId === certificationId) this.generationToken = generationToken;
	}

	getProgress(certificationId: string): Promise<StudyProgressRecord[]> {
		return this.repository.getStudyProgressForCertification(certificationId);
	}

	getGoal(certificationId: string): Promise<LearningGoalRecord | undefined> {
		return this.repository.getLearningGoalForCertification(certificationId);
	}

	async openNote(note: StudyNoteReference): Promise<StudyProgressRecord> {
		const existing = resolveStudyRecord(note, await this.getProgress(note.certificationId));
		const revisionChanged =
			existing?.contentRevision !== undefined && existing.contentRevision !== note.revision;
		const currentStatus = getStudyStatus(existing, note.revision);
		const status = currentStatus === "completed" ? "completed" : "in_progress";
		return this.saveNote(note, {
			...(existing ?? {}),
			status,
			lastOpenedAt: this.now(),
			...(revisionChanged ? { readingPositionAnchor: undefined } : {}),
			...(status === "completed" && existing?.completedRevision === undefined
				? { completedRevision: note.revision }
				: {}),
			contentRevision: note.revision,
		});
	}

	setStatus(note: StudyNoteReference, status: StudyProgressStatus): Promise<StudyProgressRecord> {
		return this.updateNote(note, (existing) => ({
			...existing,
			status,
			...(status === "completed"
				? { completedAt: this.now(), completedRevision: note.revision }
				: {}),
		}));
	}

	setBookmarked(note: StudyNoteReference, bookmarked: boolean): Promise<StudyProgressRecord> {
		return this.updateNote(note, (existing) => ({ ...existing, bookmarked }));
	}

	async saveReadingPosition(
		note: StudyNoteReference,
		anchor: string,
	): Promise<StudyProgressRecord | undefined> {
		if (!isValidReadingAnchor(anchor)) return undefined;
		const existing = resolveStudyRecord(note, await this.getProgress(note.certificationId));
		if (existing?.readingPositionAnchor === anchor && existing.contentRevision === note.revision) {
			return existing;
		}
		return this.saveNote(note, {
			...(existing ?? {}),
			status: existing?.status ?? "in_progress",
			readingPositionAnchor: anchor,
			contentRevision: note.revision,
		});
	}

	async saveGoals(certificationId: string, input: StudyGoalsInput): Promise<LearningGoalRecord> {
		if (certificationId !== this.certificationId || this.generationToken.length === 0) {
			throw new ProgressConflictError(
				"Initialize the selected certification before saving study goals.",
			);
		}
		if (
			(input.targetDate !== null && !isValidLocalCalendarDate(input.targetDate)) ||
			!isGoalCount(input.targetQuestionCount) ||
			!isGoalCount(input.targetNoteCount)
		) {
			throw new ProgressConflictError("Enter a valid local date and non-negative study goals.");
		}
		const existing = await this.getGoal(certificationId);
		const record: LearningGoalRecord = {
			certificationId,
			dailyQuestionTarget: existing?.dailyQuestionTarget ?? null,
			targetQuestionCount: input.targetQuestionCount,
			targetNoteCount: input.targetNoteCount,
			targetDate: input.targetDate,
			targetDateTimezone: "floating-local",
			...(input.targetDate === null && existing?.legacyTargetDate !== undefined
				? { legacyTargetDate: existing.legacyTargetDate }
				: {}),
			updatedAt: this.now(),
		};
		if (!isValidLearningGoalRecord(record)) {
			throw new ProgressConflictError("The study goals are invalid.");
		}
		await this.repository.saveLearningGoal(record, this.generationToken);
		this.broadcast(certificationId);
		return record;
	}

	onChange(listener: StudyProgressChangeListener): () => void {
		this.listeners.add(listener);
		return () => this.listeners.delete(listener);
	}

	close(): void {
		this.channel?.removeEventListener("message", this.onMessage);
		this.channel?.close();
		this.listeners.clear();
	}

	private async updateNote(
		note: StudyNoteReference,
		update: (record: StudyProgressRecord) => StudyProgressRecord,
	): Promise<StudyProgressRecord> {
		const existing = resolveStudyRecord(note, await this.getProgress(note.certificationId));
		return this.saveNote(
			note,
			update({
				...(existing ?? {}),
				status: existing?.status ?? "not_started",
				bookmarked: existing?.bookmarked ?? false,
				updatedAt: this.now(),
				certificationId: note.certificationId,
				noteId: note.noteId,
			}),
		);
	}

	private async saveNote(
		note: StudyNoteReference,
		updates: Partial<StudyProgressRecord>,
	): Promise<StudyProgressRecord> {
		if (note.certificationId !== this.certificationId || this.generationToken.length === 0) {
			throw new ProgressConflictError(
				"Initialize the note certification before saving study progress.",
			);
		}
		const record: StudyProgressRecord = {
			...updates,
			certificationId: note.certificationId,
			noteId: note.noteId,
			status: updates.status ?? "not_started",
			bookmarked: updates.bookmarked ?? false,
			contentRevision: note.revision,
			updatedAt: this.now(),
		};
		if (!isValidStudyProgressRecord(record)) {
			throw new ProgressConflictError("The study progress record is invalid.");
		}
		await this.repository.saveStudyProgress(record, this.generationToken);
		this.broadcast(note.certificationId);
		return record;
	}

	private broadcast(certificationId: string): void {
		this.channel?.postMessage({ type: "study-progress-changed", certificationId });
	}

	private onMessage = (event: MessageEvent<unknown>): void => {
		const message = parseStudyProgressMessage(event.data);
		if (!message || message.certificationId !== this.certificationId) return;
		if (message.type === "study-progress-changed") {
			this.notifyListeners("study");
			return;
		}
		if (message.generationToken === this.generationToken) {
			this.notifyListeners("practice");
			return;
		}
		if (message.generationToken) this.generationToken = message.generationToken;
		this.notifyListeners("reset");
	};

	private notifyListeners(kind: StudyProgressChangeKind): void {
		for (const listener of this.listeners) listener(kind);
	}
}

type StudyProgressMessage =
	| { type: "study-progress-changed"; certificationId: string }
	| { type: "progress-changed"; certificationId: string; generationToken: string };

function parseStudyProgressMessage(value: unknown): StudyProgressMessage | undefined {
	if (value === null || typeof value !== "object") return undefined;
	const message = value as Record<string, unknown>;
	if (message.type === "study-progress-changed" && typeof message.certificationId === "string") {
		return { type: message.type, certificationId: message.certificationId };
	}
	if (
		message.type === "progress-changed" &&
		typeof message.certificationId === "string" &&
		typeof message.generationToken === "string"
	) {
		return {
			type: message.type,
			certificationId: message.certificationId,
			generationToken: message.generationToken,
		};
	}
	return undefined;
}

function isGoalCount(value: number | null): boolean {
	return (
		value === null || (Number.isSafeInteger(value) && value >= 0 && value <= MAX_STUDY_GOAL_COUNT)
	);
}
