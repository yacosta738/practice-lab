export interface SearchItem {
	title: string;
	href: string;
	category: string;
	badge?: string;
	text?: string;
}

export interface RankedSearchItem extends SearchItem {
	excerpt: string;
	score: number;
}

/** Convert study Markdown into readable text without indexing its formatting or link targets. */
export function normalizeSearchText(markdown: string): string {
	return markdown
		.replace(/```[^\n]*\n?/g, " ")
		.replace(/!\[([^\]]*)\]\([^)]+\)/g, "$1")
		.replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
		.replace(/^\s{0,3}#{1,6}\s+/gm, "")
		.replace(/^\s*>\s?/gm, "")
		.replace(/`([^`]+)`/g, "$1")
		.replace(/[*_~]/g, "")
		.replace(/<[^>]*>/g, " ")
		.replace(/\|/g, " ")
		.replace(/&amp;/g, "&")
		.replace(/&lt;/g, "<")
		.replace(/&gt;/g, ">")
		.replace(/&quot;/g, '"')
		.replace(/&#39;/g, "'")
		.replace(/\s+/g, " ")
		.trim();
}

function makeExcerpt(text: string, query: string): string {
	const normalizedText = text.trim();
	if (normalizedText.length <= 160) return normalizedText;

	const queryTerms = query.toLowerCase().split(/\s+/).filter(Boolean);
	const lowerText = normalizedText.toLowerCase();
	const matchAt = queryTerms
		.map((term) => lowerText.indexOf(term))
		.filter((index) => index >= 0)
		.sort((a, b) => a - b)[0];
	const start = Math.max(0, (matchAt ?? 0) - 48);
	const end = Math.min(normalizedText.length, start + 160);

	return `${start > 0 ? "…" : ""}${normalizedText.slice(start, end).trim()}${end < normalizedText.length ? "…" : ""}`;
}

/** Rank title and context matches above study-body matches and return a readable excerpt. */
export function rankSearchItems(query: string, items: readonly SearchItem[]): RankedSearchItem[] {
	const normalizedQuery = query.trim().toLowerCase();
	if (!normalizedQuery) return [];

	const terms = normalizedQuery.split(/\s+/).filter(Boolean);
	return items
		.map((item) => {
			const title = item.title.toLowerCase();
			const context = `${item.category} ${item.badge ?? ""}`.toLowerCase();
			const body = item.text?.toLowerCase() ?? "";
			const searchableText = `${title} ${context} ${body}`;
			if (!terms.every((term) => searchableText.includes(term))) return null;

			const titleMatch = terms.every((term) => title.includes(term));
			const contextMatch = terms.every((term) => context.includes(term));
			const bodyMatch = terms.every((term) => body.includes(term));
			const score = titleMatch
				? title === normalizedQuery
					? 1000
					: title.startsWith(normalizedQuery)
						? 800
						: 600
				: contextMatch
					? 300
					: bodyMatch
						? 100
						: 50;

			return {
				...item,
				excerpt: item.text ? makeExcerpt(item.text, normalizedQuery) : "",
				score,
			};
		})
		.filter((item): item is RankedSearchItem => item !== null)
		.sort((a, b) => b.score - a.score || a.title.localeCompare(b.title));
}
