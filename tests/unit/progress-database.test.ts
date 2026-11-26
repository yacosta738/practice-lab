import "fake-indexeddb/auto";
import { deleteDB } from "idb";
import { afterEach, describe, expect, it, vi } from "vitest";
import { openProgressDatabase } from "../../src/lib/progress/database";
import { PROGRESS_DATABASE_NAME } from "../../src/lib/progress/schema";

describe("progress database opening", () => {
	afterEach(() => {
		vi.restoreAllMocks();
	});

	it("classifies IndexedDB open failures while the blocked-open promise is pending", async () => {
		const denied = new DOMException("IndexedDB access was denied.", "SecurityError");
		vi.spyOn(indexedDB, "open").mockImplementation(() => {
			throw denied;
		});

		await expect(openProgressDatabase(() => undefined)).rejects.toMatchObject({
			name: "ProgressStorageError",
			code: "access-denied",
			cause: denied,
		});
	});

	it("migrates completed notes and timestamped goals without guessing a local date", async () => {
		await deleteDB(PROGRESS_DATABASE_NAME);
		const legacy = await new Promise<IDBDatabase>((resolve, reject) => {
			const request = indexedDB.open(PROGRESS_DATABASE_NAME, 3);
			request.onupgradeneeded = () => {
				const database = request.result;
				const studyProgress = database.createObjectStore("studyProgress", {
					keyPath: ["certificationId", "noteId"],
				});
				studyProgress.createIndex("by-certification", "certificationId");
				database.createObjectStore("learningGoals", { keyPath: "certificationId" });
				database.createObjectStore("metadata", { keyPath: "key" });
			};
			request.onsuccess = () => resolve(request.result);
			request.onerror = () => reject(request.error);
		});
		const transaction = legacy.transaction(["studyProgress", "learningGoals"], "readwrite");
		transaction.objectStore("studyProgress").put({
			certificationId: "ccdv-f",
			noteId: "ccdv-f/old-note",
			completed: true,
			completedAt: 100,
			bookmarked: true,
			updatedAt: 100,
		});
		transaction.objectStore("learningGoals").put({
			certificationId: "ccdv-f",
			dailyQuestionTarget: 5,
			targetDate: 1_800_000_000_000,
			updatedAt: 100,
		});
		await new Promise<void>((resolve, reject) => {
			transaction.oncomplete = () => resolve();
			transaction.onerror = () => reject(transaction.error);
			transaction.onabort = () => reject(transaction.error);
		});
		legacy.close();

		const database = await openProgressDatabase(() => undefined);
		try {
			const studyProgress = await database.getAll("studyProgress");
			const goal = await database.get("learningGoals", "ccdv-f");
			expect(studyProgress).toHaveLength(1);
			expect(studyProgress[0]).toMatchObject({
				status: "completed",
				completedAt: 100,
				bookmarked: true,
			});
			expect(studyProgress[0]).not.toHaveProperty("completed");
			expect(goal).toMatchObject({
				targetDate: null,
				targetDateTimezone: "floating-local",
				legacyTargetDate: 1_800_000_000_000,
				targetQuestionCount: null,
				targetNoteCount: null,
			});
			expect(await database.get("metadata", "migration:3-4")).toMatchObject({
				key: "migration:3-4",
			});
		} finally {
			database.close();
			await deleteDB(PROGRESS_DATABASE_NAME);
		}
	});
});
