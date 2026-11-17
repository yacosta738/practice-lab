import { describe, expect, it } from "vitest";
import {
	deriveBlueprint,
	mapAnswerLettersToIndices,
	mapCcdvfDomain,
	normalizeQuestion,
	slugifyDomain,
} from "../../scripts/lib/cpq-normalize.mjs";

// ---------------------------------------------------------------------------
// mapAnswerLettersToIndices
// ---------------------------------------------------------------------------

describe("mapAnswerLettersToIndices", () => {
	it("maps single answer letter to zero-based index", () => {
		expect(mapAnswerLettersToIndices(["B"])).toEqual([1]);
		expect(mapAnswerLettersToIndices(["A"])).toEqual([0]);
		expect(mapAnswerLettersToIndices(["D"])).toEqual([3]);
		expect(mapAnswerLettersToIndices(["E"])).toEqual([4]);
	});

	it("maps multiple answer letters", () => {
		expect(mapAnswerLettersToIndices(["A", "C"])).toEqual([0, 2]);
		expect(mapAnswerLettersToIndices(["B", "D"])).toEqual([1, 3]);
	});

	it("fails on invalid letter", () => {
		expect(() => mapAnswerLettersToIndices(["F"])).toThrow();
		expect(() => mapAnswerLettersToIndices(["Z"])).toThrow();
	});
});

// ---------------------------------------------------------------------------
// slugifyDomain
// ---------------------------------------------------------------------------

describe("slugifyDomain", () => {
	it("produces a short slug from a domain name", () => {
		expect(slugifyDomain("Prompting and Task Execution")).toMatch(/^[a-z][a-z0-9-]*$/);
		expect(slugifyDomain("Agents and Workflows")).toMatch(/^[a-z][a-z0-9-]*$/);
	});

	it("is deterministic", () => {
		const slug = slugifyDomain("Tool Design & MCP Integration");
		expect(slug).toBe(slugifyDomain("Tool Design & MCP Integration"));
	});
});

// ---------------------------------------------------------------------------
// mapCcdvfDomain
// ---------------------------------------------------------------------------

describe("mapCcdvfDomain", () => {
	it("maps CPQ CCDV-F domain names to existing D1-D8", () => {
		expect(mapCcdvfDomain("Agents and Workflows")).toBe("D1");
		expect(mapCcdvfDomain("Applications and Integration")).toBe("D2");
		expect(mapCcdvfDomain("Claude Code")).toBe("D3");
		expect(mapCcdvfDomain("Eval, Testing, and Debugging")).toBe("D4");
		expect(mapCcdvfDomain("Model Selection and Optimization")).toBe("D5");
		expect(mapCcdvfDomain("Prompt and Context Engineering")).toBe("D6");
		expect(mapCcdvfDomain("Security and Safety")).toBe("D7");
		expect(mapCcdvfDomain("Tools and MCPs")).toBe("D8");
	});

	it("throws on unknown domain", () => {
		expect(() => mapCcdvfDomain("Unknown Domain")).toThrow();
	});
});

// ---------------------------------------------------------------------------
// normalizeQuestion
// ---------------------------------------------------------------------------

describe("normalizeQuestion", () => {
	const cpqQuestion = {
		id: "1.1",
		domain: "Prompting and Task Execution",
		format: "single",
		selectCount: 1,
		text: "What is the best practice?",
		options: [
			{ id: "A", text: "Option A" },
			{ id: "B", text: "Option B" },
			{ id: "C", text: "Option C" },
			{ id: "D", text: "Option D" },
		],
		answer: ["B"],
		rationale: "This is the correct approach because…",
		whyNot: "A is wrong because… C is wrong because… D is wrong because…",
	};

	// Every non-CCDV-F certification maps the source domain names to the
	// D1..Dn ids used by the generated config.
	const ccaofDomainMap = {
		"Prompting and Task Execution": "D1",
	};

	it("produces a valid Question object with CPQ- prefix", () => {
		const q = normalizeQuestion("ccaof", cpqQuestion, ccaofDomainMap);
		expect(q.id).toBe("CPQ-ccaof-1.1");
		expect(q.question).toBe(cpqQuestion.text);
		expect(q.options).toEqual(cpqQuestion.options.map((o) => o.text));
		expect(q.correctAnswers).toEqual([1]);
		expect(q.explanation).toBe(cpqQuestion.rationale);
		expect(q.source.label).toContain("Cert Pro Quest");
		expect(q.source.url).toBe("https://cert-pro-quest.lovable.app/");
	});

	it("maps multi-select answers and preserves selectCount", () => {
		const multiQ = { ...cpqQuestion, answer: ["A", "C"], selectCount: 2 };
		const q = normalizeQuestion("ccaof", multiQ, ccaofDomainMap);
		expect(q.correctAnswers).toEqual([0, 2]);
		expect(q.selectCount).toBe(2);
	});

	it("maps CCDV-F domain to D1-D8", () => {
		const ccdvfQ = {
			...cpqQuestion,
			domain: "Agents and Workflows",
		};
		const q = normalizeQuestion("ccdvf", ccdvfQ, {} as Record<string, string>);
		expect(q.domain).toBe("D1");
	});

	it("uses domain map for non-CCDV-F certs", () => {
		const q = normalizeQuestion("ccaof", cpqQuestion, ccaofDomainMap);
		expect(q.domain).toBe("D1");
	});

	it("throws when a domain has no mapping instead of inventing an id", () => {
		// A generated domain id that is absent from the certification config
		// breaks the quiz UI at runtime, so normalization must fail loudly.
		expect(() => normalizeQuestion("ccaof", cpqQuestion, {})).toThrow(/Unmapped CPQ domain/i);
		expect(() =>
			normalizeQuestion("ccaof", { ...cpqQuestion, domain: "Brand New Domain" }, ccaofDomainMap),
		).toThrow(/Brand New Domain/);
	});

	it("preserves whyNot in the question object when present", () => {
		const q = normalizeQuestion("ccaof", cpqQuestion, ccaofDomainMap);
		expect(q.whyNot).toBe(cpqQuestion.whyNot);
	});

	it("handles five-option questions", () => {
		const fiveOptQ = {
			...cpqQuestion,
			options: [
				{ id: "A", text: "A" },
				{ id: "B", text: "B" },
				{ id: "C", text: "C" },
				{ id: "D", text: "D" },
				{ id: "E", text: "E" },
			],
			answer: ["E"],
		};
		const q = normalizeQuestion("ccaof", fiveOptQ, ccaofDomainMap);
		expect(q.correctAnswers).toEqual([4]);
		expect(q.options).toHaveLength(5);
	});

	it("omits topic when source has none", () => {
		const q = normalizeQuestion("ccaof", cpqQuestion, ccaofDomainMap);
		// topic should be absent
		expect(q.topic).toBeUndefined();
	});
});

