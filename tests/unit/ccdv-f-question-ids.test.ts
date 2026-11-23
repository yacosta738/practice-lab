import { expect, it } from "vitest";
import { questions } from "../../src/certifications/ccdv-f/questions";

it("gives every CCDV-F question a unique ID", () => {
	const ids = questions.map((question) => question.id);
	expect(new Set(ids).size).toBe(ids.length);
});
