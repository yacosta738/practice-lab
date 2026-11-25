import type { FeedbackDraftStoragePort } from "../application/feedback-submission-port";
import { isFeedbackCategory } from "../domain/feedback-category";

const DEFAULT_PREFIX = "practice-lab:feedback-draft:";

export interface LocalDraftStorageOptions {
	readonly storage?: Pick<Storage, "getItem" | "setItem" | "removeItem"> | null;
	readonly prefix?: string;
}

function getDefaultStorage(): Pick<Storage, "getItem" | "setItem" | "removeItem"> | null {
	try {
		return typeof window !== "undefined" && window.localStorage ? window.localStorage : null;
	} catch {
		return null;
	}
}

export function createLocalDraftStorage(
	options: LocalDraftStorageOptions = {},
): FeedbackDraftStoragePort {
	const storage = options.storage !== undefined ? options.storage : getDefaultStorage();
	const prefix = options.prefix ?? DEFAULT_PREFIX;

	return {
		load(key) {
			if (!storage) return null;
			try {
				const raw = storage.getItem(`${prefix}${key}`);
				if (!raw) return null;
				const parsed = JSON.parse(raw) as Record<string, unknown>;
				if (
					!parsed ||
					typeof parsed !== "object" ||
					typeof parsed.category !== "string" ||
					!isFeedbackCategory(parsed.category) ||
					typeof parsed.description !== "string"
				) {
					return null;
				}
				return {
					category: parsed.category,
					description: parsed.description,
					...(typeof parsed.suggestedCorrection === "string" && parsed.suggestedCorrection
						? { suggestedCorrection: parsed.suggestedCorrection }
						: {}),
					...(typeof parsed.referenceUrl === "string" && parsed.referenceUrl
						? { referenceUrl: parsed.referenceUrl }
						: {}),
					updatedAt:
						typeof parsed.updatedAt === "string" ? parsed.updatedAt : new Date().toISOString(),
				};
			} catch {
				return null;
			}
		},

		save(key, draft) {
			if (!storage) return;
			try {
				storage.setItem(`${prefix}${key}`, JSON.stringify(draft));
			} catch {
				// Ignore quota or storage-access failures; drafts are best-effort.
			}
		},

		clear(key) {
			if (!storage) return;
			try {
				storage.removeItem(`${prefix}${key}`);
			} catch {
				// Ignore storage-access failures.
			}
		},
	};
}
