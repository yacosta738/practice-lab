import { describe, expect, it } from "vitest";
import { buildLegacyMigrationPlan } from "../../src/lib/progress/legacy-migration";
import type { CertificationConfig, Question } from "../../src/lib/quiz-types";

const CONFIG: CertificationConfig = {
	slug: "ccdv-f",
	title: "Developer Foundations",
	subtitle: "Practice",
	description: "",
	theme: { brand: "#000", brand2: "#111", brandSoft: "#222" },
	domains: { D1: { id: "D1", name: "Architecture", weight: 100 } },
	examBlueprint: { D1: 1 },
	passingScore: 70,
	totalQuestions: 1,
};

const QUESTIONS: Question[] = [
	{
		id: "known-question",
		domain: "D1",
		topic: "Architecture",
		question: "Which option is correct?",
		options: ["Incorrect", "Correct"],
		correctAnswers: [1],
		explanation: "The second option is correct.",
		source: { label: "Guide", url: "https://example.test/guide" },
	},
];

interface LegacySessionFixture {
	mode: string;
	ids: string[];
	currentIndex: number;
	answers: Record<string, number[]>;
	checked: Record<string, boolean>;
	flags: string[];
	created: number;
	deadline: number | null;
	submitted: boolean;
	timedOut?: boolean;
	finished?: number;
	shuffledOptions?: Record<string, { options: string[]; correctAnswers: number[] }>;
}

function legacyRecord(
	overrides: { stats?: Record<string, unknown>; session?: Partial<LegacySessionFixture> } = {},
) {
	return {
		stats: overrides.stats ?? {
			"known-question": { attempts: 4, correct: 2, lastWrong: true },
			"removed-question": { attempts: 3, correct: 1, lastWrong: false },
		},
		session: {
			mode: "exam",
			ids: ["known-question"],
			currentIndex: 0,
			answers: { "known-question": [0] },
			checked: { "known-question": false },
			flags: ["known-question"],
			created: 500,
			deadline: 2_000,
			submitted: false,
			shuffledOptions: {
				"known-question": { options: ["Correct", "Incorrect"], correctAnswers: [0] },
			},
			...overrides.session,
		},
	};
}

function createPlan(record: unknown, now = 1_000) {
	return buildLegacyMigrationPlan({
		certificationId: "ccdv-f",
		legacyStorageKey: "ccdv-f-practice-lab-v2",
		rawValue: JSON.stringify(record),
		config: CONFIG,
		questions: QUESTIONS,
		now,
		idFactory: () => "00000000-0000-4000-8000-000000000001",
	});
}

describe("legacy progress migration", () => {
	it("preserves unknown aggregates and the exact active-session answers, flags, permutation, and deadline", () => {
		const plan = createPlan(legacyRecord());
		const session = plan.session;

		expect(plan.baselines).toEqual([
			{
				questionId: "known-question",
				baseline: { attempts: 4, correct: 2, lastWrong: true },
			},
			{
				questionId: "removed-question",
				baseline: { attempts: 3, correct: 1, lastWrong: false },
			},
		]);
		expect(session?.input.checkpoint).toMatchObject({
			currentQuestionId: "known-question",
			deadlineAt: 2_000,
			selectedOptionIdsByQuestion: { "known-question": ["known-question:option:1"] },
			checkedQuestionIds: [],
			flaggedQuestionIds: ["known-question"],
		});
		expect(session?.input.content.questions[0]).toMatchObject({
			questionText: "Which option is correct?",
			displayOptionIds: ["known-question:option:1", "known-question:option:0"],
			correctOptionIds: ["known-question:option:1"],
		});
		expect(session?.status).toBeUndefined();
	});

	it("archives submitted sessions with provenance without recounting legacy evaluations", () => {
		const record = legacyRecord({
			session: {
				submitted: true,
				timedOut: true,
				finished: 900,
				checked: { "known-question": true },
			},
		});
		const plan = createPlan(record);

		expect(plan.session?.status).toBe("expired");
		expect(plan.session?.finishedAt).toBe(900);
		expect(plan.session?.evaluations).toEqual([]);
		expect(plan.session?.input.legacy).toMatchObject({
			evaluatedQuestionIds: ["known-question"],
			scoreEvidence: "validated-saved-options",
		});
		expect(plan.warnings.some((warning) => warning.includes("wording or rationale"))).toBe(true);
	});

	it("marks legacy scores unavailable when the saved option permutation is missing", () => {
		const plan = createPlan(
			legacyRecord({
				session: {
					submitted: true,
					finished: 900,
					shuffledOptions: undefined,
				},
			}),
		);

		expect(plan.session?.input.legacy).toMatchObject({ scoreEvidence: "insufficient" });
	});

	it("expires overdue exams using only unanswered evaluated answers", () => {
		const record = legacyRecord({ session: { deadline: 900 } });
		const plan = createPlan(record, 1_000);

		expect(plan.session?.status).toBe("expired");
		expect(plan.session?.finishedAt).toBe(1_000);
		expect(plan.session?.evaluations).toEqual([
			{
				sessionId: "00000000-0000-4000-8000-000000000001",
				questionId: "known-question",
				selectedOptionIds: ["known-question:option:1"],
				outcome: "correct",
				scoreEarned: 1,
				scorePossible: 1,
				evaluatedAt: 1_000,
			},
		]);
	});

	it("keeps valid aggregates and reports invalid or unrecoverable legacy data", () => {
		const record = legacyRecord({
			stats: {
				"known-question": { attempts: -1, correct: 9, lastWrong: "yes" },
			},
			session: {
				mode: "practice",
				ids: ["removed-question"],
				currentIndex: 0,
				answers: {},
				checked: {},
				flags: [],
				created: 10,
				deadline: null,
				submitted: false,
			},
		});
		const plan = createPlan(record);

		expect(plan.baselines).toEqual([]);
		expect(plan.session).toBeUndefined();
		expect(plan.warnings.join(" ")).toContain("invalid counters");
		expect(plan.warnings.join(" ")).toContain("no longer in the bank");
	});
});
