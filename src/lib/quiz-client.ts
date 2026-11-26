import {
	type BrowserProgressService,
	type BrowserProgressState,
	createBrowserProgressService,
} from "./progress/browser-service";
import type { CertificationConfig, DomainInfo, Question } from "./quiz-types";

export interface QuizBootstrap {
	cfg: CertificationConfig;
	qs: Question[];
	optionKeys: readonly string[];
	studyHref?: string;
	base: string;
	knownCertifications: string[];
}

export interface InitializedQuizClient {
	bootstrap: QuizBootstrap;
	byId: Record<string, Question>;
	domains: Record<string, Pick<DomainInfo, "name" | "weight">>;
	progressService: BrowserProgressService;
	progressState: BrowserProgressState;
}

export interface QuizClientDependencies {
	document?: Pick<Document, "getElementById">;
	window?: Window;
	createProgressService?: typeof createBrowserProgressService;
}

export function parseQuizBootstrap(serialized: string | undefined): QuizBootstrap {
	if (!serialized) throw new Error("Quiz bootstrap data is missing.");

	let value: unknown;
	try {
		value = JSON.parse(serialized);
	} catch {
		throw new Error("Quiz bootstrap data is not valid JSON.");
	}

	if (!isQuizBootstrap(value)) {
		throw new Error("Quiz bootstrap data has an invalid shape.");
	}

	return value;
}

export async function initializeQuizClient(
	dependencies: QuizClientDependencies = {},
): Promise<InitializedQuizClient | null> {
	const documentRef = dependencies.document ?? document;
	const windowRef = dependencies.window ?? window;
	const bootstrapElement = documentRef.getElementById("quiz-bootstrap");
	if (!bootstrapElement) return null;

	const bootstrap = parseQuizBootstrap(bootstrapElement.dataset.bootstrap);
	const createProgressService = dependencies.createProgressService ?? createBrowserProgressService;
	const progressService = createProgressService({
		certificationId: bootstrap.cfg.slug,
		config: bootstrap.cfg,
		questions: bootstrap.qs,
		knownCertificationIds: bootstrap.knownCertifications,
	});
	windowRef.practiceLabProgressService = progressService;
	windowRef.addEventListener("pagehide", () => progressService.close(), { once: true });
	const progressState = await progressService.initialize();

	const byId = Object.fromEntries(bootstrap.qs.map((question) => [question.id, question]));
	const domains = Object.fromEntries(
		Object.entries(bootstrap.cfg.domains).map(([id, domain]) => [
			id,
			{ name: domain.name, weight: domain.weight },
		]),
	);

	return { bootstrap, byId, domains, progressService, progressState };
}

function isQuizBootstrap(value: unknown): value is QuizBootstrap {
	if (!isRecord(value) || !isCertificationConfig(value.cfg)) return false;
	const config = value.cfg;
	if (!Array.isArray(value.qs) || !value.qs.every(isQuestion)) return false;
	const questions = value.qs;
	if (!Array.isArray(value.optionKeys) || value.optionKeys.length === 0) return false;
	if (
		!value.optionKeys.every(isNonEmptyString) ||
		new Set(value.optionKeys).size !== value.optionKeys.length
	) {
		return false;
	}
	if (value.studyHref !== undefined && !isNonEmptyString(value.studyHref)) return false;
	if (!isNonEmptyString(value.base)) return false;
	if (
		!Array.isArray(value.knownCertifications) ||
		!value.knownCertifications.every(isNonEmptyString) ||
		!value.knownCertifications.includes(config.slug) ||
		new Set(value.knownCertifications).size !== value.knownCertifications.length
	) {
		return false;
	}
	if (new Set(questions.map((question) => question.id)).size !== questions.length) return false;
	return questions.every((question) => Object.hasOwn(config.domains, question.domain));
}

function isCertificationConfig(value: unknown): value is CertificationConfig {
	if (
		!isRecord(value) ||
		!isNonEmptyString(value.slug) ||
		!isNonEmptyString(value.title) ||
		!isNonEmptyString(value.subtitle) ||
		!isNonEmptyString(value.description) ||
		!isRecord(value.theme) ||
		!isNonEmptyString(value.theme.brand) ||
		!isNonEmptyString(value.theme.brand2) ||
		!isNonEmptyString(value.theme.brandSoft) ||
		typeof value.totalQuestions !== "number" ||
		!Number.isSafeInteger(value.totalQuestions) ||
		value.totalQuestions < 1
	) {
		return false;
	}
	const domains = value.domains;
	const examBlueprint = value.examBlueprint;
	if (!isRecord(domains) || Object.keys(domains).length === 0 || !isRecord(examBlueprint))
		return false;

	if (
		!Object.entries(domains).every(
			([id, domain]) =>
				isRecord(domain) &&
				domain.id === id &&
				isNonEmptyString(domain.name) &&
				typeof domain.weight === "number" &&
				Number.isFinite(domain.weight),
		)
	) {
		return false;
	}
	if (
		!Object.entries(examBlueprint).every(
			([id, count]) =>
				Object.hasOwn(domains, id) &&
				typeof count === "number" &&
				Number.isSafeInteger(count) &&
				count >= 0,
		)
	) {
		return false;
	}
	if (value.passingScore !== undefined && typeof value.passingScore !== "number") return false;
	if (value.examMinutes !== undefined && typeof value.examMinutes !== "number") return false;
	if (value.examGuideNote !== undefined && typeof value.examGuideNote !== "string") return false;
	if (
		value.blueprintSource !== undefined &&
		!["official", "derived"].includes(String(value.blueprintSource))
	) {
		return false;
	}
	return true;
}

function isQuestion(value: unknown): value is Question {
	if (
		!isRecord(value) ||
		!isNonEmptyString(value.id) ||
		!isNonEmptyString(value.domain) ||
		!isNonEmptyString(value.question) ||
		!isRecord(value.source) ||
		!isNonEmptyString(value.source.label) ||
		typeof value.source.url !== "string" ||
		typeof value.explanation !== "string" ||
		!Array.isArray(value.options) ||
		value.options.length === 0 ||
		!value.options.every((option) => typeof option === "string") ||
		!Array.isArray(value.correctAnswers) ||
		value.correctAnswers.length === 0
	) {
		return false;
	}
	const options = value.options;
	const correctAnswers = value.correctAnswers;

	return correctAnswers.every(
		(answer) =>
			typeof answer === "number" &&
			Number.isSafeInteger(answer) &&
			answer >= 0 &&
			answer < options.length,
	);
}

function isRecord(value: unknown): value is Record<string, unknown> {
	return value !== null && typeof value === "object" && !Array.isArray(value);
}

function isNonEmptyString(value: unknown): value is string {
	return typeof value === "string" && value.trim().length > 0;
}
