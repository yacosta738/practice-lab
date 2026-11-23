import { describe, expect, it } from "vitest";
import {
	buildShuffledOptions,
	calculateHomeStats,
	calculateResults,
	createSession,
	formatTime,
	getQuestionOptions,
	getStorageKey,
	getWeakCount,
	hasAnswered,
	isAnswerCorrect,
	isAnswerCorrectWithShuffle,
	isExamExpired,
	percent,
	restoreSession,
	shuffle,
	shuffleQuestionOptions,
	updateStats,
} from "../../src/lib/quiz-engine";
import type { CertificationConfig, Question, QuestionStats } from "../../src/lib/quiz-types";

function question(id: string, domain = "domain-a"): Question {
	return {
		id,
		domain,
		topic: "Topic",
		question: `Question ${id}?`,
		options: ["A", "B", "C"],
		correctAnswers: [0],
		explanation: "Because.",
		source: { label: "Docs", url: "https://example.com" },
	};
}

const config: CertificationConfig = {
	slug: "ccdv-f",
	title: "Certified",
	subtitle: "Cert",
	description: "Description",
	theme: { brand: "#000", brand2: "#111", brandSoft: "#222" },
	domains: {
		"domain-a": { id: "domain-a", name: "Domain A", weight: 60 },
		"domain-b": { id: "domain-b", name: "Domain B", weight: 40 },
	},
	examBlueprint: { "domain-a": 2, "domain-b": 1 },
	totalQuestions: 3,
};

const questions: Question[] = [
	question("q1", "domain-a"),
	question("q2", "domain-a"),
	question("q3", "domain-a"),
	question("q4", "domain-b"),
	question("q5", "domain-b"),
];

describe("percent", () => {
	it("returns the rounded ratio", () => {
		expect(percent(1, 3)).toBe(33);
		expect(percent(2, 4)).toBe(50);
	});

	it("returns 0 when the total is 0", () => {
		expect(percent(5, 0)).toBe(0);
	});
});

describe("shuffle", () => {
	it("keeps every element exactly once", () => {
		const input = [1, 2, 3, 4, 5];
		const output = shuffle(input);

		expect(output).toHaveLength(input.length);
		expect([...output].sort((a, b) => a - b)).toEqual(input);
	});

	it("does not mutate the input", () => {
		const input = [1, 2, 3];
		shuffle(input);

		expect(input).toEqual([1, 2, 3]);
	});
});

describe("isAnswerCorrect", () => {
	it("requires the same amount of answers as correct options", () => {
		expect(isAnswerCorrect(question("q1"), [0])).toBe(true);
		expect(isAnswerCorrect(question("q1"), [0, 1])).toBe(false);
		expect(isAnswerCorrect(question("q1"), [])).toBe(false);
	});

	it("requires every selected option to be correct", () => {
		const multi = { ...question("q1"), correctAnswers: [0, 2] };

		expect(isAnswerCorrect(multi, [0, 2])).toBe(true);
		expect(isAnswerCorrect(multi, [2, 0])).toBe(true);
		expect(isAnswerCorrect(multi, [0, 1])).toBe(false);
	});
});

describe("createSession", () => {
	it("returns null for practice mode without questions", () => {
		expect(createSession("practice", config, [])).toBeNull();
	});

	it("limits practice mode to the requested amount", () => {
		const session = createSession("practice", config, questions, { amount: 2 });

		expect(session?.ids).toHaveLength(2);
		expect(session?.mode).toBe("practice");
		expect(session?.deadline).toBeNull();
	});

	it("limits practice mode to a single domain", () => {
		const session = createSession("practice", config, questions, { domain: "domain-b" });

		expect(session?.ids).toHaveLength(2);
		expect(session?.ids.every((id) => id === "q4" || id === "q5")).toBe(true);
	});

	it("returns null for an unknown domain", () => {
		const session = createSession("practice", config, questions, { domain: "nope" });

		expect(session).toBeNull();
	});

	it("follows the exam blueprint per domain and sets a deadline", () => {
		const session = createSession("exam", config, questions);

		expect(session?.ids).toHaveLength(3);
		expect(session?.ids.filter((id) => id === "q4" || id === "q5")).toHaveLength(1);
		expect(session?.deadline).not.toBeNull();
		expect(session?.deadline).toBeGreaterThan(Date.now());
	});

	it("returns null for weak mode without weak stats", () => {
		expect(createSession("weak", config, questions)).toBeNull();
	});

	it("returns only questions answered incorrectly for weak mode", () => {
		const weakStats: Record<string, QuestionStats> = {
			q1: { attempts: 1, correct: 0, lastWrong: true },
			q2: { attempts: 1, correct: 1, lastWrong: false },
		};

		const session = createSession("weak", config, questions, { weakStats });

		expect(session?.ids).toEqual(["q1"]);
	});

	it("returns null for weak mode when nothing was answered wrong", () => {
		const weakStats: Record<string, QuestionStats> = {
			q1: { attempts: 1, correct: 1, lastWrong: false },
		};

		expect(createSession("weak", config, questions, { weakStats })).toBeNull();
	});
});

