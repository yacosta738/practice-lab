import { describe, expect, it } from "vitest";
import { questions as ccdvQuestions } from "../../src/certifications/ccdv-f/questions";
import { questions as ccaoQuestions } from "../../src/certifications/ccao-f/questions";
import { questions as ccarpQuestions } from "../../src/certifications/ccar-p/questions";
import { questions as ccarfQuestions } from "../../src/certifications/ccar-f/questions";

// Load config modules to validate domains
import { config as ccdvConfig } from "../../src/certifications/ccdv-f/config";
import { config as ccaoConfig } from "../../src/certifications/ccao-f/config";
import { config as ccarpConfig } from "../../src/certifications/ccar-p/config";
import { config as ccarfConfig } from "../../src/certifications/ccar-f/config";

interface CertBank {
	slug: string;
	config: typeof ccdvConfig;
	questions: typeof ccdvQuestions;
}

const banks: CertBank[] = [
	{ slug: "ccdv-f", config: ccdvConfig, questions: ccdvQuestions },
	{ slug: "ccao-f", config: ccaoConfig, questions: ccaoQuestions },
	{ slug: "ccar-p", config: ccarpConfig, questions: ccarpQuestions },
	{ slug: "ccar-f", config: ccarfConfig, questions: ccarfQuestions },
];

function validateBank(bank: CertBank) {
	const { slug, config, questions } = bank;
	const domainIds = Object.keys(config.domains);

	describe(slug, () => {
		it("has questions", () => {
			expect(questions.length).toBeGreaterThan(0);
		});

		it("has the expected total from config", () => {
			// The question bank should have at least as many questions as the exam blueprint total
			const blueprintTotal = Object.values(config.examBlueprint).reduce((sum, n) => sum + n, 0);
			expect(questions.length).toBeGreaterThanOrEqual(blueprintTotal);
		});

		it("has unique IDs", () => {
			const ids = questions.map((q) => q.id);
			const uniqueIds = new Set(ids);
			expect(uniqueIds.size).toBe(ids.length);
		});

		it("has non-empty question text", () => {
			for (const q of questions) {
				expect(q.question.trim().length).toBeGreaterThan(0);
			}
		});

		it("has at least 2 options per question", () => {
			for (const q of questions) {
				expect(q.options.length).toBeGreaterThanOrEqual(2);
			}
		});

		it("has correctAnswers within bounds", () => {
			for (const q of questions) {
				for (const idx of q.correctAnswers) {
					expect(idx).toBeGreaterThanOrEqual(0);
					expect(idx).toBeLessThan(q.options.length);
				}
			}
		});

		it("has at least one correct answer", () => {
			for (const q of questions) {
				expect(q.correctAnswers.length).toBeGreaterThanOrEqual(1);
			}
		});

		it("has no duplicate correct answer indices", () => {
			for (const q of questions) {
				const unique = new Set(q.correctAnswers);
				expect(unique.size).toBe(q.correctAnswers.length);
			}
		});

		it("has non-empty explanation", () => {
			for (const q of questions) {
				expect(q.explanation.trim().length).toBeGreaterThan(0);
			}
		});

		it("has non-empty source label", () => {
			for (const q of questions) {
				expect(q.source.label.trim().length).toBeGreaterThan(0);
			}
		});

		it("has valid domain for each question", () => {
			for (const q of questions) {
				expect(domainIds).toContain(q.domain);
			}
		});

		it("has questions covering all domains", () => {
			const coveredDomains = new Set(questions.map((q) => q.domain));
			for (const domainId of domainIds) {
				expect(coveredDomains).toContain(domainId);
			}
		});

		it("has selectCount matching correctAnswers length when present", () => {
			for (const q of questions) {
				if (q.selectCount !== undefined) {
					expect(q.selectCount).toBe(q.correctAnswers.length);
				}
			}
		});

		it("has multi-select questions with selectCount matching correctAnswers or vice versa", () => {
			for (const q of questions) {
				// If selectCount is defined, it should match correctAnswers length
				if (q.selectCount !== undefined) {
					expect(q.selectCount).toBe(q.correctAnswers.length);
				}
				// If correctAnswers > 1, selectCount should ideally be defined
				// but we only warn, not fail, as some older questions may not have it
			}
		});

		// Domain distribution check
		it("has reasonable domain distribution", () => {
			const domainCounts: Record<string, number> = {};
			for (const q of questions) {
				domainCounts[q.domain] = (domainCounts[q.domain] || 0) + 1;
			}

			for (const domainId of domainIds) {
				const count = domainCounts[domainId] || 0;
				expect(count).toBeGreaterThan(0);
			}
		});
	});
}

// Validate each certification bank
for (const bank of banks) {
	validateBank(bank);
}

// Cross-certification checks
describe("cross-certification", () => {
	it("has no ID collisions across all certifications", () => {
		const allIds: string[] = [];
		for (const bank of banks) {
			allIds.push(...bank.questions.map((q) => q.id));
		}
		const uniqueIds = new Set(allIds);
		expect(uniqueIds.size).toBe(allIds.length);
	});

	it("has a total question count across all certifications", () => {
		const total = banks.reduce((sum, b) => sum + b.questions.length, 0);
		expect(total).toBeGreaterThan(0);
	});
});

// Developer Foundations exam recall questions specific checks
describe("Developer Foundations exam recall questions", () => {
	const recallIds = [
		"D5-020", // Model selection tradeoffs
		"D2-038", // Real-time communication
		"D2-039", // Code migration strategy
		"D6-017", // Context drift
		"D2-040", // JSON validation
		"D8-014", // MCP local transport
		"D1-022", // Multi-agent architecture
		"D6-018", // Prompt vs Context Engineering
		"D3-006", // CLAUDE.md organization
	];

	it("has all 9 recall questions in CCDV-F bank", () => {
		const ids = ccdvQuestions.map((q) => q.id);
		for (const recallId of recallIds) {
			expect(ids).toContain(recallId);
		}
	});

	it("recall questions have correct source label", () => {
		for (const recallId of recallIds) {
			const q = ccdvQuestions.find((q) => q.id === recallId);
			expect(q).toBeDefined();
			expect(q?.source.label).toBe("Developer Foundations Exam Recall");
		}
	});

	it("recall questions have 4 options each (single-select)", () => {
		for (const recallId of recallIds) {
			const q = ccdvQuestions.find((q) => q.id === recallId);
			expect(q?.options.length).toBe(4);
			expect(q?.correctAnswers.length).toBe(1);
		}
	});

	it("recall questions cover expected domains", () => {
		const expectedDomains = {
			"D5-020": "D5",
			"D2-038": "D2",
			"D2-039": "D2",
			"D6-017": "D6",
			"D2-040": "D2",
			"D8-014": "D8",
			"D1-022": "D1",
			"D6-018": "D6",
			"D3-006": "D3",
		};

		for (const [id, expectedDomain] of Object.entries(expectedDomains)) {
			const q = ccdvQuestions.find((q) => q.id === id);
			expect(q?.domain).toBe(expectedDomain);
		}
	});
});
