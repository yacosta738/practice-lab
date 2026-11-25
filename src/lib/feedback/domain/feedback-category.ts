import type { FeedbackTargetType } from "./feedback-target";

export type FeedbackCategory =
	| "incorrect-answer"
	| "ambiguous-question"
	| "outdated-content"
	| "incorrect-explanation"
	| "typo"
	| "improvement"
	| "technical-issue"
	| "other";

export interface FeedbackCategoryMeta {
	readonly id: FeedbackCategory;
	readonly label: string;
	readonly description: string;
	readonly githubLabel: string;
	readonly targets: readonly FeedbackTargetType[];
}

export const FEEDBACK_CATEGORIES: readonly FeedbackCategoryMeta[] = [
	{
		id: "incorrect-answer",
		label: "Incorrect answer key",
		description: "The marked correct option does not match official documentation.",
		githubLabel: "incorrect-answer",
		targets: ["question"],
	},
	{
		id: "incorrect-explanation",
		label: "Incorrect or unclear explanation",
		description: "The rationale or source reference needs correction or clarification.",
		githubLabel: "incorrect-explanation",
		targets: ["question"],
	},
	{
		id: "ambiguous-question",
		label: "Ambiguous question or options",
		description: "The wording leaves multiple interpretations or overlapping choices.",
		githubLabel: "ambiguous-question",
		targets: ["question"],
	},
	{
		id: "outdated-content",
		label: "Outdated content",
		description: "Product behavior, APIs, or exam guidance has changed.",
		githubLabel: "outdated-content",
		targets: ["question", "lesson"],
	},
	{
		id: "typo",
		label: "Typo or formatting issue",
		description: "Spelling, grammar, broken link, or layout mistake.",
		githubLabel: "typo",
		targets: ["question", "lesson", "application"],
	},
	{
		id: "improvement",
		label: "Content or UX improvement",
		description: "Suggest clearer examples, new study material, or a feature improvement.",
		githubLabel: "enhancement",
		targets: ["question", "lesson", "application"],
	},
	{
		id: "technical-issue",
		label: "Technical bug",
		description: "Something in the quiz engine, timer, navigation, or layout broke.",
		githubLabel: "bug",
		targets: ["question", "lesson", "application"],
	},
	{
		id: "other",
		label: "Other feedback",
		description: "Anything that does not fit the categories above.",
		githubLabel: "other",
		targets: ["question", "lesson", "application"],
	},
] as const;

const CATEGORY_MAP = new Map<FeedbackCategory, FeedbackCategoryMeta>(
	FEEDBACK_CATEGORIES.map((meta) => [meta.id, meta]),
);

export function isFeedbackCategory(value: string): value is FeedbackCategory {
	return CATEGORY_MAP.has(value as FeedbackCategory);
}

export function getFeedbackCategoryMeta(category: FeedbackCategory): FeedbackCategoryMeta {
	const meta = CATEGORY_MAP.get(category);
	if (!meta) {
		throw new Error(`Unknown feedback category: ${category}`);
	}
	return meta;
}

export function getCategoriesForTarget(
	targetType: FeedbackTargetType,
): readonly FeedbackCategoryMeta[] {
	return FEEDBACK_CATEGORIES.filter((meta) => meta.targets.includes(targetType));
}
