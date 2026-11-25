import { type FeedbackCategory, isFeedbackCategory } from "./feedback-category";
import {
	type FeedbackTarget,
	isFeedbackTargetType,
	normalizeFeedbackTarget,
} from "./feedback-target";

export const FEEDBACK_SCHEMA_VERSION = 1;
export const MIN_DESCRIPTION_LENGTH = 10;
export const MAX_DESCRIPTION_LENGTH = 4000;
export const MAX_SUGGESTED_CORRECTION_LENGTH = 2000;

export interface Feedback {
	readonly id: string;
	readonly schemaVersion: number;
	readonly target: FeedbackTarget;
	readonly category: FeedbackCategory;
	readonly description: string;
	readonly suggestedCorrection?: string;
	readonly referenceUrl?: string;
	readonly locale: string;
	readonly appVersion: string;
	readonly createdAt: string;
}

export interface FeedbackDraft {
	readonly category: FeedbackCategory;
	readonly description: string;
	readonly suggestedCorrection?: string;
	readonly referenceUrl?: string;
	readonly updatedAt: string;
}

export interface CreateFeedbackInput {
	readonly id?: string;
	readonly target: FeedbackTarget;
	readonly category: string;
	readonly description: string;
	readonly suggestedCorrection?: string;
	readonly referenceUrl?: string;
	readonly locale?: string;
	readonly appVersion: string;
	readonly createdAt?: string;
}

export class FeedbackValidationError extends Error {
	readonly field: string;

	constructor(field: string, message: string) {
		super(message);
		this.name = "FeedbackValidationError";
		this.field = field;
	}
}

function generateFeedbackId(): string {
	if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
		return crypto.randomUUID();
	}
	return `fb-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

function validateHttpUrl(raw: string, field: string): string {
	const trimmed = raw.trim();
	let parsed: URL;
	try {
		parsed = new URL(trimmed);
	} catch {
		throw new FeedbackValidationError(field, "Please enter a valid http(s) URL.");
	}
	if (parsed.protocol !== "https:" && parsed.protocol !== "http:") {
		throw new FeedbackValidationError(field, "URL must start with http:// or https://.");
	}
	return parsed.toString();
}

export function createFeedback(input: CreateFeedbackInput): Feedback {
	if (!input.target || !isFeedbackTargetType(input.target.type)) {
		throw new FeedbackValidationError("target", "A valid feedback target type is required.");
	}
	const target = normalizeFeedbackTarget(input.target);
	if (!target.url) {
		throw new FeedbackValidationError("target.url", "Target page URL is required.");
	}
	if (target.type === "question" && !target.questionId) {
		throw new FeedbackValidationError(
			"target.questionId",
			"Question feedback requires a stable question identifier.",
		);
	}

	if (!isFeedbackCategory(input.category)) {
		throw new FeedbackValidationError("category", "Please select a valid feedback category.");
	}

	const description = input.description.trim();
	if (description.length < MIN_DESCRIPTION_LENGTH) {
		throw new FeedbackValidationError(
			"description",
			`Please describe the issue in at least ${MIN_DESCRIPTION_LENGTH} characters.`,
		);
	}
	if (description.length > MAX_DESCRIPTION_LENGTH) {
		throw new FeedbackValidationError(
			"description",
			`Description must be ${MAX_DESCRIPTION_LENGTH} characters or fewer.`,
		);
	}

	const suggestedCorrection = input.suggestedCorrection?.trim() || undefined;
	if (suggestedCorrection && suggestedCorrection.length > MAX_SUGGESTED_CORRECTION_LENGTH) {
		throw new FeedbackValidationError(
			"suggestedCorrection",
			`Suggested correction must be ${MAX_SUGGESTED_CORRECTION_LENGTH} characters or fewer.`,
		);
	}

	const rawReferenceUrl = input.referenceUrl?.trim();
	const referenceUrl = rawReferenceUrl
		? validateHttpUrl(rawReferenceUrl, "referenceUrl")
		: undefined;

	const locale = input.locale?.trim() || "en";
	const appVersion = input.appVersion.trim() || "0.0.0";
	const createdAt = input.createdAt?.trim() || new Date().toISOString();

	return Object.freeze({
		id: input.id?.trim() || generateFeedbackId(),
		schemaVersion: FEEDBACK_SCHEMA_VERSION,
		target: Object.freeze(target),
		category: input.category,
		description,
		...(suggestedCorrection ? { suggestedCorrection } : {}),
		...(referenceUrl ? { referenceUrl } : {}),
		locale,
		appVersion,
		createdAt,
	});
}