describe("updateStats", () => {
	it("counts an attempt and the correctness", () => {
		const stats = updateStats({}, "q1", true);

		expect(stats.q1).toEqual({ attempts: 1, correct: 1, lastWrong: false });
	});

	it("marks the question as wrong and keeps the previous attempt count", () => {
		const first = updateStats({}, "q1", true);
		const second = updateStats(first, "q1", false);

		expect(second.q1).toEqual({ attempts: 2, correct: 1, lastWrong: true });
	});

	it("updates an existing question record in place", () => {
		const original: Record<string, QuestionStats> = {
			q1: { attempts: 1, correct: 1, lastWrong: false },
		};

		updateStats(original, "q1", false);

		expect(original.q1).toEqual({ attempts: 2, correct: 1, lastWrong: true });
	});
});

describe("calculateResults", () => {
	const session = {
		mode: "practice" as const,
		ids: ["q1", "q2", "q3"],
		currentIndex: 0,
		answers: { q1: [0], q2: [1], q3: [] },
		checked: {},
		flags: [],
		created: 0,
		deadline: null,
		submitted: false,
	};

	it("scores only answered and correct questions", () => {
		const results = calculateResults(session, questions, config.domains);

		expect(results.correctCount).toBe(1);
		expect(results.totalCount).toBe(3);
		expect(results.scorePercent).toBe(33);
		expect(results.missedIds).toEqual(["q2", "q3"]);
	});

	it("breaks the score down per domain", () => {
		const results = calculateResults(session, questions, config.domains);
		const domainA = results.domainBreakdown.find((d) => d.domain === "domain-a");

		expect(domainA?.total).toBe(3);
		expect(domainA?.correct).toBe(1);
		expect(domainA?.percent).toBe(33);
	});
});

describe("calculateHomeStats", () => {
	it("counts attempted, mastered and weak questions", () => {
		const stats: Record<string, QuestionStats> = {
			q1: { attempts: 2, correct: 2, lastWrong: false },
			q2: { attempts: 1, correct: 0, lastWrong: true },
		};

		const home = calculateHomeStats(stats, questions, config.domains);

		expect(home.attempted).toBe(2);
		expect(home.mastered).toBe(1);
		expect(home.weak).toBe(1);
		expect(home.domainCoverage.find((d) => d.domain === "domain-a")?.done).toBe(2);
		expect(home.domainCoverage.find((d) => d.domain === "domain-b")?.done).toBe(0);
	});
});

describe("formatTime", () => {
	it("formats milliseconds as hh:mm:ss", () => {
		expect(formatTime(0)).toBe("00:00:00");
		expect(formatTime(61_000)).toBe("00:01:01");
		expect(formatTime(3_661_000)).toBe("01:01:01");
	});

	it("never returns a negative duration", () => {
		expect(formatTime(-5_000)).toBe("00:00:00");
	});
});

describe("isExamExpired", () => {
	const base = {
		mode: "exam" as const,
		ids: ["q1"],
		currentIndex: 0,
		answers: {},
		checked: {},
		flags: [],
		created: 0,
		deadline: null,
		submitted: false,
	};

	it("is false for practice sessions", () => {
		expect(isExamExpired({ ...base, mode: "practice" })).toBe(false);
	});

	it("is false while the deadline is in the future", () => {
		expect(isExamExpired({ ...base, deadline: Date.now() + 60_000 })).toBe(false);
	});

	it("is true once the deadline passed", () => {
		expect(isExamExpired({ ...base, deadline: Date.now() - 1 })).toBe(true);
	});
});

