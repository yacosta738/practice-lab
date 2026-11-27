import { afterEach, describe, expect, it, vi } from "vitest";
import { ProgressConflictError } from "../../src/lib/progress/errors";
import type { LearningGoalRecord, StudyProgressRecord } from "../../src/lib/progress/model";
import type { StudyProgressRepository } from "../../src/lib/progress/repository-port";
import {
	getStudyStatus,
	isValidLocalCalendarDate,
	resolveStudyRecord,
	type StudyNoteReference,
	summarizeStudyProgress,
} from "../../src/lib/progress/study-domain";
import {
	type StudyProgressChangeKind,
	StudyProgressService,
} from "../../src/lib/progress/study-service";

const note: StudyNoteReference = {
	certificationId: "ccdv-f",
	noteId: "ccdv-f/D1/agent-loop",
	aliases: ["ccdv-f/old/agent-loop"],
	revision: "sha256-current",
};

function progressRecord(overrides: Partial<StudyProgressRecord> = {}): StudyProgressRecord {
	return {
		certificationId: "ccdv-f",
		noteId: note.noteId,
		status: "not_started",
		bookmarked: false,
		updatedAt: 1,
		...overrides,
	};
}

class MemoryStudyRepository implements StudyProgressRepository {
	readonly records: StudyProgressRecord[] = [];
	readonly goals = new Map<string, LearningGoalRecord>();
	private readonly generationTokens = new Map<string, string>();
	private pendingUpdate?: {
		started: () => void;
		wait: Promise<void>;
	};

	async getDataGenerationToken(certificationId: string): Promise<string> {
		return this.currentGenerationToken(certificationId);
	}

	pauseNextUpdate(): { started: Promise<void>; release: () => void } {
		let notifyStarted = () => {};
		let release = () => {};
		const started = new Promise<void>((resolve) => {
			notifyStarted = resolve;
		});
		const wait = new Promise<void>((resolve) => {
			release = resolve;
		});
		this.pendingUpdate = { started: notifyStarted, wait };
		return { started, release };
	}

	resetCertificationProgress(certificationId: string): void {
		this.records.splice(
			0,
			this.records.length,
			...this.records.filter((record) => record.certificationId !== certificationId),
		);
		this.goals.delete(certificationId);
		this.generationTokens.set(
			certificationId,
			`${this.currentGenerationToken(certificationId)}:reset`,
		);
	}

	async getStudyProgressForCertification(certificationId: string): Promise<StudyProgressRecord[]> {
		return this.records.filter((record) => record.certificationId === certificationId);
	}

	async getLearningGoalForCertification(
		certificationId: string,
	): Promise<LearningGoalRecord | undefined> {
		return this.goals.get(certificationId);
	}

	async updateStudyProgress(
		certificationId: string,
		noteIds: readonly string[],
		expectedGenerationToken: string,
		update: (existing: StudyProgressRecord | undefined) => StudyProgressRecord,
	): Promise<StudyProgressRecord> {
		const pendingUpdate = this.pendingUpdate;
		this.pendingUpdate = undefined;
		if (pendingUpdate) {
			pendingUpdate.started();
			await pendingUpdate.wait;
		}
		if (expectedGenerationToken !== this.currentGenerationToken(certificationId)) {
			throw new ProgressConflictError("Progress changed in another tab. Reload before continuing.");
		}
		const existing = this.records.find(
			(record) => record.certificationId === certificationId && noteIds.includes(record.noteId),
		);
		const record = update(existing);
		if (record === existing) return record;
		const index = this.records.findIndex(
			(existing) =>
				existing.certificationId === record.certificationId && existing.noteId === record.noteId,
		);
		if (index === -1) this.records.push(record);
		else this.records[index] = record;
		return record;
	}

	async saveLearningGoal(
		record: LearningGoalRecord,
		expectedGenerationToken: string,
	): Promise<void> {
		if (expectedGenerationToken !== this.currentGenerationToken(record.certificationId)) {
			throw new ProgressConflictError("Progress changed in another tab. Reload before continuing.");
		}
		this.goals.set(record.certificationId, record);
	}

