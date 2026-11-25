export type {
	FeedbackChannel,
	FeedbackDraftStoragePort,
	FeedbackSubmissionOutcome,
	FeedbackSubmissionPort,
} from "./application/feedback-submission-port";
export {
	createFeedbackUseCases,
	type FeedbackUseCases,
	type SubmitFeedbackCommand,
	type SubmitFeedbackDependencies,
	type SubmitFeedbackResult,
} from "./application/submit-feedback";
export {
	type CreateFeedbackInput,
	createFeedback,
	FEEDBACK_SCHEMA_VERSION,
	type Feedback,
	type FeedbackDraft,
	FeedbackValidationError,
	MAX_DESCRIPTION_LENGTH,
	MAX_SUGGESTED_CORRECTION_LENGTH,
	MIN_DESCRIPTION_LENGTH,
} from "./domain/feedback";
export {
	FEEDBACK_CATEGORIES,
	type FeedbackCategory,
	type FeedbackCategoryMeta,
	getCategoriesForTarget,
	getFeedbackCategoryMeta,
	isFeedbackCategory,
} from "./domain/feedback-category";
export {
	buildDraftKey,
	DEFAULT_CONTENT_VERSION,
	type FeedbackTarget,
	type FeedbackTargetType,
	formatTargetReference,
	isFeedbackTargetType,
	normalizeFeedbackTarget,
} from "./domain/feedback-target";
export {
	createGitHubIssueAdapter,
	type GitHubIssueAdapterOptions,
} from "./infrastructure/github-issue-adapter";
export {
	createLocalDraftStorage,
	type LocalDraftStorageOptions,
} from "./infrastructure/local-draft-storage";
export {
	createTallyFeedbackAdapter,
	type ExternalWindowOpener,
	type TallyFeedbackAdapterOptions,
} from "./infrastructure/tally-feedback-adapter";
