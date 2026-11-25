import { describe, expect, it, vi } from "vitest";
import {
	createFeedback,
	createFeedbackUseCases,
	createGitHubIssueAdapter,
	createLocalDraftStorage,
	createTallyFeedbackAdapter,
} from "../../src/lib/feedback";

function sampleFeedback() {
	return createFeedback({
		id: "fb-test-123",
		target: {
			type: "question",
			certificationId: "ccdv-f",
			domainId: "D2",
			questionId: "D2-012",
			contentVersion: "3",
			url: "https://yacosta738.github.io/practice-lab/certifications/ccdv-f/",
		},
		category: "incorrect-explanation",
		description: "The explanation references an older batch limit instead of the current value.",
		suggestedCorrection: "Update the explanation to cite the current Message Batches API docs.",
		referenceUrl: "https://docs.anthropic.com/en/docs/build-with-claude/batch-processing",
		locale: "en",
		appVersion: "0.7.0",
		createdAt: "2026-11-25T20:00:00.000Z",
	});
}

function createMemoryStorage() {
	const map = new Map<string, string>();
	return {
		getItem: (key: string) => map.get(key) ?? null,
		setItem: (key: string, value: string) => {
			map.set(key, value);
		},
		removeItem: (key: string) => {
			map.delete(key);
		},
	};
}

describe("Tally feedback adapter", () => {
	it("accepts a bare Tally form ID or https://tally.so URL and rejects untrusted hosts", () => {
		expect(createTallyFeedbackAdapter({ formUrl: "w7xyz1" }).isAvailable()).toBe(true);
		expect(createTallyFeedbackAdapter({ formUrl: "https://tally.so/r/w7xyz1" }).isAvailable()).toBe(
			true,
		);
		expect(createTallyFeedbackAdapter({ formUrl: "" }).isAvailable()).toBe(false);
		expect(
			createTallyFeedbackAdapter({ formUrl: "https://evil.example/r/w7xyz1" }).isAvailable(),
		).toBe(false);
		expect(createTallyFeedbackAdapter({ formUrl: "http://tally.so/r/w7xyz1" }).isAvailable()).toBe(
			false,
		);
	});

	it("builds a pre-filled Tally URL and distinguishes opening externally from submission", async () => {
		const openExternal = vi.fn(() => ({}) as Window);
		const adapter = createTallyFeedbackAdapter({
			formUrl: "w7xyz1",
			openExternal,
		});
		const feedback = sampleFeedback();

		const outcome = await adapter.submit(feedback);
		expect(outcome.status).toBe("opened-external");
		if (outcome.status === "opened-external") {
			expect(outcome.channel).toBe("tally");
			expect(outcome.popupBlocked).toBe(false);
			expect(outcome.feedbackId).toBe("fb-test-123");

			const parsed = new URL(outcome.url);
			expect(parsed.origin).toBe("https://tally.so");
			expect(parsed.pathname).toBe("/r/w7xyz1");
			expect(parsed.searchParams.get("questionId")).toBe("D2-012");
			expect(parsed.searchParams.get("contentVersion")).toBe("3");
			expect(parsed.searchParams.get("category")).toBe("incorrect-explanation");
			expect(parsed.searchParams.get("appVersion")).toBe("0.7.0");
		}
		expect(openExternal).toHaveBeenCalledOnce();
	});
});

describe("GitHub Issue feedback adapter", () => {
	it("builds a pre-filled GitHub Issue URL with labels, metadata table, and confidentiality note", async () => {
		const openExternal = vi.fn(() => null);
		const adapter = createGitHubIssueAdapter({
			repository: "yacosta738/practice-lab",
			openExternal,
		});
		const feedback = sampleFeedback();

		const outcome = await adapter.submit(feedback);
		expect(outcome.status).toBe("opened-external");
		if (outcome.status === "opened-external") {
			expect(outcome.channel).toBe("github-issue");
			expect(outcome.popupBlocked).toBe(true);

			const parsed = new URL(outcome.url);
			expect(parsed.origin).toBe("https://github.com");
			expect(parsed.pathname).toBe("/yacosta738/practice-lab/issues/new");
			expect(parsed.searchParams.get("title")).toBe(
				"[Feedback][CCDV-F][D2-012] Incorrect or unclear explanation",
			);
			expect(parsed.searchParams.get("labels")).toBe(
				"community-feedback,needs-triage,incorrect-explanation",
			);
			const body = parsed.searchParams.get("body") ?? "";
			expect(body).toContain("`fb-test-123`");
			expect(body).toContain("`D2-012`");
			expect(body).toContain("`v3`");
			expect(body).toContain("confidential official exam questions");
		}
	});
});

describe("feedback use cases and local draft storage", () => {
	it("falls back to GitHub Issues when Tally is unconfigured and preserves draft on external handoff", async () => {
		const storage = createMemoryStorage();
		const draftStorage = createLocalDraftStorage({ storage });
		const openExternal = vi.fn(() => ({}) as Window);

		const useCases = createFeedbackUseCases({
			adapters: [
				createTallyFeedbackAdapter({ formUrl: "", openExternal }),
				createGitHubIssueAdapter({ repository: "yacosta738/practice-lab", openExternal }),
			],
			draftStorage,
		});

		expect(useCases.getAvailableChannels()).toEqual(["github-issue"]);
		expect(useCases.getPrimaryChannel()).toBe("github-issue");

		const target = {
			type: "question" as const,
			certificationId: "ccdv-f",
			domainId: "D1",
			questionId: "D1-001",
			url: "https://example.com/practice-lab/certifications/ccdv-f/",
		};

		useCases.saveDraft(target, {
			category: "ambiguous-question",
			description: "Draft description for D1-001.",
			updatedAt: "2026-11-25T20:00:00.000Z",
		});
		expect(useCases.loadDraft(target)?.description).toBe("Draft description for D1-001.");

		const { outcome } = await useCases.submit({
			target,
			category: "ambiguous-question",
			description: "Draft description for D1-001.",
			appVersion: "0.7.0",
		});
		expect(outcome.status).toBe("opened-external");
		expect(outcome.channel).toBe("github-issue");
		// Draft stays until user confirms completion after external handoff
		expect(useCases.loadDraft(target)?.description).toBe("Draft description for D1-001.");

		useCases.clearDraft(target);
		expect(useCases.loadDraft(target)).toBeNull();
	});

	it("prefers Tally when configured and allows explicit override to GitHub Issues", async () => {
		const openExternal = vi.fn(() => ({}) as Window);
		const useCases = createFeedbackUseCases({
			adapters: [
				createTallyFeedbackAdapter({ formUrl: "w7xyz1", openExternal }),
				createGitHubIssueAdapter({ repository: "yacosta738/practice-lab", openExternal }),
			],
		});

		expect(useCases.getPrimaryChannel()).toBe("tally");

		const target = {
			type: "application" as const,
			url: "https://example.com/practice-lab/",
		};

		const defaultResult = await useCases.submit({
			target,
			category: "improvement",
			description: "Please add keyboard shortcuts help in the study section.",
			appVersion: "0.7.0",
		});
		expect(defaultResult.outcome.channel).toBe("tally");

		const explicitResult = await useCases.submit({
			target,
			category: "improvement",
			description: "Please add keyboard shortcuts help in the study section.",
			appVersion: "0.7.0",
			preferredChannel: "github-issue",
		});
		expect(explicitResult.outcome.channel).toBe("github-issue");
	});
});
