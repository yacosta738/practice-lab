import { describe, expect, it } from "vitest";
import { getStudyCert } from "../../src/study/registry";

describe("study certification registry", () => {
	for (const slug of ["ccao-f", "ccdv-p"]) {
		it(`registers ${slug} with its existing certification quiz`, () => {
			const studyCert = getStudyCert(slug);
			if (!studyCert) throw new Error(`Expected study library for ${slug}.`);

			expect(studyCert.certification.slug).toBe(slug);
			expect(studyCert.quizPath).toBe(`certifications/${slug}`);
		});
	}
});
