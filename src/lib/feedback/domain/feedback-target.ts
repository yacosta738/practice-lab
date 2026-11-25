export type FeedbackTargetType = "question" | "lesson" | "application";

export interface FeedbackTarget {
	readonly type: FeedbackTargetType;
	readonly certificationId?: string;
	readonly domainId?: string;
	readonly questionId?: string;
	readonly lessonSlug?: string;
	readonly contentVersion?: string;
	readonly url: string;
}

export const DEFAULT_CONTENT_VERSION = "1";

const VALID_TARGET_TYPES = new Set<FeedbackTargetType>(["question", "lesson", "application"]);

export function isFeedbackTargetType(value: string): value is FeedbackTargetType {
	return VALID_TARGET_TYPES.has(value as FeedbackTargetType);
}

export function normalizeFeedbackTarget(target: FeedbackTarget): FeedbackTarget {
	const certificationId = target.certificationId?.trim() || undefined;
	const domainId = target.domainId?.trim() || undefined;
	const questionId = target.questionId?.trim() || undefined;
	const lessonSlug = target.lessonSlug?.trim() || undefined;
	const contentVersion =
		target.contentVersion?.trim() ||
		(target.type === "question" ? DEFAULT_CONTENT_VERSION : undefined);

	return {
		type: target.type,
		...(certificationId ? { certificationId } : {}),
		...(domainId ? { domainId } : {}),
		...(questionId ? { questionId } : {}),
		...(lessonSlug ? { lessonSlug } : {}),
		...(contentVersion ? { contentVersion } : {}),
		url: target.url.trim(),
	};
}

export function buildDraftKey(target: FeedbackTarget): string {
	if (target.type === "question") {
		return `question:${target.certificationId ?? "unknown"}:${target.questionId ?? "unknown"}`;
	}
	if (target.type === "lesson") {
		return `lesson:${target.certificationId ?? "unknown"}:${target.lessonSlug ?? target.url}`;
	}
	return "application:global";
}

export function formatTargetReference(target: FeedbackTarget): string {
	if (target.type === "question") {
		const parts = [
			target.certificationId?.toUpperCase(),
			target.questionId,
			target.domainId ? `(${target.domainId})` : undefined,
			target.contentVersion ? `v${target.contentVersion}` : undefined,
		].filter(Boolean);
		return parts.length ? `Question · ${parts.join(" · ")}` : "Question";
	}
	if (target.type === "lesson") {
		const parts = [
			target.certificationId?.toUpperCase(),
			target.domainId,
			target.lessonSlug,
		].filter(Boolean);
		return parts.length ? `Study note · ${parts.join(" · ")}` : "Study note";
	}
	return "Practice Lab · Application";
}