// ---------------------------------------------------------------------------
// deriveBlueprint
// ---------------------------------------------------------------------------

describe("deriveBlueprint", () => {
	it("derives blueprint using largest remainder method", () => {
		// CCAO-F: 7 domains, 60 questions, target 50
		const domainCounts = {
			"Prompting and Task Execution": 8,
			"Output Evaluation and Validation": 13,
			"Product and Model Selection": 7,
			"Workflow Integration and Solution Design": 10,
			"Configuration and Knowledge Management": 7,
			"Governance, Risk, and Responsible Use": 9,
			"Troubleshooting and Optimization": 6,
		};
		const blueprint = deriveBlueprint(domainCounts, 50);
		const total = Object.values(blueprint).reduce((s, v) => s + v, 0);
		expect(total).toBe(50);
		// Every domain should have at least 1
		for (const [domain, count] of Object.entries(blueprint)) {
			expect(count).toBeGreaterThanOrEqual(1);
			expect(domainCounts[domain as keyof typeof domainCounts]).toBeGreaterThan(0);
		}
	});

	it("respects target when total equals target", () => {
		const domainCounts = {
			D1: 8,
			D2: 17,
			D3: 2,
			D4: 1,
			D5: 9,
			D6: 6,
			D7: 4,
			D8: 6,
		};
		// Total is 53, target is 50
		const blueprint = deriveBlueprint(domainCounts, 50);
		const total = Object.values(blueprint).reduce((s, v) => s + v, 0);
		expect(total).toBe(50);
	});

	it("uses total when target exceeds total", () => {
		const domainCounts = {
			D1: 5,
			D2: 5,
		};
		const blueprint = deriveBlueprint(domainCounts, 50);
		const total = Object.values(blueprint).reduce((s, v) => s + v, 0);
		expect(total).toBe(10);
	});

	it("allocates exactly the target when small domains would overshoot it", () => {
		// 97 + 1 + 1 + 1 = 100 items, target 50. Rounding up three tiny domains
		// to one slot each would push the allocation past the target.
		const domainCounts = { D1: 97, D2: 1, D3: 1, D4: 1 };
		const blueprint = deriveBlueprint(domainCounts, 50);
		const total = Object.values(blueprint).reduce((s, v) => s + v, 0);
		expect(total).toBe(50);
		for (const [domain, count] of Object.entries(blueprint)) {
			expect(count).toBeGreaterThanOrEqual(1);
			expect(count).toBeLessThanOrEqual(domainCounts[domain as keyof typeof domainCounts]);
		}
	});

	it("never allocates more items than a domain actually has", () => {
		const domainCounts = { D1: 30, D2: 2, D3: 1, D4: 1, D5: 1 };
		const blueprint = deriveBlueprint(domainCounts, 20);
		for (const [domain, count] of Object.entries(blueprint)) {
			expect(count).toBeLessThanOrEqual(domainCounts[domain as keyof typeof domainCounts]);
		}
		expect(Object.values(blueprint).reduce((s, v) => s + v, 0)).toBe(20);
	});

	it("ensures every domain gets at least 1", () => {
		const domainCounts = {
			D1: 50,
			D2: 1,
		};
		const blueprint = deriveBlueprint(domainCounts, 10);
		expect(blueprint.D2).toBeGreaterThanOrEqual(1);
	});
});
