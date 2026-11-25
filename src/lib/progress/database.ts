import { type IDBPDatabase, type IDBPTransaction, openDB } from "idb";
import { ProgressStorageError, toProgressStorageError } from "./errors";
import {
	PROGRESS_DATABASE_NAME,
	PROGRESS_DATABASE_VERSION,
	type ProgressDatabaseSchema,
	type ProgressStoreName,
} from "./schema";

export type ProgressDatabase = IDBPDatabase<ProgressDatabaseSchema>;

export async function openProgressDatabase(onVersionChange: () => void): Promise<ProgressDatabase> {
	try {
		if (!globalThis.indexedDB) {
			throw new ProgressStorageError(
				"unavailable",
				"IndexedDB is unavailable in this browser context; no alternate progress store was used.",
			);
		}
		let blockedError: ProgressStorageError | undefined;
		let rejectWhenBlocked: (error: ProgressStorageError) => void = () => undefined;
		let database: ProgressDatabase | undefined;

		const blocked = new Promise<never>((_resolve, reject) => {
			rejectWhenBlocked = reject;
		});
		const opening = openDB<ProgressDatabaseSchema>(
			PROGRESS_DATABASE_NAME,
			PROGRESS_DATABASE_VERSION,
			{
				upgrade(db, oldVersion, _newVersion, transaction) {
					upgradeSchema(db, oldVersion, transaction);
				},
				blocked(currentVersion, blockedVersion) {
					blockedError = new ProgressStorageError(
						"blocked",
						`IndexedDB upgrade from version ${currentVersion} to ${blockedVersion ?? "unknown"} is blocked by another open connection.`,
					);
					rejectWhenBlocked(blockedError);
				},
				blocking() {
					database?.close();
					onVersionChange();
				},
				terminated() {
					database?.close();
					onVersionChange();
				},
			},
		).then((openedDatabase) => {
			database = openedDatabase;
			if (blockedError) {
				openedDatabase.close();
				throw blockedError;
			}
			return openedDatabase;
		});

		return await Promise.race([opening, blocked]);
	} catch (error) {
		throw toProgressStorageError(error, "open");
	}
}

function upgradeSchema(
	db: ProgressDatabase,
	oldVersion: number,
	transaction: IDBPTransaction<ProgressDatabaseSchema, ProgressStoreName[], "versionchange">,
): void {
	if (oldVersion < 1) {
		const sessions = db.createObjectStore("sessions", { keyPath: "id" });
		sessions.createIndex("by-certification", "certificationId");
		sessions.createIndex("by-status", "status");
		sessions.createIndex("by-started-at", "startedAt");
		sessions.createIndex("by-finished-at", "finishedAt");

		const attempts = db.createObjectStore("questionAttempts", {
			keyPath: ["sessionId", "questionId"],
		});
		attempts.createIndex("by-certification", "certificationId");
		attempts.createIndex("by-domain", "domainId");
		attempts.createIndex("by-evaluated-at", "evaluatedAt");

		const questionProgress = db.createObjectStore("questionProgress", {
			keyPath: ["certificationId", "questionId"],
		});
		questionProgress.createIndex("by-certification", "certificationId");

		const studyProgress = db.createObjectStore("studyProgress", {
			keyPath: ["certificationId", "noteId"],
		});
		studyProgress.createIndex("by-certification", "certificationId");

		db.createObjectStore("learningGoals", { keyPath: "certificationId" });
		db.createObjectStore("metadata", { keyPath: "key" });

		const metadata = transaction.objectStore("metadata");
		writeUpgradeMetadata(
			metadata.put({
				key: "schema-version",
				value: { version: PROGRESS_DATABASE_VERSION },
			}),
		);
		writeUpgradeMetadata(
			metadata.put({
				key: "migration:0-1",
				value: { fromVersion: oldVersion, toVersion: 1, completedAt: Date.now() },
			}),
		);
		writeUpgradeMetadata(
			metadata.put({
				key: "data-generation-token",
				value: globalThis.crypto.randomUUID(),
			}),
		);
	}
}

function writeUpgradeMetadata(request: Promise<IDBValidKey>): void {
	void request.catch(() => undefined);
}