describe("hasAnswered", () => {
	it("returns true when the question has a non-empty answer array", () => {
		const session = {
			mode: "practice" as const,
			ids: ["q1"],
			currentIndex: 0,
			answers: { q1: [0] },
			checked: {},
			flags: [],
			created: 0,
			deadline: null,
			submitted: false,
		};

		expect(hasAnswered(session, "q1")).toBe(true);
	});

	it("returns false when the answer array is empty", () => {
		const session = {
			mode: "practice" as const,
			ids: ["q1"],
			currentIndex: 0,
			answers: { q1: [] },
			checked: {},
			flags: [],
			created: 0,
			deadline: null,
			submitted: false,
		};

		expect(hasAnswered(session, "q1")).toBe(false);
	});

	it("returns false when the question has no answer key", () => {
		const session = {
			mode: "practice" as const,
			ids: ["q1"],
			currentIndex: 0,
			answers: {},
			checked: {},
			flags: [],
			created: 0,
			deadline: null,
			submitted: false,
		};

		expect(hasAnswered(session, "q1")).toBe(false);
	});

	it("returns false when the answer value is not an array", () => {
		const session = {
			mode: "practice" as const,
			ids: ["q1"],
			currentIndex: 0,
			answers: { q1: "not-an-array" as unknown as number[] },
			checked: {},
			flags: [],
			created: 0,
			deadline: null,
			submitted: false,
		};

		expect(hasAnswered(session, "q1")).toBe(false);
	});
});

describe("calculateResults edge cases", () => {
	it("returns 100% when all answers are correct", () => {
		const session = {
			mode: "practice" as const,
			ids: ["q1", "q2"],
			currentIndex: 0,
			answers: { q1: [0], q2: [0] },
			checked: {},
			flags: [],
			created: 0,
			deadline: null,
			submitted: false,
		};

		const results = calculateResults(session, questions, config.domains);

		expect(results.correctCount).toBe(2);
		expect(results.totalCount).toBe(2);
		expect(results.scorePercent).toBe(100);
		expect(results.missedIds).toEqual([]);
	});

	it("returns 0% when no answers are correct", () => {
		const session = {
			mode: "practice" as const,
			ids: ["q1", "q2"],
			currentIndex: 0,
			answers: { q1: [1], q2: [2] },
			checked: {},
			flags: [],
			created: 0,
			deadline: null,
			submitted: false,
		};

		const results = calculateResults(session, questions, config.domains);

		expect(results.correctCount).toBe(0);
		expect(results.scorePercent).toBe(0);
		expect(results.missedIds).toEqual(["q1", "q2"]);
	});

	it("includes domainBreakdown only for domains with session questions", () => {
		const session = {
			mode: "practice" as const,
			ids: ["q1"],
			currentIndex: 0,
			answers: { q1: [0] },
			checked: {},
			flags: [],
			created: 0,
			deadline: null,
			submitted: false,
		};

		const results = calculateResults(session, questions, config.domains);

		expect(results.domainBreakdown).toHaveLength(1);
		expect(results.domainBreakdown[0].domain).toBe("domain-a");
	});
});

describe("storage helpers", () => {
	it("derives the storage key from the certification slug", () => {
		expect(getStorageKey("ccdv-f")).toBe("ccdv-f-practice-lab-v2");
	});

	it("counts the questions that still need review", () => {
		const stats: Record<string, QuestionStats> = {
			q1: { attempts: 1, correct: 0, lastWrong: true },
			q2: { attempts: 1, correct: 1, lastWrong: false },
			q3: { attempts: 1, correct: 0, lastWrong: true },
		};

		expect(getWeakCount(stats)).toBe(2);
	});

	it("returns 0 when there are no stats", () => {
		expect(getWeakCount({})).toBe(0);
	});
});

