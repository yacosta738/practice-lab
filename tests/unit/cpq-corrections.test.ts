import { describe, expect, it } from "vitest";
import {
	applyCpqCorrections,
	CPQ_CORRECTIONS_VERSION,
} from "../../scripts/lib/cpq-corrections.mjs";

describe("versioned CPQ corrections", () => {
	it("corrects false claims and the rationale-supported CCDV-F answer without changing IDs or attribution", () => {
		const bank = {
			questions: [
				{
					id: "CPQ-ccarf-2.3",
					explanation: "raw",
					correctAnswers: [3],
					source: { label: "source", url: "url" },
				},
				{
					id: "CPQ-ccarf-4.6",
					explanation: "raw",
					correctAnswers: [3],
					source: { label: "source", url: "url" },
				},
				{
					id: "CPQ-ccarf-6.1",
					explanation: "raw",
					correctAnswers: [2],
					source: { label: "source", url: "url" },
				},
				{
					id: "CPQ-ccarf-6.4",
					explanation: "raw",
					correctAnswers: [1],
					source: { label: "source", url: "url" },
				},
				{
					id: "CPQ-ccdvf-5.9",
					explanation: "rationale says C",
					correctAnswers: [0, 3],
					selectCount: 2,
					source: { label: "source", url: "url" },
				},
			],
		};
		const corrected = applyCpqCorrections(bank, "ccar-f");
		const ccdv = applyCpqCorrections(bank, "ccdv-f").questions.at(-1);
		expect(CPQ_CORRECTIONS_VERSION).toBe(1);
		expect(corrected.questions[0].explanation).toMatch(/not.*guarantee/i);
		expect(corrected.questions[1].explanation).toMatch(/does not automatically prompt/i);
		expect(corrected.questions.slice(2, 4).map((q: { id: string }) => q.id)).toEqual(
			bank.questions.slice(2, 4).map((q: { id: string }) => q.id),
		);
		expect(corrected.questions[2].explanation).toMatch(
			/strict tool use enabled.*structural constraints/i,
		);
		expect(corrected.questions[3].explanation).toMatch(
			/tool use alone does not ensure structural compliance/i,
		);
		expect(ccdv).toMatchObject({
			id: "CPQ-ccdvf-5.9",
			correctAnswers: [2],
			selectCount: 1,
			source: { label: "source", url: "url" },
		});
		expect(bank.questions.at(-1)?.correctAnswers).toEqual([0, 3]);
	});
});
