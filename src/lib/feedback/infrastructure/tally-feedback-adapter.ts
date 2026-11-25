import type {
	FeedbackSubmissionOutcome,
	FeedbackSubmissionPort,
} from "../application/feedback-submission-port";
import type { Feedback } from "../domain/feedback";

export type ExternalWindowOpener = (url: string) => Window | null;

export interface TallyFeedbackAdapterOptions {
	/**
	 * Either a full Tally form URL (e.g. "https://tally.so/r/w7xyz1")
	 * or a bare Tally form ID (e.g. "w7xyz1").
	 */
	readonly formUrl?: string;
	readonly openExternal?: ExternalWindowOpener;
}

const TALLY_FORM_ID_PATTERN = /^[A-Za-z0-9_-]{4,32}$/;

function normalizeTallyUrl(raw?: string): URL | null {
	const trimmed = raw?.trim();
	if (!trimmed) return null;

	if (TALLY_FORM_ID_PATTERN.test(trimmed)) {
		return new URL(`https://tally.so/r/${trimmed}`);
	}

	try {
		const parsed = new URL(trimmed);
		const isAllowedHost = parsed.hostname === "tally.so" || parsed.hostname.endsWith(".tally.so");
		if (parsed.protocol !== "https:" || !isAllowedHost) return null;
		return parsed;
	} catch {
		return null;
	}
}

function defaultOpenExternal(url: string): Window | null {
	if (typeof window === "undefined") return null;
	return window.open(url, "_blank", "noopener,noreferrer");
}

function appendIfPresent(params: URLSearchParams, key: string, value?: string | number): void {
	if (value === undefined) return;
	const text = String(value).trim();
	if (text.length > 0) params.set(key, text);
}

export function createTallyFeedbackAdapter(
	options: TallyFeedbackAdapterOptions,
): FeedbackSubmissionPort {
	const baseUrl = normalizeTallyUrl(options.formUrl);
	const openExternal = options.openExternal ?? defaultOpenExternal;

	function buildUrl(feedback: Feedback): string {
		if (!baseUrl) {
			throw new Error("Tally feedback adapter is not configured.");
		}
		const url = new URL(baseUrl.toString());
		appendIfPresent(url.searchParams, "feedbackId", feedback.id);
		appendIfPresent(url.searchParams, "schemaVersion", feedback.schemaVersion);
		appendIfPresent(url.searchParams, "targetType", feedback.target.type);
		appendIfPresent(url.searchParams, "certificationId", feedback.target.certificationId);
		appendIfPresent(url.searchParams, "domainId", feedback.target.domainId);
		appendIfPresent(url.searchParams, "questionId", feedback.target.questionId);
		appendIfPresent(url.searchParams, "lessonSlug", feedback.target.lessonSlug);
		appendIfPresent(url.searchParams, "contentVersion", feedback.target.contentVersion);
		appendIfPresent(url.searchParams, "pageUrl", feedback.target.url);
		appendIfPresent(url.searchParams, "category", feedback.category);
		appendIfPresent(url.searchParams, "description", feedback.description);
		appendIfPresent(url.searchParams, "suggestedCorrection", feedback.suggestedCorrection);
		appendIfPresent(url.searchParams, "referenceUrl", feedback.referenceUrl);
		appendIfPresent(url.searchParams, "locale", feedback.locale);
		appendIfPresent(url.searchParams, "appVersion", feedback.appVersion);
		return url.toString();
	}

	return {
		channel: "tally",

		isAvailable() {
			return baseUrl !== null;
		},

		buildUrl,

		async submit(feedback): Promise<FeedbackSubmissionOutcome> {
			const url = buildUrl(feedback);
			const opened = openExternal(url);
			return {
				status: "opened-external",
				channel: "tally",
				url,
				feedbackId: feedback.id,
				popupBlocked: opened === null,
			};
		},
	};
}