describe("shuffleQuestionOptions", () => {
	it("returns all options in a shuffled order", () => {
		const q = question("q1");
		const result = shuffleQuestionOptions(q);

		expect(result.options).toHaveLength(q.options.length);
		expect(result.options.sort()).toEqual(q.options.sort());
	});

	it("remaps correctAnswers to the new positions", () => {
		const q = { ...question("q1"), correctAnswers: [0, 2] };
		const result = shuffleQuestionOptions(q);

		expect(result.correctAnswers).toHaveLength(2);
		// The correct answers should point to the positions of the original correct options
		expect(result.options[result.correctAnswers[0]]).toBe(q.options[0]);
		expect(result.options[result.correctAnswers[1]]).toBe(q.options[2]);
	});

	it("does not mutate the original question", () => {
		const q = question("q1");
		const origOptions = [...q.options];
		const origCorrect = [...q.correctAnswers];
		shuffleQuestionOptions(q);

		expect(q.options).toEqual(origOptions);
		expect(q.correctAnswers).toEqual(origCorrect);
	});
});

describe("getQuestionOptions", () => {
	it("returns original options when no shuffled data is provided", () => {
		const q = question("q1");
		const result = getQuestionOptions(q, undefined, "q1");

		expect(result.options).toBe(q.options);
		expect(result.correctAnswers).toBe(q.correctAnswers);
	});

	it("returns shuffled options when available", () => {
		const q = question("q1");
		const shuffled = { options: ["C", "B", "A"], correctAnswers: [2] };
		const result = getQuestionOptions(q, { q1: shuffled }, "q1");

		expect(result.options).toEqual(["C", "B", "A"]);
		expect(result.correctAnswers).toEqual([2]);
	});

	it("falls back to original when shuffled entry is missing for the id", () => {
		const q = question("q1");
		const shuffled = { q2: { options: ["X"], correctAnswers: [0] } };
		const result = getQuestionOptions(q, shuffled, "q1");

		expect(result.options).toBe(q.options);
		expect(result.correctAnswers).toBe(q.correctAnswers);
	});
});

describe("buildShuffledOptions", () => {
	it("builds shuffled options for all given ids", () => {
		const byId: Record<string, Question> = { q1: question("q1"), q2: question("q2") };
		const result = buildShuffledOptions(["q1", "q2"], byId);

		expect(result).toHaveProperty("q1");
		expect(result).toHaveProperty("q2");
		expect(result.q1.options).toHaveLength(3);
		expect(result.q2.options).toHaveLength(3);
	});
});

describe("isAnswerCorrectWithShuffle", () => {
	it("uses shuffled correct answers when available", () => {
		const q = question("q1");
		const shuffled = { q1: { options: ["C", "B", "A"], correctAnswers: [2] } };

		// In the shuffled order, index 2 is "A" which was originally index 0 (correct)
		expect(isAnswerCorrectWithShuffle(q, [2], shuffled, "q1")).toBe(true);
		expect(isAnswerCorrectWithShuffle(q, [0], shuffled, "q1")).toBe(false);
	});

	it("falls back to original correct answers when no shuffle", () => {
		const q = question("q1");
		expect(isAnswerCorrectWithShuffle(q, [0], undefined, "q1")).toBe(true);
		expect(isAnswerCorrectWithShuffle(q, [1], undefined, "q1")).toBe(false);
	});
});

