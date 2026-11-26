import "fake-indexeddb/auto";
import { afterEach, describe, expect, it, vi } from "vitest";
import { openProgressDatabase } from "../../src/lib/progress/database";

describe("progress database opening", () => {
	afterEach(() => {
		vi.restoreAllMocks();
	});

	it("classifies IndexedDB open failures while the blocked-open promise is pending", async () => {
		const denied = new DOMException("IndexedDB access was denied.", "SecurityError");
		vi.spyOn(indexedDB, "open").mockImplementation(() => {
			throw denied;
		});

		await expect(openProgressDatabase(() => undefined)).rejects.toMatchObject({
			name: "ProgressStorageError",
			code: "access-denied",
			cause: denied,
		});
	});
});
