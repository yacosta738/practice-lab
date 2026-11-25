import { describe, expect, it } from "vitest";
import {
	buildDraftKey,
	createFeedback,
	DEFAULT_CONTENT_VERSION,
	FEEDBACK_SCHEMA_VERSION,
	FeedbackValidationError,
	formatTargetReference,
	getCategoriesForTarget,
} from "../../src/lib/feedback";

describe("feedback domain", () => {
	it("creates a frozen, normalized question feedback record with default contentVersion", () => {
		const feedback = createFeedback({
			target: {
				type: "question",
				certificationId: "ccdv-f",
				domainId: "D1",
				questionId: "D1-001",
				url: "https://yacosta738.github.io/practice-lab/certifications/ccdv-f/",
			},
			category: "incorrect-answer",
			description: "  Option B contradicts the official Messages API documentation.  ",
			suggestedCorrection: "  Mark option A as correct.  ",
			referenceUrl: "https://docs.anthropic.com/en/api/messages",
			locale: "en-US",
			appVersion: "0.7.0",
			createdAt: "2026-11-25T20:00:00.000Z",
		});

		expect(feedback.schemaVersion).toBe(FEEDBACK_SCHEMA_VERSION);
		expect(feedback.id.length).toBeGreaterThan(0);
		expect(feedback.target.contentVersion).toBe(DEFAULT_CONTENT_VERSION);
		expect(feedback.description).toBe(
			"Option B contradicts the official Messages API documentation.",
		);
		expect(feedback.suggestedCorrection).toBe("Mark option A as correct.");
		expect(feedback.referenceUrl).toBe("https://docs.anthropic.com/en/api/messages");
		expect(Object.isFrozen(feedback)).toBe(true);
		expect(Object.isFrozen(feedback.target)).toBe(true);
	});

	it("rejects question feedback without a stable questionId", () => {
		expect(() =>
			createFeedback({
				target: {
					type: "question",
					certificationId: "ccdv-f",
					url: "https://example.com/certifications/ccdv-f/",
				},
				category: "incorrect-answer",
				description: "Missing question identifier should fail validation.",
				appVersion: "0.7.0",
			}),
		).toThrow(FeedbackValidationError);
	});

	it("rejects short descriptions, unknown categories, and non-http reference URLs", () => {
		const baseTarget = {
			type: "application" as const,
			url: "https://example.com/practice-lab/",
		};

		expect(() =>
			createFeedback({
				target: baseTarget,
				category: "improvement",
				description: "Too short",
				appVersion: "0.7.0",
			}),
		).toThrow(FeedbackValidationError);

		expect(() =>
			createFeedback({
				target: baseTarget,
				category: "not-a-category",
				description: "This description is long enough to pass length validation.",
				appVersion: "0.7.0",
			}),
		).toThrow(FeedbackValidationError);

		expect(() =>
			createFeedback({
				target: baseTarget,
				category: "improvement",
				description: "This description is long enough to pass length validation.",
				referenceUrl: "javascript:alert(1)",
				appVersion: "0.7.0",
			}),
		).toThrow(FeedbackValidationError);
	});

	it("filters categories by target type and formats human-readable references", () => {
		const questionCategories = getCategoriesForTarget("question").map((c) => c.id);
		const appCategories = getCategoriesForTarget("application").map((c) => c.id);

		expect(questionCategories).toContain("incorrect-answer");
		expect(questionCategories).toContain("incorrect-explanation");
		expect(appCategories).not.toContain("incorrect-answer");
		expect(appCategories).toContain("improvement");

		const questionTarget = {
			type: "question" as const,
			certificationId: "ccdv-f",
			domainId: "D2",
			questionId: "D2-012",
			contentVersion: "3",
			url: "https://example.com",
		};
		expect(formatTargetReference(questionTarget)).toBe("Question · CCDV-F · D2-012 · (D2) · v3");
		expect(buildDraftKey(questionTarget)).toBe("question:ccdv-f:D2-012");
	});
});