describe("restoreSession", () => {
	const byId: Record<string, Question> = {
		q1: question("q1"),
		q2: question("q2"),
	};

	it("returns null for invalid input", () => {
		expect(restoreSession(null, byId)).toBeNull();
		expect(restoreSession(undefined, byId)).toBeNull();
		expect(restoreSession("not an object", byId)).toBeNull();
		expect(restoreSession({ mode: "invalid" }, byId)).toBeNull();
		expect(restoreSession({ mode: "practice" }, byId)).toBeNull(); // no ids
	});

	it("filters out question ids that no longer exist", () => {
		const raw = {
			mode: "practice",
			ids: ["q1", "q2", "q_deleted"],
			currentIndex: 0,
			answers: {},
			checked: {},
			flags: [],
			created: Date.now(),
			deadline: null,
			submitted: false,
		};
		const result = restoreSession(raw, byId);

		expect(result).not.toBeNull();
		expect(result?.ids).toEqual(["q1", "q2"]);
	});

	it("returns null when all ids are missing from the bank", () => {
		const raw = {
			mode: "practice",
			ids: ["q_deleted"],
			currentIndex: 0,
			answers: {},
			checked: {},
			flags: [],
			created: Date.now(),
			deadline: null,
			submitted: false,
		};
		expect(restoreSession(raw, byId)).toBeNull();
	});

	it("validates currentIndex and falls back to 0", () => {
		const raw = {
			mode: "practice",
			ids: ["q1", "q2"],
			currentIndex: 99, // out of range
			answers: {},
			checked: {},
			flags: [],
			created: Date.now(),
			deadline: null,
			submitted: false,
		};
		const result = restoreSession(raw, byId);

		expect(result?.currentIndex).toBe(0);
	});

	it("preserves shuffledOptions when present", () => {
		const shuffledOptions = { q1: { options: ["C", "B", "A"], correctAnswers: [2] } };
		const raw = {
			mode: "exam",
			ids: ["q1"],
			currentIndex: 0,
			answers: { q1: [2] },
			checked: {},
			flags: [],
			created: Date.now(),
			deadline: Date.now() + 60000,
			submitted: false,
			shuffledOptions,
		};
		const result = restoreSession(raw, byId);

		expect(result).not.toBeNull();
		expect(result?.shuffledOptions).toEqual(shuffledOptions);
	});

	it("filters flags to only existing question ids", () => {
		const raw = {
			mode: "exam",
			ids: ["q1", "q2"],
			currentIndex: 0,
			answers: {},
			checked: {},
			flags: ["q1", "q_deleted"],
			created: Date.now(),
			deadline: null,
			submitted: false,
		};
		const result = restoreSession(raw, byId);

		expect(result?.flags).toEqual(["q1"]);
	});
});

describe("createSession with shuffledOptions", () => {
	it("includes shuffledOptions in the created session", () => {
		const session = createSession("practice", config, questions, { amount: 2 });

		expect(session).not.toBeNull();
		expect(session?.shuffledOptions).toBeDefined();
		for (const id of session?.ids ?? []) {
			expect(session?.shuffledOptions?.[id]).toBeDefined();
		}
	});

	it("uses config.examMinutes for exam deadline", () => {
		const customConfig: CertificationConfig = {
			...config,
			examMinutes: 60,
		};
		const session = createSession("exam", customConfig, questions);
		const now = Date.now();

		expect(session).not.toBeNull();
		expect(session?.deadline).not.toBeNull();
		// Deadline should be approximately 60 minutes from now (allow 2s tolerance for execution time)
		expect(session?.deadline).toBeGreaterThanOrEqual(now + 59 * 60 * 1000);
		expect(session?.deadline).toBeLessThanOrEqual(now + 61 * 60 * 1000);
	});

	it("defaults to 120 minutes when examMinutes is not set", () => {
		const session = createSession("exam", config, questions);

		expect(session).not.toBeNull();
		expect(session?.deadline).not.toBeNull();
		const now = Date.now();
		expect(session?.deadline).toBeGreaterThanOrEqual(now + 119 * 60 * 1000);
		expect(session?.deadline).toBeLessThanOrEqual(now + 121 * 60 * 1000);
	});
});

describe("calculateResults with shuffledOptions", () => {
	it("scores correctly when session has shuffledOptions", () => {
		const shuffledOptions = {
			q1: { options: ["C", "B", "A"], correctAnswers: [2] },
			q2: { options: ["A", "B", "C"], correctAnswers: [0] },
		};
		const session = {
			mode: "practice" as const,
			ids: ["q1", "q2"],
			currentIndex: 0,
			answers: { q1: [2], q2: [0] }, // both correct in shuffled order
			checked: {},
			flags: [],
			created: 0,
			deadline: null,
			submitted: false,
			shuffledOptions,
		};

		const results = calculateResults(session, questions, config.domains);

		expect(results.correctCount).toBe(2);
		expect(results.scorePercent).toBe(100);
	});

	it("scores incorrectly when answers don't match shuffled correct", () => {
		const shuffledOptions = {
			q1: { options: ["C", "B", "A"], correctAnswers: [2] },
		};
		const session = {
			mode: "practice" as const,
			ids: ["q1"],
			currentIndex: 0,
			answers: { q1: [0] }, // wrong in shuffled order
			checked: {},
			flags: [],
			created: 0,
			deadline: null,
			submitted: false,
			shuffledOptions,
		};

		const results = calculateResults(session, questions, config.domains);

		expect(results.correctCount).toBe(0);
		expect(results.scorePercent).toBe(0);
	});
});