	private currentGenerationToken(certificationId: string): string {
		return this.generationTokens.get(certificationId) ?? `generation:${certificationId}`;
	}
}

describe("study progress domain", () => {
	it("resolves legacy aliases by certification and keeps removed notes archived", () => {
		const aliasRecord = progressRecord({
			noteId: note.aliases[0],
			status: "completed",
			bookmarked: true,
		});
		const removedRecord = progressRecord({ noteId: "ccdv-f/removed-note" });
		const otherCertification = progressRecord({ certificationId: "ccao-f", status: "completed" });

		expect(resolveStudyRecord(note, [aliasRecord])).toBe(aliasRecord);
		const summary = summarizeStudyProgress(
			[note],
			[aliasRecord, removedRecord, otherCertification],
		);
		expect(summary).toMatchObject({ eligible: 1, completed: 1, bookmarked: 1 });
		expect(summary.archived.map(({ noteId }) => noteId)).toEqual(["ccdv-f/removed-note"]);
	});

	it("treats a completed note with revised content as in progress", () => {
		const record = progressRecord({ status: "completed", completedRevision: "sha256-old" });
		expect(getStudyStatus(record, note.revision)).toBe("in_progress");
	});

	it("validates local calendar dates without timezone conversion", () => {
		expect(isValidLocalCalendarDate("2028-02-29")).toBe(true);
		expect(isValidLocalCalendarDate("2026-02-29")).toBe(false);
		expect(isValidLocalCalendarDate("2026-13-01")).toBe(false);
		expect(isValidLocalCalendarDate("2026-01-01T00:00:00Z")).toBe(false);
	});
});

