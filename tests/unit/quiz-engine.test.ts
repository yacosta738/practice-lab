import { describe, expect, it } from "vitest";
import {
	calculateHomeStats,
	calculateResults,
	createSession,
	formatTime,
	getStorageKey,
	getWeakCount,
	isAnswerCorrect,
	isExamExpired,
	percent,
	shuffle,
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
});
