import { describe, expect, it } from "vitest";
import { config as ccaoConfig } from "../../src/certifications/ccao-f/config";
import { questions as ccaoQuestions } from "../../src/certifications/ccao-f/questions";
import { config as ccarfConfig } from "../../src/certifications/ccar-f/config";
import { questions as ccarfQuestions } from "../../src/certifications/ccar-f/questions";
import { config as ccarpConfig } from "../../src/certifications/ccar-p/config";
import { questions as ccarpQuestions } from "../../src/certifications/ccar-p/questions";
// Load config modules to validate domains
import { config as ccdvConfig } from "../../src/certifications/ccdv-f/config";
import { questions as ccdvQuestions } from "../../src/certifications/ccdv-f/questions";
import { config as ccdvpConfig } from "../../src/certifications/ccdv-p/config";
import { questions as ccdvpQuestions } from "../../src/certifications/ccdv-p/questions";

interface CertBank {
	slug: string;
	config: typeof ccdvConfig;
	questions: typeof ccdvQuestions;
}

const banks: CertBank[] = [
	{ slug: "ccdv-f", config: ccdvConfig, questions: ccdvQuestions },
	{ slug: "ccdv-p", config: ccdvpConfig, questions: ccdvpQuestions },
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

		it("has valid source URL or empty string (no broken links)", () => {
			for (const q of questions) {
				// source.url must be either a valid HTTP(S) URL or an empty string
				// Empty string is allowed for community recall questions without a primary source
				if (q.source.url !== "") {
					expect(() => {
						const url = new URL(q.source.url);
						expect(["http:", "https:"]).toContain(url.protocol);
					}).not.toThrow();
				}
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

const ccdvpReviewedSourceUrls = new Set([
	"https://www.anthropic.com/engineering/building-effective-agents",
	"https://platform.claude.com/docs/en/agents-and-tools/tool-use/overview",
	"https://platform.claude.com/docs/en/agents-and-tools/tool-use/programmatic-tool-calling",
	"https://platform.claude.com/docs/en/build-with-claude/streaming",
	"https://platform.claude.com/docs/en/build-with-claude/handling-stop-reasons",
	"https://platform.claude.com/docs/en/build-with-claude/structured-outputs",
	"https://platform.claude.com/docs/en/build-with-claude/citations",
	"https://platform.claude.com/docs/en/build-with-claude/prompt-caching",
	"https://platform.claude.com/docs/en/build-with-claude/batch-processing",
	"https://platform.claude.com/docs/en/api/rate-limits",
	"https://platform.claude.com/docs/en/api/errors",
	"https://platform.claude.com/docs/en/test-and-evaluate/develop-tests",
	"https://modelcontextprotocol.io/specification/2026-07-28/basic/security_best_practices",
	"https://modelcontextprotocol.io/specification/2026-07-28/basic/transports",
	"https://code.claude.com/docs/en/settings",
	"https://code.claude.com/docs/en/managed-settings",
	"https://code.claude.com/docs/en/hooks",
	"https://code.claude.com/docs/en/sub-agents",
	"https://code.claude.com/docs/en/skills",
	"https://docs.voyageai.com/docs/embeddings",
	"https://docs.voyageai.com/docs/faq",
	"https://opentelemetry.io/docs/concepts/signals/traces/",
	"https://opentelemetry.io/docs/concepts/signals/metrics/",
	"https://sre.google/sre-book/monitoring-distributed-systems/",
	"https://sre.google/sre-book/effective-troubleshooting/",
]);

describe("CCDV-P practice bank", () => {
	it("matches the exact question total and derived domain counts", () => {
		const domainCounts = Object.fromEntries(
			Object.keys(ccdvpConfig.domains).map((domainId) => [
				domainId,
				ccdvpQuestions.filter((question) => question.domain === domainId).length,
			]),
		);

		expect(ccdvpQuestions).toHaveLength(ccdvpConfig.totalQuestions);
		expect(ccdvpConfig.totalQuestions).toBe(70);
		expect(domainCounts).toEqual(ccdvpConfig.examBlueprint);
	});

	it("uses stable domain-sequenced IDs and reviewed technical sources", () => {
		const nextSequence: Record<string, number> = {};

		for (const question of ccdvpQuestions) {
			const match = question.id.match(/^CCDV-P-(D[1-8])-(\d{3})$/);
			expect(match).not.toBeNull();
			expect(match?.[1]).toBe(question.domain);

			const sequence = (nextSequence[question.domain] ?? 0) + 1;
			expect(match?.[2]).toBe(String(sequence).padStart(3, "0"));
			nextSequence[question.domain] = sequence;

			expect(ccdvpReviewedSourceUrls.has(question.source.url)).toBe(true);
			expect(question.source.label).not.toMatch(
				/Matthew Purcell|Full Practice Exam Question Set|LinkedIn|CC BY-NC|adapted/i,
			);
		}
	});

	it("declares the required number for each multiple-answer item", () => {
		for (const question of ccdvpQuestions) {
			if (question.correctAnswers.length > 1) {
				expect(question.selectCount).toBe(question.correctAnswers.length);
				expect(question.question).toMatch(/select two/i);
			}
		}
	});

	it("keeps official weights separate from the derived mock blueprint", () => {
		expect(
			Object.fromEntries(
				Object.entries(ccdvpConfig.domains).map(([domainId, domain]) => [domainId, domain.weight]),
			),
		).toEqual({ D1: 17, D2: 20, D3: 12, D4: 10, D5: 12, D6: 8, D7: 11, D8: 10 });
		expect(ccdvpConfig.blueprintSource).toBe("derived");
	});
});

const acceptedTestAppIds = [
	"claude-generated-002",
	"claude-generated-005",
	"claude-generated-009",
	"claude-generated-010",
	"claude-generated-011",
	"claude-generated-013",
	"claude-generated-014",
	"claude-generated-024",
	"claude-generated-025",
	"claude-generated-026",
	"claude-generated-027",
	"claude-generated-029",
	"claude-generated-030",
	"claude-generated-032",
	"claude-generated-033",
	"claude-generated-034",
	"claude-generated-035",
	"claude-generated-037",
	"claude-generated-038",
	"claude-generated-041",
	"claude-generated-042",
	"claude-generated-044",
	"claude-generated-045",
	"claude-generated-046",
	"claude-generated-048",
	"claude-generated-052",
	"claude-generated-058",
	"claude-generated-060",
	"claude-generated-061",
	"claude-generated-062",
	"claude-generated-063",
	"claude-generated-067",
	"claude-generated-069",
	"claude-generated-071",
	"claude-generated-072",
	"claude-generated-073",
	"claude-generated-080",
	"claude-generated-081",
	"claude-generated-082",
	"claude-generated-083",
	"claude-generated-085",
	"claude-generated-087",
	"claude-generated-090",
	"claude-generated-094",
	"claude-generated-095",
	"claude-generated-097",
	"claude-generated-098",
	"claude-generated-099",
	"claude-generated-100",
];

const acceptedTestAppDomains: Record<string, string> = {
	"claude-generated-002": "D1",
	"claude-generated-005": "D1",
	"claude-generated-009": "D1",
	"claude-generated-010": "D1",
	"claude-generated-011": "D1",
	"claude-generated-013": "D1",
	"claude-generated-014": "D2",
	"claude-generated-024": "D2",
	"claude-generated-025": "D2",
	"claude-generated-026": "D2",
	"claude-generated-027": "D2",
	"claude-generated-029": "D2",
	"claude-generated-030": "D2",
	"claude-generated-032": "D2",
	"claude-generated-033": "D2",
	"claude-generated-034": "D2",
	"claude-generated-035": "D2",
	"claude-generated-037": "D3",
	"claude-generated-038": "D3",
	"claude-generated-041": "D3",
	"claude-generated-042": "D3",
	"claude-generated-044": "D3",
	"claude-generated-045": "D5",
	"claude-generated-046": "D3",
	"claude-generated-048": "D4",
	"claude-generated-052": "D4",
	"claude-generated-058": "D4",
	"claude-generated-060": "D6",
	"claude-generated-061": "D4",
	"claude-generated-062": "D4",
	"claude-generated-063": "D4",
	"claude-generated-067": "D5",
	"claude-generated-069": "D5",
	"claude-generated-071": "D5",
	"claude-generated-072": "D5",
	"claude-generated-073": "D5",
	"claude-generated-080": "D6",
	"claude-generated-081": "D6",
	"claude-generated-082": "D6",
	"claude-generated-083": "D6",
	"claude-generated-085": "D6",
	"claude-generated-087": "D6",
	"claude-generated-090": "D6",
	"claude-generated-094": "D7",
	"claude-generated-095": "D7",
	"claude-generated-097": "D7",
	"claude-generated-098": "D7",
	"claude-generated-099": "D7",
	"claude-generated-100": "D7",
};

describe("CCAO-F TestApp-generated additions", () => {
	it("contains only the reviewed generated additions and maps each to its domain", () => {
		const generatedQuestions = ccaoQuestions.filter((question) =>
			question.id.startsWith("claude-generated-"),
		);
		expect(generatedQuestions.map((question) => question.id).sort()).toEqual(acceptedTestAppIds);
		for (const [id, domain] of Object.entries(acceptedTestAppDomains)) {
			expect(generatedQuestions.find((question) => question.id === id)?.domain).toBe(domain);
		}
	});

	it("preserves TestApp-author attribution and source separation", () => {
		const generatedQuestions = ccaoQuestions.filter((question) =>
			question.id.startsWith("claude-generated-"),
		);
		for (const question of generatedQuestions) {
			expect(question.source.label).toContain("TestApp author");
			expect(question.source.label).toContain("reuse permission confirmed by maintainer");
			expect(question.source.label).toContain("not official exam questions");
			expect(question.source.label).not.toContain("SkillCertPro");
			expect(question.source.url).toBe(
				"https://drive.google.com/file/d/1v0ZBWPXIIMSE9u48_WdZ7hg7mFCuFufh/view",
			);
		}
	});

	it("matches the current official Associate blueprint while labeling the local mock as derived", () => {
		const weights = Object.fromEntries(
			Object.entries(ccaoConfig.domains).map(([domainId, domain]) => [domainId, domain.weight]),
		);
		expect(weights).toEqual({ D1: 14, D2: 21, D3: 12, D4: 16, D5: 12, D6: 15, D7: 10 });
		expect(ccaoConfig.blueprintSource).toBe("derived");
		expect(ccaoConfig.totalQuestions).toBe(50);
		expect(ccaoConfig.examMinutes).toBe(100);
		expect(ccaoConfig.passingScore).toBe(720);
		expect(ccaoConfig.examGuideNote).toContain("60 items in 120 minutes");
		expect(ccaoConfig.examGuideNote).toContain("50 questions in 100 minutes");
	});

	it("uses organization-provisioned Skills for shared writing standards", () => {
		const question = ccaoQuestions.find((candidate) => candidate.id === "claude-generated-072");
		expect(question?.domain).toBe("D5");
		expect(question?.question).toMatch(/Team plan/i);
		const correctOption = question?.options[question.correctAnswers[0]] ?? "";
		expect(correctOption).toMatch(/owner/i);
		expect(correctOption).toMatch(/organization-wide Skill/i);
		expect(question?.explanation).toMatch(/code execution are enabled/i);
	});
});

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
