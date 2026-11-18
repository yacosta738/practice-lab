import { describe, expect, it } from "vitest";
import { OPTION_SHORTCUT_KEYS } from "../../src/lib/quiz-keys";

// ---------------------------------------------------------------------------
// OPTION_SHORTCUT_KEYS
// ---------------------------------------------------------------------------

describe("OPTION_SHORTCUT_KEYS", () => {
	it("covers every option position, including the fifth", () => {
		// The keyboard guard only accepted "1234", so the fifth option of a
		// five-option question could not be picked with the number key.
		expect(OPTION_SHORTCUT_KEYS).toEqual(["1", "2", "3", "4", "5"]);
	});

	it("maps the fifth key to the fifth option", () => {
		expect(OPTION_SHORTCUT_KEYS.indexOf("5")).toBe(4);
	});

	it("does not claim keys beyond the fifth option", () => {
		expect(OPTION_SHORTCUT_KEYS.includes("6")).toBe(false);
		expect(OPTION_SHORTCUT_KEYS.includes("")).toBe(false);
	});
});
