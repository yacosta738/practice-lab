const MAX_SEO_TITLE_LENGTH = 55;
const MAX_META_DESCRIPTION_LENGTH = 160;

export function limitSeoTitle(title: string): string {
	const normalizedTitle = title.replace(/\s+/g, " ").trim();
	if (normalizedTitle.length <= MAX_SEO_TITLE_LENGTH) return normalizedTitle;

	const suffixStart = normalizedTitle.lastIndexOf(" | ");
	const suffix = suffixStart >= 0 ? normalizedTitle.slice(suffixStart) : "";
	const preservedSuffix = suffix.length < MAX_SEO_TITLE_LENGTH ? suffix : "";
	const titleText = preservedSuffix ? normalizedTitle.slice(0, suffixStart) : normalizedTitle;
	const prefixLength = MAX_SEO_TITLE_LENGTH - preservedSuffix.length - 1;
	const prefix = titleText.slice(0, prefixLength).trimEnd();
	const wordBoundary = prefix.lastIndexOf(" ");
	const shortenedPrefix =
		wordBoundary >= Math.floor(prefixLength * 0.6) ? prefix.slice(0, wordBoundary) : prefix;

	return `${shortenedPrefix.trimEnd()}…${preservedSuffix}`;
}

export function limitMetaDescription(description: string): string {
	const normalizedDescription = description.replace(/\s+/g, " ").trim();
	if (normalizedDescription.length <= MAX_META_DESCRIPTION_LENGTH) return normalizedDescription;

	const prefix = normalizedDescription.slice(0, MAX_META_DESCRIPTION_LENGTH - 1).trimEnd();
	const wordBoundary = prefix.lastIndexOf(" ");
	const shortenedPrefix = wordBoundary > 0 ? prefix.slice(0, wordBoundary) : prefix;

	return `${shortenedPrefix}…`;
}
