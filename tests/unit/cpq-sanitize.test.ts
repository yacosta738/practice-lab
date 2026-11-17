import { describe, expect, it } from "vitest";
import { sanitizeOptionText, sanitizeWhyNot } from "../../scripts/lib/cpq-sanitize.mjs";

// ---------------------------------------------------------------------------
// sanitizeWhyNot
// ---------------------------------------------------------------------------

describe("sanitizeWhyNot", () => {
	it("keeps a whyNot that has no boundary marker", () => {
		const whyNot = "A is wrong because… B is wrong because…";
		expect(sanitizeWhyNot(whyNot)).toBe(whyNot);
	});

	it("stops at the next question embedded in the source text", () => {
		// The source bank appends the following question (and its answer) to
		// the whyNot of the previous one.
		const whyNot =
			"A is a scaling concern; D is prestige, not an architectural driver. 1.11 — 1 → single augmented LLM call; 2 → fixed workflow";
		expect(sanitizeWhyNot(whyNot)).toBe(
			"A is a scaling concern; D is prestige, not an architectural driver.",
		);
	});

	it("stops at the next domain heading embedded in the source text", () => {
		const whyNot =
			"C makes token selection deterministic without making the policy binding. ## Domain 6: Prompt and Context Engineering";
		expect(sanitizeWhyNot(whyNot)).toBe(
			"C makes token selection deterministic without making the policy binding.",
		);
	});

	it("keeps the earliest boundary when both markers are present", () => {
		const whyNot = "Reason. 2.3 — 1 → something. Domain 3: Other Domain";
		expect(sanitizeWhyNot(whyNot)).toBe("Reason.");
	});

	it("handles empty and non-string values", () => {
		expect(sanitizeWhyNot("")).toBe("");
		expect(sanitizeWhyNot(undefined)).toBeUndefined();
	});
});

// ---------------------------------------------------------------------------
// sanitizeOptionText
// ---------------------------------------------------------------------------

describe("sanitizeOptionText", () => {
	it("keeps an option that has no scenario boundary", () => {
		const text = "Add the limit to the process_refund tool description";
		expect(sanitizeOptionText(text)).toBe(text);
	});

	it("stops at the next scenario introduction embedded in the option", () => {
		const text =
			"Delegate verbose investigation to subagents that return summaries, keeping the main session’s context for coordination Scenario 3: Multi-Agent Research System A coordinator agent built on the Claude Agent SDK";
		expect(sanitizeOptionText(text)).toBe(
			"Delegate verbose investigation to subagents that return summaries, keeping the main session’s context for coordination",
		);
	});

	it("keeps a legitimate scenario reference that is not an introduction", () => {
		const text = "Retry the request described in Scenario 2 after the timeout";
		expect(sanitizeOptionText(text)).toBe(text);
	});

	it("keeps a scenario mention followed by lowercase text", () => {
		const text = "Handle Scenario 2: the agent retries once";
		expect(sanitizeOptionText(text)).toBe(text);
	});
});
