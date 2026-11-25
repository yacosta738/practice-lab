import type {
	FeedbackSubmissionOutcome,
	FeedbackSubmissionPort,
} from "../application/feedback-submission-port";
import type { Feedback } from "../domain/feedback";
import { getFeedbackCategoryMeta } from "../domain/feedback-category";
import type { ExternalWindowOpener } from "./tally-feedback-adapter";

export interface GitHubIssueAdapterOptions {
	/** Repository in "owner/repo" format (e.g. "yacosta738/practice-lab"). */
	readonly repository?: string;
	readonly openExternal?: ExternalWindowOpener;
}

const REPO_PATTERN = /^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/;

function normalizeRepository(raw?: string): string | null {
	const trimmed = raw?.trim();
	if (!trimmed) return null;
	return REPO_PATTERN.test(trimmed) ? trimmed : null;
}

function defaultOpenExternal(url: string): Window | null {
	if (typeof window === "undefined") return null;
	return window.open(url, "_blank", "noopener,noreferrer");
}

function buildIssueTitle(feedback: Feedback): string {
	const categoryMeta = getFeedbackCategoryMeta(feedback.category);
	const scopeParts: string[] = [];
	if (feedback.target.certificationId) {
		scopeParts.push(feedback.target.certificationId.toUpperCase());
	}
	if (feedback.target.questionId) {
		scopeParts.push(feedback.target.questionId);
	} else if (feedback.target.lessonSlug) {
		scopeParts.push(feedback.target.lessonSlug);
	} else {
		scopeParts.push(feedback.target.type);
	}
	return `[Feedback][${scopeParts.join("][")}] ${categoryMeta.label}`;
}

function buildIssueBody(feedback: Feedback): string {
	const metaRows = [
		["Feedback ID", `\`${feedback.id}\``],
		["Schema Version", `\`${feedback.schemaVersion}\``],
		["Target Type", `\`${feedback.target.type}\``],
		feedback.target.certificationId
			? ["Certification", `\`${feedback.target.certificationId}\``]
			: null,
		feedback.target.domainId ? ["Domain", `\`${feedback.target.domainId}\``] : null,
		feedback.target.questionId ? ["Question ID", `\`${feedback.target.questionId}\``] : null,
		feedback.target.lessonSlug ? ["Lesson", `\`${feedback.target.lessonSlug}\``] : null,
		feedback.target.contentVersion
			? ["Content Version", `\`v${feedback.target.contentVersion}\``]
			: null,
		["Category", `\`${feedback.category}\``],
		["App Version", `\`${feedback.appVersion}\``],
		["Locale", `\`${feedback.locale}\``],
		["Page URL", feedback.target.url],
	].filter((row): row is [string, string] => row !== null);

	const metadataTable = [
		"| Field | Value |",
		"| --- | --- |",
		...metaRows.map(([k, v]) => `| ${k} | ${v} |`),
	].join("\n");

	const sections = ["## Feedback Context", metadataTable, "## Description", feedback.description];

	if (feedback.suggestedCorrection) {
		sections.push("## Suggested Correction", feedback.suggestedCorrection);
	}

	if (feedback.referenceUrl) {
		sections.push("## Reference URL", feedback.referenceUrl);
	}

	sections.push(
		"---",
		"_Reminder: Please do not share confidential official exam questions or personal data._",
	);

	return sections.join("\n\n");
}

export function createGitHubIssueAdapter(
	options: GitHubIssueAdapterOptions,
): FeedbackSubmissionPort {
	const repository = normalizeRepository(options.repository);
	const openExternal = options.openExternal ?? defaultOpenExternal;

	function buildUrl(feedback: Feedback): string {
		if (!repository) {
			throw new Error("GitHub Issue feedback adapter is not configured.");
		}
		const categoryMeta = getFeedbackCategoryMeta(feedback.category);
		const labels = ["community-feedback", "needs-triage", categoryMeta.githubLabel].join(",");
		const url = new URL(`https://github.com/${repository}/issues/new`);
		url.searchParams.set("title", buildIssueTitle(feedback));
		url.searchParams.set("labels", labels);
		url.searchParams.set("body", buildIssueBody(feedback));
		return url.toString();
	}

	return {
		channel: "github-issue",

		isAvailable() {
			return repository !== null;
		},

		buildUrl,

		async submit(feedback): Promise<FeedbackSubmissionOutcome> {
			const url = buildUrl(feedback);
			const opened = openExternal(url);
			return {
				status: "opened-external",
				channel: "github-issue",
				url,
				feedbackId: feedback.id,
				popupBlocked: opened === null,
			};
		},
	};
}
