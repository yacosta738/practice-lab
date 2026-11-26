import { describe, expect, it, vi } from "vitest";
import { config as ccdvFConfig } from "../../src/certifications/ccdv-f/config";
import { questions as ccdvFQuestions } from "../../src/certifications/ccdv-f/questions";
import type {
	BrowserProgressOptions,
	BrowserProgressService,
	BrowserProgressState,
} from "../../src/lib/progress/browser-service";
import {
	initializeQuizClient,
	parseQuizBootstrap,
	type QuizBootstrap,
} from "../../src/lib/quiz-client";
import { OPTION_SHORTCUT_KEYS } from "../../src/lib/quiz-keys";
import type { CertificationConfig, Question } from "../../src/lib/quiz-types";

const CONFIG: CertificationConfig = {
	slug: "ccdv-f",
	title: "Claude Developer Foundations",
	subtitle: "CCDV-F",
	description: "Practice questions.",
	theme: { brand: "#123456", brand2: "#234567", brandSoft: "#12345622" },
	domains: { D1: { id: "D1", name: "Domain One", weight: 100 } },
	examBlueprint: { D1: 1 },
	totalQuestions: 1,
};

const QUESTIONS: Question[] = [
	{
		id: "question-one",
		domain: "D1",
		question: "Which option is correct?",
		options: ["One", "Two"],
		correctAnswers: [0],
		explanation: "One is correct.",
		source: { label: "Guide", url: "https://example.test/guide" },
	},
];

const BOOTSTRAP: QuizBootstrap = {
	cfg: CONFIG,
	qs: QUESTIONS,
	optionKeys: ["1", "2", "3", "4", "5"],
	studyHref: "/practice-lab/study/ccdv-f/",
	base: "/practice-lab/",
	knownCertifications: ["ccdv-f", "ccar-f"],
};

describe("quiz bootstrap", () => {
	it("parses a valid static bootstrap payload", () => {
		expect(parseQuizBootstrap(JSON.stringify(BOOTSTRAP))).toEqual(BOOTSTRAP);
	});

	it("rejects missing, invalid JSON, and malformed quiz data", () => {
		expect(() => parseQuizBootstrap(undefined)).toThrow(/missing/i);
		expect(() => parseQuizBootstrap("{")).toThrow(/valid JSON/i);
		expect(() =>
			parseQuizBootstrap(
				JSON.stringify({ ...BOOTSTRAP, qs: [{ ...QUESTIONS[0], correctAnswers: [2] }] }),
			),
		).toThrow(/invalid shape/i);
	});

	it("accepts the generated CCDV-F route payload", () => {
		const payload = {
			cfg: ccdvFConfig,
			qs: ccdvFQuestions,
			optionKeys: OPTION_SHORTCUT_KEYS,
			studyHref: "/practice-lab/study/ccdv-f/",
			base: "/practice-lab/",
			knownCertifications: ["ccdv-f"],
		};

		expect(new Set(ccdvFQuestions.map(({ id }) => id)).size).toBe(ccdvFQuestions.length);
		expect(ccdvFQuestions.every(({ domain }) => Object.hasOwn(ccdvFConfig.domains, domain))).toBe(
			true,
		);
		expect(() => parseQuizBootstrap(JSON.stringify(payload))).not.toThrow();
	});

	it("initializes progress from the bootstrap and installs its lifecycle close hook", async () => {
		const progressState: BrowserProgressState = {
			generationToken: "generation-one",
			stats: {},
			questionProgress: [],
			history: [],
			migrationPending: false,
			migrationWarnings: [],
			backupReady: false,
			legacyWriteDetected: false,
			reconciliationBackupReady: false,
		};
		const initialize = vi.fn().mockResolvedValue(progressState);
		const close = vi.fn();
		const progressService = { initialize, close } as unknown as BrowserProgressService;
		const serviceOptions: BrowserProgressOptions[] = [];
		const createProgressService = (options: BrowserProgressOptions) => {
			serviceOptions.push(options);
			return progressService;
		};
		const addEventListener = vi.fn();
		const browserWindow = { addEventListener } as unknown as Window;
		const documentRef = {
			getElementById: () => ({ dataset: { bootstrap: JSON.stringify(BOOTSTRAP) } }),
		} as unknown as Pick<Document, "getElementById">;

		const client = await initializeQuizClient({
			document: documentRef,
			window: browserWindow,
			createProgressService,
		});

		expect(client).not.toBeNull();
		expect(serviceOptions).toEqual([
			{
				certificationId: CONFIG.slug,
				config: CONFIG,
				questions: QUESTIONS,
				knownCertificationIds: BOOTSTRAP.knownCertifications,
			},
		]);
		expect(initialize).toHaveBeenCalledOnce();
		expect(client?.progressState).toBe(progressState);
		expect(client?.byId["question-one"]).toEqual(QUESTIONS[0]);
		expect(client?.domains.D1).toEqual({ name: "Domain One", weight: 100 });
		expect(browserWindow.practiceLabProgressService).toBe(progressService);
		expect(addEventListener).toHaveBeenCalledWith("pagehide", expect.any(Function), { once: true });
	});

	it("returns without initializing when the bootstrap element is absent", async () => {
		const createProgressService = vi.fn();
		const client = await initializeQuizClient({
			document: { getElementById: () => null },
			window: {} as Window,
			createProgressService,
		});

		expect(client).toBeNull();
		expect(createProgressService).not.toHaveBeenCalled();
	});
});