describe("StudyProgressService", () => {
	afterEach(() => {
		vi.unstubAllGlobals();
	});

	it("preserves concurrent changes to separate study progress fields", async () => {
		vi.stubGlobal("BroadcastChannel", undefined);
		const repository = new MemoryStudyRepository();
		const service = new StudyProgressService(repository, () => 100);
		await service.initialize(note.certificationId);

		await Promise.all([
			service.setBookmarked(note, true),
			service.saveReadingPosition(note, "section-two"),
		]);

		expect(repository.records).toHaveLength(1);
		expect(repository.records[0]).toMatchObject({
			bookmarked: true,
			readingPositionAnchor: "section-two",
		});
		service.close();
	});

	it("records visits and checkpoints as in progress until explicit completion, then supports undo", async () => {
		vi.stubGlobal("BroadcastChannel", undefined);
		const repository = new MemoryStudyRepository();
		const service = new StudyProgressService(repository, () => 100);
		await service.initialize(note.certificationId);

		const opened = await service.openNote(note);
		expect(opened.status).toBe("in_progress");
		expect(opened.lastOpenedAt).toBe(100);
		const checkpoint = await service.saveReadingPosition(note, "section-two");
		expect(checkpoint?.readingPositionAnchor).toBe("section-two");
		expect(checkpoint?.status).toBe("in_progress");
		await service.setBookmarked(note, true);
		const completed = await service.setStatus(note, "completed");
		expect(completed.status).toBe("completed");
		expect(completed.completedRevision).toBe(note.revision);
		const unread = await service.setStatus(note, "not_started");
		expect(unread.status).toBe("not_started");
		expect(unread.completedAt).toBe(100);
		expect(unread.bookmarked).toBe(true);
		service.close();
	});

	it("migrates a completion through a renamed alias and clears obsolete anchors on revision", async () => {
		vi.stubGlobal("BroadcastChannel", undefined);
		const repository = new MemoryStudyRepository();
		repository.records.push(
			progressRecord({
				noteId: note.aliases[0],
				status: "completed",
				completedAt: 50,
				completedRevision: "sha256-old",
				contentRevision: "sha256-old",
				readingPositionAnchor: "old-heading",
			}),
		);
		const service = new StudyProgressService(repository, () => 200);
		await service.initialize(note.certificationId);

		const updated = await service.openNote(note);
		expect(updated).toMatchObject({
			noteId: note.noteId,
			status: "in_progress",
			completedAt: 50,
			completedRevision: "sha256-old",
			contentRevision: note.revision,
		});
		expect(updated.readingPositionAnchor).toBeUndefined();
		expect(repository.records).toHaveLength(2);
		service.close();
	});

	it("stores optional goals with a floating local date and rejects invalid dates", async () => {
		vi.stubGlobal("BroadcastChannel", undefined);
		const repository = new MemoryStudyRepository();
		const service = new StudyProgressService(repository, () => 300);
		await service.initialize(note.certificationId);

		await expect(
			service.saveGoals(note.certificationId, {
				targetDate: "2026-02-29",
				targetQuestionCount: 20,
				targetNoteCount: 5,
			}),
		).rejects.toThrow(/valid local date/i);
		const saved = await service.saveGoals(note.certificationId, {
			targetDate: "2028-02-29",
			targetQuestionCount: 20,
			targetNoteCount: null,
		});
		expect(saved).toMatchObject({
			targetDate: "2028-02-29",
			targetDateTimezone: "floating-local",
			targetQuestionCount: 20,
			targetNoteCount: null,
		});
		service.close();
	});

	it("rejects pending and new writes until state is reloaded after a reset", async () => {
		const repository = new MemoryStudyRepository();
		const service = new StudyProgressService(repository);
		const sender = new BroadcastChannel("practice-lab-progress");
		await service.initialize(note.certificationId);
		const update = repository.pauseNextUpdate();
		const pending = service.saveReadingPosition(note, "section-two");
		await update.started;

		const nextReset = new Promise<StudyProgressChangeKind>((resolve) => {
			let unsubscribe = () => {};
			unsubscribe = service.onChange((kind) => {
				if (kind !== "reset") return;
				unsubscribe();
				resolve(kind);
			});
		});
		repository.resetCertificationProgress(note.certificationId);
		sender.postMessage({
			type: "progress-changed",
			certificationId: note.certificationId,
			generationToken: `generation:${note.certificationId}:reset`,
		});

		try {
			await expect(nextReset).resolves.toBe("reset");
			update.release();
			await expect(pending).rejects.toBeInstanceOf(ProgressConflictError);
			expect(repository.records).toHaveLength(0);
			await expect(service.setBookmarked(note, true)).rejects.toThrow(
				/Initialize the note certification/,
			);

			await service.initialize(note.certificationId);
			await service.setBookmarked(note, true);
			expect(repository.records).toMatchObject([{ bookmarked: true }]);
		} finally {
			update.release();
			sender.close();
			service.close();
		}
	});

	it("distinguishes quiz updates from study edits and generation-token resets", async () => {
		const repository = new MemoryStudyRepository();
		const service = new StudyProgressService(repository);
		const sender = new BroadcastChannel("practice-lab-progress");
		await service.initialize(note.certificationId);

		const nextChange = (): Promise<StudyProgressChangeKind> =>
			new Promise((resolve) => {
				let unsubscribe = () => {};
				unsubscribe = service.onChange((kind) => {
					unsubscribe();
					resolve(kind);
				});
			});

		try {
			const practice = nextChange();
			sender.postMessage({
				type: "progress-changed",
				certificationId: note.certificationId,
				generationToken: `generation:${note.certificationId}`,
			});
			await expect(practice).resolves.toBe("practice");

			const reset = nextChange();
			sender.postMessage({
				type: "progress-changed",
				certificationId: note.certificationId,
				generationToken: "generation:after-reset",
			});
			await expect(reset).resolves.toBe("reset");

			const study = nextChange();
			sender.postMessage({
				type: "study-progress-changed",
				certificationId: note.certificationId,
			});
			await expect(study).resolves.toBe("study");
		} finally {
			service.close();
			sender.close();
		}
	});
});
