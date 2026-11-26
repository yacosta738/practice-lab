import type { Feedback, FeedbackDraft } from "../domain/feedback";

export type FeedbackChannel = "tally" | "github-issue";

export type FeedbackSubmissionOutcome =
	| {
			readonly status: "opened-external";
			readonly channel: FeedbackChannel;
			readonly url: string;
			readonly feedbackId: string;
			readonly popupBlocked: boolean;
	  }
	| {
			readonly status: "submitted";
			readonly channel: FeedbackChannel;
			readonly feedbackId: string;
	  };

export interface FeedbackSubmissionPort {
	readonly channel: FeedbackChannel;

	isAvailable(): boolean;

	buildUrl(feedback: Feedback): string;

	submit(feedback: Feedback): Promise<FeedbackSubmissionOutcome>;
}

export interface FeedbackDraftStoragePort {
	load(key: string): FeedbackDraft | null;

	save(key: string, draft: FeedbackDraft): void;

	clear(key: string): void;
}
