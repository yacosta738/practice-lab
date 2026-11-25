import { describe, expect, it } from "vitest";
import { ProgressStorageError, toProgressStorageError } from "../../src/lib/progress/errors";

describe("progress storage errors", () => {
	it.each([
		["QuotaExceededError", "quota-exceeded"],
		["SecurityError", "access-denied"],
		["NotAllowedError", "access-denied"],
		["AbortError", "transaction-aborted"],
		["UnknownError", "database-error"],
	] as const)("maps %s into a typed storage failure", (name, code) => {
		const cause = new DOMException("IndexedDB rejected the request.", name);
		const error = toProgressStorageError(cause, "test operation");

		expect(error).toBeInstanceOf(ProgressStorageError);
		expect(error.code).toBe(code);
		expect(error.cause).toBe(cause);
	});

	it("preserves existing progress storage errors", () => {
		const original = new ProgressStorageError("blocked", "Database upgrade is blocked.");

		expect(toProgressStorageError(original, "open")).toBe(original);
	});
});
