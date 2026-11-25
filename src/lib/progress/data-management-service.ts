import { createProgressRepository } from "./indexeddb-repository";
import { createLearningBackup, type LearningBackup, parseLearningBackup } from "./learning-backup";
import type { LegacyStorageRecord } from "./model";

export class DataManagementService {
	private readonly repository = createProgressRepository();
	private readonly channel?: BroadcastChannel;

	constructor(private readonly certificationIds: readonly string[]) {
		if (typeof BroadcastChannel !== "undefined") {
			this.channel = new BroadcastChannel("practice-lab-progress");
		}
	}

	getSnapshot() {
		return this.repository.getLearningDataSnapshot();
	}

	async createBackup(): Promise<LearningBackup> {
		if (typeof window === "undefined") {
			throw new Error("Data backups are only available in a browser.");
		}
		const snapshot = await this.repository.getLearningDataSnapshot();
		const legacyRecords = readKnownLegacyRecords(this.certificationIds);
		return createLearningBackup(snapshot, legacyRecords, window.location.origin);
	}

	async validateBackup(rawJson: string): Promise<LearningBackup> {
		return parseLearningBackup(rawJson, this.certificationIds);
	}

	async restoreBackup(backup: LearningBackup, expectedFingerprint: string): Promise<void> {
		const tokens = await this.repository.replaceLearningData(
			backup.data,
			this.certificationIds,
			expectedFingerprint,
		);
		this.broadcast(tokens);
	}

	async reset(certificationId: string | null): Promise<void> {
		const tokens = await this.repository.resetLearningData(certificationId, this.certificationIds);
		this.broadcast(tokens);
	}

	markSuccessfulBackup(timestamp: number): Promise<void> {
		return this.repository.markSuccessfulBackup(timestamp);
	}

	async close(): Promise<void> {
		this.channel?.close();
		await this.repository.close();
	}

	private broadcast(tokens: Readonly<Record<string, string>>): void {
		for (const [certificationId, generationToken] of Object.entries(tokens)) {
			this.channel?.postMessage({
				type: "progress-changed",
				certificationId,
				generationToken,
			});
		}
	}
}

function readKnownLegacyRecords(certificationIds: readonly string[]): LegacyStorageRecord[] {
	try {
		return certificationIds.map((certificationId) => {
			const storageKey = `${certificationId}-practice-lab-v2`;
			return {
				certificationId,
				storageKey,
				rawValue: window.localStorage.getItem(storageKey),
			};
		});
	} catch {
		throw new Error(
			"Browser storage is unavailable, so the legacy progress archive could not be included. Restore storage access and try again.",
		);
	}
}
