import {
	type CreateFeedbackInput,
	createFeedback,
	type Feedback,
	type FeedbackDraft,
} from "../domain/feedback";
import { buildDraftKey, type FeedbackTarget } from "../domain/feedback-target";
import type {
	FeedbackChannel,
	FeedbackDraftStoragePort,
	FeedbackSubmissionOutcome,
	FeedbackSubmissionPort,
} from "./feedback-submission-port";

export interface SubmitFeedbackDependencies {
	readonly adapters: readonly FeedbackSubmissionPort[];
	readonly draftStorage?: FeedbackDraftStoragePort;
}

export interface SubmitFeedbackCommand extends CreateFeedbackInput {
	readonly preferredChannel?: FeedbackChannel;
}

export interface SubmitFeedbackResult {
	readonly feedback: Feedback;
	readonly outcome: FeedbackSubmissionOutcome;
}

export interface FeedbackUseCases {
	getAvailableChannels(): readonly FeedbackChannel[];

	getPrimaryChannel(): FeedbackChannel | null;

	submit(command: SubmitFeedbackCommand): Promise<SubmitFeedbackResult>;

	loadDraft(target: FeedbackTarget): FeedbackDraft | null;

	saveDraft(target: FeedbackTarget, draft: FeedbackDraft): void;

	clearDraft(target: FeedbackTarget): void;
}

export function createFeedbackUseCases(deps: SubmitFeedbackDependencies): FeedbackUseCases {
	const adapterByChannel = new Map<FeedbackChannel, FeedbackSubmissionPort>(
		deps.adapters.map((adapter) => [adapter.channel, adapter]),
	);

	function getAvailableAdapters(): FeedbackSubmissionPort[] {
		return deps.adapters.filter((adapter) => adapter.isAvailable());
	}

	function resolveAdapter(preferredChannel?: FeedbackChannel): FeedbackSubmissionPort {
		if (preferredChannel) {
			const preferred = adapterByChannel.get(preferredChannel);
			if (preferred?.isAvailable()) return preferred;
		}
		const available = getAvailableAdapters();
		if (available.length === 0) {
			throw new Error("No feedback submission channel is configured.");
		}
		return available[0];
	}

	return {
		getAvailableChannels() {
			return getAvailableAdapters().map((adapter) => adapter.channel);
		},

		getPrimaryChannel() {
			return getAvailableAdapters()[0]?.channel ?? null;
		},

		async submit(command) {
			const feedback = createFeedback(command);
			const adapter = resolveAdapter(command.preferredChannel);
			const outcome = await adapter.submit(feedback);
			if (outcome.status === "submitted") {
				deps.draftStorage?.clear(buildDraftKey(feedback.target));
			}
			return { feedback, outcome };
		},

		loadDraft(target) {
			return deps.draftStorage?.load(buildDraftKey(target)) ?? null;
		},

		saveDraft(target, draft) {
			deps.draftStorage?.save(buildDraftKey(target), draft);
		},

		clearDraft(target) {
			deps.draftStorage?.clear(buildDraftKey(target));
		},
	};
}
